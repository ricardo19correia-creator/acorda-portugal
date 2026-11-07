'use client'

import React, { useState } from 'react'
import { Newspaper, Calendar, ShieldCheck, Tag, ArrowRight } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  summary: string
  tag: string
  date: string
  status: string
}

export function InstitutionalNews() {
  const [filter, setFilter] = useState<'todos' | 'oficial' | 'territorio' | 'verificacao'>('todos')

  const ARTICLES: (NewsItem & { category: 'oficial' | 'territorio' | 'verificacao' })[] = [
    {
      id: 'comunicado-rede-2026',
      title: 'Acorda Portugal consolida cobertura nos 18 distritos e ilhas',
      summary:
        'Canais diretos de informação descentralizada permitem que cidadãos de qualquer concelho reportem ocorrências de interesse público em tempo real.',
      category: 'oficial',
      tag: 'Comunicado Oficial',
      date: 'Novembro 2026',
      status: 'Oficial',
    },
    {
      id: 'protocolo-fact-checking',
      title: 'Mesa de Verificação Cívica: o protocolo contra a desinformação',
      summary:
        'Conheça o método de confirmação em quatro etapas utilizado para validar denúncias comunitárias e acontecimentos antes de entrarem no Radar Nacional.',
      category: 'verificacao',
      tag: 'Verificação Factual',
      date: 'Novembro 2026',
      status: 'Metodologia Verificada',
    },
    {
      id: 'radar-territorial-interior',
      title: 'Vigilância local e ocorrências nos concelhos do interior',
      summary:
        'Reforço da monitorização em zonas rurais e ligação estreita com residentes para assegurar que nenhuma região do país fica sem voz.',
      category: 'territorio',
      tag: 'Território',
      date: 'Outubro 2026',
      status: 'Relato Comunitário',
    },
  ]

  const filtered = filter === 'todos' ? ARTICLES : ARTICLES.filter((a) => a.category === filter)

  return (
    <section id="noticias" className="relative w-full py-14 sm:py-18 border-t border-white/10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Cabeçalho da Secção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Newspaper className="w-3.5 h-3.5" />
              <span>INFORMAÇÃO FACTUAL</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Notícias & Acontecimentos
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
              Factos, comunicados e acontecimentos confirmados pela rede cívica em todo o país.
            </p>
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'oficial', label: 'Oficial' },
              { id: 'territorio', label: 'Território' },
              { id: 'verificacao', label: 'Verificação' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === f.id
                    ? 'bg-emerald-600 text-slate-950 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grelha de Notícias Compacta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((art) => (
            <article
              key={art.id}
              className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur-sm flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-200"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {art.tag}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {art.date}
                  </span>
                </div>

                <h3 className="font-display text-base font-bold text-white leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  {art.status}
                </span>
                <span className="text-emerald-400 font-medium">Facto Registado</span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}

export default InstitutionalNews
