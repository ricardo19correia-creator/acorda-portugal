'use client'

import React from 'react'
import Link from 'next/link'

interface CategoryLauncherProps {
  className?: string
  onClick?: () => void
}

export default function CategoryLauncher({ className = '', onClick }: CategoryLauncherProps) {
  return (
    <div className={`w-full max-w-md px-4 mt-auto mb-6 ${className}`}>
      <Link
        href="/categorias"
        onClick={onClick}
        className="group relative block w-full overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/80 via-slate-950/90 to-slate-900/80 border border-cyan-500/40 p-4 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all hover:border-cyan-400 hover:shadow-[0_0_35px_rgba(6,182,212,0.3)] active:scale-[0.99] cursor-pointer"
      >
        {/* Glow Superior */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:scale-105 transition-transform">
              🏛️
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wide text-white uppercase group-hover:text-cyan-300 transition-colors">
                  Todas as Categorias
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  18 TEMAS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                História, Cultura, Desafio Visual, Modo Maluco e mais
              </p>
            </div>
          </div>

          {/* Seta Cyberpunk */}
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all">
            →
          </div>
        </div>
      </Link>
    </div>
  )
}
