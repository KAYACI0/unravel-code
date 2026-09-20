const JS_REGEX_LITERAL = /^\/(?:\\.|[^/\\\n])+\/[a-z]*$/i;

const PY_REGEX_CALL =
  /\bre\.(?:compile|match|search|fullmatch|findall|finditer|sub|subn|split)\(\s*r?["'](?:\\.|[^"'\\])*["']/;

const URL_LIKE = /^[a-z][a-z0-9+.-]*:\/\//i;

const STRONG_REGEX_HINTS = /\\d|\\w|\\s|\\b|[\\^$|]/;

const REGEX_SPECIAL_CHARS = /[\\^$.|?*+()[\]{}]/g;

export function detectMode(code: string, _languageId?: string): "code" | "regex" {
  const trimmed = code.trim();
  if (!trimmed) return "code";

  if (PY_REGEX_CALL.test(trimmed)) return "regex";

  const lines = trimmed.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length > 1) return "code";

  const line = trimmed;

  if (JS_REGEX_LITERAL.test(line)) return "regex";

  if (/\s/.test(line)) return "code";

  if (URL_LIKE.test(line)) return "code";

  const specialCharCount = (line.match(REGEX_SPECIAL_CHARS) ?? []).length;
  if (STRONG_REGEX_HINTS.test(line) && specialCharCount >= 2) return "regex";

  return "code";
}
