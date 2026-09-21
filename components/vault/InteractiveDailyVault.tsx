'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import {
  claimDailyVault,
  fetchVaultStatus,
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
  | 'CINEMA_FOCUS'
  | 'RUMBLE'
  | 'LOCK_SEQUENCE'
  | 'DOOR_OPENING'
  | 'JACKPOT_REVEAL'
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
  const { user, profile } = useAuth()
  const [status, setStatus] = useState<VaultStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [animStage, setAnimStage] = useState<VaultAnimStage>('IDLE')
  const [isOpening, setIsOpening] = useState(false)
  const [claimedReward, setClaimedReward] = useState<VaultRewardInfo | null>(null)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [microTwitch, setMicroTwitch] = useState(false)
  const [activeLock, setActiveLock] = useState<number>(0)
  const [hasClaimedNow, setHasClaimedNow] = useState(false)

  // 1. Deteção de Acessibilidade / Reduced Motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)')
      const stored = localStorage.getItem('ap_reduced_motion') === 'true'
      setReducedMotion(media.matches || stored)
    }
  }, [])

  // 2. Carregar Status Autoritativo do Servidor / Firestore (SSOT)
  const loadStatus = useCallback(async () => {
    if (!user && !isAuthenticated) {
      // Visitante não autenticado: visualiza o cofre na Home; ao clicar é convidado a registar/entrar
      setIsLoading(false)
      setStatus({
        ok: true,
        success: true,
        vaultEnabled: true,
        canClaim: true,
        cooldownRemainingMs: 0,
        nextAvailableAt: 0,
        currentStreak: 0,
        displayedStreak: 0,
        bestStreak: 0,
        totalOpened: 0,
        totalAcordasWon: 0,
        totalAidsWon: 0,
        lastReward: null,
        lastOpenedAt: null,
        isDay7Special: false,
        serverTime: Date.now(),
      })
      return
    }

    setIsLoading(true)
    const data = await fetchVaultStatus()
    setIsLoading(false)

    if (data && data.success) {
      setStatus(data)
      setCurrentStreak(data.currentStreak || 0)
    } else {
      // Se a chamada de rede falhar temporariamente, manter estado anterior ou não permitir flash
      setStatus((prev) => prev || null)
    }
  }, [user, isAuthenticated])

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

  // 3. Temporizador Inteligente: Quando as 24h exatas expirarem, o cofre reaparece automaticamente
  useEffect(() => {
    if (!status || status.canClaim || !status.nextAvailableAt) return

    const now = Date.now()
    const msUntilAvailable = Math.max(1000, status.nextAvailableAt - now + 500)

    // Se estiver a menos de 24 horas, definir timeout reativo
    if (msUntilAvailable <= 24 * 60 * 60 * 1000) {
      const timer = setTimeout(() => {
        loadStatus()
      }, msUntilAvailable)
      return () => clearTimeout(timer)
    }
  }, [status, loadStatus])

  // 4. Micro-vibração mecânica sutil a cada 8s em IDLE
  useEffect(() => {
    if (animStage !== 'IDLE' || reducedMotion) return

    const interval = setInterval(() => {
      setMicroTwitch(true)
      setTimeout(() => setMicroTwitch(false), 380)
    }, 8000)

    return () => clearInterval(interval)
  }, [animStage, reducedMotion])

  // 5. Parallax 3D / Tilt Dinâmico ao interagir com o cursor/touch
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

  // 6. SEQUÊNCIA CINEMATOGRÁFICA DE ABERTURA — NÍVEL PROFISSIONAL DE VIDEOJOGO
  const handleTriggerOpen = async (e: React.MouseEvent) => {
    e.stopPropagation()
    // Anti-Spam / Anti-Duplicação: Se já estiver a abrir ou em animação, ignorar imediatamente
    if (animStage !== 'IDLE' || isOpening || isLoading) return

    // Se o jogador não estiver autenticado, abrir fluxo de login oficial
    if (!isAuthenticated || !user) {
      if (onOpenAuth) {
        onOpenAuth()
      } else {
        router.push('/entrar')
      }
      return
    }

    // FASE 1: Bloqueio Síncrono Imediato, Reação ao Toque & Foco Cinematográfico
    setIsOpening(true)
    setAnimStage('CINEMA_FOCUS')
    playVaultButtonClick()
    triggerVaultHaptic('click')

    // Disparar requisição de claim autoritativo ao backend imediatamente (Transação Firestore no servidor)
    const claimPromise = claimDailyVault()

    // FASE 2: Aceleração, Vibração Mecânica e Rumble Magnético (após 350ms)
    setTimeout(async () => {
      setAnimStage('RUMBLE')
      playVaultMechanismHum()
      triggerVaultHaptic('burst')

      let claimResult: any = null
      try {
        claimResult = await claimPromise
      } catch (err: any) {
        setAnimStage('IDLE')
        setIsOpening(false)
        return
      }

      // Se o servidor rejeitar (por exemplo, cooldown ativo em outro separador), abortar graciosamente
      if (!claimResult || !claimResult.success || !claimResult.reward) {
        setAnimStage('IDLE')
        setIsOpening(false)
        if (claimResult?.cooldownRemainingMs && claimResult.cooldownRemainingMs > 0) {
          setHasClaimedNow(true)
          setStatus((prev) => (prev ? { ...prev, canClaim: false } : null))
        }
        return
      }

      const reward = claimResult.reward
      setClaimedReward(reward)
      setCurrentStreak(claimResult.streak)

      // FASE 3: Desbloqueio Mecânico em Sequência (Trancas 1, 2, 3)
      setAnimStage('LOCK_SEQUENCE')
      setActiveLock(1)
      playVaultLockClick(1)
      triggerVaultHaptic('lock')

      setTimeout(() => {
        setActiveLock(2)
        playVaultLockClick(2)
        triggerVaultHaptic('lock')
      }, reducedMotion ? 200 : 380)

      setTimeout(() => {
        setActiveLock(3)
        playVaultLockClick(3)
        triggerVaultHaptic('lock')
      }, reducedMotion ? 400 : 760)

      // FASE 4 & 5: Abertura 3D da Porta Blindada & Feixes Volumétricos de Luz (God Rays)
      setTimeout(() => {
        setAnimStage('DOOR_OPENING')
        playVaultLightBurst()
        triggerVaultHaptic('burst')

        // FASE 6 & 7: Explosão de Partículas, Fanfarra Triunfal & Revelação da Recompensa
        setTimeout(() => {
          setAnimStage('JACKPOT_REVEAL')
          playVaultRewardFanfare()
          triggerVaultHaptic('success')
          if (onRewardClaimed) {
            onRewardClaimed(reward, claimResult.streak)
          }
        }, reducedMotion ? 300 : 600)
      }, reducedMotion ? 600 : 1100)
    }, reducedMotion ? 250 : 450)
  }

  // 7. Terminar e Recolher: O cofre dissolve-se suavemente e desaparece para sempre da Home
  const handleCollectReward = () => {
    playVaultExitHum()
    triggerVaultHaptic('click')
    setAnimStage('DISSOLVE_EXIT')

    setTimeout(() => {
      setHasClaimedNow(true)
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              canClaim: false,
              cooldownRemainingMs: 24 * 60 * 60 * 1000,
              nextAvailableAt: Date.now() + 24 * 60 * 60 * 1000,
              lastOpenedAt: Date.now(),
            }
          : null
      )
      setAnimStage('IDLE')
      setIsOpening(false)
      loadStatus()
    }, 700)
  }

  // ==========================================================================
  // REGRA FUNDAMENTAL E DEFINITIVA DO COFRE:
  // Se o utilizador já abriu o cofre nas últimas 24h reais:
  // → NÃO mostrar Cofre;
  // → NÃO mostrar Cofre bloqueado;
  // → NÃO mostrar contador nem tempo restante;
  // → NÃO mostrar mensagens de cooldown;
  // → NÃO mostrar placeholder nem deixar espaço vazio.
  // SILÊNCIO VISUAL ABSOLUTO: O componente retorna rigorosamente null.
  // ==========================================================================
  const lastOpened = profile?.lastVaultOpenedAt || status?.lastOpenedAt
  const isProfileInCooldown =
    typeof lastOpened === 'number' && Date.now() - lastOpened < 24 * 60 * 60 * 1000

  // Se já fez claim agora, ou o perfil diz cooldown, ou o servidor diz canClaim = false:
  const isCurrentlyAvailable =
    !hasClaimedNow &&
    !isProfileInCooldown &&
    (status ? status.canClaim : !user ? true : false)

  if (!isCurrentlyAvailable && animStage === 'IDLE') {
    return null
  }

  const isInCinematic = animStage !== 'IDLE' && animStage !== 'DISSOLVE_EXIT'
  const isDoorOpen = animStage === 'DOOR_OPENING' || animStage === 'JACKPOT_REVEAL'

  // Partículas de moedas douradas para a explosão de jackpot
  const coins = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2
    const dist = 120 + (i % 3) * 40
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist - 50
    const rot = (i % 2 === 0 ? 1 : -1) * (180 + i * 30)
    return { id: i, tx, ty, rot, delay: (i % 4) * 0.08 }
  })

  return (
    <>
      {/* 1. AMBIENTE CINEMATOGRÁFICO DE ABERTURA (QUANDO EM FOCO) */}
      {isInCinematic && (
        <div
          className="fixed inset-0 z-50 bg-black/94 backdrop-blur-xl transition-opacity duration-700 animate-in fade-in flex items-center justify-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Luz Ambiente e Feixes Volumétricos de Foco */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.18)_0%,_rgba(0,0,0,0.96)_70%)] pointer-events-none" />

          {/* CHUVA / EXPLOSÃO DE MOEDAS E PARTÍCULAS EM JACKPOT */}
          {animStage === 'JACKPOT_REVEAL' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-40 overflow-hidden">
              {coins.map((c) => (
                <span
                  key={c.id}
                  className="absolute text-2xl sm:text-3xl select-none"
                  style={
                    {
                      '--tx': `${c.tx}px`,
                      '--ty': `${c.ty}px`,
                      '--rot': `${c.rot}deg`,
                      animation: `coin-float-burst 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                      animationDelay: `${c.delay}s`,
                    } as React.CSSProperties
                  }
                >
                  🪙
                </span>
              ))}
            </div>
          )}

          {/* PALCO CENTRAL DO COFRE EM CINEMA */}
          <div className="relative flex flex-col items-center justify-center z-50 px-4">
            {/* CONTAINER 3D DO COFRE EM TAMANHO HERO */}
            <div
              className={cn(
                'relative flex items-center justify-center transition-all duration-700',
                animStage === 'CINEMA_FOCUS' && 'scale-105 duration-500',
                animStage === 'RUMBLE' && !reducedMotion && 'scale-110 animate-vault-rumble',
                isDoorOpen && 'scale-110'
              )}
            >
              {/* Luz volumétrica de fundo do cofre */}
              <div
                className={cn(
                  'pointer-events-none absolute h-72 w-72 sm:h-96 sm:w-96 rounded-full blur-3xl transition-all duration-700',
                  isDoorOpen
                    ? 'bg-amber-400/40 scale-150'
                    : 'bg-emerald-400/35 scale-120'
                )}
              />

              {/* COFRE EM TAMANHO HERO (Proporções exatas 538x407) */}
              <div className="relative w-[290px] h-[219px] sm:w-[380px] sm:h-[287px] md:w-[450px] md:h-[340px]">
                {/* 1. CHASSIS DO COFRE ISOLADO (100% TRANSPARENTE, SEM FUNDO NEM TEXTOS) */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <Image
                    src="/images/vault/daily-vault-isolated.png"
                    alt="Cofre Diário Secreto"
                    fill
                    priority
                    className="object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.95)]"
                    sizes="(max-width: 640px) 290px, (max-width: 768px) 380px, 450px"
                  />

                  {/* Conduítes Neon a energizar no Rumble */}
                  {(animStage === 'RUMBLE' || animStage === 'LOCK_SEQUENCE') && (
                    <div className="absolute inset-0 pointer-events-none filter drop-shadow-[0_0_20px_#10b981] brightness-150 animate-pulse">
                      <Image
                        src="/images/vault/daily-vault-isolated.png"
                        alt="Cofre Neon"
                        fill
                        className="object-contain opacity-40 mix-blend-screen"
                        sizes="450px"
                      />
                    </div>
                  )}
                </div>

                {/* 2. CÂMARA INTERIOR ILUMINADA COM GOD RAYS QUANDO A PORTA ABRE */}
                <div
                  className={cn(
                    'absolute z-15 left-[31.6%] top-[9.3%] w-[66.9%] h-[84.7%] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black transition-opacity duration-500 flex items-center justify-center',
                    isDoorOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  )}
                >
                  {/* Feixes Volumétricos de Luz (God Rays) a rodar */}
                  <div
                    className={cn(
                      'absolute -inset-32 opacity-90 pointer-events-none',
                      !reducedMotion && 'animate-god-rays'
                    )}
                    style={{
                      background:
                        'conic-gradient(from 0deg at 50% 50%, rgba(234,179,8,0) 0deg, rgba(234,179,8,0.75) 20deg, rgba(234,179,8,0) 40deg, rgba(16,185,129,0.85) 75deg, rgba(16,185,129,0) 105deg, rgba(234,179,8,0.75) 140deg, rgba(234,179,8,0) 180deg, rgba(16,185,129,0.85) 225deg, rgba(16,185,129,0) 265deg, rgba(234,179,8,0.75) 310deg, rgba(234,179,8,0) 360deg)',
                    }}
                  />

                  {/* Núcleo Central de Luz Brilhante */}
                  <div className="absolute w-28 h-28 rounded-full bg-yellow-100 blur-xl opacity-95 animate-pulse" />
                  <div className="absolute w-20 h-20 rounded-full bg-amber-400 blur-md opacity-100" />
                  <div className="absolute inset-2 rounded-xl border border-amber-400/50 shadow-inner" />
                </div>

                {/* 3. PORTA BLINDADA 3D QUE RODA SOBRE AS DOBRADIÇAS DA DIREITA */}
                <div
                  className={cn(
                    'absolute z-20 left-[31.6%] top-[9.3%] w-[66.9%] h-[84.7%] transition-transform duration-700 pointer-events-none',
                    isDoorOpen && 'duration-1000'
                  )}
                  style={{
                    transformOrigin: '98% 50%',
                    transformStyle: 'preserve-3d',
                    transform: isDoorOpen
                      ? 'perspective(1400px) rotateY(-85deg) translateZ(15px)'
                      : 'perspective(1400px) rotateY(0deg)',
                  }}
                >
                  <Image
                    src="/images/vault/daily-vault-door-clean.png"
                    alt="Porta do Cofre"
                    fill
                    priority
                    className="object-contain"
                    sizes="350px"
                  />

                  {/* Ondas de Choque das Trancas ao Desbloquear */}
                  {activeLock > 0 && (
                    <div
                      key={activeLock}
                      className="absolute top-[38%] left-[44%] w-[32%] h-[36%] rounded-full border-2 border-emerald-300 shadow-[0_0_25px_#10b981] animate-lock-shockwave pointer-events-none"
                    />
                  )}
                </div>
              </div>

              {/* Sombra de Chão */}
              <div className="absolute -bottom-4 w-56 sm:w-72 h-5 rounded-full bg-black/90 blur-md" />
            </div>

            {/* 4. RECOMPENSA DE NÍVEL PROFISSIONAL (JACKPOT / MOMENTO DE IMPACTO) */}
            {animStage === 'JACKPOT_REVEAL' && (
              <div className="relative z-50 mt-6 w-full max-w-sm flex flex-col items-center gap-3 animate-reward-ascend">
                {/* Cartão de Glória e Impacto */}
                <div className="w-full p-5 sm:p-6 rounded-3xl bg-slate-950/95 border-2 border-amber-400/80 text-center shadow-[0_0_50px_rgba(234,179,8,0.45)] backdrop-blur-2xl animate-jackpot-pulse">
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-[10px] font-black tracking-widest uppercase mb-3">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>RECOMPENSA DIÁRIA</span>
                  </div>

                  {/* Grande Ícone da Recompensa */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-br from-amber-400/30 via-yellow-500/40 to-amber-600/30 border-2 border-amber-300 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_40px_rgba(234,179,8,0.8)] mb-3">
                    <span className="animate-bounce" style={{ animationDuration: '2s' }}>
                      {claimedReward?.icon || '🪙'}
                    </span>
                  </div>

                  {/* Valor da Recompensa com Tipografia Oficial */}
                  <h3 className="text-xl sm:text-2xl font-black text-white font-mono tracking-wider drop-shadow-md">
                    {claimedReward?.label || '+100 Acordas'}
                  </h3>

                  {/* Streak de Dias Consecutivos */}
                  {currentStreak > 0 && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-bold font-mono">
                      <Flame className="w-3.5 h-3.5 fill-orange-400" />
                      <span>
                        {currentStreak} {currentStreak === 1 ? 'dia consecutivo' : 'dias consecutivos'}!
                      </span>
                    </div>
                  )}
                </div>

                {/* Botão de Recolha Elegante */}
                <button
                  onClick={handleCollectReward}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_35px_rgba(234,179,8,0.7)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-200"
                >
                  <span>RECOLHER RECOMPENSA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ESTADO IDLE NA HOMEPAGE: ELEMENTO 3D VIVO, RESPONSIVO E SEM CORTES */}
      {!isInCinematic && isCurrentlyAvailable && (
        <div
          onClick={handleTriggerOpen}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(
            'cursor-pointer select-none group',
            variant === 'home'
              ? 'fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-3.5 sm:bottom-20 sm:right-6 lg:bottom-8 lg:right-8 z-35 transition-transform duration-300 hover:scale-105 active:scale-95'
              : 'relative my-6 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 active:scale-95',
            animStage === 'DISSOLVE_EXIT' && 'animate-vault-dissolve pointer-events-none'
          )}
          style={{
            perspective: 1000,
          }}
          title="Cofre Diário Secreto — Toca para abrir"
          aria-label="Cofre Diário Secreto — Toca para abrir"
        >
          {/* Halo de Brilho Cinematográfico Subtil */}
          <div
            className={cn(
              'pointer-events-none absolute -inset-3 rounded-full bg-emerald-500/20 blur-xl opacity-75 group-hover:opacity-100 group-hover:bg-emerald-400/35 transition-all',
              variant === 'page' && 'w-64 h-64 -inset-6 bg-emerald-500/25'
            )}
          />

          {/* Micro-brilhos Flutuantes (Ambient Idle Sparkles) */}
          {!reducedMotion && (
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              <span
                className="absolute text-xs animate-vault-sparkle select-none"
                style={{ top: '10%', left: '15%', animationDelay: '0s' }}
              >
                ✨
              </span>
              <span
                className="absolute text-[10px] animate-vault-sparkle select-none text-emerald-300"
                style={{ top: '60%', right: '10%', animationDelay: '1.2s' }}
              >
                ✦
              </span>
              <span
                className="absolute text-[11px] animate-vault-sparkle select-none text-amber-300"
                style={{ bottom: '15%', left: '25%', animationDelay: '2.1s' }}
              >
                ★
              </span>
            </div>
          )}

          {/* O COFRE ISOLADO (Proporções Canónicas 538x407 — 100% Preservadas e Sem Cortes) */}
          <div
            className={cn(
              'relative transition-transform duration-300 aspect-[538/407]',
              variant === 'home'
                ? 'w-24 sm:w-28 md:w-32 lg:w-36'
                : 'w-48 sm:w-60 md:w-72',
              !reducedMotion && 'animate-vault-breathing'
            )}
            style={{
              transform:
                !reducedMotion
                  ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                  : undefined,
            }}
          >
            <Image
              src="/images/vault/daily-vault-isolated.png"
              alt="Cofre Diário Secreto"
              fill
              priority
              className="object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.85)] filter group-hover:brightness-110 transition-all"
              sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, (max-width: 1024px) 128px, 144px"
            />

            {/* Reflexo Metálico Dinâmico no Metal (Sheen) */}
            {!reducedMotion && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-color-dodge opacity-50 rounded-2xl">
                <div className="w-[140%] h-[200%] -top-[50%] -left-[20%] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-vault-sheen" />
              </div>
            )}

            {/* Conduítes Neon Verde com Pulsação Subtil */}
            <div
              className={cn(
                'absolute inset-0 pointer-events-none transition-opacity duration-300',
                !reducedMotion && 'animate-vault-conduit',
                microTwitch && 'brightness-150'
              )}
            >
              <div className="absolute top-[8.5%] left-[52.5%] w-[12%] h-[2.5%] rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] opacity-75" />
              <div className="absolute bottom-[8%] left-[53.5%] w-[12%] h-[2.5%] rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] opacity-75" />
            </div>
          </div>

          {/* Sombra de Chão Dinâmica */}
          <div className="relative w-20 sm:w-28 h-2 mx-auto mt-0.5 flex items-center justify-center">
            <div
              className={cn(
                'w-full h-full rounded-full bg-black/80 blur-sm transition-all',
                !reducedMotion && 'animate-vault-shadow'
              )}
            />
          </div>
        </div>
      )}
    </>
  )
}
