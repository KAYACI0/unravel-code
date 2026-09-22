// Parser for Claude Code's `--output-format stream-json` output.
//
// Kept separate from the spawning code so the wire format can be tested without
// launching a process. Each stdout line is one JSON object; we only care about
// text deltas. Thinking deltas are deliberately dropped — they are the model's
// scratchpad, not the explanation the user asked for.

interface TextDelta {
  type: "text_delta";
  text: string;
}

interface ContentBlockDelta {
  type: "content_block_delta";
  delta: TextDelta | { type: string };
}

interface StreamEventLine {
  type: "stream_event";
  event: ContentBlockDelta | { type: string };
}

interface ResultLine {
  type: "result";
  subtype?: string;
  is_error?: boolean;
  result?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Returns the text carried by one stream-json line, or null for every line that
 * does not carry user-visible text (init banners, hook chatter, thinking, usage).
 */
export function parseStreamJsonLine(line: string): string | null {
  const trimmed = line.trim();
  if (trimmed === "") return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    // A partial or non-JSON line is not fatal: the CLI also prints plain
    // diagnostics on stdout in some failure modes. Skip rather than abort.
    return null;
  }

  if (!isRecord(parsed) || parsed.type !== "stream_event") return null;
  const { event } = parsed as unknown as StreamEventLine;
  if (!isRecord(event) || event.type !== "content_block_delta") return null;

  const { delta } = event as ContentBlockDelta;
  if (!isRecord(delta) || delta.type !== "text_delta") return null;

  const { text } = delta as TextDelta;
  return typeof text === "string" ? text : null;
}

/** Reads a terminal `result` line, which is where the CLI reports failures. */
export function parseResultLine(line: string): { isError: boolean; message: string } | null {
  const trimmed = line.trim();
  if (trimmed === "") return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }

  if (!isRecord(parsed) || parsed.type !== "result") return null;
  const result = parsed as unknown as ResultLine;
  return {
    isError: result.is_error === true || result.subtype !== "success",
    message: typeof result.result === "string" ? result.result : "",
  };
}

/**
 * Splits a byte stream into complete lines, holding the trailing partial line
 * until more data arrives. Returns the lines ready to parse.
 */
export function createLineBuffer(): { push(chunk: string): string[]; flush(): string[] } {
  let pending = "";
  return {
    push(chunk: string): string[] {
      pending += chunk;
      const lines = pending.split("\n");
      pending = lines.pop() ?? "";
      return lines;
    },
    flush(): string[] {
      const rest = pending;
      pending = "";
      return rest === "" ? [] : [rest];
    },
  };
}
