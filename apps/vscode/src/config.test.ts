import { describe, expect, it } from "vitest";
import { requiresApiKey, resolveAuthMode, resolveLanguage } from "./config.js";

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

describe("requiresApiKey", () => {
  it("never asks for a key in claudeCode mode", () => {
    expect(requiresApiKey("claudeCode", false)).toBe(false);
    expect(requiresApiKey("claudeCode", true)).toBe(false);
  });

  it("never asks for a key in vscodeLm mode, where the editor holds the credential", () => {
    expect(requiresApiKey("vscodeLm", false)).toBe(false);
    expect(requiresApiKey("vscodeLm", true)).toBe(false);
  });

  it("always asks for a key in apiKey mode", () => {
    expect(requiresApiKey("apiKey", false)).toBe(true);
    expect(requiresApiKey("apiKey", true)).toBe(true);
  });

  it("in auto mode only needs a key when one is already stored", () => {
    expect(requiresApiKey("auto", false)).toBe(false);
    expect(requiresApiKey("auto", true)).toBe(true);
  });
});

describe("resolveAuthMode", () => {
  it("honours an explicit mode regardless of the stored key", () => {
    expect(resolveAuthMode("claudeCode", true)).toBe("claudeCode");
    expect(resolveAuthMode("vscodeLm", true)).toBe("vscodeLm");
    expect(resolveAuthMode("apiKey", false)).toBe("apiKey");
  });

  it("prefers a stored key in auto mode, else falls back to Claude Code", () => {
    expect(resolveAuthMode("auto", true)).toBe("apiKey");
    expect(resolveAuthMode("auto", false)).toBe("claudeCode");
  });
});
