'use client'

import React, { useState } from 'react'
import { Send, MapPin, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { PORTUGAL_DISTRICTS, DISTRICT_CITIES_MAP, type ValidDistrict } from '@/data/districts'
import { useAuth } from '@/components/auth-provider'

export function InstitutionalParticipation() {
  const { user, profile } = useAuth()

  const [district, setDistrict] = useState<ValidDistrict>('Lisboa')
  const [city, setCity] = useState<string>('')
  const [scope, setScope] = useState<string>('ocorrencia_local')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [authorName, setAuthorName] = useState<string>('')
  const [authorContact, setAuthorContact] = useState<string>('')
  const [declaration, setDeclaration] = useState<boolean>(false)

  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const availableCities = DISTRICT_CITIES_MAP[district] || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim() || title.trim().length < 5) {
      setError('Por favor indica um título com pelo menos 5 caracteres.')
      return
    }

    if (!description.trim() || description.trim().length < 15) {
      setError('Por favor descreve detalhadamente o acontecimento (mínimo 15 caracteres).')
      return
    }

    if (!declaration) {
      setError('É obrigatório confirmar a veracidade das informações relatadas.')
      return
    }

    setLoading(true)

    try {
      const payload = {
        type: 'outro',
        title: `[Acontecimento - ${district}] ${title.trim()}`,
        description: `[REGISTO CÍVICO]\nDistrito: ${district}\nConcelho: ${city || 'Não especificado'}\nÂmbito: ${scope}\nAutor Declarado: ${authorName.trim() || user?.displayName || 'Cidadão Local'}\nContacto: ${authorContact.trim() || user?.email || 'Não facultado'}\n\n[FACTOS RELATADOS]:\n${description.trim()}`,
        location: `${district}${city ? ` — ${city}` : ''}`,
        contactName: authorName.trim() || user?.displayName || profile?.displayName || 'Cidadão Local',
        contactEmail: authorContact.trim() || user?.email || '',
        source: 'acontecimento_civico',
        pageUrl: 'https://acordaportugal.pt/#acontecimentos',
        metadata: {
          district,
          city,
          scope,
          isCivicReport: true,
        },
      }

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok && !data.savedInFirestore) {
        throw new Error(data.error || 'Não foi possível registar o acontecimento neste momento.')
      }

      setSuccess(true)
      setTitle('')
      setDescription('')
      setCity('')
      setDeclaration(false)
    } catch (err: any) {
      console.error('[InstitutionalParticipation] Erro:', err)
      setError(err?.message || 'Ocorreu um erro ao submeter o acontecimento. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="acontecimentos" className="relative w-full py-14 sm:py-18 border-t border-white/10">
      {/* Âncora invisível para compatibilidade com links antigos */}
      <span id="participar" className="absolute -top-16 opacity-0 pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Cabeçalho da Secção */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Send className="w-3.5 h-3.5" />
            <span>PARTICIPAÇÃO CÍVICA</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight">
            Enviar Acontecimento
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Testemunhou um facto relevante no seu concelho ou distrito? Partilhe a ocorrência para averiguação e divulgação cívica.
          </p>
        </div>

        {/* Formulário Institucional Compacto */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white uppercase">
                Acontecimento Registado
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                O seu relato foi rececionado e encaminhado para averiguação da rede cívica. Obrigado por contribuir para um país mais transparente e informado.
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white px-4 py-2 text-xs font-bold transition-all cursor-pointer"
              >
                Submeter Outro Acontecimento
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/40 flex items-center gap-2 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Linha 1: Distrito, Concelho e Âmbito */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    Distrito / Região *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value as ValidDistrict)
                      setCity('')
                    }}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {PORTUGAL_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Concelho (Opcional)
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Selecione o Concelho...</option>
                    {availableCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Âmbito
                  </label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="ocorrencia_local">Ocorrência Local</option>
                    <option value="servico_publico">Serviço Público / Saúde</option>
                    <option value="seguranca_alerta">Segurança / Alerta</option>
                    <option value="ambiente_patrimonio">Ambiente & Património</option>
                    <option value="outro">Outro Acontecimento</option>
                  </select>
                </div>
              </div>

              {/* Linha 2: Título */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Título do Acontecimento *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Resumo claro e conciso dos factos..."
                  maxLength={120}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Linha 3: Descrição */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Descrição dos Factos *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o que aconteceu, onde, quando e se há testemunhas ou documentação..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Linha 4: Autor e Contacto Opcionais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">
                    Seu Nome (ou Cidadão Anónimo)
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={user?.displayName || 'Cidadão Local'}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">
                    Email ou Telefone (Para averiguação confidencial)
                  </label>
                  <input
                    type="text"
                    value={authorContact}
                    onChange={(e) => setAuthorContact(e.target.value)}
                    placeholder={user?.email || 'contacto@exemplo.pt'}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Declaração e Submissão */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={declaration}
                    onChange={(e) => setDeclaration(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Declaro sob compromisso de honra que os factos relatados são verídicos.</span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>A registar...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submeter Ocorrência</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </section>
  )
}

export default InstitutionalParticipation
