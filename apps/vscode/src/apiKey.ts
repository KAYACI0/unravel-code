import * as vscode from "vscode";

const SECRET_KEY = "unravelCode.apiKey";

export async function getApiKey(secrets: vscode.SecretStorage): Promise<string | undefined> {
  return secrets.get(SECRET_KEY);
}

export async function setApiKeyCommand(secrets: vscode.SecretStorage): Promise<void> {
  const value = await vscode.window.showInputBox({
    prompt: "Enter your Anthropic API key",
    password: true,
    ignoreFocusOut: true,
    placeHolder: "sk-ant-...",
  });
  if (!value) return;

  await secrets.store(SECRET_KEY, value);
  void vscode.window.showInformationMessage("Unravel: API key saved.");
}

export async function clearApiKeyCommand(secrets: vscode.SecretStorage): Promise<void> {
  await secrets.delete(SECRET_KEY);
  void vscode.window.showInformationMessage("Unravel: API key cleared.");
}

export async function ensureApiKey(secrets: vscode.SecretStorage): Promise<string | undefined> {
  const existing = await getApiKey(secrets);
  if (existing) return existing;

  const choice = await vscode.window.showWarningMessage(
    "Unravel: No API key set.",
    "Set API Key",
    "Cancel",
  );
  if (choice !== "Set API Key") return undefined;

  await setApiKeyCommand(secrets);
  return getApiKey(secrets);
}
