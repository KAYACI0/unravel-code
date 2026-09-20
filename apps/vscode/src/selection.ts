export interface SelectionContextInput {
  documentLines: string[];
  selectionStartLine: number;
  selectionEndLine: number;
  contextLines: number;
}

export interface SelectionContextResult {
  contextBefore?: string;
  contextAfter?: string;
}

export function buildSelectionContext(input: SelectionContextInput): SelectionContextResult {
  const { documentLines, selectionStartLine, selectionEndLine, contextLines } = input;
  if (contextLines <= 0) return {};

  const beforeStart = Math.max(0, selectionStartLine - contextLines);
  const beforeLines = documentLines.slice(beforeStart, selectionStartLine);

  const afterEnd = Math.min(documentLines.length, selectionEndLine + 1 + contextLines);
  const afterLines = documentLines.slice(selectionEndLine + 1, afterEnd);

  const result: SelectionContextResult = {};
  if (beforeLines.length > 0) result.contextBefore = beforeLines.join("\n");
  if (afterLines.length > 0) result.contextAfter = afterLines.join("\n");
  return result;
}
