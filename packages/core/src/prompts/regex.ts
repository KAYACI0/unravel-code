import { type PromptContext, buildSystemPreamble } from "./base.js";

export type RegexFlavor = "JavaScript" | "Python" | "PCRE";

const PYTHON_LANGUAGE_IDS = new Set(["python", "python2", "python3"]);
const JS_LANGUAGE_IDS = new Set([
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact",
  "js",
  "ts",
  "jsx",
  "tsx",
]);

export function detectRegexFlavor(languageId?: string): RegexFlavor {
  if (!languageId) return "PCRE";
  const id = languageId.toLowerCase();
  if (PYTHON_LANGUAGE_IDS.has(id)) return "Python";
  if (JS_LANGUAGE_IDS.has(id)) return "JavaScript";
  return "PCRE";
}

const INSTRUCTIONS: Record<PromptContext["lang"], (flavor: RegexFlavor) => string> = {
  en: (flavor) =>
    [
      `Explain the regular expression in Markdown. Treat it as ${flavor} flavor unless the pattern itself clearly indicates otherwise.`,
      "1. **Token breakdown** — go through the pattern piece by piece and explain what each part matches.",
      "2. **Capture groups** — for every capture group, state what it captures.",
      "3. **Examples** — give 3 strings that match and 3 strings that do NOT match.",
      '4. **Catastrophic backtracking risk** — call out nested quantifiers or ambiguous alternation that could cause exponential backtracking; say "none apparent" if you don\'t see any.',
    ].join("\n"),
  tr: (flavor) =>
    [
      `Regex ifadesini Markdown olarak açıkla. Aksi açıkça belli olmadıkça ${flavor} flavor'u varsay.`,
      "1. **Token dökümü** — deseni parça parça gez ve her parçanın ne eşleştirdiğini açıkla.",
      "2. **Capture group'lar** — her capture group için ne yakaladığını belirt.",
      "3. **Örnekler** — eşleşen 3 örnek ve eşleşmeyen 3 örnek ver.",
      '4. **Catastrophic backtracking riski** — iç içe quantifier veya belirsiz alternation gibi üstel backtracking\'e yol açabilecek durumları belirt; görmüyorsan "belirgin bir risk yok" de.',
    ].join("\n"),
};

export function buildRegexSystemPrompt(ctx: PromptContext): string {
  const flavor = detectRegexFlavor(ctx.languageId);
  return [buildSystemPreamble(ctx), INSTRUCTIONS[ctx.lang](flavor)].join("\n\n");
}
