import {
  AbortedError,
  AuthError,
  MissingApiKeyError,
  NetworkError,
  RateLimitError,
} from "@unravel-code/core";
import { describe, expect, it } from "vitest";
import { classifyError } from "./errorClassification.js";

describe("classifyError", () => {
  it("classifies MissingApiKeyError", () => {
    expect(classifyError(new MissingApiKeyError())).toEqual({
      kind: "missing-key",
      message: new MissingApiKeyError().message,
    });
  });

  it("classifies AuthError", () => {
    expect(classifyError(new AuthError()).kind).toBe("auth");
  });

  it("classifies RateLimitError", () => {
    expect(classifyError(new RateLimitError()).kind).toBe("rate-limit");
  });

  it("classifies NetworkError", () => {
    expect(classifyError(new NetworkError()).kind).toBe("network");
  });

  it("falls back to unknown for AbortedError (handled separately by callers)", () => {
    expect(classifyError(new AbortedError()).kind).toBe("unknown");
  });

  it("falls back to unknown for a plain Error, preserving its message", () => {
    expect(classifyError(new Error("boom"))).toEqual({ kind: "unknown", message: "boom" });
  });

  it("falls back to unknown for a non-Error throw", () => {
    expect(classifyError("boom")).toEqual({ kind: "unknown", message: "Unknown error." });
  });
});
