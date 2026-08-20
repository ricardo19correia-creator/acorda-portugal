'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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

const SHOP_ITEMS: ShopItem[] = [
  // --- EXCLUSIVOS A DINHEIRO REAL (STRIPE / MB WAY) ---
  {
    id: 'vip_founder_pass',
    title: 'Passe Fundador da Nação',
    description: 'Selo permanente de Fundador, +25% XP vitalício e Moldura Real 3D animada.',
    category: 'vip_pass',
    currency: 'real_money',
    priceEuros: 2.99,
    rarity: 'mitico',
    icon: '👑',
    badge: 'VITALÍCIO',
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
    description: 'Crédito imediato de 20.000 moedas virtuais na tua carteira de jogo.',
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
    description: 'O maior pacote de moedas para dominares a loja por completo.',
    category: 'coins',
    currency: 'real_money',
    priceEuros: 7.99,
    rarity: 'lendario',
    icon: '💎',
    badge: '+60% BÓNUS',
  },

  // --- ITENS ADQUIRÍVEIS POR MOEDAS (€ ACORDA) ---
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
    id: 'frame_wave_nazare',
    title: 'Moldura Onda da Nazaré',
    description: 'Vórtice aquático azul-marinho translúcido com reflexos ciano.',
    category: 'frame',
    currency: 'coins',
    priceCoins: 3200,
    rarity: 'raro',
    icon: '🌊',
  },
  {
    id: 'theme_arena_fado_alfama',
    title: 'Arena: Noite de Fado em Alfama',
    description: 'Muda o fundo das tuas partidas para uma atmosfera aveludada e calçada iluminada.',
    category: 'theme',
    currency: 'coins',
    priceCoins: 12500,
    rarity: 'epico',
    icon: '🎸',
    badge: 'TEMA DE JOGO',
  },
  {
    id: 'consumable_shield_afonso',
    title: 'Escudo de D. Afonso Henriques',
    description: 'Anula 1 resposta errada em Duelo 1v1 sem perder o streak de pontos.',
    category: 'consumable',
    currency: 'coins',
    priceCoins: 1800,
    rarity: 'raro',
    icon: '🛡️',
  },
];

export default function LojaPage() {
  const [activeTab, setActiveTab] = useState<'coins' | 'real_money'>('real_money');
  const [userCoins, setUserCoins] = useState<number>(4395);
  const [inventory, setInventory] = useState<string[]>([]);
  const [equippedItems, setEquippedItems] = useState<Record<string, string>>({
    frame: 'frame_flame_sebastiao',
    theme: 'default_tron',
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

  const handleRealMoneyCheckout = (item: ShopItem) => {
    alert(`A redirecionar para o pagamento seguro de €${item.priceEuros?.toFixed(2)} (${item.title})...`);
    // Integração Stripe/MB WAY: window.location.href = `/api/checkout?item=${item.id}`;
  };

  const handleEquip = (item: ShopItem) => {
    const updated = { ...equippedItems, [item.category]: item.id };
    setEquippedItems(updated);
    localStorage.setItem('ap_equipped_items', JSON.stringify(updated));
    alert(`Equipaste "${item.title}"!`);
  };

  const filteredItems = SHOP_ITEMS.filter((item) => item.currency === activeTab);

  const rarityStyles: Record<string, string> = {
    comum: 'border-zinc-700 text-zinc-300',
    raro: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20',
    epico: 'border-purple-500/40 text-purple-400 bg-purple-950/20',
    lendario: 'border-amber-500/40 text-amber-400 bg-amber-950/20',
    mitico: 'border-rose-500/50 text-rose-400 bg-rose-950/20',
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto bg-transparent text-zinc-100">
      {/* HEADER DA LOJA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-zinc-950/60 backdrop-blur-xl p-6 rounded-2xl border border-emerald-500/20">
        <div>
          <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Economia Oficial & Mercado</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide">LOJA ACORDA PORTUGAL</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Adquire itens míticos, arenas de fundo 3D, cosméticos e pacotes VIP com dinheiro real ou moedas ganhas em jogo.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-black/40 px-5 py-3 rounded-xl border border-amber-500/30">
          <div>
            <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">O Teu Saldo Virtual</p>
            <p className="text-2xl font-black text-white">€{userCoins.toLocaleString('pt-PT')} <span className="text-xs text-zinc-400">€ Acorda</span></p>
          </div>
        </div>
      </div>

      {/* SELETOR DE ABAS PRINCIPAIS */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setActiveTab('real_money')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'real_money'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105'
              : 'bg-zinc-900/80 border border-amber-500/30 text-amber-400 hover:bg-zinc-800'
          }`}
        >
          <span>💎</span> PACOTES VIP & EXCLUSIVOS (STRIPE / DINHEIRO REAL)
        </button>
        <button
          onClick={() => setActiveTab('coins')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'coins'
              ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105'
              : 'bg-zinc-900/80 border border-emerald-500/30 text-emerald-400 hover:bg-zinc-800'
          }`}
        >
          <span>🪙</span> COSMÉTICOS & ARENAS (€ ACORDA)
        </button>
      </div>

      {/* GRELHA DE PRODUTOS */}
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
                    {item.currency === 'real_money' ? `€${item.priceEuros?.toFixed(2)}` : `€${item.priceCoins?.toLocaleString('pt-PT')}`}
                  </span>
                </div>

                {item.currency === 'real_money' ? (
                  <button
                    onClick={() => handleRealMoneyCheckout(item)}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 shadow-lg transition-all"
                  >
                    Comprar por €{item.priceEuros?.toFixed(2)}
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
                    {userCoins >= (item.priceCoins || 0) ? 'Comprar com Moedas' : 'Saldo Insuficiente'}
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
