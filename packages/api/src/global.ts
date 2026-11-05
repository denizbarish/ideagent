// Eklenti betiklerinde window.ideagent tipi: import '@ideagent/api/global'
import type { IdeagentPluginApi } from './runtime.ts'

declare global {
  interface Window {
    ideagent: IdeagentPluginApi
  }
}

export {}
