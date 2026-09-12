'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Flame, Swords, Shield } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore'
import { useAuth } from '@/components/auth-provider'
import { filterActiveRealPlayers } from '@/lib/real-presence'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function JogadoresPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [rawDocs, setRawDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    try {
      const presenceCol = collection(db, 'publicPresence')
      const q = query(presenceCol, where('online', '==', true), limit(250))
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs: any[] = []
          snapshot.forEach((docSnap) => {
            const data = docSnap.data()
            if (data && data.userId) docs.push(data)
          })
          setRawDocs(docs)
          setLoading(false)
        },
        () => setLoading(false)
      )
    } catch {
      setLoading(false)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(timer)
  }, [])

  const community = useMemo(() => {
    return filterActiveRealPlayers(rawDocs, user?.uid, now)
  }, [rawDocs, user?.uid, now])

  const { players, humanOnline } = community

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-transparent text-foreground">
      <SiteHeader />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold">
              {humanOnline} {humanOnline === 1 ? 'jogador online' : 'jogadores online'}
            </span>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-md p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wide">
                Comunidade Nacional
              </h1>
              <p className="text-xs text-slate-400">
                Jogadores reais ativos e a representar os seus distritos agora.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 py-6 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <p className="text-sm">Nenhum outro jogador ativo no momento.</p>
              <p className="text-xs text-slate-500">
                Entra numa partida para liderar a presença do teu distrito!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {players.map((p) => {
                const isCurrent = p.userId === user?.uid
                return (
                  <div
                    key={p.userId}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        src={p.photoURL}
                        alt={p.displayName}
                        activeFrame={p.equippedFrame}
                        size="md"
                        showBadge={false}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {p.displayName}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Tu
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-cyan-400/80 font-mono">
                          📍 {p.district || 'Portugal'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs">
                      {p.activity === 'playing' ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                          <Flame className="w-3.5 h-3.5" />
                          Em Partida
                        </span>
                      ) : p.activity === 'duel' ? (
                        <span className="inline-flex items-center gap-1 text-purple-400 font-semibold">
                          <Swords className="w-3.5 h-3.5" />
                          Em Duelo
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">Online</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
