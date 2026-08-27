import { NextResponse } from 'next/server'
import { verifyAdminRequest, recordAdminAuditLog } from '@/lib/admin-auth'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { QuestionRegistry } from '@/lib/question-system/registry'
import { simulateBotVsBotMatch } from '@/lib/bot-network/bot-duel-runner'
import type { BotPlayerRecord } from '@/lib/bot-network/types'
import type { DuelQuestion } from '@/lib/duel'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized || !authResult.adminUser) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const totalMatchesToSimulate = Math.min(500, Math.max(10, Number(body.matchesCount) || 500))

    const db = getAdminFirestore()
    const snap = await db.collection('botPlayers').get()

    if (snap.size < 2) {
      return NextResponse.json({ error: 'É necessário pelo menos 2 bots registados na pool.' }, { status: 400 })
    }

    const allBots = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as BotPlayerRecord[]
    const registry = QuestionRegistry.getInstance()
    const allQuestions = registry.getAllQuestions()

    if (allQuestions.length === 0) {
      return NextResponse.json({ error: 'Nenhuma pergunta disponível no registry para simulação.' }, { status: 500 })
    }

    const letters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D']

    // Preparar gerador rápido de perguntas
    const getRandomDuelQuestions = (count = 10): DuelQuestion[] => {
      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, count)
      return shuffled.map((q, idx) => {
        const rawOpts = Array.isArray(q.opcoes) ? q.opcoes : ['A', 'B', 'C', 'D']
        const options = rawOpts.slice(0, 4).map((text: string, i: number) => ({
          key: letters[i],
          text: String(text),
        }))
        const correctIndex = typeof q.respostaCorreta === 'number' ? q.respostaCorreta : 0
        const correctKey = letters[correctIndex] || 'A'
        return {
          id: q.id || idx + 1,
          question: q.pergunta || q.question || 'Pergunta',
          category: q.tema || 'Geral',
          options,
          correct: correctKey,
          explanation: q.explicacao,
        }
      })
    }

    let botAWins = 0
    let botBWins = 0
    let draws = 0
    let totalQuestionsSimulated = 0
    let totalCorrectAnswers = 0
    let totalTimeAccumulated = 0

    const botStatsMap = new Map<string, { matches: number; wins: number; scoreSum: number }>()

    for (let i = 0; i < totalMatchesToSimulate; i++) {
      // Escolher dois bots aleatórios distintos
      const idxA = Math.floor(Math.random() * allBots.length)
      let idxB = Math.floor(Math.random() * allBots.length)
      if (idxA === idxB) {
        idxB = (idxA + 1) % allBots.length
      }

      const botA = allBots[idxA]
      const botB = allBots[idxB]

      const questions = getRandomDuelQuestions(10)
      const sim = simulateBotVsBotMatch(botA, botB, questions)

      totalQuestionsSimulated += 20 // 10 de cada bot
      totalCorrectAnswers += sim.botA.correctCount + sim.botB.correctCount
      totalTimeAccumulated += sim.durationSeconds

      if (sim.winnerId === botA.id) {
        botAWins++
      } else if (sim.winnerId === botB.id) {
        botBWins++
      } else {
        draws++
      }

      // Estatísticas agregadas por bot
      const statA = botStatsMap.get(botA.id) || { matches: 0, wins: 0, scoreSum: 0 }
      statA.matches++
      if (sim.winnerId === botA.id) statA.wins++
      statA.scoreSum += sim.botA.score
      botStatsMap.set(botA.id, statA)

      const statB = botStatsMap.get(botB.id) || { matches: 0, wins: 0, scoreSum: 0 }
      statB.matches++
      if (sim.winnerId === botB.id) statB.wins++
      statB.scoreSum += sim.botB.score
      botStatsMap.set(botB.id, statB)
    }

    const overallAccuracyPercent = Math.round((totalCorrectAnswers / Math.max(1, totalQuestionsSimulated)) * 100)
    const averageMatchDurationSeconds = Math.round((totalTimeAccumulated / Math.max(1, totalMatchesToSimulate)) * 10) / 10
    const averageResponseTimePerQuestion = Math.round((totalTimeAccumulated / Math.max(1, totalMatchesToSimulate * 10)) * 10) / 10

    const qaReport = {
      totalMatchesSimulated,
      totalQuestionsProcessed: totalQuestionsSimulated,
      overallAccuracyPercent,
      averageMatchDurationSeconds,
      averageResponseTimePerQuestion,
      outcomes: {
        player1Wins: botAWins,
        player2Wins: botBWins,
        draws,
        winRateP1: Math.round((botAWins / totalMatchesToSimulate) * 100),
        winRateP2: Math.round((botBWins / totalMatchesToSimulate) * 100),
        drawRate: Math.round((draws / totalMatchesToSimulate) * 100),
      },
      botsTestedCount: botStatsMap.size,
      balanceScore: Math.abs(botAWins - botBWins) < totalMatchesToSimulate * 0.15 ? 'EXCELENTE (Equilibrado)' : 'BOM',
      timestamp: Date.now(),
    }

    await recordAdminAuditLog({
      adminUid: authResult.adminUser.uid,
      adminEmail: authResult.adminUser.email,
      action: 'BOT_QA_STRESS_EXECUTED',
      entity: 'QA_SIMULATION',
      entityId: `${totalMatchesToSimulate}_MATCHES`,
      details: `Executou stress-test de ${totalMatchesToSimulate} partidas entre bots. Precisão média: ${overallAccuracyPercent}%, Tempo médio: ${averageResponseTimePerQuestion}s.`,
      newValue: qaReport,
      status: 'SUCCESS',
    })

    return NextResponse.json({
      success: true,
      report: qaReport,
    })
  } catch (error: any) {
    console.error('[API BOT QA STRESS ERROR]', error)
    return NextResponse.json({ error: error.message || 'Erro ao executar QA stress test.' }, { status: 500 })
  }
}
