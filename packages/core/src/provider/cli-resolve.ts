// Shared executable lookup for the CLI-backed providers.
//
// Why it exists: on Windows an npm-installed CLI is a `.cmd` shim, and Node
// refuses to spawn a `.cmd` without `shell: true` (EINVAL since the
// CVE-2024-27980 fix). Going through a shell would re-parse our arguments, so
// instead we find the native `.exe` the npm package ships and spawn that
// directly. On macOS/Linux the bare name is a real executable, so a PATH
// lookup is safe.

import { existsSync } from "node:fs";
import { join } from "node:path";

export interface CliSpec {
  /** Command name on macOS/Linux, resolved through PATH. */
  posixName: string;
  /** Native executable name on Windows, e.g. "claude.exe". */
  windowsExeName: string;
  /** Path segments under an npm prefix, e.g. ["@anthropic-ai", "claude-code", "bin"]. */
  npmBinSegments: string[];
}

export interface ResolveOptions {
  platform?: NodeJS.Platform;
  env?: NodeJS.ProcessEnv;
  exists?: (path: string) => boolean;
  override?: string | undefined;
}

function windowsCandidates(spec: CliSpec, env: NodeJS.ProcessEnv): string[] {
  const underNpmPrefix = (prefix: string) =>
    join(prefix, "node_modules", ...spec.npmBinSegments, spec.windowsExeName);

  const candidates: string[] = [];
  if (env.APPDATA) candidates.push(underNpmPrefix(join(env.APPDATA, "npm")));
  if (env.LOCALAPPDATA) {
    candidates.push(join(env.LOCALAPPDATA, "Programs", spec.posixName, spec.windowsExeName));
  }
  if (env.USERPROFILE) {
    candidates.push(join(env.USERPROFILE, ".local", "bin", spec.windowsExeName));
    candidates.push(underNpmPrefix(join(env.USERPROFILE, "AppData", "Roaming", "npm")));
  }
  return candidates;
}

/**
 * Returns the command to spawn. Always safe for `spawn(cmd, args,
 * { shell: false })`; a bare name means "let the OS search PATH".
 */
export function resolveCliCommand(spec: CliSpec, opts: ResolveOptions = {}): string {
  const platform = opts.platform ?? process.platform;
  const env = opts.env ?? process.env;
  const exists = opts.exists ?? existsSync;

  if (opts.override && opts.override.trim() !== "") return opts.override.trim();
  if (platform !== "win32") return spec.posixName;

  for (const candidate of windowsCandidates(spec, env)) {
    if (exists(candidate)) return candidate;
  }

  // Last resort: a native .exe already on PATH. Deliberately not the .cmd
  // shim, which would need a shell.
  return spec.windowsExeName;
}
