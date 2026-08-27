import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { calculateLevelProgress } from '@/lib/progression'
import { ECONOMY_CONFIG, calculateLevelUpCoinReward } from '@/lib/economy'
import type { DuelDocument } from '@/lib/duel'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const idToken = authHeader.split('Bearer ')[1]
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(idToken).catch(() => null)

    if (!decodedToken || !decodedToken.uid) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 })
    }

    const userId = decodedToken.uid
    const body = await request.json().catch(() => ({}))
    const { duelId } = body

    if (!duelId) {
      return NextResponse.json({ error: 'duelId obrigatório.' }, { status: 400 })
    }

    const db = getAdminFirestore()
    const duelRef = db.collection('duels').doc(duelId)
    const userRef = db.collection('users').doc(userId)
    const publicProfileRef = db.collection('publicProfiles').doc(userId)

    const rewardResult = await db.runTransaction(async (transaction) => {
      const duelSnap = await transaction.get(duelRef)
      if (!duelSnap.exists) {
        throw new Error('Duelo não encontrado.')
      }

      const duel = duelSnap.data() as DuelDocument
      const isPlayerA = duel.playerA.uid === userId
      const isPlayerB = duel.playerB?.uid === userId

      if (!isPlayerA && !isPlayerB) {
        throw new Error('Não pertences a este duelo.')
      }

      const player = isPlayerA ? duel.playerA : duel.playerB!
      const isWinner = duel.winnerUid === userId
      const isDraw = duel.winnerUid === null
      const isLoser = !isWinner && !isDraw

      const xpReward = isWinner ? 300 : isDraw ? 150 : 100
      const baseWin = ECONOMY_CONFIG.MATCH_REWARDS.BASE_WIN_COINS
      const coinReward = isWinner ? baseWin + ECONOMY_CONFIG.MATCH_REWARDS.PERFECT_SCORE_BONUS : isDraw ? baseWin : 5
      const ratingDelta = isDraw ? 0 : isWinner ? +18 : -14

      const userSnap = await transaction.get(userRef)
      const userData = userSnap.exists ? userSnap.data() || {} : {}
      const currentXp = typeof userData.xp === 'number' ? userData.xp : 0
      const currentCoins = typeof userData.coins === 'number' ? userData.coins : typeof userData.euros === 'number' ? userData.euros : 50
      const currentRating = typeof userData.rating === 'number' ? userData.rating : 1000
      const oldLevel = typeof userData.level === 'number' ? userData.level : 1

      const rewardsClaimed = duel.rewardsClaimed || {}
      if (rewardsClaimed[userId]) {
        const levelProg = calculateLevelProgress(currentXp)
        return {
          xp: xpReward,
          coins: coinReward,
          isWinner,
          isDraw,
          isLoser,
          oldXp: currentXp,
          newXp: currentXp,
          oldCoins: currentCoins,
          newCoins: currentCoins,
          oldLevel,
          newLevel: levelProg.currentLevel.level,
          leveledUp: false,
          levelTitle: levelProg.currentLevel.title,
          alreadyClaimed: true,
        }
      }

      const newTotalXp = currentXp + xpReward
      const levelProgress = calculateLevelProgress(newTotalXp)
      const newLevel = levelProgress.currentLevel.level
      const leveledUp = newLevel > oldLevel
      const levelUpCoins = leveledUp ? calculateLevelUpCoinReward(oldLevel, newLevel) : 0
      const totalAwardedCoins = coinReward + levelUpCoins
      const newTotalCoins = currentCoins + totalAwardedCoins
      const nextRating = Math.max(500, Math.min(3000, currentRating + ratingDelta))

      if (userSnap.exists) {
        transaction.update(userRef, {
          xp: newTotalXp,
          coins: newTotalCoins,
          euros: newTotalCoins,
          level: newLevel,
          rating: nextRating,
          gamesPlayed: FieldValue.increment(1),
          wins: FieldValue.increment(isWinner ? 1 : 0),
          losses: FieldValue.increment(isLoser ? 1 : 0),
          draws: FieldValue.increment(isDraw ? 1 : 0),
          wins1v1: FieldValue.increment(isWinner ? 1 : 0),
          streak: isWinner ? FieldValue.increment(1) : 0,
          totalQuestions: FieldValue.increment(10),
          questionsAnswered: FieldValue.increment(10),
          correctAnswers: FieldValue.increment(player.correctCount || 0),
          incorrectAnswers: FieldValue.increment(Math.max(0, 10 - (player.correctCount || 0))),
          lastPlayedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })

        transaction.set(
          publicProfileRef,
          {
            uid: userId,
            displayName: userData.displayName || 'Jogador',
            photoURL: userData.photoURL || null,
            district: userData.district || 'Portugal',
            xp: newTotalXp,
            level: newLevel,
            rating: nextRating,
            wins1v1: (userData.wins1v1 || 0) + (isWinner ? 1 : 0),
            updatedAt: Date.now(),
          },
          { merge: true }
        )

        if (totalAwardedCoins > 0) {
          const txRef = userRef.collection('transactions').doc()
          transaction.set(txRef, {
            id: txRef.id,
            userId,
            type: 'earn',
            amount: totalAwardedCoins,
            reason: isWinner
              ? `⚔️ Vitória em Duelo 1v1 (${duel.code})`
              : isDraw
                ? `🤝 Empate em Duelo 1v1 (${duel.code})`
                : `💪 Participação em Duelo 1v1 (${duel.code})`,
            matchId: duelId,
            createdAt: FieldValue.serverTimestamp(),
          })
        }
      }

      transaction.update(duelRef, {
        [`rewardsClaimed.${userId}`]: true,
        updatedAt: FieldValue.serverTimestamp(),
      })

      return {
        xp: xpReward,
        coins: totalAwardedCoins,
        isWinner,
        isDraw,
        isLoser,
        oldXp: currentXp,
        newXp: newTotalXp,
        oldCoins: currentCoins,
        newCoins: newTotalCoins,
        oldLevel,
        newLevel,
        leveledUp,
        levelTitle: levelProgress.currentLevel.title,
        ratingDelta,
        newRating: nextRating,
        alreadyClaimed: false,
      }
    })

    return NextResponse.json({
      success: true,
      data: rewardResult,
    })
  } catch (error: any) {
    console.error('[API DUEL CLAIM ERROR]', error)
    return NextResponse.json({ error: error.message || 'Erro ao atribuir recompensas do duelo.' }, { status: 500 })
  }
}
