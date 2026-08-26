// Acorda Portugal — 1v1 Real-Time Duel Engine & Automatic Matchmaker (Firestore Synchronized)
// Supports multi-device cross-play (PC vs Mobile) with real-time question validation.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  serverTimestamp,
  type Unsubscribe,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { QuestionRegistry } from '@/lib/question-system/registry'
import { selectBalancedMatchQuestions, shuffleQuestions } from '@/src/lib/questionEngine'
import type { QuizQuestion } from '@/lib/game-data'
import { calculateLevelProgress } from '@/lib/progression'
import { ECONOMY_CONFIG, calculateLevelUpCoinReward } from '@/src/data/economy'
import { QUESTION_TIME_MS } from '@/config/quiz'
import { getArenaById, getRandomArena, OFFICIAL_ARENAS } from '@/src/data/arenas'
import { getEmoteById, type EmoteItem } from '@/src/data/emotes'
import { getAvatarImage, DEFAULT_AVATAR } from '@/lib/avatars'
import { getEquippedAvatarImage } from '@/lib/inventory'

export function resolveUserAvatar(
  user?: { photoURL?: string | null } | null,
  profile?: any
): string {
  if (typeof window !== 'undefined') {
    const directLocal = localStorage.getItem('user_equipped_avatar') || localStorage.getItem('equipped_avatar_id')
    if (directLocal) return getAvatarImage(directLocal)
  }
  const candidate =
    (profile as any)?.equipped?.avatar ||
    (profile as any)?.equippedAvatar ||
    profile?.photoURL ||
    (profile as any)?.avatar ||
    (profile as any)?.avatarUrl ||
    user?.photoURL

  if (candidate) return getAvatarImage(candidate)
  return getEquippedAvatarImage()
}

export type DuelStatus = 'waiting' | 'matched' | 'playing' | 'finished' | 'expired' | 'cancelled'
export type DuelAnswerStatus = 'CORRECT' | 'WRONG' | 'TIMEOUT'

export interface DuelAnswer {
  questionId: string | number
  questionIndex: number
  selectedOption: 'A' | 'B' | 'C' | 'D' | null
  correctOption?: 'A' | 'B' | 'C' | 'D'
  isCorrect: boolean
  status: DuelAnswerStatus
  pointsAwarded: number
  answeredAt: number
  timeSpentSeconds: number
}

export interface DuelPlayerData {
  uid: string
  displayName: string
  photoURL?: string | null
  avatarUrl?: string | null
  avatar?: string | null
  level: number
  district: string
  score: number
  correctCount: number
  currentQuestionIndex: number
  questionStartedAt?: number | null
  questionDeadline?: number | null
  answers: DuelAnswer[]
  finished: boolean
  finishedAt?: number | null
}

export interface DuelQuestion {
  id: string | number
  question: string
  category: string
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[]
  correct: 'A' | 'B' | 'C' | 'D'
  explanation?: string
}

export interface DuelRematchState {
  fromUid: string
  fromName: string
  toUid: string
  status: 'pending' | 'accepted' | 'declined'
  newDuelId?: string
  requestedAt: number
}

export interface DuelTaunt {
  senderId: string
  senderName?: string
  text: string
  timestamp: number
}

export interface DuelEmoteEvent {
  id: string
  duelId: string
  senderId: string
  senderName: string
  emoteId: string
  emoji: string
  label: string
  text: string
  timestamp: number
}

export interface DuelDocument {
  id: string
  code: string // e.g. "AP-7K42"
  status: DuelStatus
  playerUids?: string[]
  matchAttemptA?: string
  matchAttemptB?: string
  createdAt: number
  startedAt?: number | null
  finishedAt?: number | null
  expiresAt: number
  lastHeartbeat?: number
  arenaId?: string
  arenaImage?: string
  arenaName?: string
  playerA: DuelPlayerData
  playerB?: DuelPlayerData | null
  questions: DuelQuestion[]
  winnerUid?: string | null
  winnerReason?: 'score' | 'draw' | 'abandon' | 'surrender' | 'opponent_forfeit' | null
  abandonedBy?: string | null
  surrenderedBy?: string | null
  rewardsClaimed?: Record<string, boolean>
  rematch?: DuelRematchState | null
  lastTaunt?: DuelTaunt | null
  lastEmote?: DuelEmoteEvent | null
}

export interface MatchmakingTicket {
  userId: string
  displayName: string
  photoURL?: string | null
  level: number
  district: string
  status: 'searching' | 'matched' | 'idle' | 'playing' | 'cancelled'
  matchAttemptId: string
  joinedAt: number
  lastHeartbeat: number
  expiresAt: number
  duelId?: string | null
  opponentInfo?: {
    displayName: string
    photoURL?: string | null
    level: number
    district?: string
  } | null
  matchedAt?: number | null
}

export interface MatchmakingResult {
  matched: boolean
  duelId?: string
  opponentInfo?: {
    displayName: string
    photoURL?: string | null
    level: number
    district?: string
  } | null
  ticket?: MatchmakingTicket | null
}

// Generate human-friendly duel codes (e.g. AP-8X39)
export function generateDuelCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `AP-${result}`
}

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Select 10 distinct, varied questions with deterministic option orders
export function generateDuelQuestions(count = 10): DuelQuestion[] {
  const pool = QuestionRegistry.getInstance().getJogarTudo()
  const selected = selectBalancedMatchQuestions(pool, count, new Set(), true)

  return selected.map((q) => {
    const rawOptions = q.options || []
    const correctText = rawOptions[q.correctAnswer] || rawOptions[0] || ''

    const shuffledOptions = shuffleQuestions(rawOptions)
    const remappedOptions = shuffledOptions.map((optText, idx) => ({
      key: ['A', 'B', 'C', 'D'][idx] as 'A' | 'B' | 'C' | 'D',
      text: optText,
    }))

    const newCorrectKey =
      remappedOptions.find((opt) => opt.text === correctText)?.key ?? 'A'

    return {
      id: q.id,
      question: q.question,
      category: q.category,
      options: remappedOptions,
      correct: newCorrectKey,
      explanation: q.explanation || `Resposta correta: ${correctText}`,
    }
  })
}

// =========================================================================
// 1. AUTOMATIC 1V1 MATCHMAKING (ATOMIC FIRESTORE TRANSACTIONS & REAL-TIME ON SNAPSHOT)
// =========================================================================

export interface MatchmakingRoomResult {
  role: 'host' | 'guest'
  matched: boolean
  roomId: string
  duel: DuelDocument
  opponent?: DuelPlayerData | null
}

/**
 * Procura uma sala aberta com status 'waiting' e entra via transação Firestore,
 * ou cria uma nova sala como Host aguardando adversário em tempo real.
 */
export async function findOrCreateMatchmakingRoom(
  user: { uid: string; displayName?: string | null; photoURL?: string | null },
  profile?: { level?: number; district?: string; equippedArena?: string },
  options?: { arenaId?: string; arenaImage?: string; arenaName?: string },
): Promise<MatchmakingRoomResult> {
  if (!user || !user.uid) {
    throw new Error('Identificador de jogador ausente.')
  }

  const now = Date.now()
  const playerLevel = profile?.level || 1
  const playerName = (profile as any)?.displayName || user.displayName || 'Jogador'
  const playerDistrict = profile?.district || 'Portugal'
  const playerPhoto = resolveUserAvatar(user, profile)

  const myPlayerData: DuelPlayerData = {
    uid: user.uid,
    displayName: playerName,
    photoURL: playerPhoto,
    avatarUrl: playerPhoto,
    avatar: playerPhoto,
    level: playerLevel,
    district: playerDistrict,
    score: 0,
    correctCount: 0,
    currentQuestionIndex: 0,
    answers: [],
    finished: false,
    finishedAt: null,
  }

  console.log('[Matchmaking] A procurar sala para:', user.uid, `(${playerName}, Nível ${playerLevel})`)

  // 1. Consultar todas as salas abertas com status: 'waiting'
  const q = query(
    collection(db, 'duels'),
    where('status', '==', 'waiting'),
  )
  const snap = await getDocs(q)

  // 1.1 Pre-cleanup: Limpar salas abandonadas do próprio utilizador ou com mais de 45 segundos
  for (const d of snap.docs) {
    const data = d.data() as DuelDocument
    if (data.playerA?.uid === user.uid) {
      deleteDoc(d.ref).catch(() => {})
    } else if (
      typeof data.createdAt === 'number' &&
      data.createdAt < now - 45_000 &&
      (!data.lastHeartbeat || data.lastHeartbeat < now - 15_000)
    ) {
      deleteDoc(d.ref).catch(() => {})
    }
  }

  const candidateDocs = snap.docs.filter((d) => {
    const data = d.data() as DuelDocument
    if (data.playerA?.uid === user.uid) return false
    const isRecent =
      (typeof data.createdAt === 'number' && data.createdAt > now - 45_000) ||
      (typeof data.lastHeartbeat === 'number' && data.lastHeartbeat > now - 20_000)
    return isRecent && !data.playerB && data.status === 'waiting'
  })

  // 2. Se existirem salas de outro jogador, tentar entrar via transação atómica
  if (candidateDocs.length > 0) {
    // Ordenar por proximidade de nível e salas mais antigas primeiro
    candidateDocs.sort((a, b) => {
      const dataA = a.data() as DuelDocument
      const dataB = b.data() as DuelDocument
      const diffA = Math.abs((dataA.playerA?.level || 1) - playerLevel)
      const diffB = Math.abs((dataB.playerA?.level || 1) - playerLevel)
      if (diffA !== diffB) return diffA - diffB
      return (dataA.createdAt || 0) - (dataB.createdAt || 0)
    })

    for (const candDoc of candidateDocs) {
      const candRoomId = candDoc.id
      const candRef = doc(db, 'duels', candRoomId)

      try {
        const txResult = await runTransaction(db, async (transaction) => {
          const roomSnap = await transaction.get(candRef)
          if (!roomSnap.exists()) {
            return { matched: false as const }
          }

          const roomData = roomSnap.data() as DuelDocument
          if (
            roomData.status !== 'waiting' ||
            roomData.playerB ||
            roomData.playerA?.uid === user.uid
          ) {
            return { matched: false as const }
          }

          const startedAt = Date.now() + 3500
          const firstDeadline = startedAt + QUESTION_TIME_MS

          const guestPlayer: DuelPlayerData = {
            ...myPlayerData,
            questionStartedAt: startedAt,
            questionDeadline: firstDeadline,
          }

          const updatedDoc: Record<string, any> = {
            status: 'matched',
            playerB: guestPlayer,
            playerUids: [roomData.playerA.uid, user.uid],
            startedAt,
            'playerA.questionStartedAt': startedAt,
            'playerA.questionDeadline': firstDeadline,
          }

          transaction.update(candRef, updatedDoc)

          const fullDuel: DuelDocument = {
            ...roomData,
            status: 'matched',
            playerB: guestPlayer,
            playerUids: [roomData.playerA.uid, user.uid],
            startedAt,
            playerA: {
              ...roomData.playerA,
              questionStartedAt: startedAt,
              questionDeadline: firstDeadline,
            },
          }

          return {
            matched: true as const,
            roomId: candRoomId,
            duel: fullDuel,
            opponent: roomData.playerA,
          }
        })

        if (txResult.matched && txResult.roomId && txResult.duel) {
          console.log('[Matchmaking] Room joined as Player 2:', txResult.roomId, 'Adversário:', txResult.opponent?.displayName)
          return {
            role: 'guest',
            matched: true,
            roomId: txResult.roomId,
            duel: txResult.duel,
            opponent: txResult.opponent,
          }
        }
      } catch (txErr) {
        console.warn('[Matchmaking] Colisão de transação na sala:', candRoomId, txErr)
      }
    }
  }

  // 3. Se nenhuma sala foi associada, criar uma nova sala como Host
  const newRoomId = `duel_${crypto.randomUUID()}`
  const newCode = generateDuelCode()
  const questions = generateDuelQuestions(10)
  const expiresAt = now + 15 * 60 * 1000

  // Selecionar arena do Host ou aleatória
  const selectedArena = options?.arenaId
    ? getArenaById(options.arenaId)
    : profile?.equippedArena
    ? getArenaById(profile.equippedArena)
    : getRandomArena()

  const chosenArenaId = selectedArena?.id || 'arena_1'
  const chosenArenaImage = options?.arenaImage || selectedArena?.imagePath || '/arenas/arena-1.jpg'
  const chosenArenaName = options?.arenaName || selectedArena?.name || 'Praça do Império'

  const hostPlayer: DuelPlayerData = {
    ...myPlayerData,
  }

  const newDuelDoc: DuelDocument = {
    id: newRoomId,
    code: newCode,
    status: 'waiting',
    playerUids: [user.uid],
    createdAt: now,
    lastHeartbeat: now,
    expiresAt,
    arenaId: chosenArenaId,
    arenaImage: chosenArenaImage,
    arenaName: chosenArenaName,
    playerA: hostPlayer,
    playerB: null,
    questions,
    winnerUid: null,
    winnerReason: null,
    rewardsClaimed: {},
  }

  const roomRef = doc(db, 'duels', newRoomId)
  await setDoc(roomRef, newDuelDoc)
  console.log('[Matchmaking] Room created as Player 1:', newRoomId, 'Arena:', chosenArenaName, 'Aguardando adversário...')

  return {
    role: 'host',
    matched: false,
    roomId: newRoomId,
    duel: newDuelDoc,
    opponent: null,
  }
}

/**
 * Permite a um Host ativo verificar e associar-se a outra sala criada simultaneamente
 * SEM criar salas adicionais órfãs.
 */
export async function checkAndJoinWaitingRoom(
  user: { uid: string; displayName?: string | null; photoURL?: string | null },
  profile?: { level?: number; district?: string },
  currentWaitingRoomId?: string | null,
): Promise<{ matched: boolean; roomId?: string; duel?: DuelDocument; opponent?: DuelPlayerData | null }> {
  if (!user || !user.uid) return { matched: false }

  const now = Date.now()
  const playerLevel = profile?.level || 1
  const playerName = (profile as any)?.displayName || user.displayName || 'Jogador'
  const playerDistrict = profile?.district || 'Portugal'
  const playerPhoto = resolveUserAvatar(user, profile)

  const myPlayerData: DuelPlayerData = {
    uid: user.uid,
    displayName: playerName,
    photoURL: playerPhoto,
    avatarUrl: playerPhoto,
    avatar: playerPhoto,
    level: playerLevel,
    district: playerDistrict,
    score: 0,
    correctCount: 0,
    currentQuestionIndex: 0,
    answers: [],
    finished: false,
    finishedAt: null,
  }

  try {
    const q = query(collection(db, 'duels'), where('status', '==', 'waiting'))
    const snap = await getDocs(q)

    const candidates = snap.docs.filter((d) => {
      const data = d.data() as DuelDocument
      if (data.playerA?.uid === user.uid || d.id === currentWaitingRoomId) return false
      const isRecent =
        (typeof data.createdAt === 'number' && data.createdAt > now - 45_000) ||
        (typeof data.lastHeartbeat === 'number' && data.lastHeartbeat > now - 20_000)
      return isRecent && !data.playerB && data.status === 'waiting'
    })

    if (candidates.length === 0) return { matched: false }

    for (const candDoc of candidates) {
      const candRoomId = candDoc.id
      const candRef = doc(db, 'duels', candRoomId)

      try {
        const txResult = await runTransaction(db, async (transaction) => {
          const roomSnap = await transaction.get(candRef)
          if (!roomSnap.exists()) return { matched: false as const }

          const roomData = roomSnap.data() as DuelDocument
          if (roomData.status !== 'waiting' || roomData.playerB || roomData.playerA?.uid === user.uid) {
            return { matched: false as const }
          }

          const startedAt = Date.now() + 3500
          const firstDeadline = startedAt + QUESTION_TIME_MS

          const guestPlayer: DuelPlayerData = {
            ...myPlayerData,
            questionStartedAt: startedAt,
            questionDeadline: firstDeadline,
          }

          const updatedDoc: Record<string, any> = {
            status: 'matched',
            playerB: guestPlayer,
            playerUids: [roomData.playerA.uid, user.uid],
            startedAt,
            'playerA.questionStartedAt': startedAt,
            'playerA.questionDeadline': firstDeadline,
          }

          transaction.update(candRef, updatedDoc)

          const fullDuel: DuelDocument = {
            ...roomData,
            status: 'matched',
            playerB: guestPlayer,
            playerUids: [roomData.playerA.uid, user.uid],
            startedAt,
            playerA: {
              ...roomData.playerA,
              questionStartedAt: startedAt,
              questionDeadline: firstDeadline,
            },
          }

          return {
            matched: true as const,
            roomId: candRoomId,
            duel: fullDuel,
            opponent: roomData.playerA,
          }
        })

        if (txResult.matched && txResult.roomId && txResult.duel) {
          // Se entramos noutra sala com sucesso, eliminar a nossa sala de espera anterior
          if (currentWaitingRoomId) {
            cancelWaitingRoom(currentWaitingRoomId, user.uid).catch(() => {})
          }
          console.log('[Matchmaking] Host resolvido e emparelhado com sucesso na sala:', txResult.roomId)
          return {
            matched: true,
            roomId: txResult.roomId,
            duel: txResult.duel,
            opponent: txResult.opponent,
          }
        }
      } catch (txErr) {
        console.warn('[Matchmaking] Tentativa de resolução de host colidiu:', candRoomId, txErr)
      }
    }
  } catch (err) {
    console.warn('[Matchmaking] Erro em checkAndJoinWaitingRoom:', err)
  }

  return { matched: false }
}

/**
 * Subscreve em tempo real à sala de espera de duelo no Firestore.
 */
export function subscribeToWaitingRoom(
  roomId: string,
  onMatched: (duel: DuelDocument, opponent: DuelPlayerData) => void,
  onCancelled?: () => void,
): Unsubscribe {
  if (!roomId) return () => {}

  const roomRef = doc(db, 'duels', roomId)
  console.log('[Matchmaking] Listener de sala ativo para:', roomId)

  return onSnapshot(
    roomRef,
    (snap) => {
      if (!snap.exists()) {
        if (onCancelled) onCancelled()
        return
      }

      const duel = snap.data() as DuelDocument

      if (duel.status === 'matched' && duel.playerB) {
        console.log('[Matchmaking] Room matched via onSnapshot! Room:', roomId, 'Adversário:', duel.playerB.displayName)
        onMatched(duel, duel.playerB)
      } else if (duel.status === 'cancelled') {
        if (onCancelled) onCancelled()
      }
    },
    (err) => {
      console.warn('[Matchmaking] Erro no listener da sala:', roomId, err)
    },
  )
}

/**
 * Cancela e elimina a sala de espera do utilizador.
 */
export async function cancelWaitingRoom(roomId: string, userUid?: string): Promise<void> {
  if (!roomId) return
  try {
    const roomRef = doc(db, 'duels', roomId)
    const snap = await getDoc(roomRef)
    if (snap.exists()) {
      const data = snap.data() as DuelDocument
      if (data.status === 'waiting' && (!userUid || data.playerA?.uid === userUid)) {
        await deleteDoc(roomRef)
        console.log('[Matchmaking] Room cancelled & deleted:', roomId)
      }
    }
  } catch (err) {
    console.warn('[Matchmaking] Erro ao cancelar sala:', roomId, err)
  }
}

/**
 * Envia heartbeat para manter a sala de espera ativa.
 */
export async function sendRoomHeartbeat(roomId: string): Promise<void> {
  if (!roomId) return
  try {
    const roomRef = doc(db, 'duels', roomId)
    await updateDoc(roomRef, {
      lastHeartbeat: Date.now(),
    })
  } catch {
    // Sala pode já ter sido transicionada ou removida
  }
}

// -------------------------------------------------------------------------
// Funções de compatibilidade para duelQueue
// -------------------------------------------------------------------------

export async function joinMatchmakingQueue(
  user: { uid: string; displayName?: string | null; photoURL?: string | null },
  profile?: { level?: number; district?: string },
  matchAttemptId: string = crypto.randomUUID(),
): Promise<string> {
  if (!user || !user.uid) return matchAttemptId
  try {
    const now = Date.now()
    const playerPhoto = resolveUserAvatar(user, profile)
    const ticketRef = doc(db, 'duelQueue', user.uid)
    await setDoc(ticketRef, {
      userId: user.uid,
      displayName: (profile as any)?.displayName || user.displayName || 'Jogador',
      photoURL: playerPhoto,
      avatarUrl: playerPhoto,
      avatar: playerPhoto,
      level: profile?.level || 1,
      district: profile?.district || 'Portugal',
      status: 'searching',
      matchAttemptId,
      joinedAt: now,
      lastHeartbeat: now,
      expiresAt: now + 60_000,
      duelId: null,
      opponentInfo: null,
      matchedAt: null,
    })
  } catch {}
  return matchAttemptId
}

export async function heartbeatMatchmaking(
  userUid: string,
  matchAttemptId: string,
): Promise<void> {
  if (!userUid) return
  try {
    const ticketRef = doc(db, 'duelQueue', userUid)
    await updateDoc(ticketRef, {
      lastHeartbeat: Date.now(),
      expiresAt: Date.now() + 60_000,
    })
  } catch {}
}

export async function cancelMatchmakingQueue(userUid: string): Promise<void> {
  if (!userUid) return
  try {
    const ticketRef = doc(db, 'duelQueue', userUid)
    await deleteDoc(ticketRef)
    console.log('[Matchmaking] Queue ticket cancelled:', userUid)
  } catch (err) {
    console.error('Erro ao cancelar fila de matchmaking:', err)
  }
}

export async function cleanMatchmakingQueue(userUid: string): Promise<void> {
  if (!userUid) return
  try {
    const ticketRef = doc(db, 'duelQueue', userUid)
    await deleteDoc(ticketRef)
  } catch {}
}

export function subscribeToMatchmaking(
  userUid: string,
  currentMatchAttemptId: string,
  onTicketUpdate: (ticket: MatchmakingTicket | null) => void,
): Unsubscribe {
  if (!userUid) return () => {}
  const ticketRef = doc(db, 'duelQueue', userUid)
  return onSnapshot(
    ticketRef,
    (snap) => {
      if (snap.exists()) {
        const ticketData = snap.data() as MatchmakingTicket
        if (
          ticketData.userId === userUid &&
          ticketData.status === 'matched' &&
          ticketData.duelId &&
          ticketData.opponentInfo
        ) {
          onTicketUpdate(ticketData)
        }
      }
    },
    () => {},
  )
}

export async function tryFindOpponentMatch(
  user: { uid: string; displayName?: string | null; photoURL?: string | null },
  profile?: { level?: number; district?: string },
  myMatchAttemptId?: string,
): Promise<MatchmakingResult> {
  try {
    const res = await findOrCreateMatchmakingRoom(user, profile)
    if (res.matched && res.opponent) {
      return {
        matched: true,
        duelId: res.roomId,
        opponentInfo: {
          displayName: res.opponent.displayName,
          photoURL: res.opponent.photoURL,
          level: res.opponent.level,
          district: res.opponent.district,
        },
      }
    }
    return { matched: false }
  } catch (err) {
    console.error('[Matchmaking] tryFindOpponentMatch error:', err)
    return { matched: false }
  }
}


// =========================================================================
// 2. ROOM & CODE CREATION (SECONDARY FRIEND DUEL)
// =========================================================================

export async function createDuelRoom(
  user: { uid: string; displayName?: string | null; photoURL?: string | null },
  profile?: { level?: number; district?: string; equippedArena?: string },
  options?: { arenaId?: string; arenaImage?: string; arenaName?: string },
): Promise<{ duelId: string; code: string }> {
  if (!user || !user.uid) {
    throw new Error('Identificador de jogador ausente.')
  }

  const duelId = `duel_${crypto.randomUUID()}`
  const code = generateDuelCode()
  const now = Date.now()
  const expiresAt = now + 15 * 60 * 1000

  const questions = generateDuelQuestions(10)

  const selectedArena = options?.arenaId
    ? getArenaById(options.arenaId)
    : profile?.equippedArena
    ? getArenaById(profile.equippedArena)
    : getRandomArena()

  const chosenArenaId = selectedArena?.id || 'arena_1'
  const chosenArenaImage = options?.arenaImage || selectedArena?.imagePath || '/arenas/arena-1.jpg'
  const chosenArenaName = options?.arenaName || selectedArena?.name || 'Praça do Império'

  const playerPhoto = resolveUserAvatar(user, profile)

  const playerA: DuelPlayerData = {
    uid: user.uid,
    displayName: (profile as any)?.displayName || user.displayName || 'Jogador A',
    photoURL: playerPhoto,
    avatarUrl: playerPhoto,
    avatar: playerPhoto,
    level: profile?.level || 1,
    district: profile?.district || 'Portugal',
    score: 0,
    correctCount: 0,
    currentQuestionIndex: 0,
    answers: [],
    finished: false,
    finishedAt: null,
  }

  const duelDoc: DuelDocument = {
    id: duelId,
    code,
    status: 'waiting',
    playerUids: [user.uid],
    createdAt: now,
    lastHeartbeat: now,
    expiresAt,
    arenaId: chosenArenaId,
    arenaImage: chosenArenaImage,
    arenaName: chosenArenaName,
    playerA,
    playerB: null,
    questions,
    winnerUid: null,
    winnerReason: null,
    rewardsClaimed: {},
  }

  const duelRef = doc(db, 'duels', duelId)
  await setDoc(duelRef, duelDoc)

  return { duelId, code }
}

export const createDuel = createDuelRoom

export async function joinDuelByCode(
  code: string,
  user: { uid: string; displayName?: string | null; photoURL?: string | null },
  profile?: { level?: number; district?: string },
): Promise<{ duelId: string }> {
  if (!user || !user.uid) {
    throw new Error('Identificador de jogador ausente.')
  }

  const cleanCode = code.trim().toUpperCase()
  if (!cleanCode) {
    throw new Error('Por favor introduz o código do duelo.')
  }

  const q = query(
    collection(db, 'duels'),
    where('code', '==', cleanCode),
  )
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error(`Duelo com o código "${cleanCode}" não foi encontrado.`)
  }

  const duelDocSnap = snapshot.docs[0]
  const duel = duelDocSnap.data() as DuelDocument
  const duelId = duel.id

  if (duel.playerA.uid === user.uid) {
    return { duelId }
  }

  if (duel.playerB && duel.playerB.uid === user.uid) {
    return { duelId }
  }

  if (duel.status !== 'waiting') {
    throw new Error('Este duelo já começou ou já foi terminado.')
  }

  if (Date.now() > duel.expiresAt) {
    throw new Error('Este duelo expirou. Pede ao teu adversário para criar um novo.')
  }

  const now = Date.now()
  const startedAt = now + 3500
  const firstDeadline = startedAt + QUESTION_TIME_MS
  const playerPhoto = resolveUserAvatar(user, profile)

  const playerB: DuelPlayerData = {
    uid: user.uid,
    displayName: (profile as any)?.displayName || user.displayName || 'Jogador B',
    photoURL: playerPhoto,
    avatarUrl: playerPhoto,
    avatar: playerPhoto,
    level: profile?.level || 1,
    district: profile?.district || 'Portugal',
    score: 0,
    correctCount: 0,
    currentQuestionIndex: 0,
    questionStartedAt: startedAt,
    questionDeadline: firstDeadline,
    answers: [],
    finished: false,
    finishedAt: null,
  }

  const duelRef = doc(db, 'duels', duelId)
  await updateDoc(duelRef, {
    playerB,
    playerUids: [duel.playerA.uid, user.uid],
    'playerA.questionStartedAt': startedAt,
    'playerA.questionDeadline': firstDeadline,
    status: 'matched',
    startedAt,
  })

  return { duelId }
}

// =========================================================================
// 3. ANSWER SUBMISSION (ATOMIC & DETERMINISTIC)
// =========================================================================

export async function submitDuelAnswer(
  duelId: string,
  userUid: string,
  questionIndex: number,
  selectedOption: 'A' | 'B' | 'C' | 'D' | null,
  timeSpentSeconds: number,
): Promise<{ isCorrect: boolean; status: DuelAnswerStatus; isDuelFinished: boolean }> {
  const duelRef = doc(db, 'duels', duelId)

  return await runTransaction(db, async (transaction) => {
    const duelSnap = await transaction.get(duelRef)
    if (!duelSnap.exists()) {
      throw new Error('Duelo não encontrado.')
    }

    const duel = duelSnap.data() as DuelDocument
    const isPlayerA = duel.playerA.uid === userUid
    const isPlayerB = duel.playerB?.uid === userUid

    if (!isPlayerA && !isPlayerB) {
      throw new Error('Não pertences a este duelo.')
    }

    const player = isPlayerA ? { ...duel.playerA } : { ...duel.playerB! }
    const opponent = isPlayerA ? (duel.playerB ? { ...duel.playerB } : null) : { ...duel.playerA }

    const alreadyAnswered = player.answers.some((a) => a.questionIndex === questionIndex)
    if (alreadyAnswered) {
      return { isCorrect: false, status: 'TIMEOUT', isDuelFinished: duel.status === 'finished' }
    }

    const currentQuestion = duel.questions[questionIndex]
    const now = Date.now()

    // Validação de tempo com margem de 15s para latência de rede móvel e desfasamento de relógio
    const isOverdue = player.questionDeadline && now > (player.questionDeadline + 15_000)
    const effectiveOption = isOverdue ? null : selectedOption

    const isCorrect = effectiveOption !== null && currentQuestion.correct === effectiveOption
    const status: DuelAnswerStatus =
      effectiveOption === null ? 'TIMEOUT' : isCorrect ? 'CORRECT' : 'WRONG'
    const pointsGained = isCorrect ? 100 : 0

    const newAnswer: DuelAnswer = {
      questionId: currentQuestion.id,
      questionIndex,
      selectedOption: effectiveOption,
      correctOption: currentQuestion.correct,
      isCorrect,
      status,
      pointsAwarded: pointsGained,
      answeredAt: now,
      timeSpentSeconds,
    }

    player.answers.push(newAnswer)
    player.score += pointsGained
    if (isCorrect) player.correctCount += 1
    player.currentQuestionIndex = questionIndex + 1

    const isLastQuestion = questionIndex >= duel.questions.length - 1
    if (isLastQuestion) {
      player.finished = true
      player.finishedAt = now
      player.questionStartedAt = null
      player.questionDeadline = null
    } else {
      // INICIAR 60s EXCLUSIVAMENTE PARA ESTE JOGADOR NA PRÓXIMA PERGUNTA
      player.questionStartedAt = now
      player.questionDeadline = now + QUESTION_TIME_MS
    }

    let newStatus: DuelStatus = duel.status === 'matched' ? 'playing' : duel.status
    let winnerUid: string | null = duel.winnerUid || null
    let winnerReason: 'score' | 'draw' | 'abandon' | 'surrender' | 'opponent_forfeit' | null = duel.winnerReason || null
    let finishedAt: number | null = duel.finishedAt || null

    if (player.finished && opponent?.finished) {
      newStatus = 'finished'
      finishedAt = Date.now()

      const scoreA = isPlayerA ? player.score : opponent.score
      const scoreB = isPlayerA ? opponent.score : player.score

      const timeA = (isPlayerA ? player.answers : opponent.answers).reduce((acc, a) => acc + (a.timeSpentSeconds || 0), 0)
      const timeB = (isPlayerA ? opponent.answers : player.answers).reduce((acc, a) => acc + (a.timeSpentSeconds || 0), 0)

      if (scoreA > scoreB) {
        winnerUid = duel.playerA.uid
        winnerReason = 'score'
      } else if (scoreB > scoreA) {
        winnerUid = duel.playerB!.uid
        winnerReason = 'score'
      } else if (timeA < timeB) {
        winnerUid = duel.playerA.uid
        winnerReason = 'score'
      } else if (timeB < timeA) {
        winnerUid = duel.playerB!.uid
        winnerReason = 'score'
      } else {
        winnerUid = null
        winnerReason = 'draw'
      }
    }

    const updates: Partial<DuelDocument> = {
      status: newStatus,
      winnerUid,
      winnerReason,
      finishedAt,
      ...(isPlayerA ? { playerA: player } : { playerB: player }),
    }

    transaction.update(duelRef, updates)

    return { isCorrect, status, isDuelFinished: newStatus === 'finished' }
  })
}

// =========================================================================
// 4. REWARD DISTRIBUTION (ATOMIC)
// =========================================================================

export interface DuelRewardResult {
  xp: number
  euros: number
  isWinner: boolean
  isDraw: boolean
  isLoser: boolean
  oldXp: number
  newXp: number
  oldEuros: number
  newEuros: number
  oldLevel: number
  newLevel: number
  leveledUp: boolean
  levelTitle: string
}

export async function claimDuelRewards(
  duelId: string,
  userUid: string,
): Promise<DuelRewardResult> {
  const duelRef = doc(db, 'duels', duelId)
  const userRef = doc(db, 'users', userUid)
  const publicProfileRef = doc(db, 'publicProfiles', userUid)

  return await runTransaction(db, async (transaction) => {
    const duelSnap = await transaction.get(duelRef)
    if (!duelSnap.exists()) {
      throw new Error('Duelo não encontrado.')
    }

    const duel = duelSnap.data() as DuelDocument
    const isPlayerA = duel.playerA.uid === userUid
    const isPlayerB = duel.playerB?.uid === userUid

    if (!isPlayerA && !isPlayerB) {
      throw new Error('Não pertences a este duelo.')
    }

    const player = isPlayerA ? duel.playerA : duel.playerB!
    const isWinner = duel.winnerUid === userUid
    const isDraw = duel.winnerUid === null
    const isLoser = !isWinner && !isDraw

    const xpReward = isWinner ? 300 : isDraw ? 150 : 100
    const baseWin = ECONOMY_CONFIG.MATCH_REWARDS.BASE_WIN_COINS
    const coinReward = isWinner ? baseWin + ECONOMY_CONFIG.MATCH_REWARDS.PERFECT_SCORE_BONUS : isDraw ? baseWin : 5

    const userSnap = await transaction.get(userRef)
    const userData = userSnap.exists() ? userSnap.data() : {}
    const currentXp = typeof userData.xp === 'number' ? userData.xp : 0
    const currentEuros = typeof userData.euros === 'number' ? userData.euros : 50
    const oldLevel = typeof userData.level === 'number' ? userData.level : 1

    const rewardsClaimed = duel.rewardsClaimed || {}
    if (rewardsClaimed[userUid]) {
      const levelProg = calculateLevelProgress(currentXp)
      return {
        xp: xpReward,
        euros: coinReward,
        isWinner,
        isDraw,
        isLoser,
        oldXp: currentXp,
        newXp: currentXp,
        oldEuros: currentEuros,
        newEuros: currentEuros,
        oldLevel,
        newLevel: levelProg.currentLevel.level,
        leveledUp: false,
        levelTitle: levelProg.currentLevel.title,
      }
    }

    const newTotalXp = currentXp + xpReward
    const levelProgress = calculateLevelProgress(newTotalXp)
    const newLevel = levelProgress.currentLevel.level
    const leveledUp = newLevel > oldLevel
    const levelUpCoins = leveledUp ? calculateLevelUpCoinReward(oldLevel, newLevel) : 0
    const totalAwardedEuros = coinReward + levelUpCoins
    const newTotalEuros = currentEuros + totalAwardedEuros

    if (userSnap.exists()) {
      transaction.update(userRef, {
        xp: newTotalXp,
        euros: newTotalEuros,
        coins: newTotalEuros,
        level: newLevel,
        gamesPlayed: (userData.gamesPlayed || 0) + 1,
        wins: (userData.wins || 0) + (isWinner ? 1 : 0),
        losses: (userData.losses || 0) + (isLoser ? 1 : 0),
        draws: (userData.draws || 0) + (isDraw ? 1 : 0),
        totalQuestions: (userData.totalQuestions || 0) + 10,
        questionsAnswered: (userData.questionsAnswered || 0) + 10,
        correctAnswers: (userData.correctAnswers || 0) + (player.correctCount || 0),
        incorrectAnswers: (userData.incorrectAnswers || 0) + Math.max(0, 10 - (player.correctCount || 0)),
      })

      transaction.set(
        publicProfileRef,
        {
          uid: userUid,
          displayName: userData.displayName || 'Jogador',
          photoURL: userData.photoURL || null,
          district: userData.district || 'Portugal',
          xp: newTotalXp,
          level: newLevel,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )

      const txRef = doc(collection(db, 'users', userUid, 'transactions'))
      transaction.set(txRef, {
        id: txRef.id,
        userId: userUid,
        type: 'earn',
        amount: coinReward,
        reason: isWinner
          ? `⚔️ Vitória em Duelo 1v1 (${duel.code})`
          : isDraw
            ? `🤝 Empate em Duelo 1v1 (${duel.code})`
            : `💪 Participação em Duelo 1v1 (${duel.code})`,
        matchId: duelId,
        createdAt: serverTimestamp(),
      })
    }

    transaction.update(duelRef, {
      [`rewardsClaimed.${userUid}`]: true,
    })

    return {
      xp: xpReward,
      euros: coinReward,
      isWinner,
      isDraw,
      isLoser,
      oldXp: currentXp,
      newXp: newTotalXp,
      oldEuros: currentEuros,
      newEuros: newTotalEuros,
      oldLevel,
      newLevel,
      leveledUp,
      levelTitle: levelProgress.currentLevel.title,
    }
  })
}

// =========================================================================
// 5. LIVE SUBSCRIPTION
// =========================================================================

export function subscribeToDuel(
  duelId: string,
  onUpdate: (duel: DuelDocument | null) => void,
): Unsubscribe {
  const duelRef = doc(db, 'duels', duelId)
  return onSnapshot(
    duelRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as DuelDocument)
      } else {
        onUpdate(null)
      }
    },
    (err) => {
      console.error('Erro na subscrição do duelo:', err)
      onUpdate(null)
    },
  )
}

// =========================================================================
// 6. 1V1 REMATCH SYSTEM (REVANCHE EM TEMPO REAL)
// =========================================================================

export async function requestDuelRematch(
  duelId: string,
  user: { uid: string; displayName?: string | null },
  opponentUid: string,
): Promise<void> {
  const duelRef = doc(db, 'duels', duelId)
  await updateDoc(duelRef, {
    rematch: {
      fromUid: user.uid,
      fromName: user.displayName || 'Jogador',
      toUid: opponentUid,
      status: 'pending',
      requestedAt: Date.now(),
    },
  })
}

export async function respondDuelRematch(
  duelId: string,
  accept: boolean,
  user: { uid: string; displayName?: string | null; photoURL?: string | null },
): Promise<{ newDuelId?: string }> {
  const duelRef = doc(db, 'duels', duelId)
  const duelSnap = await getDoc(duelRef)
  if (!duelSnap.exists()) {
    throw new Error('Duelo não encontrado.')
  }

  const duel = duelSnap.data() as DuelDocument

  if (!accept) {
    if (duel.rematch) {
      await updateDoc(duelRef, {
        'rematch.status': 'declined',
      })
    }
    return {}
  }

  // Criar novo duelo 100% fresco com novo conjunto de 10 perguntas
  const newDuelId = `duel_${crypto.randomUUID()}`
  const newDuelRef = doc(db, 'duels', newDuelId)
  const now = Date.now()
  const questions = generateDuelQuestions(10)
  const code = generateDuelCode()

  const playerAOriginal = duel.playerA
  const playerBOriginal = duel.playerB || {
    uid: user.uid,
    displayName: user.displayName || 'Jogador',
    photoURL: user.photoURL || null,
    level: 1,
    district: 'Portugal',
    score: 0,
    correctCount: 0,
    currentQuestionIndex: 0,
    answers: [],
    finished: false,
    finishedAt: null,
  }

  const duelStartedAt = now + 3000
  const firstDeadline = duelStartedAt + 60_000

  const newPlayerA: DuelPlayerData = {
    uid: playerAOriginal.uid,
    displayName: playerAOriginal.displayName,
    photoURL: playerAOriginal.photoURL || null,
    level: playerAOriginal.level || 1,
    district: playerAOriginal.district || 'Portugal',
    score: 0,
    correctCount: 0,
    currentQuestionIndex: 0,
    questionStartedAt: duelStartedAt,
    questionDeadline: firstDeadline,
    answers: [],
    finished: false,
    finishedAt: null,
  }

  const newPlayerB: DuelPlayerData = {
    uid: playerBOriginal.uid,
    displayName: playerBOriginal.displayName,
    photoURL: playerBOriginal.photoURL || null,
    level: playerBOriginal.level || 1,
    district: playerBOriginal.district || 'Portugal',
    score: 0,
    correctCount: 0,
    currentQuestionIndex: 0,
    questionStartedAt: duelStartedAt,
    questionDeadline: firstDeadline,
    answers: [],
    finished: false,
    finishedAt: null,
  }

  const newDuelDoc: DuelDocument = {
    id: newDuelId,
    code,
    status: 'matched',
    createdAt: now,
    startedAt: duelStartedAt,
    expiresAt: now + 15 * 60 * 1000,
    arenaId: duel.arenaId || 'arena_1',
    arenaImage: duel.arenaImage || '/arenas/arena-1.jpg',
    arenaName: duel.arenaName || 'Praça do Império',
    playerA: newPlayerA,
    playerB: newPlayerB,
    questions,
    winnerUid: null,
    winnerReason: null,
    rewardsClaimed: {},
    rematch: null,
  }

  await setDoc(newDuelRef, newDuelDoc)

  // Atualizar duelo original com estado 'accepted' e link para o novo duelo
  await updateDoc(duelRef, {
    rematch: {
      fromUid: duel.rematch?.fromUid || playerAOriginal.uid,
      fromName: duel.rematch?.fromName || playerAOriginal.displayName,
      toUid: user.uid,
      status: 'accepted',
      newDuelId,
      requestedAt: duel.rematch?.requestedAt || now,
    },
  })

  return { newDuelId }
}

/**
 * Envia uma provocação / taunt em tempo real para o adversário no duelo
 */
export async function sendDuelTaunt(
  duelId: string,
  senderId: string,
  senderName: string,
  text: string
): Promise<void> {
  if (!duelId || !senderId || !text) return
  try {
    const duelRef = doc(db, 'duels', duelId)
    await updateDoc(duelRef, {
      lastTaunt: {
        senderId,
        senderName,
        text,
        timestamp: Date.now(),
      },
    })
  } catch (error) {
    console.error('Erro ao enviar provocação:', error)
  }
}

/**
 * Envia um Emote oficial sincronizado em tempo real no duelo 1v1
 */
export async function sendDuelEmote(
  duelId: string,
  senderId: string,
  senderName: string,
  emoteId: string,
  customText?: string
): Promise<void> {
  if (!duelId || !senderId || !emoteId) return
  try {
    const emote = getEmoteById(emoteId)
    const emoji = emote?.emoji || '💬'
    const label = emote?.label || customText || 'Reação'
    const text = emote?.text || customText || `${emoji} ${label}`
    const now = Date.now()

    const reactionPayload = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(now),
      type: 'PLAYER_REACTION',
      roomId: duelId,
      duelId,
      senderId,
      senderName: senderName || 'Jogador',
      emoteId,
      emoji,
      label,
      text,
      reaction: {
        id: emoteId,
        icon: emoji,
        text: label,
      },
      timestamp: now,
    }

    const duelRef = doc(db, 'duels', duelId)
    await updateDoc(duelRef, {
      lastEmote: reactionPayload,
      lastReaction: reactionPayload,
    })
  } catch (error) {
    console.error('[Duel Engine] Erro ao enviar emote:', error)
  }
}






/**
 * Desistir / Abandonar Partida de Duelo 1v1
 * Atribui vitória imediata ao adversário com reason: 'surrender'
 */
export async function surrenderDuel(duelId: string, surrenderingUid: string): Promise<{ success: boolean; winnerUid?: string }> {
  try {
    const duelRef = doc(db, 'duels', duelId)
    const now = Date.now()

    return await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(duelRef)
      if (!snap.exists()) {
        return { success: false }
      }

      const duel = snap.data() as DuelDocument
      const isPlayerA = duel.playerA?.uid === surrenderingUid
      const isPlayerB = duel.playerB?.uid === surrenderingUid

      // Se a partida já estiver terminada ou o jogador não pertencer à partida
      if (duel.status === 'finished' || (!isPlayerA && !isPlayerB)) {
        return { success: true, winnerUid: duel.winnerUid || undefined }
      }

      const opponentUid = isPlayerA ? duel.playerB?.uid : duel.playerA?.uid
      const winnerUid = opponentUid || null

      const surrenderEvent = {
        type: 'PLAYER_SURRENDERED',
        event: 'player_surrendered',
        senderId: surrenderingUid,
        duelId,
        surrenderedBy: surrenderingUid,
        winnerUid,
        timestamp: now,
      }

      const updates: Partial<DuelDocument> & Record<string, any> = {
        status: 'finished',
        winnerUid,
        winnerReason: 'opponent_forfeit',
        abandonedBy: surrenderingUid,
        surrenderedBy: surrenderingUid,
        finishedAt: now,
        lastEvent: surrenderEvent,
      }

      if (isPlayerA && duel.playerA) {
        updates.playerA = { ...duel.playerA, finished: true, finishedAt: now }
      } else if (isPlayerB && duel.playerB) {
        updates.playerB = { ...duel.playerB, finished: true, finishedAt: now }
      }

      transaction.update(duelRef, updates)

      return { success: true, winnerUid: winnerUid || undefined }
    })
  } catch (err) {
    console.error('Erro ao desistir do duelo:', err)
    return { success: false }
  }
}

export const forfeitDuel = surrenderDuel
