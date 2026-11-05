// Tema: JSON token dosyası. Değerler yalnız #rrggbb; eksik token şemanın yerleşik temasından gelir.

export const THEME_TOKENS = [
  'bg0',
  'bg',
  'surface0',
  'surface',
  'surface2',
  'surface3',
  'surface4',
  'text-strong',
  'text',
  'text2',
  'mute',
  'dim',
  'faint',
  'accent',
  'accent-hover',
  'accent-t',
  'on-accent',
  'green',
  'red',
  'amber',
  'red-t',
  'amber-t',
] as const

export type ThemeToken = (typeof THEME_TOKENS)[number]
export type ThemeScheme = 'dark' | 'light'
export type ThemeColors = Record<ThemeToken, string>
export type ThemeResult = { ok: true; scheme: ThemeScheme; colors: ThemeColors } | { ok: false; path: string }

export const BUILTIN_THEMES: Record<ThemeScheme, ThemeColors> = {
  dark: {
    bg0: '#0f1012',
    bg: '#121212',
    surface0: '#16171b',
    surface: '#191a1d',
    surface2: '#222428',
    surface3: '#2a2c31',
    surface4: '#33353a',
    'text-strong': '#ffffff',
    text: '#ecedef',
    text2: '#d6d8db',
    mute: '#a2a4a9',
    dim: '#878a90',
    faint: '#5d5f64',
    accent: '#4f5dff',
    'accent-hover': '#5c69ff',
    'accent-t': '#b4bbff',
    'on-accent': '#ffffff',
    green: '#5fd38d',
    red: '#ff6b6b',
    amber: '#f5b544',
    'red-t': '#ff8a8a',
    'amber-t': '#f5c46b',
  },
  light: {
    bg0: '#e8e9ec',
    bg: '#f3f3f5',
    surface0: '#f8f8f9',
    surface: '#ffffff',
    surface2: '#eeeff1',
    surface3: '#e4e5e8',
    surface4: '#d6d8dc',
    'text-strong': '#0b0c0e',
    text: '#1c1d20',
    text2: '#33353a',
    mute: '#565960',
    dim: '#6b6e75',
    faint: '#a3a5ab',
    accent: '#4f5dff',
    'accent-hover': '#4350f0',
    'accent-t': '#3c47c8',
    'on-accent': '#ffffff',
    green: '#1f9d57',
    red: '#d93b3b',
    amber: '#c98a14',
    'red-t': '#c22f2f',
    'amber-t': '#8a5a00',
  },
}

const HEX = /^#[0-9a-fA-F]{6}$/
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

export function parseTheme(raw: unknown): ThemeResult {
  if (!isObject(raw)) return { ok: false, path: '' }
  for (const k of Object.keys(raw)) if (k !== 'scheme' && k !== 'colors') return { ok: false, path: k }
  const scheme = raw['scheme']
  if (scheme !== 'dark' && scheme !== 'light') return { ok: false, path: 'scheme' }
  const given = raw['colors'] ?? {}
  if (!isObject(given)) return { ok: false, path: 'colors' }
  for (const [k, v] of Object.entries(given)) {
    if (!(THEME_TOKENS as readonly string[]).includes(k) || typeof v !== 'string' || !HEX.test(v)) return { ok: false, path: `colors.${k}` }
  }
  const colors = { ...BUILTIN_THEMES[scheme] }
  for (const t of THEME_TOKENS) if (typeof given[t] === 'string') colors[t] = given[t] as string
  return { ok: true, scheme, colors }
}

// WCAG göreli parlaklık kontrast oranı
export function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!
  }
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x! + 0.05) / (y! + 0.05)
}
