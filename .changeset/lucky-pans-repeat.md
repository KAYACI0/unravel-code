---
"unravel-code": minor
---

Add `unravelCode.auth: codex`, which runs Unravel on a ChatGPT subscription
through a locally installed OpenAI Codex CLI — no API key. Note that
`codex exec --json` has no incremental text events, so in this mode the answer
appears all at once instead of streaming; Claude Code remains the default.
