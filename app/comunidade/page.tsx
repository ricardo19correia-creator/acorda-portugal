'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  Heart,
  MoreVertical,
  Send,
  Sparkles,
  Edit2,
  Trash2,
  Flag,
  AlertCircle,
  CheckCircle2,
  LogIn,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Share2,
  Shield,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  increment,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { handleGoogleLogin } from '@/lib/auth-helpers'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackgroundFx } from '@/components/background-fx'
import { UserAvatar } from '@/components/user-avatar'
import { DEFAULT_AVATAR } from '@/lib/avatars'
import {
  type CommunityCategory,
  type CommunityPost,
  type CommunityComment,
  type ReportReason,
  COMMUNITY_CATEGORIES,
  REPORT_REASONS,
} from '@/types/community'
import { cn } from '@/lib/utils'

// Formatador amigável em Português para datas relativas
function formatTimeAgo(dateInput: any): string {
  if (!dateInput) return 'agora mesmo'
  let date: Date
  if (typeof dateInput === 'string' || typeof dateInput === 'number') {
    date = new Date(dateInput)
  } else if (dateInput && typeof dateInput.toDate === 'function') {
    date = dateInput.toDate()
  } else {
    date = new Date(dateInput)
  }

  if (isNaN(date.getTime())) return 'recentemente'

  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 45) return 'agora mesmo'
  if (diffSec < 90) return 'há 1 min'

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `há ${diffMin} min`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `há ${diffHours} h`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'ontem'
  if (diffDays < 7) return `há ${diffDays} dias`

  return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
}

export default function ComunidadePage() {
  const { user, profile, authResolved } = useAuth()

  // Feed State
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [postsLimit, setPostsLimit] = useState(30)
  const [hasMore, setHasMore] = useState(false)

  // Creation State
  const [newMessage, setNewMessage] = useState('')
  const [newCategory, setNewCategory] = useState<CommunityCategory>('sugestao')
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  // Expanded comments by post ID
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(new Set())

  // Comments cache: { [postId]: CommunityComment[] }
  const [commentsMap, setCommentsMap] = useState<Record<string, CommunityComment[]>>({})
  const [loadingCommentsMap, setLoadingCommentsMap] = useState<Record<string, boolean>>({})
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [submittingCommentMap, setSubmittingCommentMap] = useState<Record<string, boolean>>({})

  // User likes cache: { [postId]: boolean }
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({})

  // Modals
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null)
  const [activeMenuCommentId, setActiveMenuCommentId] = useState<string | null>(null)

  // Edit Post Modal
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null)
  const [editPostMessage, setEditPostMessage] = useState('')
  const [editPostCategory, setEditPostCategory] = useState<CommunityCategory>('sugestao')
  const [isSavingPostEdit, setIsSavingPostEdit] = useState(false)

  // Edit Comment Modal
  const [editingComment, setEditingComment] = useState<CommunityComment | null>(null)
  const [editCommentMessage, setEditCommentMessage] = useState('')
  const [isSavingCommentEdit, setIsSavingCommentEdit] = useState(false)

  // Delete Confirm Modal
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'post' | 'comment'
    postId: string
    commentId?: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Report Modal
  const [reportingTarget, setReportingTarget] = useState<{
    targetType: 'post' | 'comment'
    targetId: string
    postId: string
    content: string
    authorName: string
  } | null>(null)
  const [reportReason, setReportReason] = useState<ReportReason>('Conteúdo inadequado')
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [reportFeedback, setReportFeedback] = useState<string | null>(null)

  // Auth prompt modal
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Helper para obter o Firebase ID Token
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null
    try {
      return await user.getIdToken(false)
    } catch {
      return null
    }
  }, [user])

  // 1. Escuta em tempo real do Feed de publicações
  useEffect(() => {
    setLoading(true)
    setError(null)

    try {
      const q = query(
        collection(db, 'community_posts'),
        orderBy('createdAt', 'desc'),
        limit(postsLimit)
      )

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedPosts: CommunityPost[] = snapshot.docs
            .map((d) => ({
              postId: d.id,
              ...(d.data() as any),
            }))
            .filter((p) => p.status === 'published')
          setPosts(fetchedPosts)
          setHasMore(snapshot.docs.length >= postsLimit)
          setLoading(false)
        },
        (err) => {
          console.error('[COMMUNITY FEED SNAPSHOT ERROR]', err)
          setError('Não foi possível carregar as publicações da comunidade em tempo real.')
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err: any) {
      console.error('[COMMUNITY INITIALIZATION ERROR]', err)
      setError('Erro de ligação ao feed.')
      setLoading(false)
    }
  }, [postsLimit])

  // 2. Escuta em tempo real dos comentários para publicações abertas
  useEffect(() => {
    const unsubscribes: Array<() => void> = []

    expandedPostIds.forEach((postId) => {
      setLoadingCommentsMap((prev) => ({ ...prev, [postId]: true }))
      try {
        const commentsQuery = query(
          collection(db, 'community_posts', postId, 'comments'),
          orderBy('createdAt', 'asc'),
          limit(100)
        )

        const unsub = onSnapshot(
          commentsQuery,
          (snapshot) => {
            const comments: CommunityComment[] = snapshot.docs
              .map((d) => ({
                commentId: d.id,
                postId,
                ...(d.data() as any),
              }))
              .filter((c) => c.status === 'published')
            setCommentsMap((prev) => ({ ...prev, [postId]: comments }))
            setLoadingCommentsMap((prev) => ({ ...prev, [postId]: false }))
          },
          (err) => {
            console.error(`[COMMENTS SNAPSHOT ERROR ${postId}]`, err)
            setLoadingCommentsMap((prev) => ({ ...prev, [postId]: false }))
          }
        )

        unsubscribes.push(unsub)
      } catch (e) {
        setLoadingCommentsMap((prev) => ({ ...prev, [postId]: false }))
      }
    })

    return () => {
      unsubscribes.forEach((fn) => fn())
    }
  }, [expandedPostIds])

  // 3. Escuta em tempo real dos likes do utilizador autenticado
  useEffect(() => {
    if (!user || posts.length === 0) {
      setUserLikes({})
      return
    }

    const unsubscribes: Array<() => void> = []

    // Escutar likes apenas para os posts exibidos no ecrã
    posts.forEach((post) => {
      try {
        const likeRef = query(
          collection(db, 'community_posts', post.postId, 'likes'),
          where('__name__', '==', user.uid)
        )

        const unsub = onSnapshot(likeRef, (snap) => {
          setUserLikes((prev) => ({
            ...prev,
            [post.postId]: !snap.empty,
          }))
        })

        unsubscribes.push(unsub)
      } catch {}
    })

    return () => {
      unsubscribes.forEach((fn) => fn())
    }
  }, [user, posts])

  // Filtragem local por categoria
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') return posts
    return posts.filter((p) => p.category === selectedCategory)
  }, [posts, selectedCategory])

  // Ação: Publicar nova mensagem
  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setShowAuthModal(true)
      return
    }

    const trimmed = newMessage.trim()
    if (trimmed.length < 2) {
      setPublishError('A mensagem tem de conter pelo menos 2 caracteres.')
      return
    }

    setIsPublishing(true)
    setPublishError(null)

    try {
      const docRef = doc(collection(db, 'community_posts'))
      const now = new Date().toISOString()
      const postData: CommunityPost = {
        postId: docRef.id,
        userId: user.uid,
        authorName: profile?.displayName || profile?.username || user.displayName || 'Explorador',
        authorAvatar: profile?.equipped?.avatar || profile?.avatar || user.photoURL || DEFAULT_AVATAR,
        message: trimmed,
        category: newCategory,
        createdAt: now,
        updatedAt: now,
        likesCount: 0,
        commentsCount: 0,
        status: 'published',
        isEdited: false,
      }

      await setDoc(docRef, postData)

      // Limpar formulário após confirmação de sucesso
      setNewMessage('')
      setPublishSuccess(true)
      setTimeout(() => setPublishSuccess(false), 4000)
    } catch (err: any) {
      console.error('[PUBLISH ERROR]', err)
      setPublishError(err?.message || 'Não foi possível publicar. Tenta novamente.')
    } finally {
      setIsPublishing(false)
    }
  }

  // Ação: Gostar de uma publicação
  const handleToggleLike = async (postId: string) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    // Atualização otimista imediata
    const currentlyLiked = userLikes[postId] || false
    setUserLikes((prev) => ({ ...prev, [postId]: !currentlyLiked }))
    setPosts((prev) =>
      prev.map((p) =>
        p.postId === postId
          ? {
              ...p,
              likesCount: Math.max(0, p.likesCount + (currentlyLiked ? -1 : 1)),
            }
          : p
      )
    )

    try {
      const likeRef = doc(db, 'community_posts', postId, 'likes', user.uid)
      const postRef = doc(db, 'community_posts', postId)
      if (currentlyLiked) {
        await deleteDoc(likeRef)
        await updateDoc(postRef, { likesCount: increment(-1) })
      } else {
        await setDoc(likeRef, { userId: user.uid, createdAt: new Date().toISOString() })
        await updateDoc(postRef, { likesCount: increment(1) })
      }
    } catch (err) {
      console.error('[LIKE ERROR]', err)
      setUserLikes((prev) => ({ ...prev, [postId]: currentlyLiked }))
    }
  }

  // Ação: Toggle expandir comentários
  const toggleComments = (postId: string) => {
    setExpandedPostIds((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })
  }

  // Ação: Publicar comentário
  const handleAddComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setShowAuthModal(true)
      return
    }

    const commentText = (commentInputs[postId] || '').trim()
    if (!commentText) return

    setSubmittingCommentMap((prev) => ({ ...prev, [postId]: true }))

    try {
      const postRef = doc(db, 'community_posts', postId)
      const commentRef = doc(collection(db, 'community_posts', postId, 'comments'))
      const now = new Date().toISOString()
      const commentData: CommunityComment = {
        commentId: commentRef.id,
        postId,
        userId: user.uid,
        authorName: profile?.displayName || profile?.username || user.displayName || 'Explorador',
        authorAvatar: profile?.equipped?.avatar || profile?.avatar || user.photoURL || DEFAULT_AVATAR,
        message: commentText,
        createdAt: now,
        updatedAt: now,
        status: 'published',
        isEdited: false,
      }
      await setDoc(commentRef, commentData)
      await updateDoc(postRef, { commentsCount: increment(1) })

      // Limpar campo após confirmação
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
    } catch (err: any) {
      console.error('[COMMENT ERROR]', err)
      alert(err?.message || 'Não foi possível enviar o comentário. O teu texto foi mantido.')
    } finally {
      setSubmittingCommentMap((prev) => ({ ...prev, [postId]: false }))
    }
  }

  // Ação: Salvar Edição do Post
  const handleSavePostEdit = async () => {
    if (!editingPost || !user) return
    const trimmed = editPostMessage.trim()
    if (trimmed.length < 2) return

    setIsSavingPostEdit(true)
    try {
      await updateDoc(doc(db, 'community_posts', editingPost.postId), {
        message: trimmed,
        category: editPostCategory,
        updatedAt: new Date().toISOString(),
        isEdited: true,
      })
      setEditingPost(null)
    } catch (err: any) {
      alert(err?.message || 'Falha ao editar a publicação.')
    } finally {
      setIsSavingPostEdit(false)
    }
  }

  // Ação: Salvar Edição de Comentário
  const handleSaveCommentEdit = async () => {
    if (!editingComment || !user) return
    const trimmed = editCommentMessage.trim()
    if (!trimmed) return

    setIsSavingCommentEdit(true)
    try {
      await updateDoc(
        doc(db, 'community_posts', editingComment.postId, 'comments', editingComment.commentId),
        {
          message: trimmed,
          updatedAt: new Date().toISOString(),
          isEdited: true,
        }
      )
      setEditingComment(null)
    } catch (err: any) {
      alert(err?.message || 'Falha ao editar o comentário.')
    } finally {
      setIsSavingCommentEdit(false)
    }
  }

  // Ação: Confirmar Eliminação
  const handleConfirmDelete = async () => {
    if (!itemToDelete || !user) return
    setIsDeleting(true)

    try {
      if (itemToDelete.type === 'post') {
        await updateDoc(doc(db, 'community_posts', itemToDelete.postId), {
          status: 'removed',
          updatedAt: new Date().toISOString(),
        })
      } else if (itemToDelete.commentId) {
        await updateDoc(
          doc(db, 'community_posts', itemToDelete.postId, 'comments', itemToDelete.commentId),
          {
            status: 'removed',
            updatedAt: new Date().toISOString(),
          }
        )
        await updateDoc(doc(db, 'community_posts', itemToDelete.postId), {
          commentsCount: increment(-1),
        })
      }
      setItemToDelete(null)
    } catch (err: any) {
      alert(err?.message || 'Não foi possível apagar o item.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Ação: Submeter Denúncia
  const handleSubmitReport = async () => {
    if (!reportingTarget || !user) return
    setIsSubmittingReport(true)
    setReportFeedback(null)

    try {
      const reportRef = doc(collection(db, 'community_reports'))
      await setDoc(reportRef, {
        reportId: reportRef.id,
        reporterId: user.uid,
        reporterName: profile?.displayName || profile?.username || user.displayName || 'Utilizador',
        targetType: reportingTarget.targetType,
        targetId: reportingTarget.targetId,
        postId: reportingTarget.postId,
        reason: reportReason,
        targetContent: reportingTarget.content,
        targetAuthorName: reportingTarget.authorName,
        createdAt: new Date().toISOString(),
        status: 'pending',
      })

      setReportFeedback('Denúncia enviada com sucesso. Obrigado por manteres a comunidade segura.')
      setTimeout(() => {
        setReportingTarget(null)
        setReportFeedback(null)
      }, 2000)
    } catch (err: any) {
      setReportFeedback(err?.message || 'Falha ao enviar denúncia.')
    } finally {
      setIsSubmittingReport(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 font-sans antialiased relative">
      <BackgroundFx />
      <SiteHeader />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Cabeçalho da Comunidade */}
        <div className="text-center mb-8 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comunidade</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            Comunidade
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-medium">
            Partilha ideias, sugestões, opiniões e problemas com a comunidade.
          </p>
        </div>

        {/* Caixa de Publicação (Topo da Página) */}
        <div className="mb-8 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 shadow-2xl shadow-black/40">
          {user ? (
            <form onSubmit={handlePublishPost} className="space-y-4">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={profile?.equipped?.avatar || profile?.avatar || user.photoURL || DEFAULT_AVATAR}
                  name={profile?.displayName || profile?.username || user.displayName || 'Tu'}
                  size="sm"
                  className="ring-2 ring-emerald-500/30"
                />
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    O que queres partilhar?
                  </h3>
                  <p className="text-xs text-slate-400">
                    A tua mensagem será visível para todos os membros da comunidade.
                  </p>
                </div>
              </div>

              {/* Seletor de Categoria */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Categoria
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(COMMUNITY_CATEGORIES).map((cat) => {
                    const isSelected = newCategory === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewCategory(cat.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer select-none active:scale-95',
                          isSelected
                            ? `${cat.bg} ${cat.border} ${cat.color} ring-1 ring-white/20 shadow-md`
                            : 'bg-slate-800/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
                        )}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Campo de Texto */}
              <div className="relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escreve a tua mensagem..."
                  rows={3}
                  maxLength={2500}
                  className="w-full rounded-2xl bg-slate-950/80 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-y min-h-[90px]"
                />
                <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-slate-500">
                  {newMessage.length}/2500
                </span>
              </div>

              {/* Mensagens de Feedback */}
              {publishError && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-xl animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{publishError}</span>
                </div>
              )}

              {publishSuccess && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Publicado na comunidade com sucesso!</span>
                </div>
              )}

              {/* Barra de Ação */}
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Respeita as regras de convivência e a comunidade.
                </p>
                <button
                  type="submit"
                  disabled={isPublishing || newMessage.trim().length < 2}
                  className="ml-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:pointer-events-none text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer min-h-[44px]"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>A publicar...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publicar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 text-center sm:text-left">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Queres partilhar algo com a comunidade?
                </h3>
                <p className="text-xs text-slate-400">
                  Inicia sessão para publicar mensagens, comentar e dar gosto nas publicações.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleGoogleLogin('/comunidade')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer shrink-0 min-h-[44px]"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sessão</span>
              </button>
            </div>
          )}
        </div>

        {/* Barra de Filtros por Categoria */}
        <div className="mb-6 flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'px-4 py-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer select-none',
                selectedCategory === 'all'
                  ? 'bg-white text-slate-950 border-white shadow-md'
                  : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white hover:bg-slate-800'
              )}
            >
              Todas ({posts.length})
            </button>
            {Object.values(COMMUNITY_CATEGORIES).map((cat) => {
              const count = posts.filter((p) => p.category === cat.id).length
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer select-none',
                    isSelected
                      ? `${cat.bg} ${cat.border} ${cat.color} ring-1 ring-white/20 shadow-md`
                      : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  {count > 0 && <span className="opacity-70 font-mono text-[10px]">({count})</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* FEED PÚBLICO */}
        <div className="space-y-4">
          {loading ? (
            // Skeleton Loader
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-white/5 bg-slate-900/50 p-6 animate-pulse space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800" />
                    <div className="space-y-2 flex-1">
                      <div className="w-32 h-3.5 bg-slate-800 rounded" />
                      <div className="w-20 h-2.5 bg-slate-800/60 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-slate-800/80 rounded" />
                    <div className="w-4/5 h-3 bg-slate-800/80 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Erro com Retry
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Não foi possível carregar a Comunidade</h3>
                <p className="text-xs text-slate-400">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setPostsLimit((n) => n)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tentar Novamente</span>
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            // Estado Vazio Oficial
            <div className="rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white tracking-wide">
                Ainda não existem publicações.
              </h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Sê o primeiro a partilhar alguma coisa com a comunidade.
              </p>
            </div>
          ) : (
            // Lista de Publicações
            filteredPosts.map((post) => {
              const cat = COMMUNITY_CATEGORIES[post.category] || COMMUNITY_CATEGORIES.sugestao
              const isLiked = userLikes[post.postId] || false
              const isExpanded = expandedPostIds.has(post.postId)
              const comments = commentsMap[post.postId] || []
              const isLoadingComments = loadingCommentsMap[post.postId] || false
              const isAuthor = user?.uid === post.userId
              const isMenuOpen = activeMenuPostId === post.postId

              return (
                <article
                  key={post.postId}
                  className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl transition-all hover:border-white/20 relative"
                >
                  {/* Topo do Card: Autor + Categoria + Data + Menu */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar
                        src={post.authorAvatar || DEFAULT_AVATAR}
                        name={post.authorName}
                        size="sm"
                        className="ring-1 ring-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white truncate max-w-[160px] sm:max-w-xs">
                            {post.authorName}
                          </span>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border',
                              cat.bg,
                              cat.border,
                              cat.color
                            )}
                          >
                            <span>{cat.emoji}</span>
                            <span>{cat.label}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <span>{formatTimeAgo(post.createdAt)}</span>
                          {post.isEdited && (
                            <>
                              <span>·</span>
                              <span className="text-slate-500 italic">editado</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu de Opções ⋮ */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveMenuPostId(isMenuOpen ? null : post.postId)}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
                        aria-label="Opções"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div
                          className="absolute right-0 top-full mt-1 w-44 rounded-2xl bg-slate-900/95 border border-white/15 p-1.5 shadow-2xl backdrop-blur-xl z-30 animate-fadeIn"
                          onMouseLeave={() => setActiveMenuPostId(null)}
                        >
                          {isAuthor ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPost(post)
                                  setEditPostMessage(post.message)
                                  setEditPostCategory(post.category)
                                  setActiveMenuPostId(null)
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-left"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setItemToDelete({
                                    type: 'post',
                                    postId: post.postId,
                                  })
                                  setActiveMenuPostId(null)
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer text-left"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Apagar</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setReportingTarget({
                                  targetType: 'post',
                                  targetId: post.postId,
                                  postId: post.postId,
                                  content: post.message,
                                  authorName: post.authorName,
                                })
                                setActiveMenuPostId(null)
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-left"
                            >
                              <Flag className="w-3.5 h-3.5 text-red-400" />
                              <span>Denunciar</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Texto da Mensagem */}
                  <div className="text-sm sm:text-base text-slate-200 whitespace-pre-line leading-relaxed mb-4 pl-1">
                    {post.message}
                  </div>

                  {/* Barra de Interação: Gostos e Comentários */}
                  <div className="flex items-center gap-4 pt-3 border-t border-white/5 select-none">
                    {/* Botão de Gostos ♡ / ♥ */}
                    <button
                      type="button"
                      onClick={() => handleToggleLike(post.postId)}
                      className={cn(
                        'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95',
                        isLiked
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
                      )}
                    >
                      <Heart
                        className={cn(
                          'w-4 h-4 transition-transform',
                          isLiked && 'fill-current text-rose-500 scale-110'
                        )}
                      />
                      <span>{post.likesCount || 0}</span>
                    </button>

                    {/* Botão de Comentários 💬 */}
                    <button
                      type="button"
                      onClick={() => toggleComments(post.postId)}
                      className={cn(
                        'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95',
                        isExpanded
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
                      )}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentsCount || 0}</span>
                      <span className="hidden sm:inline">Comentários</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 ml-1" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 ml-1" />
                      )}
                    </button>
                  </div>

                  {/* ÁREA DE COMENTÁRIOS EXPANSÍVEL */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-fadeIn">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Comentários ({comments.length})</span>
                      </h4>

                      {/* Lista de Comentários Existentes */}
                      {isLoadingComments ? (
                        <div className="flex items-center justify-center py-4 text-xs text-slate-500 gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                          <span>A carregar comentários...</span>
                        </div>
                      ) : comments.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-2">
                          Ainda não existem comentários. Sê o primeiro a responder!
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {comments.map((comment) => {
                            const isCommentAuthor = user?.uid === comment.userId
                            const isCommentMenuOpen = activeMenuCommentId === comment.commentId

                            return (
                              <div
                                key={comment.commentId}
                                className="rounded-2xl bg-slate-950/60 border border-white/5 p-3.5 space-y-2 relative"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <UserAvatar
                                      src={comment.authorAvatar || DEFAULT_AVATAR}
                                      name={comment.authorName}
                                      size="xs"
                                      className="ring-1 ring-white/10 shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <span className="text-xs font-bold text-white truncate block">
                                        {comment.authorName}
                                      </span>
                                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                        <span>{formatTimeAgo(comment.createdAt)}</span>
                                        {comment.isEdited && (
                                          <>
                                            <span>·</span>
                                            <span className="text-slate-500 italic">editado</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Menu ⋮ do Comentário */}
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActiveMenuCommentId(
                                          isCommentMenuOpen ? null : comment.commentId
                                        )
                                      }
                                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                                    >
                                      <MoreVertical className="w-3.5 h-3.5" />
                                    </button>

                                    {isCommentMenuOpen && (
                                      <div
                                        className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-slate-900/95 border border-white/15 p-1 shadow-2xl backdrop-blur-xl z-30 animate-fadeIn"
                                        onMouseLeave={() => setActiveMenuCommentId(null)}
                                      >
                                        {isCommentAuthor ? (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setEditingComment(comment)
                                                setEditCommentMessage(comment.message)
                                                setActiveMenuCommentId(null)
                                              }}
                                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer text-left"
                                            >
                                              <Edit2 className="w-3 h-3 text-amber-400" />
                                              <span>Editar</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setItemToDelete({
                                                  type: 'comment',
                                                  postId: post.postId,
                                                  commentId: comment.commentId,
                                                })
                                                setActiveMenuCommentId(null)
                                              }}
                                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer text-left"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                              <span>Apagar</span>
                                            </button>
                                          </>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setReportingTarget({
                                                targetType: 'comment',
                                                targetId: comment.commentId,
                                                postId: post.postId,
                                                content: comment.message,
                                                authorName: comment.authorName,
                                              })
                                              setActiveMenuCommentId(null)
                                            }}
                                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg cursor-pointer text-left"
                                          >
                                            <Flag className="w-3 h-3 text-red-400" />
                                            <span>Denunciar</span>
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <p className="text-xs sm:text-sm text-slate-300 pl-1 leading-relaxed whitespace-pre-line">
                                  {comment.message}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Campo para Escrever Comentário */}
                      {user ? (
                        <form
                          onSubmit={(e) => handleAddComment(post.postId, e)}
                          className="flex items-center gap-2 pt-2"
                        >
                          <input
                            type="text"
                            value={commentInputs[post.postId] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post.postId]: e.target.value,
                              }))
                            }
                            placeholder="Escreve um comentário..."
                            maxLength={1000}
                            className="flex-1 rounded-2xl bg-slate-950/80 border border-white/10 px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                          />
                          <button
                            type="submit"
                            disabled={
                              submittingCommentMap[post.postId] ||
                              !(commentInputs[post.postId] || '').trim()
                            }
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:pointer-events-none text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer shrink-0 min-h-[40px]"
                          >
                            {submittingCommentMap[post.postId] ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-3 h-3" />
                                <span>Publicar</span>
                              </>
                            )}
                          </button>
                        </form>
                      ) : (
                        <div className="rounded-2xl bg-slate-950/40 border border-white/5 p-3 text-center">
                          <p className="text-xs text-slate-400">
                            Inicia sessão para comentar nesta publicação.{' '}
                            <button
                              type="button"
                              onClick={() => handleGoogleLogin('/comunidade')}
                              className="text-emerald-400 font-bold hover:underline ml-1 cursor-pointer"
                            >
                              Entrar agora
                            </button>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )
            })
          )}

          {/* Botão Carregar Mais */}
          {hasMore && !loading && (
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setPostsLimit((prev) => prev + 20)}
                className="px-6 py-2.5 rounded-2xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Carregar mais publicações
              </button>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: EDITAR PUBLICAÇÃO */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>Editar Publicação</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Categoria</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(COMMUNITY_CATEGORIES).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setEditPostCategory(cat.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer',
                      editPostCategory === cat.id
                        ? `${cat.bg} ${cat.border} ${cat.color} ring-1 ring-white/20`
                        : 'bg-slate-800 border-white/5 text-slate-400'
                    )}
                  >
                    <span>{cat.emoji}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Mensagem</label>
              <textarea
                value={editPostMessage}
                onChange={(e) => setEditPostMessage(e.target.value)}
                rows={4}
                maxLength={2500}
                className="w-full rounded-2xl bg-slate-950 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/60 transition-all resize-y"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePostEdit}
                disabled={isSavingPostEdit || editPostMessage.trim().length < 2}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSavingPostEdit ? 'A guardar...' : 'Guardar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR COMENTÁRIO */}
      {editingComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>Editar Comentário</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingComment(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={editCommentMessage}
              onChange={(e) => setEditCommentMessage(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full rounded-2xl bg-slate-950 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/60 transition-all resize-y"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingComment(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCommentEdit}
                disabled={isSavingCommentEdit || !editCommentMessage.trim()}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSavingCommentEdit ? 'A guardar...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINAÇÃO */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {itemToDelete.type === 'post'
                  ? 'Apagar esta publicação?'
                  : 'Apagar este comentário?'}
              </h3>
              <p className="text-xs text-slate-400">
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'A apagar...' : 'Apagar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DENÚNCIA */}
      {reportingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-400" />
                <span>Denunciar Conteúdo</span>
              </h3>
              <button
                type="button"
                onClick={() => setReportingTarget(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 text-xs text-slate-400 line-clamp-3 italic border border-white/5">
              "{reportingTarget.content}"
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">Motivo da denúncia</label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all text-xs',
                      reportReason === r
                        ? 'bg-red-500/10 border-red-500/30 text-white font-bold'
                        : 'bg-slate-950/60 border-white/5 text-slate-400 hover:bg-slate-800'
                    )}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      checked={reportReason === r}
                      onChange={() => setReportReason(r)}
                      className="accent-red-500"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {reportFeedback && (
              <div className="text-xs font-bold text-center p-2 rounded-xl bg-slate-800 text-emerald-400 border border-emerald-500/20">
                {reportFeedback}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReportingTarget(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={isSubmittingReport}
                className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingReport ? 'A enviar...' : 'Enviar Denúncia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SESSÃO NECESSÁRIA */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <LogIn className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Inicia Sessão</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Precisas de ter sessão iniciada para publicar, comentar ou dar gosto na Comunidade.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleGoogleLogin('/comunidade')}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                Iniciar Sessão com Google
              </button>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Continuar a Ver
              </button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  )
}
