'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Lock,
  Unlock,
  Coins,
  Flame,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
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
  playVaultExitHum,
  triggerVaultHaptic,
} from '@/lib/sound-engine'
import { cn } from '@/lib/utils'

interface LobbyVaultObjectProps {
  onOpenAuth?: () => void
  isAuthenticated?: boolean
}

type AnimationStage =
  | 'IDLE'
  | 'FOCUS_IN'
  | 'MECHANISM_ACTIVE'
  | 'LOCK_1'
  | 'LOCK_2'
  | 'LOCK_3'
  | 'CHASSIS_OPEN'
  | 'REWARD_REVEALED'
  | 'DISSOLVING_EXIT'

export function LobbyVaultObject({ onOpenAuth, isAuthenticated = true }: LobbyVaultObjectProps) {
  const router = useRouter()
  const [status, setStatus] = useState<VaultStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cooldownMs, setCooldownMs] = useState(0)
  const [animStage, setAnimStage] = useState<AnimationStage>('IDLE')
  const [claimedReward, setClaimedReward] = useState<VaultRewardInfo | null>(null)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hasExitedScene, setHasExitedScene] = useState(false)

  const vaultCardRef = useRef<HTMLDivElement>(null)

  // 1. Detetar reduced motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)')
      const stored = localStorage.getItem('ap_reduced_motion') === 'true'
      setReducedMotion(media.matches || stored)
    }
  }, [])

  // 2. Carregar status inicial do servidor
  const loadStatus = useCallback(async () => {
    setIsLoading(true)
    const data = await fetchVaultStatus()
    setIsLoading(false)

    if (data && data.success) {
      setStatus(data)
      setCurrentStreak(data.currentStreak || 0)
      setBestStreak(data.bestStreak || 0)
      setCooldownMs(data.cooldownRemainingMs || 0)
      if (!data.canClaim) {
        setHasExitedScene(true)
      } else {
        setHasExitedScene(false)
      }
    }
  }, [])

  useEffect(() => {
    loadStatus()

    const handleVaultUpdated = () => {
      loadStatus()
    }

    window.addEventListener('vault_updated', handleVaultUpdated)
    window.addEventListener('focus', loadStatus)

    return () => {
      window.removeEventListener('vault_updated', handleVaultUpdated)
      window.removeEventListener('focus', loadStatus)
    }
  }, [loadStatus])

  // 3. Temporizador regressivo
  useEffect(() => {
    if (!status || status.canClaim || cooldownMs <= 0) return

    const timer = setInterval(() => {
      setCooldownMs((prev) => {
        if (prev <= 1000) {
          clearInterval(timer)
          loadStatus()
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status, cooldownMs, loadStatus])

  // 4. Efeito de inclinação 3D interativo ao passar o rato (Hover Tilt)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (animStage !== 'IDLE' || reducedMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setTilt({
      x: Math.max(-10, Math.min(10, -(y / (rect.height / 2)) * 10)),
      y: Math.max(-10, Math.min(10, (x / (rect.width / 2)) * 10)),
    })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  // 5. Sequência Cinematográfica de Abertura no Lobby
  const handleTriggerOpen = async () => {
    if (animStage !== 'IDLE') return

    // Se o jogador não estiver autenticado
    if (!isAuthenticated) {
      if (onOpenAuth) {
        onOpenAuth()
      } else {
        router.push('/entrar')
      }
      return
    }

    setErrorMessage(null)

    // FASE 1: Foco na cena (zoom e escurecimento do ambiente)
    setAnimStage('FOCUS_IN')
    playVaultButtonClick()
    triggerVaultHaptic('click')

    // Disparar requisição segura e atómica para o backend imediatamente
    const claimPromise = claimDailyVault()

    // FASE 2: Mecanismo Ativado (hum magnético e preparação)
    setTimeout(async () => {
      setAnimStage('MECHANISM_ACTIVE')
      playVaultMechanismHum()
      triggerVaultHaptic('burst')

      let claimResult: any = null
      try {
        claimResult = await claimPromise
      } catch (err: any) {
        setAnimStage('IDLE')
        setErrorMessage(err?.message || 'Falha de comunicação com o servidor.')
        return
      }

      if (!claimResult || !claimResult.success || !claimResult.reward) {
        setAnimStage('IDLE')
        setErrorMessage(claimResult?.error || 'Não foi possível validar o cofre.')
        if (claimResult?.cooldownRemainingMs) {
          setCooldownMs(claimResult.cooldownRemainingMs)
          setHasExitedScene(true)
        }
        return
      }

      // Servidor validou a abertura com sucesso
      const reward = claimResult.reward
      setClaimedReward(reward)
      setCurrentStreak(claimResult.streak)
      setBestStreak(claimResult.bestStreak)

      // FASE 3: Desbloqueio Mecânico das 3 Trancas (CLIC 1, 2, 3)
      setAnimStage('LOCK_1')
      playVaultLockClick(1)
      triggerVaultHaptic('lock')

      setTimeout(() => {
        setAnimStage('LOCK_2')
        playVaultLockClick(2)
        triggerVaultHaptic('lock')
      }, reducedMotion ? 200 : 380)

      setTimeout(() => {
        setAnimStage('LOCK_3')
        playVaultLockClick(3)
        triggerVaultHaptic('lock')
      }, reducedMotion ? 400 : 760)

      // FASE 4: Abertura da Tampa 3D & Explosão de Luz
      setTimeout(() => {
        setAnimStage('CHASSIS_OPEN')
        playVaultLightBurst()
        triggerVaultHaptic('burst')

        // FASE 5: Recompensa Emerge com Fanfarra Triunfal
        setTimeout(() => {
          setAnimStage('REWARD_REVEALED')
          playVaultRewardFanfare()
          triggerVaultHaptic('success')
        }, 200)
      }, reducedMotion ? 600 : 1100)
    }, reducedMotion ? 300 : 600)
  }

  // 6. Saída Elegante: O cofre desaparece da cena e restaura o lobby limpo
  const handleCollectReward = () => {
    // Som de saída e desmaterialização
    playVaultExitHum()
    triggerVaultHaptic('click')

    // Ativar animação de desmaterialização/dissolve
    setAnimStage('DISSOLVING_EXIT')

    setTimeout(() => {
      setHasExitedScene(true)
      setAnimStage('IDLE')
      setCooldownMs(24 * 60 * 60 * 1000)
      loadStatus()
    }, 750)
  }

  const canClaim = status?.canClaim ?? false
  const isInCinematic = animStage !== 'IDLE' && animStage !== 'DISSOLVING_EXIT'

  // SE EM COOLDOWN OU JÁ RECOLHIDO: O COFRE NÃO EXISTE NA CENA!
  // Exibe apenas um indicador discreto e limpo, sem poluir a Home.
  if ((!canClaim || hasExitedScene) && animStage === 'IDLE') {
    if (cooldownMs <= 0 && !isLoading) {
      // Se acabou o cooldown, permitir renderizar o cofre novamente
    } else {
      return (
        <section
          aria-label="Status do Cofre Diário"
          className="w-full max-w-md mx-auto my-2 px-4 select-none flex items-center justify-center animate-in fade-in duration-500"
        >
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-950/60 border border-slate-800/80 text-slate-400 text-xs shadow-inner backdrop-blur-md transition-all hover:border-slate-700">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px] font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Próximo cofre em:</span>
              <span className="text-amber-300 font-black">{formatCooldownTime(cooldownMs, false)}</span>
            </div>
            {currentStreak > 0 && (
              <>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-1 text-orange-400 text-[11px] font-bold">
                  <Flame className="w-3 h-3 fill-orange-400 shrink-0" />
                  <span>{currentStreak}d</span>
                </span>
              </>
            )}
          </div>
        </section>
      )
    }
  }

  return (
    <>
      {/* 1. OVERLAY DE FOCO CINEMATOGRÁFICO NA CENA (QUANDO O COFRE É TOCADO) */}
      {isInCinematic && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-md transition-opacity duration-700 animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* 2. CENA DO OBJETO FÍSICO DO COFRE (INTEGRADO NO LOBBY DA HOME) */}
      <section
        aria-label="Cofre Diário Físico"
        className={cn(
          'relative w-full flex flex-col items-center justify-center select-none my-4 sm:my-6 transition-all duration-700',
          isInCinematic ? 'z-50' : 'z-20',
          animStage === 'DISSOLVING_EXIT' && 'opacity-0 scale-90 translate-y-8 blur-sm pointer-events-none'
        )}
      >
        {/* Holographic Prompt Flutuante Superior */}
        <div
          className={cn(
            'flex flex-col items-center text-center transition-all duration-500 mb-2',
            isInCinematic ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100'
          )}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-300 text-[11px] font-black tracking-wider uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-md animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>COFRE DIÁRIO DISPONÍVEL</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
            Toca no cofre para resgatar
          </span>
        </div>

        {/* CONTAINER FÍSICO 3D DO COFRE + PEDESTAL */}
        <div
          ref={vaultCardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleTriggerOpen}
          className={cn(
            'relative cursor-pointer transition-transform duration-300 flex flex-col items-center justify-center group',
            animStage === 'FOCUS_IN' && 'scale-110 sm:scale-125 duration-700',
            animStage === 'CHASSIS_OPEN' && 'scale-115 sm:scale-130',
            animStage === 'REWARD_REVEALED' && 'scale-115 sm:scale-130',
            animStage === 'MECHANISM_ACTIVE' && !reducedMotion && 'animate-bounce'
          )}
          style={{
            perspective: 1200,
            transformStyle: 'preserve-3d',
            transform:
              animStage === 'IDLE' && !reducedMotion
                ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                : undefined,
          }}
        >
          {/* Luz Ambiente e Brilho Central do Objeto */}
          <div
            className={cn(
              'pointer-events-none absolute -top-8 h-56 w-56 rounded-full blur-3xl transition-all duration-700',
              animStage === 'CHASSIS_OPEN' || animStage === 'REWARD_REVEALED'
                ? 'bg-amber-400/40 scale-150'
                : isInCinematic
                  ? 'bg-emerald-400/40 scale-125'
                  : 'bg-emerald-500/20 group-hover:bg-emerald-400/30'
            )}
          />

          {/* CHASSIS DO COFRE 3D / 2.5D (DESIGN BLINDADO CYBER-PORTUGAL) */}
          <div
            className={cn(
              'relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl transition-all duration-500 flex items-center justify-center',
              'shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
              animStage === 'CHASSIS_OPEN' || animStage === 'REWARD_REVEALED'
                ? 'shadow-[0_0_80px_rgba(234,179,8,0.6)]'
                : 'group-hover:shadow-[0_0_50px_rgba(16,185,129,0.4)]'
            )}
          >
            {/* Casca Externa em Metal Escuro e Ouro */}
            <div
              className={cn(
                'absolute inset-0 rounded-3xl border-2 transition-all duration-500 overflow-hidden',
                animStage === 'CHASSIS_OPEN' || animStage === 'REWARD_REVEALED'
                  ? 'border-amber-400/90 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40'
                  : 'border-emerald-500/50 group-hover:border-emerald-400 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950'
              )}
              style={{
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -4px 8px rgba(0,0,0,0.8)',
              }}
            >
              {/* Conduítes Cibernéticos em Ouro e Esmeralda */}
              <div className="absolute top-0 inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-70 group-hover:opacity-100" />
              <div className="absolute bottom-0 inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-70 group-hover:opacity-100" />
              <div className="absolute left-0 inset-y-4 w-0.5 bg-gradient-to-b from-transparent via-emerald-500 to-transparent opacity-50" />
              <div className="absolute right-0 inset-y-4 w-0.5 bg-gradient-to-b from-transparent via-amber-500 to-transparent opacity-50" />

              {/* Parafusos Industriais Hexagonais nos Cantos */}
              <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-600 shadow-inner" />
              <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-600 shadow-inner" />
              <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-600 shadow-inner" />
              <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-600 shadow-inner" />

              {/* Ranhuras de Ventilação e Feixes de Energia */}
              <div className="absolute inset-3 rounded-2xl border border-white/5 bg-slate-950/80 flex flex-col items-center justify-between p-3 overflow-hidden">
                {/* Feixe Vertical de Luz Explosiva (ao abrir) */}
                {(animStage === 'CHASSIS_OPEN' || animStage === 'REWARD_REVEALED') && (
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-t from-amber-500/50 via-yellow-200/40 to-transparent pointer-events-none',
                      !reducedMotion && 'animate-pulse'
                    )}
                  />
                )}

                {/* Status LED no topo do chassis */}
                <div className="w-full flex items-center justify-between z-10">
                  <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                    COFRE NACIONAL
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        animStage === 'IDLE'
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-ping'
                          : 'bg-amber-400 shadow-[0_0_12px_rgba(234,179,8,1)]'
                      )}
                    />
                    <span className="text-[9px] font-mono font-black text-slate-400 uppercase">
                      {animStage === 'IDLE' ? 'PRONTO' : 'A ABRIR'}
                    </span>
                  </div>
                </div>

                {/* CENTRO: MOSTRADOR MECÂNICO DO COFRE FORTE OU RECOMPENSA */}
                <div className="relative flex-1 flex items-center justify-center z-10 w-full">
                  {animStage === 'REWARD_REVEALED' ? (
                    // RECOMPENSA ELEVADA
                    <div
                      className={cn(
                        'flex flex-col items-center justify-center transition-all duration-700',
                        !reducedMotion && 'animate-in zoom-in-75 duration-500'
                      )}
                    >
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400/30 via-yellow-500/40 to-amber-600/30 border-2 border-amber-300 flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_40px_rgba(234,179,8,0.8)] animate-bounce">
                        {claimedReward?.icon || '🪙'}
                      </div>
                      <span className="text-xs sm:text-sm font-black text-amber-300 font-mono mt-2 tracking-wide block drop-shadow-md">
                        {claimedReward?.label || '+100 Acordas'}
                      </span>
                    </div>
                  ) : (
                    // MOSTRADOR GIRATÓRIO PESADO & TRANCA CENTRAL
                    <div className="relative flex items-center justify-center">
                      <div
                        className={cn(
                          'w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 flex items-center justify-center transition-all duration-500 shadow-2xl',
                          animStage === 'IDLE'
                            ? 'border-emerald-400/80 bg-slate-900/90 group-hover:border-emerald-300 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                            : 'border-amber-400 bg-amber-950/60 shadow-[0_0_35px_rgba(234,179,8,0.7)] rotate-90'
                        )}
                        style={{
                          background: 'radial-gradient(circle, #1e293b 0%, #020617 80%)',
                        }}
                      >
                        {/* Esfera Armilar / Símbolo Português Gravado */}
                        <div className="absolute inset-1.5 rounded-full border border-dashed border-white/20 opacity-60 pointer-events-none" />

                        {animStage === 'CHASSIS_OPEN' ? (
                          <Unlock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 animate-pulse" />
                        ) : (
                          <Lock
                            className={cn(
                              'w-8 h-8 sm:w-10 sm:h-10 transition-all',
                              animStage === 'IDLE'
                                ? 'text-emerald-400 group-hover:scale-110'
                                : 'text-amber-400 scale-105'
                            )}
                          />
                        )}
                      </div>

                      {/* TRANCA 1 (ESQUERDA) */}
                      <div
                        className={cn(
                          'absolute -left-3.5 w-3.5 h-3 rounded-l-md border border-slate-700 transition-all duration-300',
                          animStage === 'LOCK_1' ||
                            animStage === 'LOCK_2' ||
                            animStage === 'LOCK_3' ||
                            animStage === 'CHASSIS_OPEN'
                            ? 'bg-amber-400 border-amber-300 translate-x-1.5 shadow-[0_0_8px_rgba(234,179,8,0.8)]'
                            : 'bg-slate-800 border-emerald-500/40'
                        )}
                      />

                      {/* TRANCA 2 (DIREITA) */}
                      <div
                        className={cn(
                          'absolute -right-3.5 w-3.5 h-3 rounded-r-md border border-slate-700 transition-all duration-300',
                          animStage === 'LOCK_2' || animStage === 'LOCK_3' || animStage === 'CHASSIS_OPEN'
                            ? 'bg-amber-400 border-amber-300 -translate-x-1.5 shadow-[0_0_8px_rgba(234,179,8,0.8)]'
                            : 'bg-slate-800 border-emerald-500/40'
                        )}
                      />

                      {/* TRANCA 3 (INFERIOR) */}
                      <div
                        className={cn(
                          'absolute -bottom-3.5 w-3 h-3.5 rounded-b-md border border-slate-700 transition-all duration-300',
                          animStage === 'LOCK_3' || animStage === 'CHASSIS_OPEN'
                            ? 'bg-amber-400 border-amber-300 -translate-y-1.5 shadow-[0_0_8px_rgba(234,179,8,0.8)]'
                            : 'bg-slate-800 border-emerald-500/40'
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Trancas 1, 2, 3 LED Indicadores */}
                <div className="w-full flex items-center justify-center gap-1.5 z-10 pt-1.5 border-t border-white/5">
                  {[1, 2, 3].map((lockIdx) => {
                    const isUnlocked =
                      animStage === 'CHASSIS_OPEN' ||
                      animStage === 'REWARD_REVEALED' ||
                      (lockIdx === 1 && (animStage === 'LOCK_1' || animStage === 'LOCK_2' || animStage === 'LOCK_3')) ||
                      (lockIdx === 2 && (animStage === 'LOCK_2' || animStage === 'LOCK_3')) ||
                      (lockIdx === 3 && animStage === 'LOCK_3')

                    return (
                      <div
                        key={lockIdx}
                        className={cn(
                          'flex items-center gap-1 px-2 py-0.5 rounded border text-[8px] font-mono font-bold transition-all',
                          isUnlocked
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_6px_rgba(234,179,8,0.5)]'
                            : 'border-slate-800 bg-slate-900/60 text-slate-500'
                        )}
                      >
                        <span className="w-1 h-1 rounded-full bg-current" />
                        <span>T-{lockIdx}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* PEDESTAL / BASE ILUMINADA NO CHÃO DO LOBBY */}
          <div className="relative w-56 sm:w-64 h-10 mt-1 flex flex-col items-center justify-center">
            {/* Sombra de contacto com o chão */}
            <div className="absolute top-2 w-48 sm:w-56 h-6 rounded-full bg-black/80 blur-md" />

            {/* Plataforma Metálica Hexagonal com Iluminação Cyber-Track */}
            <div
              className={cn(
                'relative w-44 sm:w-52 h-4 rounded-full border transition-all duration-500 shadow-lg',
                animStage === 'CHASSIS_OPEN' || animStage === 'REWARD_REVEALED'
                  ? 'border-amber-400 bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 shadow-[0_0_25px_rgba(234,179,8,0.7)]'
                  : 'border-emerald-500/40 group-hover:border-emerald-400 bg-gradient-to-r from-slate-950 via-emerald-950/40 to-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              )}
            >
              {/* Anel de luz interior */}
              <div className="absolute inset-0.5 rounded-full border border-white/10 opacity-70" />
            </div>
          </div>
        </div>

        {/* 3. MODAL / PAINEL DE RESULTADO E RECOLHA (QUANDO A RECOMPENSA SURGE) */}
        {animStage === 'REWARD_REVEALED' && (
          <div className="relative z-50 mt-4 w-full max-w-sm flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-full p-4 rounded-2xl bg-slate-950/95 border border-amber-400/50 text-center shadow-2xl backdrop-blur-xl">
              <span className="text-sm font-black text-amber-400 uppercase tracking-wider block">
                🎉 RECOMPENSA CONFIRMADA
              </span>
              <p className="text-xs text-slate-300 mt-1">
                A tua recompensa diária foi adicionada com sucesso à tua carteira e inventário.
              </p>
              {currentStreak > 0 && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 fill-orange-400" />
                  <span>Streak Atual: {currentStreak} {currentStreak === 1 ? 'dia' : 'dias'} consecutivos!</span>
                </div>
              )}
            </div>

            <button
              onClick={handleCollectReward}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(234,179,8,0.6)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-200"
            >
              <span>RECOLHER E CONTINUAR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Mensagem de Erro, se houver */}
        {errorMessage && (
          <div className="mt-3 px-4 py-2 rounded-xl bg-rose-950/90 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2 max-w-sm animate-in fade-in z-50">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </section>
    </>
  )
}
