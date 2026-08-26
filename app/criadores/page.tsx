'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Sparkles,
  Search,
  PenSquare,
  Plus,
  Flame,
  Clock,
  Heart,
  MessageSquare,
  Award,
  TrendingUp,
  MapPin,
  Filter,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CreatorsHero } from '@/components/creators/CreatorsHero'
import { CreatorsCategoriesBar } from '@/components/creators/CreatorsCategoriesBar'
import { CreatorPostCard } from '@/components/creators/CreatorPostCard'
import { CreatePostModal } from '@/components/creators/CreatePostModal'
import { CreatorsCommentsDrawer } from '@/components/creators/CreatorsCommentsDrawer'
import { CreatorsSidebar } from '@/components/creators/CreatorsSidebar'
import { ReportPostModal } from '@/components/creators/ReportPostModal'
import {
  getCreatorPosts,
  createCreatorPost,
  togglePostLike,
  togglePostSave,
  voteOnPoll,
  voteOnSuggestion,
} from '@/lib/creators-service'
import type { CreatorPost, CreatorCategorySlug } from '@/src/types/creators'
import { VALID_DISTRICTS } from '@/data/districts'
import { cn } from '@/lib/utils'

export default function CriadoresPage() {
  const [posts, setPosts] = useState<CreatorPost[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros de Feed
  const [selectedCategory, setSelectedCategory] = useState<CreatorCategorySlug | 'todas'>('todas')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Todos os Distritos')
  const [sortBy, setSortBy] = useState<'destaques' | 'recentes' | 'populares' | 'comentadas' | 'tendencias'>('destaques')
  const [searchQuery, setSearchQuery] = useState('')

  // Modais e Gavetas
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeCommentPost, setActiveCommentPost] = useState<CreatorPost | null>(null)
  const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState(false)
  const [activeReportPost, setActiveReportPost] = useState<CreatorPost | null>(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Carregamento de Publicações
  const loadPosts = async () => {
    setLoading(true)
    try {
      const data = await getCreatorPosts({
        category: selectedCategory,
        district: selectedDistrict,
        sortBy,
        searchQuery,
      })
      setPosts(data)
    } catch (err) {
      console.error('[CREATORS] Erro ao carregar posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [selectedCategory, selectedDistrict, sortBy, searchQuery])

  // Contadores por Categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todas: posts.length }
    posts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1
      if (p.isFeatured || Boolean(p.highlightBadge)) {
        counts['destaques'] = (counts['destaques'] || 0) + 1
      }
    })
    return counts
  }, [posts])

  // Handlers de Interação
  const handleLike = async (postId: string) => {
    try {
      const { liked, newCount } = await togglePostLike(postId)
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, hasLiked: liked, likesCount: newCount } : p)),
      )
      if (liked) {
        showToast('Gosto registado! ❤️')
      }
    } catch (e) {}
  }

  const handleSave = (postId: string) => {
    const isSaved = togglePostSave(postId)
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, hasSaved: isSaved } : p)),
    )
    showToast(isSaved ? 'Publicação guardada nos favoritos! 🔖' : 'Removido dos favoritos.')
  }

  const handleOpenComments = (post: CreatorPost) => {
    setActiveCommentPost(post)
    setIsCommentsDrawerOpen(true)
  }

  const handleCommentAdded = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p)),
    )
    showToast('Comentário publicado! 💬')
  }

  const handleVotePoll = async (postId: string, optionId: string) => {
    const updatedPost = await voteOnPoll(postId, optionId)
    if (updatedPost) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)))
      showToast('Voto no debate registado! 🔥')
    }
  }

  const handleVoteSuggestion = (postId: string, vote: 'up' | 'down') => {
    const { upvotes, downvotes } = voteOnSuggestion(postId, vote)
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              upvotesCount: upvotes,
              downvotesCount: downvotes,
              userVote: p.userVote === vote ? null : vote,
            }
          : p,
      ),
    )
    showToast(vote === 'up' ? 'Apoiado! 👍' : 'Voto registado. 👎')
  }

  const handleReport = (post: CreatorPost) => {
    setActiveReportPost(post)
    setIsReportModalOpen(true)
  }

  const handlePostCreated = (newPost: CreatorPost) => {
    setPosts((prev) => [newPost, ...prev])
    showToast('Publicação criada com sucesso! 🇵🇹')
  }

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col">
      <BackgroundFx variant="about" />

      {/* Toast Notification Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-emerald-400/50 bg-slate-950/95 px-5 py-3 text-xs font-black text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.4)] backdrop-blur-xl animate-in zoom-in-95 duration-150">
          {toastMessage}
        </div>
      )}

      <div className="relative z-20 flex-1 flex flex-col">
        <SiteHeader />

        <main className="flex-1 pb-20 sm:pb-12">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-6 space-y-6">
            {/* Hero Principal Oficial */}
            <CreatorsHero
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onSelectHighlights={() => setSelectedCategory('destaques')}
              totalPostsCount={posts.length}
            />

            {/* Barra de Categorias */}
            <CreatorsCategoriesBar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categoryCounts={categoryCounts}
            />

            {/* Barra de Filtros, Ordenação e Pesquisa */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3.5 backdrop-blur-md">
              {/* Abas de Ordenação */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                {[
                  { id: 'destaques', label: '🔥 Em Destaque' },
                  { id: 'recentes', label: '🆕 Mais Recentes' },
                  { id: 'populares', label: '❤️ Populares' },
                  { id: 'comentadas', label: '💬 Comentadas' },
                  { id: 'tendencias', label: '📈 Tendências' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSortBy(tab.id as any)}
                    className={cn(
                      'shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                      sortBy === tab.id
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5',
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Controlo de Pesquisa & Filtro Distrital */}
              <div className="flex items-center gap-2">
                {/* Filtro por Distrito */}
                <div className="relative">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <option value="Todos os Distritos">📍 Todos os Distritos</option>
                    {VALID_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Caixa de Pesquisa Textual */}
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Procurar publicações..."
                    className="w-full rounded-xl border border-white/15 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* Layout Principal: 2 Colunas (Feed + Sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Coluna Central: Feed de Publicações (8 colunas no Desktop) */}
              <div id="feed-publicacoes" className="lg:col-span-8 space-y-4">
                {/* Botão Superior Rápido para Criar Publicação */}
                <div
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-4 shadow-md backdrop-blur-md transition-all hover:border-emerald-500/40 hover:bg-slate-900 cursor-pointer group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 text-lg border border-emerald-500/30 group-hover:scale-105 transition-transform">
                    ✍️
                  </div>
                  <div className="flex-1 text-xs text-slate-400 group-hover:text-slate-200 transition-colors font-medium">
                    Tens uma ideia, história, desabafo ou piada? <span className="text-emerald-400 font-bold">Publica aqui...</span>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-slate-950 uppercase tracking-wider group-hover:bg-emerald-400 transition-colors shadow"
                  >
                    Publicar
                  </button>
                </div>

                {/* Lista de Cartões do Feed */}
                {loading ? (
                  <div className="space-y-4 py-8">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-44 rounded-3xl border border-white/5 bg-slate-900/40 animate-pulse"
                      />
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center space-y-4">
                    <div className="text-4xl">🇵🇹</div>
                    <h3 className="font-display text-lg font-black uppercase text-white">
                      Ainda Não Há Publicações
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      {selectedCategory !== 'todas'
                        ? `Ninguém publicou nada na categoria "${selectedCategory}" ainda. Queres ser o primeiro?`
                        : 'Se calhar és tu quem vai começar a conversa no Acorda Portugal.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-xs font-black text-slate-950 uppercase tracking-wider hover:bg-emerald-400 transition-all shadow-lg"
                    >
                      <PenSquare className="h-4 w-4" />
                      <span>Criar Primeira Publicação</span>
                    </button>
                  </div>
                ) : (
                  posts.map((post) => (
                    <CreatorPostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onSave={handleSave}
                      onOpenComments={handleOpenComments}
                      onVotePoll={handleVotePoll}
                      onVoteSuggestion={handleVoteSuggestion}
                      onReport={handleReport}
                    />
                  ))
                )}
              </div>

              {/* Coluna Direita: Sidebar Comunitária (4 colunas no Desktop) */}
              <div className="lg:col-span-4">
                <CreatorsSidebar
                  onSelectTopic={(topic) => setSearchQuery(topic)}
                  onOpenCreateForChallenge={() => {
                    setSelectedCategory('opinioes')
                    setIsCreateModalOpen(true)
                  }}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Floating Action Button (FAB) Mobile para Criar Publicação */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          aria-label="Criar Publicação"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all hover:scale-110 active:scale-95 sm:hidden cursor-pointer"
        >
          <Plus className="h-7 w-7 stroke-[3]" />
        </button>

        {/* Modais e Gavetas */}
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPostCreated={handlePostCreated}
          createPostFn={createCreatorPost}
        />

        <CreatorsCommentsDrawer
          post={activeCommentPost}
          isOpen={isCommentsDrawerOpen}
          onClose={() => {
            setIsCommentsDrawerOpen(false)
            setActiveCommentPost(null)
          }}
          onCommentAdded={handleCommentAdded}
        />

        <ReportPostModal
          post={activeReportPost}
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false)
            setActiveReportPost(null)
          }}
        />

        <SiteFooter />
      </div>
    </div>
  )
}
