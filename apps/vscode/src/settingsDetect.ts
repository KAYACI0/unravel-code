// Reports what's actually available on this machine, so the settings panel
// can show real status ("Claude Code v2.1.235 — installed") instead of
// making the user guess whether a setting will work before they try it.
//
// This intentionally stops at "is the binary there and does it run" — it
// does not attempt to verify sign-in, which would mean spending a real
// request. A wrong auth choice still fails loudly and specifically the first
// time someone runs Explain (see errorClassification.ts).

import { spawn } from "node:child_process";
import { resolveClaudeCommand, resolveCodexCommand } from "@unravel-code/core";
import * as vscode from "vscode";
import type { CliStatus, LmModelInfo } from "./settingsProtocol.js";

const VERSION_CHECK_TIMEOUT_MS = 3000;

function detectCli(command: string): Promise<CliStatus> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (status: CliStatus) => {
      if (settled) return;
      settled = true;
      resolve(status);
    };

    let child: ReturnType<typeof spawn>;
    try {
      child = spawn(command, ["--version"], { shell: false, stdio: ["ignore", "pipe", "pipe"] });
    } catch {
      finish({ found: false });
      return;
    }

    const timer = setTimeout(() => {
      child.kill();
      finish({ found: false });
    }, VERSION_CHECK_TIMEOUT_MS);

    let out = "";
    child.stdout?.on("data", (chunk: Buffer) => {
      out += chunk.toString("utf8");
    });
    child.on("error", () => {
      clearTimeout(timer);
      finish({ found: false });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      finish(code === 0 ? { found: true, version: out.trim().slice(0, 80) } : { found: false });
    });
  });
}

async function detectLmModels(): Promise<LmModelInfo[]> {
  try {
    const models = await vscode.lm.selectChatModels();
    // De-duplicate by vendor: the panel lets a user pick a vendor, not an
    // exact model id, so several models from the same vendor collapse to one.
    const byVendor = new Map<string, LmModelInfo>();
    for (const model of models) {
      if (!byVendor.has(model.vendor))
        byVendor.set(model.vendor, { vendor: model.vendor, family: model.family });
    }
    return [...byVendor.values()];
  } catch {
    return [];
  }
}

export interface DetectionResult {
  claudeCode: CliStatus;
  codex: CliStatus;
  lmModels: LmModelInfo[];
}

export async function runDetection(overrides: {
  claudeCodePath?: string | undefined;
  codexPath?: string | undefined;
}): Promise<DetectionResult> {
  const claudeCommand = resolveClaudeCommand({ override: overrides.claudeCodePath });
  const codexCommand = resolveCodexCommand({ override: overrides.codexPath });

  const [claudeCode, codex, lmModels] = await Promise.all([
    detectCli(claudeCommand),
    detectCli(codexCommand),
    detectLmModels(),
  ]);

  return { claudeCode, codex, lmModels };
}
