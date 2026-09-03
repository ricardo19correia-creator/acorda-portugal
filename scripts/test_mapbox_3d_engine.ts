import {
  PORTUGAL_DISTRICTS_GEOJSON,
  TERRITORY_METADATA,
  getTerritoryByName,
} from '../lib/portugal-geojson'

function runTests() {
  console.log('=================================================================')
  console.log('🇵🇹 ACORDA PORTUGAL — SUITE DE TESTES MAPBOX 3D GOOGLE EARTH')
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

  // 4. Parâmetros 3D de Câmara por Território (Pitch > 50 para efeito 3D Google Earth)
  const allHavePitch = Object.values(TERRITORY_METADATA).every((m) => m.pitch >= 50 && m.pitch <= 85)
  assert(allHavePitch, '[CÂMARA 3D] Pitch Tático Elevado (50°-85°) para Relevo Real')

  // 5. Teste de Resolução por Nome
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

  console.log('\n=================================================================')
  console.log(`📊 RESULTADO DA SUITE: ${passed}/${total} TESTES APROVADOS (${Math.round((passed/total)*100)}%)`)
  console.log('=================================================================')

  if (passed !== total) {
    process.exit(1)
  }
}

runTests()
