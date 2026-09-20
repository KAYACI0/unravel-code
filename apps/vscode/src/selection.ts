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

export const MAX_SELECTION_LENGTH = 20_000;

export function validateSelectionLength(
  length: number,
  max: number = MAX_SELECTION_LENGTH,
): string | undefined {
  if (length === 0) return "Select some code first.";
  if (length > max) {
    return `Selection is too large (${length} characters, limit is ${max}). Select a smaller range.`;
  }
  return undefined;
}

export function getCodePreview(code: string, maxLines = 3): string {
  const lines = code.split("\n");
  const preview = lines.slice(0, maxLines).join("\n");
  return lines.length > maxLines ? `${preview}\n…` : preview;
}
