'use client'

import React, { useState, useEffect } from 'react'
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
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'

export interface Publicacao {
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
  createdAt: any
}

export function CriadoresFeed() {
  const { user, profile } = useAuth()
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([])
  const [novoTexto, setNovoTexto] = useState('')
  const [categoria, setCategoria] = useState('Ideias')
  const [distrito, setDistrito] = useState('Lisboa')
  const [carregando, setCarregando] = useState(false)
  const [filtroAba, setFiltroAba] = useState<'destaque' | 'recentes'>('destaque')

  // Preencher distrito por defeito com o do utilizador se disponível
  useEffect(() => {
    if (profile?.district) {
      setDistrito(profile.district)
    }
  }, [profile?.district])

  // 1. Escuta em tempo real da base de dados Firestore
  useEffect(() => {
    try {
      const q = query(
        collection(db, 'publicacoes_comunidade'),
        orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const posts = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as Publicacao[]

          setPublicacoes(posts)
        },
        (err) => {
          console.warn('[CriadoresFeed] Erro no listener Firestore:', err)
        }
      )

      return () => unsubscribe()
    } catch (e) {
      console.warn('[CriadoresFeed] Erro ao subscrever coleção:', e)
    }
  }, [])

  // 2. Envio e publicação imediata
  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoTexto.trim() || carregando) return

    setCarregando(true)
    try {
      const autorNome = profile?.displayName || user?.displayName || 'Jogador Portugal'
      const tagNome = profile?.username || (user?.email ? user.email.split('@')[0] : 'jogador_pt')

      await addDoc(collection(db, 'publicacoes_comunidade'), {
        autor: autorNome,
        tag: tagNome,
        distrito: distrito,
        conteudo: novoTexto.trim(),
        categoria: categoria,
        destaque: false,
        oficial: false,
        likes: 0,
        comentariosCount: 0,
        createdAt: serverTimestamp(),
      })

      setNovoTexto('')
    } catch (error) {
      console.error('Erro ao publicar mensagem:', error)
    } finally {
      setCarregando(false)
    }
  }

  // 3. Gosto / Like em tempo real
  const handleLike = async (postId: string) => {
    try {
      const postRef = doc(db, 'publicacoes_comunidade', postId)
      await updateDoc(postRef, {
        likes: increment(1),
      })
    } catch (err) {
      console.error('Erro ao dar like:', err)
    }
  }

  // Filtragem de tabs
  const publicacoesFiltradas = publicacoes.filter((p) => {
    if (filtroAba === 'destaque') return p.destaque || p.oficial || p.likes > 5
    return true
  })

  return (
    <div id="feed-publicacoes" className="w-full max-w-5xl mx-auto space-y-6 text-white pb-20">
      {/* Abas Superiores */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltroAba('destaque')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              filtroAba === 'destaque'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            🔥 Em Destaque
          </button>
          <button
            type="button"
            onClick={() => setFiltroAba('recentes')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              filtroAba === 'recentes'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            💬 Mais Recentes
          </button>
        </div>
      </div>

      {/* Caixa de Criação de Publicação */}
      <form
        onSubmit={handlePublicar}
        className="bg-black/50 border border-emerald-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
            ✍️
          </div>
          <textarea
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            placeholder="Tens uma ideia, história, desabafo ou piada? Publica aqui..."
            rows={2}
            className="w-full bg-white/5 rounded-xl p-3 text-sm text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="Ideias">💡 Ideias</option>
              <option value="Desabafos">🗣️ Desabafos</option>
              <option value="Humor">😂 Humor</option>
              <option value="Histórias">📖 Histórias</option>
              <option value="Sugestões">🎯 Sugestões</option>
            </select>

            <select
              value={distrito}
              onChange={(e) => setDistrito(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="Lisboa">Lisboa</option>
              <option value="Porto">Porto</option>
              <option value="Braga">Braga</option>
              <option value="Coimbra">Coimbra</option>
              <option value="Faro">Faro</option>
              <option value="Açores">Açores</option>
              <option value="Madeira">Madeira</option>
              <option value="Vila Real">Vila Real</option>
              <option value="Aveiro">Aveiro</option>
              <option value="Beja">Beja</option>
              <option value="Bragança">Bragança</option>
              <option value="Castelo Branco">Castelo Branco</option>
              <option value="Évora">Évora</option>
              <option value="Guarda">Guarda</option>
              <option value="Leiria">Leiria</option>
              <option value="Portalegre">Portalegre</option>
              <option value="Santarém">Santarém</option>
              <option value="Setúbal">Setúbal</option>
              <option value="Viana do Castelo">Viana do Castelo</option>
              <option value="Viseu">Viseu</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={carregando || !novoTexto.trim()}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            {carregando ? 'A publicar...' : 'PUBLICAR'}
          </button>
        </div>
      </form>

      {/* Lista de Mensagens em Tempo Real */}
      <div className="space-y-4">
        {publicacoesFiltradas.length === 0 ? (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-gray-400 text-sm">Nenhuma publicação encontrada. Sê o primeiro a escrever!</p>
          </div>
        ) : (
          publicacoesFiltradas.map((post) => (
            <div
              key={post.id}
              className="bg-black/60 border border-white/10 hover:border-emerald-500/40 p-5 rounded-2xl shadow-xl transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30">
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
                    <span className="text-xs text-gray-400">
                      @{post.tag} • {post.distrito}
                    </span>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                  {post.categoria}
                </span>
              </div>

              <p className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">
                {post.conteudo}
              </p>

              <div className="flex items-center gap-6 pt-3 border-t border-white/5 text-xs text-gray-400">
                <button
                  type="button"
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer transition-colors active:scale-95"
                >
                  ❤️ {post.likes || 0}
                </button>
                <span className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer">
                  💬 {post.comentariosCount || 0}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CriadoresFeed
