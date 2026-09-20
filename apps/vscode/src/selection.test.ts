import { describe, expect, it } from "vitest";
import { buildSelectionContext } from "./selection.js";

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
