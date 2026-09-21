'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Calendar,
  Trophy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Swords,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  Eye,
  Clock,
  Award,
  Flame,
  HelpCircle,
} from 'lucide-react'
import {
  subscribePublishedEvents,
  type OfficialEventConfig,
  getEventStatus,
  getEventStatusLabel,
  OFFICIAL_PORTO_LISBOA_ID,
  OFFICIAL_PORTUGAL_EM_JOGO_ID,
  OFFICIAL_EVENT_CONFIG_PORTO_LISBOA,
  OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
  type EventParticipant,
} from '@/lib/events-service'
import { useAuth } from '@/components/auth-provider'
import { cn } from '@/lib/utils'

interface AdminQuestionItem {
  id: string
  question: string
  category: string
  subCategory?: string
  difficulty: number
  difficultyLevel?: string
  options: string[]
  correctAnswer: number
  explanation: string
  points: number
  universe?: string
}

export function EventosView() {
  const { user } = useAuth()
  const [events, setEvents] = useState<OfficialEventConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEventId, setSelectedEventId] = useState<string>(OFFICIAL_PORTO_LISBOA_ID)

  // Subscrição em tempo real aos eventos publicados
  useEffect(() => {
    const unsubscribe = subscribePublishedEvents((list) => {
      if (list && list.length > 0) {
        setEvents(list)
      } else {
        // Fallback para as duas configurações oficiais caso Firestore ainda esteja em sincronização inicial
        setEvents([OFFICIAL_EVENT_CONFIG_PORTO_LISBOA, OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO])
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Estado das perguntas do evento Porto vs Lisboa
  const [questions, setQuestions] = useState<AdminQuestionItem[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [questionSearch, setQuestionSearch] = useState('')
  const [selectedUniverse, setSelectedUniverse] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  // Estado do ranking do evento selecionado
  const [ranking, setRanking] = useState<EventParticipant[]>([])
  const [rankingLoading, setRankingLoading] = useState(false)

  // Sincronização / Auto-seed
  const [seeding, setSeeding] = useState(false)
  const [seedMessage, setSeedMessage] = useState<string | null>(null)

  // Carregar perguntas quando o evento Porto vs Lisboa estiver selecionado
  useEffect(() => {
    if (selectedEventId !== OFFICIAL_PORTO_LISBOA_ID) return

    let isMounted = true
    const fetchQuestions = async () => {
      setQuestionsLoading(true)
      try {
        const res = await fetch(`/api/admin/events?type=questions&eventId=${OFFICIAL_PORTO_LISBOA_ID}`)
        if (res.ok && isMounted) {
          const data = await res.json()
          if (data && Array.isArray(data.questions)) {
            setQuestions(data.questions)
          }
        }
      } catch (err) {
        console.warn('[Admin Eventos] Erro ao carregar pool de perguntas:', err)
      } finally {
        if (isMounted) setQuestionsLoading(false)
      }
    }

    void fetchQuestions()
    return () => {
      isMounted = false
    }
  }, [selectedEventId])

  // Carregar ranking do evento selecionado
  useEffect(() => {
    let isMounted = true
    const fetchRanking = async () => {
      setRankingLoading(true)
      try {
        const res = await fetch(`/api/admin/events?type=ranking&eventId=${selectedEventId}`)
        if (res.ok && isMounted) {
          const data = await res.json()
          if (data && Array.isArray(data.ranking)) {
            setRanking(data.ranking)
          }
        }
      } catch (err) {
        console.warn('[Admin Eventos] Erro ao carregar ranking:', err)
      } finally {
        if (isMounted) setRankingLoading(false)
      }
    }

    void fetchRanking()
    return () => {
      isMounted = false
    }
  }, [selectedEventId])

  // Forçar auto-seed no Firestore
  const handleAutoSeed = async () => {
    setSeeding(true)
    setSeedMessage(null)
    try {
      const idToken = await user?.getIdToken()
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          action: 'autoSeed',
          eventId: selectedEventId,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSeedMessage(`Configuração de ${selectedEventId} sincronizada com sucesso no Firestore!`)
      } else {
        setSeedMessage(data.error || 'Erro ao sincronizar evento.')
      }
    } catch (err: any) {
      setSeedMessage(err?.message || 'Erro de comunicação ao servidor.')
    } finally {
      setSeeding(false)
    }
  }

  // Filtragem de perguntas
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Filtro de pesquisa
      if (questionSearch.trim()) {
        const term = questionSearch.toLowerCase()
        const matchesPrompt = q.question.toLowerCase().includes(term)
        const matchesExplanation = q.explanation?.toLowerCase().includes(term)
        const matchesOptions = q.options.some((opt) => opt.toLowerCase().includes(term))
        if (!matchesPrompt && !matchesExplanation && !matchesOptions) return false
      }

      // Filtro de universo
      if (selectedUniverse !== 'all') {
        const cat = (q.category || '').toLowerCase()
        const sub = (q.subCategory || '').toLowerCase()
        if (selectedUniverse === 'porto' && !(cat === 'porto' || sub === 'porto')) return false
        if (selectedUniverse === 'lisboa' && !(cat === 'lisboa' || sub === 'lisboa')) return false
        if (selectedUniverse === 'fc-porto' && !(cat === 'fc-porto' || sub === 'fc-porto')) return false
        if (selectedUniverse === 'sl-benfica' && !(cat === 'sl-benfica' || sub === 'sl-benfica')) return false
        if (selectedUniverse === 'crossover' && !(cat === 'crossover' || sub === 'crossover')) return false
      }

      // Filtro de dificuldade
      if (selectedDifficulty !== 'all') {
        const diffNum = Number(selectedDifficulty)
        if (q.difficulty !== diffNum) return false
      }

      return true
    })
  }, [questions, questionSearch, selectedUniverse, selectedDifficulty])

  const selectedEvent = useMemo(() => {
    return (
      events.find((e) => e.id === selectedEventId) ||
      (selectedEventId === OFFICIAL_PORTO_LISBOA_ID
        ? OFFICIAL_EVENT_CONFIG_PORTO_LISBOA
        : OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO)
    )
  }, [events, selectedEventId])

  const status = getEventStatus(selectedEvent)
  const statusLabel = getEventStatusLabel(status)

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. BARRA DE CABEÇALHO DO ADMIN DOS EVENTOS                */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div>
          <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <span>Gestão de Eventos Oficiais &amp; Competições</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configuração autoritativa, estado das competições, perguntas de elite e classificação em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleAutoSeed}
            disabled={seeding}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 text-cyan-400', seeding && 'animate-spin')} />
            <span>{seeding ? 'A Sincronizar...' : 'Sincronizar Firestore'}</span>
          </button>

          <Link
            href={selectedEventId === OFFICIAL_PORTO_LISBOA_ID ? '/eventos?event=porto-lisboa' : '/eventos?event=portugal-em-jogo'}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <span>Ver Página Pública</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {seedMessage && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-200 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{seedMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SELETOR DE EVENTO PRINCIPAL                            */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Porto vs Lisboa */}
        <button
          type="button"
          onClick={() => setSelectedEventId(OFFICIAL_PORTO_LISBOA_ID)}
          className={cn(
            'p-5 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden shadow-xl',
            selectedEventId === OFFICIAL_PORTO_LISBOA_ID
              ? 'border-amber-400/80 bg-gradient-to-br from-[#071330] via-[#050b1d] to-[#200713] shadow-[0_0_30px_rgba(59,130,246,0.3)]'
              : 'border-white/10 bg-slate-900/60 hover:bg-slate-900/90'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-300">
              <Swords className="h-3 w-3 text-amber-400" />
              Flagship Special Event
            </span>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Ativo
            </span>
          </div>

          <h4 className="font-display font-black text-xl text-white tracking-tight">
            PORTO ⚔️ LISBOA — O Grande Duelo
          </h4>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2">
            Confronto exclusivo de conhecimento entre as duas cidades e os dois clubes (FC Porto e SL Benfica).
          </p>

          <div className="mt-3 flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>80 Perguntas Elite</span>
            <span>•</span>
            <span>15.000 Acordas</span>
            <span>•</span>
            <span>10 Jogos/Dia</span>
          </div>
        </button>

        {/* Card Portugal em Jogo */}
        <button
          type="button"
          onClick={() => setSelectedEventId(OFFICIAL_PORTUGAL_EM_JOGO_ID)}
          className={cn(
            'p-5 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden shadow-xl',
            selectedEventId === OFFICIAL_PORTUGAL_EM_JOGO_ID
              ? 'border-amber-400/80 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-amber-950/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
              : 'border-white/10 bg-slate-900/60 hover:bg-slate-900/90'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-300">
              <Trophy className="h-3 w-3 text-amber-400" />
              Competição Nacional
            </span>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Ativo
            </span>
          </div>

          <h4 className="font-display font-black text-xl text-white tracking-tight">
            PORTUGAL EM JOGO
          </h4>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2">
            Primeiro Desafio Nacional aberto a todas as partidas regulares de quiz geral.
          </p>

          <div className="mt-3 flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>Todas as Categorias</span>
            <span>•</span>
            <span>10.000 Acordas</span>
            <span>•</span>
            <span>10 Jogos/Dia</span>
          </div>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. DETALHES DO EVENTO SELECIONADO                         */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h4 className="font-display text-lg font-black uppercase text-white">
              {selectedEvent.title}
            </h4>
            <p className="text-xs text-amber-300 font-medium">{selectedEvent.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-800 border border-white/10 px-3 py-1 text-xs font-mono font-bold text-slate-300">
              ID: {selectedEvent.id}
            </span>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-black uppercase text-emerald-300">
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Grelha de Métricas de Configuração */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-slate-950/60 border border-white/10 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Data de Início</span>
            <p className="font-mono text-xs font-bold text-white truncate">{selectedEvent.startDate}</p>
          </div>
          <div className="rounded-2xl bg-slate-950/60 border border-white/10 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Data de Término</span>
            <p className="font-mono text-xs font-bold text-white truncate">{selectedEvent.endDate}</p>
          </div>
          <div className="rounded-2xl bg-slate-950/60 border border-white/10 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Limite Diário</span>
            <p className="font-mono text-xs font-bold text-amber-400">{selectedEvent.rules?.maxDailyMatches || 10} partidas / dia</p>
          </div>
          <div className="rounded-2xl bg-slate-950/60 border border-white/10 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recompensa 1.º Lugar</span>
            <p className="font-mono text-xs font-bold text-emerald-400">
              {selectedEvent.rewards?.firstPlace?.coins?.toLocaleString('pt-PT') || '15.000'} Acordas
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. EXPLORADOR DE PERGUNTAS DO EVENTO PORTO VS LISBOA      */}
        {/* ========================================================= */}
        {selectedEventId === OFFICIAL_PORTO_LISBOA_ID && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="font-display text-sm font-black uppercase text-white flex items-center gap-2">
                  <Swords className="h-4 w-4 text-amber-400" />
                  <span>Pool de Perguntas de Elite ({filteredQuestions.length} de {questions.length})</span>
                </h5>
                <p className="text-[11px] text-slate-400">
                  Todas as perguntas pertencem estritamente aos 4 universos e aos níveis Difícil, Muito Difícil e Expert.
                </p>
              </div>

              {/* Contadores dos 4 Universos */}
              <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Porto: 16
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Lisboa: 16
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-blue-700/20 text-blue-200 border border-blue-700/30">
                  FCP: 16
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-red-700/20 text-red-200 border border-red-700/30">
                  SLB: 16
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/30">
                  Duelo: 16
                </span>
              </div>
            </div>

            {/* Controlos de Filtro e Pesquisa */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Pesquisa */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por texto, resposta, explicação..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Filtro Universo */}
              <select
                value={selectedUniverse}
                onChange={(e) => setSelectedUniverse(e.target.value)}
                className="rounded-xl bg-slate-950/80 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">Todos os Universos</option>
                <option value="porto">🔵 Cidade do Porto</option>
                <option value="lisboa">🔴 Cidade de Lisboa</option>
                <option value="fc-porto">🔵⚪ FC Porto</option>
                <option value="sl-benfica">🔴⚪ SL Benfica</option>
                <option value="crossover">⚔️ Confrontos Diretos</option>
              </select>

              {/* Filtro Dificuldade */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="rounded-xl bg-slate-950/80 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">Todas as Dificuldades</option>
                <option value="3">Dificuldade 3 — HARD (1.0x)</option>
                <option value="4">Dificuldade 4 — VERY HARD (1.25x)</option>
                <option value="5">Dificuldade 5 — EXPERT (1.5x)</option>
              </select>
            </div>

            {/* Lista de Perguntas */}
            {questionsLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <div className="h-6 w-6 mx-auto rounded-full border-2 border-amber-400 border-t-transparent animate-spin mb-2" />
                A carregar perguntas do evento...
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-white/10 rounded-2xl">
                Nenhuma pergunta encontrada com os filtros selecionados.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredQuestions.map((q, idx) => {
                  const diffColor =
                    q.difficulty === 5
                      ? 'border-purple-500/50 text-purple-300 bg-purple-950/40'
                      : q.difficulty === 4
                      ? 'border-rose-500/50 text-rose-300 bg-rose-950/40'
                      : 'border-amber-500/50 text-amber-300 bg-amber-950/40'

                  const diffLabel =
                    q.difficulty === 5 ? 'EXPERT (1.5x)' : q.difficulty === 4 ? 'MUITO DIFÍCIL (1.25x)' : 'DIFÍCIL (1.0x)'

                  return (
                    <div
                      key={q.id || idx}
                      className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 space-y-2.5 hover:border-white/15 transition"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-500">#{idx + 1}</span>
                          <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-white/10">
                            {q.id}
                          </span>
                          <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
                            {q.category}
                          </span>
                        </div>

                        <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase border', diffColor)}>
                          {diffLabel}
                        </span>
                      </div>

                      {/* Pergunta */}
                      <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                        {q.question}
                      </p>

                      {/* Opções */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = optIdx === q.correctAnswer
                          return (
                            <div
                              key={optIdx}
                              className={cn(
                                'px-3 py-1.5 rounded-xl text-xs flex items-center gap-2',
                                isCorrect
                                  ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-bold'
                                  : 'bg-slate-900/60 border border-white/5 text-slate-300'
                              )}
                            >
                              <span className="font-mono font-bold text-[10px] text-slate-400">
                                {['A', 'B', 'C', 'D'][optIdx]}:
                              </span>
                              <span className="truncate">{opt}</span>
                              {isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 ml-auto" />}
                            </div>
                          )
                        })}
                      </div>

                      {/* Explicação */}
                      {q.explanation && (
                        <p className="text-[11px] text-slate-400 italic pt-1 border-t border-white/5">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. PARTICIPANTES REAIS & CLASSIFICAÇÃO ATUAL              */}
        {/* ========================================================= */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h5 className="font-display text-sm font-black uppercase text-white flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>Participantes Reais ({ranking.length})</span>
            </h5>
            <span className="text-[11px] text-slate-400">
              Sincronizado diretamente do Firestore
            </span>
          </div>

          {rankingLoading ? (
            <div className="py-6 text-center text-xs text-slate-400">
              A carregar ranking...
            </div>
          ) : ranking.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-white/10 rounded-2xl">
              Nenhum participante pontuou neste evento ainda.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {ranking.map((p, i) => (
                <div
                  key={p.userId || i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 text-center font-bold text-amber-400 font-mono">
                      #{p.pos || i + 1}
                    </span>
                    <span className="font-bold text-white truncate">
                      {p.displayName || 'Jogador'}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      ({p.district || 'Portugal'})
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-right shrink-0 font-mono text-[11px]">
                    <span className="text-slate-400">
                      {p.totalMatches || p.countedMatches || 0} jogos
                    </span>
                    <span className="font-bold text-amber-400">
                      {(p.eventPoints || p.points || 0).toLocaleString('pt-PT')} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventosView
