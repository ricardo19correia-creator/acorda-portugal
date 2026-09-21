import path from 'path'
process.loadEnvFile(path.resolve('.env.local'))
import { syncClockSkewIfAny, getAdminFirestore } from '../lib/firebase-admin'
import { OFFICIAL_PORTO_LISBOA_ID, OFFICIAL_PORTO_LISBOA_SLUG } from '../lib/events-service'
import { POST as selectTeamHandler } from '../app/api/events/select-team/route'
import { POST as recordMatchHandler } from '../app/api/events/record-match/route'
import { NextRequest } from 'next/server'

async function runMultiUserTest() {
  console.log('=== INICIANDO TESTE MULTI-USER DO GRANDE DUELO (PORTO VS LISBOA) ===')
  await syncClockSkewIfAny()

  const db = getAdminFirestore()
  const eventRef = db.collection('events').doc(OFFICIAL_PORTO_LISBOA_ID)

  // 0. RESET PRÉVIO DO EVENTO E DOS UTILIZADORES DE TESTE
  console.log('\n--- 0. Limpando dados de teste ---')
  const testUserAId = 'test_player_porto_800'
  const testUserBId = 'test_player_lisboa_600'

  // Limpar utilizadores teste
  await db.collection('users').doc(testUserAId).delete().catch(() => {})
  await db.collection('users').doc(testUserBId).delete().catch(() => {})
  await eventRef.collection('participants').doc(testUserAId).delete().catch(() => {})
  await eventRef.collection('participants').doc(testUserBId).delete().catch(() => {})

  // Reset base do evento
  await eventRef.set({
    id: OFFICIAL_PORTO_LISBOA_ID,
    name: 'PORTO ⚔️ LISBOA — O GRANDE DUELO',
    title: 'PORTO ⚔️ LISBOA',
    subtitle: 'O GRANDE DUELO',
    tag: 'Grande Duelo',
    type: 'Grande Duelo',
    theme: 'Porto, Lisboa, FC Porto, SL Benfica e Confrontos Diretos',
    category: 'porto-vs-lisboa',
    slug: OFFICIAL_PORTO_LISBOA_SLUG,
    pointDivisor: 1,
    maxEventPointsPerMatch: 3000,
    dailyMatchLimit: 10,
    published: true,
    active: true,
    enabled: true,
    totalParticipants: 0,
    totalMatches: 0,
    totalPoints: 0,
    teams: {
      porto: {
        id: 'porto',
        name: 'Equipa Porto',
        shortName: 'Porto',
        city: 'Porto',
        club: 'FC Porto',
        color: 'blue',
        points: 0,
        playerCount: 0,
        matchesPlayed: 0,
      },
      lisboa: {
        id: 'lisboa',
        name: 'Equipa Lisboa',
        shortName: 'Lisboa',
        city: 'Lisboa',
        club: 'SL Benfica',
        color: 'red',
        points: 0,
        playerCount: 0,
        matchesPlayed: 0,
      },
    },
  })
  console.log('✅ Evento resetado para 0 pontos, 0 jogadores, 0 partidas.')

  // Criar documentos de utilizador para teste no auth/db
  await db.collection('users').doc(testUserAId).set({
    displayName: 'Tripeiro Fanático',
    username: 'tripeiro_800',
    district: 'Porto',
    createdAt: new Date().toISOString(),
  })
  await db.collection('users').doc(testUserBId).set({
    displayName: 'Alfacinha Fiel',
    username: 'alfacinha_600',
    district: 'Lisboa',
    createdAt: new Date().toISOString(),
  })

  // =========================================================================
  // 1. TESTE UTILIZADOR A: ESCOLHA DA EQUIPA PORTO
  // =========================================================================
  console.log('\n--- 1. Utilizador A escolhe EQUIPA PORTO ---')
  const teamReqA = new NextRequest('http://localhost:3000/api/events/select-team', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer test-token-${testUserAId}`,
    },
    body: JSON.stringify({
      eventId: OFFICIAL_PORTO_LISBOA_ID,
      team: 'porto',
      userId: testUserAId,
    }),
  })
  const teamResA = await selectTeamHandler(teamReqA)
  const teamDataA = await teamResA.json()
  console.log('Resposta select-team Utilizador A:', teamDataA)
  if (!teamDataA.success) throw new Error('Falha na seleção de equipa do Jogador A')

  const partASnap = await eventRef.collection('participants').doc(testUserAId).get()
  const partA = partASnap.data()!
  console.log('Participante A na BD:', {
    userId: partA.userId,
    team: partA.team,
    totalPoints: partA.totalPoints,
    gamesPlayed: partA.gamesPlayed,
  })
  if (partA.team !== 'porto') throw new Error('Equipa de A não é porto')
  if (partA.totalPoints !== 0 || partA.gamesPlayed !== 0) throw new Error('A deve iniciar a 0 pontos e 0 jogos')

  // =========================================================================
  // 2. TESTE UTILIZADOR A: JOGA PARTIDA E GANHA 800 PONTOS REAIS
  // =========================================================================
  console.log('\n--- 2. Utilizador A joga partida e ganha 800 PONTOS REAIS ---')
  const gameIdA = 'match_test_user_a_800_pts'
  const matchReqA = new NextRequest('http://localhost:3000/api/events/record-match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer test-token-${testUserAId}`,
    },
    body: JSON.stringify({
      gameId: gameIdA,
      eventId: OFFICIAL_PORTO_LISBOA_ID,
      eventSlug: OFFICIAL_PORTO_LISBOA_SLUG,
      categorySlug: 'porto-vs-lisboa',
      score: 800,
      correctAnswers: 10,
      totalQuestions: 10,
      userId: testUserAId,
    }),
  })
  const matchResA = await recordMatchHandler(matchReqA)
  const matchDataA = await matchResA.json()
  console.log('Resposta record-match Utilizador A:', matchDataA)
  if (!matchDataA.success) throw new Error('Falha ao registar partida de A')
  if (matchDataA.eventPointsAdded !== 800) throw new Error(`Esperado 800 pontos, recebido: ${matchDataA.eventPointsAdded}`)

  // Verificar documento do evento após partida de A
  let eventDoc = (await eventRef.get()).data()!
  console.log('Estado do Evento após partida de A:', {
    portoPoints: eventDoc.teams?.porto?.points,
    portoMatches: eventDoc.teams?.porto?.matchesPlayed,
    lisboaPoints: eventDoc.teams?.lisboa?.points,
    totalMatches: eventDoc.totalMatches,
    totalPoints: eventDoc.totalPoints,
  })
  if (eventDoc.teams?.porto?.points !== 800) throw new Error(`Porto devia ter 800 pts, tem: ${eventDoc.teams?.porto?.points}`)
  if (eventDoc.teams?.porto?.matchesPlayed !== 1) throw new Error('Porto devia ter 1 partida jogada')
  if (eventDoc.totalMatches !== 1) throw new Error('Total matches devia ser 1')
  if (eventDoc.totalPoints !== 800) throw new Error('Total points devia ser 800')

  // =========================================================================
  // 3. TESTE DE IDEMPOTÊNCIA: RE-SUBMETER A MESMA PARTIDA NÃO DEVE DUPLICAR
  // =========================================================================
  console.log('\n--- 3. Teste de Idempotência: re-submeter partida de A ---')
  const dupMatchReqA = new NextRequest('http://localhost:3000/api/events/record-match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer test-token-${testUserAId}`,
    },
    body: JSON.stringify({
      gameId: gameIdA,
      eventId: OFFICIAL_PORTO_LISBOA_ID,
      score: 800,
      correctAnswers: 10,
      totalQuestions: 10,
      userId: testUserAId,
    }),
  })
  const dupResA = await recordMatchHandler(dupMatchReqA)
  const dupDataA = await dupResA.json()
  console.log('Resposta re-submissão:', dupDataA)
  if (!dupDataA.alreadyProcessed) throw new Error('Deveria retornar alreadyProcessed: true')

  // Verificar que os pontos não duplicaram
  eventDoc = (await eventRef.get()).data()!
  if (eventDoc.teams?.porto?.points !== 800) throw new Error('Pontos duplicaram na re-submissão!')
  if (eventDoc.teams?.porto?.matchesPlayed !== 1) throw new Error('Partidas duplicaram na re-submissão!')

  // =========================================================================
  // 4. TESTE UTILIZADOR B: ESCOLHA DA EQUIPA LISBOA
  // =========================================================================
  console.log('\n--- 4. Utilizador B escolhe EQUIPA LISBOA ---')
  const teamReqB = new NextRequest('http://localhost:3000/api/events/select-team', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer test-token-${testUserBId}`,
    },
    body: JSON.stringify({
      eventId: OFFICIAL_PORTO_LISBOA_ID,
      team: 'lisboa',
      userId: testUserBId,
    }),
  })
  const teamResB = await selectTeamHandler(teamReqB)
  const teamDataB = await teamResB.json()
  console.log('Resposta select-team Utilizador B:', teamDataB)
  if (!teamDataB.success) throw new Error('Falha na seleção de equipa do Jogador B')

  // =========================================================================
  // 5. TESTE UTILIZADOR B: JOGA PARTIDA E GANHA 600 PONTOS REAIS
  // =========================================================================
  console.log('\n--- 5. Utilizador B joga partida e ganha 600 PONTOS REAIS ---')
  const gameIdB = 'match_test_user_b_600_pts'
  const matchReqB = new NextRequest('http://localhost:3000/api/events/record-match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer test-token-${testUserBId}`,
    },
    body: JSON.stringify({
      gameId: gameIdB,
      eventId: OFFICIAL_PORTO_LISBOA_ID,
      eventSlug: OFFICIAL_PORTO_LISBOA_SLUG,
      categorySlug: 'porto-vs-lisboa',
      score: 600,
      correctAnswers: 8,
      totalQuestions: 10,
      userId: testUserBId,
    }),
  })
  const matchResB = await recordMatchHandler(matchReqB)
  const matchDataB = await matchResB.json()
  console.log('Resposta record-match Utilizador B:', matchDataB)
  if (!matchDataB.success) throw new Error('Falha ao registar partida de B')
  if (matchDataB.eventPointsAdded !== 600) throw new Error(`Esperado 600 pontos, recebido: ${matchDataB.eventPointsAdded}`)

  // Verificar estado consolidado na BD
  eventDoc = (await eventRef.get()).data()!
  console.log('\n--- Estado Consolidado do Evento na Base de Dados ---', {
    portoPoints: eventDoc.teams?.porto?.points,
    portoPlayers: eventDoc.teams?.porto?.playerCount,
    portoMatches: eventDoc.teams?.porto?.matchesPlayed,
    lisboaPoints: eventDoc.teams?.lisboa?.points,
    lisboaPlayers: eventDoc.teams?.lisboa?.playerCount,
    lisboaMatches: eventDoc.teams?.lisboa?.matchesPlayed,
    totalParticipants: eventDoc.totalParticipants,
    totalMatches: eventDoc.totalMatches,
    totalPoints: eventDoc.totalPoints,
  })

  if (eventDoc.teams?.porto?.points !== 800) throw new Error('Porto deve ter 800 pts')
  if (eventDoc.teams?.lisboa?.points !== 600) throw new Error('Lisboa deve ter 600 pts')
  if (eventDoc.totalPoints !== 1400) throw new Error('Total do evento deve ser 1400 pts (800 + 600)')
  if (eventDoc.totalMatches !== 2) throw new Error('Total de partidas do evento deve ser 2')
  if (eventDoc.totalParticipants !== 2) throw new Error('Total de participantes do evento deve ser 2')

  // =========================================================================
  // 6. TESTE DE BLOQUEIO DE TROCA DE EQUIPA (ANTI-SWAP)
  // =========================================================================
  console.log('\n--- 6. Teste de Bloqueio de Troca de Equipa (Jogador A tenta mudar para Lisboa) ---')
  const swapReq = new NextRequest('http://localhost:3000/api/events/select-team', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer test-token-${testUserAId}`,
    },
    body: JSON.stringify({
      eventId: OFFICIAL_PORTO_LISBOA_ID,
      team: 'lisboa',
      userId: testUserAId,
    }),
  })
  const swapRes = await selectTeamHandler(swapReq)
  const swapData = await swapRes.json()
  console.log('Resposta tentativa de troca:', swapData)
  const partCheckA = (await eventRef.collection('participants').doc(testUserAId).get()).data()!
  if (partCheckA.team !== 'porto') throw new Error('Jogador A conseguiu mudar de equipa indevidamente!')
  console.log('✅ Equipa do Jogador A manteve-se bloqueada no PORTO.')

  console.log('\n🎉 TODOS OS TESTES MULTI-USER PASSARAM COM DISTINÇÃO!')
}

runMultiUserTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ ERRO NO TESTE:', err)
    process.exit(1)
  })
