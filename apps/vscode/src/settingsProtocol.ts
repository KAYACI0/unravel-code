// Message protocol for the settings webview. Kept separate from protocol.ts
// (the explain panel's protocol) because the two panels share no state and
// mixing their message unions would make both harder to read.

export type SettingsAuthChoice = "claudeCode" | "codex" | "vscodeLm" | "apiKey";

const SETTINGS_AUTH_CHOICES: readonly SettingsAuthChoice[] = [
  "claudeCode",
  "codex",
  "vscodeLm",
  "apiKey",
];

export interface CliStatus {
  found: boolean;
  version?: string;
}

export interface LmModelInfo {
  vendor: string;
  family: string;
}

export interface SettingsState {
  auth: SettingsAuthChoice;
  lmPreferred: string;
  language: "auto" | "tr" | "en";
  detail: "brief" | "detailed";
  model: string;
  contextLines: number;
  claudeCodePath: string;
  codexPath: string;
  codexModel: string;
  hasApiKey: boolean;
  claudeCode: CliStatus;
  codex: CliStatus;
  lmModels: LmModelInfo[];
  detecting: boolean;
}

export type SettingsTextField =
  | "claudeCodePath"
  | "codexPath"
  | "codexModel"
  | "lmPreferred"
  | "model";

const SETTINGS_TEXT_FIELDS: readonly SettingsTextField[] = [
  "claudeCodePath",
  "codexPath",
  "codexModel",
  "lmPreferred",
  "model",
];

export type SettingsToWebviewMessage = { type: "state"; state: SettingsState };

export type WebviewToSettingsMessage =
  | { type: "ready" }
  | { type: "selectAuth"; auth: SettingsAuthChoice }
  | { type: "selectLmVendor"; vendor: string }
  | { type: "setTextField"; field: SettingsTextField; value: string }
  | { type: "setLanguage"; value: "auto" | "tr" | "en" }
  | { type: "setDetail"; value: "brief" | "detailed" }
  | { type: "setContextLines"; value: number }
  | { type: "setApiKey" }
  | { type: "clearApiKey" }
  | { type: "refreshDetection" }
  | { type: "installClaudeCode" }
  | { type: "installCodex" }
  | { type: "searchCopilotExtension" }
  | { type: "searchChatGptExtension" };

const LANGUAGES = ["auto", "tr", "en"] as const;
const DETAILS = ["brief", "detailed"] as const;

/**
 * Validates an untrusted message received from the webview before the extension host
 * acts on it. The webview content is sandboxed but its messages are still attacker data.
 */
export function parseSettingsMessage(raw: unknown): WebviewToSettingsMessage | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const type = (raw as { type?: unknown }).type;

  switch (type) {
    case "ready":
    case "setApiKey":
    case "clearApiKey":
    case "refreshDetection":
    case "installClaudeCode":
    case "installCodex":
    case "searchCopilotExtension":
    case "searchChatGptExtension":
      return { type };
    case "selectAuth": {
      const auth = (raw as { auth?: unknown }).auth;
      return typeof auth === "string" && SETTINGS_AUTH_CHOICES.includes(auth as SettingsAuthChoice)
        ? { type: "selectAuth", auth: auth as SettingsAuthChoice }
        : undefined;
    }
    case "selectLmVendor": {
      const vendor = (raw as { vendor?: unknown }).vendor;
      return typeof vendor === "string" ? { type: "selectLmVendor", vendor } : undefined;
    }
    case "setTextField": {
      const field = (raw as { field?: unknown }).field;
      const value = (raw as { value?: unknown }).value;
      return typeof field === "string" &&
        SETTINGS_TEXT_FIELDS.includes(field as SettingsTextField) &&
        typeof value === "string"
        ? { type: "setTextField", field: field as SettingsTextField, value }
        : undefined;
    }
    case "setLanguage": {
      const value = (raw as { value?: unknown }).value;
      return typeof value === "string" && LANGUAGES.includes(value as (typeof LANGUAGES)[number])
        ? { type: "setLanguage", value: value as "auto" | "tr" | "en" }
        : undefined;
    }
    case "setDetail": {
      const value = (raw as { value?: unknown }).value;
      return typeof value === "string" && DETAILS.includes(value as (typeof DETAILS)[number])
        ? { type: "setDetail", value: value as "brief" | "detailed" }
        : undefined;
    }
    case "setContextLines": {
      const value = (raw as { value?: unknown }).value;
      return typeof value === "number" && Number.isFinite(value) && value >= 0
        ? { type: "setContextLines", value: Math.floor(value) }
        : undefined;
    }
    default:
      return undefined;
  }
}
