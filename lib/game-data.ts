// Acorda Portugal — Game Data
// Base de dados local/demo do protótipo.

import type { ComponentType } from 'react'
import {
  Flag,
  Landmark,
  Globe,
  Medal,
  Music,
  UtensilsCrossed,
  Clapperboard,
  Lightbulb,
  Laugh,
  FlaskConical,
  Cpu,
  Earth,
  Drama,
  Trophy,
  TrendingUp,
  Briefcase,
  Vote,
  Eye,
} from 'lucide-react'

export * from '@/lib/categories-data'

export type Tone = 'primary' | 'gold' | 'red' | 'accent'

export type Category = {
  slug: string
  name: string
  icon: ComponentType<{ className?: string }>
  tone: Tone
  description: string
  questions: string
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Variado'
  special?: boolean
}

export const CATEGORIES: Category[] = [
  {
    slug: 'portugal',
    name: 'Portugal',
    icon: Flag,
    tone: 'primary',
    description: 'A identidade, raízes, história, geografia e encantos de Portugal.',
    questions: '250',
    difficulty: 'Variado',
  },
  {
    slug: 'atualidade',
    name: 'Atualidade — Portugal Agora',
    icon: TrendingUp,
    tone: 'primary',
    description: 'Factos recentes, economia, sociedade e acontecimentos nacionais.',
    questions: '140',
    difficulty: 'Médio',
  },
  {
    slug: 'portugal-politico',
    name: 'Portugal Político',
    icon: Vote,
    tone: 'gold',
    description: 'História política, constituição, instituições e eleições.',
    questions: '110',
    difficulty: 'Médio',
  },
  {
    slug: 'empresas-portuguesas',
    name: 'Empresas Portuguesas',
    icon: Briefcase,
    tone: 'primary',
    description: 'Marcas históricas, inovação, fundadores e economia lusa.',
    questions: '90',
    difficulty: 'Médio',
  },
  {
    slug: 'futebol-portugues',
    name: 'Futebol Português',
    icon: Trophy,
    tone: 'red',
    description: 'Clubes, craques, seleção das quinas, estádios e dérbis.',
    questions: '200',
    difficulty: 'Variado',
  },
  {
    slug: 'desafio-visual',
    name: 'Desafio Visual',
    icon: Eye,
    tone: 'accent',
    description: 'Imagens, monumentos, bandeiras, brasões e detalhe visual.',
    questions: '120',
    difficulty: 'Médio',
    special: true,
  },
  {
    slug: 'modo-maluco',
    name: 'Modo Maluco',
    icon: Laugh,
    tone: 'red',
    description: 'Humor absurdo, armadilhas e lógica com um toque de caos.',
    questions: '150',
    difficulty: 'Variado',
    special: true,
  },
  {
    slug: 'historia',
    name: 'História',
    icon: Landmark,
    tone: 'gold',
    description: 'Dos grandes reis e Descobrimentos às eras da antiguidade.',
    questions: '180',
    difficulty: 'Médio',
  },
  {
    slug: 'geografia',
    name: 'Geografia',
    icon: Globe,
    tone: 'primary',
    description: 'Capitais do mundo, rios, ilhas, serras, oceanos e fronteiras.',
    questions: '160',
    difficulty: 'Médio',
  },
  {
    slug: 'ciencia-tecnologia',
    name: 'Ciência e Tecnologia',
    icon: FlaskConical,
    tone: 'accent',
    description: 'Invenções, inteligência artificial, física, biologia e o espaço.',
    questions: '140',
    difficulty: 'Médio',
  },
  {
    slug: 'cultura',
    name: 'Cultura',
    icon: Drama,
    tone: 'accent',
    description: 'Artes plásticas, literatura, teatro, folclore e património.',
    questions: '130',
    difficulty: 'Variado',
  },
  {
    slug: 'gastronomia',
    name: 'Gastronomia',
    icon: UtensilsCrossed,
    tone: 'gold',
    description: 'Pratos típicos, doçaria, vinhos, queijos e gastronomia mundial.',
    questions: '150',
    difficulty: 'Fácil',
  },
  {
    slug: 'desporto',
    name: 'Desporto',
    icon: Medal,
    tone: 'red',
    description: 'Jogos Olímpicos, atletismo, ténis, ciclismo, surf e F1.',
    questions: '140',
    difficulty: 'Variado',
  },
  {
    slug: 'humor',
    name: 'Humor',
    icon: Laugh,
    tone: 'gold',
    description: 'Expressões portuguesas, piadas, memes e tiradas inesquecíveis.',
    questions: '120',
    difficulty: 'Fácil',
  },
  {
    slug: 'musica',
    name: 'Música',
    icon: Music,
    tone: 'accent',
    description: 'Do Fado ao Rock, do Pop aos festivais e bandas lendárias.',
    questions: '150',
    difficulty: 'Variado',
  },
  {
    slug: 'cinema-tv',
    name: 'Cinema e Televisão',
    icon: Clapperboard,
    tone: 'red',
    description: 'Filmes icónicos, séries, novelas portuguesas e realizadores.',
    questions: '130',
    difficulty: 'Médio',
  },
  {
    slug: 'personalidades',
    name: 'Personalidades',
    icon: Lightbulb,
    tone: 'primary',
    description: 'Figuras históricas, escritores, cientistas, artistas e atletas.',
    questions: '140',
    difficulty: 'Médio',
  },
  {
    slug: 'mundo',
    name: 'Mundo',
    icon: Earth,
    tone: 'primary',
    description: 'Culturas globais, capitais, história mundial e geopolítica.',
    questions: '180',
    difficulty: 'Variado',
  },
]

export type Player = {
  pos: number
  name: string
  district: string
  level: number
  xp: string
}

export type EquippedCosmetics = {
  frame?: string | null
  title?: string | null
  theme?: string | null
  aura?: string | null
  sfx?: string | null
  soundpack?: string | null
  streak_effect?: string | null
}

export type UserProfile = {
  uid: string
  displayName: string
  username?: string
  email: string
  photoURL: string
  district: string
  level: number
  xp: number
  euros: number
  streak: number
  gamesPlayed: number
  wins?: number
  losses?: number
  questionsAnswered?: number
  correctAnswers: number
  incorrectAnswers: number
  totalQuestions: number
  bestStreak: number
  unlockedAchievements: string[]
  badges?: string[]
  inventory?: Record<string, number>
  equipped?: EquippedCosmetics
  createdAt?: unknown // Timestamp do Firestore quando disponível
  lastActiveAt?: unknown // Timestamp do Firestore quando disponível
  updatedAt?: unknown
}

export const NATIONAL_TOP: Player[] = [
  { pos: 1, name: 'Zé_Mestre', district: 'Porto', level: 47, xp: '182 450' },
  { pos: 2, name: 'AnaQuiz', district: 'Lisboa', level: 44, xp: '176 120' },
  { pos: 3, name: 'TugaBrain', district: 'Braga', level: 42, xp: '168 900' },
  { pos: 4, name: 'MiaSabe', district: 'Aveiro', level: 40, xp: '154 210' },
  { pos: 5, name: 'RuiRelâmpago', district: 'Coimbra', level: 39, xp: '149 640' },
  { pos: 6, name: 'CarlaGeo', district: 'Faro', level: 38, xp: '141 300' },
  { pos: 7, name: 'PedroPro', district: 'Setúbal', level: 37, xp: '138 470' },
  { pos: 8, name: 'InêsFado', district: 'Viseu', level: 36, xp: '132 090' },
  { pos: 9, name: 'JoãoFlash', district: 'Leiria', level: 35, xp: '127 800' },
  { pos: 10, name: 'SaraSpeed', district: 'Évora', level: 34, xp: '121 560' },
]

export type District = {
  pos: number
  name: string
  players: string
  xp: string
}

export const DISTRICTS: District[] = [
  { pos: 1, name: 'Porto', players: '0', xp: '0' },
  { pos: 2, name: 'Lisboa', players: '0', xp: '0' },
  { pos: 3, name: 'Braga', players: '0', xp: '0' },
  { pos: 4, name: 'Aveiro', players: '0', xp: '0' },
  { pos: 5, name: 'Coimbra', players: '0', xp: '0' },
  { pos: 6, name: 'Setúbal', players: '0', xp: '0' },
  { pos: 7, name: 'Vila Real', players: '0', xp: '0' },
  { pos: 8, name: 'Viseu', players: '0', xp: '0' },
  { pos: 9, name: 'Leiria', players: '0', xp: '0' },
  { pos: 10, name: 'Santarém', players: '0', xp: '0' },
  { pos: 11, name: 'Faro', players: '0', xp: '0' },
  { pos: 12, name: 'Viana do Castelo', players: '0', xp: '0' },
  { pos: 13, name: 'Castelo Branco', players: '0', xp: '0' },
  { pos: 14, name: 'Guarda', players: '0', xp: '0' },
  { pos: 15, name: 'Bragança', players: '0', xp: '0' },
  { pos: 16, name: 'Évora', players: '0', xp: '0' },
  { pos: 17, name: 'Beja', players: '0', xp: '0' },
  { pos: 18, name: 'Portalegre', players: '0', xp: '0' },
  { pos: 19, name: 'Açores', players: '0', xp: '0' },
  { pos: 20, name: 'Madeira', players: '0', xp: '0' },
]

import { PROGRESSION_LEVELS, calculateLevelProgress, type LevelTier, type LevelProgressInfo } from '@/lib/progression'

export type { LevelTier, LevelProgressInfo }
export { PROGRESSION_LEVELS, calculateLevelProgress }

export type Level = {
  level: number
  title: string
  xp: string
}

export const LEVELS: Level[] = PROGRESSION_LEVELS.map((tier) => ({
  level: tier.level,
  title: tier.cleanTitle,
  xp: tier.xpRequired.toLocaleString('pt-PT'),
}))

export type Mission = {
  icon: 'target' | 'flame' | 'brain'
  title: string
  reward: string
  progress: number
  total: number
  gold?: boolean
}

export const MISSIONS: Mission[] = [
  {
    icon: 'target',
    title: 'Responder a 10 perguntas',
    reward: '+100 XP',
    progress: 3,
    total: 10,
  },
  {
    icon: 'flame',
    title: 'Acertar 5 seguidas',
    reward: '+€50',
    progress: 4,
    total: 5,
    gold: true,
  },
  {
    icon: 'brain',
    title: 'Jogar 3 partidas',
    reward: '+150 XP',
    progress: 1,
    total: 3,
  },
]

export const WEEK_DAYS = [
  { label: 'Seg', done: true },
  { label: 'Ter', done: true },
  { label: 'Qua', done: true },
  { label: 'Qui', done: true },
  { label: 'Sex', done: true },
  { label: 'Sáb', done: true },
  { label: 'Dom', done: true },
]

export type GameEvent = {
  title: string
  tag: string
  tone: Tone
  reward: string
  timeLeft: string
  icon: 'flag' | 'flame' | 'medal' | 'laugh'
}

export const EVENTS: GameEvent[] = [
  {
    title: 'Desafio Nacional',
    tag: 'Ao vivo',
    tone: 'primary',
    reward: '5.000 XP + €500',
    timeLeft: 'Termina em 2d 14h',
    icon: 'flag',
  },
  {
    title: 'Semana de Portugal',
    tag: 'Especial',
    tone: 'red',
    reward: 'Distintivo exclusivo',
    timeLeft: 'Termina em 5d 03h',
    icon: 'flame',
  },
  {
    title: 'Especial Desporto',
    tag: 'Temático',
    tone: 'gold',
    reward: '+€250',
    timeLeft: 'Termina em 1d 08h',
    icon: 'medal',
  },
  {
    title: 'Modo Maluco',
    tag: 'Divertido',
    tone: 'accent',
    reward: '2× XP',
    timeLeft: 'Termina em 3d 20h',
    icon: 'laugh',
  },
]

export type Achievement = {
  id: string
  icon: 'coins' | 'star' | 'trophy' | 'flame' | 'crown'
  title: string
  text: string
  tone: Tone
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'euros-virtuais',
    icon: 'coins',
    title: 'Euros virtuais',
    text: 'Moeda do jogo para desbloquear extras.',
    tone: 'gold',
  },
  {
    id: 'xp',
    icon: 'star',
    title: 'XP',
    text: 'Sobe de nível a cada resposta certa.',
    tone: 'primary',
  },
  {
    id: 'conquistas',
    icon: 'trophy',
    title: 'Conquistas',
    text: 'Coleciona distintivos raros.',
    tone: 'gold',
  },
  {
    id: 'streak',
    icon: 'flame',
    title: 'Streak',
    text: 'Joga todos os dias sem falhar.',
    tone: 'red',
  },
  {
    id: 'rankings',
    icon: 'crown',
    title: 'Rankings',
    text: 'Chega ao topo nacional e do teu distrito.',
    tone: 'primary',
  },
]

export type QuizQuestion = {
  category: string
  index: number
  total: number
  question: string
  options: {
    key: 'A' | 'B' | 'C' | 'D'
    text: string
  }[]
  correct: 'A' | 'B' | 'C' | 'D'
  explanation: string
  points: number
}

import questions from './data/questions.json'

const allQuestions: QuizQuestion[] = (questions as any[]).map((q, i) => {
  const correctIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : q.options.indexOf(q.correctAnswer)
  const correctKey = ['A', 'B', 'C', 'D'][correctIndex >= 0 && correctIndex < 4 ? correctIndex : 0] as 'A' | 'B' | 'C' | 'D'
  const diff = String(q.difficulty || '').toLowerCase()
  const points = diff === 'difícil' || diff === 'dificil' ? 300 : diff === 'médio' || diff === 'medio' ? 200 : 100

  return {
    ...q,
    id: q.id || `q_${i + 1}`,
    index: i + 1,
    total: questions.length,
    points,
    options: q.options.map((text: string, optIdx: number) => ({ key: ['A', 'B', 'C', 'D'][optIdx] as 'A' | 'B' | 'C' | 'D', text })),
    correct: correctKey,
  }
})

export const ALL_QUIZ_QUESTIONS: QuizQuestion[] = allQuestions

export const MODO_MALUCO_QUESTIONS: QuizQuestion[] = allQuestions.filter(q => q.category === 'Modo Maluco')

export const DEMO_QUIZ: QuizQuestion[] = MODO_MALUCO_QUESTIONS.slice(0, 5)
