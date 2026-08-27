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
    const { botIdA, botIdB } = body

    if (!botIdA || !botIdB) {
      return NextResponse.json({ error: 'É necessário fornecer "botIdA" e "botIdB".' }, { status: 400 })
    }

    const db = getAdminFirestore()
    const [snapA, snapB] = await Promise.all([
      db.collection('botPlayers').doc(botIdA).get(),
      db.collection('botPlayers').doc(botIdB).get(),
    ])

    if (!snapA.exists || !snapB.exists) {
      return NextResponse.json({ error: 'Um ou ambos os bots não foram encontrados.' }, { status: 404 })
    }

    const botA = { id: snapA.id, ...snapA.data() } as BotPlayerRecord
    const botB = { id: snapB.id, ...snapB.data() } as BotPlayerRecord

    // Obter 10 perguntas do QuestionRegistry
    const registry = QuestionRegistry.getInstance()
    const allQuestions = registry.getAllQuestions()

    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 10)
    const duelQuestions: DuelQuestion[] = shuffled.map((q, idx) => {
      const rawOpts = Array.isArray(q.opcoes) ? q.opcoes : ['A', 'B', 'C', 'D']
      const letters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D']
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

    const simulationResult = simulateBotVsBotMatch(botA, botB, duelQuestions)

    await recordAdminAuditLog({
      adminUid: authResult.adminUser.uid,
      adminEmail: authResult.adminUser.email,
      action: 'BOT_MATCH_SIMULATED',
      entity: 'SIMULATION',
      entityId: simulationResult.matchId,
      details: `Simulou partida entre ${botA.displayName} e ${botB.displayName}. Vencedor: ${simulationResult.winnerId || 'Empate'}`,
      status: 'SUCCESS',
    })

    return NextResponse.json({
      success: true,
      simulation: simulationResult,
    })
  } catch (error: any) {
    console.error('[API BOT SIMULATE ERROR]', error)
    return NextResponse.json({ error: error.message || 'Erro ao executar simulação de partida.' }, { status: 500 })
  }
}
