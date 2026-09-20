import type { Detail, ExplainRequest, Mode } from "@unravel-code/core";
import { explain } from "@unravel-code/core";
import * as vscode from "vscode";
import { ensureApiKey } from "./apiKey.js";
import { resolveLanguage } from "./config.js";
import { openStreamingMarkdownDocument } from "./outputDocument.js";
import { buildSelectionContext } from "./selection.js";

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
    if (selection.isEmpty) {
      void vscode.window.showErrorMessage("Unravel: Select some code first.");
      return;
    }

    const apiKey = await ensureApiKey(context.secrets);
    if (!apiKey) return;

    const config = vscode.workspace.getConfiguration("unravelCode");
    const lang = resolveLanguage(
      config.get<"auto" | "tr" | "en">("language", "auto"),
      vscode.env.language,
    );
    const detail = config.get<Detail>("detail", "detailed");
    const model = config.get<string>("model", "claude-haiku-4-5");
    const contextLines = config.get<number>("contextLines", 5);

    const code = editor.document.getText(selection);
    const documentLines = editor.document.getText().split("\n");
    const { contextBefore, contextAfter } = buildSelectionContext({
      documentLines,
      selectionStartLine: selection.start.line,
      selectionEndLine: selection.end.line,
      contextLines,
    });

    const output = await openStreamingMarkdownDocument();

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Unravel: Explaining...",
        cancellable: true,
      },
      async (_progress, token) => {
        const controller = new AbortController();
        token.onCancellationRequested(() => controller.abort());

        const request: ExplainRequest = {
          code,
          mode: options.forcedMode ?? "auto",
          lang,
          detail,
          languageId: editor.document.languageId,
          model,
          signal: controller.signal,
          ...(contextBefore !== undefined ? { contextBefore } : {}),
          ...(contextAfter !== undefined ? { contextAfter } : {}),
        };

        try {
          for await (const chunk of explain(request, { apiKey })) {
            await output.appendText(chunk);
          }
        } catch (err) {
          if (!controller.signal.aborted) {
            const message = err instanceof Error ? err.message : "Unknown error.";
            void vscode.window.showErrorMessage(`Unravel: ${message}`);
          }
        }
      },
    );
  };
}
