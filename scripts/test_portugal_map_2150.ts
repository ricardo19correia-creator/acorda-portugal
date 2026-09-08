import {
  TERRITORY_METADATA,
  REGION_CAMERA_PRESETS,
  getTerritoryByName,
  getAllTerritoriesList,
} from '../lib/territory-metadata'
import { PORTUGAL_TERRITORIES } from '../lib/portugal-territories'
import {
  CANONICAL_TERRITORIES,
  CANONICAL_CITIES,
  CANONICAL_LANDMARKS,
  CANONICAL_CONNECTIONS,
  CANONICAL_ARENAS,
  getNexusTerritoryByName,
  getCanonicalArenaById,
} from '../lib/portugal-map-nexus-data'
import { OFFICIAL_MAP_ARENAS, getArenaPOIById } from '../lib/map-arena-registry'
import { calculateDistrictWarTerritories } from '../lib/district-war'
import type { RankingPlayer } from '../lib/rankings'

function runPortugalMap2150Validation() {
  console.log('=================================================================')
  console.log('🇵🇹 OPERAÇÃO NEXUS 2150 — VERIFICAÇÃO COMPLETA DE DADOS DO MAPA 3D')
  console.log('=================================================================\n')

  let passed = 0
  let total = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    total++
    if (condition) {
      passed++
      console.log(`✅ [PASS] ${testName} ${detail ? `(${detail})` : ''}`)
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `(${detail})` : ''}`)
    }
  }

  // 1. Territórios Canónicos Nexus 2150
  assert(CANONICAL_TERRITORIES.length === 20, '20 Territórios Canónicos em CANONICAL_TERRITORIES', `Total=${CANONICAL_TERRITORIES.length}`)

  // 2. Continente (18) + Ilhas (2)
  const mainland = CANONICAL_TERRITORIES.filter((t) => t.type === 'mainland')
  const islands = CANONICAL_TERRITORIES.filter((t) => t.type === 'island')
  assert(mainland.length === 18, '18 Distritos Continentais', `Encontrados=${mainland.length}`)
  assert(islands.length === 2, '2 Regiões Autónomas Insulares (Açores e Madeira)', `Encontrados=${islands.length}`)

  // 3. Relevo 3D Real (Elevação)
  const guarda = getNexusTerritoryByName('Guarda')
  const pico = getNexusTerritoryByName('Açores')
  const aveiro = getNexusTerritoryByName('Aveiro')
  assert(guarda !== undefined && guarda.elevation >= 1.8, 'Guarda / Serra da Estrela com Alta Elevação 3D', `Elev=${guarda?.elevation}`)
  assert(pico !== undefined && pico.elevation >= 2.0, 'Açores / Montanha do Pico com Relevo Proeminente', `Elev=${pico?.elevation}`)
  assert(aveiro !== undefined && aveiro.elevation < 0.6, 'Aveiro Litoral com Elevação Suave', `Elev=${aveiro?.elevation}`)

  // 4. Cidades de Portugal (Pelo menos 18 cidades com coordenadas)
  assert(CANONICAL_CITIES.length >= 18, 'Pelo menos 18 Cidades Oficiais Registadas', `Total=${CANONICAL_CITIES.length}`)
  let citiesCoordsOk = true
  for (const c of CANONICAL_CITIES) {
    const [lng, lat] = c.coordinates
    if (lng < -32 || lng > -5 || lat < 32 || lat > 43) {
      citiesCoordsOk = false
      console.error(`Coordenada inválida para cidade ${c.name}: [${lng}, ${lat}]`)
    }
  }
  assert(citiesCoordsOk, 'Todas as Cidades com Coordenadas Válidas em Território Português')

  // 5. Landmarks Especiais Holográficos
  assert(CANONICAL_LANDMARKS.length >= 8, 'Pelo menos 8 Landmarks Oficiais', `Total=${CANONICAL_LANDMARKS.length}`)
  const belem = CANONICAL_LANDMARKS.find((l) => l.name.includes('Belém'))
  const dluis = CANONICAL_LANDMARKS.find((l) => l.name.includes('Luís'))
  const coimbra = CANONICAL_LANDMARKS.find((l) => l.name.includes('Universidade'))
  assert(belem !== undefined && dluis !== undefined && coimbra !== undefined, 'Landmarks Emblemáticos Identificados (Belém, D. Luís, Coimbra)')

  // 6. Conexões de Rede Nacional e Relés Atlânticos
  assert(CANONICAL_CONNECTIONS.length >= 10, 'Rede de Conexões Geodésicas Mapeada', `Total=${CANONICAL_CONNECTIONS.length}`)
  const atlanticRelays = CANONICAL_CONNECTIONS.filter((c) => c.type === 'atlantic_relay')
  assert(atlanticRelays.length >= 2, 'Relés Atlânticos conectando Continente a Açores e Madeira', `Relés=${atlanticRelays.length}`)

  // 7. Arenas Canónicas com Imagens Válidas
  assert(CANONICAL_ARENAS.length >= 20, 'Pelo menos 20 Arenas Oficiais Registadas', `Total=${CANONICAL_ARENAS.length}`)
  let arenaImagesOk = true
  for (const a of CANONICAL_ARENAS) {
    if (!a.image || typeof a.image !== 'string' || a.image.length < 4) {
      arenaImagesOk = false
      console.error(`Imagem inválida para arena ${a.name}`)
    }
  }
  assert(arenaImagesOk, 'Todas as Arenas com Imagens Resolvidas sem Falhas')

  // 8. Integridade de Guerra dos Distritos (Zero Fake Data)
  const mockHumanPlayers: RankingPlayer[] = [
    {
      uid: 'user-porto-nexus',
      displayName: 'Comandante Invicta',
      photoURL: '/avatars/campeao.png',
      district: 'Porto',
      xp: 50000,
      level: 19,
      title: 'Guardião do Douro',
      wins1v1: 30,
      losses1v1: 2,
      gamesPlayed: 32,
      accuracyRate: 94,
      rating: 1900,
      division: 'Diamante',
      streak: 6,
      weeklyMovement: 4,
      playerType: 'human',
      isNpc: false,
    },
  ]

  const warResult = calculateDistrictWarTerritories(mockHumanPlayers)
  assert(warResult.length === 20, 'Guerra dos Distritos Processa 20 Territórios Canónicos', `Total=${warResult.length}`)

  const portoWar = warResult.find((t) => t.name === 'Porto')
  assert(portoWar !== undefined && portoWar.king?.displayName === 'Comandante Invicta', 'Rei de Porto Atribuído a Jogador Real')

  // Território sem jogador não inventa números
  const faroWar = warResult.find((t) => t.name === 'Faro')
  assert(faroWar !== undefined && faroWar.power === 0 && faroWar.king === null, 'Territórios sem Jogadores têm Zero Poder Fabricado e Trono Vago')

  console.log('\n=================================================================')
  console.log(`📊 RESULTADO FINAL: ${passed}/${total} TESTES APROVADOS (${Math.round((passed / total) * 100)}%)`)
  console.log('=================================================================')

  if (passed !== total) {
    process.exit(1)
  }
}

runPortugalMap2150Validation()
