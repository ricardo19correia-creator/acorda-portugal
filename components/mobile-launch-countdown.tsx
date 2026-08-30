'use client'

import React, { useId, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Smartphone,
  Sparkles,
  Play,
  Swords,
  Rocket,
  ExternalLink,
  Clock,
  Apple,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import {
  MOBILE_LAUNCH_CONFIG,
  type MobileLaunchConfig,
} from '@/lib/mobile-launch-config'
import { calculateTimeRemaining, type TimeRemaining } from '@/lib/countdown'

export interface MobileLaunchCountdownProps {
  /**
   * Permite injetar uma configuração personalizada (ex: para testes ou datas alternativas)
   */
  config?: MobileLaunchConfig
  /**
   * Timestamp simulado para testes manuais e unitários (opcional)
   */
  mockCurrentTimestampMs?: number
  className?: string
}

// Hook de subscrição de tempo seguro para React 19 / SSR
function useCurrentTimestamp(mockTimestamp?: number): number {
  const [timestamp, setTimestamp] = React.useState<number>(() => mockTimestamp ?? (typeof window !== 'undefined' ? Date.now() : 0))

  React.useEffect(() => {
    if (mockTimestamp) {
      setTimestamp(mockTimestamp)
      return
    }

    setTimestamp(Date.now())
    const interval = setInterval(() => {
      setTimestamp(Date.now())
    }, 1000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimestamp(Date.now())
      }
    }

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleVisibilityChange)
    }
  }, [mockTimestamp])

  return timestamp
}

export function MobileLaunchCountdown({
  config = MOBILE_LAUNCH_CONFIG,
  mockCurrentTimestampMs,
  className,
}: MobileLaunchCountdownProps) {
  const router = useRouter()
  const accessibleId = useId()

  const currentTimestamp = useCurrentTimestamp(mockCurrentTimestampMs)

  // Cálculo da contagem regressiva em tempo real
  const timeRemaining: TimeRemaining = useMemo(() => {
    const timestampToUse = currentTimestamp > 0 ? currentTimestamp : (typeof window !== 'undefined' ? Date.now() : config.targetTimestampMs)
    return calculateTimeRemaining(config.targetTimestampMs, timestampToUse)
  }, [config.targetTimestampMs, currentTimestamp])

  const handleStartGame = (e: React.MouseEvent, route: string = '/jogar') => {
    e.preventDefault()
    router.push(route)
  }

  const { isLaunched, formatted } = timeRemaining
  const isPreLaunch = !isLaunched

  return (
    <section
      id="lancamento-mobile"
      aria-labelledby={`mobile-launch-title-${accessibleId}`}
      className={cn(
        'relative mx-auto w-full max-w-7xl px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 my-2 sm:my-6 transition-all',
        className
      )}
    >
      {/* Halo de luz ambiente português sutil (Verde Esmeralda, Dourado e Vermelho) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[28rem] sm:h-[34rem] w-full max-w-5xl rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.14)_0%,_rgba(245,158,11,0.09)_35%,_rgba(239,68,68,0.08)_65%,_transparent_80%)] blur-3xl"
      />

      {/* Cartão Central Premium de Videojogo Mobile */}
      <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl border border-white/15 bg-gradient-to-b from-white/[0.08] via-zinc-950/80 to-black/90 p-4.5 sm:p-8 md:p-10 lg:p-12 shadow-[0_16px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        {/* Padrão sutil e reflexos angulares */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 max-w-xl bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
        />

        {/* ========================================================= */}
        {/* 1. CABEÇALHO DA SECÇÃO: BADGE & TÍTULO PRINCIPAL          */}
        {/* ========================================================= */}
        <div className="flex flex-col items-center text-center">
          {isPreLaunch ? (
            /* Badge Pré-Lançamento */
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-3.5 sm:px-4 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.25)] backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              </span>
              <Rocket className="h-3.5 w-3.5 text-emerald-400" />
              <span>{config.preLaunch.badge}</span>
            </div>
          ) : (
            /* Badge Pós-Lançamento */
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/70 px-4 py-1.5 text-xs font-black uppercase tracking-[0.24em] text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)] backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>{config.postLaunch.badge}</span>
            </div>
          )}

          {/* Título Principal de Alto Impacto */}
          <h2
            id={`mobile-launch-title-${accessibleId}`}
            className="mt-4 sm:mt-5 font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground text-3d-chrome leading-[1.08] max-w-4xl"
          >
            {isPreLaunch ? config.preLaunch.title : config.postLaunch.title}
          </h2>

          {/* Subtítulo / Frase Complementar */}
          <p className="mt-3 sm:mt-4 max-w-2xl text-xs sm:text-base md:text-lg leading-relaxed text-muted-foreground font-medium">
            {isPreLaunch ? config.preLaunch.subtitle : config.postLaunch.subtitle}
          </p>

          {/* Chip de Plataformas Alvo */}
          {isPreLaunch && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-300 shadow-sm">
              <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
              <span>{config.preLaunch.platformsBadge}</span>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 2. CONTADOR REGRESSIVO REAL (ESTADO PRÉ-LANÇAMENTO)       */}
        {/* ========================================================= */}
        {isPreLaunch ? (
          <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col items-center">
            {/* Descrição Acessível para Leitores de Ecrã (Sem poluir aria-live a cada segundo) */}
            <p className="sr-only">
              {`Contagem decrescente para o lançamento mobile do Acorda Portugal: ${timeRemaining.days} dias, ${timeRemaining.hours} horas, ${timeRemaining.minutes} minutos e ${timeRemaining.seconds} segundos até 11 de setembro de 2026 às 22:00 horas.`}
            </p>

            {/* Container dos 4 Blocos Digitais HUD */}
            <div
              aria-hidden="true"
              className="w-full max-w-3xl grid grid-cols-4 gap-2 sm:gap-4 md:gap-6"
            >
              {/* Bloco 1: DIAS */}
              <CountdownDigitCard
                value={formatted.days}
                label="DIAS"
                tone="emerald"
              />

              {/* Bloco 2: HORAS */}
              <CountdownDigitCard
                value={formatted.hours}
                label="HORAS"
                tone="cyan"
              />

              {/* Bloco 3: MINUTOS */}
              <CountdownDigitCard
                value={formatted.minutes}
                label="MINUTOS"
                tone="gold"
              />

              {/* Bloco 4: SEGUNDOS */}
              <CountdownDigitCard
                value={formatted.seconds}
                label="SEGUNDOS"
                tone="rose"
              />
            </div>

            {/* Legenda de Data Oficial Fixa */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground/80 font-medium">
              <Clock className="h-3.5 w-3.5 text-emerald-400/80" />
              <span>Data Oficial: <strong>11 de setembro de 2026 às 22:00</strong> (Portugal Continental)</span>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* 3. ESTADO PÓS-LANÇAMENTO: JÁ DISPONÍVEL!                  */
          /* ========================================================= */
          <div className="mt-8 sm:mt-10 flex flex-col items-center gap-5">
            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Plataforma Android */}
              <PlatformDownloadCard platform={config.platforms.android} />

              {/* Plataforma iOS */}
              <PlatformDownloadCard platform={config.platforms.ios} />
            </div>
          </div>
        )}

        {/* Linha Divisória Sutil de Tecnologia */}
        <div className="my-7 sm:my-9 border-t border-white/10 w-full max-w-4xl mx-auto" />

        {/* ========================================================= */}
        {/* 4. BLOCOS COMPLEMENTARES: JÁ PODES TESTAR & AMIGOS        */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto w-full">
          {/* Cartão A: 🧪 JÁ PODES TESTAR (A versão de testes está online) */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4.5 sm:p-6 transition-all duration-300 hover:border-emerald-400/60 hover:bg-emerald-950/35 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-300">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  🧪
                </span>
                <span>{config.preLaunch.testSection.badge}</span>
              </div>
              <h3 className="mt-2 text-base sm:text-lg font-black text-white">
                {config.preLaunch.testSection.title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {config.preLaunch.testSection.subtitle}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={(e) => handleStartGame(e, config.preLaunch.testSection.href)}
                className="btn-mech-emerald light-sweep w-full inline-flex items-center justify-center gap-2.5 rounded-xl px-5 py-3 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-950 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Play className="h-4 w-4 fill-current text-emerald-950" />
                <span>{config.preLaunch.testSection.buttonText}</span>
              </button>
            </div>
          </div>

          {/* Cartão B: COMPETE COM UM AMIGO 🇵🇹 */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4.5 sm:p-6 transition-all duration-300 hover:border-amber-400/60 hover:bg-amber-950/35 hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-amber-500/20 text-amber-400">
                  <Swords className="h-3.5 w-3.5" />
                </span>
                <span>{isPreLaunch ? config.preLaunch.competeSection.title : config.postLaunch.competeSection.title}</span>
              </div>
              <h3 className="mt-2 text-base sm:text-lg font-black text-white">
                Duelos 1v1 & Conquista Distrital
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {isPreLaunch ? config.preLaunch.competeSection.description : config.postLaunch.competeSection.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-500/20">
              <button
                type="button"
                onClick={(e) => handleStartGame(e, '/jogar/duelo')}
                className="btn-mech-gold w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 backdrop-blur-xl cursor-pointer hover:border-amber-400 hover:text-amber-200 transition-all active:scale-[0.98]"
              >
                <Swords className="h-4 w-4 text-amber-400" />
                <span>Desafiar no Duelo 1v1</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Cartão individual para cada unidade de tempo (Dias, Horas, Minutos, Segundos)
 */
function CountdownDigitCard({
  value,
  label,
  tone = 'emerald',
}: {
  value: string
  label: string
  tone?: 'emerald' | 'cyan' | 'gold' | 'rose'
}) {
  const toneClasses = {
    emerald: 'border-emerald-500/40 text-emerald-400 group-hover:border-emerald-400 shadow-emerald-500/20',
    cyan: 'border-cyan-500/40 text-cyan-400 group-hover:border-cyan-400 shadow-cyan-500/20',
    gold: 'border-amber-500/40 text-amber-400 group-hover:border-amber-400 shadow-amber-500/20',
    rose: 'border-rose-500/40 text-rose-400 group-hover:border-rose-400 shadow-rose-500/20',
  }

  return (
    <div className="group relative flex flex-col items-center">
      {/* Display Box */}
      <div
        className={cn(
          'relative w-full aspect-square sm:aspect-[1.1/1] flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border bg-black/60 backdrop-blur-xl shadow-lg transition-all duration-300 group-hover:-translate-y-1',
          toneClasses[tone]
        )}
      >
        {/* Reflexo de vidro interno no topo */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-white/[0.08] to-transparent" />

        {/* Valor Numérico Tabular */}
        <span className="font-display sm:font-mono text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tabular-nums tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          {value}
        </span>

        {/* Linha Divisória de Cartão Split-Flap */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/10" />
      </div>

      {/* Rótulo de Texto em Baixo (DIAS, HORAS, MINUTOS, SEGUNDOS) */}
      <span className="mt-2 text-[9px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">
        {label}
      </span>
    </div>
  )
}

/**
 * Componente do botão / cartão da plataforma (Android / iOS)
 */
function PlatformDownloadCard({
  platform,
}: {
  platform: MobileLaunchConfig['platforms']['android'] | MobileLaunchConfig['platforms']['ios']
}) {
  const isAvailable = platform.status === 'available' && !!platform.url
  const isAndroid = platform.iconType === 'android'

  if (isAvailable && platform.url) {
    const isInternal = platform.url.startsWith('/')
    return (
      <Link
        href={platform.url}
        {...(!isInternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group relative flex items-center justify-between rounded-2xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/80 to-zinc-950 p-4 transition-all duration-300 hover:border-emerald-400 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] shadow-lg"
      >
        <div className="flex items-center gap-3.5">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
            {isAndroid ? <Smartphone className="h-6 w-6" /> : <Apple className="h-6 w-6" />}
          </div>
          <div className="text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Oficial • {platform.name}
            </span>
            <p className="font-display text-sm sm:text-base font-black text-white">
              {platform.buttonText}
            </p>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </Link>
    )
  }

  // Estado: Disponível em breve (sem link falso)
  return (
    <div className="relative flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left backdrop-blur-md">
      <div className="flex items-center gap-3.5">
        <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-400">
          {isAndroid ? <Smartphone className="h-6 w-6 text-slate-300" /> : <Apple className="h-6 w-6 text-slate-300" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-sm sm:text-base font-black text-white">
              {platform.name}
            </span>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
              {platform.comingSoonText}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            A aplicação móvel está em fase de publicação.
          </p>
        </div>
      </div>
    </div>
  )
}
