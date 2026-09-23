# Contributing

Thanks for taking a look. English or Turkish are both fine, in issues, PRs, and code comments —
though comments in the codebase are written in English.

**[Türkçe için aşağı kaydırın.](#katkı-sağlama)**

## Getting set up

```bash
pnpm install
pnpm build
pnpm test
```

Node 20+ and pnpm 9 (the version is pinned in `packageManager`).

To run the extension from source: open the repo in VS Code and press `F5`. That launches an
Extension Development Host with the local build loaded. Note that the installed copy of Unravel is
disabled in that window, so you are always testing your build.

## Before you push

```bash
pnpm lint && pnpm typecheck && pnpm test
```

All three must be green. Don't commit while any of them is red.

## The rules that matter

**`core` is editor-agnostic.** `packages/core` must never import `vscode`, `@raycast/api`, or any
other editor API. If a provider needs one — as the VS Code Language Model provider does — it lives
in the shell (`apps/vscode`) and is injected through `ExplainOptions.provider`.

**The scope is "explain only".** No refactoring, no writing files, no running commands, no chat.
This is not a limitation waiting to be lifted; it is the product.

**Redaction is not optional.** `redactSecrets()` runs before anything leaves the machine, and
there is no setting to turn it off. Don't add one.

**Credentials never get logged.** Not in errors, not in telemetry (there is none), not in a
message shown to the user. Mask them.

**Don't send the whole file.** The selection plus optional context lines, nothing more.

**Keep modules small.** If a file passes ~200 lines, split it. No `any`. Public APIs carry
explicit types.

**Comments say why, not what.** The code already says what.

## Tests

Anything testable gets a test: mode detection, redaction, prompt builders, CLI argument parsing,
stream parsers. Network calls are mocked.

A useful pattern in this repo: when logic needs an editor or a child process, extract the pure part
into its own module so it can be tested without either. `lmModelPick.ts` and
`claude-cli-stream.ts` both exist for that reason.

If you change a prompt, update at least one snapshot test.

## Commits and releases

Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`.

If your change is user-facing, add a changeset:

```bash
pnpm changeset
```

Pick `unravel-code`, choose patch/minor/major, and commit the generated file. Releases are
described in [RELEASING.md](./RELEASING.md).

## Reporting a security issue

Do not open a public issue for anything that could leak code or credentials. Use
[GitHub's private advisory form](https://github.com/KAYACI0/unravel-code/security/advisories/new).

---

# Katkı Sağlama

Baktığınız için teşekkürler. Issue'larda, PR'larda ve kod yorumlarında İngilizce de Türkçe de
olur — ancak kod tabanındaki yorumlar İngilizce yazılır.

## Kurulum

```bash
pnpm install
pnpm build
pnpm test
```

Node 20+ ve pnpm 9 (sürüm `packageManager` alanında sabitli).

Eklentiyi kaynaktan çalıştırmak için: repoyu VS Code'da açıp `F5`'e basın. Yerel derlemenin yüklü
olduğu bir Extension Development Host açılır. O pencerede kurulu Unravel kopyası devre dışı kalır,
yani her zaman kendi derlemenizi test edersiniz.

## Push'tan önce

```bash
pnpm lint && pnpm typecheck && pnpm test
```

Üçü de yeşil olmalı. Herhangi biri kırmızıyken commit atmayın.

## Önemli kurallar

**`core` editörden bağımsızdır.** `packages/core` asla `vscode`, `@raycast/api` ya da başka bir
editör API'sini import etmemeli. Bir sağlayıcının buna ihtiyacı varsa — VS Code Language Model
sağlayıcısında olduğu gibi — kabukta (`apps/vscode`) yaşar ve `ExplainOptions.provider` ile
enjekte edilir.

**Kapsam "sadece açıkla".** Refactor yok, dosyaya yazma yok, komut çalıştırma yok, sohbet yok. Bu,
kaldırılmayı bekleyen bir kısıt değil; ürünün kendisi.

**Maskeleme isteğe bağlı değil.** `redactSecrets()` makineden bir şey çıkmadan önce çalışır ve
kapatacak bir ayar yoktur. Eklemeyin.

**Kimlik bilgileri loglanmaz.** Hatalarda değil, telemetride değil (zaten yok), kullanıcıya
gösterilen mesajda değil. Maskeleyin.

**Tüm dosyayı göndermeyin.** Seçim, artı isteğe bağlı çevre satırları — fazlası yok.

**Modülleri küçük tutun.** Bir dosya ~200 satırı geçiyorsa bölün. `any` yok. Public API'ler açık
tip taşır.

**Yorumlar "neden"i anlatır, "ne"yi değil.** "Ne"yi kod zaten söylüyor.

## Testler

Test edilebilen her şey test edilir: mod algılama, maskeleme, prompt üreticiler, CLI argüman
ayrıştırma, stream ayrıştırıcılar. Ağ çağrıları mock'lanır.

Bu repoda işe yarayan bir kalıp: mantık bir editöre ya da child process'e ihtiyaç duyuyorsa, saf
kısmı ayrı bir modüle çıkarın ki ikisi olmadan test edilebilsin. `lmModelPick.ts` ve
`claude-cli-stream.ts` tam da bu yüzden ayrı duruyor.

Bir prompt'u değiştirirseniz en az bir snapshot testini güncelleyin.

## Commit'ler ve sürümler

Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`.

Değişiklik kullanıcıya yansıyorsa bir changeset ekleyin:

```bash
pnpm changeset
```

`unravel-code` paketini seçin, patch/minor/major belirleyin ve üretilen dosyayı commit'leyin.
Sürüm çıkarma süreci [RELEASING.md](./RELEASING.md) içinde.

## Güvenlik sorunu bildirme

Kod ya da kimlik bilgisi sızdırabilecek bir durum için herkese açık issue açmayın.
[GitHub'ın özel advisory formunu](https://github.com/KAYACI0/unravel-code/security/advisories/new)
kullanın.
