'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Trophy, Zap, Shield, Flame, Award, 
  ShoppingBag, Swords, CheckCircle2, Lock, Sparkles, MapPin, Edit3 
} from 'lucide-react'
import { UserAvatar } from '@/components/user-avatar'

export default function PerfilPage() {
  const [mounted, setMounted] = useState(false)
  const [avatar, setAvatar] = useState('/images/avatars/camoes-2050.jpg')
  const [frame, setFrame] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'inventario' | 'conquistas' | 'historico'>('inventario')

  useEffect(() => {
    setMounted(true)
    const syncProfile = () => {
      try {
        const saved = localStorage.getItem('user_equipped_avatar')
        if (saved) setAvatar(saved)
        const savedFrame = localStorage.getItem('user_equipped_frame')
        if (savedFrame) setFrame(savedFrame)
      } catch (err) {
        console.error(err)
      }
    }

    syncProfile()
    window.addEventListener('avatarChanged', syncProfile)
    window.addEventListener('frameChanged', syncProfile)
    window.addEventListener('inventory_updated', syncProfile)
    window.addEventListener('storage', syncProfile)

    return () => {
      window.removeEventListener('avatarChanged', syncProfile)
      window.removeEventListener('frameChanged', syncProfile)
      window.removeEventListener('inventory_updated', syncProfile)
      window.removeEventListener('storage', syncProfile)
    }
  }, [])

  if (!mounted) return <div className="min-h-screen bg-slate-950" />

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center">
      {/* Top Navigation */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-sm font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </Link>
        <Link 
          href="/loja"
          className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          Ir para a Loja
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="w-full max-w-5xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <UserAvatar src={avatar} frameSrc={frame || undefined} size="xl" isCurrentUser={true} />
            <span className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-lg z-20">
              NÍVEL 2
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
            <div className="w-full bg-slate-800/80 rounded-full h-2.5 max-w-md mt-2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full w-[65%]" />
            </div>
            <p className="text-[11px] text-slate-500">650 / 1000 XP para Nível 3</p>
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

      {/* Tabs Navigation */}
      <div className="w-full max-w-5xl flex gap-2 mb-6 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('inventario')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'inventario'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> O Meu Inventário
        </button>
        <button
          onClick={() => setActiveTab('conquistas')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'conquistas'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Conquistas
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'historico'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Swords className="w-4 h-4" /> Histórico de Duelos
        </button>
      </div>

      {/* Tab Contents */}
      <div className="w-full max-w-5xl">
        {activeTab === 'inventario' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/70 border-2 border-emerald-500/80 rounded-xl p-4 flex flex-col items-center text-center relative group">
              <span className="absolute top-2 right-2 text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded">EQUIPADO</span>
              <div className="my-2">
                <UserAvatar src={avatar} frameSrc={frame || undefined} size="md" isCurrentUser={true} />
              </div>
              <h3 className="font-bold text-sm text-white">Avatar Ativo</h3>
              <p className="text-xs text-slate-400 mt-1">Lendário • Coleção 2050</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center border-dashed">
              <Link href="/loja" className="text-xs text-emerald-400 hover:underline font-bold flex flex-col items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Explorar mais na Loja
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'conquistas' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Lenda Transmontana</h4>
                <p className="text-xs text-slate-400">Representaste Vila Real em 10 partidas.</p>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Pódio de Ouro</h4>
                <p className="text-xs text-slate-400">Alcançaste o 1º Lugar Nacional.</p>
              </div>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 flex items-center gap-3 opacity-60">
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-500 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-300">Mestre dos 18 Distritos</h4>
                <p className="text-xs text-slate-500">Vence duelos em todas as regiões.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'historico' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800/60">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded">VITÓRIA</span>
                <div>
                  <p className="text-sm font-bold text-white">vs Suice guy (Lisboa)</p>
                  <p className="text-xs text-slate-500">Modo Duelo 1v1 • Desafio Nacional</p>
                </div>
              </div>
              <span className="text-sm font-black text-emerald-400">+250 XP</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800/60">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded">VITÓRIA</span>
                <div>
                  <p className="text-sm font-bold text-white">vs Neymar (Vila Real)</p>
                  <p className="text-xs text-slate-500">Modo Duelo 1v1 • Desafio Nacional</p>
                </div>
              </div>
              <span className="text-sm font-black text-emerald-400">+250 XP</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
