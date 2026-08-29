export type PlayerType = 'human' | 'npc'

export type NpcDifficulty = 'facil' | 'medio' | 'dificil' | 'mestre'
export type NpcPersonality = 'casual' | 'competitivo' | 'especialista' | 'estrategico'

export interface NpcProfile {
  id: string
  npcId: string
  playerType: 'npc'
  isNpc: true
  name: string
  displayName: string
  username: string
  avatar: string
  district: string
  level: number
  xp: number
  elo: number
  rating: number
  wins: number
  losses: number
  difficulty: NpcDifficulty
  personality: NpcPersonality
  accuracyRange: [number, number] // [min, max]
  avgResponseTimeSeconds: number
  preferredHours?: number[] // Horas preferenciais (0-23)
  title?: string
  equippedTitle?: string
  equippedFrame?: string
  virtualMoney?: number
  stats?: {
    duelsWon: number
    duelsTotal: number
    accuracyRate: number
  }
}

export interface ActiveNpcPresence {
  id: string
  npcId: string
  playerType: 'npc'
  isNpc: true
  name: string
  displayName: string
  username: string
  district: string
  level: number
  xp: number
  elo: number
  rating: number
  activity: 'playing' | 'duel' | 'ranking' | 'profile' | 'browsing'
  activityLabel: string
  avatar: string
  photoURL: string
  lastSeen: number
  isCurrentUser: false
  title?: string
  equippedFrame?: string
  virtualMoney?: number
}
