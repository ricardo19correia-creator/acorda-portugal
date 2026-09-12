'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { doc, getDoc, updateDoc, setDoc, increment, onSnapshot, serverTimestamp, collection } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import {
  type AidType,
  type UserAidStock,
  CANONICAL_AIDS,
  getUserAidStock,
  consumeGameAid,
  syncAidStockToLocalStorage,
} from '@/lib/aid-service'
import { calculate5050Eliminated, simulatePublicVote, generateQuestionClue } from '@/lib/powerup-helpers'

export interface UseGameAidsOptions {
  gameMode: 'solo' | 'duel' | '1v1'
  duelId?: string
  currentQuestion?: {
    id?: string | number
    question?: string
    prompt?: string
    options: { key: string; text: string }[] | any[]
    correct: string
    explanation?: string
    category?: string
  } | null
  disabled?: boolean
  onFreezeApplied?: (bonusSeconds: number) => void
  onOptionEliminated?: (eliminated: ('A' | 'B' | 'C' | 'D')[]) => void
  onPublicVoteReceived?: (distribution: number[]) => void
  onClueReceived?: (clue: string) => void
}

export function useGameAids({
  gameMode,
  duelId,
  currentQuestion,
  disabled = false,
  onFreezeApplied,
  onOptionEliminated,
  onPublicVoteReceived,
  onClueReceived,
}: UseGameAidsOptions) {
  const { user, profile, updateProfileLocally } = useAuth()
  const effectiveUid = user?.uid || ''
  const isGuest = !user?.uid

  // 1. Estado Unificado de Stocks (SSOT com inventário real do jogador)
  const [stocks, setStocks] = useState<UserAidStock>(() => {
    if (isGuest) {
      return { stockHint: 0, stock5050: 0, stockFreeze: 0, stockPublicVote: 0 }
    }
    return getUserAidStock(profile, profile?.inventory as any)
  })

  // 2. Estado de Efeitos Ativos na Pergunta Atual (100% Individual para este Jogador)
  const [eliminatedOptions, setEliminatedOptions] = useState<('A' | 'B' | 'C' | 'D')[]>([])
  const [publicVoteResults, setPublicVoteResults] = useState<number[] | null>(null)
  const [activeClue, setActiveClue] = useState<string | null>(null)
  const [isFrozen, setIsFrozen] = useState(false)
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(0)

  // 3. Estado de UI & Proteção Anti-Double-Click
  const [selectedPreviewAid, setSelectedPreviewAid] = useState<AidType | null>(null)
  const [isHelpProcessing, setIsHelpProcessing] = useState(false)
  const [aidToast, setAidToast] = useState<string | null>(null)
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Sincronização reativa, robusta e autoritativa com Firestore, Subcoleções e API da Loja
  useEffect(() => {
    let isMounted = true

    const sync = () => {
      const inv: Record<string, any> = (profile as any)?.inventory || {}
      const base = getUserAidStock(profile, inv)
      setStocks((prev) => ({
        ...prev,
        stock5050: Math.max(prev.stock5050, base.stock5050),
        stockFreeze: Math.max(prev.stockFreeze, base.stockFreeze),
        stockPublicVote: Math.max(prev.stockPublicVote, base.stockPublicVote),
        stockHint: 0,
      }))
    }

    sync()

    if (!effectiveUid || isGuest) return

    // 1. Sincronização imediata com a rota autoritativa /api/shop/purchase (a mesma da Loja)
    const syncFromAuthoritativeApi = async () => {
      try {
        if (!auth?.currentUser) return
        const token = await auth.currentUser.getIdToken().catch(() => null)
        if (!token) return

        const res = await fetch('/api/shop/purchase', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        if (res.ok && isMounted) {
          const json = await res.json().catch(() => ({}))
          if (json.success && json.aids) {
            const api5050 = Number(json.aids['AID_002']?.stock ?? 0)
            const apiFreeze = Number(json.aids['AID_004']?.stock ?? 0)
            const apiPublic = Number(json.aids['AID_003']?.stock ?? 0)

            setStocks((prev) => {
              const updated = {
                ...prev,
                stock5050: Math.max(prev.stock5050, api5050),
                stockFreeze: Math.max(prev.stockFreeze, apiFreeze),
                stockPublicVote: Math.max(prev.stockPublicVote, apiPublic),
                stockHint: 0,
              }
              syncAidStockToLocalStorage(updated)
              return updated
            })
          }
        }
      } catch (err) {
        console.warn('[useGameAids] Erro ao sincronizar com /api/shop/purchase:', err)
      }
    }

    syncFromAuthoritativeApi()

    // 2. Leitura direta imediata do documento Firestore do utilizador
    getDoc(doc(db, 'users', effectiveUid))
      .then((snap) => {
        if (snap.exists() && isMounted) {
          const data = snap.data()
          const realStocks = getUserAidStock(data, data.inventory)
          setStocks((prev) => ({
            ...prev,
            stock5050: Math.max(prev.stock5050, realStocks.stock5050),
            stockFreeze: Math.max(prev.stockFreeze, realStocks.stockFreeze),
            stockPublicVote: Math.max(prev.stockPublicVote, realStocks.stockPublicVote),
            stockHint: 0,
          }))
        }
      })
      .catch((err) => {
        console.warn('[useGameAids] Erro ao carregar stocks reais do Firestore:', err)
      })

    // 3. Subscrição em tempo real ao documento raiz do utilizador
    const unsubDoc = onSnapshot(
      doc(db, 'users', effectiveUid),
      (snap) => {
        if (snap.exists() && isMounted) {
          const data = snap.data()
          const realStocks = getUserAidStock(data, data.inventory)
          setStocks((prev) => ({
            ...prev,
            stock5050: realStocks.stock5050,
            stockFreeze: realStocks.stockFreeze,
            stockPublicVote: realStocks.stockPublicVote,
            stockHint: 0,
          }))
        }
      },
      (err) => {
        console.warn('[useGameAids] Erro no listener de stocks Firestore:', err)
      },
    )

    // 4. Subscrição em tempo real à subcoleção aid_inventory
    let unsubSubcoll: (() => void) | undefined
    try {
      unsubSubcoll = onSnapshot(
        collection(db, 'users', effectiveUid, 'aid_inventory'),
        (snapshot) => {
          if (!isMounted) return
          let sub50 = 0
          let subFrz = 0
          let subPub = 0
          snapshot.forEach((docSnap) => {
            const id = docSnap.id
            const qty = Number(docSnap.data()?.quantity ?? docSnap.data()?.stock ?? docSnap.data()?.count ?? 0)
            if (id === 'AID_002' || id === 'aid_50_50' || id === 'help5050' || id === '5050') sub50 = Math.max(sub50, qty)
            if (id === 'AID_004' || id === 'aid_freeze_time' || id === 'freezeTime' || id === 'freeze') subFrz = Math.max(subFrz, qty)
            if (id === 'AID_003' || id === 'aid_public_vote' || id === 'publicVote') subPub = Math.max(subPub, qty)
          })
          if (snapshot.size > 0) {
            setStocks((prev) => {
              const updated = {
                ...prev,
                stock5050: sub50,
                stockFreeze: subFrz,
                stockPublicVote: subPub,
                stockHint: 0,
              }
              syncAidStockToLocalStorage(updated)
              return updated
            })
          }
        },
        () => {} // Fallback silencioso caso não existam documentos
      )
    } catch {}

    window.addEventListener('consumables_updated', sync)
    window.addEventListener('inventory_updated', sync)
    window.addEventListener('storage', sync)

    return () => {
      isMounted = false
      unsubDoc()
      if (unsubSubcoll) unsubSubcoll()
      window.removeEventListener('consumables_updated', sync)
      window.removeEventListener('inventory_updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [profile, effectiveUid, isGuest])

  // Temporizador do Congelamento de Tempo (+15s)
  useEffect(() => {
    if (!isFrozen || freezeTimeLeft <= 0) return

    const timer = setInterval(() => {
      setFreezeTimeLeft((prev) => {
        if (prev <= 1) {
          setIsFrozen(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isFrozen, freezeTimeLeft])

  // Limpeza de timer de Toast ao desmontar
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  // Disparar toast com auto-dispensação após 3 segundos
  const showAidToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setAidToast(message)
    toastTimerRef.current = setTimeout(() => {
      setAidToast(null)
      toastTimerRef.current = null
    }, 3200)
  }, [])

  // Reset de efeitos ao avançar de pergunta
  const resetQuestionAids = useCallback(() => {
    setEliminatedOptions([])
    setPublicVoteResults(null)
    setActiveClue(null)
    setIsFrozen(false)
    setFreezeTimeLeft(0)
    setSelectedPreviewAid(null)
    setIsHelpProcessing(false)
  }, [])

  // Abrir modal de pré-visualização da ajuda
  const requestPreview = useCallback(
    (aidType: AidType) => {
      if (!user?.uid || disabled || isHelpProcessing || !currentQuestion) return

      // Prevenir reabertura se a ajuda já foi gasta nesta pergunta
      if (aidType === 'hint' && activeClue !== null) return
      if (aidType === '5050' && eliminatedOptions.length > 0) return
      if (aidType === 'publicVote' && publicVoteResults !== null) return
      if (aidType === 'freeze' && isFrozen) return

      setSelectedPreviewAid(aidType)
    },
    [user?.uid, disabled, isHelpProcessing, currentQuestion, activeClue, eliminatedOptions, publicVoteResults, isFrozen],
  )

  // Fechar modal de pré-visualização
  const cancelPreview = useCallback(() => {
    if (!isHelpProcessing) {
      setSelectedPreviewAid(null)
    }
  }, [isHelpProcessing])

  // Execução Instantânea e Autoritativa da Ajuda (Com aplicação imediata no cliente + sync atómico no Firestore)
  const executeUseAid = useCallback(
    async (aidType: AidType): Promise<boolean> => {
      if (!user?.uid || !currentQuestion || disabled || isHelpProcessing) {
        return false
      }

      // Prevenir reativação na mesma pergunta
      if (aidType === 'hint' && activeClue !== null) return false
      if (aidType === '5050' && eliminatedOptions.length > 0) return false
      if (aidType === 'publicVote' && publicVoteResults !== null) return false
      if (aidType === 'freeze' && isFrozen) return false

      const aidMeta = CANONICAL_AIDS[aidType]
      const currentStock =
        aidType === '5050'
          ? stocks.stock5050
          : aidType === 'publicVote'
            ? stocks.stockPublicVote
            : aidType === 'freeze'
              ? stocks.stockFreeze
              : 0

      if (currentStock <= 0) {
        showAidToast(`⚠️ Sem unidades de «${aidMeta?.shortName || aidType}». Adquire na Loja!`)
        setSelectedPreviewAid(null)
        return false
      }

      // Fechar modal de pré-visualização se estiver aberto
      setSelectedPreviewAid(null)
      setIsHelpProcessing(true)

      try {
        // Normalizar opções e resposta correta com chave maiúscula garantida
        const normalizedOptions = Array.isArray(currentQuestion.options)
          ? currentQuestion.options.map((opt: any, idx: number) => {
              const defaultKey = (['A', 'B', 'C', 'D'][idx] || String(idx)) as 'A' | 'B' | 'C' | 'D'
              if (typeof opt === 'string') {
                return { key: defaultKey, text: opt }
              }
              return {
                key: String(opt.key || defaultKey).toUpperCase() as 'A' | 'B' | 'C' | 'D',
                text: String(opt.text || opt.label || opt || ''),
              }
            })
          : []

        const rawCorrect = String(currentQuestion.correct || 'A').toUpperCase()
        const normalizedCorrect = (['A', 'B', 'C', 'D'].includes(rawCorrect) ? rawCorrect : 'A') as
          | 'A'
          | 'B'
          | 'C'
          | 'D'

        const remainingStock = Math.max(0, currentStock - 1)

        // 1. Atualizar contadores de estoque locais imediatamente no hook
        setStocks((prev) => ({
          ...prev,
          ...(aidType === 'hint' && { stockHint: remainingStock, stockPista: remainingStock, stockClue: remainingStock }),
          ...(aidType === '5050' && { stock5050: remainingStock }),
          ...(aidType === 'publicVote' && { stockPublicVote: remainingStock }),
          ...(aidType === 'freeze' && { stockFreeze: remainingStock }),
        }))

        // 2. Atualizar perfil local imediatamente no AuthProvider
        if (typeof updateProfileLocally === 'function') {
          updateProfileLocally((prev) => {
            if (!prev) return prev
            const nextPowerUps = { ...((prev as any).powerUps || {}) }
            const nextConsumables = { ...((prev as any).consumables || {}) }
            const nextInventory = { ...((prev as any).inventory || {}) }
            const nextUtilities = { ...(nextInventory.utilities || {}) }

            if (aidType === 'hint') {
              nextPowerUps.hints = remainingStock
              nextPowerUps.hint = remainingStock
              nextPowerUps.dica = remainingStock
              nextPowerUps.pista = remainingStock
              nextConsumables.hints = remainingStock
              nextUtilities.hints = remainingStock
              nextInventory['AID_001'] = remainingStock
              nextInventory['aid_hint'] = remainingStock
              nextInventory['consumable_pista'] = remainingStock
              nextInventory['pista_historica'] = remainingStock
              nextInventory['ajuda_pista'] = remainingStock
              nextInventory['hint'] = remainingStock
            } else if (aidType === '5050') {
              nextPowerUps.fiftyFifty = remainingStock
              nextPowerUps.help5050 = remainingStock
              nextConsumables.help5050 = remainingStock
              nextUtilities.fiftyFifty = remainingStock
              nextInventory['AID_002'] = remainingStock
              nextInventory['aid_50_50'] = remainingStock
              nextInventory['consumable_50_50'] = remainingStock
              nextInventory['help5050'] = remainingStock
              nextInventory['ajuda_5050'] = remainingStock
            } else if (aidType === 'publicVote') {
              nextPowerUps.publicVote = remainingStock
              nextPowerUps.publico = remainingStock
              nextConsumables.publicVote = remainingStock
              nextUtilities.publicVote = remainingStock
              nextInventory['AID_003'] = remainingStock
              nextInventory['aid_public_vote'] = remainingStock
              nextInventory['consumable_public_vote'] = remainingStock
              nextInventory['HELP_005'] = remainingStock
              nextInventory['publicVote'] = remainingStock
              nextInventory['ajuda_publico'] = remainingStock
            } else if (aidType === 'freeze') {
              nextPowerUps.freezeTime = remainingStock
              nextPowerUps.freeze = remainingStock
              nextPowerUps.congelar = remainingStock
              nextConsumables.freezeTime = remainingStock
              nextUtilities.freezeTime = remainingStock
              nextInventory['AID_004'] = remainingStock
              nextInventory['aid_freeze_time'] = remainingStock
              nextInventory['consumable_congelar_tempo'] = remainingStock
              nextInventory['freezeTime'] = remainingStock
              nextInventory['ajuda_congelar'] = remainingStock
            }

            nextInventory.utilities = nextUtilities

            return {
              ...prev,
              powerUps: nextPowerUps,
              consumables: nextConsumables,
              inventory: nextInventory,
            }
          })
        }

        // 3. Atualizar localStorage imediatamente de forma passiva
        syncAidStockToLocalStorage({
          ...(aidType === 'hint' && { stockHint: remainingStock }),
          ...(aidType === '5050' && { stock5050: remainingStock }),
          ...(aidType === 'publicVote' && { stockPublicVote: remainingStock }),
          ...(aidType === 'freeze' && { stockFreeze: remainingStock }),
        })

        // 4. Aplicar o efeito visual e de gameplay DE IMEDIATO
        if (aidType === 'hint') {
          const clue = generateQuestionClue({
            question: currentQuestion.question || currentQuestion.prompt || '',
            explanation: currentQuestion.explanation,
            category: currentQuestion.category,
          })
          setActiveClue(clue)
          if (onClueReceived) onClueReceived(clue)
        } else if (aidType === '5050') {
          const eliminated = calculate5050Eliminated(normalizedOptions, normalizedCorrect)
          setEliminatedOptions(eliminated)
          if (onOptionEliminated) onOptionEliminated(eliminated)
        } else if (aidType === 'publicVote') {
          const correctIdx = Math.max(
            0,
            normalizedOptions.findIndex((o: any) => o.key === normalizedCorrect),
          )
          const percentages = simulatePublicVote(correctIdx)
          setPublicVoteResults(percentages)
          if (onPublicVoteReceived) onPublicVoteReceived(percentages)
        } else if (aidType === 'freeze') {
          setIsFrozen(true)
          setFreezeTimeLeft(15)
          if (onFreezeApplied) onFreezeApplied(15)
        }

        showAidToast(
          `💡 ${aidMeta?.shortName?.toUpperCase() || aidType} UTILIZADA — Restam ${remainingStock}`,
        )

        // 5. Persistência REAL E IMEDIATA no Firestore (Documento do Utilizador + Subcoleção aid_inventory)
        if (effectiveUid && !isGuest) {
          const userRef = doc(db, 'users', effectiveUid)
          const firestoreUpdates: Record<string, any> = {
            updatedAt: serverTimestamp(),
          }

          if (aidType === '5050') {
            firestoreUpdates['powerUps.fiftyFifty'] = remainingStock
            firestoreUpdates['powerUps.help5050'] = remainingStock
            firestoreUpdates['consumables.help5050'] = remainingStock
            firestoreUpdates['consumables.fiftyFifty'] = remainingStock
            firestoreUpdates['inventory.utilities.fiftyFifty'] = remainingStock
            firestoreUpdates['inventory.AID_002'] = remainingStock
            firestoreUpdates['inventory.aid_50_50'] = remainingStock
            firestoreUpdates['inventory.consumable_50_50'] = remainingStock
            firestoreUpdates['inventory.help5050'] = remainingStock
            firestoreUpdates['inventory.ajuda_5050'] = remainingStock
          } else if (aidType === 'publicVote') {
            firestoreUpdates['powerUps.publicVote'] = remainingStock
            firestoreUpdates['powerUps.publico'] = remainingStock
            firestoreUpdates['consumables.publicVote'] = remainingStock
            firestoreUpdates['consumables.publico'] = remainingStock
            firestoreUpdates['inventory.utilities.publicVote'] = remainingStock
            firestoreUpdates['inventory.AID_003'] = remainingStock
            firestoreUpdates['inventory.aid_public_vote'] = remainingStock
            firestoreUpdates['inventory.consumable_public_vote'] = remainingStock
            firestoreUpdates['inventory.HELP_005'] = remainingStock
            firestoreUpdates['inventory.publicVote'] = remainingStock
            firestoreUpdates['inventory.ajuda_publico'] = remainingStock
          } else if (aidType === 'freeze') {
            firestoreUpdates['powerUps.freezeTime'] = remainingStock
            firestoreUpdates['powerUps.freeze'] = remainingStock
            firestoreUpdates['powerUps.congelar'] = remainingStock
            firestoreUpdates['consumables.freezeTime'] = remainingStock
            firestoreUpdates['inventory.utilities.freezeTime'] = remainingStock
            firestoreUpdates['inventory.AID_004'] = remainingStock
            firestoreUpdates['inventory.aid_freeze_time'] = remainingStock
            firestoreUpdates['inventory.consumable_congelar_tempo'] = remainingStock
            firestoreUpdates['inventory.freezeTime'] = remainingStock
            firestoreUpdates['inventory.ajuda_congelar'] = remainingStock
          }

          updateDoc(userRef, firestoreUpdates).catch((fErr) => {
            console.warn('[useGameAids] Aviso ao atualizar Firestore imediatamente:', fErr)
          })

          // Atualizar também na subcoleção aid_inventory pelo ID canónico
          const aidCanonicalId = aidType === '5050' ? 'AID_002' : aidType === 'publicVote' ? 'AID_003' : 'AID_004'
          const aidDocRef = doc(db, 'users', effectiveUid, 'aid_inventory', aidCanonicalId)
          setDoc(
            aidDocRef,
            {
              userId: effectiveUid,
              aidId: aidCanonicalId,
              quantity: remainingStock,
              stock: remainingStock,
              count: remainingStock,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          ).catch((subErr) => {
            console.warn('[useGameAids] Aviso ao atualizar aid_inventory:', subErr)
          })
        }

        // 6. Sincronização secundária via API/serviço unificado (extensão de duelo, logging e subcoleções)
        if (effectiveUid) {
          consumeGameAid({
            userId: effectiveUid,
            aidType,
            gameMode,
            currentStock,
            questionData: {
              prompt: currentQuestion.question || currentQuestion.prompt || '',
              options: normalizedOptions,
              correct: normalizedCorrect,
              explanation: currentQuestion.explanation,
              category: currentQuestion.category,
            },
            duelId,
          })
            .then((res) => {
              if (res.success && typeof res.remainingStock === 'number') {
                // Reconciliar UI caso o servidor reporte stock atualizado
                setStocks((prev) => ({
                  ...prev,
                  ...(aidType === 'hint' && { stockHint: res.remainingStock, stockPista: res.remainingStock }),
                  ...(aidType === '5050' && { stock5050: res.remainingStock }),
                  ...(aidType === 'publicVote' && { stockPublicVote: res.remainingStock }),
                  ...(aidType === 'freeze' && { stockFreeze: res.remainingStock }),
                }))
              }
            })
            .catch((err) => {
              console.warn('[useGameAids] Erro na sincronização com Firestore:', err)
            })
        }

        return true
      } catch (err: any) {
        console.error('[useGameAids] Erro ao executar ajuda:', err)
        showAidToast('❌ Ocorreu um erro ao processar a ajuda.')
        return false
      } finally {
        setIsHelpProcessing(false)
      }
    },
    [
      currentQuestion,
      disabled,
      isHelpProcessing,
      activeClue,
      eliminatedOptions,
      publicVoteResults,
      isFrozen,
      stocks,
      showAidToast,
      onOptionEliminated,
      onPublicVoteReceived,
      onFreezeApplied,
      onClueReceived,
      effectiveUid,
      gameMode,
      duelId,
      updateProfileLocally,
    ],
  )

  // Consumo Autorizado via Modal (delegação transparente em executeUseAid)
  const confirmUseAid = useCallback(async (): Promise<boolean> => {
    if (!selectedPreviewAid) return false
    return executeUseAid(selectedPreviewAid)
  }, [selectedPreviewAid, executeUseAid])

  return {
    stocks,
    isHelpProcessing,
    eliminatedOptions,
    publicVoteResults,
    activeClue,
    isFrozen,
    freezeTimeLeft,
    selectedPreviewAid,
    aidToast,
    requestPreview,
    cancelPreview,
    executeUseAid,
    confirmUseAid,
    resetQuestionAids,
    setEliminatedOptions,
    setPublicVoteResults,
    setActiveClue,
    setIsFrozen,
  }
}
