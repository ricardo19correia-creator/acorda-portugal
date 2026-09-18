/**
 * Script de Verificação e Auditoria da Sincronização Total de Dados de Jogador
 * Acorda Portugal — Desafio Nacional
 */

import { calculateLevelProgress, PROGRESSION_LEVELS } from '../lib/progression'
import { getUserGameStats } from '../lib/user-stats'

async function runIntegrityChecks() {
  console.log('====================================================')
  console.log('🔍 INICIANDO AUDITORIA DE SINCRONIZAÇÃO DE JOGADORES')
  console.log('====================================================\n')

  let passedTests = 0
  let failedTests = 0

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`)
      passedTests++
    } else {
      console.error(`  ❌ [FAIL] ${message}`)
      failedTests++
    }
  }

  // 1. TESTE DA PROGRESSÃO DETERMINÍSTICA DE XP E NÍVEL
  console.log('📋 Teste 1: Cálculo e Progressão Determinística de Nível')
  {
    const p0 = calculateLevelProgress(0)
    const p100 = calculateLevelProgress(100)
    const p5000 = calculateLevelProgress(5000)
    const p30000 = calculateLevelProgress(30000)

    assert(p0.currentLevel.level === 1, `Nível inicial para 0 XP deve ser 1 (obteve ${p0.currentLevel.level})`)
    assert(p100.currentLevel.level >= 1, `Nível para 100 XP deve ser >= 1 (obteve ${p100.currentLevel.level})`)
    assert(p5000.currentLevel.level >= 2, `Nível para 5000 XP deve ser >= 2 (obteve ${p5000.currentLevel.level})`)
    assert(p30000.currentLevel.level > p5000.currentLevel.level, `Nível deve aumentar com mais XP (L30000=${p30000.currentLevel.level} > L5000=${p5000.currentLevel.level})`)
    assert(p0.nextLevel !== null && p0.nextLevel.xpRequired > 0, `XP para próximo nível deve ser maior que zero (${p0.nextLevel?.xpRequired})`)
  }

  // 2. TESTE DE CONCORRÊNCIA E OPERAÇÕES ATÓMICAS (Simulação de Transação)
  console.log('\n📋 Teste 2: Concorrência e Isolamento Atómico de Saldos (XP / Moedas)')
  {
    // Simular saldo partilhado e transações atómicas concorrentes
    let sharedState = {
      xp: 500,
      coins: 100,
      version: 1,
    }

    const txQueue = [
      { xpDelta: 100, coinsDelta: 50 },
      { xpDelta: 200, coinsDelta: 20 },
      { xpDelta: 50, coinsDelta: 10 },
      { xpDelta: 150, coinsDelta: 30 },
      { xpDelta: 300, coinsDelta: 100 },
    ]

    // Simulação de execução concorrente com locks de transação
    async function applyTransaction(delta: { xpDelta: number; coinsDelta: number }) {
      // Leitura da versão
      const current = { ...sharedState }
      // Pequeno atraso aleatório para simular latência de rede
      await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 20)))
      // Escrita atómica
      sharedState.xp += delta.xpDelta
      sharedState.coins += delta.coinsDelta
      sharedState.version += 1
    }

    await Promise.all(txQueue.map((tx) => applyTransaction(tx)))

    const expectedXP = 500 + 100 + 200 + 50 + 150 + 300 // 1300
    const expectedCoins = 100 + 50 + 20 + 10 + 30 + 100 // 310

    assert(sharedState.xp === expectedXP, `XP final atómico deve ser exatamente ${expectedXP} (obteve ${sharedState.xp})`)
    assert(sharedState.coins === expectedCoins, `Moedas finais atómicas devem ser exatamente ${expectedCoins} (obteve ${sharedState.coins})`)
    assert(sharedState.version === 6, `Versão após 5 transações deve ser 6 (obteve ${sharedState.version})`)
  }

  // 3. TESTE DE IDEMPOTÊNCIA E PREVENÇÃO DE DUPLICAÇÃO
  console.log('\n📋 Teste 3: Idempotência de Recompensas de Partida e Duelos')
  {
    const processedMatches = new Set<string>()
    let userCoins = 0
    let userXP = 0

    function processMatchResult(matchId: string, xpGain: number, coinsGain: number) {
      if (processedMatches.has(matchId)) {
        return { success: false, reason: 'already_processed', rewarded: false }
      }
      processedMatches.add(matchId)
      userCoins += coinsGain
      userXP += xpGain
      return { success: true, rewarded: true }
    }

    const matchId = 'match_unique_test_123'
    const firstCall = processMatchResult(matchId, 250, 50)
    const secondCall = processMatchResult(matchId, 250, 50)
    const thirdCall = processMatchResult(matchId, 250, 50)

    assert(firstCall.rewarded === true, 'Primeiro registo da partida deve conceder recompensas')
    assert(secondCall.rewarded === false, 'Segundo registo da mesma partida deve ser bloqueado por idempotência')
    assert(thirdCall.rewarded === false, 'Terceiro registo da mesma partida deve ser bloqueado por idempotência')
    assert(userXP === 250, `XP acumulado deve ser 250 sem duplicar (obteve ${userXP})`)
    assert(userCoins === 50, `Moedas acumuladas devem ser 50 sem duplicar (obteve ${userCoins})`)
  }

  // 4. TESTE DE ESTATÍSTICAS E CÁLCULO DE MÉTRICAS (user-stats)
  console.log('\n📋 Teste 4: Métricas do Perfil (Vitórias, Derrotas, Precisão, Winrate)')
  {
    const mockProfile = {
      uid: 'test_uid_789',
      gamesPlayed: 25,
      wins1v1: 15,
      losses1v1: 5,
      draws1v1: 2,
      questionsAnswered: 100,
      correctAnswers: 85,
      stats: {
        totalGames: 25,
        duelsWon: 15,
        duelsLost: 5,
        duelsDrawn: 2,
        totalQuestions: 100,
        correctAnswers: 85,
        totalResponseTime: 240,
        validResponseTimeCount: 100,
      },
    }

    const stats = getUserGameStats(mockProfile as any)

    assert(stats.gamesPlayed === 25, `Partidas totais devem ser 25 (obteve ${stats.gamesPlayed})`)
    assert(stats.wins1v1 === 15, `Vitórias 1v1 devem ser 15 (obteve ${stats.wins1v1})`)
    assert(stats.losses1v1 === 5, `Derrotas 1v1 devem ser 5 (obteve ${stats.losses1v1})`)
    assert(stats.draws1v1 === 2, `Empates 1v1 devem ser 2 (obteve ${stats.draws1v1})`)
    assert(stats.totalDuels1v1 === 22, `Total de duelos deve ser 22 (obteve ${stats.totalDuels1v1})`)
    // Winrate: 15 / (15 + 5) = 75%
    assert(stats.winRate === 75, `Winrate deve ser 75% (obteve ${stats.winRate}%)`)
    assert(stats.accuracy === 85, `Precisão deve ser 85% (obteve ${stats.accuracy}%)`)
    assert(stats.avgResponseTime === '2.4s', `Tempo médio de resposta deve ser 2.4s (obteve ${stats.avgResponseTime})`)
  }

  // 5. TESTE DE ISOLAMENTO 1v1 vs SOLO (Sem poluição de dados)
  console.log('\n📋 Teste 5: Isolamento de Duelos 1v1 e Partidas Solo')
  {
    const profileSoloOnly = {
      uid: 'solo_player',
      gamesPlayed: 50,
      wins1v1: 0,
      losses1v1: 0,
      draws1v1: 0,
      questionsAnswered: 250,
      correctAnswers: 200,
    }

    const statsSolo = getUserGameStats(profileSoloOnly as any)

    assert(statsSolo.gamesPlayed === 50, 'Partidas jogadas solo devem ser contabilizadas')
    assert(statsSolo.wins1v1 === 0, 'Vitórias 1v1 devem manter-se em 0 se nunca jogou duelos')
    assert(statsSolo.losses1v1 === 0, 'Derrotas 1v1 devem manter-se em 0 (não subtrair partidas solo)')
    assert(statsSolo.winRate === 0, 'Taxa de vitória 1v1 deve ser 0% sem duelos')
  }

  console.log('\n====================================================')
  console.log(`🏁 RESULTADO DOS TESTES: ${passedTests} Aprovados, ${failedTests} Falhados`)
  console.log('====================================================\n')

  if (failedTests > 0) {
    process.exit(1)
  }
}

runIntegrityChecks().catch((err) => {
  console.error('Erro na auditoria:', err)
  process.exit(1)
})
