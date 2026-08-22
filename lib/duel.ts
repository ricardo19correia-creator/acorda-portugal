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
import { ALL_QUIZ_QUESTIONS, type QuizQuestion } from '@/lib/game-data'
import { calculateLevelProgress } from '@/lib/progression'
import { QUESTION_TIME_MS } from '@/config/quiz'

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
  playerA: DuelPlayerData
  playerB?: DuelPlayerData | null
  questions: DuelQuestion[]
  winnerUid?: string | null
  winnerReason?: 'score' | 'draw' | 'abandon' | null
  rewardsClaimed?: Record<string, boolean>
  rematch?: DuelRematchState | null
  lastTaunt?: DuelTaunt | null
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
  const pool = shuffleArray(ALL_QUIZ_QUESTIONS)
  const selected = pool.slice(0, Math.min(count, pool.length))

  return selected.map((q) => {
    const shuffledOptions = shuffleArray(q.options)
    const correctOption = shuffledOptions.find((opt) => opt.key === q.correct)

    const remappedOptions = shuffledOptions.map((opt, idx) => ({
      key: ['A', 'B', 'C', 'D'][idx] as 'A' | 'B' | 'C' | 'D',
      text: opt.text,
    }))

    const newCorrectKey =
      remappedOptions.find((opt) => opt.text === correctOption?.text)?.key ?? 'A'

    return {
      id: (q as any).id || (q as any).question || crypto.randomUUID(),
      question: q.question,
      category: q.category,
      options: remappedOptions,
      correct: newCorrectKey,
      explanation: q.explanation,
    }
  })
}

// =========================================================================
// 1. AUTOMATIC 1V1 MATCHMAKING (ATOMIC TRANSACTION & CROSS-DEVICE SYNC)
// =========================================================================

export async function joinMatchmakingQueue(
  user: { uid: string; displayName?: string | null; photoURL?: string | null },
  profile?: { level?: number; district?: string },
  matchAttemptId: string = crypto.randomUUID(),
): Promise<string> {
  if (!user || !user.uid) {
    throw new Error('Identificador de jogador ausente.')
  }

  const now = Date.now()
  const playerLevel = profile?.level || 1
  console.log('[MATCH QUEUE JOINED]', user.uid, 'Nome:', user.displayName, 'Nível:', playerLevel, 'Attempt:', matchAttemptId)

  const ticketRef = doc(db, 'duelQueue', user.uid)

  const ticketData: MatchmakingTicket = {
    userId: user.uid,
    displayName: (profile as any)?.displayName || user.displayName || 'Jogador',
    photoURL: user.photoURL || null,
    level: playerLevel,
    district: profile?.district || 'Portugal',
    status: 'searching',
    matchAttemptId,
    joinedAt: now,
    lastHeartbeat: now,
    expiresAt: now + 60_000,
    duelId: null,
    opponentInfo: null,
    matchedAt: null,
  }

  await setDoc(ticketRef, ticketData)
  console.log('[MATCH] QUEUE CREATED IN FIRESTORE:', user.uid)
  return matchAttemptId
}

export async function heartbeatMatchmaking(
  userUid: string,
  matchAttemptId: string,
): Promise<void> {
  if (!userUid || !matchAttemptId) return
  try {
    const ticketRef = doc(db, 'duelQueue', userUid)
    const snap = await getDoc(ticketRef)
    if (snap.exists()) {
      const data = snap.data() as MatchmakingTicket
      // Se não pertencer a esta tentativa ou já estiver emparelhado, não alterar
      if (data.matchAttemptId !== matchAttemptId || data.status === 'matched') {
        return
      }
      const now = Date.now()
      await updateDoc(ticketRef, {
        lastHeartbeat: now,
        expiresAt: now + 60_000,
      })
    }
  } catch {
    // Ticket pode já ter sido transicionado ou removido
  }
}

export async function cancelMatchmakingQueue(userUid: string): Promise<void> {
  if (!userUid) return
  try {
    const ticketRef = doc(db, 'duelQueue', userUid)
    await deleteDoc(ticketRef)
    console.log('[MATCH] QUEUE REMOVED / CANCELLED:', userUid)
  } catch (err) {
    console.error('Erro ao cancelar fila de matchmaking:', err)
  }
}

export async function cleanMatchmakingQueue(userUid: string): Promise<void> {
  if (!userUid) return
  try {
    const ticketRef = doc(db, 'duelQueue', userUid)
    await deleteDoc(ticketRef)
  } catch {
    // Ignore
  }
}

/**
 * Realtime listener for the player's matchmaking ticket in duelQueue/{userUid}.
 */
export function subscribeToMatchmaking(
  userUid: string,
  currentMatchAttemptId: string,
  onTicketUpdate: (ticket: MatchmakingTicket | null) => void,
): Unsubscribe {
  if (!userUid) {
    return () => {}
  }

  let isSubscribed = true
  const ticketRef = doc(db, 'duelQueue', userUid)

  console.log('[MATCH] LISTENER ATIVO PARA:', userUid, 'Attempt:', currentMatchAttemptId)

  const unsubQueue = onSnapshot(
    ticketRef,
    (snap) => {
      if (!isSubscribed) return
      if (snap.exists()) {
        const ticketData = snap.data() as MatchmakingTicket
        if (
          ticketData.userId === userUid &&
          ticketData.status === 'matched' &&
          ticketData.duelId &&
          ticketData.opponentInfo &&
          ticketData.opponentInfo.displayName
        ) {
          console.log('[MATCH OPPONENT FOUND VIA SNAPSHOT] duelId:', ticketData.duelId, 'Adversário:', ticketData.opponentInfo.displayName)
          onTicketUpdate(ticketData)
        }
      }
    },
    (err) => {
      console.warn('[MATCH] QUEUE LISTENER ERROR:', err)
    },
  )

  return () => {
    isSubscribed = false
    unsubQueue()
  }
}

/**
 * Searches for an active opponent in duelQueue and pairs them atomically in Firestore.
 * - Fault-tolerant candidate selection (immune to device clock skew).
 * - Atomic ACID transaction ensures no race conditions when 2 players search simultaneously.
 */
export async function tryFindOpponentMatch(
  user: { uid: string; displayName?: string | null; photoURL?: string | null },
  profile?: { level?: number; district?: string },
  myMatchAttemptId?: string,
): Promise<MatchmakingResult> {
  if (!user || !user.uid || !myMatchAttemptId) return { matched: false }

  const myLevel = profile?.level || 1
  const now = Date.now()

  try {
    const selfTicketRef = doc(db, 'duelQueue', user.uid)

    // 1. Verificar se já fomos emparelhados previamente nesta tentativa atual
    const selfSnap = await getDoc(selfTicketRef)
    if (selfSnap.exists()) {
      const selfData = selfSnap.data() as MatchmakingTicket
      if (
        selfData.userId === user.uid &&
        selfData.status === 'matched' &&
        selfData.duelId &&
        selfData.opponentInfo
      ) {
        console.log('[MATCH ALREADY FOUND FOR SELF]:', selfData.duelId, 'Adversário:', selfData.opponentInfo.displayName)
        return {
          matched: true,
          duelId: selfData.duelId,
          opponentInfo: selfData.opponentInfo,
          ticket: selfData,
        }
      }
      if (selfData.status !== 'searching') {
        return { matched: false }
      }
    } else {
      return { matched: false }
    }

    // 2. Consultar candidatos ativos na fila com status 'searching'
    const q = query(
      collection(db, 'duelQueue'),
      where('status', '==', 'searching'),
    )
    const snapshot = await getDocs(q)

    const candidates: MatchmakingTicket[] = []
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as MatchmakingTicket

      // Ignorar meu próprio ticket
      if (!data.userId || data.userId === user.uid) continue

      // Limpeza passiva apenas de bilhetes mortos/antigos (> 2 minutos)
      if (
        (typeof data.expiresAt === 'number' && data.expiresAt < now - 90_000) ||
        (typeof data.lastHeartbeat === 'number' && data.lastHeartbeat < now - 90_000)
      ) {
        deleteDoc(docSnap.ref).catch(() => {})
        continue
      }

      // Candidato ativo na fila:
      // Status 'searching' e ticket recente (ativo nos últimos 60 segundos)
      const isAlive =
        (typeof data.expiresAt === 'number' && data.expiresAt > now - 20_000) ||
        (typeof data.lastHeartbeat === 'number' && data.lastHeartbeat > now - 60_000) ||
        (typeof data.joinedAt === 'number' && data.joinedAt > now - 60_000)

      if (data.status === 'searching' && data.matchAttemptId && isAlive) {
        candidates.push(data)
      }
    }

    // Se não há outro jogador ativo, aguardar na fila
    if (candidates.length === 0) {
      return { matched: false }
    }

    // 3. Ordenar candidatos por proximidade de nível e tempo de espera
    candidates.sort((a, b) => {
      const levelDiff = Math.abs(a.level - myLevel) - Math.abs(b.level - myLevel)
      if (levelDiff !== 0) return levelDiff
      return a.joinedAt - b.joinedAt
    })
    const candidate = candidates[0]

    console.log('[MATCH OPPONENT FOUND IN QUEUE]:', candidate.displayName, 'UID:', candidate.userId, 'Level:', candidate.level)

    // 4. Executar transação ACID atómica no Firestore para emparelhar ambos os jogadores
    const candidateTicketRef = doc(db, 'duelQueue', candidate.userId)
    const duelId = `duel_${crypto.randomUUID()}`
    const duelRef = doc(db, 'duels', duelId)

    const questions = generateDuelQuestions(10)
    const code = generateDuelCode()
    const expiresAt = now + 15 * 60 * 1000
    const duelStartedAt = now + 3500
    const firstDeadline = duelStartedAt + 60_000

    const playerA: DuelPlayerData = {
      uid: candidate.userId,
      displayName: candidate.displayName || 'Adversário',
      photoURL: candidate.photoURL || null,
      level: candidate.level || 1,
      district: candidate.district || 'Portugal',
      score: 0,
      correctCount: 0,
      currentQuestionIndex: 0,
      questionStartedAt: duelStartedAt,
      questionDeadline: firstDeadline,
      answers: [],
      finished: false,
      finishedAt: null,
    }

    const playerB: DuelPlayerData = {
      uid: user.uid,
      displayName: (profile as any)?.displayName || user.displayName || 'Jogador',
      photoURL: user.photoURL || null,
      level: profile?.level || 1,
      district: profile?.district || 'Portugal',
      score: 0,
      correctCount: 0,
      currentQuestionIndex: 0,
      questionStartedAt: duelStartedAt,
      questionDeadline: firstDeadline,
      answers: [],
      finished: false,
      finishedAt: null,
    }

    const duelDoc: DuelDocument = {
      id: duelId,
      code,
      status: 'matched',
      playerUids: [candidate.userId, user.uid],
      matchAttemptA: candidate.matchAttemptId,
      matchAttemptB: myMatchAttemptId,
      createdAt: now,
      startedAt: duelStartedAt,
      expiresAt,
      playerA,
      playerB,
      questions,
      winnerUid: null,
      winnerReason: null,
      rewardsClaimed: {},
    }

    const result = await runTransaction(db, async (transaction) => {
      const myDoc = await transaction.get(selfTicketRef)
      const candDoc = await transaction.get(candidateTicketRef)

      if (!myDoc.exists()) {
        return { matched: false }
      }

      const myData = myDoc.data() as MatchmakingTicket
      // Se nós já fomos emparelhados noutra transação concorrente
      if (
        myData.userId === user.uid &&
        myData.status === 'matched' &&
        myData.duelId &&
        myData.opponentInfo
      ) {
        return {
          matched: true,
          duelId: myData.duelId,
          opponentInfo: myData.opponentInfo,
          ticket: myData,
        }
      }

      if (myData.status !== 'searching') {
        return { matched: false }
      }

      if (!candDoc.exists()) {
        return { matched: false }
      }

      const candData = candDoc.data() as MatchmakingTicket
      // Validar que o candidato ainda está searching
      if (
        candData.userId === user.uid ||
        candData.status !== 'searching' ||
        !candData.matchAttemptId
      ) {
        return { matched: false }
      }

      // Ambos estão confirmadamente à procura: Criar a sala e atualizar ambos os bilhetes!
      transaction.set(duelRef, duelDoc)

      const myOpponentInfo = {
        displayName: playerA.displayName,
        photoURL: playerA.photoURL,
        level: playerA.level,
        district: playerA.district,
      }

      const candOpponentInfo = {
        displayName: playerB.displayName,
        photoURL: playerB.photoURL,
        level: playerB.level,
        district: playerB.district,
      }

      transaction.set(
        selfTicketRef,
        {
          ...myData,
          status: 'matched',
          duelId,
          opponentInfo: myOpponentInfo,
          matchedAt: now,
        },
        { merge: true },
      )

      transaction.set(
        candidateTicketRef,
        {
          ...candData,
          status: 'matched',
          duelId,
          opponentInfo: candOpponentInfo,
          matchedAt: now,
        },
        { merge: true },
      )

      return {
        matched: true,
        duelId,
        opponentInfo: myOpponentInfo,
        ticket: {
          ...myData,
          status: 'matched' as const,
          duelId,
          opponentInfo: myOpponentInfo,
          matchedAt: now,
        },
      }
    })

    if (result.matched && result.duelId) {
      console.log('[MATCH ROOM CREATED & ATOMICALLY PAIRED] duelId:', result.duelId)
      return result
    }

    return { matched: false }
  } catch (err) {
    console.error('[MATCH] ERRO NA TRANSAÇÃO DE MATCHMAKING:', err)
    return { matched: false }
  }
}


// =========================================================================
// 2. ROOM & CODE CREATION (SECONDARY FRIEND DUEL)
// =========================================================================

export async function createDuel(
  user: { uid: string; displayName?: string | null; photoURL?: string | null },
  profile?: { level?: number; district?: string },
): Promise<{ duelId: string; code: string }> {
  if (!user || !user.uid) {
    throw new Error('Identificador de jogador ausente.')
  }

  const duelId = `duel_${crypto.randomUUID()}`
  const code = generateDuelCode()
  const now = Date.now()
  const expiresAt = now + 15 * 60 * 1000

  const questions = generateDuelQuestions(10)

  const playerA: DuelPlayerData = {
    uid: user.uid,
    displayName: (profile as any)?.displayName || user.displayName || 'Jogador A',
    photoURL: user.photoURL || null,
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
    expiresAt,
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

  const playerB: DuelPlayerData = {
    uid: user.uid,
    displayName: (profile as any)?.displayName || user.displayName || 'Jogador B',
    photoURL: user.photoURL || null,
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
    let winnerReason: 'score' | 'draw' | 'abandon' | null = duel.winnerReason || null
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
    const coinReward = isWinner ? 100 : isDraw ? 50 : 30

    const userSnap = await transaction.get(userRef)
    const userData = userSnap.exists() ? userSnap.data() : {}
    const currentXp = typeof userData.xp === 'number' ? userData.xp : 0
    const currentEuros = typeof userData.euros === 'number' ? userData.euros : 100
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
    const newTotalEuros = currentEuros + coinReward
    const levelProgress = calculateLevelProgress(newTotalXp)
    const newLevel = levelProgress.currentLevel.level
    const leveledUp = newLevel > oldLevel

    if (userSnap.exists()) {
      transaction.update(userRef, {
        xp: newTotalXp,
        euros: newTotalEuros,
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




