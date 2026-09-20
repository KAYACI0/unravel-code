import { describe, expect, it } from "vitest";
import { parseWebviewMessage } from "./protocol.js";

describe("parseWebviewMessage", () => {
  it("accepts simple no-payload messages", () => {
    expect(parseWebviewMessage({ type: "ready" })).toEqual({ type: "ready" });
    expect(parseWebviewMessage({ type: "stop" })).toEqual({ type: "stop" });
    expect(parseWebviewMessage({ type: "copy" })).toEqual({ type: "copy" });
    expect(parseWebviewMessage({ type: "setApiKey" })).toEqual({ type: "setApiKey" });
  });

  it("accepts a valid setMode message", () => {
    expect(parseWebviewMessage({ type: "setMode", mode: "regex" })).toEqual({
      type: "setMode",
      mode: "regex",
    });
  });

  it("rejects setMode with an invalid mode value", () => {
    expect(parseWebviewMessage({ type: "setMode", mode: "auto" })).toBeUndefined();
    expect(parseWebviewMessage({ type: "setMode", mode: 42 })).toBeUndefined();
    expect(parseWebviewMessage({ type: "setMode" })).toBeUndefined();
  });

  it("accepts a valid setDetail message", () => {
    expect(parseWebviewMessage({ type: "setDetail", detail: "brief" })).toEqual({
      type: "setDetail",
      detail: "brief",
    });
  });

  it("rejects setDetail with an invalid detail value", () => {
    expect(parseWebviewMessage({ type: "setDetail", detail: "verbose" })).toBeUndefined();
  });

  it("rejects an unknown message type", () => {
    expect(parseWebviewMessage({ type: "nope" })).toBeUndefined();
  });

  it("rejects malformed input", () => {
    expect(parseWebviewMessage(null)).toBeUndefined();
    expect(parseWebviewMessage(undefined)).toBeUndefined();
    expect(parseWebviewMessage("stop")).toBeUndefined();
    expect(parseWebviewMessage(42)).toBeUndefined();
    expect(parseWebviewMessage({})).toBeUndefined();
  });
});
