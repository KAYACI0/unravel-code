export class MissingApiKeyError extends Error {
  constructor() {
    super("No API key was provided.");
    this.name = "MissingApiKeyError";
  }
}

export class AuthError extends Error {
  constructor() {
    super("The API key was rejected. Check that it is valid and active.");
    this.name = "AuthError";
  }
}

export class RateLimitError extends Error {
  constructor() {
    super("Rate limit exceeded. Wait a moment and try again.");
    this.name = "RateLimitError";
  }
}

export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super("Could not reach the API. Check your network connection.");
    this.name = "NetworkError";
    if (cause !== undefined) this.cause = cause;
  }
}

export class AbortedError extends Error {
  constructor() {
    super("The request was cancelled.");
    this.name = "AbortedError";
  }
}

export class ClaudeCliNotFoundError extends Error {
  constructor() {
    super(
      "Claude Code was not found. Install it from https://claude.com/claude-code, " +
        "or switch Unravel to API key mode.",
    );
    this.name = "ClaudeCliNotFoundError";
  }
}

export class ClaudeCliAuthError extends Error {
  constructor() {
    super("Claude Code is not signed in. Run `claude` once and log in, then try again.");
    this.name = "ClaudeCliAuthError";
  }
}

export class ClaudeCliError extends Error {
  // `detail` is CLI stderr, which may name file paths but never carries the
  // user's selection or any credential — the prompt goes over stdin.
  constructor(detail?: string) {
    super(
      detail && detail.trim() !== ""
        ? `Claude Code failed: ${detail.trim()}`
        : "Claude Code failed.",
    );
    this.name = "ClaudeCliError";
  }
}

export class CodexCliNotFoundError extends Error {
  constructor() {
    super(
      "OpenAI Codex was not found. Install it (npm i -g @openai/codex), " +
        "or switch Unravel to another auth mode.",
    );
    this.name = "CodexCliNotFoundError";
  }
}

export class CodexCliAuthError extends Error {
  constructor() {
    super("Codex is not signed in. Run `codex login` and sign in with your ChatGPT account.");
    this.name = "CodexCliAuthError";
  }
}

export class CodexCliError extends Error {
  // `detail` is CLI stderr, which never carries the user's selection or any
  // credential -- the prompt goes over stdin.
  constructor(detail?: string) {
    super(detail && detail.trim() !== "" ? `Codex failed: ${detail.trim()}` : "Codex failed.");
    this.name = "CodexCliError";
  }
}

export class LanguageModelUnavailableError extends Error {
  constructor(detail?: string) {
    super(
      detail && detail.trim() !== ""
        ? `No usable editor language model: ${detail.trim()}`
        : "No language model is available in the editor. Sign in to a model provider, or switch Unravel to Claude Code.",
    );
    this.name = "LanguageModelUnavailableError";
  }
}

export type ExplainError =
  | MissingApiKeyError
  | AuthError
  | RateLimitError
  | NetworkError
  | AbortedError
  | ClaudeCliNotFoundError
  | ClaudeCliAuthError
  | ClaudeCliError
  | LanguageModelUnavailableError
  | CodexCliNotFoundError
  | CodexCliAuthError
  | CodexCliError;
