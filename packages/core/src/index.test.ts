import { describe, expect, it } from "vitest";
import { DEFAULT_MODEL, SONNET } from "./index.js";

describe("core package public API", () => {
  it("exposes stable model identifiers", () => {
    expect(DEFAULT_MODEL).toBe("claude-haiku-4-5");
    expect(SONNET).toBe("claude-sonnet-5");
  });
});
