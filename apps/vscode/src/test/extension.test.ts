import * as assert from "node:assert";
import * as vscode from "vscode";

const EXTENSION_ID = "unravel-code.unravel-code";
const COMMAND_IDS = [
  "unravelCode.explain",
  "unravelCode.explainRegex",
  "unravelCode.setApiKey",
  "unravelCode.clearApiKey",
];

suite("Unravel Code extension", () => {
  test("activates and registers all commands", async () => {
    const extension = vscode.extensions.getExtension(EXTENSION_ID);
    assert.ok(extension, `extension ${EXTENSION_ID} not found`);
    await extension.activate();

    const commands = await vscode.commands.getCommands(true);
    for (const id of COMMAND_IDS) {
      assert.ok(commands.includes(id), `command ${id} was not registered`);
    }
  });

  test("opens the Unravel panel when explaining a selection", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: "const x = 1;\n",
      language: "javascript",
    });
    const editor = await vscode.window.showTextDocument(document);
    editor.selection = new vscode.Selection(0, 0, 0, 13);

    await vscode.commands.executeCommand("unravelCode.explain");

    const hasUnravelTab = vscode.window.tabGroups.all.some((group) =>
      group.tabs.some((tab) => tab.label === "Unravel"),
    );
    assert.ok(hasUnravelTab, "Unravel panel did not open");
  });
});
