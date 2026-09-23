export { DEFAULT_MODEL, SONNET } from "./models.js";
export { detectMode } from "./mode.js";
export { redactSecrets } from "./redact.js";
export type { RedactResult } from "./redact.js";
export { explain } from "./explain.js";
export type {
  AuthMode,
  Detail,
  ExplainOptions,
  ExplainRequest,
  Lang,
  Mode,
} from "./types.js";
export {
  AbortedError,
  AuthError,
  ClaudeCliAuthError,
  ClaudeCliError,
  ClaudeCliNotFoundError,
  CodexCliAuthError,
  CodexCliError,
  CodexCliNotFoundError,
  LanguageModelUnavailableError,
  MissingApiKeyError,
  NetworkError,
  RateLimitError,
} from "./errors.js";
export type { ExplainError } from "./errors.js";
export { resolveClaudeCommand } from "./provider/claude-cli-resolve.js";
export { resolveCodexCommand } from "./provider/codex-cli-resolve.js";
export type { Provider, StreamCompletionRequest } from "./provider/types.js";
