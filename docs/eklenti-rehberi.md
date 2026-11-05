# @ideagent/api

ideagent eklentileri ve temaları için tipler ve doğrulayıcılar.

```sh
npm install @ideagent/api
```

English: [plugin-guide.md](https://github.com/denizbarish/ideagent/blob/main/docs/plugin-guide.md)

## Klasör Düzeni

```
eklentim/
  ideagent-plugin.json
  main.js        host betiği: komut, durum ve olaylar (görünmeyen süreç)
  panel.html     panel (isteğe bağlı)
  panel.js
  icon.png       64x64 PNG, en çok 256 KB
```

Çalışan örnekler: [`packages/api/examples`](https://github.com/denizbarish/ideagent/tree/main/packages/api/examples) (`sayac`: panel, komut ve durum öğesi; `docker`: Docker izni; `gece`: yalnız tema).

## Manifest

```json
{
  "apiVersion": 1,
  "id": "sayac",
  "name": "Sayaç",
  "version": "1.0.0",
  "description": "Panelden artan sayaç.",
  "icon": "icon.png",
  "main": "main.js",
  "panels": [{ "id": "sayac", "title": "Sayaç", "html": "panel.html" }],
  "commands": [{ "id": "sifirla", "title": "Sıfırla" }],
  "statusItems": [{ "id": "sayi", "text": "Sayaç: 0", "command": "sifirla" }],
  "permissions": { "network": ["api.github.com"], "docker": true, "project": true }
}
```

| Alan | Kural |
| --- | --- |
| `apiVersion` | Yalnız `1` |
| `id` | `^[a-z0-9][a-z0-9-]{1,39}$` |
| `name` | 1-40 karakter |
| `version` | Semver (`1.2.3`, `1.2.3-beta.1`) |
| `description` | En çok 200 karakter |
| `icon`, `main`, `panels[].html` | Klasöre göreli yol; `icon` PNG, `main` `.js` ya da `.mjs` |
| `panels` | En çok 4; `title` 1-24 karakter |
| `commands` | En çok 50; `title` 1-60 karakter; `main` ister |
| `statusItems` | En çok 10; `text` 1-40 karakter; `command` var olan bir komut; `main` ister |
| `themes` | En çok 8; `title` 1-40 karakter; `file` klasöre göreli `.json` (bkz. Tema) |

Öğe kimlikleri (`panels`, `commands`, `statusItems`, `themes`) `^[a-z0-9][a-z0-9-.]{0,39}$` kalıbına uyar ve kendi listesinde tekildir. Bilinmeyen anahtar manifesti geçersiz kılar.

`parseManifest(json)` manifesti doğrular. Hatada geçersiz alanın yolunu (örneğin `commands[1].id`) ve nedeni verir: `missing`, `invalid` ya da `unsupported`.

```ts
import { parseManifest } from '@ideagent/api'

const result = parseManifest(JSON.parse(text))
if (!result.ok) console.error(result.path, result.reason)
```

## Tema

Tema bir JSON token dosyasıdır; manifestte `themes` ile bildirilir. Yalnız tema içeren paket `main` istemez ve süreç başlatmaz.

```json
{ "scheme": "dark", "colors": { "accent": "#8b6cf6", "bg": "#0d0c14", "surface": "#16141f" } }
```

- `scheme`: `dark` ya da `light`. Eksik token bu şemanın yerleşik temasından gelir.
- Değerler yalnız `#rrggbb`. Bilinmeyen anahtar ya da token temayı geçersiz kılar.
- `parseTheme(raw)`, `BUILTIN_THEMES`, `THEME_TOKENS` ve `contrast(a, b)` bu paketten gelir.

| Token | Koyu | Açık | Rol |
| --- | --- | --- | --- |
| `bg0` | `#0f1012` | `#e8e9ec` | En derin zemin |
| `bg` | `#121212` | `#f3f3f5` | Uygulama ve kod zemini |
| `surface0` | `#16171b` | `#f8f8f9` | Zeminden bir adım |
| `surface` | `#191a1d` | `#ffffff` | Kart, panel |
| `surface2` | `#222428` | `#eeeff1` | Yüzeyden bir adım |
| `surface3` | `#2a2c31` | `#e4e5e8` | İki adım |
| `surface4` | `#33353a` | `#d6d8dc` | Üç adım, güçlü kenar |
| `text-strong` | `#ffffff` | `#0b0c0e` | Başlık |
| `text` | `#ecedef` | `#1c1d20` | Gövde metni |
| `text2` | `#d6d8db` | `#33353a` | İkincil güçlü metin |
| `mute` | `#a2a4a9` | `#565960` | İkincil metin |
| `dim` | `#878a90` | `#6b6e75` | Üçüncül metin |
| `faint` | `#5d5f64` | `#a3a5ab` | Süs, pasif ikon |
| `accent` | `#4f5dff` | `#4f5dff` | Vurgu |
| `accent-hover` | `#5c69ff` | `#4350f0` | Vurgu hover |
| `accent-t` | `#b4bbff` | `#3c47c8` | Vurgu renkli metin |
| `on-accent` | `#ffffff` | `#ffffff` | Vurgu zemininde metin |
| `green` | `#5fd38d` | `#1f9d57` | Başarı |
| `red` | `#ff6b6b` | `#d93b3b` | Hata |
| `amber` | `#f5b544` | `#c98a14` | Uyarı |
| `red-t` | `#ff8a8a` | `#c22f2f` | Hata metni |
| `amber-t` | `#f5c46b` | `#8a5a00` | Uyarı metni |

Metin token'larının `bg` ve `surface` karşısında en az 4.5:1 kontrast vermesi önerilir; `contrast` ile ölçün.

## İzinler

Kurulumda kullanıcıya gösterilir ve onaylanır. İzin olmadan ilgili çağrı `izin yok` hatası verir.

| İzin | Verdiği |
| --- | --- |
| `network: ["host"]` | `ideagent.net.fetch` ile yalnız bu HTTPS host'larına istek (en çok 20 genel host adı; IP adresi ve yerel alan adı yok) |
| `docker: true` | `ideagent.docker.request` ile Docker Engine API |
| `project: true` | Etkin projenin yolu ve `ideagent.project.readFile` ile dosya okuma |

## Sandbox

Eklenti kodu ayrı, sandbox'lı süreçte çalışır; Node.js erişimi yoktur. Sayfalar `ideagent-plugin://<id>/` adresinden yalnız eklenti klasörünü okur. İçerik güvenlik politikası doğrudan ağ isteğini (`fetch`, WebSocket) ve satır içi betiği kapatır: panel betiğini dosyadan yükler (`<script src="panel.js">`). Ağ yalnız `ideagent.net.fetch` ile kullanılır.

`main` ES modülü olarak çalışır, üst düzey `await` kullanılabilir. `@ideagent/api` gibi paket adıyla içe aktarma çalışma anında çözülmez: paketi tipler ve doğrulama için kullanın, çalışma anı bağımlılıklarını kendi dosyalarınıza paketleyin.

Paneller her tema token'ını aynı adla CSS değişkeni olarak alır (`var(--accent)`); ek olarak `--line`, `--line2`, `--font`, `--mono`, `--r-sm` ve `--r-md`.

## window.ideagent

Tipler için: `import '@ideagent/api/global'`.

```js
ideagent.commands.on('sifirla', async () => {
  await ideagent.storage.set('sayi', 0)
  await ideagent.status.set('sayi', { text: 'Sayaç: 0' })
})
ideagent.panel.onMessage((m) => {})
ideagent.events.on('project.active', ({ projectId }) => {})
```

| Çağrı | Açıklama |
| --- | --- |
| `commands.on(id, fn)` | Command-K'den çalışan komut (host) |
| `status.set(id, { text, tone })` | Üst çubuk öğesi (host); ton `default`, `ok`, `warn` ya da `error` |
| `events.on(name, fn)` | `project.active`, `session.status`, `git.changed` |
| `panel.post(m)`, `panel.onMessage(fn)` | Host betiği ile paneller arasında mesaj |
| `storage.get(key)`, `storage.set(key, value)` | JSON değer, en çok 64 KB, 200 anahtar |
| `project.current()`, `project.readFile(path)` | Etkin proje; `project` izni yoksa `path` `null` |
| `net.fetch(url, init)` | Gövde en çok 1 MB, yanıt en çok 5 MB, 30 sn; yönlendirme izlenmez |
| `docker.request(method, path)` | `GET`: `_ping`, `version`, `info`, `system/df`, `containers/json`, `containers/{id}/json`, `containers/{id}/top`, `images/json`, `networks`, `volumes`; `POST`: `containers/{id}/start`, `stop`, `restart`. Gövde yok, API sürümü en az 1.24 |

`commands.on`, `events.on` ve `panel.onMessage` dinleyiciyi kaldıran bir fonksiyon döndürür.

## Yerel Kurulum

1. ideagent'ta Ayarlar'ı açın ve **Eklentiler**'i seçin.
2. **Klasörden Yükle**'ye tıklayın ve eklenti klasörünüzü seçin.
3. İzinleri inceleyin ve kurun.

ideagent kurulumda klasörü kopyalar. Dosyaları değiştirdikten sonra yeni kopyayı kurmak için klasörü yeniden yükleyin.

## Katalog

Uygulama içi katalogdaki (**Keşfet**) eklentileri ideagent ekibi yayınlar. Başvurmak için [Plugin Submission](https://github.com/denizbarish/ideagent/issues/new?template=plugin-submission.yml) şablonuyla bir issue açın ve eklenti klasörünüzü içeren herkese açık bir repo bağlantısı verin.

Katalog koşulları:

- Kararlı sürüm (`1.2.0`; ön sürüm yok).
- En çok 500 dosya, dosya başına 5 MB, toplam 20 MB.
- Her izin issue'da gerekçelendirilir.

## Lisans

MIT
