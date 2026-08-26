/**
 * Tipos Oficiais do Módulo «OS CRIADORES» 🇵🇹
 * Acorda Portugal — Desafio Nacional
 */

export type CreatorCategorySlug =
  | 'desabafos'
  | 'ideias'
  | 'humor'
  | 'historias'
  | 'portugal'
  | 'opinioes'
  | 'sugestoes'
  | 'debates'
  | 'destaques'

export interface CreatorCategoryInfo {
  slug: CreatorCategorySlug
  name: string
  icon: string
  tagline: string
  description: string
  accentColor: string
  badgeBg: string
  borderColor: string
}

export type SuggestionStatus =
  | 'sugestao'
  | 'em_votacao'
  | 'em_analise'
  | 'em_desenvolvimento'
  | 'implementada'
  | 'recusada'

export interface PollOption {
  id: string
  text: string
  votes: number
}

export type ModerationStatus = 'pending' | 'approved' | 'hidden' | 'removed'

export type HighlightBadgeType =
  | 'publicacao_do_dia'
  | 'tendencia'
  | 'melhor_ideia'
  | 'humor_do_dia'
  | 'espirito_portugues'
  | 'mais_gostada'
  | 'ideia_criativa'
  | 'oficial_acorda_portugal'

export interface CreatorPost {
  id: string
  authorId: string
  authorName: string
  authorUsername: string
  authorAvatar?: string
  authorLevel?: number
  authorDistrict?: string
  authorTitle?: string
  isAnonymous?: boolean
  isOfficial?: boolean
  category: CreatorCategorySlug
  title: string
  content: string
  imageUrl?: string
  createdAt: string | number | Date
  updatedAt?: string | number | Date
  likesCount: number
  commentsCount: number
  sharesCount: number
  savesCount?: number
  isFeatured?: boolean
  highlightBadge?: HighlightBadgeType
  moderationStatus: ModerationStatus

  // Suporte a Sugestões para o Jogo
  isSuggestion?: boolean
  suggestionStatus?: SuggestionStatus
  upvotesCount?: number
  downvotesCount?: number

  // Suporte a Debates e Enquetes
  isPoll?: boolean
  pollQuestion?: string
  pollOptions?: PollOption[]
  pollTotalVotes?: number
  userVotedOptionId?: string

  // Estado local do utilizador
  hasLiked?: boolean
  hasSaved?: boolean
  userVote?: 'up' | 'down' | null
}

export interface CreatorComment {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorUsername: string
  authorAvatar?: string
  authorLevel?: number
  authorDistrict?: string
  authorTitle?: string
  content: string
  createdAt: string | number | Date
  likesCount: number
  parentId?: string | null
  replies?: CreatorComment[]
  hasLiked?: boolean
  isOfficial?: boolean
}

export type ReportReason =
  | 'spam'
  | 'assedio'
  | 'discurso_odio'
  | 'conteudo_sexual'
  | 'violencia'
  | 'informacao_pessoal'
  | 'fraude'
  | 'conteudo_ilegal'
  | 'outro'

export interface CreatorReport {
  id?: string
  postId: string
  reporterId: string
  reason: ReportReason
  details?: string
  createdAt: string | number | Date
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
}

export interface CreatorProfileSummary {
  uid: string
  displayName: string
  username: string
  avatar: string
  level: number
  district?: string
  title?: string
  bio?: string
  joinedAt: string
  totalPosts: number
  totalLikesReceived: number
  totalComments: number
  totalHighlights: number
  badges: CreatorBadge[]
}

export interface CreatorBadge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
}

export interface CommunityDailyChallenge {
  id: string
  date: string
  title: string
  question: string
  author: string
  participantsCount: number
  featuredResponse?: {
    authorName: string
    authorDistrict: string
    text: string
  }
}
