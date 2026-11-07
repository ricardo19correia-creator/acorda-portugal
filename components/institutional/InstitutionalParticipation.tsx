'use client'

import React, { useState } from 'react'
import {
  Send,
  Shield,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Lock,
  FileCheck,
  HelpCircle,
  Loader2,
  Check,
} from 'lucide-react'
import { PORTUGAL_DISTRICTS, DISTRICT_CITIES_MAP, type ValidDistrict } from '@/data/districts'
import { useAuth } from '@/components/auth-provider'

export function InstitutionalParticipation() {
  const { user, profile } = useAuth()

  const [district, setDistrict] = useState<string>('Lisboa')
  const [city, setCity] = useState<string>('')
  const [scope, setScope] = useState<string>('ocorrencia_local')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [authorName, setAuthorName] = useState<string>('')
  const [authorEmail, setAuthorEmail] = useState<string>('')
  const [declaration, setDeclaration] = useState<boolean>(false)

  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const availableCities = district && DISTRICT_CITIES_MAP[district as ValidDistrict]
    ? DISTRICT_CITIES_MAP[district as ValidDistrict]
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim() || title.trim().length < 5) {
      setError('Por favor indica um título conciso com pelo menos 5 caracteres.')
      return
    }

    if (!description.trim() || description.trim().length < 15) {
      setError('Por favor descreve detalhadamente o acontecimento (mínimo 15 caracteres).')
      return
    }

    if (!declaration) {
      setError('É obrigatório confirmar que as informações prestadas são verídicas.')
      return
    }

    setLoading(true)

    try {
      const payload = {
        type: 'outro',
        title: `[Acontecimento ${district}] ${title.trim()}`,
        description: `[REGISTO CÍVICO]\nDistrito: ${district}\nConcelho: ${city || 'Não especificado'}\nÂmbito: ${scope}\nAutor Declarado: ${authorName.trim() || user?.displayName || 'Cidadão Local'}\n\n[FACTOS RELATADOS]:\n${description.trim()}`,
        location: `${district}${city ? ` - ${city}` : ''}`,
        contactName: authorName.trim() || user?.displayName || profile?.displayName || 'Cidadão Local',
        contactEmail: authorEmail.trim() || user?.email || '',
        source: 'participacao_civica',
        pageUrl: 'https://acordaportugal.pt/#participar',
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
        throw new Error(data.error || 'Não foi possível registar o acontecimento de momento.')
      }

      setSuccess(true)
      setTitle('')
      setDescription('')
      setCity('')
      setDeclaration(false)
    } catch (err: any) {
      console.error('[InstitutionalParticipation] Erro ao submeter:', err)
      setError(err?.message || 'Ocorreu um erro ao submeter o acontecimento. Por favor tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="participar" className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-[#091528]/50 via-slate-950 to-transparent border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Secção */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <Send className="w-3.5 h-3.5" />
            <span>PARTICIPAÇÃO DOS CIDADÃOS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight">
            Envio de Acontecimentos & Ocorrências
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            A informação começa nas pessoas. Se presenciou ou tem conhecimento de um facto relevante no seu concelho ou distrito, submeta-o para averiguação da nossa rede cívica.
          </p>
        </div>

        {/* Caixa Principal (Grelha 2 colunas: Formulário à esquerda, Diretrizes à direita) */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Coluna do Formulário (7 colunas) */}
          <div className="lg:col-span-7 rounded-3xl border border-white/15 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
            {success ? (
              <div className="text-center py-12 space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-black uppercase text-white">
                    Acontecimento Registado com Sucesso
                  </h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Obrigado pela sua participação cívica. O seu reporte foi registado e encaminhado para a mesa de verificação do Acorda Portugal. A verdade começa na atenção de cada cidadão.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 text-xs font-bold transition-all cursor-pointer"
                >
                  Submeter Outro Acontecimento
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="font-display text-lg font-black uppercase text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    Formulário de Submissão Cívica
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Verificação Independente</span>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Linha 1: Distrito e Concelho */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Distrito / Região *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value)
                        setCity('')
                      }}
                      className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      required
                    >
                      {PORTUGAL_DISTRICTS.map((d) => (
                        <option key={d} value={d} className="bg-slate-950 text-white">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Concelho / Freguesia
                    </label>
                    {availableCities.length > 0 ? (
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      >
                        <option value="">(Selecionar concelho opcional)</option>
                        {availableCities.map((c) => (
                          <option key={c} value={c} className="bg-slate-950 text-white">
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ex: Concelho / Freguesia"
                        className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                      />
                    )}
                  </div>
                </div>

                {/* Âmbito do Acontecimento */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Âmbito / Tipo de Facto *
                  </label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="ocorrencia_local">Ocorrência Local / Bairro / Freguesia</option>
                    <option value="alerta_protecao_civil">Alerta Meteorológico / Proteção Civil / Segurança</option>
                    <option value="servico_publico">Serviços Públicos / Saúde / Transportes / Escolas</option>
                    <option value="transparencia_autarquica">Transparência Municipal & Decisões Públicas</option>
                    <option value="ambiente_patrimonio">Ambiente, Floresta & Defesa do Património</option>
                    <option value="outro_interesse_publico">Outro Acontecimento de Interesse Público</option>
                  </select>
                </div>

                {/* Título */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Título Sucinto do Acontecimento *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Falha no abastecimento de água há 48h sem resposta oficial"
                    maxLength={120}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                    required
                  />
                </div>

                {/* Descrição Detalhada */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Descrição Detalhada dos Factos *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Descreva o que aconteceu, onde, quando e quais os impactos observados. Seja o mais factual e rigoroso possível."
                    className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600 resize-y"
                    required
                  />
                </div>

                {/* Autor e Contacto Opcional */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Nome / Pseudónimo Cívico
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder={user?.displayName || 'Opcional (ex: João Silva)'}
                      className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Email para Contacto de Verificação
                    </label>
                    <input
                      type="email"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      placeholder={user?.email || 'Opcional (confidencial)'}
                      className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* Termo de Compromisso de Honra */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={declaration}
                      onChange={(e) => setDeclaration(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                      required
                    />
                    <span className="text-xs text-slate-300 leading-normal group-hover:text-white transition-colors">
                      Declaro sob compromisso de honra que a informação prestada é verdadeira segundo o meu melhor conhecimento, não contendo difamação, boatos infundados ou interesses comerciais.
                    </span>
                  </label>
                </div>

                {/* Botão de Envio */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-extrabold uppercase tracking-wider px-6 py-3.5 text-xs sm:text-sm shadow-lg shadow-emerald-950/50 transition-all cursor-pointer active:scale-98"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>A Submeter Acontecimento...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submeter Acontecimento para Verificação</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Coluna de Diretrizes e Proteção (5 colunas) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Caixa: Proteção de Fontes */}
            <div className="rounded-2xl border border-emerald-500/30 bg-[#0a1f33]/80 p-5 sm:p-6 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm uppercase tracking-wide">
                <Lock className="w-4 h-4" />
                <span>Garantia de Sigilo & Proteção</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                O Acorda Portugal garante a proteção absoluta da identidade dos cidadãos que submetem relatos de boa-fé. Os dados de contacto nunca são partilhados publicamente e servem exclusivamente para esclarecimento de factos com a redação.
              </p>
            </div>

            {/* Caixa: Critérios de Admissibilidade */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm uppercase tracking-wide">
                <Shield className="w-4 h-4" />
                <span>Critérios de Verificação</span>
              </div>
              <ul className="text-xs sm:text-sm text-slate-300 space-y-2.5">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Factos Concretos:</strong> Relatos com indicação de data, local e elementos visíveis ou documentais.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Interesse Coletivo:</strong> Situações que afetem a comunidade, serviços públicos ou a transparência.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Sem Especulação:</strong> Denúncias sem fundamentação factual não serão promovidas a alertas.</span>
                </li>
              </ul>
            </div>

            {/* Canal de Emergência / Nota de Serviço */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-xs text-slate-400 space-y-1.5">
              <p className="font-semibold text-slate-200">
                Aviso de Emergência Nacional:
              </p>
              <p>
                Em caso de perigo imediato de vida, incêndio ativo ou emergência médica, contacte sempre de imediato o <strong>112</strong> ou os Bombeiros da sua área. O Acorda Portugal é uma plataforma cívica e não substitui os canais de socorro do Estado.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
