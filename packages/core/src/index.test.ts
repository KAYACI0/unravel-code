import { describe, expect, it } from "vitest";
import { CORE_PACKAGE_NAME } from "./index.js";

describe("core package scaffold", () => {
  it("exposes its package name", () => {
    expect(CORE_PACKAGE_NAME).toBe("@unravel-code/core");
  });
});
