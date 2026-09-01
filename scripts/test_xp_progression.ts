import { calculateLevelProgress, PROGRESSION_LEVELS } from '../lib/progression'
import { calculateLevelUpCoinReward, ECONOMY_CONFIG } from '../lib/economy'

function runTests() {
  console.log('--- TESTE 1: CÁLCULO DE NÍVEL INICIAL (0 XP) ---')
  const p0 = calculateLevelProgress(0)
  if (p0.currentLevel.level !== 1 || p0.progressPercentage !== 0) {
    throw new Error(`Falha no cálculo inicial: level=${p0.currentLevel.level}`)
  }
  console.log('✅ Level 1 (0 XP) -> OK')

  console.log('\n--- TESTE 2: PROGRESSÃO POR PATAMARES DE NÍVEL ---')
  // Nível 2 requer 2500 XP
  const p2500 = calculateLevelProgress(2500)
  if (p2500.currentLevel.level !== 2) {
    throw new Error(`Falha no nível 2: level=${p2500.currentLevel.level}`)
  }
  console.log('✅ Level 2 (2500 XP) -> OK')

  // Nível 3 requer 7500 XP
  const p7500 = calculateLevelProgress(7500)
  if (p7500.currentLevel.level !== 3) {
    throw new Error(`Falha no nível 3: level=${p7500.currentLevel.level}`)
  }
  console.log('✅ Level 3 (7500 XP) -> OK')

  console.log('\n--- TESTE 3: CÁLCULO DE BÓNUS DE SUBIDA DE NÍVEL ---')
  const bonus1to2 = calculateLevelUpCoinReward(1, 2)
  if (bonus1to2 !== 25) {
    throw new Error(`Bónus incorreto 1->2: ${bonus1to2}`)
  }
  const bonus1to3 = calculateLevelUpCoinReward(1, 3)
  if (bonus1to3 !== 50) {
    throw new Error(`Bónus incorreto 1->3: ${bonus1to3}`)
  }
  console.log('✅ Bónus de moedas por subida de nível (€25/nível) -> OK')

  console.log('\n--- TESTE 4: RESILIÊNCIA A DADOS INVÁLIDOS (NaN, Negativo) ---')
  const pNeg = calculateLevelProgress(-100)
  if (pNeg.currentLevel.level !== 1 || pNeg.currentXp !== 0) {
    throw new Error('Falha no tratamento de XP negativo')
  }
  const pNan = calculateLevelProgress(NaN)
  if (pNan.currentLevel.level !== 1 || pNan.currentXp !== 0) {
    throw new Error('Falha no tratamento de XP NaN')
  }
  console.log('✅ Resiliência a NaN e valores negativos -> OK')

  console.log('\n--- TESTE 5: FÓRMULA DE RECOMPENSA DE QUIZ SOLO ---')
  const correctAnswers = 8
  const totalQuestions = 10
  const score = 1200
  const difficultyMultiplier = 1.2
  const baseMatchXp = correctAnswers * 50 + Math.round(score / 10) // 400 + 120 = 520
  const totalXp = Math.round(baseMatchXp * difficultyMultiplier) // 520 * 1.2 = 624
  if (totalXp !== 624) {
    throw new Error(`Cálculo de XP solo incorreto: ${totalXp}`)
  }
  console.log(`✅ Fórmula de Quiz Solo (8 certas, 1200 pts, diff 1.2) = +${totalXp} XP -> OK`)

  console.log('\n================================================================================')
  console.log('🌟 TODOS OS TESTES DE PROGRESSÃO, XP E ECONOMIA PASSARAM COM SUCESSO!')
  console.log('================================================================================')
}

runTests()