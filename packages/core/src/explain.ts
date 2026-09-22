import { detectMode } from "./mode.js";
import { DEFAULT_MODEL } from "./models.js";
import type { ResolvedLang } from "./prompts/base.js";
import { buildUserMessage } from "./prompts/base.js";
import { buildCodeSystemPrompt } from "./prompts/code.js";
import { buildLegacySystemPrompt } from "./prompts/legacy.js";
import { buildRegexSystemPrompt } from "./prompts/regex.js";
import { createAnthropicProvider } from "./provider/anthropic.js";
import { createClaudeCliProvider } from "./provider/claude-cli.js";
import type { Provider } from "./provider/types.js";
import { redactSecrets } from "./redact.js";
import type { ExplainOptions, ExplainRequest } from "./types.js";

const anthropicProvider: Provider = createAnthropicProvider();

/**
 * "auto" only falls back to the API key when one is actually present —
 * otherwise Claude Code is the better failure, because its error tells the
 * user how to sign in instead of asking for a key they may not have.
 */
function selectProvider(opts: ExplainOptions): Provider {
  const mode = opts.auth ?? "apiKey";
  const useCli = mode === "claudeCode" || (mode === "auto" && !opts.apiKey);
  return useCli ? createClaudeCliProvider({ command: opts.claudeCodePath }) : anthropicProvider;
}

function resolveLang(lang: ExplainRequest["lang"]): ResolvedLang {
  if (lang === "tr" || lang === "en") return lang;
  return "en";
}

export async function* explain(req: ExplainRequest, opts: ExplainOptions): AsyncIterable<string> {
  const redactedCode = redactSecrets(req.code).text;
  const redactedContextBefore = req.contextBefore
    ? redactSecrets(req.contextBefore).text
    : undefined;
  const redactedContextAfter = req.contextAfter ? redactSecrets(req.contextAfter).text : undefined;

  const resolvedMode =
    req.mode && req.mode !== "auto" ? req.mode : detectMode(redactedCode, req.languageId);
  const lang = resolveLang(req.lang);
  const detail = req.detail ?? "detailed";

  const ctx = { lang, detail, languageId: req.languageId };
  const system =
    resolvedMode === "regex"
      ? buildRegexSystemPrompt(ctx)
      : resolvedMode === "legacy"
        ? buildLegacySystemPrompt(ctx)
        : buildCodeSystemPrompt(ctx);

  const userMessage = buildUserMessage({
    code: redactedCode,
    languageId: req.languageId,
    contextBefore: redactedContextBefore,
    contextAfter: redactedContextAfter,
  });

  yield* selectProvider(opts).stream({
    apiKey: opts.apiKey,
    model: req.model ?? DEFAULT_MODEL,
    system,
    userMessage,
    signal: req.signal,
  });
}
