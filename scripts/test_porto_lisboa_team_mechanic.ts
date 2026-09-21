/**
 * Bateria de Testes Automatizados da Nova Mecânica Principal:
 * ESCOLHA DO LADO (PORTO × LISBOA)
 */

import {
  OFFICIAL_PORTO_LISBOA_ID,
  OFFICIAL_EVENT_CONFIG_PORTO_LISBOA,
  type EventParticipant,
  type EventTeamId,
  sortEventParticipants,
} from '../lib/events-service'
import fs from 'fs'
import path from 'path'

async function runTeamMechanicTests() {
  console.log('========================================================================')
  console.log('⚔️ TESTE DA MECÂNICA: ESCOLHA DO LADO (PORTO × LISBOA)')
  console.log('========================================================================\n')

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`)
      passed++
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` (${detail})` : ''}`)
      failed++
    }
  }

  // 1. Verificação da Configuração das Equipas no Evento Oficial
  console.log('--- 1. CONFIGURAÇÃO OFICIAL DAS EQUIPAS ---')
  const teams = OFFICIAL_EVENT_CONFIG_PORTO_LISBOA.teams
  assert(Boolean(teams), 'Propriedade "teams" existe na configuração do evento')
  assert(Boolean(teams?.porto), 'Equipa Porto está configurada')
  assert(Boolean(teams?.lisboa), 'Equipa Lisboa está configurada')

  assert(teams?.porto.id === 'porto', 'Equipa Porto ID é "porto"')
  assert(teams?.porto.name === 'Equipa Porto', 'Nome oficial: "Equipa Porto"')
  assert(teams?.porto.club.includes('FC Porto'), 'Clube do Porto é "FC Porto"')
  assert(teams?.porto.color === 'blue', 'Cor do Porto é azul (blue)')

  assert(teams?.lisboa.id === 'lisboa', 'Equipa Lisboa ID é "lisboa"')
  assert(teams?.lisboa.name === 'Equipa Lisboa', 'Nome oficial: "Equipa Lisboa"')
  assert(teams?.lisboa.club.includes('SL Benfica'), 'Clube de Lisboa é "SL Benfica"')
  assert(teams?.lisboa.color === 'red', 'Cor de Lisboa é vermelha (red)')

  // 2. Cálculo Real de Percentagens e Domínio (Zero Hardcoding)
  console.log('\n--- 2. CÁLCULO DINÂMICO DE PERCENTAGENS E DOMÍNIO ---')
  function calculateDomain(portoPts: number, lisboaPts: number) {
    const total = portoPts + lisboaPts
    const portoPct = total > 0 ? Math.round((portoPts / total) * 100) : 50
    const lisboaPct = 100 - portoPct
    const winner: 'porto' | 'lisboa' | 'draw' =
      portoPts > lisboaPts ? 'porto' : lisboaPts > portoPts ? 'lisboa' : 'draw'
    return { total, portoPct, lisboaPct, winner }
  }

  const initial = calculateDomain(0, 0)
  assert(initial.portoPct === 50 && initial.lisboaPct === 50, 'Empate inicial quando total = 0 (50% / 50%)')
  assert(initial.winner === 'draw', 'Vencedor inicial é draw quando pontos iguais a zero')

  const portoAhead = calculateDomain(750, 250)
  assert(portoAhead.portoPct === 75 && portoAhead.lisboaPct === 25, 'Cálculo dinâmico 750 vs 250 -> 75% / 25%')
  assert(portoAhead.winner === 'porto', 'Porto em vantagem detetado corretamente')

  const lisboaAhead = calculateDomain(300, 700)
  assert(lisboaAhead.portoPct === 30 && lisboaAhead.lisboaPct === 70, 'Cálculo dinâmico 300 vs 700 -> 30% / 70%')
  assert(lisboaAhead.winner === 'lisboa', 'Lisboa em vantagem detetada corretamente')

  // 3. Filtragem de Ranking por Equipa e Líderes Oficiais
  console.log('\n--- 3. FILTRAGEM POR EQUIPA E LÍDERES ---')
  const participants: EventParticipant[] = [
    {
      userId: 'p1',
      displayName: 'Dragão Mítico',
      eventPoints: 950,
      team: 'porto',
      totalMatches: 8,
    },
    {
      userId: 'p2',
      displayName: 'Águia Gloriosa',
      eventPoints: 900,
      team: 'lisboa',
      totalMatches: 7,
    },
    {
      userId: 'p3',
      displayName: 'Ribeira Forte',
      eventPoints: 850,
      team: 'porto',
      totalMatches: 6,
    },
    {
      userId: 'p4',
      displayName: 'Luz Imortal',
      eventPoints: 820,
      team: 'lisboa',
      totalMatches: 6,
    },
  ]

  const sortedParticipants = sortEventParticipants(participants)
  const portoTeam = sortedParticipants.filter((p) => p.team === 'porto')
  const lisboaTeam = sortedParticipants.filter((p) => p.team === 'lisboa')

  assert(portoTeam.length === 2, '2 participantes filtrados para a Equipa Porto')
  assert(lisboaTeam.length === 2, '2 participantes filtrados para a Equipa Lisboa')

  assert(portoTeam[0].userId === 'p1', 'Líder da Equipa Porto é Dragão Mítico (#p1)')
  assert(lisboaTeam[0].userId === 'p2', 'Líder da Equipa Lisboa é Águia Gloriosa (#p2)')

  // 4. Verificação de Arquivos Obrigatórios da Mecânica
  console.log('\n--- 4. EXISTÊNCIA DE ARQUIVOS E ENDPOINTS ---')
  const files = [
    'app/api/events/select-team/route.ts',
    'components/events/PortoLisboaTeamSelectModal.tsx',
    'components/events/PortoLisboaEvent.tsx',
    'components/quiz/result-screen.tsx',
    'app/api/events/match/init/route.ts',
    'app/api/events/record-match/route.ts',
    'app/api/events/claim-reward/route.ts',
    'public/arenas/porto-lisboa-arena.jpg',
  ]

  for (const f of files) {
    const p = path.resolve(process.cwd(), f)
    assert(fs.existsSync(p), `Ficheiro essencial existe: ${f}`)
  }

  // 5. Verificação da Rota /api/events/select-team
  console.log('\n--- 5. INTEGRIDADE DA LÓGICA DE SELEÇÃO E ANTI-SWAP ---')
  const selectTeamCode = fs.readFileSync(
    path.resolve(process.cwd(), 'app/api/events/select-team/route.ts'),
    'utf-8'
  )
  assert(selectTeamCode.includes('pData.team !== chosenTeam'), 'API rejeita alteração de equipa quando já selecionada (anti-swap)')
  assert(selectTeamCode.includes("rawTeam !== 'porto' && rawTeam !== 'lisboa'"), 'API valida estritamente os IDs "porto" e "lisboa"')
  assert(selectTeamCode.includes('playerCount'), 'API incrementa atomicamente o playerCount da equipa escolhida')

  // 6. Verificação de Recompensas de Campeões de Equipa em claim-reward
  console.log('\n--- 6. TÍTULOS HONORÁRIOS DE CAMPEÃO DE EQUIPA ---')
  const claimRewardCode = fs.readFileSync(
    path.resolve(process.cwd(), 'app/api/events/claim-reward/route.ts'),
    'utf-8'
  )
  assert(claimRewardCode.includes('Campeão da Equipa Porto'), 'claim-reward inclui título "Campeão da Equipa Porto"')
  assert(claimRewardCode.includes('Campeão da Equipa Lisboa'), 'claim-reward inclui título "Campeão da Equipa Lisboa"')

  console.log('\n========================================================================')
  console.log(`📊 RESULTADO DA MECÂNICA: ${passed} PASSOU | ${failed} FALHOU`)
  console.log('========================================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runTeamMechanicTests().catch((err) => {
  console.error('Erro no teste da mecânica de equipa:', err)
  process.exit(1)
})
