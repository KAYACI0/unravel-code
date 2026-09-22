import type { Provider } from "./provider/types.js";

export type Mode = "auto" | "code" | "regex" | "legacy";
export type Lang = "auto" | "tr" | "en";
export type Detail = "brief" | "detailed";
/**
 * Where the credential comes from. "claudeCode" drives a locally installed
 * Claude Code, so the user's subscription pays and no key is stored.
 * "auto" prefers Claude Code and falls back to an API key when one is set.
 * "codex" does the same through OpenAI Codex and a ChatGPT subscription.
 * "vscodeLm" defers to the host editor and requires an injected provider,
 * because core must not import any editor API.
 */
export type AuthMode = "auto" | "claudeCode" | "codex" | "vscodeLm" | "apiKey";

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
  /**
   * Provider supplied by the host shell. Required for "vscodeLm", where the
   * credential belongs to the editor and core has no way to reach it.
   */
  provider?: Provider | undefined;
  /** Explicit path to the Codex executable; resolved automatically when unset. */
  codexPath?: string | undefined;
  /** Model for Codex; blank uses whatever Codex itself is configured with. */
  codexModel?: string | undefined;
}
