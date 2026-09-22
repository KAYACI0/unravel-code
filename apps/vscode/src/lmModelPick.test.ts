import { describe, expect, it } from "vitest";
import { pickModel } from "./lmModelPick.js";

// Only the family field matters for selection, so the tests use a minimal
// stand-in rather than mocking the whole vscode.LanguageModelChat surface.
const model = (family: string) => ({ family });

describe("pickModel", () => {
  it("prefers a Claude model, since the prompts were written against one", () => {
    const chosen = pickModel([model("gpt-4o"), model("claude-sonnet-4.5")]);
    expect(chosen).toHaveProperty("family", "claude-sonnet-4.5");
  });

  it("matches the family case-insensitively", () => {
    const chosen = pickModel([model("Claude-Sonnet")]);
    expect(chosen).toHaveProperty("family", "Claude-Sonnet");
  });

  it("falls back to GPT when no Claude model is offered", () => {
    const chosen = pickModel([model("o1-mini"), model("gpt-4o")]);
    expect(chosen).toHaveProperty("family", "gpt-4o");
  });

  it("takes whatever is left rather than giving up", () => {
    const chosen = pickModel([model("some-local-llama")]);
    expect(chosen).toHaveProperty("family", "some-local-llama");
  });

  it("returns undefined when the editor offers nothing", () => {
    expect(pickModel([])).toBeUndefined();
  });
});
