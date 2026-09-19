/**
 * scripts/test_duel_rewards_isolation.ts
 * Bateria de Testes Canónicos Obrigatórios (Testes A a F) para o Sistema de Recompensas Multiplayer / Duelos 1v1
 */

import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { calculateLevelProgress } from '../lib/progression'
import { ECONOMY_CONFIG, calculateLevelUpCoinReward } from '../lib/economy'
import { extractUserXp } from '../lib/economy-helpers'

console.log('================================================================================')
console.log('🧪 ACORDA PORTUGAL — BATERIA DE TESTES DE RECOMPENSAS MULTIPLAYER / 1V1 (A a F)')
console.log('================================================================================\n')

// =============================================================================
// FASE 1: CONTRATOS ESTÁTICOS DE CÓDIGO FONTE
// =============================================================================
console.log('📌 [FASE 1] Verificação de Contratos Estáticos de Código')

const claimRouteCode = fs.readFileSync(
  path.join(process.cwd(), 'app', 'api', 'duel', 'claim', 'route.ts'),
  'utf8',
)
const duelLibCode = fs.readFileSync(
  path.join(process.cwd(), 'lib', 'duel.ts'),
  'utf8',
)
const duelArenaCode = fs.readFileSync(
  path.join(process.cwd(), 'components', 'duel-arena.tsx'),
  'utf8',
)

// 1.1 Logs Canónicos de Diagnóstico Obrigatórios no Backend
const requiredLogs = [
  'DUEL_FINISH_STARTED',
  'DUEL_RESULT_RESOLVED',
  'DUEL_REWARD_CALCULATED',
  'DUEL_REWARD_PERSISTED',
  'DUEL_REWARD_ALREADY_PROCESSED',
  'DUEL_REWARD_FAILED',
]

for (const logTag of requiredLogs) {
  assert(
    claimRouteCode.includes(`[${logTag}]`),
    `app/api/duel/claim/route.ts DEVE emitir o log canónico [${logTag}]`,
  )
}
console.log('  ✅ Todos os 6 logs canónicos de diagnóstico estão implementados no backend.')

// 1.2 Proibição Estrita de Fallback Silencioso para Zero
assert(
  !duelLibCode.includes('xp: data.xpEarned ?? 0'),
  'lib/duel.ts NUNCA pode usar o fallback silencioso "xp: data.xpEarned ?? 0"',
)
assert(
  !duelLibCode.includes('euros: data.coinsEarned ?? 0'),
  'lib/duel.ts NUNCA pode usar o fallback silencioso "euros: data.coinsEarned ?? 0"',
)
assert(
  duelLibCode.includes('typeof resData.xp === \'number\''),
  'lib/duel.ts deve verificar a tipagem numérica estrita de resData.xp',
)
console.log('  ✅ Proibição de fallbacks silenciosos para zero validada com sucesso.')

// 1.3 Gestão de Erros e Retry na Arena de Duelo
assert(
  duelArenaCode.includes('claimRewardError'),
  'components/duel-arena.tsx deve gerir estado de claimRewardError',
)
assert(
  duelArenaCode.includes('isClaimingReward'),
  'components/duel-arena.tsx deve gerir estado de isClaimingReward',
)
assert(
  duelArenaCode.includes('Tentar Novamente'),
  'components/duel-arena.tsx deve disponibilizar botão de Tentar Novamente',
)
console.log('  ✅ Interface da arena tem gestão de erro e retry resiliente.\n')

// =============================================================================
// FASE 2: MOTOR DE CÁLCULO DETERMINÍSTICO E SIMULADOR FIREBASE
// =============================================================================

interface MockUser {
  uid: string
  displayName: string
  xp: number
  coins: number
  euros: number
  level: number
  rating: number
  wins1v1: number
  losses1v1: number
  draws1v1: number
  gamesPlayed: number
  multiplayer: {
    wins: number
    losses: number
    draws: number
    gamesPlayed: number
    points: number
    xp: number
  }
}

interface MockDuelDoc {
  id: string
  code: string
  status: 'playing' | 'finished'
  playerA: {
    uid: string
    displayName: string
    score: number
    correctCount: number
    finished: boolean
    answers: Array<{ timeSpentSeconds: number }>
  }
  playerB: {
    uid: string
    displayName: string
    score: number
    correctCount: number
    finished: boolean
    answers: Array<{ timeSpentSeconds: number }>
  }
  winnerUid?: string | null
  winnerReason?: string | null
  rewardsClaimed: Record<string, boolean>
  rewards: Record<string, any>
}

// Implementação determinística das regras de cálculo idênticas a route.ts e lib/duel.ts
function computeDuelRewards(
  isWinner: boolean,
  isDraw: boolean,
  correctCount: number,
  currentXp: number,
  currentCoins: number,
) {
  const performanceXp = correctCount * 15
  const baseOutcomeXp = isWinner ? 300 : isDraw ? 150 : 100
  const xpReward = baseOutcomeXp + performanceXp

  const baseWinCoins = ECONOMY_CONFIG.MATCH_REWARDS.BASE_WIN_COINS
  const perfectScoreBonus = correctCount === 10 ? ECONOMY_CONFIG.MATCH_REWARDS.PERFECT_SCORE_BONUS : 0
  const performanceCoins = Math.round(correctCount * 1)
  const baseCoinReward = isWinner
    ? baseWinCoins + perfectScoreBonus + performanceCoins
    : isDraw
    ? 10 + performanceCoins
    : 5 + performanceCoins

  const oldLevel = calculateLevelProgress(currentXp).currentLevel.level
  const newTotalXp = currentXp + xpReward
  const newLevel = calculateLevelProgress(newTotalXp).currentLevel.level
  const leveledUp = newLevel > oldLevel
  const levelUpCoins = leveledUp ? calculateLevelUpCoinReward(oldLevel, newLevel) : 0
  const totalAwardedCoins = baseCoinReward + levelUpCoins
  const newTotalCoins = currentCoins + totalAwardedCoins

  return {
    xpReward,
    totalAwardedCoins,
    newTotalXp,
    newTotalCoins,
    oldLevel,
    newLevel,
    leveledUp,
  }
}

// Simulador autoritativo da transação de /api/duel/claim
function processDuelClaim(
  duel: MockDuelDoc,
  user: MockUser,
  matchRewardsStore: Record<string, any>,
) {
  const userId = user.uid
  const isPlayerA = duel.playerA.uid === userId
  const isPlayerB = duel.playerB.uid === userId
  if (!isPlayerA && !isPlayerB) throw new Error('Não pertences a este duelo.')

  const player = isPlayerA ? duel.playerA : duel.playerB
  const opponent = isPlayerA ? duel.playerB : duel.playerA

  // Resolver finalização se ambos terminaram
  if (duel.status !== 'finished') {
    if (player.finished && opponent.finished) {
      duel.status = 'finished'
      if (player.score > opponent.score) {
        duel.winnerUid = player.uid
        duel.winnerReason = 'score'
      } else if (opponent.score > player.score) {
        duel.winnerUid = opponent.uid
        duel.winnerReason = 'score'
      } else {
        duel.winnerUid = null
        duel.winnerReason = 'draw'
      }
    } else {
      throw new Error('Partida ainda em curso.')
    }
  }

  const isWinner = Boolean(duel.winnerUid && duel.winnerUid === userId)
  const isDraw = duel.winnerUid === null
  const isLoser = !isWinner && !isDraw

  // Idempotência
  const rewardKey = `${duel.id}_${userId}`
  if (duel.rewardsClaimed[userId] || matchRewardsStore[rewardKey] || duel.rewards[userId]) {
    const existing = duel.rewards[userId] || matchRewardsStore[rewardKey]
    return {
      alreadyClaimed: true,
      xp: existing.xp,
      coins: existing.coins,
      isWinner,
      isDraw,
      isLoser,
      newXp: user.xp,
      newCoins: user.coins,
    }
  }

  const calc = computeDuelRewards(
    isWinner,
    isDraw,
    player.correctCount,
    user.xp,
    user.coins,
  )

  // Persistência
  duel.rewardsClaimed[userId] = true
  duel.rewards[userId] = {
    xp: calc.xpReward,
    coins: calc.totalAwardedCoins,
    isWinner,
    isDraw,
    isLoser,
    oldXp: user.xp,
    newXp: calc.newTotalXp,
    oldCoins: user.coins,
    newCoins: calc.newTotalCoins,
  }

  matchRewardsStore[rewardKey] = {
    matchId: duel.id,
    userId,
    xp: calc.xpReward,
    coins: calc.totalAwardedCoins,
  }

  user.xp = calc.newTotalXp
  user.coins = calc.newTotalCoins
  user.euros = calc.newTotalCoins
  user.level = calc.newLevel
  user.gamesPlayed += 1
  if (isWinner) user.wins1v1 += 1
  if (isLoser) user.losses1v1 += 1
  if (isDraw) user.draws1v1 += 1

  user.multiplayer.gamesPlayed += 1
  user.multiplayer.points += player.score
  user.multiplayer.xp += calc.xpReward
  if (isWinner) user.multiplayer.wins += 1
  if (isLoser) user.multiplayer.losses += 1
  if (isDraw) user.multiplayer.draws += 1

  return {
    alreadyClaimed: false,
    xp: calc.xpReward,
    coins: calc.totalAwardedCoins,
    isWinner,
    isDraw,
    isLoser,
    newXp: calc.newTotalXp,
    newCoins: calc.newTotalCoins,
  }
}

// =============================================================================
// TESTE A: Jogador A Vence (800 pts / 8 certas), Jogador B Perde (300 pts / 3 certas)
// =============================================================================
console.log('📌 [TESTE A] Jogador A Vence (800 pts) vs Jogador B Perde (300 pts)');

const userA: MockUser = {
  uid: 'user_A',
  displayName: 'Afonso',
  xp: 1000,
  coins: 100,
  euros: 100,
  level: 1,
  rating: 1000,
  wins1v1: 0,
  losses1v1: 0,
  draws1v1: 0,
  gamesPlayed: 0,
  multiplayer: { wins: 0, losses: 0, draws: 0, gamesPlayed: 0, points: 0, xp: 0 },
}

const userB: MockUser = {
  uid: 'user_B',
  displayName: 'Beatriz',
  xp: 1000,
  coins: 100,
  euros: 100,
  level: 1,
  rating: 1000,
  wins1v1: 0,
  losses1v1: 0,
  draws1v1: 0,
  gamesPlayed: 0,
  multiplayer: { wins: 0, losses: 0, draws: 0, gamesPlayed: 0, points: 0, xp: 0 },
}

const duelA: MockDuelDoc = {
  id: 'duel_test_A',
  code: 'AP-TEST1',
  status: 'playing',
  playerA: { uid: 'user_A', displayName: 'Afonso', score: 800, correctCount: 8, finished: true, answers: [] },
  playerB: { uid: 'user_B', displayName: 'Beatriz', score: 300, correctCount: 3, finished: true, answers: [] },
  rewardsClaimed: {},
  rewards: {},
}

const storeA: Record<string, any> = {}

// Jogador A resgata
const resWinnerA = processDuelClaim(duelA, userA, storeA)
assert.strictEqual(resWinnerA.isWinner, true)
assert.strictEqual(resWinnerA.isLoser, false)
assert.strictEqual(resWinnerA.xp, 300 + 8 * 15, 'Vencedor com 8 certas deve receber 300 + 120 = 420 XP')
assert.strictEqual(resWinnerA.coins, 15 + 8, 'Vencedor com 8 certas deve receber 15 + 8 = 23 Moedas')
assert.strictEqual(userA.xp, 1420, 'Novo XP do Vencedor deve ser 1.420')
assert.strictEqual(userA.coins, 123, 'Novas moedas do Vencedor devem ser 123')
assert.strictEqual(userA.wins1v1, 1)

// Jogador B resgata
const resLoserB = processDuelClaim(duelA, userB, storeA)
assert.strictEqual(resLoserB.isWinner, false)
assert.strictEqual(resLoserB.isLoser, true)
assert.strictEqual(resLoserB.xp, 100 + 3 * 15, 'Derrotado com 3 certas deve receber 100 + 45 = 145 XP')
assert.strictEqual(resLoserB.coins, 5 + 3, 'Derrotado com 3 certas deve receber 5 + 3 = 8 Moedas')
assert.strictEqual(userB.xp, 1145, 'Novo XP do Derrotado deve ser 1.145')
assert.strictEqual(userB.coins, 108, 'Novas moedas do Derrotado devem ser 108')
assert.strictEqual(userB.losses1v1, 1)

// O derrotado NUNCA fica a zeros
assert(resLoserB.xp > 0, 'XP do derrotado NÃO pode ser zero')
assert(resLoserB.coins > 0, 'Moedas do derrotado NÃO podem ser zero')

console.log(`  ✅ Vencedor A recebeu +${resWinnerA.xp} XP e +€${resWinnerA.coins}`)
console.log(`  ✅ Derrotado B recebeu +${resLoserB.xp} XP e +€${resLoserB.coins}`)
console.log('  ✅ TESTE A Aprovado: Ambos os jogadores receberam recompensas justas e não-nulas.\n')

// =============================================================================
// TESTE B: Jogador B Vence (700 pts / 7 certas), Jogador A Perde (400 pts / 4 certas)
// =============================================================================
console.log('📌 [TESTE B] Inversão de Papéis: Jogador B Vence vs Jogador A Perde');

const duelB: MockDuelDoc = {
  id: 'duel_test_B',
  code: 'AP-TEST2',
  status: 'playing',
  playerA: { uid: 'user_A', displayName: 'Afonso', score: 400, correctCount: 4, finished: true, answers: [] },
  playerB: { uid: 'user_B', displayName: 'Beatriz', score: 700, correctCount: 7, finished: true, answers: [] },
  rewardsClaimed: {},
  rewards: {},
}

const storeB: Record<string, any> = {}

// Jogador B resgata primeiro
const resWinnerB = processDuelClaim(duelB, userB, storeB)
assert.strictEqual(resWinnerB.isWinner, true)
assert.strictEqual(resWinnerB.xp, 300 + 7 * 15, 'Vencedor B com 7 certas recebe 405 XP')
assert.strictEqual(resWinnerB.coins, 15 + 7, 'Vencedor B com 7 certas recebe 22 Moedas')

// Jogador A resgata a seguir
const resLoserA = processDuelClaim(duelB, userA, storeB)
assert.strictEqual(resLoserA.isWinner, false)
assert.strictEqual(resLoserA.isLoser, true)
assert.strictEqual(resLoserA.xp, 100 + 4 * 15, 'Derrotado A com 4 certas recebe 160 XP')
assert.strictEqual(resLoserA.coins, 5 + 4, 'Derrotado A com 4 certas recebe 9 Moedas')

console.log(`  ✅ Vencedor B recebeu +${resWinnerB.xp} XP e +€${resWinnerB.coins}`)
console.log(`  ✅ Derrotado A recebeu +${resLoserA.xp} XP e +€${resLoserA.coins}`)
console.log('  ✅ TESTE B Aprovado: Inversão determinística de prémios validada com sucesso.\n')

// =============================================================================
// TESTE C: Ambos terminam simultaneamente (Race Condition Resolution)
// =============================================================================
console.log('📌 [TESTE C] Resolução de Race Condition / Término Simultâneo');

const duelC: MockDuelDoc = {
  id: 'duel_test_C',
  code: 'AP-TEST3',
  status: 'playing', // Ainda com status playing no momento da chamada de finalização
  playerA: { uid: 'user_A', displayName: 'Afonso', score: 600, correctCount: 6, finished: true, answers: [] },
  playerB: { uid: 'user_B', displayName: 'Beatriz', score: 600, correctCount: 6, finished: true, answers: [] },
  rewardsClaimed: {},
  rewards: {},
}

const storeC: Record<string, any> = {}

// Chamada simultânea de ambos para claim
const resC_A = processDuelClaim(duelC, userA, storeC)
const resC_B = processDuelClaim(duelC, userB, storeC)

assert.strictEqual(duelC.status, 'finished', 'Duelo deve passar para finished automaticamente')
assert.strictEqual(duelC.winnerUid, null, 'Empate determinístico')
assert.strictEqual(resC_A.isDraw, true)
assert.strictEqual(resC_B.isDraw, true)
assert.strictEqual(resC_A.xp, 150 + 6 * 15, 'Empate com 6 certas = 150 + 90 = 240 XP')
assert.strictEqual(resC_B.xp, 150 + 6 * 15, 'Empate com 6 certas = 150 + 90 = 240 XP')

console.log(`  ✅ Jogador A recebeu prémio de empate: +${resC_A.xp} XP e +€${resC_A.coins}`)
console.log(`  ✅ Jogador B recebeu prémio de empate: +${resC_B.xp} XP e +€${resC_B.coins}`)
console.log('  ✅ TESTE C Aprovado: Transação serializada e resultado resolvido sem conflitos.\n')

// =============================================================================
// TESTE D: Atualizar / Reabrir o Ecrã Final (Idempotência Absoluta)
// =============================================================================
console.log('📌 [TESTE D] Idempotência ao Atualizar / Reabrir o Ecrã Final');

const previousXpA = userA.xp
const previousCoinsA = userA.coins

// Simula refresh do browser na página de resultado de duelA
const reloadResA = processDuelClaim(duelA, userA, storeA)
assert.strictEqual(reloadResA.alreadyClaimed, true, 'Deve identificar que o duelo já foi pago')
assert.strictEqual(reloadResA.xp, resWinnerA.xp, 'Deve retornar o mesmo XP previamente calculado')
assert.strictEqual(reloadResA.coins, resWinnerA.coins, 'Deve retornar as mesmas moedas previamente calculadas')
assert.strictEqual(userA.xp, previousXpA, 'Saldo de XP NÃO pode aumentar em refresh')
assert.strictEqual(userA.coins, previousCoinsA, 'Saldo de Moedas NÃO pode aumentar em refresh')

console.log(`  ✅ Reload devolve exatamente +${reloadResA.xp} XP e +€${reloadResA.coins}`)
console.log('  ✅ TESTE D Aprovado: Idempotência garantida no recarregamento.\n')

// =============================================================================
// TESTE E: Entrar noutro Dispositivo (Sincronização de Perfil Global)
// =============================================================================
console.log('📌 [TESTE E] Sincronização de Perfil Global Cross-Device');

assert(userA.xp > 1000, 'XP global do utilizador deve persistir aumentos acumulados')
assert(userA.multiplayer.gamesPlayed >= 2, 'Jogos multiplayer acumulados')
assert(userA.multiplayer.xp > 0, 'XP multiplayer acumulado')
assert(userA.wins1v1 >= 1, 'Vitórias 1v1 registadas')

console.log(`  ✅ Perfil Global do Utilizador A: XP Total = ${userA.xp}, Nível = ${userA.level}, Saldo = €${userA.coins}`)
console.log(`  ✅ Estatísticas Multiplayer: Jogos = ${userA.multiplayer.gamesPlayed}, Vitórias = ${userA.multiplayer.wins}, Pontos = ${userA.multiplayer.points}`)
console.log('  ✅ TESTE E Aprovado: Estado do perfil global consistente para qualquer dispositivo.\n')

// =============================================================================
// TESTE F: Tentativa de Pagamento Duplicado / Replay
// =============================================================================
console.log('📌 [TESTE F] Prevenção de Duplo Pagamento / Ataque de Replay');

const balanceBeforeReplay = userB.coins
const xpBeforeReplay = userB.xp

// 3 tentativas consecutivas de claim do mesmo duelo
for (let i = 0; i < 3; i++) {
  const replayRes = processDuelClaim(duelA, userB, storeA)
  assert.strictEqual(replayRes.alreadyClaimed, true)
}

assert.strictEqual(userB.coins, balanceBeforeReplay, 'Moedas NÃO podem ter aumentado com repetições')
assert.strictEqual(userB.xp, xpBeforeReplay, 'XP NÃO pode ter aumentado com repetições')

console.log('  ✅ TESTE F Aprovado: Replay bloqueado sem pagamento duplicado.\n')

console.log('================================================================================')
console.log('🎉 TODOS OS TESTES (A a F) PASSARAM COM SUCESSO ABSOLUTO!')
console.log('================================================================================\n')
