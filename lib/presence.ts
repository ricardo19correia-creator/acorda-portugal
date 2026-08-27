export type PlayerType = 'human' | 'npc'
export type UserActivityState = 'browsing' | 'playing' | 'duel' | 'ranking' | 'profile'

export type PresenceData = {
  userId: string
  online: boolean
  lastSeen: number
  activity: UserActivityState
  gameId?: string | null
  district?: string
  level?: number
  xp?: number
  username: string
  photoURL?: string | null
  isAnonymous?: boolean
  playerType?: PlayerType
  isNpc?: boolean
  updatedAt?: unknown
}

export type PublicActiveUser = {
  id: string
  username: string
  district: string
  level: number
  xp: number
  activity: UserActivityState
  activityLabel: string
  photoURL?: string | null
  lastSeen: number
  isCurrentUser: boolean
  playerType: PlayerType
  isNpc?: boolean
}

export interface DistrictPresenceSummary {
  name: string
  total: number
  humans: number
  npcs: number
}

export interface CanonicalPresenceState {
  onlineCount: number
  humanOnlineCount: number
  npcOnlineCount: number
  playingCount: number
  duelCount: number
  activeMatches: number
  humanVsHumanMatches: number
  humanVsNpcMatches: number
  districtDistribution: Record<string, DistrictPresenceSummary>
  byDistrictList: DistrictPresenceSummary[]
  activeUsers: PublicActiveUser[]
  currentActivity: UserActivityState
  setActivity: (activity: UserActivityState, gameId?: string | null) => void
  loading: boolean
  error: string | null
}

export const HEARTBEAT_INTERVAL_MS = 20_000
export const OFFLINE_THRESHOLD_MS = 45_000

export const ACTIVITY_LABELS: Record<UserActivityState, { label: string; icon: string; tone: 'primary' | 'red' | 'gold' | 'accent' | 'muted' }> = {
  playing: { label: 'A jogar quiz', icon: '🎮', tone: 'primary' },
  duel: { label: 'Em duelo', icon: '⚔️', tone: 'red' },
  ranking: { label: 'A ver ranking', icon: '🏆', tone: 'gold' },
  profile: { label: 'No perfil', icon: '👤', tone: 'accent' },
  browsing: { label: 'A explorar', icon: '🇵🇹', tone: 'muted' },
}

const GUEST_KEY = 'acorda_portugal_guest_session_id'

export function getOrCreateGuestSessionId(): string {
  if (typeof window === 'undefined') return 'guest_server'
  try {
    let id = localStorage.getItem(GUEST_KEY)
    if (!id) {
      const randomPart = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().slice(0, 10)
        : Math.random().toString(36).substring(2, 12)
      id = `guest_${randomPart}`
      localStorage.setItem(GUEST_KEY, id)
    }
    return id
  } catch {
    return `guest_${Math.random().toString(36).substring(2, 10)}`
  }
}

export function sanitizeDisplayName(name?: string | null, isGuest = false, district?: string): string {
  if (!name || name.trim() === '') {
    return isGuest ? (district ? `Visitante (${district})` : 'Visitante Anónimo') : 'Jogador'
  }
  const clean = name.trim()
  if (clean.includes('@')) {
    const usernamePart = clean.split('@')[0]
    return usernamePart.length > 0 ? usernamePart : 'Jogador'
  }
  return clean.slice(0, 24)
}
