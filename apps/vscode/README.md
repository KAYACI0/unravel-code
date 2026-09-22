# Unravel Code

Seçtiğiniz kodu veya regex ifadesini Türkçe ya da İngilizce olarak adım adım açıklayan bir VS Code eklentisi. Kod, karmaşık regex desenleri ve dokunulması riskli legacy kod için tasarlandı.

> **In English:** Unravel explains the selected code or regex, step by step, in Turkish or English — right inside a VS Code panel, streamed as it's generated.

## Ne yapar

- **Explain Selection** — seçili kodun ne yaptığını, adım adım akışını ve yan etkilerini açıklar.
- **Explain as Regex** — regex'i parça parça döker, capture group'ları anlatır, eşleşen/eşleşmeyen örnekler verir, catastrophic backtracking riskini işaretler.
- **Legacy mod** — kodun muhtemel niyetini, dokunmadan önce nelere bakmanız gerektiğini ve varsa modernizasyon önerilerini ekler.
- Açıklama, yan panelde gerçek zamanlı stream olarak akar; mod ve detay seviyesini (Brief/Detailed) panelden değiştirip aynı seçimle yeniden çalıştırabilirsiniz.

## 30 saniyede kurulum

İki yoldan biriyle kimlik doğrulayabilirsiniz; API key zorunlu değil.

**A) Claude aboneliğinizle (API key yok)**

1. Eklentiyi kurun.
2. [Claude Code](https://claude.com/claude-code)'u kurup bir kez `claude` çalıştırarak giriş yapın.
3. Kod seçin → `Ctrl+Alt+U`.

Unravel isteği yerel Claude Code'unuza devreder; faturayı Claude aboneliğiniz karşılar.
Kimlik bilgisi Claude Code'a aittir, Unravel onu ne görür ne saklar.

**B) ChatGPT aboneliğinizle (API key yok)**

1. Eklentiyi kurun.
2. [Codex CLI](https://developers.openai.com/codex)'ı kurun (`npm i -g @openai/codex`), `codex login`
   ile ChatGPT hesabınızla giriş yapın.
3. Ayarlardan `unravelCode.auth` değerini `codex` yapın.
4. Kod seçin → `Ctrl+Alt+U`.

> **Dikkat:** `codex exec --json` metni parça parça vermiyor; cevap tek seferde,
> tamamlandığında görünür. Yani bu modda akış yoktur, panel cevap hazır olana
> kadar bekler. Diğer modlarda akış çalışmaya devam eder.

**C) Editörün kendi modeliyle (API key yok)**

1. Eklentiyi kurun.
2. Ayarlardan `unravelCode.auth` değerini `vscodeLm` yapın.
3. Kod seçin → `Ctrl+Alt+U`. İlk seferde VS Code bir izin penceresi gösterir.

VS Code'da hangi model sağlayıcısı kuruluysa onu kullanır. GitHub Copilot'ın
**ücretsiz katmanı** bunun için yeterlidir; kart istemez. Varsa Claude ailesinden
bir model tercih edilir, yoksa mevcut olan kullanılır.

> **Dikkat:** Copilot Free ayda 50 chat isteğiyle sınırlıdır ve Unravel'ın
> istekleri de aynı kotadan düşer. Yoğun kullanacaksanız A veya C'ye geçin.

**D) Anthropic API key ile**

1. Eklentiyi kurun.
2. `Ctrl+Shift+P` (macOS: `Cmd+Shift+P`) → **Unravel: Set API Key** → [Anthropic Console](https://console.anthropic.com/)'dan aldığınız key'i yapıştırın.
3. Kod seçin → `Ctrl+Alt+U`.

Varsayılan `unravelCode.auth` ayarı **`claudeCode`** — yani kutudan çıktığı hâliyle abonelik yolunu
kullanır, API key'le uğraşmanız gerekmez. Key kullanmak isterseniz ayarı `apiKey` yapın; `auto`
ise kayıtlı key varsa onu, yoksa Claude Code'u seçer.

**Hangisini seçmeli:** Claude aboneliğiniz varsa A (varsayılan, ek ücret yok, akış çalışır).
ChatGPT aboneliğiniz varsa B — ama akış yoktur. İkisi de yoksa C ücretsiz başlangıç sunar,
kotası dardır. D en hızlısıdır (ilk kelime ~0.6s; A ~2s, çünkü ~1.4s'i Claude Code'un
açılışıdır) ama kullandıkça ödersiniz.

## Ekran görüntüleri

> _Yer tutucu — yayından önce gerçek ekran görüntüleri/GIF ile değiştirilecek._

| Kod açıklama | Regex dökümü |
| --- | --- |
| `docs/screenshot-explain.png` (yer tutucu) | `docs/screenshot-regex.gif` (yer tutucu) |

## Gizlilik

- Seçtiğiniz kod (ve varsa ±N satır çevre kod) açıklama üretmek için **Anthropic'e** gönderilir: API key modunda doğrudan API'ye, Claude Code modunda yerel Claude Code üzerinden. Aracı bir backend yoktur.
- Claude Code ve Codex modlarında seçiminiz child process'e **stdin ile** verilir, komut satırı argümanı olarak değil — yani process listesinde görünmez. Claude Code tarafında araçlar (Bash, Read, Write, WebFetch...) kapatılır ve MCP sunucuları devre dışı bırakılır; istek nötr bir çalışma dizininde koşar, böylece projenizin `CLAUDE.md`'si isteğe karışmaz.
- Göndermeden önce bilinen secret kalıpları (API key, token, private key, `password=` vb.) otomatik olarak maskelenir (`redactSecrets`); panelde kaç değerin maskelendiği gösterilir. Bu adım kapatılamaz.
- **Telemetri yoktur.** Kullanım, hata veya kod içeriği hiçbir yere loglanmaz veya gönderilmez.
- API key'iniz yalnızca VS Code'un `SecretStorage`'ında saklanır; `settings.json`'a, repoya veya herhangi bir log'a asla yazılmaz.
- Kendi Anthropic API key'inizi kullanırsınız; kullanım Anthropic'in kendi ücretlendirmesine tabidir.

## Ayarlar

| Ayar | Değerler | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `unravelCode.auth` | `claudeCode`, `codex`, `vscodeLm`, `auto`, `apiKey` | `claudeCode` | Kimlik kaynağı. Varsayılan, yerel Claude Code'u ve Claude aboneliğinizi kullanır; `codex` ChatGPT aboneliğinizi, `vscodeLm` editörün modelini. |
| `unravelCode.codexPath` | yol | `""` | Codex çalıştırılabilirinin yolu. Boşsa otomatik bulunur. |
| `unravelCode.codexModel` | model adı | `""` | `codex` modunda kullanılacak model. Boşsa Codex'in kendi ayarı geçerlidir. |
| `unravelCode.claudeCodePath` | yol | `""` | Claude Code çalıştırılabilirinin yolu. Boşsa otomatik bulunur. |
| `unravelCode.language` | `auto`, `tr`, `en` | `auto` | Açıklama dili. `auto`, VS Code arayüz dilini takip eder. |
| `unravelCode.detail` | `brief`, `detailed` | `detailed` | Açıklamanın derinliği. |
| `unravelCode.model` | `claude-haiku-4-5`, `claude-sonnet-5` | `claude-haiku-4-5` | Kullanılacak Anthropic modeli. |
| `unravelCode.contextLines` | sayı (≥0) | `5` | Seçimin öncesi/sonrasından gönderilecek satır sayısı. `0` = sadece seçim. |

## SSS

**Kodum eğitim/model geliştirme için kullanılıyor mu?**
Hayır. Kod yalnızca o anki açıklama isteği için Anthropic API'sine gönderilir; bu eklenti veya proje tarafından hiçbir yerde saklanmaz.

**API key'imi nereye giriyorum, güvenli mi?**
`Unravel: Set API Key` komutuyla girdiğiniz key VS Code'un işletim sistemi düzeyindeki güvenli depolamasında (`SecretStorage`) tutulur; ayar dosyalarına veya repoya yazılmaz.

**Neden bazen "emin değilim" gibi ifadeler görüyorum?**
Model kodu çalıştırmaz, sadece okuyarak açıklar. Emin olmadığı bir davranış varsa tahmin etmek yerine bunu açıkça belirtmesi istenir.

**Çok büyük bir seçim işe yaramıyor, neden?**
20.000 karakterden uzun seçimler API'ye gönderilmeden önce reddedilir; daha küçük bir aralık seçin.

**Ücretsiz mi?**
Eklenti ücretsizdir; kendi Anthropic API key'inizle kullandığınız kadar Anthropic'e ödeme yaparsınız.

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `Unravel: Explain Selection` | Seçili kodu açıklar (mod otomatik algılanır). |
| `Unravel: Explain as Regex` | Seçimi regex modunda açıklar. |
| `Unravel: Set API Key` | Anthropic API key'ini `SecretStorage`'a kaydeder. |
| `Unravel: Clear API Key` | Kayıtlı API key'i siler. |

## Lisans

MIT — bkz. [LICENSE](./LICENSE).
