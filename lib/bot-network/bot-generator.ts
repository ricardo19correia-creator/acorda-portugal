import type { BotPlayerRecord, BotPersonality, BotDifficulty } from './types'
import { PORTUGAL_DISTRICTS } from '@/data/districts'
import { MAIN_CATEGORIES } from '@/lib/categories-data'

const FIRST_NAMES = [
  'Joao', 'Maria', 'Rui', 'Sofia', 'Tiago', 'Ines', 'Vasco', 'Catarina', 'Duarte', 'Matilde',
  'Afonso', 'Beatriz', 'Goncalo', 'Leonor', 'Martim', 'Francisca', 'Rodrigo', 'Carolina',
  'Guilherme', 'Mariana', 'Salvador', 'Madalena', 'Lourenco', 'Camila', 'Santiago', 'Alice',
  'Tomas', 'Laura', 'Bernardo', 'Clara', 'Dinis', 'Diana', 'Henrique', 'Helena', 'Vicente',
  'Iris', 'Gustavo', 'Margarida', 'Manuel', 'Eva', 'Pedro', 'Mara', 'Lucas', 'Sara', 'Gabriel',
  'Lara', 'David', 'Rita', 'Mateus', 'Luana', 'Diogo', 'Constanca', 'Andre', 'Mafalda',
  'Rafael', 'Carlota', 'Antonio', 'Teresa', 'Francisco', 'Miriam', 'Miguel', 'Bia', 'Bruno',
  'Daniela', 'Hugo', 'Joana', 'Ricardo', 'Patricia', 'Nuno', 'Vera', 'Jorge', 'Carla',
  'Filipe', 'Sandra', 'Sergio', 'Paula', 'Alexandre', 'Monica', 'Carlos', 'Silvia', 'Paulo',
  'Helia', 'Mario', 'Carina', 'Marco', 'Susana', 'Helder', 'Claudia', 'Vitor', 'Sonia',
  'Luis', 'Tania', 'Fernando', 'Liliana', 'Fabio', 'Vanessa', 'Jose', 'Raquel', 'Renato',
  'Cristina', 'Daniel', 'Filipa', 'Ruben', 'Telma', 'Leandro', 'Adriana', 'Cesar', 'Ana',
  'Mauro', 'Bruna', 'Simão', 'Jessica', 'Gil', 'Debora', 'Emanuel', 'Irina', 'Artur', 'Katia',
  'Celso', 'Elsa', 'Ivo', 'Neide', 'Nelson', 'Dulce', 'Telmo', 'Silvia', 'Fabiano', 'Claudia',
]

const SUFFIXES = [
  '_AP', '_PT', 'Quiz', '_Luso', '_SabeTudo', '_Desafio', '_QuizPT', '_Fado', '_Minhoto', '_Norte',
  '_Sul', '_Centro', '_Tripeiro', '_Alfacinha', '_Galo', '_Madeira', '_Acores', '_Lenda', '_Pro',
]

const OFFICIAL_AVATARS = [
  '/images/avatars/avatar_galo.png',
  '/images/avatars/avatar_camões.png',
  '/images/avatars/avatar_padeira.png',
  '/images/avatars/avatar_d_afonso.png',
  '/images/avatars/avatar_ze_povinho.png',
  '/images/avatars/avatar_infante.png',
  '/images/avatars/avatar_caravela.png',
  '/images/avatars/avatar_pasteldebelem.png',
]

const CATEGORY_SLUGS = MAIN_CATEGORIES.map((c) => c.slug)

/**
 * Gera a pool completa de 457 desafiantes virtuais autênticos
 * (157 ativos imediatamente + 300 a ativar nas próximas 15 horas)
 */
export function generateBotsPool(total = 457, initialActiveCount = 157): BotPlayerRecord[] {
  const bots: BotPlayerRecord[] = []
  const now = Date.now()

  for (let i = 1; i <= total; i++) {
    const botId = `BOT_${String(i).padStart(4, '0')}`
    const firstName = FIRST_NAMES[(i - 1) % FIRST_NAMES.length]
    const suffix = SUFFIXES[(i - 1) % SUFFIXES.length]
    const displayName = `${firstName}${suffix}`
    const username = `${firstName.toLowerCase()}_${String(i).padStart(3, '0')}`

    // Distribuição equilibrada pelos 20 distritos e regiões
    const districtIndex = (i - 1) % PORTUGAL_DISTRICTS.length
    const district = PORTUGAL_DISTRICTS[districtIndex]

    // Avatar oficial rotativo
    const avatar = OFFICIAL_AVATARS[(i - 1) % OFFICIAL_AVATARS.length]

    // Distribuição de Personalidades:
    // 30% CASUAL, 35% NORMAL, 20% COMPETITIVO, 10% ESPECIALISTA, 5% ELITE
    const mod = i % 100
    let personality: BotPersonality = 'NORMAL'
    let difficulty: BotDifficulty = 'MEDIO'
    let baseAccuracy = 68
    let minTime = 3500
    let maxTime = 6500
    let level = 12
    let rating = 1250
    let wins = 40
    let losses = 30
    let streak = 2

    if (mod < 30) {
      personality = 'CASUAL'
      difficulty = 'FACIL'
      baseAccuracy = 45 + Math.floor(Math.random() * 16) // 45 a 60%
      minTime = 4500
      maxTime = 8000
      level = 3 + Math.floor(Math.random() * 10) // 3 a 12
      rating = 800 + Math.floor(Math.random() * 350) // 800 a 1150
      wins = 10 + Math.floor(Math.random() * 25)
      losses = 15 + Math.floor(Math.random() * 30)
      streak = Math.random() > 0.7 ? 2 : 0
    } else if (mod < 65) {
      personality = 'NORMAL'
      difficulty = 'MEDIO'
      baseAccuracy = 60 + Math.floor(Math.random() * 16) // 60 a 75%
      minTime = 3500
      maxTime = 6500
      level = 10 + Math.floor(Math.random() * 13) // 10 a 22
      rating = 1150 + Math.floor(Math.random() * 300) // 1150 a 1450
      wins = 35 + Math.floor(Math.random() * 40)
      losses = 25 + Math.floor(Math.random() * 35)
      streak = Math.floor(Math.random() * 4)
    } else if (mod < 85) {
      personality = 'COMPETITIVO'
      difficulty = 'DIFICIL'
      baseAccuracy = 70 + Math.floor(Math.random() * 16) // 70 a 85%
      minTime = 2500
      maxTime = 5000
      level = 18 + Math.floor(Math.random() * 15) // 18 a 32
      rating = 1450 + Math.floor(Math.random() * 300) // 1450 a 1750
      wins = 75 + Math.floor(Math.random() * 60)
      losses = 30 + Math.floor(Math.random() * 40)
      streak = 2 + Math.floor(Math.random() * 6)
    } else if (mod < 95) {
      personality = 'ESPECIALISTA'
      difficulty = 'DIFICIL'
      baseAccuracy = 65 + Math.floor(Math.random() * 15) // 65 a 80% base, alto nas especialidades
      minTime = 3000
      maxTime = 5500
      level = 15 + Math.floor(Math.random() * 16) // 15 a 30
      rating = 1350 + Math.floor(Math.random() * 300) // 1350 a 1650
      wins = 60 + Math.floor(Math.random() * 50)
      losses = 30 + Math.floor(Math.random() * 30)
      streak = 1 + Math.floor(Math.random() * 5)
    } else {
      personality = 'ELITE'
      difficulty = 'MESTRE'
      baseAccuracy = 80 + Math.floor(Math.random() * 13) // 80 a 92%
      minTime = 2000
      maxTime = 4000
      level = 30 + Math.floor(Math.random() * 11) // 30 a 40
      rating = 1750 + Math.floor(Math.random() * 350) // 1750 a 2100
      wins = 180 + Math.floor(Math.random() * 80)
      losses = 40 + Math.floor(Math.random() * 30)
      streak = 4 + Math.floor(Math.random() * 9)
    }

    // Categorias Fortes e Fracas
    const shuffledCats = [...CATEGORY_SLUGS].sort(() => 0.5 - Math.random())
    const strengths = shuffledCats.slice(0, personality === 'ESPECIALISTA' ? 4 : 2)
    const weaknesses = shuffledCats.slice(4, 6)

    const categoryAffinities: Record<string, number> = {}
    CATEGORY_SLUGS.forEach((slug) => {
      if (strengths.includes(slug)) {
        categoryAffinities[slug] = Math.min(96, baseAccuracy + (personality === 'ESPECIALISTA' ? 22 : 12))
      } else if (weaknesses.includes(slug)) {
        categoryAffinities[slug] = Math.max(35, baseAccuracy - 18)
      } else {
        categoryAffinities[slug] = baseAccuracy + (Math.floor(Math.random() * 9) - 4)
      }
    })

    const avgResponseTimeMs = Math.round((minTime + maxTime) / 2)
    const xp = level * level * 85 + Math.floor(Math.random() * 500)
    const coins = 200 + Math.round(wins * 25)

    // Os primeiros 157 bots são ATIVOS IMEDIATAMENTE!
    const isImmediatelyActive = i <= initialActiveCount

    bots.push({
      id: botId,
      isBot: true,
      displayName,
      username,
      avatar,
      district,
      status: isImmediatelyActive ? 'ACTIVE' : 'INACTIVE',
      personality,
      difficulty,
      accuracyPercentage: baseAccuracy,
      minResponseTimeMs: minTime,
      maxResponseTimeMs: maxTime,
      avgResponseTimeMs,
      rating,
      level,
      xp,
      coins,
      wins,
      losses,
      draws: 0,
      streak,
      createdAt: now,
      activatedAt: isImmediatelyActive ? now : null,
      lastActiveAt: isImmediatelyActive ? now : null,
      strengths,
      weaknesses,
      categoryAffinities,
    })
  }

  return bots
}

export const generate125Bots = generateBotsPool
