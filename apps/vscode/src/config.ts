import type { AuthMode, Detail } from "@unravel-code/core";

export interface RawUnravelConfig {
  language: "auto" | "tr" | "en";
  detail: Detail;
  model: string;
  contextLines: number;
  auth: AuthMode;
}

export function resolveLanguage(
  config: RawUnravelConfig["language"],
  envLanguage: string,
): "tr" | "en" {
  if (config !== "auto") return config;
  return envLanguage.toLowerCase().startsWith("tr") ? "tr" : "en";
}

/**
 * Decides whether this run needs an API key at all. Claude Code supplies its own
 * credential, and "auto" only needs a key when Claude Code is not the choice.
 */
export function requiresApiKey(auth: AuthMode, hasStoredKey: boolean): boolean {
  if (auth === "claudeCode" || auth === "codex" || auth === "vscodeLm") return false;
  if (auth === "apiKey") return true;
  return hasStoredKey;
}

/** The auth mode actually used, once the stored key is known. */
export function resolveAuthMode(
  auth: AuthMode,
  hasStoredKey: boolean,
): "claudeCode" | "codex" | "vscodeLm" | "apiKey" {
  if (auth !== "auto") return auth;
  return hasStoredKey ? "apiKey" : "claudeCode";
}
