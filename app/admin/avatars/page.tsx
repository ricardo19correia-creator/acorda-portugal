'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { REAL_AVATARS, AvatarItem } from '@/lib/avatars';

export default function AdminAvatarsPage() {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarItem>(REAL_AVATARS[0]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAvatars = REAL_AVATARS.filter((avatar) => {
    const matchesCategory = filterCategory === 'all' || avatar.category === filterCategory;
    const matchesSearch =
      avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      avatar.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (avatar.subtitle && avatar.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
    comum: { bg: 'bg-slate-800/80', border: 'border-slate-600', text: 'text-slate-300' },
    raro: { bg: 'bg-blue-950/80', border: 'border-blue-500', text: 'text-blue-300' },
    epico: { bg: 'bg-purple-950/80', border: 'border-purple-500', text: 'text-purple-300' },
    lendario: { bg: 'bg-amber-950/80', border: 'border-amber-500', text: 'text-amber-300' },
    mitico: { bg: 'bg-rose-950/80', border: 'border-rose-500', text: 'text-rose-300' },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                className="text-xs font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
              >
                ← Voltar à Home
              </Link>
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                Painel Canónico Oficial
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>🇵🇹 Coleção Oficial de 36 Avatares</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Auditoria visual forense • Grelha 6×6 • Teste de legibilidade circular (32px, 48px, 64px, 96px, 128px)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="block text-2xl font-black text-emerald-400">{REAL_AVATARS.length}</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Total Avatares</span>
            </div>
            <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="block text-2xl font-black text-cyan-400">100%</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Canónicos</span>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'geral', 'historia', 'geografia', 'desporto', 'cultura'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  filterCategory === cat
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {cat === 'all' ? 'Todos' : cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Pesquisar por nome ou ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Main Content: 6x6 Grid + Inspector */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 6x6 Avatar Grid (3 cols on desktop) */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredAvatars.map((avatar, index) => {
              const isSelected = selectedAvatar?.id === avatar.id;
              const rarityStyle = rarityColors[avatar.rarity || 'comum'];

              return (
                <div
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`group relative flex flex-col p-2.5 rounded-xl cursor-pointer transition-all duration-200 border ${
                    isSelected
                      ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-500/10 scale-[1.02] ring-2 ring-amber-400/50'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Badge Number */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1.5">
                    <span>#{String(index + 1).padStart(2, '0')}</span>
                    <span className={`px-1.5 py-0.2 rounded uppercase font-bold text-[9px] ${rarityStyle.text}`}>
                      {avatar.rarity || 'comum'}
                    </span>
                  </div>

                  {/* Avatar Circular Preview */}
                  <div className="relative aspect-square w-full rounded-full overflow-hidden border-2 border-slate-800 group-hover:border-slate-600 transition mb-2 shadow-inner bg-slate-950">
                    <Image
                      src={avatar.image}
                      alt={avatar.name}
                      fill
                      sizes="(max-width: 768px) 150px, 200px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Avatar Info */}
                  <div className="text-center mt-auto">
                    <p className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition">
                      {avatar.name}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 truncate">{avatar.id}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Circular Size Inspector Dock */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
            <h2 className="text-xs uppercase font-bold tracking-wider text-amber-400 mb-4 flex items-center gap-2">
              <span>🔍 Inspetor de Escala Circular</span>
            </h2>

            {selectedAvatar ? (
              <div className="space-y-6">
                {/* 128px Preview */}
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-amber-400/80 shadow-2xl shadow-amber-500/20 bg-slate-950">
                    <Image
                      src={selectedAvatar.image}
                      alt={selectedAvatar.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  <h3 className="text-lg font-black text-white mt-3">{selectedAvatar.name}</h3>
                  <p className="text-xs font-mono text-amber-400">{selectedAvatar.id}</p>
                  {selectedAvatar.subtitle && (
                    <p className="text-xs text-slate-400 mt-1 italic leading-relaxed">
                      &quot;{selectedAvatar.subtitle}&quot;
                    </p>
                  )}
                </div>

                {/* Metadata Details */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">CATEGORIA</span>
                    <span className="text-slate-200 capitalize">{selectedAvatar.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">RARIDADE</span>
                    <span className="text-amber-400 uppercase font-bold">{selectedAvatar.rarity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">PREÇO</span>
                    <span className="text-emerald-400">
                      {selectedAvatar.currency === 'free' ? 'Grátis' : `${selectedAvatar.price} Moedas`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">FICHEIRO</span>
                    <span className="text-slate-300 truncate block">{selectedAvatar.image.replace('/images/avatars/', '')}</span>
                  </div>
                </div>

                {/* Circular Scales Comparison */}
                <div className="border-t border-slate-800 pt-4">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Legibilidade Circular
                  </h4>
                  <div className="flex items-end justify-between gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    {/* 96px */}
                    <div className="text-center">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-700 mx-auto">
                        <Image src={selectedAvatar.image} alt="96px" fill className="object-cover" />
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1">64px</span>
                    </div>

                    {/* 48px */}
                    <div className="text-center">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-700 mx-auto">
                        <Image src={selectedAvatar.image} alt="48px" fill className="object-cover" />
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1">48px</span>
                    </div>

                    {/* 32px */}
                    <div className="text-center">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-700 mx-auto">
                        <Image src={selectedAvatar.image} alt="32px" fill className="object-cover" />
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1">32px</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}