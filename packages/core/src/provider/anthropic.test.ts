import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AbortedError,
  AuthError,
  MissingApiKeyError,
  NetworkError,
  RateLimitError,
} from "../errors.js";

const streamMock = vi.fn();

vi.mock("@anthropic-ai/sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@anthropic-ai/sdk")>();

  class MockAnthropic {
    messages = { stream: streamMock };
  }

  return { ...actual, default: MockAnthropic };
});

const { createAnthropicProvider } = await import("./anthropic.js");
const sdk = await import("@anthropic-ai/sdk");

async function* asyncEvents(events: unknown[]): AsyncGenerator<unknown> {
  for (const event of events) yield event;
}

async function collect(iterable: AsyncIterable<string>): Promise<string[]> {
  const out: string[] = [];
  for await (const chunk of iterable) out.push(chunk);
  return out;
}

describe("createAnthropicProvider", () => {
  beforeEach(() => {
    streamMock.mockReset();
  });

  it("throws MissingApiKeyError without calling the SDK when apiKey is empty", async () => {
    const provider = createAnthropicProvider();
    await expect(
      collect(
        provider.stream({ apiKey: "", model: "claude-haiku-4-5", system: "s", userMessage: "u" }),
      ),
    ).rejects.toBeInstanceOf(MissingApiKeyError);
    expect(streamMock).not.toHaveBeenCalled();
  });

  it("streams text deltas from content_block_delta events", async () => {
    streamMock.mockReturnValue(
      asyncEvents([
        { type: "message_start" },
        { type: "content_block_start" },
        { type: "content_block_delta", delta: { type: "text_delta", text: "hello" } },
        { type: "content_block_delta", delta: { type: "text_delta", text: " world" } },
        { type: "content_block_delta", delta: { type: "citations_delta" } },
        { type: "message_stop" },
      ]),
    );

    const provider = createAnthropicProvider();
    const chunks = await collect(
      provider.stream({ apiKey: "key", model: "claude-haiku-4-5", system: "s", userMessage: "u" }),
    );

    expect(chunks).toEqual(["hello", " world"]);
  });

  it("translates AuthenticationError to AuthError", async () => {
    streamMock.mockImplementation(() => {
      throw new sdk.AuthenticationError(
        401,
        { error: { message: "bad key" } },
        "bad key",
        new Headers(),
      );
    });

    const provider = createAnthropicProvider();
    await expect(
      collect(
        provider.stream({
          apiKey: "key",
          model: "claude-haiku-4-5",
          system: "s",
          userMessage: "u",
        }),
      ),
    ).rejects.toBeInstanceOf(AuthError);
  });

  it("translates RateLimitError to RateLimitError", async () => {
    streamMock.mockImplementation(() => {
      throw new sdk.RateLimitError(
        429,
        { error: { message: "slow down" } },
        "slow down",
        new Headers(),
      );
    });

    const provider = createAnthropicProvider();
    await expect(
      collect(
        provider.stream({
          apiKey: "key",
          model: "claude-haiku-4-5",
          system: "s",
          userMessage: "u",
        }),
      ),
    ).rejects.toBeInstanceOf(RateLimitError);
  });

  it("translates APIConnectionError to NetworkError", async () => {
    streamMock.mockImplementation(() => {
      throw new sdk.APIConnectionError({ message: "offline" });
    });

    const provider = createAnthropicProvider();
    await expect(
      collect(
        provider.stream({
          apiKey: "key",
          model: "claude-haiku-4-5",
          system: "s",
          userMessage: "u",
        }),
      ),
    ).rejects.toBeInstanceOf(NetworkError);
  });

  it("translates APIUserAbortError to AbortedError", async () => {
    streamMock.mockImplementation(() => {
      throw new sdk.APIUserAbortError();
    });

    const provider = createAnthropicProvider();
    await expect(
      collect(
        provider.stream({
          apiKey: "key",
          model: "claude-haiku-4-5",
          system: "s",
          userMessage: "u",
        }),
      ),
    ).rejects.toBeInstanceOf(AbortedError);
  });

  it("translates an error raised mid-stream", async () => {
    async function* faultyEvents(): AsyncGenerator<unknown> {
      yield { type: "content_block_delta", delta: { type: "text_delta", text: "partial" } };
      throw new sdk.RateLimitError(
        429,
        { error: { message: "slow down" } },
        "slow down",
        new Headers(),
      );
    }
    streamMock.mockReturnValue(faultyEvents());

    const provider = createAnthropicProvider();
    const iterable = provider.stream({
      apiKey: "key",
      model: "claude-haiku-4-5",
      system: "s",
      userMessage: "u",
    });

    await expect(collect(iterable)).rejects.toBeInstanceOf(RateLimitError);
  });

  it("never includes the apiKey in a thrown error's message", async () => {
    streamMock.mockImplementation(() => {
      throw new sdk.AuthenticationError(
        401,
        { error: { message: "key sk-ant-super-secret-value rejected" } },
        "key sk-ant-super-secret-value rejected",
        new Headers(),
      );
    });

    const provider = createAnthropicProvider();
    try {
      await collect(
        provider.stream({
          apiKey: "sk-ant-super-secret-value",
          model: "claude-haiku-4-5",
          system: "s",
          userMessage: "u",
        }),
      );
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(AuthError);
      expect((err as Error).message).not.toContain("sk-ant-super-secret-value");
    }
  });
});
