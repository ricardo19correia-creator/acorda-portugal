import { getNpcById, OFFICIAL_20_DISTRICTS } from '@/lib/npc-system/npc-catalog'
import { getActiveNPCs } from '@/lib/npc-system/npc-schedule-engine'

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
  const isNpc = raw?.playerType === 'npc' || raw?.isNpc === true || String(raw?.id || raw?.uid || raw?.userId || raw?.npcId || '').includes('npc')
  const playerType: PlayerType = isNpc ? 'npc' : 'human'
  const rawId = String(raw?.id || raw?.uid || raw?.userId || raw?.npcId || 'anonymous')
  const npcLookupKey = raw?.npcId || (rawId.startsWith('presence_') ? rawId.replace('presence_', '') : rawId)
  const npcMeta = isNpc ? getNpcById(npcLookupKey) : null

  const id = rawId
  const name = sanitizeDisplayName(raw?.name || raw?.displayName || raw?.username || npcMeta?.displayName, !raw?.uid && !raw?.id, raw?.district || npcMeta?.district)
  const avatar = raw?.avatar || raw?.photoURL || raw?.avatarUrl || npcMeta?.avatar || '/images/avatars/camoes-2050.jpg'
  const xp = typeof raw?.xp === 'number' && !isNaN(raw.xp) && raw.xp > 0 ? raw.xp : (npcMeta?.xp || (isNpc ? 25000 : 0))
  const level = typeof raw?.level === 'number' && raw.level > 0 ? raw.level : (npcMeta?.level || 1)
  const district = raw?.district && String(raw.district).trim() ? String(raw.district).trim() : (npcMeta?.district || 'Lisboa')
  const activity: UserActivityState = (raw?.activity as UserActivityState) || 'browsing'
  const activityLabel = raw?.activityLabel || ACTIVITY_LABELS[activity]?.label || 'A explorar'
  const elo = typeof raw?.elo === 'number' ? raw.elo : typeof raw?.rating === 'number' ? raw.rating : (npcMeta?.rating || 1000)
  const virtualMoney = typeof raw?.virtualMoney === 'number' ? raw.virtualMoney : npcMeta?.virtualMoney
  const title = raw?.title || npcMeta?.title

  return {
    id,
    playerType,
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
 * Função canónica pura que deriva o Estado Único da Comunidade
 * Invariantes rigorosas:
 * 1. totalVisibleOnline = humanOnline + npcOnline
 * 2. SUM(byDistrict.total) === totalVisibleOnline
 * 3. SUM(byDistrict.humans) === humanOnline
 * 4. SUM(byDistrict.npcs) === npcOnline
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

  // 2. Obter NPCs ativos determinísticos para a hora atual em Europe/Lisbon
  const { activeNpcs, npcCount } = getActiveNPCs(date)
  let npcPlaying = 0
  let npcDuel = 0

  const npcOnlineList: PublicActiveUser[] = activeNpcs.map((npc) => {
    if (npc.activity === 'playing') npcPlaying++
    if (npc.activity === 'duel') npcDuel++

    return {
      id: npc.id,
      username: npc.displayName,
      district: npc.district,
      level: npc.level,
      xp: npc.xp,
      activity: npc.activity,
      activityLabel: npc.activityLabel,
      photoURL: npc.photoURL,
      lastSeen: npc.lastSeen,
      isCurrentUser: false,
      playerType: 'npc',
      isNpc: true,
      elo: npc.elo,
      virtualMoney: npc.virtualMoney,
      title: npc.title,
    }
  })

  // 3. Totais canónicos
  const humanOnline = humanOnlineList.length
  const npcOnline = npcCount
  const totalVisibleOnline = humanOnline + npcOnline

  const playingCount = humanPlaying + npcPlaying
  const duelCount = humanDuel + npcDuel
  const activeMatches = playingCount + duelCount

  // 4. Lista combinada de utilizadores ativos e participantes normalizados
  const combinedUsers: PublicActiveUser[] = [...humanOnlineList, ...npcOnlineList]
  combinedUsers.sort((a, b) => {
    if (a.isCurrentUser) return -1
    if (b.isCurrentUser) return 1
    return b.lastSeen - a.lastSeen
  })

  const participants: Participant[] = combinedUsers.map((u) => normalizeParticipant(u, currentSessionOrUid))

  // 5. Distribuição distrital rigorosa
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
    if (p.playerType === 'human') {
      byDistrict[matched].humans += 1
    } else {
      byDistrict[matched].npcs += 1
    }
  })

  const byDistrictList = Object.values(byDistrict).sort(
    (a, b) => b.total - a.total || a.name.localeCompare(b.name, 'pt-PT')
  )

  return {
    humanOnline,
    npcOnline,
    totalVisibleOnline,
    participants,
    byDistrict,
    byDistrictList,
    activeMatches,
    humanVsHumanMatches: Math.floor(humanDuel / 2),
    humanVsNpcMatches: Math.max(0, duelCount - Math.floor(humanDuel / 2) * 2),
    playingCount,
    duelCount,
    activeUsers: combinedUsers,
  }
}
