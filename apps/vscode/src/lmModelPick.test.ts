import { describe, expect, it } from "vitest";
import { pickModel } from "./lmModelPick.js";

const model = (vendor: string, family: string) => ({ vendor, family });

const CHATGPT = model("openai", "gpt-5");
const COPILOT_CLAUDE = model("copilot", "claude-sonnet-4.5");
const LOCAL = model("ollama", "llama3");

describe("pickModel without a preference", () => {
  it("prefers Claude, since the prompts were written against it", () => {
    expect(pickModel([CHATGPT, COPILOT_CLAUDE])).toBe(COPILOT_CLAUDE);
  });

  it("falls back to GPT when no Claude model is offered", () => {
    expect(pickModel([LOCAL, CHATGPT])).toBe(CHATGPT);
  });

  it("takes whatever is left rather than giving up", () => {
    expect(pickModel([LOCAL])).toBe(LOCAL);
  });

  it("returns undefined when the editor offers nothing", () => {
    expect(pickModel([])).toBeUndefined();
  });
});

describe("pickModel with a preference", () => {
  it("picks ChatGPT by vendor even when a Claude model is present", () => {
    expect(pickModel([COPILOT_CLAUDE, CHATGPT], "openai")).toBe(CHATGPT);
  });

  it("picks by family name too", () => {
    expect(pickModel([COPILOT_CLAUDE, CHATGPT], "gpt")).toBe(CHATGPT);
  });

  it("matches case-insensitively", () => {
    expect(pickModel([COPILOT_CLAUDE, CHATGPT], "OpenAI")).toBe(CHATGPT);
  });

  it("ignores surrounding whitespace", () => {
    expect(pickModel([COPILOT_CLAUDE, CHATGPT], "  openai  ")).toBe(CHATGPT);
  });

  it("can prefer Copilot over an otherwise-favoured Claude vendor", () => {
    const anthropic = model("anthropic", "claude-opus");
    expect(pickModel([anthropic, COPILOT_CLAUDE], "copilot")).toBe(COPILOT_CLAUDE);
  });

  it("falls back to the default order when the preference matches nothing", () => {
    expect(pickModel([COPILOT_CLAUDE, LOCAL], "openai")).toBe(COPILOT_CLAUDE);
  });

  it("treats an empty preference as no preference", () => {
    expect(pickModel([CHATGPT, COPILOT_CLAUDE], "")).toBe(COPILOT_CLAUDE);
  });
});
