'use client'

import React, { useState } from 'react'
import { X, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react'
import type { CreatorPost, ReportReason } from '@/src/types/creators'
import { reportPost } from '@/lib/creators-service'
import { useAuth } from '@/components/auth-provider'

interface ReportPostModalProps {
  post: CreatorPost | null
  isOpen: boolean
  onClose: () => void
}

const REPORT_REASONS: { value: ReportReason; label: string; desc: string }[] = [
  { value: 'spam', label: 'Spam ou Publicidade Indesejada', desc: 'Mensagens repetitivas ou links comerciais.' },
  { value: 'assedio', label: 'Assédio ou Intimidação', desc: 'Ataques pessoais direcionados a utilizadores.' },
  { value: 'discurso_odio', label: 'Discurso de Ódio', desc: 'Conteúdo discriminatório ou ofensivo.' },
  { value: 'informacao_pessoal', label: 'Exposição de Dados Pessoais', desc: 'Partilha de contactos ou dados privados.' },
  { value: 'conteudo_sexual', label: 'Conteúdo Explícito ou Impróprio', desc: 'Imagens ou textos de teor adulto.' },
  { value: 'violencia', label: 'Ameaças ou Violência', desc: 'Incentivo à agressão ou violência física.' },
  { value: 'fraude', label: 'Fraude ou Esquema Enganoso', desc: 'Tentativas de burla ou desinformação perigosa.' },
  { value: 'outro', label: 'Outro Motivo', desc: 'Violação das regras de convivência comunitária.' },
]

export function ReportPostModal({ post, isOpen, onClose }: ReportPostModalProps) {
  const { user } = useAuth()
  const [selectedReason, setSelectedReason] = useState<ReportReason>('spam')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedSuccess, setSubmittedSuccess] = useState(false)

  if (!isOpen || !post) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await reportPost({
        postId: post.id,
        reporterId: user?.uid || 'anon_reporter',
        reason: selectedReason,
        details,
      })
      setSubmittedSuccess(true)
      setTimeout(() => {
        setSubmittedSuccess(false)
        onClose()
      }, 2000)
    } catch (e) {
      alert('Erro ao enviar denúncia. Tenta novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-rose-500/40 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-950">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
              Denunciar Publicação
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-display text-base font-black text-white uppercase">
              Denúncia Registada com Sucesso
            </h4>
            <p className="text-xs text-slate-300">
              A equipa de moderação do Acorda Portugal irá analisar esta publicação com a maior brevidade. Obrigado por manteres a nossa comunidade segura.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Seleciona o Motivo Principal
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedReason === r.value
                        ? 'border-rose-500 bg-rose-500/15 text-white'
                        : 'border-white/10 bg-slate-950/60 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      checked={selectedReason === r.value}
                      onChange={() => setSelectedReason(r.value)}
                      className="mt-0.5 accent-rose-500"
                    />
                    <div className="flex flex-col text-xs">
                      <span className="font-bold text-white">{r.label}</span>
                      <span className="text-[11px] text-slate-400">{r.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Detalhes Adicionais (Opcional)
              </label>
              <textarea
                rows={2}
                maxLength={400}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Descreve brevemente o problema..."
                className="w-full rounded-xl border border-white/15 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'A Enviar...' : 'Submeter Denúncia'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
