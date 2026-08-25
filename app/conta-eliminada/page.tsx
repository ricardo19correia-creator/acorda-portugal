'use client'

import Link from 'next/link'
import { ShieldCheck, UserPlus, Home } from 'lucide-react'

export default function ContaEliminadaPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <h1 className="text-2xl font-black text-white uppercase tracking-wider mb-2 font-display">
          Conta Eliminada
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Todos os teus dados de jogo, progresso de XP, moedas e cosméticos foram permanentemente removidos da nossa base de dados.
        </p>

        <div className="space-y-3">
          <Link
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            href="/entrar?mode=register"
          >
            <UserPlus className="w-4 h-4" />
            Criar Nova Conta
          </Link>

          <Link
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all border border-slate-700/60 active:scale-[0.98]"
            href="/"
          >
            <Home className="w-4 h-4" />
            Voltar ao Início
          </Link>
        </div>
      </div>
    </main>
  )
}
