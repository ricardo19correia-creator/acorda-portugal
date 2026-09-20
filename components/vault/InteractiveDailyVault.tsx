'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Key,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Coins,
  Lock,
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

export type VaultAnimStage =
  | 'IDLE'
  | 'FOCUS_IN'
  | 'RUMBLE'
  | 'LOCK_1'
  | 'LOCK_2'
  | 'LOCK_3'
  | 'DOOR_OPENING'
  | 'REWARD_REVEALED'
  | 'DISSOLVE_EXIT'

interface InteractiveDailyVaultProps {
  onOpenAuth?: () => void
  isAuthenticated?: boolean
  onRewardClaimed?: (reward: VaultRewardInfo, streak: number) => void
  variant?: 'home' | 'page'
}

export function InteractiveDailyVault({
  onOpenAuth,
  isAuthenticated = true,
  onRewardClaimed,
  variant = 'home',
}: InteractiveDailyVaultProps) {
  const router = useRouter()
  const [status, setStatus] = useState<VaultStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cooldownMs, setCooldownMs] = useState(0)
  const [animStage, setAnimStage] = useState<VaultAnimStage>('IDLE')
  const [claimedReward, setClaimedReward] = useState<VaultRewardInfo | null>(null)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [microTwitch, setMicroTwitch] = useState(false)
  const [shockwaveIndex, setShockwaveIndex] = useState<number | null>(null)

  const vaultContainerRef = useRef<HTMLDivElement>(null)

  // 1. Deteção de Reduced Motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)')
      const stored = localStorage.getItem('ap_reduced_motion') === 'true'
      setReducedMotion(media.matches || stored)
    }
  }, [])

  // 2. Carregar Status do Servidor
  const loadStatus = useCallback(async () => {
    setIsLoading(true)
    const data = await fetchVaultStatus()
    setIsLoading(false)

    if (data && data.success) {
      setStatus(data)
      setCurrentStreak(data.currentStreak || 0)
      setBestStreak(data.bestStreak || 0)
      setCooldownMs(data.cooldownRemainingMs || 0)
    }
  }, [])

  useEffect(() => {
    loadStatus()

    const handleVaultUpdated = () => loadStatus()
    window.addEventListener('vault_updated', handleVaultUpdated)
    window.addEventListener('focus', loadStatus)

    return () => {
      window.removeEventListener('vault_updated', handleVaultUpdated)
      window.removeEventListener('focus', loadStatus)
    }
  }, [loadStatus])

  // 3. Temporizador regressivo em Cooldown
  useEffect(() => {
    if (!status || status.canClaim || cooldownMs <= 0) return

    const interval = setInterval(() => {
      setCooldownMs((prev) => {
        if (prev <= 1000) {
          clearInterval(interval)
          loadStatus()
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [status, cooldownMs, loadStatus])

  // 4. Micro-animação mecânica ocasional da fechadura em IDLE (~8s)
  useEffect(() => {
    if (animStage !== 'IDLE' || reducedMotion) return

    const twitchInterval = setInterval(() => {
      setMicroTwitch(true)
      setTimeout(() => setMicroTwitch(false), 450)
    }, 7500)

    return () => clearInterval(twitchInterval)
  }, [animStage, reducedMotion])

  // 5. Inclinação 3D interativa no rato / toque (Hover / Touch Tilt)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (animStage !== 'IDLE' || reducedMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setTilt({
      x: Math.max(-8, Math.min(8, -(y / (rect.height / 2)) * 8)),
      y: Math.max(-8, Math.min(8, (x / (rect.width / 2)) * 8)),
    })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  // 6. SEQUÊNCIA CINEMATOGRÁFICA DE ABERTURA (9 FASES DE VIDEOJOGO)
  const handleTriggerOpen = async () => {
    if (animStage !== 'IDLE' || isLoading) return

    const canClaim = status?.canClaim ?? false
    if (!canClaim) {
      if (variant === 'home') {
        router.push('/cofre')
      }
      return
    }

    if (!isAuthenticated) {
      if (onOpenAuth) {
        onOpenAuth()
      } else {
        router.push('/entrar')
      }
      return
    }

    setErrorMessage(null)

    // FASE 1: Aproximação e Foco da Câmara
    setAnimStage('FOCUS_IN')
    playVaultButtonClick()
    triggerVaultHaptic('click')

    // Disparar claim atómico seguro para o backend imediatamente
    const claimPromise = claimDailyVault()

    // FASE 2: Vibração mecânica & rumble de energia (350ms)
    setTimeout(async () => {
      setAnimStage('RUMBLE')
      playVaultMechanismHum()
      triggerVaultHaptic('burst')

      let claimResult: any = null
      try {
        claimResult = await claimPromise
      } catch (err: any) {
        setAnimStage('IDLE')
        setErrorMessage(err?.message || 'Falha de conexão com o servidor.')
        return
      }

      if (!claimResult || !claimResult.success || !claimResult.reward) {
        setAnimStage('IDLE')
        setErrorMessage(claimResult?.error || 'Não foi possível validar a abertura.')
        if (claimResult?.cooldownRemainingMs) {
          setCooldownMs(claimResult.cooldownRemainingMs)
        }
        return
      }

      // Recompensa confirmada pelo servidor
      const reward = claimResult.reward
      setClaimedReward(reward)
      setCurrentStreak(claimResult.streak)
      setBestStreak(claimResult.bestStreak)

      // FASE 3, 4, 5: Desbloqueio sequencial das 3 trancas mecânicas (CLIC 1, 2, 3)
      setAnimStage('LOCK_1')
      setShockwaveIndex(1)
      playVaultLockClick(1)
      triggerVaultHaptic('lock')

      setTimeout(() => {
        setAnimStage('LOCK_2')
        setShockwaveIndex(2)
        playVaultLockClick(2)
        triggerVaultHaptic('lock')
      }, reducedMotion ? 200 : 380)

      setTimeout(() => {
        setAnimStage('LOCK_3')
        setShockwaveIndex(3)
        playVaultLockClick(3)
        triggerVaultHaptic('lock')
      }, reducedMotion ? 400 : 760)

      // FASE 6 & 7: Abertura da Porta 3D & Explosão de Luz Volumétrica (God Rays)
      setTimeout(() => {
        setAnimStage('DOOR_OPENING')
        playVaultLightBurst()
        triggerVaultHaptic('burst')

        // FASE 8 & 9: Partículas & Revelação Heroica da Recompensa
        setTimeout(() => {
          setAnimStage('REWARD_REVEALED')
          playVaultRewardFanfare()
          triggerVaultHaptic('success')
          if (onRewardClaimed) {
            onRewardClaimed(reward, claimResult.streak)
          }
        }, reducedMotion ? 300 : 550)
      }, reducedMotion ? 600 : 1100)
    }, reducedMotion ? 300 : 500)
  }

  // 7. Recolha da Recompensa & Saída Limpa
  const handleCollectReward = () => {
    playVaultExitHum()
    triggerVaultHaptic('click')
    setAnimStage('DISSOLVE_EXIT')

    setTimeout(() => {
      setAnimStage('IDLE')
      setCooldownMs(24 * 60 * 60 * 1000)
      loadStatus()
    }, 700)
  }

  const canClaim = status?.canClaim ?? false
  const isInCinematic = animStage !== 'IDLE' && animStage !== 'DISSOLVE_EXIT'
  const isDoorOpen = animStage === 'DOOR_OPENING' || animStage === 'REWARD_REVEALED'

  // SE EM COOLDOWN NA HOME: Exibição compacta e limpa de alta fidelidade
  if (!canClaim && cooldownMs > 0 && animStage === 'IDLE' && variant === 'home') {
    return (
      <section
        aria-label="Cofre Diário em Cooldown"
        className="w-full max-w-md mx-auto my-3 px-4 select-none flex flex-col items-center justify-center animate-in fade-in duration-500"
      >
        <div
          onClick={() => router.push('/cofre')}
          className="group relative cursor-pointer flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-emerald-500/40 shadow-xl backdrop-blur-md transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center gap-3">
            {/* Miniatura do Cofre Oficial em Cooldown */}
            <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-slate-700/60 shrink-0 bg-slate-900">
              <Image
                src="/images/vault/daily-vault-chassis.png"
                alt="Cofre Diário"
                fill
                className="object-cover opacity-75 grayscale-[30%] group-hover:grayscale-0 transition-all"
                sizes="48px"
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                <span>COFRE DIÁRIO</span>
                {currentStreak > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-orange-400 font-mono text-[10px]">
                    <Flame className="w-3 h-3 fill-orange-400" />
                    {currentStreak}d
                  </span>
                )}
              </span>

              <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs font-bold mt-0.5">
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Próximo em:</span>
                <span className="text-amber-300 font-black">{formatCooldownTime(cooldownMs, false)}</span>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all ml-2" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      {/* 1. OVERLAY DE FOCO CINEMATOGRÁFICO (VINHETA ESCURA DE JOGO) */}
      {isInCinematic && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-md transition-opacity duration-700 animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* 2. CENA PRINCIPAL DO OBJETO FÍSICO DO COFRE (100% VISUAL OFICIAL) */}
      <section
        aria-label="Cofre Diário Oficial"
        className={cn(
          'relative w-full flex flex-col items-center justify-center select-none my-4 sm:my-6 transition-all duration-700',
          isInCinematic ? 'z-50' : 'z-20',
          animStage === 'DISSOLVE_EXIT' && 'opacity-0 scale-90 translate-y-8 blur-sm pointer-events-none'
        )}
      >
        {/* Holographic Prompt Flutuante Superior (Apenas em Idle) */}
        <div
          className={cn(
            'flex flex-col items-center text-center transition-all duration-500 mb-2',
            isInCinematic ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100'
          )}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-300 text-[11px] font-black tracking-wider uppercase shadow-[0_0_20px_rgba(16,185,129,0.25)] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>COFRE DIÁRIO DISPONÍVEL</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium tracking-wide mt-1">
            Toca no cofre para resgatar a recompensa
          </span>
        </div>

        {/* CONTAINER DO COFRE 3D + SOMBRA + LUZES */}
        <div
          ref={vaultContainerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleTriggerOpen}
          className={cn(
            'relative cursor-pointer transition-all duration-500 flex flex-col items-center justify-center group',
            animStage === 'FOCUS_IN' && 'scale-115 sm:scale-125 duration-700',
            animStage === 'RUMBLE' && !reducedMotion && 'scale-115 sm:scale-125 animate-vault-rumble',
            isDoorOpen && 'scale-115 sm:scale-125',
            animStage === 'IDLE' && !reducedMotion && 'animate-vault-breathing'
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
          {/* Luz de Fundo e Halo Esmeralda / Dourado */}
          <div
            className={cn(
              'pointer-events-none absolute -top-8 h-64 w-64 sm:h-80 sm:w-80 rounded-full blur-3xl transition-all duration-700',
              isDoorOpen
                ? 'bg-amber-400/45 scale-150'
                : isInCinematic
                  ? 'bg-emerald-400/50 scale-130'
                  : 'bg-emerald-500/25 group-hover:bg-emerald-400/40'
            )}
          />

          {/* O COFRE FÍSICO — RECTÂNGULO DE VISUALIZAÇÃO COM PROPORÇÕES REAIS (830x420) */}
          <div className="relative w-[310px] h-[162px] sm:w-[460px] sm:h-[240px] md:w-[540px] md:h-[282px] transition-transform duration-500">
            {/* 1. CHASSIS PRINCIPAL (Aço escovado, chanfros, brasão Porto, dobradiças) */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              <Image
                src="/images/vault/daily-vault-chassis.png"
                alt="Cofre Diário Oficial"
                fill
                priority
                className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]"
                sizes="(max-width: 640px) 310px, (max-width: 768px) 460px, 540px"
              />

              {/* Reflexo Metálico Dinâmico a percorrer o metal (Sheen) */}
              {animStage === 'IDLE' && !reducedMotion && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-color-dodge opacity-60">
                  <div className="w-[140%] h-[200%] -top-[50%] -left-[20%] bg-gradient-to-r from-transparent via-white/50 to-transparent animate-vault-sheen" />
                </div>
              )}

              {/* Conduítes Neon Verde Pulsantes nos LED Slots do Topo e Base */}
              <div
                className={cn(
                  'absolute inset-0 pointer-events-none transition-opacity duration-500',
                  animStage === 'IDLE' && !reducedMotion && 'animate-vault-conduit',
                  (animStage === 'RUMBLE' || animStage === 'FOCUS_IN') && 'opacity-100 brightness-150'
                )}
              >
                {/* LED Superior do Chassis */}
                <div className="absolute top-[8.5%] left-[52.5%] w-[12%] h-[2.5%] rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981] opacity-75" />
                {/* LED Inferior do Chassis */}
                <div className="absolute bottom-[8%] left-[53.5%] w-[12%] h-[2.5%] rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981] opacity-75" />
                {/* LED Lateral Esquerda Superior */}
                <div className="absolute top-[18%] left-[21.5%] w-[6%] h-[2.5%] rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] opacity-65" />
                {/* LED Lateral Esquerda Inferior */}
                <div className="absolute bottom-[16%] left-[21.5%] w-[6%] h-[2.5%] rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] opacity-65" />
              </div>
            </div>

            {/* 2. CÂMARA INTERIOR ILUMINADA (Fica visível quando a porta abre) */}
            <div
              className={cn(
                'absolute z-15 left-[34.94%] top-[13.09%] w-[45.78%] h-[82.14%] rounded-xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black transition-opacity duration-500 flex items-center justify-center',
                isDoorOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
            >
              {/* Feixes Volumétricos de Luz (God Rays) a rodar a partir do centro */}
              <div
                className={cn(
                  'absolute -inset-24 opacity-85 pointer-events-none',
                  !reducedMotion && 'animate-god-rays'
                )}
                style={{
                  background:
                    'conic-gradient(from 0deg at 50% 50%, rgba(234,179,8,0) 0deg, rgba(234,179,8,0.7) 20deg, rgba(234,179,8,0) 40deg, rgba(16,185,129,0.8) 70deg, rgba(16,185,129,0) 100deg, rgba(234,179,8,0.7) 140deg, rgba(234,179,8,0) 180deg, rgba(16,185,129,0.8) 220deg, rgba(16,185,129,0) 260deg, rgba(234,179,8,0.8) 310deg, rgba(234,179,8,0) 360deg)',
                }}
              />

              {/* Núcleo Central de Luz Branca/Dourada Brilhante */}
              <div className="absolute w-24 h-24 rounded-full bg-yellow-100 blur-xl opacity-90 animate-pulse" />
              <div className="absolute w-16 h-16 rounded-full bg-amber-400 blur-md opacity-95" />

              {/* Parede Interior Blindada */}
              <div className="absolute inset-1 rounded-lg border border-amber-400/40 shadow-inner" />
            </div>

            {/* 3. CAMADA DA PORTA BLINDADA 3D COM DOBRADIÇAS NA DIREITA */}
            <div
              className={cn(
                'absolute z-20 left-[34.94%] top-[13.09%] w-[45.78%] h-[82.14%] transition-transform duration-700 pointer-events-none',
                isDoorOpen && 'duration-1000'
              )}
              style={{
                transformOrigin: '92% 50%',
                transformStyle: 'preserve-3d',
                transform: isDoorOpen
                  ? 'perspective(1200px) rotateY(-82deg) translateZ(12px)'
                  : microTwitch && !reducedMotion
                    ? 'perspective(1200px) rotateY(-1.8deg)'
                    : 'perspective(1200px) rotateY(0deg)',
              }}
            >
              <Image
                src="/images/vault/daily-vault-door.png"
                alt="Porta do Cofre"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 640px) 150px, (max-width: 768px) 215px, 250px"
              />

              {/* Brilho da Fechadura Central na Ativação */}
              {(animStage === 'FOCUS_IN' || animStage === 'RUMBLE' || animStage === 'LOCK_1' || animStage === 'LOCK_2' || animStage === 'LOCK_3') && (
                <div className="absolute top-[41%] left-[47%] w-[28%] h-[32%] rounded-full bg-emerald-400/40 blur-md animate-ping pointer-events-none" />
              )}

              {/* Ondas de Choque Visuais das Trancas (CLIC 1, 2, 3) */}
              {shockwaveIndex && (
                <div
                  key={shockwaveIndex}
                  className="absolute top-[38%] left-[44%] w-[34%] h-[38%] rounded-full border-2 border-emerald-300 shadow-[0_0_20px_#10b981] animate-lock-shockwave pointer-events-none"
                />
              )}
            </div>

            {/* 4. RECOMPENSA REVELADA (EMERGE DE DENTRO DO COFRE EM 3D) */}
            {animStage === 'REWARD_REVEALED' && (
              <div className="absolute z-30 inset-0 flex items-center justify-center pointer-events-none animate-reward-ascend">
                <div className="relative flex flex-col items-center justify-center">
                  {/* Pedestal / Aura Holográfica da Recompensa */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-amber-400/30 via-yellow-500/40 to-amber-600/30 border-2 border-amber-300 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_50px_rgba(234,179,8,0.9)] backdrop-blur-md">
                    <span className="animate-bounce" style={{ animationDuration: '2s' }}>
                      {claimedReward?.icon || '🪙'}
                    </span>
                  </div>

                  <span className="mt-2 text-xs sm:text-sm font-black text-amber-300 font-mono tracking-wider px-3 py-1 rounded-full bg-slate-950/90 border border-amber-400/60 shadow-xl drop-shadow-md">
                    {claimedReward?.label || '+100 Acordas'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* BASE / SOMBRA DE CHÃO DINÂMICA (Ajusta com a respiração do cofre) */}
          <div className="relative w-48 sm:w-64 h-6 mt-1 flex flex-col items-center justify-center">
            <div
              className={cn(
                'w-44 sm:w-56 h-4 rounded-full bg-black/90 blur-md transition-all duration-500',
                animStage === 'IDLE' && !reducedMotion && 'animate-vault-shadow',
                isDoorOpen && 'scale-125 bg-amber-950/80 shadow-[0_0_30px_rgba(234,179,8,0.6)]'
              )}
            />
          </div>
        </div>

        {/* 3. HUD INFERIOR COM TIPOGRAFIA OFICIAL & BOTÃO METÁLICO REATIVO */}
        <div
          className={cn(
            'flex flex-col items-center text-center mt-2 w-full max-w-sm transition-all duration-500',
            isInCinematic && animStage !== 'REWARD_REVEALED' && 'opacity-0 translate-y-4 pointer-events-none'
          )}
        >
          {/* TÍTULO OFICIAL "COFRE DIÁRIO" */}
          <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-emerald-100 to-emerald-400 drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
            COFRE DIÁRIO
          </h2>

          {/* SUBTÍTULO "1 POR 24H" OU CONTAGEM DE COOLDOWN */}
          <div className="text-[11px] font-mono tracking-widest text-emerald-400/80 uppercase mt-0.5">
            {canClaim ? (
              <span>1 POR 24H</span>
            ) : (
              <span className="text-amber-400 font-bold">
                PRÓXIMO: {formatCooldownTime(cooldownMs, false)}
              </span>
            )}
          </div>

          {/* BOTÃO METÁLICO "[ 🔑 ABRIR ]" IDENTICO AO DESIGN ORIGINAL */}
          {animStage === 'IDLE' && (
            <button
              onClick={handleTriggerOpen}
              disabled={!canClaim && cooldownMs > 0}
              className={cn(
                'relative mt-3 px-8 py-2 rounded-xl border transition-all duration-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 group',
                canClaim
                  ? 'bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-emerald-500/60 hover:border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]'
                  : 'bg-slate-950/80 border-slate-800 text-slate-500 cursor-not-allowed'
              )}
            >
              {/* Brilho neon na base do botão */}
              {canClaim && (
                <div className="absolute -bottom-1 inset-x-4 h-1.5 bg-emerald-400/70 blur-sm rounded-full group-hover:bg-emerald-300" />
              )}
              {canClaim ? (
                <>
                  <Key className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
                  <span className="tracking-widest">ABRIR</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>BLOQUEADO</span>
                </>
              )}
            </button>
          )}

          {/* BOTÃO E MODAL DE CONFIRMAÇÃO DA RECOMPENSA REVELADA */}
          {animStage === 'REWARD_REVEALED' && (
            <div className="relative z-50 mt-4 w-full flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-full p-4 rounded-2xl bg-slate-950/95 border border-amber-400/60 text-center shadow-2xl backdrop-blur-xl">
                <span className="text-sm font-black text-amber-400 uppercase tracking-wider block">
                  🎉 RECOMPENSA CONFIRMADA!
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  A recompensa foi depositada diretamente na tua conta.
                </p>
                {currentStreak > 0 && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-bold font-mono">
                    <Flame className="w-3.5 h-3.5 fill-orange-400" />
                    <span>Streak: {currentStreak} {currentStreak === 1 ? 'dia' : 'dias'} consecutivos!</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleCollectReward}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(234,179,8,0.7)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-200"
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
        </div>
      </section>
    </>
  )
}
