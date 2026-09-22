// Locates the Claude Code executable. See cli-resolve.ts for why Windows needs
// the native .exe rather than the npm .cmd shim.

import type { ResolveOptions } from "./cli-resolve.js";
import { resolveCliCommand } from "./cli-resolve.js";

const CLAUDE: Parameters<typeof resolveCliCommand>[0] = {
  posixName: "claude",
  windowsExeName: "claude.exe",
  npmBinSegments: ["@anthropic-ai", "claude-code", "bin"],
};

export type { ResolveOptions };

export function resolveClaudeCommand(opts: ResolveOptions = {}): string {
  return resolveCliCommand(CLAUDE, opts);
}
