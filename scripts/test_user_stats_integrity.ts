/**
 * Script de Testes de Integridade Matemática e Canónica das Estatísticas
 * Executado via: npx tsx scripts/test_user_stats_integrity.ts
 */

import {
  getUserGameStats,
  getUserCategoryStats,
  getCategoryMasteryTitle,
  getUserDuelStats,
  getUserAnswerStats,
} from '../lib/user-stats'
import {
  computeCategoryBreakdownFromAnswers,
  CANONICAL_PROFILE_CATEGORIES,
} from '../lib/category-registry'

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`)
    process.exit(1)
  }
  console.log(`✅ ${message}`)
}

console.log('=================================================================')
console.log('🧪 INICIANDO BATERIA DE TESTES DE INTEGRIDADE DE ESTATÍSTICAS')
console.log('=================================================================\n')

// 1. UTILIZADOR RECÉM-CRIADO / SEM HISTÓRICO (ZERO MOCKS, ZERO PLACEHOLDERS)
console.log('--- 1. Utilizador Zero / Novo ---')
{
  const emptyProfile = {
    uid: 'user_new',
    displayName: 'Novo Jogador',
  }

  const stats = getUserGameStats(emptyProfile as any)
  assert(stats.gamesPlayed === 0, 'Partidas deve ser 0')
  assert(stats.wins1v1 === 0, 'Vitórias 1v1 deve ser 0')
  assert(stats.losses1v1 === 0, 'Derrotas 1v1 deve ser 0')
  assert(stats.winRate === 0, 'Taxa de Vitória deve ser 0% (sem NaN)')
  assert(stats.totalAnswered === 0, 'Perguntas respondidas deve ser 0')
  assert(stats.totalCorrect === 0, 'Respostas corretas deve ser 0')
  assert(stats.accuracy === 0, 'Precisão deve ser 0%')
  assert(stats.avgResponseTime === '—', 'Tempo Médio deve ser "—" (sem fake 2.4s)')

  const categories = getUserCategoryStats(emptyProfile as any)
  assert(categories.length === 6, 'Devem existir exatamente 6 categorias canónicas')
  for (const cat of categories) {
    assert(cat.answered === 0, `Categoria ${cat.id} answered deve ser 0`)
    assert(cat.correct === 0, `Categoria ${cat.id} correct deve ser 0`)
    assert(cat.accuracy === 0, `Categoria ${cat.id} accuracy deve ser 0%`)
    assert(cat.levelName === 'Sem classificação', `Categoria ${cat.id} deve ter título "Sem classificação" (nunca estático Mestre)`)
  }
}

// 2. CASO REAL DO UTILIZADOR: 378 PARTIDAS, 15 VITÓRIAS 1v1, 8 DERROTAS 1v1 (WINRATE TEM DE SER 65%, NUNCA 4%)
console.log('\n--- 2. Caso do Utilizador: 15V / 8D 1v1 (Winrate 65%) ---')
{
  // Simular perfil com o bug legado onde losses era 363 (378 - 15)
  const legacyCorruptedProfile = {
    uid: 'user_ricardo',
    gamesPlayed: 378,
    wins: 15,
    losses: 363, // corrompido por solo games no passado
    wins1v1: 15,
    losses1v1: 8,
    draws1v1: 0,
    questionsAnswered: 450,
    correctAnswers: 345,
  }

  const stats = getUserGameStats(legacyCorruptedProfile as any)
  assert(stats.gamesPlayed === 378, 'Partidas totais deve ser 378')
  assert(stats.wins1v1 === 15, 'Vitórias 1v1 deve ser 15')
  assert(stats.losses1v1 === 8, 'Derrotas 1v1 deve ser 8')
  // 15 / (15 + 8) = 15 / 23 = 65.217% -> 65%
  assert(stats.winRate === 65, `Taxa de Vitória 1v1 deve ser 65% (obteve ${stats.winRate}%)`)
}

// 3. JOGADOR EXCLUSIVAMENTE SOLO (378 partidas solo, 0 duelos)
console.log('\n--- 3. Jogador Apenas Solo (Sem Duelos) ---')
{
  const soloProfile = {
    uid: 'user_solo',
    gamesPlayed: 378,
    totalQuestions: 1500,
    correctAnswers: 1200,
  }

  const stats = getUserGameStats(soloProfile as any)
  assert(stats.gamesPlayed === 378, 'Partidas deve ser 378')
  assert(stats.wins1v1 === 0, 'Vitórias 1v1 deve ser 0')
  assert(stats.losses1v1 === 0, 'Derrotas 1v1 deve ser 0')
  assert(stats.winRate === 0, 'Taxa de Vitória deve ser 0%')
  assert(stats.accuracy === 80, 'Precisão deve ser 80% (1200/1500)')
}

// 4. PRECISÃO MATEMÁTICA E CASOS REAIS
console.log('\n--- 4. Precisão Matemática Real ---')
{
  // 10 respondidas, 7 certas = 70%
  const sample1 = {
    questionsAnswered: 10,
    correctAnswers: 7,
  }
  const stats1 = getUserAnswerStats(sample1 as any)
  assert(stats1.accuracy === 70, `Precisão 7/10 deve ser 70% (obteve ${stats1.accuracy}%)`)

  // 75 respondidas, 34 certas = 45% (34 / 75 = 45.333% -> 45%)
  const sample2 = {
    totalQuestions: 75,
    correctAnswers: 34,
  }
  const stats2 = getUserAnswerStats(sample2 as any)
  assert(stats2.accuracy === 45, `Precisão 34/75 deve ser 45% (obteve ${stats2.accuracy}%)`)
}

// 5. TEMPO MÉDIO DETERMINÍSTICO E REJEIÇÃO DE PLACEHOLDER 2.4s
console.log('\n--- 5. Tempo Médio Real vs Fake Placeholder ---')
{
  // Utilizador com tempos reais registrados: 25 respostas, soma 54.2 segundos = 2.2s
  const realTimesProfile = {
    stats: {
      totalResponseTime: 54.2,
      validResponseTimeCount: 25,
    },
  }
  const ansStats1 = getUserAnswerStats(realTimesProfile as any)
  assert(ansStats1.avgResponseTime === '2.2s', `Tempo médio deve ser 2.2s (obteve ${ansStats1.avgResponseTime})`)
  assert(ansStats1.avgResponseTimeSeconds === 2.2, 'avgResponseTimeSeconds deve ser 2.2')

  // Utilizador com placeholder legado "2.4s" ou 2.4 sem contagens reais
  const fakePlaceholderProfile = {
    stats: {
      avgResponseTime: '2.4s',
    },
  }
  const ansStats2 = getUserAnswerStats(fakePlaceholderProfile as any)
  assert(ansStats2.avgResponseTime === '—', `Placeholder fake '2.4s' deve ser limpo para '—' (obteve ${ansStats2.avgResponseTime})`)

  const fakePlaceholderProfileNum = {
    stats: {
      avgResponseTime: 2.4,
    },
  }
  const ansStats3 = getUserAnswerStats(fakePlaceholderProfileNum as any)
  assert(ansStats3.avgResponseTime === '—', `Placeholder numérico fake 2.4 deve ser limpo para '—' (obteve ${ansStats3.avgResponseTime})`)
}

// 6. DOMÍNIO POR CATEGORIA & TÍTULOS MERITOCRÁTICOS
console.log('\n--- 6. Domínio por Categoria & Progressão de Títulos ---')
{
  // 0 respostas = Sem classificação
  assert(getCategoryMasteryTitle('historia', 0, 0, 0) === 'Sem classificação', '0 respostas deve ser Sem classificação')

  // 1 a 14 respostas = Aprendiz
  assert(getCategoryMasteryTitle('historia', 5, 5, 100) === 'Aprendiz', '5 respostas 100% deve ser Aprendiz')

  // 15 a 39 respostas com 83% precisão = Estudioso
  assert(getCategoryMasteryTitle('historia', 30, 25, 83) === 'Estudioso', '30 respostas 83% deve ser Estudioso')

  // 40 a 79 respostas com 80% precisão = Especialista
  assert(getCategoryMasteryTitle('historia', 50, 40, 80) === 'Especialista', '50 respostas 80% deve ser Especialista')

  // 85 respostas com 88% precisão = Mestre da Lusitânia (Apex)
  assert(getCategoryMasteryTitle('historia', 85, 75, 88) === 'Mestre da Lusitânia', '85 respostas 88% deve ser Mestre da Lusitânia')

  // 100 respostas com 40% precisão = Aventureiro (não Mestre)
  assert(getCategoryMasteryTitle('historia', 100, 40, 40) === 'Aventureiro', '100 respostas 40% deve ser Aventureiro')
}

// 7. AGREGAÇÃO DE RESPOSTAS E ALIASES CANÓNICOS
console.log('\n--- 7. Agregação Canónica de Respostas de Partida ---')
{
  const matchAnswers = [
    { questionId: 'q1', categoryId: 'historia', prompt: 'D. Afonso Henriques...', isCorrect: true, timeSpentSeconds: 3.2 },
    { questionId: 'q2', categoryId: 'historia-cultura', prompt: 'Batalha de Aljubarrota...', isCorrect: true, timeSpentSeconds: 4.1 },
    { questionId: 'q3', categoryId: 'distrito', prompt: 'Qual o rio de Coimbra?', isCorrect: true, timeSpentSeconds: 2.5 },
    { questionId: 'q4', categoryId: 'o-meu-distrito', prompt: 'Castelo de Guimarães...', isCorrect: false, timeSpentSeconds: 5.0 },
    { questionId: 'q5', categoryId: 'gastronomia', prompt: 'Pastel de Belém...', isCorrect: true, timeSpentSeconds: 1.8 },
  ]

  const breakdown = computeCategoryBreakdownFromAnswers(matchAnswers as any, 'geral')
  assert(breakdown['historia'].totalQuestions === 2, 'História deve somar 2 perguntas (incluindo alias historia-cultura)')
  assert(breakdown['historia'].correctAnswers === 2, 'História deve ter 2 acertos')
  assert(breakdown['geografia'].totalQuestions === 2, 'Geografia deve somar 2 perguntas dos aliases distritais')
  assert(breakdown['geografia'].correctAnswers === 1, 'Geografia deve ter 1 acerto')
  assert(breakdown['simbolos'].totalQuestions === 1, 'Símbolos & Gastronomia deve somar 1 pergunta')
  assert(breakdown['simbolos'].correctAnswers === 1, 'Símbolos & Gastronomia deve ter 1 acerto')
}

console.log('\n=================================================================')
console.log('🎉 TODOS OS TESTES DE INTEGRIDADE FORAM APROVADOS COM SUCESSO!')
console.log('=================================================================')
