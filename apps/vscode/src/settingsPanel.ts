import type { AuthMode, Detail } from "@unravel-code/core";
import * as vscode from "vscode";
import { clearApiKeyCommand, getApiKey, setApiKeyCommand } from "./apiKey.js";
import { resolveAuthMode } from "./config.js";
import { runDetection } from "./settingsDetect.js";
import type {
  SettingsState,
  SettingsToWebviewMessage,
  WebviewToSettingsMessage,
} from "./settingsProtocol.js";
import { parseSettingsMessage } from "./settingsProtocol.js";
import { SETTINGS_STYLES } from "./webview/settingsStyles.js";

const CONFIG_SECTION = "unravelCode";
const CLAUDE_CODE_URL = "https://claude.com/claude-code";

function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < 32; i++) text += chars.charAt(Math.floor(Math.random() * chars.length));
  return text;
}

export class SettingsPanel {
  private static current: SettingsPanel | undefined;

  private readonly panel: vscode.WebviewPanel;
  private readonly secrets: vscode.SecretStorage;
  private disposed = false;

  static createOrShow(extensionUri: vscode.Uri, secrets: vscode.SecretStorage): SettingsPanel {
    if (SettingsPanel.current && !SettingsPanel.current.disposed) {
      SettingsPanel.current.panel.reveal(vscode.ViewColumn.Active);
      return SettingsPanel.current;
    }

    const panel = vscode.window.createWebviewPanel(
      "unravelCode.settings",
      "Unravel Settings",
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "dist", "webview")],
        retainContextWhenHidden: true,
      },
    );

    const instance = new SettingsPanel(panel, extensionUri, secrets);
    SettingsPanel.current = instance;
    return instance;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    secrets: vscode.SecretStorage,
  ) {
    this.panel = panel;
    this.secrets = secrets;
    this.panel.webview.html = this.buildHtml(extensionUri);

    this.panel.onDidDispose(() => {
      this.disposed = true;
      if (SettingsPanel.current === this) SettingsPanel.current = undefined;
    });

    this.panel.webview.onDidReceiveMessage((raw: unknown) => {
      const message = parseSettingsMessage(raw);
      if (message) void this.handleMessage(message);
    });
  }

  private config(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(CONFIG_SECTION);
  }

  private async update(key: string, value: unknown): Promise<void> {
    await this.config().update(key, value, vscode.ConfigurationTarget.Global);
  }

  private async baseState(
    detecting: boolean,
  ): Promise<Omit<SettingsState, "claudeCode" | "codex" | "lmModels">> {
    const config = this.config();
    const hasApiKey = Boolean(await getApiKey(this.secrets));
    const rawAuth = config.get<AuthMode>("auth", "claudeCode");

    return {
      auth: resolveAuthMode(rawAuth, hasApiKey),
      lmPreferred: config.get<string>("lmPreferred", ""),
      language: config.get<"auto" | "tr" | "en">("language", "auto"),
      detail: config.get<Detail>("detail", "detailed"),
      model: config.get<string>("model", "claude-haiku-4-5"),
      contextLines: config.get<number>("contextLines", 5),
      claudeCodePath: config.get<string>("claudeCodePath", ""),
      codexPath: config.get<string>("codexPath", ""),
      codexModel: config.get<string>("codexModel", ""),
      hasApiKey,
      detecting,
    };
  }

  /** Sends the current settings state immediately (fast, no process spawns),
   * so the panel never opens blank while detection is still running. */
  private async postCurrentState(detecting: boolean): Promise<void> {
    const base = await this.baseState(detecting);
    this.post({
      type: "state",
      state: { ...base, claudeCode: { found: false }, codex: { found: false }, lmModels: [] },
    });
  }

  private async postDetectedState(): Promise<void> {
    await this.postCurrentState(true);

    const config = this.config();
    const detection = await runDetection({
      claudeCodePath: config.get<string>("claudeCodePath", "").trim() || undefined,
      codexPath: config.get<string>("codexPath", "").trim() || undefined,
    });

    const base = await this.baseState(false);
    this.post({ type: "state", state: { ...base, ...detection } });
  }

  private async handleMessage(message: WebviewToSettingsMessage): Promise<void> {
    switch (message.type) {
      case "ready":
        await this.postDetectedState();
        break;
      case "selectAuth":
        await this.update("auth", message.auth);
        await this.postCurrentState(false);
        break;
      case "selectLmVendor":
        await this.update("auth", "vscodeLm");
        await this.update("lmPreferred", message.vendor);
        await this.postCurrentState(false);
        break;
      case "setTextField": {
        await this.update(message.field, message.value);
        if (message.field === "claudeCodePath" || message.field === "codexPath") {
          await this.postDetectedState();
        } else {
          await this.postCurrentState(false);
        }
        break;
      }
      case "setLanguage":
        await this.update("language", message.value);
        await this.postCurrentState(false);
        break;
      case "setDetail":
        await this.update("detail", message.value);
        await this.postCurrentState(false);
        break;
      case "setContextLines":
        await this.update("contextLines", message.value);
        await this.postCurrentState(false);
        break;
      case "setApiKey":
        await setApiKeyCommand(this.secrets);
        await this.postCurrentState(false);
        break;
      case "clearApiKey":
        await clearApiKeyCommand(this.secrets);
        await this.postCurrentState(false);
        break;
      case "refreshDetection":
        await this.postDetectedState();
        break;
      case "installClaudeCode":
        await vscode.env.openExternal(vscode.Uri.parse(CLAUDE_CODE_URL));
        break;
      case "installCodex": {
        const terminal = vscode.window.createTerminal("Unravel: install Codex");
        terminal.show();
        terminal.sendText("npm i -g @openai/codex", false);
        break;
      }
      case "searchCopilotExtension":
        await vscode.commands.executeCommand("workbench.extensions.search", "@id:GitHub.copilot");
        break;
      case "searchChatGptExtension":
        await vscode.commands.executeCommand("workbench.extensions.search", "@id:openai.chatgpt");
        break;
    }
  }

  private post(message: SettingsToWebviewMessage): void {
    if (!this.disposed) void this.panel.webview.postMessage(message);
  }

  private buildHtml(extensionUri: vscode.Uri): string {
    const webview = this.panel.webview;
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, "dist", "webview", "settings.js"),
    );
    const nonce = getNonce();
    const csp = [
      "default-src 'none'",
      `style-src 'nonce-${nonce}'`,
      `script-src 'nonce-${nonce}'`,
    ].join("; ");

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="${csp}" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style nonce="${nonce}">${SETTINGS_STYLES}</style>
<title>Unravel Settings</title>
</head>
<body>
<div id="root"></div>
<script nonce="${nonce}" src="${scriptUri.toString()}"></script>
</body>
</html>`;
  }
}
