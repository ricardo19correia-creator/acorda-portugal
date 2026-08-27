import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { findBestBotForMatchmaking } from '@/lib/bot-network/bot-population-manager'
import { generateBotDuelAnswers, updateBotPostMatchStats } from '@/lib/bot-network/bot-duel-runner'
import type { DuelDocument, DuelPlayerData } from '@/lib/duel'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { roomId, userId, level = 1, rating = 1000 } = body

    if (!roomId || !userId) {
      return NextResponse.json({ error: 'roomId e userId são obrigatórios.' }, { status: 400 })
    }

    const db = getAdminFirestore()
    const roomRef = db.collection('duels').doc(roomId)
    const roomSnap = await roomRef.get()

    if (!roomSnap.exists) {
      return NextResponse.json({ error: 'Sala de duelo não encontrada.' }, { status: 404 })
    }

    const duel = roomSnap.data() as DuelDocument

    // Garantir que a sala ainda está à espera e pertence ao jogador
    if (duel.status !== 'waiting' || duel.playerB || duel.playerA.uid !== userId) {
      return NextResponse.json({ error: 'Sala indisponível para emparelhamento.' }, { status: 400 })
    }

    // 1. Selecionar o melhor bot disponível na rede
    const bot = await findBestBotForMatchmaking(Number(rating) || 1000, Number(level) || 1)

    if (!bot) {
      return NextResponse.json({ error: 'Nenhum desafiante virtual disponível de momento.' }, { status: 503 })
    }

    // 2. Marcar o bot como em partida
    await db.collection('botPlayers').doc(bot.id).update({
      status: 'IN_MATCH',
      lastActiveAt: Date.now(),
    })

    const startedAt = Date.now() + 3000
    const firstDeadline = startedAt + 60_000

    // 3. Gerar respostas human-like do bot para as 10 perguntas
    const botSim = generateBotDuelAnswers(bot, duel.questions, startedAt)

    const botPlayerData: DuelPlayerData = {
      uid: bot.id,
      displayName: bot.displayName,
      photoURL: bot.avatar,
      avatar: bot.avatar,
      avatarUrl: bot.avatar,
      level: bot.level,
      district: bot.district,
      score: botSim.totalScore,
      correctCount: botSim.correctCount,
      currentQuestionIndex: duel.questions.length,
      answers: botSim.answers,
      finished: true,
      finishedAt: startedAt + Math.round(botSim.totalTimeSpent * 1000),
      questionStartedAt: startedAt,
      questionDeadline: firstDeadline,
    }

    // 4. Atualizar documento do Duelo no Firestore
    await roomRef.update({
      status: 'matched',
      playerB: botPlayerData,
      playerUids: [duel.playerA.uid, bot.id],
      startedAt,
      'playerA.questionStartedAt': startedAt,
      'playerA.questionDeadline': firstDeadline,
    })

    // 5. Agendar atualização assíncrona de estatísticas do bot após fim previsto da partida
    setTimeout(
      () => {
        const isBotWinner = botSim.totalScore > (duel.playerA.score || 0)
        const isDraw = botSim.totalScore === (duel.playerA.score || 0)
        updateBotPostMatchStats(bot.id, isBotWinner, isDraw, botSim.totalScore).catch(() => {})
      },
      Math.max(15000, Math.round(botSim.totalTimeSpent * 1000))
    )

    return NextResponse.json({
      success: true,
      matched: true,
      opponent: {
        displayName: bot.displayName,
        photoURL: bot.avatar,
        level: bot.level,
        district: bot.district,
        isBot: true,
      },
    })
  } catch (err: any) {
    console.error('[/api/duel/bot-match ERROR]:', err)
    return NextResponse.json({ error: err.message || 'Erro ao emparelhar com desafiante virtual.' }, { status: 500 })
  }
}
