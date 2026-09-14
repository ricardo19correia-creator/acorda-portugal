import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type RealUserActivity = 'playing' | 'duel' | 'browsing'

export interface RealPlayerPresence {
  userId: string
  displayName: string
  photoURL?: string | null
  avatar?: string | null
  district: string
  city?: string
  activity: RealUserActivity
  lastSeen: number
  expiresAt?: number
  online: boolean
  isOnline?: boolean
  level?: number
  xp?: number
  title?: string
  equippedFrame?: string
}

export interface RealCommunityState {
  humanOnline: number
  playingCount: number
  duelCount: number
  players: RealPlayerPresence[]
}

export const HEARTBEAT_INTERVAL_MS = 35_000 // 35 segundos
export const OFFLINE_TTL_MS = 90_000 // 90 segundos de tolerância para desconexões e throttling em background

/**
 * Sanitiza o nome público de exibição (nunca expõe emails ou dados sensíveis)
 */
export function sanitizePublicDisplayName(name?: string | null, district?: string): string {
  if (!name || name.trim() === '') {
    return district ? `Cidadão (${district})` : 'Jogador Nacional'
  }
  const clean = name.trim()
  if (clean.includes('@')) {
    const userPart = clean.split('@')[0]
    return userPart.length > 0 ? userPart.slice(0, 20) : 'Jogador'
  }
  return clean.slice(0, 24)
}

/**
 * Envia um heartbeat de presença para um utilizador autenticado real.
 * NUNCA é acionado para bots, NPCs ou visitantes anónimos.
 */
export async function sendRealHeartbeat(
  user: { uid: string; displayName?: string | null; photoURL?: string | null } | null,
  profile?: { displayName?: string; photoURL?: string; district?: string; city?: string; level?: number; xp?: number; equippedTitle?: string } | null,
  activity: RealUserActivity = 'browsing',
  _coords?: unknown,
  _accuracy?: unknown,
  _source?: unknown
): Promise<void> {
  if (!user?.uid) return // Apenas humanos autenticados reais

  try {
    const presenceRef = doc(db, 'publicPresence', user.uid)
    const displayName = sanitizePublicDisplayName(profile?.displayName || user.displayName, profile?.district)
    const district = (profile?.district || '').trim() || 'Portugal'
    const city = (profile?.city || (profile as any)?.concelho || '').trim() || undefined
    const photoURL = profile?.photoURL || user.photoURL || null
    const level = typeof profile?.level === 'number' && profile.level > 0 ? profile.level : 1
    const xp = typeof profile?.xp === 'number' && profile.xp >= 0 ? profile.xp : undefined
    const title = profile?.equippedTitle || 'Patriota'
    const equippedFrame =
      (profile as any)?.equippedFrame ||
      (profile as any)?.equipped?.frameId ||
      (typeof window !== 'undefined' ? localStorage.getItem('user_equipped_frame') : null) ||
      undefined

    const now = Date.now()
    const expiresAt = now + OFFLINE_TTL_MS

    const payload = {
      userId: user.uid,
      displayName,
      photoURL,
      avatar: photoURL,
      district,
      ...(city ? { city } : {}),
      activity,
      lastSeen: now,
      expiresAt,
      online: true,
      isOnline: true,
      level,
      ...(typeof xp === 'number' ? { xp } : {}),
      title,
      ...(equippedFrame ? { equippedFrame } : {}),
      updatedAt: serverTimestamp(),
    }

    await setDoc(presenceRef, payload, { merge: true })
  } catch (err) {
    // Falha silenciosa de rede para não interromper a experiência do utilizador
    console.debug('[PRESENCE] Erro no envio de heartbeat:', err)
  }
}

/**
 * Marca o utilizador explicitamente como offline no Firestore
 */
export async function markRealOffline(userId: string | null | undefined): Promise<void> {
  if (!userId) return

  try {
    const presenceRef = doc(db, 'publicPresence', userId)
    await setDoc(
      presenceRef,
      {
        online: false,
        lastSeen: Date.now(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (err) {
    console.debug('[PRESENCE] Erro ao marcar offline:', err)
  }
}

/**
 * Filtra e consolida estritamente utilizadores humanos reais ativos dentro do TTL
 */
export function filterActiveRealPlayers(
  rawDocs: any[],
  currentUid?: string,
  now: number = Date.now()
): RealCommunityState {
  const activeMap = new Map<string, RealPlayerPresence>()
  let playingCount = 0
  let duelCount = 0

  rawDocs.forEach((d) => {
    if (!d || !d.userId) return
    const isOnline = d.online !== false && d.isOnline !== false
    const lastSeen = typeof d.lastSeen === 'number' ? d.lastSeen : 0
    const expiresAt = typeof d.expiresAt === 'number' ? d.expiresAt : (lastSeen + OFFLINE_TTL_MS)
    const isWithinTTL = expiresAt > now && (now - lastSeen <= OFFLINE_TTL_MS * 1.5)

    if (isOnline && isWithinTTL) {
      const act: RealUserActivity = d.activity === 'playing' || d.activity === 'duel' ? d.activity : 'browsing'
      const avatar = d.avatar || d.photoURL || null
      const resolvedConcelho = d.city || d.concelho ? String(d.city || d.concelho).trim() : undefined

      const player: RealPlayerPresence = {
        userId: String(d.userId),
        displayName: sanitizePublicDisplayName(d.displayName, d.district),
        photoURL: avatar,
        avatar,
        district: (d.district || '').trim() || 'Portugal',
        ...(resolvedConcelho ? { city: resolvedConcelho } : {}),
        activity: act,
        lastSeen,
        expiresAt,
        online: true,
        isOnline: true,
        level: typeof d.level === 'number' ? d.level : 1,
        ...(typeof d.xp === 'number' ? { xp: d.xp } : {}),
        title: d.title || 'Patriota',
        equippedFrame: d.equippedFrame || undefined,
      }

      activeMap.set(player.userId, player)
    }
  })

  const players = Array.from(activeMap.values())

  // Ordenar: primeiro utilizador atual, depois os com atividade mais recente
  players.sort((a, b) => {
    if (currentUid && a.userId === currentUid) return -1
    if (currentUid && b.userId === currentUid) return 1
    return b.lastSeen - a.lastSeen
  })

  players.forEach((p) => {
    if (p.activity === 'playing') playingCount++
    if (p.activity === 'duel') duelCount++
  })

  return {
    humanOnline: players.length,
    playingCount,
    duelCount,
    players,
  }
}