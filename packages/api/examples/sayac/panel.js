const out = document.getElementById('sayi')

ideagent.panel.onMessage((m) => {
  if (m?.type === 'sayi') out.textContent = String(m.n)
})
document.getElementById('artir').addEventListener('click', () => ideagent.panel.post({ type: 'artir' }))
// Açılışta host güncel sayıyı gönderir
ideagent.panel.post({ type: 'hazir' })
