import { calculateLevelProgress } from '../lib/progression'
import {
  calculateCompetitiveDivision,
  ALL_DISTRICTS_LIST,
  mapDocToRankingPlayer,
} from '../lib/rankings'
import { calculateDistrictWarTerritories } from '../lib/district-war'
import { ACTIVE_SEASON_01, HISTORICAL_HALL_OF_FAME, calculateTimeRemaining } from '../lib/seasons'
import { CONSUMABLE_RULES, ECONOMY_CONFIG } from '../src/data/economy'
import { ANIMATED_FRAMES } from '../data/frames'
import { SHOP_CATALOG } from '../lib/shop-catalog'

interface TestResult {
  domain: string
  name: string
  passed: boolean
  details: string
}

const results: TestResult[] = []

function assert(condition: boolean, domain: string, name: string, details: string) {
  results.push({
    domain,
    name,
    passed: condition,
    details: condition ? `PASS: ${details}` : `FAIL: ${details}`,
  })
}

async function runEcosystemTests() {
  console.log('=================================================================')
  console.log('🇵🇹 ACORDA PORTUGAL — SUITE DE TESTES FORENSES DO ECOSSISTEMA 2150')
  console.log('=================================================================\n')

  // DOMAIN 1: PROGRESSION & COMMAND CENTER
  {
    console.log('▶ [1/6] Testando Motor de Progressão e Command Center 2150...')
    const level1 = calculateLevelProgress(0)
    const level4 = calculateLevelProgress(15000)
    const level21 = calculateLevelProgress(3000000)

    assert(
      level1.currentLevel.level === 1 && level1.xpRemaining > 0,
      'PROGRESSION',
      'Level 1 Initialization & XP Target',
      `Level=${level1.currentLevel.level}, XPToNext=${level1.xpRemaining}`
    )

    assert(
      level4.currentLevel.level === 4 && level4.progressPercentage >= 0 && level4.progressPercentage <= 100,
      'PROGRESSION',
      'Mid-tier RPG Level Progress & Percentage',
      `Level=${level4.currentLevel.level}, Progress=${level4.progressPercentage}%`
    )

    assert(
      level21.currentLevel.level === 21,
      'PROGRESSION',
      'Max RPG Level 21 (Mestre Supremo)',
      `Level=${level21.currentLevel.level}, Title=${level21.currentLevel.title}`
    )
  }

  // DOMAIN 2: CANONICAL ECONOMY, LEDGER & CONSUMABLE AIDS
  {
    console.log('▶ [2/6] Testando Economia Canónica, Tiers e Regras Anti-Pay-to-Win...')
    assert(
      ECONOMY_CONFIG.INITIAL_BONUS_COINS === 50 && ECONOMY_CONFIG.MATCH_REWARDS.BASE_WIN_COINS > 0,
      'ECONOMY',
      'Economy Base Configuration & Rewards',
      `InitialBonus=${ECONOMY_CONFIG.INITIAL_BONUS_COINS}, MatchBaseCoins=${ECONOMY_CONFIG.MATCH_REWARDS.BASE_WIN_COINS}`
    )

    const aid5050 = CONSUMABLE_RULES['AID_002']
    const aidPublic = CONSUMABLE_RULES['AID_003']
    const aidFreeze = CONSUMABLE_RULES['AID_004']

    assert(
      Boolean(aid5050 && aidPublic && aidFreeze && aid5050.maxOwned === 50),
      'ECONOMY',
      'Anti-Pay-to-Win Cap on Consumable Aids (Max 50)',
      `AID_002 MaxOwned=${aid5050?.maxOwned}, AID_003 MaxOwned=${aidPublic?.maxOwned}`
    )
  }

  // DOMAIN 3: DISTRICT WAR & TERRITORIAL RECOGNITION (18 CONTINENT + 2 ISLANDS)
  {
    console.log('▶ [3/6] Testando Guerra dos Distritos e 20 Territórios Canónicos...')
    const samplePlayers = [
      mapDocToRankingPlayer('u1', { displayName: 'Comandante Porto', district: 'Porto', xp: 60000, wins1v1: 25 }),
      mapDocToRankingPlayer('u2', { displayName: 'Guardião Lisboa', district: 'Lisboa', xp: 55000, wins1v1: 20 }),
      mapDocToRankingPlayer('u3', { displayName: 'Voz Açores', district: 'Açores', xp: 40000, wins1v1: 15 }),
      mapDocToRankingPlayer('u4', { displayName: 'Mestre Madeira', district: 'Madeira', xp: 35000, wins1v1: 12 }),
    ]

    const territories = calculateDistrictWarTerritories(samplePlayers)
    assert(
      territories.length === 20 && ALL_DISTRICTS_LIST.length === 20,
      'TERRITORY',
      '20 Canonical Districts (18 Mainland + Açores + Madeira)',
      `Total Territories=${territories.length}`
    )

    const porto = territories.find((t) => t.name === 'Porto')
    const acores = territories.find((t) => t.name === 'Açores')
    const madeira = territories.find((t) => t.name === 'Madeira')

    assert(
      porto?.pos === 1 && porto?.king?.displayName === 'Comandante Porto' && porto?.power > 0,
      'TERRITORY',
      'Territory Leaderboard & Sovereign King Calculation',
      `Leader=${porto?.name}, Power=${porto?.powerFormatted}, King=${porto?.king?.displayName}`
    )

    assert(
      acores?.type === 'island' && madeira?.type === 'island',
      'TERRITORY',
      'Autonomous Island Regions Recognition',
      `AçoresType=${acores?.type}, MadeiraType=${madeira?.type}`
    )
  }

  // DOMAIN 4: COMPETITIVE ELO RATINGS & DIVISIONS (BRONZE TO LENDÁRIO)
  {
    console.log('▶ [4/6] Testando Sistema Competitivo Elo & 7 Divisões...')
    const divBronze = calculateCompetitiveDivision(750)
    const divPrata = calculateCompetitiveDivision(1150)
    const divOuro = calculateCompetitiveDivision(1450)
    const divPlatina = calculateCompetitiveDivision(1750)
    const divDiamante = calculateCompetitiveDivision(2050)
    const divMestre = calculateCompetitiveDivision(2350)
    const divLendario = calculateCompetitiveDivision(2650)

    assert(
      divBronze === 'Bronze' &&
      divPrata === 'Prata' &&
      divOuro === 'Ouro' &&
      divPlatina === 'Platina' &&
      divDiamante === 'Diamante' &&
      divMestre === 'Mestre' &&
      divLendario === 'Lendário',
      'COMPETITIVE',
      '7 Tier Elo Division Escalation',
      `Levels: ${divBronze} -> ${divPrata} -> ${divOuro} -> ${divPlatina} -> ${divDiamante} -> ${divMestre} -> ${divLendario}`
    )
  }

  // DOMAIN 5: SEASONS & HALL OF FAME
  {
    console.log('▶ [5/6] Testando Temporada 01 e Museu do Hall of Fame...')
    const timer = calculateTimeRemaining(ACTIVE_SEASON_01.endDate)

    assert(
      ACTIVE_SEASON_01.id === 'season_01' && ACTIVE_SEASON_01.totalPrizePoolCoins === 500000 && !timer.isExpired,
      'SEASONS',
      'Active Season 01 Configuration & Prize Pool',
      `Name=${ACTIVE_SEASON_01.name}, PrizePool=${ACTIVE_SEASON_01.totalPrizePoolCoins}, TimeRemaining=${timer.formatted}`
    )

    assert(
      HISTORICAL_HALL_OF_FAME.length > 0 && Boolean(HISTORICAL_HALL_OF_FAME[0].champion.displayName),
      'SEASONS',
      'Historical Hall of Fame Archive',
      `HoF Records=${HISTORICAL_HALL_OF_FAME.length}, Season0 Champion=${HISTORICAL_HALL_OF_FAME[0].champion.displayName}`
    )
  }

  // DOMAIN 6: SHOP, ANIMATED FRAMES & VIP CATALOG
  {
    console.log('▶ [6/6] Testando Catálogo da Loja, Molduras Vivas e VIPs...')
    assert(
      ANIMATED_FRAMES.length >= 24,
      'SHOP',
      '24 Canonical Animated Living Frames',
      `Count=${ANIMATED_FRAMES.length}`
    )

    assert(
      SHOP_CATALOG.length >= 300,
      'SHOP',
      'Full Shop Catalog Items Count (>300 products)',
      `Total Shop Items=${SHOP_CATALOG.length}`
    )
  }

  console.log('\n=================================================================')
  console.log('📊 RESUMO DOS TESTES DO ECOSSISTEMA 2150:')
  console.log('=================================================================')

  let allPassed = true
  for (const r of results) {
    const statusIcon = r.passed ? '✅ [PASS]' : '❌ [FAIL]'
    console.log(`${statusIcon} [${r.domain}] ${r.name} — ${r.details}`)
    if (!r.passed) allPassed = false
  }

  console.log('=================================================================')
  if (allPassed) {
    console.log('🎉 TODOS OS 12 TESTES DO ECOSSISTEMA PORTUGAL 2150 FORAM APROVADOS!')
    process.exit(0)
  } else {
    console.error('💥 ALGUNS TESTES FALHARAM!')
    process.exit(1)
  }
}

runEcosystemTests().catch((err) => {
  console.error('Erro fatal ao executar suite do ecossistema:', err)
  process.exit(1)
})
