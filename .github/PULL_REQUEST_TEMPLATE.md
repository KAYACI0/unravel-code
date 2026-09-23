<!--
English or Turkish, either is fine. / İngilizce ya da Türkçe, ikisi de olur.
-->

## What this changes / Ne değişiyor

<!-- One or two sentences. Why, not just what. / Bir iki cümle. Sadece ne değil, neden. -->

## How it was verified / Nasıl doğrulandı

<!--
What you actually ran, not what should work.
Gerçekten ne çalıştırdınız — çalışması gerekeni değil.
-->

- [ ] `pnpm lint && pnpm typecheck && pnpm test` is green
- [ ] Tried it in the editor (which auth mode?) / Editörde denendi (hangi kimlik modunda?)

## Checklist

- [ ] A changeset is included if this is user-facing (`pnpm changeset`)
- [ ] Prompt changes come with an updated snapshot test
- [ ] No API key, token, or user code in the diff, logs, or error messages
- [ ] `core` still imports no editor API (`vscode`, `@raycast/api`, …)
- [ ] Scope is still "explain only" — no refactoring, writing, or command execution
