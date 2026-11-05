// Çalışan konteyner sayısı üst çubukta; 15 saniyede bir ve panel isteyince yenilenir
const refresh = async () => {
  try {
    const r = await ideagent.docker.request('GET', '/containers/json')
    const count = r.status === 200 ? JSON.parse(r.body).length : 0
    await ideagent.status.set('calisan', { text: `Docker: ${count}`, tone: count > 0 ? 'ok' : 'default' })
  } catch {
    await ideagent.status.set('calisan', { text: 'Docker: Yok', tone: 'warn' })
  }
}

ideagent.panel.onMessage((m) => {
  if (m?.type === 'yenile') void refresh()
})

setInterval(refresh, 15_000)
await refresh()
