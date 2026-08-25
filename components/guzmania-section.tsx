'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Flame, Crown, Trees, Swords, Trophy, ArrowRight, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'

export function GuzmaniaSection() {
  const router = useRouter()
  const { user } = useAuth()

  const handleStartJourney = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user && !auth?.currentUser) {
      router.push('/entrar?redirect=/jogar')
      return
    }
    router.push('/jogar')
  }
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* Decorative Glow Ambient Layer */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[38rem] w-full max-w-5xl rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(239,68,68,0.18)_0%,_rgba(16,185,129,0.15)_45%,_transparent_75%)] blur-3xl" />

      {/* Main Glassmorphism Featured Card */}
      <div className="relative overflow-hidden rounded-4xl border border-white/15 bg-gradient-to-b from-white/[0.08] via-black/40 to-black/80 p-6 sm:p-10 lg:p-14 shadow-2xl backdrop-blur-2xl">
        {/* Subtle Cyber Grid & Corner Tech Accents */}
        <div className="absolute inset-0 pattern-azulejo-cyber opacity-15 pointer-events-none" />
        <div className="absolute top-0 right-0 h-40 w-40 bg-rose-500/15 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-40 w-40 bg-emerald-500/15 blur-2xl pointer-events-none" />

        {/* Section Header Tag */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/60 px-4 py-1.5 text-xs font-black uppercase tracking-[0.24em] text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] backdrop-blur-xl">
            <Flame className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
            <span>O Símbolo do Desafio Nacional</span>
          </div>

          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-foreground">
            A Chama Viva do Saber — <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">O Nosso Símbolo</span>
          </h2>
        </div>

        {/* 2-Column Content: Left 3D Plant Display & Right Narrative */}
        <div className="mt-8 sm:mt-12 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          {/* Left: 3D Plant Holographic Showcase */}
          <div className="relative flex items-center justify-center">
            {/* Ambient Radial Halo */}
            <div className="absolute h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-[radial-gradient(circle,_rgba(244,63,94,0.25)_0%,_rgba(16,185,129,0.2)_50%,_transparent_75%)] blur-2xl animate-glow-pulse" />

            {/* Glowing Showcase Frame */}
            <div className="group relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-white/10 via-black/50 to-black/90 p-4 sm:p-6 shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all duration-500 hover:border-emerald-400/50 hover:shadow-[0_0_50px_rgba(244,63,94,0.35)]">
              {/* Top Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-[0.7rem] font-black uppercase tracking-widest text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Guzmania Vermelha
                </span>
                <span className="text-muted-foreground font-mono">Símbolo Oficial</span>
              </div>

              {/* Plant Image with 3D Depth */}
              <div className="relative my-3 aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-inner">
                <Image
                  src="/images/guzmania-symbol.png"
                  alt="Guzmania Vermelha — A Planta do Acorda Portugal"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority
                />

                {/* Ambient Floor Glow Reflex */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-amber-400/40 bg-amber-950/70 px-3 py-1 text-[0.65rem] font-black uppercase tracking-widest text-amber-300 backdrop-blur-md shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                  ⚡ Energia • Conhecimento • Raízes
                </div>
              </div>

              {/* Plant Footer Caption */}
              <p className="text-center text-[0.75rem] text-muted-foreground font-medium">
                Cores de Portugal: As folhas esmeralda sustentam a coroa rubra ardente.
              </p>
            </div>
          </div>

          {/* Right: Narrative & Value Pillars */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            {/* Narrative Quote Box */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 backdrop-blur-md shadow-lg">
              <p className="text-sm sm:text-base leading-relaxed text-foreground/90 font-medium">
                &ldquo;No centro do <strong>Acorda Portugal</strong> está a nossa planta viva de topo rubro: símbolo da perseverança, da coroa do conhecimento e da energia que não dorme. Tal como a sua flor que resiste e floresce no topo, cada jogador sobe no ranking distrital com garra, inteligência e paixão pelas nossas raízes. É o coração ardente do desafio nacional.&rdquo;
              </p>
            </div>

            {/* 3 Pillars of Value (Raízes, A Chama, A Coroa) */}
            <div className="grid gap-3.5 sm:grid-cols-3">
              {/* 🟢 Raízes */}
              <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:bg-emerald-950/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Trees className="h-4 w-4" />
                  </div>
                  <span className="font-display text-sm font-black uppercase tracking-wider text-emerald-300">
                    Raízes
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground font-medium leading-snug">
                  Conhecimento profundo de cada distrito, concelho e freguesia de Portugal.
                </p>
              </div>

              {/* 🔴 A Chama */}
              <div className="group relative overflow-hidden rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-rose-400 hover:bg-rose-950/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.25)]">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-rose-500/20 text-rose-400">
                    <Flame className="h-4 w-4" />
                  </div>
                  <span className="font-display text-sm font-black uppercase tracking-wider text-rose-300">
                    A Chama
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground font-medium leading-snug">
                  A velocidade, audácia e adrenalina tática nas arenas de Duelo 1v1.
                </p>
              </div>

              {/* 🟡 A Coroa */}
              <div className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:bg-amber-950/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                    <Crown className="h-4 w-4" />
                  </div>
                  <span className="font-display text-sm font-black uppercase tracking-wider text-amber-300">
                    A Coroa
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground font-medium leading-snug">
                  A glória máxima e reconhecimento no topo do Ranking Nacional.
                </p>
              </div>
            </div>

            {/* CTA Link to Play */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                type="button"
                onClick={handleStartJourney}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-6 py-3.5 font-display text-sm font-black uppercase tracking-wider text-black shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105 hover:brightness-110 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Iniciar a Tua Jornada</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href="/explorar"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-white/10 hover:text-white"
              >
                <span>Saber Mais Sobre o Jogo</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
