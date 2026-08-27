import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { BotPlayerRecord, BotPopulationConfig, BotPopulationStatus } from './types'
import { generate125Bots } from './bot-generator'

const DEFAULT_POPULATION_CONFIG: BotPopulationConfig = {
  totalBots: 125,
  activationDurationHours: 24,
  activationStartTime: Date.now(),
  curve: 'dynamic',
  minimumBotsActive: 5,
  maximumBotsActive: 125,
  isNetworkPaused: false,
}

/**
 * Calcula o alvo de bots ativos pela curva de 24 horas
 */
export function calculateTargetActiveBots(
  config: BotPopulationConfig,
  currentTime = Date.now(),
  humansOnline = 0,
): number {
  if (config.isNetworkPaused) return 0

  const elapsedMs = Math.max(0, currentTime - config.activationStartTime)
  const elapsedHours = elapsedMs / (1000 * 60 * 60)

  if (elapsedHours >= config.activationDurationHours) {
    // 24 horas concluídas: Todos os bots disponíveis respeitando limites
    return config.totalBots
  }

  // Curva Sigmoide / Suave ao longo de 24 horas:
  // Hora 0: ~5 bots
  // Hora 6: ~25 bots
  // Hora 12: ~65 bots
  // Hora 18: ~100 bots
  // Hora 24: 125 bots
  const progressRatio = Math.min(1.0, elapsedHours / config.activationDurationHours)
  const sigmoidFactor = 1 / (1 + Math.exp(-6 * (progressRatio - 0.5)))
  const baseTarget = Math.round(
    config.minimumBotsActive + (config.totalBots - config.minimumBotsActive) * sigmoidFactor
  )

  // Modulador de Sensibilidade Humana:
  // Se houver muitos humanos online, podemos poupar bots (-10%)
  // Se houver poucos humanos online, aumentamos a prontidão (+15%)
  let humanModifier = 0
  if (humansOnline > 20) {
    humanModifier = -Math.round(baseTarget * 0.1)
  } else if (humansOnline < 5) {
    humanModifier = +Math.round(baseTarget * 0.15)
  }

  const finalTarget = Math.max(
    config.minimumBotsActive,
    Math.min(config.maximumBotsActive, baseTarget + humanModifier)
  )

  return finalTarget
}

/**
 * Avalia e sincroniza a população de bots no Firestore
 */
export async function syncBotPopulationState(): Promise<BotPopulationStatus> {
  const db = getAdminFirestore()

  // 1. Obter configuração da população
  const configDocRef = db.collection('adminSettings').doc('bot_population')
  const configSnap = await configDocRef.get()

  let config = DEFAULT_POPULATION_CONFIG
  if (configSnap.exists) {
    config = { ...DEFAULT_POPULATION_CONFIG, ...configSnap.data() }
  } else {
    await configDocRef.set({ ...DEFAULT_POPULATION_CONFIG, createdAt: FieldValue.serverTimestamp() })
  }

  // 2. Verificar se a pool de 125 bots existe
  const botsSnap = await db.collection('botPlayers').get()

  if (botsSnap.empty) {
    // Inicializar a pool completa de 125 bots
    const newBots = generate125Bots()
    const batch = db.batch()

    // Ativar os primeiros 5 bots iniciais (Hora 0)
    for (let i = 0; i < newBots.length; i++) {
      const b = newBots[i]
      if (i < config.minimumBotsActive && !config.isNetworkPaused) {
        b.status = 'ACTIVE'
        b.activatedAt = Date.now()
      }
      const ref = db.collection('botPlayers').doc(b.id)
      batch.set(ref, b)
    }

    await batch.commit()
    console.log('[BOT POPULATION] 125 Bots gerados e inicializados com sucesso!')
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
  const allBots = (await db.collection('botPlayers').get()).docs.map((d) => ({
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
  let hasChanges = false

  allBots.forEach((bot, index) => {
    totalRating += bot.rating || 1000
    totalAccuracy += bot.accuracyPercentage || 70

    if (bot.status === 'SUSPENDED') {
      suspendedCount++
      return
    }
    if (bot.status === 'RETIRED') {
      retiredCount++
      return
    }
    if (bot.status === 'IN_MATCH') {
      inMatchCount++
      activeCount++
      return
    }

    if (config.isNetworkPaused) {
      if (bot.status !== 'INACTIVE') {
        batch.update(db.collection('botPlayers').doc(bot.id), {
          status: 'INACTIVE',
          updatedAt: FieldValue.serverTimestamp(),
        })
        hasChanges = true
      }
      inactiveCount++
      return
    }

    // Se o bot estiver dentro da quota da curva, ativar; caso contrário, inativar
    const shouldBeActive = index < targetActive

    if (shouldBeActive && bot.status !== 'ACTIVE') {
      batch.update(db.collection('botPlayers').doc(bot.id), {
        status: 'ACTIVE',
        activatedAt: bot.activatedAt || Date.now(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      hasChanges = true
      activeCount++
    } else if (!shouldBeActive && bot.status === 'ACTIVE') {
      batch.update(db.collection('botPlayers').doc(bot.id), {
        status: 'INACTIVE',
        updatedAt: FieldValue.serverTimestamp(),
      })
      hasChanges = true
      inactiveCount++
    } else if (bot.status === 'ACTIVE') {
      activeCount++
    } else {
      inactiveCount++
    }
  })

  if (hasChanges) {
    await batch.commit()
  }

  const elapsedHours = (now - config.activationStartTime) / (1000 * 60 * 60)
  const completionPercentage = Math.min(
    100,
    Math.round((elapsedHours / config.activationDurationHours) * 100)
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
    .limit(50)
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

  // Selecionar aleatoriamente entre os 3 mais compatíveis para diversidade
  const topCandidates = candidates.slice(0, 3)
  const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)]

  return chosen || null
}
