export type PluginEventName = 'project.active' | 'session.status' | 'git.changed'

export type PluginEvents = {
  'project.active': { projectId: string | null }
  'session.status': { projectId: string; chatId: string; status: 'idle' | 'running' | 'awaiting' }
  'git.changed': { projectId: string }
}

export type StatusTone = 'default' | 'ok' | 'warn' | 'error'

export type FetchInit = { method?: string; headers?: Record<string, string>; body?: string }
export type FetchResponse = { status: number; headers: Record<string, string>; body: string }

// Eklentinin host betiğinde ve panelinde window.ideagent olarak gelen API
export interface IdeagentPluginApi {
  readonly apiVersion: 1
  commands: { on(id: string, handler: () => void | Promise<void>): () => void }
  status: { set(id: string, item: { text: string; tone?: StatusTone }): Promise<void> }
  events: { on<E extends PluginEventName>(name: E, cb: (payload: PluginEvents[E]) => void): () => void }
  // Host'ta panellere, panelde host'a gider
  panel: { post(message: unknown): void; onMessage(cb: (message: unknown) => void): () => void }
  storage: { get(key: string): Promise<unknown>; set(key: string, value: unknown): Promise<void> }
  // path ve readFile "project" izni ister
  project: { current(): Promise<{ id: string; name: string; path: string | null } | null>; readFile(path: string): Promise<string> }
  // "network" izni; yalnız manifestteki https host'ları
  net: { fetch(url: string, init?: FetchInit): Promise<FetchResponse> }
  // "docker" izni; Docker Engine API: okuma ve var olan konteyneri başlat/durdur/yeniden başlat, gövdesiz
  docker: { request(method: 'GET' | 'POST', path: string): Promise<{ status: number; body: string }> }
}
