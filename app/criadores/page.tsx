'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CreatorsHero } from '@/components/creators/CreatorsHero'
import { CreatorsSidebar } from '@/components/creators/CreatorsSidebar'
import { VALID_DISTRICTS } from '@/data/districts'
import { cn } from '@/lib/utils'
import { Heart, MessageSquare, Send, PenSquare, Search, Sparkles } from 'lucide-react'

export interface PublicacaoComunidade {
  id: string
  autor: string
  tag: string
  distrito: string
  conteudo: string
  categoria: string
  destaque: boolean
  oficial: boolean
  likes: number
  comentariosCount: number
  createdAt: Timestamp | Date | string | null
}

export default function CriadoresPage() {
  const { user, profile } = useAuth()

  // 1. Proteção de ciclo de vida e montagem no cliente (Zero Hydration Mismatch)
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Estado das publicações
  const [publicacoes, setPublicacoes] = useState<PublicacaoComunidade[]>([])
  const [loading, setLoading] = useState(true)

  // Formulário de publicação
  const [novoTexto, setNovoTexto] = useState('')
  const [categoria, setCategoria] = useState('Ideias')
  const [distrito, setDistrito] = useState('Lisboa')
  const [carregando, setCarregando] = useState(false)

  // Filtros de visualização
  const [filtroAba, setFiltroAba] = useState<'destaque' | 'recentes'>('destaque')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas')
  const [distritoFiltro, setDistritoFiltro] = useState<string>('Todos os Distritos')
  const [searchQuery, setSearchQuery] = useState('')

  // Toast de feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    const timer = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Preencher distrito padrão com o do perfil autenticado
  useEffect(() => {
    if (profile?.district) {
      setDistrito(profile.district)
    }
  }, [profile?.district])

  // 2. Escuta em TEMPO REAL blindada com Firestore (Coleção: publicacoes_comunidade)
  useEffect(() => {
    if (!isMounted) return

    if (!db) {
      console.warn('[CRIADORES] Instância do Firebase Firestore (db) não disponível.')
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const q = query(
        collection(db, 'publicacoes_comunidade'),
        orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs: PublicacaoComunidade[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data()
            return {
              id: docSnap.id,
              autor: typeof data.autor === 'string' && data.autor.trim() ? data.autor : 'Jogador',
              tag: typeof data.tag === 'string' && data.tag.trim() ? data.tag : 'jogador_pt',
              distrito: typeof data.distrito === 'string' && data.distrito.trim() ? data.distrito : 'Portugal',
              conteudo: typeof data.conteudo === 'string' ? data.conteudo : '',
              categoria: typeof data.categoria === 'string' && data.categoria.trim() ? data.categoria : 'Geral',
              destaque: Boolean(data.destaque),
              oficial: Boolean(data.oficial),
              likes: typeof data.likes === 'number' ? data.likes : 0,
              comentariosCount: typeof data.comentariosCount === 'number' ? data.comentariosCount : 0,
              createdAt: data.createdAt || null,
            }
          })

          setPublicacoes(docs)
          setLoading(false)
        },
        (error) => {
          console.error('[CRIADORES] Erro na subscrição em tempo real Firestore:', error)
          setLoading(false)
        }
      )

      return () => {
        try {
          unsubscribe()
        } catch (e) {
          console.error('[CRIADORES] Erro ao fechar subscrição Firestore:', e)
        }
      }
    } catch (err) {
      console.error('[CRIADORES] Exceção ao inicializar consulta Firestore:', err)
      setLoading(false)
    }
  }, [isMounted])

  // 3. Envio e persistência real no Firestore
  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault()
    const textoLimpo = novoTexto.trim()
    if (!textoLimpo || carregando) return

    if (!db) {
      showToast('Erro: Base de dados indisponível.')
      return
    }

    setCarregando(true)

    try {
      const autorFinal = profile?.displayName || user?.displayName || 'Jogador'
      const tagFinal = profile?.username || (user?.email ? user.email.split('@')[0] : 'jogador_pt')
      const distritoFinal = distrito || profile?.district || 'Lisboa'
      const categoriaFinal = categoria || 'Ideias'

      await addDoc(collection(db, 'publicacoes_comunidade'), {
        autor: autorFinal,
        tag: tagFinal,
        distrito: distritoFinal,
        categoria: categoriaFinal,
        conteudo: textoLimpo,
        destaque: false,
        oficial: false,
        likes: 0,
        comentariosCount: 0,
        createdAt: serverTimestamp(),
      })

      setNovoTexto('')
      showToast('Publicação criada com sucesso! 🇵🇹')
    } catch (error) {
      console.error('[CRIADORES] Erro ao gravar documento no Firestore:', error)
      showToast('Erro ao publicar mensagem. Tenta novamente.')
    } finally {
      setCarregando(false)
    }
  }

  // 4. Interação de Like em tempo real
  const handleLike = async (postId: string) => {
    if (!db) return
    try {
      const postRef = doc(db, 'publicacoes_comunidade', postId)
      await updateDoc(postRef, {
        likes: increment(1),
      })
      showToast('Gosto registado! ❤️')
    } catch (err) {
      console.error('[CRIADORES] Erro ao registar like no Firestore:', err)
    }
  }

  // 5. Scroll seguro para elementos da interface
  const scrollToElement = (elementId: string) => {
    if (typeof document === 'undefined') return
    const target = document.getElementById(elementId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // 6. Filtragem dinâmica das mensagens
  const publicacoesFiltradas = useMemo(() => {
    return publicacoes.filter((p) => {
      // Filtro de Abas (Destaques vs Recentes)
      if (filtroAba === 'destaque') {
        const isHighlight = p.destaque || p.oficial || p.likes > 5
        if (!isHighlight && publicacoes.length > 5) return false
      }

      // Filtro de Categoria
      if (categoriaFiltro !== 'todas') {
        if (p.categoria.toLowerCase() !== categoriaFiltro.toLowerCase()) return false
      }

      // Filtro de Distrito
      if (distritoFiltro !== 'Todos os Distritos') {
        if (p.distrito.toLowerCase() !== distritoFiltro.toLowerCase()) return false
      }

      // Pesquisa Textual
      if (searchQuery.trim()) {
        const queryNorm = searchQuery.toLowerCase()
        const matchText = p.conteudo.toLowerCase().includes(queryNorm)
        const matchAuthor = p.autor.toLowerCase().includes(queryNorm)
        const matchTag = p.tag.toLowerCase().includes(queryNorm)
        if (!matchText && !matchAuthor && !matchTag) return false
      }

      return true
    })
  }, [publicacoes, filtroAba, categoriaFiltro, distritoFiltro, searchQuery])

  // Se ainda não montou no cliente, renderiza estrutura base estável sem mismatch de hidratação
  if (!isMounted) {
    return (
      <div className="relative min-h-screen bg-transparent flex flex-col">
        <BackgroundFx variant="about" />
        <div className="relative z-20 flex-1 flex flex-col">
          <SiteHeader />
          <main className="flex-1 pb-20 sm:pb-12">
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-6 space-y-6">
              <div className="h-64 rounded-3xl border border-white/10 bg-slate-900/60 animate-pulse" />
              <div className="h-96 rounded-3xl border border-white/10 bg-slate-900/40 animate-pulse" />
            </div>
          </main>
          <SiteFooter />
        </div>
      </div>
    )
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
              onOpenCreateModal={() => {
                const el = typeof document !== 'undefined' ? document.getElementById('caixa-publicacao') : null
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  const textarea = el.querySelector('textarea')
                  if (textarea) textarea.focus()
                }
              }}
              onSelectHighlights={() => {
                setFiltroAba('destaque')
                scrollToElement('feed-publicacoes')
              }}
              totalPostsCount={publicacoes.length}
            />

            {/* Layout Principal: 2 Colunas (Feed + Sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Coluna Central: Feed em Tempo Real (8 Colunas) */}
              <div className="lg:col-span-8 space-y-5">
                {/* Caixa de Criação de Publicação em Tempo Real */}
                <form
                  id="caixa-publicacao"
                  onSubmit={handlePublicar}
                  className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-lg flex items-center justify-center border border-emerald-500/30 shrink-0">
                      ✍️
                    </div>
                    <textarea
                      value={novoTexto}
                      onChange={(e) => setNovoTexto(e.target.value)}
                      placeholder="Tens uma ideia, história, desabafo ou piada? Publica aqui na comunidade de Portugal..."
                      rows={3}
                      className="w-full bg-slate-950/80 rounded-2xl p-3.5 text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:border-emerald-500 resize-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <select
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-400 cursor-pointer font-bold"
                      >
                        <option value="Ideias">💡 Ideias</option>
                        <option value="Desabafos">🗣️ Desabafos</option>
                        <option value="Humor">😂 Humor</option>
                        <option value="Histórias">📖 Histórias</option>
                        <option value="Sugestões">🎯 Sugestões</option>
                        <option value="Portugal">🇵🇹 Portugal</option>
                        <option value="Opiniões">💬 Opiniões</option>
                        <option value="Debates">🔥 Debates</option>
                      </select>

                      <select
                        value={distrito}
                        onChange={(e) => setDistrito(e.target.value)}
                        className="bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-400 cursor-pointer font-bold"
                      >
                        {VALID_DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            📍 {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={carregando || !novoTexto.trim()}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-2"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{carregando ? 'A publicar...' : 'PUBLICAR'}</span>
                    </button>
                  </div>
                </form>

                {/* Abas e Filtros de Pesquisa do Feed */}
                <div
                  id="feed-publicacoes"
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3.5 backdrop-blur-md"
                >
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFiltroAba('destaque')}
                      className={cn(
                        'rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer',
                        filtroAba === 'destaque'
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      )}
                    >
                      🔥 Em Destaque
                    </button>
                    <button
                      type="button"
                      onClick={() => setFiltroAba('recentes')}
                      className={cn(
                        'rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer',
                        filtroAba === 'recentes'
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      )}
                    >
                      💬 Mais Recentes
                    </button>
                  </div>

                  {/* Filtro por Distrito & Pesquisa Rápida */}
                  <div className="flex items-center gap-2">
                    <select
                      value={distritoFiltro}
                      onChange={(e) => setDistritoFiltro(e.target.value)}
                      className="rounded-xl border border-white/15 bg-slate-950 px-3 py-1.5 text-xs font-bold text-slate-300 outline-none focus:border-emerald-400 cursor-pointer"
                    >
                      <option value="Todos os Distritos">📍 Todos os Distritos</option>
                      {VALID_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>

                    <div className="relative flex-1 sm:w-44">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Pesquisar..."
                        className="w-full rounded-xl border border-white/15 bg-slate-950 pl-7 pr-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Lista de Mensagens em Tempo Real */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-4 py-8">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-36 rounded-3xl border border-white/5 bg-slate-900/40 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : publicacoesFiltradas.length === 0 ? (
                    /* Mensagem Elegante de Coleção Vazia */
                    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center space-y-4">
                      <div className="text-4xl">🇵🇹</div>
                      <h3 className="font-display text-lg font-black uppercase text-white">
                        Ainda não existem publicações. Sê o primeiro a partilhar!
                      </h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        Este espaço está agora 100% conectado à comunidade em tempo real. Partilha a primeira ideia ou história da tua terra!
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const el = typeof document !== 'undefined' ? document.getElementById('caixa-publicacao') : null
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            const textarea = el.querySelector('textarea')
                            if (textarea) textarea.focus()
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-xs font-black text-slate-950 uppercase tracking-wider hover:bg-emerald-400 transition-all shadow-lg cursor-pointer"
                      >
                        <PenSquare className="h-4 w-4" />
                        <span>Escrever Publicação</span>
                      </button>
                    </div>
                  ) : (
                    publicacoesFiltradas.map((post) => (
                      <div
                        key={post.id}
                        className="bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 p-5 rounded-3xl shadow-xl transition-all space-y-3 backdrop-blur-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30 shrink-0">
                              {post.autor?.[0]?.toUpperCase() || 'P'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">{post.autor}</span>
                                {post.oficial && (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                                    EQUIPA OFICIAL
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400">
                                @{post.tag} • {post.distrito}
                              </span>
                            </div>
                          </div>

                          <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-bold">
                            {post.categoria}
                          </span>
                        </div>

                        <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                          {post.conteudo}
                        </p>

                        <div className="flex items-center gap-6 pt-3 border-t border-white/5 text-xs text-slate-400">
                          <button
                            type="button"
                            onClick={() => handleLike(post.id)}
                            className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer transition-colors active:scale-95 font-bold"
                          >
                            <Heart className="h-4 w-4 fill-emerald-500/20 text-emerald-400" />
                            <span>{post.likes || 0}</span>
                          </button>
                          <span className="flex items-center gap-1.5 font-bold">
                            <MessageSquare className="h-4 w-4 text-slate-500" />
                            <span>{post.comentariosCount || 0}</span>
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Coluna Lateral: Desafios e Informações Oficiais (4 Colunas) */}
              <div className="lg:col-span-4">
                <CreatorsSidebar
                  onOpenCreateForChallenge={() => {
                    const el = typeof document !== 'undefined' ? document.getElementById('caixa-publicacao') : null
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      setCategoria('Debates')
                      const textarea = el.querySelector('textarea')
                      if (textarea) {
                        textarea.value = 'Em resposta ao Desafio do Dia: '
                        setNovoTexto('Em resposta ao Desafio do Dia: ')
                        textarea.focus()
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
