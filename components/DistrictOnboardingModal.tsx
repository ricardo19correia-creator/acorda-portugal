'use client'

import React, { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PORTUGAL_DISTRICTS } from '@/data/districts'
import { DEFAULT_AVATAR_URL, DEFAULT_AVATAR_ID } from '@/data/constants'
import { REAL_AVATARS } from '@/lib/avatars'

export interface DistrictOnboardingModalProps {
  user: any
  onComplete: (district: string) => void
}

export function DistrictOnboardingModal({ user, onComplete }: DistrictOnboardingModalProps) {
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!selectedDistrict || !user?.uid) return
    setLoading(true)
    setError(null)

    try {
      const cleanName = (user.displayName || user.email?.split('@')[0] || 'Noviço da Nação').trim()
      const photoURL = user.photoURL || DEFAULT_AVATAR_URL

      // 1. Grava o documento completo do utilizador no Firestore
      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          displayName: cleanName,
          name: cleanName,
          email: user.email || '',
          photoURL: photoURL,
          avatar: photoURL,
          avatarId: DEFAULT_AVATAR_ID,
          equippedAvatar: DEFAULT_AVATAR_ID,
          district: selectedDistrict, // OBRIGATÓRIO (escolhido no seletor)
          districtLocked: true,
          level: 1,
          xp: 0,
          coins: 100,
          euros: 100,
          title: 'Noviço da Nação',
          equippedTitle: 'Noviço da Nação',
          equippedFrame: 'default',
          unlockedFrames: ['default'],
          unlockedAvatars: [DEFAULT_AVATAR_ID],
          unlockedAchievements: [],
          claimedAchievements: {},
          badges: ['novico'],
          inventory: {
            avatars: [DEFAULT_AVATAR_ID],
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
            avatar: photoURL,
            avatarId: DEFAULT_AVATAR_ID,
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
          photoURL: photoURL,
          avatarId: DEFAULT_AVATAR_ID,
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
        localStorage.setItem('user_coins', '100')
        localStorage.setItem('user_euros', '100')
        localStorage.setItem('user_display_name', cleanName)
      }

      onComplete(selectedDistrict)
    } catch (err: any) {
      console.error('[ONBOARDING] Erro ao guardar distrito:', err)
      setError('Ocorreu um erro ao registar o distrito. Tenta novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-5 animate-in fade-in duration-200">
        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 text-2xl shadow-lg shadow-emerald-500/20">
          📍
        </div>

        <h2 className="text-xl font-black text-white uppercase tracking-wider font-display">
          Escolhe o teu Distrito
        </h2>

        <p className="text-slate-400 text-xs leading-relaxed">
          Representa a tua região no Ranking Territorial de Portugal. Esta escolha é definitiva e não poderá ser alterada.
        </p>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold text-left">
            {error}
          </div>
        )}

        <div className="text-left space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Distrito ou Ilha de Origem:
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
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedDistrict || loading}
          className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 disabled:cursor-not-allowed"
        >
          {loading ? 'A registar...' : 'Confirmar e Entrar no Jogo →'}
        </button>
      </div>
    </div>
  )
}

export default DistrictOnboardingModal
