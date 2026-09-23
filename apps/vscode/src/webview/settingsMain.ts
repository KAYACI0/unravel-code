import type {
  SettingsAuthChoice,
  SettingsState,
  SettingsToWebviewMessage,
  WebviewToSettingsMessage,
} from "../settingsProtocol.js";

declare function acquireVsCodeApi(): {
  postMessage(message: WebviewToSettingsMessage): void;
};

const vscodeApi = acquireVsCodeApi();

const root = document.getElementById("root");
if (!root) throw new Error("root element missing");

// Monoline icons, 16x16, currentColor — hand-authored rather than pulled from
// an icon font so the webview stays a single self-contained bundle.
const ICONS = {
  terminal: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><path d="M4.5 6l2 2-2 2"/><path d="M8.5 10h3"/></svg>`,
  chat: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3.5h12v7.5a1 1 0 0 1-1 1H6l-3 2.5v-2.5H3a1 1 0 0 1-1-1V3.5Z"/><circle cx="5.5" cy="7.25" r="0.6" fill="currentColor" stroke="none"/><circle cx="8" cy="7.25" r="0.6" fill="currentColor" stroke="none"/><circle cx="10.5" cy="7.25" r="0.6" fill="currentColor" stroke="none"/></svg>`,
  plug: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v3M10 2v3"/><rect x="4.5" y="5" width="7" height="4" rx="1"/><path d="M8 9v2a3 3 0 0 1-3 3H4"/></svg>`,
  key: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="8" r="3"/><path d="M7.5 9.5 13 4M11 6l1.5 1.5M9.3 7.7 10.8 9.2"/></svg>`,
  refresh: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8A5 5 0 1 1 11.5 4.3"/><path d="M13 2.5V5.5H10"/></svg>`,
} as const;

root.innerHTML = `
  <div class="page">
    <div class="page-header">
      <h1>Unravel Settings</h1>
      <p>Choose how Unravel pays for requests, and tune how it explains code.</p>
    </div>

    <section>
      <h2>Authentication</h2>
      <p class="hint">Switching is safe — nothing is sent anywhere until you run Explain.</p>
      <div class="refresh-row">
        <button id="refreshBtn" class="icon-btn" type="button">${ICONS.refresh}<span>Refresh status</span></button>
      </div>
      <div class="cards" id="authCards" role="radiogroup" aria-label="Authentication"></div>
    </section>

    <section>
      <h2>Preferences</h2>
      <div class="field-grid">
        <label for="languageSelect">Language</label>
        <select id="languageSelect">
          <option value="auto">Auto (follow VS Code)</option>
          <option value="en">English</option>
          <option value="tr">Türkçe</option>
        </select>

        <label for="detailSelect">Detail</label>
        <select id="detailSelect">
          <option value="brief">Brief</option>
          <option value="detailed">Detailed</option>
        </select>

        <label for="modelSelect">Claude model</label>
        <select id="modelSelect">
          <option value="claude-haiku-4-5">Haiku — cheapest, recommended</option>
          <option value="claude-sonnet-5">Sonnet — balanced, costs more</option>
          <option value="claude-opus-5">Opus — most capable, priciest</option>
        </select>
        <p class="field-desc">Used by the Claude Code and API key auth modes. Haiku is the cheapest and is recommended by default; switch only if explanations feel shallow.</p>

        <label for="contextLinesInput">Context lines</label>
        <input type="number" id="contextLinesInput" min="0" max="200" />
      </div>
    </section>

    <section>
      <details id="advancedDetails">
        <summary>Advanced</summary>
        <div class="field-grid">
          <label for="claudeCodePathInput">Claude Code path</label>
          <input type="text" id="claudeCodePathInput" placeholder="Detected automatically" spellcheck="false" />

          <label for="codexPathInput">Codex path</label>
          <input type="text" id="codexPathInput" placeholder="Detected automatically" spellcheck="false" />

          <label for="codexModelInput">Codex model</label>
          <input type="text" id="codexModelInput" placeholder="Uses Codex's own default" spellcheck="false" />
          <p class="field-desc">Leave empty (recommended) — Codex's model lineup changes on its own schedule, so a name typed here can go stale.</p>
        </div>
      </details>
    </section>
  </div>
`;

function el<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`missing element #${id}`);
  return found as T;
}

const authCardsEl = el<HTMLDivElement>("authCards");
const refreshBtn = el<HTMLButtonElement>("refreshBtn");
const languageSelect = el<HTMLSelectElement>("languageSelect");
const detailSelect = el<HTMLSelectElement>("detailSelect");
const modelSelect = el<HTMLSelectElement>("modelSelect");
const contextLinesInput = el<HTMLInputElement>("contextLinesInput");
const claudeCodePathInput = el<HTMLInputElement>("claudeCodePathInput");
const codexPathInput = el<HTMLInputElement>("codexPathInput");
const codexModelInput = el<HTMLInputElement>("codexModelInput");

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusRow(status: { found: boolean; version?: string }, foundLabel: string): string {
  if (status.found) {
    const version = status.version ? escapeHtml(status.version) : "";
    return `<div class="status-row"><span class="status-dot ok"></span><span class="status-text ok">${foundLabel}${version ? ` — ${version}` : ""}</span></div>`;
  }
  return `<div class="status-row"><span class="status-dot bad"></span><span class="status-text">Not found</span></div>`;
}

function pendingRow(): string {
  return `<div class="status-row"><span class="status-dot pending"></span><span class="status-text">Checking…</span></div>`;
}

function renderCards(state: SettingsState): void {
  const sel = (choice: SettingsAuthChoice) => (state.auth === choice ? "selected" : "");

  const claudeStatus = state.detecting ? pendingRow() : statusRow(state.claudeCode, "Installed");
  const claudeActions = state.claudeCode.found
    ? ""
    : `<div class="card-actions"><button type="button" data-action="installClaudeCode">Install Claude Code</button></div>`;

  const codexStatus = state.detecting ? pendingRow() : statusRow(state.codex, "Installed");
  const codexActions = state.codex.found
    ? ""
    : `<div class="card-actions"><button type="button" data-action="installCodex">Install with npm</button></div>`;

  let lmBody: string;
  if (state.detecting) {
    lmBody = pendingRow();
  } else if (state.lmModels.length === 0) {
    lmBody = `
      <div class="status-row"><span class="status-dot bad"></span><span class="status-text">No provider detected</span></div>
      <div class="card-actions">
        <button type="button" data-action="searchChatGptExtension">Find ChatGPT extension</button>
        <button type="button" data-action="searchCopilotExtension">Find GitHub Copilot</button>
      </div>`;
  } else {
    const chips = state.lmModels
      .map((m) => {
        const active =
          state.auth === "vscodeLm" && state.lmPreferred === m.vendor ? "selected" : "";
        return `<button type="button" class="chip ${active}" data-action="selectLmVendor" data-vendor="${escapeHtml(m.vendor)}">${escapeHtml(m.vendor)}</button>`;
      })
      .join("");
    lmBody = `
      <div class="status-row"><span class="status-dot ok"></span><span class="status-text ok">${state.lmModels.length} provider${state.lmModels.length === 1 ? "" : "s"} available</span></div>
      <div class="chip-row">${chips}</div>`;
  }

  const apiKeyStatus = state.hasApiKey
    ? `<div class="status-row"><span class="status-dot ok"></span><span class="status-text ok">Key set</span></div>`
    : `<div class="status-row"><span class="status-dot bad"></span><span class="status-text">Not set</span></div>`;
  const apiKeyActions = `<div class="card-actions">
      <button type="button" data-action="setApiKey">${state.hasApiKey ? "Replace key" : "Set API key"}</button>
      ${state.hasApiKey ? `<button type="button" data-action="clearApiKey">Clear</button>` : ""}
    </div>`;

  // Each card is a <div>, not a <button>: its install/set-key/chip controls
  // are real buttons, and a <button> cannot contain another <button> — the
  // browser would silently hoist the inner ones out, breaking the layout.
  // Selecting the card itself is a dedicated <button class="card-select">
  // covering just the icon/title row, so the click target stays obvious.
  const card = (
    auth: SettingsAuthChoice,
    icon: string,
    title: string,
    desc: string,
    ...rest: string[]
  ) => `
    <div class="card ${sel(auth)}">
      <button type="button" class="card-select" role="radio" aria-checked="${state.auth === auth}" data-action="selectAuth" data-auth="${auth}">
        <span class="card-icon">${icon}</span>
        <span class="card-title">${title}</span>
        <span class="card-check"></span>
      </button>
      <p class="card-desc">${desc}</p>
      ${rest.join("")}
    </div>`;

  authCardsEl.innerHTML =
    card(
      "claudeCode",
      ICONS.terminal,
      "Claude subscription",
      "Runs on a locally installed Claude Code. No API key — your Claude subscription pays.",
      claudeStatus,
      claudeActions,
    ) +
    card(
      "codex",
      ICONS.chat,
      "ChatGPT subscription (CLI)",
      "Runs on a locally installed Codex CLI. No API key. Answers appear all at once — this mode does not stream.",
      codexStatus,
      codexActions,
    ) +
    card(
      "vscodeLm",
      ICONS.plug,
      "Editor language model",
      "Uses a model another extension provides — the ChatGPT extension, GitHub Copilot, or similar. No API key.",
      lmBody,
    ) +
    card(
      "apiKey",
      ICONS.key,
      "Anthropic API key",
      "Fastest option. You pay Anthropic directly per request.",
      apiKeyStatus,
      apiKeyActions,
    );
}

let currentState: SettingsState | undefined;

function applyState(state: SettingsState): void {
  currentState = state;
  renderCards(state);

  languageSelect.value = state.language;
  detailSelect.value = state.detail;
  if ([...modelSelect.options].some((o) => o.value === state.model)) {
    modelSelect.value = state.model;
  }
  contextLinesInput.value = String(state.contextLines);

  // Don't clobber a field the user is actively typing in.
  if (document.activeElement !== claudeCodePathInput)
    claudeCodePathInput.value = state.claudeCodePath;
  if (document.activeElement !== codexPathInput) codexPathInput.value = state.codexPath;
  if (document.activeElement !== codexModelInput) codexModelInput.value = state.codexModel;

  refreshBtn.disabled = state.detecting;
}

window.addEventListener("message", (event: MessageEvent<SettingsToWebviewMessage>) => {
  const message = event.data;
  if (message.type === "state") applyState(message.state);
});

authCardsEl.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  switch (action) {
    case "selectAuth":
      vscodeApi.postMessage({
        type: "selectAuth",
        auth: target.dataset.auth as SettingsAuthChoice,
      });
      break;
    case "selectLmVendor":
      vscodeApi.postMessage({ type: "selectLmVendor", vendor: target.dataset.vendor ?? "" });
      break;
    case "installClaudeCode":
      vscodeApi.postMessage({ type: "installClaudeCode" });
      break;
    case "installCodex":
      vscodeApi.postMessage({ type: "installCodex" });
      break;
    case "searchCopilotExtension":
      vscodeApi.postMessage({ type: "searchCopilotExtension" });
      break;
    case "searchChatGptExtension":
      vscodeApi.postMessage({ type: "searchChatGptExtension" });
      break;
    case "setApiKey":
      vscodeApi.postMessage({ type: "setApiKey" });
      break;
    case "clearApiKey":
      vscodeApi.postMessage({ type: "clearApiKey" });
      break;
  }
});

refreshBtn.addEventListener("click", () => {
  vscodeApi.postMessage({ type: "refreshDetection" });
});

languageSelect.addEventListener("change", () => {
  vscodeApi.postMessage({
    type: "setLanguage",
    value: languageSelect.value as "auto" | "tr" | "en",
  });
});

detailSelect.addEventListener("change", () => {
  vscodeApi.postMessage({ type: "setDetail", value: detailSelect.value as "brief" | "detailed" });
});

modelSelect.addEventListener("change", () => {
  vscodeApi.postMessage({ type: "setTextField", field: "model", value: modelSelect.value });
});

contextLinesInput.addEventListener("change", () => {
  const value = Number(contextLinesInput.value);
  if (Number.isFinite(value) && value >= 0) {
    vscodeApi.postMessage({ type: "setContextLines", value });
  } else if (currentState) {
    contextLinesInput.value = String(currentState.contextLines);
  }
});

claudeCodePathInput.addEventListener("change", () => {
  vscodeApi.postMessage({
    type: "setTextField",
    field: "claudeCodePath",
    value: claudeCodePathInput.value.trim(),
  });
});

codexPathInput.addEventListener("change", () => {
  vscodeApi.postMessage({
    type: "setTextField",
    field: "codexPath",
    value: codexPathInput.value.trim(),
  });
});

codexModelInput.addEventListener("change", () => {
  vscodeApi.postMessage({
    type: "setTextField",
    field: "codexModel",
    value: codexModelInput.value.trim(),
  });
});

vscodeApi.postMessage({ type: "ready" });
