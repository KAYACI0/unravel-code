---
"unravel-code": minor
---

Add `vscodeLm` as a second auth mode: Unravel can run on whatever language
model the editor already provides, including GitHub Copilot's free tier, with
no API key. Claude Code remains the default. Core stays editor-agnostic — the
extension builds the provider and injects it through the new
`ExplainOptions.provider`.
