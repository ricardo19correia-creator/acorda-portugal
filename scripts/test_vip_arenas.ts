import fs from 'fs'
import path from 'path'
import { SUPREME_ARENAS, getSupremeArenaById, getAllSupremeArenas } from '../lib/supreme-arenas'
import { getArenaAssets, getArenaGameBackground } from '../lib/arena-assets'
import { ARENA_SHOP_CATALOG, ARENA_IMAGES } from '../src/data/shopArenas'

function runTests() {
  console.log('=================================================================')
  console.log('🇵🇹 ACORDA PORTUGAL — SUITE DE TESTES DAS 11 ARENAS SUPREMAS VIP')
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

  // 1. Contagem das 11 Arenas Supremas
  const allSupreme = getAllSupremeArenas()
  assert(allSupreme.length === 11, '[CATÁLOGO] 11 Arenas Supremas Definidas', `Total=${allSupreme.length}`)

  // 2. IDs Únicos
  const ids = allSupreme.map((a) => a.id)
  const uniqueIds = new Set(ids)
  assert(uniqueIds.size === 11, '[CATÁLOGO] Unicidade de IDs Canónicos', `Únicos=${uniqueIds.size}/11`)

  // 3. Verificação Física de Assets no Disco
  let allAssetsExist = true
  const assetHashes = new Set<string>()
  for (const arena of allSupreme) {
    const filePath = path.resolve(process.cwd(), 'public' + arena.assetPath)
    const exists = fs.existsSync(filePath)
    if (!exists) {
      allAssetsExist = false
      console.error(`  Arquivo ausente: ${filePath}`)
    } else {
      const content = fs.readFileSync(filePath, 'utf8')
      // Hash do ficheiro inteiro
      let h = 0
      for (let i = 0; i < content.length; i++) {
        h = (Math.imul(31, h) + content.charCodeAt(i)) | 0
      }
      assetHashes.add(String(h))
    }
  }
  assert(allAssetsExist, '[ASSETS] Existência Física de Todos os 11 Ficheiros SVG no Disco')
  assert(assetHashes.size === 11, '[ASSETS] Não-Duplicação de Arte (Cada Arena tem Gráfico Próprio)', `Arte distinta=${assetHashes.size}/11`)

  // 4. Verificação de Raridades Canónicas
  const validRarities = ['Épica', 'Lendária', 'Mítica', 'Mítica — Ultra VIP']
  const allRaritiesValid = allSupreme.every((a) => validRarities.includes(a.rarity))
  assert(allRaritiesValid, '[RARIDADE] Raridades Canónicas Respeitadas')

  // 5. Verificação da Arena Palácio Nacional
  const palacio = getSupremeArenaById('arena_palacio_nacional')
  assert(
    palacio !== undefined && palacio.effectType === 'palacio_dourado' && palacio.rarity === 'Mítica',
    '[ARENA 01] Palácio Nacional (Mítica / Ouro & Mármore)',
    `Nome=${palacio?.name}, Efeito=${palacio?.effectType}`
  )

  // 6. Verificação do Estádio das Lendas
  const estadio = getSupremeArenaById('arena_estadio_das_lendas')
  assert(
    estadio !== undefined && estadio.effectType === 'estadio_holofotes' && estadio.rarity === 'Mítica',
    '[ARENA 02] Estádio das Lendas (Mítica / Holofotes & 80k Vozes)',
    `Nome=${estadio?.name}, Efeito=${estadio?.effectType}`
  )

  // 7. Verificação de Portugal 3D Digital Twin
  const pt3d = getSupremeArenaById('arena_portugal_3d')
  assert(
    pt3d !== undefined && pt3d.effectType === 'portugal_3d_grid' && pt3d.rarity === 'Mítica',
    '[ARENA 03] Portugal 3D Digital Twin (Mítica / Matriz Holográfica)',
    `Nome=${pt3d?.name}, Efeito=${pt3d?.effectType}`
  )

  // 8. Verificação do Trono Supremo do Campeão (Ultra VIP)
  const tronoSupremo = getSupremeArenaById('AP-VIP-ARENA-ULTIMATE-001')
  assert(
    tronoSupremo !== undefined && tronoSupremo.rarity === 'Mítica — Ultra VIP' && tronoSupremo.isVipEur,
    '[ARENA 07] Trono Supremo do Campeão (Ultra VIP / Final Mundial)',
    `Raridade=${tronoSupremo?.rarity}, Preço=€${tronoSupremo?.priceEur}`
  )

  // 9. Verificação de Portugal Celestial (Ultra VIP)
  const ptCelestial = getSupremeArenaById('AP-VIP-ARENA-ULTIMATE-002')
  assert(
    ptCelestial !== undefined && ptCelestial.rarity === 'Mítica — Ultra VIP' && ptCelestial.isVipEur,
    '[ARENA 08] Portugal Celestial (Ultra VIP / Espaço Cósmico)',
    `Raridade=${ptCelestial?.rarity}, Preço=€${ptCelestial?.priceEur}`
  )

  // 10. Resolução em lib/arena-assets.ts
  const resolvedPalacio = getArenaAssets('arena_palacio_nacional')
  assert(
    resolvedPalacio.isSupreme === true && resolvedPalacio.gameBackground === '/arenas/vip/palacio-nacional.svg',
    '[INTEGRAÇÃO] Resolução de Arena Suprema em getArenaAssets()',
    `Path=${resolvedPalacio.gameBackground}`
  )

  // 11. Resolução de Background no Quiz
  const quizBg = getArenaGameBackground('AP-VIP-ARENA-ULTIMATE-001')
  assert(
    quizBg === '/arenas/vip/ultimate/trono-supremo-campeao.svg',
    '[INTEGRAÇÃO] Resolução de Cenário para o Quiz (/jogar)',
    `QuizBg=${quizBg}`
  )

  // 12. Aliases Legados Resistem
  const legacyPalacio = getSupremeArenaById('AP-VIP-ARENA-PALACIO-NACIONAL')
  assert(
    legacyPalacio?.id === 'arena_palacio_nacional',
    '[RESILIÊNCIA] Resolução de Aliases Legados e Canónicos',
    `Alias=AP-VIP-ARENA-PALACIO-NACIONAL -> ID=${legacyPalacio?.id}`
  )

  console.log('\n=================================================================')
  console.log(`📊 RESULTADO DA SUITE: ${passed}/${total} TESTES APROVADOS (${Math.round((passed/total)*100)}%)`)
  console.log('=================================================================')

  if (passed !== total) {
    process.exit(1)
  }
}

runTests()
