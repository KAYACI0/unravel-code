# Changelog

All notable changes to the "Unravel Code" extension are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.0.1] - 2026-09-20

### Added

- `Unravel: Explain Selection`, `Unravel: Explain as Regex`, `Unravel: Set API Key`,
  and `Unravel: Clear API Key` commands.
- Editor context menu entries and a `Ctrl+Alt+U` / `Cmd+Alt+U` keybinding, both gated
  on having an active selection.
- Streamed explanations in a reusable webview panel (Markdown rendered via
  markdown-it, no syntax highlighter), with Stop/Copy actions and in-panel
  Mode/Detail switches that re-run the same selection.
- `unravelCode.language`, `unravelCode.detail`, `unravelCode.model`, and
  `unravelCode.contextLines` settings.
- Secret redaction before any code leaves the machine, with a visible
  "N secret values redacted" note when it fires.
- API key storage restricted to VS Code's `SecretStorage`; a one-time privacy
  notice before the first request.
- Validation for empty and overly large (>20,000 characters) selections.

[Unreleased]: https://github.com/KAYACI0/unravel-code/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/KAYACI0/unravel-code/releases/tag/v0.0.1
