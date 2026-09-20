export { DEFAULT_MODEL, SONNET } from "./models.js";
export { detectMode } from "./mode.js";
export { redactSecrets } from "./redact.js";
export type { RedactResult } from "./redact.js";
export { explain } from "./explain.js";
export type {
  Detail,
  ExplainOptions,
  ExplainRequest,
  Lang,
  Mode,
} from "./types.js";
export {
  AbortedError,
  AuthError,
  MissingApiKeyError,
  NetworkError,
  RateLimitError,
} from "./errors.js";
export type { ExplainError } from "./errors.js";
