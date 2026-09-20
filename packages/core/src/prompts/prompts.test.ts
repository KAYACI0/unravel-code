import { describe, expect, it } from "vitest";
import { buildUserMessage } from "./base.js";
import { buildCodeSystemPrompt } from "./code.js";
import { buildLegacySystemPrompt } from "./legacy.js";
import { buildRegexSystemPrompt } from "./regex.js";

describe("prompt builders", () => {
  it("builds the code prompt (en, detailed)", () => {
    expect(
      buildCodeSystemPrompt({ lang: "en", detail: "detailed", languageId: "typescript" }),
    ).toMatchSnapshot();
  });

  it("builds the code prompt (tr, brief)", () => {
    expect(buildCodeSystemPrompt({ lang: "tr", detail: "brief" })).toMatchSnapshot();
  });

  it("builds the regex prompt (en) for a JS languageId", () => {
    expect(
      buildRegexSystemPrompt({ lang: "en", detail: "detailed", languageId: "javascript" }),
    ).toMatchSnapshot();
  });

  it("builds the regex prompt (tr) for a Python languageId", () => {
    expect(
      buildRegexSystemPrompt({ lang: "tr", detail: "detailed", languageId: "python" }),
    ).toMatchSnapshot();
  });

  it("builds the legacy prompt (en)", () => {
    expect(
      buildLegacySystemPrompt({ lang: "en", detail: "detailed", languageId: "python" }),
    ).toMatchSnapshot();
  });

  it("builds the user message with code and surrounding context", () => {
    expect(
      buildUserMessage({
        code: "const x = 1;",
        languageId: "typescript",
        contextBefore: "// before",
        contextAfter: "// after",
      }),
    ).toMatchSnapshot();
  });

  it("builds the user message with only code", () => {
    expect(buildUserMessage({ code: "const x = 1;" })).toMatchSnapshot();
  });
});
