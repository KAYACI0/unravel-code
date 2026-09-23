export const SETTINGS_STYLES = `
  :root {
    color-scheme: light dark;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0 0 48px;
    font-family: var(--vscode-font-family, sans-serif);
    font-size: var(--vscode-font-size, 13px);
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
  }

  .page {
    max-width: 760px;
    margin: 0 auto;
    padding: 28px 32px 0;
  }

  .page-header {
    margin-bottom: 28px;
  }

  .page-header h1 {
    font-size: 22px;
    font-weight: 600;
    margin: 0 0 4px;
    letter-spacing: -0.01em;
  }

  .page-header p {
    margin: 0;
    color: var(--vscode-descriptionForeground);
    font-size: 13px;
  }

  section {
    margin-bottom: 32px;
  }

  section h2 {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--vscode-descriptionForeground);
    margin: 0 0 4px;
  }

  section > p.hint {
    margin: 0 0 14px;
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 10px;
  }

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: left;
    border: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.3));
    border-radius: 8px;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background));
    padding: 14px 14px 12px;
    color: inherit;
    font-family: inherit;
    transition: border-color 0.1s ease, background 0.1s ease;
  }

  .card:hover {
    border-color: var(--vscode-focusBorder, var(--vscode-button-background));
  }

  .card.selected {
    border-color: var(--vscode-button-background);
    background: color-mix(in srgb, var(--vscode-button-background) 8%, var(--vscode-editorWidget-background, var(--vscode-editor-background)));
  }

  .card-select {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 0;
    margin: 0;
    border: none;
    background: none;
    cursor: pointer;
    color: inherit;
    font-family: inherit;
    text-align: left;
  }

  .card-icon {
    flex: 0 0 auto;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
  }

  .card-icon svg {
    width: 16px;
    height: 16px;
  }

  .card-title {
    font-weight: 600;
    font-size: 13px;
    flex: 1;
  }

  .card-check {
    position: relative;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 1.5px solid var(--vscode-panel-border, rgba(128,128,128,0.6));
    flex: 0 0 auto;
  }

  .card.selected .card-check {
    border-color: var(--vscode-button-background);
  }

  .card.selected .card-check::after {
    content: "";
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: var(--vscode-button-background);
  }

  .card-desc {
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
    line-height: 1.4;
    margin: 0;
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    margin-top: 2px;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex: 0 0 auto;
  }

  .status-dot.ok { background: var(--vscode-charts-green, #3fb950); }
  .status-dot.bad { background: var(--vscode-charts-red, #f85149); }
  .status-dot.pending { background: var(--vscode-charts-yellow, #d29922); }

  .status-text {
    color: var(--vscode-descriptionForeground);
  }

  .status-text.ok { color: var(--vscode-foreground); }

  .card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 2px;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 2px;
  }

  .chip {
    font-size: 11px;
    padding: 3px 9px;
    border-radius: 999px;
    border: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.4));
    background: var(--vscode-editor-background);
    color: var(--vscode-foreground);
    cursor: pointer;
  }

  .chip:hover {
    border-color: var(--vscode-focusBorder, var(--vscode-button-background));
  }

  .chip.selected {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border-color: var(--vscode-button-background);
  }

  button {
    font-family: inherit;
    font-size: 12px;
    border: none;
    border-radius: 3px;
    padding: 5px 11px;
    cursor: pointer;
    background: var(--vscode-button-secondaryBackground, transparent);
    color: var(--vscode-button-secondaryForeground, var(--vscode-foreground));
    border: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.4));
  }

  button:hover:not(:disabled) {
    background: var(--vscode-button-secondaryHoverBackground, var(--vscode-toolbar-hoverBackground));
  }

  button.primary {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border-color: transparent;
  }

  button.primary:hover:not(:disabled) {
    background: var(--vscode-button-hoverBackground);
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .icon-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .icon-btn svg {
    width: 12px;
    height: 12px;
  }

  .field-grid {
    display: grid;
    grid-template-columns: 160px 1fr;
    row-gap: 10px;
    column-gap: 16px;
    align-items: center;
  }

  .field-grid label {
    font-size: 12px;
    color: var(--vscode-foreground);
  }

  .field-grid .field-desc {
    grid-column: 2;
    margin: -6px 0 0;
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
  }

  select,
  input[type="text"],
  input[type="number"] {
    font-family: inherit;
    font-size: 12px;
    color: var(--vscode-foreground);
    background: var(--vscode-dropdown-background, var(--vscode-editor-background));
    border: 1px solid var(--vscode-dropdown-border, var(--vscode-panel-border, transparent));
    border-radius: 3px;
    padding: 4px 7px;
    width: 100%;
    max-width: 320px;
  }

  input:focus-visible,
  select:focus-visible,
  button:focus-visible,
  .card:focus-visible,
  .chip:focus-visible {
    outline: 1px solid var(--vscode-focusBorder);
    outline-offset: 1px;
  }

  details {
    border: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.3));
    border-radius: 6px;
    padding: 10px 14px;
  }

  details[open] {
    padding-bottom: 14px;
  }

  summary {
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: var(--vscode-foreground);
    list-style: none;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary::before {
    content: "";
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 3.5px 0 3.5px 5px;
    border-color: transparent transparent transparent var(--vscode-descriptionForeground);
    transition: transform 0.1s ease;
  }

  details[open] summary::before {
    transform: rotate(90deg);
  }

  details .field-grid {
    margin-top: 14px;
  }

  .refresh-row {
    display: flex;
    justify-content: flex-end;
    margin-top: -6px;
    margin-bottom: 14px;
  }

  .refresh-row button {
    font-size: 11px;
  }
`;
