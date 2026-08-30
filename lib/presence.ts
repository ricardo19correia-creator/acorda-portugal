export const OFFICIAL_20_DISTRICTS = [
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Vila Real',
  'Viseu',
  'Açores',
  'Madeira',
]

export type PlayerType = 'human'
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
  isNpc?: false
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
  isNpc?: false
  elo?: number
  virtualMoney?: number
  title?: string
}

export interface Participant {
  id: string
  playerType: PlayerType
  name: string
  avatar: string
  xp: number
  level: number
  district: string
  activity: UserActivityState
  activityLabel: string
  elo?: number
  isCurrentUser?: boolean
  lastSeen?: number
  virtualMoney?: number
  title?: string
}

export interface DistrictPresenceSummary {
  name: string
  total: number
  humans: number
  npcs: number
}

export interface CommunityState {
  humanOnline: number
  npcOnline: number
  totalVisibleOnline: number
  participants: Participant[]
  byDistrict: Record<string, DistrictPresenceSummary>
  byDistrictList: DistrictPresenceSummary[]
  activeMatches: number
  humanVsHumanMatches: number
  humanVsNpcMatches: number
  playingCount: number
  duelCount: number
  activeUsers: PublicActiveUser[]
}

export interface CanonicalPresenceState extends CommunityState {
  onlineCount: number
  humanOnlineCount: number
  npcOnlineCount: number
  districtDistribution: Record<string, DistrictPresenceSummary>
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

export function normalizeParticipant(raw: any, currentSessionOrUid?: string): Participant {
  const rawId = String(raw?.id || raw?.uid || raw?.userId || 'anonymous')
  const id = rawId
  const name = sanitizeDisplayName(raw?.name || raw?.displayName || raw?.username, !raw?.uid && !raw?.id, raw?.district)
  const avatar = raw?.avatar || raw?.photoURL || raw?.avatarUrl || '/images/avatars/camoes-2050.jpg'
  const xp = typeof raw?.xp === 'number' && !isNaN(raw.xp) && raw.xp > 0 ? raw.xp : 0
  const level = typeof raw?.level === 'number' && raw.level > 0 ? raw.level : 1
  const district = raw?.district && String(raw.district).trim() ? String(raw.district).trim() : 'Lisboa'
  const activity: UserActivityState = (raw?.activity as UserActivityState) || 'browsing'
  const activityLabel = raw?.activityLabel || ACTIVITY_LABELS[activity]?.label || 'A explorar'
  const elo = typeof raw?.elo === 'number' ? raw.elo : typeof raw?.rating === 'number' ? raw.rating : 1000
  const virtualMoney = typeof raw?.virtualMoney === 'number' ? raw.virtualMoney : 100
  const title = raw?.title || 'Jogador Nacional'

  return {
    id,
    playerType: 'human',
    name,
    avatar,
    xp,
    level,
    district,
    activity,
    activityLabel,
    elo,
    virtualMoney,
    title,
    isCurrentUser: Boolean(currentSessionOrUid && (id === currentSessionOrUid || raw?.userId === currentSessionOrUid)),
    lastSeen: typeof raw?.lastSeen === 'number' ? raw.lastSeen : Date.now(),
  }
}

/**
 * Função canónica pura que deriva o Estado Único da Comunidade (100% Jogadores Humanos Reais)
 */
export function getCommunityState(
  rawHumanDocs: PresenceData[] = [],
  date: Date = new Date(),
  currentSessionOrUid?: string
): CommunityState {
  const nowMs = date.getTime()

  // 1. Filtrar humanos ativos nos últimos OFFLINE_THRESHOLD_MS
  const activeHumansMap = new Map<string, PresenceData>()
  rawHumanDocs.forEach((doc) => {
    if (!doc || !doc.userId) return
    const isOnline = doc.online !== false
    const isRecent = typeof doc.lastSeen === 'number' && nowMs - doc.lastSeen <= OFFLINE_THRESHOLD_MS
    if (isOnline && isRecent) {
      activeHumansMap.set(doc.userId, doc)
    }
  })

  const humanOnlineList: PublicActiveUser[] = []
  let humanPlaying = 0
  let humanDuel = 0

  activeHumansMap.forEach((doc) => {
    const isGuest = doc.isAnonymous || doc.userId.startsWith('guest_')
    const displayName = sanitizeDisplayName(doc.username, isGuest, doc.district)
    const act: UserActivityState = doc.activity || 'browsing'
    const meta = ACTIVITY_LABELS[act] || ACTIVITY_LABELS.browsing
    const userXp = typeof doc.xp === 'number' && !isNaN(doc.xp) ? doc.xp : 0
    const userLevel = typeof doc.level === 'number' && doc.level > 0 ? doc.level : 1
    const rawDist = (doc.district || '').trim()
    const matchedDist = OFFICIAL_20_DISTRICTS.find((d) => d.toLowerCase() === rawDist.toLowerCase()) || 'Lisboa'

    if (act === 'playing') humanPlaying++
    if (act === 'duel') humanDuel++

    humanOnlineList.push({
      id: doc.userId,
      username: displayName,
      district: matchedDist,
      level: userLevel,
      xp: userXp,
      activity: act,
      activityLabel: meta.label,
      photoURL: doc.photoURL,
      lastSeen: doc.lastSeen,
      isCurrentUser: Boolean(currentSessionOrUid && doc.userId === currentSessionOrUid),
      playerType: 'human',
      isNpc: false,
    })
  })

  // 2. Totais canónicos 100% humanos
  const humanOnline = humanOnlineList.length
  const npcOnline = 0
  const totalVisibleOnline = humanOnline

  const playingCount = humanPlaying
  const duelCount = humanDuel
  const activeMatches = playingCount + duelCount

  // 3. Lista de utilizadores ativos e participantes normalizados
  const combinedUsers: PublicActiveUser[] = [...humanOnlineList]
  combinedUsers.sort((a, b) => {
    if (a.isCurrentUser) return -1
    if (b.isCurrentUser) return 1
    return b.lastSeen - a.lastSeen
  })

  const participants: Participant[] = combinedUsers.map((u) => normalizeParticipant(u, currentSessionOrUid))

  // 4. Distribuição distrital rigorosa
  const byDistrict: Record<string, DistrictPresenceSummary> = {}
  for (const d of OFFICIAL_20_DISTRICTS) {
    byDistrict[d] = {
      name: d,
      total: 0,
      humans: 0,
      npcs: 0,
    }
  }

  participants.forEach((p) => {
    const rawDist = (p.district || '').trim()
    const matched = OFFICIAL_20_DISTRICTS.find((d) => d.toLowerCase() === rawDist.toLowerCase()) || 'Lisboa'

    byDistrict[matched].total += 1
    byDistrict[matched].humans += 1
  })

  const byDistrictList = Object.values(byDistrict).sort(
    (a, b) => b.total - a.total || a.name.localeCompare(b.name, 'pt-PT')
  )

  return {
    humanOnline,
    npcOnline: 0,
    totalVisibleOnline,
    participants,
    byDistrict,
    byDistrictList,
    activeMatches,
    humanVsHumanMatches: Math.floor(humanDuel / 2),
    humanVsNpcMatches: 0,
    playingCount,
    duelCount,
    activeUsers: combinedUsers,
  }
}
