import { doc, setDoc, serverTimestamp, collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { DEFAULT_AVATAR } from '@/lib/avatars'

export type RealUserActivity = 'playing' | 'duel' | 'browsing'

export interface RealPlayerPresence {
  userId: string
  sessionId?: string
  currentSessionId?: string
  currentDeviceId?: string
  currentPage?: string
  currentGameId?: string | null
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
  updatedAt?: any
}

export interface RealCommunityState {
  humanOnline: number
  playingCount: number
  duelCount: number
  players: RealPlayerPresence[]
  loading?: boolean
}

export const HEARTBEAT_INTERVAL_MS = 25_000 // 25 segundos entre heartbeats normais
export const OFFLINE_TTL_MS = 75_000 // 75 segundos (3 heartbeats falhados) para marcar offline

export interface HeartbeatMeta {
  activity?: RealUserActivity
  currentPage?: string
  currentGameId?: string | null
  deviceId?: string
  sessionId?: string
}

/**
 * Anonimiza o identificador de utilizador para logs seguros de desenvolvimento
 */
export function anonymizeUserId(userId?: string | null): string {
  if (!userId) return 'anon'
  if (userId.length <= 8) return userId
  return `${userId.slice(0, 4)}...${userId.slice(-4)}`
}

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
 * Obtém ou cria um ID exclusivo para a aba / sessão de browser atual
 */
export function getPresenceTabId(): string {
  if (typeof window === 'undefined') return 'server'
  try {
    let tabId = sessionStorage.getItem('ap_presence_tab_id')
    if (!tabId) {
      tabId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `tab_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      sessionStorage.setItem('ap_presence_tab_id', tabId)
    }
    return tabId
  } catch {
    return 'fallback_tab'
  }
}

/**
 * Obtém ou cria um identificador persistente de dispositivo
 */
export function getPresenceDeviceId(): string {
  if (typeof window === 'undefined') return 'server_device'
  try {
    let deviceId = localStorage.getItem('ap_device_id')
    if (!deviceId || deviceId.trim() === '') {
      deviceId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? `dev_${crypto.randomUUID()}`
        : `dev_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      localStorage.setItem('ap_device_id', deviceId)
    }
    return deviceId
  } catch {
    return 'fallback_device'
  }
}

/**
 * Regista esta aba no armazenamento partilhado do browser para a conta do utilizador
 */
export function registerActiveTab(userId: string): void {
  if (typeof window === 'undefined' || !userId) return
  try {
    const tabId = getPresenceTabId()
    const storageKey = `ap_active_tabs_${userId}`
    const raw = localStorage.getItem(storageKey)
    const tabs: Record<string, number> = raw ? JSON.parse(raw) : {}
    tabs[tabId] = Date.now()
    localStorage.setItem(storageKey, JSON.stringify(tabs))
  } catch (e) {
    console.debug('[PRESENCE] Aviso ao registar aba:', e)
  }
}

/**
 * Remove esta aba e verifica se ainda existem outras abas ativas do mesmo utilizador
 */
export function unregisterActiveTab(userId: string): { hasRemainingTabs: boolean } {
  if (typeof window === 'undefined' || !userId) return { hasRemainingTabs: false }
  try {
    const tabId = getPresenceTabId()
    const storageKey = `ap_active_tabs_${userId}`
    const raw = localStorage.getItem(storageKey)
    if (!raw) return { hasRemainingTabs: false }

    const tabs: Record<string, number> = JSON.parse(raw)
    delete tabs[tabId]

    const now = Date.now()
    // Limpar abas mortas há mais de 45 segundos
    const aliveTabs = Object.entries(tabs).filter(([_, lastPing]) => now - lastPing < 45_000)

    if (aliveTabs.length > 0) {
      const remaining: Record<string, number> = Object.fromEntries(aliveTabs)
      localStorage.setItem(storageKey, JSON.stringify(remaining))
      return { hasRemainingTabs: true }
    } else {
      localStorage.removeItem(storageKey)
      return { hasRemainingTabs: false }
    }
  } catch {
    return { hasRemainingTabs: false }
  }
}

/**
 * Envia um heartbeat de presença para um utilizador autenticado real.
 * NUNCA é acionado para bots, NPCs ou visitantes anónimos.
 */
export async function sendRealHeartbeat(
  user: { uid: string; displayName?: string | null; photoURL?: string | null } | null,
  profile?: { displayName?: string; photoURL?: string; district?: string; city?: string; level?: number; xp?: number; equippedTitle?: string } | null,
  activityOrMeta: RealUserActivity | HeartbeatMeta = 'browsing',
  _coords?: unknown,
  _accuracy?: unknown,
  _source?: unknown
): Promise<void> {
  if (!user?.uid) return // Apenas humanos autenticados reais

  // Bloqueio rigoroso: contas marcadas como eliminadas NUNCA enviam heartbeat
  if (typeof window !== 'undefined' && (
    localStorage.getItem('account_deleted') === 'true' ||
    sessionStorage.getItem('account_deleted') === 'true' ||
    localStorage.getItem(`account_deleted_${user.uid}`) === 'true'
  )) {
    return
  }

  try {
    registerActiveTab(user.uid)
    const presenceRef = doc(db, 'publicPresence', user.uid)

    const meta: HeartbeatMeta = typeof activityOrMeta === 'string' ? { activity: activityOrMeta } : activityOrMeta
    const activity: RealUserActivity = meta.activity || 'browsing'
    const currentPage: string = meta.currentPage || (typeof window !== 'undefined' ? window.location.pathname : '/')
    const currentGameId: string | null = meta.currentGameId ?? null
    const deviceId: string = meta.deviceId || getPresenceDeviceId()
    const tabId: string = meta.sessionId || getPresenceTabId()

    const displayName = sanitizePublicDisplayName(profile?.displayName || user.displayName, profile?.district)
    const district = (profile?.district || '').trim() || 'Portugal'
    const city = (profile?.city || (profile as any)?.concelho || '').trim() || undefined
    const photoURL = profile?.photoURL || (profile as any)?.avatar || DEFAULT_AVATAR.image
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
      sessionId: tabId,
      currentSessionId: tabId,
      currentDeviceId: deviceId,
      currentPage,
      currentGameId,
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

    if (process.env.NODE_ENV === 'development') {
      console.log(`[PRESENCE] heartbeat: user=${anonymizeUserId(user.uid)} tab=${tabId} dev=${deviceId.slice(0, 8)} page=${currentPage} act=${activity} game=${currentGameId || 'none'}`)
    }
  } catch (err) {
    console.debug('[PRESENCE] Erro no envio de heartbeat:', err)
  }
}

/**
 * Marca o utilizador como offline no Firestore apenas se não existirem outras abas ativas
 */
export async function markRealOffline(userId: string | null | undefined, force: boolean = false): Promise<void> {
  if (!userId) return

  try {
    const presenceRef = doc(db, 'publicPresence', userId)

    if (force) {
      // Na eliminação de conta ou desconexão forçada, APAGAR o documento definitivamente
      try {
        const { deleteDoc } = await import('firebase/firestore')
        await deleteDoc(presenceRef).catch(() => {})
      } catch {}
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PRESENCE] Documento de presença de ${anonymizeUserId(userId)} eliminado forçadamente.`)
      }
      return
    }

    const { hasRemainingTabs } = unregisterActiveTab(userId)
    if (hasRemainingTabs) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PRESENCE] Aba fechada mas utilizador ${anonymizeUserId(userId)} continua ativo noutra aba. Offline cancelado.`)
      }
      return
    }

    await setDoc(
      presenceRef,
      {
        online: false,
        isOnline: false,
        lastSeen: Date.now(),
        updatedAt: serverTimestamp(),
        currentGameId: null,
      },
      { merge: true }
    )

    if (process.env.NODE_ENV === 'development') {
      console.log(`[PRESENCE] session removed: user=${anonymizeUserId(userId)} marcado offline`)
    }
  } catch (err) {
    console.debug('[PRESENCE] Erro ao marcar offline:', err)
  }
}

/**
 * Desativa imediatamente a presença do utilizador e apaga o documento publicPresence (utilizado na eliminação de conta)
 */
export async function stopPresenceCompletely(userId: string): Promise<void> {
  if (!userId) return
  if (typeof window !== 'undefined') {
    localStorage.setItem('account_deleted', 'true')
    sessionStorage.setItem('account_deleted', 'true')
    localStorage.setItem(`account_deleted_${userId}`, 'true')
  }
  presenceManager.stop()
  await markRealOffline(userId, true)
}

/**
 * Extrai o timestamp numérico canónico de um documento (priorizando o serverTimestamp de updatedAt)
 */
export function extractDocTimestamp(d: any): number {
  if (!d) return 0
  if (d.updatedAt) {
    if (typeof d.updatedAt.toMillis === 'function') {
      return d.updatedAt.toMillis()
    }
    if (typeof d.updatedAt.seconds === 'number') {
      return d.updatedAt.seconds * 1000 + (d.updatedAt.nanoseconds ? Math.floor(d.updatedAt.nanoseconds / 1e6) : 0)
    }
  }
  return typeof d.lastSeen === 'number' ? d.lastSeen : 0
}

/**
 * Filtra e consolida estritamente utilizadores humanos reais ativos dentro do TTL,
 * com tolerância robusta a desfasamentos de relógio (clock skew) entre clientes.
 */
export function filterActiveRealPlayers(
  rawDocs: any[],
  currentUid?: string,
  now: number = Date.now()
): RealCommunityState {
  const activeMap = new Map<string, RealPlayerPresence>()
  let playingCount = 0
  let duelCount = 0

  if (!rawDocs || rawDocs.length === 0) {
    return {
      humanOnline: 0,
      playingCount: 0,
      duelCount: 0,
      players: [],
      loading: false,
    }
  }

  // 1. Encontrar o timestamp de servidor mais recente entre todos os documentos
  let latestServerTimestamp = 0
  rawDocs.forEach((d) => {
    if (!d) return
    const ts = extractDocTimestamp(d)
    if (ts > latestServerTimestamp) {
      latestServerTimestamp = ts
    }
  })

  // 2. Determinar o tempo de referência de forma imune a desfasamentos de relógio
  let referenceTime = now
  if (latestServerTimestamp > 0) {
    const skew = Math.abs(now - latestServerTimestamp)
    if (skew > 45_000) {
      referenceTime = latestServerTimestamp
    } else {
      referenceTime = Math.max(now, latestServerTimestamp)
    }
  }

  rawDocs.forEach((d) => {
    if (!d || !d.userId) return

    const isOnlineFlag = d.online !== false && d.isOnline !== false
    const docTime = extractDocTimestamp(d)
    const age = referenceTime - docTime

    // Válido se online for true e o heartbeat tiver ocorrido nos últimos 75 segundos
    // (com margem de 30s para relógios ligeiramente futuros)
    const isWithinTTL = age >= -30_000 && age <= OFFLINE_TTL_MS

    if (isOnlineFlag && isWithinTTL) {
      const act: RealUserActivity = d.activity === 'playing' || d.activity === 'duel' ? d.activity : 'browsing'
      const avatar = d.avatar || d.photoURL || null
      const resolvedConcelho = d.city || d.concelho ? String(d.city || d.concelho).trim() : undefined

      const player: RealPlayerPresence = {
        userId: String(d.userId),
        sessionId: d.sessionId || d.currentSessionId,
        currentSessionId: d.currentSessionId || d.sessionId,
        currentDeviceId: d.currentDeviceId,
        currentPage: d.currentPage,
        currentGameId: d.currentGameId || null,
        displayName: sanitizePublicDisplayName(d.displayName, d.district),
        photoURL: avatar,
        avatar,
        district: (d.district || '').trim() || 'Portugal',
        ...(resolvedConcelho ? { city: resolvedConcelho } : {}),
        activity: act,
        lastSeen: docTime,
        expiresAt: docTime + OFFLINE_TTL_MS,
        online: true,
        isOnline: true,
        level: typeof d.level === 'number' ? d.level : 1,
        ...(typeof d.xp === 'number' ? { xp: d.xp } : {}),
        title: d.title || 'Patriota',
        equippedFrame: d.equippedFrame || undefined,
        updatedAt: d.updatedAt,
      }

      // Deduplicação: se o utilizador já existir (ex.: múltiplas abas ou dispositivos), manter o mais recente
      const existing = activeMap.get(player.userId)
      if (!existing || player.lastSeen > existing.lastSeen) {
        activeMap.set(player.userId, player)
      }
    }
  })

  const players = Array.from(activeMap.values())

  // Ordenar: primeiro o utilizador atual, depois os com atividade mais recente
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
    loading: false,
  }
}

/**
 * ============================================================================
 * PRESENCE SUBSCRIPTION MANAGER (SINGLETON - SINGLE SOURCE OF TRUTH)
 * ============================================================================
 * Garante que existe exatamente UMA subscrição onSnapshot ao Firestore
 * ordenada pelos mais recentes ativos (orderBy('lastSeen', 'desc'), limit(150)),
 * imune ao problema de corte alfabético por ID de utilizador.
 * Um ticker local re-avalia o TTL a cada 5 segundos sem emitir novas queries.
 */
class PresenceSubscriptionManager {
  private subscribers = new Set<(state: RealCommunityState) => void>()
  private rawDocs: any[] = []
  private unsubscribeFirestore: (() => void) | null = null
  private refreshTimer: NodeJS.Timeout | null = null
  private currentUid: string | undefined = undefined
  private isInitialLoading = true

  public subscribe(callback: (state: RealCommunityState) => void, uid?: string): () => void {
    if (uid) this.currentUid = uid
    this.subscribers.add(callback)

    // Notificar imediatamente com o estado atual em cache
    callback(this.getState())

    // Se é o primeiro subscritor, iniciar o listener Firestore
    if (this.subscribers.size === 1) {
      this.startListening()
    }

    return () => {
      this.subscribers.delete(callback)
      // Se não restam subscritores, limpar listener e temporizador
      if (this.subscribers.size === 0) {
        this.stopListening()
      }
    }
  }

  public updateCurrentUid(uid?: string) {
    if (this.currentUid !== uid) {
      this.currentUid = uid
      this.notifySubscribers()
    }
  }

  public getState(): RealCommunityState {
    const community = filterActiveRealPlayers(this.rawDocs, this.currentUid, Date.now())
    return {
      ...community,
      loading: this.isInitialLoading,
    }
  }

  private startListening() {
    if (typeof window === 'undefined') return
    if (this.unsubscribeFirestore) return

    try {
      const presenceCol = collection(db, 'publicPresence')
      // Ordenação nativa indexada por lastSeen desc: garante que os 150 jogadores
      // com atividade mais recente em Portugal são recebidos em tempo real.
      const q = query(presenceCol, orderBy('lastSeen', 'desc'), limit(150))

      if (process.env.NODE_ENV === 'development') {
        console.log('[PRESENCE] A iniciar subscrição centralizada onSnapshot ao Firestore (orderBy lastSeen desc)...')
      }

      this.unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const docs: any[] = []
          snapshot.forEach((docSnap) => {
            const data = docSnap.data()
            if (data && data.userId) {
              docs.push(data)
            }
          })

          this.rawDocs = docs
          this.isInitialLoading = false

          if (process.env.NODE_ENV === 'development') {
            const state = filterActiveRealPlayers(docs, this.currentUid, Date.now())
            console.log(`[PRESENCE] snapshot: ${docs.length} docs recebidos, ${state.humanOnline} jogadores online reais`)
          }

          this.notifySubscribers()
        },
        (error) => {
          console.debug('[PRESENCE] Erro no listener central:', error)
          this.isInitialLoading = false
          this.notifySubscribers()
        }
      )

      // Temporizador de 5s para expiração local puramente em memória (sem reads nem writes no Firestore)
      this.refreshTimer = setInterval(() => {
        this.notifySubscribers()
      }, 5_000)
    } catch (err) {
      console.debug('[PRESENCE] Falha ao iniciar listener central:', err)
      this.isInitialLoading = false
    }
  }

  private stopListening() {
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore()
      this.unsubscribeFirestore = null
      if (process.env.NODE_ENV === 'development') {
        console.log('[PRESENCE] Subscrição centralizada onSnapshot desativada (0 subscritores)')
      }
    }
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  public stop() {
    this.stopListening()
    this.subscribers.clear()
    this.rawDocs = []
  }

  private notifySubscribers() {
    const state = this.getState()
    this.subscribers.forEach((cb) => {
      try {
        cb(state)
      } catch (e) {
        console.error('[PRESENCE] Erro ao notificar subscritor:', e)
      }
    })
  }
}

export const presenceManager = new PresenceSubscriptionManager()