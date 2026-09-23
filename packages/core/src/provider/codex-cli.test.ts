import { describe, expect, it } from "vitest";
import { resolveCodexCommand } from "./codex-cli-resolve.js";
import { parseCodexError, parseCodexLine } from "./codex-cli-stream.js";

const completed = (type: string, text: unknown) =>
  JSON.stringify({ type: "item.completed", item: { id: "item_0", type, text } });

describe("parseCodexLine", () => {
  it("reads the text of a completed agent message", () => {
    expect(parseCodexLine(completed("agent_message", "Merhaba"))).toBe("Merhaba");
  });

  it("drops reasoning items so the scratchpad never reaches the panel", () => {
    expect(parseCodexLine(completed("reasoning", "hmm"))).toBeNull();
  });

  it("ignores lifecycle events that carry no answer", () => {
    expect(parseCodexLine(JSON.stringify({ type: "thread.started" }))).toBeNull();
    expect(parseCodexLine(JSON.stringify({ type: "turn.started" }))).toBeNull();
    expect(
      parseCodexLine(JSON.stringify({ type: "turn.completed", usage: { output_tokens: 5 } })),
    ).toBeNull();
  });

  it("ignores item.started and item.updated, which never carry agent text", () => {
    const started = JSON.stringify({ type: "item.started", item: { type: "agent_message" } });
    expect(parseCodexLine(started)).toBeNull();
  });

  it("ignores blank and non-JSON lines instead of throwing", () => {
    expect(parseCodexLine("")).toBeNull();
    expect(parseCodexLine("   ")).toBeNull();
    expect(parseCodexLine("plain diagnostic text")).toBeNull();
    expect(parseCodexLine("{broken")).toBeNull();
  });

  it("ignores an agent message whose text is not a string", () => {
    expect(parseCodexLine(completed("agent_message", 42))).toBeNull();
  });
});

describe("parseCodexError", () => {
  it("reads a top-level error event", () => {
    expect(parseCodexError(JSON.stringify({ type: "error", message: "boom" }))).toBe("boom");
  });

  it("reads a failed turn", () => {
    const line = JSON.stringify({ type: "turn.failed", error: { message: "rate limited" } });
    expect(parseCodexError(line)).toBe("rate limited");
  });

  it("reports a failure even when it carries no message", () => {
    expect(parseCodexError(JSON.stringify({ type: "turn.failed" }))).toBe("");
  });

  it("returns null for successful events", () => {
    expect(parseCodexError(completed("agent_message", "ok"))).toBeNull();
    expect(parseCodexError(JSON.stringify({ type: "turn.completed" }))).toBeNull();
  });
});

describe("resolveCodexCommand", () => {
  const env = { APPDATA: "APPDATA_DIR" } as NodeJS.ProcessEnv;
  const segments = ["APPDATA_DIR", "npm", "@openai", "codex", "codex.exe"];
  const isNpmExe = (path: string) => segments.every((segment) => path.includes(segment));

  it("uses a bare PATH lookup off Windows", () => {
    expect(resolveCodexCommand({ platform: "linux", env, exists: () => true })).toBe("codex");
  });

  it("finds the native exe the npm package ships on Windows", () => {
    const command = resolveCodexCommand({ platform: "win32", env, exists: isNpmExe });
    expect(isNpmExe(command)).toBe(true);
  });

  it("never falls back to codex.cmd, which would require a shell", () => {
    const command = resolveCodexCommand({ platform: "win32", env, exists: () => false });
    expect(command).toBe("codex.exe");
    expect(command).not.toContain(".cmd");
  });

  it("honours an explicit override", () => {
    expect(resolveCodexCommand({ platform: "linux", env, override: " /opt/codex " })).toBe(
      "/opt/codex",
    );
  });
});
