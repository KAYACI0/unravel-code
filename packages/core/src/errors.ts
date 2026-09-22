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

export type ExplainError =
  | MissingApiKeyError
  | AuthError
  | RateLimitError
  | NetworkError
  | AbortedError
  | ClaudeCliNotFoundError
  | ClaudeCliAuthError
  | ClaudeCliError;
