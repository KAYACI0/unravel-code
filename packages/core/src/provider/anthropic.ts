import Anthropic, {
  APIConnectionError,
  APIError,
  APIUserAbortError,
  AuthenticationError,
  RateLimitError as AnthropicRateLimitError,
} from "@anthropic-ai/sdk";
import {
  AbortedError,
  AuthError,
  MissingApiKeyError,
  NetworkError,
  RateLimitError,
} from "../errors.js";
import type { Provider, StreamCompletionRequest } from "./types.js";

const MAX_TOKENS = 4096;

function translateError(err: unknown): Error {
  if (err instanceof APIUserAbortError) return new AbortedError();
  if (err instanceof AuthenticationError) return new AuthError();
  if (err instanceof AnthropicRateLimitError) return new RateLimitError();
  if (err instanceof APIConnectionError) return new NetworkError();
  if (err instanceof APIError) return new NetworkError();
  if (err instanceof Error && err.name === "AbortError") return new AbortedError();
  return new NetworkError();
}

export function createAnthropicProvider(): Provider {
  return {
    async *stream(req: StreamCompletionRequest): AsyncGenerator<string> {
      if (!req.apiKey) throw new MissingApiKeyError();

      const client = new Anthropic({ apiKey: req.apiKey });

      try {
        const messageStream = client.messages.stream(
          {
            model: req.model,
            max_tokens: MAX_TOKENS,
            system: req.system,
            messages: [{ role: "user", content: req.userMessage }],
          },
          { signal: req.signal },
        );

        for await (const event of messageStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            yield event.delta.text;
          }
        }
      } catch (err) {
        throw translateError(err);
      }
    },
  };
}
