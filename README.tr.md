# ideagent

Claude ve Codex ajanları için macOS editörü. Ajanları her projede kendi hesabıyla çalıştır, izle, onayla.

Bu repo eklenti ve tema SDK'sını (`@ideagent/api`), örnekleri, dokümanları ve sürüm indirmelerini içerir. Uygulamanın kendisi kapalı kaynaktır.

English: [README.md](README.md)

## Kurulum

Apple silicon işlemcili bir Mac gerekir.

1. Son DMG dosyasını [Releases](https://github.com/denizbarish/ideagent/releases) sayfasından indir.
2. DMG dosyasını aç, ideagent'ı Applications klasörüne sürükle.
3. ideagent'ı aç. İlk açılışta uyarı çıkınca Sistem Ayarları > Gizlilik ve Güvenlik bölümünde **Yine de Aç**'a tıkla.
4. ideagent'ı tekrar aç.

## Eklentiler ve Temalar

```sh
npm install @ideagent/api
```

Paket `window.ideagent` tiplerini ve manifest ile tema doğrulayıcılarını verir.

```ts
import { parseManifest, parseTheme } from '@ideagent/api'
import '@ideagent/api/global'
```

- Rehber: [docs/eklenti-rehberi.md](docs/eklenti-rehberi.md) ([English](docs/plugin-guide.md))
- Örnekler: [packages/api/examples](packages/api/examples)

Geliştirdiğin eklentiyi kurmak için ideagent'ta **Ayarlar** > **Eklentiler** bölümünde **Klasörden Yükle**'ye tıkla.

## Eklenti Kataloğu

Uygulama içi katalogdaki eklentileri ideagent ekibi yayınlar. Başvurmak için [Plugin Submission](https://github.com/denizbarish/ideagent/issues/new?template=plugin-submission.yml) şablonuyla bir issue aç.

## Hatalar

Hataları [Bug Report](https://github.com/denizbarish/ideagent/issues/new?template=bug.yml) şablonuyla bildir.

## Lisans

Bu repodaki SDK, örnekler ve dokümanlar [MIT](LICENSE) lisanslıdır.
