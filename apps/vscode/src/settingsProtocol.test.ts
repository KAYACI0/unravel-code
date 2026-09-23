import { describe, expect, it } from "vitest";
import { parseSettingsMessage } from "./settingsProtocol.js";

describe("parseSettingsMessage", () => {
  it("accepts simple no-payload messages", () => {
    for (const type of [
      "ready",
      "setApiKey",
      "clearApiKey",
      "refreshDetection",
      "installClaudeCode",
      "installCodex",
      "searchCopilotExtension",
      "searchChatGptExtension",
    ]) {
      expect(parseSettingsMessage({ type })).toEqual({ type });
    }
  });

  it("accepts a valid selectAuth message", () => {
    expect(parseSettingsMessage({ type: "selectAuth", auth: "codex" })).toEqual({
      type: "selectAuth",
      auth: "codex",
    });
  });

  it("rejects selectAuth with an invalid or missing auth value", () => {
    expect(parseSettingsMessage({ type: "selectAuth", auth: "auto" })).toBeUndefined();
    expect(parseSettingsMessage({ type: "selectAuth", auth: 42 })).toBeUndefined();
    expect(parseSettingsMessage({ type: "selectAuth" })).toBeUndefined();
  });

  it("accepts a valid selectLmVendor message, including an empty vendor", () => {
    expect(parseSettingsMessage({ type: "selectLmVendor", vendor: "openai" })).toEqual({
      type: "selectLmVendor",
      vendor: "openai",
    });
    expect(parseSettingsMessage({ type: "selectLmVendor", vendor: "" })).toEqual({
      type: "selectLmVendor",
      vendor: "",
    });
  });

  it("rejects selectLmVendor with a non-string vendor", () => {
    expect(parseSettingsMessage({ type: "selectLmVendor", vendor: 1 })).toBeUndefined();
    expect(parseSettingsMessage({ type: "selectLmVendor" })).toBeUndefined();
  });

  it("accepts a valid setTextField message for each known field", () => {
    for (const field of ["claudeCodePath", "codexPath", "codexModel", "lmPreferred", "model"]) {
      expect(parseSettingsMessage({ type: "setTextField", field, value: "x" })).toEqual({
        type: "setTextField",
        field,
        value: "x",
      });
    }
  });

  it("rejects setTextField with an unknown field or non-string value", () => {
    expect(
      parseSettingsMessage({ type: "setTextField", field: "apiKey", value: "x" }),
    ).toBeUndefined();
    expect(
      parseSettingsMessage({ type: "setTextField", field: "model", value: 42 }),
    ).toBeUndefined();
  });

  it("accepts a valid setLanguage message", () => {
    expect(parseSettingsMessage({ type: "setLanguage", value: "tr" })).toEqual({
      type: "setLanguage",
      value: "tr",
    });
  });

  it("rejects setLanguage with an invalid value", () => {
    expect(parseSettingsMessage({ type: "setLanguage", value: "fr" })).toBeUndefined();
  });

  it("accepts a valid setDetail message", () => {
    expect(parseSettingsMessage({ type: "setDetail", value: "brief" })).toEqual({
      type: "setDetail",
      value: "brief",
    });
  });

  it("rejects setDetail with an invalid value", () => {
    expect(parseSettingsMessage({ type: "setDetail", value: "verbose" })).toBeUndefined();
  });

  it("accepts a valid setContextLines message and floors a fractional value", () => {
    expect(parseSettingsMessage({ type: "setContextLines", value: 8 })).toEqual({
      type: "setContextLines",
      value: 8,
    });
    expect(parseSettingsMessage({ type: "setContextLines", value: 3.7 })).toEqual({
      type: "setContextLines",
      value: 3,
    });
  });

  it("rejects setContextLines with a negative, non-finite, or non-number value", () => {
    expect(parseSettingsMessage({ type: "setContextLines", value: -1 })).toBeUndefined();
    expect(parseSettingsMessage({ type: "setContextLines", value: Number.NaN })).toBeUndefined();
    expect(parseSettingsMessage({ type: "setContextLines", value: "5" })).toBeUndefined();
  });

  it("rejects an unknown message type", () => {
    expect(parseSettingsMessage({ type: "nope" })).toBeUndefined();
  });

  it("rejects malformed input", () => {
    expect(parseSettingsMessage(null)).toBeUndefined();
    expect(parseSettingsMessage(undefined)).toBeUndefined();
    expect(parseSettingsMessage("ready")).toBeUndefined();
    expect(parseSettingsMessage(42)).toBeUndefined();
    expect(parseSettingsMessage({})).toBeUndefined();
  });
});
