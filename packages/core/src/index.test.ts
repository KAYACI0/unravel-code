import { describe, expect, it } from "vitest";
import { DEFAULT_MODEL, OPUS, SONNET } from "./index.js";

describe("core package public API", () => {
  it("exposes stable model identifiers", () => {
    expect(DEFAULT_MODEL).toBe("claude-haiku-4-5");
    expect(SONNET).toBe("claude-sonnet-5");
    expect(OPUS).toBe("claude-opus-5");
  });

  it("defaults to the cheapest model", () => {
    expect(DEFAULT_MODEL).not.toBe(SONNET);
    expect(DEFAULT_MODEL).not.toBe(OPUS);
  });
});
