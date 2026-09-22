// Provider that drives a locally installed Claude Code in headless mode, so the
// user's existing Claude subscription pays for the request and no API key is
// needed. Claude Code owns the credential; Unravel never sees or stores it.
//
// Two deliberate constraints:
//   * `--bare` is NOT used. It would strip hooks, plugins and CLAUDE.md
//     discovery — which we would like — but it also forces API-key-only auth
//     and never reads the OAuth login, defeating the whole point.
//   * The selection travels on stdin, never argv, so it cannot land in a
//     process listing.

import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import {
  AbortedError,
  ClaudeCliAuthError,
  ClaudeCliError,
  ClaudeCliNotFoundError,
} from "../errors.js";
import { resolveClaudeCommand } from "./claude-cli-resolve.js";
import { createLineBuffer, parseResultLine, parseStreamJsonLine } from "./claude-cli-stream.js";
import type { Provider, StreamCompletionRequest } from "./types.js";

/** Tools are irrelevant for an explain-only task; deny them all so a prompt
 * inside the user's code can never reach the filesystem or network. */
const DENIED_TOOLS =
  "Bash Edit Write Read Glob Grep WebFetch WebSearch Task NotebookEdit TodoWrite";

// Thinking is dead weight here: the user wants the explanation, not the model's
// scratchpad, and it delays the first visible word. Measured on Claude Code
// 2.1.235, turning it off moves time-to-first-token from ~3.5s to ~2.0s.
const CLI_SETTINGS = JSON.stringify({ alwaysThinkingEnabled: false });

const AUTH_HINTS = ["not logged in", "authentication", "unauthorized", "/login", "sign in"];

function looksLikeAuthFailure(stderr: string): boolean {
  const haystack = stderr.toLowerCase();
  return AUTH_HINTS.some((hint) => haystack.includes(hint));
}

function buildArgs(req: StreamCompletionRequest): string[] {
  return [
    "--print",
    "--output-format",
    "stream-json",
    "--include-partial-messages",
    "--verbose",
    "--model",
    req.model,
    "--system-prompt",
    req.system,
    "--disallowed-tools",
    DENIED_TOOLS,
    "--disable-slash-commands",
    "--strict-mcp-config",
    "--mcp-config",
    '{"mcpServers":{}}',
    "--settings",
    CLI_SETTINGS,
  ];
}

export function createClaudeCliProvider(options: { command?: string | undefined } = {}): Provider {
  return {
    async *stream(req: StreamCompletionRequest): AsyncGenerator<string> {
      const command = resolveClaudeCommand({ override: options.command });

      const child = spawn(command, buildArgs(req), {
        shell: false,
        // A neutral cwd keeps Claude Code from auto-discovering the user's
        // project CLAUDE.md and folding it into an explanation request.
        cwd: tmpdir(),
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stderr = "";
      let spawnError: NodeJS.ErrnoException | undefined;
      child.stderr.setEncoding("utf8");
      child.stderr.on("data", (chunk: string) => {
        stderr += chunk;
      });
      child.on("error", (err: NodeJS.ErrnoException) => {
        spawnError = err;
      });

      const onAbort = () => child.kill();
      req.signal?.addEventListener("abort", onAbort, { once: true });

      child.stdin.on("error", () => {
        // The child can exit before stdin drains (bad flag, missing auth). The
        // real diagnosis comes from stderr and the exit code, so swallow EPIPE.
      });
      child.stdin.end(req.userMessage, "utf8");

      const buffer = createLineBuffer();
      let sawText = false;
      let resultError: string | undefined;

      try {
        child.stdout.setEncoding("utf8");
        for await (const chunk of child.stdout) {
          for (const line of buffer.push(chunk as string)) {
            const text = parseStreamJsonLine(line);
            if (text !== null) {
              sawText = true;
              yield text;
              continue;
            }
            const result = parseResultLine(line);
            if (result?.isError) resultError = result.message;
          }
        }
        for (const line of buffer.flush()) {
          const text = parseStreamJsonLine(line);
          if (text !== null) {
            sawText = true;
            yield text;
          }
        }
      } finally {
        req.signal?.removeEventListener("abort", onAbort);
      }

      const exitCode = await new Promise<number | null>((resolve) => {
        if (child.exitCode !== null || spawnError) return resolve(child.exitCode);
        child.once("close", resolve);
      });

      if (req.signal?.aborted) throw new AbortedError();
      if (spawnError?.code === "ENOENT") throw new ClaudeCliNotFoundError();
      if (spawnError) throw new ClaudeCliError(spawnError.message);

      if (exitCode !== 0 || resultError !== undefined) {
        if (looksLikeAuthFailure(stderr) || looksLikeAuthFailure(resultError ?? "")) {
          throw new ClaudeCliAuthError();
        }
        throw new ClaudeCliError(resultError ?? stderr);
      }

      // A clean exit that produced nothing usually means the CLI refused before
      // generating — surface it instead of showing the user an empty panel.
      if (!sawText) throw new ClaudeCliError(stderr);
    },
  };
}
