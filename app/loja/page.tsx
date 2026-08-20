'use client';

import React, { useState, useEffect } from 'react';

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
    badge: '+30% BÓNUS',
  },
  {
    id: 'coins_pack_large',
    title: 'Tesouro dos Descobrimentos (250 000 € Acorda)',
    description: 'O maior cofre de moedas para dominares a loja por completo.',
    category: 'coins',
    currency: 'real_money',
    priceEuros: 7.99,
    rarity: 'lendario',
    icon: '💎',
    badge: '+60% BÓNUS',
  },

  // ==================== 2. AJUDAS & UTILIDADES DE JOGO ====================
  {
    id: 'help_5050',
    title: 'Ajudas 50/50 (Pack x3)',
    description: 'Elimina 2 respostas erradas instantaneamente durante a partida.',
    category: 'consumable',
    currency: 'coins',
    priceCoins: 600,
    rarity: 'comum',
    icon: '✨',
    badge: 'UTILIDADE',
  },
  {
    id: 'help_freeze_time',
    title: 'Congelar Tempo (Pack x3)',
    description: 'Congela o cronómetro por 15 segundos numa pergunta difícil.',
    category: 'consumable',
    currency: 'coins',
    priceCoins: 900,
    rarity: 'raro',
    icon: '⏱️',
    badge: 'UTILIDADE',
  },
  {
    id: 'help_hint',
    title: 'Pista Nacional (Pack x2)',
    description: 'Revela uma dica histórica/geográfica essencial sobre a questão.',
    category: 'consumable',
    currency: 'coins',
    priceCoins: 1200,
    rarity: 'raro',
    icon: '💡',
    badge: 'UTILIDADE',
  },
  {
    id: 'consumable_shield_afonso',
    title: 'Escudo de D. Afonso Henriques',
    description: 'Anula 1 resposta errada em Duelo 1v1 sem perder o streak de pontos.',
    category: 'consumable',
    currency: 'coins',
    priceCoins: 1800,
    rarity: 'epico',
    icon: '🛡️',
    badge: 'DUELO 1V1',
  },

  // ==================== 3. MOLDURAS DE AVATAR ====================
  {
    id: 'frame_green_hope',
    title: 'Moldura Verde Esperança',
    description: 'Moldura de avatar clássica com o brilho verde nacional.',
    category: 'frame',
    currency: 'coins',
    priceCoins: 500,
    rarity: 'comum',
    icon: '🟢',
  },
  {
    id: 'frame_wave_nazare',
    title: 'Moldura Mar Português / Nazaré',
    description: 'Vórtice aquático azul-marinho translúcido com reflexos ciano.',
    category: 'frame',
    currency: 'coins',
    priceCoins: 1500,
    rarity: 'raro',
    icon: '🌊',
  },
  {
    id: 'frame_azulejo_nobre',
    title: 'Moldura Azulejo Nobre',
    description: 'Padrão tradicional de azulejo português refinado com reflexos prateados.',
    category: 'frame',
    currency: 'coins',
    priceCoins: 5000,
    rarity: 'epico',
    icon: '🔷',
  },
  {
    id: 'frame_cyber_galo',
    title: 'Moldura Cyber Galo de Barcelos',
    description: 'Crista néon multicolor com rotação de brilho cyberpunk.',
    category: 'frame',
    currency: 'coins',
    priceCoins: 8500,
    rarity: 'epico',
    icon: '🐓',
  },
  {
    id: 'frame_gold_royal',
    title: 'Moldura Ouro Real',
    description: 'Moldura lendária banhada a ouro para verdadeiros mestres do quiz.',
    category: 'frame',
    currency: 'coins',
    priceCoins: 15000,
    rarity: 'lendario',
    icon: '🏆',
  },
  {
    id: 'frame_flame_sebastiao',
    title: 'Moldura Chama de D. Sebastião',
    description: 'Moldura holográfica mítica com chamas rubi/douradas em movimento.',
    category: 'frame',
    currency: 'coins',
    priceCoins: 25000,
    rarity: 'mitico',
    icon: '🔥',
  },

  // ==================== 4. TÍTULOS DE PRESTÍGIO ====================
  {
    id: 'title_patriota',
    title: 'Título: «O Patriota»',
    description: 'Exibe o título de Patriota no teu perfil e nos rankings.',
    category: 'title',
    currency: 'coins',
    priceCoins: 750,
    rarity: 'comum',
    icon: '📜',
  },
  {
    id: 'title_guardiao_lusitano',
    title: 'Título: «Guardião Lusitano»',
    description: 'Título especial para defensores da história e cultura do país.',
    category: 'title',
    currency: 'coins',
    priceCoins: 2500,
    rarity: 'epico',
    icon: '⚔️',
  },
  {
    id: 'title_rei_distritos',
    title: 'Título: «Rei dos 18 Distritos»',
    description: 'Título lendário com brilho contínuo de ouro.',
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
  const [activeTab, setActiveTab] = useState<'real_money' | 'all' | 'consumable' | 'frame' | 'title' | 'theme'>('real_money');
  const [userCoins, setUserCoins] = useState<number>(4395);
  const [inventory, setInventory] = useState<string[]>(['frame_green_hope', 'frame_wave_nazare', 'title_guardiao_lusitano', 'theme_noite_fado']);
  const [equippedItems, setEquippedItems] = useState<Record<string, string>>({
    frame: 'frame_wave_nazare',
    title: 'title_guardiao_lusitano',
    theme: 'theme_noite_fado',
  });

  useEffect(() => {
    try {
      const savedCoins = localStorage.getItem('ap_user_coins');
      if (savedCoins) setUserCoins(Number(savedCoins));
      const savedInv = localStorage.getItem('ap_user_inventory');
      if (savedInv) setInventory(JSON.parse(savedInv));
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
    const newInv = [...inventory, item.id];
    setUserCoins(newCoins);
    setInventory(newInv);
    localStorage.setItem('ap_user_coins', newCoins.toString());
    localStorage.setItem('ap_user_inventory', JSON.stringify(newInv));
    alert(`Compraste "${item.title}" com sucesso!`);
  };

  const handleClaimFree = (item: ShopItem) => {
    if (inventory.includes(item.id)) return;
    const newInv = [...inventory, item.id];
    setInventory(newInv);
    localStorage.setItem('ap_user_inventory', JSON.stringify(newInv));
    alert(`Parabéns! Resgataste "${item.title}" gratuitamente! Podes equipá-la de imediato.`);
  };

  const handleRealMoneyCheckout = (item: ShopItem) => {
    alert(`A iniciar checkout de €${item.priceEuros?.toFixed(2)} para ${item.title}...`);
  };

  const handleEquip = (item: ShopItem) => {
    const updated = { ...equippedItems, [item.category]: item.id };
    setEquippedItems(updated);
    localStorage.setItem('ap_equipped_items', JSON.stringify(updated));
    alert(`Equipaste "${item.title}"!`);
  };

  const filteredItems = ALL_SHOP_ITEMS.filter((item) => {
    if (activeTab === 'real_money') return item.currency === 'real_money';
    if (activeTab === 'all') return item.currency === 'coins';
    return item.currency === 'coins' && item.category === activeTab;
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
            Adquire ajudas de jogo, molduras vivas, títulos, arenas 3D e pacotes exclusivos.
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
          💎 PACOTES VIP (STRIPE)
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

      {/* GRELHA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const isOwned = inventory.includes(item.id);
          const isEquipped = equippedItems[item.category] === item.id;

          return (
            <div
              key={item.id}
              className={`relative flex flex-col justify-between p-5 rounded-2xl bg-zinc-950/70 backdrop-blur-xl border transition-all duration-300 hover:scale-[1.02] ${
                item.popular ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]' : 'border-zinc-800 hover:border-emerald-500/40'
              }`}
            >
              {item.badge && (
                <span className="absolute -top-3 right-4 bg-amber-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {item.badge}
                </span>
              )}

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
                      onClick={() => handleRealMoneyCheckout(item)}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 shadow-lg transition-all"
                    >
                      Comprar por €{item.priceEuros?.toFixed(2)}
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
    </main>
  );
}
