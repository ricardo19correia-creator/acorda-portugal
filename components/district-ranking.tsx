'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MapPin, Users, Sparkles, Medal, Trophy, ChevronRight, Swords } from 'lucide-react'
import { collection, onSnapshot, query, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { SectionHeading } from '@/components/section-heading'
import { PortugalMapInteractive, type DistrictStatItem } from '@/components/portugal-map-interactive'
import { useAuth } from '@/components/auth-provider'
import { cn } from '@/lib/utils'
import { subscribeRankings, computeDistrictStats } from '@/lib/rankings'
import { calculateLevelProgress } from '@/lib/progression'

export const ALL_20_DISTRICTS = [
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Vila Real',
  'Viseu',
  'Açores',
  'Madeira',
]

const MEDAL_ICONS = ['🥇', '🥈', '🥉']

export function DistrictRanking() {
  const { user, profile } = useAuth()
  const [selected, setSelected] = useState<string>(profile?.district || 'Vila Real')
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false)
  const [districtData, setDistrictData] = useState<Map<string, DistrictStatItem>>(() => {
    const initialMap = new Map<string, DistrictStatItem>()
    ALL_20_DISTRICTS.forEach((name, idx) => {
      initialMap.set(name, {
        name,
        pos: idx + 1,
        players: 0,
        xp: 0,
      })
    })
    return initialMap
  })

  // Subscrição em Tempo Real combinando publicProfiles e botPlayers com agregação nos 20 Distritos
  useEffect(() => {
    const unsubscribe = subscribeRankings(
      'all',
      'xp',
      (allPlayers) => {
        let unifiedList = [...allPlayers]
        if (user?.uid && profile) {
          const userXp = typeof profile.xp === 'number' && !isNaN(profile.xp) ? Math.max(0, profile.xp) : 0
          const userLevel = calculateLevelProgress(userXp).currentLevel.level
          const userDistrict = (profile.district || 'Portugal').trim()
          const hasUser = unifiedList.some((p) => p.uid === user.uid)
          if (!hasUser) {
            unifiedList.push({
              uid: user.uid,
              displayName: profile.displayName || user.displayName || 'Jogador',
              photoURL: profile.photoURL || user.photoURL || undefined,
              level: userLevel,
              xp: userXp,
              district: userDistrict,
              region: userDistrict,
              title: profile.equippedTitle || calculateLevelProgress(userXp).currentLevel.title,
              playerType: 'human',
              isNpc: false,
            })
          }
        }

        // Agregação Distrital Exata: XP = SUM(publicProfiles.xp) + SUM(botPlayers.xp)
        const statsMap = computeDistrictStats(unifiedList)
        const districtStatMap = new Map<string, DistrictStatItem>()

        statsMap.forEach((stat, districtName) => {
          districtStatMap.set(districtName, {
            name: districtName,
            pos: stat.pos,
            players: stat.players,
            xp: stat.xp,
          })
        })

        setDistrictData(districtStatMap)
      },
      500
    )

    return () => unsubscribe()
  }, [profile?.district, profile?.xp, profile?.uid, user?.uid, profile])

  useEffect(() => {
    if (!hasInitializedSelection) {
      const userDistrict = profile?.district
      if (userDistrict && ALL_20_DISTRICTS.includes(userDistrict)) {
        setSelected(userDistrict)
        setHasInitializedSelection(true)
      }
    }
  }, [profile?.district, hasInitializedSelection])

  const selectedStat = useMemo(() => {
    return (
      districtData.get(selected) ?? {
        name: selected,
        pos: 1,
        players: 0,
        xp: 0,
      }
    )
  }, [districtData, selected])

  const sortedDistricts = useMemo(() => {
    return Array.from(districtData.values()).sort((a, b) => a.pos - b.pos)
  }, [districtData])

  const maxDistrictXp = useMemo(() => {
    let max = 1
    for (const stat of districtData.values()) {
      if (stat.xp > max) max = stat.xp
    }
    return max
  }, [districtData])

  return (
    <section id="distritos" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <SectionHeading
        eyebrow="Guerra Territorial dos 18 Distritos e 2 Regiões"
        title="Disputa Distrital"
        description="Cada resposta certa soma pontos ao teu distrito. Clica no mapa para explorar a classificação territorial real."
      />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Interactive Map Column */}
        <div className="lg:col-span-6 flex flex-col items-center bg-card/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> Mapa Interativo
            </span>
            <span className="text-[11px] text-muted-foreground font-semibold">
              Clica num distrito para selecionar
            </span>
          </div>

          <div className="w-full max-w-md">
            <PortugalMapInteractive
              selected={selected}
              onSelect={(d: string) => setSelected(d)}
              districtStats={districtData}
            />
          </div>
        </div>

        {/* District Detail & Leaderboard Column */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Selected District Card */}
          <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/15 via-card/90 to-card/90 p-6 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gold">
                  Distrito Selecionado
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-black text-white">
                  {selectedStat.name}
                </h3>
              </div>
              <div className="text-right">
                {selectedStat.xp > 0 && selectedStat.pos > 0 ? (
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold text-gold-foreground font-display text-lg font-black shadow-lg shadow-gold/30">
                    {selectedStat.pos}º
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 font-mono text-[10px] font-bold border border-slate-700 block text-center">
                    NÃO CONQUISTADO
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Pontos Acumulados
                </span>
                <span className="font-display text-xl sm:text-2xl font-black text-gold mt-1 block">
                  {selectedStat.xp.toLocaleString('pt-PT')} XP
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Jogadores Ativos
                </span>
                <span className="font-display text-xl sm:text-2xl font-black text-white mt-1 block">
                  {selectedStat.players.toLocaleString('pt-PT')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  const target = `/jogar?cat=o-meu-distrito&dist=${encodeURIComponent(selectedStat.name)}`
                  if (!user) {
                    window.location.href = `/entrar?redirect=${encodeURIComponent(target)}`
                    return
                  }
                  window.location.href = target
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold via-amber-400 to-gold px-6 py-3.5 font-display text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-gold/25 hover:brightness-110 cursor-pointer active:scale-95 transition-all"
              >
                <Swords className="h-4 w-4" />
                <span>Jogar e pontuar por {selectedStat.name}</span>
              </button>
            </div>
          </div>

          {/* District Ranking List */}
          <div className="rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl max-h-[420px] overflow-y-auto">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
              Classificação dos 20 Distritos e Regiões
            </h4>

            <div className="space-y-2">
              {sortedDistricts.map((dist) => {
                const isSel = dist.name === selected
                const percent = maxDistrictXp > 0 ? Math.max(4, Math.round((dist.xp / maxDistrictXp) * 100)) : 4
                return (
                  <div
                    key={dist.name}
                    onClick={() => setSelected(dist.name)}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer',
                      isSel
                        ? 'border-gold bg-gold/15 text-white shadow-md shadow-gold/10'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-display text-xs font-black w-6 text-center text-muted-foreground">
                        {dist.xp > 0 && dist.pos > 0
                          ? dist.pos <= 3
                            ? MEDAL_ICONS[dist.pos - 1]
                            : `#${dist.pos}`
                          : '-'}
                      </span>
                      <span className="font-bold text-sm truncate">{dist.name}</span>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="hidden sm:block w-24 bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gold h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="font-display text-xs font-black text-gold">
                        {dist.xp.toLocaleString('pt-PT')} XP
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
