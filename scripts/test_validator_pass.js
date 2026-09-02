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

const titlesModule = requireTs(path.join(__dirname, '../lib/titles.ts'))
const {
  MASTER_TITLE_CATALOG,
  DEFAULT_STARTER_TITLE_ID,
  DEFAULT_STARTER_TITLE_NAME,
  getTitleById,
  getTitleByName,
  resolveTitle,
  sanitizeTitleName,
  isTitleOwned,
  resolvePlayerEquippedTitle,
  migrateLegacyTitleData,
} = titlesModule

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`)
    process.exit(1)
  }
  console.log(`✅ PASS: ${message}`)
}

console.log('====================================================')
console.log('🧪 RUNNING COMPREHENSIVE FORENSIC TITLE SYSTEM TESTS')
console.log('====================================================\n')

// 1. Catalog Integrity
console.log('--- TEST GROUP 1: CATALOG INTEGRITY ---')
assert(MASTER_TITLE_CATALOG.length > 50, `Catalog contains ${MASTER_TITLE_CATALOG.length} titles (expected > 50)`)
const ids = new Set()
for (const t of MASTER_TITLE_CATALOG) {
  assert(!ids.has(t.id), `Duplicate ID in catalog: ${t.id}`)
  ids.add(t.id)
  assert(Boolean(t.name && t.name.trim().length > 0), `Title ${t.id} has empty name`)
}
const starter = getTitleById('tit_novico')
assert(starter !== null && starter.name === 'Noviço da Nação', 'Starter title tit_novico exists with correct name')
const founder = getTitleById('tit_excl_fundador')
assert(founder !== null && (founder.name === 'Fundador' || founder.name === 'Fundador da Nação'), 'Founder title exists')
const rei18 = getTitleById('title_rei_18_distritos')
assert(rei18 !== null && rei18.name === 'Rei dos 18 Distritos', 'Prestige title title_rei_18_distritos exists')

// 2. Sanitization
console.log('\n--- TEST GROUP 2: TITLE SANITIZATION ---')
assert(sanitizeTitleName('Título: «Rei dos 18 Distritos»') === 'Rei dos 18 Distritos', 'Sanitizes Título: «...»')
assert(sanitizeTitleName('«  Voz do Povo  »') === 'Voz do Povo', 'Sanitizes quotes and whitespace')
assert(sanitizeTitleName('Noviço da Nação') === 'Noviço da Nação', 'Clean title remains identical')

// 3. Ownership Checks
console.log('\n--- TEST GROUP 3: OWNERSHIP CHECKS ---')
assert(isTitleOwned([], 'tit_novico') === true, 'Starter tit_novico is owned by default')
assert(isTitleOwned([], 'Noviço da Nação') === true, 'Starter title by name is owned by default')
assert(isTitleOwned(['tit_pt_1'], 'tit_pt_1') === true, 'Owned ID is detected')
assert(isTitleOwned(['tit_pt_1'], 'Filho de Portugal') === true, 'Owned ID matched by title name')
assert(isTitleOwned(['Filho de Portugal'], 'tit_pt_1') === true, 'Owned legacy name matched by ID')
assert(isTitleOwned(['tit_pt_1'], 'tit_pt_2') === false, 'Unowned ID is not owned')

// 4. Precedence Hierarchy & Overwrite Protection
console.log('\n--- TEST GROUP 4: RESOLUTION PRECEDENCE & FIX VERIFICATION ---')

// Case A: User with equippedTitleId
const userA = {
  equippedTitleId: 'tit_pt_1',
  title: 'Noviço da Nação', // Old Firestore field should NOT override
  equippedTitle: 'Noviço da Nação',
}
const resA = resolvePlayerEquippedTitle(userA, 0)
assert(resA.id === 'tit_pt_1', 'Case A: equippedTitleId takes top priority over legacy title field')
assert(resA.cleanName === 'Filho de Portugal', 'Case A: Resolved correct clean name')

// Case B: User with equipped.title
const userB = {
  equipped: { title: 'tit_excl_fundador' },
  title: 'Noviço da Nação',
}
const resB = resolvePlayerEquippedTitle(userB, 0)
assert(resB.id === 'tit_excl_fundador', 'Case B: equipped.title ID resolved correctly')
assert(resB.cleanName === 'Fundador' || resB.cleanName === 'Fundador da Nação', 'Case B: Resolved correct clean name')

// Case C: Legacy user with formatted string
const userC = {
  equippedTitle: 'Título: «Rei dos 18 Distritos»',
}
const resC = resolvePlayerEquippedTitle(userC, 0)
assert(resC.id === 'title_rei_18_distritos', 'Case C: Legacy formatted string mapped to canonical ID')
assert(resC.cleanName === 'Rei dos 18 Distritos', 'Case C: Clean name formatted correctly')

// Case D: User with no equipped title and Level XP
const userD = {
  xp: 15000,
}
const resD = resolvePlayerEquippedTitle(userD, 15000)
assert(Boolean(resD.cleanName && resD.cleanName !== 'Noviço da Nação'), `Case D: Level progression title used when no title equipped (${resD.cleanName})`)

// Case E: New user with 0 XP
const userE = {}
const resE = resolvePlayerEquippedTitle(userE, 0)
assert(resE.id === 'tit_novico', 'Case E: Starter title assigned for empty profile')
assert(resE.cleanName === 'Noviço da Nação', 'Case E: Starter title clean name assigned')

// Case F: Multiple cosmetic titles owned, equipping changes resolved title immediately
const userF = {
  equippedTitleId: 'tit_pt_3',
  inventory: { titles: ['tit_novico', 'tit_pt_1', 'tit_pt_3'] },
}
const resF = resolvePlayerEquippedTitle(userF, 5000)
assert(resF.id === 'tit_pt_3', 'Case F: Equipped specific title among multiple owned titles')

// 5. Legacy Migration
console.log('\n--- TEST GROUP 5: NON-DESTRUCTIVE LEGACY MIGRATION ---')
const legacyData = {
  uid: 'legacy_user_123',
  title: 'Título: «Voz do Povo»',
  inventory: { titles: ['title_voz_do_povo'] },
}
const migrated = migrateLegacyTitleData(legacyData)
assert(migrated.equippedTitleId === 'title_voz_do_povo', 'Migrated equippedTitleId is canonical')
assert(migrated.equippedTitle === 'Voz do Povo', 'Migrated equippedTitle is clean')
assert(migrated.equipped.titleId === 'title_voz_do_povo', 'Migrated equipped.titleId is set')
assert(migrated.equipped.titleName === 'Voz do Povo', 'Migrated equipped.titleName is set')

console.log('\n====================================================')
console.log('🎉 ALL 16 CRITICAL FORENSIC TITLE TESTS PASSED!')
console.log('====================================================')
