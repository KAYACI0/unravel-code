export type PanelMode = "code" | "regex" | "legacy";
export type PanelDetail = "brief" | "detailed";
export type PanelLang = "tr" | "en";

export interface PanelState {
  codePreview: string;
  mode: PanelMode;
  lang: PanelLang;
  model: string;
  detail: PanelDetail;
  redactedCount: number;
}

export type ErrorKind =
  | "missing-key"
  | "auth"
  | "rate-limit"
  | "network"
  | "claude-code-missing"
  | "claude-code-auth"
  | "unknown";

export type ExtensionToWebviewMessage =
  | { type: "init"; state: PanelState }
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "aborted" }
  | { type: "error"; kind: ErrorKind; message: string };

export type WebviewToExtensionMessage =
  | { type: "ready" }
  | { type: "stop" }
  | { type: "copy" }
  | { type: "setMode"; mode: PanelMode }
  | { type: "setDetail"; detail: PanelDetail }
  | { type: "setApiKey" };

const PANEL_MODES: readonly PanelMode[] = ["code", "regex", "legacy"];
const PANEL_DETAILS: readonly PanelDetail[] = ["brief", "detailed"];

/**
 * Validates an untrusted message received from the webview before the extension host
 * acts on it. The webview content is sandboxed but its messages are still attacker data.
 */
export function parseWebviewMessage(raw: unknown): WebviewToExtensionMessage | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const type = (raw as { type?: unknown }).type;

  switch (type) {
    case "ready":
    case "stop":
    case "copy":
    case "setApiKey":
      return { type };
    case "setMode": {
      const mode = (raw as { mode?: unknown }).mode;
      return typeof mode === "string" && PANEL_MODES.includes(mode as PanelMode)
        ? { type: "setMode", mode: mode as PanelMode }
        : undefined;
    }
    case "setDetail": {
      const detail = (raw as { detail?: unknown }).detail;
      return typeof detail === "string" && PANEL_DETAILS.includes(detail as PanelDetail)
        ? { type: "setDetail", detail: detail as PanelDetail }
        : undefined;
    }
    default:
      return undefined;
  }
}
