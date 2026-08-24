'use client'

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'

export type AppBackgroundVariant =
  | 'splash'       // 01 — Splash / Abertura
  | 'auth'         // 02 — Autenticação (Login, Registar, Recuperar)
  | 'home'         // 03 — Home / Menu Principal
  | 'profile'      // 04 — Perfil do Jogador
  | 'categories'   // 05 — Categorias de Conhecimento
  | 'quiz'         // 06 — Quiz / Perguntas (Ultra Legível)
  | 'results'      // 07 — Resultado do Quiz
  | 'victory'      // 08 — Vitória
  | 'defeat'       // 09 — Derrota
  | 'multiplayer'  // 10 — Multiplayer Lobby
  | 'matchmaking'  // 11 — Matchmaking / Radar
  | 'duel'         // 12 — Duelo 1v1
  | 'duel-result'  // 13 — Resultado do Duelo
  | 'ranking'      // 14 — Ranking & Classificação
  | 'challenges'   // 15 — Desafios & Missões
  | 'achievements' // 16 — Conquistas
  | 'rewards'      // 17 — Recompensas
  | 'shop'         // 18 — Loja Geral
  | 'powerups'     // 19 — Ajudas & Power-ups
  | 'settings'     // 20 — Definições & Segurança
  | 'about'        // 21 — Sobre / Explorar
  | 'support'      // 22 — Suporte & Ajuda
  | 'offline'      // 23 — Sem Ligação / Offline
  | 'not-found'    // 24 — 404 / Página Inexistente
  | 'default'

const VARIANT_IMAGE_MAP: Record<AppBackgroundVariant, string> = {
  splash: '/images/backgrounds/bg-01-splash.svg',
  auth: '/images/backgrounds/bg-02-auth.svg',
  home: '/images/afonso-henriques-hero.jpg',
  profile: '/images/backgrounds/bg-04-profile.svg',
  categories: '/images/backgrounds/bg-05-categories.svg',
  quiz: '/images/backgrounds/bg-06-quiz.svg',
  results: '/images/backgrounds/bg-07-results.svg',
  victory: '/images/backgrounds/bg-08-victory.svg',
  defeat: '/images/backgrounds/bg-09-defeat.svg',
  multiplayer: '/images/backgrounds/bg-10-multiplayer.svg',
  matchmaking: '/images/backgrounds/bg-11-matchmaking.svg',
  duel: '/images/backgrounds/bg-12-duel.svg',
  'duel-result': '/images/backgrounds/bg-13-duel-result.svg',
  ranking: '/images/backgrounds/bg-14-ranking.svg',
  challenges: '/images/backgrounds/bg-15-challenges.svg',
  achievements: '/images/backgrounds/bg-16-achievements.svg',
  rewards: '/images/backgrounds/bg-17-rewards.svg',
  shop: '/images/backgrounds/bg-18-shop.svg',
  powerups: '/images/backgrounds/bg-19-powerups.svg',
  settings: '/images/backgrounds/bg-20-settings.svg',
  about: '/images/backgrounds/bg-21-about.svg',
  support: '/images/backgrounds/bg-22-support.svg',
  offline: '/images/backgrounds/bg-23-offline.svg',
  'not-found': '/images/backgrounds/bg-24-not-found.svg',
  default: '/images/afonso-henriques-hero.jpg',
}

interface AppBackgroundProps {
  variant?: AppBackgroundVariant
  /** Permite sobrepor uma imagem personalizada (ex.: Arena equipada) preservando as máscaras de contraste */
  customImage?: string
  /** Intensidade do escurecimento para legibilidade da UI ('subtle' | 'normal' | 'strong') */
  contrastIntensity?: 'subtle' | 'normal' | 'strong'
  showParticles?: boolean
  className?: string
  children?: React.ReactNode
}

export function AppBackground({
  variant = 'home',
  customImage,
  contrastIntensity = 'normal',
  showParticles = true,
  className,
  children,
}: AppBackgroundProps) {
  const bgImage = customImage || VARIANT_IMAGE_MAP[variant] || VARIANT_IMAGE_MAP.home

  // Partículas subtis contextualizadas por tema
  const particles = useMemo(() => {
    if (!showParticles) return []

    const particleCount = variant === 'quiz' ? 8 : 18
    return Array.from({ length: particleCount }).map((_, i) => {
      let colorType = 'emerald'
      if (['victory', 'ranking', 'rewards', 'achievements'].includes(variant)) {
        colorType = i % 2 === 0 ? 'gold' : 'emerald'
      } else if (['multiplayer', 'duel', 'defeat'].includes(variant)) {
        colorType = i % 2 === 0 ? 'rose' : 'cyan'
      } else if (['about', 'shop', 'not-found'].includes(variant)) {
        colorType = i % 3 === 0 ? 'purple' : i % 3 === 1 ? 'emerald' : 'gold'
      } else if (['profile', 'matchmaking', 'powerups'].includes(variant)) {
        colorType = i % 2 === 0 ? 'cyan' : 'emerald'
      }

      return {
        id: i,
        left: `${(i * 41) % 100}%`,
        size: 2 + ((i * 5) % 3),
        delay: `${(i % 6) * 1.8}s`,
        duration: `${14 + ((i * 7) % 10)}s`,
        colorType,
      }
    })
  }, [variant, showParticles])

  const isCustomArena = !!customImage

  // Intensidade das camadas de contraste
  const vignetteOverlayClass = isCustomArena
    ? contrastIntensity === 'strong'
      ? 'bg-gradient-to-b from-black/50 via-transparent to-black/60'
      : contrastIntensity === 'normal'
      ? 'bg-gradient-to-b from-black/30 via-transparent to-black/40'
      : 'bg-transparent'
    : contrastIntensity === 'strong'
      ? 'bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-slate-950/98'
      : contrastIntensity === 'subtle'
      ? 'bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950/80'
      : 'bg-gradient-to-b from-slate-950/85 via-slate-950/65 to-slate-950/95'

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none bg-slate-950',
        className
      )}
    >
      {/* 1. Imagem de Fundo Oficial Vetorial com Aceleração de Hardware */}
      <div
        className={cn(
          'absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-700 will-change-transform scale-[1.01]',
          isCustomArena ? 'opacity-100' : 'opacity-90'
        )}
        style={{
          backgroundImage: `url('${bgImage}')`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* 2. Máscara Radial de Segurança Central (Apenas se não for arena limpa ou se contrastIntensity exigir) */}
      {!isCustomArena && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 75% 65% at 50% 45%, rgba(2, 6, 23, 0.2) 0%, rgba(2, 6, 23, 0.8) 75%, rgba(2, 6, 23, 0.98) 100%)',
          }}
        />
      )}

      {/* 3. Camada de Gradiente Linear Vertical Suave */}
      <div className={cn('absolute inset-0 pointer-events-none', vignetteOverlayClass)} />

      {/* 4. Micropartículas Lançadas em Segundo Plano */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <span
              key={p.id}
              className={cn(
                'animate-drift absolute bottom-0 rounded-full pointer-events-none opacity-60',
                p.colorType === 'gold'
                  ? 'bg-amber-300 shadow-[0_0_8px_#f59e0b]'
                  : p.colorType === 'rose'
                  ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]'
                  : p.colorType === 'cyan'
                  ? 'bg-cyan-300 shadow-[0_0_8px_#06b6d4]'
                  : p.colorType === 'purple'
                  ? 'bg-purple-300 shadow-[0_0_8px_#a855f7]'
                  : 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
              )}
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>
      )}

      {children}
    </div>
  )
}
