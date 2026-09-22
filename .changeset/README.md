# Changesets

Bu klasör [Changesets](https://github.com/changesets/changesets) tarafından kullanılır.

Bir paketi (örn. `apps/vscode`) etkileyen bir değişiklik yaptığınızda:

```bash
pnpm changeset
```

komutunu çalıştırın, hangi paketin etkilendiğini ve bump türünü (patch/minor/major)
seçin, kısa bir açıklama yazın. Bu, `.changeset/` altına küçük bir markdown dosyası
ekler ve PR'a dahil edilir.

`master`'a merge edildiğinde, `.github/workflows/changesets.yml` bekleyen
changeset'leri toplayıp sürüm numaralarını ve `CHANGELOG.md`'leri güncelleyen bir
"Version Packages" PR'ı otomatik açar/günceller. O PR merge edildiğinde ilgili
paketin (örn. `apps/vscode`) `package.json` sürümü değişmiş olur; VS Code eklentisini
fiilen yayınlamak için o yeni sürüme karşılık gelen bir `vX.Y.Z` git tag'i atmanız
yeterlidir — bu da `.github/workflows/release.yml`'i tetikler.

Daha fazla bilgi: https://github.com/changesets/changesets/tree/main/docs
