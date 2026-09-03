import { GET as rankingsGet } from '../app/api/rankings/route'
import { GET as meGet } from '../app/api/rankings/me/route'
import { NextRequest } from 'next/server'
import {
  calculateCompetitiveDivision,
  ALL_DISTRICTS_LIST,
  mapDocToRankingPlayer,
} from '../lib/rankings'
import { calculateDistrictWarTerritories } from '../lib/district-war'
import { ACTIVE_SEASON_01, HISTORICAL_HALL_OF_FAME } from '../lib/seasons'

interface TestResult {
  name: string
  passed: boolean
  details: string
}

const results: TestResult[] = []

function assert(condition: boolean, name: string, details: string) {
  results.push({
    name,
    passed: condition,
    details: condition ? `PASS: ${details}` : `FAIL: ${details}`,
  })
}

async function runTestSuite() {
  console.log('=================================================================')
  console.log('🧪 SUITE DE TESTES FORENSES — PORTUGAL 2050 RANKINGS ENGINE')
  console.log('=================================================================\n')

  // TEST 1: GET /api/rankings (Nacional)
  {
    console.log('▶ Test 1: Consulta API Ranking Nacional...')
    const req = new NextRequest('http://localhost:3000/api/rankings?mode=nacional&limit=10')
    const res = await rankingsGet(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.ok === true && Array.isArray(json.players) && Boolean(json.requestId),
      'GET /api/rankings (nacional)',
      `Status: ${res.status}, Players Count: ${json.players.length}, ReqId: ${json.requestId}`
    )
  }

  // TEST 2: GET /api/rankings (Distritos)
  {
    console.log('▶ Test 2: Consulta API Ranking por Distrito (Porto)...')
    const req = new NextRequest('http://localhost:3000/api/rankings?mode=distrito&district=Porto')
    const res = await rankingsGet(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.ok === true && json.district === 'Porto',
      'GET /api/rankings (distrito: Porto)',
      `Status: ${res.status}, District: ${json.district}`
    )
  }

  // TEST 3: GET /api/rankings (Duelos 1v1)
  {
    console.log('▶ Test 3: Consulta API Ranking Duelos 1v1...')
    const req = new NextRequest('http://localhost:3000/api/rankings?mode=duelos')
    const res = await rankingsGet(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.ok === true && json.mode === 'duelos',
      'GET /api/rankings (duelos)',
      `Status: ${res.status}, Mode: ${json.mode}`
    )
  }

  // TEST 4: GET /api/rankings (Guerra dos Distritos)
  {
    console.log('▶ Test 4: Consulta API Guerra dos Distritos (20 Territórios)...')
    const req = new NextRequest('http://localhost:3000/api/rankings?mode=guerra')
    const res = await rankingsGet(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.ok === true && json.territories?.length === 20,
      'GET /api/rankings (guerra dos distritos: 20 territórios)',
      `Status: ${res.status}, Territories Count: ${json.territories?.length}`
    )
  }

  // TEST 5: GET /api/rankings (Temporada 01)
  {
    console.log('▶ Test 5: Consulta API Temporada 01...')
    const req = new NextRequest('http://localhost:3000/api/rankings?mode=temporada')
    const res = await rankingsGet(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.ok === true && json.season?.name === 'TEMPORADA 01',
      'GET /api/rankings (temporada)',
      `Status: ${res.status}, Season: ${json.season?.name}`
    )
  }

  // TEST 6: GET /api/rankings (Hall of Fame)
  {
    console.log('▶ Test 6: Consulta API Hall of Fame...')
    const req = new NextRequest('http://localhost:3000/api/rankings?mode=hall-of-fame')
    const res = await rankingsGet(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.ok === true && Array.isArray(json.hallOfFame),
      'GET /api/rankings (hall of fame)',
      `Status: ${res.status}, HoF Entries: ${json.hallOfFame.length}`
    )
  }

  // TEST 7: GET /api/rankings/me (Unauthenticated 401)
  {
    console.log('▶ Test 7: Consulta /api/rankings/me sem autenticação...')
    const req = new NextRequest('http://localhost:3000/api/rankings/me')
    const res = await meGet(req)
    const json = await res.json()
    assert(
      res.status === 401 && json.error?.code === 'UNAUTHORIZED',
      'GET /api/rankings/me (unauthorized rejection)',
      `Status: ${res.status}, Code: ${json.error?.code}`
    )
  }

  // TEST 8: GET /api/rankings/me (Authenticated user test)
  {
    console.log('▶ Test 8: Consulta /api/rankings/me com token autenticado...')
    const req = new NextRequest('http://localhost:3000/api/rankings/me', {
      headers: { Authorization: 'Bearer test-token-testuser_rank_01' },
    })
    const res = await meGet(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.ok === true && typeof json.ranks?.national === 'number',
      'GET /api/rankings/me (user rank computation)',
      `Status: ${res.status}, NationalRank: #${json.ranks?.national}, District: ${json.ranks?.districtName}`
    )
  }

  // TEST 9: Competitive Division Thresholds
  {
    console.log('▶ Test 9: Validação das 7 Divisões Competitivas...')
    const bronze = calculateCompetitiveDivision(800)
    const prata = calculateCompetitiveDivision(1100)
    const ouro = calculateCompetitiveDivision(1400)
    const platina = calculateCompetitiveDivision(1700)
    const diamante = calculateCompetitiveDivision(2000)
    const mestre = calculateCompetitiveDivision(2300)
    const lendario = calculateCompetitiveDivision(2600)

    assert(
      bronze === 'Bronze' &&
      prata === 'Prata' &&
      ouro === 'Ouro' &&
      platina === 'Platina' &&
      diamante === 'Diamante' &&
      mestre === 'Mestre' &&
      lendario === 'Lendário',
      'Competitive Division Thresholds (Bronze..Lendário)',
      `800=${bronze}, 1100=${prata}, 1400=${ouro}, 1700=${platina}, 2000=${diamante}, 2300=${mestre}, 2600=${lendario}`
    )
  }

  // TEST 10: District War Calculation (All 20 districts)
  {
    console.log('▶ Test 10: Validação de Fórmula da Guerra dos Distritos...')
    const mockPlayers = [
      mapDocToRankingPlayer('p1', { displayName: 'Mestre Porto', district: 'Porto', xp: 50000, wins1v1: 20 }),
      mapDocToRankingPlayer('p2', { displayName: 'Rei Lisboa', district: 'Lisboa', xp: 40000, wins1v1: 15 }),
      mapDocToRankingPlayer('p3', { displayName: 'Campeão Açores', district: 'Açores', xp: 30000, wins1v1: 10 }),
      mapDocToRankingPlayer('p4', { displayName: 'Guardião Madeira', district: 'Madeira', xp: 25000, wins1v1: 8 }),
    ]

    const territories = calculateDistrictWarTerritories(mockPlayers)
    const porto = territories.find((t) => t.name === 'Porto')
    const acores = territories.find((t) => t.name === 'Açores')
    const madeira = territories.find((t) => t.name === 'Madeira')

    assert(
      territories.length === 20 &&
      porto?.pos === 1 &&
      porto?.power > 0 &&
      porto?.king?.displayName === 'Mestre Porto' &&
      acores?.type === 'island' &&
      madeira?.type === 'island',
      'District War Power & Island Recognition',
      `Total: ${territories.length}, Leader: ${porto?.name} (${porto?.powerFormatted}), Açores: ${acores?.type}, Madeira: ${madeira?.type}`
    )
  }

  // TEST 11: Privacy & Security Sanitization
  {
    console.log('▶ Test 11: Auditoria de Privacidade (Zero email / segredos expostos)...')
    const testDoc = mapDocToRankingPlayer('user_sec_1', {
      name: 'Jogador Seguro',
      email: 'privado@acordaportugal.pt',
      passwordHash: 'secret_hash_123',
      stripeCustomerId: 'cus_12345',
      xp: 12000,
      district: 'Coimbra',
    })

    const hasNoPrivateFields =
      !(testDoc as any).email &&
      !(testDoc as any).passwordHash &&
      !(testDoc as any).stripeCustomerId &&
      testDoc.displayName === 'Jogador Seguro'

    assert(
      hasNoPrivateFields,
      'Privacy Sanitization & Public Profile Security',
      `Private fields blocked: ${hasNoPrivateFields}, DisplayName: ${testDoc.displayName}`
    )
  }

  console.log('\n=================================================================')
  console.log('📊 RESULTADOS DOS TESTES:')
  console.log('=================================================================')

  let allPassed = true
  for (const r of results) {
    const statusIcon = r.passed ? '✅ [PASS]' : '❌ [FAIL]'
    console.log(`${statusIcon} ${r.name} — ${r.details}`)
    if (!r.passed) allPassed = false
  }

  console.log('=================================================================')
  if (allPassed) {
    console.log('🎉 TODOS OS TESTES DE RANKINGS E GUERRA PASSARAM COM SUCESSO!')
    process.exit(0)
  } else {
    console.error('💥 ALGUNS TESTES FALHARAM!')
    process.exit(1)
  }
}

runTestSuite().catch((err) => {
  console.error('Erro fatal ao executar suite:', err)
  process.exit(1)
})
