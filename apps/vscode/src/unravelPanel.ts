import type { AuthMode, ExplainOptions, ExplainRequest } from "@unravel-code/core";
import { explain, redactSecrets } from "@unravel-code/core";
import * as vscode from "vscode";
import { getApiKey, setApiKeyCommand } from "./apiKey.js";
import { requiresApiKey } from "./config.js";
import { classifyError } from "./errorClassification.js";
import type {
  ExtensionToWebviewMessage,
  PanelDetail,
  PanelMode,
  PanelState,
  WebviewToExtensionMessage,
} from "./protocol.js";
import { parseWebviewMessage } from "./protocol.js";
import { getCodePreview } from "./selection.js";
import { createVsCodeLmProvider } from "./vscodeLmProvider.js";
import { PANEL_STYLES } from "./webview/styles.js";

export interface RunParams {
  code: string;
  languageId: string;
  contextBefore?: string;
  contextAfter?: string;
  lang: "tr" | "en";
  model: string;
  mode: PanelMode;
  detail: PanelDetail;
  auth: AuthMode;
  claudeCodePath?: string;
  codexPath?: string;
  codexModel?: string;
  lmPreferred?: string;
}

export class UnravelPanel {
  private static current: UnravelPanel | undefined;

  private readonly panel: vscode.WebviewPanel;
  private readonly secrets: vscode.SecretStorage;
  private disposed = false;
  private ready = false;
  private readonly readyWaiters: Array<() => void> = [];
  private controller: AbortController | undefined;
  private fullText = "";
  private params: RunParams | undefined;

  static createOrShow(extensionUri: vscode.Uri, secrets: vscode.SecretStorage): UnravelPanel {
    if (UnravelPanel.current && !UnravelPanel.current.disposed) {
      UnravelPanel.current.panel.reveal(vscode.ViewColumn.Beside);
      return UnravelPanel.current;
    }

    const panel = vscode.window.createWebviewPanel(
      "unravelCode.panel",
      "Unravel",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "dist", "webview")],
        retainContextWhenHidden: true,
      },
    );

    const instance = new UnravelPanel(panel, extensionUri, secrets);
    UnravelPanel.current = instance;
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
      this.controller?.abort();
      if (UnravelPanel.current === this) UnravelPanel.current = undefined;
    });

    this.panel.webview.onDidReceiveMessage((raw: unknown) => {
      const message = parseWebviewMessage(raw);
      if (message) void this.handleMessage(message);
    });
  }

  async run(params: RunParams): Promise<void> {
    await this.waitUntilReady();
    if (this.disposed) return;

    this.controller?.abort();
    const controller = new AbortController();
    this.controller = controller;
    this.params = params;
    this.fullText = "";

    const codeRedaction = redactSecrets(params.code);
    const beforeRedaction = params.contextBefore ? redactSecrets(params.contextBefore) : undefined;
    const afterRedaction = params.contextAfter ? redactSecrets(params.contextAfter) : undefined;
    const redactedCount =
      codeRedaction.redactedCount +
      (beforeRedaction?.redactedCount ?? 0) +
      (afterRedaction?.redactedCount ?? 0);

    const state: PanelState = {
      codePreview: getCodePreview(params.code),
      mode: params.mode,
      lang: params.lang,
      model: params.model,
      detail: params.detail,
      redactedCount,
    };
    this.post({ type: "init", state });

    const apiKey = await getApiKey(this.secrets);
    if (requiresApiKey(params.auth, Boolean(apiKey)) && !apiKey) {
      this.post({
        type: "error",
        kind: "missing-key",
        message: "No API key set. Use the button below to add one.",
      });
      return;
    }

    const request: ExplainRequest = {
      code: params.code,
      mode: params.mode,
      lang: params.lang,
      detail: params.detail,
      languageId: params.languageId,
      model: params.model,
      signal: controller.signal,
      ...(params.contextBefore !== undefined ? { contextBefore: params.contextBefore } : {}),
      ...(params.contextAfter !== undefined ? { contextAfter: params.contextAfter } : {}),
    };

    try {
      const explainOptions: ExplainOptions = {
        auth: params.auth,
        ...(apiKey ? { apiKey } : {}),
        ...(params.claudeCodePath ? { claudeCodePath: params.claudeCodePath } : {}),
        ...(params.codexPath ? { codexPath: params.codexPath } : {}),
        ...(params.codexModel ? { codexModel: params.codexModel } : {}),
        ...(params.auth === "vscodeLm"
          ? { provider: createVsCodeLmProvider({ preferred: params.lmPreferred ?? "" }) }
          : {}),
      };
      for await (const chunk of explain(request, explainOptions)) {
        if (controller.signal.aborted) break;
        this.fullText += chunk;
        this.post({ type: "chunk", text: chunk });
      }
      if (controller.signal.aborted) this.post({ type: "aborted" });
      else this.post({ type: "done" });
    } catch (err) {
      if (controller.signal.aborted) {
        this.post({ type: "aborted" });
      } else {
        const { kind, message } = classifyError(err);
        this.post({ type: "error", kind, message });
      }
    }
  }

  private async handleMessage(message: WebviewToExtensionMessage): Promise<void> {
    switch (message.type) {
      case "ready":
        this.ready = true;
        for (const resolve of this.readyWaiters.splice(0)) resolve();
        break;
      case "stop":
        this.controller?.abort();
        break;
      case "copy":
        await vscode.env.clipboard.writeText(this.fullText);
        break;
      case "setMode":
        if (this.params) await this.run({ ...this.params, mode: message.mode });
        break;
      case "setDetail":
        if (this.params) await this.run({ ...this.params, detail: message.detail });
        break;
      case "setApiKey":
        await setApiKeyCommand(this.secrets);
        if (this.params) await this.run(this.params);
        break;
    }
  }

  private waitUntilReady(): Promise<void> {
    if (this.ready) return Promise.resolve();
    return new Promise((resolve) => this.readyWaiters.push(resolve));
  }

  private post(message: ExtensionToWebviewMessage): void {
    if (!this.disposed) void this.panel.webview.postMessage(message);
  }

  private buildHtml(extensionUri: vscode.Uri): string {
    const webview = this.panel.webview;
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, "dist", "webview", "main.js"),
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
<style nonce="${nonce}">${PANEL_STYLES}</style>
<title>Unravel</title>
</head>
<body>
<div id="root"></div>
<script nonce="${nonce}" src="${scriptUri.toString()}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < 32; i++) text += chars.charAt(Math.floor(Math.random() * chars.length));
  return text;
}
