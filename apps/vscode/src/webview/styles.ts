export const PANEL_STYLES = `
  :root {
    color-scheme: light dark;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 12px 16px 24px;
    font-family: var(--vscode-font-family, sans-serif);
    font-size: var(--vscode-font-size, 13px);
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
  }

  .header {
    border-bottom: 1px solid var(--vscode-panel-border, transparent);
    padding-bottom: 10px;
    margin-bottom: 12px;
  }

  .preview pre {
    margin: 0 0 8px;
    padding: 6px 8px;
    background: var(--vscode-textCodeBlock-background, var(--vscode-editor-background));
    border-radius: 4px;
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: var(--vscode-editor-font-size, 12px);
    white-space: pre-wrap;
    word-break: break-word;
    overflow-x: auto;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
  }

  .redaction-note {
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 8px;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .controls label {
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  select,
  button {
    font-family: inherit;
    font-size: 12px;
    color: var(--vscode-foreground);
    background: var(--vscode-dropdown-background, var(--vscode-editor-background));
    border: 1px solid var(--vscode-dropdown-border, var(--vscode-panel-border, transparent));
    border-radius: 3px;
    padding: 3px 6px;
  }

  button {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    cursor: pointer;
    padding: 4px 10px;
  }

  button:hover:not(:disabled) {
    background: var(--vscode-button-hoverBackground);
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  button.secondary {
    background: var(--vscode-button-secondaryBackground, transparent);
    color: var(--vscode-button-secondaryForeground, var(--vscode-foreground));
  }

  button.secondary:hover:not(:disabled) {
    background: var(--vscode-button-secondaryHoverBackground, var(--vscode-toolbar-hoverBackground));
  }

  #status {
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
    min-height: 18px;
    margin-bottom: 8px;
  }

  #status.error {
    color: var(--vscode-errorForeground);
  }

  #content {
    line-height: 1.5;
  }

  #content pre {
    background: var(--vscode-textCodeBlock-background, var(--vscode-editor-background));
    padding: 8px 10px;
    border-radius: 4px;
    overflow-x: auto;
  }

  #content code {
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: var(--vscode-editor-font-size, 12px);
  }

  #content :not(pre) > code {
    background: var(--vscode-textCodeBlock-background, var(--vscode-editor-background));
    padding: 1px 4px;
    border-radius: 3px;
  }

  #content a {
    color: var(--vscode-textLink-foreground);
  }

  #content blockquote {
    margin: 0;
    padding-left: 10px;
    border-left: 3px solid var(--vscode-panel-border, currentColor);
    color: var(--vscode-descriptionForeground);
  }
`;
