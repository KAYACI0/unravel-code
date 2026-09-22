// Locates the Claude Code executable.
//
// Why this exists: on Windows the npm shim is `claude.cmd`, and Node refuses to
// spawn a `.cmd` without `shell: true` (EINVAL since the CVE-2024-27980 fix).
// Running through a shell would re-parse our arguments — and the system prompt
// is an argument — so we resolve the native `claude.exe` that the npm package
// ships and spawn it directly with `shell: false`. No shell, no metacharacter
// parsing, nothing to escape.
//
// On macOS/Linux `claude` is a real executable, so a bare PATH lookup is safe.

import { existsSync } from "node:fs";
import { join } from "node:path";

const NPM_PACKAGE_BIN = join("node_modules", "@anthropic-ai", "claude-code", "bin", "claude.exe");

function windowsCandidates(env: NodeJS.ProcessEnv): string[] {
  const candidates: string[] = [];
  if (env.APPDATA) candidates.push(join(env.APPDATA, "npm", NPM_PACKAGE_BIN));
  if (env.LOCALAPPDATA) {
    candidates.push(join(env.LOCALAPPDATA, "Programs", "claude", "claude.exe"));
  }
  if (env.USERPROFILE) {
    candidates.push(join(env.USERPROFILE, ".local", "bin", "claude.exe"));
    candidates.push(join(env.USERPROFILE, "AppData", "Roaming", "npm", NPM_PACKAGE_BIN));
  }
  return candidates;
}

export interface ResolveOptions {
  platform?: NodeJS.Platform;
  env?: NodeJS.ProcessEnv;
  exists?: (path: string) => boolean;
  override?: string | undefined;
}

/**
 * Returns the command to spawn. Always safe to pass to `spawn(cmd, args,
 * { shell: false })`; a bare name means "let the OS search PATH".
 */
export function resolveClaudeCommand(opts: ResolveOptions = {}): string {
  const platform = opts.platform ?? process.platform;
  const env = opts.env ?? process.env;
  const exists = opts.exists ?? existsSync;

  if (opts.override && opts.override.trim() !== "") return opts.override.trim();
  if (platform !== "win32") return "claude";

  for (const candidate of windowsCandidates(env)) {
    if (exists(candidate)) return candidate;
  }

  // Last resort: a native claude.exe already on PATH. Deliberately not
  // claude.cmd — that would need a shell.
  return "claude.exe";
}
