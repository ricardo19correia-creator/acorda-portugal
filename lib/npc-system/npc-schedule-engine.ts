import { NPC_CATALOG } from './npc-catalog'
import type { ActiveNpcPresence, NpcProfile } from './types'

const ACTIVITY_LABELS: Record<string, string> = {
  playing: 'A jogar quiz',
  duel: 'Em duelo',
  ranking: 'A ver ranking',
  profile: 'No perfil',
  browsing: 'A explorar',
}

const POSSIBLE_ACTIVITIES: Array<'playing' | 'duel' | 'ranking' | 'profile' | 'browsing'> = [
  'playing',
  'playing',
  'duel',
  'ranking',
  'browsing',
]

/**
 * Retorna os NPCs atualmente simulados como ativos em Portugal (Europe/Lisbon)
 * de acordo com a curva horária natural de 24 horas.
 */
export function getActiveNPCs(date = new Date()): {
  activeNpcs: ActiveNpcPresence[]
  npcCount: number
  targetCount: number
} {
  let hour = 12
  let minute = 0

  try {
    const formatter = new Intl.DateTimeFormat('pt-PT', {
      timeZone: 'Europe/Lisbon',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    })
    const parts = formatter.formatToParts(date)
    const rawHour = parseInt(parts.find((p) => p.type === 'hour')?.value || '12', 10)
    hour = (isNaN(rawHour) ? date.getHours() : rawHour) % 24
    const rawMin = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10)
    minute = isNaN(rawMin) ? date.getMinutes() : rawMin
  } catch {
    hour = date.getHours() % 24
    minute = date.getMinutes()
  }

  // Bloco de 5 minutos para rotação determinística e suave
  const fiveMinBucket = Math.floor(minute / 5)

  // Alvo de NPCs ativos por faixa horária rigorosa (Europe/Lisbon)
  let targetCount = 12
  if (hour >= 0 && hour < 6) {
    targetCount = 5 // 00:00–06:00: Madrugada
  } else if (hour >= 6 && hour < 9) {
    targetCount = 8 // 06:00–09:00: Início da manhã
  } else if (hour >= 9 && hour < 12) {
    targetCount = 12 // 09:00–12:00: Manhã
  } else if (hour >= 12 && hour < 14) {
    targetCount = 18 // 12:00–14:00: Almoço
  } else if (hour >= 14 && hour < 18) {
    targetCount = 14 // 14:00–18:00: Tarde
  } else if (hour >= 18 && hour < 20) {
    targetCount = 20 // 18:00–20:00: Fim de tarde
  } else if (hour >= 20 && hour < 23) {
    targetCount = 26 // 20:00–23:00: Horário nobre
  } else {
    targetCount = 12 // 23:00–00:00: Noite
  }

  // Filtrar e selecionar NPCs com base no offset temporal do bucket
  const offset = (hour * 12 + fiveMinBucket) % NPC_CATALOG.length

  const selectedNpcs: NpcProfile[] = []
  for (let i = 0; i < targetCount; i++) {
    const index = (offset + i * 3) % NPC_CATALOG.length
    selectedNpcs.push(NPC_CATALOG[index])
  }

  const nowMs = date.getTime()

  const activeNpcs: ActiveNpcPresence[] = selectedNpcs.map((npc, idx) => {
    // Determinar atividade determinística
    const actIndex = (offset + idx) % POSSIBLE_ACTIVITIES.length
    const activity = POSSIBLE_ACTIVITIES[actIndex]
    const activityLabel = ACTIVITY_LABELS[activity] || 'A explorar'

    return {
      id: `presence_${npc.npcId}`,
      npcId: npc.npcId,
      playerType: 'npc',
      isNpc: true,
      name: npc.displayName,
      displayName: npc.displayName,
      username: npc.displayName,
      district: npc.district,
      level: npc.level,
      xp: npc.xp,
      elo: npc.rating,
      rating: npc.rating,
      activity,
      activityLabel,
      avatar: npc.avatar,
      photoURL: npc.avatar,
      lastSeen: nowMs - (idx * 2500),
      isCurrentUser: false,
      title: npc.title,
      equippedFrame: npc.equippedFrame,
      virtualMoney: npc.virtualMoney,
    }
  })

  return {
    activeNpcs,
    npcCount: activeNpcs.length,
    targetCount,
  }
}

// Alias para compatibilidade
export const getActiveNpcs = getActiveNPCs
