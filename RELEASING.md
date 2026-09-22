# Sürüm çıkarma

Sürümler [Changesets](https://github.com/changesets/changesets) ile yönetilir.
Marketplace'e yayınlanan tek paket `apps/vscode`.

## 1. Değişikliği kaydet

Kullanıcıya yansıyan bir değişiklik yaptıysan, PR'ına bir changeset ekle:

```bash
pnpm changeset
```

`unravel-code` paketini seç, patch/minor/major belirle. `.changeset/` altına bir
markdown dosyası düşer, onu da commit'le.

> Tüm paketler `private: true` olduğu için `.changeset/config.json`'da
> `privatePackages.version` açık olmalı — kapalıyken `changeset version`
> hiçbir şey yapmadan sessizce geçer.

## 2. Sürümü yükselt

`master`'a her push'ta `Version Packages` workflow'u çalışır ve biriken
changeset'leri tüketip `apps/vscode/package.json` sürümünü yükselten bir PR
açar (veya günceller). Yayınlamaya hazır olduğunda o PR'ı merge et.

`CHANGELOG.md` elle yazılır (Keep a Changelog formatı); changesets kendi
changelog'unu üretmez (`"changelog": false`). Sürüm notlarını merge'den önce
CHANGELOG'a ekle.

## 3. Tag at

```bash
git checkout master && git pull
pnpm release:tag
```

Bu, `apps/vscode/package.json` sürümünden `v<version>` tag'ini oluşturup
push'lar ve `Release` workflow'unu tetikler.

> Tag neden CI'da atılmıyor: bir workflow'un `GITHUB_TOKEN`'ı ile push'lanan tag
> başka workflow'ları tetiklemez, yani otomatik tag Release'i hiç başlatmazdı.

## 4. Release workflow ne yapar

- Tag'in `apps/vscode/package.json` sürümüyle eşleştiğini doğrular
- `.vsix` paketler
- `.vsix`'i ekleyerek GitHub Release oluşturur
- `VSCE_PAT` secret'ı tanımlıysa Visual Studio Marketplace'e yayınlar
- `OVSX_PAT` secret'ı tanımlıysa Open VSX'e yayınlar

İki secret de tanımlı değilse adımlar atlanır, workflow yine de yeşil kalır.

## Yayın öncesi bir kerelik kurulum

- Visual Studio Marketplace'te `unravel-code` publisher'ını oluştur
  (Azure DevOps hesabı gerekir), sonra bir PAT üret.
- Repo'da **Settings → Secrets and variables → Actions** altına `VSCE_PAT`
  (ve istersen `OVSX_PAT`) ekle.
- `README.md`'deki yer tutucu ekran görüntülerini gerçekleriyle değiştir.
