/**
 * scripts/test_complete_game_flow.ts
 *
 * Teste exaustivo do fluxo completo:
 * JOGAR → CATEGORIA → ARENA → SESSÃO → QUIZ
 *
 * Valida:
 * 1. Todas as categorias mandatórias (Cultura, História, Geografia, Desporto, Entretenimento, Ciência, Tecnologia, Atualidade, Modo Maluco).
 * 2. Nenhuma categoria recorre cegamente a "modo-maluco".
 * 3. Arena é SEMPRE resolvida (zero null, zero undefined).
 * 4. Perguntas são carregadas e validadas (mínimo de opções, índice correto válido).
 * 5. Remoção do widget flutuante e AudioPlayer comprovada.
 */

import { resolveArenaForGame, getDefaultArenaForCategory, CANONICAL_ARENAS } from '../src/data/arenaCatalog'
import {
  createDeterministicGameSession,
  resolveCategoryMetadata,
  type GameSession,
} from '../lib/game-session'
import * as fs from 'fs'
import * as path from 'path'

interface TestResult {
  category: string
  slug: string
  sessionCreated: boolean
  arenaId: string
  arenaName: string
  arenaValid: boolean
  questionsCount: number
  questionsValid: boolean
  passed: boolean
  error?: string
}

const MANDATORY_CATEGORIES = [
  { name: 'Cultura Portuguesa', slug: 'cultura-portuguesa' },
  { name: 'História', slug: 'historia' },
  { name: 'História de Portugal', slug: 'historia-de-portugal' },
  { name: 'Geografia', slug: 'geografia' },
  { name: 'Geografia e Território', slug: 'geografia-territorio' },
  { name: 'Desporto', slug: 'desporto' },
  { name: 'Futebol Português', slug: 'futebol-portugues' },
  { name: 'Entretenimento', slug: 'entretenimento' },
  { name: 'Ciência', slug: 'ciencia' },
  { name: 'Ciência e Tecnologia', slug: 'ciencia-tecnologia' },
  { name: 'Tecnologia', slug: 'tecnologia' },
  { name: 'Atualidade', slug: 'atualidade' },
  { name: 'Modo Maluco', slug: 'modo-maluco' },
  { name: 'Desafio Nacional', slug: 'desafio-nacional' },
]

function runAllGameFlowTests(): boolean {
  console.log('==================================================================')
  console.log('  ACORDA PORTUGAL — VERIFICAÇÃO DO FLUXO COMPLETO DE JOGO')
  console.log('==================================================================\n')

  let allPassed = true
  const results: TestResult[] = []

  // 1. Testar todas as categorias mandatórias
  for (const cat of MANDATORY_CATEGORIES) {
    try {
      const session = createDeterministicGameSession({
        categorySlug: cat.slug,
        difficultyParam: '2',
      })

      const arenaValid =
        session.arena !== null &&
        session.arena !== undefined &&
        typeof session.arena.id === 'string' &&
        session.arena.id.length > 0 &&
        typeof session.arena.name === 'string' &&
        session.arena.name.length > 0

      // Validar perguntas
      let questionsValid = session.questions.length > 0
      for (const q of session.questions) {
        if (!q.question || !q.options || q.options.length < 2) {
          questionsValid = false
          break
        }
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
          questionsValid = false
          break
        }
      }

      // Validar preservação de identidade (não forçar modo-maluco a outras categorias)
      if (cat.slug !== 'modo-maluco' && session.categorySlug === 'modo-maluco') {
        throw new Error(`Categoria ${cat.name} foi indevidamente convertida para modo-maluco!`)
      }

      const passed = arenaValid && questionsValid

      if (!passed) allPassed = false

      results.push({
        category: cat.name,
        slug: cat.slug,
        sessionCreated: true,
        arenaId: session.arena?.id || 'NULL',
        arenaName: session.arena?.name || 'NULL',
        arenaValid,
        questionsCount: session.questions.length,
        questionsValid,
        passed,
      })
    } catch (err: any) {
      allPassed = false
      results.push({
        category: cat.name,
        slug: cat.slug,
        sessionCreated: false,
        arenaId: 'ERROR',
        arenaName: 'ERROR',
        arenaValid: false,
        questionsCount: 0,
        questionsValid: false,
        passed: false,
        error: err?.message || String(err),
      })
    }
  }

  // Imprimir tabela de resultados
  console.log('Resultados por Categoria:')
  console.log('---------------------------------------------------------------------------------------------')
  console.log(
    'Categoria'.padEnd(25) +
      'Slug'.padEnd(24) +
      'Arena'.padEnd(26) +
      'Perguntas'.padEnd(12) +
      'Status'
  )
  console.log('---------------------------------------------------------------------------------------------')

  for (const r of results) {
    const status = r.passed ? '✅ PASS' : '❌ FAIL'
    console.log(
      r.category.padEnd(25) +
        r.slug.padEnd(24) +
        (r.arenaId ? `${r.arenaId.slice(0, 24)}` : 'N/A').padEnd(26) +
        `${r.questionsCount} válidas`.padEnd(12) +
        status
    )
    if (r.error) {
      console.log(`   └─ Erro: ${r.error}`)
    }
  }
  console.log('---------------------------------------------------------------------------------------------\n')

  // 2. Testar Resolução de Arenas de Casos Limite
  console.log('Verificação de Resolução de Arenas (Regra Absoluta: NUNCA null/undefined):')
  const edgeCases = [
    { label: 'Slug vazio / default', slug: '' },
    { label: 'Slug inventado / inválido', slug: 'tema_desconhecido_999' },
    { label: 'Arena ID explícita inexistente', slug: 'historia', arenaId: 'arena_fantasma_404' },
    { label: 'Equipada inexistente', slug: 'geografia', equipped: 'arena_inexistente' },
  ]

  for (const edge of edgeCases) {
    const res = resolveArenaForGame({
      categorySlug: edge.slug,
      arenaId: (edge as any).arenaId,
      equippedArenaId: (edge as any).equipped,
    })

    const isNonNil = res.arena !== null && res.arena !== undefined
    console.log(
      `  [${edge.label}]: arenaId="${res.arena?.id}" isFallback=${res.isFallback} -> ${isNonNil ? '✅ GARANTIDA' : '❌ FALHA NULL'}`
    )
    if (!isNonNil) allPassed = false
  }

  // 3. Verificação de remoção do Widget de Áudio
  console.log('\nVerificação de Remoção do Widget Flutuante de Áudio:')
  const layoutPath = path.join(__dirname, '../app/layout.tsx')
  const headerPath = path.join(__dirname, '../components/site-header.tsx')

  const layoutContent = fs.readFileSync(layoutPath, 'utf8')
  const headerContent = fs.readFileSync(headerPath, 'utf8')

  const hasFloatingWidgetInLayout = layoutContent.includes('FloatingBgmWidget')
  const hasAudioProviderInLayout = layoutContent.includes('AudioProvider')
  const hasAudioPlayerInHeader = headerContent.includes('<AudioPlayer')

  console.log(`  FloatingBgmWidget em app/layout.tsx: ${hasFloatingWidgetInLayout ? '❌ PRESENTE' : '✅ REMOVIDO'}`)
  console.log(`  AudioProvider em app/layout.tsx:     ${hasAudioProviderInLayout ? '✅ PRESENTE (MOTOR PRESERVADO)' : '❌ AUSENTE'}`)
  console.log(`  <AudioPlayer /> em site-header.tsx:  ${hasAudioPlayerInHeader ? '❌ PRESENTE' : '✅ REMOVIDO'}`)

  if (hasFloatingWidgetInLayout || !hasAudioProviderInLayout || hasAudioPlayerInHeader) {
    allPassed = false
  }

  console.log('\n==================================================================')
  console.log(allPassed ? '  🎉 TODOS OS TESTES PASSARAM COM SUCESSO!' : '  ⚠️ ALGUNS TESTES FALHARAM!')
  console.log('==================================================================\n')

  return allPassed
}

const success = runAllGameFlowTests()
process.exit(success ? 0 : 1)
