'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/components/auth-provider'
import {
  type AidType,
  type UserAidStock,
  CANONICAL_AIDS,
  getUserAidStock,
  consumeGameAid,
} from '@/lib/aid-service'
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
  const { user, profile } = useAuth()
  const effectiveUid = user?.uid || profile?.uid || ''

  // 1. Estado Unificado de Stocks (SSOT)
  const [stocks, setStocks] = useState<UserAidStock>(() =>
    getUserAidStock(profile, profile?.inventory as any),
  )

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
      setStocks(getUserAidStock(profile, inv))
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
      if (disabled || isHelpProcessing || !currentQuestion) return

      // Prevenir reabertura se a ajuda já foi gasta nesta pergunta
      if (aidType === '5050' && eliminatedOptions.length > 0) return
      if (aidType === 'publicVote' && publicVoteResults !== null) return
      if (aidType === 'freeze' && isFrozen) return

      setSelectedPreviewAid(aidType)
    },
    [disabled, isHelpProcessing, currentQuestion, eliminatedOptions, publicVoteResults, isFrozen],
  )

  // Fechar modal de pré-visualização
  const cancelPreview = useCallback(() => {
    if (!isHelpProcessing) {
      setSelectedPreviewAid(null)
    }
  }, [isHelpProcessing])

  // Consumo Autorizado da Ajuda Selecionada
  const confirmUseAid = useCallback(async (): Promise<boolean> => {
    if (!selectedPreviewAid || !currentQuestion || disabled || isHelpProcessing) {
      return false
    }

    const aidType = selectedPreviewAid
    const aidMeta = CANONICAL_AIDS[aidType]
    const currentStock =
      aidType === '5050'
        ? stocks.stock5050
        : aidType === 'publicVote'
          ? stocks.stockPublicVote
          : stocks.stockFreeze

    if (currentStock <= 0) {
      showAidToast(`⚠️ Sem unidades de «${aidMeta.shortName}». Adquire na Loja!`)
      setSelectedPreviewAid(null)
      return false
    }

    // Blindagem de execução única
    setIsHelpProcessing(true)

    try {
      // Normalizar dados da pergunta
      const normalizedOptions = Array.isArray(currentQuestion.options)
        ? currentQuestion.options.map((opt: any, idx: number) => {
            if (typeof opt === 'string') {
              return { key: ['A', 'B', 'C', 'D'][idx] || String(idx), text: opt }
            }
            return {
              key: opt.key || ['A', 'B', 'C', 'D'][idx] || String(idx),
              text: opt.text || String(opt),
            }
          })
        : []

      const normalizedCorrect = String(currentQuestion.correct || 'A').toUpperCase()

      const res = await consumeGameAid({
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

      if (res.success) {
        // Fechar modal de pré-visualização
        setSelectedPreviewAid(null)

        // Atualizar contadores locais de stock imediatamente
        setStocks((prev) => ({
          ...prev,
          ...(aidType === '5050' && { stock5050: res.remainingStock }),
          ...(aidType === 'publicVote' && { stockPublicVote: res.remainingStock }),
          ...(aidType === 'freeze' && { stockFreeze: res.remainingStock }),
        }))

        // Aplicar o efeito 100% individualmente para este jogador
        if (aidType === '5050') {
          const eliminated =
            res.effect?.eliminatedOptions ||
            calculate5050Eliminated(normalizedOptions, normalizedCorrect)
          setEliminatedOptions(eliminated)
          if (onOptionEliminated) onOptionEliminated(eliminated)
        } else if (aidType === 'publicVote') {
          const percentages =
            res.effect?.percentages ||
            simulatePublicVote(
              Math.max(
                0,
                normalizedOptions.findIndex((o: any) => o.key === normalizedCorrect),
              ),
            )
          setPublicVoteResults(percentages)
          if (onPublicVoteReceived) onPublicVoteReceived(percentages)
        } else if (aidType === 'freeze') {
          setIsFrozen(true)
          setFreezeTimeLeft(15)
          if (onFreezeApplied) onFreezeApplied(15)
        }

        // Feedback visual amigável com contador atualizado
        showAidToast(
          `💡 ${aidMeta.shortName.toUpperCase()} UTILIZADA — Restam ${res.remainingStock}`,
        )
        return true
      } else {
        showAidToast(`❌ ${res.message || 'Não foi possível utilizar a ajuda.'}`)
        return false
      }
    } catch (err: any) {
      console.error('[useGameAids] Erro ao consumir ajuda:', err)
      showAidToast('❌ Ocorreu um erro ao processar a ajuda.')
      return false
    } finally {
      setIsHelpProcessing(false)
    }
  }, [
    selectedPreviewAid,
    currentQuestion,
    disabled,
    isHelpProcessing,
    stocks,
    effectiveUid,
    gameMode,
    duelId,
    showAidToast,
    onOptionEliminated,
    onPublicVoteReceived,
    onFreezeApplied,
  ])

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
    confirmUseAid,
    resetQuestionAids,
    setEliminatedOptions,
    setPublicVoteResults,
    setIsFrozen,
  }
}
