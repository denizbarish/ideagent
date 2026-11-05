# ideagent

The macOS editor for Claude and Codex agents. Run, watch and approve agents in every project, each with its own account.

This repository holds the plugin and theme SDK (`@ideagent/api`), examples, docs and release downloads. The app itself is closed source.

Türkçe: [README.tr.md](README.tr.md)

## Install

Requires a Mac with Apple silicon.

1. Download the latest DMG from [Releases](https://github.com/denizbarish/ideagent/releases).
2. Open the DMG and drag ideagent to Applications.
3. Open ideagent. When the warning appears on first launch, go to System Settings > Privacy & Security and click **Open Anyway**.
4. Open ideagent again.

## Plugins and Themes

```sh
npm install @ideagent/api
```

The package provides types for `window.ideagent` and validators for manifests and themes.

```ts
import { parseManifest, parseTheme } from '@ideagent/api'
import '@ideagent/api/global'
```

- Guide: [docs/plugin-guide.md](docs/plugin-guide.md) ([Türkçe](docs/eklenti-rehberi.md))
- Examples: [packages/api/examples](packages/api/examples)

To install a plugin you are developing, open **Ayarlar** (Settings) > **Eklentiler** (Plugins) in ideagent and click **Klasörden Yükle** (Load From Folder).

## Plugin Catalog

The ideagent team publishes the plugins in the in-app catalog. To apply, open an issue with the [Plugin Submission](https://github.com/denizbarish/ideagent/issues/new?template=plugin-submission.yml) template.

## Bugs

Report bugs with the [Bug Report](https://github.com/denizbarish/ideagent/issues/new?template=bug.yml) template.

## License

The SDK, examples and docs in this repository are licensed under [MIT](LICENSE).
