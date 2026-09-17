/**
 * Acorda Portugal — Serviço Oficial de Histórico Anti-Repetição Global de Perguntas
 * 
 * Regra Principal:
 * UMA PERGUNTA QUE O UTILIZADOR JÁ RESPONDEU NÃO PODE VOLTAR A SER APRESENTADA
 * ENQUANTO EXISTIREM PERGUNTAS ELEGÍVEIS QUE ELE AINDA NÃO RESPONDEU.
 * 
 * Persistência:
 * - Coleção de 1º nível: userQuestionHistory/{userId}
 * - Partição em subcoleção: userQuestionHistory/{userId}/chunks/chunk_{N} (até 2.000 IDs por chunk)
 * - Cache local síncrona (LocalStorage + In-Memory) para carregamento instantâneo a 0ms
 * - Controlo de concorrência: reserva de perguntas em partidas ativas (activeReservedIds)
 * - Migração transparente de dados legados (users/{userId}.answeredQuestionIds) sem perda de progresso
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
  arrayUnion,
  increment,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface UserHistoryState {
  seenSet: Set<string>
  recentOrder: string[]
  activeReservedIds: string[]
  totalAnswered: number
  loadedFromCloud: boolean
}

const CHUNK_SIZE = 2000
const MAX_RECENT_ORDER = 200
const RESERVATION_TTL_MS = 15 * 60 * 1000 // 15 minutos

// Memória em runtime (Isolada por userId, funciona em SSR, Node, Testes e Browser)
const memorySeenSets = new Map<string, Set<string>>()
const memoryRecentOrders = new Map<string, string[]>()
const memoryReservedSets = new Map<string, Set<string>>()
const memoryTotalAnswered = new Map<string, number>()
const inFlightHistoryFetches = new Map<string, Promise<UserHistoryState>>()

/**
 * Obtém a chave de localStorage para a cache rápida do utilizador
 */
export function getUserHistoryStorageKey(userId?: string): string {
  if (userId && !userId.startsWith('guest_') && userId.trim() !== '') {
    return 'ap_user_history_' + userId.trim()
  }
  return 'ap_guest_history'
}

/**
 * Lê a cache local (LocalStorage) sincronizada do utilizador
 */
function readLocalCache(userId?: string): { ids: string[]; recentOrder: string[]; reservedIds: string[] } {
  if (typeof window === 'undefined') {
    return { ids: [], recentOrder: [], reservedIds: [] }
  }

  const key = getUserHistoryStorageKey(userId)
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        const ids = Array.isArray(parsed.ids) ? parsed.ids.map(String).filter(Boolean) : []
        const recentOrder = Array.isArray(parsed.recentOrder) ? parsed.recentOrder.map(String).filter(Boolean) : ids.slice(0, MAX_RECENT_ORDER)
        const reservedIds = Array.isArray(parsed.reservedIds) ? parsed.reservedIds.map(String).filter(Boolean) : []
        return { ids, recentOrder, reservedIds }
      }
    }
  } catch {}

  // Fallback para chave antiga se a nova não existir
  if (userId && !userId.startsWith('guest_')) {
    try {
      const legacyRaw = localStorage.getItem('ap_user_seen_qids_' + userId.trim())
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw)
        if (Array.isArray(parsed)) {
          const ids = parsed.map(String).filter(Boolean)
          return { ids, recentOrder: ids.slice(0, MAX_RECENT_ORDER), reservedIds: [] }
        }
      }
    } catch {}
  }

  return { ids: [], recentOrder: [], reservedIds: [] }
}

/**
 * Escreve a cache local de forma atómica e segura
 */
function writeLocalCache(userId: string | undefined, ids: string[], recentOrder: string[], reservedIds: string[] = []): void {
  if (typeof window === 'undefined') return
  const key = getUserHistoryStorageKey(userId)
  try {
    const payload = {
      ids,
      recentOrder: recentOrder.slice(0, MAX_RECENT_ORDER),
      reservedIds,
      updatedAt: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(payload))
    // Manter sincronizado com a chave legada para máxima compatibilidade
    if (userId && !userId.startsWith('guest_')) {
      localStorage.setItem('ap_user_seen_qids_' + userId.trim(), JSON.stringify(ids.slice(0, 5000)))
    }
  } catch (err) {
    console.warn('[question-history-service] Erro ao gravar cache local:', err)
  }
}

/**
 * Obtém imediatamente o estado do histórico a partir da cache rápida (0ms de latência)
 */
export function getLocalUserHistory(userId?: string): UserHistoryState {
  const effectiveId = userId || 'guest'
  let inMemSet = memorySeenSets.get(effectiveId)
  let inMemRecent = memoryRecentOrders.get(effectiveId)
  let inMemReserved = memoryReservedSets.get(effectiveId)
  let inMemTotal = memoryTotalAnswered.get(effectiveId)

  if (!inMemSet || !inMemRecent) {
    const cached = readLocalCache(userId)
    inMemSet = new Set(cached.ids)
    inMemRecent = cached.recentOrder
    inMemReserved = new Set(cached.reservedIds)
    inMemTotal = inMemSet.size

    memorySeenSets.set(effectiveId, inMemSet)
    memoryRecentOrders.set(effectiveId, inMemRecent)
    memoryReservedSets.set(effectiveId, inMemReserved)
    memoryTotalAnswered.set(effectiveId, inMemTotal)
  }

  return {
    seenSet: new Set(inMemSet),
    recentOrder: [...inMemRecent],
    activeReservedIds: inMemReserved ? Array.from(inMemReserved) : [],
    totalAnswered: inMemTotal || inMemSet.size,
    loadedFromCloud: false,
  }
}

/**
 * Carrega e sincroniza o histórico completo da nuvem (Firestore) para a conta do jogador.
 * Executa particionamento em chunks e migração automática de dados legados se necessário.
 */
export async function fetchUserQuestionHistory(
  userId?: string,
  options: { forceRefresh?: boolean; cloudAnsweredIds?: string[] } = {}
): Promise<UserHistoryState> {
  if (!userId || userId.startsWith('guest_') || userId.trim() === '') {
    return getLocalUserHistory(userId)
  }

  const cleanUserId = userId.trim()

  // Evitar chamadas concorrentes duplicadas à nuvem para o mesmo utilizador
  if (!options.forceRefresh && inFlightHistoryFetches.has(cleanUserId)) {
    return inFlightHistoryFetches.get(cleanUserId)!
  }

  const fetchPromise = (async (): Promise<UserHistoryState> => {
    // 1. Iniciar com a cache local rápida
    const local = getLocalUserHistory(cleanUserId)
    const combinedSet = new Set<string>(local.seenSet)
    let recentOrder = [...local.recentOrder]
    let activeReservedIds: string[] = []
    let totalAnswered = local.totalAnswered

    // Se já foram passados IDs em memória (ex: do perfil inicial), fundir preventivamente
    if (Array.isArray(options.cloudAnsweredIds)) {
      for (const id of options.cloudAnsweredIds) {
        if (id) combinedSet.add(String(id))
      }
    }

    try {
      // 2. Consultar documento raiz userQuestionHistory/{userId}
      const historyDocRef = doc(db, 'userQuestionHistory', cleanUserId)
      const historySnap = await getDoc(historyDocRef)

      let activeChunkIndex = 0
      let migratedLegacy = false

      if (historySnap.exists()) {
        const data = historySnap.data() || {}
        activeChunkIndex = typeof data.activeChunkIndex === 'number' ? data.activeChunkIndex : 0
        migratedLegacy = Boolean(data.migratedLegacy)
        totalAnswered = typeof data.totalAnswered === 'number' ? data.totalAnswered : combinedSet.size

        if (Array.isArray(data.recentOrder) && data.recentOrder.length > 0) {
          recentOrder = Array.from(new Set([...data.recentOrder, ...recentOrder])).slice(0, MAX_RECENT_ORDER)
        }

        // Verificar reservas ativas não expiradas
        const reservedAt = typeof data.activeReservedAt === 'number' ? data.activeReservedAt : 0
        const isReservedExpired = Date.now() - reservedAt > RESERVATION_TTL_MS
        if (!isReservedExpired && Array.isArray(data.activeReservedIds)) {
          activeReservedIds = data.activeReservedIds.map(String).filter(Boolean)
        }

        // Ler todos os chunks da subcoleção userQuestionHistory/{userId}/chunks
        const chunksCollectionRef = collection(db, 'userQuestionHistory', cleanUserId, 'chunks')
        const chunksSnap = await getDocs(chunksCollectionRef)

        chunksSnap.forEach((chunkDoc) => {
          const cData = chunkDoc.data()
          if (Array.isArray(cData.ids)) {
            for (const qId of cData.ids) {
              if (qId) combinedSet.add(String(qId))
            }
          }
        })
      }

      // 3. Migração de dados legados de users/{userId}.answeredQuestionIds (se ainda não migrado)
      if (!migratedLegacy) {
        try {
          const userDocRef = doc(db, 'users', cleanUserId)
          const userSnap = await getDoc(userDocRef)
          if (userSnap.exists()) {
            const uData = userSnap.data() || {}
            const legacyIds: string[] = Array.isArray(uData.answeredQuestionIds)
              ? uData.answeredQuestionIds.map(String).filter(Boolean)
              : []

            if (legacyIds.length > 0) {
              for (const id of legacyIds) {
                combinedSet.add(id)
              }
              // Registar chunk inicial migrado
              const chunk0Ref = doc(db, 'userQuestionHistory', cleanUserId, 'chunks', 'chunk_0')
              const initialChunkIds = Array.from(combinedSet).slice(0, CHUNK_SIZE)

              await setDoc(chunk0Ref, {
                chunkIndex: 0,
                ids: initialChunkIds,
                updatedAt: serverTimestamp(),
              }, { merge: true })
            }
          }

          // Inicializar / atualizar raiz com indicação de migração concluída
          await setDoc(historyDocRef, {
            userId: cleanUserId,
            totalAnswered: combinedSet.size,
            recentOrder: Array.from(new Set([...recentOrder, ...Array.from(combinedSet)])).slice(0, MAX_RECENT_ORDER),
            activeChunkIndex: 0,
            migratedLegacy: true,
            updatedAt: serverTimestamp(),
          }, { merge: true })
        } catch (migErr) {
          console.warn('[question-history-service] Aviso na migração de histórico legado:', migErr)
        }
      }

      // Se recentOrder estiver vazio mas houver perguntas vistas, preencher
      if (recentOrder.length === 0 && combinedSet.size > 0) {
        recentOrder = Array.from(combinedSet).slice(0, MAX_RECENT_ORDER)
      }

      totalAnswered = Math.max(totalAnswered, combinedSet.size)

      // 4. Atualizar memórias e cache local
      const allIds = Array.from(combinedSet)
      memorySeenSets.set(cleanUserId, combinedSet)
      memoryRecentOrders.set(cleanUserId, recentOrder)
      memoryReservedSets.set(cleanUserId, new Set(activeReservedIds))
      memoryTotalAnswered.set(cleanUserId, totalAnswered)

      writeLocalCache(cleanUserId, allIds, recentOrder, activeReservedIds)

      return {
        seenSet: combinedSet,
        recentOrder,
        activeReservedIds,
        totalAnswered,
        loadedFromCloud: true,
      }
    } catch (cloudErr) {
      console.warn('[question-history-service] Erro ao sincronizar com Firestore, a usar cache local:', cloudErr)
      return {
        seenSet: combinedSet,
        recentOrder,
        activeReservedIds,
        totalAnswered: combinedSet.size,
        loadedFromCloud: false,
      }
    } finally {
      inFlightHistoryFetches.delete(cleanUserId)
    }
  })()

  inFlightHistoryFetches.set(cleanUserId, fetchPromise)
  return fetchPromise
}

/**
 * REGISTA NO MOMENTO CERTO (REGRA 11):
 * Regista uma pergunta que foi EFETIVAMENTE apresentada e consumida pelo jogador
 * (seja por resposta, escolha ou expiração do cronómetro).
 */
export async function recordQuestionPresentedAndAnswered(
  userId: string | undefined,
  questionId: string
): Promise<void> {
  if (!questionId) return
  const cleanQid = String(questionId).trim()
  if (!cleanQid) return

  const effectiveUserId = (userId && !userId.startsWith('guest_')) ? userId.trim() : 'guest'

  // 1. Atualização em Memória Imediata (0ms)
  let seenSet = memorySeenSets.get(effectiveUserId)
  if (!seenSet) {
    seenSet = new Set<string>()
    memorySeenSets.set(effectiveUserId, seenSet)
  }
  seenSet.add(cleanQid)

  let recentOrder = memoryRecentOrders.get(effectiveUserId) || []
  recentOrder = [cleanQid, ...recentOrder.filter((id) => id !== cleanQid)].slice(0, MAX_RECENT_ORDER)
  memoryRecentOrders.set(effectiveUserId, recentOrder)

  let reserved = memoryReservedSets.get(effectiveUserId)
  if (reserved) {
    reserved.delete(cleanQid)
  }

  const total = seenSet.size
  memoryTotalAnswered.set(effectiveUserId, total)

  // 2. Atualização em Cache Local (0ms)
  writeLocalCache(
    effectiveUserId,
    Array.from(seenSet),
    recentOrder,
    reserved ? Array.from(reserved) : []
  )

  // 3. Persistência em Nuvem (Assíncrona no Firestore, não bloqueia o fluxo de UI)
  if (effectiveUserId !== 'guest') {
    void (async () => {
      try {
        const historyDocRef = doc(db, 'userQuestionHistory', effectiveUserId)
        const historySnap = await getDoc(historyDocRef)

        let activeChunkIndex = 0
        if (historySnap.exists()) {
          const data = historySnap.data() || {}
          activeChunkIndex = typeof data.activeChunkIndex === 'number' ? data.activeChunkIndex : 0
        }

        const chunkRef = doc(db, 'userQuestionHistory', effectiveUserId, 'chunks', 'chunk_' + activeChunkIndex)
        
        // Atualiza chunk
        await setDoc(
          chunkRef,
          {
            chunkIndex: activeChunkIndex,
            ids: arrayUnion(cleanQid),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )

        // Atualiza documento raiz
        await setDoc(
          historyDocRef,
          {
            userId: effectiveUserId,
            totalAnswered: increment(1),
            recentOrder,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )

        // Atualiza documento legado de perfil em segundo plano para compatibilidade retroativa
        try {
          const userDocRef = doc(db, 'users', effectiveUserId)
          await updateDoc(userDocRef, {
            answeredQuestionIds: arrayUnion(cleanQid),
            updatedAt: serverTimestamp(),
          })
        } catch {}
      } catch (err) {
        console.warn('[question-history-service] Erro assíncrono ao gravar pergunta respondida no Firestore:', err)
      }
    })()
  }
}

/**
 * Regista um lote de perguntas respondidas (ex: no final da partida ou testes)
 */
export async function recordQuestionBatchAnswered(
  userId: string | undefined,
  questionIds: string[]
): Promise<void> {
  if (!Array.isArray(questionIds) || questionIds.length === 0) return
  for (const qid of questionIds) {
    await recordQuestionPresentedAndAnswered(userId, qid)
  }
}

/**
 * CONCORRÊNCIA E RESERVA (REGRA 12):
 * Reserva as perguntas de uma partida ativa para impedir que outra aba/sessão
 * do mesmo jogador selecione as mesmas perguntas em simultâneo.
 */
export async function reserveQuestionsForMatch(
  userId: string | undefined,
  matchId: string,
  questionIds: string[]
): Promise<void> {
  if (!userId || userId.startsWith('guest_') || !Array.isArray(questionIds) || questionIds.length === 0) return
  const cleanUserId = userId.trim()
  const cleanIds = questionIds.map(String).filter(Boolean)

  let reserved = memoryReservedSets.get(cleanUserId)
  if (!reserved) {
    reserved = new Set<string>()
    memoryReservedSets.set(cleanUserId, reserved)
  }
  for (const id of cleanIds) {
    reserved.add(id)
  }

  const seenSet = memorySeenSets.get(cleanUserId) || new Set<string>()
  const recentOrder = memoryRecentOrders.get(cleanUserId) || []

  writeLocalCache(cleanUserId, Array.from(seenSet), recentOrder, Array.from(reserved))

  try {
    const historyDocRef = doc(db, 'userQuestionHistory', cleanUserId)
    await setDoc(
      historyDocRef,
      {
        activeReservedIds: Array.from(reserved),
        activeReservedAt: Date.now(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (err) {
    console.warn('[question-history-service] Erro ao reservar perguntas da partida:', err)
  }
}

/**
 * ABANDONO DE PARTIDA (REGRA 11 & 12):
 * Liberta as perguntas que NÃO foram apresentadas ao jogador.
 * Desta forma, mantêm-se 100% elegíveis para partidas futuras!
 */
export async function releaseUnusedQuestionsFromMatch(
  userId: string | undefined,
  matchId: string,
  unpresentedIds: string[]
): Promise<void> {
  if (!userId || userId.startsWith('guest_') || !Array.isArray(unpresentedIds) || unpresentedIds.length === 0) return
  const cleanUserId = userId.trim()
  const cleanUnused = new Set(unpresentedIds.map(String).filter(Boolean))

  const reserved = memoryReservedSets.get(cleanUserId)
  if (reserved) {
    for (const id of cleanUnused) {
      reserved.delete(id)
    }
  }

  const seenSet = memorySeenSets.get(cleanUserId) || new Set<string>()
  const recentOrder = memoryRecentOrders.get(cleanUserId) || []

  writeLocalCache(cleanUserId, Array.from(seenSet), recentOrder, reserved ? Array.from(reserved) : [])

  try {
    const historyDocRef = doc(db, 'userQuestionHistory', cleanUserId)
    await setDoc(
      historyDocRef,
      {
        activeReservedIds: reserved ? Array.from(reserved) : [],
        activeReservedAt: Date.now(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (err) {
    console.warn('[question-history-service] Erro ao libertar perguntas não apresentadas:', err)
  }
}

/**
 * Limpa o histórico em memória (essencial para testes automatizados limpos)
 */
export function clearAllMemoryHistories(): void {
  memorySeenSets.clear()
  memoryRecentOrders.clear()
  memoryReservedSets.clear()
  memoryTotalAnswered.clear()
  inFlightHistoryFetches.clear()
}
