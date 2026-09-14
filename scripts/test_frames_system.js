/**
 * Teste Oficial de Validação do Sistema de Molduras Vivas AAA (9 Itens Canónicos)
 * Executável diretamente via: node scripts/test_frames_system.js
 */

const fs = require('fs')
const path = require('path')
const ts = require('typescript')

function assert(condition, message, detail = '') {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`, detail ? `-> ${detail}` : '')
    process.exit(1)
  }
  console.log(`✅ PASS: ${message}`)
}

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

console.log('====================================================')
console.log('🔍 AUDITORIA OFICIAL: COLEÇÃO DE 9 MOLDURAS VIVAS AAA')
console.log('====================================================\n')

// 1. CARREGAR CATÁLOGOS (CANÓNICO EM src/data/frames.ts E PROXY EM data/frames.ts)
const srcFrames = requireTs(path.join(__dirname, '../src/data/frames.ts'))
const dataFrames = requireTs(path.join(__dirname, '../data/frames.ts'))

const { ANIMATED_FRAMES, FRAME_ALIASES, getFrameById, getFrameRarityBadge } = srcFrames

// 2. VALIDAÇÃO DO TOTAL GLOBAL (EXATAMENTE 9 MOLDURAS VIVAS)
console.log('--- GRUPO 1: TOTAL GLOBAL DE MOLDURAS (EXATAMENTE 9) ---')
assert(ANIMATED_FRAMES.length === 9, `Catálogo src/data/frames.ts contém EXATAMENTE 9 molduras (atual: ${ANIMATED_FRAMES.length})`)
assert(dataFrames.ANIMATED_FRAMES.length === 9, `Proxy data/frames.ts exporta EXATAMENTE 9 molduras (atual: ${dataFrames.ANIMATED_FRAMES.length})`)

// 3. VALIDAÇÃO DOS 9 IDs CANÓNICOS OBRIGATÓRIOS
console.log('\n--- GRUPO 2: VALIDAÇÃO DOS 9 IDs CANÓNICOS ---')
const REQUIRED_9_IDS = [
  'frame_inferno_solar',
  'frame_ondas_atlantico',
  'frame_furia_trovao',
  'frame_zero_absoluto',
  'frame_fornalha_magma',
  'frame_nebulosa_estelar',
  'frame_floresta_viva',
  'frame_vazio_abissal',
  'frame_ouro_navegadores',
]

const foundIds = new Set(ANIMATED_FRAMES.map((f) => f.id))
REQUIRED_9_IDS.forEach((id) => {
  assert(foundIds.has(id), `ID obrigatório presente no catálogo: ${id}`)
  const frame = getFrameById(id)
  assert(Boolean(frame && frame.id === id), `getFrameById resolve ID canónico: ${id}`)
})

// 4. CONFIRMAR QUE NENHUMA DAS ANTIGAS 29 PERMANECE NO CATÁLOGO ATIVO
console.log('\n--- GRUPO 3: PURGA DAS 29 MOLDURAS ANTIGAS ---')
const FORBIDDEN_OLD_IDS = [
  'frame_fogo_eterno',
  'frame_tempestade_eletrica',
  'frame_gelo_ancestral',
  'frame_natureza_viva',
  'frame_dragao_fumegante',
  'frame_galaxia_profunda',
  'frame_cyber_laser',
  'frame_horizonte_eventos',
  'frame_plasma_solar',
  'frame_ouro_real',
  'frame_diamante_sagrado',
  'frame_luz_divina',
  'frame_esmeralda_imperial',
  'frame_quinas_portugal',
  'frame_rosa_dos_ventos',
  'frame_azulejo_portugues',
  'frame_muralha_castelo',
  'frame_farol_sagres',
  'frame_fado_guitarra',
  'frame_arcade_8bit',
  'frame_biohazard_toxic',
  'frame_gladiador_ferro',
  'frame_sakura_zen',
  'AP-VIP-FRAME-001',
  'AP-VIP-FRAME-002',
  'AP-VIP-FRAME-003',
  'AP-VIP-FRAME-004',
  'AP-VIP-FRAME-005',
]

FORBIDDEN_OLD_IDS.forEach((oldId) => {
  assert(!foundIds.has(oldId), `Moldura antiga '${oldId}' NÃO existe no catálogo ativo`)
})

// 5. VALIDAÇÃO DE METADADOS E QUALIDADE AAA
console.log('\n--- GRUPO 4: METADADOS E QUALIDADE AAA ---')
ANIMATED_FRAMES.forEach((f) => {
  assert(Boolean(f.name && f.name.length > 0), `Nome preenchido para ${f.id}: ${f.name}`)
  assert(Boolean(f.slug && f.slug.length > 0), `Slug preenchido para ${f.id}: ${f.slug}`)
  assert(Boolean(f.description && f.description.length > 0), `Descrição preenchida para ${f.id}`)
  assert(typeof f.price === 'number' && f.price > 0, `Preço positivo configurado para ${f.id}: ${f.price}`)
  assert(typeof f.priceCoins === 'number' && f.priceCoins > 0, `priceCoins configurado para ${f.id}`)
  assert(Boolean(f.accentColor && f.accentColor.startsWith('#')), `Cor de destaque HEX válida para ${f.id}: ${f.accentColor}`)
  assert(Boolean(f.badge && f.badge.length > 0), `Badge de raridade presente para ${f.id}`)
  assert(Boolean(f.badgeColor && f.badgeColor.length > 0), `BadgeColor configurado para ${f.id}`)
})

// 6. SIMULAÇÃO DA PIPELINE DA LOJA (/loja)
console.log('\n--- GRUPO 5: PIPELINE DA LOJA (/loja) ---')
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

assert(FRAME_SHOP_ITEMS.length === 9, `Loja renderiza EXATAMENTE 9 cards de Molduras Vivas (atual: ${FRAME_SHOP_ITEMS.length})`)

// 7. RETROCOMPATIBILIDADE DE ALIASES LEGADOS
console.log('\n--- GRUPO 6: RETROCOMPATIBILIDADE DE ALIASES LEGADOS ---')
const sampleLegacyAliases = [
  { legacy: 'frame_fogo_eterno', expected: 'frame_inferno_solar' },
  { legacy: 'frame_tempestade_eletrica', expected: 'frame_furia_trovao' },
  { legacy: 'frame_gelo_ancestral', expected: 'frame_zero_absoluto' },
  { legacy: 'frame_dragao_fumegante', expected: 'frame_fornalha_magma' },
  { legacy: 'frame_galaxia_profunda', expected: 'frame_nebulosa_estelar' },
  { legacy: 'frame_natureza_viva', expected: 'frame_floresta_viva' },
  { legacy: 'frame_horizonte_eventos', expected: 'frame_vazio_abissal' },
  { legacy: 'frame_ouro_real', expected: 'frame_ouro_navegadores' },
  { legacy: 'AP-VIP-FRAME-001', expected: 'frame_ouro_navegadores' },
  { legacy: 'AP-VIP-FRAME-005', expected: 'frame_inferno_solar' },
]

sampleLegacyAliases.forEach(({ legacy, expected }) => {
  const resolved = getFrameById(legacy)
  assert(Boolean(resolved && resolved.id === expected), `Alias legado '${legacy}' mapeia com segurança para '${expected}'`)
})

console.log('\n====================================================')
console.log('🏆 100% DOS TESTES DAS 9 MOLDURAS VIVAS PASSARAM COM SUCESSO!')
console.log('====================================================')
