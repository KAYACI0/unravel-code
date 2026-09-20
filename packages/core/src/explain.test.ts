import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StreamCompletionRequest } from "./provider/types.js";

const streamMock = vi.fn<(req: StreamCompletionRequest) => AsyncIterable<string>>();

vi.mock("./provider/anthropic.js", () => ({
  createAnthropicProvider: () => ({ stream: streamMock }),
}));

const { explain } = await import("./explain.js");
const { DEFAULT_MODEL } = await import("./models.js");

async function* fakeChunks(chunks: string[]): AsyncIterable<string> {
  for (const chunk of chunks) yield chunk;
}

async function collect(iterable: AsyncIterable<string>): Promise<string[]> {
  const out: string[] = [];
  for await (const chunk of iterable) out.push(chunk);
  return out;
}

describe("explain", () => {
  beforeEach(() => {
    streamMock.mockReset();
    streamMock.mockReturnValue(fakeChunks(["hello", " world"]));
  });

  it("streams the chunks yielded by the provider", async () => {
    const chunks = await collect(explain({ code: "const x = 1;" }, { apiKey: "test-key" }));
    expect(chunks).toEqual(["hello", " world"]);
  });

  it("uses the default model when none is requested", async () => {
    await collect(explain({ code: "const x = 1;" }, { apiKey: "test-key" }));
    expect(streamMock).toHaveBeenCalledWith(expect.objectContaining({ model: DEFAULT_MODEL }));
  });

  it("forwards a custom model", async () => {
    await collect(
      explain({ code: "const x = 1;", model: "claude-sonnet-5" }, { apiKey: "test-key" }),
    );
    expect(streamMock).toHaveBeenCalledWith(expect.objectContaining({ model: "claude-sonnet-5" }));
  });

  it("defaults to English when lang is omitted or 'auto'", async () => {
    await collect(explain({ code: "const x = 1;" }, { apiKey: "test-key" }));
    const system = streamMock.mock.calls[0]?.[0]?.system ?? "";
    expect(system).toContain("Respond in English");
  });

  it("resolves 'auto' mode to regex for regex-shaped input", async () => {
    await collect(explain({ code: "^\\d{3}-\\d{2}-\\d{4}$" }, { apiKey: "test-key" }));
    const system = streamMock.mock.calls[0]?.[0]?.system ?? "";
    expect(system).toContain("Token breakdown");
  });

  it("resolves 'auto' mode to code for regular code", async () => {
    await collect(
      explain({ code: "function add(a, b) { return a + b; }" }, { apiKey: "test-key" }),
    );
    const system = streamMock.mock.calls[0]?.[0]?.system ?? "";
    expect(system).toContain("Step by step");
  });

  it("respects an explicit legacy mode even for regex-shaped input", async () => {
    await collect(explain({ code: "^\\d+$", mode: "legacy" }, { apiKey: "test-key" }));
    const system = streamMock.mock.calls[0]?.[0]?.system ?? "";
    expect(system).toContain("Likely intent");
  });

  it("redacts secrets before they reach the provider", async () => {
    await collect(explain({ code: 'const key = "AKIAIOSFODNN7EXAMPLE";' }, { apiKey: "test-key" }));
    const userMessage = streamMock.mock.calls[0]?.[0]?.userMessage ?? "";
    expect(userMessage).not.toContain("AKIAIOSFODNN7EXAMPLE");
    expect(userMessage).toContain("[REDACTED]");
  });

  it("passes the caller's apiKey and signal through", async () => {
    const controller = new AbortController();
    await collect(
      explain({ code: "const x = 1;", signal: controller.signal }, { apiKey: "secret-key" }),
    );
    expect(streamMock).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: "secret-key", signal: controller.signal }),
    );
  });
});
