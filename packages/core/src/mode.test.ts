import { describe, expect, it } from "vitest";
import { detectMode } from "./mode.js";

describe("detectMode", () => {
  it("detects a JS regex literal", () => {
    expect(detectMode("/^[a-z]+$/i")).toBe("regex");
  });

  it("detects a bare regex with dense metacharacters and no spaces", () => {
    expect(detectMode("^\\d{3}-\\d{2}-\\d{4}$")).toBe("regex");
  });

  it("detects Python re.compile with a raw string", () => {
    expect(detectMode('re.compile(r"^\\d+$")')).toBe("regex");
  });

  it("detects Python re.match called with spaces", () => {
    expect(detectMode('re.match(r"\\w+@\\w+\\.com", email)')).toBe("regex");
  });

  it("treats multi-line input as code", () => {
    const code = ["function add(a, b) {", "  return a + b;", "}"].join("\n");
    expect(detectMode(code)).toBe("code");
  });

  it("does not misclassify a URL as regex", () => {
    expect(detectMode("https://example.com/path?query=1")).toBe("code");
  });

  it("does not misclassify a single-line function call as regex", () => {
    expect(detectMode("doSomething(a,b)")).toBe("code");
  });

  it("does not misclassify a glob pattern as regex", () => {
    expect(detectMode("src/**/*.ts")).toBe("code");
  });

  it("does not misclassify a simple assignment as regex", () => {
    expect(detectMode("const x = 1;")).toBe("code");
  });

  it("treats empty input as code", () => {
    expect(detectMode("")).toBe("code");
    expect(detectMode("   ")).toBe("code");
  });
});
