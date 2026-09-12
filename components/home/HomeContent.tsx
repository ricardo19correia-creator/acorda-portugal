'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Sparkles, ChevronRight } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { VALID_DISTRICTS, type ValidDistrict } from '@/data/districts'

export default function HomeContent() {
  const router = useRouter()
  const { user, profile } = useAuth()

  // 1. Distrito do Jogador (Dinamismo seguro com fallback para Vila Real)
  const [district, setDistrict] = useState<string>('Vila Real')

  useEffect(() => {
    let d: string | null = null

    if (profile?.district && profile.district.trim() !== '') {
      d = profile.district.trim()
    } else if (profile?.representedDistrict && profile.representedDistrict.trim() !== '') {
      d = profile.representedDistrict.trim()
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user_district')
      if (saved && saved.trim() !== '') d = saved.trim()
    }

    if (d && VALID_DISTRICTS.includes(d as ValidDistrict)) {
      setDistrict(d)
    } else {
      setDistrict('Vila Real')
    }
  }, [profile?.district, profile?.representedDistrict])

  // Navegação suave com Router e fallback
  const handleNavigate = (path: string) => {
    try {
      router.push(path)
    } catch {
      window.location.href = path
    }
  }

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-lg mx-auto min-h-[calc(100dvh-130px)] px-4 pt-3 pb-6 sm:pb-8 gap-4">
      
      {/* 1. Banner de Guerra Premium Distrital */}
      <div className="group relative w-full max-w-md rounded-2xl border border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)] bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-amber-950/30 backdrop-blur-md p-4 sm:p-5 transition-all duration-300 hover:border-amber-400/80 hover:shadow-[0_0_35px_rgba(245,158,11,0.35)] overflow-hidden">
        {/* Linha metálica chanfrada superior com gradiente e brilho dourado */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
        {/* Reflexo chanfrado lateral */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />

        {/* Header com Tag Soberania Distrital */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
            Soberania Distrital
          </div>
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
            Guerra Ativa
          </span>
        </div>

        {/* Tipografia com impacto e Brasão / Coroa Dourada */}
        <div className="flex items-center gap-3 mt-1">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-amber-900/20 border border-amber-500/60 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.35)] shrink-0 group-hover:scale-105 transition-transform">
            <Crown className="w-6 h-6 text-amber-400 fill-amber-400/25 drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white drop-shadow-sm truncate">
              Distrito de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">{district}</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-amber-100/70 mt-0.5 leading-snug">
              Defende o teu território na Guerra dos Distritos e sobe no ranking nacional.
            </p>
          </div>
        </div>

        {/* Botão de Ação Imponente: Gradiente Ciano/Dourado com Brilho Neon e Texto em Bold */}
        <button 
          type="button"
          onClick={() => handleNavigate('/meu-distrito')}
          className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-400 hover:from-cyan-400 hover:via-teal-300 hover:to-amber-300 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.45),0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_28px_rgba(6,182,212,0.6),0_0_35px_rgba(245,158,11,0.45)] cursor-pointer"
        >
          <span>MEU DISTRITO</span>
          <span className="text-base font-black">→</span>
        </button>
      </div>

      {/* O modelo / estátua do D. Afonso Henriques respira livremente aqui no centro */}
      <div className="flex-1 min-h-[100px] sm:min-h-[160px] w-full pointer-events-none" />

      {/* 2. Barra Horizontal de Acesso Rápido aos 18 Temas (Compacto e Elegante com Neon Ciano) */}
      <button 
        type="button"
        onClick={() => handleNavigate('/categorias')}
        className="group relative w-full max-w-md p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-950/95 to-cyan-950/40 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.45)] hover:bg-slate-900/95 backdrop-blur-md flex items-center justify-between transition-all duration-300 cursor-pointer active:scale-[0.99] text-left"
      >
        {/* Brilho neon superior */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)] group-hover:scale-105 group-hover:bg-cyan-500/25 group-hover:text-white transition-all shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 group-hover:text-cyan-200 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-wide text-white uppercase group-hover:text-cyan-300 transition-colors truncate">
                18 Temas Nacionais
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                MODOS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors truncate">
              História, Desporto, Tradição, Desafio Visual e mais
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-cyan-400 text-xs font-bold uppercase tracking-wider pl-2 group-hover:translate-x-1 transition-transform shrink-0">
          <span className="hidden sm:inline">Explorar</span>
          <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all" />
        </div>
      </button>

    </div>
  )
}
