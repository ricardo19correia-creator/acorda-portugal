'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  MessageSquare,
  Users,
  Flag,
  Search,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Shield,
  Check,
  X,
  Sparkles,
  AlertCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import {
  type CommunityPost,
  type CommunityComment,
  type CommunityReport,
  type CommunityPostStatus,
  type CommunityCategory,
  COMMUNITY_CATEGORIES,
} from '@/types/community'
import {
  collection,
  doc,
  query,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { UserAvatar } from '@/components/user-avatar'
import { DEFAULT_AVATAR } from '@/lib/avatars'
import { cn } from '@/lib/utils'

interface ComunidadeViewProps {
  getIdToken: () => Promise<string | null>
  adminUser?: any
}

type TabType = 'posts' | 'comments' | 'reports'

export function ComunidadeView({ getIdToken, adminUser }: ComunidadeViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('posts')

  // Lists
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [comments, setComments] = useState<CommunityComment[]>([])
  const [reports, setReports] = useState<CommunityReport[]>([])

  // State
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setNotificationMsg({ text, type })
    setTimeout(() => setNotificationMsg(null), 4000)
  }

  // 1. Escuta em tempo real das publicações
  useEffect(() => {
    setLoading(true)
    const q = query(
      collection(db, 'community_posts'),
      orderBy('createdAt', 'desc'),
      limit(200)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: CommunityPost[] = snapshot.docs.map((d) => ({
          postId: d.id,
          ...(d.data() as any),
        }))
        setPosts(items)
        setLoading(false)
      },
      (err) => {
        console.error('[ADMIN POSTS SNAPSHOT ERROR]', err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // 2. Escuta em tempo real das denúncias
  useEffect(() => {
    const q = query(
      collection(db, 'community_reports'),
      orderBy('createdAt', 'desc'),
      limit(200)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: CommunityReport[] = snapshot.docs.map((d) => ({
          reportId: d.id,
          ...(d.data() as any),
        }))
        setReports(items)
      },
      (err) => {
        console.error('[ADMIN REPORTS SNAPSHOT ERROR]', err)
      }
    )

    return () => unsubscribe()
  }, [])

  // Moderação de Post
  const handleUpdatePostStatus = async (postId: string, status: CommunityPostStatus) => {
    setActionLoadingId(`post_${postId}`)
    try {
      await updateDoc(doc(db, 'community_posts', postId), {
        status,
        updatedAt: new Date().toISOString(),
        moderatedAt: new Date().toISOString(),
      })
      notify(`Publicação marcada como ${status}.`)
    } catch {
      notify('Erro ao moderar.', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Moderação de Comentário
  const handleUpdateCommentStatus = async (
    postId: string,
    commentId: string,
    status: CommunityPostStatus
  ) => {
    setActionLoadingId(`comment_${commentId}`)
    try {
      await updateDoc(doc(db, 'community_posts', postId, 'comments', commentId), {
        status,
        updatedAt: new Date().toISOString(),
        moderatedAt: new Date().toISOString(),
      })
      notify(`Comentário marcado como ${status}.`)
    } catch {
      notify('Erro ao moderar.', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Resolução de Denúncia
  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    setActionLoadingId(`report_${reportId}`)
    try {
      await updateDoc(doc(db, 'community_reports', reportId), {
        status,
        reviewedAt: new Date().toISOString(),
      })
      notify(`Denúncia marcada como ${status}.`)
    } catch {
      notify('Erro ao processar.', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Ação Combinada: Ocultar conteúdo denunciado e resolver denúncia
  const handleModerateReportTarget = async (report: CommunityReport, actionStatus: 'hidden' | 'removed') => {
    setActionLoadingId(`report_target_${report.reportId}`)
    try {
      if (report.targetType === 'post') {
        await updateDoc(doc(db, 'community_posts', report.targetId), {
          status: actionStatus,
          updatedAt: new Date().toISOString(),
        })
      } else if (report.postId) {
        await updateDoc(doc(db, 'community_posts', report.postId, 'comments', report.targetId), {
          status: actionStatus,
          updatedAt: new Date().toISOString(),
        })
      }
      await updateDoc(doc(db, 'community_reports', report.reportId), {
        status: 'resolved',
        reviewedAt: new Date().toISOString(),
      })
      notify(`Conteúdo marcado como ${actionStatus} e denúncia resolvida.`)
    } catch {
      notify('Erro ao moderar denúncia.', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Filtros em memória em tempo real
  const filteredPosts = useMemo(() => {
    let list = [...posts]
    if (statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter)
    }
    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.category === categoryFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (p) =>
          p.message?.toLowerCase().includes(q) ||
          p.authorName?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      )
    }
    return list
  }, [posts, statusFilter, categoryFilter, searchQuery])

  const filteredReports = useMemo(() => {
    let list = [...reports]
    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (r) =>
          r.targetContent?.toLowerCase().includes(q) ||
          r.reason?.toLowerCase().includes(q) ||
          r.reporterName?.toLowerCase().includes(q) ||
          r.targetAuthorName?.toLowerCase().includes(q)
      )
    }
    return list
  }, [reports, statusFilter, searchQuery])

  const filteredComments = useMemo(() => {
    let list = [...comments]
    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (c) =>
          c.message?.toLowerCase().includes(q) ||
          c.authorName?.toLowerCase().includes(q)
      )
    }
    return list
  }, [comments, statusFilter, searchQuery])

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Topo do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Módulo de Moderação</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
            Comunidade
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Consulta, modera e gere publicações, comentários e denúncias da comunidade em tempo real.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin text-emerald-400')} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Notificação Toast Discreta */}
      {notificationMsg && (
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold animate-fadeIn border shadow-lg',
            notificationMsg.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-red-500/15 text-red-400 border-red-500/30'
          )}
        >
          {notificationMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notificationMsg.text}</span>
        </div>
      )}

      {/* Separadores Principais: Publicações | Comentários | Denúncias */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => {
            setActiveTab('posts')
            setStatusFilter('all')
          }}
          className={cn(
            'px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer select-none',
            activeTab === 'posts'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Publicações</span>
          {posts.length > 0 && <span className="text-[10px] font-mono opacity-80">({posts.length})</span>}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('comments')
            setStatusFilter('all')
          }}
          className={cn(
            'px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer select-none',
            activeTab === 'comments'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
          )}
        >
          <Users className="w-4 h-4" />
          <span>Comentários</span>
          {comments.length > 0 && <span className="text-[10px] font-mono opacity-80">({comments.length})</span>}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('reports')
            setStatusFilter('all')
          }}
          className={cn(
            'px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer select-none',
            activeTab === 'reports'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
          )}
        >
          <Flag className="w-4 h-4" />
          <span>Denúncias</span>
          {reports.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">
              {reports.filter((r) => r.status === 'pending').length} pendentes
            </span>
          )}
        </button>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por texto, autor ou palavra-chave..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Filtro de Estado */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="all">Todos os Estados</option>
            {activeTab === 'reports' ? (
              <>
                <option value="pending">Pendentes</option>
                <option value="resolved">Resolvidas</option>
                <option value="dismissed">Descartadas</option>
              </>
            ) : (
              <>
                <option value="published">Publicados (published)</option>
                <option value="hidden">Ocultos (hidden)</option>
                <option value="removed">Removidos (removed)</option>
              </>
            )}
          </select>

          {/* Filtro de Categoria (Apenas para Posts) */}
          {activeTab === 'posts' && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              {Object.values(COMMUNITY_CATEGORIES).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Conteúdo da Tabela / Lista de Itens */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-xs uppercase font-bold tracking-wider">A carregar registos...</span>
        </div>
      ) : activeTab === 'posts' ? (
        /* SEPARADOR 1: PUBLICAÇÕES */
        filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-500" />
            <p className="text-sm font-bold text-white">Nenhuma publicação encontrada</p>
            <p className="text-xs">Não existem publicações correspondentes aos filtros aplicados.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post) => {
              const cat = COMMUNITY_CATEGORIES[post.category] || COMMUNITY_CATEGORIES.sugestao
              const isLoading = actionLoadingId === `post_${post.postId}`

              return (
                <div
                  key={post.postId}
                  className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5 space-y-3 transition-all hover:border-white/20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        src={post.authorAvatar || DEFAULT_AVATAR}
                        name={post.authorName}
                        size="sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{post.authorName}</span>
                          <span
                            className={cn(
                              'text-[10px] font-black uppercase px-2 py-0.5 rounded-full border',
                              cat.bg,
                              cat.border,
                              cat.color
                            )}
                          >
                            {cat.emoji} {cat.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {new Date(post.createdAt).toLocaleString('pt-PT')} • UID: {post.userId}
                        </p>
                      </div>
                    </div>

                    {/* Badge de Estado */}
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-[11px] font-black uppercase px-2.5 py-1 rounded-full border',
                          post.status === 'published' && 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                          post.status === 'hidden' && 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                          post.status === 'removed' && 'bg-red-500/15 text-red-400 border-red-500/30'
                        )}
                      >
                        {post.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed pl-1">
                    {post.message}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <span>❤️ {post.likesCount || 0} gostos</span>
                      <span>💬 {post.commentsCount || 0} comentários</span>
                    </div>

                    {/* Ações de Moderação */}
                    <div className="flex items-center gap-2">
                      {post.status !== 'published' && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleUpdatePostStatus(post.postId, 'published')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 font-bold text-[11px] uppercase transition-all cursor-pointer"
                        >
                          Restaurar
                        </button>
                      )}

                      {post.status !== 'hidden' && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleUpdatePostStatus(post.postId, 'hidden')}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 font-bold text-[11px] uppercase transition-all cursor-pointer"
                        >
                          Ocultar
                        </button>
                      )}

                      {post.status !== 'removed' && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleUpdatePostStatus(post.postId, 'removed')}
                          className="px-3 py-1.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 font-bold text-[11px] uppercase transition-all cursor-pointer"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : activeTab === 'comments' ? (
        /* SEPARADOR 2: COMENTÁRIOS */
        filteredComments.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-500" />
            <p className="text-sm font-bold text-white">Nenhum comentário encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredComments.map((comment) => {
              const isLoading = actionLoadingId === `comment_${comment.commentId}`

              return (
                <div
                  key={comment.commentId}
                  className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        src={comment.authorAvatar || DEFAULT_AVATAR}
                        name={comment.authorName}
                        size="xs"
                      />
                      <div>
                        <span className="text-xs font-bold text-white">{comment.authorName}</span>
                        <p className="text-[10px] text-slate-400">
                          {new Date(comment.createdAt).toLocaleString('pt-PT')} • Post: {comment.postId}
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-[10px] font-black uppercase px-2 py-0.5 rounded-full border',
                        comment.status === 'published' && 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                        comment.status === 'hidden' && 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                        comment.status === 'removed' && 'bg-red-500/15 text-red-400 border-red-500/30'
                      )}
                    >
                      {comment.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed pl-1">{comment.message}</p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                    {comment.status !== 'published' && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          handleUpdateCommentStatus(comment.postId, comment.commentId, 'published')
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold text-[10px] uppercase border border-emerald-500/30 cursor-pointer"
                      >
                        Restaurar
                      </button>
                    )}
                    {comment.status !== 'hidden' && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          handleUpdateCommentStatus(comment.postId, comment.commentId, 'hidden')
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-bold text-[10px] uppercase border border-amber-500/30 cursor-pointer"
                      >
                        Ocultar
                      </button>
                    )}
                    {comment.status !== 'removed' && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          handleUpdateCommentStatus(comment.postId, comment.commentId, 'removed')
                        }
                        className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 font-bold text-[10px] uppercase border border-red-500/30 cursor-pointer"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* SEPARADOR 3: DENÚNCIAS */
        filteredReports.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center text-slate-400 space-y-2">
            <Flag className="w-8 h-8 mx-auto text-slate-500" />
            <p className="text-sm font-bold text-white">Nenhuma denúncia registada</p>
            <p className="text-xs">A comunidade encontra-se saudável e sem relatórios pendentes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const isLoading =
                actionLoadingId === `report_${report.reportId}` ||
                actionLoadingId === `report_target_${report.reportId}`

              return (
                <div
                  key={report.reportId}
                  className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                        {report.targetType === 'post' ? 'Publicação' : 'Comentário'}
                      </span>
                      <span className="text-xs font-bold text-white">Motivo: {report.reason}</span>
                    </div>

                    <span
                      className={cn(
                        'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border self-start sm:self-auto',
                        report.status === 'pending' && 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                        report.status === 'resolved' && 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                        report.status === 'dismissed' && 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
                      )}
                    >
                      {report.status}
                    </span>
                  </div>

                  {report.targetContent && (
                    <div className="rounded-xl bg-slate-950 p-3 text-xs text-slate-300 italic border border-white/5">
                      "{report.targetContent}"
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                    <div>
                      Denunciado por: <span className="text-white font-bold">{report.reporterName || report.reporterId}</span> •{' '}
                      {new Date(report.createdAt).toLocaleString('pt-PT')}
                    </div>

                    {/* Ações de Moderação da Denúncia */}
                    <div className="flex flex-wrap items-center gap-2">
                      {report.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleModerateReportTarget(report, 'hidden')}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 font-bold text-[10px] uppercase transition-all cursor-pointer"
                          >
                            Ocultar Conteúdo
                          </button>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleModerateReportTarget(report, 'removed')}
                            className="px-3 py-1.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 font-bold text-[10px] uppercase transition-all cursor-pointer"
                          >
                            Remover Conteúdo
                          </button>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleResolveReport(report.reportId, 'dismissed')}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-[10px] uppercase transition-all cursor-pointer"
                          >
                            Descartar
                          </button>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleResolveReport(report.reportId, 'resolved')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 font-bold text-[10px] uppercase transition-all cursor-pointer"
                          >
                            Resolver
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
