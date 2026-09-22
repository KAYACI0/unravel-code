import { describe, expect, it } from "vitest";
import { resolveClaudeCommand } from "./claude-cli-resolve.js";
import { createLineBuffer, parseResultLine, parseStreamJsonLine } from "./claude-cli-stream.js";

const delta = (text: string) =>
  JSON.stringify({
    type: "stream_event",
    event: { type: "content_block_delta", delta: { type: "text_delta", text } },
  });

describe("parseStreamJsonLine", () => {
  it("returns the text of a text_delta", () => {
    expect(parseStreamJsonLine(delta("merhaba"))).toBe("merhaba");
  });

  it("preserves whitespace-only deltas", () => {
    expect(parseStreamJsonLine(delta(" "))).toBe(" ");
  });

  it("drops thinking deltas so the scratchpad never reaches the panel", () => {
    const line = JSON.stringify({
      type: "stream_event",
      event: {
        type: "content_block_delta",
        delta: { type: "thinking_delta", thinking: "hmm" },
      },
    });
    expect(parseStreamJsonLine(line)).toBeNull();
  });

  it("ignores init, hook and status chatter", () => {
    expect(parseStreamJsonLine(JSON.stringify({ type: "system", subtype: "init" }))).toBeNull();
    expect(
      parseStreamJsonLine(JSON.stringify({ type: "system", subtype: "hook_started" })),
    ).toBeNull();
    expect(parseStreamJsonLine(JSON.stringify({ type: "assistant" }))).toBeNull();
  });

  it("ignores blank and non-JSON lines instead of throwing", () => {
    expect(parseStreamJsonLine("")).toBeNull();
    expect(parseStreamJsonLine("   ")).toBeNull();
    expect(parseStreamJsonLine("not json at all")).toBeNull();
    expect(parseStreamJsonLine("{broken")).toBeNull();
  });

  it("ignores a text_delta whose text is not a string", () => {
    const line = JSON.stringify({
      type: "stream_event",
      event: { type: "content_block_delta", delta: { type: "text_delta", text: 42 } },
    });
    expect(parseStreamJsonLine(line)).toBeNull();
  });
});

describe("parseResultLine", () => {
  it("reads a success result", () => {
    const line = JSON.stringify({ type: "result", subtype: "success", is_error: false });
    expect(parseResultLine(line)).toEqual({ isError: false, message: "" });
  });

  it("reads an error result with its message", () => {
    const line = JSON.stringify({
      type: "result",
      subtype: "error_during_execution",
      is_error: true,
      result: "boom",
    });
    expect(parseResultLine(line)).toEqual({ isError: true, message: "boom" });
  });

  it("treats a non-success subtype as an error", () => {
    const line = JSON.stringify({ type: "result", subtype: "error_max_turns" });
    expect(parseResultLine(line)).toEqual({ isError: true, message: "" });
  });

  it("returns null for other line types", () => {
    expect(parseResultLine(delta("x"))).toBeNull();
  });
});

describe("createLineBuffer", () => {
  it("holds a partial line until its newline arrives", () => {
    const buffer = createLineBuffer();
    expect(buffer.push('{"a":')).toEqual([]);
    expect(buffer.push('1}\n{"b":2}\n')).toEqual(['{"a":1}', '{"b":2}']);
    expect(buffer.flush()).toEqual([]);
  });

  it("flushes a trailing line that never got a newline", () => {
    const buffer = createLineBuffer();
    expect(buffer.push("tail")).toEqual([]);
    expect(buffer.flush()).toEqual(["tail"]);
    expect(buffer.flush()).toEqual([]);
  });

  it("reassembles a delta split across chunks", () => {
    const buffer = createLineBuffer();
    const line = delta("bolunmus");
    const mid = Math.floor(line.length / 2);
    expect(buffer.push(line.slice(0, mid))).toEqual([]);
    const lines = buffer.push(`${line.slice(mid)}\n`);
    expect(lines.map(parseStreamJsonLine)).toEqual(["bolunmus"]);
  });
});

describe("resolveClaudeCommand", () => {
  // Paths are compared by segment, not by literal string: path.join emits
  // backslashes on Windows and forward slashes in CI on Linux.
  const env = { APPDATA: "APPDATA_DIR" } as NodeJS.ProcessEnv;
  const segments = ["APPDATA_DIR", "npm", "@anthropic-ai", "claude-code", "claude.exe"];
  const isNpmExe = (path: string) => segments.every((segment) => path.includes(segment));

  it("uses a bare PATH lookup off Windows", () => {
    expect(resolveClaudeCommand({ platform: "darwin", env, exists: () => true })).toBe("claude");
    expect(resolveClaudeCommand({ platform: "linux", env, exists: () => true })).toBe("claude");
  });

  it("finds the native exe the npm package ships on Windows", () => {
    const command = resolveClaudeCommand({ platform: "win32", env, exists: isNpmExe });
    expect(isNpmExe(command)).toBe(true);
  });

  it("never falls back to claude.cmd, which would require a shell", () => {
    const command = resolveClaudeCommand({ platform: "win32", env, exists: () => false });
    expect(command).toBe("claude.exe");
    expect(command).not.toContain(".cmd");
  });

  it("honours an explicit override on every platform", () => {
    expect(
      resolveClaudeCommand({ platform: "win32", env, exists: () => true, override: "D:/c.exe" }),
    ).toBe("D:/c.exe");
    expect(resolveClaudeCommand({ platform: "linux", env, override: "  /opt/claude  " })).toBe(
      "/opt/claude",
    );
  });

  it("ignores a blank override", () => {
    expect(resolveClaudeCommand({ platform: "linux", env, override: "   " })).toBe("claude");
  });
});
