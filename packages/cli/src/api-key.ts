import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_PATH = join(homedir(), ".config", "unravel-code", "config.json");

export async function resolveApiKey(): Promise<string | undefined> {
  const fromEnv = process.env.UNRAVEL_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (fromEnv) return fromEnv;

  let raw: string;
  try {
    raw = await readFile(CONFIG_PATH, "utf8");
  } catch {
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }

  if (!parsed || typeof parsed !== "object") return undefined;
  const apiKey = (parsed as { apiKey?: unknown }).apiKey;
  return typeof apiKey === "string" && apiKey.length > 0 ? apiKey : undefined;
}
