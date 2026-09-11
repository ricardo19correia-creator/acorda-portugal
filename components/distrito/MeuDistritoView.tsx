'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Swords,
  Shield,
  Trophy,
  Users,
  Zap,
  Crown,
  MapPin,
  Search,
  Check,
  ChevronRight,
  X,
  Globe,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { AuthWallModal } from '@/components/auth-wall-modal'
import { db } from '@/lib/firebase'
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { VALID_DISTRICTS, type ValidDistrict } from '@/data/districts'
import {
  calculateDistrictWarTerritories,
  DISTRICT_METADATA,
  type DistrictWarTerritory,
} from '@/lib/district-war'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import { cn } from '@/lib/utils'

export interface MeuDistritoViewProps {
  initialDistrict?: string | null
}

export function MeuDistritoView({ initialDistrict }: MeuDistritoViewProps) {
  const router = useRouter()
  const { user, profile, updateProfileLocally } = useAuth()

  // Estado estritamente distrital (zero concelhos)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(initialDistrict || null)
  const [isChangingDistrict, setIsChangingDistrict] = useState(false)
  const [districtSearch, setDistrictSearch] = useState('')
  const [authWallOpen, setAuthWallOpen] = useState(false)
  const [authWallTarget, setAuthWallTarget] = useState('/meu-distrito')

  // Dados reais em tempo real da Guerra dos Distritos
  const [players, setPlayers] = useState<RankingPlayer[]>([])
  const [loadingRankings, setLoadingRankings] = useState(true)

  // 1. Inicializar Distrito persistido
  useEffect(() => {
    let dist: string | null = null

    if (profile?.district && profile.district.trim() !== '') {
      dist = profile.district.trim()
    } else if (profile?.representedDistrict && profile.representedDistrict.trim() !== '') {
      dist = profile.representedDistrict.trim()
    } else if (typeof window !== 'undefined') {
      const savedDist = localStorage.getItem('user_district') || localStorage.getItem('user_represented_district')
      if (savedDist && savedDist.trim() !== '') {
        dist = savedDist.trim()
      }
    }

    if (dist && VALID_DISTRICTS.includes(dist as ValidDistrict)) {
      setSelectedDistrict(dist)
    } else if (!selectedDistrict && initialDistrict && VALID_DISTRICTS.includes(initialDistrict as ValidDistrict)) {
      setSelectedDistrict(initialDistrict)
    }
  }, [profile?.district, profile?.representedDistrict, initialDistrict])

  // 2. Subscrição em tempo real aos jogadores para cálculo de poder e soberano
  useEffect(() => {
    setLoadingRankings(true)
    const unsubscribe = subscribeRankings(
      'all',
      'xp',
      (data) => {
        setPlayers(data)
        setLoadingRankings(false)
      },
      100
    )
    return () => unsubscribe()
  }, [])

  // 3. Cálculo autoritativo dos territórios da Guerra dos Distritos a partir de dados reais
  const territories = useMemo(() => {
    return calculateDistrictWarTerritories(players)
  }, [players])

  // Território selecionado
  const currentTerritory = useMemo<DistrictWarTerritory | null>(() => {
    if (!selectedDistrict) return null
    return territories.find((t) => t.name.toLowerCase() === selectedDistrict.toLowerCase()) || null
  }, [territories, selectedDistrict])

  // Metadados táticos do distrito selecionado
  const districtMeta = useMemo(() => {
    if (!selectedDistrict) return null
    return (
      DISTRICT_METADATA[selectedDistrict] || {
        tag: `SETOR // ${selectedDistrict.toUpperCase()}`,
        motto: 'Terra de Honra e Soberania',
        color: '#06b6d4',
      }
    )
  }, [selectedDistrict])

  // Filtrar distritos para pesquisa no seletor
  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return VALID_DISTRICTS
    const term = districtSearch.toLowerCase().trim()
    return VALID_DISTRICTS.filter((d) => d.toLowerCase().includes(term))
  }, [districtSearch])

  // Persistir seleção de distrito
  const handleSelectDistrict = async (distName: string) => {
    setSelectedDistrict(distName)
    setIsChangingDistrict(false)
    setDistrictSearch('')

    // Atualização local imediata
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_district', distName)
      localStorage.setItem('user_represented_district', distName)
      window.dispatchEvent(new CustomEvent('profile_updated'))
    }

    // Atualização de contexto
    if (updateProfileLocally) {
      updateProfileLocally({
        district: distName,
        representedDistrict: distName,
      })
    }

    // Persistência no Firestore
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          district: distName,
          representedDistrict: distName,
          updatedAt: serverTimestamp(),
        })
        await setDoc(
          doc(db, 'publicProfiles', user.uid),
          {
            district: distName,
            representedDistrict: distName,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      } catch (err) {
        console.warn('[MeuDistrito] Aviso ao persistir distrito no Firestore:', err)
      }
    }
  }

  // Ação Principal: Jogar pelo Distrito
  const handlePlayDistrict = () => {
    if (!selectedDistrict) {
      setIsChangingDistrict(true)
      return
    }

    const target = `/jogar?cat=conquista-do-distrito&dist=${encodeURIComponent(selectedDistrict)}`
    if (!user) {
      setAuthWallTarget(target)
      setAuthWallOpen(true)
      return
    }
    router.push(target)
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 selection:bg-cyan-500 selection:text-black">
      {/* 1. HIERARQUIA SUPERIOR CANÓNICA */}
      <header className="mb-6">
        {/* Breadcrumb estrito: PORTUGAL // [DISTRITO] */}
        <nav
          aria-label="Hierarquia territorial"
          className="flex items-center gap-2 text-xs font-mono tracking-widest text-slate-400 mb-4 uppercase"
        >
          <Link
            href="/"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-slate-300"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>PORTUGAL</span>
          </Link>
          <span className="text-cyan-500/70 font-bold">//</span>
          <span className={cn('font-black tracking-wider', selectedDistrict ? 'text-cyan-300' : 'text-slate-500')}>
            {selectedDistrict ? selectedDistrict.toUpperCase() : 'SELECIONA O TEU DISTRITO'}
          </span>
        </nav>

        {/* Badge Soberania Distrital */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)] mb-3">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>SOBERANIA DISTRITAL</span>
        </div>

        {/* Título e Destaque Monumental do Distrito */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs sm:text-sm font-mono font-bold tracking-widest text-slate-400 block uppercase mb-1">
              MEU DISTRITO
            </span>
            <h1 className="text-4xl sm:text-6xl font-black uppercase font-display tracking-tight text-white drop-shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center gap-3">
              {selectedDistrict ? (
                <span>{selectedDistrict}</span>
              ) : (
                <span className="text-slate-500 text-3xl sm:text-5xl">Sem Distrito</span>
              )}
            </h1>
          </div>

          {selectedDistrict && (
            <button
              type="button"
              onClick={() => setIsChangingDistrict(true)}
              className="self-start sm:self-auto text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 hover:text-white px-4 py-2 rounded-xl border border-cyan-500/40 bg-slate-900/80 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all cursor-pointer shadow-sm active:scale-98"
            >
              Trocar Distrito
            </button>
          )}
        </div>

        {/* Subtexto Oficial Estrito */}
        <p className="text-sm sm:text-base text-slate-300 mt-3 font-medium max-w-2xl leading-relaxed">
          Responde a perguntas sobre o teu distrito e conquista pontos para a classificação distrital.
        </p>
      </header>

      {/* ========================================================================= */}
      {/* SELETOR MODAL / OVERLAY QUANDO NÃO ESCOLHEU OU QUANDO CLICA EM TROCAR    */}
      {/* ========================================================================= */}
      {(!selectedDistrict || isChangingDistrict) ? (
        <section
          aria-label="Escolha de Distrito"
          className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl my-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase font-display text-white flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <span>Escolhe o Teu Distrito</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Seleciona o distrito oficial que vais representar na Guerra dos Distritos.
              </p>
            </div>

            {selectedDistrict && (
              <button
                type="button"
                onClick={() => setIsChangingDistrict(false)}
                className="self-start sm:self-auto text-xs font-mono font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Fechar</span>
              </button>
            )}
          </div>

          {/* Barra de Pesquisa Rápida */}
          <div className="relative my-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar distrito ou região..."
              value={districtSearch}
              onChange={(e) => setDistrictSearch(e.target.value)}
              className="w-full bg-slate-950/90 border border-cyan-500/30 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
            />
          </div>

          {/* Grelha dos 20 Distritos Oficiais */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredDistricts.map((dist) => {
              const isCurrent = selectedDistrict === dist
              const tData = territories.find((t) => t.name.toLowerCase() === dist.toLowerCase())
              const meta = DISTRICT_METADATA[dist]

              return (
                <button
                  key={dist}
                  type="button"
                  onClick={() => handleSelectDistrict(dist)}
                  className={cn(
                    'group p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between select-none relative overflow-hidden active:scale-98',
                    isCurrent
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400'
                      : 'bg-slate-950/70 border-white/10 hover:border-cyan-500/60 hover:bg-slate-900/90'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
                        {tData?.pos ? `#${tData.pos}` : 'Distrito'}
                      </span>
                      {isCurrent && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <h3 className="font-display font-black text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {dist}
                    </h3>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-medium">
                      {meta?.motto || 'Território de Portugal'}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 text-[10px] font-mono text-emerald-400 flex items-center justify-between">
                    <span>{tData?.power ? tData.power.toLocaleString('pt-PT') : '0'} pts</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 group-hover:text-cyan-400 transition-all" />
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      ) : (
        /* ========================================================================= */
        /* ECRÃ PRINCIPAL: TERRITÓRIO COMPETITIVO DE GUERRA DISTRITAL                */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* PAINEL CINEMATOGRÁFICO DO DISTRITO */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-slate-950 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_35px_rgba(6,182,212,0.15)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Cabeçalho do Bloco Tático */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 flex items-center justify-center font-display font-black text-3xl shadow-lg shadow-cyan-500/20">
                  📍
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                      {districtMeta?.tag || 'Setor Territorial Oficial'}
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="text-xs text-slate-400 font-medium">
                      {districtMeta?.motto || 'Terra de Honra'}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black uppercase font-display text-white tracking-wide mt-1">
                    {selectedDistrict}
                  </h2>
                </div>
              </div>
            </div>

            {/* 4. CARTÕES DE INFORMAÇÃO (3 INDICADORES DE JOGO) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              {/* Indicador 1: Posição Distrital */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-amber-400/50 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <span>Posição Distrital</span>
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <div className="my-2">
                  <p className="text-3xl sm:text-4xl font-mono font-black text-amber-400 tracking-tight">
                    {currentTerritory?.pos ? `#${currentTerritory.pos}` : '#--'}
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  na classificação nacional
                </span>
              </div>

              {/* Indicador 2: Poder do Distrito */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-emerald-400/50 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <span>Poder do Distrito</span>
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="my-2">
                  <p className="text-3xl sm:text-4xl font-mono font-black text-emerald-400 tracking-tight">
                    {currentTerritory?.power ? currentTerritory.power.toLocaleString('pt-PT') : '0'}
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  pontos conquistados pelo distrito
                </span>
              </div>

              {/* Indicador 3: Defensores Ativos */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <span>Defensores Ativos</span>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="my-2">
                  <p className="text-3xl sm:text-4xl font-mono font-black text-cyan-300 tracking-tight">
                    {currentTerritory?.activePlayers ?? 0}
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-medium truncate">
                  jogadores a representar {selectedDistrict}
                </span>
              </div>
            </div>

            {/* 5. SOBERANO DO DISTRITO */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-lg mb-6 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-md">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <span>👑 SOBERANO ATUAL</span>
                    </span>
                    {currentTerritory?.king ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-base sm:text-lg font-black text-white font-display">
                          {currentTerritory.king.displayName}
                        </span>
                        {currentTerritory.king.title && (
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {currentTerritory.king.title}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-base sm:text-lg font-black text-white font-display tracking-wider block mt-0.5">
                        TERRITÓRIO EM DISPUTA
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  {currentTerritory?.king ? (
                    <span className="text-xs font-mono font-bold text-amber-300 block">
                      Lidera com {currentTerritory.king.xp.toLocaleString('pt-PT')} XP
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300 font-medium block">
                      Joga para conquistar o topo distrital.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 6. PROGRESSO / PODER DISTRITAL */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 mb-6">
              <div className="flex items-center justify-between text-xs font-mono font-bold mb-2">
                <span className="text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Poder Distrital
                </span>
                <span className="text-cyan-400">
                  {currentTerritory?.dominancePercentage ?? 0}% do domínio nacional
                </span>
              </div>

              {/* Barra de Progresso Real */}
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-white/10 relative p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-700 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                  style={{
                    width: `${Math.max(
                      currentTerritory?.dominancePercentage ? Math.min(100, currentTerritory.dominancePercentage) : 0,
                      currentTerritory?.power && currentTerritory.power > 0 ? 3 : 0
                    )}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                <span>0 pts</span>
                <span>Força relativa na Guerra dos Distritos</span>
                <span>{currentTerritory?.power ? `${currentTerritory.power.toLocaleString('pt-PT')} pts` : '—'}</span>
              </div>
            </div>

            {/* 7. BOTÃO PRINCIPAL (CTA ENORME E IMPOSSÍVEL DE CONFUNDIR) */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={handlePlayDistrict}
                className="w-full py-5 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-display font-black text-lg sm:text-xl uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] active:scale-98 flex items-center justify-center gap-3 cursor-pointer select-none"
              >
                <Swords className="w-6 h-6 stroke-[2.5]" />
                <span>JOGAR PELO MEU DISTRITO</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LOGIN OBRIGATÓRIO PARA JOGADORES CONVIDADOS */}
      <AuthWallModal
        isOpen={authWallOpen}
        onClose={() => setAuthWallOpen(false)}
        targetUrl={authWallTarget}
      />
    </div>
  )
}
