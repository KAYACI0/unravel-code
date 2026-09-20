import { AuthError, MissingApiKeyError, NetworkError, RateLimitError } from "@unravel-code/core";
import type { ErrorKind } from "./protocol.js";

export interface ClassifiedError {
  kind: ErrorKind;
  message: string;
}

export function classifyError(err: unknown): ClassifiedError {
  if (err instanceof MissingApiKeyError) return { kind: "missing-key", message: err.message };
  if (err instanceof AuthError) return { kind: "auth", message: err.message };
  if (err instanceof RateLimitError) return { kind: "rate-limit", message: err.message };
  if (err instanceof NetworkError) return { kind: "network", message: err.message };
  if (err instanceof Error) return { kind: "unknown", message: err.message };
  return { kind: "unknown", message: "Unknown error." };
}
