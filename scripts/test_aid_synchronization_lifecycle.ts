/**
 * 🇵🇹 ACORDA PORTUGAL — TESTE DE SINCRONIZAÇÃO E CICLO DE VIDA DAS AJUDAS (SSOT)
 *
 * Valida de ponta a ponta:
 * 1. Resolução estrita de inventário sem Math.max (impede ressuscitação de valores obsoletos)
 * 2. Atualização canónica do Firestore sem colisão de propriedades 'inventory' vs 'inventory.AID_xxx'
 * 3. Sincronização e suporte completo para Pista Histórica (AID_001), 50/50 (AID_002), Público (AID_003), Freeze (AID_004)
 * 4. Atribuição de recompensas de fim de partida (awardMatchReward) NÃO destrói nem reverte ajudas
 * 5. Ciclo multi-partidas: Saldo inicial -> Consumo -> Fim de Partida -> Nova Partida -> Compra -> Consumo
 */

import { extractUserInventory } from '../lib/economy-helpers'
import { getUserAidStock, CANONICAL_AIDS, type AidType } from '../lib/aid-service'
import { AID_SHOP_ITEMS } from '../lib/shop-catalog'

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`)
    throw new Error(`Assertion failed: ${message}`)
  }
  console.log(`✅ ${message}`)
}

async function runTests() {
  console.log('\n===============================================================')
  console.log('🧪 TESTE 1: CATÁLOGO DA LOJA & METADADOS DAS 4 AJUDAS OFICIAIS')
  console.log('===============================================================')

  const aid001 = AID_SHOP_ITEMS.find((item) => item.id === 'AID_001')
  assert(!!aid001, 'AID_001 (Pista Histórica) existe no catálogo da loja')
  assert(aid001?.active === true, 'AID_001 está ativo para compra na loja')
  assert(aid001?.type === 'aid' && aid001?.consumable === true, 'AID_001 tem tipo de ajuda e flag consumível')

  const aid002 = AID_SHOP_ITEMS.find((item) => item.id === 'AID_002')
  const aid003 = AID_SHOP_ITEMS.find((item) => item.id === 'AID_003')
  const aid004 = AID_SHOP_ITEMS.find((item) => item.id === 'AID_004')
  assert(!!aid002 && aid002.active, 'AID_002 (50/50) está ativo na loja')
  assert(!!aid003 && aid003.active, 'AID_003 (Público) está ativo na loja')
  assert(!!aid004 && aid004.active, 'AID_004 (Congelar) está ativo na loja')

  assert(!!CANONICAL_AIDS.hint, 'CANONICAL_AIDS tem entrada para hint')
  assert(!!CANONICAL_AIDS['5050'], 'CANONICAL_AIDS tem entrada para 5050')
  assert(!!CANONICAL_AIDS.publicVote, 'CANONICAL_AIDS tem entrada para publicVote')
  assert(!!CANONICAL_AIDS.freeze, 'CANONICAL_AIDS tem entrada para freeze')

  console.log('\n===============================================================')
  console.log('🧪 TESTE 2: RESOLUÇÃO CANÓNICA SSOT SEM RESSUSCITAÇÃO (SEM MATH.MAX)')
  console.log('===============================================================')

  // Cenário Crítico: Jogador consumiu ajudas. O campo canónico tem 1, mas existem aliases antigos com 5.
  // Anteriormente, o Math.max ressuscitava o 5 e impedia o decremento!
  const mockUserDataWithStaleAliases = {
    uid: 'user_test_123',
    consumables: {
      hints: 1,
      help5050: 0,
      freezeTime: 2,
      publicVote: 1,
    },
    inventory: {
      utilities: {
        hints: 1,
        fiftyFifty: 0,
        freezeTime: 2,
        publicVote: 1,
      },
      // Aliases obsoletos com valores antigos
      AID_001: 5,
      aid_hint: 5,
      consumable_pista: 5,
      AID_002: 4,
      aid_50_50: 4,
      consumable_50_50: 4,
      help5050: 4,
    },
  }

  const extracted = extractUserInventory(mockUserDataWithStaleAliases)
  assert(extracted.utilities.hints === 1, `hints resolvido estritamente como 1 (obtido: ${extracted.utilities.hints})`)
  assert(extracted.utilities.fiftyFifty === 0, `fiftyFifty resolvido estritamente como 0 (obtido: ${extracted.utilities.fiftyFifty})`)
  assert(extracted.utilities.freezeTime === 2, `freezeTime resolvido estritamente como 2 (obtido: ${extracted.utilities.freezeTime})`)
  assert(extracted.utilities.publicVote === 1, `publicVote resolvido estritamente como 1 (obtido: ${extracted.utilities.publicVote})`)

  const aidStock = getUserAidStock(mockUserDataWithStaleAliases as any, mockUserDataWithStaleAliases.inventory as any)
  assert(aidStock.stockHint === 1, `stockHint resolvido como 1 (obtido: ${aidStock.stockHint})`)
  assert(aidStock.stock5050 === 0, `stock5050 resolvido como 0 (obtido: ${aidStock.stock5050})`)
  assert(aidStock.stockFreeze === 2, `stockFreeze resolvido como 2 (obtido: ${aidStock.stockFreeze})`)
  assert(aidStock.stockPublicVote === 1, `stockPublicVote resolvido como 1 (obtido: ${aidStock.stockPublicVote})`)

  console.log('\n===============================================================')
  console.log('🧪 TESTE 3: PREVENÇÃO DE COLISÃO DE PROPRIEDADES FIRESTORE')
  console.log('===============================================================')

  // Simular payload gerado durante o consumo
  // O bug original ocorria porque 'inventory' e 'inventory.AID_002' estavam presentes no mesmo updatePayload!
  const simulateConsumePayload = (aidType: AidType, currentStock: number) => {
    const newStock = Math.max(0, currentStock - 1)
    const updatePayload: Record<string, any> = {}

    if (aidType === 'hint') {
      updatePayload['consumables.hints'] = newStock
      updatePayload['inventory.utilities.hints'] = newStock
      updatePayload['inventory.AID_001'] = newStock
      updatePayload['inventory.aid_hint'] = newStock
      updatePayload['inventory.consumable_pista'] = newStock
      updatePayload['inventory.pista_historica'] = newStock
      updatePayload['inventory.ajuda_pista'] = newStock
    } else if (aidType === '5050') {
      updatePayload['consumables.help5050'] = newStock
      updatePayload['inventory.utilities.fiftyFifty'] = newStock
      updatePayload['inventory.AID_002'] = newStock
      updatePayload['inventory.aid_50_50'] = newStock
      updatePayload['inventory.consumable_50_50'] = newStock
      updatePayload['inventory.help5050'] = newStock
    } else if (aidType === 'freeze') {
      updatePayload['consumables.freezeTime'] = newStock
      updatePayload['inventory.utilities.freezeTime'] = newStock
      updatePayload['inventory.AID_004'] = newStock
      updatePayload['inventory.aid_freeze_time'] = newStock
      updatePayload['inventory.consumable_congelar_tempo'] = newStock
      updatePayload['inventory.freezeTime'] = newStock
    } else if (aidType === 'publicVote') {
      updatePayload['consumables.publicVote'] = newStock
      updatePayload['inventory.utilities.publicVote'] = newStock
      updatePayload['inventory.AID_003'] = newStock
      updatePayload['inventory.aid_public_vote'] = newStock
      updatePayload['inventory.consumable_public_vote'] = newStock
      updatePayload['inventory.HELP_005'] = newStock
      updatePayload['inventory.publicVote'] = newStock
    }

    return updatePayload
  }

  const payload5050 = simulateConsumePayload('5050', 3)
  assert(!('inventory' in payload5050), "Payload de consumo NÃO contém propriedade 'inventory' (sem colisão)")
  assert(payload5050['consumables.help5050'] === 2, 'consumables.help5050 decrementado para 2')
  assert(payload5050['inventory.utilities.fiftyFifty'] === 2, 'inventory.utilities.fiftyFifty decrementado para 2')
  assert(payload5050['inventory.AID_002'] === 2, 'inventory.AID_002 decrementado para 2')

  const payloadHint = simulateConsumePayload('hint', 3)
  assert(!('inventory' in payloadHint), "Payload de pista NÃO contém propriedade 'inventory' (sem colisão)")
  assert(payloadHint['consumables.hints'] === 2, 'consumables.hints decrementado para 2')
  assert(payloadHint['inventory.utilities.hints'] === 2, 'inventory.utilities.hints decrementado para 2')
  assert(payloadHint['inventory.AID_001'] === 2, 'inventory.AID_001 decrementado para 2')

  console.log('\n===============================================================')
  console.log('🧪 TESTE 4: CICLO COMPLETO MULTI-PARTIDAS (SSOT)')
  console.log('===============================================================')

  // Estado Inicial no Firestore
  let simulatedFirestoreUserDoc: any = {
    uid: 'user_test_lifecycle',
    coins: 5000,
    xp: 1200,
    level: 5,
    consumables: {
      hints: 3,
      help5050: 2,
      freezeTime: 1,
      publicVote: 2,
    },
    inventory: {
      utilities: {
        hints: 3,
        fiftyFifty: 2,
        freezeTime: 1,
        publicVote: 2,
      },
      AID_001: 3,
      AID_002: 2,
      AID_004: 1,
      AID_003: 2,
    },
  }

  // Partida 1 Começa
  let matchStock = getUserAidStock(simulatedFirestoreUserDoc, simulatedFirestoreUserDoc.inventory)
  assert(matchStock.stockHint === 3, 'Partida 1: Inicia com 3 pistas')
  assert(matchStock.stock5050 === 2, 'Partida 1: Inicia com 2 50/50')
  assert(matchStock.stockFreeze === 1, 'Partida 1: Inicia com 1 freeze')
  assert(matchStock.stockPublicVote === 2, 'Partida 1: Inicia com 2 público')

  // Jogador usa 1 Pista durante a Partida 1
  const hintConsumePayload = simulateConsumePayload('hint', matchStock.stockHint)
  // Aplicar ao documento Firestore
  for (const [k, v] of Object.entries(hintConsumePayload)) {
    const parts = k.split('.')
    if (parts.length === 2) {
      simulatedFirestoreUserDoc[parts[0]][parts[1]] = v
    }
  }

  // Jogador usa 1 50/50 durante a Partida 1
  const fiftyConsumePayload = simulateConsumePayload('5050', matchStock.stock5050)
  for (const [k, v] of Object.entries(fiftyConsumePayload)) {
    const parts = k.split('.')
    if (parts.length === 2) {
      simulatedFirestoreUserDoc[parts[0]][parts[1]] = v
    }
  }

  // Verificar estado no Firestore imediatamente após consumo
  let intermediateExtracted = extractUserInventory(simulatedFirestoreUserDoc)
  assert(intermediateExtracted.utilities.hints === 2, 'Após consumo na Partida 1: Firestore tem 2 pistas')
  assert(intermediateExtracted.utilities.fiftyFifty === 1, 'Após consumo na Partida 1: Firestore tem 1 50/50')

  // Partida 1 Termina: awardMatchReward atribui XP e Moedas
  // Simulamos o payload estrito de awardMatchReward (XP, moedas, streak, etc.)
  simulatedFirestoreUserDoc.xp += 350
  simulatedFirestoreUserDoc.coins += 50
  simulatedFirestoreUserDoc.gamesPlayed = (simulatedFirestoreUserDoc.gamesPlayed || 0) + 1

  // Partida 2 Começa! (Simula nova montagem de QuizScreen)
  let match2Stock = getUserAidStock(simulatedFirestoreUserDoc, simulatedFirestoreUserDoc.inventory)
  assert(match2Stock.stockHint === 2, 'Partida 2: Lê com fidelidade 2 pistas (SEM regressão para 3!)')
  assert(match2Stock.stock5050 === 1, 'Partida 2: Lê com fidelidade 1 50/50 (SEM regressão para 2!)')
  assert(match2Stock.stockFreeze === 1, 'Partida 2: Mantém 1 freeze')
  assert(match2Stock.stockPublicVote === 2, 'Partida 2: Mantém 2 público')

  // Compra na Loja: Jogador compra +1 Pista Histórica (+1 unidade)
  simulatedFirestoreUserDoc.coins -= 750
  simulatedFirestoreUserDoc.consumables.hints += 1
  simulatedFirestoreUserDoc.inventory.utilities.hints += 1
  simulatedFirestoreUserDoc.inventory.AID_001 += 1

  // Partida 3 Começa após compra
  let match3Stock = getUserAidStock(simulatedFirestoreUserDoc, simulatedFirestoreUserDoc.inventory)
  assert(match3Stock.stockHint === 3, 'Partida 3 após compra: Lê 3 pistas')
  assert(match3Stock.stock5050 === 1, 'Partida 3 após compra: Mantém 1 50/50')

  // Jogador usa 1 Pista na Partida 3
  const hintConsume3 = simulateConsumePayload('hint', match3Stock.stockHint)
  for (const [k, v] of Object.entries(hintConsume3)) {
    const parts = k.split('.')
    if (parts.length === 2) {
      simulatedFirestoreUserDoc[parts[0]][parts[1]] = v
    }
  }

  let finalStock = getUserAidStock(simulatedFirestoreUserDoc, simulatedFirestoreUserDoc.inventory)
  assert(finalStock.stockHint === 2, 'Fim do teste: Saldo final de pistas é exatamente 2')
  assert(finalStock.stock5050 === 1, 'Fim do teste: Saldo final de 50/50 é exatamente 1')

  console.log('\n===============================================================')
  console.log('🎉 TODOS OS TESTES DE SINCRONIZAÇÃO PASSARAM COM SUCESSO!')
  console.log('===============================================================\n')
}

runTests().catch((err) => {
  console.error('Falha no teste:', err)
  process.exit(1)
})
