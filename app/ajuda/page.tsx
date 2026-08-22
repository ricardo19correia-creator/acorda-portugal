'use client'

import React, { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  X,
  HelpCircle,
  Sparkles,
  Gamepad2,
  Trophy,
  Coins,
  User,
  ShoppingBag,
  Wrench,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  Mail,
} from 'lucide-react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackgroundFx } from '@/components/background-fx'
import { cn } from '@/lib/utils'

export type HelpCategoryKey =
  | 'todos'
  | 'jogar'
  | 'rankings'
  | 'moedas'
  | 'conta'
  | 'loja'
  | 'suporte'

interface HelpCategory {
  key: HelpCategoryKey
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  tone: string
}

const HELP_CATEGORIES: HelpCategory[] = [
  {
    key: 'jogar',
    name: 'Jogar',
    description: 'Modos de jogo e partidas',
    icon: Gamepad2,
    tone: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/60',
  },
  {
    key: 'rankings',
    name: 'Rankings & Competição',
    description: 'XP, rankings e distritos',
    icon: Trophy,
    tone: 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:border-amber-500/60',
  },
  {
    key: 'moedas',
    name: 'Moedas & Recompensas',
    description: '€ Acorda, conquistas e prémios',
    icon: Coins,
    tone: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10 hover:border-yellow-500/60',
  },
  {
    key: 'conta',
    name: 'Conta & Perfil',
    description: 'Conta, acesso e personalização',
    icon: User,
    tone: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:border-cyan-500/60',
  },
  {
    key: 'loja',
    name: 'Loja & Cosméticos',
    description: 'Itens, títulos e personalização',
    icon: ShoppingBag,
    tone: 'text-purple-400 border-purple-500/30 bg-purple-500/10 hover:border-purple-500/60',
  },
  {
    key: 'suporte',
    name: 'Problemas & Suporte',
    description: 'Erros, ligação e assistência',
    icon: Wrench,
    tone: 'text-rose-400 border-rose-500/30 bg-rose-500/10 hover:border-rose-500/60',
  },
]

interface FAQQuestion {
  id: string
  category: HelpCategoryKey
  categoryLabel: string
  question: string
  answer: string
  isPopular?: boolean
}

const FAQ_DATABASE: FAQQuestion[] = [
  // 1. JOGAR
  {
    id: 'faq-conceito',
    category: 'jogar',
    categoryLabel: 'Jogar',
    isPopular: true,
    question: 'O que é o Acorda Portugal?',
    answer:
      'O Acorda Portugal é o maior videojogo de trivia nacional em tempo real. Podes testar os teus conhecimentos sobre cultura geral, história, geografia, desporto, gastronomia e tradições de Portugal, representando o teu distrito natal ou de residência para levar a tua região ao topo do mapa nacional.',
  },
  {
    id: 'faq-ajudas',
    category: 'jogar',
    categoryLabel: 'Jogar',
    question: 'Como funcionam as Ajudas (50/50 e Congelar Tempo)?',
    answer:
      'Durante as partidas do quiz podes utilizar ajudas consumíveis em tempo real: o "50/50" elimina de imediato duas opções incorretas, facilitando a escolha; o "Congelar Tempo" acrescenta +15 segundos adicionais ao cronómetro da pergunta para pensares com calma. Podes adquirir mais ajudas na Loja com o teu saldo € Acorda.',
  },
  {
    id: 'faq-modo-maluco',
    category: 'jogar',
    categoryLabel: 'Jogar',
    question: 'O que é o "Modo Maluco"?',
    answer:
      'É o nosso modo especial focado no humor, trocadilhos e rasteiras tipicamente portuguesas: raciocínio absurdo, piadas da cultura popular e perguntas sem filtros para testar a tua rapidez mental fora da caixa.',
  },
  {
    id: 'faq-desafio-diario',
    category: 'jogar',
    categoryLabel: 'Jogar',
    question: 'Como funciona o Desafio do Dia / Diário?',
    answer:
      'Todos os dias é gerado um conjunto de perguntas temáticas especiais disponível para todos os jogadores do país. Completar o Desafio Diário garante bónus de experiência (XP), moedas € Acorda e mantém a tua sequência diária (streak) ativa.',
  },

  // 2. RANKINGS & COMPETIÇÃO
  {
    id: 'faq-duelos-1v1',
    category: 'rankings',
    categoryLabel: 'Rankings & Competição',
    isPopular: true,
    question: 'Como funcionam os Duelos 1v1 em Direto?',
    answer:
      'No modo 1v1 enfrentas outro jogador real em simultâneo através de 10 perguntas com tempo limite de 60 segundos por questão. Quem acertar mais respostas no menor tempo acumulado vence a partida e conquista o prémio de XP e moedas € Acorda.',
  },
  {
    id: 'faq-pontuacao-distritos',
    category: 'rankings',
    categoryLabel: 'Rankings & Competição',
    isPopular: true,
    question: 'Como funciona a pontuação distrital e o Ranking?',
    answer:
      'Cada pergunta acertada nos modos a solo ou em duelos concede pontos de experiência (XP). Os pontos de todos os jogadores associados a um mesmo distrito somam para a classificação territorial, determinando o ranking em tempo real dos 18 distritos e das 2 regiões autónomas (Açores e Madeira).',
  },
  {
    id: 'faq-desempate',
    category: 'rankings',
    categoryLabel: 'Rankings & Competição',
    question: 'Como são desempatados os Duelos e os Rankings?',
    answer:
      'Em caso de igualdade no número de respostas certas, o desempate é feito com base no tempo de resposta acumulado em milissegundos. Quem respondeu com maior rapidez e precisão fica em posição superior.',
  },

  // 3. MOEDAS & RECOMPENSAS
  {
    id: 'faq-moedas-acorda',
    category: 'moedas',
    categoryLabel: 'Moedas & Recompensas',
    isPopular: true,
    question: 'O que são e para que servem as moedas "€ Acorda"?',
    answer:
      'O saldo "€ Acorda" é a moeda virtual oficial ganha através de vitórias em Duelos 1v1, desafios diários, subida de nível e conquistas. Pode ser usada na Loja para adquirir packs de ajudas, avatares épicos, molduras de perfil, títulos honoríficos e arenas visuais personalizadas.',
  },
  {
    id: 'faq-ganhar-xp',
    category: 'moedas',
    categoryLabel: 'Moedas & Recompensas',
    question: 'Como ganho pontos de experiência (XP) e subo de nível?',
    answer:
      'Ganhas XP ao responder corretamente às perguntas do quiz. Respostas rápidas garantem bónus de tempo adicionais, e manter uma sequência de acertos consecutivos (streak) ativa multiplicadores de pontuação. O XP acumulado faz-te progredir nos 21 níveis de prestígio.',
  },
  {
    id: 'faq-conquistas',
    category: 'moedas',
    categoryLabel: 'Moedas & Recompensas',
    question: 'O que são as Conquistas e como as desbloqueio?',
    answer:
      'As Conquistas são marcos de desempenho (ex.: vencer o primeiro duelo, atingir uma sequência de 10 acertos, dominar uma categoria específica). Ao completá-las, recebes distintivos exclusivos no teu perfil e recompensas em moedas € Acorda.',
  },

  // 4. CONTA & PERFIL
  {
    id: 'faq-gratuito',
    category: 'conta',
    categoryLabel: 'Conta & Perfil',
    question: 'Preciso de pagar para jogar?',
    answer:
      'Não. O Acorda Portugal é 100% gratuito. Podes criar a tua conta de jogador diretamente ou autenticar-te com a tua conta Google para jogar no navegador (PC ou telemóvel) sem custos.',
  },
  {
    id: 'faq-mudar-distrito',
    category: 'conta',
    categoryLabel: 'Conta & Perfil',
    question: 'Como posso mudar o meu distrito ou nome de jogador?',
    answer:
      'Podes personalizar o teu nome de jogador e o distrito que representas acedendo à tua página de Perfil. Todas as pontuações e estatísticas futuras passarão a contar para a nova região selecionada.',
  },
  {
    id: 'faq-guardar-progresso',
    category: 'conta',
    categoryLabel: 'Conta & Perfil',
    question: 'O meu progresso e compras ficam gravados na nuvem?',
    answer:
      'Sim. Quando jogas com sessão iniciada, todos os teus níveis, XP, vitórias, itens equipados e saldo € Acorda são sincronizados em tempo real na base de dados segura do Firestore.',
  },

  // 5. LOJA & COSMÉTICOS
  {
    id: 'faq-equipar-itens',
    category: 'loja',
    categoryLabel: 'Loja & Cosméticos',
    question: 'Como posso equipar molduras, títulos e cenários de arena?',
    answer:
      'Na página da Loja ou no teu Perfil (separador "O Meu Inventário"), basta clicares no item desbloqueado e selecionar "Equipar". O item fica imediatamente ativo em todos os teus jogos, rankings e cartão de jogador.',
  },
  {
    id: 'faq-passe-fundador',
    category: 'loja',
    categoryLabel: 'Loja & Cosméticos',
    question: 'O que é o Passe Fundador da Nação?',
    answer:
      'O Passe Fundador é uma vantagem VIP exclusiva para os primeiros apoiantes da plataforma. Inclui o selo de Membro Fundador no perfil, bónus vitalício de +25% XP em todas as partidas e a Moldura Real 3D.',
  },

  // 6. PROBLEMAS & SUPORTE
  {
    id: 'faq-falha-ligacao',
    category: 'suporte',
    categoryLabel: 'Problemas & Suporte',
    question: 'O que acontece se a minha ligação à internet cair durante uma partida?',
    answer:
      'Nos modos a solo, o sistema guarda o teu progresso na nuvem até à pergunta atual. Em Duelos 1v1, caso percas a ligação temporariamente, podes regressar à partida se esta ainda estiver dentro do tempo limite de resposta.',
  },
  {
    id: 'faq-audio-som',
    category: 'suporte',
    categoryLabel: 'Problemas & Suporte',
    question: 'O áudio ou os efeitos sonoros não estão a tocar no meu navegador?',
    answer:
      'Verifica se o botão de áudio na barra de navegação superior não está no modo "Mudo". Além disso, alguns navegadores bloqueiam som automático até que o utilizador interaja pela primeira vez com a página (clicando num botão).',
  },
]

export default function AjudaPage() {
  const { user, profile } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<HelpCategoryKey>('todos')
  const [openQuestionIds, setOpenQuestionIds] = useState<Record<string, boolean>>({})

  // Report Problem Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportType, setReportType] = useState('Erro técnico')
  const [reportDescription, setReportDescription] = useState('')
  const [reportLocation, setReportLocation] = useState('')
  const [reportEmail, setReportEmail] = useState(user?.email || '')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportStatus, setReportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [reportErrorMsg, setReportErrorMsg] = useState('')

  const faqListRef = useRef<HTMLDivElement | null>(null)

  // Filter FAQ questions based on search query and active category
  const filteredQuestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return FAQ_DATABASE.filter((item) => {
      // Category match
      const matchCategory =
        selectedCategory === 'todos' || item.category === selectedCategory

      if (!matchCategory) return false

      // Search match
      if (!query) return true

      const inQuestion = item.question.toLowerCase().includes(query)
      const inAnswer = item.answer.toLowerCase().includes(query)
      const inCategory = item.categoryLabel.toLowerCase().includes(query)

      return inQuestion || inAnswer || inCategory
    })
  }, [searchQuery, selectedCategory])

  // Popular questions for quick jump
  const popularQuestions = useMemo(() => {
    return FAQ_DATABASE.filter((item) => item.isPopular)
  }, [])

  // Toggle single question in accordion
  const toggleQuestion = (id: string) => {
    setOpenQuestionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Handle clicking a popular question pill
  const handleSelectPopular = (id: string) => {
    setSelectedCategory('todos')
    setSearchQuery('')
    setOpenQuestionIds({ [id]: true })

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const element = document.getElementById(`faq-item-${id}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }

  // Handle category card click
  const handleSelectCategory = (categoryKey: HelpCategoryKey) => {
    if (selectedCategory === categoryKey) {
      setSelectedCategory('todos')
    } else {
      setSelectedCategory(categoryKey)
    }

    if (faqListRef.current) {
      faqListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Handle Contact Support Action
  const handleContactSupport = () => {
    if (typeof window !== 'undefined') {
      const tawkAPI = (window as any).Tawk_API
      if (tawkAPI && typeof tawkAPI.maximize === 'function') {
        tawkAPI.maximize()
        return
      }
      // Fallback to direct mailto
      window.location.href =
        'mailto:suporte@acordaportugal.pt?subject=Pedido%20de%20Suporte%20—%20Acorda%20Portugal'
    }
  }

  // Handle Submit Problem Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reportDescription.trim()) {
      setReportErrorMsg('Por favor, descreve o problema antes de enviar.')
      setReportStatus('error')
      return
    }

    setReportSubmitting(true)
    setReportStatus('idle')
    setReportErrorMsg('')

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reportType || 'Erro técnico',
          description: reportDescription.trim(),
          page: reportLocation.trim() || 'N/A',
          userEmail: reportEmail.trim() || user?.email || 'anónimo',
        }),
      })

      if (res.ok) {
        setReportStatus('success')
        setReportDescription('')
        setReportLocation('')

        // Limpar formulário após 2 segundos e fechar modal
        setTimeout(() => {
          setReportStatus('idle')
          setReportModalOpen(false)
        }, 2000)
      } else {
        setReportErrorMsg('Ocorreu um erro ao enviar. Tenta novamente.')
        setReportStatus('error')
      }
    } catch (err: any) {
      console.error('Erro ao submeter relatório:', err)
      setReportErrorMsg('Erro de ligação. Tenta novamente.')
      setReportStatus('error')
    } finally {
      setReportSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-foreground flex flex-col justify-between overflow-x-hidden">
      <BackgroundFx variant="default" />

      <div className="relative z-10 flex-1 flex flex-col justify-between">
        <SiteHeader />

        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* ========================================================= */}
          {/* 1. TOP NAVIGATION / VOLTAR AO INÍCIO */}
          {/* ========================================================= */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-muted-foreground transition hover:bg-white/10 hover:text-white backdrop-blur-md cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao Início</span>
            </Link>
          </div>

          {/* ========================================================= */}
          {/* 1.1 HERO — CENTRAL DE AJUDA */}
          {/* ========================================================= */}
          <header className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-400 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <HelpCircle className="h-4 w-4" />
              <span>Suporte Oficial</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-foreground">
              Central de Ajuda
            </h1>
            <p className="mt-3 text-sm sm:text-base md:text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Encontra rapidamente respostas e ajuda para tudo o que precisas no Acorda Portugal.
            </p>
          </header>

          {/* ========================================================= */}
          {/* 2. BARRA DE PESQUISA EM TEMPO REAL */}
          {/* ========================================================= */}
          <section aria-label="Pesquisa na Central de Ajuda" className="max-w-3xl mx-auto mb-10">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-4 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar na Central de Ajuda..."
                className="w-full rounded-2xl border border-white/15 bg-slate-900/80 py-4 pl-12 pr-12 text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground backdrop-blur-xl shadow-xl transition-all focus:border-emerald-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpar pesquisa"
                  className="absolute right-4 grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-muted-foreground transition hover:bg-white/20 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Contador de resultados ou aviso ativo de filtro */}
            {(searchQuery || selectedCategory !== 'todos') && (
              <div className="mt-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
                <span>
                  A mostrar <strong>{filteredQuestions.length}</strong>{' '}
                  {filteredQuestions.length === 1 ? 'resultado' : 'resultados'}
                  {selectedCategory !== 'todos' && (
                    <>
                      {' '}
                      na categoria <strong>{HELP_CATEGORIES.find((c) => c.key === selectedCategory)?.name}</strong>
                    </>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('todos')
                  }}
                  className="font-bold text-emerald-400 hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </section>

          {/* ========================================================= */}
          {/* 3. CATEGORIAS DE AJUDA (6 CARDS) */}
          {/* ========================================================= */}
          <section aria-label="Categorias de Ajuda" className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Explorar por Categoria
              </h2>
              {selectedCategory !== 'todos' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('todos')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                >
                  Ver Todas as Categorias ➔
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {HELP_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isActive = selectedCategory === cat.key

                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => handleSelectCategory(cat.key)}
                    className={cn(
                      'group flex items-start gap-4 rounded-2xl border p-4 sm:p-5 text-left backdrop-blur-xl transition-all duration-200 cursor-pointer shadow-lg outline-none',
                      isActive
                        ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'border-white/10 bg-slate-900/60 hover:bg-slate-900 hover:border-white/20 hover:-translate-y-0.5',
                    )}
                  >
                    <div
                      className={cn(
                        'grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-transform duration-200 group-hover:scale-105',
                        cat.tone,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-sm sm:text-base font-bold text-foreground group-hover:text-white transition">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* ========================================================= */}
          {/* 4. PERGUNTAS POPULARES */}
          {/* ========================================================= */}
          <section aria-label="Perguntas Populares" className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Perguntas Populares
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularQuestions.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleSelectPopular(q.id)}
                  className="rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300 cursor-pointer shadow-sm"
                >
                  ❓ {q.question}
                </button>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* 5. FAQ EM ACORDEÃO */}
          {/* ========================================================= */}
          <section ref={faqListRef} aria-label="Perguntas Frequentes" className="mb-14 scroll-mt-24">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h2 className="font-display text-lg sm:text-xl font-black uppercase tracking-wide text-foreground flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-emerald-400" />
                <span>Dúvidas Frequentes</span>
              </h2>
              <span className="text-xs font-bold text-muted-foreground">
                {filteredQuestions.length} {filteredQuestions.length === 1 ? 'pergunta' : 'perguntas'}
              </span>
            </div>

            {/* Empty State */}
            {filteredQuestions.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 sm:p-12 text-center backdrop-blur-xl">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-muted-foreground mb-3">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Não encontrámos resultados para a tua pesquisa.
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  Tenta pesquisar por outras palavras-chave ou clica no botão abaixo para ver todas as perguntas.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('todos')
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    Ver Todas as Perguntas
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-foreground hover:bg-white/10 transition cursor-pointer"
                  >
                    Fazer Pergunta ao Suporte
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((item) => {
                  const isOpen = Boolean(openQuestionIds[item.id])

                  return (
                    <div
                      key={item.id}
                      id={`faq-item-${item.id}`}
                      className={cn(
                        'overflow-hidden rounded-2xl border transition-all duration-200 backdrop-blur-xl',
                        isOpen
                          ? 'border-emerald-500/40 bg-slate-900/90 shadow-xl shadow-emerald-950/20'
                          : 'border-white/10 bg-slate-900/50 hover:border-white/20 hover:bg-slate-900/70',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleQuestion(item.id)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left cursor-pointer outline-none select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={cn(
                              'shrink-0 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border',
                              item.category === 'jogar' && 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
                              item.category === 'rankings' && 'text-amber-400 border-amber-500/30 bg-amber-500/10',
                              item.category === 'moedas' && 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
                              item.category === 'conta' && 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
                              item.category === 'loja' && 'text-purple-400 border-purple-500/30 bg-purple-500/10',
                              item.category === 'suporte' && 'text-rose-400 border-rose-500/30 bg-rose-500/10',
                            )}
                          >
                            {item.categoryLabel}
                          </span>
                          <span className="font-display text-sm sm:text-base font-bold text-foreground leading-snug">
                            {item.question}
                          </span>
                        </div>

                        <span
                          className={cn(
                            'grid h-8 w-8 shrink-0 place-items-center rounded-xl border transition-all',
                            isOpen
                              ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
                              : 'border-white/10 bg-white/5 text-muted-foreground',
                          )}
                        >
                          {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="border-t border-white/10 px-4 py-4 sm:px-5 sm:py-5 text-xs sm:text-sm text-slate-300 leading-relaxed bg-black/20 animate-fade-in">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* ========================================================= */}
          {/* 6. BLOCO "PROBLEMAS & SUPORTE" */}
          {/* ========================================================= */}
          <section
            aria-label="Problemas e Suporte Direto"
            className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-emerald-950/40 p-6 sm:p-10 text-center backdrop-blur-2xl shadow-2xl mb-6"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative z-10 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-rose-300 mb-3">
                <Wrench className="h-3.5 w-3.5" />
                <span>Problemas &amp; Assistência</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-foreground">
                Não encontraste a resposta?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                A nossa equipa está aqui para ajudar. Entra em contacto direto connosco ou reporta qualquer anomalia técnica.
              </p>

              {/* Action Buttons: Stack on mobile, inline on tablet/desktop */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleContactSupport}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 px-6 py-3.5 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 hover:scale-102 hover:brightness-110 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Contactar Suporte</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-6 py-3.5 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-foreground hover:bg-white/20 transition cursor-pointer"
                >
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                  <span>Reportar um Problema</span>
                </button>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>

      {/* ========================================================= */}
      {/* 7. MODAL: REPORTAR UM PROBLEMA */}
      {/* ========================================================= */}
      {reportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900 p-6 sm:p-8 shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                setReportModalOpen(false)
                setReportStatus('idle')
              }}
              aria-label="Fechar modal"
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-xl bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 id="report-modal-title" className="font-display text-lg font-black uppercase text-foreground">
                  Reportar um Problema
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ajuda-nos a melhorar o Acorda Portugal enviando detalhes do erro.
                </p>
              </div>
            </div>

            {reportStatus === 'success' ? (
              <div className="py-6 text-center space-y-3">
                <div className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-bounce">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h4 className="font-display text-base font-bold text-emerald-400">
                  ✅ Relatório enviado com sucesso! Obrigado pelo feedback.
                </h4>
                <p className="text-xs text-muted-foreground">
                  A janela fechará automaticamente dentro de instantes...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                {/* Tipo de problema */}
                <div>
                  <label htmlFor="report-type" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tipo de problema *
                  </label>
                  <select
                    id="report-type"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-foreground transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Erro técnico">Erro técnico</option>
                    <option value="Problema de ligação">Problema de ligação</option>
                    <option value="Problema no jogo / pergunta">Problema no jogo / pergunta</option>
                    <option value="Problema com conta">Problema com conta</option>
                    <option value="Problema com recompensa / moedas">Problema com recompensa / moedas</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                {/* Descrição */}
                <div>
                  <label htmlFor="report-description" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Descrição do problema *
                  </label>
                  <textarea
                    id="report-description"
                    rows={4}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Descreve o problema com o máximo detalhe possível..."
                    className="w-full rounded-xl border border-white/15 bg-slate-950 p-3 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    required
                  />
                </div>

                {/* Página / modo onde aconteceu */}
                <div>
                  <label htmlFor="report-location" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Página ou modo onde aconteceu (opcional)
                  </label>
                  <input
                    id="report-location"
                    type="text"
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    placeholder="Ex.: Quiz Solo, Duelo 1v1, Loja, Perfil..."
                    className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Email de contacto */}
                <div>
                  <label htmlFor="report-email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    O teu email (para feedback)
                  </label>
                  <input
                    id="report-email"
                    type="email"
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    placeholder="email@exemplo.pt"
                    className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Mensagem de Erro */}
                {reportStatus === 'error' && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{reportErrorMsg || 'Não foi possível enviar o relatório. Tenta novamente.'}</span>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-white/10 hover:text-white transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting || !reportDescription.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-display text-xs font-black uppercase tracking-wider text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/25 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reportSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>A enviar...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>ENVIAR RELATÓRIO</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
