import { describe, expect, it } from "vitest";
import { buildSelectionContext, getCodePreview, validateSelectionLength } from "./selection.js";

const documentLines = ["l0", "l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9"];

describe("buildSelectionContext", () => {
  it("returns no context when contextLines is 0", () => {
    expect(
      buildSelectionContext({
        documentLines,
        selectionStartLine: 5,
        selectionEndLine: 5,
        contextLines: 0,
      }),
    ).toEqual({});
  });

  it("takes N lines before and after the selection", () => {
    expect(
      buildSelectionContext({
        documentLines,
        selectionStartLine: 5,
        selectionEndLine: 5,
        contextLines: 2,
      }),
    ).toEqual({
      contextBefore: "l3\nl4",
      contextAfter: "l6\nl7",
    });
  });

  it("clips before-context at the start of the document", () => {
    expect(
      buildSelectionContext({
        documentLines,
        selectionStartLine: 1,
        selectionEndLine: 1,
        contextLines: 5,
      }),
    ).toEqual({
      contextBefore: "l0",
      contextAfter: "l2\nl3\nl4\nl5\nl6",
    });
  });

  it("clips after-context at the end of the document", () => {
    expect(
      buildSelectionContext({
        documentLines,
        selectionStartLine: 8,
        selectionEndLine: 8,
        contextLines: 5,
      }),
    ).toEqual({
      contextBefore: "l3\nl4\nl5\nl6\nl7",
      contextAfter: "l9",
    });
  });

  it("handles a multi-line selection", () => {
    expect(
      buildSelectionContext({
        documentLines,
        selectionStartLine: 3,
        selectionEndLine: 6,
        contextLines: 2,
      }),
    ).toEqual({
      contextBefore: "l1\nl2",
      contextAfter: "l7\nl8",
    });
  });

  it("omits contextBefore/contextAfter entirely at document edges", () => {
    expect(
      buildSelectionContext({
        documentLines,
        selectionStartLine: 0,
        selectionEndLine: 9,
        contextLines: 3,
      }),
    ).toEqual({});
  });
});

describe("validateSelectionLength", () => {
  it("rejects an empty selection", () => {
    expect(validateSelectionLength(0)).toBe("Select some code first.");
  });

  it("accepts a normal-sized selection", () => {
    expect(validateSelectionLength(500)).toBeUndefined();
  });

  it("accepts a selection exactly at the limit", () => {
    expect(validateSelectionLength(20_000)).toBeUndefined();
  });

  it("rejects a selection over the limit", () => {
    const message = validateSelectionLength(20_001);
    expect(message).toContain("too large");
    expect(message).toContain("20001");
  });

  it("respects a custom limit", () => {
    expect(validateSelectionLength(50, 10)).toContain("too large");
    expect(validateSelectionLength(5, 10)).toBeUndefined();
  });
});

describe("getCodePreview", () => {
  it("returns short code unchanged", () => {
    expect(getCodePreview("const x = 1;")).toBe("const x = 1;");
  });

  it("truncates to the first N lines with an ellipsis marker", () => {
    const code = ["l0", "l1", "l2", "l3", "l4"].join("\n");
    expect(getCodePreview(code, 3)).toBe("l0\nl1\nl2\n…");
  });

  it("does not add an ellipsis when the code has exactly maxLines lines", () => {
    const code = ["l0", "l1", "l2"].join("\n");
    expect(getCodePreview(code, 3)).toBe("l0\nl1\nl2");
  });

  it("defaults to 3 lines", () => {
    const code = ["l0", "l1", "l2", "l3"].join("\n");
    expect(getCodePreview(code)).toBe("l0\nl1\nl2\n…");
  });
});
