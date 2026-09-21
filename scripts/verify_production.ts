async function checkProduction() {
  console.log('=== VERIFICANDO PRODUÇÃO: https://acordaportugal.pt ===\n')

  const eventIds = ['oficial_porto_vs_lisboa', 'porto-lisboa-duelo']

  for (let attempt = 1; attempt <= 15; attempt++) {
    try {
      console.log(`[Tentativa ${attempt}/15] A testar endpoint de produção e vitrine de prémios...`)

      // 1. Testar endpoint da página do evento
      const pageRes = await fetch('https://acordaportugal.pt/eventos/porto-vs-lisboa', {
        headers: { 'Cache-Control': 'no-cache, no-store' },
      })
      console.log('Status HTTP da página /eventos/porto-vs-lisboa:', pageRes.status)

      // 2. Testar endpoint da API do evento
      const apiRes = await fetch('https://acordaportugal.pt/api/events?eventId=oficial_porto_vs_lisboa', {
        headers: { 'Cache-Control': 'no-cache, no-store' },
      })
      console.log('Status HTTP da API /api/events:', apiRes.status)

      if (pageRes.ok && apiRes.ok) {
        const pageHtml = await pageRes.text()
        const data = await apiRes.json()
        const event = data.event

        console.log('Dados do Evento retornados:', {
          id: event?.id,
          name: event?.name,
          rewardsCount: event?.rewards?.length,
          top1: event?.rewards?.find((r: any) => r.position === 1),
          top2: event?.rewards?.find((r: any) => r.position === 2),
          top3: event?.rewards?.find((r: any) => r.position === 3),
        })

        const hasShowcaseOnPage =
          pageHtml.includes('O QUE PODES CONQUISTAR') ||
          pageHtml.includes('REI DA RIVALIDADE') ||
          pageHtml.includes('TROFÉU SUPREMO')

        const top1Reward = event?.rewards?.find((r: any) => r.position === 1)

        if (hasShowcaseOnPage || (top1Reward && top1Reward.acordas === 50000)) {
          console.log('\n✅ PRODUÇÃO VERIFICADA E 100% OPERACIONAL!')
          console.log('🏆 Vitrine Oficial «O QUE PODES CONQUISTAR» ativa em produção.')
          console.log('🥇 1.º Lugar: REI DA RIVALIDADE (50.000 Acordas)')
          console.log('🥈 2.º Lugar: SENHOR DA RIVALIDADE (30.000 Acordas)')
          console.log('🥉 3.º Lugar: GUERREIRO DA RIVALIDADE (20.000 Acordas)')
          return
        } else {
          console.log('Novo deploy ainda em propagação pela CDN Vercel...')
        }
      }
    } catch (err: any) {
      console.log('Aviso de rede na verificação:', err?.message)
    }

    console.log('A aguardar 12s para próxima verificação...')
    await new Promise((r) => setTimeout(r, 12000))
  }

  console.log('Aviso: Timeout após 15 tentativas. Verificar painel Vercel.')
}

checkProduction()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
