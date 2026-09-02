import { doc, runTransaction, serverTimestamp, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { calculateLevelProgress } from '@/lib/progression'

export interface DailyRewardItem {
  day: number
  label: string
  rewardText: string
  coins?: number
  xp?: number
  powerUp?: 'help5050' | 'freezeTime' | 'publicVote'
  icon: string
  description: string
}

export const DAILY_REWARDS_SCHEDULE: DailyRewardItem[] = [
  {
    day: 1,
    label: 'Dia 1',
    rewardText: '+€25 Moedas',
    coins: 25,
    icon: '🪙',
    description: 'Bónus de boas-vindas do primeiro dia.',
  },
  {
    day: 2,
    label: 'Dia 2',
    rewardText: '+150 XP',
    xp: 150,
    icon: '⭐',
    description: 'Acelera a subida de nível do teu perfil.',
  },
  {
    day: 3,
    label: 'Dia 3',
    rewardText: '1x Ajuda 50/50',
    powerUp: 'help5050',
    icon: '🎯',
    description: 'Elimina duas alternativas erradas numa pergunta difícil.',
  },
  {
    day: 4,
    label: 'Dia 4',
    rewardText: '+€50 Moedas',
    coins: 50,
    icon: '🪙',
    description: 'Enche a tua carteira para comprar novos avatares na Loja.',
  },
  {
    day: 5,
    label: 'Dia 5',
    rewardText: '1x Congelar Tempo',
    powerUp: 'freezeTime',
    icon: '❄️',
    description: 'Ganha tempo extra de reflexão no solo ou nos duelos 1v1.',
  },
  {
    day: 6,
    label: 'Dia 6',
    rewardText: '+300 XP',
    xp: 300,
    icon: '⭐',
    description: 'Grande impulso de experiência para o ranking de Portugal.',
  },
  {
    day: 7,
    label: 'Dia 7',
    rewardText: '+€100 & +500 XP',
    coins: 100,
    xp: 500,
    icon: '👑',
    description: 'Grande recompensa semanal para quem completa 7 dias seguidos!',
  },
]

export function getTodayDateString(): string {
  // Timezone de Portugal (Europe/Lisbon)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(new Date())
}

export function getYesterdayDateString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(d)
}

export interface DailyRewardStatus {
  canClaim: boolean
  currentDay: number
  lastClaimedDate: string | null
}

export function evaluateDailyRewardStatus(profile: any): DailyRewardStatus {
  const today = getTodayDateString()
  const yesterday = getYesterdayDateString()

  const dailyInfo = profile?.dailyReward || {}
  const lastDate = dailyInfo.lastClaimedDate || (typeof window !== 'undefined' ? localStorage.getItem('daily_reward_last_date') : null)
  const savedDay = typeof dailyInfo.currentDay === 'number' ? dailyInfo.currentDay : (typeof window !== 'undefined' ? Number(localStorage.getItem('daily_reward_day') || 0) : 0)

  if (lastDate === today) {
    return {
      canClaim: false,
      currentDay: savedDay || 1,
      lastClaimedDate: lastDate,
    }
  }

  if (lastDate === yesterday) {
    const nextDay = savedDay >= 7 ? 1 : savedDay + 1
    return {
      canClaim: true,
      currentDay: nextDay,
      lastClaimedDate: lastDate,
    }
  }

  // Se nunca jogou ou quebrou a sequência
  return {
    canClaim: true,
    currentDay: 1,
    lastClaimedDate: lastDate,
  }
}

export interface ClaimRewardResult {
  success: boolean
  alreadyClaimed?: boolean
  error?: string
  reward?: DailyRewardItem
  currentDay?: number
  newTotalXp?: number
  newTotalCoins?: number
  newLevel?: number
}

export async function claimDailyReward(userId: string): Promise<ClaimRewardResult> {
  if (!userId) {
    return { success: false, error: 'Utilizador não autenticado.' }
  }

  const today = getTodayDateString()
  const yesterday = getYesterdayDateString()
  const userRef = doc(db, 'users', userId)
  const publicProfileRef = doc(db, 'publicProfiles', userId)

  try {
    const result = await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef)
      if (!userSnap.exists()) {
        throw new Error('Perfil de utilizador não encontrado no Firestore.')
      }

      const userData = userSnap.data() || {}
      const dailyInfo = userData.dailyReward || {}
      const lastDate = dailyInfo.lastClaimedDate

      // Idempotência estrita: se já reclamou hoje
      if (lastDate === today) {
        return {
          alreadyClaimed: true,
          currentDay: dailyInfo.currentDay || 1,
        }
      }

      const savedDay = typeof dailyInfo.currentDay === 'number' ? dailyInfo.currentDay : 0
      let dayToClaim = 1
      if (lastDate === yesterday) {
        dayToClaim = savedDay >= 7 ? 1 : savedDay + 1
      }

      const reward = DAILY_REWARDS_SCHEDULE.find((r) => r.day === dayToClaim) || DAILY_REWARDS_SCHEDULE[0]

      const currentXp = typeof userData.xp === 'number' && !isNaN(userData.xp) ? userData.xp : 0
      const currentCoins = typeof userData.coins === 'number' && !isNaN(userData.coins) ? userData.coins : (typeof userData.euros === 'number' ? userData.euros : 0)

      const xpGain = reward.xp || 0
      const coinsGain = reward.coins || 0

      const newTotalXp = currentXp + xpGain
      const newTotalCoins = currentCoins + coinsGain
      const newLevelInfo = calculateLevelProgress(newTotalXp)
      const newLevel = newLevelInfo.currentLevel.level

      const updates: Record<string, any> = {
        xp: newTotalXp,
        level: newLevel,
        coins: newTotalCoins,
        euros: newTotalCoins,
        'dailyReward.lastClaimedDate': today,
        'dailyReward.currentDay': dayToClaim,
        updatedAt: serverTimestamp(),
      }

      if (reward.powerUp) {
        const key = reward.powerUp === 'help5050' ? 'help5050' : reward.powerUp === 'freezeTime' ? 'freezeTime' : 'publicVote'
        const curStock = userData.consumables?.[key] || 0
        updates[`consumables.${key}`] = curStock + 1
      }

      transaction.update(userRef, updates)

      // Atualiza também o perfil público para os Rankings Nacionais
      transaction.set(
        publicProfileRef,
        {
          uid: userId,
          xp: newTotalXp,
          level: newLevel,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      return {
        alreadyClaimed: false,
        reward,
        dayToClaim,
        newTotalXp,
        newTotalCoins,
        newLevel,
      }
    })

    if (result.alreadyClaimed) {
      return {
        success: false,
        alreadyClaimed: true,
        currentDay: result.currentDay,
      }
    }

    // Sincronização local
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('daily_reward_last_date', today)
        localStorage.setItem('daily_reward_day', String(result.dayToClaim))
        if (result.newTotalXp !== undefined) localStorage.setItem('user_xp', String(result.newTotalXp))
        if (result.newTotalCoins !== undefined) localStorage.setItem('user_coins', String(result.newTotalCoins))
        if (result.newLevel !== undefined) localStorage.setItem('user_level', String(result.newLevel))
      } catch {}

      window.dispatchEvent(new CustomEvent('balance_updated', { detail: { coins: result.newTotalCoins } }))
      window.dispatchEvent(
        new CustomEvent('profile_updated', {
          detail: {
            xp: result.newTotalXp,
            level: result.newLevel,
            coins: result.newTotalCoins,
            euros: result.newTotalCoins,
          },
        })
      )
    }

    return {
      success: true,
      reward: result.reward,
      currentDay: result.dayToClaim,
      newTotalXp: result.newTotalXp,
      newTotalCoins: result.newTotalCoins,
      newLevel: result.newLevel,
    }
  } catch (err: any) {
    console.error('[DAILY_REWARD] Erro na transação de recompensa diária:', err)
    return { success: false, error: err?.message || 'Erro ao atribuir recompensa diária.' }
  }
}
