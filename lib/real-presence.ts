import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PORTUGAL_CONCELHOS_COORDS } from '@/src/data/concelhos-coords'

export type RealUserActivity = 'playing' | 'duel' | 'browsing'

function normalizeKey(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ')
    .trim()
}

export interface RealPlayerPresence {
  userId: string
  displayName: string
  photoURL?: string | null
  district: string
  city?: string
  coords?: [number, number] // [lng, lat]
  activity: RealUserActivity
  lastSeen: number
  online: boolean
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
  coords?: [number, number]
): Promise<void> {
  if (!user?.uid) return // Apenas humanos autenticados reais

  try {
    const presenceRef = doc(db, 'publicPresence', user.uid)
    const displayName = sanitizePublicDisplayName(profile?.displayName || user.displayName, profile?.district)
    const district = (profile?.district || '').trim() || 'Portugal'
    const city = (profile?.city || '').trim() || undefined
    const photoURL = profile?.photoURL || user.photoURL || null
    const level = typeof profile?.level === 'number' && profile.level > 0 ? profile.level : 1
    const xp = typeof profile?.xp === 'number' && profile.xp >= 0 ? profile.xp : undefined
    const title = profile?.equippedTitle || 'Patriota'
    const equippedFrame =
      (profile as any)?.equippedFrame ||
      (profile as any)?.equipped?.frameId ||
      (typeof window !== 'undefined' ? localStorage.getItem('user_equipped_frame') : null) ||
      undefined

    // 1. Se coordenadas explícitas foram passadas (ex: GPS ativo no momento)
    let userCoords: [number, number] | undefined = coords

    // 2. Verificar cache local de GPS recente no localStorage ou sessionStorage
    if (!userCoords && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ap_user_geo_coords') || sessionStorage.getItem('ap_user_geo_coords')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length === 2 && typeof parsed[0] === 'number' && typeof parsed[1] === 'number') {
            userCoords = [parsed[0], parsed[1]]
          }
        }
      } catch {}
    }

    // 3. Resolução automática das coordenadas do concelho/cidade do perfil
    if (!userCoords && city) {
      const concelhoMatch = PORTUGAL_CONCELHOS_COORDS[normalizeKey(city)]
      if (concelhoMatch?.coordinates) {
        userCoords = concelhoMatch.coordinates
      }
    }

    // 4. Fallback para concelho capital de distrito
    if (!userCoords && district && district !== 'Portugal') {
      const distMatch = PORTUGAL_CONCELHOS_COORDS[normalizeKey(district)]
      if (distMatch?.coordinates) {
        userCoords = distMatch.coordinates
      }
    }

    const payload: RealPlayerPresence = {
      userId: user.uid,
      displayName,
      photoURL,
      district,
      ...(city ? { city } : {}),
      ...(userCoords ? { coords: userCoords } : {}),
      activity,
      lastSeen: Date.now(),
      online: true,
      level,
      ...(typeof xp === 'number' ? { xp } : {}),
      title,
      ...(equippedFrame ? { equippedFrame } : {}),
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
      
      let validCoords: [number, number] | undefined = undefined
      if (Array.isArray(d.coords) && d.coords.length === 2 && typeof d.coords[0] === 'number' && typeof d.coords[1] === 'number') {
        validCoords = [d.coords[0], d.coords[1]]
      } else if (d.coordinates && typeof d.coordinates.lat === 'number' && typeof d.coordinates.lng === 'number') {
        validCoords = [d.coordinates.lng, d.coordinates.lat]
      } else if (d.city) {
        const concelhoMatch = PORTUGAL_CONCELHOS_COORDS[normalizeKey(d.city)]
        if (concelhoMatch?.coordinates) {
          validCoords = concelhoMatch.coordinates
        }
      } else if (d.district && d.district !== 'Portugal') {
        const distMatch = PORTUGAL_CONCELHOS_COORDS[normalizeKey(d.district)]
        if (distMatch?.coordinates) {
          validCoords = distMatch.coordinates
        }
      }

      const player: RealPlayerPresence = {
        userId: String(d.userId),
        displayName: sanitizePublicDisplayName(d.displayName, d.district),
        photoURL: d.photoURL || null,
        district: (d.district || '').trim() || 'Portugal',
        ...(d.city ? { city: String(d.city).trim() } : {}),
        ...(validCoords ? { coords: validCoords } : {}),
        activity: act,
        lastSeen,
        online: true,
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