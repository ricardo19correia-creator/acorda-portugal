import {
  CANONICAL_PROFILE_CATEGORIES,
  getCanonicalCategory,
  getCanonicalCategoryData,
  computeCategoryBreakdownFromAnswers,
  reconcileUserCategoryStats,
  type MatchAnswerPayload,
} from '../lib/category-registry'

let passedTests = 0
let failedTests = 0

function assert(condition: boolean, testName: string, detail?: any) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`)
    passedTests++
  } else {
    console.error(`❌ FAIL: ${testName}`, detail !== undefined ? detail : '')
    failedTests++
  }
}

console.log('=================================================================')
console.log('🧪 ACORDA PORTUGAL — TESTE FORENSE DO PIPELINE DE CATEGORIAS')
console.log('=================================================================\n')

// 1. Teste de Resolução Canónica de Aliases e Subcategorias
console.log('--- 1. Resolução Canónica de Identificadores e Aliases ---')
assert(getCanonicalCategory('historia') === 'historia', 'historia slug direto')
assert(getCanonicalCategory('historia-portugal') === 'historia', 'historia-portugal slug')
assert(getCanonicalCategory('descobrimentos') === 'historia', 'descobrimentos subcategoria')
assert(getCanonicalCategory('geografia') === 'geografia', 'geografia slug direto')
assert(getCanonicalCategory('distrito') === 'geografia', 'distrito subcategoria')
assert(getCanonicalCategory('o-meu-distrito') === 'geografia', 'o-meu-distrito subcategoria')
assert(getCanonicalCategory('desporto') === 'desporto', 'desporto slug direto')
assert(getCanonicalCategory('futebol-portugues') === 'desporto', 'futebol-portugues slug')
assert(getCanonicalCategory('cultura') === 'cultura', 'cultura slug direto')
assert(getCanonicalCategory('fado') === 'cultura', 'fado subcategoria')
assert(getCanonicalCategory('gastronomia') === 'simbolos', 'gastronomia mapeia para canónico simbolos')
assert(getCanonicalCategory('simbolos-gastronomia') === 'simbolos', 'simbolos-gastronomia mapeia para simbolos')
assert(getCanonicalCategory('pratos-tipicos') === 'simbolos', 'pratos-tipicos mapeia para simbolos')
assert(getCanonicalCategory('modo-maluco') === 'maluco', 'modo-maluco mapeia para canónico maluco')
assert(getCanonicalCategory('modo_maluco') === 'maluco', 'modo_maluco mapeia para canónico maluco')
assert(getCanonicalCategory('perguntas-idiotas') === 'maluco', 'perguntas-idiotas mapeia para maluco')

// 2. Teste de Extração Semântica para Perguntas de Duelo / Desafio Nacional
console.log('\n--- 2. Extração Semântica para Desafio Nacional ---')
assert(
  getCanonicalCategory('desafio-nacional', undefined, undefined, 'Em que ano foi assinada a Carta Foral de Guimarães?') === 'historia',
  'Pergunta sobre Foral e Guimarães categorizada como historia'
)
assert(
  getCanonicalCategory('geral', undefined, undefined, 'Qual é o rio mais extenso que nasce em Espanha e desagua em Lisboa?') === 'geografia',
  'Pergunta sobre Rio e Lisboa categorizada como geografia'
)
assert(
  getCanonicalCategory('portugal', undefined, undefined, 'Qual é a receita tradicional dos Pastéis de Belém?') === 'simbolos',
  'Pergunta sobre receita e Pastéis de Belém categorizada como simbolos'
)
assert(
  getCanonicalCategory('desafio-nacional', undefined, undefined, 'Quem marcou o golo de Portugal na final do Euro 2016?') === 'desporto',
  'Pergunta sobre golo e Euro 2016 categorizada como desporto'
)

// 3. Teste dos Cenários A a F (Partidas Monotemáticas de 10 Perguntas)
console.log('\n--- 3. Cenários A a F (Partidas Monotemáticas) ---')

// Cenário A: História (8/10)
const answersA: MatchAnswerPayload[] = Array.from({ length: 10 }, (_, i) => ({
  questionId: `q_hist_${i}`,
  categoryId: 'historia',
  isCorrect: i < 8,
}))
const breakdownA = computeCategoryBreakdownFromAnswers(answersA, 'historia')
assert(breakdownA.historia.totalQuestions === 10 && breakdownA.historia.correctAnswers === 8, 'Cenário A: 10 História (8 certas)')
const dataA = getCanonicalCategoryData({ historia: breakdownA.historia }, 'historia', ['historia'])
assert(dataA.accuracy === 80 && dataA.totalQuestions === 10 && dataA.correctAnswers === 8, 'Cenário A: Perfil apresenta 80% (8/10)')

// Cenário B: Geografia (7/10)
const answersB: MatchAnswerPayload[] = Array.from({ length: 10 }, (_, i) => ({
  questionId: `q_geo_${i}`,
  categoryId: 'geografia-territorio',
  isCorrect: i < 7,
}))
const breakdownB = computeCategoryBreakdownFromAnswers(answersB, 'geografia')
assert(breakdownB.geografia.totalQuestions === 10 && breakdownB.geografia.correctAnswers === 7, 'Cenário B: 10 Geografia (7 certas)')
const dataB = getCanonicalCategoryData({ geografia: breakdownB.geografia }, 'geografia', ['geografia-territorio'])
assert(dataB.accuracy === 70 && dataB.totalQuestions === 10 && dataB.correctAnswers === 7, 'Cenário B: Perfil apresenta 70% (7/10)')

// Cenário C: Desporto (9/10)
const answersC: MatchAnswerPayload[] = Array.from({ length: 10 }, (_, i) => ({
  questionId: `q_desp_${i}`,
  categoryId: 'futebol-portugues',
  isCorrect: i < 9,
}))
const breakdownC = computeCategoryBreakdownFromAnswers(answersC, 'desporto')
assert(breakdownC.desporto.totalQuestions === 10 && breakdownC.desporto.correctAnswers === 9, 'Cenário C: 10 Desporto (9 certas)')
const dataC = getCanonicalCategoryData({ desporto: breakdownC.desporto }, 'desporto', ['futebol-portugues'])
assert(dataC.accuracy === 90 && dataC.totalQuestions === 10 && dataC.correctAnswers === 9, 'Cenário C: Perfil apresenta 90% (9/10)')

// Cenário D: Cultura (6/10)
const answersD: MatchAnswerPayload[] = Array.from({ length: 10 }, (_, i) => ({
  questionId: `q_cult_${i}`,
  categoryId: 'cultura-tradicoes',
  isCorrect: i < 6,
}))
const breakdownD = computeCategoryBreakdownFromAnswers(answersD, 'cultura')
assert(breakdownD.cultura.totalQuestions === 10 && breakdownD.cultura.correctAnswers === 6, 'Cenário D: 10 Cultura (6 certas)')
const dataD = getCanonicalCategoryData({ cultura: breakdownD.cultura }, 'cultura', ['cultura-tradicoes'])
assert(dataD.accuracy === 60 && dataD.totalQuestions === 10 && dataD.correctAnswers === 6, 'Cenário D: Perfil apresenta 60% (6/10)')

// Cenário E: Símbolos / Gastronomia (10/10)
const answersE: MatchAnswerPayload[] = Array.from({ length: 10 }, (_, i) => ({
  questionId: `q_gastr_${i}`,
  categoryId: 'gastronomia',
  isCorrect: true,
}))
const breakdownE = computeCategoryBreakdownFromAnswers(answersE, 'gastronomia')
assert(breakdownE.simbolos.totalQuestions === 10 && breakdownE.simbolos.correctAnswers === 10, 'Cenário E: 10 Gastronomia mapeadas para simbolos (10 certas)')
const dataE = getCanonicalCategoryData({ gastronomia: breakdownE.simbolos }, 'simbolos', ['gastronomia'])
assert(dataE.accuracy === 100 && dataE.totalQuestions === 10 && dataE.correctAnswers === 10, 'Cenário E: Perfil apresenta 100% (10/10)')

// Cenário F: Modo Maluco (5/10)
const answersF: MatchAnswerPayload[] = Array.from({ length: 10 }, (_, i) => ({
  questionId: `q_mal_${i}`,
  categoryId: 'modo-maluco',
  isCorrect: i < 5,
}))
const breakdownF = computeCategoryBreakdownFromAnswers(answersF, 'modo-maluco')
assert(breakdownF.maluco.totalQuestions === 10 && breakdownF.maluco.correctAnswers === 5, 'Cenário F: 10 Modo Maluco mapeadas para maluco (5 certas)')
const dataF = getCanonicalCategoryData({ 'modo-maluco': breakdownF.maluco }, 'maluco', ['modo-maluco'])
assert(dataF.accuracy === 50 && dataF.totalQuestions === 10 && dataF.correctAnswers === 5, 'Cenário F: Perfil apresenta 50% (5/10)')

// 4. Teste do Cenário G (Desafio Nacional / Duelo com Pool Misto de Perguntas)
console.log('\n--- 4. Cenário G (Desafio Nacional / Duelo Misto) ---')
const mixedAnswers: MatchAnswerPayload[] = [
  { questionId: 'm1', categoryId: 'historia', isCorrect: true },
  { questionId: 'm2', categoryId: 'historia', isCorrect: true },
  { questionId: 'm3', categoryId: 'geografia', isCorrect: true },
  { questionId: 'm4', categoryId: 'geografia', isCorrect: false },
  { questionId: 'm5', categoryId: 'desporto', isCorrect: true },
  { questionId: 'm6', categoryId: 'desporto', isCorrect: true },
  { questionId: 'm7', categoryId: 'cultura', isCorrect: false },
  { questionId: 'm8', categoryId: 'cultura', isCorrect: true },
  { questionId: 'm9', categoryId: 'gastronomia', isCorrect: true },
  { questionId: 'm10', categoryId: 'modo-maluco', isCorrect: true },
]
const mixedBreakdown = computeCategoryBreakdownFromAnswers(mixedAnswers, 'desafio-nacional')
assert(mixedBreakdown.historia.totalQuestions === 2 && mixedBreakdown.historia.correctAnswers === 2, 'Misto: História 2/2')
assert(mixedBreakdown.geografia.totalQuestions === 2 && mixedBreakdown.geografia.correctAnswers === 1, 'Misto: Geografia 1/2')
assert(mixedBreakdown.desporto.totalQuestions === 2 && mixedBreakdown.desporto.correctAnswers === 2, 'Misto: Desporto 2/2')
assert(mixedBreakdown.cultura.totalQuestions === 2 && mixedBreakdown.cultura.correctAnswers === 1, 'Misto: Cultura 1/2')
assert(mixedBreakdown.simbolos.totalQuestions === 1 && mixedBreakdown.simbolos.correctAnswers === 1, 'Misto: Símbolos 1/1')
assert(mixedBreakdown.maluco.totalQuestions === 1 && mixedBreakdown.maluco.correctAnswers === 1, 'Misto: Maluco 1/1')

// 5. Teste do Cenário H (Auto-Cura / Reconciliação de Contas Legadas)
console.log('\n--- 5. Cenário H (Auto-Cura / Reconciliação de Contas Legadas) ---')
const legacyUserData = {
  categoryStats: {
    historia: { total: 507, correct: 418 },
    gastronomia: { totalQuestions: 40, correctAnswers: 32 },
    'modo-maluco': { total: 20, correct: 14 },
    'desporto-nacional': { totalQuestions: 15, correctAnswers: 12 },
  },
}
const healedStats = reconcileUserCategoryStats(legacyUserData)
const healedSimbolos = getCanonicalCategoryData(healedStats, 'simbolos', ['gastronomia'])
const healedMaluco = getCanonicalCategoryData(healedStats, 'maluco', ['modo-maluco'])
const healedDesporto = getCanonicalCategoryData(healedStats, 'desporto', ['desporto-nacional'])
assert(healedSimbolos.totalQuestions === 40 && healedSimbolos.correctAnswers === 32 && healedSimbolos.accuracy === 80, 'Auto-cura: Símbolos recupera dados de gastronomia (40/32 -> 80%)')
assert(healedMaluco.totalQuestions === 20 && healedMaluco.correctAnswers === 14 && healedMaluco.accuracy === 70, 'Auto-cura: Maluco recupera dados de modo-maluco (20/14 -> 70%)')
assert(healedDesporto.totalQuestions === 15 && healedDesporto.correctAnswers === 12 && healedDesporto.accuracy === 80, 'Auto-cura: Desporto recupera dados de desporto-nacional (15/12 -> 80%)')

// 6. Teste de Precisão Matemática e Tolerância a Zero
console.log('\n--- 6. Precisão Matemática & Edge Cases ---')
const zeroData = getCanonicalCategoryData({}, 'historia', ['historia'])
assert(zeroData.accuracy === 0 && zeroData.totalQuestions === 0 && zeroData.correctAnswers === 0, 'Zero perguntas: accuracy é estritamente 0 (sem NaN nem Infinity)')

const singleData = getCanonicalCategoryData({ historia: { totalQuestions: 3, correctAnswers: 1 } }, 'historia', ['historia'])
assert(singleData.accuracy === 33, 'Arredondamento: 1/3 = 33%')

const twoThirdsData = getCanonicalCategoryData({ historia: { totalQuestions: 3, correctAnswers: 2 } }, 'historia', ['historia'])
assert(twoThirdsData.accuracy === 67, 'Arredondamento: 2/3 = 67%')

console.log('\n=================================================================')
console.log(`🏁 RESULTADO: ${passedTests} testes passaram | ${failedTests} testes falharam`)
console.log('=================================================================')

if (failedTests > 0) {
  process.exit(1)
} else {
  console.log('🎉 TODOS OS TESTES FORENSES PASSARAM COM 100% DE SUCESSO!')
}
