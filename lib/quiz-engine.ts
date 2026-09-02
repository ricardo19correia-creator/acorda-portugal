// Acorda Portugal — Quiz Engine Architecture (Phase 1 & Phase 2 Ready)
// Centralized definitions for game modes, categories, cities, districts, and question metadata.

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
  MapPin,
  Building2,
  Swords,
  Sparkles,
  BookOpen,
  Film,
  Disc,
  History,
  Languages,
  Atom,
  HelpCircle,
  Clock,
  Compass,
  TrendingUp,
  Vote,
  Briefcase,
  Eye,
} from 'lucide-react'

export type GameDifficulty = 1 | 2 | 3 | 4 | 5

export interface DifficultyConfig {
  level: GameDifficulty
  name: string
  label: string
  xpMultiplier: number
  coinMultiplier: number
  color: string
  badgeClass: string
}

export const DIFFICULTY_LEVELS: Record<GameDifficulty, DifficultyConfig> = {
  1: {
    level: 1,
    name: 'Fácil',
    label: 'Nível 1 — Fácil',
    xpMultiplier: 1.0,
    coinMultiplier: 1.0,
    color: '#22c55e',
    badgeClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  },
  2: {
    level: 2,
    name: 'Normal',
    label: 'Nível 2 — Normal',
    xpMultiplier: 1.2,
    coinMultiplier: 1.2,
    color: '#3b82f6',
    badgeClass: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  },
  3: {
    level: 3,
    name: 'Difícil',
    label: 'Nível 3 — Difícil',
    xpMultiplier: 1.5,
    coinMultiplier: 1.5,
    color: '#f97316',
    badgeClass: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
  },
  4: {
    level: 4,
    name: 'Muito Difícil',
    label: 'Nível 4 — Muito Difícil',
    xpMultiplier: 2.0,
    coinMultiplier: 2.0,
    color: '#ef4444',
    badgeClass: 'border-red-500/40 bg-red-500/10 text-red-400',
  },
  5: {
    level: 5,
    name: 'Mestre',
    label: 'Nível 5 — Mestre',
    xpMultiplier: 3.0,
    coinMultiplier: 3.0,
    color: '#a855f7',
    badgeClass: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
  },
}

export * from '@/lib/categories-data'

export type CategoryGroupKey = 'portugal' | 'conhecimento_geral' | 'entretenimento_especial'

export interface HubCategory {
  slug: string
  name: string
  group: CategoryGroupKey
  description: string
  icon: ComponentType<{ className?: string }>
  tone: 'primary' | 'gold' | 'red' | 'accent' | 'purple'
  questionCountEstimate: number
  difficultyLabel: string
  special?: boolean
}

export const HUB_CATEGORIES: HubCategory[] = [
  // ==========================================
  // GRUPO 1: 🇵🇹 PORTUGAL & SOCIEDADE
  // ==========================================
  {
    slug: 'portugal',
    name: 'Portugal',
    group: 'portugal',
    description: 'A identidade, raízes, história, geografia e encantos de Portugal.',
    icon: Flag,
    tone: 'primary',
    questionCountEstimate: 3247,
    difficultyLabel: 'Variado',
  },
  {
    slug: 'futebol-portugues',
    name: 'Futebol Português',
    group: 'portugal',
    description: 'Clubes, craques, seleção das quinas, estádios e dérbis históricos.',
    icon: Trophy,
    tone: 'red',
    questionCountEstimate: 1110,
    difficultyLabel: 'Variado',
  },
  {
    slug: 'atualidade',
    name: 'Atualidade — Portugal Agora',
    group: 'portugal',
    description: 'Factos recentes, economia, sociedade e acontecimentos nacionais verificáveis.',
    icon: TrendingUp,
    tone: 'primary',
    questionCountEstimate: 750,
    difficultyLabel: 'Médio',
  },
  {
    slug: 'portugal-politico',
    name: 'Portugal Político',
    group: 'portugal',
    description: 'História política, constituição, instituições e eleições democráticas.',
    icon: Vote,
    tone: 'gold',
    questionCountEstimate: 950,
    difficultyLabel: 'Médio',
  },
  {
    slug: 'empresas-portuguesas',
    name: 'Empresas Portuguesas',
    group: 'portugal',
    description: 'Marcas históricas, inovação, fundadores e economia lusa.',
    icon: Briefcase,
    tone: 'primary',
    questionCountEstimate: 850,
    difficultyLabel: 'Médio',
  },

  // ==========================================
  // GRUPO 2: 🌍 CONHECIMENTO & SABER
  // ==========================================
  {
    slug: 'historia',
    name: 'História',
    group: 'conhecimento_geral',
    description: 'Dos grandes reis e Descobrimentos às civilizações da antiguidade.',
    icon: Landmark,
    tone: 'gold',
    questionCountEstimate: 1300,
    difficultyLabel: 'Médio',
  },
  {
    slug: 'geografia',
    name: 'Geografia',
    group: 'conhecimento_geral',
    description: 'Capitais do mundo, rios, ilhas, serras, oceanos e fronteiras.',
    icon: Globe,
    tone: 'primary',
    questionCountEstimate: 1405,
    difficultyLabel: 'Médio',
  },
  {
    slug: 'ciencia-tecnologia',
    name: 'Ciência e Tecnologia',
    group: 'conhecimento_geral',
    description: 'Invenções, inteligência artificial, física, biologia e o universo.',
    icon: FlaskConical,
    tone: 'accent',
    questionCountEstimate: 918,
    difficultyLabel: 'Médio',
  },
  {
    slug: 'cultura',
    name: 'Cultura',
    group: 'conhecimento_geral',
    description: 'Artes plásticas, literatura, teatro, folclore e património.',
    icon: Drama,
    tone: 'accent',
    questionCountEstimate: 1324,
    difficultyLabel: 'Variado',
  },
  {
    slug: 'gastronomia',
    name: 'Gastronomia',
    group: 'conhecimento_geral',
    description: 'Pratos típicos, doçaria, vinhos, queijos e culinária internacional.',
    icon: UtensilsCrossed,
    tone: 'gold',
    questionCountEstimate: 1068,
    difficultyLabel: 'Fácil',
  },
  {
    slug: 'personalidades',
    name: 'Personalidades',
    group: 'conhecimento_geral',
    description: 'Figuras históricas, escritores, cientistas, artistas e atletas lendários.',
    icon: Lightbulb,
    tone: 'primary',
    questionCountEstimate: 800,
    difficultyLabel: 'Médio',
  },
  {
    slug: 'mundo',
    name: 'Mundo',
    group: 'conhecimento_geral',
    description: 'Culturas globais, capitais, história mundial e geopolítica.',
    icon: Earth,
    tone: 'primary',
    questionCountEstimate: 800,
    difficultyLabel: 'Variado',
  },

  // ==========================================
  // GRUPO 3: 🤯 ENTRETENIMENTO & ESPECIAL
  // ==========================================
  {
    slug: 'desporto',
    name: 'Desporto',
    group: 'entretenimento_especial',
    description: 'Jogos Olímpicos, atletismo, ténis, ciclismo, surf e F1.',
    icon: Medal,
    tone: 'red',
    questionCountEstimate: 830,
    difficultyLabel: 'Variado',
  },
  {
    slug: 'humor',
    name: 'Humor',
    group: 'entretenimento_especial',
    description: 'Expressões portuguesas, piadas, memes e tiradas inesquecíveis.',
    icon: Laugh,
    tone: 'gold',
    questionCountEstimate: 800,
    difficultyLabel: 'Fácil',
  },
  {
    slug: 'musica',
    name: 'Música',
    group: 'entretenimento_especial',
    description: 'Do Fado ao Rock, do Pop aos festivais e bandas lendárias.',
    icon: Music,
    tone: 'accent',
    questionCountEstimate: 824,
    difficultyLabel: 'Variado',
  },
  {
    slug: 'cinema-tv',
    name: 'Cinema e Televisão',
    group: 'entretenimento_especial',
    description: 'Filmes icónicos, séries, novelas portuguesas e realizadores.',
    icon: Clapperboard,
    tone: 'red',
    questionCountEstimate: 917,
    difficultyLabel: 'Médio',
  },
  {
    slug: 'desafio-visual',
    name: 'Desafio Visual',
    group: 'entretenimento_especial',
    description: 'Imagens, monumentos, bandeiras, brasões e detalhe visual.',
    icon: Eye,
    tone: 'purple',
    questionCountEstimate: 750,
    difficultyLabel: 'Médio',
    special: true,
  },
  {
    slug: 'modo-maluco',
    name: 'Modo Maluco',
    group: 'entretenimento_especial',
    description: 'Humor absurdo, perguntas inesperadas e regras com toque de caos.',
    icon: Laugh,
    tone: 'red',
    questionCountEstimate: 1418,
    difficultyLabel: 'Insano',
    special: true,
  },
]

// ==========================================
// LISTA DE CIDADES / CONCELHOS DE PORTUGAL
// ==========================================
export interface PortugueseCity {
  name: string
  district: string
  region: 'Norte' | 'Centro' | 'Lisboa e Vale do Tejo' | 'Alentejo' | 'Algarve' | 'Açores' | 'Madeira'
  highlight?: boolean
}

export const PORTUGUESE_CITIES: PortugueseCity[] = [
  { name: 'Vila Real', district: 'Vila Real', region: 'Norte', highlight: true },
  { name: 'Porto', district: 'Porto', region: 'Norte', highlight: true },
  { name: 'Lisboa', district: 'Lisboa', region: 'Lisboa e Vale do Tejo', highlight: true },
  { name: 'Braga', district: 'Braga', region: 'Norte', highlight: true },
  { name: 'Coimbra', district: 'Coimbra', region: 'Centro', highlight: true },
  { name: 'Aveiro', district: 'Aveiro', region: 'Centro', highlight: true },
  { name: 'Faro', district: 'Faro', region: 'Algarve', highlight: true },
  { name: 'Viseu', district: 'Viseu', region: 'Centro', highlight: true },
  { name: 'Leiria', district: 'Leiria', region: 'Centro', highlight: true },
  { name: 'Évora', district: 'Évora', region: 'Alentejo', highlight: true },
  { name: 'Guimarães', district: 'Braga', region: 'Norte', highlight: true },
  { name: 'Setúbal', district: 'Setúbal', region: 'Lisboa e Vale do Tejo', highlight: true },
  { name: 'Funchal', district: 'Madeira', region: 'Madeira', highlight: true },
  { name: 'Ponta Delgada', district: 'Açores', region: 'Açores', highlight: true },
  { name: 'Bragança', district: 'Bragança', region: 'Norte' },
  { name: 'Guarda', district: 'Guarda', region: 'Centro' },
  { name: 'Castelo Branco', district: 'Castelo Branco', region: 'Centro' },
  { name: 'Santarém', district: 'Santarém', region: 'Lisboa e Vale do Tejo' },
  { name: 'Portalegre', district: 'Portalegre', region: 'Alentejo' },
  { name: 'Beja', district: 'Beja', region: 'Alentejo' },
  { name: 'Viana do Castelo', district: 'Viana do Castelo', region: 'Norte' },
  { name: 'Cascais', district: 'Lisboa', region: 'Lisboa e Vale do Tejo' },
  { name: 'Sintra', district: 'Lisboa', region: 'Lisboa e Vale do Tejo' },
  { name: 'Matosinhos', district: 'Porto', region: 'Norte' },
  { name: 'Vila Nova de Gaia', district: 'Porto', region: 'Norte' },
  { name: 'Chaves', district: 'Vila Real', region: 'Norte' },
  { name: 'Lamego', district: 'Viseu', region: 'Norte' },
  { name: 'Figueira da Foz', district: 'Coimbra', region: 'Centro' },
  { name: 'Caldas da Rainha', district: 'Leiria', region: 'Centro' },
  { name: 'Portimão', district: 'Faro', region: 'Algarve' },
  { name: 'Lagos', district: 'Faro', region: 'Algarve' },
  { name: 'Tavira', district: 'Faro', region: 'Algarve' },
  { name: 'Elvas', district: 'Portalegre', region: 'Alentejo' },
  { name: 'Angra do Heroísmo', district: 'Açores', region: 'Açores' },
]

// ==========================================
// LISTA DOS 20 DISTRITOS E REGIÕES
// ==========================================
export const ALL_20_DISTRICTS = [
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Vila Real',
  'Viseu',
  'Açores',
  'Madeira',
]

// ==========================================
// PHASE 2 SCHEMA SPECIFICATION
// ==========================================
export interface QuestionDataSchema {
  id: number | string
  question: string
  options: string[] | { key: 'A' | 'B' | 'C' | 'D'; text: string }[]
  correctAnswer: string
  explanation?: string
  category: string
  subcategory?: string
  city?: string
  district?: string
  difficultyLevel: GameDifficulty
  type: 'multiple_choice' | 'true_false' | 'who_am_i' | 'crazy'
  xpReward: number
  coinReward: number
  source?: string
  active: boolean
}
