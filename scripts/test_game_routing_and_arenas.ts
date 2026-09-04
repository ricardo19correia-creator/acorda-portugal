import fs from 'fs'
import path from 'path'
import {
  MASTER_ARENA_CATALOG,
  VIP_ARENAS,
  resolveArena,
  getDefaultArenaForCategory,
  resolveArenaForGame,
  getAllArenas,
  isVipArena,
} from '../src/data/arenaCatalog'
import { VIP_CATALOG } from '../src/data/vipCatalog'

const publicDir = path.resolve(process.cwd(), 'public')

let testsPassed = 0
let testsFailed = 0

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`)
    testsPassed++
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`)
    testsFailed++
  }
}

console.log('\n🇵🇹 ========================================================')
console.log('   TEST SUITE: GAME ROUTING + ARENAS 2150 + SSOT INTEGRITY')
console.log('========================================================\n')

// TEST SUITE 1: SSOT Master Catalog Size & Structure
console.log('--- 1. MASTER ARENA CATALOG (SSOT) ---')
assert(MASTER_ARENA_CATALOG.length === 43, `Total Arenas is exactly 43 (Got: ${MASTER_ARENA_CATALOG.length})`)
assert(VIP_ARENAS.length === 11, `VIP Arenas count is exactly 11 (Got: ${VIP_ARENAS.length})`)

// Check uniqueness of IDs and Slugs
const ids = new Set<string>()
const slugs = new Set<string>()
let duplicates = 0
for (const arena of MASTER_ARENA_CATALOG) {
  if (ids.has(arena.id)) duplicates++
  if (slugs.has(arena.slug)) duplicates++
  ids.add(arena.id)
  slugs.add(arena.slug)
}
assert(duplicates === 0, 'No duplicate IDs or Slugs in MASTER_ARENA_CATALOG')

// TEST SUITE 2: Asset Existence on Disk for all 43 Arenas
console.log('\n--- 2. ASSET FILE EXISTENCE ON DISK (ALL 43 ARENAS) ---')
let missingAssets = 0
for (const arena of MASTER_ARENA_CATALOG) {
  const assetOnDisk = path.join(publicDir, arena.assetPath.replace(/^\//, ''))
  if (!fs.existsSync(assetOnDisk)) {
    console.error(`    MISSING ASSET: ${arena.id} -> ${arena.assetPath}`)
    missingAssets++
  }
}
assert(missingAssets === 0, `All 43 arena asset files exist in public/ (Missing: ${missingAssets})`)

// TEST SUITE 3: VIP Catalog Product Assets (All 38 Items)
console.log('\n--- 3. VIP CATALOG PRODUCT ASSETS (ALL 38 ITEMS) ---')
let missingVipAssets = 0
for (const prod of VIP_CATALOG) {
  const assetOnDisk = path.join(publicDir, prod.assetPath.replace(/^\//, ''))
  if (!fs.existsSync(assetOnDisk)) {
    console.error(`    MISSING VIP ASSET: ${prod.id} (${prod.name}) -> ${prod.assetPath}`)
    missingVipAssets++
  }
}
assert(missingVipAssets === 0, `All 38 VIP product assets exist in public/ (Missing: ${missingVipAssets})`)

// TEST SUITE 4: Category Determinism (No Universal Palácio Nacional Fallback)
console.log('\n--- 4. CATEGORY ROUTING & ARENA RESOLUTION DETERMINISM ---')

// Desafio Nacional must resolve to Estádio das Lendas
const resNacional = resolveArenaForGame({ categorySlug: 'desafio-nacional' })
assert(
  resNacional.arena?.id === 'arena_estadio_das_lendas',
  `Desafio Nacional maps to Estádio das Lendas (Got: ${resNacional.arena?.id})`
)

// Modo Maluco must resolve to Portugal ao Contrário
const resMaluco = resolveArenaForGame({ categorySlug: 'modo-maluco' })
assert(
  resMaluco.arena?.id === 'arena_portugal_ao_contrario',
  `Modo Maluco maps to Portugal ao Contrário (Got: ${resMaluco.arena?.id})`
)

// Desporto must resolve to Estádio Nacional
const resDesporto = resolveArenaForGame({ categorySlug: 'desporto' })
assert(
  resDesporto.arena?.id === 'arena_estadio_nacional',
  `Desporto maps to Estádio Nacional (Got: ${resDesporto.arena?.id})`
)

// Geografia must resolve to Portugal 3D
const resGeografia = resolveArenaForGame({ categorySlug: 'geografia' })
assert(
  resGeografia.arena?.id === 'arena_portugal_3d',
  `Geografia maps to Portugal 3D Holográfico (Got: ${resGeografia.arena?.id})`
)

// História must resolve to Palácio Nacional
const resHistoria = resolveArenaForGame({ categorySlug: 'historia' })
assert(
  resHistoria.arena?.id === 'arena_palacio_nacional',
  `História maps to Palácio Nacional (Got: ${resHistoria.arena?.id})`
)

// Cultura must resolve to Teatro Nacional
const resCultura = resolveArenaForGame({ categorySlug: 'cultura' })
assert(
  resCultura.arena?.id === 'arena_teatro_nacional',
  `Cultura maps to Teatro Nacional (Got: ${resCultura.arena?.id})`
)

// TEST SUITE 5: Explicit Arena Parameter Override
console.log('\n--- 5. EXPLICIT URL ARENA PARAMETER OVERRIDE ---')
// When user requests 'arena_trono_real' for 'desporto' category, desporto default should be OVERRIDDEN
const resExplicit = resolveArenaForGame({ arenaId: 'arena_trono_real', categorySlug: 'desporto' })
assert(
  resExplicit.arena?.id === 'arena_trono_real' && resExplicit.isExplicit === true,
  `Explicit arena parameter overrides category default (Got: ${resExplicit.arena?.id})`
)

// Test aliasing (e.g., 'arena_1' -> 'arena_praca_liberdade')
const resAlias = resolveArena('arena_1')
assert(
  resAlias?.id === 'arena_praca_liberdade',
  `Legacy ID 'arena_1' resolves cleanly via alias to 'arena_praca_liberdade' (Got: ${resAlias?.id})`
)

// TEST SUITE 6: STRICT FAIL-LOUD ON INVALID ARENA (Zero Silent Fallback)
console.log('\n--- 6. FAIL-LOUD ON INVALID ARENA (NO SILENT PALÁCIO NACIONAL FALLBACK) ---')
const resInvalid = resolveArenaForGame({ arenaId: 'non_existent_arena_xyz', categorySlug: 'desafio-nacional' })
assert(
  resInvalid.arena === null && Boolean(resInvalid.error),
  `Invalid arena returns null arena with explicit error (Got error: "${resInvalid.error}")`
)
assert(
  resInvalid.arena?.id !== 'arena_palacio_nacional',
  'CRITICAL: Invalid arena NEVER silently falls back to Palácio Nacional'
)

// TEST SUITE 7: Equipped Arena Priority
console.log('\n--- 7. EQUIPPED ARENA RESOLUTION ---')
const resEquipped = resolveArenaForGame({ categorySlug: 'historia', equippedArenaId: 'arena_castelo_dos_campeoes' })
assert(
  resEquipped.arena?.id === 'arena_castelo_dos_campeoes',
  `Equipped arena takes precedence over category default (Got: ${resEquipped.arena?.id})`
)

console.log('\n========================================================')
console.log(`TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`)
console.log('========================================================\n')

if (testsFailed > 0) {
  process.exit(1)
} else {
  process.exit(0)
}
