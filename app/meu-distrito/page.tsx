'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  Building2,
  Trophy,
  Crown,
  Users,
  Swords,
  ChevronRight,
  ArrowLeft,
  Search,
  Check,
  Shield,
  Zap,
  Sparkles,
  Flame,
  Globe,
  RefreshCw,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackgroundFx } from '@/components/background-fx'
import { useAuth } from '@/components/auth-provider'
import { db } from '@/lib/firebase'
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import {
  VALID_DISTRICTS,
  DISTRICT_CITIES_MAP,
  type ValidDistrict,
} from '@/data/districts'
import {
  calculateDistrictWarTerritories,
  DISTRICT_METADATA,
  type DistrictWarTerritory,
} from '@/lib/district-war'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/ui/UserAvatar'

export default function MeuDistritoPage() {
  const router = useRouter()
  const { user, profile } = useAuth()

  // Estado do Distrito e Concelho
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [isChangingDistrict, setIsChangingDistrict] = useState(false)
  const [districtSearch, setDistrictSearch] = useState('')
  const [citySearch, setCitySearch] = useState('')

  // Dados em tempo real dos rankings distritais
  const [players, setPlayers] = useState<RankingPlayer[]>([])
  const [loadingRankings, setLoadingRankings] = useState(true)

  // 1. Inicializar Distrito persistido (sem inventar Lisboa!)
  useEffect(() => {
    let dist: string | null = null
    let city: string | null = null

    if (profile?.district && profile.district.trim() !== '') {
      dist = profile.district.trim()
    } else if (typeof window !== 'undefined') {
      const savedDist = localStorage.getItem('user_district')
      if (savedDist && savedDist.trim() !== '') {
        dist = savedDist.trim()
      }
    }

    if ((profile as any)?.city && (profile as any).city.trim() !== '') {
      city = (profile as any).city.trim()
    } else if (typeof window !== 'undefined') {
      const savedCity = localStorage.getItem('user_city')
      if (savedCity && savedCity.trim() !== '') {
        city = savedCity.trim()
      }
    }

    if (dist && VALID_DISTRICTS.includes(dist as ValidDistrict)) {
      setSelectedDistrict(dist)
      if (city && DISTRICT_CITIES_MAP[dist as ValidDistrict]?.includes(city)) {
        setSelectedCity(city)
      } else {
        const defaultCity = DISTRICT_CITIES_MAP[dist as ValidDistrict]?.[0] || dist
        setSelectedCity(defaultCity)
      }
    } else {
      setSelectedDistrict(null)
      setSelectedCity(null)
    }
  }, [profile?.district, (profile as any)?.city])

  // 2. Subscrição aos rankings para dados territoriais em direto
  useEffect(() => {
    setLoadingRankings(true)
    const unsubscribe = subscribeRankings(
      (data) => {
        setPlayers(data)
        setLoadingRankings(false)
      },
      'all',
      100,
      'xp'
    )
    return () => unsubscribe()
  }, [])

  // 3. Calcular territórios da Guerra dos Distritos
  const territories = useMemo(() => {
    return calculateDistrictWarTerritories(players)
  }, [players])

  // Território atual selecionado
  const currentTerritory = useMemo<DistrictWarTerritory | null>(() => {
    if (!selectedDistrict) return null
    return territories.find((t) => t.name.toLowerCase() === selectedDistrict.toLowerCase()) || null
  }, [territories, selectedDistrict])

  // Lista de concelhos do distrito selecionado
  const citiesOfDistrict = useMemo(() => {
    if (!selectedDistrict) return []
    return DISTRICT_CITIES_MAP[selectedDistrict as ValidDistrict] || []
  }, [selectedDistrict])

  // Filtrar concelhos pelo input de pesquisa
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return citiesOfDistrict
    const term = citySearch.toLowerCase()
    return citiesOfDistrict.filter((c) => c.toLowerCase().includes(term))
  }, [citiesOfDistrict, citySearch])

  // Filtrar distritos na escolha inicial
  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return VALID_DISTRICTS
    const term = districtSearch.toLowerCase()
    return VALID_DISTRICTS.filter((d) => d.toLowerCase().includes(term))
  }, [districtSearch])

  // Persistir seleção de distrito
  const handleSelectDistrict = async (distName: string) => {
    setSelectedDistrict(distName)
    setIsChangingDistrict(false)
    const firstCity = DISTRICT_CITIES_MAP[distName as ValidDistrict]?.[0] || distName
    setSelectedCity(firstCity)

    if (typeof window !== 'undefined') {
      localStorage.setItem('user_district', distName)
      localStorage.setItem('user_represented_district', distName)
      localStorage.setItem('user_city', firstCity)
      window.dispatchEvent(new CustomEvent('profile_updated'))
    }

    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          district: distName,
          representedDistrict: distName,
          city: firstCity,
          updatedAt: serverTimestamp(),
        })
        await setDoc(
          doc(db, 'publicProfiles', user.uid),
          {
            district: distName,
            representedDistrict: distName,
            city: firstCity,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      } catch (err) {
        console.warn('[MeuDistrito] Aviso ao persistir distrito no Firestore:', err)
      }
    }
  }

  // Persistir seleção de concelho
  const handleSelectCity = async (cityName: string) => {
    setSelectedCity(cityName)

    if (typeof window !== 'undefined') {
      localStorage.setItem('user_city', cityName)
      window.dispatchEvent(new CustomEvent('profile_updated'))
    }

    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          city: cityName,
          updatedAt: serverTimestamp(),
        })
        await setDoc(
          doc(db, 'publicProfiles', user.uid),
          { city: cityName, updatedAt: serverTimestamp() },
          { merge: true }
        )
      } catch (err) {
        console.warn('[MeuDistrito] Aviso ao persistir concelho no Firestore:', err)
      }
    }
  }

  // Jogar pelo Distrito
  const handlePlayDistrict = () => {
    if (!selectedDistrict) return
    router.push(`/jogar?cat=conquista-do-distrito&dist=${encodeURIComponent(selectedDistrict)}`)
  }

  // Jogar pelo Concelho
  const handlePlayCity = () => {
    if (!selectedDistrict || !selectedCity) return
    router.push(`/jogar?cat=desafio-cidade&city=${encodeURIComponent(selectedCity)}&dist=${encodeURIComponent(selectedDistrict)}`)
  }

  const meta = selectedDistrict ? DISTRICT_METADATA[selectedDistrict] : null

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col selection:bg-cyan-500 selection:text-black">
      <BackgroundFx variant="district" />

      <div className="relative z-20 flex-1 flex flex-col">
        <SiteHeader />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb da Hierarquia Territorial */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-6 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>PORTUGAL</span>
            </Link>
            <span>↓</span>
            <span className={cn('font-bold', selectedDistrict ? 'text-cyan-300' : 'text-slate-500')}>
              {selectedDistrict ? selectedDistrict.toUpperCase() : 'DISTRITO'}
            </span>
            <span>↓</span>
            <span className={cn('font-bold', selectedCity ? 'text-amber-300' : 'text-slate-500')}>
              {selectedCity ? selectedCity.toUpperCase() : 'CONCELHO'}
            </span>
          </div>

          {/* Cabeçalho Principal Canónico */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 mb-2">
              <Shield className="w-3.5 h-3.5" />
              Soberania Territorial
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase font-display text-white tracking-tight text-glow-primary">
              Meu Distrito
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 font-medium max-w-2xl leading-relaxed">
              Representa a tua terra. Conquista território. Sobe no ranking.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* CASO A: O UTILIZADOR AINDA NÃO ESCOLHEU DISTRITO (OU CLICOU EM ALTERAR) */}
          {/* ========================================================================= */}
          {(!selectedDistrict || isChangingDistrict) ? (
            <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase font-display text-white flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-emerald-400" />
                    Escolhe o Teu Distrito
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Seleciona a tua região oficial para somares pontos à tua terra natal e disputares a soberania.
                  </p>
                </div>

                {selectedDistrict && isChangingDistrict && (
                  <button
                    type="button"
                    onClick={() => setIsChangingDistrict(false)}
                    className="self-start sm:self-auto text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {/* Barra de Pesquisa de Distritos */}
              <div className="relative my-5">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar distrito ou região autónoma..."
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              {/* Grelha dos 20 Distritos / Regiões Autónomas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredDistricts.map((dist) => {
                  const distMeta = DISTRICT_METADATA[dist]
                  const isCurrent = selectedDistrict === dist
                  const tData = territories.find((t) => t.name.toLowerCase() === dist.toLowerCase())

                  return (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => handleSelectDistrict(dist)}
                      className={cn(
                        'group p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between select-none relative overflow-hidden',
                        isCurrent
                          ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                          : 'bg-slate-950/60 border-white/10 hover:border-cyan-500/50 hover:bg-slate-900'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                            {tData?.pos ? `#${tData.pos}` : 'Distrito'}
                          </span>
                          {isCurrent && <Check className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <h3 className="font-display font-black text-sm text-white group-hover:text-cyan-300 transition-colors">
                          {dist}
                        </h3>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
                          {distMeta?.motto || 'Território de Portugal'}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-emerald-400 flex items-center justify-between">
                        <span>{tData?.powerFormatted || '0'} Poder</span>
                        <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* CASO B: UTILIZADOR TEM DISTRITO ESCOLHIDO — PAINEL COMPLETO DO TERRITÓRIO */
            /* ========================================================================= */
            <div className="space-y-6">
              {/* CARTÃO PRINCIPAL: O TEU DISTRITO */}
              <div className="relative overflow-hidden rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3.5">
                    <div className="h-14 w-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 flex items-center justify-center font-display font-black text-2xl shadow-lg">
                      📍
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                          {meta?.tag || 'Setor Territorial'}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="text-xs text-slate-400 font-medium">
                          {meta?.motto || 'Terra de Honra'}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-black uppercase font-display text-white tracking-wide">
                        {selectedDistrict}
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsChangingDistrict(true)}
                    className="self-start sm:self-auto text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all cursor-pointer select-none"
                  >
                    Trocar de Distrito
                  </button>
                </div>

                {/* ESTATÍSTICAS MANDATÓRIAS DO TERRITÓRIO */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-6">
                  {/* 1. Posição Distrital */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                      <span>Posição Distrital</span>
                      <Trophy className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-mono font-black text-amber-400 mt-2">
                      {currentTerritory?.pos ? `#${currentTerritory.pos}` : '-'}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1">na Guerra dos Distritos</span>
                  </div>

                  {/* 2. Poder Territorial */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                      <span>Poder Territorial</span>
                      <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-400 mt-2">
                      {currentTerritory?.powerFormatted || '0'}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1">pontos acumulados</span>
                  </div>

                  {/* 3. Posição Municipal */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                      <span>Concelho Atual</span>
                      <Building2 className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-xl sm:text-2xl font-mono font-black text-cyan-300 mt-2 truncate">
                      {selectedCity || 'Geral'}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1">ranking local ativo</span>
                  </div>

                  {/* 4. Jogadores Ativos */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                      <span>Jogadores Ativos</span>
                      <Users className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-mono font-black text-purple-300 mt-2">
                      {currentTerritory?.activePlayers ?? 0}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1">a defender o território</span>
                  </div>
                </div>

                {/* SOBERANIA / REI DO DISTRITO */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block font-mono">
                        Soberano Atual • Rei do Distrito
                      </span>
                      <span className="text-sm font-bold text-white block">
                        {currentTerritory?.king?.displayName || 'Território em disputa aberta'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-amber-300/80 font-medium">
                    {currentTerritory?.king
                      ? `Lidera com ${currentTerritory.king.xp.toLocaleString('pt-PT')} XP`
                      : 'Joga agora para conquistares o trono!'}
                  </span>
                </div>

                {/* BOTÕES DE AÇÃO: JOGAR PELO DISTRITO E JOGAR PELO CONCELHO */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handlePlayDistrict}
                    className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 fill-current" />
                    <span>Conquistar pelo Distrito de {selectedDistrict}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePlayCity}
                    className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 font-display font-black text-sm uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Desafio do Concelho ({selectedCity})</span>
                  </button>
                </div>
              </div>

              {/* SELEÇÃO DO CONCELHO / MUNICÍPIO INTEGRADO NO DISTRITO */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-7 backdrop-blur-xl shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-black uppercase font-display text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-amber-400" />
                      Concelhos de {selectedDistrict}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Escolhe o teu concelho para competires no ranking municipal integrado.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrar concelho..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1 scrollbar-thin">
                  {filteredCities.map((city) => {
                    const isCityActive = selectedCity === city
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleSelectCity(city)}
                        className={cn(
                          'px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none flex items-center gap-1.5',
                          isCityActive
                            ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-400/50'
                            : 'bg-slate-950/60 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        {isCityActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{city}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
