'use client'

import React, { useState } from 'react'
import { Trophy, Coins, Sparkles, Shield, ChevronRight, Eye, Crown, Flame, Award } from 'lucide-react'
import {
  PortoLisboaPrize3D,
  TrophySupremo3D,
  MedalPrata3D,
  MedalBronze3D,
  type TrophyPlacement,
  type TrophyTeamSide,
} from './PortoLisboaTrophy3D'
import { PortoLisboaPrizeModal, OFFICIAL_PORTO_LISBOA_PRIZES } from './PortoLisboaPrizeModal'
import { cn } from '@/lib/utils'

interface PortoLisboaShowcaseProps {
  userTeam?: TrophyTeamSide
  userRankPosition?: number | null
  eventStatus?: 'upcoming' | 'active' | 'ended'
  className?: string
}

export function PortoLisboaShowcase({
  userTeam = null,
  userRankPosition = null,
  eventStatus = 'active',
  className,
}: PortoLisboaShowcaseProps) {
  const [selectedPlacement, setSelectedPlacement] = useState<TrophyPlacement | null>(null)

  // Verifica se o jogador conquistou oficialmente o prémio (apenas após o encerramento do evento e se ficou no Top 3)
  const isConqueredByPlayer = (placement: TrophyPlacement) => {
    return eventStatus === 'ended' && userRankPosition === placement
  }

  return (
    <>
      <section
        aria-label="O Que Podes Conquistar — Prémios Oficiais Porto × Lisboa 2026"
        className={cn(
          'relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#080f24]/98 via-[#040817]/98 to-slate-950 p-5 sm:p-8 lg:p-10 shadow-[0_0_60px_rgba(0,0,0,0.85)] space-y-6 sm:space-y-8 backdrop-blur-2xl text-left select-none',
          className
        )}
      >
        {/* Iluminação Ambiente Superior */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 via-amber-400 to-rose-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Cabeçalho da Secção */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-widest">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>Vitrine Oficial de Recompensas</span>
            </div>

            <h2 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <span>🏆 O QUE PODES CONQUISTAR</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Termina no <strong>Top 3 Nacional</strong> para gravar o teu nome na história do Acorda Portugal e desbloquear títulos míticos, troféus 3D e até <strong>50.000 Acordas</strong> permanentes.
            </p>
          </div>

          {/* Destaque da Fação do Jogador */}
          <div className="text-left sm:text-right shrink-0">
            {userTeam === 'porto' ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-blue-950/80 border border-blue-400/50 text-blue-300 text-xs font-black shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                <span>🔵</span>
                <span className="uppercase tracking-wider">A Defender a Invicta (Porto)</span>
              </div>
            ) : userTeam === 'lisboa' ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-rose-950/80 border border-rose-400/50 text-rose-300 text-xs font-black shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <span>🔴</span>
                <span className="uppercase tracking-wider">A Defender a Capital (Lisboa)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900 border border-white/10 text-slate-400 text-xs font-bold">
                <span>⚔️</span>
                <span>Escolhe o teu lado e entra na disputa</span>
              </div>
            )}
            <p className="text-[10px] text-slate-400 mt-1">
              Toca num prémio para inspecionar em alta resolução 3D
            </p>
          </div>
        </div>

        {/* Grelha dos 3 Prémios — 1.º Lugar Dominante ao Centro ou Primeira Posição */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          {/* ================================================================= */}
          {/* 🥈 2.º LUGAR — SENHOR DA RIVALIDADE                                */}
          {/* ================================================================= */}
          <div
            onClick={() => setSelectedPlacement(2)}
            className="group relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-950 border border-slate-300/40 hover:border-slate-200 shadow-xl hover:shadow-[0_0_30px_rgba(226,232,240,0.25)] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden hover:-translate-y-1"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

            <div className="space-y-3">
              {/* Badge Superior */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-200 font-black text-[10px] uppercase tracking-wider border border-slate-600 shadow">
                  🥈 2.º LUGAR
                </span>

                {isConqueredByPlayer(2) ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[10px] font-black uppercase">
                    🏆 Conquistado
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 text-amber-300/90 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                    Em Disputa
                  </span>
                )}
              </div>

              {/* Renderização 3D da Medalha de Prata */}
              <div className="h-44 sm:h-52 flex items-center justify-center my-2">
                <MedalPrata3D teamSide={userTeam} size="md" interactive={false} />
              </div>

              {/* Título e Troféu */}
              <div className="space-y-1 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                  TÍTULO LENDÁRIO
                </p>
                <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white group-hover:text-slate-200 transition-colors">
                  SENHOR DA RIVALIDADE
                </h3>
                <p className="text-[11px] font-bold text-slate-400">
                  MEDALHA DE PRATA — PORTO × LISBOA 2026
                </p>
              </div>
            </div>

            {/* Recompensa em Acordas */}
            <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
              <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-slate-300" />
                  <span className="text-xs font-bold text-slate-300">Recompensa</span>
                </div>
                <span className="font-display text-base font-black text-slate-200">
                  30.000 Acordas
                </span>
              </div>

              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">
                <Eye className="h-3.5 w-3.5" />
                <span>Toca para ver detalhes em 3D</span>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* 🥇 1.º LUGAR — REI DA RIVALIDADE (TROFÉU SUPREMO — DESTAQUE MÁXIMO) */}
          {/* ================================================================= */}
          <div
            onClick={() => setSelectedPlacement(1)}
            className="group relative rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-amber-950/40 via-slate-900/95 to-slate-950 border-2 border-amber-400/80 hover:border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_55px_rgba(245,158,11,0.5)] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden hover:-translate-y-1.5 md:-mt-3 md:mb-[-12px] ring-2 ring-amber-400/30"
          >
            {/* Faixa de Destaque Superior */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-amber-300 to-rose-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]" />

            {/* Brilho Dourado de Fundo */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none group-hover:bg-amber-500/30 transition-all" />

            <div className="space-y-3 relative z-10">
              {/* Badge Superior */}
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Crown className="h-3.5 w-3.5" />
                  <span>1.º LUGAR — CAMPEÃO</span>
                </span>

                {isConqueredByPlayer(1) ? (
                  <span className="px-3 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/60 text-[10px] font-black uppercase shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                    🏆 Conquistado
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 text-[10px] font-black uppercase tracking-wider animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    ⚔️ Prémio em Disputa
                  </span>
                )}
              </div>

              {/* Renderização 3D do Troféu Supremo em Tamanho Nobre */}
              <div className="h-52 sm:h-60 flex items-center justify-center my-1">
                <TrophySupremo3D teamSide={userTeam} size="lg" interactive={false} />
              </div>

              {/* Título e Troféu */}
              <div className="space-y-1.5 text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-400">
                  TÍTULO EXCLUSIVO MÍTICO
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white group-hover:text-amber-200 transition-colors drop-shadow-md">
                  REI DA RIVALIDADE
                </h3>
                <p className="text-xs font-bold text-slate-200">
                  TROFÉU SUPREMO — PORTO × LISBOA 2026
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Objeto comemorativo 3D com safiras, rubis e gravação comemorativa de ouro maciço.
                </p>
              </div>
            </div>

            {/* Recompensa Máxima em Acordas */}
            <div className="mt-4 pt-3.5 border-t border-white/15 space-y-2 relative z-10">
              <div className="rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border border-amber-400/60 p-3 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500 text-slate-950 font-black">
                    🪙
                  </div>
                  <span className="text-xs font-black uppercase text-amber-300">
                    Recompensa Máxima
                  </span>
                </div>
                <span className="font-display text-xl sm:text-2xl font-black text-amber-400 drop-shadow">
                  50.000 Acordas
                </span>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-300 group-hover:text-amber-200 transition-colors">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Toca para inspecionar em tamanho grande</span>
                <ChevronRight className="h-4 w-4 text-amber-400" />
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* 🥉 3.º LUGAR — GUERREIRO DA RIVALIDADE                            */}
          {/* ================================================================= */}
          <div
            onClick={() => setSelectedPlacement(3)}
            className="group relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-950 border border-amber-700/40 hover:border-amber-600 shadow-xl hover:shadow-[0_0_30px_rgba(217,119,6,0.25)] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden hover:-translate-y-1"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />

            <div className="space-y-3">
              {/* Badge Superior */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-amber-900/60 text-amber-300 font-black text-[10px] uppercase tracking-wider border border-amber-700 shadow">
                  🥉 3.º LUGAR
                </span>

                {isConqueredByPlayer(3) ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[10px] font-black uppercase">
                    🏆 Conquistado
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 text-amber-300/90 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                    Em Disputa
                  </span>
                )}
              </div>

              {/* Renderização 3D da Medalha de Bronze */}
              <div className="h-44 sm:h-52 flex items-center justify-center my-2">
                <MedalBronze3D teamSide={userTeam} size="md" interactive={false} />
              </div>

              {/* Título e Troféu */}
              <div className="space-y-1 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                  TÍTULO ÉPICO
                </p>
                <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white group-hover:text-amber-300 transition-colors">
                  GUERREIRO DA RIVALIDADE
                </h3>
                <p className="text-[11px] font-bold text-slate-400">
                  MEDALHA DE BRONZE — PORTO × LISBOA 2026
                </p>
              </div>
            </div>

            {/* Recompensa em Acordas */}
            <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
              <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-300">Recompensa</span>
                </div>
                <span className="font-display text-base font-black text-amber-400">
                  20.000 Acordas
                </span>
              </div>

              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">
                <Eye className="h-3.5 w-3.5" />
                <span>Toca para ver detalhes em 3D</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Informativo da Vitrine */}
        <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>Exclusividade Permanente:</strong> Os títulos e troféus do Top 3 são atribuídos uma única vez na história e integrados no teu perfil de jogador para sempre.
            </span>
          </div>

          <span className="shrink-0 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
            Sincronização Oficial Automática
          </span>
        </div>
      </section>

      {/* Modal Interativo de Inspeção do Prémio Selecionado */}
      <PortoLisboaPrizeModal
        placement={selectedPlacement}
        teamSide={userTeam}
        isConquered={selectedPlacement ? isConqueredByPlayer(selectedPlacement) : false}
        onClose={() => setSelectedPlacement(null)}
      />
    </>
  )
}
