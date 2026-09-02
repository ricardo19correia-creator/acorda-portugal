'use client'

import React, { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PORTUGAL_DISTRICTS } from '@/data/districts'
import { DEFAULT_AVATAR_URL, DEFAULT_AVATAR_ID } from '@/data/constants'
import { REAL_AVATARS } from '@/lib/avatars'
import { ECONOMY_CONFIG } from '@/src/data/economy'

export interface DistrictOnboardingModalProps {
  user: any
  onComplete: (district: string) => void
}

const STARTER_AVATARS = [
  { id: 'avatar_01', name: 'Cavaleiro Lusitano', image: '/images/avatars/avatar_01.png' },
  { id: 'avatar_02', name: 'Dama das Quinas', image: '/images/avatars/avatar_02.png' },
  { id: 'avatar_03', name: 'Navegador dos Mares', image: '/images/avatars/avatar_03.png' },
  { id: 'avatar_04', name: 'Estudante de Coimbra', image: '/images/avatars/avatar_04.png' },
]

export function DistrictOnboardingModal({ user, onComplete }: DistrictOnboardingModalProps) {
  const [selectedAvatar, setSelectedAvatar] = useState('avatar_01')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!selectedDistrict || !user?.uid) return
    setLoading(true)
    setError(null)

    try {
      const cleanName = (user.displayName || user.email?.split('@')[0] || 'Noviço da Nação').trim()
      const starterAvatarObj = STARTER_AVATARS.find((a) => a.id === selectedAvatar) || STARTER_AVATARS[0]
      const chosenAvatarId = starterAvatarObj.id
      const chosenAvatarUrl = starterAvatarObj.image

      // 1. Grava o documento completo do utilizador no Firestore
      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          displayName: cleanName,
          name: cleanName,
          email: user.email || '',
          photoURL: chosenAvatarUrl,
          avatar: chosenAvatarUrl,
          avatarId: chosenAvatarId,
          equippedAvatar: chosenAvatarId,
          district: selectedDistrict, // OBRIGATÓRIO (escolhido no seletor)
          districtLocked: true,
          level: 1,
          xp: 0,
          coins: ECONOMY_CONFIG.INITIAL_BONUS_COINS,
          euros: ECONOMY_CONFIG.INITIAL_BONUS_COINS,
          title: 'Noviço da Nação',
          equippedTitle: 'Noviço da Nação',
          equippedFrame: 'default',
          unlockedFrames: ['default'],
          unlockedAvatars: [chosenAvatarId],
          unlockedAchievements: [],
          claimedAchievements: {},
          badges: ['novico'],
          inventory: {
            avatars: [chosenAvatarId],
            arenas: ['arena_1'],
            titles: ['tit_novico'],
            taunts: ['pack_basico'],
            frames: ['default'],
            utilities: {
              fiftyFifty: 0,
              freezeTime: 0,
              publicVote: 0,
            },
          },
          equipped: {
            avatar: chosenAvatarUrl,
            avatarId: chosenAvatarId,
            title: 'Noviço da Nação',
            arena: 'arena_1',
            frameId: 'default',
          },
          consumables: {
            help5050: 0,
            freezeTime: 0,
            publicVote: 0,
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      // 2. Sincroniza o perfil público para os Rankings Nacionais
      await setDoc(
        doc(db, 'publicProfiles', user.uid),
        {
          uid: user.uid,
          displayName: cleanName,
          photoURL: chosenAvatarUrl,
          avatarId: chosenAvatarId,
          district: selectedDistrict,
          level: 1,
          xp: 0,
          equippedTitle: 'Noviço da Nação',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      // 3. Atualiza dados locais de sessão
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_district', selectedDistrict)
        localStorage.setItem('user_avatar', chosenAvatarId)
        localStorage.setItem('user_photo', chosenAvatarUrl)
        localStorage.setItem('user_coins', String(ECONOMY_CONFIG.INITIAL_BONUS_COINS))
        localStorage.setItem('user_euros', String(ECONOMY_CONFIG.INITIAL_BONUS_COINS))
        localStorage.setItem('user_display_name', cleanName)
        window.dispatchEvent(new CustomEvent('balance_updated', { detail: { coins: ECONOMY_CONFIG.INITIAL_BONUS_COINS } }))
        window.dispatchEvent(new CustomEvent('avatarChanged', { detail: { avatarId: chosenAvatarId } }))
      }

      onComplete(selectedDistrict)
    } catch (err: any) {
      console.error('[ONBOARDING] Erro ao guardar perfil inicial:', err)
      setError('Ocorreu um erro ao registar o perfil. Tenta novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-4 animate-in fade-in duration-200">
        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 text-2xl shadow-lg shadow-emerald-500/20">
          🇵🇹
        </div>

        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider font-display">
            Bem-vindo ao Acorda Portugal
          </h2>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Personaliza o teu perfil inicial para começares a competir no Desafio Nacional.
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold text-left">
            {error}
          </div>
        )}

        {/* Escolha do Avatar Inicial */}
        <div className="text-left space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            1. Escolhe o teu Avatar Inicial:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {STARTER_AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => setSelectedAvatar(av.id)}
                className={`flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedAvatar === av.id
                    ? 'border-emerald-400 bg-emerald-500/20 ring-2 ring-emerald-400/50 scale-105 shadow-md shadow-emerald-500/20'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={av.image}
                  alt={av.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <span className="text-[9px] font-bold text-white mt-1 text-center line-clamp-1">
                  {av.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Escolha do Distrito */}
        <div className="text-left space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            2. Distrito ou Ilha de Origem:
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
            required
          >
            <option value="" disabled>
              Seleciona o teu distrito ou ilha...
            </option>
            {PORTUGAL_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500">
            A tua escolha territorial é definitiva e pontua para o teu distrito.
          </p>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedDistrict || loading}
          className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 disabled:cursor-not-allowed"
        >
          {loading ? 'A criar perfil...' : 'Confirmar e Jogar Agora →'}
        </button>
      </div>
    </div>
  )
}

export default DistrictOnboardingModal
