/**
 * Teste de Validação Rigorosa da Fonte Única da Verdade (SSOT) de Estatísticas do Utilizador
 * Executa verificações matemáticas e de integridade em todos os cenários.
 */

import {
  getUserGameStats,
  getUserDuelStats,
  getUserMatchStats,
  getUserAnswerStats,
  getUserCategoryStats,
  getCategoryMasteryTitle,
} from '../lib/user-stats'
import { getCanonicalCategoryData } from '../lib/category-registry'

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`)
    process.exit(1)
  } else {
    console.log(`✅ PASS: ${message}`)
  }
}

console.log('=== INÍCIO DO TESTE SSOT DE ESTATÍSTICAS ===\n')

// 1. Cenário Crítico: Jogador com 378 partidas solo e 15 vitórias em duelos
console.log('--- 1. Cenário do Bug Histórico (378 jogos, 15 vitórias em duelos) ---')
const profileCorrupted = {
  uid: 'user_test_1',
  gamesPlayed: 378,
  wins: 15,
  losses: 363, // Valor legado corrompido calculado por gamesPlayed - wins
  stats: {
    totalGames: 378,
    duelsWon: 15,
    duelsLost: 0, // Duelos reais perdidos: 0
    totalDuels: 15,
  },
}

const statsCorrupted = getUserGameStats(profileCorrupted as any)
assert(statsCorrupted.gamesPlayed === 378, `Partidas totais devem ser 378 (obteve ${statsCorrupted.gamesPlayed})`)
assert(statsCorrupted.wins1v1 === 15, `Vitórias 1v1 devem ser 15 (obteve ${statsCorrupted.wins1v1})`)
assert(statsCorrupted.losses1v1 === 0, `Derrotas 1v1 devem ser 0, NUNCA 363 (obteve ${statsCorrupted.losses1v1})`)
assert(statsCorrupted.totalDuels1v1 === 15, `Total de duelos deve ser 15, NUNCA 378 (obteve ${statsCorrupted.totalDuels1v1})`)
assert(statsCorrupted.winRate === 100, `Taxa de vitória deve ser 100%, NUNCA 4% (obteve ${statsCorrupted.winRate}%)`)

// 2. Cenário: Jogador Novo (Zero Dados)
console.log('\n--- 2. Cenário Novo Utilizador (Zero Dados) ---')
const statsNewUser = getUserGameStats(null)
assert(statsNewUser.gamesPlayed === 0, 'Partidas deve ser 0')
assert(statsNewUser.wins1v1 === 0, 'Vitórias 1v1 deve ser 0')
assert(statsNewUser.losses1v1 === 0, 'Derrotas 1v1 deve ser 0')
assert(statsNewUser.totalDuels1v1 === 0, 'Total de duelos deve ser 0')
assert(statsNewUser.winRate === 0, 'Taxa de vitória deve ser 0%')
assert(statsNewUser.totalAnswered === 0, 'Perguntas respondidas deve ser 0')
assert(statsNewUser.totalCorrect === 0, 'Respostas certas deve ser 0')
assert(statsNewUser.accuracy === 0, 'Precisão deve ser 0%')
assert(statsNewUser.avgResponseTime === '—', 'Tempo médio deve ser "—"')
assert(statsNewUser.avgResponseTimeSeconds === null, 'Tempo médio em segundos deve ser null')

// 3. Cenário: Duelos Reais Decisivos
console.log('\n--- 3. Cenário de Duelos Reais (10 V, 5 D, 2 E) ---')
const profileActiveDuelist = {
  uid: 'user_test_3',
  gamesPlayed: 50,
  xp: 12500,
  level: 8,
  coins: 450,
  streak: 4,
  bestStreak: 7,
  stats: {
    totalGames: 50,
    duelsWon: 10,
    duelsLost: 5,
    duelsDrawn: 2,
    totalDuels: 17,
  },
}

const duelStats = getUserDuelStats(profileActiveDuelist as any)
assert(duelStats.wins === 10, 'Vitórias de duelos deve ser 10')
assert(duelStats.losses === 5, 'Derrotas de duelos deve ser 5')
assert(duelStats.draws === 2, 'Empates de duelos deve ser 2')
assert(duelStats.totalDuels === 17, 'Total de duelos deve ser 17')
assert(duelStats.winRate === 67, `Taxa de vitória deve ser 67% (10/15) (obteve ${duelStats.winRate}%)`)

// 4. Cenário: Respostas e Precisão com Tempo Médio Real
console.log('\n--- 4. Precisão e Tempo Médio Real ---')
const profileAnswers = {
  uid: 'user_test_4',
  questionsAnswered: 80,
  correctAnswers: 64,
  stats: {
    totalResponseTime: 176,
    validResponseTimeCount: 80,
  },
}

const ansStats = getUserAnswerStats(profileAnswers as any)
assert(ansStats.totalAnswered === 80, 'Total respondido deve ser 80')
assert(ansStats.totalCorrect === 64, 'Total correto deve ser 64')
assert(ansStats.totalIncorrect === 16, 'Total incorreto deve ser 16')
assert(ansStats.accuracy === 80, `Precisão deve ser 80% (obteve ${ansStats.accuracy}%)`)
assert(ansStats.avgResponseTime === '2.2s', `Tempo médio deve ser "2.2s" (obteve ${ansStats.avgResponseTime})`)
assert(ansStats.avgResponseTimeSeconds === 2.2, 'Tempo médio em segundos deve ser 2.2')

// 5. Cenário: Títulos de Mestria de Categoria
console.log('\n--- 5. Títulos de Mestria Meritocráticos ---')
assert(getCategoryMasteryTitle('historia', 0, 0, 0) === 'Sem classificação', '0 respostas = Sem classificação')
assert(getCategoryMasteryTitle('historia', 5, 5, 100) === 'Aprendiz', '5 respostas = Aprendiz')
assert(getCategoryMasteryTitle('historia', 20, 16, 80) === 'Estudioso', '20 respostas e 80% = Estudioso')
assert(getCategoryMasteryTitle('historia', 50, 42, 84) === 'Especialista', '50 respostas e 84% = Especialista')
assert(getCategoryMasteryTitle('historia', 100, 85, 85) === 'Mestre da Lusitânia', '100 respostas e 85% = Mestre da Lusitânia')
assert(getCategoryMasteryTitle('geografia', 100, 90, 90) === 'Navegador Cartógrafo', '100 respostas e 90% = Navegador Cartógrafo')
assert(getCategoryMasteryTitle('desporto', 100, 88, 88) === 'Campeão Ibérico', '100 respostas e 88% = Campeão Ibérico')

// 6. Cenário: Prevenção de Duplicação de Espelho por Aliases em Categorias
console.log('\n--- 6. Prevenção de Duplicação de Aliases ---')
const categoryStatsWithMirrors = {
  historia: {
    totalQuestions: 20,
    correctAnswers: 16,
    score: 1600,
    gamesPlayed: 2,
    lastPlayedAt: '2026-03-15',
  },
  'historia-portugal': {
    totalQuestions: 20,
    correctAnswers: 16,
    score: 1600,
    gamesPlayed: 2,
    lastPlayedAt: '2026-03-15',
  },
}

const catDataDeduped = getCanonicalCategoryData(
  categoryStatsWithMirrors,
  'historia',
  ['historia-portugal', 'historia_de_portugal']
)
assert(catDataDeduped.totalQuestions === 20, `Perguntas em história devem ser 20, NUNCA 40 por duplicação (obteve ${catDataDeduped.totalQuestions})`)
assert(catDataDeduped.correctAnswers === 16, `Corretas em história devem ser 16, NUNCA 32 (obteve ${catDataDeduped.correctAnswers})`)
assert(catDataDeduped.accuracy === 80, `Precisão deve ser 80% (obteve ${catDataDeduped.accuracy}%)`)

console.log('\n======================================================')
console.log('🎉 TODOS OS TESTES DA SSOT PASSARAM COM SUCESSO! 🎉')
console.log('======================================================\n')
