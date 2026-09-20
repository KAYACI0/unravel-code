import * as vscode from "vscode";

export interface StreamingOutput {
  appendText(text: string): Promise<void>;
}

export async function openStreamingMarkdownDocument(): Promise<StreamingOutput> {
  const document = await vscode.workspace.openTextDocument({
    content: "",
    language: "markdown",
  });
  const editor = await vscode.window.showTextDocument(document, { preview: false });

  return {
    async appendText(text: string): Promise<void> {
      const endLine = document.lineCount - 1;
      const endCharacter = document.lineAt(endLine).text.length;
      const endPosition = new vscode.Position(endLine, endCharacter);
      await editor.edit((editBuilder) => {
        editBuilder.insert(endPosition, text);
      });
    },
  };
}
