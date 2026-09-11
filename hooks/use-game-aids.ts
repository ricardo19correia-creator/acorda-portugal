'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/components/auth-provider'
import {
  type AidType,
  type UserAidStock,
  CANONICAL_AIDS,
  getUserAidStock,
  consumeGameAid,
  syncAidStockToLocalStorage,
} from '@/lib/aid-service'
import { useConsumablePowerUp } from '@/lib/economy'
import { calculate5050Eliminated, simulatePublicVote } from '@/lib/powerup-helpers'

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
}

export function useGameAids({
  gameMode,
  duelId,
  currentQuestion,
  disabled = false,
  onFreezeApplied,
  onOptionEliminated,
  onPublicVoteReceived,
}: UseGameAidsOptions) {
  const { user, profile, updateProfileLocally } = useAuth()
  const effectiveUid = user?.uid || ''
  const isGuest = !user?.uid

  // 1. Estado Unificado de Stocks (SSOT com inventário real do jogador)
  const [stocks, setStocks] = useState<UserAidStock>(() => {
    if (isGuest) {
      return { stock5050: 0, stockFreeze: 0, stockPublicVote: 0 }
    }
    return getUserAidStock(profile, profile?.inventory as any)
  })

  // 2. Estado de Efeitos Ativos na Pergunta Atual (100% Individual para este Jogador)
  const [eliminatedOptions, setEliminatedOptions] = useState<('A' | 'B' | 'C' | 'D')[]>([])
  const [publicVoteResults, setPublicVoteResults] = useState<number[] | null>(null)
  const [isFrozen, setIsFrozen] = useState(false)
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(0)

  // 3. Estado de UI & Proteção Anti-Double-Click
  const [selectedPreviewAid, setSelectedPreviewAid] = useState<AidType | null>(null)
  const [isHelpProcessing, setIsHelpProcessing] = useState(false)
  const [aidToast, setAidToast] = useState<string | null>(null)
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Sincronização reativa de stocks em tempo real
  useEffect(() => {
    const sync = () => {
      const inv: Record<string, any> = (profile as any)?.inventory || {}
      const base = getUserAidStock(profile, inv)
      setStocks(base)
    }

    sync()
    window.addEventListener('consumables_updated', sync)
    window.addEventListener('inventory_updated', sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener('consumables_updated', sync)
      window.removeEventListener('inventory_updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [profile])

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
      if (aidType === '5050' && eliminatedOptions.length > 0) return
      if (aidType === 'publicVote' && publicVoteResults !== null) return
      if (aidType === 'freeze' && isFrozen) return

      setSelectedPreviewAid(aidType)
    },
    [user?.uid, disabled, isHelpProcessing, currentQuestion, eliminatedOptions, publicVoteResults, isFrozen],
  )

  // Fechar modal de pré-visualização
  const cancelPreview = useCallback(() => {
    if (!isHelpProcessing) {
      setSelectedPreviewAid(null)
    }
  }, [isHelpProcessing])

  // Execução Instantânea e Autoritativa da Ajuda (Com aplicação imediata no cliente + sync de fundo)
  const executeUseAid = useCallback(
    async (aidType: AidType): Promise<boolean> => {
      if (!user?.uid || !currentQuestion || disabled || isHelpProcessing) {
        return false
      }

      // Prevenir reativação na mesma pergunta
      if (aidType === '5050' && eliminatedOptions.length > 0) return false
      if (aidType === 'publicVote' && publicVoteResults !== null) return false
      if (aidType === 'freeze' && isFrozen) return false

      const aidMeta = CANONICAL_AIDS[aidType]
      const currentStock =
        aidType === '5050'
          ? stocks.stock5050
          : aidType === 'publicVote'
            ? stocks.stockPublicVote
            : stocks.stockFreeze

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
          ...(aidType === '5050' && { stock5050: remainingStock }),
          ...(aidType === 'publicVote' && { stockPublicVote: remainingStock }),
          ...(aidType === 'freeze' && { stockFreeze: remainingStock }),
        }))

        // 2. Atualizar perfil local imediatamente no AuthProvider
        if (typeof updateProfileLocally === 'function') {
          updateProfileLocally((prev) => {
            if (!prev) return prev
            const nextConsumables = { ...(prev.consumables || {}) }
            const nextInventory = { ...(prev.inventory || {}) }
            const nextUtilities = { ...(nextInventory.utilities || {}) }

            if (aidType === '5050') {
              nextConsumables.help5050 = remainingStock
              nextUtilities.fiftyFifty = remainingStock
              nextInventory['AID_002'] = remainingStock
              nextInventory['aid_50_50'] = remainingStock
              nextInventory['consumable_50_50'] = remainingStock
              nextInventory['help5050'] = remainingStock
            } else if (aidType === 'publicVote') {
              nextConsumables.publicVote = remainingStock
              nextUtilities.publicVote = remainingStock
              nextInventory['AID_003'] = remainingStock
              nextInventory['aid_public_vote'] = remainingStock
              nextInventory['consumable_public_vote'] = remainingStock
              nextInventory['HELP_005'] = remainingStock
              nextInventory['publicVote'] = remainingStock
            } else if (aidType === 'freeze') {
              nextConsumables.freezeTime = remainingStock
              nextUtilities.freezeTime = remainingStock
              nextInventory['AID_004'] = remainingStock
              nextInventory['aid_freeze_time'] = remainingStock
              nextInventory['consumable_congelar_tempo'] = remainingStock
              nextInventory['freezeTime'] = remainingStock
            }

            nextInventory.utilities = nextUtilities

            return {
              ...prev,
              consumables: nextConsumables,
              inventory: nextInventory,
            }
          })
        }

        // 3. Atualizar localStorage imediatamente
        syncAidStockToLocalStorage({
          ...(aidType === '5050' && { stock5050: remainingStock }),
          ...(aidType === 'publicVote' && { stockPublicVote: remainingStock }),
          ...(aidType === 'freeze' && { stockFreeze: remainingStock }),
        })

        // 4. Aplicar o efeito visual e de gameplay DE IMEDIATO
        if (aidType === '5050') {
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

        // 5. Disparar persistência atómica no Firestore / backend DE IMEDIATO
        if (effectiveUid) {
          const fallbackId =
            aidType === '5050'
              ? 'consumable_50_50'
              : aidType === 'publicVote'
                ? 'HELP_005'
                : 'consumable_congelar_tempo'

          useConsumablePowerUp(effectiveUid, fallbackId).catch((err) => {
            console.warn('[useGameAids] Erro ao persistir power-up no Firestore:', err)
          })

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
          }).catch((err) => {
            console.warn('[useGameAids] Aviso na sincronização em background:', err)
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
      eliminatedOptions,
      publicVoteResults,
      isFrozen,
      stocks,
      showAidToast,
      onOptionEliminated,
      onPublicVoteReceived,
      onFreezeApplied,
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
    setIsFrozen,
  }
}
