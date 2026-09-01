import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type RealUserActivity = 'playing' | 'duel' | 'browsing'

export interface RealPlayerPresence {
  userId: string
  displayName: string
  photoURL?: string | null
  district: string
  activity: RealUserActivity
  lastSeen: number
  online: boolean
  level?: number
  title?: string
}

export interface RealCommunityState {
  humanOnline: number
  playingCount: number
  duelCount: number
  players: RealPlayerPresence[]
}

export const HEARTBEAT_INTERVAL_MS = 35_000 // 35 segundos
export const OFFLINE_TTL_MS = 75_000 // 75 segundos de tolerância para desconexões

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
  profile?: { displayName?: string; photoURL?: string; district?: string; level?: number; equippedTitle?: string } | null,
  activity: RealUserActivity = 'browsing'
): Promise<void> {
  if (!user?.uid) return // Apenas humanos autenticados reais

  try {
    const presenceRef = doc(db, 'publicPresence', user.uid)
    const displayName = sanitizePublicDisplayName(profile?.displayName || user.displayName, profile?.district)
    const district = (profile?.district || '').trim() || 'Portugal'
    const photoURL = profile?.photoURL || user.photoURL || null
    const level = typeof profile?.level === 'number' && profile.level > 0 ? profile.level : 1
    const title = profile?.equippedTitle || 'Patriota'

    const payload: RealPlayerPresence = {
      userId: user.uid,
      displayName,
      photoURL,
      district,
      activity,
      lastSeen: Date.now(),
      online: true,
      level,
      title,
    }

    await setDoc(presenceRef, {
      ...payload,
      updatedAt: serverTimestamp(),
    }, { merge: true })
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
    const isOnline = d.online !== false
    const lastSeen = typeof d.lastSeen === 'number' ? d.lastSeen : 0
    const isWithinTTL = now - lastSeen <= OFFLINE_TTL_MS

    if (isOnline && isWithinTTL) {
      const act: RealUserActivity = d.activity === 'playing' || d.activity === 'duel' ? d.activity : 'browsing'
      
      const player: RealPlayerPresence = {
        userId: String(d.userId),
        displayName: sanitizePublicDisplayName(d.displayName, d.district),
        photoURL: d.photoURL || null,
        district: (d.district || '').trim() || 'Portugal',
        activity: act,
        lastSeen,
        online: true,
        level: typeof d.level === 'number' ? d.level : 1,
        title: d.title || 'Patriota',
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