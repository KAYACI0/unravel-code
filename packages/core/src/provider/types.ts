export interface StreamCompletionRequest {
  /** Required for `apiKey` auth; ignored when Claude Code supplies the credential. */
  apiKey?: string | undefined;
  model: string;
  system: string;
  userMessage: string;
  signal?: AbortSignal | undefined;
}

export interface Provider {
  stream(req: StreamCompletionRequest): AsyncIterable<string>;
}
