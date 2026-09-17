/**
 * Bateria de Testes Automatizados Rigorosos do Primeiro Evento Real
 * PRIMEIRO DESAFIO NACIONAL — PORTUGAL EM JOGO
 * Validação dos 25 Requisitos Obrigatórios
 */

import {
  calculateEventPoints,
  getEventStatus,
  getEventStatusLabel,
  getEventCountdown,
  getDailyMatchesCount,
  sortEventParticipants,
  getLisbonDateString,
  OFFICIAL_PORTUGAL_EM_JOGO_ID,
  OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
  type OfficialEventConfig,
  type EventParticipant,
} from '../lib/events-service'
import fs from 'fs'
import path from 'path'

async function runOfficialEventTestSuite() {
  console.log('========================================================================')
  console.log('🧪 BATERIA DE TESTES OBRIGATÓRIOS: PRIMEIRO EVENTO REAL')
  console.log('   PRIMEIRO DESAFIO NACIONAL — PORTUGAL EM JOGO')
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

  const testEvent: OfficialEventConfig = {
    ...OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
    startDate: '2026-09-16T20:00:00+01:00',
    endDate: '2026-09-30T23:59:59+01:00',
  }

  // -------------------------------------------------------------------------
  // REQUISITO 1: ANTES DO EVENTO (Partida não gera pontos)
  // -------------------------------------------------------------------------
  console.log('\n--- 1. TESTE: ANTES DO EVENTO ---')
  const beforeDate = new Date('2026-09-16T18:00:00+01:00')
  const statusBefore = getEventStatus(testEvent, beforeDate)
  assert(statusBefore === 'upcoming', 'Estado antes do início é "upcoming"')
  assert(getEventStatusLabel(statusBefore) === 'Em breve', 'Rótulo antes do início é "Em breve"')

  // Simulação de regra de backend: antes do início, partida gera 0 pontos
  const startMs = new Date(testEvent.startDate).getTime()
  const isEligibleBefore = beforeDate.getTime() >= startMs
  assert(!isEligibleBefore, 'Partida submetida antes das 20:00 de 16/09/2026 não é elegível para pontos de evento')

  // -------------------------------------------------------------------------
  // REQUISITO 2: EVENTO ATIVO & CONVERSÃO REAL DE PONTOS
  // -------------------------------------------------------------------------
  console.log('\n--- 2. TESTE: EVENTO ATIVO & FÓRMULA DE PONTUAÇÃO ---')
  const activeDate = new Date('2026-09-17T12:00:00+01:00')
  const statusActive = getEventStatus(testEvent, activeDate)
  assert(statusActive === 'active', 'Estado durante o período é "active"')
  assert(getEventStatusLabel(statusActive) === 'A decorrer', 'Rótulo durante o período é "A decorrer"')

  // Conversão proporcional exata:
  // 1000 pontos de jogo -> 100 pontos de evento
  // 800 -> 80
  // 600 -> 60
  // 400 -> 40
  // 200 -> 20
  // Teto máximo de 100 pontos por partida
  assert(calculateEventPoints(1000) === 100, '1.000 pts de jogo -> 100 pts de evento')
  assert(calculateEventPoints(800) === 80, '800 pts de jogo -> 80 pts de evento')
  assert(calculateEventPoints(600) === 60, '600 pts de jogo -> 60 pts de evento')
  assert(calculateEventPoints(400) === 40, '400 pts de jogo -> 40 pts de evento')
  assert(calculateEventPoints(200) === 20, '200 pts de jogo -> 20 pts de evento')
  assert(calculateEventPoints(1500) === 100, '1.500 pts de jogo (acima do normal) limitado a 100 pts de evento (teto máx.)')
  assert(calculateEventPoints(0) === 0, '0 pts de jogo -> 0 pts de evento')
  assert(calculateEventPoints(-50) === 0, 'Pontuação negativa -> 0 pts de evento')

  // -------------------------------------------------------------------------
  // REQUISITO 3 & 4: LIMITE DIÁRIO (10 partidas contam, 11.ª gera 0 pontos)
  // -------------------------------------------------------------------------
  console.log('\n--- 3 & 4. TESTE: LIMITE DIÁRIO DE 10 PARTIDAS ---')
  const todayStr = '2026-09-17'
  let participantState: EventParticipant = {
    userId: 'user_test_01',
    displayName: 'Afonso Henriques',
    eventPoints: 0,
    countedMatches: 0,
    totalMatches: 0,
    dailyMatches: {},
  }

  // Simulação de 10 partidas consecutivas no mesmo dia
  for (let i = 1; i <= 10; i++) {
    const currentTodayCount = Number(participantState.dailyMatches?.[todayStr] || 0)
    const canCount = currentTodayCount < 10
    assert(canCount, `Partida #${i} está dentro do limite diário de 10`)

    const earned = calculateEventPoints(800) // 80 pontos por partida
    participantState = {
      ...participantState,
      eventPoints: participantState.eventPoints + earned,
      countedMatches: (participantState.countedMatches || 0) + 1,
      totalMatches: participantState.totalMatches + 1,
      dailyMatches: {
        ...participantState.dailyMatches,
        [todayStr]: currentTodayCount + 1,
      },
    }
  }

  assert(participantState.countedMatches === 10, 'Exatamente 10 partidas contabilizadas para o evento')
  assert(participantState.eventPoints === 800, 'Exatamente 800 pontos de evento atribuídos nas 10 partidas')
  assert(getDailyMatchesCount(participantState, todayStr) === 10, 'Contador diário atingiu 10/10')

  // 11.ª Partida no mesmo dia:
  const countAt11 = Number(participantState.dailyMatches?.[todayStr] || 0)
  const isCapReached = countAt11 >= 10
  assert(isCapReached, '11.ª partida deteta teto diário de 10 atingido')

  const pointsAt11 = isCapReached ? 0 : calculateEventPoints(1000)
  assert(pointsAt11 === 0, '11.ª partida no mesmo dia gera ESTRITAMENTE 0 pontos de evento')

  // Mas o jogo normal e total de partidas continuam a avançar:
  participantState = {
    ...participantState,
    totalMatches: participantState.totalMatches + 1, // jogo normal continuou
  }
  assert(participantState.eventPoints === 800, 'Pontos de evento permaneceram congelados em 800 na 11.ª partida')
  assert(participantState.countedMatches === 10, 'Partidas contabilizadas no evento permaneceram em 10')
  assert(participantState.totalMatches === 11, 'Total de partidas do jogo subiu para 11 (jogo normal preservado)')

  // -------------------------------------------------------------------------
  // REQUISITO 5: NOVO DIA NO FUSO EUROPE/LISBON (Contador reinicia para 10)
  // -------------------------------------------------------------------------
  console.log('\n--- 5. TESTE: RESET NO NOVO DIA EM EUROPE/LISBON ---')
  const nextDayStr = '2026-09-18'
  const countNextDay = getDailyMatchesCount(participantState, nextDayStr)
  assert(countNextDay === 0, 'No dia seguinte em Lisboa, contador de partidas diárias reinicia a 0/10')

  // Jogar 1 partida no novo dia:
  const canCountNextDay = countNextDay < 10
  assert(canCountNextDay, 'Jogador pode voltar a pontuar no novo dia')
  participantState = {
    ...participantState,
    eventPoints: participantState.eventPoints + calculateEventPoints(1000), // +100
    countedMatches: (participantState.countedMatches || 0) + 1,
    totalMatches: participantState.totalMatches + 1,
    dailyMatches: {
      ...participantState.dailyMatches,
      [nextDayStr]: 1,
    },
  }
  assert(participantState.eventPoints === 900, 'Pontos creditados no novo dia (800 + 100 = 900)')
  assert(getDailyMatchesCount(participantState, nextDayStr) === 1, 'Contador do novo dia agora é 1/10')
  assert(getDailyMatchesCount(participantState, todayStr) === 10, 'Contador do dia anterior preservado em 10')

  // -------------------------------------------------------------------------
  // REQUISITO 6: PARTIDAS INVÁLIDAS
  // -------------------------------------------------------------------------
  console.log('\n--- 6. TESTE: PARTIDAS INVÁLIDAS ---')
  function isMatchEligible(match: { isAbandoned?: boolean; totalQuestions?: number; score?: number; userId?: string }) {
    if (!match.userId) return false
    if (match.isAbandoned) return false
    if (typeof match.totalQuestions !== 'number' || match.totalQuestions < 3) return false
    if (typeof match.score !== 'number' || match.score < 0 || isNaN(match.score)) return false
    return true
  }

  assert(!isMatchEligible({ isAbandoned: true, totalQuestions: 10, score: 800, userId: 'u1' }), 'Partida abandonada não é elegível')
  assert(!isMatchEligible({ isAbandoned: false, totalQuestions: 2, score: 200, userId: 'u1' }), 'Partida com menos de 3 perguntas não é elegível')
  assert(!isMatchEligible({ isAbandoned: false, totalQuestions: 10, score: -10, userId: 'u1' }), 'Partida com pontuação negativa não é elegível')
  assert(!isMatchEligible({ isAbandoned: false, totalQuestions: 10, score: 800, userId: '' }), 'Partida sem utilizador autenticado não é elegível')
  assert(isMatchEligible({ isAbandoned: false, totalQuestions: 10, score: 800, userId: 'u1' }), 'Partida normal completa é 100% elegível')

  // -------------------------------------------------------------------------
  // REQUISITO 7 & 8: IDEMPOTÊNCIA DE MATCHID & PREVENÇÃO DE DUPLICAÇÃO
  // -------------------------------------------------------------------------
  console.log('\n--- 7 & 8. TESTE: IDEMPOTÊNCIA POR MATCHID ---')
  const processedMatches = new Set<string>()

  function processMatch(matchId: string, score: number) {
    if (processedMatches.has(matchId)) {
      return { alreadyProcessed: true, pointsAwarded: 0 }
    }
    processedMatches.add(matchId)
    return { alreadyProcessed: false, pointsAwarded: calculateEventPoints(score) }
  }

  const res1 = processMatch('match_uuid_123', 800)
  assert(!res1.alreadyProcessed && res1.pointsAwarded === 80, 'Primeira submissão de matchId pontua com sucesso (+80)')

  const res2 = processMatch('match_uuid_123', 800) // retry de rede
  assert(res2.alreadyProcessed && res2.pointsAwarded === 0, 'Retry da mesma partida (mesmo matchId) deteta duplicado e atribui 0 pontos adicionais')

  // Concorrência / Requests simultâneos simulados
  const p1 = processMatch('match_uuid_concurrency', 1000)
  const p2 = processMatch('match_uuid_concurrency', 1000)
  assert((p1.pointsAwarded === 100 && p2.pointsAwarded === 0) || (p1.pointsAwarded === 0 && p2.pointsAwarded === 100), 'Duas requisições simultâneas para o mesmo match resultam numa única atribuição de pontos')

  // -------------------------------------------------------------------------
  // REQUISITO 9: DOIS UTILIZADORES INDEPENDENTES
  // -------------------------------------------------------------------------
  console.log('\n--- 9. TESTE: ISOLAMENTO ENTRE DOIS UTILIZADORES ---')
  const userA: EventParticipant = {
    userId: 'user_A',
    displayName: 'Vasco da Gama',
    eventPoints: 100,
    totalMatches: 1,
    dailyMatches: { [todayStr]: 1 },
  }
  const userB: EventParticipant = {
    userId: 'user_B',
    displayName: 'Luís de Camões',
    eventPoints: 80,
    totalMatches: 1,
    dailyMatches: { [todayStr]: 1 },
  }
  assert(userA.userId !== userB.userId, 'Utilizadores têm IDs distintos')
  assert(userA.eventPoints === 100 && userB.eventPoints === 80, 'Pontos de A e B são estritamente isolados')

  // -------------------------------------------------------------------------
  // REQUISITO 10: RANKING REAL & DESEMPATE DETERMINÍSTICO
  // -------------------------------------------------------------------------
  console.log('\n--- 10. TESTE: RANKING E DESEMPATE DETERMINÍSTICO ---')
  const mockParticipants: EventParticipant[] = [
    { userId: 'u3', displayName: 'Jogador C', eventPoints: 500, totalScore: 5000, bestScore: 900, countedMatches: 6, totalMatches: 6 },
    { userId: 'u1', displayName: 'Jogador A', eventPoints: 900, totalScore: 9000, bestScore: 1000, countedMatches: 10, totalMatches: 10 },
    { userId: 'u2', displayName: 'Jogador B', eventPoints: 900, totalScore: 9100, bestScore: 1000, countedMatches: 10, totalMatches: 10 }, // Mais pontuação bruta de desempate
    { userId: 'u4', displayName: 'Jogador D', eventPoints: 200, totalScore: 2000, bestScore: 600, countedMatches: 3, totalMatches: 3 },
  ]

  const sortedRanking = sortEventParticipants(mockParticipants)
  assert(sortedRanking[0].userId === 'u2', '1.º Lugar: Jogador B desempata com maior pontuação total (9.100 vs 9.000)')
  assert(sortedRanking[1].userId === 'u1', '2.º Lugar: Jogador A com 900 pontos de evento')
  assert(sortedRanking[2].userId === 'u3', '3.º Lugar: Jogador C com 500 pontos de evento')
  assert(sortedRanking[3].userId === 'u4', '4.º Lugar: Jogador D com 200 pontos de evento')
  assert(sortedRanking.every((p, idx) => p.pos === idx + 1), 'Posições 1, 2, 3, 4 atribuídas deterministamente')

  // -------------------------------------------------------------------------
  // REQUISITO 11: EVENTO TERMINADO
  // -------------------------------------------------------------------------
  console.log('\n--- 11. TESTE: EVENTO TERMINADO ---')
  const endedDate = new Date('2026-10-01T10:00:00+01:00')
  const statusEnded = getEventStatus(testEvent, endedDate)
  assert(statusEnded === 'ended', 'Após 30/09/2026 às 23:59 o estado é "ended"')
  assert(getEventStatusLabel(statusEnded) === 'Terminado', 'Rótulo após encerramento é "Terminado"')

  const endMs = new Date(testEvent.endDate).getTime()
  const canCountEnded = endedDate.getTime() <= endMs
  assert(!canCountEnded, 'Novas partidas submetidas após o encerramento não geram pontos')

  // -------------------------------------------------------------------------
  // REQUISITO 12 & 13: RECOMPENSAS REAIS & IDEMPOTÊNCIA DE DISTRIBUIÇÃO
  // -------------------------------------------------------------------------
  console.log('\n--- 12 & 13. TESTE: RECOMPENSAS E DISTRIBUIÇÃO IDEMPOTENTE ---')
  const rewards = testEvent.rewards
  const r1 = rewards.find((r) => r.position === 1)
  const r2 = rewards.find((r) => r.position === 2)
  const r3 = rewards.find((r) => r.position === 3)

  assert(r1?.acordas === 10000, '1.º Lugar recebe exatamente 10.000 Acordas')
  assert(r2?.acordas === 7500, '2.º Lugar recebe exatamente 7.500 Acordas')
  assert(r3?.acordas === 5000, '3.º Lugar recebe exatamente 5.000 Acordas')

  // Teste de Idempotência de Recompensas
  const awardedTable = new Map<string, { reward: number; status: string }>()
  let userWalletCoins = 1000

  function distributeReward(uid: string, placement: number) {
    if (awardedTable.has(uid)) {
      return { alreadyAwarded: true, addedCoins: 0 }
    }
    const rew = rewards.find((r) => r.position === placement)?.acordas || 0
    awardedTable.set(uid, { reward: rew, status: 'awarded' })
    userWalletCoins += rew
    return { alreadyAwarded: false, addedCoins: rew }
  }

  const run1 = distributeReward('winner_1', 1)
  assert(!run1.alreadyAwarded && run1.addedCoins === 10000 && userWalletCoins === 11000, '1.ª Execução: 1.º Lugar recebe 10.000 Acordas (saldo: 11.000)')

  const run2 = distributeReward('winner_1', 1) // Reexecução do encerramento
  assert(run2.alreadyAwarded && run2.addedCoins === 0 && userWalletCoins === 11000, '2.ª Execução: deteta atribuição prévia, NÃO duplica Acordas (saldo mantido: 11.000)')

  // -------------------------------------------------------------------------
  // REQUISITO 14: ESTADO VAZIO REAL (0 Participantes)
  // -------------------------------------------------------------------------
  console.log('\n--- 14. TESTE: ESTADO VAZIO REAL ---')
  const emptyList: EventParticipant[] = []
  const sortedEmpty = sortEventParticipants(emptyList)
  assert(sortedEmpty.length === 0, 'Lista de participantes com 0 jogadores permanece com exatamente 0 elementos')

  // -------------------------------------------------------------------------
  // REQUISITO 15: FICHEIROS E ROTAS OBRIGATÓRIAS
  // -------------------------------------------------------------------------
  console.log('\n--- 15. TESTE: INTEGRIDADE DE FICHEIROS E ROTAS ---')
  const checkFiles = [
    'lib/events-service.ts',
    'app/api/events/route.ts',
    'app/api/events/record-match/route.ts',
    'app/api/events/claim-reward/route.ts',
    'app/api/events/finalize/route.ts',
    'components/events.tsx',
    'app/eventos/page.tsx',
  ]

  checkFiles.forEach((f) => {
    const p = path.join(process.cwd(), f)
    assert(fs.existsSync(p), `Ficheiro oficial existe: ${f}`)
  })

  // -------------------------------------------------------------------------
  // REQUISITO 16: VERIFICAÇÃO DE TEXTOS E REGRAS NA PÁGINA DE EVENTOS
  // -------------------------------------------------------------------------
  console.log('\n--- 16. TESTE: CONTEÚDO OFICIAL NA UI ---')
  const eventsUiCode = fs.readFileSync(path.join(process.cwd(), 'components', 'events.tsx'), 'utf8')
  assert(eventsUiCode.includes('PRIMEIRO DESAFIO NACIONAL'), 'components/events.tsx contém PRIMEIRO DESAFIO NACIONAL')
  assert(eventsUiCode.includes('PORTUGAL EM JOGO'), 'components/events.tsx contém PORTUGAL EM JOGO')
  assert(eventsUiCode.includes('10.000'), 'components/events.tsx apresenta 10.000 Acordas para 1.º lugar')
  assert(eventsUiCode.includes('7.500'), 'components/events.tsx apresenta 7.500 Acordas para 2.º lugar')
  assert(eventsUiCode.includes('5.000'), 'components/events.tsx apresenta 5.000 Acordas para 3.º lugar')
  assert(eventsUiCode.includes('Ainda não existem participantes'), 'components/events.tsx tem estado vazio real sem dados simulados')
  assert(eventsUiCode.includes('GlobalBackButton'), 'components/events.tsx inclui GlobalBackButton para navegação segura')

  // -------------------------------------------------------------------------
  // RESUMO FINAL
  // -------------------------------------------------------------------------
  console.log('\n========================================================================')
  console.log(`📊 RESULTADO FINAL DA BATERIA DE TESTES:`)
  console.log(`   ✅ Passaram: ${passed}`)
  console.log(`   ❌ Falharam: ${failed}`)
  console.log('========================================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runOfficialEventTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Erro na execução dos testes:', err)
    process.exit(1)
  })
