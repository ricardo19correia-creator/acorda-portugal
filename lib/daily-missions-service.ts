// Acorda Portugal — Sistema de Missões Diárias Reais
// Sincronizado com Firestore, fuso horário Europe/Lisbon, prevenção de duplicados e recompensas atómicas.

import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  increment,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import { getLisbonDateString } from './events-service'
import { playGoldCoinsShower } from './sound-engine'

export interface DailyMissionDefinition {
  id: string
  title: string
  description: string
  target: number
  xpReward: number
  coinsReward: number
  icon: 'target' | 'flame' | 'brain' | 'award' | 'zap'
  type: 'questions' | 'streak' | 'matches' | 'correct'
  highlightColor: string
}

export interface UserDailyMissionsData {
  date: string // YYYY-MM-DD em Europe/Lisbon
  questionsAnswered: number
  correctAnswers: number
  matchesPlayed: number
  bestStreak: number
  claimed: Record<string, boolean>
  lastUpdated?: any
}

export interface DailyMissionWithProgress extends DailyMissionDefinition {
  progress: number
  isComplete: boolean
  isClaimed: boolean
  percentage: number
}

// Catálogo oficial de Missões Diárias de Portugal Continental
export const OFFICIAL_DAILY_MISSIONS: DailyMissionDefinition[] = [
  {
    id: 'daily_questions_10',
    title: 'Responder a 10 Perguntas',
    description: 'Responde a 10 perguntas em qualquer modo de jogo hoje.',
    target: 10,
    xpReward: 100,
    coinsReward: 50,
    icon: 'target',
    type: 'questions',
    highlightColor: 'emerald',
  },
  {
    id: 'daily_streak_5',
    title: 'Acertar 5 Seguidas',
    description: 'Alcança uma sequência de 5 respostas corretas consecutivas hoje.',
    target: 5,
    xpReward: 150,
    coinsReward: 75,
    icon: 'flame',
    type: 'streak',
    highlightColor: 'amber',
  },
  {
    id: 'daily_matches_3',
    title: 'Jogar 3 Partidas',
    description: 'Conclui 3 partidas completas em qualquer arena de jogo hoje.',
    target: 3,
    xpReward: 200,
    coinsReward: 100,
    icon: 'brain',
    type: 'matches',
    highlightColor: 'cyan',
  },
]

/**
 * Calcula o tempo restante até à próxima meia-noite no fuso horário Europe/Lisbon.
 */
export function getLisbonMidnightCountdown(): {
  hours: number
  minutes: number
  seconds: number
  formatted: string
  totalSeconds: number
} {
  try {
    const now = new Date()
    // Obter data/hora atual em Lisboa
    const lisbonTimeStr = now.toLocaleString('en-US', { timeZone: 'Europe/Lisbon' })
    const lisbonNow = new Date(lisbonTimeStr)

    // Meia-noite seguinte em Lisboa
    const nextMidnight = new Date(lisbonNow)
    nextMidnight.setHours(24, 0, 0, 0)

    const diffMs = Math.max(0, nextMidnight.getTime() - lisbonNow.getTime())
    const totalSeconds = Math.floor(diffMs / 1000)

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const formatted = `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`

    return { hours, minutes, seconds, formatted, totalSeconds }
  } catch {
    return { hours: 8, minutes: 0, seconds: 0, formatted: '8h 00m 00s', totalSeconds: 28800 }
  }
}

/**
 * Mapeia os dados do utilizador para as missões diárias com progresso calculado de forma rigorosa.
 */
export function resolveDailyMissions(userData: any): DailyMissionWithProgress[] {
  const currentLisbonDate = getLisbonDateString()
  const rawDaily = userData?.dailyMissions as UserDailyMissionsData | undefined

  const isToday = rawDaily?.date === currentLisbonDate

  // Se os dados não pertencerem a hoje, o progresso é 0 para o novo dia
  const questionsAnswered = isToday ? Number(rawDaily?.questionsAnswered) || 0 : 0
  const correctAnswers = isToday ? Number(rawDaily?.correctAnswers) || 0 : 0
  const matchesPlayed = isToday ? Number(rawDaily?.matchesPlayed) || 0 : 0
  const bestStreak = isToday ? Number(rawDaily?.bestStreak) || 0 : 0
  const claimedMap: Record<string, boolean> = isToday && rawDaily?.claimed ? rawDaily.claimed : {}

  return OFFICIAL_DAILY_MISSIONS.map((mission) => {
    let rawProgress = 0
    switch (mission.type) {
      case 'questions':
        rawProgress = questionsAnswered
        break
      case 'correct':
        rawProgress = correctAnswers
        break
      case 'matches':
        rawProgress = matchesPlayed
        break
      case 'streak':
        rawProgress = bestStreak
        break
    }

    const progress = Math.min(mission.target, Math.max(0, rawProgress))
    const isComplete = progress >= mission.target
    const isClaimed = Boolean(claimedMap[mission.id])
    const percentage = Math.min(100, Math.round((progress / mission.target) * 100))

    return {
      ...mission,
      progress,
      isComplete,
      isClaimed,
      percentage,
    }
  })
}

/**
 * Subscreve as missões diárias em tempo real para um utilizador autenticado.
 */
export function subscribeUserDailyMissions(
  userId: string,
  onUpdate: (missions: DailyMissionWithProgress[], rawData: UserDailyMissionsData | null) => void
): Unsubscribe {
  const userRef = doc(db, 'users', userId)

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        const missions = resolveDailyMissions(data)
        const currentLisbonDate = getLisbonDateString()
        const rawDaily = data.dailyMissions?.date === currentLisbonDate ? data.dailyMissions : null
        onUpdate(missions, rawDaily)
      } else {
        onUpdate(resolveDailyMissions(null), null)
      }
    },
    (err) => {
      console.warn('[DAILY_MISSIONS] Erro na subscrição:', err)
      onUpdate(resolveDailyMissions(null), null)
    }
  )
}

export interface ClaimRewardResult {
  success: boolean
  message: string
  missionTitle: string
  xpEarned: number
  coinsEarned: number
  newXp: number
  newCoins: number
}

/**
 * Reclama a recompensa de uma missão diária concluída de forma ESTRITAMENTE ATÓMICA E IDEMPOTENTE.
 * Impede exploração por duplo clique, recarregamento ou envio concorrente.
 */
export async function claimDailyMissionReward(
  userId: string,
  missionId: string
): Promise<ClaimRewardResult> {
  if (!userId || !missionId) {
    throw new Error('Identificadores inválidos para reclamar a recompensa.')
  }

  const missionDef = OFFICIAL_DAILY_MISSIONS.find((m) => m.id === missionId)
  if (!missionDef) {
    throw new Error('Missão não encontrada no catálogo oficial.')
  }

  const currentLisbonDate = getLisbonDateString()
  const userRef = doc(db, 'users', userId)
  const auditRef = doc(db, 'users', userId, 'xp_transactions', `mission_${currentLisbonDate}_${missionId}`)

  return await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef)
    if (!userDoc.exists()) {
      throw new Error('Utilizador não encontrado.')
    }

    const userData = userDoc.data()
    const dailyData = userData.dailyMissions as UserDailyMissionsData | undefined

    if (!dailyData || dailyData.date !== currentLisbonDate) {
      throw new Error('Esta missão pertence a um ciclo anterior ou ainda não tem progresso registado hoje.')
    }

    if (dailyData.claimed && dailyData.claimed[missionId]) {
      throw new Error('A recompensa desta missão já foi reclamada hoje!')
    }

    // Verificar se o objetivo foi verdadeiramente cumprido
    let rawProgress = 0
    switch (missionDef.type) {
      case 'questions':
        rawProgress = Number(dailyData.questionsAnswered) || 0
        break
      case 'correct':
        rawProgress = Number(dailyData.correctAnswers) || 0
        break
      case 'matches':
        rawProgress = Number(dailyData.matchesPlayed) || 0
        break
      case 'streak':
        rawProgress = Number(dailyData.bestStreak) || 0
        break
    }

    if (rawProgress < missionDef.target) {
      throw new Error(`Objetivo incompleto: tens ${rawProgress}/${missionDef.target}.`)
    }

    // Calcular novos valores
    const currentXp = Number(userData.xp) || 0
    const currentCoins = Number(userData.coins ?? userData.euros) || 0

    const nextXp = currentXp + missionDef.xpReward
    const nextCoins = currentCoins + missionDef.coinsReward

    // Registar documento de auditoria para garantia absoluta de idempotência
    transaction.set(auditRef, {
      id: `mission_${currentLisbonDate}_${missionId}`,
      userId,
      missionId,
      missionTitle: missionDef.title,
      date: currentLisbonDate,
      amount: missionDef.xpReward,
      coinsAwarded: missionDef.coinsReward,
      sourceType: 'daily_mission',
      sourceId: missionId,
      claimedAt: serverTimestamp(),
    })

    // Atualizar utilizador
    transaction.update(userRef, {
      xp: increment(missionDef.xpReward),
      coins: increment(missionDef.coinsReward),
      euros: increment(missionDef.coinsReward),
      acordas: increment(missionDef.coinsReward),
      moedas: increment(missionDef.coinsReward),
      [`dailyMissions.claimed.${missionId}`]: true,
      'dailyMissions.lastUpdated': serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return {
      success: true,
      message: `Recompensa reclamada com sucesso! +${missionDef.xpReward} XP e +${missionDef.coinsReward} Acordas adicionados à tua conta.`,
      missionTitle: missionDef.title,
      xpEarned: missionDef.xpReward,
      coinsEarned: missionDef.coinsReward,
      newXp: nextXp,
      newCoins: nextCoins,
    }
  }).then((res) => {
    // Feedback sonoro e eventos de sincronização imediata
    try {
      playGoldCoinsShower()
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('user_xp', String(res.newXp))
        localStorage.setItem('user_coins', String(res.newCoins))
        localStorage.setItem('user_euros', String(res.newCoins))

        window.dispatchEvent(
          new CustomEvent('profile_updated', {
            detail: {
              xp: res.newXp,
              coins: res.newCoins,
              euros: res.newCoins,
            },
          })
        )

        window.dispatchEvent(
          new CustomEvent('balance_updated', {
            detail: {
              coins: res.newCoins,
            },
          })
        )
      } catch {}
    }

    return res
  })
}
