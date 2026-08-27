import type { NpcProfile, NpcDifficulty, NpcPersonality } from './types'

const DISTRICTS = [
  'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra',
  'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisboa', 'Portalegre',
  'Porto', 'Santarém', 'Setúbal', 'Viana do Castelo', 'Vila Real',
  'Viseu', 'Açores', 'Madeira',
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
    const district = DISTRICTS[(i * 3) % DISTRICTS.length]
    const avatar = AVATAR_IMAGES[i % AVATAR_IMAGES.length]

    // Nível coerente entre 3 e 38
    const level = 3 + ((i * 17) % 35)
    // XP proporcional ao nível
    const xp = Math.round(level * level * 85 + ((i * 31) % 400))
    // Rating ELO entre 850 e 2150
    const rating = 850 + Math.round((level / 38) * 1200 + ((i * 23) % 100))

    const wins = Math.round(level * 4 + ((i * 13) % 25))
    const losses = Math.max(1, Math.round(wins * (0.35 + (i % 5) * 0.08)))

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

    const avgResponseTimeSeconds = Number((3.0 + ((i % 7) * 0.6)).toFixed(1))

    // Intervalo de horas preferenciais
    const startHour = (i * 2) % 24
    const preferredHours = [startHour, (startHour + 1) % 24, (startHour + 2) % 24, (startHour + 3) % 24]

    npcs.push({
      npcId: `npc_${String(i).padStart(3, '0')}`,
      playerType: 'npc',
      isNpc: true,
      displayName,
      username,
      avatar,
      district,
      level,
      xp,
      rating,
      wins,
      losses,
      difficulty,
      personality,
      accuracyRange: [minAcc, maxAcc],
      avgResponseTimeSeconds,
      preferredHours,
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
    const diffA = Math.abs(a.rating - playerRating) + Math.abs(a.level - playerLevel) * 20
    const diffB = Math.abs(b.rating - playerRating) + Math.abs(b.level - playerLevel) * 20
    return diffA - diffB
  })

  // Seleciona aleatoriamente entre os 5 mais próximos para variedade
  const topCandidates = sorted.slice(0, 5)
  const randomIndex = Math.floor(Math.random() * topCandidates.length)
  return topCandidates[randomIndex] || sorted[0]
}
