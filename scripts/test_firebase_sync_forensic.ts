/**
 * 🇵🇹 ACORDA PORTUGAL — SUÍTE DE TESTES FORENSES DE SINCRONIZAÇÃO FIREBASE ↔ JOGO
 * 
 * Valida rigorosamente:
 * 1. Extração multi-alias de saldo e Acordas (€ Acorda / Moedas).
 * 2. Suporte a tipos numéricos e strings numéricas ("5000", " 1250 € ").
 * 3. Extração e determinação canónica de XP e Nível.
 * 4. Preservação total de inventário e cosméticos sem perda nem auto-wipe.
 * 5. Proteção de integridade de dados territoriais e de jogador existente.
 */

import assert from 'assert'
import {
  extractUserCoins,
  extractUserXp,
  extractUserLevel,
  extractUserInventory,
  extractUserEquipped,
  parseSafeNumber,
} from '../lib/economy-helpers'
import { STARTER_AVATAR_ID } from '../data/constants'

console.log('==================================================================')
console.log('🇵🇹 AUDITORIA FORENSE: SUÍTE DE TESTES DE SINCRONIZAÇÃO FIREBASE')
console.log('==================================================================\n')

let passed = 0
let failed = 0

function runTest(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  ✅ [PASS] ${name}`)
    passed++
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message)
    failed++
  }
}

// -------------------------------------------------------------
// 1. TESTES DE EXTRAÇÃO MULTI-ALIAS DE SALDO (€ ACORDA / MOEDAS)
// -------------------------------------------------------------
console.log('--- 1. Multi-Alias & Type Coercion: Moedas / Acordas Virtuais ---')

runTest('Campo canónico: coins (number)', () => {
  const data = { coins: 3500 }
  assert.strictEqual(extractUserCoins(data), 3500)
})

runTest('Campo legado: euros (number)', () => {
  const data = { euros: 2800 }
  assert.strictEqual(extractUserCoins(data), 2800)
})

runTest('Campo alternativo: acordaCoins (number)', () => {
  const data = { acordaCoins: 1500 }
  assert.strictEqual(extractUserCoins(data), 1500)
})

runTest('Campo direto no Firebase Console: acordas (number)', () => {
  const data = { acordas: 50000 }
  assert.strictEqual(extractUserCoins(data), 50000)
})

runTest('Campo direto no Firebase Console: saldo / balance (number)', () => {
  assert.strictEqual(extractUserCoins({ saldo: 4200 }), 4200)
  assert.strictEqual(extractUserCoins({ balance: 9900 }), 9900)
})

runTest('Campo direto no Firebase Console: moedas (number)', () => {
  const data = { moedas: 7777 }
  assert.strictEqual(extractUserCoins(data), 7777)
})

runTest('String numérica: coins = "12500"', () => {
  const data = { coins: '12500' }
  assert.strictEqual(extractUserCoins(data), 12500)
})

runTest('String formatada com espaços e símbolo: acordas = " 25 000 € "', () => {
  const data = { acordas: ' 25 000 € ' }
  assert.strictEqual(extractUserCoins(data), 25000)
})

runTest('Saldo zero real no Firestore (deve retornar 0, nunca fallback)', () => {
  const data = { coins: 0 }
  assert.strictEqual(extractUserCoins(data, 100), 0)
})

runTest('Objeto aninhado wallet: { balance: 8888 }', () => {
  const data = { wallet: { balance: 8888 } }
  assert.strictEqual(extractUserCoins(data), 8888)
})

runTest('Dados corrompidos ou indefinidos retornam fallback seguro', () => {
  assert.strictEqual(extractUserCoins(null, 50), 50)
  assert.strictEqual(extractUserCoins({}, 50), 50)
  assert.strictEqual(extractUserCoins({ coins: 'invalido' }, 50), 50)
})

// -------------------------------------------------------------
// 2. TESTES DE XP E PROGRESSÃO DETERMINÍSTICA
// -------------------------------------------------------------
console.log('\n--- 2. XP & Progressão de Nível ---')

runTest('Campo canónico: xp (number)', () => {
  assert.strictEqual(extractUserXp({ xp: 1250 }), 1250)
})

runTest('Campo alternativo: experience / pontos / points', () => {
  assert.strictEqual(extractUserXp({ experience: 2000 }), 2000)
  assert.strictEqual(extractUserXp({ pontos: '4500' }), 4500)
  assert.strictEqual(extractUserXp({ stats: { totalXp: 8000 } }), 8000)
})

runTest('Determinação determinística de nível a partir de XP', () => {
  const level0 = extractUserLevel({}, 0)
  assert.strictEqual(level0, 1)

  const levelXp = extractUserLevel({ xp: 10000 })
  assert.ok(levelXp >= 2, 'Nível com 10000 XP deve ser >= 2')
})

runTest('Nível explícito superior no Firestore é preservado', () => {
  const level = extractUserLevel({ level: 15, xp: 0 })
  assert.strictEqual(level, 15)
})

// -------------------------------------------------------------
// 3. TESTES DE PRESERVAÇÃO DE INVENTÁRIO (ANTI-WIPE)
// -------------------------------------------------------------
console.log('\n--- 3. Preservação de Inventário & Cosméticos (Anti-Wipe) ---')

runTest('Preservação total de múltiplos avatares desbloqueados', () => {
  const data = {
    inventory: {
      avatars: [STARTER_AVATAR_ID, 'avatar_02', 'avatar_03', 'avatar_04'],
    },
    unlockedAvatars: [STARTER_AVATAR_ID, 'AP-VIP-SIGNATURE-001'],
  }
  const inv = extractUserInventory(data)
  assert.ok(inv.avatars.includes(STARTER_AVATAR_ID), 'Contém starter avatar')
  assert.ok(inv.avatars.includes('avatar_02'), 'Contém avatar_02')
  assert.ok(inv.avatars.includes('avatar_03'), 'Contém avatar_03')
  assert.ok(inv.avatars.includes('avatar_04'), 'Contém avatar_04')
  assert.ok(inv.avatars.includes('AP-VIP-SIGNATURE-001'), 'Contém AP-VIP-SIGNATURE-001')
})

runTest('Preservação de molduras, arenas, títulos e taunts', () => {
  const data = {
    inventory: {
      frames: ['default', 'frame_ouro_real', 'frame_chamas'],
      arenas: ['arena_1', 'arena_nazare_ondas'],
      titles: ['tit_novico', 'tit_mestre_lusitano'],
      taunts: ['pack_basico', 'taunt_fado_vitoria'],
      utilities: {
        fiftyFifty: 3,
        freezeTime: 2,
        publicVote: 5,
      },
    },
  }
  const inv = extractUserInventory(data)
  assert.strictEqual(inv.utilities.fiftyFifty, 3)
  assert.strictEqual(inv.utilities.freezeTime, 2)
  assert.strictEqual(inv.utilities.publicVote, 5)
  assert.ok(inv.frames.includes('frame_ouro_real'))
  assert.ok(inv.arenas.includes('arena_nazare_ondas'))
  assert.ok(inv.titles.includes('tit_mestre_lusitano'))
  assert.ok(inv.taunts.includes('taunt_fado_vitoria'))
})

runTest('Normalização de Itens Equipados', () => {
  const data = {
    avatarId: 'avatar_02',
    equippedFrame: 'frame_ouro_real',
    equippedArena: 'arena_nazare_ondas',
    equippedTitleId: 'tit_mestre_lusitano',
    equippedTitle: 'Mestre Lusitano',
    xp: 5000,
  }
  const equipped = extractUserEquipped(data)
  assert.strictEqual(equipped.avatarId, 'avatar_02')
  assert.strictEqual(equipped.frameId, 'frame_ouro_real')
  assert.strictEqual(equipped.arenaId, 'arena_nazare_ondas')
  assert.strictEqual(equipped.titleId, 'tit_mestre_lusitano')
})

// -------------------------------------------------------------
// 4. PARSER NUMÉRICO SEGURO
// -------------------------------------------------------------
console.log('\n--- 4. Robustez do Parser Numérico Seguro ---')

runTest('parseSafeNumber lida com inteiros, floats, strings e valores corrompidos', () => {
  assert.strictEqual(parseSafeNumber(100), 100)
  assert.strictEqual(parseSafeNumber(99.8), 99)
  assert.strictEqual(parseSafeNumber(' 500 '), 500)
  assert.strictEqual(parseSafeNumber('1.500'), 1500) // Suporte a separador de milhares pt-PT
  assert.strictEqual(parseSafeNumber('1500€'), 1500)
  assert.strictEqual(parseSafeNumber(-10), 0)
  assert.strictEqual(parseSafeNumber(null), null)
  assert.strictEqual(parseSafeNumber(undefined), null)
  assert.strictEqual(parseSafeNumber(''), null)
  assert.strictEqual(parseSafeNumber('abc'), null)
})

console.log('\n==================================================================')
console.log(`🏁 RESULTADO DA AUDITORIA: ${passed} passaram, ${failed} falharam`)
console.log('==================================================================\n')

if (failed > 0) {
  process.exit(1)
}
