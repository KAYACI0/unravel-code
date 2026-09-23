<p align="center">
  <img src=".github/assets/banner.png" alt="Unravel Code" width="100%">
</p>

<p align="center">
  <strong>Select code you don't understand. Read the explanation.</strong><br>
  No API key, no signup — it runs on the Claude or ChatGPT subscription you already have.
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#privacy">Privacy</a> ·
  <a href="#development">Development</a> ·
  <a href="#türkçe">Türkçe</a>
</p>

---

Unravel explains a selected block of code, a regex, or a piece of legacy code — step by step, in
Turkish or English, streamed into a side panel in VS Code. It is deliberately narrow: it
**explains only**. It will not refactor your code, write files, or run commands.

## Quick start

Install the extension, then select code and press `Ctrl+Alt+U` (macOS: `Cmd+Alt+U`).

Out of the box it uses [Claude Code](https://claude.com/claude-code) if you have it installed and
signed in, so your existing Claude subscription covers the cost and there is no key to manage.
Other options:

| You have | Set `unravelCode.auth` to | Notes |
| --- | --- | --- |
| A Claude subscription | `claudeCode` *(default)* | Install Claude Code, run `claude` once to sign in. |
| A ChatGPT subscription | `vscodeLm` + `lmPreferred: openai` | Install the official `openai.chatgpt` extension and sign in. |
| Nothing — want free | `vscodeLm` | GitHub Copilot's free tier works; 50 chat requests/month. |
| An Anthropic API key | `apiKey` | Fastest path. `Unravel: Set API Key` stores it in `SecretStorage`. |

Full setup and settings: **[apps/vscode/README.md](./apps/vscode/README.md)**.

## What it does

**Reading someone else's code.** What a function you inherited actually does, what it touches, how
control flows through it.

**Untangling a regex.** Breaks the pattern into pieces, explains capture groups, gives matching and
non-matching examples, and flags catastrophic backtracking.

**Legacy code you're afraid to touch.** What the code was probably meant to do, and what to check
before changing it.

The mode is detected from the selection; you can override it in the panel without re-selecting.

## How it works

One editor-agnostic core, with thin shells around it.

```
unravel-code/
├─ packages/
│  ├─ core/     # prompts, mode detection, secret redaction, providers
│  └─ cli/      # `unravel` command: stdin → stdout
└─ apps/
   ├─ vscode/   # VS Code extension (current focus)
   ├─ raycast/  # (later)
   └─ alfred/   # (later)
```

`core` never imports an editor API. Credentials are reached through swappable providers:

| Provider | Credential | Streams |
| --- | --- | --- |
| Claude Code CLI | Your Claude subscription | Yes |
| VS Code Language Model API | Whatever the editor provides (ChatGPT extension, Copilot) | Yes |
| Codex CLI | Your ChatGPT subscription | No — `codex exec --json` has no delta events |
| Anthropic SDK | Your API key | Yes |

The VS Code Language Model provider lives in `apps/vscode`, not `core`, because `core` cannot
import `vscode`; the shell builds it and injects it through `ExplainOptions.provider`.

## Privacy

- **Only the selection leaves**, plus an optional ±N lines of context (default 5, `0` disables).
- **Secrets are masked before sending** — API keys, tokens, private keys, `password=`. The panel
  reports how many values were redacted. **This cannot be turned off.**
- **No telemetry, no backend.** Requests go straight to the provider you chose.
- **Your code is never written to disk.** In the CLI-backed modes the selection goes over stdin,
  never as a command-line argument, so it does not appear in a process listing. Those modes also
  disable tools and MCP servers and run in a neutral working directory.
- **API keys live only in `SecretStorage`** — never in `settings.json`, the repo, or a log.

Your code does go to a third-party model provider. That is the trade; it is stated plainly here
and in the extension listing.

## CLI

`unravel` reads code from stdin and streams the explanation to stdout.

```bash
echo 'const x = a?.b ?? c' | unravel --lang tr --detail brief
unravel --mode regex --lang en < pattern.txt
```

| Flag | Values | Default |
| --- | --- | --- |
| `--mode` | `auto`, `code`, `regex`, `legacy` | `auto` |
| `--lang` | `auto`, `tr`, `en` | `auto` (resolves to `en`) |
| `--detail` | `brief`, `detailed` | `detailed` |
| `--model` | any model id | core's default |
| `--language-id` | `typescript`, `python`, … | — |
| `--json` | prints `{"text": "..."}` on one line | off |
| `-h`, `--help` | prints usage | — |

The CLI looks for an API key in `UNRAVEL_API_KEY`, then `ANTHROPIC_API_KEY`, then the `apiKey`
field of `~/.config/unravel-code/config.json`. Without one it writes a clear error to stderr and
exits `1`. Explanations go only to stdout, errors only to stderr. `Ctrl+C` cancels (exit `130`).

## Development

```bash
pnpm install
pnpm build       # build all packages
pnpm test        # vitest
pnpm lint        # biome check
pnpm typecheck   # tsc --noEmit everywhere
```

`pnpm lint && pnpm typecheck && pnpm test` must be green before a commit. See
[CONTRIBUTING.md](./CONTRIBUTING.md) for the workflow and [RELEASING.md](./RELEASING.md) for how
versions ship.

## License

MIT — see [LICENSE](./LICENSE).

---

# Türkçe

**Anlamadığınız kodu seçin, açıklamasını okuyun.** API key yok, hesap açma yok — zaten sahip
olduğunuz Claude veya ChatGPT aboneliğiyle çalışır.

Unravel; seçtiğiniz kod bloğunu, bir regex'i ya da elinize geçmiş legacy kodu adım adım açıklar.
Türkçe veya İngilizce, VS Code'da yan panele akarak. Kapsamı bilerek dardır: **sadece açıklar.**
Kodunuzu refactor etmez, dosyaya yazmaz, komut çalıştırmaz.

## Hızlı başlangıç

Eklentiyi kurun, kod seçin ve `Ctrl+Alt+U` (macOS: `Cmd+Alt+U`) tuşlarına basın.

Kutudan çıktığı hâliyle, kuruluysa [Claude Code](https://claude.com/claude-code)'u kullanır; yani
mevcut Claude aboneliğiniz masrafı karşılar ve yönetmeniz gereken bir key olmaz. Diğer seçenekler:

| Elinizde ne var | `unravelCode.auth` değeri | Not |
| --- | --- | --- |
| Claude aboneliği | `claudeCode` *(varsayılan)* | Claude Code'u kurun, bir kez `claude` çalıştırıp giriş yapın. |
| ChatGPT aboneliği | `vscodeLm` + `lmPreferred: openai` | Resmî `openai.chatgpt` eklentisini kurup giriş yapın. |
| Hiçbiri — ücretsiz olsun | `vscodeLm` | GitHub Copilot ücretsiz katmanı yeterli; ayda 50 chat isteği. |
| Anthropic API key | `apiKey` | En hızlı yol. `Unravel: Set API Key` key'i `SecretStorage`'a koyar. |

Kurulumun tamamı ve ayarlar: **[apps/vscode/README.md](./apps/vscode/README.md)**.

## Ne yapar

**Başkasının kodunu okurken.** Devraldığınız fonksiyon ne yapıyor, nelere dokunuyor, akış nasıl
ilerliyor.

**Regex çözerken.** Deseni parçalara ayırır, capture group'ları açıklar, eşleşen ve eşleşmeyen
örnekler verir, catastrophic backtracking riskini işaretler.

**Dokunmaya çekindiğiniz legacy kodda.** Kodun muhtemelen ne yapmak istediğini ve değiştirmeden
önce nelere bakmanız gerektiğini anlatır.

Mod seçime bakılarak algılanır; panelden değiştirebilirsiniz, yeniden seçim yapmanız gerekmez.

## Nasıl çalışır

Editörden bağımsız tek bir çekirdek, etrafında ince kabuklar. `core` hiçbir editör API'sini import
etmez. Kimlik bilgisine değiştirilebilir sağlayıcılar üzerinden erişilir:

| Sağlayıcı | Kimlik | Akış |
| --- | --- | --- |
| Claude Code CLI | Claude aboneliğiniz | Var |
| VS Code Language Model API | Editörün sunduğu model (ChatGPT eklentisi, Copilot) | Var |
| Codex CLI | ChatGPT aboneliğiniz | Yok — `codex exec --json` delta olayı vermiyor |
| Anthropic SDK | API key'iniz | Var |

VS Code Language Model sağlayıcısı `core`'da değil `apps/vscode`'da yaşar; çünkü `core`, `vscode`
modülünü import edemez. Kabuk onu kurar ve `ExplainOptions.provider` ile enjekte eder.

## Gizlilik

- **Yalnızca seçim gider**, artı isteğe bağlı ±N satır çevre kod (varsayılan 5, `0` kapatır).
- **Secret'lar gönderilmeden maskelenir** — API key, token, private key, `password=`. Panel kaç
  değerin maskelendiğini yazar. **Bu adım kapatılamaz.**
- **Telemetri ve backend yoktur.** İstek doğrudan seçtiğiniz sağlayıcıya gider.
- **Kodunuz diske yazılmaz.** CLI tabanlı modlarda seçim stdin ile verilir, komut satırı argümanı
  olarak değil; yani process listesinde görünmez. O modlarda araçlar ve MCP sunucuları kapatılır,
  istek nötr bir çalışma dizininde koşar.
- **API key yalnızca `SecretStorage`'da durur** — `settings.json`'a, repoya veya log'a asla yazılmaz.

Kodunuz üçüncü taraf bir model sağlayıcısına gidiyor. Takas budur; burada da eklenti sayfasında da
açıkça yazıyor.

## CLI

`unravel` stdin'den kod okur, açıklamayı stdout'a stream eder.

```bash
echo 'const x = a?.b ?? c' | unravel --lang tr --detail brief
unravel --mode regex --lang en < pattern.txt
```

| Bayrak | Değerler | Varsayılan |
| --- | --- | --- |
| `--mode` | `auto`, `code`, `regex`, `legacy` | `auto` |
| `--lang` | `auto`, `tr`, `en` | `auto` (`en`'e çözümlenir) |
| `--detail` | `brief`, `detailed` | `detailed` |
| `--model` | herhangi bir model id | core'un varsayılanı |
| `--language-id` | `typescript`, `python`, … | — |
| `--json` | çıktıyı `{"text": "..."}` olarak tek satırda basar | kapalı |
| `-h`, `--help` | kullanım bilgisini basar | — |

CLI key'i şu sırayla arar: `UNRAVEL_API_KEY`, `ANTHROPIC_API_KEY`, sonra
`~/.config/unravel-code/config.json` içindeki `apiKey` alanı. Bulamazsa stderr'e net bir hata
yazıp `1` ile çıkar. Açıklama yalnızca stdout'a, hatalar yalnızca stderr'e gider. `Ctrl+C` isteği
iptal eder (çıkış kodu `130`).

## Geliştirme

```bash
pnpm install
pnpm build       # tüm paketleri derle
pnpm test        # vitest
pnpm lint        # biome check
pnpm typecheck   # her yerde tsc --noEmit
```

Commit öncesi `pnpm lint && pnpm typecheck && pnpm test` yeşil olmalı. Çalışma şekli için
[CONTRIBUTING.md](./CONTRIBUTING.md), sürüm çıkarma için [RELEASING.md](./RELEASING.md).

## Lisans

MIT — bkz. [LICENSE](./LICENSE).
