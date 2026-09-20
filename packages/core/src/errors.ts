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

export type ExplainError =
  | MissingApiKeyError
  | AuthError
  | RateLimitError
  | NetworkError
  | AbortedError;
