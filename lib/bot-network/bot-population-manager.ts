import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type {
  BotPlayerRecord,
  BotPlayerPrivateRecord,
  BotPopulationConfig,
  BotPopulationStatus,
} from './types'
import { generateBotsPoolV2, DEFAULT_24H_TARGETS } from './bot-generator'

const DEFAULT_POPULATION_CONFIG: BotPopulationConfig = {
  totalBotsInPool: 125,
  activationScheduleHours: 24,
  activationStartTime: Date.now(),
  hourlyActiveTargets: DEFAULT_24H_TARGETS,
  minimumBotsActive: 5,
  maximumBotsActive: 125,
  isNetworkPaused: false,
}

/**
 * Calcula o alvo de bots ativos com base no tempo decorrido da curva de 24h
 * e no tráfego humano em tempo real
 */
export function calculateTargetActiveBots(
  config: BotPopulationConfig,
  currentTime = Date.now(),
  humansOnline = 0,
): number {
  if (config.isNetworkPaused) return 0

  const targets = config.hourlyActiveTargets || DEFAULT_24H_TARGETS
  const elapsedMs = Math.max(0, currentTime - (config.activationStartTime || currentTime))
  const elapsedHours = elapsedMs / (1000 * 60 * 60)

  let baseTarget: number

  if (elapsedHours >= (config.activationScheduleHours || 24)) {
    baseTarget = targets[targets.length - 1] || 125
  } else {
    const hourFloor = Math.floor(elapsedHours)
    const hourCeil = Math.min(targets.length - 1, hourFloor + 1)
    const hourFraction = elapsedHours - hourFloor

    const valFloor = targets[Math.min(targets.length - 1, hourFloor)] || 5
    const valCeil = targets[hourCeil] || valFloor

    // Interpolação suave entre as horas
    baseTarget = Math.round(valFloor + (valCeil - valFloor) * hourFraction)
  }

  // Modulador Dinâmico de Tráfego Humano:
  // Se existirem muitos humanos online, reduz a necessidade de bots.
  // Se existirem poucos humanos online, aumenta ligeiramente a prontidão de bots.
  let humanModifier = 0
  if (humansOnline > 25) {
    humanModifier = -Math.round(baseTarget * 0.08)
  } else if (humansOnline < 3) {
    humanModifier = +Math.round(baseTarget * 0.05)
  }

  const finalTarget = Math.max(
    config.minimumBotsActive || 5,
    Math.min(config.maximumBotsActive || 125, baseTarget + humanModifier)
  )

  return finalTarget
}

/**
 * Avalia e sincroniza o estado da população de bots no Firestore
 * (tanto a coleção pública botPlayers como a privada botPlayersPrivate)
 */
export async function syncBotPopulationState(): Promise<BotPopulationStatus> {
  const db = getAdminFirestore()

  // 1. Obter ou inicializar configuração da população em adminSettings/bot_population
  const configDocRef = db.collection('adminSettings').doc('bot_population')
  const configSnap = await configDocRef.get()

  let config = DEFAULT_POPULATION_CONFIG
  if (configSnap.exists) {
    config = { ...DEFAULT_POPULATION_CONFIG, ...configSnap.data() }
  } else {
    await configDocRef.set({
      ...DEFAULT_POPULATION_CONFIG,
      createdAt: FieldValue.serverTimestamp(),
    })
  }

  // 2. Verificar se a pool de 125 bots existe em botPlayers
  const botsSnap = await db.collection('botPlayers').get()

  if (botsSnap.size < 50) {
    // Inicializar as duas coleções (botPlayers e botPlayersPrivate)
    const { publicRecords, privateRecords } = generateBotsPoolV2(125)

    // Gravar botPlayers
    for (let i = 0; i < publicRecords.length; i += 250) {
      const batch = db.batch()
      const slice = publicRecords.slice(i, i + 250)
      slice.forEach((b) => {
        const ref = db.collection('botPlayers').doc(b.id)
        batch.set(ref, b)
      })
      await batch.commit()
    }

    // Gravar botPlayersPrivate
    for (let i = 0; i < privateRecords.length; i += 250) {
      const batch = db.batch()
      const slice = privateRecords.slice(i, i + 250)
      slice.forEach((priv) => {
        const ref = db.collection('botPlayersPrivate').doc(priv.id)
        batch.set(ref, priv)
      })
      await batch.commit()
    }

    console.log('[BOT NETWORK V2] 125 bots inicializados em botPlayers e botPlayersPrivate!')
  }

  // 3. Obter Humanos Reais Online via presence
  const now = Date.now()
  const cutoffPresence = now - 45_000 // 45 segundos de heartbeat
  const presenceSnap = await db
    .collection('presence')
    .where('lastActive', '>=', cutoffPresence)
    .get()
    .catch(() => ({ size: 0, docs: [] }))
  const humanPlayersOnline = Math.max(1, presenceSnap.size)

  // 4. Obter Partidas Ativas no servidor
  const activeDuelsSnap = await db
    .collection('duels')
    .where('status', 'in', ['matched', 'playing'])
    .get()
    .catch(() => ({ size: 0, docs: [] }))
  const activeMatchesCount = activeDuelsSnap.size

  // 5. Calcular Meta da Curva Atual
  const targetActive = calculateTargetActiveBots(config, now, humanPlayersOnline)

  // 6. Atualizar Estados dos Bots no Firestore
  const allBotsDocs = (await db.collection('botPlayers').get()).docs
  const allBots = allBotsDocs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as BotPlayerRecord[]

  // Ordenar por ID numérico (BOT_0001 ...)
  allBots.sort((a, b) => a.id.localeCompare(b.id))

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
    totalAccuracy += bot.accuracyPercentage || 65

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

  // 7. Sincronizar bots ativos para publicProfiles para visibilidade instantânea nos rankings
  const activeBots = allBots.filter((b) => b.status === 'ACTIVE' || b.status === 'IN_MATCH')
  if (activeBots.length > 0) {
    try {
      const pubBatch = db.batch()
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

  const elapsedHours = (now - (config.activationStartTime || now)) / (1000 * 60 * 60)
  const durationHours = config.activationScheduleHours || 24
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
    avgRating: allBots.length > 0 ? Math.round(totalRating / allBots.length) : 1240,
    avgAccuracy: allBots.length > 0 ? Math.round(totalAccuracy / allBots.length) : 65,
    avgIntelligence: 62,
    humanPlayersOnline,
    activeMatchesCount,
  }
}

/**
 * Seleciona o melhor bot disponível para uma partida 1v1
 * Considera rating, nível, disponibilidade e histórico recente contra o jogador
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

  // Selecionar aleatoriamente entre os 5 mais compatíveis para diversidade
  const topCandidates = candidates.slice(0, 5)
  const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)]

  return chosen || null
}
