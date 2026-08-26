'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  ShieldAlert,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Flame,
  Award,
  Crown,
  Lock,
} from 'lucide-react'
import type { CreatorPost, PollOption } from '@/src/types/creators'
import { CREATOR_CATEGORIES } from '@/lib/creators-service'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'

interface CreatorPostCardProps {
  post: CreatorPost
  onLike: (postId: string) => void
  onSave: (postId: string) => void
  onOpenComments: (post: CreatorPost) => void
  onVotePoll: (postId: string, optionId: string) => void
  onVoteSuggestion: (postId: string, vote: 'up' | 'down') => void
  onReport: (post: CreatorPost) => void
}

function timeAgo(dateInput: string | number | Date): string {
  const date = new Date(dateInput)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Agora mesmo'
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `Há ${diffInMinutes} min`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `Há ${diffInHours} h`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return 'Ontem'
  if (diffInDays < 30) return `Há ${diffInDays} dias`
  return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
}

export function CreatorPostCard({
  post,
  onLike,
  onSave,
  onOpenComments,
  onVotePoll,
  onVoteSuggestion,
  onReport,
}: CreatorPostCardProps) {
  const [copiedShare, setCopiedShare] = useState(false)
  const [likePulsing, setLikePulsing] = useState(false)

  const categoryInfo = CREATOR_CATEGORIES.find((c) => c.slug === post.category) || CREATOR_CATEGORIES[0]

  const handleLikeClick = () => {
    setLikePulsing(true)
    setTimeout(() => setLikePulsing(false), 400)
    onLike(post.id)
  }

  const handleShareClick = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/criadores?post=${post.id}`
      navigator.clipboard.writeText(shareUrl).catch(() => {})
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 2000)
    }
  }

  const suggestionStatusBadge = (status?: string) => {
    switch (status) {
      case 'em_desenvolvimento':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
            🛠️ Em Desenvolvimento
          </span>
        )
      case 'implementada':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            ✅ Implementada no Jogo
          </span>
        )
      case 'em_analise':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
            👀 Em Análise
          </span>
        )
      case 'recusada':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-300">
            ❌ Recusada
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
            💡 Sugestão Comunitária
          </span>
        )
    }
  }

  const highlightBadgeDisplay = (badge?: string) => {
    switch (badge) {
      case 'oficial_acorda_portugal':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/50 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <CheckCircle className="h-3 w-3 text-emerald-400" />
            <span>Equipa Oficial</span>
          </span>
        )
      case 'publicacao_do_dia':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/50 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
            <Crown className="h-3 w-3 text-amber-400" />
            <span>Publicação do Dia</span>
          </span>
        )
      case 'melhor_ideia':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/50 bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Melhor Ideia</span>
          </span>
        )
      case 'humor_do_dia':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/50 bg-yellow-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-yellow-300">
            <span>😂 Humor do Dia</span>
          </span>
        )
      case 'espirito_portugues':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/50 bg-red-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-300">
            <span>🇵🇹 Espírito Português</span>
          </span>
        )
      default:
        return null
    }
  }

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 hover:bg-slate-900/95 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      {/* Header da Publicação: Autor, Nível, Distrito, Categoria e Tempo */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {post.isAnonymous ? (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-950/60 text-lg shadow-inner">
              🎭
            </div>
          ) : (
            <Link
              href={`/criadores/${post.authorUsername}`}
              className="shrink-0 transition-transform active:scale-95"
            >
              <UserAvatar avatarUrl={post.authorAvatar} size="md" />
            </Link>
          )}

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {post.isAnonymous ? (
                <span className="font-bold text-slate-200 text-sm">Cidadão Anónimo</span>
              ) : (
                <Link
                  href={`/criadores/${post.authorUsername}`}
                  className="font-bold text-white text-sm hover:text-emerald-300 transition-colors truncate"
                >
                  {post.authorName}
                </Link>
              )}

              {post.isOfficial && (
                <span className="text-emerald-400" title="Verificado Oficial">
                  ✓
                </span>
              )}

              {post.authorLevel && !post.isAnonymous && (
                <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-black text-amber-400">
                  Nv. {post.authorLevel}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              {!post.isAnonymous && (
                <>
                  <span className="text-slate-400">@{post.authorUsername}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">{post.authorDistrict || 'Portugal'}</span>
                  <span>•</span>
                </>
              )}
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Botão de Denúncia / Ações */}
        <button
          type="button"
          onClick={() => onReport(post)}
          title="Denunciar publicação"
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-rose-400 cursor-pointer shrink-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Badges de Categoria & Destaque */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
          style={{
            backgroundColor: categoryInfo.badgeBg,
            borderColor: categoryInfo.borderColor,
            color: categoryInfo.accentColor,
          }}
        >
          <span>{categoryInfo.icon}</span>
          <span>{categoryInfo.name}</span>
        </span>

        {highlightBadgeDisplay(post.highlightBadge)}
        {post.isSuggestion && suggestionStatusBadge(post.suggestionStatus)}
      </div>

      {/* Título da Publicação */}
      <h2 className="mt-3 font-display text-base sm:text-lg font-black text-white leading-snug tracking-tight">
        {post.title}
      </h2>

      {/* Conteúdo Textual */}
      <p className="mt-2 text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
        {post.content}
      </p>

      {/* Imagem Opcional */}
      {post.imageUrl && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 max-h-80 bg-slate-950">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      {/* Módulo Especial: Enquetes / Debates */}
      {post.isPoll && post.pollOptions && post.pollOptions.length > 0 && (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-950/20 p-3.5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-red-300 uppercase tracking-wider">
            <Flame className="h-3.5 w-3.5 text-red-400" />
            <span>{post.pollQuestion || 'Votação Aberta à Comunidade'}</span>
          </div>

          <div className="space-y-2">
            {post.pollOptions.map((opt) => {
              const totalVotes = post.pollTotalVotes || 1
              const percentage = Math.round((opt.votes / totalVotes) * 100)
              const hasVoted = Boolean(post.userVotedOptionId)
              const isSelected = post.userVotedOptionId === opt.id

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={hasVoted}
                  onClick={() => onVotePoll(post.id, opt.id)}
                  className={cn(
                    'group relative w-full overflow-hidden rounded-xl border p-2.5 text-left text-xs font-semibold transition-all cursor-pointer disabled:cursor-default',
                    isSelected
                      ? 'border-red-400 bg-red-500/20 text-white font-bold ring-1 ring-red-400/50'
                      : 'border-white/10 bg-slate-900/90 text-slate-200 hover:border-red-400/40 hover:bg-slate-800',
                  )}
                >
                  {/* Barra de Progresso do Voto */}
                  {hasVoted && (
                    <div
                      className="absolute inset-y-0 left-0 bg-red-500/20 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="truncate">{opt.text}</span>
                    {hasVoted && (
                      <span className="shrink-0 font-black tabular-nums text-red-300">
                        {percentage}% ({opt.votes})
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {post.pollTotalVotes !== undefined && post.pollTotalVotes > 0 && (
            <div className="text-[11px] text-slate-400 text-right font-medium">
              {post.pollTotalVotes} votos registados
            </div>
          )}
        </div>
      )}

      {/* Módulo Especial: Sugestões para o Jogo (Votação 👍/👎) */}
      {post.isSuggestion && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-3.5">
          <div className="text-xs text-slate-300 font-medium">
            Apoias a inclusão desta ideia no Acorda Portugal?
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onVoteSuggestion(post.id, 'up')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95',
                post.userVote === 'up'
                  ? 'border-emerald-400 bg-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'border-white/10 bg-slate-900 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300',
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{post.upvotesCount ?? 0}</span>
            </button>

            <button
              type="button"
              onClick={() => onVoteSuggestion(post.id, 'down')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95',
                post.userVote === 'down'
                  ? 'border-rose-400 bg-rose-500/30 text-rose-300'
                  : 'border-white/10 bg-slate-900 text-slate-300 hover:border-rose-500/40 hover:text-rose-300',
              )}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span>{post.downvotesCount ?? 0}</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer: Gostos, Comentários, Partilhas e Favoritos */}
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3.5 text-xs text-slate-400">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Botão Gostar */}
          <button
            type="button"
            onClick={handleLikeClick}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3 py-2 font-bold transition-all cursor-pointer active:scale-90',
              post.hasLiked
                ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                : 'text-slate-400 hover:text-rose-400 hover:bg-white/5',
              likePulsing && 'scale-125',
            )}
          >
            <Heart className={cn('h-4 w-4', post.hasLiked && 'fill-rose-400')} />
            <span className="tabular-nums">{post.likesCount}</span>
          </button>

          {/* Botão Comentários */}
          <button
            type="button"
            onClick={() => onOpenComments(post)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 font-bold text-slate-400 transition-colors hover:text-emerald-400 hover:bg-white/5 cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="tabular-nums">{post.commentsCount}</span>
          </button>

          {/* Botão Partilhar */}
          <button
            type="button"
            onClick={handleShareClick}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 font-bold text-slate-400 transition-colors hover:text-cyan-400 hover:bg-white/5 cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>{copiedShare ? 'Copiado!' : post.sharesCount || 'Partilhar'}</span>
          </button>
        </div>

        {/* Botão Guardar / Favorito */}
        <button
          type="button"
          onClick={() => onSave(post.id)}
          title={post.hasSaved ? 'Remover dos guardados' : 'Guardar publicação'}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl transition-colors cursor-pointer',
            post.hasSaved
              ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30'
              : 'text-slate-400 hover:text-amber-400 hover:bg-white/5',
          )}
        >
          <Bookmark className={cn('h-4 w-4', post.hasSaved && 'fill-amber-400')} />
        </button>
      </div>
    </article>
  )
}
