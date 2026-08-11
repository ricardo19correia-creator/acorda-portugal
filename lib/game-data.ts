// Mock/demo data for the Acorda Portugal visual prototype.
// No backend yet — all figures are fictional for showcasing the UI.

import type { LucideIcon } from 'lucide-react'
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
} from 'lucide-react'

export type Tone = 'primary' | 'gold' | 'red' | 'accent'

export type Category = {
  name: string
  icon: LucideIcon
  tone: Tone
  description: string
  questions: string
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Variado'
  special?: boolean
}

export const CATEGORIES: Category[] = [
  {
    name: 'Portugal',
    icon: Flag,
    tone: 'primary',
    description: 'Testa o que sabes sobre o país.',
    questions: '1.240',
    difficulty: 'Variado',
  },
  {
    name: 'História',
    icon: Landmark,
    tone: 'gold',
    description: 'Dos Descobrimentos aos dias de hoje.',
    questions: '980',
    difficulty: 'Médio',
  },
  {
    name: 'Geografia',
    icon: Globe,
    tone: 'primary',
    description: 'Rios, serras, distritos e capitais.',
    questions: '760',
    difficulty: 'Médio',
  },
  {
    name: 'Desporto',
    icon: Medal,
    tone: 'red',
    description: 'Futebol, olímpicos e lendas nacionais.',
    questions: '1.050',
    difficulty: 'Fácil',
  },
  {
    name: 'Música',
    icon: Music,
    tone: 'accent',
    description: 'Do fado ao pop português.',
    questions: '640',
    difficulty: 'Médio',
  },
  {
    name: 'Cinema & TV',
    icon: Clapperboard,
    tone: 'accent',
    description: 'Filmes, séries e novelas icónicas.',
    questions: '520',
    difficulty: 'Médio',
  },
  {
    name: 'Gastronomia',
    icon: UtensilsCrossed,
    tone: 'gold',
    description: 'Pratos, doces e sabores de norte a sul.',
    questions: '480',
    difficulty: 'Fácil',
  },
  {
    name: 'Cultura',
    icon: Drama,
    tone: 'primary',
    description: 'Tradições, arte e património.',
    questions: '610',
    difficulty: 'Médio',
  },
  {
    name: 'Ciência',
    icon: FlaskConical,
    tone: 'accent',
    description: 'Do átomo ao universo.',
    questions: '720',
    difficulty: 'Difícil',
  },
  {
    name: 'Tecnologia',
    icon: Cpu,
    tone: 'primary',
    description: 'Gadgets, código e inovação.',
    questions: '540',
    difficulty: 'Médio',
  },
  {
    name: 'Mundo',
    icon: Earth,
    tone: 'gold',
    description: 'Países, bandeiras e curiosidades.',
    questions: '890',
    difficulty: 'Médio',
  },
  {
    name: 'Conhecimentos Gerais',
    icon: Lightbulb,
    tone: 'primary',
    description: 'Um pouco de tudo para todos.',
    questions: '1.480',
    difficulty: 'Variado',
  },
  {
    name: 'Modo Maluco',
    icon: Laugh,
    tone: 'red',
    description: 'Perguntas que não fazem sentido. Mas têm resposta.',
    questions: '260',
    difficulty: 'Variado',
    special: true,
  },
]

export type Player = {
  pos: number
  name: string
  district: string
  level: number
  xp: string
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
  { pos: 1, name: 'Porto', players: '18 420', xp: '2 940 300' },
  { pos: 2, name: 'Lisboa', players: '21 050', xp: '2 880 120' },
  { pos: 3, name: 'Braga', players: '9 640', xp: '1 420 900' },
  { pos: 4, name: 'Aveiro', players: '7 210', xp: '980 400' },
  { pos: 5, name: 'Coimbra', players: '5 980', xp: '742 100' },
  { pos: 6, name: 'Setúbal', players: '6 340', xp: '690 550' },
  { pos: 7, name: 'Vila Real', players: '1 248', xp: '182 450' },
]

export type Level = {
  level: number
  title: string
  xp: string
}

export const LEVELS: Level[] = [
  { level: 1, title: 'Curioso', xp: '0' },
  { level: 2, title: 'Aprendiz', xp: '1.000' },
  { level: 3, title: 'Conhecedor', xp: '5.000' },
  { level: 4, title: 'Especialista', xp: '15.000' },
  { level: 5, title: 'Mestre', xp: '40.000' },
]

export type Mission = {
  icon: 'target' | 'flame' | 'brain'
  title: string
  reward: string
  progress: number
  total: number
  gold?: boolean
}

export const MISSIONS: Mission[] = [
  { icon: 'target', title: 'Responder a 10 perguntas', reward: '+100 XP', progress: 3, total: 10 },
  { icon: 'flame', title: 'Acertar 5 seguidas', reward: '+€50', progress: 4, total: 5, gold: true },
  { icon: 'brain', title: 'Jogar 3 partidas', reward: '+150 XP', progress: 1, total: 3 },
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
  icon: 'coins' | 'star' | 'trophy' | 'flame' | 'crown'
  title: string
  text: string
  tone: Tone
}

export const ACHIEVEMENTS: Achievement[] = [
  { icon: 'coins', title: 'Euros virtuais', text: 'Moeda do jogo para desbloquear extras.', tone: 'gold' },
  { icon: 'star', title: 'XP', text: 'Sobe de nível a cada resposta certa.', tone: 'primary' },
  { icon: 'trophy', title: 'Conquistas', text: 'Coleciona distintivos raros.', tone: 'gold' },
  { icon: 'flame', title: 'Streak', text: 'Joga todos os dias sem falhar.', tone: 'red' },
  { icon: 'crown', title: 'Rankings', text: 'Chega ao topo nacional e do teu distrito.', tone: 'primary' },
]

export type QuizQuestion = {
  category: string
  index: number
  total: number
  question: string
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[]
  correct: 'A' | 'B' | 'C' | 'D'
  explanation: string
  points: number
}

export const DEMO_QUIZ: QuizQuestion[] = [
  {
    category: 'Geografia',
    index: 5,
    total: 20,
    question: 'Qual é o distrito português com maior área?',
    options: [
      { key: 'A', text: 'Bragança' },
      { key: 'B', text: 'Beja' },
      { key: 'C', text: 'Évora' },
      { key: 'D', text: 'Viseu' },
    ],
    correct: 'B',
    explanation: 'Beja é o maior distrito de Portugal, com cerca de 10 225 km² no coração do Alentejo.',
    points: 500,
  },
  {
    category: 'História',
    index: 6,
    total: 20,
    question: 'Em que ano foi assinado o Tratado de Windsor entre Portugal e Inglaterra?',
    options: [
      { key: 'A', text: '1386' },
      { key: 'B', text: '1415' },
      { key: 'C', text: '1290' },
      { key: 'D', text: '1500' },
    ],
    correct: 'A',
    explanation: 'O Tratado de Windsor (1386) selou a aliança luso-britânica, a mais antiga do mundo ainda em vigor.',
    points: 500,
  },
]
