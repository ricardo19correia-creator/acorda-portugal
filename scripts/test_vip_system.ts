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
console.log('🇵🇹 AUDITORIA E SUITE DE TESTES: VIP COLLECTION 2.0 (38 EXCLUSIVOS)')
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
// 1. CONTAGEM E COMPOSIÇÃO OFICIAL DA VIP COLLECTION 2.0
// -------------------------------------------------------------------------
console.log('1. Contagem e Composição Oficial (38 Itens em 8 Tiers):')
assert(VIP_CATALOG.length === 38, 'Catálogo VIP SSOT tem exatamente 38 produtos', `Obtido: ${VIP_CATALOG.length}`)

const signatureAvatars = VIP_CATALOG.filter(p => p.storeSection === 'signature')
const ultimateArenas = VIP_CATALOG.filter(p => p.storeSection === 'arenas')
const royalIdentities = VIP_CATALOG.filter(p => p.storeSection === 'identities')
const cinematicReactions = VIP_CATALOG.filter(p => p.storeSection === 'reactions')
const eliteTaunts = VIP_CATALOG.filter(p => p.storeSection === 'taunts')
const completeSets = VIP_CATALOG.filter(p => p.storeSection === 'bundles')
const crownJewels = VIP_CATALOG.filter(p => p.storeSection === 'ultimate')

assert(signatureAvatars.length === 4, 'Tier I: Exatamente 4 Avatares Signature', `Obtido: ${signatureAvatars.length}`)
assert(ultimateArenas.length === 5, 'Tier II: Exatamente 5 Ultimate Arenas', `Obtido: ${ultimateArenas.length}`)
assert(royalIdentities.length === 11, 'Tiers III & IV: Exatamente 11 Royal Identities (5 Molduras + 6 Títulos)', `Obtido: ${royalIdentities.length}`)
assert(cinematicReactions.length === 6, 'Tier V: Exatamente 6 Cinematic Reactions (Emotes)', `Obtido: ${cinematicReactions.length}`)
assert(eliteTaunts.length === 4, 'Tier VI: Exatamente 4 Elite Taunt Packs', `Obtido: ${eliteTaunts.length}`)
assert(completeSets.length === 3, 'Tier VII: Exatamente 3 Complete Sets (Bundles)', `Obtido: ${completeSets.length}`)
assert(crownJewels.length === 5, 'Tier VIII: Exatamente 5 Crown Jewels (Coleções Ultimate)', `Obtido: ${crownJewels.length}`)

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
assert(duplicateAssets === 0, 'Zero caminhos de assets duplicados (38 assets WebP únicos)')

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
// 4. EXISTÊNCIA FÍSICA DOS 38 ASSETS WEBP EM DISCO
// -------------------------------------------------------------------------
console.log('\n4. Existência Física dos 38 Assets WebP em Alta Resolução:')
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

assert(missingFiles === 0, '38/38 ficheiros WebP físicos existem no disco')
assert(emptyFiles === 0, '38/38 ficheiros WebP possuem conteúdo válido (tamanho > 0)')

// -------------------------------------------------------------------------
// 5. INTEGRAÇÃO NOS SUBSISTEMAS CANÓNICOS DO JOGO
// -------------------------------------------------------------------------
console.log('\n5. Integração nos Catálogos Canónicos do Jogo:')

// 5.1 Avatares em lib/avatars.ts
const avatars = VIP_CATALOG.filter(p => p.category === 'avatar')
let registeredAvatars = 0
avatars.forEach(av => {
  const found = REAL_AVATARS.find(a => a.id === av.id)
  const resolved = getAvatarById(av.id)
  if (found && resolved.id === av.id) registeredAvatars++
})
assert(registeredAvatars === 4, '4/4 Avatares Signature integrados e resolvidos em REAL_AVATARS', `Encontrados: ${registeredAvatars}`)

// 5.2 Molduras em src/data/frames.ts
const frames = VIP_CATALOG.filter(p => p.category === 'frame')
let registeredFrames = 0
frames.forEach(fr => {
  const found = ANIMATED_FRAMES.find(f => f.id === fr.id)
  const resolved = getFrameById(fr.id)
  if (found && resolved?.id === fr.id) registeredFrames++
})
assert(registeredFrames === 5, '5/5 Molduras Animadas integradas e resolvidas em ANIMATED_FRAMES', `Encontradas: ${registeredFrames}`)

// 5.3 Títulos em src/data/shopTitles.ts
const titles = VIP_CATALOG.filter(p => p.category === 'title')
let registeredTitles = 0
titles.forEach(ti => {
  const found = TITLE_SHOP_CATALOG.find(t => t.id === ti.id)
  if (found) registeredTitles++
})
assert(registeredTitles === 6, '6/6 Títulos de Prestígio integrados em TITLE_SHOP_CATALOG', `Encontrados: ${registeredTitles}`)

// 5.4 Arenas em src/data/shopArenas.ts
const arenas = VIP_CATALOG.filter(p => p.category === 'arena')
let registeredArenas = 0
arenas.forEach(ar => {
  const foundInCatalog = ARENA_SHOP_CATALOG.find(a => a.id === ar.id)
  const foundInImages = (ARENA_IMAGES as any)[ar.id]
  if (foundInCatalog && foundInImages) registeredArenas++
})
assert(registeredArenas === 5, '5/5 Ultimate Arenas integradas em ARENA_SHOP_CATALOG e ARENA_IMAGES', `Encontradas: ${registeredArenas}`)

// 5.5 Emotes em src/data/emotes.ts
const emotes = VIP_CATALOG.filter(p => p.category === 'emote')
let registeredEmotes = 0
emotes.forEach(em => {
  const found = OFFICIAL_EMOTES.find(e => e.id === em.id)
  if (found) registeredEmotes++
})
assert(registeredEmotes === 6, '6/6 Reações Cinematográficas integradas em OFFICIAL_EMOTES', `Encontrados: ${registeredEmotes}`)

// 5.6 Taunt Packs em src/data/tauntPacks.ts
const tauntpacks = VIP_CATALOG.filter(p => p.category === 'tauntpack')
let registeredTaunts = 0
tauntpacks.forEach(tp => {
  const found = TAUNT_PACKS.find(t => t.id === tp.id)
  if (found && found.taunts.length === 6) registeredTaunts++
})
assert(registeredTaunts === 4, '4/4 Taunt Packs VIP integrados em TAUNT_PACKS com 6 falas oficiais cada', `Encontrados: ${registeredTaunts}`)

// -------------------------------------------------------------------------
// 6. VALIDAÇÃO DE DESEMPACOTAMENTO DE BUNDLES & EDICÕES LIMITADAS
// -------------------------------------------------------------------------
console.log('\n6. Bundles, Unpacking e Edições Limitadas:')
const bundlesAndUltimate = VIP_CATALOG.filter(p => p.category === 'bundle' || p.category === 'ultimate')
let validComponentsCount = 0
let missingComponentsCount = 0

bundlesAndUltimate.forEach(b => {
  if (b.bundleComponents && b.bundleComponents.length > 0) {
    b.bundleComponents.forEach(compId => {
      const comp = getVipProductById(compId)
      if (comp) {
        validComponentsCount++
      } else {
        console.error(`    Componente inexistente no bundle ${b.id}: ${compId}`)
        missingComponentsCount++
      }
    })
  }
})

assert(missingComponentsCount === 0, 'Todos os componentes referenciados em Bundles e Ultimates existem no catálogo')
assert(validComponentsCount >= 20, `Componentes desempacotáveis validados com sucesso (${validComponentsCount} referências)`)

const limitedItems = VIP_CATALOG.filter(p => p.isLimited)
assert(limitedItems.length >= 3, 'Edições Limitadas com tracking de stock configuradas no catálogo', `Total: ${limitedItems.length}`)

// -------------------------------------------------------------------------
// 7. ZERO PAY-TO-WIN E PRESERVAÇÃO DA ECONOMIA DE MOEDAS
// -------------------------------------------------------------------------
console.log('\n7. Zero Pay-to-Win e Independência Económica:')
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
// 8. ARQUITETURA DE PAGAMENTO E STATUS DO PROVIDER
// -------------------------------------------------------------------------
console.log('\n8. Validação de Provider e Verdade Financeira:')
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
  console.log('🎯 TODOS OS 38 EXCLUSIVOS VIP 2.0 VALIDADOS COM SUCESSO ZERO-DEFEITOS.\n')
  process.exit(0)
}
