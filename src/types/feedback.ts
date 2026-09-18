export type FeedbackType =
  | 'erro'
  | 'melhoria'
  | 'funcionalidade'
  | 'experiencia'
  | 'outro'

export type FeedbackStatus =
  | 'NEW'
  | 'IN_REVIEW'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'

export type FeedbackPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'

export type FeedbackLocation =
  | 'Home'
  | 'Jogar'
  | 'Partida'
  | 'Multiplayer'
  | 'Eventos'
  | 'Ranking'
  | 'Perfil'
  | 'Loja'
  | 'Login/Registo'
  | 'Outro'

export interface FeedbackItem {
  id: string
  userId: string
  userDisplayName: string
  userEmail?: string
  userPhotoURL?: string

  type: FeedbackType
  title: string
  description: string
  location?: FeedbackLocation
  reproductionSteps?: string

  status: FeedbackStatus
  priority: FeedbackPriority

  createdAt: any
  updatedAt: any

  adminNotes?: string
  resolvedAt?: any
  resolvedBy?: string

  appVersion: string
  platform: string
  userAgent?: string
}

export interface FeedbackTypeConfig {
  id: FeedbackType
  label: string
  emoji: string
  badgeClass: string
  borderClass: string
  description: string
}

export const FEEDBACK_TYPES: FeedbackTypeConfig[] = [
  {
    id: 'erro',
    label: 'Reportar erro',
    emoji: '🐛',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    borderClass: 'border-rose-500/40 hover:border-rose-500',
    description: 'Encontraste um bug ou comportamento inesperado no jogo',
  },
  {
    id: 'melhoria',
    label: 'Sugerir melhoria',
    emoji: '💡',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    borderClass: 'border-amber-500/40 hover:border-amber-500',
    description: 'Tens uma ideia para otimizar ou aperfeiçoar algo existente',
  },
  {
    id: 'funcionalidade',
    label: 'Sugerir funcionalidade',
    emoji: '🚀',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    borderClass: 'border-cyan-500/40 hover:border-cyan-500',
    description: 'Gostarias de ver um modo, mecânica ou recurso totalmente novo',
  },
  {
    id: 'experiencia',
    label: 'Experiência de jogo',
    emoji: '🎮',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    borderClass: 'border-emerald-500/40 hover:border-emerald-500',
    description: 'Opiniões sobre jogabilidade, ritmo, perguntas, arenas ou sons',
  },
  {
    id: 'outro',
    label: 'Outro',
    emoji: '❓',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    borderClass: 'border-purple-500/40 hover:border-purple-500',
    description: 'Qualquer outra dúvida, sugestão ou questão geral',
  },
]

export const FEEDBACK_STATUSES: Record<
  FeedbackStatus,
  { label: string; badgeClass: string; color: string; dotClass: string }
> = {
  NEW: {
    label: 'Novo',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    color: '#60a5fa',
    dotClass: 'bg-blue-400',
  },
  IN_REVIEW: {
    label: 'Em análise',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    color: '#fbbf24',
    dotClass: 'bg-amber-400',
  },
  PLANNED: {
    label: 'Planeado',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    color: '#c084fc',
    dotClass: 'bg-purple-400',
  },
  IN_PROGRESS: {
    label: 'Em desenvolvimento',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    color: '#22d3ee',
    dotClass: 'bg-cyan-400',
  },
  RESOLVED: {
    label: 'Resolvido',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    color: '#34d399',
    dotClass: 'bg-emerald-400',
  },
  REJECTED: {
    label: 'Não aceite',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    color: '#94a3b8',
    dotClass: 'bg-slate-400',
  },
}

export const FEEDBACK_PRIORITIES: Record<
  FeedbackPriority,
  { label: string; badgeClass: string; order: number }
> = {
  LOW: {
    label: 'Baixa',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    order: 1,
  },
  MEDIUM: {
    label: 'Média',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    order: 2,
  },
  HIGH: {
    label: 'Alta',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    order: 3,
  },
  CRITICAL: {
    label: 'Crítica',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
    order: 4,
  },
}

export const FEEDBACK_LOCATIONS: FeedbackLocation[] = [
  'Home',
  'Jogar',
  'Partida',
  'Multiplayer',
  'Eventos',
  'Ranking',
  'Perfil',
  'Loja',
  'Login/Registo',
  'Outro',
]

export const APP_FEEDBACK_VERSION = '1.0.0-beta'
