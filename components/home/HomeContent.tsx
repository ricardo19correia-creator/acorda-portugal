'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
    <>
      <div className="flex flex-col items-center justify-between w-full max-w-lg mx-auto min-h-[calc(100dvh-120px)] px-4 pb-28 pt-4 gap-5">
        
        {/* 1. Card de Território Distrital (Sem Concelho) */}
        <div className="w-full max-w-md rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md p-4 shadow-lg shadow-cyan-950/30 transition-all hover:border-cyan-500/50">
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
            Soberania Distrital
          </span>
          <h3 className="text-lg font-black text-white mt-1">
            Distrito de {district}
          </h3>
          <p className="text-xs text-slate-300 mt-0.5 mb-3 leading-relaxed">
            Defende o teu território na Guerra dos Distritos e sobe no ranking nacional.
          </p>
          
          <button 
            type="button"
            onClick={() => handleNavigate('/meu-distrito')}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
          >
            <span>MEU DISTRITO</span>
            <span>→</span>
          </button>
        </div>

        {/* O modelo / estátua respira livremente aqui no fundo */}
        <div className="flex-1 min-h-[80px] sm:min-h-[140px] w-full pointer-events-none" />

        {/* 2. Modos Especiais (Sem Mapa, Sem Loja, Sem Rankings) */}
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Outros Modos</span>
          </div>

          {/* Categorias */}
          <button 
            type="button"
            onClick={() => handleNavigate('/categorias')}
            className="w-full p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-cyan-500/50 backdrop-blur-md flex items-center justify-between transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
                ⊞
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">Categorias</div>
                <div className="text-[11px] text-slate-400">Explorar os 18 temas nacionais</div>
              </div>
            </div>
            <span className="text-slate-500 text-sm">›</span>
          </button>

          {/* Grelha Rápida: Modo Maluco & Desafio Visual */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => handleNavigate('/modo-maluco')}
              className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-500/60 backdrop-blur-md flex flex-col items-start gap-1 transition-all cursor-pointer text-left"
            >
              <span className="text-purple-400 text-base">🤪</span>
              <div className="text-xs font-bold text-white mt-1">Modo Maluco</div>
              <div className="text-[10px] text-slate-400">Humor e caos</div>
            </button>

            <button 
              type="button"
              onClick={() => handleNavigate('/desafio-visual')}
              className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-500/60 backdrop-blur-md flex flex-col items-start gap-1 transition-all cursor-pointer text-left"
            >
              <span className="text-cyan-400 text-base">👁️</span>
              <div className="text-xs font-bold text-white mt-1">Desafio Visual</div>
              <div className="text-[10px] text-slate-400">Perguntas por imagem</div>
            </button>
          </div>
        </div>

      </div>
    </>
  )
}
