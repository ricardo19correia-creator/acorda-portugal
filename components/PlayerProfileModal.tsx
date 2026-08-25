'use client';

import React from 'react';
import Link from 'next/link';
import { getAvatarImage, DEFAULT_AVATAR } from '@/lib/avatars';
import { UserAvatar } from '@/components/user-avatar';

export interface PlayerProfileData {
  id: string;
  username: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  title?: string;
  district?: string;
  virtualMoney?: number;
  rankPosition?: number;
  isVip?: boolean;
  stats?: {
    duelsWon: number;
    duelsTotal: number;
    accuracyRate: number;
  };
  badges?: { icon: string; name: string }[];
}

interface PlayerProfileModalProps {
  player: PlayerProfileData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayerProfileModal({ player, isOpen, onClose }: PlayerProfileModalProps) {
  if (!isOpen || !player) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl text-zinc-100 overflow-hidden">
        {/* Fundo com Brilho Superior */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-emerald-500/15 to-transparent pointer-events-none" />

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 transition-colors z-10"
        >
          ✕
        </button>

        {/* Cabeçalho do Perfil */}
        <div className="relative flex flex-col items-center text-center mt-2 mb-6">
          <div className="relative mb-3">
            <UserAvatar
              src={player.avatarUrl}
              alt={player.username}
              size="lg"
              rank={player.rankPosition}
              borderGlowColor={player.isVip ? '#fbbf24' : undefined}
            />
            {player.rankPosition && (
              <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-black border border-black shadow">
                #{player.rankPosition}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-black text-white">{player.username}</h3>
            {player.isVip && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                👑 VIP
              </span>
            )}
          </div>
          <p className="text-xs text-emerald-400 font-semibold mb-1">
            {player.title || '«Cidadão Conquistador»'}
          </p>
          <p className="text-[11px] text-zinc-400 flex items-center gap-1">
            📍 {player.district || 'Portugal'} • Nível {player.level || 1}
          </p>
        </div>

        {/* Grelha de Estatísticas & Fortuna */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Fortuna</span>
            <span className="text-base font-black text-amber-400 font-mono">
              €{(player.virtualMoney ?? 100).toLocaleString('pt-PT')}
            </span>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Vitórias 1v1</span>
            <span className="text-base font-black text-emerald-400">
              {player.stats?.duelsWon ?? 0}
            </span>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Precisão</span>
            <span className="text-base font-black text-cyan-400">
              {player.stats?.accuracyRate ?? 88}%
            </span>
          </div>
        </div>

        {/* Conquistas / Emblemas */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-3.5 mb-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
            Conquistas em Destaque
          </span>
          <div className="flex flex-wrap gap-2">
            {player.badges && player.badges.length > 0 ? (
              player.badges.map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-300" title={b.name}>
                  <span>{b.icon}</span>
                  <span className="text-[11px] font-medium">{b.name}</span>
                </div>
              ))
            ) : (
              <>
                <span className="text-xs px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">🇵🇹 Patriota</span>
                <span className="text-xs px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">⚡ 10 Seguidas</span>
                <span className="text-xs px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">⚔️ Gladiador</span>
              </>
            )}
          </div>
        </div>

        {/* Ação Direta: Desafiar para Duelo */}
        <Link
          href={`/jogar/duelo?opponent=${encodeURIComponent(player.username)}`}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
        >
          ⚔️ Desafiar para Duelo 1v1
        </Link>
      </div>
    </div>
  );
}
