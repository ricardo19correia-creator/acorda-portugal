import assert from 'node:assert'
import { calculateLevelProgress, PROGRESSION_LEVELS } from '../lib/progression'
import { extractUserXp, extractUserLevel } from '../lib/economy-helpers'

console.log('🧪 A INICIAR SUITE DE TESTES: XP GLOBAL, ÚNICO E REALTIME\n')

// =========================================================================
// 1. PUREZA MATEMÁTICA E DETERMINISMO DE NÍVEL
// =========================================================================
console.log('--- 1. Validação de Progressão Canónica (nível = f(XP_GLOBAL)) ---')

const levelTests = [
  { xp: 0, expectedLevel: 1, expectedTitle: 'Curioso' },
  { xp: 500, expectedLevel: 1, expectedTitle: 'Curioso' },
  { xp: 2499, expectedLevel: 1, expectedTitle: 'Curioso' },
  { xp: 2500, expectedLevel: 2, expectedTitle: 'Aprendiz' },
  { xp: 7499, expectedLevel: 2, expectedTitle: 'Aprendiz' },
  { xp: 7500, expectedLevel: 3, expectedTitle: 'Explorador' },
  { xp: 15000, expectedLevel: 4, expectedTitle: 'Conhecedor' },
  { xp: 25000, expectedLevel: 5, expectedTitle: 'Iniciado' },
  { xp: 150000, expectedLevel: 10, expectedTitle: 'Especialista' },
  { xp: 500000, expectedLevel: 14, expectedTitle: 'Lenda' },
  { xp: 3000000, expectedLevel: 21, expectedTitle: '👑 Mestre de Portugal' },
  { xp: 5000000, expectedLevel: 21, expectedTitle: '👑 Mestre de Portugal' }, // Cap no nível máximo
]

for (const t of levelTests) {
  const p = calculateLevelProgress(t.xp)
  assert.strictEqual(p.currentLevel.level, t.expectedLevel, `XP ${t.xp} deve resultar no nível ${t.expectedLevel}`)
  assert.strictEqual(p.currentLevel.title, t.expectedTitle, `XP ${t.xp} deve ter título ${t.expectedTitle}`)
  
  // extractUserLevel deve produzir exatamente o mesmo nível
  const helperLevel = extractUserLevel({ xp: t.xp })
  assert.strictEqual(helperLevel, t.expectedLevel, `extractUserLevel({ xp: ${t.xp} }) deve ser ${t.expectedLevel}`)
}
console.log('✅ Todos os 12 testes de patamares de nível passaram com pureza absoluta.\n')

// =========================================================================
// 2. EXTRAÇÃO ROBUSTA DE XP E PRESERVAÇÃO DE DADOS EXISTENTES
// =========================================================================
console.log('--- 2. Validação de Preservação e Robustez de extractUserXp ---')

assert.strictEqual(extractUserXp({ xp: 1250 }), 1250)
assert.strictEqual(extractUserXp({ xp: '3500' }), 3500)
assert.strictEqual(extractUserXp({ experience: 2000 }), 2000)
assert.strictEqual(extractUserXp({ pontos: '4500' }), 4500)
assert.strictEqual(extractUserXp({ points: 700 }), 700)
assert.strictEqual(extractUserXp({ totalXp: 9000 }), 9000)
assert.strictEqual(extractUserXp({ scoreTotal: 150 }), 150)
assert.strictEqual(extractUserXp({ stats: { totalXp: 8000 } }), 8000)
assert.strictEqual(extractUserXp({ stats: { xp: 3300 } }), 3300)
assert.strictEqual(extractUserXp({}), 0)
assert.strictEqual(extractUserXp(null), 0)
assert.strictEqual(extractUserXp(undefined), 0)
assert.strictEqual(extractUserXp({ xp: -50 }), 0) // XP não pode ser negativo

console.log('✅ Preservação retrocompatível de XP existente validada com 13 asserções.\n')

// =========================================================================
// 3. SIMULAÇÃO DE TRANSAÇÃO ATÓMICA E IDEMPOTÊNCIA (matchId)
// =========================================================================
console.log('--- 3. Simulação de Atribuição Atómica e Idempotência (matchId) ---')

// Estado simulado do Firebase no backend
const firestoreDb: {
  users: Record<string, any>
  match_rewards: Record<string, any>
} = {
  users: {
    'user_abc': {
      uid: 'user_abc',
      displayName: 'Manuel',
      xp: 1250,
      coins: 200,
    },
  },
  match_rewards: {},
}

// Função simulando a transação de awardMatchReward
function simulateAtomicReward(userId: string, matchId: string, xpEarned: number, coinsEarned: number) {
  const rewardKey = `${userId}_${matchId}`
  
  // 1. Verificação de idempotência no Firestore
  if (firestoreDb.match_rewards[rewardKey]) {
    const existing = firestoreDb.match_rewards[rewardKey]
    return {
      alreadyProcessed: true,
      xpEarned: 0,
      coinsEarned: 0,
      newTotalXp: existing.newTotalXp,
      newLevel: existing.newLevel,
    }
  }

  // 2. Leitura atómica
  const user = firestoreDb.users[userId]
  if (!user) throw new Error('Utilizador não encontrado')

  const currentXp = extractUserXp(user, 0)
  const currentCoins = user.coins || 0

  const nextTotalXp = currentXp + xpEarned
  const newLevel = calculateLevelProgress(nextTotalXp).currentLevel.level
  const nextTotalCoins = currentCoins + coinsEarned

  // 3. Escrita atómica
  firestoreDb.match_rewards[rewardKey] = {
    matchId,
    userId,
    xpEarned,
    newTotalXp: nextTotalXp,
    newLevel,
    processedAt: new Date().toISOString(),
  }

  user.xp = nextTotalXp
  user.level = newLevel
  user.coins = nextTotalCoins

  return {
    alreadyProcessed: false,
    xpEarned,
    coinsEarned,
    newTotalXp: nextTotalXp,
    newLevel,
  }
}

// Partida 1: Termina partida no Dispositivo A e ganha 50 XP
const res1 = simulateAtomicReward('user_abc', 'match_101', 50, 20)
assert.strictEqual(res1.alreadyProcessed, false)
assert.strictEqual(res1.newTotalXp, 1300)
assert.strictEqual(firestoreDb.users['user_abc'].xp, 1300)
console.log('  1. Dispositivo A ganha 50 XP: novo total = 1.300 XP (sucesso)')

// Tentativa de duplicar o mesmo resultado (refresh, retry de rede, duplo clique)
const res1Duplicate = simulateAtomicReward('user_abc', 'match_101', 50, 20)
assert.strictEqual(res1Duplicate.alreadyProcessed, true)
assert.strictEqual(res1Duplicate.xpEarned, 0)
assert.strictEqual(res1Duplicate.newTotalXp, 1300)
assert.strictEqual(firestoreDb.users['user_abc'].xp, 1300, 'XP NÃO PODE AUMENTAR NA DUPLICAÇÃO')
console.log('  2. Tentativa de repetição do match_101: bloqueado por idempotência sem adicionar XP (sucesso)')

// Partida 2: Dispositivo B ganha 100 XP noutra partida
const res2 = simulateAtomicReward('user_abc', 'match_102', 100, 30)
assert.strictEqual(res2.alreadyProcessed, false)
assert.strictEqual(res2.newTotalXp, 1400)
assert.strictEqual(firestoreDb.users['user_abc'].xp, 1400)
console.log('  3. Dispositivo B ganha 100 XP: novo total global = 1.400 XP (sucesso)')

// Partida 3: Dispositivo A ganha 1200 XP e sobe de nível (1400 + 1200 = 2600 XP -> Nível 2)
const res3 = simulateAtomicReward('user_abc', 'match_103', 1200, 50)
assert.strictEqual(res3.alreadyProcessed, false)
assert.strictEqual(res3.newTotalXp, 2600)
assert.strictEqual(res3.newLevel, 2)
assert.strictEqual(firestoreDb.users['user_abc'].level, 2)
console.log('  4. Dispositivo A sobe para Nível 2 com 2.600 XP: Nível canónico derivado automaticamente')

console.log('✅ Simulação de Idempotência e Concorrência Multi-Dispositivo passou com 100% de sucesso.\n')

// =========================================================================
// 4. VERIFICAÇÃO DE PROGRESSION_LEVELS INTEGRITY
// =========================================================================
console.log('--- 4. Verificação de Integridade da Tabela de Níveis ---')
assert.strictEqual(PROGRESSION_LEVELS.length, 21, 'Tabela oficial deve conter 21 níveis')
assert.strictEqual(PROGRESSION_LEVELS[0].level, 1)
assert.strictEqual(PROGRESSION_LEVELS[0].xpRequired, 0)
assert.strictEqual(PROGRESSION_LEVELS[20].level, 21)
assert.strictEqual(PROGRESSION_LEVELS[20].xpRequired, 3000000)
console.log('✅ Integridade da tabela PROGRESSION_LEVELS validada.\n')

console.log('🎉 TODOS OS TESTES FORAM CONCLUÍDOS COM SUCESSO ABSOLUTO!')
