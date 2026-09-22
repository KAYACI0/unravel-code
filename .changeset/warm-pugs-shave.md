---
"unravel-code": minor
---

Run on a Claude subscription instead of an API key. The new `unravelCode.auth`
setting (`auto` | `claudeCode` | `apiKey`) can delegate requests to a locally
installed Claude Code, so no key is stored and the user's subscription pays.
`auto` keeps using a stored key when there is one, so existing setups are
unchanged.
