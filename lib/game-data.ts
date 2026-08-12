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
    description: 'Perguntas que não fazem sentido. Mas têm resposta.',
    questions: '50',
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
    category: 'Modo Maluco',
    index: 1,
    total: 50,
    question: 'Se uma galinha puser um ovo em cima de um muro, para que lado cai o ovo?',
    options: [
      { key: 'A', text: 'Para a esquerda' },
      { key: 'B', text: 'Para a direita' },
      { key: 'C', text: 'Para o lado mais baixo' },
      { key: 'D', text: 'Nenhum: galinhas não põem ovos em cima de muros' },
    ],
    correct: 'D',
    explanation: 'A rasteira está na própria pergunta: não é o cenário normal de uma galinha pôr um ovo num muro.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 2,
    total: 50,
    question: 'O que pesa mais: 1 kg de ferro ou 1 kg de penas?',
    options: [
      { key: 'A', text: 'O ferro' },
      { key: 'B', text: 'As penas' },
      { key: 'C', text: 'Pesam exatamente o mesmo' },
      { key: 'D', text: 'Depende da cor das penas' },
    ],
    correct: 'C',
    explanation: 'Um quilograma é um quilograma, independentemente do material.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 3,
    total: 50,
    question: 'Quantos meses têm 28 dias?',
    options: [
      { key: 'A', text: '1' },
      { key: 'B', text: '2' },
      { key: 'C', text: '11' },
      { key: 'D', text: 'Todos' },
    ],
    correct: 'D',
    explanation: 'Todos os meses têm pelo menos 28 dias.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 4,
    total: 50,
    question: 'Um comboio elétrico vai para norte. Para que lado vai o fumo?',
    options: [
      { key: 'A', text: 'Norte' },
      { key: 'B', text: 'Sul' },
      { key: 'C', text: 'Para onde sopra o vento' },
      { key: 'D', text: 'Não há fumo' },
    ],
    correct: 'D',
    explanation: 'É um comboio elétrico, portanto a pergunta tenta fazer-te imaginar um fumo que não existe.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 5,
    total: 50,
    question: 'Tens três maçãs e tiras duas. Com quantas maçãs ficas?',
    options: [
      { key: 'A', text: 'Uma' },
      { key: 'B', text: 'Duas' },
      { key: 'C', text: 'Três' },
      { key: 'D', text: 'Nenhuma' },
    ],
    correct: 'B',
    explanation: 'Se tiraste duas maçãs, ficas com as duas que tens contigo.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 6,
    total: 50,
    question: 'O pai da Maria tem cinco filhas: Nana, Nene, Nini, Nono e...?',
    options: [
      { key: 'A', text: 'Nunu' },
      { key: 'B', text: 'Maria' },
      { key: 'C', text: 'Nana outra vez' },
      { key: 'D', text: 'Joana' },
    ],
    correct: 'B',
    explanation: 'A Maria já está escondida na própria pergunta.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 7,
    total: 50,
    question: 'Se ultrapassares a pessoa que está em segundo lugar numa corrida, em que posição ficas?',
    options: [
      { key: 'A', text: 'Primeiro' },
      { key: 'B', text: 'Segundo' },
      { key: 'C', text: 'Terceiro' },
      { key: 'D', text: 'Último' },
    ],
    correct: 'B',
    explanation: 'Ao ultrapassares o segundo classificado, passas a ocupar o segundo lugar.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 8,
    total: 50,
    question: 'O que tem dentes mas não consegue morder?',
    options: [
      { key: 'A', text: 'Um cão' },
      { key: 'B', text: 'Um pente' },
      { key: 'C', text: 'Um tubarão' },
      { key: 'D', text: 'Um crocodilo' },
    ],
    correct: 'B',
    explanation: 'Um pente tem dentes, mas não tem boca.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 9,
    total: 50,
    question: 'O que fica mais molhado quanto mais seca?',
    options: [
      { key: 'A', text: 'Uma toalha' },
      { key: 'B', text: 'Uma esponja' },
      { key: 'C', text: 'Uma nuvem' },
      { key: 'D', text: 'Um peixe' },
    ],
    correct: 'A',
    explanation: 'A toalha fica molhada enquanto seca outras coisas.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 10,
    total: 50,
    question: 'O que tem pescoço mas não tem cabeça?',
    options: [
      { key: 'A', text: 'Uma garrafa' },
      { key: 'B', text: 'Um cavalo' },
      { key: 'C', text: 'Uma girafa' },
      { key: 'D', text: 'Um humano' },
    ],
    correct: 'A',
    explanation: 'A garrafa tem um pescoço ou gargalo, mas não tem cabeça.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 11,
    total: 50,
    question: 'Se disseres o meu nome, deixo de existir. O que sou?',
    options: [
      { key: 'A', text: 'O silêncio' },
      { key: 'B', text: 'O ar' },
      { key: 'C', text: 'A sombra' },
      { key: 'D', text: 'A luz' },
    ],
    correct: 'A',
    explanation: 'Quando falas, o silêncio deixa de existir.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 12,
    total: 50,
    question: 'Quanto mais tiras, maior fica. O que é?',
    options: [
      { key: 'A', text: 'Um buraco' },
      { key: 'B', text: 'Uma pizza' },
      { key: 'C', text: 'Uma dívida' },
      { key: 'D', text: 'Uma mochila' },
    ],
    correct: 'A',
    explanation: 'Quanto mais terra tiras, maior fica o buraco.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 13,
    total: 50,
    question: 'Qual é a coisa que está sempre à tua frente mas nunca consegues ver?',
    options: [
      { key: 'A', text: 'O passado' },
      { key: 'B', text: 'O futuro' },
      { key: 'C', text: 'O nariz' },
      { key: 'D', text: 'O cabelo' },
    ],
    correct: 'B',
    explanation: 'O futuro está à nossa frente, mas não podemos vê-lo diretamente.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 14,
    total: 50,
    question: 'O que tem mãos mas não consegue bater palmas?',
    options: [
      { key: 'A', text: 'Um relógio' },
      { key: 'B', text: 'Um humano' },
      { key: 'C', text: 'Um macaco' },
      { key: 'D', text: 'Um pianista' },
    ],
    correct: 'A',
    explanation: 'Um relógio pode ter ponteiros chamados mãos, mas não bate palmas.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 15,
    total: 50,
    question: 'Um homem está debaixo de chuva sem guarda-chuva. Nem um fio de cabelo fica molhado. Porquê?',
    options: [
      { key: 'A', text: 'A chuva era falsa' },
      { key: 'B', text: 'Estava dentro de casa' },
      { key: 'C', text: 'Era careca' },
      { key: 'D', text: 'Usava laca' },
    ],
    correct: 'C',
    explanation: 'Se o homem é careca, não tem cabelo para ficar molhado.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 16,
    total: 50,
    question: 'O que tem uma boca mas não come?',
    options: [
      { key: 'A', text: 'Um rio' },
      { key: 'B', text: 'Um cão' },
      { key: 'C', text: 'Uma criança' },
      { key: 'D', text: 'Um peixe' },
    ],
    correct: 'A',
    explanation: 'A boca de um rio é o local onde ele desagua.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 17,
    total: 50,
    question: 'Se tens 10 peixes num aquário e 3 morrem, quantos peixes ficam no aquário?',
    options: [
      { key: 'A', text: '7' },
      { key: 'B', text: '3' },
      { key: 'C', text: '10' },
      { key: 'D', text: 'Nenhum' },
    ],
    correct: 'C',
    explanation: 'Os três peixes morreram, mas continuam dentro do aquário.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 18,
    total: 50,
    question: 'Qual é o animal que anda com as patas na cabeça?',
    options: [
      { key: 'A', text: 'O caranguejo' },
      { key: 'B', text: 'O piolho' },
      { key: 'C', text: 'O polvo' },
      { key: 'D', text: 'A galinha' },
    ],
    correct: 'B',
    explanation: 'O piolho desloca-se sobre a cabeça usando as suas patas.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 19,
    total: 50,
    question: 'Se um avião cair exatamente na fronteira entre Portugal e Espanha, onde enterram os sobreviventes?',
    options: [
      { key: 'A', text: 'Portugal' },
      { key: 'B', text: 'Espanha' },
      { key: 'C', text: 'Na fronteira' },
      { key: 'D', text: 'Não enterram sobreviventes' },
    ],
    correct: 'D',
    explanation: 'Se são sobreviventes, não são enterrados.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 20,
    total: 50,
    question: 'O que tem cidades, rios e montanhas, mas não tem pessoas, água ou árvores?',
    options: [
      { key: 'A', text: 'Um mapa' },
      { key: 'B', text: 'Um sonho' },
      { key: 'C', text: 'Um videojogo' },
      { key: 'D', text: 'Uma fotografia' },
    ],
    correct: 'A',
    explanation: 'Um mapa representa cidades, rios e montanhas.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 21,
    total: 50,
    question: 'O que tem um olho mas não consegue ver?',
    options: [
      { key: 'A', text: 'Uma agulha' },
      { key: 'B', text: 'Um gato' },
      { key: 'C', text: 'Uma águia' },
      { key: 'D', text: 'Uma pessoa' },
    ],
    correct: 'A',
    explanation: 'O buraco da agulha é chamado de olho da agulha.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 22,
    total: 50,
    question: 'O que tem cabeça e cauda, mas não tem corpo?',
    options: [
      { key: 'A', text: 'Uma moeda' },
      { key: 'B', text: 'Uma cobra' },
      { key: 'C', text: 'Um peixe' },
      { key: 'D', text: 'Um lagarto' },
    ],
    correct: 'A',
    explanation: 'Uma moeda pode ter uma face e uma cauda, sem ter um corpo.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 23,
    total: 50,
    question: 'O que podes apanhar mas nunca podes atirar?',
    options: [
      { key: 'A', text: 'Uma bola' },
      { key: 'B', text: 'Uma constipação' },
      { key: 'C', text: 'Uma pedra' },
      { key: 'D', text: 'Um avião' },
    ],
    correct: 'B',
    explanation: 'Podemos apanhar uma constipação, mas não a podemos atirar fisicamente.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 24,
    total: 50,
    question: 'O que corre mas nunca tem pernas?',
    options: [
      { key: 'A', text: 'Um atleta' },
      { key: 'B', text: 'Um rio' },
      { key: 'C', text: 'Um cão' },
      { key: 'D', text: 'Uma galinha' },
    ],
    correct: 'B',
    explanation: 'Dizemos que um rio corre apesar de não ter pernas.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 25,
    total: 50,
    question: 'O que tem muitas chaves mas não abre nenhuma porta?',
    options: [
      { key: 'A', text: 'Um molho de chaves' },
      { key: 'B', text: 'Um piano' },
      { key: 'C', text: 'Uma fechadura' },
      { key: 'D', text: 'Uma garagem' },
    ],
    correct: 'B',
    explanation: 'Um piano tem muitas teclas, mas nenhuma abre uma porta.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 26,
    total: 50,
    question: 'O que tem folhas mas não é uma árvore?',
    options: [
      { key: 'A', text: 'Um livro' },
      { key: 'B', text: 'Uma pedra' },
      { key: 'C', text: 'Um sapato' },
      { key: 'D', text: 'Um copo' },
    ],
    correct: 'A',
    explanation: 'Um livro é composto por folhas.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 27,
    total: 50,
    question: 'O que desaparece no momento em que acendes a luz?',
    options: [
      { key: 'A', text: 'A escuridão' },
      { key: 'B', text: 'O chão' },
      { key: 'C', text: 'O teto' },
      { key: 'D', text: 'O ar' },
    ],
    correct: 'A',
    explanation: 'Quando acendes a luz, a escuridão desaparece naquele espaço.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 28,
    total: 50,
    question: 'Qual destas coisas pode ser quebrada sem ser tocada?',
    options: [
      { key: 'A', text: 'Uma promessa' },
      { key: 'B', text: 'Um copo' },
      { key: 'C', text: 'Um prato' },
      { key: 'D', text: 'Uma janela' },
    ],
    correct: 'A',
    explanation: 'Uma promessa pode ser quebrada sem contacto físico.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 29,
    total: 50,
    question: 'Se tens 5 velas acesas e apagas 2, quantas velas ficam?',
    options: [
      { key: 'A', text: '2' },
      { key: 'B', text: '3' },
      { key: 'C', text: '5' },
      { key: 'D', text: 'Nenhuma' },
    ],
    correct: 'C',
    explanation: 'Apagar duas velas não faz com que desapareçam. Continuam a existir as cinco.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 30,
    total: 50,
    question: 'Um médico dá-te 3 comprimidos e diz para tomares um a cada meia hora. Quanto tempo demora a tomar os três?',
    options: [
      { key: 'A', text: '30 minutos' },
      { key: 'B', text: '1 hora' },
      { key: 'C', text: '1 hora e 30 minutos' },
      { key: 'D', text: '2 horas' },
    ],
    correct: 'B',
    explanation: 'Tomas o primeiro imediatamente, o segundo 30 minutos depois e o terceiro 30 minutos depois.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 31,
    total: 50,
    question: 'Se um relógio estiver parado, quantas vezes por dia mostra a hora certa?',
    options: [
      { key: 'A', text: 'Nenhuma' },
      { key: 'B', text: 'Uma' },
      { key: 'C', text: 'Duas' },
      { key: 'D', text: 'Vinte e quatro' },
    ],
    correct: 'C',
    explanation: 'Um relógio parado num horário de 12 horas coincide duas vezes por dia com a hora certa.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 32,
    total: 50,
    question: 'Qual é o mês que tem menos dias?',
    options: [
      { key: 'A', text: 'Janeiro' },
      { key: 'B', text: 'Fevereiro' },
      { key: 'C', text: 'Abril' },
      { key: 'D', text: 'Junho' },
    ],
    correct: 'B',
    explanation: 'Fevereiro é o mês com menos dias.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 33,
    total: 50,
    question: 'Se uma pessoa tem uma mão cheia de dedos, quantos dedos tem em duas mãos?',
    options: [
      { key: 'A', text: '5' },
      { key: 'B', text: '8' },
      { key: 'C', text: '10' },
      { key: 'D', text: '12' },
    ],
    correct: 'C',
    explanation: 'Uma mão tem cinco dedos. Duas mãos têm dez.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 34,
    total: 50,
    question: 'O que é que tem pernas mas não anda?',
    options: [
      { key: 'A', text: 'Uma mesa' },
      { key: 'B', text: 'Um cão' },
      { key: 'C', text: 'Um cavalo' },
      { key: 'D', text: 'Uma pessoa' },
    ],
    correct: 'A',
    explanation: 'Uma mesa pode ter pernas, mas não anda.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 35,
    total: 50,
    question: 'Qual é a única coisa que podes dar a alguém e continuar a ter?',
    options: [
      { key: 'A', text: 'Um abraço' },
      { key: 'B', text: 'Um carro' },
      { key: 'C', text: 'Uma casa' },
      { key: 'D', text: 'Uma moeda' },
    ],
    correct: 'A',
    explanation: 'Podes dar um abraço e continuar a poder abraçar.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 36,
    total: 50,
    question: 'Qual é o lugar onde quinta vem antes de quarta?',
    options: [
      { key: 'A', text: 'Num calendário' },
      { key: 'B', text: 'Num dicionário' },
      { key: 'C', text: 'Na escola' },
      { key: 'D', text: 'Num relógio' },
    ],
    correct: 'B',
    explanation: 'Num dicionário, as palavras aparecem por ordem alfabética.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 37,
    total: 50,
    question: 'Se tens uma caixa vazia e colocas uma coisa lá dentro, continua vazia?',
    options: [
      { key: 'A', text: 'Sim' },
      { key: 'B', text: 'Não' },
      { key: 'C', text: 'Só às segundas-feiras' },
      { key: 'D', text: 'Depende da cor da caixa' },
    ],
    correct: 'B',
    explanation: 'Depois de colocares alguma coisa lá dentro, a caixa deixa de estar vazia.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 38,
    total: 50,
    question: 'Se tens 4 pernas de uma mesa, quantas pernas tem a mesa?',
    options: [
      { key: 'A', text: 'Uma' },
      { key: 'B', text: 'Duas' },
      { key: 'C', text: 'Quatro' },
      { key: 'D', text: 'Oito' },
    ],
    correct: 'C',
    explanation: 'A pergunta já diz que são quatro pernas.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 39,
    total: 50,
    question: 'O que pode atravessar uma cidade inteira sem sair do lugar?',
    options: [
      { key: 'A', text: 'Uma estrada' },
      { key: 'B', text: 'Um carro' },
      { key: 'C', text: 'Um avião' },
      { key: 'D', text: 'Um cão' },
    ],
    correct: 'A',
    explanation: 'Uma estrada pode atravessar uma cidade permanecendo no mesmo lugar.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 40,
    total: 50,
    question: 'O que sobe quando a chuva desce?',
    options: [
      { key: 'A', text: 'O guarda-chuva' },
      { key: 'B', text: 'O chão' },
      { key: 'C', text: 'O sofá' },
      { key: 'D', text: 'A televisão' },
    ],
    correct: 'A',
    explanation: 'Quando começa a chover, levantamos ou abrimos o guarda-chuva.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 41,
    total: 50,
    question: 'O que tem cabeça e cauda, mas não tem corpo?',
    options: [
      { key: 'A', text: 'Uma moeda' },
      { key: 'B', text: 'Um cão' },
      { key: 'C', text: 'Um peixe' },
      { key: 'D', text: 'Uma cobra' },
    ],
    correct: 'A',
    explanation: 'Uma moeda pode ser descrita como tendo cara e coroa, ou cabeça e cauda.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 42,
    total: 50,
    question: 'O que fica maior quanto mais tiras?',
    options: [
      { key: 'A', text: 'Um buraco' },
      { key: 'B', text: 'Um copo' },
      { key: 'C', text: 'Uma cadeira' },
      { key: 'D', text: 'Uma colher' },
    ],
    correct: 'A',
    explanation: 'Quanto mais material retiras de um buraco, maior ele fica.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 43,
    total: 50,
    question: 'O que tem uma cara e duas mãos mas não tem braços?',
    options: [
      { key: 'A', text: 'Um relógio' },
      { key: 'B', text: 'Um homem' },
      { key: 'C', text: 'Um boneco' },
      { key: 'D', text: 'Um jogador' },
    ],
    correct: 'A',
    explanation: 'Um relógio pode ter uma face e dois ponteiros chamados mãos.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 44,
    total: 50,
    question: 'O que podes ver uma vez num minuto, duas vezes num momento e nunca numa hora?',
    options: [
      { key: 'A', text: 'A letra M' },
      { key: 'B', text: 'A letra O' },
      { key: 'C', text: 'A letra A' },
      { key: 'D', text: 'A letra R' },
    ],
    correct: 'A',
    explanation: 'A letra M aparece uma vez em “minuto”, duas vezes em “momento” e nenhuma vez em “hora”.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 45,
    total: 50,
    question: 'O que tem anel mas não é joia?',
    options: [
      { key: 'A', text: 'Um telefone' },
      { key: 'B', text: 'Uma batata' },
      { key: 'C', text: 'Uma almofada' },
      { key: 'D', text: 'Uma colher' },
    ],
    correct: 'A',
    explanation: 'Um telefone pode tocar e ter um toque de chamada, associado à ideia de “ring”.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 46,
    total: 50,
    question: 'Qual é a coisa que quanto mais seca, mais molhada fica?',
    options: [
      { key: 'A', text: 'Uma toalha' },
      { key: 'B', text: 'Uma pedra' },
      { key: 'C', text: 'Uma mesa' },
      { key: 'D', text: 'Uma parede' },
    ],
    correct: 'A',
    explanation: 'A toalha absorve a água enquanto seca outras superfícies.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 47,
    total: 50,
    question: 'O que tem quatro pernas de manhã, duas ao meio-dia e três à noite?',
    options: [
      { key: 'A', text: 'Um cão' },
      { key: 'B', text: 'O ser humano' },
      { key: 'C', text: 'Uma mesa' },
      { key: 'D', text: 'Um gato' },
    ],
    correct: 'B',
    explanation: 'É a conhecida metáfora da Esfinge: bebé de quatro, adulto de duas e idoso com bengala.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 48,
    total: 50,
    question: 'O que tem um banco mas não é para sentar?',
    options: [
      { key: 'A', text: 'Um banco de dados' },
      { key: 'B', text: 'Uma cadeira' },
      { key: 'C', text: 'Uma cama' },
      { key: 'D', text: 'Um sofá' },
    ],
    correct: 'A',
    explanation: 'Um banco de dados tem “banco” no nome, mas não serve para sentar.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 49,
    total: 50,
    question: 'Se um homem tem 10 dedos nas mãos, quantos dedos têm 10 homens?',
    options: [
      { key: 'A', text: '50' },
      { key: 'B', text: '100' },
      { key: 'C', text: '20' },
      { key: 'D', text: '10' },
    ],
    correct: 'B',
    explanation: '10 homens × 10 dedos = 100 dedos.',
    points: 500,
  },
  {
    category: 'Modo Maluco',
    index: 50,
    total: 50,
    question: 'Qual é a coisa que quanto mais se aproxima, mais longe parece estar?',
    options: [
      { key: 'A', text: 'O horizonte' },
      { key: 'B', text: 'Uma parede' },
      { key: 'C', text: 'Uma porta' },
      { key: 'D', text: 'Uma cadeira' },
    ],
    correct: 'A',
    explanation: 'O horizonte parece afastar-se à medida que nos aproximamos dele.',
    points: 500,
  },
]

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
    explanation:
      'Beja é o maior distrito de Portugal, com cerca de 10 225 km².',
    points: 500,
  },
  {
    category: 'História',
    index: 6,
    total: 20,
    question:
      'Em que ano foi assinado o Tratado de Windsor entre Portugal e Inglaterra?',
    options: [
      { key: 'A', text: '1386' },
      { key: 'B', text: '1415' },
      { key: 'C', text: '1290' },
      { key: 'D', text: '1500' },
    ],
    correct: 'A',
    explanation:
      'O Tratado de Windsor foi assinado em 1386.',
    points: 500,
  },
]

export const ALL_QUIZ_QUESTIONS: QuizQuestion[] = [
  ...DEMO_QUIZ,
  ...MODO_MALUCO_QUESTIONS,
]
