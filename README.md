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

## Geliştirme

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm typecheck
```

Detaylar için `CLAUDE.md` dosyasına bakın.
