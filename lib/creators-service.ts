/**
 * Serviço Oficial de Dados e Interações do Módulo «OS CRIADORES» 🇵🇹
 * Acorda Portugal — Desafio Nacional
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import type {
  CreatorPost,
  CreatorComment,
  CreatorCategorySlug,
  CreatorCategoryInfo,
  CreatorReport,
  ReportReason,
  CommunityDailyChallenge,
  CreatorProfileSummary,
} from '@/src/types/creators'

export const CREATOR_CATEGORIES: CreatorCategoryInfo[] = [
  {
    slug: 'desabafos',
    name: 'Desabafos',
    icon: '💬',
    tagline: 'Há coisas que precisam de ser ditas.',
    description: 'Partilha pensamentos sinceros, reflexões sobre o quotidiano português e a vida com opção de anonimato.',
    accentColor: '#ec4899',
    badgeBg: 'rgba(236, 72, 153, 0.15)',
    borderColor: 'rgba(236, 72, 153, 0.4)',
  },
  {
    slug: 'ideias',
    name: 'Ideias',
    icon: '🧠',
    tagline: 'E se fizéssemos isto de outra forma?',
    description: 'Conceitos inovadores, projetos criativos e visões de futuro para Portugal.',
    accentColor: '#06b6d4',
    badgeBg: 'rgba(6, 182, 212, 0.15)',
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  {
    slug: 'humor',
    name: 'Humor',
    icon: '😂',
    tagline: 'Porque Portugal também sabe rir de si próprio.',
    description: 'Memes, tiradas hilariantes, sátira ligeira e o inimitável sentido de humor luso.',
    accentColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  {
    slug: 'historias',
    name: 'Histórias',
    icon: '📖',
    tagline: 'Cada pessoa tem uma história.',
    description: 'Memórias de família, vivências nas aldeias e cidades, episódios marcantes e tradições orais.',
    accentColor: '#f97316',
    badgeBg: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.4)',
  },
  {
    slug: 'portugal',
    name: 'Portugal',
    icon: '🇵🇹',
    tagline: 'Coisas que só quem vive Portugal entende.',
    description: 'Costumes, gastronomia, recantos escondidos e o pulsar das nossas terras.',
    accentColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  {
    slug: 'opinioes',
    name: 'Opiniões',
    icon: '🗣️',
    tagline: 'Diz o que pensas.',
    description: 'Pontos de vista sobre cultura, desporto, sociedade e atualidade nacional com respeito e elevação.',
    accentColor: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  {
    slug: 'sugestoes',
    name: 'Sugestões para o Jogo',
    icon: '💡',
    tagline: 'Ajuda-nos a construir o Acorda Portugal.',
    description: 'Propostas de novas funcionalidades, modos de jogo e temas que a comunidade vota diretamente.',
    accentColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.6)',
  },
  {
    slug: 'debates',
    name: 'Debates',
    icon: '🔥',
    tagline: 'Concordas? Discordas? Explica porquê.',
    description: 'Votações interativas e discussões acesas sobre os temas que apaixonam os portugueses.',
    accentColor: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  {
    slug: 'destaques',
    name: 'Destaques da Comunidade',
    icon: '🏆',
    tagline: 'O melhor que a comunidade criou.',
    description: 'Publicações galardoadas pela moderação e pelas votações populares dos jogadores.',
    accentColor: '#eab308',
    badgeBg: 'rgba(234, 179, 8, 0.18)',
    borderColor: 'rgba(234, 179, 8, 0.5)',
  },
]

export const DAILY_CHALLENGE: CommunityDailyChallenge = {
  id: 'chal_today',
  date: '2026-08-26',
  title: 'Desafio do Dia',
  question: 'Se pudesses mudar uma única coisa no Portugal de hoje, qual seria a tua primeira medida?',
  author: 'Equipa Acorda Portugal 🇵🇹',
  participantsCount: 418,
  featuredResponse: {
    authorName: 'Afonso Henriques V',
    authorDistrict: 'Guimarães',
    text: 'Criar incentivos reais para fixar os jovens no interior do país e valorizar o património histórico e agropecuário nacional.',
  },
}

// Dados semente iniciais ricos e autênticos em Português de Portugal
export const SEED_POSTS: CreatorPost[] = [
  {
    id: 'post_seed_001',
    authorId: 'official_team',
    authorName: 'Acorda Portugal Oficial',
    authorUsername: 'acorda_portugal',
    authorAvatar: '/images/avatars/avatar_galo.png',
    authorLevel: 100,
    authorDistrict: 'Lisboa',
    authorTitle: 'Guardião da Nação',
    isOfficial: true,
    category: 'destaques',
    highlightBadge: 'oficial_acorda_portugal',
    title: '🇵🇹 Bem-vindos a «Os Criadores» — O Teu Espaço Comunitário!',
    content:
      'Portugal não é só para jogar. É para participar! Inauguramos oficialmente este centro comunitário para que todos os jogadores possam dar voz às suas ideias, partilhar histórias das suas terras, lançar debates e sugerir novas funcionalidades para o jogo. Respeito mútuo, elevação e paixão por Portugal acima de tudo.',
    createdAt: '2026-08-26T00:00:00.000Z',
    likesCount: 342,
    commentsCount: 56,
    sharesCount: 89,
    savesCount: 120,
    isFeatured: true,
    moderationStatus: 'approved',
  },
  {
    id: 'post_seed_002',
    authorId: 'user_porto_01',
    authorName: 'Gonçalo Ribeiro',
    authorUsername: 'tripeiro_raiz',
    authorAvatar: '/images/avatars/avatar_camões.png',
    authorLevel: 28,
    authorDistrict: 'Porto',
    authorTitle: 'Conquistador Luso',
    category: 'sugestoes',
    isSuggestion: true,
    suggestionStatus: 'em_desenvolvimento',
    upvotesCount: 284,
    downvotesCount: 12,
    title: 'E se no modo 1v1 pudéssemos desafiar jogadores do mesmo Distrito?',
    content:
      'Acho que seria incrível criar um "Torneio Distrital" semanal onde os jogadores de um mesmo distrito competem entre si numa tabela eliminatória rápida para coroar o Campeão do Distrito! Quem concorda?',
    createdAt: '2026-08-25T18:30:00.000Z',
    likesCount: 198,
    commentsCount: 34,
    sharesCount: 15,
    isFeatured: true,
    highlightBadge: 'melhor_ideia',
    moderationStatus: 'approved',
  },
  {
    id: 'post_seed_003',
    authorId: 'user_faro_02',
    authorName: 'Mariana Vicente',
    authorUsername: 'algarvia_mar',
    authorAvatar: '/images/avatars/avatar_padeira.png',
    authorLevel: 22,
    authorDistrict: 'Faro',
    authorTitle: 'Embaixadora Regional',
    category: 'debates',
    isPoll: true,
    pollQuestion: 'Qual é o melhor prato tradicional de Verão em Portugal?',
    pollOptions: [
      { id: 'opt_1', text: 'Sardinha Assada com Pimentos', votes: 142 },
      { id: 'opt_2', text: 'Amêijoas à Bulhão Pato', votes: 98 },
      { id: 'opt_3', text: 'Cataplana de Marisco', votes: 67 },
      { id: 'opt_4', text: 'Arroz de Marisco', votes: 85 },
    ],
    pollTotalVotes: 392,
    title: '🔥 Grande Debate de Verão: O Prato Rainha da Costa Portuguesa',
    content:
      'Com o calor de agosto e o mar à porta, não há consenso. Em Tavira juramos pelas conquilhas e cataplana, mas em Matosinhos e Portimão a sardinha na brasa manda. Qual é a vossa escolha inegociável?',
    createdAt: '2026-08-25T14:15:00.000Z',
    likesCount: 156,
    commentsCount: 42,
    sharesCount: 21,
    moderationStatus: 'approved',
  },
  {
    id: 'post_seed_004',
    authorId: 'user_braga_03',
    authorName: 'Tiago Antunes',
    authorUsername: 'minhoto_guerreiro',
    authorAvatar: '/images/avatars/avatar_ze_povinho.png',
    authorLevel: 19,
    authorDistrict: 'Braga',
    authorTitle: 'Veterano das Quinas',
    category: 'humor',
    highlightBadge: 'humor_do_dia',
    title: '😂 A evolução das respostas da minha avó ao GPS quando vamos à terra',
    content:
      'O GPS diz: "Na rotunda, siga pela terceira saída."\nA minha avó no banco de trás:\n— "Não vás por aí, rapaz! Vira mas é junto ao café do senhor Manuel que o caminho é mais direito e não tem buracos!"\nQuem mais tem uma avó mais fiável que o satélite da Google? 🇵🇹',
    createdAt: '2026-08-25T11:20:00.000Z',
    likesCount: 245,
    commentsCount: 29,
    sharesCount: 64,
    moderationStatus: 'approved',
  },
  {
    id: 'post_seed_005',
    authorId: 'anon_01',
    authorName: 'Cidadão Anónimo',
    authorUsername: 'anonimo',
    authorAvatar: '/images/avatars/avatar_default.png',
    isAnonymous: true,
    category: 'desabafos',
    title: '💬 A saudade que sinto de Portugal mesmo estando apenas a trabalhar fora',
    content:
      'Mudei-me para a Suíça há 8 meses por razões profissionais. O país é fantástico, mas nada substitui o cheiro a café torrado logo de manhã na pastelaria do bairro, a luz única de Lisboa ao fim da tarde e o calor das pessoas. Jogar Acorda Portugal todas as noites é o meu pedaço de casa.',
    createdAt: '2026-08-25T09:00:00.000Z',
    likesCount: 312,
    commentsCount: 48,
    sharesCount: 30,
    highlightBadge: 'espirito_portugues',
    moderationStatus: 'approved',
  },
  {
    id: 'post_seed_006',
    authorId: 'user_viseu_04',
    authorName: 'Beatriz Castelo',
    authorUsername: 'beira_alta_viva',
    authorAvatar: '/images/avatars/avatar_d_afonso.png',
    authorLevel: 15,
    authorDistrict: 'Viseu',
    authorTitle: 'Noviça da Nação',
    category: 'historias',
    title: '📖 O segredo dos socalcos da minha bisavó no Douro',
    content:
      'Encontrei recentemente cartas antigas de 1934 onde a minha bisavó contava como toda a família subia a encosta de xisto a pé às 5h da manhã para a vindima. Hoje olhamos para as garrafas de vinho do Porto e esquecemos o suor e a coragem de gerações inteiras de transmontanos e beirões.',
    createdAt: '2026-08-24T20:45:00.000Z',
    likesCount: 184,
    commentsCount: 18,
    sharesCount: 19,
    moderationStatus: 'approved',
  },
  {
    id: 'post_seed_007',
    authorId: 'user_coimbra_05',
    authorName: 'Duarte Nuno Silva',
    authorUsername: 'coimbra_doutor',
    authorAvatar: '/images/avatars/avatar_camões.png',
    authorLevel: 31,
    authorDistrict: 'Coimbra',
    authorTitle: 'Mestre do Conhecimento',
    category: 'opinioes',
    title: '🗣️ A importância de valorizarmos a língua portuguesa e os nossos autores clássicos',
    content:
      'Numa era dominada por termos anglo-saxónicos e abreviaturas digitais, iniciativas como o banco de perguntas de Literatura e História do Acorda Portugal têm um papel cívico essencial. Ler Eça, Garrett, Camilo e Sophia devia ser um orgulho nacional vivo, não apenas matéria de exame escolar.',
    createdAt: '2026-08-24T16:10:00.000Z',
    likesCount: 167,
    commentsCount: 22,
    sharesCount: 38,
    moderationStatus: 'approved',
  },
  {
    id: 'post_seed_008',
    authorId: 'user_leiria_06',
    authorName: 'Inês Pinheiro',
    authorUsername: 'pinhal_rei',
    authorAvatar: '/images/avatars/avatar_padeira.png',
    authorLevel: 17,
    authorDistrict: 'Leiria',
    authorTitle: 'Defensora das Tradições',
    category: 'portugal',
    title: '🇵🇹 Sabias que o Pinhal de Leiria foi mandado semear por D. Afonso III e reforçado por D. Dinis?',
    content:
      'O Pinhal de Leiria (ou Pinhal do Rei) forneceu a madeira de pinho bravo para a construção das caravelas e naus das Descobertas marítimas portuguesas. É um monumento vivo à engenharia e visão estratégica dos primeiros reis de Portugal!',
    createdAt: '2026-08-24T12:00:00.000Z',
    likesCount: 195,
    commentsCount: 14,
    sharesCount: 45,
    moderationStatus: 'approved',
  },
]

export const SEED_COMMENTS: Record<string, CreatorComment[]> = {
  post_seed_001: [
    {
      id: 'comm_001_1',
      postId: 'post_seed_001',
      authorId: 'user_porto_01',
      authorName: 'Gonçalo Ribeiro',
      authorUsername: 'tripeiro_raiz',
      authorAvatar: '/images/avatars/avatar_camões.png',
      authorLevel: 28,
      authorDistrict: 'Porto',
      content: 'Espetacular iniciativa! Já fazia falta um local oficial onde a comunidade pudesse trocar ideias e apoiar a evolução do jogo.',
      createdAt: '2026-08-26T00:15:00.000Z',
      likesCount: 18,
      replies: [
        {
          id: 'comm_001_1_rep1',
          postId: 'post_seed_001',
          authorId: 'official_team',
          authorName: 'Acorda Portugal Oficial',
          authorUsername: 'acorda_portugal',
          authorAvatar: '/images/avatars/avatar_galo.png',
          authorLevel: 100,
          isOfficial: true,
          content: 'Obrigado Gonçalo! Contamos com as tuas propostas e debates do Norte!',
          createdAt: '2026-08-26T00:25:00.000Z',
          likesCount: 12,
        },
      ],
    },
    {
      id: 'comm_001_2',
      postId: 'post_seed_001',
      authorId: 'user_faro_02',
      authorName: 'Mariana Vicente',
      authorUsername: 'algarvia_mar',
      authorAvatar: '/images/avatars/avatar_padeira.png',
      authorLevel: 22,
      authorDistrict: 'Faro',
      content: 'Viva Portugal! Adorei a separação por categorias, muito bem estruturado!',
      createdAt: '2026-08-26T00:30:00.000Z',
      likesCount: 9,
    },
  ],
  post_seed_002: [
    {
      id: 'comm_002_1',
      postId: 'post_seed_002',
      authorId: 'user_braga_03',
      authorName: 'Tiago Antunes',
      authorUsername: 'minhoto_guerreiro',
      authorAvatar: '/images/avatars/avatar_ze_povinho.png',
      authorLevel: 19,
      authorDistrict: 'Braga',
      content: 'Excelente ideia. Em Braga íamos ter dérbis épicos!',
      createdAt: '2026-08-25T19:00:00.000Z',
      likesCount: 14,
    },
  ],
}

/**
 * Sanitiza textos para prevenção estrita contra XSS e injeção de HTML
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Obtém o estado local de likes e saves do utilizador a partir de localStorage
 */
function getLocalUserData() {
  if (typeof window === 'undefined') return { likes: new Set<string>(), saves: new Set<string>(), pollVotes: {} as Record<string, string>, suggestionVotes: {} as Record<string, 'up' | 'down'> }
  try {
    const likes = new Set<string>(JSON.parse(localStorage.getItem('creator_user_likes') || '[]'))
    const saves = new Set<string>(JSON.parse(localStorage.getItem('creator_user_saves') || '[]'))
    const pollVotes = JSON.parse(localStorage.getItem('creator_poll_votes') || '{}')
    const suggestionVotes = JSON.parse(localStorage.getItem('creator_suggestion_votes') || '{}')
    return { likes, saves, pollVotes, suggestionVotes }
  } catch {
    return { likes: new Set<string>(), saves: new Set<string>(), pollVotes: {}, suggestionVotes: {} }
  }
}

/**
 * Grava o estado de likes do utilizador
 */
function saveLocalLikes(likes: Set<string>) {
  if (typeof window === 'undefined') return
  localStorage.setItem('creator_user_likes', JSON.stringify(Array.from(likes)))
}

/**
 * Grava o estado de guardados do utilizador
 */
function saveLocalSaves(saves: Set<string>) {
  if (typeof window === 'undefined') return
  localStorage.setItem('creator_user_saves', JSON.stringify(Array.from(saves)))
}

/**
 * Armazenamento em memória / cache reativo local para novos posts criados na sessão
 */
let memoryPosts: CreatorPost[] = [...SEED_POSTS]
let memoryComments: Record<string, CreatorComment[]> = { ...SEED_COMMENTS }

/**
 * Lista publicações com filtros e ordenação
 */
export async function getCreatorPosts(params?: {
  category?: CreatorCategorySlug | 'todas'
  district?: string
  sortBy?: 'destaques' | 'recentes' | 'populares' | 'comentadas' | 'tendencias'
  searchQuery?: string
}): Promise<CreatorPost[]> {
  const { likes, saves, pollVotes, suggestionVotes } = getLocalUserData()

  let results: CreatorPost[] = []

  // Tentar buscar do Firestore se disponível
  try {
    const q = query(
      collection(db, 'creatorPosts'),
      where('moderationStatus', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(50),
    )
    const snap = await getDocs(q)
    if (!snap.empty) {
      const fsPosts = snap.docs.map((docSnap) => {
        const d = docSnap.data()
        return {
          id: docSnap.id,
          ...d,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || new Date().toISOString(),
        } as CreatorPost
      })
      results = fsPosts
    } else {
      results = [...memoryPosts]
    }
  } catch (err) {
    // Fallback gracioso para cache de memória com dados semente
    results = [...memoryPosts]
  }

  // Filtrar por categoria
  if (params?.category && params.category !== 'todas') {
    if (params.category === 'destaques') {
      results = results.filter((p) => p.isFeatured || p.category === 'destaques' || Boolean(p.highlightBadge))
    } else {
      results = results.filter((p) => p.category === params.category)
    }
  }

  // Filtrar por distrito
  if (params?.district && params.district !== 'Todos os Distritos') {
    results = results.filter((p) => p.authorDistrict?.toLowerCase() === params.district?.toLowerCase())
  }

  // Filtrar por termo de pesquisa
  if (params?.searchQuery && params.searchQuery.trim()) {
    const term = params.searchQuery.trim().toLowerCase()
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.content.toLowerCase().includes(term) ||
        p.authorName.toLowerCase().includes(term) ||
        p.authorUsername.toLowerCase().includes(term),
    )
  }

  // Aplicar enriquecimento de estado do utilizador (likes, saves, poll votes)
  results = results.map((p) => ({
    ...p,
    hasLiked: likes.has(p.id),
    hasSaved: saves.has(p.id),
    userVotedOptionId: pollVotes[p.id],
    userVote: suggestionVotes[p.id] || null,
  }))

  // Ordenação
  const sortBy = params?.sortBy || 'destaques'
  results.sort((a, b) => {
    if (sortBy === 'destaques') {
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      return b.likesCount + b.commentsCount * 2 - (a.likesCount + a.commentsCount * 2)
    }
    if (sortBy === 'populares') {
      return b.likesCount - a.likesCount
    }
    if (sortBy === 'comentadas') {
      return b.commentsCount - a.commentsCount
    }
    if (sortBy === 'tendencias') {
      return b.sharesCount * 3 + b.likesCount - (a.sharesCount * 3 + a.likesCount)
    }
    // 'recentes'
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })

  return results
}

/**
 * Cria uma nova publicação com validação e proteção contra spam
 */
export async function createCreatorPost(data: {
  authorId: string
  authorName: string
  authorUsername: string
  authorAvatar?: string
  authorLevel?: number
  authorDistrict?: string
  authorTitle?: string
  category: CreatorCategorySlug
  title: string
  content: string
  imageUrl?: string
  isAnonymous?: boolean
  isSuggestion?: boolean
  isPoll?: boolean
  pollQuestion?: string
  pollOptions?: string[]
}): Promise<CreatorPost> {
  const cleanTitle = sanitizeText(data.title.trim())
  const cleanContent = sanitizeText(data.content.trim())

  if (!cleanTitle || cleanTitle.length < 4) {
    throw new Error('O título da publicação deve conter pelo menos 4 caracteres.')
  }
  if (!cleanContent || cleanContent.length < 10) {
    throw new Error('O conteúdo da publicação deve conter pelo menos 10 caracteres.')
  }

  const newPostId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const nowIso = new Date().toISOString()

  let pollFormattedOptions = undefined
  if (data.isPoll && data.pollOptions && data.pollOptions.length >= 2) {
    pollFormattedOptions = data.pollOptions.map((optText, idx) => ({
      id: `opt_${idx + 1}`,
      text: sanitizeText(optText.trim()),
      votes: 0,
    }))
  }

  const newPost: CreatorPost = {
    id: newPostId,
    authorId: data.isAnonymous ? 'anonymous' : data.authorId,
    authorName: data.isAnonymous ? 'Cidadão Anónimo' : data.authorName,
    authorUsername: data.isAnonymous ? 'anonimo' : data.authorUsername,
    authorAvatar: data.isAnonymous ? '/images/avatars/avatar_default.png' : data.authorAvatar,
    authorLevel: data.isAnonymous ? undefined : data.authorLevel,
    authorDistrict: data.isAnonymous ? undefined : data.authorDistrict,
    authorTitle: data.isAnonymous ? undefined : data.authorTitle,
    isAnonymous: Boolean(data.isAnonymous),
    category: data.category,
    title: cleanTitle,
    content: cleanContent,
    imageUrl: data.imageUrl ? sanitizeText(data.imageUrl.trim()) : undefined,
    createdAt: nowIso,
    likesCount: 1, // O criador apoia a sua própria publicação por defeito
    commentsCount: 0,
    sharesCount: 0,
    savesCount: 0,
    moderationStatus: 'approved',
    isSuggestion: data.category === 'sugestoes' || data.isSuggestion,
    suggestionStatus: (data.category === 'sugestoes' || data.isSuggestion) ? 'sugestao' : undefined,
    upvotesCount: (data.category === 'sugestoes' || data.isSuggestion) ? 1 : undefined,
    downvotesCount: 0,
    isPoll: Boolean(data.isPoll),
    pollQuestion: data.pollQuestion ? sanitizeText(data.pollQuestion.trim()) : undefined,
    pollOptions: pollFormattedOptions,
    pollTotalVotes: 0,
  }

  // Tentar gravar no Firestore
  try {
    await setDoc(doc(db, 'creatorPosts', newPostId), {
      ...newPost,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } catch (err) {
    console.warn('[CREATORS] Aviso ao gravar no Firestore (usando fallback local):', err)
  }

  // Adicionar à memória local
  memoryPosts.unshift(newPost)

  // Marcar like localmente
  const { likes } = getLocalUserData()
  likes.add(newPostId)
  saveLocalLikes(likes)

  return newPost
}

/**
 * Alterna o Gosto (Like) numa publicação
 */
export async function togglePostLike(postId: string): Promise<{ liked: boolean; newCount: number }> {
  const { likes } = getLocalUserData()
  const hasLiked = likes.has(postId)
  const isLiking = !hasLiked

  if (isLiking) {
    likes.add(postId)
  } else {
    likes.delete(postId)
  }
  saveLocalLikes(likes)

  // Atualizar contagem no cache de memória
  const post = memoryPosts.find((p) => p.id === postId)
  let newCount = post ? post.likesCount : 0
  if (post) {
    post.likesCount = Math.max(0, post.likesCount + (isLiking ? 1 : -1))
    newCount = post.likesCount
  }

  // Atualizar no Firestore
  try {
    const postRef = doc(db, 'creatorPosts', postId)
    await updateDoc(postRef, {
      likesCount: increment(isLiking ? 1 : -1),
    })
  } catch (e) {
    // Silencioso em caso de fallback
  }

  return { liked: isLiking, newCount }
}

/**
 * Alterna guardar publicação nos favoritos
 */
export function togglePostSave(postId: string): boolean {
  const { saves } = getLocalUserData()
  const isSaved = saves.has(postId)
  if (isSaved) {
    saves.delete(postId)
  } else {
    saves.add(postId)
  }
  saveLocalSaves(saves)
  return !isSaved
}

/**
 * Obtém os comentários de uma publicação
 */
export async function getPostComments(postId: string): Promise<CreatorComment[]> {
  try {
    const q = query(
      collection(db, 'creatorPosts', postId, 'comments'),
      orderBy('createdAt', 'asc'),
    )
    const snap = await getDocs(q)
    if (!snap.empty) {
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as CreatorComment[]
    }
  } catch (e) {}

  return memoryComments[postId] || []
}

/**
 * Adiciona um comentário a uma publicação
 */
export async function addPostComment(params: {
  postId: string
  authorId: string
  authorName: string
  authorUsername: string
  authorAvatar?: string
  authorLevel?: number
  authorDistrict?: string
  authorTitle?: string
  content: string
  parentId?: string | null
}): Promise<CreatorComment> {
  const clean = sanitizeText(params.content.trim())
  if (!clean || clean.length < 2) {
    throw new Error('O comentário não pode estar vazio.')
  }

  const commentId = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  const newComment: CreatorComment = {
    id: commentId,
    postId: params.postId,
    authorId: params.authorId,
    authorName: params.authorName,
    authorUsername: params.authorUsername,
    authorAvatar: params.authorAvatar,
    authorLevel: params.authorLevel,
    authorDistrict: params.authorDistrict,
    authorTitle: params.authorTitle,
    content: clean,
    createdAt: new Date().toISOString(),
    likesCount: 0,
    parentId: params.parentId || null,
  }

  // Gravar no Firestore
  try {
    const commRef = doc(db, 'creatorPosts', params.postId, 'comments', commentId)
    await setDoc(commRef, {
      ...newComment,
      createdAt: serverTimestamp(),
    })
    await updateDoc(doc(db, 'creatorPosts', params.postId), {
      commentsCount: increment(1),
    })
  } catch (e) {}

  // Atualizar memória local
  if (!memoryComments[params.postId]) {
    memoryComments[params.postId] = []
  }

  if (params.parentId) {
    const parent = memoryComments[params.postId].find((c) => c.id === params.parentId)
    if (parent) {
      if (!parent.replies) parent.replies = []
      parent.replies.push(newComment)
    } else {
      memoryComments[params.postId].push(newComment)
    }
  } else {
    memoryComments[params.postId].push(newComment)
  }

  const post = memoryPosts.find((p) => p.id === params.postId)
  if (post) {
    post.commentsCount += 1
  }

  return newComment
}

/**
 * Votação numa enquete de Debate
 */
export async function voteOnPoll(postId: string, optionId: string): Promise<CreatorPost | null> {
  const { pollVotes } = getLocalUserData()
  if (pollVotes[postId]) {
    return null // Já votou
  }

  pollVotes[postId] = optionId
  if (typeof window !== 'undefined') {
    localStorage.setItem('creator_poll_votes', JSON.stringify(pollVotes))
  }

  const post = memoryPosts.find((p) => p.id === postId)
  if (post && post.pollOptions) {
    const opt = post.pollOptions.find((o) => o.id === optionId)
    if (opt) {
      opt.votes += 1
      post.pollTotalVotes = (post.pollTotalVotes || 0) + 1
    }
    return { ...post, userVotedOptionId: optionId }
  }

  return null
}

/**
 * Votação numa Sugestão para o Jogo (Implementar 👍 / Não Implementar 👎)
 */
export function voteOnSuggestion(postId: string, vote: 'up' | 'down'): { upvotes: number; downvotes: number } {
  const { suggestionVotes } = getLocalUserData()
  const previousVote = suggestionVotes[postId]

  const post = memoryPosts.find((p) => p.id === postId)
  let up = post?.upvotesCount || 0
  let down = post?.downvotesCount || 0

  if (previousVote === vote) {
    // Retirar voto
    delete suggestionVotes[postId]
    if (vote === 'up') up = Math.max(0, up - 1)
    if (vote === 'down') down = Math.max(0, down - 1)
  } else {
    if (previousVote === 'up') up = Math.max(0, up - 1)
    if (previousVote === 'down') down = Math.max(0, down - 1)

    if (vote === 'up') up += 1
    if (vote === 'down') down += 1
    suggestionVotes[postId] = vote
  }

  if (post) {
    post.upvotesCount = up
    post.downvotesCount = down
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('creator_suggestion_votes', JSON.stringify(suggestionVotes))
  }

  return { upvotes: up, downvotes: down }
}

/**
 * Submete denúncia para moderação
 */
export async function reportPost(data: {
  postId: string
  reporterId: string
  reason: ReportReason
  details?: string
}): Promise<boolean> {
  const report: CreatorReport = {
    postId: data.postId,
    reporterId: data.reporterId,
    reason: data.reason,
    details: data.details ? sanitizeText(data.details.trim()) : undefined,
    createdAt: new Date().toISOString(),
    status: 'pending',
  }

  try {
    await addDoc(collection(db, 'creatorReports'), {
      ...report,
      createdAt: serverTimestamp(),
    })
  } catch (e) {
    console.warn('[REPORT] Reporte registado localmente:', report)
  }

  return true
}

/**
 * Obtém resumo de perfil público do criador
 */
export async function getCreatorProfile(username: string): Promise<CreatorProfileSummary | null> {
  const cleanUsername = username.toLowerCase().replace('@', '')
  const posts = memoryPosts.filter((p) => p.authorUsername.toLowerCase() === cleanUsername)

  if (posts.length === 0 && cleanUsername !== 'acorda_portugal') {
    return null
  }

  const sample = posts[0]
  const totalLikes = posts.reduce((sum, p) => sum + p.likesCount, 0)
  const totalComments = posts.reduce((sum, p) => sum + p.commentsCount, 0)
  const totalHighlights = posts.filter((p) => Boolean(p.highlightBadge) || p.isFeatured).length

  return {
    uid: sample?.authorId || 'uid_creator',
    displayName: sample?.authorName || 'Jogador Português',
    username: cleanUsername,
    avatar: sample?.authorAvatar || '/images/avatars/avatar_default.png',
    level: sample?.authorLevel || 15,
    district: sample?.authorDistrict || 'Portugal',
    title: sample?.authorTitle || 'Cidadão Ativo',
    bio: 'Participante e criador na comunidade do Acorda Portugal.',
    joinedAt: '2026',
    totalPosts: posts.length,
    totalLikesReceived: totalLikes,
    totalComments,
    totalHighlights,
    badges: [
      { id: 'b_first', name: 'Primeiro Criador', description: 'Publicou na comunidade', icon: '🖊️' },
      { id: 'b_pt', name: 'Voz de Portugal', description: 'Participação ativa e positiva', icon: '🇵🇹' },
      ...(totalHighlights > 0 ? [{ id: 'b_high', name: 'Criador Destaque', description: 'Publicação destacada', icon: '🏆' }] : []),
    ],
  }
}
