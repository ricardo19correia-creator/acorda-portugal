'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Shield,
  Sparkles,
  Lock,
  Unlock,
  Coins,
  Flame,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react'
import {
  claimDailyVault,
  fetchVaultStatus,
  formatCooldownTime,
  type VaultStatusResponse,
  type VaultRewardInfo,
} from '@/lib/vault-service'
import {
  playVaultButtonClick,
  playVaultMechanismHum,
  playVaultLockClick,
  playVaultLightBurst,
  playVaultRewardFanfare,
  triggerVaultHaptic,
} from '@/lib/sound-engine'
import { cn } from '@/lib/utils'

export type VaultPhase =
  | 'IDLE_AVAILABLE'
  | 'IDLE_COOLDOWN'
  | 'PHASE_1_PREPARING'
  | 'PHASE_2_ACTIVATING'
  | 'PHASE_3_OPENING'
  | 'PHASE_4_REVEALING'
  | 'PHASE_5_RESULT'

interface DailyVaultViewProps {
  onRewardClaimed?: (reward: VaultRewardInfo, streak: number) => void
  onClose?: () => void
  isModal?: boolean
}

export function DailyVaultView({ onRewardClaimed, onClose, isModal = false }: DailyVaultViewProps) {
  const [phase, setPhase] = useState<VaultPhase>('IDLE_AVAILABLE')
  const [status, setStatus] = useState<VaultStatusResponse | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [cooldownMs, setCooldownMs] = useState(0)
  const [activeLockIndex, setActiveLockIndex] = useState<number>(0) // 0, 1, 2, 3
  const [claimedReward, setClaimedReward] = useState<VaultRewardInfo | null>(null)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Detetar reduced motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)')
      const stored = localStorage.getItem('ap_reduced_motion') === 'true'
      setReducedMotion(media.matches || stored)
    }
  }, [])

  // Carregar status inicial do servidor
  const loadStatus = useCallback(async () => {
    setIsLoadingStatus(true)
    const data = await fetchVaultStatus()
    setIsLoadingStatus(false)

    if (data && data.success) {
      setStatus(data)
      setCurrentStreak(data.currentStreak || 0)
      setBestStreak(data.bestStreak || 0)
      setCooldownMs(data.cooldownRemainingMs || 0)

      if (data.canClaim) {
        setPhase('IDLE_AVAILABLE')
      } else {
        setPhase('IDLE_COOLDOWN')
      }
    } else {
      setPhase('IDLE_AVAILABLE')
    }
  }, [])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  // Temporizador regressivo local sincronizado
  useEffect(() => {
    if (phase !== 'IDLE_COOLDOWN' || cooldownMs <= 0) return

    const interval = setInterval(() => {
      setCooldownMs((prev) => {
        if (prev <= 1000) {
          clearInterval(interval)
          // Quando chega a zero, re-consulta autoritativamente o servidor
          loadStatus()
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [phase, cooldownMs, loadStatus])

  // Sequência cinematográfica de abertura (Fases 1 a 5)
  const handleOpenVault = async () => {
    if (phase !== 'IDLE_AVAILABLE' || isLoadingStatus) return
    setErrorMessage(null)

    // 1. Som de clique no botão e haptic
    playVaultButtonClick()
    triggerVaultHaptic('click')

    // 2. FASE 1: Preparação
    setPhase('PHASE_1_PREPARING')

    // Disparar chamada de backend imediatamente para receber a recompensa confirmada antes da revelação
    const claimPromise = claimDailyVault()

    // Transição para FASE 2: Ativação (após 600ms)
    setTimeout(async () => {
      setPhase('PHASE_2_ACTIVATING')
      playVaultMechanismHum()
      triggerVaultHaptic('burst')

      // Aguardar resposta do backend
      let claimResult: any = null
      try {
        claimResult = await claimPromise
      } catch (err: any) {
        setPhase('IDLE_AVAILABLE')
        setErrorMessage(err?.message || 'Falha de comunicação com o servidor.')
        return
      }

      if (!claimResult || !claimResult.success || !claimResult.reward) {
        setPhase('IDLE_AVAILABLE')
        setErrorMessage(claimResult?.error || 'Não foi possível validar a abertura do cofre.')
        if (claimResult?.cooldownRemainingMs) {
          setCooldownMs(claimResult.cooldownRemainingMs)
          setPhase('IDLE_COOLDOWN')
        }
        return
      }

      // Recompensa confirmada pelo servidor
      const reward = claimResult.reward
      setClaimedReward(reward)
      setCurrentStreak(claimResult.streak)
      setBestStreak(claimResult.bestStreak)

      // Transição para FASE 3: Abertura Sequencial das 3 Trancas
      setPhase('PHASE_3_OPENING')

      // Tranca 1 (CLIC 1)
      setActiveLockIndex(1)
      playVaultLockClick(1)
      triggerVaultHaptic('lock')

      // Tranca 2 (CLIC 2)
      setTimeout(() => {
        setActiveLockIndex(2)
        playVaultLockClick(2)
        triggerVaultHaptic('lock')
      }, reducedMotion ? 200 : 380)

      // Tranca 3 (CLIC 3)
      setTimeout(() => {
        setActiveLockIndex(3)
        playVaultLockClick(3)
        triggerVaultHaptic('lock')
      }, reducedMotion ? 400 : 760)

      // Explosão de Luz & Abertura da Tampa
      setTimeout(() => {
        playVaultLightBurst()
        triggerVaultHaptic('burst')
        setPhase('PHASE_4_REVEALING')

        // Fanfarra triunfal e chuva de moedas/acerto
        setTimeout(() => {
          playVaultRewardFanfare()
          triggerVaultHaptic('success')
        }, 150)

        // Transição para FASE 5: Resultado & Confirmação
        setTimeout(() => {
          setPhase('PHASE_5_RESULT')
          if (onRewardClaimed) {
            onRewardClaimed(reward, claimResult.streak)
          }
        }, reducedMotion ? 600 : 1200)
      }, reducedMotion ? 600 : 1100)
    }, reducedMotion ? 300 : 700)
  }

  const handleFinish = () => {
    setCooldownMs(24 * 60 * 60 * 1000)
    setPhase('IDLE_COOLDOWN')
    loadStatus()
    if (onClose) onClose()
  }

  const isOpening =
    phase === 'PHASE_1_PREPARING' ||
    phase === 'PHASE_2_ACTIVATING' ||
    phase === 'PHASE_3_OPENING' ||
    phase === 'PHASE_4_REVEALING'

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      {/* Luz ambiente e brilho de fundo */}
      <div
        className={cn(
          'pointer-events-none absolute -top-12 h-80 w-80 rounded-full blur-3xl transition-all duration-1000',
          phase === 'PHASE_4_REVEALING' || phase === 'PHASE_5_RESULT'
            ? 'bg-amber-400/25 scale-125'
            : isOpening
              ? 'bg-emerald-500/30 scale-110'
              : 'bg-emerald-600/15'
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute -bottom-10 h-72 w-72 rounded-full blur-3xl transition-all duration-1000',
          isOpening ? 'bg-amber-500/20' : 'bg-slate-800/30'
        )}
      />

      {/* Header Informativo Superior */}
      <div className="relative z-10 w-full flex flex-col items-center text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wider uppercase mb-2 shadow-sm backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>RECOMPENSA DE FIDELIDADE 24H</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center justify-center gap-2">
          <span>COFRE DIÁRIO</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-1">
          Abre o teu cofre a cada 24 horas e recebe Acordas ou Ajudas oficiais para o teu percurso nacional.
        </p>

        {/* Indicadores de Streak Canónico */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 w-full max-w-sm">
          <div className="flex-1 rounded-2xl bg-slate-950/70 border border-orange-500/30 px-3 py-2 flex items-center justify-center gap-2 shadow-md">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Streak Atual</span>
              <span className="text-sm sm:text-base font-black text-orange-300 font-mono leading-none">
                {currentStreak} {currentStreak === 1 ? 'dia' : 'dias'}
              </span>
            </div>
          </div>

          <div className="flex-1 rounded-2xl bg-slate-950/70 border border-amber-500/30 px-3 py-2 flex items-center justify-center gap-2 shadow-md">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Melhor Streak</span>
              <span className="text-sm sm:text-base font-black text-amber-300 font-mono leading-none">
                {bestStreak} {bestStreak === 1 ? 'dia' : 'dias'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA CENTRAL DO COFRE (Renderização 3D/Cinematográfica com CSS & SVG Avançado) */}
      <div className="relative z-10 w-full flex flex-col items-center my-4">
        <div
          className={cn(
            'relative w-64 h-64 sm:w-76 sm:h-76 rounded-3xl flex items-center justify-center transition-all duration-500',
            // Estado de vibração na ativação
            phase === 'PHASE_2_ACTIVATING' && !reducedMotion && 'animate-bounce',
            // Glow e sombras dramáticas
            phase === 'PHASE_4_REVEALING' || phase === 'PHASE_5_RESULT'
              ? 'shadow-[0_0_80px_rgba(234,179,8,0.4)]'
              : isOpening
                ? 'shadow-[0_0_60px_rgba(16,185,129,0.5)]'
                : 'shadow-[0_15px_50px_rgba(0,0,0,0.8)]'
          )}
        >
          {/* Caixa Externa do Cofre com Vidro Blindado, Ouro e Grafite Escuro */}
          <div
            className={cn(
              'absolute inset-0 rounded-3xl border-2 transition-all duration-700 overflow-hidden',
              isOpening || phase === 'PHASE_5_RESULT'
                ? 'border-amber-400/80 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950'
                : 'border-emerald-500/40 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950'
            )}
            style={{
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            {/* Linhas de Energia Estilo Cyberpunk Português */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-transparent via-emerald-500 to-transparent opacity-50" />
            <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-transparent via-amber-500 to-transparent opacity-50" />

            {/* Parafusos Metálicos Reforçados nos Cantos */}
            <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-slate-800 border border-slate-600 shadow-inner" />
            <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-slate-800 border border-slate-600 shadow-inner" />
            <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-slate-800 border border-slate-600 shadow-inner" />
            <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-slate-800 border border-slate-600 shadow-inner" />

            {/* Painel Central Interior com Conduítes */}
            <div className="absolute inset-4 rounded-2xl border border-white/5 bg-slate-950/80 flex flex-col items-center justify-between p-4 overflow-hidden">
              {/* Feixe de Luz Vertical ao Abrir */}
              {(phase === 'PHASE_4_REVEALING' || phase === 'PHASE_5_RESULT') && (
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-t from-amber-500/30 via-yellow-200/20 to-transparent pointer-events-none',
                    !reducedMotion && 'animate-pulse'
                  )}
                />
              )}

              {/* Indicador de Status do Cofre no Topo */}
              <div className="w-full flex items-center justify-between z-10">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                  VAULT-PT // MK-IV
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      phase === 'IDLE_AVAILABLE'
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-ping'
                        : phase === 'IDLE_COOLDOWN'
                          ? 'bg-amber-500/60'
                          : 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]'
                    )}
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    {phase === 'IDLE_AVAILABLE'
                      ? 'PRONTO'
                      : phase === 'IDLE_COOLDOWN'
                        ? 'BLOQUEADO'
                        : 'DESBLOQUEANDO'}
                  </span>
                </div>
              </div>

              {/* Centro: Tranca Central ou Recompensa Revelada */}
              <div className="relative flex-1 flex items-center justify-center z-10 w-full">
                {phase === 'PHASE_4_REVEALING' || phase === 'PHASE_5_RESULT' ? (
                  // Recompensa Revelada
                  <div
                    className={cn(
                      'flex flex-col items-center justify-center transition-all duration-700',
                      !reducedMotion && 'animate-in zoom-in-50 duration-500'
                    )}
                  >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/30 to-amber-600/20 border-2 border-amber-400 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_35px_rgba(234,179,8,0.6)]">
                      {claimedReward?.icon || '🪙'}
                    </div>

                    <div className="mt-3 text-center">
                      <span className="text-xs font-black tracking-wider uppercase text-amber-400 block">
                        RECOMPENSA RECEBIDA
                      </span>
                      <span className="text-lg sm:text-xl font-black text-white font-mono block">
                        {claimedReward?.label || '+100 Acordas'}
                      </span>
                    </div>
                  </div>
                ) : (
                  // Grande Tranca Central Mecânica
                  <div className="relative flex flex-col items-center justify-center">
                    <div
                      className={cn(
                        'w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 flex items-center justify-center shadow-2xl transition-all duration-500',
                        isOpening
                          ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_30px_rgba(34,211,238,0.5)] rotate-45'
                          : phase === 'IDLE_AVAILABLE'
                            ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                            : 'border-slate-700 bg-slate-900/60'
                      )}
                    >
                      {isOpening ? (
                        <Unlock className="w-10 h-10 text-cyan-300 transition-all scale-110" />
                      ) : phase === 'IDLE_AVAILABLE' ? (
                        <Lock className="w-10 h-10 text-emerald-400 transition-all animate-pulse" />
                      ) : (
                        <Lock className="w-10 h-10 text-slate-500" />
                      )}
                    </div>

                    {/* Rótulo de Fase em Abertura */}
                    {isOpening && (
                      <span className="text-[11px] font-mono font-black text-cyan-400 uppercase tracking-widest mt-2 animate-pulse">
                        {phase === 'PHASE_1_PREPARING' && 'A PREPARAR...'}
                        {phase === 'PHASE_2_ACTIVATING' && 'ENERGIZANDO...'}
                        {phase === 'PHASE_3_OPENING' && 'DESBLOQUEANDO TRANCA...'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Trancas Inferiores (CLIC 1, CLIC 2, CLIC 3) */}
              <div className="w-full flex items-center justify-center gap-2 z-10 pt-2 border-t border-white/5">
                {[1, 2, 3].map((idx) => {
                  const isUnlocked = activeLockIndex >= idx || phase === 'PHASE_4_REVEALING' || phase === 'PHASE_5_RESULT'
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold transition-all duration-300',
                        isUnlocked
                          ? 'border-emerald-400/80 bg-emerald-500/20 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                          : 'border-slate-800 bg-slate-900/40 text-slate-500'
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>T-{idx}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de Erro, se houver */}
        {errorMessage && (
          <div className="mt-4 px-4 py-2 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 max-w-sm animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* ÁREA DE CONTROLO INFERIOR */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center mt-4">
        {/* Caso 1: Abertura Disponível */}
        {phase === 'IDLE_AVAILABLE' && (
          <div className="w-full flex flex-col items-center gap-3">
            <button
              onClick={handleOpenVault}
              disabled={isLoadingStatus}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base tracking-wider uppercase shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-300/40"
            >
              <Unlock className="w-5 h-5 text-slate-950" />
              <span>ABRIR COFRE DIÁRIO</span>
            </button>
            <p className="text-[11px] text-slate-400 font-medium">
              1 abertura gratuita a cada 24 horas completas.
            </p>
          </div>
        )}

        {/* Caso 2: Em Processo de Abertura */}
        {isOpening && (
          <div className="w-full py-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 text-cyan-300 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span>A ABRIR O COFRE...</span>
          </div>
        )}

        {/* Caso 3: Recompensa Entregue (Resultado) */}
        {phase === 'PHASE_5_RESULT' && (
          <div className="w-full flex flex-col items-center gap-3 animate-in fade-in">
            <div className="w-full p-4 rounded-2xl bg-slate-900/90 border border-amber-400/40 text-center shadow-xl backdrop-blur-md">
              <span className="text-xl sm:text-2xl font-black text-white block">
                🎉 PARABÉNS!
              </span>
              <p className="text-xs text-slate-300 mt-1">
                A tua recompensa diária foi confirmada no servidor e adicionada à tua conta.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(234,179,8,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>CONTINUAR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Caso 4: Em Cooldown (Bloqueado por 24h) */}
        {phase === 'IDLE_COOLDOWN' && (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center shadow-md">
              <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider">PRÓXIMO COFRE DISPONÍVEL EM</span>
              </div>
              <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-wider">
                {formatCooldownTime(cooldownMs, true)}
              </span>
              <p className="text-[11px] text-slate-400 mt-2">
                O cofre desbloqueia automaticamente passadas 24 horas da última abertura.
              </p>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Voltar ao Menu
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
