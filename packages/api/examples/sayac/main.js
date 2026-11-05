// Sayı depolamada kalır; panel artırır, komut sıfırlar, üst çubuk gösterir
let n = Number((await ideagent.storage.get('sayi')) ?? 0)

const show = async () => {
  await ideagent.status.set('sayi', { text: `Sayaç: ${n}` })
  ideagent.panel.post({ type: 'sayi', n })
}

ideagent.panel.onMessage(async (m) => {
  if (m?.type === 'artir') {
    n += 1
    await ideagent.storage.set('sayi', n)
  }
  await show()
})

ideagent.commands.on('sifirla', async () => {
  n = 0
  await ideagent.storage.set('sayi', n)
  await show()
})

await show()
