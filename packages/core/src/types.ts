export type Mode = "auto" | "code" | "regex" | "legacy";
export type Lang = "auto" | "tr" | "en";
export type Detail = "brief" | "detailed";

export interface ExplainRequest {
  code: string;
  mode?: Mode;
  lang?: Lang;
  detail?: Detail;
  languageId?: string;
  contextBefore?: string;
  contextAfter?: string;
  model?: string;
  signal?: AbortSignal;
}

export interface ExplainOptions {
  apiKey: string;
}
