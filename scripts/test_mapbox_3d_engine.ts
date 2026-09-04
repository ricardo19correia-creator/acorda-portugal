import {
  PORTUGAL_DISTRICTS_GEOJSON,
  TERRITORY_METADATA,
  REGION_CAMERA_PRESETS,
  getTerritoryByName,
} from '../lib/portugal-geojson'
import { OFFICIAL_MAP_ARENAS, getArenaPOIById } from '../lib/map-arena-registry'

function runTests() {
  console.log('=================================================================')
  console.log('🇵🇹 ACORDA PORTUGAL — SUITE DE TESTES MAPA 3D // PORTUGAL 2150')
  console.log('=================================================================\n')

  let passed = 0
  let total = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    total++
    if (condition) {
      passed++
      console.log(`✅ [PASS] ${testName} — ${detail || 'OK'}`)
    } else {
      console.error(`❌ [FAIL] ${testName} — ${detail || 'FALHOU'}`)
    }
  }

  // 1. Contagem dos 20 Territórios no GeoJSON
  const features = PORTUGAL_DISTRICTS_GEOJSON.features
  assert(features.length === 20, '[GEOJSON] Contagem de 20 Territórios Canónicos', `Features=${features.length}/20`)

  // 2. Validação de Coordenadas WGS84 (Portugal Continental e Ilhas)
  let allCoordsValid = true
  for (const f of features) {
    if (f.geometry.type === 'Polygon') {
      const ring = f.geometry.coordinates[0]
      for (const [lng, lat] of ring) {
        if (lng < -32 || lng > -5 || lat < 32 || lat > 43) {
          allCoordsValid = false
          console.error(`Coordenada fora dos limites para ${f.properties?.name}: [${lng}, ${lat}]`)
        }
      }
    } else if (f.geometry.type === 'MultiPolygon') {
      for (const poly of f.geometry.coordinates) {
        for (const ring of poly) {
          for (const [lng, lat] of ring) {
            if (lng < -32 || lng > -5 || lat < 32 || lat > 43) {
              allCoordsValid = false
              console.error(`Coordenada fora dos limites para ${f.properties?.name}: [${lng}, ${lat}]`)
            }
          }
        }
      }
    }
  }
  assert(allCoordsValid, '[GEOJSON] Coordenadas WGS84 Válidas no Território Português')

  // 3. Metadados dos 20 Territórios
  const metaKeys = Object.keys(TERRITORY_METADATA)
  assert(metaKeys.length === 20, '[METADATA] 20 Territórios com Metadados Táticos', `Total=${metaKeys.length}/20`)

  // 4. Parâmetros 3D de Câmara por Território
  const allHavePitch = Object.values(TERRITORY_METADATA).every((m) => m.pitch >= 45 && m.pitch <= 85)
  assert(allHavePitch, '[CÂMARA 3D] Pitch Tático Relevo Real (45°-85°)')

  // 5. Presets de Região (Continente, Açores, Madeira)
  assert(
    REGION_CAMERA_PRESETS.continente.center[1] > 39 &&
    REGION_CAMERA_PRESETS.acores.center[0] < -20 &&
    REGION_CAMERA_PRESETS.madeira.center[1] < 34,
    '[PRESETS] Presets de Câmara de Continente, Açores e Madeira Válidos'
  )

  // 6. Teste de Resolução por Nome
  const lisboa = getTerritoryByName('Lisboa')
  assert(
    lisboa !== undefined && lisboa.capital === 'Lisboa' && lisboa.center[1] > 38 && lisboa.center[1] < 39,
    '[RESOLUÇÃO] Território Lisboa',
    `Center=[${lisboa?.center.join(', ')}]`
  )

  const porto = getTerritoryByName('porto')
  assert(
    porto !== undefined && porto.capital === 'Porto',
    '[RESOLUÇÃO] Case-Insensitive Porto',
    `Capital=${porto?.capital}`
  )

  const acores = getTerritoryByName('Açores')
  assert(
    acores !== undefined && acores.type === 'island' && acores.region === 'Açores',
    '[RESOLUÇÃO] Região Autónoma dos Açores',
    `Tipo=${acores?.type}`
  )

  const madeira = getTerritoryByName('Madeira')
  assert(
    madeira !== undefined && madeira.type === 'island' && madeira.capital === 'Funchal',
    '[RESOLUÇÃO] Região Autónoma da Madeira',
    `Capital=${madeira?.capital}`
  )

  // 7. Registro Geográfico de Arenas Oficiais
  assert(OFFICIAL_MAP_ARENAS.length >= 20, '[ARENAS] Registro Oficial de Arenas no Mapa', `Total=${OFFICIAL_MAP_ARENAS.length}`)

  let allArenasValid = true
  for (const a of OFFICIAL_MAP_ARENAS) {
    const [lng, lat] = a.coordinates
    if (lng < -32 || lng > -5 || lat < 32 || lat > 43) {
      allArenasValid = false
      console.error(`Coordenadas de arena inválidas para ${a.name}: [${lng}, ${lat}]`)
    }
  }
  assert(allArenasValid, '[ARENAS] Coordenadas Geográficas Portuguesas Válidas')

  const praca = getArenaPOIById('arena_praca_liberdade')
  assert(praca !== undefined && praca.district === 'Porto', '[ARENAS] Resolução de Arena Praça da Liberdade (Porto)')

  const belem = getArenaPOIById('arena_torre_belem')
  assert(belem !== undefined && belem.district === 'Lisboa', '[ARENAS] Resolução de Arena Torre de Belém (Lisboa)')

  console.log('\n=================================================================')
  console.log(`📊 RESULTADO DA SUITE: ${passed}/${total} TESTES APROVADOS (${Math.round((passed/total)*100)}%)`)
  console.log('=================================================================')

  if (passed !== total) {
    process.exit(1)
  }
}

runTests()
