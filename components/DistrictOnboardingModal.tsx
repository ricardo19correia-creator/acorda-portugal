'use client'

import React, { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PORTUGAL_DISTRICTS } from '@/data/districts'
import { DEFAULT_AVATAR_URL, DEFAULT_AVATAR_ID, STARTER_AVATAR_ID } from '@/data/constants'
import { DEFAULT_AVATAR } from '@/lib/avatars'
import { ECONOMY_CONFIG } from '@/src/data/economy'
import { DEFAULT_STARTER_TITLE_ID, DEFAULT_STARTER_TITLE_NAME } from '@/lib/titles'

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
      const cleanName = (user.displayName || user.email?.split('@')[0] || 'Jogador').trim()
      const chosenAvatarId = STARTER_AVATAR_ID
      const chosenAvatarUrl = DEFAULT_AVATAR_URL
      const userRef = doc(db, 'users', user.uid)
      const { getDoc } = await import('firebase/firestore')
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const existingData = userSnap.data()
        // 1. Atualizar apenas território e campos em falta (NUNCA sobrescrever progresso nem moedas)
        await setDoc(
          userRef,
          {
            district: selectedDistrict,
            representedDistrict: selectedDistrict,
            districtLocked: true,
            updatedAt: serverTimestamp(),
            ...(existingData.displayName || existingData.name ? {} : { displayName: cleanName, name: cleanName }),
            ...(existingData.avatarId || existingData.equippedAvatar ? {} : {
              avatarId: chosenAvatarId,
              equippedAvatar: chosenAvatarId,
              avatar: chosenAvatarUrl,
              photoURL: chosenAvatarUrl,
              'equipped.avatar': chosenAvatarUrl,
              'equipped.avatarId': chosenAvatarId,
            }),
          },
          { merge: true }
        )

        // 2. Atualizar perfil público
        await setDoc(
          doc(db, 'publicProfiles', user.uid),
          {
            district: selectedDistrict,
            representedDistrict: selectedDistrict,
            updatedAt: serverTimestamp(),
            ...(existingData.displayName || existingData.name ? {} : { displayName: cleanName }),
          },
          { merge: true }
        )

        if (typeof window !== 'undefined') {
          localStorage.setItem('user_district', selectedDistrict)
          localStorage.setItem('user_represented_district', selectedDistrict)
          window.dispatchEvent(new CustomEvent('profile_updated'))
        }
      } else {
        // 1. Novo registo completo com saldo e inventário inicial
        await setDoc(
          userRef,
          {
            uid: user.uid,
            displayName: cleanName,
            name: cleanName,
            email: user.email || '',
            photoURL: chosenAvatarUrl,
            avatar: chosenAvatarUrl,
            avatarId: chosenAvatarId,
            equippedAvatar: chosenAvatarId,
            district: selectedDistrict,
            representedDistrict: selectedDistrict,
            districtLocked: true,
            level: 1,
            xp: 0,
            coins: ECONOMY_CONFIG.INITIAL_BONUS_COINS,
            euros: ECONOMY_CONFIG.INITIAL_BONUS_COINS,
            title: DEFAULT_STARTER_TITLE_NAME,
            equippedTitle: DEFAULT_STARTER_TITLE_NAME,
            equippedTitleId: DEFAULT_STARTER_TITLE_ID,
            equippedFrame: 'default',
            unlockedFrames: ['default'],
            unlockedAvatars: [chosenAvatarId],
            unlockedAchievements: [],
            claimedAchievements: {},
            badges: ['novico'],
            inventory: {
              avatars: [chosenAvatarId],
              arenas: ['arena_1'],
              titles: [DEFAULT_STARTER_TITLE_ID],
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
              title: DEFAULT_STARTER_TITLE_ID,
              titleId: DEFAULT_STARTER_TITLE_ID,
              titleName: DEFAULT_STARTER_TITLE_NAME,
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
            avatar: chosenAvatarUrl,
            avatarId: chosenAvatarId,
            equippedAvatar: chosenAvatarId,
            'equipped.avatar': chosenAvatarUrl,
            'equipped.avatarId': chosenAvatarId,
            district: selectedDistrict,
            representedDistrict: selectedDistrict,
            level: 1,
            xp: 0,
            title: DEFAULT_STARTER_TITLE_NAME,
            equippedTitle: DEFAULT_STARTER_TITLE_NAME,
            equippedTitleId: DEFAULT_STARTER_TITLE_ID,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )

        // 3. Atualiza dados locais de sessão
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_district', selectedDistrict)
          localStorage.setItem('user_represented_district', selectedDistrict)
          localStorage.setItem('user_avatar', chosenAvatarId)
          localStorage.setItem('user_equipped_avatar_id', chosenAvatarId)
          localStorage.setItem('equipped_avatar_id', chosenAvatarId)
          localStorage.setItem('user_photo', chosenAvatarUrl)
          localStorage.setItem('user_equipped_avatar', chosenAvatarUrl)
          localStorage.setItem('user_coins', String(ECONOMY_CONFIG.INITIAL_BONUS_COINS))
          localStorage.setItem('user_euros', String(ECONOMY_CONFIG.INITIAL_BONUS_COINS))
          localStorage.setItem('user_display_name', cleanName)
          window.dispatchEvent(new CustomEvent('balance_updated', { detail: { coins: ECONOMY_CONFIG.INITIAL_BONUS_COINS } }))
          window.dispatchEvent(new CustomEvent('avatarChanged', { detail: { avatarId: chosenAvatarId } }))
        }
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
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-5 animate-in fade-in duration-200">
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

        {/* Avatar Inicial Canónico Gratuito */}
        <div className="text-left space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            1. Avatar Inicial Oficial:
          </label>
          <div className="flex items-center gap-3.5 p-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={DEFAULT_AVATAR.image}
              alt={DEFAULT_AVATAR.name}
              className="w-14 h-14 rounded-xl object-cover border border-emerald-400/40 shadow-md shadow-emerald-500/20 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">{DEFAULT_AVATAR.name}</h3>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Grátis
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {DEFAULT_AVATAR.subtitle || DEFAULT_AVATAR.description}
              </p>
            </div>
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
