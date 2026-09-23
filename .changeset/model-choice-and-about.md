---
"unravel-code": minor
---

Add `claude-opus-5` as a third selectable model (Haiku stays the default and
recommended choice everywhere — it's the cheapest). The Claude model dropdown
in Settings now labels each option by cost tier. `unravelCode.codexModel`
stays free text with a stronger recommendation to leave it blank: Codex's
model lineup isn't something this extension can track, so guessing a
"cheapest" id there risks naming a model that no longer exists.
