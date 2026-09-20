import { describe, expect, it } from "vitest";
import { resolveLanguage } from "./config.js";

describe("resolveLanguage", () => {
  it("passes through an explicit tr/en choice", () => {
    expect(resolveLanguage("tr", "en-US")).toBe("tr");
    expect(resolveLanguage("en", "tr-TR")).toBe("en");
  });

  it("resolves 'auto' to tr for Turkish VS Code locales", () => {
    expect(resolveLanguage("auto", "tr")).toBe("tr");
    expect(resolveLanguage("auto", "tr-TR")).toBe("tr");
  });

  it("resolves 'auto' to en for non-Turkish locales", () => {
    expect(resolveLanguage("auto", "en")).toBe("en");
    expect(resolveLanguage("auto", "en-US")).toBe("en");
    expect(resolveLanguage("auto", "de")).toBe("en");
    expect(resolveLanguage("auto", "ja")).toBe("en");
  });
});
