import * as vscode from "vscode";
import { clearApiKeyCommand, setApiKeyCommand } from "./apiKey.js";
import { createExplainCommand } from "./explainCommand.js";

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("unravelCode.explain", createExplainCommand(context)),
    vscode.commands.registerCommand(
      "unravelCode.explainRegex",
      createExplainCommand(context, { forcedMode: "regex" }),
    ),
    vscode.commands.registerCommand("unravelCode.setApiKey", () =>
      setApiKeyCommand(context.secrets),
    ),
    vscode.commands.registerCommand("unravelCode.clearApiKey", () =>
      clearApiKeyCommand(context.secrets),
    ),
  );
}

export function deactivate(): void {}
