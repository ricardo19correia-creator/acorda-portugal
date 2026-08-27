import type {
  BotPlayerRecord,
  BotPlayerPrivateRecord,
  BotPersonality,
  BotDifficulty,
} from './types'
import { MAIN_CATEGORIES } from '@/lib/categories-data'
import { BOT_AVATARS_LIBRARY } from '@/lib/avatars'

// 50 Primeiros Nomes Portugueses Autênticos
const FIRST_NAMES = [
  'Rui', 'Ines', 'Tiago', 'Mariana', 'Joao', 'Andre', 'Sofia', 'Miguel', 'Daniela', 'Bruno',
  'Catarina', 'Pedro', 'Vasco', 'Matilde', 'Goncalo', 'Leonor', 'Rodrigo', 'Carolina', 'Guilherme', 'Madalena',
  'Lourenco', 'Camila', 'Santiago', 'Alice', 'Tomas', 'Laura', 'Bernardo', 'Clara', 'Dinis', 'Diana',
  'Henrique', 'Helena', 'Vicente', 'Iris', 'Gustavo', 'Margarida', 'Manuel', 'Eva', 'Lucas', 'Sara',
  'Gabriel', 'Lara', 'David', 'Rita', 'Mateus', 'Luana', 'Diogo', 'Constanca', 'Rafael', 'Carlota',
]

// 50 Apelidos Portugueses Tradicionais
const SURNAMES = [
  'Mendes', 'Carvalho', 'Silva', 'Costa', 'Ribeiro', 'Martins', 'Pereira', 'Sousa', 'Rocha', 'Alves',
  'Santos', 'Oliveira', 'Ferreira', 'Dias', 'Neves', 'Pinto', 'Teixeira', 'Lopes', 'Gomes', 'Fonseca',
  'Cardoso', 'Monteiro', 'Correia', 'Barbosa', 'Ramos', 'Reis', 'Macedo', 'Coelho', 'Morais', 'Tavares',
  'Nunes', 'Vieira', 'Leal', 'Brito', 'Simoes', 'Faria', 'Magalhaes', 'Cunha', 'Marques', 'Freitas',
  'Pires', 'Duarte', 'Figueiredo', 'Antunes', 'Valente', 'Cruz', 'Mota', 'Matos', 'Gaspar', 'Borges',
]

// Ponderação populacional realista dos 20 distritos/regiões
const WEIGHTED_DISTRICTS = [
  'Lisboa', 'Lisboa', 'Lisboa', 'Lisboa', 'Lisboa',
  'Porto', 'Porto', 'Porto', 'Porto',
  'Braga', 'Braga', 'Braga',
  'Setúbal', 'Setúbal', 'Setúbal',
  'Aveiro', 'Aveiro',
  'Coimbra', 'Coimbra',
  'Leiria', 'Leiria',
  'Faro', 'Faro',
  'Santarém', 'Santarém',
  'Viseu', 'Viseu',
  'Viana do Castelo',
  'Vila Real',
  'Castelo Branco',
  'Guarda',
  'Évora',
  'Beja',
  'Bragança',
  'Portalegre',
  'Açores', 'Açores',
  'Madeira', 'Madeira',
]

const CATEGORY_SLUGS = MAIN_CATEGORIES.map((c) => c.slug)

/**
 * Curva dinâmica horária padrão de 24h
 * 0h: 5 ativos | 1h: 8 | 2h: 12 | 4h: 18 | 6h: 25 | 8h: 32 | 10h: 40 | 12h: 50 | 14h: 62 | 16h: 75 | 18h: 85 | 20h: 95 | 22h: 105 | 24h: 120
 */
export const DEFAULT_24H_TARGETS = [
  5, 8, 12, 15, 18, 21, 25, 28, 32, 36, 40, 45, 50, 56, 62, 68, 75, 80, 85, 90, 95, 100, 105, 112, 125,
]

export interface GeneratedBotPair {
  publicRecord: BotPlayerRecord
  privateRecord: BotPlayerPrivateRecord
}

/**
 * Gera uma pool de 125 desafiantes virtuais autênticos e não-repetitivos
 * com separação estrita de dados públicos e privados
 */
export function generateBotsPoolV2(total = 125): {
  publicRecords: BotPlayerRecord[]
  privateRecords: BotPlayerPrivateRecord[]
} {
  const publicRecords: BotPlayerRecord[] = []
  const privateRecords: BotPlayerPrivateRecord[] = []
  const now = Date.now()

  const usedNames = new Set<string>()
  const usedUsernames = new Set<string>()

  for (let i = 1; i <= total; i++) {
    const botId = `BOT_${String(i).padStart(4, '0')}`

    // 1. Geração de Nome & Username Realistas e Únicos
    let firstName = FIRST_NAMES[(i * 7 + 3) % FIRST_NAMES.length]
    let surname = SURNAMES[(i * 11 + 5) % SURNAMES.length]
    let displayName = `${firstName} ${surname}`
    let username = `${firstName.toLowerCase()}${surname.toLowerCase()}`

    // Variação orgânica nos nomes para evitar colisões
    let counter = 1
    while (usedNames.has(displayName)) {
      surname = SURNAMES[(i * 11 + 5 + counter) % SURNAMES.length]
      displayName = `${firstName} ${surname}`
      counter++
    }
    usedNames.add(displayName)

    if (usedUsernames.has(username)) {
      const yearSuffix = 85 + (i % 18) // 85 a 02
      username = `${firstName.toLowerCase()}_${surname.toLowerCase()}${i % 3 === 0 ? yearSuffix : ''}`
    }
    usedUsernames.add(username)

    // 2. Distrito com distribuição ponderada
    const district = WEIGHTED_DISTRICTS[(i - 1) % WEIGHTED_DISTRICTS.length]

    // 3. Avatar da biblioteca expandida de 50+ combinações
    const avatar = BOT_AVATARS_LIBRARY[(i - 1) % BOT_AVATARS_LIBRARY.length]

    // 4. Atribuição de IntelligencePercent (1–99) e Faixas de Competência
    // 4% muito fraco (1-20), 8% fraco (21-35), 18% abaixo da média (36-50),
    // 32% normal (51-65), 22% bom (66-75), 10% muito bom (76-85), 4% excelente (86-93), 2% elite (94-99)
    const percentileMod = i % 100
    let intelligencePercent = 60
    let personality: BotPersonality = 'NORMAL'
    let difficulty: BotDifficulty = 'MEDIO'
    let minTime = 3200
    let maxTime = 6800
    let level = 12
    let rating = 1220
    let wins = 42
    let losses = 35
    let streak = 1

    if (percentileMod < 4) {
      // 1-20 Muito Fraco
      intelligencePercent = 10 + Math.floor(Math.random() * 11) // 10 a 20
      personality = 'CASUAL'
      difficulty = 'FACIL'
      minTime = 5500
      maxTime = 9500
      level = 3 + Math.floor(Math.random() * 4) // 3 a 6
      rating = 820 + Math.floor(Math.random() * 180) // 820 a 1000
      wins = 8 + Math.floor(Math.random() * 12)
      losses = 22 + Math.floor(Math.random() * 18)
      streak = 0
    } else if (percentileMod < 12) {
      // 21-35 Fraco
      intelligencePercent = 21 + Math.floor(Math.random() * 15) // 21 a 35
      personality = 'CASUAL'
      difficulty = 'FACIL'
      minTime = 4500
      maxTime = 8500
      level = 6 + Math.floor(Math.random() * 6) // 6 a 11
      rating = 980 + Math.floor(Math.random() * 180) // 980 a 1160
      wins = 18 + Math.floor(Math.random() * 16)
      losses = 28 + Math.floor(Math.random() * 20)
      streak = Math.random() > 0.6 ? 1 : 0
    } else if (percentileMod < 30) {
      // 36-50 Abaixo da Média
      intelligencePercent = 36 + Math.floor(Math.random() * 15) // 36 a 50
      personality = 'CASUAL'
      difficulty = 'MEDIO'
      minTime = 3800
      maxTime = 7500
      level = 9 + Math.floor(Math.random() * 8) // 9 a 16
      rating = 1120 + Math.floor(Math.random() * 180) // 1120 a 1300
      wins = 28 + Math.floor(Math.random() * 24)
      losses = 30 + Math.floor(Math.random() * 22)
      streak = Math.floor(Math.random() * 2)
    } else if (percentileMod < 62) {
      // 51-65 Normal
      intelligencePercent = 51 + Math.floor(Math.random() * 15) // 51 a 65
      personality = 'NORMAL'
      difficulty = 'MEDIO'
      minTime = 3200
      maxTime = 6500
      level = 14 + Math.floor(Math.random() * 9) // 14 a 22
      rating = 1260 + Math.floor(Math.random() * 200) // 1260 a 1460
      wins = 48 + Math.floor(Math.random() * 32)
      losses = 38 + Math.floor(Math.random() * 26)
      streak = Math.floor(Math.random() * 3)
    } else if (percentileMod < 84) {
      // 66-75 Bom
      intelligencePercent = 66 + Math.floor(Math.random() * 10) // 66 a 75
      personality = 'COMPETITIVO'
      difficulty = 'DIFICIL'
      minTime = 2600
      maxTime = 5400
      level = 19 + Math.floor(Math.random() * 10) // 19 a 28
      rating = 1440 + Math.floor(Math.random() * 220) // 1440 a 1660
      wins = 75 + Math.floor(Math.random() * 45)
      losses = 42 + Math.floor(Math.random() * 28)
      streak = 1 + Math.floor(Math.random() * 4)
    } else if (percentileMod < 94) {
      // 76-85 Muito Bom
      intelligencePercent = 76 + Math.floor(Math.random() * 10) // 76 a 85
      personality = 'ESPECIALISTA'
      difficulty = 'DIFICIL'
      minTime = 2200
      maxTime = 4800
      level = 24 + Math.floor(Math.random() * 9) // 24 a 32
      rating = 1620 + Math.floor(Math.random() * 220) // 1620 a 1840
      wins = 110 + Math.floor(Math.random() * 55)
      losses = 45 + Math.floor(Math.random() * 25)
      streak = 2 + Math.floor(Math.random() * 5)
    } else if (percentileMod < 98) {
      // 86-93 Excelente
      intelligencePercent = 86 + Math.floor(Math.random() * 8) // 86 a 93
      personality = 'COMPETITIVO'
      difficulty = 'MESTRE'
      minTime = 1800
      maxTime = 4000
      level = 28 + Math.floor(Math.random() * 8) // 28 a 35
      rating = 1800 + Math.floor(Math.random() * 220) // 1800 a 2020
      wins = 150 + Math.floor(Math.random() * 65)
      losses = 40 + Math.floor(Math.random() * 20)
      streak = 3 + Math.floor(Math.random() * 6)
    } else {
      // 94-99 Elite
      intelligencePercent = 94 + Math.floor(Math.random() * 6) // 94 a 99
      personality = 'ELITE'
      difficulty = 'MESTRE'
      minTime = 1500
      maxTime = 3400
      level = 33 + Math.floor(Math.random() * 6) // 33 a 38
      rating = 1980 + Math.floor(Math.random() * 180) // 1980 a 2160
      wins = 210 + Math.floor(Math.random() * 75)
      losses = 35 + Math.floor(Math.random() * 15)
      streak = 5 + Math.floor(Math.random() * 8)
    }

    // 5. Categorias Fortes e Fracas
    const shuffledCats = [...CATEGORY_SLUGS].sort(() => 0.5 - Math.random())
    const strengthsCount = personality === 'ESPECIALISTA' ? 4 : 2
    const strengths = shuffledCats.slice(0, strengthsCount)
    const weaknesses = shuffledCats.slice(strengthsCount, strengthsCount + 2)

    const categoryWeights: Record<string, number> = {}
    const categoryAffinities: Record<string, number> = {}

    CATEGORY_SLUGS.forEach((slug) => {
      if (strengths.includes(slug)) {
        categoryWeights[slug] = 1.35
        categoryAffinities[slug] = Math.min(97, intelligencePercent + 20)
      } else if (weaknesses.includes(slug)) {
        categoryWeights[slug] = 0.7
        categoryAffinities[slug] = Math.max(30, intelligencePercent - 22)
      } else {
        categoryWeights[slug] = 1.0
        categoryAffinities[slug] = Math.max(35, Math.min(95, intelligencePercent + (Math.floor(Math.random() * 11) - 5)))
      }
    })

    const avgResponseTimeMs = Math.round((minTime + maxTime) / 2)
    const accuracyPercentage = Math.max(35, Math.min(94, Math.round(intelligencePercent * 0.9 + 5)))
    const xp = level * level * 95 + Math.floor(Math.random() * 600)
    const coins = 300 + Math.round(wins * 30)

    // Agendamento horário de ativação na curva de 24h
    // Os primeiros 5 bots são ativados no minuto 0 (Hora 0)
    // Os restantes são distribuídos ao longo das 24 horas
    const scheduledHour = Math.min(24, Math.floor(((i - 1) / total) * 24))
    const isInitiallyActive = i <= 5

    // Documento PÚBLICO
    publicRecords.push({
      id: botId,
      isBot: true,
      displayName,
      username,
      avatar,
      district,
      status: isInitiallyActive ? 'ACTIVE' : 'INACTIVE',
      level,
      xp,
      coins,
      rating,
      wins,
      losses,
      draws: 0,
      streak,
      accuracyPercentage,
      avgResponseTimeMs,
      strengths,
      weaknesses,
      categoryAffinities,
      createdAt: now,
      activatedAt: isInitiallyActive ? now : null,
      lastActiveAt: isInitiallyActive ? now : null,
    })

    // Documento PRIVADO
    privateRecords.push({
      id: botId,
      isBot: true,
      intelligencePercent,
      personality,
      difficulty,
      accuracyModel: {
        baseAccuracy: accuracyPercentage,
        categoryWeights,
        streakSensitivity: personality === 'CASUAL' ? 0.03 : 0.08,
      },
      responseModel: {
        minResponseTimeMs: minTime,
        maxResponseTimeMs: maxTime,
        baseJitterMs: 650,
        difficultyScale: 1.25,
      },
      activationSchedule: {
        order: i,
        scheduledHour,
      },
      recentMatchesHistory: [],
      internalSeed: `seed_${botId}_${displayName.replace(/\s+/g, '')}_${now}`,
      adminMetadata: {
        notes: `Bot gerado automaticamente com inteligência ${intelligencePercent}% (${personality}).`,
        updatedAt: now,
      },
    })
  }

  return { publicRecords, privateRecords }
}

// Retrocompatibilidade
export function generateBotsPool(total = 125, initialActiveCount = 5): BotPlayerRecord[] {
  const { publicRecords } = generateBotsPoolV2(total)
  for (let i = 0; i < publicRecords.length; i++) {
    if (i < initialActiveCount) {
      publicRecords[i].status = 'ACTIVE'
      publicRecords[i].activatedAt = Date.now()
    } else {
      publicRecords[i].status = 'INACTIVE'
    }
  }
  return publicRecords
}

export const generate125Bots = generateBotsPool
