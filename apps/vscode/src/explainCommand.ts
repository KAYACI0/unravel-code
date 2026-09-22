import type { AuthMode, Detail, Mode } from "@unravel-code/core";
import { detectMode } from "@unravel-code/core";
import * as vscode from "vscode";
import { resolveLanguage } from "./config.js";
import type { PanelMode } from "./protocol.js";
import { buildSelectionContext, validateSelectionLength } from "./selection.js";
import { UnravelPanel } from "./unravelPanel.js";

const PRIVACY_NOTICE_SHOWN_KEY = "unravelCode.hasShownPrivacyNotice";
const PRIVACY_NOTICE_MESSAGE =
  "Unravel: Selected code is sent to the Anthropic API to generate an explanation.";

interface RunExplainOptions {
  forcedMode?: Mode;
}

export function createExplainCommand(
  context: vscode.ExtensionContext,
  options: RunExplainOptions = {},
): () => Promise<void> {
  return async (): Promise<void> => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      void vscode.window.showErrorMessage("Unravel: No active editor.");
      return;
    }

    const selection = editor.selection;
    const code = editor.document.getText(selection);
    const validationError = validateSelectionLength(code.length);
    if (validationError) {
      void vscode.window.showErrorMessage(`Unravel: ${validationError}`);
      return;
    }

    if (!context.globalState.get<boolean>(PRIVACY_NOTICE_SHOWN_KEY, false)) {
      void vscode.window.showInformationMessage(PRIVACY_NOTICE_MESSAGE);
      await context.globalState.update(PRIVACY_NOTICE_SHOWN_KEY, true);
    }

    const config = vscode.workspace.getConfiguration("unravelCode");
    const lang = resolveLanguage(
      config.get<"auto" | "tr" | "en">("language", "auto"),
      vscode.env.language,
    );
    const detail = config.get<Detail>("detail", "detailed");
    const model = config.get<string>("model", "claude-haiku-4-5");
    const contextLines = config.get<number>("contextLines", 5);
    const auth = config.get<AuthMode>("auth", "claudeCode");
    const claudeCodePath = config.get<string>("claudeCodePath", "").trim();

    const documentLines = editor.document.getText().split("\n");
    const { contextBefore, contextAfter } = buildSelectionContext({
      documentLines,
      selectionStartLine: selection.start.line,
      selectionEndLine: selection.end.line,
      contextLines,
    });

    const requestedMode = options.forcedMode ?? "auto";
    const resolvedMode: PanelMode =
      requestedMode === "auto" ? detectMode(code, editor.document.languageId) : requestedMode;

    const panel = UnravelPanel.createOrShow(context.extensionUri, context.secrets);
    await panel.run({
      code,
      languageId: editor.document.languageId,
      lang,
      model,
      detail,
      mode: resolvedMode,
      auth,
      ...(claudeCodePath !== "" ? { claudeCodePath } : {}),
      ...(contextBefore !== undefined ? { contextBefore } : {}),
      ...(contextAfter !== undefined ? { contextAfter } : {}),
    });
  };
}
