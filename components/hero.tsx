import Image from 'next/image'
import Link from 'next/link'
import { Play, Trophy, Sparkles, MapPin, Award, Crown, Swords, ArrowRight, Flame } from 'lucide-react'
import { PortugalHeroMap } from '@/components/portugal-hero-map'
import { cn } from '@/lib/utils'

const HERO_STATS = [
  {
    icon: Sparkles,
    value: '+1.000',
    label: 'Perguntas Oficiais',
    sub: '18 categorias temáticas',
    tone: 'text-primary',
  },
  {
    icon: MapPin,
    value: '18 + 2',
    label: 'Distritos & Regiões',
    sub: 'Continente, Açores e Madeira',
    tone: 'text-accent',
  },
  {
    icon: Award,
    value: '21 Níveis',
    label: 'Progressão RPG',
    sub: 'De Curioso a Mestre',
    tone: 'text-gold',
  },
  {
    icon: Crown,
    value: '1 Topo',
    label: 'Rei do Distrito',
    sub: 'Conquista territorial',
    tone: 'text-flag-red',
  },
]

export function Hero() {
  return (
    <section id="top" className="relative mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pb-12 lg:pt-6">
      {/* Main Hero Grid: Left Copy & Right 3D Living Hologram Map */}
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        {/* Top/Left: Copy & Action Controls */}
        <div className="order-1 flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Live Eyebrows & Guzmania Symbol Badge */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
            {/* Live Eyebrow Cyber Tag */}
            <div
              className="animate-rise inline-flex items-center gap-2.5 rounded-full border border-emerald-400/40 bg-emerald-950/60 px-4 py-1.5 text-xs font-black uppercase tracking-[0.24em] text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] backdrop-blur-xl"
              style={{ animationDelay: '40ms' }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
              </span>
              <span>O Grande Quiz Nacional 🇵🇹</span>
            </div>

            {/* Guzmania Symbol Mini Badge */}
            <a
              href="#simbolo"
              className="animate-rise group inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/60 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)] backdrop-blur-xl transition hover:scale-105 hover:border-rose-400"
              style={{ animationDelay: '80ms' }}
            >
              <div className="relative h-4 w-4 overflow-hidden rounded-full border border-rose-400/60">
                <Image
                  src="/images/guzmania-hero.png"
                  alt="Guzmania"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-rose-400" />
                A Chama do Saber
              </span>
            </a>
          </div>

          {/* 3D Volumetric Chrome Headline */}
          <h1
            className="animate-rise mt-3 sm:mt-5 font-display text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.88] tracking-tight uppercase select-none"
            style={{ animationDelay: '120ms' }}
          >
            <span className="block text-3d-chrome">ACORDA</span>
            <span className="block text-3d-neon-green mt-1">PORTUGAL</span>
          </h1>

          {/* Placa Digital LED / Arcade Futurista */}
          <div
            className="animate-rise mt-3 sm:mt-4 plate-led-arcade"
            style={{ animationDelay: '180ms' }}
          >
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <span className="font-display text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-amber-300">
              Desafio Nacional • Edição Oficial
            </span>
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
          </div>

          <p
            className="animate-rise mt-4 max-w-md sm:max-w-lg text-pretty text-sm sm:text-base leading-relaxed text-muted-foreground font-medium"
            style={{ animationDelay: '240ms' }}
          >
            Testa o teu conhecimento. Representa o teu distrito. Conquista o topo de Portugal no maior videojogo de trivia nacional.
          </p>

          {/* Action CTAs: 3D Console/Mech Gaming Buttons */}
          <div
            className="animate-rise mt-7 flex w-full flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-4"
            style={{ animationDelay: '300ms' }}
          >
            {/* Primary Mech Emerald Button */}
            <Link
              href="/jogar"
              className="btn-mech-emerald light-sweep w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-4 font-display text-base sm:text-lg font-black uppercase tracking-wider text-emerald-950 cursor-pointer shadow-xl hover:scale-105 transition-all duration-300 shadow-emerald-500/30"
            >
              <Play className="h-5 w-5 fill-current text-emerald-950 drop-shadow-sm" />
              <span>Jogar Agora</span>
            </Link>

            {/* Duelo 1v1 Fast Match Mech Button */}
            <Link
              href="/jogar/duelo"
              className="btn-mech-purple w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-4 font-display text-sm sm:text-base font-black uppercase tracking-wider text-white cursor-pointer shadow-xl hover:scale-105 transition-all duration-300 shadow-purple-500/30"
            >
              <Swords className="h-5 w-5 drop-shadow-sm" />
              <span>Duelo 1v1</span>
            </Link>

            {/* Rankings Mech Gold Button */}
            <Link
              href="/rankings"
              className="btn-mech-gold w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-4 font-display text-sm sm:text-base font-bold uppercase tracking-wider text-gold-foreground backdrop-blur-xl cursor-pointer shadow-xl hover:scale-105 transition-all duration-300 shadow-amber-500/30"
            >
              <Trophy className="h-4 w-4 text-gold" />
              <span className="text-gold">Rankings</span>
            </Link>
          </div>

          {/* Quick Hub Links */}
          <div
            className="animate-rise mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs font-bold text-muted-foreground"
            style={{ animationDelay: '360ms' }}
          >
            <Link href="/categorias" className="hover:text-primary transition flex items-center gap-1.5 group">
              <span className="group-hover:translate-x-0.5 transition">📚 18 Categorias</span>
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/portugal" className="hover:text-accent transition flex items-center gap-1.5 group">
              <span className="group-hover:translate-x-0.5 transition">🇵🇹 Mapa Territorial</span>
            </Link>
            <span className="text-white/20">•</span>
            <Link href="#faq" className="hover:text-emerald-300 transition flex items-center gap-1.5 group">
              <span className="group-hover:translate-x-0.5 transition">❓ Perguntas Frequentes</span>
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/explorar" className="hover:text-gold transition flex items-center gap-1.5 group">
              <span className="group-hover:translate-x-0.5 transition">✨ Explorar / Sobre</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>

        {/* Bottom/Right: 3D Holographic Portugal Map with Pedestal */}
        <div className="order-2 w-full animate-rise mt-2 lg:mt-0 holo-pedestal" style={{ animationDelay: '200ms' }}>
          <PortugalHeroMap />
        </div>
      </div>

      {/* Transition Statistics Bar: Holographic Glassmorphism Cards */}
      <div className="mt-10 sm:mt-14 pt-8 border-t border-white/10">
        <div className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
          {HERO_STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="card-hud-cyber group relative overflow-hidden rounded-3xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/[0.06] transition-transform duration-300 group-hover:scale-110 shadow-md">
                    <Icon className={cn('h-5 w-5', stat.tone)} />
                  </div>
                  <div>
                    <dd className="font-display text-xl sm:text-2xl font-black text-foreground">
                      {stat.value}
                    </dd>
                    <dt className="text-xs font-bold text-foreground/90 uppercase tracking-wider">{stat.label}</dt>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-snug font-medium">
                  {stat.sub}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

