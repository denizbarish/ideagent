export const API_VERSION = 1
export const MANIFEST_FILE = 'ideagent-plugin.json'

export type PluginPermissions = { network?: string[]; docker?: true; project?: true }

export type PluginManifest = {
  apiVersion: 1
  id: string
  name: string
  version: string
  description: string
  icon?: string
  main?: string
  panels?: { id: string; title: string; html: string }[]
  commands?: { id: string; title: string }[]
  statusItems?: { id: string; text: string; command?: string }[]
  permissions?: PluginPermissions
  themes?: { id: string; title: string; file: string }[]
}

export type ManifestResult = { ok: true; manifest: PluginManifest } | { ok: false; path: string; reason: 'missing' | 'invalid' | 'unsupported' }

const ID = /^[a-z0-9][a-z0-9-]{1,39}$/
const ITEM_ID = /^[a-z0-9][a-z0-9-.]{0,39}$/
const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/
// Yalnız genel ad: en az iki etiket, alfabetik TLD (IP olamaz), yerel ağ uzantıları yok
const HOST = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/
const LOCAL = /\.(local|localhost|internal|lan|home\.arpa)$/
const TOP_KEYS = new Set(['apiVersion', 'id', 'name', 'version', 'description', 'icon', 'main', 'panels', 'commands', 'statusItems', 'permissions', 'themes'])
const LIMITS = { panels: 4, commands: 50, statusItems: 10, network: 20, themes: 8 }

class Invalid extends Error {
  constructor(
    readonly path: string,
    readonly reason: 'missing' | 'invalid' | 'unsupported' = 'invalid',
  ) {
    super(path)
  }
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

// Tek satırlık metin, uzunluk 1..max
const text = (v: unknown, path: string, max: number): string => {
  if (v === undefined) throw new Invalid(path, 'missing')
  if (typeof v !== 'string' || v.length < 1 || v.length > max || /[\r\n]/.test(v)) throw new Invalid(path)
  return v
}

// Eklenti klasörüne göreli dosya yolu: mutlak, .. ve ters bölü yok
const file = (v: unknown, path: string, ext?: RegExp): string => {
  if (typeof v !== 'string' || !v || v.length > 200 || v.startsWith('/') || v.includes('\\') || v.includes('\0')) throw new Invalid(path)
  if (v.split('/').some((s) => s === '..' || s === '' || s === '.')) throw new Invalid(path)
  if (ext && !ext.test(v)) throw new Invalid(path)
  return v
}

const list = <T>(v: unknown, path: string, max: number, item: (x: Record<string, unknown>, p: string) => T): T[] | undefined => {
  if (v === undefined) return undefined
  if (!Array.isArray(v) || v.length > max) throw new Invalid(path)
  const seen = new Set<string>()
  return v.map((x, i) => {
    const p = `${path}[${i}]`
    if (!isObject(x)) throw new Invalid(p)
    const out = item(x, p)
    const id = (out as { id: string }).id
    if (seen.has(id)) throw new Invalid(`${p}.id`)
    seen.add(id)
    return out
  })
}

const itemId = (v: unknown, path: string) => {
  if (typeof v !== 'string' || !ITEM_ID.test(v)) throw new Invalid(path, v === undefined ? 'missing' : 'invalid')
  return v
}

const onlyKeys = (x: Record<string, unknown>, path: string, keys: string[]) => {
  for (const k of Object.keys(x)) if (!keys.includes(k)) throw new Invalid(`${path}.${k}`)
}

const permissions = (v: unknown): PluginPermissions | undefined => {
  if (v === undefined) return undefined
  if (!isObject(v)) throw new Invalid('permissions')
  onlyKeys(v, 'permissions', ['network', 'docker', 'project'])
  const out: PluginPermissions = {}
  if (v['network'] !== undefined) {
    const n = v['network']
    if (!Array.isArray(n) || n.length > LIMITS.network) throw new Invalid('permissions.network')
    out.network = n.map((h, i) => {
      if (typeof h !== 'string' || !HOST.test(h) || LOCAL.test(h)) throw new Invalid(`permissions.network[${i}]`)
      return h
    })
  }
  for (const k of ['docker', 'project'] as const) {
    if (v[k] === undefined) continue
    if (v[k] !== true) throw new Invalid(`permissions.${k}`)
    out[k] = true
  }
  return out
}

function parse(raw: unknown): PluginManifest {
  if (!isObject(raw)) throw new Invalid('')
  for (const k of Object.keys(raw)) if (!TOP_KEYS.has(k)) throw new Invalid(k)
  if (raw['apiVersion'] === undefined) throw new Invalid('apiVersion', 'missing')
  if (raw['apiVersion'] !== API_VERSION) throw new Invalid('apiVersion', 'unsupported')
  if (raw['id'] === undefined) throw new Invalid('id', 'missing')
  if (typeof raw['id'] !== 'string' || !ID.test(raw['id'])) throw new Invalid('id')
  const name = text(raw['name'], 'name', 40)
  if (raw['version'] === undefined) throw new Invalid('version', 'missing')
  if (typeof raw['version'] !== 'string' || !SEMVER.test(raw['version'])) throw new Invalid('version')
  const description = raw['description'] ?? ''
  if (typeof description !== 'string' || description.length > 200 || /[\r\n]/.test(description)) throw new Invalid('description')

  const m: PluginManifest = { apiVersion: 1, id: raw['id'], name, version: raw['version'], description }
  if (raw['icon'] !== undefined) m.icon = file(raw['icon'], 'icon', /\.png$/i)
  if (raw['main'] !== undefined) m.main = file(raw['main'], 'main', /\.m?js$/i)
  const panels = list(raw['panels'], 'panels', LIMITS.panels, (x, p) => {
    onlyKeys(x, p, ['id', 'title', 'html'])
    return { id: itemId(x['id'], `${p}.id`), title: text(x['title'], `${p}.title`, 24), html: file(x['html'], `${p}.html`, /\.html$/i) }
  })
  const commands = list(raw['commands'], 'commands', LIMITS.commands, (x, p) => {
    onlyKeys(x, p, ['id', 'title'])
    return { id: itemId(x['id'], `${p}.id`), title: text(x['title'], `${p}.title`, 60) }
  })
  const statusItems = list(raw['statusItems'], 'statusItems', LIMITS.statusItems, (x, p) => {
    onlyKeys(x, p, ['id', 'text', 'command'])
    const item: { id: string; text: string; command?: string } = { id: itemId(x['id'], `${p}.id`), text: text(x['text'], `${p}.text`, 40) }
    if (x['command'] !== undefined) {
      if (typeof x['command'] !== 'string' || !commands?.some((c) => c.id === x['command'])) throw new Invalid(`${p}.command`)
      item.command = x['command']
    }
    return item
  })
  const themes = list(raw['themes'], 'themes', LIMITS.themes, (x, p) => {
    onlyKeys(x, p, ['id', 'title', 'file'])
    return { id: itemId(x['id'], `${p}.id`), title: text(x['title'], `${p}.title`, 40), file: file(x['file'], `${p}.file`, /\.json$/i) }
  })
  if (panels) m.panels = panels
  if (themes) m.themes = themes
  if (commands) m.commands = commands
  if (statusItems) m.statusItems = statusItems
  if ((commands?.length || statusItems?.length) && !m.main) throw new Invalid('main', 'missing')
  const perms = permissions(raw['permissions'])
  if (perms) m.permissions = perms
  return m
}

// Eklenti manifestini doğrular; hata, sorunlu alanın yolunu verir (ör. commands[1].id)
export function parseManifest(raw: unknown): ManifestResult {
  try {
    return { ok: true, manifest: parse(raw) }
  } catch (err) {
    if (err instanceof Invalid) return { ok: false, path: err.path, reason: err.reason }
    throw err
  }
}
