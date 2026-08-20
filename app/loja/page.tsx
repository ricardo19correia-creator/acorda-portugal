'use client';

import React, { useState, useEffect } from 'react';
import MbwayModal from '@/components/MbwayModal';
import { getInventory, unlockItem, equipTheme, unlockAvatar, equipAvatar, type InventoryState } from '@/lib/inventory';
import { AVATAR_CATALOG, AVATARS_2050, type AvatarItem } from '@/lib/avatars';

interface ShopItem {
  id: string;
  title: string;
  description: string;
  category: 'frame' | 'title' | 'theme' | 'consumable' | 'vip_pass' | 'coins';
  currency: 'coins' | 'real_money';
  priceCoins?: number;
  priceEuros?: number;
  rarity: 'comum' | 'raro' | 'epico' | 'lendario' | 'mitico';
  icon: string;
  badge?: string;
  popular?: boolean;
}

const ALL_SHOP_ITEMS: ShopItem[] = [
  // ==================== 1. EXCLUSIVOS VIP (DINHEIRO REAL) ====================
  // 1. ARENA TOTALMENTE GRÁTIS NA ABA VIP
  {
    id: 'theme_arena_lisboa_cyber_free',
    title: 'Arena VIP: Lisboa Neon 2088 (OFERTA)',
    description: 'Tema de jogo futurista exclusivo com silhuetas cyberpunk da Ponte 25 de Abril e reflexos no Tejo.',
    category: 'theme',
    currency: 'real_money',
    priceEuros: 0.00,
    rarity: 'lendario',
    icon: '🌉',
    badge: '100% GRÁTIS',
    popular: true,
  },

  // 2. PASSE FUNDADOR COM ARENA INCLUÍDA
  {
    id: 'vip_founder_pass',
    title: 'Passe Fundador da Nação',
    description: 'Selo permanente de Fundador, +25% XP vitalício, Moldura Real 3D e OFERTA da Arena Templo de Ouro.',
    category: 'vip_pass',
    currency: 'real_money',
    priceEuros: 2.99,
    rarity: 'mitico',
    icon: '👑',
    badge: 'VITALÍCIO + ARENA',
    popular: true,
  },
  {
    id: 'theme_arena_gold_temple',
    title: 'Arena VIP: Templo de Ouro Real',
    description: 'Fundo 3D em ouro escovado com partículas volumétricas durante qualquer partida.',
    category: 'theme',
    currency: 'real_money',
    priceEuros: 1.99,
    rarity: 'mitico',
    icon: '🏛️',
    badge: 'TEMA DE JOGO',
  },
  {
    id: 'theme_arena_cosmic_matrix',
    title: 'Arena VIP: Matriz Cósmica Portuguesa',
    description: 'Nebulosa com constelações das caravelas e ondas de choque em streaks.',
    category: 'theme',
    currency: 'real_money',
    priceEuros: 2.49,
    rarity: 'lendario',
    icon: '🌌',
    badge: 'TEMA DE JOGO',
  },
  {
    id: 'bundle_all_arenas_vip',
    title: 'Mega Passe: Todas as Arenas VIP',
    description: 'Desbloqueio imediato de todas as arenas pagas atuais e futuras.',
    category: 'theme',
    currency: 'real_money',
    priceEuros: 4.99,
    rarity: 'mitico',
    icon: '📦',
    badge: 'MELHOR VALOR',
  },
  {
    id: 'coins_pack_small',
    title: 'Saco da Tasca (20 000 € Acorda)',
    description: 'Crédito imediato de 20.000 moedas virtuais na tua carteira.',
    category: 'coins',
    currency: 'real_money',
    priceEuros: 0.99,
    rarity: 'comum',
    icon: '💰',
  },
  {
    id: 'coins_pack_medium',
    title: 'Cofre Forte Nacional (80 000 € Acorda)',
    description: 'Crédito imediato de 80.000 moedas virtuais + Moldura Néon bónus.',
    category: 'coins',
    currency: 'real_money',
    priceEuros: 2.99,
    rarity: 'epico',
    icon: '🏦',
    popular: true,
  },
  {
    id: 'coins_pack_large',
    title: 'Tesouro Real Lusitano (250 000 € Acorda)',
    description: 'Crédito imediato de 250.000 moedas virtuais + Título "Milionário da Pátria".',
    category: 'coins',
    currency: 'real_money',
    priceEuros: 7.99,
    rarity: 'mitico',
    icon: '💎',
    badge: '+50% BÓNUS',
  },

  // ==================== 2. CONSUMÍVEIS (AJUDAS DE JOGO) ====================
  {
    id: 'consumable_5050',
    title: 'Ajuda 50/50 (Elimina 2 Erradas)',
    description: 'Remove 2 opções incorretas instantaneamente da pergunta atual.',
    category: 'consumable',
    currency: 'coins',
    priceCoins: 150,
    rarity: 'comum',
    icon: '✂️',
  },
  {
    id: 'consumable_extra_time',
    title: 'Tempo Extra (+15 Segundos)',
    description: 'Ganha 15 segundos adicionais para pensar numa pergunta difícil.',
    category: 'consumable',
    currency: 'coins',
    priceCoins: 100,
    rarity: 'comum',
    icon: '⏳',
  },
  {
    id: 'consumable_skip',
    title: 'Salto Estratégico de Pergunta',
    description: 'Passa à próxima pergunta sem perder a sequência nem sofrer penalizações.',
    category: 'consumable',
    currency: 'coins',
    priceCoins: 200,
    rarity: 'raro',
    icon: '⏭️',
  },
  {
    id: 'consumable_shield',
    title: 'Escudo de Sequência (Proteção)',
    description: 'Evita a perda do teu combo de respostas certas caso erres uma resposta.',
    category: 'consumable',
    currency: 'coins',
    priceCoins: 350,
    rarity: 'epico',
    icon: '🛡️',
  },
  {
    id: 'consumable_second_chance',
    title: 'Segunda Oportunidade',
    description: 'Permite tentar uma segunda resposta na mesma questão se a primeira falhar.',
    category: 'consumable',
    currency: 'coins',
    priceCoins: 400,
    rarity: 'epico',
    icon: '🔄',
  },
  {
    id: 'consumable_double_xp',
    title: 'Bónus Duplo de XP (1 Partida)',
    description: 'Duplica todos os pontos de experiência ganhos no final da partida.',
    category: 'consumable',
    currency: 'coins',
    priceCoins: 500,
    rarity: 'lendario',
    icon: '⚡',
  },

  // ==================== 3. MOLDURAS DE AVATAR ====================
  {
    id: 'frame_wave_nazare',
    title: 'Moldura: Onda da Nazaré',
    description: 'Borda aquática animada inspirada nas maiores ondas do planeta.',
    category: 'frame',
    currency: 'coins',
    priceCoins: 1200,
    rarity: 'raro',
    icon: '🌊',
  },
  {
    id: 'frame_azulejo_real',
    title: 'Moldura: Azulejo Nobre',
    description: 'Padrão tradicional de cerâmica portuguesa com detalhes em azul cobalto.',
    category: 'frame',
    currency: 'coins',
    priceCoins: 2500,
    rarity: 'epico',
    icon: '🏛️',
  },
  {
    id: 'frame_astrolabe_gold',
    title: 'Moldura: Astrolábio Dourado',
    description: 'Instrumento dourado dos Descobrimentos com brilho rotativo suave.',
    category: 'frame',
    currency: 'coins',
    priceCoins: 6000,
    rarity: 'lendario',
    icon: '🧭',
  },
  {
    id: 'frame_neon_cyber_lisbon',
    title: 'Moldura: Cyber Lisboa 2088',
    description: 'Néon magenta e ciano pulsante com feixes laser futuristas.',
    category: 'frame',
    currency: 'coins',
    priceCoins: 10000,
    rarity: 'mitico',
    icon: '⚡',
  },

  // ==================== 4. TÍTULOS DE PRESTÍGIO ====================
  {
    id: 'title_tripeiro_garra',
    title: 'Título: «Tripeiro com Garra»',
    description: 'Mostra a determinação e honra do Norte em todos os confrontos.',
    category: 'title',
    currency: 'coins',
    priceCoins: 800,
    rarity: 'comum',
    icon: '🍲',
  },
  {
    id: 'title_guardiao_lusitano',
    title: 'Título: «Guardião Lusitano»',
    description: 'Distintivo de veterano para quem defende a cultura com paixão.',
    category: 'title',
    currency: 'coins',
    priceCoins: 1500,
    rarity: 'raro',
    icon: '🛡️',
  },
  {
    id: 'title_almirante_saber',
    title: 'Título: «Almirante do Saber»',
    description: 'Para quem navega com mestria pelos mares do conhecimento nacional.',
    category: 'title',
    currency: 'coins',
    priceCoins: 3500,
    rarity: 'epico',
    icon: '⚓',
  },
  {
    id: 'title_mestre_portugal',
    title: 'Título: «Mestre Absoluto de Portugal»',
    description: 'O título mais cobiçado da nação, reservado aos grandes campeões.',
    category: 'title',
    currency: 'coins',
    priceCoins: 18000,
    rarity: 'lendario',
    icon: '👑',
  },

  // ==================== 5. TEMAS E ARENAS ====================
  {
    id: 'theme_noite_fado',
    title: 'Arena: Noite de Fado em Alfama',
    description: 'Aparência visual exclusiva com tons aveludados e atmosfera de Alfama ao jogar.',
    category: 'theme',
    currency: 'coins',
    priceCoins: 5000,
    rarity: 'epico',
    icon: '🎸',
    badge: 'TEMA DE JOGO',
  },
  {
    id: 'theme_volcano_acores',
    title: 'Arena: Fogo dos Açores',
    description: 'Partículas de brasas em ascensão e rebordo incandescente nas partidas.',
    category: 'theme',
    currency: 'coins',
    priceCoins: 20000,
    rarity: 'mitico',
    icon: '🌋',
    badge: 'TEMA DE JOGO',
  },
];

export default function LojaPage() {
  const [activeTab, setActiveTab] = useState<'real_money' | 'all' | 'avatar' | 'consumable' | 'frame' | 'title' | 'theme'>('real_money');
  const [avatarCategory, setAvatarCategory] = useState<'todos' | 'historia' | 'geografia' | 'desporto' | 'cultura' | 'geral'>('todos');
  const [userCoins, setUserCoins] = useState<number>(4395);
  const [invState, setInvState] = useState<InventoryState>(() => getInventory());
  const [equippedItems, setEquippedItems] = useState<Record<string, string>>({
    frame: 'frame_wave_nazare',
    title: 'title_guardiao_lusitano',
    theme: 'theme_noite_fado',
  });

  const [selectedVipItem, setSelectedVipItem] = useState<ShopItem | { id: string; title: string; priceEuros?: number } | null>(null);
  const [isMbwayOpen, setIsMbwayOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setInvState(getInventory());
    };
    sync();
    window.addEventListener('inventory_updated', sync);
    return () => window.removeEventListener('inventory_updated', sync);
  }, []);

  useEffect(() => {
    try {
      const savedCoins = localStorage.getItem('ap_user_coins');
      if (savedCoins) setUserCoins(Number(savedCoins));
      const savedEquipped = localStorage.getItem('ap_equipped_items');
      if (savedEquipped) {
        const parsed = JSON.parse(savedEquipped);
        setEquippedItems((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleBuyCoinsItem = (item: ShopItem) => {
    if (!item.priceCoins) return;
    if (userCoins < item.priceCoins) {
      alert('Saldo insuficiente de € Acorda!');
      return;
    }
    const newCoins = userCoins - item.priceCoins;
    setUserCoins(newCoins);
    localStorage.setItem('ap_user_coins', newCoins.toString());

    unlockItem(item.id);
    if (item.category === 'theme') {
      equipTheme(item.id);
    }

    alert(`Compraste "${item.title}" com sucesso!`);
  };

  const handleClaimFree = (item: ShopItem) => {
    unlockItem(item.id, item.id === 'vip_founder_pass');
    if (item.category === 'theme') {
      equipTheme(item.id);
    }
    alert(`Parabéns! Resgataste "${item.title}" gratuitamente! A arena foi equipada.`);
  };

  const handleRealMoneyCheckout = (_item: ShopItem | { id: string; title: string; priceEuros?: number }) => {
    alert('Os pagamentos em dinheiro real estão temporariamente indisponíveis para manutenção do sistema. Volte em breve!');
  };

  const handleEquip = (item: ShopItem) => {
    if (item.category === 'theme') {
      equipTheme(item.id);
    }
    const updated = { ...equippedItems, [item.category]: item.id };
    setEquippedItems(updated);
    localStorage.setItem('ap_equipped_items', JSON.stringify(updated));
    alert(`Equipaste "${item.title}"!`);
  };

  // Funções específicas de Avatar
  const handleBuyAvatarCoins = (av: AvatarItem) => {
    const priceNum = typeof av.price === 'number' ? av.price : parseInt(String(av.price).replace(/\D/g, '')) || 0;
    if (userCoins < priceNum) {
      alert('Saldo insuficiente de € Acorda!');
      return;
    }
    const newCoins = userCoins - priceNum;
    setUserCoins(newCoins);
    localStorage.setItem('ap_user_coins', newCoins.toString());

    unlockAvatar(av.id);
    equipAvatar(av.id);
    alert(`Compraste e equipaste o avatar "${av.name}" com sucesso!`);
  };

  const handleClaimFreeAvatar = (av: AvatarItem) => {
    unlockAvatar(av.id);
    equipAvatar(av.id);
    alert(`Desbloqueaste e equipaste o avatar "${av.name}" gratuitamente!`);
  };

  const handleEquipAvatarDirect = (av: AvatarItem) => {
    equipAvatar(av.id);
    alert(`Avatar "${av.name}" equipado!`);
  };

  const filteredItems = ALL_SHOP_ITEMS.filter((item) => {
    if (activeTab === 'real_money') return item.currency === 'real_money';
    if (activeTab === 'all') return item.currency === 'coins';
    return item.currency === 'coins' && item.category === activeTab;
  });

  const filteredAvatars = AVATAR_CATALOG.filter((av) => {
    if (avatarCategory === 'todos') return true;
    return av.category === avatarCategory;
  });

  const rarityStyles: Record<string, string> = {
    comum: 'border-zinc-700 text-zinc-300',
    raro: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20',
    epico: 'border-purple-500/40 text-purple-400 bg-purple-950/20',
    lendario: 'border-amber-500/40 text-amber-400 bg-amber-950/20',
    mitico: 'border-rose-500/50 text-rose-400 bg-rose-950/20',
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto bg-transparent text-zinc-100">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-zinc-950/60 backdrop-blur-xl p-6 rounded-2xl border border-emerald-500/20">
        <div>
          <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Economia Oficial & Mercado</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide">LOJA ACORDA PORTUGAL</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Adquire avatares épicos, ajudas de jogo, molduras vivas, títulos e arenas 3D exclusivas.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-black/40 px-5 py-3 rounded-xl border border-amber-500/30">
          <div>
            <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">O Teu Saldo Virtual</p>
            <p className="text-2xl font-black text-white">€{userCoins.toLocaleString('pt-PT')} <span className="text-xs text-zinc-400">€ Acorda</span></p>
          </div>
        </div>
      </div>

      {/* SELETORES DE ABAS / FILTROS */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
        <button
          onClick={() => setActiveTab('real_money')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'real_money'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105'
              : 'bg-zinc-900/80 border border-amber-500/30 text-amber-400 hover:bg-zinc-800'
          }`}
        >
          💎 EXCLUSIVOS VIP (€)
        </button>
        <button
          onClick={() => setActiveTab('avatar')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'avatar'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105'
              : 'bg-zinc-900/80 border border-cyan-500/30 text-cyan-400 hover:bg-zinc-800'
          }`}
        >
          👤 LOJA DE AVATARES
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'all'
              ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105'
              : 'bg-zinc-900/80 border border-emerald-500/30 text-emerald-400 hover:bg-zinc-800'
          }`}
        >
          🪙 Todos os Itens (€ Acorda)
        </button>
        <button
          onClick={() => setActiveTab('consumable')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'consumable'
              ? 'bg-emerald-500 text-black'
              : 'bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          ⚡ Ajudas & Utilidades
        </button>
        <button
          onClick={() => setActiveTab('frame')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'frame'
              ? 'bg-emerald-500 text-black'
              : 'bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          🎭 Molduras
        </button>
        <button
          onClick={() => setActiveTab('title')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'title'
              ? 'bg-emerald-500 text-black'
              : 'bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          🏆 Títulos
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'theme'
              ? 'bg-emerald-500 text-black'
              : 'bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          🌌 Arenas de Jogo
        </button>
      </div>

      {/* BANNER INFORMATIVO DE MANUTENÇÃO PARA PAGAMENTOS EM DINHEIRO REAL (€) */}
      {activeTab === 'real_money' && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl flex items-center gap-4 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
            ⚙️
          </div>
          <div>
            <p className="text-sm font-bold text-amber-300">
              Aviso: O sistema de pagamentos por dinheiro real encontra-se em manutenção e temporariamente indisponível. Agradecemos a compreensão.
            </p>
            <p className="text-xs text-amber-200/70 mt-0.5">
              Todos os itens, ajudas e avatares adquiridos com moedas virtuais (€ Acorda) continuam 100% ativos e disponíveis para compra.
            </p>
          </div>
        </div>
      )}

      {/* ABA DE AVATARES */}
      {activeTab === 'avatar' && (
        <div className="space-y-6">
          {/* Sub-filtro de Categoria de Avatar */}
          <div className="flex flex-wrap gap-2 p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800 backdrop-blur-md">
            {[
              { id: 'todos', label: 'Todos os Avatares' },
              { id: 'historia', label: '⚔️ História' },
              { id: 'geografia', label: '🌍 Geografia' },
              { id: 'desporto', label: '⚽ Desporto' },
              { id: 'cultura', label: '🎸 Cultura & Fado' },
              { id: 'geral', label: '👤 Gerais' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setAvatarCategory(cat.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  avatarCategory === cat.id
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAvatars.map((av) => {
              const isOwned = (invState.ownedAvatars || ['av_default', 'av_galo_barcelos']).includes(av.id);
              const isEquipped = (invState.equippedAvatar || 'av_default') === av.id;
              const isEur = av.currency === 'eur' || av.currency === 'real_money';
              const isPoints = av.currency === 'points' || av.currency === 'coins';
              const priceNum = typeof av.price === 'number' ? av.price : parseInt(String(av.price).replace(/\D/g, '')) || 0;
              const priceEurNum = typeof av.price === 'number' ? av.price : parseFloat(String(av.price).replace(/[^0-9.]/g, '')) || 0;

              return (
                <div
                  key={av.id}
                  className={`group relative flex flex-col justify-between p-5 rounded-3xl bg-zinc-950/80 backdrop-blur-xl border transition-all duration-300 hover:scale-[1.02] ${
                    isEquipped
                      ? 'border-cyan-400 bg-cyan-950/25 ring-2 ring-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.35)]'
                      : av.glowColor
                      ? av.glowColor
                      : isEur
                      ? 'border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                      : 'border-zinc-800 hover:border-cyan-500/40'
                  }`}
                >
                  {/* BADGES NO CANTO SUPERIOR */}
                  {isEur ? (
                    <span className="absolute -top-3 right-4 z-20 bg-amber-500/95 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                      ⚙️ Manutenção
                    </span>
                  ) : av.badge ? (
                    <span className="absolute -top-3 right-4 z-20 bg-cyan-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                      {av.badge}
                    </span>
                  ) : null}

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${rarityStyles[av.rarity || 'comum']}`}>
                        {av.badge || av.rarity || 'comum'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 uppercase font-bold">
                        {av.category}
                      </span>
                    </div>

                    {/* IMAGEM RETRATO CYBERPUNK 2050 HD */}
                    <div className="relative overflow-hidden rounded-xl mb-3 border-2 border-white/10 bg-zinc-900 shadow-inner">
                      {av.image ? (
                        <div className="aspect-[4/5] w-full overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={av.image}
                            alt={av.name}
                            className="w-full h-full object-cover object-center rounded-xl border-2 transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[4/5] w-full flex items-center justify-center text-6xl bg-zinc-900">
                          {av.icon || '👤'}
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-center text-white mt-1 mb-1">{av.name}</h3>
                    <p className="text-xs text-zinc-400 text-center leading-relaxed mb-3">
                      {av.subtitle || av.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Preço</span>
                      <span className="text-base font-extrabold text-white">
                        {av.currency === 'free'
                          ? <span className="text-emerald-400 font-black">GRÁTIS</span>
                          : isEur
                          ? `€${priceEurNum.toFixed(2)}`
                          : `${priceNum.toLocaleString('pt-PT')} Acorda`}
                      </span>
                    </div>

                    {isEquipped ? (
                      <button disabled className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-400/50">
                        ✓ Avatar em Uso
                      </button>
                    ) : isOwned ? (
                      <button
                        onClick={() => handleEquipAvatarDirect(av)}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg transition-all cursor-pointer"
                      >
                        Equipar Avatar
                      </button>
                    ) : av.currency === 'free' ? (
                      <button
                        onClick={() => handleClaimFreeAvatar(av)}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-black transition-all cursor-pointer"
                      >
                        🎁 Resgatar Grátis
                      </button>
                    ) : isPoints ? (
                      <button
                        onClick={() => handleBuyAvatarCoins(av)}
                        disabled={userCoins < priceNum}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                          userCoins >= priceNum
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md cursor-pointer'
                            : 'bg-zinc-800/60 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                        }`}
                      >
                        {userCoins >= priceNum ? `Comprar por ${priceNum} Acorda` : 'Saldo Insuficiente'}
                      </button>
                    ) : (
                      <button
                        disabled
                        onClick={() => handleRealMoneyCheckout({ id: av.id, title: `Avatar: ${av.name}`, priceEuros: priceEurNum })}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 opacity-60 cursor-not-allowed transition-all"
                      >
                        ⚙️ Indisponível (Manutenção)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GRELHA GERAL (OUTRAS ABAS) */}
      {activeTab !== 'avatar' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isOwned = invState.ownedItems.includes(item.id);
            const isEquipped = item.category === 'theme' ? invState.equippedTheme === item.id : equippedItems[item.category] === item.id;

            return (
              <div
                key={item.id}
                className={`relative flex flex-col justify-between p-5 rounded-2xl bg-zinc-950/70 backdrop-blur-xl border transition-all duration-300 hover:scale-[1.02] ${
                  item.popular ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]' : 'border-zinc-800 hover:border-emerald-500/40'
                }`}
              >
                {item.currency === 'real_money' && (item.priceEuros ?? 0) > 0 ? (
                  <span className="absolute -top-3 right-4 bg-amber-500/90 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                    ⚙️ Manutenção
                  </span>
                ) : item.badge ? (
                  <span className="absolute -top-3 right-4 bg-amber-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {item.badge}
                  </span>
                ) : null}

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${rarityStyles[item.rarity]}`}>
                      {item.rarity}
                    </span>
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5">{item.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Preço</span>
                    <span className="text-base font-extrabold text-white">
                      {item.currency === 'real_money'
                        ? item.priceEuros === 0
                          ? <span className="text-emerald-400 font-black">100% GRÁTIS</span>
                          : `€${item.priceEuros?.toFixed(2)}`
                        : `€${item.priceCoins?.toLocaleString('pt-PT')}`}
                    </span>
                  </div>

                  {item.currency === 'real_money' ? (
                    item.priceEuros === 0 ? (
                      isEquipped ? (
                        <button disabled className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          ✓ Arena em Uso
                        </button>
                      ) : isOwned ? (
                        <button
                          onClick={() => handleEquip(item)}
                          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg transition-all"
                        >
                          Equipar Arena
                        </button>
                      ) : (
                        <button
                          onClick={() => handleClaimFree(item)}
                          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-400 to-teal-400 text-black hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-pulse transition-all"
                        >
                          🎁 Resgatar Oferta Grátis
                        </button>
                      )
                    ) : isEquipped ? (
                      <button disabled className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        ✓ Equipado
                      </button>
                    ) : isOwned ? (
                      <button
                        onClick={() => handleEquip(item)}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 transition-all"
                      >
                        Equipar
                      </button>
                    ) : (
                      <button
                        disabled
                        onClick={() => handleRealMoneyCheckout(item)}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 opacity-60 cursor-not-allowed transition-all"
                      >
                        ⚙️ Indisponível (Manutenção)
                      </button>
                    )
                  ) : item.category === 'consumable' ? (
                    <button
                      onClick={() => handleBuyCoinsItem(item)}
                      disabled={userCoins < (item.priceCoins || 0)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                        userCoins >= (item.priceCoins || 0)
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md'
                          : 'bg-zinc-800/60 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                      }`}
                    >
                      {userCoins >= (item.priceCoins || 0) ? 'Comprar Utilidade' : 'Saldo Insuficiente'}
                    </button>
                  ) : isEquipped ? (
                    <button disabled className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      ✓ Equipado
                    </button>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(item)}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 transition-all"
                    >
                      Equipar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyCoinsItem(item)}
                      disabled={userCoins < (item.priceCoins || 0)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                        userCoins >= (item.priceCoins || 0)
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md'
                          : 'bg-zinc-800/60 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                      }`}
                    >
                      {userCoins >= (item.priceCoins || 0) ? 'Comprar Item' : 'Saldo Insuficiente'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE CHECKOUT DIRETO MB WAY */}
      <MbwayModal
        isOpen={isMbwayOpen}
        onClose={() => {
          setIsMbwayOpen(false);
          setSelectedVipItem(null);
        }}
        item={selectedVipItem}
      />
    </main>
  );
}
