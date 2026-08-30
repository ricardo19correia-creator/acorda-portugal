import type { NpcProfile, NpcDifficulty, NpcPersonality } from './types'
import { PROGRESSION_LEVELS, calculateLevelProgress } from '@/lib/progression'

export const OFFICIAL_20_DISTRICTS = [
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

const AVATAR_IMAGES = [
  '/images/avatars/camoes-2050.jpg',
  '/images/avatars/vulcao-acores.jpg',
  '/images/avatars/lenda-futebol.jpg',
  '/images/avatars/fadista-cyber.jpg',
  '/images/avatars/galo-barcelos.jpg',
  '/images/avatars/cavaleiro-ouro.jpg',
  '/images/avatars/rainha-santa.jpg',
  '/images/avatars/navegador-astros.jpg',
  '/images/avatars/pastor-estrela.jpg',
]

const FIRST_NAMES = [
  'Rui', 'Inês', 'Tiago', 'Catarina', 'Gonçalo', 'Beatriz', 'Afonso', 'Mariana',
  'Diogo', 'Matilde', 'Martim', 'Leonor', 'Rodrigo', 'Sofia', 'Duarte', 'Laura',
  'Tomás', 'Francisca', 'Guilherme', 'Carolina', 'Henrique', 'Margarida', 'Bernardo',
  'Alice', 'Vasco', 'Clara', 'Gabriel', 'Diana', 'Salvador', 'Madalena',
  'Lourenço', 'Joana', 'Santiago', 'Rita', 'Pedro', 'Camila', 'Francisco',
  'Constança', 'Manuel', 'Mafalda', 'Simão', 'Sara', 'João', 'Marta',
  'Lucas', 'Bárbara', 'António', 'Helena', 'Dinis', 'Teresa',
]

const LAST_NAMES = [
  'Mendes', 'Carvalho', 'Fernandes', 'Neves', 'Silva', 'Lopes', 'Rocha',
  'Santos', 'Ribeiro', 'Sousa', 'Pinto', 'Castro', 'Ferreira', 'Pereira',
  'Martins', 'Alves', 'Dias', 'Vaz', 'Cunha', 'Coelho', 'Gomes', 'Teixeira',
  'Costa', 'Moreira', 'Rodrigues', 'Nunes', 'Marques', 'Almeida', 'Cardoso',
  'Vieira', 'Barbosa', 'Barros', 'Ramos', 'Reis', 'Monteiro', 'Borges',
]

function generateDeterministicNpcs(): NpcProfile[] {
  const npcs: NpcProfile[] = []

  for (let i = 1; i <= 100; i++) {
    const firstName = FIRST_NAMES[(i * 7) % FIRST_NAMES.length]
    const lastName = LAST_NAMES[(i * 11) % LAST_NAMES.length]
    const displayName = `${firstName} ${lastName}`
    const username = `@${firstName.toLowerCase()}${lastName.toLowerCase()}`
    
    // Distribuição perfeitamente equilibrada pelos 20 distritos (5 NPCs por distrito)
    const district = OFFICIAL_20_DISTRICTS[(i - 1) % OFFICIAL_20_DISTRICTS.length]
    const avatar = AVATAR_IMAGES[i % AVATAR_IMAGES.length]

    // Distribuição balanceada e orgânica de XP RPG (150 a 25,000 XP)
    let xp = 200

    if (i <= 5) {
      // Top 5 Elite Nacional / Mestres (15,000 a 25,000 XP -> Níveis 4 a 5)
      const targetLevel = 4 + (i % 2)
      const baseXp = targetLevel === 5 ? 25000 : 15000
      const span = targetLevel === 5 ? 4000 : 8000
      xp = baseXp + Math.round(((i * 73) % span))
    } else if (i <= 25) {
      // 20 Competidores Avançados Distritais (7,500 a 15,000 XP -> Níveis 3 a 4)
      const targetLevel = 3 + (i % 2)
      const baseXp = targetLevel === 4 ? 15000 : 7500
      const span = targetLevel === 4 ? 4000 : 5000
      xp = baseXp + Math.round(((i * 47) % span))
    } else if (i <= 60) {
      // 35 Jogadores Intermédios (2,500 a 7,500 XP -> Níveis 2 a 3)
      const targetLevel = 2 + (i % 2)
      const baseXp = targetLevel === 3 ? 7500 : 2500
      const span = targetLevel === 3 ? 3000 : 3500
      xp = baseXp + Math.round(((i * 31) % span))
    } else {
      // 40 Jogadores Casuais / Em Ascensão (150 a 2,500 XP -> Níveis 1 a 2)
      const targetLevel = 1 + (i % 2)
      const baseXp = targetLevel === 2 ? 2500 : 150
      const span = targetLevel === 2 ? 1800 : 1800
      xp = baseXp + Math.round(((i * 19) % span))
    }

    // CÁLCULO CANÓNICO E DETERMINÍSTICO DE NÍVEL E TÍTULO
    const levelInfo = calculateLevelProgress(xp)
    const level = levelInfo.currentLevel.level
    const title = levelInfo.currentLevel.title

    // Rating ELO calibrado (800 a 1350)
    const rating = 800 + Math.round((level / 6) * 450 + ((i * 13) % 100))

    const wins = Math.max(1, Math.round((xp / 400) + ((i * 7) % 6)))
    const losses = Math.max(0, Math.round(wins * (0.35 + (i % 5) * 0.08)))

    const diffIndex = (i % 4)
    const difficulties: NpcDifficulty[] = ['facil', 'medio', 'dificil', 'mestre']
    const difficulty = difficulties[diffIndex]

    const persIndex = (i % 4)
    const personalities: NpcPersonality[] = ['casual', 'competitivo', 'especialista', 'estrategico']
    const personality = personalities[persIndex]

    let minAcc = 0.50
    let maxAcc = 0.70
    if (difficulty === 'facil') { minAcc = 0.40; maxAcc = 0.60 }
    if (difficulty === 'medio') { minAcc = 0.55; maxAcc = 0.75 }
    if (difficulty === 'dificil') { minAcc = 0.70; maxAcc = 0.88 }
    if (difficulty === 'mestre') { minAcc = 0.82; maxAcc = 0.95 }

    const avgResponseTimeSeconds = Number((2.8 + ((i % 7) * 0.5)).toFixed(1))

    // Horários preferenciais de atividade
    const startHour = (i * 3) % 24
    const preferredHours = [startHour, (startHour + 1) % 24, (startHour + 2) % 24, (startHour + 3) % 24]

    const frames = [undefined, 'frame_ouro', 'frame_prata', 'frame_neon', 'frame_fogo']
    const equippedFrame = level >= 4 ? frames[i % frames.length] : undefined
    const virtualMoney = Math.round(100 + level * 100 + wins * 20 + ((i * 19) % 150))
    const accuracyRate = Math.round(((minAcc + maxAcc) / 2) * 100)

    const npcId = `npc_${String(i).padStart(3, '0')}`

    npcs.push({
      id: npcId,
      npcId,
      playerType: 'npc',
      isNpc: true,
      name: displayName,
      displayName,
      username,
      avatar,
      district,
      level,
      xp,
      elo: rating,
      rating,
      wins,
      losses,
      difficulty,
      personality,
      accuracyRange: [minAcc, maxAcc],
      avgResponseTimeSeconds,
      preferredHours,
      title,
      equippedTitle: title,
      equippedFrame,
      virtualMoney,
      stats: {
        duelsWon: wins,
        duelsTotal: wins + losses,
        accuracyRate,
      },
    })
  }

  return npcs
}

export const NPC_CATALOG: NpcProfile[] = generateDeterministicNpcs()

export function getNpcById(npcId: string): NpcProfile | undefined {
  return NPC_CATALOG.find((npc) => npc.npcId === npcId)
}

export function getCompatibleNpcForDuel(playerLevel = 1, playerRating = 1000): NpcProfile {
  // Procura NPCs com rating e nível próximos
  const sorted = [...NPC_CATALOG].sort((a, b) => {
    const diffA = Math.abs(a.rating - playerRating) + Math.abs(a.level - playerLevel) * 25
    const diffB = Math.abs(b.rating - playerRating) + Math.abs(b.level - playerLevel) * 25
    return diffA - diffB
  })

  // Seleciona aleatoriamente entre os 5 mais compatíveis para variedade
  const topCandidates = sorted.slice(0, 5)
  const randomIndex = Math.floor(Math.random() * topCandidates.length)
  return topCandidates[randomIndex] || sorted[0]
}
