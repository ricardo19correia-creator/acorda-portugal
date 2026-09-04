import {
  PORTUGAL_DISTRICTS_GEOJSON,
  TERRITORY_METADATA,
  REGION_CAMERA_PRESETS,
  getTerritoryByName,
  getAllTerritoriesList,
} from '../lib/portugal-geojson'
import { OFFICIAL_MAP_ARENAS, getArenaPOIById } from '../lib/map-arena-registry'
import { calculateDistrictWarTerritories } from '../lib/district-war'
import type { RankingPlayer } from '../lib/rankings'

function runPortugalMap2150Validation() {
  console.log('=================================================================')
  console.log('🇵🇹 OPERAÇÃO PORTUGAL MAP 2150 — VERIFICAÇÃO COMPLETA DE DADOS')
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

  // 1. Territórios Canónicos
  const territories = getAllTerritoriesList()
  assert(territories.length === 20, '20 Territórios Canónicos em TERRITORY_METADATA', `Total=${territories.length}`)

  // 2. Continente (18) + Ilhas (2)
  const mainland = territories.filter((t) => t.type === 'mainland')
  const islands = territories.filter((t) => t.type === 'island')
  assert(mainland.length === 18, '18 Distritos Continentais', `Encontrados=${mainland.length}`)
  assert(islands.length === 2, '2 Regiões Autónomas Insulares (Açores e Madeira)', `Encontrados=${islands.length}`)

  // 3. GeoJSON Features
  const features = PORTUGAL_DISTRICTS_GEOJSON.features
  assert(features.length === 20, '20 Features Poligonais em PORTUGAL_DISTRICTS_GEOJSON', `Features=${features.length}`)

  // 4. Coordenadas WGS84 Válidas
  let coordsOk = true
  for (const t of territories) {
    const [lng, lat] = t.center
    if (lng < -32 || lng > -5 || lat < 32 || lat > 43) {
      coordsOk = false
      console.error(`Coordenada inválida para ${t.name}: [${lng}, ${lat}]`)
    }
  }
  assert(coordsOk, 'Todos os Centróides Distritais em WGS84 Válidos')

  // 5. Presets de Regiões
  assert(
    REGION_CAMERA_PRESETS.continente.zoom >= 5 &&
    REGION_CAMERA_PRESETS.acores.zoom >= 5 &&
    REGION_CAMERA_PRESETS.madeira.zoom >= 8,
    'Presets de Câmara com Zoom Adequado'
  )

  // 6. Registro de Arenas Canónicas
  assert(OFFICIAL_MAP_ARENAS.length >= 20, 'Pelo menos 20 Arenas Oficiais Registadas', `Total=${OFFICIAL_MAP_ARENAS.length}`)

  let arenaCoordsOk = true
  let arenaImagesOk = true
  for (const a of OFFICIAL_MAP_ARENAS) {
    const [lng, lat] = a.coordinates
    if (lng < -32 || lng > -5 || lat < 32 || lat > 43) {
      arenaCoordsOk = false
      console.error(`Coordenada de arena inválida para ${a.name}: [${lng}, ${lat}]`)
    }
    if (!a.image || typeof a.image !== 'string' || a.image.length < 3) {
      arenaImagesOk = false
      console.error(`Imagem de arena inválida para ${a.name}`)
    }
  }
  assert(arenaCoordsOk, 'Todas as Arenas com Coordenadas Válidas em Portugal')
  assert(arenaImagesOk, 'Todas as Arenas com Imagens Oficiais Válidas')

  // 7. Resolução de Arenas por ID
  const ponte = getArenaPOIById('arena_ponte_d_luis')
  assert(ponte !== undefined && ponte.name.includes('Ponte D. Luís'), 'Resolução de Arena por ID')

  // 8. Integração da Guerra dos Distritos (Zero Bots)
  const mockHumanPlayers: RankingPlayer[] = [
    {
      uid: 'user-porto-1',
      displayName: 'Guerreiro Invicta',
      photoURL: '/avatars/campeao.png',
      district: 'Porto',
      xp: 45000,
      level: 18,
      title: 'Cavaleiro do Douro',
      wins1v1: 25,
      losses1v1: 3,
      gamesPlayed: 28,
      accuracyRate: 92,
      rating: 1850,
      division: 'Diamante',
      streak: 5,
      weeklyMovement: 3,
      playerType: 'human',
      isNpc: false,
    },
    {
      uid: 'user-lisboa-1',
      displayName: 'Capitão Tejo',
      photoURL: '/avatars/rei.png',
      district: 'Lisboa',
      xp: 60000,
      level: 22,
      title: 'Comandante Imperial',
      wins1v1: 35,
      losses1v1: 5,
      gamesPlayed: 40,
      accuracyRate: 95,
      rating: 2100,
      division: 'Mestre',
      streak: 8,
      weeklyMovement: 2,
      playerType: 'human',
      isNpc: false,
    },
  ]

  const warResult = calculateDistrictWarTerritories(mockHumanPlayers)
  assert(warResult.length === 20, 'Guerra dos Distritos Processa 20 Territórios', `Total=${warResult.length}`)

  const lisboaWar = warResult.find((t) => t.name === 'Lisboa')
  assert(lisboaWar !== undefined && lisboaWar.pos === 1, 'Lisboa em 1º Lugar com Maior Poder', `Pos=${lisboaWar?.pos}`)
  assert(lisboaWar?.king?.displayName === 'Capitão Tejo', 'Rei de Lisboa Atribuído a Jogador Real')

  const portoWar = warResult.find((t) => t.name === 'Porto')
  assert(portoWar !== undefined && portoWar.pos === 2, 'Porto em 2º Lugar', `Pos=${portoWar?.pos}`)

  // 9. Territórios sem atividade têm estado limpo (sem fabricação de estatísticas)
  const faroWar = warResult.find((t) => t.name === 'Faro')
  assert(faroWar !== undefined && faroWar.power === 0 && faroWar.king === null, 'Territórios sem Jogadores têm Trono Vago e Zero Poder Fabricado')

  console.log('\n=================================================================')
  console.log(`📊 RESULTADO FINAL: ${passed}/${total} TESTES APROVADOS (${Math.round((passed/total)*100)}%)`)
  console.log('=================================================================')

  if (passed !== total) {
    process.exit(1)
  }
}

runPortugalMap2150Validation()
