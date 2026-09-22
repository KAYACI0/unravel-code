// Parser for `codex exec --json`, which emits newline-delimited JSON events.
//
// Unlike Claude Code, this stream carries NO incremental text: an
// `agent_message` item only ever appears as `item.completed` with the whole
// reply in `item.text`. So there is nothing to stream token by token here --
// the provider yields one chunk at the end. Kept separate from the spawning
// code so the wire format can be tested without launching a process.

interface CompletedItem {
  id?: string;
  type?: string;
  text?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parse(line: string): Record<string, unknown> | undefined {
  const trimmed = line.trim();
  if (trimmed === "") return undefined;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return isRecord(parsed) ? parsed : undefined;
  } catch {
    // codex also writes plain diagnostics to stdout in some failure modes.
    return undefined;
  }
}

/**
 * Returns the assistant text carried by one event line, or null for every line
 * that is not a completed agent message. `reasoning` items are dropped on
 * purpose: they are the model's scratchpad, not the explanation.
 */
export function parseCodexLine(line: string): string | null {
  const event = parse(line);
  if (!event || event.type !== "item.completed") return null;

  const item = event.item;
  if (!isRecord(item)) return null;

  const { type, text } = item as CompletedItem;
  if (type !== "agent_message") return null;
  return typeof text === "string" ? text : null;
}

/** Reads the terminal `turn.failed` / `error` events codex uses for failures. */
export function parseCodexError(line: string): string | null {
  const event = parse(line);
  if (!event) return null;

  if (event.type === "error") {
    const { message } = event as { message?: unknown };
    return typeof message === "string" ? message : "";
  }

  if (event.type === "turn.failed") {
    const error = event.error;
    if (isRecord(error)) {
      const { message } = error as { message?: unknown };
      return typeof message === "string" ? message : "";
    }
    return "";
  }

  return null;
}
