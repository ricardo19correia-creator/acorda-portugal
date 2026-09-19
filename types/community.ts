export type CommunityCategory =
  | 'sugestao'
  | 'erro'
  | 'jogo'
  | 'eventos'
  | 'loja'
  | 'app'
  | 'opiniao'
  | 'outro'

export interface CommunityCategoryInfo {
  id: CommunityCategory
  label: string
  emoji: string
  color: string
  bg: string
  border: string
}

export const COMMUNITY_CATEGORIES: Record<CommunityCategory, CommunityCategoryInfo> = {
  sugestao: {
    id: 'sugestao',
    label: 'Sugestão',
    emoji: '💡',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  erro: {
    id: 'erro',
    label: 'Erro',
    emoji: '🐛',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  jogo: {
    id: 'jogo',
    label: 'Jogo',
    emoji: '🎮',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  eventos: {
    id: 'eventos',
    label: 'Eventos',
    emoji: '🏆',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  loja: {
    id: 'loja',
    label: 'Loja',
    emoji: '🛒',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  app: {
    id: 'app',
    label: 'Aplicação',
    emoji: '📱',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  opiniao: {
    id: 'opiniao',
    label: 'Opinião',
    emoji: '💬',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  outro: {
    id: 'outro',
    label: 'Outro',
    emoji: '📢',
    color: 'text-zinc-400',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
  },
}

export type CommunityPostStatus = 'published' | 'hidden' | 'removed'

export interface CommunityPost {
  postId: string
  userId: string
  authorName: string
  authorAvatar: string
  message: string
  category: CommunityCategory
  createdAt: any
  updatedAt: any
  likesCount: number
  commentsCount: number
  status: CommunityPostStatus
  isEdited?: boolean
}

export interface CommunityComment {
  commentId: string
  postId: string
  userId: string
  authorName: string
  authorAvatar: string
  message: string
  createdAt: any
  updatedAt: any
  status: CommunityPostStatus
  isEdited?: boolean
}

export type ReportReason =
  | 'Conteúdo inadequado'
  | 'Spam'
  | 'Ofensa'
  | 'Publicidade'
  | 'Outro'

export const REPORT_REASONS: ReportReason[] = [
  'Conteúdo inadequado',
  'Spam',
  'Ofensa',
  'Publicidade',
  'Outro',
]

export interface CommunityReport {
  reportId: string
  reporterId: string
  reporterName?: string
  targetType: 'post' | 'comment'
  targetId: string
  postId: string
  targetContent?: string
  targetAuthorName?: string
  reason: ReportReason
  createdAt: any
  status: 'pending' | 'resolved' | 'dismissed'
}
