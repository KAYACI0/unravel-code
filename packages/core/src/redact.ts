export interface RedactResult {
  text: string;
  redactedCount: number;
}

const REDACTED = "[REDACTED]";

// Runs first so that secrets assigned to a well-known variable name are masked as a whole,
// preventing the more specific patterns below from re-matching (and double-counting) the same value.
const ASSIGNMENT_PATTERN =
  /\b(password|secret|token|api_key|apiKey|apikey)(\s*[:=]\s*)(["'])(?:(?!\3)[^\n])*\3/gi;

const PEM_BLOCK_PATTERN =
  /-----BEGIN [\s\S]*?PRIVATE KEY-----[\s\S]*?-----END [\s\S]*?PRIVATE KEY-----/g;

const AWS_ACCESS_KEY_PATTERN = /\bAKIA[0-9A-Z]{16}\b/g;

const GITHUB_TOKEN_PATTERN = /\b(?:ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,255})\b/g;

const GENERIC_SK_KEY_PATTERN = /\bsk-(?:ant-)?[A-Za-z0-9_-]{20,}\b/g;

const SLACK_TOKEN_PATTERN = /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g;

const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;

const WHOLE_MATCH_PATTERNS = [
  PEM_BLOCK_PATTERN,
  AWS_ACCESS_KEY_PATTERN,
  GITHUB_TOKEN_PATTERN,
  GENERIC_SK_KEY_PATTERN,
  SLACK_TOKEN_PATTERN,
  JWT_PATTERN,
];

export function redactSecrets(text: string): RedactResult {
  let result = text;
  let redactedCount = 0;

  result = result.replace(ASSIGNMENT_PATTERN, (_match, name: string, op: string, quote: string) => {
    redactedCount += 1;
    return `${name}${op}${quote}${REDACTED}${quote}`;
  });

  for (const pattern of WHOLE_MATCH_PATTERNS) {
    const matches = result.match(pattern);
    if (matches) redactedCount += matches.length;
    result = result.replace(pattern, REDACTED);
  }

  return { text: result, redactedCount };
}
