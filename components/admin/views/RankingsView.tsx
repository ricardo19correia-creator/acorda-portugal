'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Medal, MapPin, Search, RefreshCw, User } from 'lucide-react'
import { VALID_DISTRICTS } from '@/data/districts'

interface RankingsViewProps {
  getIdToken: () => Promise<string | null>
}

export function RankingsView({ getIdToken }: RankingsViewProps) {
  const [district, setDistrict] = useState('all')
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

      // Carregar jogadores humanos reais
      const resPlayers = await fetch(`/api/admin/players?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const dataPlayers = await resPlayers.json()
      const list = (dataPlayers.players || []).map((p: any) => ({
        uid: p.uid,
        displayName: p.displayName,
        district: p.district,
        level: p.level,
        xp: p.xp,
        rating: p.rating || 1000,
        wins: p.wins || p.wins1v1 || 0,
      }))

      // Ordenar por XP desc
      list.sort((a: any, b: any) => (b.xp || 0) - (a.xp || 0))
      setPlayers(list.slice(0, 50))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRankings()
  }, [district])

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
          {/* Filtro de Distrito */}
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-2xl border border-white/15 bg-slate-950 px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">Todos os Distritos</option>
            {VALID_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={loadRankings}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-2xl border border-white/15 bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Tabela de Rankings */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-950/60 font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              <tr>
                <th className="py-3 px-4">Pos</th>
                <th className="py-3 px-4">Jogador</th>
                <th className="py-3 px-4">Distrito</th>
                <th className="py-3 px-4">Nível</th>
                <th className="py-3 px-4 text-right">XP Acumulado</th>
                <th className="py-3 px-4 text-right">Rating ELO</th>
                <th className="py-3 px-4 text-right">Vitórias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-500" />
                    <span>A carregar classificações...</span>
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Nenhum jogador encontrado para este distrito.
                  </td>
                </tr>
              ) : (
                players.map((p, idx) => (
                  <tr key={p.uid} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-black">
                      {idx === 0 && <span className="text-amber-400">🥇 1º</span>}
                      {idx === 1 && <span className="text-slate-300">🥈 2º</span>}
                      {idx === 2 && <span className="text-amber-600">🥉 3º</span>}
                      {idx > 2 && <span className="text-slate-500">{idx + 1}º</span>}
                    </td>
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                        <User className="h-4 w-4" />
                      </div>
                      <span>{p.displayName || 'Jogador'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        {p.district || 'Portugal'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-cyan-400">Nv.{p.level || 1}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                      {(p.xp || 0).toLocaleString('pt-PT')} XP
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-purple-400">
                      {p.rating || 1000}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {p.wins || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
