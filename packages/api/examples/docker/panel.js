const list = document.getElementById('liste')
const error = document.getElementById('hata')

const row = (c) => {
  const li = document.createElement('li')
  const name = document.createElement('span')
  name.textContent = (c.Names?.[0] ?? c.Id.slice(0, 12)).replace(/^\//, '')
  const state = document.createElement('small')
  state.textContent = c.State
  const btn = document.createElement('button')
  const running = c.State === 'running'
  btn.textContent = running ? 'Durdur' : 'Başlat'
  btn.addEventListener('click', async () => {
    btn.disabled = true
    await ideagent.docker.request('POST', `/containers/${encodeURIComponent(c.Id)}/${running ? 'stop' : 'start'}`)
    await load()
    ideagent.panel.post({ type: 'yenile' })
  })
  li.append(name, state, btn)
  return li
}

async function load() {
  try {
    const r = await ideagent.docker.request('GET', '/containers/json?all=1')
    error.hidden = true
    list.replaceChildren(...JSON.parse(r.body).map(row))
  } catch (e) {
    error.textContent = 'Docker bulunamadı'
    error.hidden = false
    list.replaceChildren()
  }
}

document.getElementById('yenile').addEventListener('click', () => void load())
void load()
