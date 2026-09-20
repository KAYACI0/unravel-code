# unravel-code

Seçili kodu veya regex ifadesini Türkçe ya da İngilizce olarak adım adım açıklayan bir araç.

## Gizlilik uyarısı

Seçtiğiniz kod açıklama üretmek için Anthropic API'sine gönderilir. Gönderimden önce
bilinen secret kalıpları (API key, token, private key, `password=` vb.) maskelenir,
ancak seçtiğiniz kodun içeriğini üçüncü taraf bir servise gönderdiğinizi unutmayın.
Backend veya telemetri yoktur; kendi Anthropic API key'inizi kullanırsınız.

## Mimari

```
unravel-code/
├─ packages/
│  ├─ core/     # prompt'lar, mod algılama, secret redaction, Anthropic streaming
│  └─ cli/      # `unravel` komutu: stdin → stdout
├─ apps/
│  ├─ vscode/   # VS Code extension (şu anki odak)
│  ├─ raycast/  # (sonra)
│  └─ alfred/   # (sonra)
```

## CLI kullanımı

`unravel` komutu stdin'den kod okur, açıklamayı stdout'a stream eder.

```bash
echo 'const x = a?.b ?? c' | unravel --lang tr --detail brief
unravel --mode regex --lang en < pattern.txt
```

### Bayraklar

| Bayrak | Değerler | Varsayılan |
| --- | --- | --- |
| `--mode` | `auto`, `code`, `regex`, `legacy` | `auto` |
| `--lang` | `auto`, `tr`, `en` | `auto` (`en`'e çözümlenir) |
| `--detail` | `brief`, `detailed` | `detailed` |
| `--model` | herhangi bir model id | core'un varsayılanı |
| `--language-id` | `typescript`, `python`, ... | — |
| `--json` | çıktıyı `{"text": "..."}` olarak tek satırda basar (Alfred için ileride) | kapalı |
| `-h`, `--help` | kullanım bilgisini basar | — |

### API key

Şu sırayla aranır:

1. `UNRAVEL_API_KEY` ortam değişkeni
2. `ANTHROPIC_API_KEY` ortam değişkeni
3. `~/.config/unravel-code/config.json` içindeki `"apiKey"` alanı

Key bulunamazsa stderr'e net bir hata mesajı yazılır ve çıkış kodu `1` olur. Açıklama sadece
stdout'a, hatalar sadece stderr'e yazılır. `Ctrl+C` isteği iptal eder (çıkış kodu `130`).

## Geliştirme

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm typecheck
```

Detaylar için `CLAUDE.md` dosyasına bakın.
