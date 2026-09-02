import fs from 'fs'
import path from 'path'
import { VIP_CATALOG, getAllVipProducts, getVipProductById, type VipProduct } from '../src/data/vipCatalog'
import { ANIMATED_FRAMES, getFrameById } from '../src/data/frames'
import { REAL_AVATARS, getAvatarById } from '../lib/avatars'
import { TITLE_SHOP_CATALOG } from '../src/data/shopTitles'
import { ARENA_SHOP_CATALOG, ARENA_IMAGES } from '../src/data/shopArenas'
import { OFFICIAL_EMOTES } from '../src/data/emotes'
import { TAUNT_PACKS } from '../src/data/tauntPacks'
import { getPaymentConfigStatus } from '../lib/vip-service'

const root = process.cwd()

console.log('===================================================================')
console.log('🇵🇹 AUDITORIA E SUITE DE TESTES: 38 EXCLUSIVOS VIP (€ REAL)')
console.log('===================================================================\n')

let passedTests = 0
let failedTests = 0

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`)
    passedTests++
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`)
    failedTests++
  }
}

// -------------------------------------------------------------------------
// 1. CONTAGEM E COMPOSIÇÃO DOS 38 PRODUTOS
// -------------------------------------------------------------------------
console.log('1. Contagem e Composição Oficial:')
assert(VIP_CATALOG.length === 38, 'Catálogo VIP SSOT tem exatamente 38 produtos', `Obtido: ${VIP_CATALOG.length}`)

const avatars = VIP_CATALOG.filter(p => p.category === 'avatar')
const frames = VIP_CATALOG.filter(p => p.category === 'frame')
const titles = VIP_CATALOG.filter(p => p.category === 'title')
const arenas = VIP_CATALOG.filter(p => p.category === 'arena')
const emotes = VIP_CATALOG.filter(p => p.category === 'emote')
const tauntpacks = VIP_CATALOG.filter(p => p.category === 'tauntpack')

assert(avatars.length === 6, 'Exatamente 6 Avatares VIP', `Obtido: ${avatars.length}`)
assert(frames.length === 6, 'Exatamente 6 Molduras VIP', `Obtido: ${frames.length}`)
assert(titles.length === 8, 'Exatamente 8 Títulos VIP', `Obtido: ${titles.length}`)
assert(arenas.length === 6, 'Exatamente 6 Arenas VIP', `Obtido: ${arenas.length}`)
assert(emotes.length === 8, 'Exatamente 8 Emotes VIP', `Obtido: ${emotes.length}`)
assert(tauntpacks.length === 4, 'Exatamente 4 Taunt Packs VIP', `Obtido: ${tauntpacks.length}`)

// -------------------------------------------------------------------------
// 2. UNICIDADE DE IDS, SKUS E ASSETS
// -------------------------------------------------------------------------
console.log('\n2. Unicidade de IDs, SKUs e Assets:')
const idSet = new Set<string>()
const skuSet = new Set<string>()
const assetSet = new Set<string>()

let duplicateIds = 0
let duplicateSkus = 0
let duplicateAssets = 0

VIP_CATALOG.forEach(p => {
  if (idSet.has(p.id)) duplicateIds++
  idSet.add(p.id)

  if (skuSet.has(p.sku)) duplicateSkus++
  skuSet.add(p.sku)

  if (assetSet.has(p.assetPath)) duplicateAssets++
  assetSet.add(p.assetPath)
})

assert(duplicateIds === 0, 'Zero IDs duplicados (38 IDs únicos)')
assert(duplicateSkus === 0, 'Zero SKUs duplicados (38 SKUs únicos)')
assert(duplicateAssets === 0, 'Zero caminhos de assets duplicados (38 assets com identidade visual própria)')

// -------------------------------------------------------------------------
// 3. PREÇOS EM CÊNTIMOS E MOEDA EUR
// -------------------------------------------------------------------------
console.log('\n3. Validação Financeira (€ Real / Cêntimos):')
let invalidPrices = 0
let invalidCurrency = 0

VIP_CATALOG.forEach(p => {
  if (typeof p.priceCents !== 'number' || p.priceCents <= 0 || !Number.isInteger(p.priceCents)) {
    invalidPrices++
  }
  if (p.currency !== 'EUR') {
    invalidCurrency++
  }
})

assert(invalidPrices === 0, '38/38 produtos possuem preço inteiro válido em cêntimos de Euro')
assert(invalidCurrency === 0, '38/38 produtos possuem moeda estritamente "EUR"')

// -------------------------------------------------------------------------
// 4. EXISTÊNCIA FÍSICA DOS 38 ASSETS EM DISCO
// -------------------------------------------------------------------------
console.log('\n4. Existência Física dos 38 Assets:')
let missingFiles = 0
let emptyFiles = 0

VIP_CATALOG.forEach(p => {
  const diskPath = path.join(root, 'public', p.assetPath.replace(/^\//, ''))
  if (!fs.existsSync(diskPath)) {
    console.error(`    Ficheiro ausente: ${diskPath}`)
    missingFiles++
  } else {
    const stats = fs.statSync(diskPath)
    if (stats.size === 0) {
      console.error(`    Ficheiro vazio: ${diskPath}`)
      emptyFiles++
    }
  }
})

assert(missingFiles === 0, '38/38 ficheiros de assets físicos existem no disco')
assert(emptyFiles === 0, '38/38 ficheiros de assets possuem conteúdo válido (tamanho > 0)')

// -------------------------------------------------------------------------
// 5. REGISTO NOS SUBSISTEMAS CANÓNICOS DO JOGO
// -------------------------------------------------------------------------
console.log('\n5. Integração nos Catálogos Canónicos do Jogo:')

// 5.1 Avatares em lib/avatars.ts
let registeredAvatars = 0
avatars.forEach(av => {
  const found = REAL_AVATARS.find(a => a.id === av.id)
  const resolved = getAvatarById(av.id)
  if (found && resolved.id === av.id) registeredAvatars++
})
assert(registeredAvatars === 6, '6/6 Avatares VIP integrados e resolvidos em REAL_AVATARS', `Encontrados: ${registeredAvatars}`)

// 5.2 Molduras em src/data/frames.ts
let registeredFrames = 0
frames.forEach(fr => {
  const found = ANIMATED_FRAMES.find(f => f.id === fr.id)
  const resolved = getFrameById(fr.id)
  if (found && resolved?.id === fr.id) registeredFrames++
})
assert(registeredFrames === 6, '6/6 Molduras VIP integradas e resolvidas em ANIMATED_FRAMES', `Encontradas: ${registeredFrames}`)

// 5.3 Títulos em src/data/shopTitles.ts
let registeredTitles = 0
titles.forEach(ti => {
  const found = TITLE_SHOP_CATALOG.find(t => t.id === ti.id)
  if (found) registeredTitles++
})
assert(registeredTitles === 8, '8/8 Títulos VIP integrados em TITLE_SHOP_CATALOG', `Encontrados: ${registeredTitles}`)

// 5.4 Arenas em src/data/shopArenas.ts
let registeredArenas = 0
arenas.forEach(ar => {
  const foundInCatalog = ARENA_SHOP_CATALOG.find(a => a.id === ar.id)
  const foundInImages = (ARENA_IMAGES as any)[ar.id]
  if (foundInCatalog && foundInImages) registeredArenas++
})
assert(registeredArenas === 6, '6/6 Arenas VIP integradas em ARENA_SHOP_CATALOG e ARENA_IMAGES', `Encontradas: ${registeredArenas}`)

// 5.5 Emotes em src/data/emotes.ts
let registeredEmotes = 0
emotes.forEach(em => {
  const found = OFFICIAL_EMOTES.find(e => e.id === em.id)
  if (found) registeredEmotes++
})
assert(registeredEmotes === 8, '8/8 Emotes VIP integrados em OFFICIAL_EMOTES', `Encontrados: ${registeredEmotes}`)

// 5.6 Taunt Packs em src/data/tauntPacks.ts
let registeredTaunts = 0
tauntpacks.forEach(tp => {
  const found = TAUNT_PACKS.find(t => t.id === tp.id)
  if (found && found.taunts.length === 6) registeredTaunts++
})
assert(registeredTaunts === 4, '4/4 Taunt Packs VIP integrados em TAUNT_PACKS com 6 falas cada', `Encontrados: ${registeredTaunts}`)

// -------------------------------------------------------------------------
// 6. ZERO PAY-TO-WIN E PRESERVAÇÃO DA ECONOMIA DE MOEDAS
// -------------------------------------------------------------------------
console.log('\n6. Zero Pay-to-Win e Independência Económica:')
let payToWinProps = 0
VIP_CATALOG.forEach(p => {
  const itemAny = p as any
  if (itemAny.xpBoost || itemAny.coinBoost || itemAny.extraLives || itemAny.hintBoost || itemAny.freezeTimeBoost) {
    payToWinProps++
  }
})
assert(payToWinProps === 0, 'Zero propriedades Pay-to-Win nos 38 itens VIP (Apenas cosméticos e prestígio)')

// Verificar se todos os itens VIP nos catálogos canónicos têm preço de moedas nulo ou 0
let coinsTainted = 0
avatars.forEach(a => {
  const found = REAL_AVATARS.find(item => item.id === a.id)
  if (found && found.currency === 'coins') coinsTainted++
})
frames.forEach(f => {
  const found = ANIMATED_FRAMES.find(item => item.id === f.id)
  if (found && found.priceCoins > 0) coinsTainted++
})
titles.forEach(t => {
  const found = TITLE_SHOP_CATALOG.find(item => item.id === t.id)
  if (found && found.price !== null) coinsTainted++
})
arenas.forEach(ar => {
  const found = ARENA_SHOP_CATALOG.find(item => item.id === ar.id)
  if (found && found.price !== null && (found.price as any) > 0) coinsTainted++
})
emotes.forEach(e => {
  const found = OFFICIAL_EMOTES.find(item => item.id === e.id)
  if (found && found.price > 0) coinsTainted++
})
tauntpacks.forEach(tp => {
  const found = TAUNT_PACKS.find(item => item.id === tp.id)
  if (found && found.price > 0) coinsTainted++
})

assert(coinsTainted === 0, 'A economia de moedas virtuais permanece 100% independente e intacta')

// -------------------------------------------------------------------------
// 7. ARQUITETURA DE PAGAMENTO E STATUS DO PROVIDER
// -------------------------------------------------------------------------
console.log('\n7. Validação de Provider e Verdade Financeira:')
const providerStatus = getPaymentConfigStatus()
if (!process.env.STRIPE_SECRET_KEY) {
  assert(
    providerStatus.status === 'BLOCKED_PENDING_PROVIDER_CONFIG',
    'Sem STRIPE_SECRET_KEY, o status é BLOCKED_PENDING_PROVIDER_CONFIG (Sem aprovações fictícias)',
  )
} else {
  assert(
    providerStatus.status === 'READY',
    'Com STRIPE_SECRET_KEY configurada, o status é READY',
  )
}

// -------------------------------------------------------------------------
// RESUMO FINAL DA AUDITORIA
// -------------------------------------------------------------------------
console.log('\n===================================================================')
console.log(`RESULTADO DA AUDITORIA: ${passedTests} TESTES PASSADOS, ${failedTests} FALHADOS`)
console.log('===================================================================')

if (failedTests > 0) {
  process.exit(1)
} else {
  console.log('🎯 TODOS OS 38 EXCLUSIVOS VIP VALIDADOS COM SUCESSO ZERO-DEFEITOS.\n')
  process.exit(0)
}
