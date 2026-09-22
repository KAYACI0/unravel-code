export type Mode = "auto" | "code" | "regex" | "legacy";
export type Lang = "auto" | "tr" | "en";
export type Detail = "brief" | "detailed";
/**
 * Where the credential comes from. "claudeCode" drives a locally installed
 * Claude Code, so the user's subscription pays and no key is stored.
 * "auto" prefers Claude Code and falls back to an API key when one is set.
 */
export type AuthMode = "auto" | "claudeCode" | "apiKey";

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
  /** Omit when using Claude Code auth. */
  apiKey?: string | undefined;
  /** Defaults to "apiKey" so existing callers keep their behaviour. */
  auth?: AuthMode | undefined;
  /** Explicit path to the Claude Code executable; resolved automatically when unset. */
  claudeCodePath?: string | undefined;
}
