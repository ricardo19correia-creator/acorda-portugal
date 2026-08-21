'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trophy, Zap, Shield, Flame, Star, Award } from 'lucide-react'

export default function PerfilPage() {
  const [mounted, setMounted] = useState(false)
  const [avatar, setAvatar] = useState('/images/avatars/camoes-2050.jpg')

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('user_equipped_avatar')
      if (saved) setAvatar(saved)
    } catch (err) {
      console.error(err)
    }
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950" />
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center">
      {/* Top Navigation */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-sm font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </Link>
        <Link 
          href="/loja"
          className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-sm font-bold transition-all"
        >
          Ir para a Loja
        </Link>
      </div>

      {/* Profile Card */}
      <div className="w-full max-w-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-emerald-400/80 shadow-[0_0_25px_rgba(52,211,153,0.35)] bg-slate-900">
              <img 
                src={avatar} 
                alt="Avatar Equipado" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Nível 2
            </span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-wide text-white">
                Riky Moreira
              </h1>
              <span className="inline-flex items-center justify-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-0.5 rounded-full w-fit mx-auto md:mx-0">
                <Shield className="w-3 h-3" /> Vila Real
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Conquistador Nacional • Membro Fundador
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <Trophy className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-xl font-black text-white">5,981</span>
            <span className="text-xs text-slate-400">XP Total</span>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <Award className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-xl font-black text-emerald-400">#1</span>
            <span className="text-xs text-slate-400">Posição Nacional</span>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <Zap className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-xl font-black text-white">88%</span>
            <span className="text-xs text-slate-400">Taxa de Acerto</span>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <Flame className="w-5 h-5 text-orange-400 mb-1" />
            <span className="text-xl font-black text-orange-400">14</span>
            <span className="text-xs text-slate-400">Vitórias em Duelo</span>
          </div>
        </div>
      </div>
    </div>
  )
}
