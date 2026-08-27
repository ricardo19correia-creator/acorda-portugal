'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Medal, MapPin, Search, RefreshCw, Bot, User, Filter } from 'lucide-react'
import { VALID_DISTRICTS } from '@/data/districts'

interface RankingsViewProps {
  getIdToken: () => Promise<string | null>
}

export function RankingsView({ getIdToken }: RankingsViewProps) {
  const [district, setDistrict] = useState('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'humans' | 'bots'>('all')
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadRankings = async () => {
    setLoading(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const params = new URLSearchParams()
      if (district !== 'all') params.set('district', district)
      params.set('limit', '100')

      // 1. Carregar jogadores humanos
      const resPlayers = await fetch(`/api/admin/players?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const dataPlayers = await resPlayers.json()
      const humanList = (dataPlayers.players || []).map((p: any) => ({ ...p, isBot: false }))

      // 2. Carregar bots
      const resBots = await fetch(`/api/admin/bots?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const dataBots = await resBots.json()
      const botList = (dataBots.bots || []).map((b: any) => ({
        uid: b.id,
        displayName: b.displayName,
        district: b.district,
        level: b.level,
        xp: b.xp,
        rating: b.rating,
        wins: b.wins,
        isBot: true,
      }))

      let combined = [...humanList, ...botList]

      if (typeFilter === 'humans') {
        combined = combined.filter((p) => !p.isBot)
      } else if (typeFilter === 'bots') {
        combined = combined.filter((p) => p.isBot)
      }

      // Ordenar por XP ou Rating desc
      combined.sort((a, b) => (b.xp || 0) - (a.xp || 0))
      setPlayers(combined.slice(0, 50))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRankings()
  }, [district, typeFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div>
          <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <span>Gestão dos Rankings Nacionais & Distritais</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ligas, temporadas ativas e pontuações de experiência dos 18 distritos + Regiões Autónomas.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro de Tipo: Todos, Humanos, Bots */}
          <div className="flex rounded-2xl border border-white/15 bg-slate-950 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                typeFilter === 'all' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('humans')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === 'humans' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="h-3 w-3" />
              <span>Humanos</span>
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('bots')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === 'bots' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="h-3 w-3" />
              <span>Bots</span>
            </button>
          </div>

          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-2xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">🏆 Ranking Geral de Portugal</option>
            {VALID_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                📍 {d}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={loadRankings}
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-md">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-white/10 bg-slate-950/60 font-display text-[10px] font-black uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Posição</th>
              <th className="px-5 py-3.5">Jogador</th>
              <th className="px-4 py-3.5">Distrito</th>
              <th className="px-4 py-3.5">Nível</th>
              <th className="px-4 py-3.5">XP Total</th>
              <th className="px-4 py-3.5">Rating ELO</th>
              <th className="px-4 py-3.5">Vitórias</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-400" />
                  <span>A carregar ranking com filtros aplicados...</span>
                </td>
              </tr>
            ) : players.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Sem jogadores classificados para este filtro.
                </td>
              </tr>
            ) : (
              players.map((p, index) => (
                <tr key={p.uid} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5 font-display font-black text-xs">
                    {index === 0 ? (
                      <span className="text-amber-400">🥇 1º</span>
                    ) : index === 1 ? (
                      <span className="text-slate-300">🥈 2º</span>
                    ) : index === 2 ? (
                      <span className="text-amber-600">🥉 3º</span>
                    ) : (
                      <span className="text-slate-500 font-mono">#{index + 1}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{p.displayName || 'Jogador'}</span>
                      {p.isBot && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          🤖 Bot
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-300">📍 {p.district || 'Portugal'}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-400 font-mono">Nv.{p.level || 1}</td>
                  <td className="px-4 py-3.5 font-black text-amber-400 font-mono">
                    {(p.xp || 0).toLocaleString('pt-PT')} XP
                  </td>
                  <td className="px-4 py-3.5 font-mono text-white">{p.rating || 1000}</td>
                  <td className="px-4 py-3.5 font-mono text-emerald-400">{p.wins || p.stats?.wins || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
