'use client'

import React, { useState, useEffect } from 'react'
import {
  HelpCircle,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react'
import { MAIN_CATEGORIES } from '@/lib/categories-data'

interface PerguntasViewProps {
  getIdToken: () => Promise<string | null>
}

export function PerguntasView({ getIdToken }: PerguntasViewProps) {
  const [activeTab, setActiveTab] = useState<'browser' | 'duplicates' | 'stats'>('browser')
  const [questions, setQuestions] = useState<any[]>([])
  const [statsData, setStatsData] = useState<any>(null)
  const [duplicatesReport, setDuplicatesReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Filtros
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(20050)

  // Modal de Edição
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null)
  const [editPrompt, setEditPrompt] = useState('')
  const [editOptions, setEditOptions] = useState<string[]>(['', '', '', ''])
  const [editCorrect, setEditCorrect] = useState<number>(0)
  const [editExplanation, setEditExplanation] = useState('')
  const [editDifficulty, setEditDifficulty] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const params = new URLSearchParams()
      params.set('mode', 'list')
      params.set('page', String(currentPage))
      params.set('limit', '20')
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      if (difficultyFilter !== 'all') params.set('difficulty', difficultyFilter)
      if (searchQuery) params.set('q', searchQuery)

      const res = await fetch(`/api/admin/questions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        setQuestions(json.questions || [])
        setTotalPages(json.pagination?.totalPages || 1)
        setTotalCount(json.pagination?.totalCount || 0)
      }
    } catch (e) {
      console.error('Erro ao carregar perguntas:', e)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    setLoading(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/questions?mode=stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        setStatsData(json.stats)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const scanDuplicates = async () => {
    setLoading(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const params = new URLSearchParams()
      params.set('mode', 'duplicates')
      if (categoryFilter !== 'all') params.set('category', categoryFilter)

      const res = await fetch(`/api/admin/questions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        setDuplicatesReport(json.duplicatesReport)
        showToast('Verificação semântica de duplicados concluída!')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'browser') {
      loadQuestions()
    } else if (activeTab === 'stats') {
      loadStats()
    } else if (activeTab === 'duplicates') {
      scanDuplicates()
    }
  }, [activeTab, currentPage, categoryFilter, difficultyFilter])

  const openEditModal = (q: any) => {
    setSelectedQuestion(q)
    setEditPrompt(q.pergunta || q.question || '')
    const opts = Array.isArray(q.opcoes) ? q.opcoes : Array.isArray(q.options) ? q.options.map((o: any) => o.text || o) : ['', '', '', '']
    setEditOptions(opts.length === 4 ? opts : [...opts, '', '', ''].slice(0, 4))
    setEditCorrect(typeof q.respostaCorreta === 'number' ? q.respostaCorreta : 0)
    setEditExplanation(q.explicacao || q.explanation || '')
    setEditDifficulty(q.dificuldade || 1)
  }

  const handleSaveQuestion = async () => {
    if (!selectedQuestion) return
    setIsSubmitting(true)

    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'edit',
          questionId: selectedQuestion.id,
          questionData: {
            pergunta: editPrompt,
            opcoes: editOptions,
            respostaCorreta: editCorrect,
            explicacao: editExplanation,
            dificuldade: editDifficulty,
          },
        }),
      })

      const json = await res.json()
      if (json.success) {
        showToast('Pergunta atualizada com sucesso!')
        setSelectedQuestion(null)
        loadQuestions()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-50 rounded-2xl border border-emerald-500/40 bg-slate-950 px-5 py-3 text-xs font-black text-emerald-300 shadow-2xl backdrop-blur-xl animate-in zoom-in-95">
          {toastMessage}
        </div>
      )}

      {/* Abas de Navegação */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('browser')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'browser'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📚 Explorador (20.050)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('duplicates')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'duplicates'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🚨 Deteção de Duplicados
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📊 Metas por Categoria
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (activeTab === 'browser') loadQuestions()
            if (activeTab === 'duplicates') scanDuplicates()
            if (activeTab === 'stats') loadStats()
          }}
          className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* ABA 1: EXPLORADOR DE PERGUNTAS */}
      {activeTab === 'browser' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setCurrentPage(1)
                loadQuestions()
              }}
              className="relative flex-1"
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por enunciado, opções, explicação ou ID..."
                className="w-full rounded-2xl border border-white/15 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
              />
            </form>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="rounded-2xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value="all">📂 Todas as 18 Categorias</option>
                {MAIN_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="rounded-2xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value="all">⭐ Todas as Dificuldades</option>
                <option value="1">⭐ Nível 1 (Muito Fácil)</option>
                <option value="2">⭐⭐ Nível 2 (Fácil)</option>
                <option value="3">⭐⭐⭐ Nível 3 (Médio)</option>
                <option value="4">⭐⭐⭐⭐ Nível 4 (Difícil)</option>
                <option value="5">⭐⭐⭐⭐⭐ Nível 5 (Mestre)</option>
              </select>
            </div>
          </div>

          {/* Listagem de Perguntas */}
          <div className="space-y-3">
            {loading ? (
              <div className="py-12 text-center text-slate-400 rounded-3xl border border-white/10 bg-slate-900/80">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
                <span>A carregar banco de perguntas...</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 rounded-3xl border border-white/10 bg-slate-900/80">
                Nenhuma pergunta encontrada para os filtros aplicados.
              </div>
            ) : (
              questions.map((q, idx) => {
                const options = Array.isArray(q.opcoes) ? q.opcoes : Array.isArray(q.options) ? q.options.map((o: any) => o.text || o) : []
                const correctIdx = typeof q.respostaCorreta === 'number' ? q.respostaCorreta : 0

                return (
                  <div
                    key={q.id || idx}
                    className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-3 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                          #{q.id}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                          {q.tema || 'Geral'}
                        </span>
                        {q.subtema && (
                          <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg">
                            {q.subtema}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-yellow-400">
                          {'★'.repeat(q.dificuldade || 1)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => openEditModal(q)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Editar</span>
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-relaxed">
                      {q.pergunta || q.question}
                    </h4>

                    {/* Opções */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      {options.map((opt: string, optIndex: number) => {
                        const isCorrect = optIndex === correctIdx
                        const letter = ['A', 'B', 'C', 'D'][optIndex] || `${optIndex + 1}`

                        return (
                          <div
                            key={optIndex}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                              isCorrect
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                                : 'bg-slate-950/60 border-white/5 text-slate-300'
                            }`}
                          >
                            <span className="font-mono text-[10px] font-black text-slate-400">
                              {letter})
                            </span>
                            <span className="truncate">{opt}</span>
                            {isCorrect && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto shrink-0" />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {q.explicacao && (
                      <p className="text-[11px] text-slate-400 italic pt-1 border-t border-white/5">
                        💡 Explicação: {q.explicacao}
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md">
            <span className="text-xs text-slate-400">
              A mostrar página <strong className="text-white">{currentPage}</strong> de{' '}
              <strong className="text-white">{totalPages}</strong> ({totalCount.toLocaleString('pt-PT')} perguntas)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: DETEÇÃO DE DUPLICADOS */}
      {activeTab === 'duplicates' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-amber-500/20 bg-amber-950/20 p-5 backdrop-blur-md space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4" />
              <span>Scanner Anti-Duplicação Semântica & Hash Exato</span>
            </div>
            <p className="text-xs text-slate-300">
              Analisa perguntas semanticamente equivalentes, inversões de fórmulas gramaticais e similaridade lexical (&gt;80%).
            </p>
          </div>

          {duplicatesReport?.duplicates?.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center text-xs text-emerald-400 space-y-2">
              <CheckCircle2 className="h-8 w-8 mx-auto" />
              <span className="font-bold block">
                Nenhum duplicado crítico encontrado no lote analisado ({duplicatesReport.totalChecked} perguntas testadas)!
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {(duplicatesReport?.duplicates || []).map((dup: any, i: number) => (
                <div
                  key={i}
                  className="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-5 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                      {dup.type} • Similaridade: {(dup.score * 100).toFixed(0)}%
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      #{dup.incomingId} vs #{dup.existingId}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold">Pergunta A:</span>
                      <p className="text-white">{dup.incomingText}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold">Pergunta B (Existente):</span>
                      <p className="text-amber-300">{dup.existingText}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">Razão: {dup.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 3: METAS E ESTATÍSTICAS POR CATEGORIA */}
      {activeTab === 'stats' && statsData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(statsData.themes || []).map((t: any) => (
              <div
                key={t.id}
                className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-black text-sm text-white flex items-center gap-2">
                    <span>{t.emoji}</span>
                    <span>{t.name}</span>
                  </span>
                  <span className="text-xs font-black text-emerald-400 font-mono">
                    {t.totalApproved} perguntas
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-500"
                    style={{ width: `${Math.min(100, (t.totalApproved / 2000) * 100)}%` }}
                  />
                </div>

                <span className="text-[10px] text-slate-400 block">
                  {t.subthemes?.length || 0} subtemas editoriais ativos
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Edição de Pergunta */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
                ✏️ Editar Pergunta #{selectedQuestion.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Enunciado da Pergunta:</label>
                <textarea
                  rows={3}
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-400">4 Opções de Resposta:</label>
                {editOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOptionRadio"
                      checked={editCorrect === i}
                      onChange={() => setEditCorrect(i)}
                      className="cursor-pointer"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...editOptions]
                        next[i] = e.target.value
                        setEditOptions(next)
                      }}
                      className="flex-1 rounded-xl border border-white/15 bg-slate-950 p-2 text-xs text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Explicação:</label>
                <input
                  type="text"
                  value={editExplanation}
                  onChange={(e) => setEditExplanation(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveQuestion}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider disabled:opacity-50"
              >
                {isSubmitting ? 'A guardar...' : 'Guardar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
