// Provider that drives a locally installed OpenAI Codex CLI, so a ChatGPT
// subscription pays for the request and no API key is needed. Codex owns the
// credential (stored in $CODEX_HOME by `codex login`); Unravel never sees it.
//
// Known limitation: `codex exec --json` does not emit incremental text -- the
// reply arrives whole in a single `item.completed` event. This provider
// therefore yields exactly one chunk, at the end. That is a real regression
// against the streaming requirement, and the reason Claude Code remains the
// default. The Codex App Server protocol does expose agent-message deltas and
// would be the upgrade path.

import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import {
  AbortedError,
  CodexCliAuthError,
  CodexCliError,
  CodexCliNotFoundError,
} from "../errors.js";
import { createLineBuffer } from "./claude-cli-stream.js";
import { resolveCodexCommand } from "./codex-cli-resolve.js";
import { parseCodexError, parseCodexLine } from "./codex-cli-stream.js";
import type { Provider, StreamCompletionRequest } from "./types.js";

const AUTH_HINTS = ["not logged in", "login", "unauthorized", "authenticate", "sign in", "401"];

function looksLikeAuthFailure(text: string): boolean {
  const haystack = text.toLowerCase();
  return AUTH_HINTS.some((hint) => haystack.includes(hint));
}

function buildArgs(model: string | undefined): string[] {
  const args = [
    "exec",
    // Reads the whole prompt from stdin, so nothing user-derived hits argv.
    "-",
    "--json",
    // Explaining code needs no tools; read-only plus never-approve keeps the
    // run from touching anything or stalling on an approval prompt.
    "--sandbox",
    "read-only",
    "--ask-for-approval",
    "never",
    // The neutral cwd below is not a git repo, which codex otherwise refuses.
    "--skip-git-repo-check",
    // Do not leave the user's selection in a session file on disk.
    "--ephemeral",
  ];
  // Codex's own configured model is used when the setting is blank, since the
  // Claude model ids in unravelCode.model mean nothing here.
  if (model && model.trim() !== "") args.push("--model", model.trim());
  return args;
}

export function createCodexCliProvider(
  options: { command?: string | undefined; model?: string | undefined } = {},
): Provider {
  return {
    async *stream(req: StreamCompletionRequest): AsyncGenerator<string> {
      const command = resolveCodexCommand({ override: options.command });

      const child = spawn(command, buildArgs(options.model), {
        shell: false,
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

      // There is no system role in codex exec, so the two prompts are joined
      // into one turn. The system prompt already frames the selection as data
      // rather than instructions, which is what keeps that safe.
      child.stdin.on("error", () => {
        // The child can exit before stdin drains; stderr and the exit code
        // carry the real diagnosis.
      });
      child.stdin.end(`${req.system}\n\n${req.userMessage}`, "utf8");

      const buffer = createLineBuffer();
      let answer = "";
      let eventError: string | undefined;

      const consume = (line: string) => {
        const text = parseCodexLine(line);
        if (text !== null) {
          answer += answer === "" ? text : `\n\n${text}`;
          return;
        }
        const failure = parseCodexError(line);
        if (failure !== null) eventError = failure;
      };

      try {
        child.stdout.setEncoding("utf8");
        for await (const chunk of child.stdout) {
          for (const line of buffer.push(chunk as string)) consume(line);
        }
        for (const line of buffer.flush()) consume(line);
      } finally {
        req.signal?.removeEventListener("abort", onAbort);
      }

      const exitCode = await new Promise<number | null>((resolve) => {
        if (child.exitCode !== null || spawnError) return resolve(child.exitCode);
        child.once("close", resolve);
      });

      if (req.signal?.aborted) throw new AbortedError();
      if (spawnError?.code === "ENOENT") throw new CodexCliNotFoundError();
      if (spawnError) throw new CodexCliError(spawnError.message);

      if (exitCode !== 0 || eventError !== undefined) {
        if (looksLikeAuthFailure(stderr) || looksLikeAuthFailure(eventError ?? "")) {
          throw new CodexCliAuthError();
        }
        throw new CodexCliError(eventError ?? stderr);
      }

      if (answer === "") throw new CodexCliError(stderr);
      yield answer;
    },
  };
}
