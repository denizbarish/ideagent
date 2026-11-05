# @ideagent/api

Types and validators for ideagent plugins and themes.

```sh
npm install @ideagent/api
```

Türkçe: [eklenti-rehberi.md](https://github.com/denizbarish/ideagent/blob/main/docs/eklenti-rehberi.md)

## Folder Layout

```
my-plugin/
  ideagent-plugin.json
  main.js        host script: commands, status and events (hidden process)
  panel.html     panel (optional)
  panel.js
  icon.png       64x64 PNG, up to 256 KB
```

Working examples: [`packages/api/examples`](https://github.com/denizbarish/ideagent/tree/main/packages/api/examples) (`sayac`: panel, command and status item; `docker`: Docker permission; `gece`: theme only).

## Manifest

```json
{
  "apiVersion": 1,
  "id": "counter",
  "name": "Counter",
  "version": "1.0.0",
  "description": "A counter that the panel increments.",
  "icon": "icon.png",
  "main": "main.js",
  "panels": [{ "id": "counter", "title": "Counter", "html": "panel.html" }],
  "commands": [{ "id": "reset", "title": "Reset" }],
  "statusItems": [{ "id": "count", "text": "Counter: 0", "command": "reset" }],
  "permissions": { "network": ["api.github.com"], "docker": true, "project": true }
}
```

| Field | Rule |
| --- | --- |
| `apiVersion` | `1` only |
| `id` | `^[a-z0-9][a-z0-9-]{1,39}$` |
| `name` | 1 to 40 characters |
| `version` | Semver (`1.2.3`, `1.2.3-beta.1`) |
| `description` | Up to 200 characters |
| `icon`, `main`, `panels[].html` | Path relative to the folder; `icon` is PNG, `main` is `.js` or `.mjs` |
| `panels` | Up to 4; `title` 1 to 24 characters |
| `commands` | Up to 50; `title` 1 to 60 characters; requires `main` |
| `statusItems` | Up to 10; `text` 1 to 40 characters; `command` must be an existing command; requires `main` |
| `themes` | Up to 8; `title` 1 to 40 characters; `file` is a relative `.json` path (see Themes) |

Item IDs (`panels`, `commands`, `statusItems`, `themes`) match `^[a-z0-9][a-z0-9-.]{0,39}$` and are unique within their list. Unknown keys make the manifest invalid.

`parseManifest(json)` validates a manifest. On failure it returns the path of the invalid field (for example `commands[1].id`) and a reason: `missing`, `invalid` or `unsupported`.

```ts
import { parseManifest } from '@ideagent/api'

const result = parseManifest(JSON.parse(text))
if (!result.ok) console.error(result.path, result.reason)
```

## Themes

A theme is a JSON token file declared in the manifest under `themes`. A theme-only package needs no `main` and starts no process.

```json
{ "scheme": "dark", "colors": { "accent": "#8b6cf6", "bg": "#0d0c14", "surface": "#16141f" } }
```

- `scheme`: `dark` or `light`. Missing tokens come from the built-in theme of that scheme.
- Values are `#rrggbb` only. An unknown key or token makes the theme invalid.
- `parseTheme(raw)`, `BUILTIN_THEMES`, `THEME_TOKENS` and `contrast(a, b)` come from this package.

| Token | Dark | Light | Role |
| --- | --- | --- | --- |
| `bg0` | `#0f1012` | `#e8e9ec` | Deepest background |
| `bg` | `#121212` | `#f3f3f5` | App and code background |
| `surface0` | `#16171b` | `#f8f8f9` | One step above background |
| `surface` | `#191a1d` | `#ffffff` | Card, panel |
| `surface2` | `#222428` | `#eeeff1` | One step above surface |
| `surface3` | `#2a2c31` | `#e4e5e8` | Two steps |
| `surface4` | `#33353a` | `#d6d8dc` | Three steps, strong border |
| `text-strong` | `#ffffff` | `#0b0c0e` | Heading |
| `text` | `#ecedef` | `#1c1d20` | Body text |
| `text2` | `#d6d8db` | `#33353a` | Strong secondary text |
| `mute` | `#a2a4a9` | `#565960` | Secondary text |
| `dim` | `#878a90` | `#6b6e75` | Tertiary text |
| `faint` | `#5d5f64` | `#a3a5ab` | Decoration, inactive icon |
| `accent` | `#4f5dff` | `#4f5dff` | Accent |
| `accent-hover` | `#5c69ff` | `#4350f0` | Accent hover |
| `accent-t` | `#b4bbff` | `#3c47c8` | Accent-colored text |
| `on-accent` | `#ffffff` | `#ffffff` | Text on accent background |
| `green` | `#5fd38d` | `#1f9d57` | Success |
| `red` | `#ff6b6b` | `#d93b3b` | Error |
| `amber` | `#f5b544` | `#c98a14` | Warning |
| `red-t` | `#ff8a8a` | `#c22f2f` | Error text |
| `amber-t` | `#f5c46b` | `#8a5a00` | Warning text |

Text tokens should reach at least 4.5:1 contrast against `bg` and `surface`; measure with `contrast`.

## Permissions

Permissions are shown to the user at install time and must be approved. Without the permission, the call fails with an `izin yok` (no permission) error.

| Permission | Grants |
| --- | --- |
| `network: ["host"]` | `ideagent.net.fetch` to these HTTPS hosts only (up to 20 public hostnames; no IP addresses or local domains) |
| `docker: true` | `ideagent.docker.request` to the Docker Engine API |
| `project: true` | The active project's path and file reads with `ideagent.project.readFile` |

## Sandbox

Plugin code runs in a separate, sandboxed process with no Node.js access. Pages load from `ideagent-plugin://<id>/` and can read only the plugin folder. The content security policy blocks direct network requests (`fetch`, WebSocket) and inline scripts: a panel loads its script from a file (`<script src="panel.js">`). Use `ideagent.net.fetch` for network access.

`main` runs as an ES module, so top-level `await` works. Bare package imports such as `@ideagent/api` do not resolve at runtime: use the package for types and validation, and bundle any runtime dependencies into your files.

Panels receive every theme token as a CSS variable with the same name (`var(--accent)`), plus `--line`, `--line2`, `--font`, `--mono`, `--r-sm` and `--r-md`.

## window.ideagent

For types: `import '@ideagent/api/global'`.

```js
ideagent.commands.on('reset', async () => {
  await ideagent.storage.set('count', 0)
  await ideagent.status.set('count', { text: 'Counter: 0' })
})
ideagent.panel.onMessage((m) => {})
ideagent.events.on('project.active', ({ projectId }) => {})
```

| Call | Description |
| --- | --- |
| `commands.on(id, fn)` | Command run from Command-K (host) |
| `status.set(id, { text, tone })` | Top bar item (host); tone is `default`, `ok`, `warn` or `error` |
| `events.on(name, fn)` | `project.active`, `session.status`, `git.changed` |
| `panel.post(m)`, `panel.onMessage(fn)` | Messages between the host script and panels |
| `storage.get(key)`, `storage.set(key, value)` | JSON value, up to 64 KB, 200 keys |
| `project.current()`, `project.readFile(path)` | Active project; `path` is `null` without the `project` permission |
| `net.fetch(url, init)` | Body up to 1 MB, response up to 5 MB, 30 seconds; redirects are not followed |
| `docker.request(method, path)` | `GET`: `_ping`, `version`, `info`, `system/df`, `containers/json`, `containers/{id}/json`, `containers/{id}/top`, `images/json`, `networks`, `volumes`; `POST`: `containers/{id}/start`, `stop`, `restart`. No body; API version 1.24 or later |

`commands.on`, `events.on` and `panel.onMessage` return a function that removes the listener.

## Local Install

1. In ideagent, open **Ayarlar** (Settings) and select **Eklentiler** (Plugins).
2. Click **Klasörden Yükle** (Load From Folder) and choose your plugin folder.
3. Review the permissions and install.

ideagent copies the folder when it installs it. After you change files, load the folder again to install the new copy.

## Catalog

Plugins in the in-app catalog (**Keşfet**, Discover) are published by the ideagent team. To apply, open an issue with the [Plugin Submission](https://github.com/denizbarish/ideagent/issues/new?template=plugin-submission.yml) template and link a public repository with your plugin folder.

Catalog requirements:

- A stable version (`1.2.0`; no prerelease).
- Up to 500 files, 5 MB per file and 20 MB in total.
- Each permission is explained in the issue.

## License

MIT
