'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, User, Layers, Zap, Palette, Trophy, Globe, Check } from 'lucide-react'

type Category = 'vip' | 'avatars' | 'todos' | 'ajudas' | 'molduras' | 'titulos' | 'arenas'

interface ShopItem {
  id: string
  name: string
  category: Category
  description: string
  price: string
  priceValue: number
  isRealMoney?: boolean
  image?: string
  badge?: string
}

const SHOP_ITEMS: ShopItem[] = [
  // VIP
  { id: 'arena_neon_2088', name: 'Arena VIP: Lisboa Neon 2088', category: 'vip', description: 'Tema de jogo futurista exclusivo com silhuetas cyberpunk da Ponte 25 de Abril.', price: 'OFERTA GRÁTIS', priceValue: 0, image: '/arenas/arena-ponte-2077.jpg', badge: 'Lendário' },
  { id: 'passe_fundador', name: 'Passe Fundador da Nação', category: 'vip', description: 'Selo permanente de Fundador, +25% XP vitalício e Moldura Real 3D.', price: '2,99 €', priceValue: 2.99, isRealMoney: true, badge: 'Mítico' },
  
  // AVATARES
  { id: 'avatar_camoes_2050', name: 'Luís de Camões 2050', category: 'avatars', description: 'O poeta épico renascido com visor cibernético e louros digitais.', price: '€2.500', priceValue: 2500, image: '/images/avatars/camoes-2050.jpg', badge: 'Lendário' },
  { id: 'avatar_vulcao_acores', name: 'Guardião Vulcânico Açores', category: 'avatars', description: 'Armadura forjada nas profundezas geotérmicas de São Miguel.', price: '€3.500', priceValue: 3500, image: '/images/avatars/vulcao-acores.jpg', badge: 'Épico' },
  { id: 'avatar_lenda_futebol', name: 'Cyborg Camisola das Quinas', category: 'avatars', description: 'O derradeiro goleador cibernético nacional.', price: '€5.000', priceValue: 5000, badge: 'Exclusivo' },
  { id: 'avatar_fadista_cyber', name: 'Fadista Cyber-Alfama', category: 'avatars', description: 'Manto de néon roxo sob as vielas clássicas de Lisboa.', price: '€1.500', priceValue: 1500, badge: 'Raro' },

  // ARENAS
  { id: 'arena_ponte_2077', name: 'Ponte do Infinito 2077', category: 'arenas', description: 'Cenário cyberpunk sobre o Tejo com lasers e arranha-céus.', price: 'GRÁTIS', priceValue: 0, image: '/arenas/arena-ponte-2077.jpg', badge: 'Desbloqueado' },
  { id: 'arena_fado_alfama', name: 'Noite de Fado em Alfama', category: 'arenas', description: 'Aparência visual com tons aveludados e atmosfera intimista.', price: '€5.000', priceValue: 5000, badge: 'Épico' },
  { id: 'arena_fogo_acores', name: 'Fogo dos Açores', category: 'arenas', description: 'Brasas em ascensão e rebordo incandescente nas partidas.', price: '€20.000', priceValue: 20000, badge: 'Mítico' },

  // AJUDAS & UTILIDADES
  { id: 'ajuda_5050', name: 'Pack x5 Ajudas 50/50', category: 'ajudas', description: 'Elimina duas respostas erradas instantaneamente no quiz.', price: '€500', priceValue: 500, badge: 'Consumível' },
  { id: 'ajuda_congelar', name: 'Pack x3 Congelar Tempo', category: 'ajudas', description: 'Dá +15 segundos adicionais para responder à questão.', price: '€750', priceValue: 750, badge: 'Consumível' },

  // MOLDURAS
  { id: 'moldura_ouro_real', name: 'Moldura Ouro Real 3D', category: 'molduras', description: 'Rebordo dourado pulsante ao redor do teu avatar.', price: '€4.000', priceValue: 4000, badge: 'Exclusivo' },
  { id: 'moldura_neon_portugal', name: 'Moldura Quinas Neon', category: 'molduras', description: 'Efeito luminoso verde e rubro vivo.', price: '€2.500', priceValue: 2500, badge: 'Raro' },

  // TÍTULOS
  { id: 'titulo_patriota', name: 'Título: O Conquistador', category: 'titulos', description: 'Exibido por baixo do teu nome em todos os rankings e duelos.', price: '€1.000', priceValue: 1000, badge: 'Honorífico' }
]

export default function LojaPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<Category>('vip')
  const [equippedAvatar, setEquippedAvatar] = useState<string>('')
  const [equippedArena, setEquippedArena] = useState<string>('arena_ponte_2077')
  const [userBalance, setUserBalance] = useState<number>(803845)

  useEffect(() => {
    setMounted(true)
    try {
      const savedAvatar = localStorage.getItem('user_equipped_avatar')
      if (savedAvatar) setEquippedAvatar(savedAvatar)
      const savedArena = localStorage.getItem('equipped_arena')
      if (savedArena) setEquippedArena(savedArena)
      const savedEuros = localStorage.getItem('user_euros')
      if (savedEuros) setUserBalance(Number(savedEuros))
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleEquipItem = (item: ShopItem) => {
    if (item.category === 'avatars' && item.image) {
      setEquippedAvatar(item.image)
      localStorage.setItem('user_equipped_avatar', item.image)
      window.dispatchEvent(new Event('avatarChanged'))
    } else if (item.category === 'arenas') {
      setEquippedArena(item.id)
      localStorage.setItem('equipped_arena', item.id)
    }
  }

  if (!mounted) return <div className="min-h-screen bg-slate-950" />

  const filteredItems = SHOP_ITEMS.filter((item) => {
    if (activeTab === 'todos') return true
    return item.category === activeTab
  })

  return (
    <div className="min-h-screen w-full bg-[#070d14] text-white p-4 md:p-8 flex flex-col items-center">
      {/* Top Navigation */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-4">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-sm font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </Link>
      </div>

      {/* Store Header Banner */}
      <div className="w-full max-w-6xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div>
          <span className="text-xs font-black tracking-widest text-emerald-400 uppercase block mb-1">
            ECONOMIA OFICIAL & MERCADO
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-wider text-white">
            LOJA ACORDA PORTUGAL
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Adquire avatares épicos, ajudas de jogo, molduras vivas, títulos e arenas 3D exclusivas.
          </p>
        </div>

        <div className="bg-black/50 border border-amber-500/30 rounded-2xl px-6 py-3 text-right shadow-inner min-w-[220px]">
          <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase block mb-0.5">
            O TEU SALDO VIRTUAL
          </span>
          <div className="text-2xl font-black text-amber-300">
            €{userBalance.toLocaleString('pt-PT')} <span className="text-xs text-amber-400 font-bold">€ Acorda</span>
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="w-full max-w-6xl flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveTab('vip')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === 'vip'
              ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'bg-slate-900/70 text-amber-400 border border-amber-500/30 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> EXCLUSIVOS VIP (€)
        </button>

        <button
          onClick={() => setActiveTab('avatars')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === 'avatars'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'bg-slate-900/70 text-cyan-400 border border-cyan-500/30 hover:bg-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" /> LOJA DE AVATARES
        </button>

        <button
          onClick={() => setActiveTab('todos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'todos'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900/70 text-emerald-400 border border-emerald-500/30 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Todos os Itens (€ Acorda)
        </button>

        <button
          onClick={() => setActiveTab('ajudas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'ajudas'
              ? 'bg-amber-400 text-slate-950'
              : 'bg-slate-900/70 text-slate-300 border border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> Ajudas & Utilidades
        </button>

        <button
          onClick={() => setActiveTab('molduras')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'molduras'
              ? 'bg-purple-500 text-slate-950'
              : 'bg-slate-900/70 text-slate-300 border border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" /> Molduras
        </button>

        <button
          onClick={() => setActiveTab('titulos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'titulos'
              ? 'bg-yellow-500 text-slate-950'
              : 'bg-slate-900/70 text-slate-300 border border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" /> Títulos
        </button>

        <button
          onClick={() => setActiveTab('arenas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'arenas'
              ? 'bg-blue-500 text-slate-950 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
              : 'bg-slate-900/70 text-blue-400 border border-blue-500/30 hover:bg-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> Arenas de Jogo
        </button>
      </div>

      {/* Items Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredItems.map((item) => {
          const isEquipped = (item.category === 'avatars' && equippedAvatar === item.image) || (item.category === 'arenas' && equippedArena === item.id)

          return (
            <div 
              key={item.id}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md transition-all shadow-lg"
            >
              <div>
                {/* Badge */}
                {item.badge && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  </div>
                )}

                {/* Image / Preview */}
                {item.image ? (
                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-black/40 border border-slate-800">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-28 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center mb-3 text-slate-600">
                    <Sparkles className="w-8 h-8" />
                  </div>
                )}

                <h3 className="font-bold text-sm text-white">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-sm font-black text-amber-400">{item.price}</span>
                <button
                  onClick={() => handleEquipItem(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isEquipped 
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white'
                  }`}
                >
                  {isEquipped ? 'Equipado ✓' : 'Equipar'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
