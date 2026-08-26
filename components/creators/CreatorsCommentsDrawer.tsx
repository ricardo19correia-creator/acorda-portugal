'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Send,
  MessageSquare,
  Heart,
  CornerDownRight,
  User,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import type { CreatorPost, CreatorComment } from '@/src/types/creators'
import { getPostComments, addPostComment } from '@/lib/creators-service'
import { useAuth } from '@/components/auth-provider'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'

interface CreatorsCommentsDrawerProps {
  post: CreatorPost | null
  isOpen: boolean
  onClose: () => void
  onCommentAdded: (postId: string) => void
}

export function CreatorsCommentsDrawer({
  post,
  isOpen,
  onClose,
  onCommentAdded,
}: CreatorsCommentsDrawerProps) {
  const { user, profile } = useAuth()

  const [comments, setComments] = useState<CreatorComment[]>([])
  const [loading, setLoading] = useState(false)
  const [newCommentText, setNewCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<CreatorComment | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && post) {
      setLoading(true)
      getPostComments(post.id)
        .then((data) => setComments(data))
        .finally(() => setLoading(false))
    } else {
      setComments([])
      setReplyingTo(null)
      setNewCommentText('')
      setErrorMsg(null)
    }
  }, [isOpen, post])

  if (!isOpen || !post) return null

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!user) {
      setErrorMsg('Precisas de iniciar sessão para comentar.')
      return
    }

    if (newCommentText.trim().length < 2) {
      setErrorMsg('O comentário não pode estar vazio.')
      return
    }

    setIsSubmitting(true)

    try {
      const created = await addPostComment({
        postId: post.id,
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName || 'Jogador',
        authorUsername: profile?.username || user.displayName?.toLowerCase().replace(/\s+/g, '_') || 'jogador',
        authorAvatar: profile?.photoURL || user.photoURL || '/images/avatars/avatar_default.png',
        authorLevel: profile?.level || 1,
        authorDistrict: profile?.district || 'Portugal',
        authorTitle: profile?.equippedTitle || 'Cidadão Ativo',
        content: newCommentText,
        parentId: replyingTo?.id || null,
      })

      if (replyingTo) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === replyingTo.id) {
              return { ...c, replies: [...(c.replies || []), created] }
            }
            return c
          }),
        )
      } else {
        setComments((prev) => [...prev, created])
      }

      onCommentAdded(post.id)
      setNewCommentText('')
      setReplyingTo(null)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao enviar comentário.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-slate-900 shadow-2xl">
        {/* Header da Gaveta */}
        <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-5 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="font-display text-sm font-black uppercase text-white tracking-wide">
                Comentários ({post.commentsCount + (comments.length - post.commentsCount > 0 ? comments.length - post.commentsCount : 0)})
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{post.title}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lista de Comentários */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-xs text-slate-400 gap-2 animate-pulse">
              <div className="h-6 w-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              <span>A carregar conversas...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <div className="text-3xl">💬</div>
              <div className="font-bold text-white text-sm">Ainda não há comentários</div>
              <p className="text-xs">Sê o primeiro a participar e dar a tua opinião!</p>
            </div>
          ) : (
            comments.map((comm) => (
              <div key={comm.id} className="space-y-2.5">
                {/* Comentário Principal */}
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <UserAvatar avatarUrl={comm.authorAvatar} size="sm" />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white">{comm.authorName}</span>
                          {comm.isOfficial && <span className="text-emerald-400 text-xs">✓</span>}
                          {comm.authorLevel && (
                            <span className="rounded-full bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-black text-amber-400">
                              Nv. {comm.authorLevel}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {comm.authorDistrict && `${comm.authorDistrict} • `}
                          {new Date(comm.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setReplyingTo(comm)}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      Responder
                    </button>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line pl-8">
                    {comm.content}
                  </p>
                </div>

                {/* Respostas Aninhadas (Nível 2) */}
                {comm.replies && comm.replies.length > 0 && (
                  <div className="pl-6 space-y-2 border-l-2 border-emerald-500/30 ml-3">
                    {comm.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="rounded-2xl border border-white/5 bg-slate-950/90 p-3 space-y-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <UserAvatar avatarUrl={reply.authorAvatar} size="xs" />
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white">{reply.authorName}</span>
                            {reply.isOfficial && <span className="text-emerald-400 text-xs">✓</span>}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(reply.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed pl-6">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Formulário de Envio no Fundo */}
        <div className="border-t border-white/10 p-3 sm:p-4 bg-slate-950">
          {errorMsg && (
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-rose-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {replyingTo && (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-300">
              <span className="truncate">A responder a <strong>@{replyingTo.authorUsername}</strong></span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-slate-400 hover:text-white cursor-pointer ml-2"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSendComment} className="flex items-center gap-2">
            <input
              type="text"
              required
              maxLength={400}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={user ? 'Escreve um comentário...' : 'Inicia sessão para comentar...'}
              disabled={!user || isSubmitting}
              className="flex-1 rounded-xl border border-white/15 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-400 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!user || isSubmitting || !newCommentText.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
