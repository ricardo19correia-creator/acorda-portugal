export type PlayerType = 'human' | 'npc'

export type NpcDifficulty = 'facil' | 'medio' | 'dificil' | 'mestre'
export type NpcPersonality = 'casual' | 'competitivo' | 'especialista' | 'estrategico'

export interface NpcProfile {
  npcId: string
  playerType: 'npc'
  isNpc: true
  displayName: string
  username: string
  avatar: string
  district: string
  level: number
  xp: number
  rating: number
  wins: number
  losses: number
  difficulty: NpcDifficulty
  personality: NpcPersonality
  accuracyRange: [number, number] // [min, max]
  avgResponseTimeSeconds: number
  preferredHours?: number[] // Horas preferenciais (0-23)
}

export interface ActiveNpcPresence {
  id: string
  npcId: string
  playerType: 'npc'
  isNpc: true
  username: string
  district: string
  level: number
  xp: number
  activity: 'playing' | 'duel' | 'ranking' | 'profile' | 'browsing'
  activityLabel: string
  photoURL: string
  lastSeen: number
  isCurrentUser: false
}
