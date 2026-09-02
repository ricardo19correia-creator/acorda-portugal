'use client'

import React, { useState } from 'react'
import { Flag, X, CheckCircle2, AlertCircle, Send } from 'lucide-react'

export interface QuestionReportModalProps {
  isOpen: boolean
  onClose: () => void
  questionId: string | number
  questionText: string
  categoryName?: string
  user?: any
}

const REPORT_REASONS = [
  { id: 'erro_factual', label: 'Erro factual ou histórico', desc: 'Dados, datas ou factos incorretos.' },
  { id: 'resposta_errada', label: 'Resposta correta indicada está errada', desc: 'A opção certa do jogo é inválida.' },
  { id: 'pergunta_ambigua', label: 'Pergunta ambígua ou confusa', desc: 'Fraseamento dúbio ou com múltiplas interpretações.' },
  { id: 'imagem_errada', label: 'Imagem errada ou ilegível', desc: 'O elemento visual não corresponde ao tema.' },
  { id: 'outro', label: 'Outro problema editorial', desc: 'Gráfica, ortografia ou erro de formulação.' },
]

export function QuestionReportModal({
  isOpen,
  onClose,
  questionId,
  questionText,
  categoryName,
  user,
}: QuestionReportModalProps) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0].id)
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const reasonObj = REPORT_REASONS.find((r) => r.id === selectedReason)
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'pergunta_reportada',
          description: `[PERGUNTA #${questionId}] (${reasonObj?.label || selectedReason}) - ${details.trim() || 'Sem detalhes adicionais.'} | Pergunta: "${questionText.slice(0, 120)}"`,
          questionId: String(questionId),
          questionText,
          category: categoryName || 'Geral',
          reason: selectedReason,
          userId: user?.uid || null,
          userDisplayName: user?.displayName || 'Jogador',
          userEmail: user?.email || 'anónimo',
          page: typeof window !== 'undefined' ? window.location.pathname : '/jogar',
        }),
      })

      if (!res.ok) {
        throw new Error('Falha ao enviar o reporte. Tenta novamente.')
      }

      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setDetails('')
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err?.message || 'Erro de comunicação ao enviar o reporte.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900/95 p-5 sm:p-6 shadow-2xl backdrop-blur-xl text-left">
        {/* Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Flag className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-base sm:text-lg font-black text-white uppercase tracking-tight">
              Reportar Pergunta
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {categoryName ? `${categoryName} • ` : ''}ID #{questionId}
            </p>
          </div>
        </div>

        {/* Resumo da Pergunta */}
        <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-slate-300 font-medium line-clamp-2">
          &ldquo;{questionText}&rdquo;
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto animate-pop">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="font-display text-base font-bold text-white">Obrigado pela colaboração!</p>
            <p className="text-xs text-slate-400">O reporte foi enviado para a equipa editorial.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Motivo do Reporte:
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      selectedReason === reason.id
                        ? 'border-amber-500/50 bg-amber-500/10 text-white'
                        : 'border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={() => setSelectedReason(reason.id)}
                      className="mt-0.5 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <div className="text-xs">
                      <p className="font-bold">{reason.label}</p>
                      <p className="text-[10px] text-muted-foreground">{reason.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Observações adicionais (opcional):
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explica brevemente o que está incorreto ou a fonte..."
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md transition cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{submitting ? 'A enviar...' : 'Enviar Reporte'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
