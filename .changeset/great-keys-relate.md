---
"unravel-code": minor
---

Reach a ChatGPT subscription without installing the Codex CLI: the official
ChatGPT extension registers its models with VS Code's Language Model API, and
the new `unravelCode.lmPreferred` setting picks which registered provider to
use (`openai`, `copilot`, `claude`, …) in `vscodeLm` mode.
