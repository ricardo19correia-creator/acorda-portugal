import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { BotPlayerRecord, BotPopulationConfig, BotPopulationStatus } from './types'
import { generateBotsPool } from './bot-generator'

const DEFAULT_POPULATION_CONFIG: BotPopulationConfig = {
  initialActiveBots: 157,
  additionalBots: 300,
  totalBots: 457,
  activationDurationHours: 15,
  activationStartTime: Date.now(),
  curve: 'dynamic',
  minimumBotsActive: 157,
  maximumBotsActive: 457,
  isNetworkPaused: false,
}

/**
 * Calcula o alvo de bots ativos com 157 imediatos e +300 ao longo de 15 horas
 */
export function calculateTargetActiveBots(
  config: BotPopulationConfig,
  currentTime = Date.now(),
  humansOnline = 0,
): number {
  if (config.isNetworkPaused) return 0

  const initial = config.initialActiveBots || 157
  const additional = config.additionalBots || 300
  const durationHours = config.activationDurationHours || 15

  const elapsedMs = Math.max(0, currentTime - config.activationStartTime)
  const elapsedHours = elapsedMs / (1000 * 60 * 60)

  if (elapsedHours >= durationHours) {
    return initial + additional // 457 bots no total
  }

  // Progresso linear/suave ao longo de 15 horas:
  // Hora 0: 157 bots
  // Hora 3: 157 + 60 = 217 bots
  // Hora 7.5: 157 + 150 = 307 bots
  // Hora 12: 157 + 240 = 397 bots
  // Hora 15: 157 + 300 = 457 bots
  const progressRatio = Math.min(1.0, elapsedHours / durationHours)
  const addedNow = Math.round(additional * progressRatio)
  const baseTarget = initial + addedNow

  // Modulador de Tráfego Humano
  let humanModifier = 0
  if (humansOnline > 30) {
    humanModifier = -Math.round(baseTarget * 0.05)
  } else if (humansOnline < 5) {
    humanModifier = +Math.round(baseTarget * 0.05)
  }

  const finalTarget = Math.max(
    initial,
    Math.min(config.totalBots || 457, baseTarget + humanModifier)
  )

  return finalTarget
}

/**
 * Avalia e sincroniza a população de bots no Firestore (botPlayers e publicProfiles)
 */
export async function syncBotPopulationState(): Promise<BotPopulationStatus> {
  const db = getAdminFirestore()

  // 1. Obter ou inicializar configuração da população
  const configDocRef = db.collection('adminSettings').doc('bot_population')
  const configSnap = await configDocRef.get()

  let config = DEFAULT_POPULATION_CONFIG
  if (configSnap.exists) {
    config = { ...DEFAULT_POPULATION_CONFIG, ...configSnap.data() }
  } else {
    await configDocRef.set({ ...DEFAULT_POPULATION_CONFIG, createdAt: FieldValue.serverTimestamp() })
  }

  // 2. Verificar se a pool de 457 bots existe
  const botsSnap = await db.collection('botPlayers').get()

  if (botsSnap.size < 157) {
    // Inicializar a pool completa de 457 bots (157 ativos já)
    const newBots = generateBotsPool(457, 157)

    // Escrever em chunks de 400 (limite Firestore batch é 500)
    for (let i = 0; i < newBots.length; i += 400) {
      const batch = db.batch()
      const slice = newBots.slice(i, i + 400)
      slice.forEach((b) => {
        const ref = db.collection('botPlayers').doc(b.id)
        batch.set(ref, b)
      })
      await batch.commit()
    }

    console.log('[BOT POPULATION] 457 Bots gerados (157 ativos imediatamente + 300 nas próximas 15h)!')
  }

  // 3. Obter contagem de humanos online
  const presenceSnap = await db
    .collection('presence')
    .where('online', '==', true)
    .get()
    .catch(() => ({ size: 0 }))
  const humansOnline = presenceSnap.size

  // 4. Calcular Meta da Curva Atual
  const now = Date.now()
  const targetActive = calculateTargetActiveBots(config, now, humansOnline)

  // 5. Atualizar Estados dos Bots no Firestore
  const allBotsDocs = (await db.collection('botPlayers').get()).docs
  const allBots = allBotsDocs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as BotPlayerRecord[]

  let activeCount = 0
  let inMatchCount = 0
  let inactiveCount = 0
  let suspendedCount = 0
  let retiredCount = 0
  let totalRating = 0
  let totalAccuracy = 0

  const batch = db.batch()
  let changesInBatch = 0

  for (let index = 0; index < allBots.length; index++) {
    const bot = allBots[index]
    totalRating += bot.rating || 1000
    totalAccuracy += bot.accuracyPercentage || 70

    if (bot.status === 'SUSPENDED') {
      suspendedCount++
      continue
    }
    if (bot.status === 'RETIRED') {
      retiredCount++
      continue
    }
    if (bot.status === 'IN_MATCH') {
      inMatchCount++
      activeCount++
      continue
    }

    if (config.isNetworkPaused) {
      if (bot.status !== 'INACTIVE') {
        batch.update(db.collection('botPlayers').doc(bot.id), {
          status: 'INACTIVE',
          updatedAt: FieldValue.serverTimestamp(),
        })
        changesInBatch++
      }
      inactiveCount++
      continue
    }

    const shouldBeActive = index < targetActive

    if (shouldBeActive && bot.status !== 'ACTIVE') {
      batch.update(db.collection('botPlayers').doc(bot.id), {
        status: 'ACTIVE',
        activatedAt: bot.activatedAt || Date.now(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      changesInBatch++
      activeCount++
    } else if (!shouldBeActive && bot.status === 'ACTIVE') {
      batch.update(db.collection('botPlayers').doc(bot.id), {
        status: 'INACTIVE',
        updatedAt: FieldValue.serverTimestamp(),
      })
      changesInBatch++
      inactiveCount++
    } else if (bot.status === 'ACTIVE') {
      activeCount++
    } else {
      inactiveCount++
    }
  }

  if (changesInBatch > 0) {
    await batch.commit()
  }

  // 6. Sincronizar bots ativos para a coleção publicProfiles para visibilidade instantânea em rankings
  const activeBots = allBots.filter((b) => b.status === 'ACTIVE' || b.status === 'IN_MATCH')
  if (activeBots.length > 0) {
    try {
      const pubBatch = db.batch()
      // Atualizar primeiros 100 bots ativos em publicProfiles
      activeBots.slice(0, 100).forEach((b) => {
        const pubRef = db.collection('publicProfiles').doc(b.id)
        pubBatch.set(
          pubRef,
          {
            uid: b.id,
            displayName: b.displayName,
            avatar: b.avatar,
            photoURL: b.avatar,
            district: b.district,
            xp: b.xp,
            level: b.level,
            rating: b.rating,
            wins1v1: b.wins,
            wins: b.wins,
            title: `Desafiante de ${b.district}`,
            isBot: true,
            updatedAt: Date.now(),
          },
          { merge: true }
        )
      })
      await pubBatch.commit()
    } catch (pubErr) {
      console.warn('[BOT SYNC] Erro ao sincronizar publicProfiles:', pubErr)
    }
  }

  const elapsedHours = (now - config.activationStartTime) / (1000 * 60 * 60)
  const durationHours = config.activationDurationHours || 15
  const completionPercentage = Math.min(
    100,
    Math.round((elapsedHours / durationHours) * 100)
  )

  return {
    totalBotsInPool: allBots.length,
    activeBots: activeCount,
    inMatchBots: inMatchCount,
    inactiveBots: inactiveCount,
    suspendedBots: suspendedCount,
    retiredBots: retiredCount,
    targetActiveByCurve: targetActive,
    hoursElapsedSinceStart: Number(elapsedHours.toFixed(1)),
    activationDurationHours: durationHours,
    completionPercentage,
    isPaused: config.isNetworkPaused,
    avgRating: allBots.length > 0 ? Math.round(totalRating / allBots.length) : 1200,
    avgAccuracy: allBots.length > 0 ? Math.round(totalAccuracy / allBots.length) : 70,
  }
}

/**
 * Seleciona o melhor bot disponível para uma partida 1v1
 */
export async function findBestBotForMatchmaking(
  playerRating: number,
  playerLevel: number,
  recentOpponentUids: string[] = [],
): Promise<BotPlayerRecord | null> {
  const db = getAdminFirestore()

  const snap = await db
    .collection('botPlayers')
    .where('status', '==', 'ACTIVE')
    .limit(100)
    .get()

  if (snap.empty) return null

  let candidates = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as BotPlayerRecord[]

  // 1. Filtrar bots recentemente enfrentados (cooldown anti-repetição)
  if (recentOpponentUids.length > 0) {
    const unplayed = candidates.filter((b) => !recentOpponentUids.includes(b.id))
    if (unplayed.length > 0) {
      candidates = unplayed
    }
  }

  // 2. Ordenar por proximidade de ELO / Rating
  candidates.sort((a, b) => {
    const diffA = Math.abs((a.rating || 1000) - playerRating)
    const diffB = Math.abs((b.rating || 1000) - playerRating)
    return diffA - diffB
  })

  // Selecionar aleatoriamente entre os 5 mais compatíveis para grande diversidade
  const topCandidates = candidates.slice(0, 5)
  const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)]

  return chosen || null
}
