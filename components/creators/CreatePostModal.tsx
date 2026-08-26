'use client'

import React, { useState } from 'react'
import {
  X,
  PenSquare,
  Sparkles,
  Image as ImageIcon,
  Flame,
  Plus,
  Trash2,
  Lock,
  EyeOff,
  AlertCircle,
} from 'lucide-react'
import { CREATOR_CATEGORIES } from '@/lib/creators-service'
import type { CreatorCategorySlug, CreatorPost } from '@/src/types/creators'
import { useAuth } from '@/components/auth-provider'
import { cn } from '@/lib/utils'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated: (post: CreatorPost) => void
  createPostFn: (data: any) => Promise<CreatorPost>
}

export function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
  createPostFn,
}: CreatePostModalProps) {
  const { user, profile } = useAuth()

  const [category, setCategory] = useState<CreatorCategorySlug>('ideias')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isPoll, setIsPoll] = useState(false)
  const [pollOptions, setPollOptions] = useState<string[]>(['Opção 1', 'Opção 2'])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, `Opção ${pollOptions.length + 1}`])
    }
  }

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index))
    }
  }

  const handlePollOptionChange = (index: number, val: string) => {
    const updated = [...pollOptions]
    updated[index] = val
    setPollOptions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!user && !isAnonymous) {
      setErrorMessage('Precisas de ter sessão iniciada para publicar.')
      return
    }

    if (title.trim().length < 4) {
      setErrorMessage('O título deve conter pelo menos 4 caracteres.')
      return
    }

    if (content.trim().length < 10) {
      setErrorMessage('O conteúdo deve conter pelo menos 10 caracteres.')
      return
    }

    if (isPoll && pollOptions.some((o) => !o.trim())) {
      setErrorMessage('Todas as opções do debate devem estar preenchidas.')
      return
    }

    setIsSubmitting(true)

    try {
      const newPost = await createPostFn({
        authorId: user?.uid || 'anon_user',
        authorName: profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Jogador',
        authorUsername: profile?.username || user?.displayName?.toLowerCase().replace(/\s+/g, '_') || 'jogador',
        authorAvatar: profile?.photoURL || user?.photoURL || '/images/avatars/avatar_default.png',
        authorLevel: profile?.level || 1,
        authorDistrict: profile?.district || 'Portugal',
        authorTitle: profile?.equippedTitle || 'Cidadão Ativo',
        category,
        title,
        content,
        imageUrl: imageUrl.trim() || undefined,
        isAnonymous: category === 'desabafos' ? isAnonymous : false,
        isSuggestion: category === 'sugestoes',
        isPoll: category === 'debates' || isPoll,
        pollQuestion: isPoll ? title : undefined,
        pollOptions: isPoll ? pollOptions : undefined,
      })

      onPostCreated(newPost)
      onClose()
      // Limpar formulário
      setTitle('')
      setContent('')
      setImageUrl('')
      setIsAnonymous(false)
      setIsPoll(false)
      setPollOptions(['Opção 1', 'Opção 2'])
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocorreu um erro ao publicar. Tenta novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-emerald-500/40 bg-slate-900 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">✍️</span>
            <div>
              <h2 className="font-display text-lg font-black uppercase text-white tracking-wide">
                Criar Nova Publicação
              </h2>
              <p className="text-xs text-slate-400">
                A tua voz na comunidade do Acorda Portugal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulário com Scroll Suave */}
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs font-bold text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Seleção de Categoria */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              Categoria Oficial
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CREATOR_CATEGORIES.map((cat) => {
                const isSelected = category === cat.slug
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => {
                      setCategory(cat.slug)
                      if (cat.slug === 'debates') setIsPoll(true)
                    }}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-bold transition-all cursor-pointer',
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/20 text-white ring-1 ring-emerald-400/50 font-black'
                        : 'border-white/10 bg-slate-950/60 text-slate-400 hover:border-white/20 hover:text-white',
                    )}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Título da Publicação */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-black uppercase tracking-wider text-slate-300">
                Título da Publicação
              </label>
              <span className="text-slate-400 tabular-nums">{title.length}/120</span>
            </div>
            <input
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: E se pudéssemos desafiar jogadores do nosso distrito?"
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
            />
          </div>

          {/* Conteúdo da Publicação */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-black uppercase tracking-wider text-slate-300">
                Conteúdo / História / Opinião
              </label>
              <span className="text-slate-400 tabular-nums">{content.length}/2000</span>
            </div>
            <textarea
              required
              rows={5}
              maxLength={2000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreve aqui o teu texto com detalhe..."
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all resize-y"
            />
          </div>

          {/* Secção de Enquete / Debate (se ativo) */}
          {(category === 'debates' || isPoll) && (
            <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-red-400" />
                  Opções de Votação (Enquete)
                </span>
                {pollOptions.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-300 hover:text-white cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    Adicionar Opção
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                      placeholder={`Opção ${idx + 1}`}
                      className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-red-400"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePollOption(idx)}
                        className="p-2 text-slate-400 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* URL de Imagem Opcional */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              Link de Imagem (Opcional)
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/foto.jpg"
                className="w-full rounded-xl border border-white/15 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Opção de Publicação Anónima para Desabafos */}
          {category === 'desabafos' && (
            <div className="flex items-center justify-between rounded-2xl border border-purple-500/30 bg-purple-950/20 p-3.5">
              <div className="flex items-center gap-2.5">
                <EyeOff className="h-4 w-4 text-purple-400" />
                <div>
                  <div className="text-xs font-bold text-white">Publicar Anonimamente</div>
                  <div className="text-[11px] text-slate-400">O teu nome e distrito não serão revelados publicamente.</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-5 w-5 rounded accent-purple-500 cursor-pointer"
              />
            </div>
          )}

          {/* Botões de Submissão */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'A Publicar...' : 'PUBLICAR 🇵🇹'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
