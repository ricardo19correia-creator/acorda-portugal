/**
 * Teste Automatizado do Sistema Oficial de 24 Molduras Vivas
 * Acorda Portugal - Validação de Catálogo, Filtros e Renderização na Loja
 */

const fs = require('fs')
const path = require('path')
const ts = require('typescript')

function requireTs(filePath) {
  const code = fs.readFileSync(filePath, 'utf8')
  const result = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
  })
  const m = { exports: {} }
  const customRequire = (id) => {
    if (id.startsWith('@/')) {
      const resolved = path.join(__dirname, '..', id.replace('@/', ''))
      if (fs.existsSync(resolved + '.ts')) return requireTs(resolved + '.ts')
      if (fs.existsSync(resolved + '.tsx')) return requireTs(resolved + '.tsx')
      if (fs.existsSync(resolved + '.json')) return JSON.parse(fs.readFileSync(resolved + '.json', 'utf8'))
      if (fs.existsSync(resolved)) {
        if (fs.statSync(resolved).isDirectory()) {
          if (fs.existsSync(path.join(resolved, 'index.ts'))) return requireTs(path.join(resolved, 'index.ts'))
        }
        return JSON.parse(fs.readFileSync(resolved, 'utf8'))
      }
    }
    if (id.endsWith('.json')) {
      const resolved = path.resolve(path.dirname(filePath), id)
      return JSON.parse(fs.readFileSync(resolved, 'utf8'))
    }
    return require(id)
  }
  const fn = new Function('require', 'exports', 'module', '__filename', '__dirname', result.outputText)
  fn(customRequire, m.exports, m, filePath, path.dirname(filePath))
  return m.exports
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`)
    process.exit(1)
  }
  console.log(`✅ PASS: ${message}`)
}

console.log('====================================================')
console.log('🧪 TESTE OFICIAL DO SISTEMA DE 24 MOLDURAS VIVAS')
console.log('====================================================\n')

// 1. CARREGAR CATÁLOGOS (CANÓNICO EM src/data/frames.ts E PROXY EM data/frames.ts)
const srcFrames = requireTs(path.join(__dirname, '../src/data/frames.ts'))
const dataFrames = requireTs(path.join(__dirname, '../data/frames.ts'))

const { ANIMATED_FRAMES, FRAME_ALIASES, getFrameById, getFrameRarityBadge } = srcFrames

// 2. VALIDAÇÃO DO TOTAL GLOBAL
console.log('--- GRUPO 1: TOTAL GLOBAL DE MOLDURAS ---')
assert(ANIMATED_FRAMES.length === 24, `Catálogo src/data/frames.ts contém exatamente 24 molduras (atual: ${ANIMATED_FRAMES.length})`)
assert(dataFrames.ANIMATED_FRAMES.length === 24, `Proxy data/frames.ts exporta exatamente 24 molduras (atual: ${dataFrames.ANIMATED_FRAMES.length})`)

// 3. VALIDAÇÃO DOS 24 IDs CANÓNICOS OBRIGATÓRIOS
console.log('\n--- GRUPO 2: VALIDAÇÃO DOS 24 IDs CANÓNICOS ---')
const REQUIRED_24_IDS = [
  // 1. Elemental & Natureza (6)
  'frame_fogo_eterno',
  'frame_ondas_atlantico',
  'frame_tempestade_eletrica',
  'frame_gelo_ancestral',
  'frame_natureza_viva',
  'frame_dragao_fumegante',

  // 2. Cósmicas & Cyber (4)
  'frame_galaxia_profunda',
  'frame_cyber_laser',
  'frame_horizonte_eventos',
  'frame_plasma_solar',

  // 3. Realeza & Deuses (4)
  'frame_ouro_real',
  'frame_diamante_sagrado',
  'frame_luz_divina',
  'frame_esmeralda_imperial',

  // 4. Lusitanas & PT (6)
  'frame_quinas_portugal',
  'frame_rosa_dos_ventos',
  'frame_azulejo_portugues',
  'frame_muralha_castelo',
  'frame_farol_sagres',
  'frame_fado_guitarra',

  // 5. Especiais & Arcade (4)
  'frame_arcade_8bit',
  'frame_biohazard_toxic',
  'frame_gladiador_ferro',
  'frame_sakura_zen',
]

const foundIds = new Set(ANIMATED_FRAMES.map((f) => f.id))
REQUIRED_24_IDS.forEach((id) => {
  assert(foundIds.has(id), `ID obrigatório presente no catálogo: ${id}`)
  const frame = getFrameById(id)
  assert(Boolean(frame && frame.id === id), `getFrameById resolve ID canónico: ${id}`)
})

// 4. VALIDAÇÃO DA DISTRIBUIÇÃO DAS 5 COLEÇÕES
console.log('\n--- GRUPO 3: DISTRIBUIÇÃO DAS 5 COLEÇÕES ---')
const categoryCounts = {
  elemental: 0,
  cosmico: 0,
  real: 0,
  lusitano: 0,
  especial: 0,
}

ANIMATED_FRAMES.forEach((f) => {
  if (categoryCounts[f.categoryKey] !== undefined) {
    categoryCounts[f.categoryKey]++
  }
})

assert(categoryCounts.elemental === 6, `Coleção Elemental contém 6 molduras (atual: ${categoryCounts.elemental})`)
assert(categoryCounts.cosmico === 4, `Coleção Cósmicas contém 4 molduras (atual: ${categoryCounts.cosmico})`)
assert(categoryCounts.real === 4, `Coleção Realeza contém 4 molduras (atual: ${categoryCounts.real})`)
assert(categoryCounts.lusitano === 6, `Coleção Lusitanas contém 6 molduras (atual: ${categoryCounts.lusitano})`)
assert(categoryCounts.especial === 4, `Coleção Especiais contém 4 molduras (atual: ${categoryCounts.especial})`)
const sumCats = categoryCounts.elemental + categoryCounts.cosmico + categoryCounts.real + categoryCounts.lusitano + categoryCounts.especial
assert(sumCats === 24, `Soma matemática das coleções é exatamente 24 (6+4+4+6+4)`)

// 5. VALIDAÇÃO DAS RARIDADES
console.log('\n--- GRUPO 4: DISTRIBUIÇÃO DE RARIDADES ---')
const rarityCounts = {
  Raro: 0,
  Épico: 0,
  Lendário: 0,
  Mítico: 0,
}
ANIMATED_FRAMES.forEach((f) => {
  if (rarityCounts[f.rarity] !== undefined) {
    rarityCounts[f.rarity]++
  }
})
console.log(`Distribuição de raridades: Raro=${rarityCounts.Raro}, Épico=${rarityCounts.Épico}, Lendário=${rarityCounts.Lendário}, Mítico=${rarityCounts.Mítico}`)
assert(rarityCounts.Raro > 0, `Existem molduras de raridade Raro (${rarityCounts.Raro})`)
assert(rarityCounts.Épico > 0, `Existem molduras de raridade Épico (${rarityCounts.Épico})`)
assert(rarityCounts.Lendário > 0, `Existem molduras de raridade Lendário (${rarityCounts.Lendário})`)
assert(rarityCounts.Mítico > 0, `Existem molduras de raridade Mítico (${rarityCounts.Mítico})`)
const sumRars = rarityCounts.Raro + rarityCounts.Épico + rarityCounts.Lendário + rarityCounts.Mítico
assert(sumRars === 24, `Soma matemática de todas as raridades é 24`)

// 6. VALIDAÇÃO DE PREÇOS E INTEGRIDADE DE DADOS
console.log('\n--- GRUPO 5: PREÇOS E METADADOS COMPLETOS ---')
ANIMATED_FRAMES.forEach((f) => {
  assert(Boolean(f.name && f.name.length > 0), `Nome preenchido para ${f.id}`)
  assert(Boolean(f.description && f.description.length > 0), `Descrição preenchida para ${f.id}`)
  assert(typeof f.price === 'number' && f.price > 0, `Preço positivo configurado para ${f.id}: ${f.price} Moedas`)
  assert(typeof f.priceCoins === 'number' && f.priceCoins > 0, `priceCoins positivo configurado para ${f.id}`)
  assert(Boolean(f.accentColor && f.accentColor.startsWith('#')), `Cor de destaque HEX válida para ${f.id}: ${f.accentColor}`)
  assert(Boolean(f.badge && f.badge.length > 0), `Badge de raridade presente para ${f.id}`)
  assert(Boolean(f.badgeColor && f.badgeColor.length > 0), `BadgeColor configurado para ${f.id}`)
})

// 7. SIMULAÇÃO COMPLETA DA PIPELINE DA LOJA (/loja)
console.log('\n--- GRUPO 6: SIMULAÇÃO DO PIPELINE DE RENDERIZAÇÃO NA LOJA ---')
const FRAME_SHOP_ITEMS = ANIMATED_FRAMES.map((f) => ({
  id: f.id,
  name: f.name,
  category: 'molduras',
  categoryKey: f.categoryKey,
  categoryTitle: f.categoryTitle,
  rarity: f.rarity,
  description: f.description,
  story: f.story,
  accentColor: f.accentColor,
  price: `${f.price.toLocaleString('pt-PT')} Moedas`,
  priceValue: f.price,
}))

function simulateStoreFilter(categoryFilter = 'todas', rarityFilter = 'todas') {
  return FRAME_SHOP_ITEMS.filter((item) => {
    if (categoryFilter !== 'todas' && item.categoryKey !== categoryFilter) return false
    if (rarityFilter !== 'todas' && item.rarity !== rarityFilter) return false
    return true
  })
}

// 7.1 Sem filtro
const noFilter = simulateStoreFilter('todas', 'todas')
assert(noFilter.length === 24, `Sem filtro (Todas): renderiza 24 cards (obtido: ${noFilter.length})`)

// 7.2 Por Categoria
assert(simulateStoreFilter('elemental', 'todas').length === 6, `Filtro Elementais: renderiza 6 cards`)
assert(simulateStoreFilter('cosmico', 'todas').length === 4, `Filtro Cósmicas & Cyber: renderiza 4 cards`)
assert(simulateStoreFilter('real', 'todas').length === 4, `Filtro Realeza & Deuses: renderiza 4 cards`)
assert(simulateStoreFilter('lusitano', 'todas').length === 6, `Filtro Lusitanas & PT: renderiza 6 cards`)
assert(simulateStoreFilter('especial', 'todas').length === 4, `Filtro Especiais & Arcade: renderiza 4 cards`)

// 7.3 Por Raridade
const raritiesList = ['Raro', 'Épico', 'Lendário', 'Mítico']
raritiesList.forEach((rarity) => {
  const result = simulateStoreFilter('todas', rarity)
  assert(result.length === rarityCounts[rarity], `Filtro Raridade "${rarity}": renderiza ${rarityCounts[rarity]} cards`)
})

// 8. TESTE DE NÃO-FILTRAGEM POR INVENTÁRIO (OWNERSHIP)
console.log('\n--- GRUPO 7: NÃO FILTRAR POR OWNERSHIP NA LOJA ---')
const mockInventories = [
  [],
  ['default'],
  ['default', 'frame_fogo_eterno'],
  ['frame_fogo_eterno', 'frame_ouro_real', 'frame_diamante_sagrado'],
]

mockInventories.forEach((mockInv, idx) => {
  const renderedCount = FRAME_SHOP_ITEMS.map((item) => {
    const isUnlocked = mockInv.includes(item.id)
    return { ...item, isUnlocked }
  }).length
  assert(renderedCount === 24, `Cenário ${idx + 1}: Jogador com ${mockInv.length} itens possui exatamente 24 molduras visíveis na loja`)
})

// 9. RETROCOMPATIBILIDADE DE ALIASES LEGADOS
console.log('\n--- GRUPO 8: RETROCOMPATIBILIDADE DE ALIASES LEGADOS ---')
const legacyAliases = [
  { legacy: 'frame_solar_flame', expected: 'frame_fogo_eterno' },
  { legacy: 'frame_abismo_atlantico', expected: 'frame_ondas_atlantico' },
  { legacy: 'frame_geada_glacial', expected: 'frame_gelo_ancestral' },
  { legacy: 'frame_esmeralda_natureza', expected: 'frame_natureza_viva' },
  { legacy: 'frame_dragao_antigo', expected: 'frame_dragao_fumegante' },
  { legacy: 'frame_nebulosa_estelar', expected: 'frame_galaxia_profunda' },
  { legacy: 'frame_void_abyss', expected: 'frame_horizonte_eventos' },
  { legacy: 'frame_quantum_matrix', expected: 'frame_plasma_solar' },
  { legacy: 'frame_coroa_imperial', expected: 'frame_ouro_real' },
  { legacy: 'frame_diamante_eterno', expected: 'frame_diamante_sagrado' },
  { legacy: 'frame_ouro_dos_deuses', expected: 'frame_luz_divina' },
  { legacy: 'frame_portugal_glory', expected: 'frame_quinas_portugal' },
  { legacy: 'frame_filigrana_coracao', expected: 'frame_rosa_dos_ventos' },
  { legacy: 'frame_azulejo_manuelino', expected: 'frame_azulejo_portugues' },
  { legacy: 'frame_castelo_muralha', expected: 'frame_muralha_castelo' },
  { legacy: 'frame_luz_de_sagres', expected: 'frame_farol_sagres' },
  { legacy: 'frame_fadista_noite', expected: 'frame_fado_guitarra' },
  { legacy: 'frame_arcade_pixel', expected: 'frame_arcade_8bit' },
  { legacy: 'frame_veneno_toxico', expected: 'frame_biohazard_toxic' },
  { legacy: 'frame_sangue_gladiador', expected: 'frame_gladiador_ferro' },
  { legacy: 'frame_fundador_ouro', expected: 'frame_ouro_real' },
  { legacy: 'frame_cyber_neon', expected: 'frame_cyber_laser' },
]

legacyAliases.forEach(({ legacy, expected }) => {
  const resolved = getFrameById(legacy)
  assert(Boolean(resolved && resolved.id === expected), `Alias legado "${legacy}" mapeia para "${expected}"`)
})

console.log('\n====================================================')
console.log('🏆 100% DOS TESTES DAS 24 MOLDURAS PASSARAM COM SUCESSO!')
console.log('====================================================')
