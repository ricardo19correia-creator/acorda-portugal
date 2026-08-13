// Acorda Portugal — Game Data
// Base de dados local/demo do protótipo.

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
    description: 'Perguntas absurdas, armadilhas e lógica com um toque de caos.',
    questions: '110',
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
  icon: 'coins' | 'star' | 'trophy' | 'flame' | 'crown'
  title: string
  text: string
  tone: Tone
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    icon: 'coins',
    title: 'Euros virtuais',
    text: 'Moeda do jogo para desbloquear extras.',
    tone: 'gold',
  },
  {
    icon: 'star',
    title: 'XP',
    text: 'Sobe de nível a cada resposta certa.',
    tone: 'primary',
  },
  {
    icon: 'trophy',
    title: 'Conquistas',
    text: 'Coleciona distintivos raros.',
    tone: 'gold',
  },
  {
    icon: 'flame',
    title: 'Streak',
    text: 'Joga todos os dias sem falhar.',
    tone: 'red',
  },
  {
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

export const MODO_MALUCO_QUESTIONS: QuizQuestion[] = [
  {
    "category": "Modo Maluco",
    "index": 1,
    "total": 125,
    "question": "Se um relógio toca às 3:00 e depois avança 15 minutos, que hora marca?",
    "options": [
      {
        "key": "A",
        "text": "3:15"
      },
      {
        "key": "B",
        "text": "3:00"
      },
      {
        "key": "C",
        "text": "2:45"
      },
      {
        "key": "D",
        "text": "3:30"
      }
    ],
    "correct": "A",
    "explanation": "Se o relógio avançou 15 minutos, a hora correta passa a ser 3:15.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 2,
    "total": 125,
    "question": "Se o teu amigo te diz “estou a beber água”, o que estás a ouvir?",
    "options": [
      {
        "key": "A",
        "text": "Uma afirmação literal"
      },
      {
        "key": "B",
        "text": "Uma dica para a chávena"
      },
      {
        "key": "C",
        "text": "Uma pergunta"
      },
      {
        "key": "D",
        "text": "Um ruído aleatório"
      }
    ],
    "correct": "A",
    "explanation": "A frase descreve um facto simples e literal, não uma charada.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 3,
    "total": 125,
    "question": "Uma pessoa tem 10 maçãs e dá 3. Quantas ficam na árvore?",
    "options": [
      {
        "key": "A",
        "text": "3"
      },
      {
        "key": "B",
        "text": "7"
      },
      {
        "key": "C",
        "text": "10"
      },
      {
        "key": "D",
        "text": "0"
      }
    ],
    "correct": "B",
    "explanation": "Se dá 3 das 10, fica com 7 maçãs.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 4,
    "total": 125,
    "question": "Qual é a palavra que chega sempre primeiro no dicionário?",
    "options": [
      {
        "key": "A",
        "text": "A"
      },
      {
        "key": "B",
        "text": "Abelha"
      },
      {
        "key": "C",
        "text": "Azul"
      },
      {
        "key": "D",
        "text": "Água"
      }
    ],
    "correct": "A",
    "explanation": "A letra A vem antes das outras letras do alfabeto.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 5,
    "total": 125,
    "question": "Se uma pessoa entra numa sala e a sala está vazia, quem está lá?",
    "options": [
      {
        "key": "A",
        "text": "A pessoa"
      },
      {
        "key": "B",
        "text": "Ninguém"
      },
      {
        "key": "C",
        "text": "O chão"
      },
      {
        "key": "D",
        "text": "A porta"
      }
    ],
    "correct": "A",
    "explanation": "Se entra, ela é a primeira presença no espaço.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 6,
    "total": 125,
    "question": "O que tem 4 patas, está em casa e não anda?",
    "options": [
      {
        "key": "A",
        "text": "Uma mesa"
      },
      {
        "key": "B",
        "text": "Um gato"
      },
      {
        "key": "C",
        "text": "Um humano"
      },
      {
        "key": "D",
        "text": "Uma cadeira"
      }
    ],
    "correct": "A",
    "explanation": "A mesa pode ter pernas sem se mexer.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 7,
    "total": 125,
    "question": "Se o professor diz “três mais três é seis”, qual é a parte mais ánsia?",
    "options": [
      {
        "key": "A",
        "text": "O professor"
      },
      {
        "key": "B",
        "text": "O cálculo"
      },
      {
        "key": "C",
        "text": "O lápis"
      },
      {
        "key": "D",
        "text": "O quadro"
      }
    ],
    "correct": "B",
    "explanation": "A questão é sobre a operação matemática em si.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 8,
    "total": 125,
    "question": "Qual é o único número que é ao mesmo tempo par e ímpar?",
    "options": [
      {
        "key": "A",
        "text": "0"
      },
      {
        "key": "B",
        "text": "1"
      },
      {
        "key": "C",
        "text": "2"
      },
      {
        "key": "D",
        "text": "Nenhum"
      }
    ],
    "correct": "D",
    "explanation": "Nenhum número é simultaneamente par e ímpar.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 9,
    "total": 125,
    "question": "Uma caixa tem 12 bolos. Tiras 4. Quantos bolos restam?",
    "options": [
      {
        "key": "A",
        "text": "8"
      },
      {
        "key": "B",
        "text": "4"
      },
      {
        "key": "C",
        "text": "12"
      },
      {
        "key": "D",
        "text": "16"
      }
    ],
    "correct": "A",
    "explanation": "12 menos 4 são 8.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 10,
    "total": 125,
    "question": "O que tem um lado e nenhum lado ao mesmo tempo?",
    "options": [
      {
        "key": "A",
        "text": "Uma moeda"
      },
      {
        "key": "B",
        "text": "Uma linha"
      },
      {
        "key": "C",
        "text": "Uma porta"
      },
      {
        "key": "D",
        "text": "Um espelho"
      }
    ],
    "correct": "B",
    "explanation": "Uma linha pode ter duas extremidades, mas o conceito de “lado” depende do contexto.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 11,
    "total": 125,
    "question": "Qual é o melhor dia para comprar roupa?",
    "options": [
      {
        "key": "A",
        "text": "Sábado"
      },
      {
        "key": "B",
        "text": "Quando está em saldo"
      },
      {
        "key": "C",
        "text": "Terça-feira"
      },
      {
        "key": "D",
        "text": "Domingo"
      }
    ],
    "correct": "B",
    "explanation": "A compra em promoção é a decisão certa, não o dia da semana.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 12,
    "total": 125,
    "question": "Se um corredor passa o segundo lugar, em que lugar fica?",
    "options": [
      {
        "key": "A",
        "text": "Primeiro"
      },
      {
        "key": "B",
        "text": "Segundo"
      },
      {
        "key": "C",
        "text": "Terceiro"
      },
      {
        "key": "D",
        "text": "Último"
      }
    ],
    "correct": "B",
    "explanation": "Passa a ocupar o segundo lugar ao ultrapassar quem estava na frente dele.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 13,
    "total": 125,
    "question": "O que fica mais molhado quanto mais seca?",
    "options": [
      {
        "key": "A",
        "text": "Uma toalha"
      },
      {
        "key": "B",
        "text": "Uma cadeira"
      },
      {
        "key": "C",
        "text": "Um livro"
      },
      {
        "key": "D",
        "text": "Uma cerveja"
      }
    ],
    "correct": "A",
    "explanation": "A toalha absorve a água enquanto seca outras coisas.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 14,
    "total": 125,
    "question": "Qual é o único instrumento que pode cantar sem ter boca?",
    "options": [
      {
        "key": "A",
        "text": "Piano"
      },
      {
        "key": "B",
        "text": "Guitarra"
      },
      {
        "key": "C",
        "text": "Violino"
      },
      {
        "key": "D",
        "text": "Trompete"
      }
    ],
    "correct": "A",
    "explanation": "O piano é frequentemente descrito como se cantasse com as teclas.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 15,
    "total": 125,
    "question": "Se chove todas as manhãs e alguém está a tomar banho, o que acontece?",
    "options": [
      {
        "key": "A",
        "text": "Fica molhado"
      },
      {
        "key": "B",
        "text": "Fica seco"
      },
      {
        "key": "C",
        "text": "Não chove"
      },
      {
        "key": "D",
        "text": "Nada"
      }
    ],
    "correct": "A",
    "explanation": "O banho não elimina a chuva que cai fora do chuveiro.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 16,
    "total": 125,
    "question": "Qual é a frase mais antiga do mundo?",
    "options": [
      {
        "key": "A",
        "text": "“Olá”"
      },
      {
        "key": "B",
        "text": "“Bom dia”"
      },
      {
        "key": "C",
        "text": "“Eram os deuses”"
      },
      {
        "key": "D",
        "text": "Nenhuma"
      }
    ],
    "correct": "D",
    "explanation": "Não há uma frase universalmente “mais antiga” sem contexto histórico.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 17,
    "total": 125,
    "question": "Se duas pessoas se encontram num lago e uma sai, quem continua lá?",
    "options": [
      {
        "key": "A",
        "text": "Uma"
      },
      {
        "key": "B",
        "text": "As duas"
      },
      {
        "key": "C",
        "text": "Ninguém"
      },
      {
        "key": "D",
        "text": "O lago"
      }
    ],
    "correct": "D",
    "explanation": "O lago continua no mesmo lugar, mesmo que as pessoas saiam.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 18,
    "total": 125,
    "question": "Qual a palavra que se lê igual da esquerda para a direita e de trás para frente?",
    "options": [
      {
        "key": "A",
        "text": "Nuvem"
      },
      {
        "key": "B",
        "text": "Radar"
      },
      {
        "key": "C",
        "text": "Casa"
      },
      {
        "key": "D",
        "text": "Porta"
      }
    ],
    "correct": "B",
    "explanation": "Radar é palíndromo.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 19,
    "total": 125,
    "question": "Se uma galinha atravessa uma estrada e outra também, onde vai o ovo?",
    "options": [
      {
        "key": "A",
        "text": "No caminho"
      },
      {
        "key": "B",
        "text": "No ninho"
      },
      {
        "key": "C",
        "text": "No mercado"
      },
      {
        "key": "D",
        "text": "Não há ovo sem galinha"
      }
    ],
    "correct": "D",
    "explanation": "A charada depende de uma premissa muito pouco realista.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 20,
    "total": 125,
    "question": "Em que cidade é mais fácil encontrar um rio que não corre?",
    "options": [
      {
        "key": "A",
        "text": "Lisboa"
      },
      {
        "key": "B",
        "text": "Porto"
      },
      {
        "key": "C",
        "text": "No mapa"
      },
      {
        "key": "D",
        "text": "Coimbra"
      }
    ],
    "correct": "C",
    "explanation": "Num mapa, os rios podem ser ilustrados sem correr literalmente.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 21,
    "total": 125,
    "question": "O que tem coração mas não vive?",
    "options": [
      {
        "key": "A",
        "text": "Uma carta"
      },
      {
        "key": "B",
        "text": "Uma pedra"
      },
      {
        "key": "C",
        "text": "Um sofá"
      },
      {
        "key": "D",
        "text": "Uma pessoa"
      }
    ],
    "correct": "A",
    "explanation": "Há cartas que têm “coração” como símbolo.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 22,
    "total": 125,
    "question": "Qual é o único alimento que pode ser vendido ao mesmo tempo quente e frio?",
    "options": [
      {
        "key": "A",
        "text": "Pão"
      },
      {
        "key": "B",
        "text": "Fruta"
      },
      {
        "key": "C",
        "text": "Iogurte"
      },
      {
        "key": "D",
        "text": "Sopa"
      }
    ],
    "correct": "C",
    "explanation": "O iogurte pode ser consumido em vários estados de temperatura.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 23,
    "total": 125,
    "question": "Se um pão fosse uma máquina, qual seria o problema?",
    "options": [
      {
        "key": "A",
        "text": "Estava com fome"
      },
      {
        "key": "B",
        "text": "Estava duro"
      },
      {
        "key": "C",
        "text": "Não ligava"
      },
      {
        "key": "D",
        "text": "Estava velho"
      }
    ],
    "correct": "A",
    "explanation": "A questão tenta encaixar humor na metáfora da máquina.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 24,
    "total": 125,
    "question": "Que relação existe entre o sol e a bicicleta?",
    "options": [
      {
        "key": "A",
        "text": "A bicicleta roda"
      },
      {
        "key": "B",
        "text": "O sol nasce"
      },
      {
        "key": "C",
        "text": "A bicicleta tem luz"
      },
      {
        "key": "D",
        "text": "O sol é muito quente"
      }
    ],
    "correct": "A",
    "explanation": "A bicicleta e o sol têm um ritmo de movimento muito comum em metáforas.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 25,
    "total": 125,
    "question": "Se uma pessoa anda de bicicleta sem pedalar, o que acontece?",
    "options": [
      {
        "key": "A",
        "text": "Fica parado"
      },
      {
        "key": "B",
        "text": "Vai à frente"
      },
      {
        "key": "C",
        "text": "Vai para o céu"
      },
      {
        "key": "D",
        "text": "Vai a descer"
      }
    ],
    "correct": "D",
    "explanation": "Ao descer, a gravidade pode ajudar mesmo sem pedalar.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 26,
    "total": 125,
    "question": "Qual destes objetos pode ser visto a abrir e fechar sem ter mãos?",
    "options": [
      {
        "key": "A",
        "text": "Uma porta"
      },
      {
        "key": "B",
        "text": "Um livro"
      },
      {
        "key": "C",
        "text": "Uma janela"
      },
      {
        "key": "D",
        "text": "Um relógio"
      }
    ],
    "correct": "D",
    "explanation": "O relógio marca a passagem do tempo sem abrir e fechar literalmente.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 27,
    "total": 125,
    "question": "Qual é o único número que tem menos valor quando cresce?",
    "options": [
      {
        "key": "A",
        "text": "7"
      },
      {
        "key": "B",
        "text": "8"
      },
      {
        "key": "C",
        "text": "3"
      },
      {
        "key": "D",
        "text": "9"
      }
    ],
    "correct": "B",
    "explanation": "O número 8 cresce visualmente e pode ser trocado por “cresce” como ideia.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 28,
    "total": 125,
    "question": "Se uma pessoa está a correr e não sai do sítio, o que está a fazer?",
    "options": [
      {
        "key": "A",
        "text": "A dormir"
      },
      {
        "key": "B",
        "text": "A caminhar"
      },
      {
        "key": "C",
        "text": "A imaginar"
      },
      {
        "key": "D",
        "text": "Está a tentar vomitar"
      }
    ],
    "correct": "C",
    "explanation": "Correr no lugar é uma imagem mental de esforço sem avanço.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 29,
    "total": 125,
    "question": "O que tem asas mas não voa?",
    "options": [
      {
        "key": "A",
        "text": "Uma moeda"
      },
      {
        "key": "B",
        "text": "Um pássaro"
      },
      {
        "key": "C",
        "text": "Uma cadeira"
      },
      {
        "key": "D",
        "text": "Um avião"
      }
    ],
    "correct": "A",
    "explanation": "Uma moeda pode ter “asas” no sentido de desenhos ou metáforas.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 30,
    "total": 125,
    "question": "Qual é o animal que se lembra mais do que comeu?",
    "options": [
      {
        "key": "A",
        "text": "O hipopótamo"
      },
      {
        "key": "B",
        "text": "A vaca"
      },
      {
        "key": "C",
        "text": "O elefante"
      },
      {
        "key": "D",
        "text": "O cão"
      }
    ],
    "correct": "D",
    "explanation": "O cão é a metáfora clássica de memória alimentar.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 31,
    "total": 125,
    "question": "Se um barco atravessa um rio sem água, o que está a acontecer?",
    "options": [
      {
        "key": "A",
        "text": "Está em seco"
      },
      {
        "key": "B",
        "text": "Está no mapa"
      },
      {
        "key": "C",
        "text": "Está no mar"
      },
      {
        "key": "D",
        "text": "Está parado"
      }
    ],
    "correct": "B",
    "explanation": "No mapa, um rio pode aparecer sem água real.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 32,
    "total": 125,
    "question": "O que é que está sempre no fim de um curso?",
    "options": [
      {
        "key": "A",
        "text": "O diploma"
      },
      {
        "key": "B",
        "text": "A mesa"
      },
      {
        "key": "C",
        "text": "A mesa do professor"
      },
      {
        "key": "D",
        "text": "O café"
      }
    ],
    "correct": "A",
    "explanation": "O diploma é o culminar do curso, mesmo que não seja literal.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 33,
    "total": 125,
    "question": "Qual é a única coisa que nasce sem ter pai nem mãe?",
    "options": [
      {
        "key": "A",
        "text": "Um problema"
      },
      {
        "key": "B",
        "text": "Uma flor"
      },
      {
        "key": "C",
        "text": "Uma estrela"
      },
      {
        "key": "D",
        "text": "Um cão"
      }
    ],
    "correct": "A",
    "explanation": "Problemas surgem sem ser “nascidos” no sentido literal.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 34,
    "total": 125,
    "question": "Se dois montes se abraçam, o que acontece?",
    "options": [
      {
        "key": "A",
        "text": "Fica um vale"
      },
      {
        "key": "B",
        "text": "Fica um rio"
      },
      {
        "key": "C",
        "text": "Fica uma estrada"
      },
      {
        "key": "D",
        "text": "Fica uma ponte"
      }
    ],
    "correct": "A",
    "explanation": "Dois montes podem formar uma depressão entre eles.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 35,
    "total": 125,
    "question": "Qual é a cor do metiê de um buraco?",
    "options": [
      {
        "key": "A",
        "text": "Preta"
      },
      {
        "key": "B",
        "text": "Azul"
      },
      {
        "key": "C",
        "text": "Verde"
      },
      {
        "key": "D",
        "text": "Castanha"
      }
    ],
    "correct": "A",
    "explanation": "O buraco costuma ser descrito como negro.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 36,
    "total": 125,
    "question": "Se um livro diz “não há espaço”, o que falta?",
    "options": [
      {
        "key": "A",
        "text": "O espaço"
      },
      {
        "key": "B",
        "text": "O papel"
      },
      {
        "key": "C",
        "text": "A capa"
      },
      {
        "key": "D",
        "text": "Os autores"
      }
    ],
    "correct": "A",
    "explanation": "O livro pode indicar que faltava espaço fisicamente ou conceptualmente.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 37,
    "total": 125,
    "question": "Qual destas palavras é a mais “dourada”?",
    "options": [
      {
        "key": "A",
        "text": "Ornamento"
      },
      {
        "key": "B",
        "text": "Ouro"
      },
      {
        "key": "C",
        "text": "Sol"
      },
      {
        "key": "D",
        "text": "Dourado"
      }
    ],
    "correct": "B",
    "explanation": "O ouro é o elemento metálico associado ao dourado.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 38,
    "total": 125,
    "question": "Uma chuva nunca cai no mesmo lugar. Como é que ela se lembra?",
    "options": [
      {
        "key": "A",
        "text": "Pela memória"
      },
      {
        "key": "B",
        "text": "Pelo vento"
      },
      {
        "key": "C",
        "text": "Pelo calendário"
      },
      {
        "key": "D",
        "text": "Pelo chão"
      }
    ],
    "correct": "B",
    "explanation": "O vento faz o percurso da chuva variar.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 39,
    "total": 125,
    "question": "Se um peixe está sempre em cima do mar, qual é o problema?",
    "options": [
      {
        "key": "A",
        "text": "Não sabe nadar"
      },
      {
        "key": "B",
        "text": "Está morto"
      },
      {
        "key": "C",
        "text": "Está vestido"
      },
      {
        "key": "D",
        "text": "Está a flutuar"
      }
    ],
    "correct": "A",
    "explanation": "A premissa parece absurda e a resposta está no truque.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 40,
    "total": 125,
    "question": "Que coisa se enche de ar e depois se esvazia sem perder a forma?",
    "options": [
      {
        "key": "A",
        "text": "Um balão"
      },
      {
        "key": "B",
        "text": "Uma garrafa"
      },
      {
        "key": "C",
        "text": "Um saco"
      },
      {
        "key": "D",
        "text": "Um copo"
      }
    ],
    "correct": "A",
    "explanation": "O balão enche e esvazia mantendo-se um balão.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 41,
    "total": 125,
    "question": "Quando é que uma estrada se torna uma boa ideia?",
    "options": [
      {
        "key": "A",
        "text": "Quando conduz"
      },
      {
        "key": "B",
        "text": "Quando liga"
      },
      {
        "key": "C",
        "text": "Quando está vazia"
      },
      {
        "key": "D",
        "text": "Quando chove"
      }
    ],
    "correct": "B",
    "explanation": "Uma estrada liga pontos, por isso é boa quando faz ligação.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 42,
    "total": 125,
    "question": "Qual é o talvez mais antigo truque do mundo?",
    "options": [
      {
        "key": "A",
        "text": "Dizer “é mentira”"
      },
      {
        "key": "B",
        "text": "Abrir a porta"
      },
      {
        "key": "C",
        "text": "Fechar uma janela"
      },
      {
        "key": "D",
        "text": "Rir"
      }
    ],
    "correct": "A",
    "explanation": "A negação é um truque clássico de linguagem.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 43,
    "total": 125,
    "question": "Se uma pessoa fala sozinho, a quem responde?",
    "options": [
      {
        "key": "A",
        "text": "Ao espelho"
      },
      {
        "key": "B",
        "text": "A si mesmo"
      },
      {
        "key": "C",
        "text": "À rua"
      },
      {
        "key": "D",
        "text": "À televisão"
      }
    ],
    "correct": "B",
    "explanation": "A pessoa conversa consigo mesma.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 44,
    "total": 125,
    "question": "Qual é a melhor resposta para uma pergunta sem resposta?",
    "options": [
      {
        "key": "A",
        "text": "Pedir ajuda"
      },
      {
        "key": "B",
        "text": "Fazer outra pergunta"
      },
      {
        "key": "C",
        "text": "Calar-se"
      },
      {
        "key": "D",
        "text": "Rir"
      }
    ],
    "correct": "B",
    "explanation": "Muitas vezes, fazer outra pergunta abre a porta ao raciocínio.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 45,
    "total": 125,
    "question": "Qual destas coisas pode ser vista ao mesmo tempo por 100 pessoas?",
    "options": [
      {
        "key": "A",
        "text": "O mesmo céu"
      },
      {
        "key": "B",
        "text": "A mesma porta"
      },
      {
        "key": "C",
        "text": "O mesmo relógio"
      },
      {
        "key": "D",
        "text": "Uma vergonha"
      }
    ],
    "correct": "A",
    "explanation": "O céu é partilhado por todos e sempre visível.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 46,
    "total": 125,
    "question": "Se alguém anda de cabeça na lua e pés na Terra, o que está a fazer?",
    "options": [
      {
        "key": "A",
        "text": "Sonhar"
      },
      {
        "key": "B",
        "text": "Caminhar"
      },
      {
        "key": "C",
        "text": "Saltar"
      },
      {
        "key": "D",
        "text": "Dormir"
      }
    ],
    "correct": "A",
    "explanation": "O sonho e a fantasia são a leitura mais natural da imagem.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 47,
    "total": 125,
    "question": "Qual é o único número que te faz pensar em árvores?",
    "options": [
      {
        "key": "A",
        "text": "3"
      },
      {
        "key": "B",
        "text": "4"
      },
      {
        "key": "C",
        "text": "5"
      },
      {
        "key": "D",
        "text": "10"
      }
    ],
    "correct": "B",
    "explanation": "A ligação é com “quatro” e “árvores” no sentido de truque verbal.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 48,
    "total": 125,
    "question": "O que corre por dentro da casa sem sair da porta?",
    "options": [
      {
        "key": "A",
        "text": "O som"
      },
      {
        "key": "B",
        "text": "A luz"
      },
      {
        "key": "C",
        "text": "O cheiro"
      },
      {
        "key": "D",
        "text": "O vento"
      }
    ],
    "correct": "A",
    "explanation": "O som corre pela casa mesmo sem deslocar as paredes.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 49,
    "total": 125,
    "question": "Qual é a melhor forma de roubar tempo?",
    "options": [
      {
        "key": "A",
        "text": "Não o gastar"
      },
      {
        "key": "B",
        "text": "Andar devagar"
      },
      {
        "key": "C",
        "text": "Dormir mais"
      },
      {
        "key": "D",
        "text": "Fugir"
      }
    ],
    "correct": "A",
    "explanation": "Economizar tempo é uma metáfora da gestão do tempo.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 50,
    "total": 125,
    "question": "Se um carro começa a não funcionar, o que ele te diz?",
    "options": [
      {
        "key": "A",
        "text": "Já não consigo"
      },
      {
        "key": "B",
        "text": "Nada"
      },
      {
        "key": "C",
        "text": "Precisa de gasolina"
      },
      {
        "key": "D",
        "text": "Vai para casa"
      }
    ],
    "correct": "B",
    "explanation": "Um carro não fala em sentido literal, mas a metáfora é o truque.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 51,
    "total": 125,
    "question": "Qual é a melhor forma de manter um segredo no parque?",
    "options": [
      {
        "key": "A",
        "text": "Contá-lo a alguém"
      },
      {
        "key": "B",
        "text": "Escrevê-lo num papel"
      },
      {
        "key": "C",
        "text": "Dizer em voz baixa"
      },
      {
        "key": "D",
        "text": "Guardá-lo na cabeça"
      }
    ],
    "correct": "D",
    "explanation": "O segredo fica melhor na cabeça, no sentido figurado.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 52,
    "total": 125,
    "question": "Se a pessoa prende a respiração e continua a falar, o que acontece?",
    "options": [
      {
        "key": "A",
        "text": "Fica sem ar"
      },
      {
        "key": "B",
        "text": "Muda de assunto"
      },
      {
        "key": "C",
        "text": "Se afoga"
      },
      {
        "key": "D",
        "text": "Cai no chão"
      }
    ],
    "correct": "A",
    "explanation": "A respiração é essencial, mesmo para falar.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 53,
    "total": 125,
    "question": "Qual é o valor de um chapéu no beco?",
    "options": [
      {
        "key": "A",
        "text": "Zero"
      },
      {
        "key": "B",
        "text": "Um euro"
      },
      {
        "key": "C",
        "text": "Cem euros"
      },
      {
        "key": "D",
        "text": "Depende do chapéu"
      }
    ],
    "correct": "D",
    "explanation": "A resposta depende da situação e do contexto.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 54,
    "total": 125,
    "question": "O que pode ser longo, curto, quadrado e redondo ao mesmo tempo?",
    "options": [
      {
        "key": "A",
        "text": "Uma ideia"
      },
      {
        "key": "B",
        "text": "Um fio"
      },
      {
        "key": "C",
        "text": "Uma rua"
      },
      {
        "key": "D",
        "text": "Uma moeda"
      }
    ],
    "correct": "A",
    "explanation": "Uma ideia pode ser longa ou curta, redesenhada por metáforas.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 55,
    "total": 125,
    "question": "Qual é a palavra que parece ser maior quando está em minúsculas?",
    "options": [
      {
        "key": "A",
        "text": "Ninguém"
      },
      {
        "key": "B",
        "text": "Tudo"
      },
      {
        "key": "C",
        "text": "Nada"
      },
      {
        "key": "D",
        "text": "Luz"
      }
    ],
    "correct": "C",
    "explanation": "A palavra “nada” pode parecer numérica pela lógica do truque.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 56,
    "total": 125,
    "question": "Se uma conversa começa no sofá e termina no céu, de onde fala?",
    "options": [
      {
        "key": "A",
        "text": "Do sonho"
      },
      {
        "key": "B",
        "text": "Do teatro"
      },
      {
        "key": "C",
        "text": "Da rua"
      },
      {
        "key": "D",
        "text": "Da casa"
      }
    ],
    "correct": "A",
    "explanation": "O sonho é a metáfora mais natural.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 57,
    "total": 125,
    "question": "Qual é a melhor resposta para “quando acaba a noite”?",
    "options": [
      {
        "key": "A",
        "text": "Quando o sol nasce"
      },
      {
        "key": "B",
        "text": "Quando a lua se vai"
      },
      {
        "key": "C",
        "text": "Quando o dia começa"
      },
      {
        "key": "D",
        "text": "Quando a luz acende"
      }
    ],
    "correct": "A",
    "explanation": "A noite termina quando o sol começa a nascer.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 58,
    "total": 125,
    "question": "Se um carro tem 4 rodas e duas pessoas num carro, quantas rodas no total?",
    "options": [
      {
        "key": "A",
        "text": "4"
      },
      {
        "key": "B",
        "text": "6"
      },
      {
        "key": "C",
        "text": "8"
      },
      {
        "key": "D",
        "text": "2"
      }
    ],
    "correct": "A",
    "explanation": "O carro tem quatro rodas, independentemente do número de ocupantes.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 59,
    "total": 125,
    "question": "Qual é o único animal que precisa de tempo para ser bom em matemática?",
    "options": [
      {
        "key": "A",
        "text": "O leão"
      },
      {
        "key": "B",
        "text": "O cão"
      },
      {
        "key": "C",
        "text": "O elefante"
      },
      {
        "key": "D",
        "text": "O coelho"
      }
    ],
    "correct": "D",
    "explanation": "A pergunta usa o tempo como metáfora para “coelho” e o “tempo” simbólico.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 60,
    "total": 125,
    "question": "O que tem cheiro sem ser comida?",
    "options": [
      {
        "key": "A",
        "text": "Uma flor"
      },
      {
        "key": "B",
        "text": "Um livro"
      },
      {
        "key": "C",
        "text": "Um rádio"
      },
      {
        "key": "D",
        "text": "Uma pedra"
      }
    ],
    "correct": "A",
    "explanation": "Uma flor tem perfume sem ser comida.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 61,
    "total": 125,
    "question": "O que pode cair sem partir?",
    "options": [
      {
        "key": "A",
        "text": "Uma sombra"
      },
      {
        "key": "B",
        "text": "Um copo"
      },
      {
        "key": "C",
        "text": "Um prato"
      },
      {
        "key": "D",
        "text": "Uma máquina"
      }
    ],
    "correct": "A",
    "explanation": "A sombra não se parte como um objeto material.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 62,
    "total": 125,
    "question": "Se o sol se levanta todos os dias, por que não é sempre manhã?",
    "options": [
      {
        "key": "A",
        "text": "Porque a noite vem"
      },
      {
        "key": "B",
        "text": "Porque o mundo gira"
      },
      {
        "key": "C",
        "text": "Porque ele descansa"
      },
      {
        "key": "D",
        "text": "Porque é sempre sol"
      }
    ],
    "correct": "A",
    "explanation": "O ciclo da luz e da noite explica o alvorecer periódico.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 63,
    "total": 125,
    "question": "Qual destas coisas viaja sem sair do sítio?",
    "options": [
      {
        "key": "A",
        "text": "O vento"
      },
      {
        "key": "B",
        "text": "O rio"
      },
      {
        "key": "C",
        "text": "O pensamento"
      },
      {
        "key": "D",
        "text": "O relógio"
      }
    ],
    "correct": "C",
    "explanation": "O pensamento pode viajar sem deslocar o corpo.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 64,
    "total": 125,
    "question": "Se dois amigos jogam xadrez e nenhum move uma peça, o que acontece?",
    "options": [
      {
        "key": "A",
        "text": "Termina em empate"
      },
      {
        "key": "B",
        "text": "Ninguém joga"
      },
      {
        "key": "C",
        "text": "Começa a chorear"
      },
      {
        "key": "D",
        "text": "Tudo se move"
      }
    ],
    "correct": "A",
    "explanation": "Se ninguém move, o jogo não avança; o empate pode ser uma leitura humorística.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 65,
    "total": 125,
    "question": "O que tem um caminho mas não anda?",
    "options": [
      {
        "key": "A",
        "text": "Uma rua"
      },
      {
        "key": "B",
        "text": "Um bolo"
      },
      {
        "key": "C",
        "text": "Uma mesa"
      },
      {
        "key": "D",
        "text": "Uma lua"
      }
    ],
    "correct": "A",
    "explanation": "A rua é o caminho que liga pontos.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 66,
    "total": 125,
    "question": "Qual é a melhor forma de provar que uma ideia é boa?",
    "options": [
      {
        "key": "A",
        "text": "Explicá-la"
      },
      {
        "key": "B",
        "text": "Escondê-la"
      },
      {
        "key": "C",
        "text": "Ignorá-la"
      },
      {
        "key": "D",
        "text": "Comê-la"
      }
    ],
    "correct": "A",
    "explanation": "Explicar uma ideia é uma forma de a validar.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 67,
    "total": 125,
    "question": "Se uma pessoa compra uma caixa e dá a volta, o que tem dentro?",
    "options": [
      {
        "key": "A",
        "text": "Nada"
      },
      {
        "key": "B",
        "text": "Uma caixa vazia"
      },
      {
        "key": "C",
        "text": "O que ela quiser"
      },
      {
        "key": "D",
        "text": "Um livro"
      }
    ],
    "correct": "C",
    "explanation": "A resposta depende do conteúdo que a pessoa coloca dentro.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 68,
    "total": 125,
    "question": "O que dá para apertar sem se mexer?",
    "options": [
      {
        "key": "A",
        "text": "Uma mão"
      },
      {
        "key": "B",
        "text": "Uma tecla"
      },
      {
        "key": "C",
        "text": "Uma cadeira"
      },
      {
        "key": "D",
        "text": "Uma porta"
      }
    ],
    "correct": "B",
    "explanation": "Uma tecla pode ser pressionada sem mover o teclado em si.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 69,
    "total": 125,
    "question": "Qual é o único objeto que pode ressonar sem tocar música?",
    "options": [
      {
        "key": "A",
        "text": "O eco"
      },
      {
        "key": "B",
        "text": "A cadeira"
      },
      {
        "key": "C",
        "text": "O livro"
      },
      {
        "key": "D",
        "text": "O quadro"
      }
    ],
    "correct": "A",
    "explanation": "O eco é uma repetição sonora sem música em sentido literal.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 70,
    "total": 125,
    "question": "Se a palavra “nunca” se torna sempre, o que foi a mudança?",
    "options": [
      {
        "key": "A",
        "text": "O tempo"
      },
      {
        "key": "B",
        "text": "A vontade"
      },
      {
        "key": "C",
        "text": "O sentido"
      },
      {
        "key": "D",
        "text": "O alfabeto"
      }
    ],
    "correct": "C",
    "explanation": "A mudança foi de interpretação da frase.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 71,
    "total": 125,
    "question": "Qual é o melhor amigo da matemática?",
    "options": [
      {
        "key": "A",
        "text": "A lógica"
      },
      {
        "key": "B",
        "text": "O relógio"
      },
      {
        "key": "C",
        "text": "A porta"
      },
      {
        "key": "D",
        "text": "A chuva"
      }
    ],
    "correct": "A",
    "explanation": "A lógica sustenta o raciocínio matemático.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 72,
    "total": 125,
    "question": "Se uma pessoa fica sem ideias, o que tem de fazer?",
    "options": [
      {
        "key": "A",
        "text": "Pensar"
      },
      {
        "key": "B",
        "text": "Dormir"
      },
      {
        "key": "C",
        "text": "Rir"
      },
      {
        "key": "D",
        "text": "Desligar"
      }
    ],
    "correct": "A",
    "explanation": "Pensar é a forma direta de recuperar ideias.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 73,
    "total": 125,
    "question": "Qual destas coisas não pode ser lida sem abrir?",
    "options": [
      {
        "key": "A",
        "text": "O livro"
      },
      {
        "key": "B",
        "text": "A mente"
      },
      {
        "key": "C",
        "text": "A carta"
      },
      {
        "key": "D",
        "text": "O mapa"
      }
    ],
    "correct": "B",
    "explanation": "A mente não é um objeto físico que se abre para leitura.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 74,
    "total": 125,
    "question": "Quando uma porta está aberta e você entra, para onde vai a porta?",
    "options": [
      {
        "key": "A",
        "text": "Dentro"
      },
      {
        "key": "B",
        "text": "Para fora"
      },
      {
        "key": "C",
        "text": "Fica aberta"
      },
      {
        "key": "D",
        "text": "Pára"
      }
    ],
    "correct": "C",
    "explanation": "A porta continua aberta, a menos que alguém a feche.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 75,
    "total": 125,
    "question": "O que tem um nome, não é pessoa e sempre deixa de existir quando o conhecem?",
    "options": [
      {
        "key": "A",
        "text": "Um segredo"
      },
      {
        "key": "B",
        "text": "Um cão"
      },
      {
        "key": "C",
        "text": "Um sonho"
      },
      {
        "key": "D",
        "text": "Uma lua"
      }
    ],
    "correct": "A",
    "explanation": "Um segredo deixa de ser secreto quando é revelado.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 76,
    "total": 125,
    "question": "Se um copo está vazio, o que está dentro?",
    "options": [
      {
        "key": "A",
        "text": "Ar"
      },
      {
        "key": "B",
        "text": "Água"
      },
      {
        "key": "C",
        "text": "Nada"
      },
      {
        "key": "D",
        "text": "Papel"
      }
    ],
    "correct": "A",
    "explanation": "Há ar dentro do copo mesmo quando parece vazio.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 77,
    "total": 125,
    "question": "Qual é a melhor forma de perceber um enigma?",
    "options": [
      {
        "key": "A",
        "text": "Pensar fora da caixa"
      },
      {
        "key": "B",
        "text": "Fechar os olhos"
      },
      {
        "key": "C",
        "text": "Correr"
      },
      {
        "key": "D",
        "text": "Ler mais depressa"
      }
    ],
    "correct": "A",
    "explanation": "O enigma exige raciocínio lateral.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 78,
    "total": 125,
    "question": "Se o peixe vai para o céu, o que perde?",
    "options": [
      {
        "key": "A",
        "text": "A água"
      },
      {
        "key": "B",
        "text": "O bolso"
      },
      {
        "key": "C",
        "text": "A comida"
      },
      {
        "key": "D",
        "text": "O chapéu"
      }
    ],
    "correct": "A",
    "explanation": "Sem água, o peixe não vive em condições.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 79,
    "total": 125,
    "question": "Qual é o único lugar onde o futuro cabe em duas palavras?",
    "options": [
      {
        "key": "A",
        "text": "No mapa"
      },
      {
        "key": "B",
        "text": "Na agenda"
      },
      {
        "key": "C",
        "text": "Na cadeira"
      },
      {
        "key": "D",
        "text": "Na loja"
      }
    ],
    "correct": "B",
    "explanation": "Uma agenda guarda o futuro planejado.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 80,
    "total": 125,
    "question": "O que anda por baixo da mesa sem deixar marcas?",
    "options": [
      {
        "key": "A",
        "text": "O ar"
      },
      {
        "key": "B",
        "text": "A sombra"
      },
      {
        "key": "C",
        "text": "O vento"
      },
      {
        "key": "D",
        "text": "Uma cadeira"
      }
    ],
    "correct": "A",
    "explanation": "O ar circula sem deixar rastos visíveis.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 81,
    "total": 125,
    "question": "Qual é a coisa mais bonita quando a esquecemos?",
    "options": [
      {
        "key": "A",
        "text": "A lembrança"
      },
      {
        "key": "B",
        "text": "O livro"
      },
      {
        "key": "C",
        "text": "A janela"
      },
      {
        "key": "D",
        "text": "A cozinha"
      }
    ],
    "correct": "A",
    "explanation": "As memórias valorizam-se quando lembramos delas.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 82,
    "total": 125,
    "question": "Qual é a melhor forma de brincar com uma pergunta?",
    "options": [
      {
        "key": "A",
        "text": "Responder em vez de pensar"
      },
      {
        "key": "B",
        "text": "Tentar descobrir o truque"
      },
      {
        "key": "C",
        "text": "Fingir que não existe"
      },
      {
        "key": "D",
        "text": "Ignorar"
      }
    ],
    "correct": "B",
    "explanation": "A arte da pergunta está em descobrir o truque.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 83,
    "total": 125,
    "question": "Se uma pessoa tem 20 passos e dá 10, quantas passos lhe restam?",
    "options": [
      {
        "key": "A",
        "text": "10"
      },
      {
        "key": "B",
        "text": "20"
      },
      {
        "key": "C",
        "text": "30"
      },
      {
        "key": "D",
        "text": "0"
      }
    ],
    "correct": "A",
    "explanation": "20 menos 10 são 10.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 84,
    "total": 125,
    "question": "Qual é a única coisa que pode ter um início sem ter um fim?",
    "options": [
      {
        "key": "A",
        "text": "Uma frase"
      },
      {
        "key": "B",
        "text": "Uma mesa"
      },
      {
        "key": "C",
        "text": "Uma porta"
      },
      {
        "key": "D",
        "text": "Um livro"
      }
    ],
    "correct": "A",
    "explanation": "Uma frase pode iniciar-se sem um fim definido.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 85,
    "total": 125,
    "question": "O que pode abrir o mundo sem sair da janela?",
    "options": [
      {
        "key": "A",
        "text": "A vista"
      },
      {
        "key": "B",
        "text": "A janela"
      },
      {
        "key": "C",
        "text": "O sol"
      },
      {
        "key": "D",
        "text": "O ar"
      }
    ],
    "correct": "A",
    "explanation": "A vista abre a percepção do mundo.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 86,
    "total": 125,
    "question": "Se um relógio dá 8 badaladas em 8 segundos, quanto tempo demora a dar 4 badaladas?",
    "options": [
      {
        "key": "A",
        "text": "4 segundos"
      },
      {
        "key": "B",
        "text": "8 segundos"
      },
      {
        "key": "C",
        "text": "2 segundos"
      },
      {
        "key": "D",
        "text": "16 segundos"
      }
    ],
    "correct": "A",
    "explanation": "A frequência é uniforme: 8 badaladas em 8 segundos implica 1 badalada por segundo.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 87,
    "total": 125,
    "question": "Qual é o único sitio onde as palavras se juntam sem se falar?",
    "options": [
      {
        "key": "A",
        "text": "No livro"
      },
      {
        "key": "B",
        "text": "Na rua"
      },
      {
        "key": "C",
        "text": "No céu"
      },
      {
        "key": "D",
        "text": "Na escola"
      }
    ],
    "correct": "A",
    "explanation": "Num livro, as palavras estão juntas em texto sem conversação.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 88,
    "total": 125,
    "question": "Se o teclado tivesse um problema, o que fazíamos?",
    "options": [
      {
        "key": "A",
        "text": "Usávamos o rato"
      },
      {
        "key": "B",
        "text": "Dormíamos"
      },
      {
        "key": "C",
        "text": "Íamos ao telefone"
      },
      {
        "key": "D",
        "text": "Pensávamos"
      }
    ],
    "correct": "A",
    "explanation": "Muitas soluções de trabalho usam o rato enquanto o teclado falha.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 89,
    "total": 125,
    "question": "Qual é a coisa que aparece sem entrar?",
    "options": [
      {
        "key": "A",
        "text": "A luz"
      },
      {
        "key": "B",
        "text": "A comida"
      },
      {
        "key": "C",
        "text": "A cadeira"
      },
      {
        "key": "D",
        "text": "A pessoa"
      }
    ],
    "correct": "A",
    "explanation": "A luz é um fenómeno visível sem entrar em lugar físico.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 90,
    "total": 125,
    "question": "Se a lua falasse, que pergunta faria?",
    "options": [
      {
        "key": "A",
        "text": "Onde vais?"
      },
      {
        "key": "B",
        "text": "Quem és?"
      },
      {
        "key": "C",
        "text": "Até quando?"
      },
      {
        "key": "D",
        "text": "Nada"
      }
    ],
    "correct": "A",
    "explanation": "Qualquer conversa com a lua se resumiria a “onde vais?”.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 91,
    "total": 125,
    "question": "Qual é a melhor forma de apurar uma ideia?",
    "options": [
      {
        "key": "A",
        "text": "Pensar"
      },
      {
        "key": "B",
        "text": "Comer"
      },
      {
        "key": "C",
        "text": "Dormir"
      },
      {
        "key": "D",
        "text": "Correr"
      }
    ],
    "correct": "A",
    "explanation": "Pensar apura o raciocínio e esclarece a ideia.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 92,
    "total": 125,
    "question": "O que tem a cabeça no fim e os pés no início?",
    "options": [
      {
        "key": "A",
        "text": "Um texto"
      },
      {
        "key": "B",
        "text": "Uma pessoa"
      },
      {
        "key": "C",
        "text": "Uma escada"
      },
      {
        "key": "D",
        "text": "Uma cadeira"
      }
    ],
    "correct": "A",
    "explanation": "Os textos podem fazer essa metáfora de início e fim.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 93,
    "total": 125,
    "question": "Se o barulho sobe, o que acontece ao silêncio?",
    "options": [
      {
        "key": "A",
        "text": "Desce"
      },
      {
        "key": "B",
        "text": "Fica alto"
      },
      {
        "key": "C",
        "text": "Nada"
      },
      {
        "key": "D",
        "text": "Vai embora"
      }
    ],
    "correct": "A",
    "explanation": "O silêncio tende a diminuir quando o ruído cresce.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 94,
    "total": 125,
    "question": "Qual é o único objeto que pode ter um buraco sem ser furado?",
    "options": [
      {
        "key": "A",
        "text": "Uma agulha"
      },
      {
        "key": "B",
        "text": "Um livro"
      },
      {
        "key": "C",
        "text": "Uma caixa"
      },
      {
        "key": "D",
        "text": "Uma cadeira"
      }
    ],
    "correct": "A",
    "explanation": "A agulha tem um olho, que é um “buraco” funcional.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 95,
    "total": 125,
    "question": "Se a água corre para o mar e o mar corre para a praia, o que acontece?",
    "options": [
      {
        "key": "A",
        "text": "Há uma maré"
      },
      {
        "key": "B",
        "text": "Fica seco"
      },
      {
        "key": "C",
        "text": "Nada"
      },
      {
        "key": "D",
        "text": "Tudo enche"
      }
    ],
    "correct": "A",
    "explanation": "A maré e o movimento da água explicam o ciclo.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 96,
    "total": 125,
    "question": "Qual é a melhor forma de acender uma conversa?",
    "options": [
      {
        "key": "A",
        "text": "Perguntar"
      },
      {
        "key": "B",
        "text": "Silenciar"
      },
      {
        "key": "C",
        "text": "Correr"
      },
      {
        "key": "D",
        "text": "Dormir"
      }
    ],
    "correct": "A",
    "explanation": "Perguntar gera conversa.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 97,
    "total": 125,
    "question": "Se uma pessoa toma café sem café, o que está a beber?",
    "options": [
      {
        "key": "A",
        "text": "Água"
      },
      {
        "key": "B",
        "text": "Treino"
      },
      {
        "key": "C",
        "text": "Névoa"
      },
      {
        "key": "D",
        "text": "Nada"
      }
    ],
    "correct": "A",
    "explanation": "O café sem café seria, na prática, outra bebida.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 98,
    "total": 125,
    "question": "Qual é a palavra mais assustadora num exame?",
    "options": [
      {
        "key": "A",
        "text": "Pergunta"
      },
      {
        "key": "B",
        "text": "Caderno"
      },
      {
        "key": "C",
        "text": "Lápis"
      },
      {
        "key": "D",
        "text": "Tempo"
      }
    ],
    "correct": "A",
    "explanation": "A palavra “pergunta” assume o peso da avaliação.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 99,
    "total": 125,
    "question": "Se um gato toca piano e o piano toca gato, o que acontece?",
    "options": [
      {
        "key": "A",
        "text": "Há música"
      },
      {
        "key": "B",
        "text": "Há caos"
      },
      {
        "key": "C",
        "text": "Há chuva"
      },
      {
        "key": "D",
        "text": "Nada"
      }
    ],
    "correct": "A",
    "explanation": "Há música, a forma mais lógica da situação absurda.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 100,
    "total": 125,
    "question": "Qual é a melhor forma de encontrar a resposta correta?",
    "options": [
      {
        "key": "A",
        "text": "Ler atentamente"
      },
      {
        "key": "B",
        "text": "Adivinhar"
      },
      {
        "key": "C",
        "text": "Fechar os olhos"
      },
      {
        "key": "D",
        "text": "Pedir a outro"
      }
    ],
    "correct": "A",
    "explanation": "A atenção é crucial para perceber a resposta certa.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 101,
    "total": 125,
    "question": "Se alguém diz “eu vou” e depois permanece parado, o que faz?",
    "options": [
      {
        "key": "A",
        "text": "A dança"
      },
      {
        "key": "B",
        "text": "A pergunta"
      },
      {
        "key": "C",
        "text": "A caminhada"
      },
      {
        "key": "D",
        "text": "Nenhuma"
      }
    ],
    "correct": "C",
    "explanation": "O “ir” pode ser uma metáfora de começar a caminhada.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 102,
    "total": 125,
    "question": "Qual é a melhor maneira de desarmar um enigma?",
    "options": [
      {
        "key": "A",
        "text": "Resolvi-lo"
      },
      {
        "key": "B",
        "text": "Fugir"
      },
      {
        "key": "C",
        "text": "Chorar"
      },
      {
        "key": "D",
        "text": "Esperar"
      }
    ],
    "correct": "A",
    "explanation": "Resolver o enigma é a forma de desarmá-lo.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 103,
    "total": 125,
    "question": "Se um mapa te mostra um rio sem água, o que é?",
    "options": [
      {
        "key": "A",
        "text": "Uma ideia"
      },
      {
        "key": "B",
        "text": "Uma ilustração"
      },
      {
        "key": "C",
        "text": "Uma fábula"
      },
      {
        "key": "D",
        "text": "Uma viagem"
      }
    ],
    "correct": "B",
    "explanation": "O mapa é uma ilustração; o rio pode ser representado sem água.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 104,
    "total": 125,
    "question": "Qual é a coisa que o tempo não consegue esconder?",
    "options": [
      {
        "key": "A",
        "text": "A hora"
      },
      {
        "key": "B",
        "text": "O relógio"
      },
      {
        "key": "C",
        "text": "A vida"
      },
      {
        "key": "D",
        "text": "O olhar"
      }
    ],
    "correct": "A",
    "explanation": "A hora continua a existir e a sonar em cada instante.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 105,
    "total": 125,
    "question": "Se um nome anda na rua e ninguém sabe, o que é?",
    "options": [
      {
        "key": "A",
        "text": "Uma pessoa"
      },
      {
        "key": "B",
        "text": "Uma ideia"
      },
      {
        "key": "C",
        "text": "Uma hipótese"
      },
      {
        "key": "D",
        "text": "Uma parede"
      }
    ],
    "correct": "C",
    "explanation": "Uma hipótese pode caminhar como pensamento sem corpo.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 106,
    "total": 125,
    "question": "Qual é a letra mais doida do alfabeto?",
    "options": [
      {
        "key": "A",
        "text": "Z"
      },
      {
        "key": "B",
        "text": "Q"
      },
      {
        "key": "C",
        "text": "Y"
      },
      {
        "key": "D",
        "text": "A"
      }
    ],
    "correct": "B",
    "explanation": "A letra Q é frequentemente a mais “estranha” na grafia.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 107,
    "total": 125,
    "question": "Se uma frase não tem resposta, o que é?",
    "options": [
      {
        "key": "A",
        "text": "Um problema"
      },
      {
        "key": "B",
        "text": "Uma pergunta"
      },
      {
        "key": "C",
        "text": "Uma dica"
      },
      {
        "key": "D",
        "text": "Uma pausa"
      }
    ],
    "correct": "B",
    "explanation": "Perguntas sem resposta são perguntas por definição.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 108,
    "total": 125,
    "question": "Qual é o único lugar onde a porta não inventa desculpas?",
    "options": [
      {
        "key": "A",
        "text": "Na casa"
      },
      {
        "key": "B",
        "text": "Na rua"
      },
      {
        "key": "C",
        "text": "No mapa"
      },
      {
        "key": "D",
        "text": "Na escola"
      }
    ],
    "correct": "A",
    "explanation": "A porta é física e não inventa desculpas.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 109,
    "total": 125,
    "question": "Se a luz não acende, o que faltou?",
    "options": [
      {
        "key": "A",
        "text": "Energia"
      },
      {
        "key": "B",
        "text": "Chuva"
      },
      {
        "key": "C",
        "text": "Tempo"
      },
      {
        "key": "D",
        "text": "Água"
      }
    ],
    "correct": "A",
    "explanation": "Sem energia, a luz não acende.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 110,
    "total": 125,
    "question": "Qual é a melhor resposta a uma pergunta absurda?",
    "options": [
      {
        "key": "A",
        "text": "Rir"
      },
      {
        "key": "B",
        "text": "Fugir"
      },
      {
        "key": "C",
        "text": "Chorar"
      },
      {
        "key": "D",
        "text": "Pedir desculpa"
      }
    ],
    "correct": "A",
    "explanation": "Rir é a forma mais humana de reagir ao absurdo.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 111,
    "total": 125,
    "question": "Se um peixe usa chapéu, o que faz?",
    "options": [
      {
        "key": "A",
        "text": "Fica engraçado"
      },
      {
        "key": "B",
        "text": "Fica mais forte"
      },
      {
        "key": "C",
        "text": "Nada"
      },
      {
        "key": "D",
        "text": "Entra em água"
      }
    ],
    "correct": "A",
    "explanation": "A imagem absurda é o ponto da pergunta.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 112,
    "total": 125,
    "question": "Qual é a melhor forma de manter a paz numa sala?",
    "options": [
      {
        "key": "A",
        "text": "Falar calmamente"
      },
      {
        "key": "B",
        "text": "Gritar"
      },
      {
        "key": "C",
        "text": "Sair"
      },
      {
        "key": "D",
        "text": "Desligar a luz"
      }
    ],
    "correct": "A",
    "explanation": "A conversa tranquila costuma evitar conflitos.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 113,
    "total": 125,
    "question": "Se um relógio indica 12:00 e não move a ponteira, o que aconteceu?",
    "options": [
      {
        "key": "A",
        "text": "Está parado"
      },
      {
        "key": "B",
        "text": "Está em hora e meia"
      },
      {
        "key": "C",
        "text": "Está em funcionamento"
      },
      {
        "key": "D",
        "text": "Está mal"
      }
    ],
    "correct": "A",
    "explanation": "O relógio está parado.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 114,
    "total": 125,
    "question": "Qual destas coisas pode ser azul sem ser céu?",
    "options": [
      {
        "key": "A",
        "text": "Um jeans"
      },
      {
        "key": "B",
        "text": "Uma árvore"
      },
      {
        "key": "C",
        "text": "Uma pessoa"
      },
      {
        "key": "D",
        "text": "Um copo"
      }
    ],
    "correct": "A",
    "explanation": "O jeans é um item de roupa azul.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 115,
    "total": 125,
    "question": "Qual é a melhor forma de explicar algo impossível?",
    "options": [
      {
        "key": "A",
        "text": "Com humor"
      },
      {
        "key": "B",
        "text": "Sem falar"
      },
      {
        "key": "C",
        "text": "Silêncio total"
      },
      {
        "key": "D",
        "text": "Sem pensar"
      }
    ],
    "correct": "A",
    "explanation": "O humor ajuda a dizer o absurdo em linguagem acessível.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 116,
    "total": 125,
    "question": "Se uma pessoa diz “estou no meio de nada”, o que significa?",
    "options": [
      {
        "key": "A",
        "text": "Que está em silêncio"
      },
      {
        "key": "B",
        "text": "Que está num espaço vazio"
      },
      {
        "key": "C",
        "text": "Que está a mentir"
      },
      {
        "key": "D",
        "text": "Que está em casa"
      }
    ],
    "correct": "B",
    "explanation": "No meio de nada indica vazio ou ausência de contexto.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 117,
    "total": 125,
    "question": "Qual é a palavra que mais parece um gesto?",
    "options": [
      {
        "key": "A",
        "text": "Abraço"
      },
      {
        "key": "B",
        "text": "Sofá"
      },
      {
        "key": "C",
        "text": "Mesa"
      },
      {
        "key": "D",
        "text": "Livro"
      }
    ],
    "correct": "A",
    "explanation": "Abraço é um gesto e também uma palavra com sentido físico.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 118,
    "total": 125,
    "question": "Se 5 pessoas estão em fila e 2 saem, quantas restam?",
    "options": [
      {
        "key": "A",
        "text": "3"
      },
      {
        "key": "B",
        "text": "5"
      },
      {
        "key": "C",
        "text": "2"
      },
      {
        "key": "D",
        "text": "7"
      }
    ],
    "correct": "A",
    "explanation": "5 menos 2 são 3.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 119,
    "total": 125,
    "question": "O que é que não pode ser segurado sem mão?",
    "options": [
      {
        "key": "A",
        "text": "O vento"
      },
      {
        "key": "B",
        "text": "Uma maçã"
      },
      {
        "key": "C",
        "text": "Um livro"
      },
      {
        "key": "D",
        "text": "Um copo"
      }
    ],
    "correct": "A",
    "explanation": "O vento não pode ser segurado como um objeto.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 120,
    "total": 125,
    "question": "Qual é o único número que nunca está sozinho?",
    "options": [
      {
        "key": "A",
        "text": "2"
      },
      {
        "key": "B",
        "text": "1"
      },
      {
        "key": "C",
        "text": "7"
      },
      {
        "key": "D",
        "text": "0"
      }
    ],
    "correct": "A",
    "explanation": "O número 2 aparece em pares e em relações.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 121,
    "total": 125,
    "question": "Se sabes responder a esta pergunta, o que tens?",
    "options": [
      {
        "key": "A",
        "text": "Raciocínio"
      },
      {
        "key": "B",
        "text": "Uma dica"
      },
      {
        "key": "C",
        "text": "Um objeto"
      },
      {
        "key": "D",
        "text": "Nada"
      }
    ],
    "correct": "A",
    "explanation": "A resposta exige capacidade de raciocínio.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 122,
    "total": 125,
    "question": "Qual é a coisa mais rápida do mundo sem ter pernas?",
    "options": [
      {
        "key": "A",
        "text": "O pensamento"
      },
      {
        "key": "B",
        "text": "O vento"
      },
      {
        "key": "C",
        "text": "A luz"
      },
      {
        "key": "D",
        "text": "A água"
      }
    ],
    "correct": "C",
    "explanation": "A luz é o exemplo mais conhecido de rapidez extrema.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 123,
    "total": 125,
    "question": "Se o sol canta, qual é a música mais provável?",
    "options": [
      {
        "key": "A",
        "text": "Uma canção de manhã"
      },
      {
        "key": "B",
        "text": "Um rock"
      },
      {
        "key": "C",
        "text": "Uma marcha"
      },
      {
        "key": "D",
        "text": "Nada"
      }
    ],
    "correct": "A",
    "explanation": "Cantar com o sol tem um tom matinal e luminoso.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 124,
    "total": 125,
    "question": "Qual é o melhor lugar para esconder um truque?",
    "options": [
      {
        "key": "A",
        "text": "Na pergunta"
      },
      {
        "key": "B",
        "text": "No bolso"
      },
      {
        "key": "C",
        "text": "Na mesa"
      },
      {
        "key": "D",
        "text": "Na rua"
      }
    ],
    "correct": "A",
    "explanation": "O truque costuma estar na forma da pergunta.",
    "points": 500
  },
  {
    "category": "Modo Maluco",
    "index": 125,
    "total": 125,
    "question": "Se uma pessoa marcha ao ritmo da chuva, o que está a fazer?",
    "options": [
      {
        "key": "A",
        "text": "Caminhar sem parar"
      },
      {
        "key": "B",
        "text": "Correr"
      },
      {
        "key": "C",
        "text": "Dormir"
      },
      {
        "key": "D",
        "text": "Gritar"
      }
    ],
    "correct": "A",
    "explanation": "A marcha acompanha o ritmo da chuva ou da música.",
    "points": 500
  }
]

export const DEMO_QUIZ: QuizQuestion[] = MODO_MALUCO_QUESTIONS.slice(0, 5)

export const ALL_QUIZ_QUESTIONS: QuizQuestion[] = [
  ...DEMO_QUIZ,
  ...MODO_MALUCO_QUESTIONS,
]
