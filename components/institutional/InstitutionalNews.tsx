'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Newspaper,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Tag,
  ArrowRight,
  Radio,
} from 'lucide-react'

interface NewsArticle {
  id: string
  title: string
  summary: string
  category: 'oficial' | 'territorio' | 'verificacao' | 'patrimonio'
  categoryLabel: string
  date: string
  source: string
  isOfficial?: boolean
  verifiedStatus: string
  readTime: string
}

export function InstitutionalNews() {
  const [activeCategory, setActiveCategory] = useState<string>('todos')

  const ARTICLES: NewsArticle[] = [
    {
      id: 'comunicado-rede-nacional-2026',
      title: 'Acorda Portugal consolida cobertura cívica nos 18 distritos e regiões autónomas',
      summary:
        'A plataforma reforça os seus canais de informação descentralizada, garantindo que cidadãos de qualquer concelho ou freguesia possam reportar factos de interesse público e acompanhar alertas locais em tempo real.',
      category: 'oficial',
      categoryLabel: 'Comunicado Oficial',
      date: 'Novembro de 2026',
      source: 'Gabinete Editorial Acorda Portugal',
      isOfficial: true,
      verifiedStatus: 'Documento Oficial',
      readTime: '3 min de leitura',
    },
    {
      id: 'protocolo-fact-checking-civico',
      title: 'Mesa de Verificação Factual: o método de confirmação e combate à desinformação',
      summary:
        'Apresentação do protocolo de verificação em quatro etapas utilizado para validar denúncias, ocorrências municipais e alertas antes de serem promovidos no Radar Nacional.',
      category: 'verificacao',
      categoryLabel: 'Transparência & Verificação',
      date: 'Outubro de 2026',
      source: 'Mesa de Verificação Cívica',
      isOfficial: true,
      verifiedStatus: 'Metodologia Verificada',
      readTime: '4 min de leitura',
    },
    {
      id: 'radar-territorial-municipios',
      title: 'Monitorização Territorial: o estado dos serviços essenciais e acessibilidades no interior',
      summary:
        'Acompanhamento contínuo dos relatos cívicos relativos a transportes, cuidados de saúde de proximidade e segurança florestal nas zonas de menor densidade populacional.',
      category: 'territorio',
      categoryLabel: 'Cidadania & Território',
      date: 'Setembro de 2026',
      source: 'Rede de Correspondentes Cívicos',
      isOfficial: false,
      verifiedStatus: 'Factos Confirmados no Terreno',
      readTime: '5 min de leitura',
    },
    {
      id: 'preservacao-identidade-patrimonio',
      title: 'Literacia Cívica e Memória Nacional: a importância do conhecimento histórico na soberania',
      summary:
        'Como a preservação do património e o conhecimento profundo da nossa história, geografia e instituições fortalecem a capacidade crítica dos cidadãos perante os desafios contemporâneos.',
      category: 'patrimonio',
      categoryLabel: 'Cultura & Sociedade',
      date: 'Agosto de 2026',
      source: 'Secção Cultural Acorda Portugal',
      isOfficial: false,
      verifiedStatus: 'Artigo Editorial',
      readTime: '4 min de leitura',
    },
  ]

  const filtered =
    activeCategory === 'todos'
      ? ARTICLES
      : ARTICLES.filter((a) => a.category === activeCategory)

  return (
    <section id="noticias" className="relative w-full py-16 sm:py-24 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Secção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 mb-3">
              <Newspaper className="w-3.5 h-3.5" />
              <span>INFORMAÇÃO & FACTOS</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight">
              Atualidade & Acompanhamento Cívico
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl">
              Notícias verificadas, comunicados institucionais e relatórios territoriais documentados para esclarecimento público.
            </p>
          </div>

          <Link
            href="/comunidade"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Ver debates da Comunidade</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filtros por Categoria */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {[
            { id: 'todos', label: 'Todos os Canais' },
            { id: 'oficial', label: 'Comunicados Oficiais' },
            { id: 'verificacao', label: 'Transparência & Fact-Checking' },
            { id: 'territorio', label: 'Território & Municípios' },
            { id: 'patrimonio', label: 'Cultura & Sociedade' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow-md'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grelha de Artigos */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((article) => (
            <article
              key={article.id}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-6 sm:p-7 backdrop-blur-md hover:border-emerald-500/40 transition-all hover:bg-slate-900/80 hover:shadow-xl"
            >
              <div className="space-y-3.5">
                {/* Meta de Cabeçalho */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px] ${
                      article.isOfficial
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {article.categoryLabel}
                  </span>

                  <span className="text-slate-400 text-xs flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {article.date}
                  </span>
                </div>

                {/* Título do Artigo */}
                <h3 className="font-display text-lg sm:text-xl font-black text-white group-hover:text-emerald-300 transition-colors leading-snug">
                  {article.title}
                </h3>

                {/* Resumo */}
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {article.summary}
                </p>
              </div>

              {/* Rodapé do Cartão */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="truncate">{article.verifiedStatus}</span>
                </div>

                <span className="text-slate-400 font-medium shrink-0">
                  {article.source}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Rodapé de Informação */}
        <div className="mt-10 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs sm:text-sm text-slate-200">
              <strong className="text-white">Transparência Informativa:</strong> Todos os conteúdos publicados no Acorda Portugal seguem um rigoroso código deontológico e estão sujeitos a revisão cívica.
            </p>
          </div>
          <Link
            href="/termos"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 shrink-0"
          >
            Ler Princípios Editoriais
          </Link>
        </div>

      </div>
    </section>
  )
}
