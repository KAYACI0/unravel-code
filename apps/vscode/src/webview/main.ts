import MarkdownIt from "markdown-it";
import type {
  ExtensionToWebviewMessage,
  PanelDetail,
  PanelMode,
  WebviewToExtensionMessage,
} from "../protocol.js";

declare function acquireVsCodeApi(): {
  postMessage(message: WebviewToExtensionMessage): void;
};

const vscodeApi = acquireVsCodeApi();
const md = new MarkdownIt({ html: false, linkify: true, breaks: false });

const root = document.getElementById("root");
if (!root) throw new Error("root element missing");

root.innerHTML = `
  <div class="header">
    <div class="preview"><pre id="preview"></pre></div>
    <div class="meta">
      <span class="badge" id="modeBadge"></span>
      <span class="badge" id="langBadge"></span>
      <span class="badge" id="modelBadge"></span>
    </div>
    <div class="redaction-note" id="redactionNote" hidden></div>
    <div class="controls">
      <label>Mode
        <select id="modeSelect">
          <option value="code">Code</option>
          <option value="regex">Regex</option>
          <option value="legacy">Legacy</option>
        </select>
      </label>
      <label>Detail
        <select id="detailSelect">
          <option value="brief">Brief</option>
          <option value="detailed">Detailed</option>
        </select>
      </label>
      <button id="stopBtn" class="secondary" disabled>Stop</button>
      <button id="copyBtn" class="secondary" disabled>Copy</button>
    </div>
  </div>
  <div id="status"></div>
  <div id="content"></div>
`;

function el<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`missing element #${id}`);
  return found as T;
}

const previewEl = el<HTMLPreElement>("preview");
const modeBadge = el<HTMLSpanElement>("modeBadge");
const langBadge = el<HTMLSpanElement>("langBadge");
const modelBadge = el<HTMLSpanElement>("modelBadge");
const redactionNote = el<HTMLDivElement>("redactionNote");
const modeSelect = el<HTMLSelectElement>("modeSelect");
const detailSelect = el<HTMLSelectElement>("detailSelect");
const stopBtn = el<HTMLButtonElement>("stopBtn");
const copyBtn = el<HTMLButtonElement>("copyBtn");
const statusEl = el<HTMLDivElement>("status");
const contentEl = el<HTMLDivElement>("content");

let fullText = "";
let renderScheduled = false;

function scheduleRender(): void {
  if (renderScheduled) return;
  renderScheduled = true;
  requestAnimationFrame(() => {
    renderScheduled = false;
    contentEl.innerHTML = md.render(fullText);
  });
}

function setStreaming(active: boolean): void {
  stopBtn.disabled = !active;
  modeSelect.disabled = active;
  detailSelect.disabled = active;
}

function setStatus(text: string, isError = false): void {
  statusEl.textContent = text;
  statusEl.classList.toggle("error", isError);
}

function showSetApiKeyButton(): void {
  const button = document.createElement("button");
  button.textContent = "Set API Key";
  button.addEventListener("click", () => {
    vscodeApi.postMessage({ type: "setApiKey" });
    button.remove();
  });
  statusEl.appendChild(document.createElement("br"));
  statusEl.appendChild(button);
}

window.addEventListener("message", (event: MessageEvent<ExtensionToWebviewMessage>) => {
  const message = event.data;
  switch (message.type) {
    case "init": {
      const { state } = message;
      previewEl.textContent = state.codePreview;
      modeBadge.textContent = state.mode;
      langBadge.textContent = state.lang;
      modelBadge.textContent = state.model;
      modeSelect.value = state.mode;
      detailSelect.value = state.detail;
      redactionNote.hidden = state.redactedCount === 0;
      redactionNote.textContent =
        state.redactedCount > 0
          ? `${state.redactedCount} secret value${state.redactedCount === 1 ? "" : "s"} redacted.`
          : "";
      fullText = "";
      contentEl.innerHTML = "";
      copyBtn.disabled = true;
      setStatus("Explaining…");
      setStreaming(true);
      break;
    }
    case "chunk":
      fullText += message.text;
      copyBtn.disabled = fullText.length === 0;
      scheduleRender();
      break;
    case "done":
      setStreaming(false);
      setStatus("");
      break;
    case "aborted":
      setStreaming(false);
      setStatus("Cancelled.");
      break;
    case "error":
      setStreaming(false);
      setStatus(message.message, true);
      if (message.kind === "missing-key") showSetApiKeyButton();
      break;
  }
});

stopBtn.addEventListener("click", () => {
  vscodeApi.postMessage({ type: "stop" });
});

copyBtn.addEventListener("click", () => {
  vscodeApi.postMessage({ type: "copy" });
});

modeSelect.addEventListener("change", () => {
  vscodeApi.postMessage({ type: "setMode", mode: modeSelect.value as PanelMode });
});

detailSelect.addEventListener("change", () => {
  vscodeApi.postMessage({ type: "setDetail", detail: detailSelect.value as PanelDetail });
});

vscodeApi.postMessage({ type: "ready" });
