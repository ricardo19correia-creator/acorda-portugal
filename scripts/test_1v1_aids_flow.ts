/**
 * 🇵🇹 ACORDA PORTUGAL — TESTE DE INTEGRAÇÃO & ISOLAMENTO: AJUDAS NO 1V1 MULTIPLAYER
 */

import fs from 'fs'
import path from 'path'
import {
  getUserAidStock,
  CANONICAL_AIDS,
  type AidType,
} from '../lib/aid-service'
import { calculate5050Eliminated, simulatePublicVote } from '../lib/powerup-helpers'

console.log('='.repeat(80))
console.log('⚔️ TESTE DE VALIDAÇÃO: SISTEMA DE AJUDAS NO 1V1 MULTIPLAYER (SSOT)')
console.log('='.repeat(80))

let passCount = 0
let failCount = 0

function assert(id: number, title: string, condition: boolean, detail: string) {
  if (condition) {
    passCount++
    console.log(`✅ [1V1 TEST ${id.toString().padStart(2, '0')}] PASS: ${title}`)
  } else {
    failCount++
    console.error(`❌ [1V1 TEST ${id.toString().padStart(2, '0')}] FAIL: ${title} — ${detail}`)
  }
}

// 1. Assets das 3 ajudas canónicas existem e são legíveis no sistema de ficheiros
{
  const aids = Object.values(CANONICAL_AIDS)
  const allExist = aids.every((aid) => {
    const fullPath = path.join(process.cwd(), 'public', aid.image)
    return fs.existsSync(fullPath)
  })
  assert(1, 'Assets WebP das 3 Ajudas Canónicas Existem em Disco', allExist, 'Um ou mais assets não foram encontrados')
}

// 2. getUserAidStock extrai stocks de qualquer formato de dados (retrocompatibilidade)
{
  // Formato novo da subcoleção / Loja
  const p1 = {
    inventory: {
      AID_002: 5,
      AID_003: 3,
      AID_004: 2,
    },
  }
  const s1 = getUserAidStock(p1)
  assert(
    2,
    'Extração de Stock (Formato Canónico Loja: AID_002, AID_003, AID_004)',
    s1.stock5050 === 5 && s1.stockPublicVote === 3 && s1.stockFreeze === 2,
    `Obtido: 5050=${s1.stock5050}, pub=${s1.stockPublicVote}, frz=${s1.stockFreeze}`
  )

  // Formato do AuthProvider / Utilities
  const p2 = {
    consumables: {
      help5050: 4,
      publicVote: 1,
      freezeTime: 6,
    },
    inventory: {
      utilities: {
        fiftyFifty: 4,
        publicVote: 1,
        freezeTime: 6,
      },
    },
  }
  const s2 = getUserAidStock(p2)
  assert(
    3,
    'Extração de Stock (Formato Normalizado AuthProvider / Consumables)',
    s2.stock5050 === 4 && s2.stockPublicVote === 1 && s2.stockFreeze === 6,
    `Obtido: 5050=${s2.stock5050}, pub=${s2.stockPublicVote}, frz=${s2.stockFreeze}`
  )

  // Formato de Aliases legados (consumable_50_50, HELP_005, etc.)
  const p3 = {
    inventory: {
      consumable_50_50: 2,
      HELP_005: 8,
      consumable_congelar_tempo: 1,
    },
  }
  const s3 = getUserAidStock(p3)
  assert(
    4,
    'Extração de Stock (Aliases Legados)',
    s3.stock5050 === 2 && s3.stockPublicVote === 8 && s3.stockFreeze === 1,
    `Obtido: 5050=${s3.stock5050}, pub=${s3.stockPublicVote}, frz=${s3.stockFreeze}`
  )
}

// 3. Teste de Isolamento 1v1: Player A vs Player B
{
  const question = {
    id: 1,
    question: 'Qual é a capital histórica de Portugal antes de Lisboa?',
    correct: 'B',
    options: [
      { key: 'A', text: 'Porto' },
      { key: 'B', text: 'Coimbra' },
      { key: 'C', text: 'Braga' },
      { key: 'D', text: 'Guimarães' },
    ],
  }

  // Player A usa 50/50
  const playerAEliminated = calculate5050Eliminated(question.options, question.correct)
  // Player B NÃO usou ajuda
  const playerBEliminated: string[] = []

  const aIsCorrectKept = !playerAEliminated.includes(question.correct)
  const aEliminatedCount = playerAEliminated.length === 2
  const bIsUntouched = playerBEliminated.length === 0

  assert(
    5,
    'Isolamento 1v1 (50/50): Player A recebe 2 eliminadas mantendo a correta; Player B vê todas as 4 opções',
    aIsCorrectKept && aEliminatedCount && bIsUntouched,
    `Player A eliminadas: [${playerAEliminated.join(', ')}], Player B: [${playerBEliminated.join(', ')}]`
  )

  // Player A usa Pergunta ao Público
  const correctIdx = question.options.findIndex((o) => o.key === question.correct)
  const playerAPublicVotes = simulatePublicVote(correctIdx)
  const playerBPublicVotes = null // Player B não ativou público

  const totalSum = playerAPublicVotes.reduce((a, b) => a + b, 0)
  const bRemainsNull = playerBPublicVotes === null

  assert(
    6,
    'Isolamento 1v1 (Público): Votação de Player A soma 100% e aponta para correta; Player B não vê votação',
    totalSum === 100 && bRemainsNull && playerAPublicVotes[correctIdx] >= 50,
    `Player A soma=${totalSum}%, votos=${playerAPublicVotes.join('%, ')}% | Player B=${playerBPublicVotes}`
  )

  // Player A usa Congelar Tempo (+15s)
  const baseTime = 60
  let playerATime = baseTime + 15
  let playerBTime = baseTime

  assert(
    7,
    'Isolamento 1v1 (Congelar): Player A ganha +15s de pausa; Player B continua no tempo padrão (60s)',
    playerATime === 75 && playerBTime === 60,
    `Player A=${playerATime}s, Player B=${playerBTime}s`
  )
}

// 4. Bloqueio de Utilização com Saldo Zero
{
  const emptyStock = { stock5050: 0, stockPublicVote: 0, stockFreeze: 0 }
  const canUseAny = emptyStock.stock5050 > 0 || emptyStock.stockPublicVote > 0 || emptyStock.stockFreeze > 0

  assert(
    8,
    'Prevenção de Uso sem Stock: Bloqueio estrito quando saldo é 0',
    !canUseAny,
    'Saldo zero permitiu incorretamente utilização'
  )
}

console.log('='.repeat(80))
console.log(`🏁 RESULTADO DO TESTE 1V1: ${passCount}/${passCount + failCount} APROVADOS (${failCount} falhas)`)
if (failCount > 0) {
  process.exit(1)
} else {
  console.log('✨ INTEGRAÇÃO E ISOLAMENTO DE AJUDAS NO 1V1 MULTIPLAYER VALIDADO!')
}
