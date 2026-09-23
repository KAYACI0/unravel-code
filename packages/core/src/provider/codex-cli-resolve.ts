// Locates the Codex executable. See cli-resolve.ts for why Windows needs the
// native .exe rather than the npm .cmd shim.

import type { ResolveOptions } from "./cli-resolve.js";
import { resolveCliCommand } from "./cli-resolve.js";

const CODEX: Parameters<typeof resolveCliCommand>[0] = {
  posixName: "codex",
  windowsExeName: "codex.exe",
  npmBinSegments: ["@openai", "codex", "bin"],
};

export type { ResolveOptions };

export function resolveCodexCommand(opts: ResolveOptions = {}): string {
  return resolveCliCommand(CODEX, opts);
}
