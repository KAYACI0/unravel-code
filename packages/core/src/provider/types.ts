export interface StreamCompletionRequest {
  apiKey: string;
  model: string;
  system: string;
  userMessage: string;
  signal?: AbortSignal | undefined;
}

export interface Provider {
  stream(req: StreamCompletionRequest): AsyncIterable<string>;
}
