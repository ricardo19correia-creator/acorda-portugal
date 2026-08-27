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
 */
export function getActiveNpcs(date = new Date()): {
  activeNpcs: ActiveNpcPresence[]
  npcCount: number
  targetCount: number
} {
  // Obter hora e minuto em Europe/Lisbon
  const formatter = new Intl.DateTimeFormat('pt-PT', {
    timeZone: 'Europe/Lisbon',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '12', 10)
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10)

  // Bloco de 5 minutos para rotação determinística e suave
  const fiveMinBucket = Math.floor(minute / 5)

  // Alvo de NPCs ativos por faixa horária
  let targetCount = 12
  if (hour >= 0 && hour < 6) {
    targetCount = 5 // Madrugada
  } else if (hour >= 6 && hour < 9) {
    targetCount = 8 // Início da manhã
  } else if (hour >= 9 && hour < 12) {
    targetCount = 12 // Manhã
  } else if (hour >= 12 && hour < 14) {
    targetCount = 18 // Almoço
  } else if (hour >= 14 && hour < 18) {
    targetCount = 14 // Tarde
  } else if (hour >= 18 && hour < 20) {
    targetCount = 20 // Fim de tarde
  } else if (hour >= 20 && hour < 23) {
    targetCount = 26 // Horário nobre
  } else {
    targetCount = 12 // Noite
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
      username: npc.displayName,
      district: npc.district,
      level: npc.level,
      xp: npc.xp,
      activity,
      activityLabel,
      photoURL: npc.avatar,
      lastSeen: nowMs - (idx * 2500),
      isCurrentUser: false,
    }
  })

  return {
    activeNpcs,
    npcCount: activeNpcs.length,
    targetCount,
  }
}
