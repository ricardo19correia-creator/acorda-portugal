'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Calendar, Trophy, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react'
import {
  subscribePublishedEvents,
  type OfficialEventConfig,
  getEventStatus,
  getEventStatusLabel,
} from '@/lib/events-service'

export function EventosView() {
  const [events, setEvents] = useState<OfficialEventConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribePublishedEvents((list) => {
      setEvents(list)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div>
          <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <span>Eventos Oficiais &amp; Competições</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configuração e estado dos eventos nacionais em tempo real.
          </p>
        </div>

        <Link
          href="/eventos"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition cursor-pointer"
        >
          <span>Abrir Página Pública</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center text-slate-400 space-y-2">
          <div className="h-7 w-7 mx-auto rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          <p className="text-xs">A carregar eventos do Firestore...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-slate-900/60 p-8 sm:p-12 text-center space-y-4">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/10 text-amber-400">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-display font-black text-base uppercase text-white">
              Nenhum evento oficial ativo ou configurado
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              A coleção de eventos está completamente limpa. Quando forem criados e publicados eventos reais na base de dados, a configuração, métricas e estado aparecerão aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((evt) => {
            const status = getEventStatus(evt)
            const statusLabel = getEventStatusLabel(status)
            return (
              <div
                key={evt.id}
                className="rounded-3xl border border-amber-500/30 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    {evt.type}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{statusLabel}</span>
                  </span>
                </div>

                <div>
                  <h4 className="font-display font-black text-lg text-white">{evt.title}</h4>
                  <p className="text-xs text-amber-300 font-medium">{evt.subtitle}</p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{evt.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
