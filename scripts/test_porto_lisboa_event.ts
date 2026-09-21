/**
 * Bateria de Testes Automatizados Rigorosos do Novo Evento Principal
 * PORTO ⚔️ LISBOA — O GRANDE DUELO
 */

import { PORTO_LISBOA_QUESTIONS } from '../lib/data/porto-lisboa-questions'
import { QuestionRegistry } from '../lib/question-system/registry'
import { loadQuestionsPool } from '../src/lib/questionEngine'
import {
  OFFICIAL_PORTO_LISBOA_ID,
  OFFICIAL_PORTO_LISBOA_SLUG,
  OFFICIAL_EVENT_CONFIG_PORTO_LISBOA,
  OFFICIAL_PORTUGAL_EM_JOGO_ID,
  OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
  getEventStatus,
  getEventStatusLabel,
  getEventCountdown,
  getDailyMatchesCount,
  sortEventParticipants,
  type EventParticipant,
} from '../lib/events-service'
import fs from 'fs'
import path from 'path'

async function runPortoLisboaEventTests() {
  console.log('========================================================================')
  console.log('⚔️ BATERIA DE TESTES: NOVO EVENTO ESPECIAL')
  console.log('   PORTO ⚔️ LISBOA — O GRANDE DUELO')
  console.log('========================================================================\n')

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`)
      passed++
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` (${detail})` : ''}`)
      failed++
    }
  }

  // -------------------------------------------------------------------------
  // 1. VERIFICAÇÃO DO BANCO DE PERGUNTAS (80 PERGUNTAS RIGOROSAS)
  // -------------------------------------------------------------------------
  console.log('--- 1. POOL DE PERGUNTAS EXCLUSIVAS (80 PERGUNTAS) ---')
  assert(
    PORTO_LISBOA_QUESTIONS.length === 80,
    'Total de perguntas é exatamente 80',
    `Atual: ${PORTO_LISBOA_QUESTIONS.length}`
  )

  const portoQs = PORTO_LISBOA_QUESTIONS.filter((q) => q.universe === 'PORTO')
  const lisboaQs = PORTO_LISBOA_QUESTIONS.filter((q) => q.universe === 'LISBOA')
  const fcpQs = PORTO_LISBOA_QUESTIONS.filter((q) => q.universe === 'FC_PORTO')
  const slbQs = PORTO_LISBOA_QUESTIONS.filter((q) => q.universe === 'BENFICA')
  const crossoverQs = PORTO_LISBOA_QUESTIONS.filter((q) => q.universe === 'CROSSOVER')

  assert(portoQs.length === 16, 'Universo 1 (Cidade do Porto): exatamente 16 perguntas', `Atual: ${portoQs.length}`)
  assert(lisboaQs.length === 16, 'Universo 2 (Cidade de Lisboa): exatamente 16 perguntas', `Atual: ${lisboaQs.length}`)
  assert(fcpQs.length === 16, 'Universo 3 (FC Porto): exatamente 16 perguntas', `Atual: ${fcpQs.length}`)
  assert(slbQs.length === 16, 'Universo 4 (SL Benfica): exatamente 16 perguntas', `Atual: ${slbQs.length}`)
  assert(crossoverQs.length === 16, 'Universo 5 (Confrontos Diretos / Duelo): exatamente 16 perguntas', `Atual: ${crossoverQs.length}`)

  // -------------------------------------------------------------------------
  // 2. DIFICULDADE ESTRITA: ZERO FÁCEIS, ZERO MÉDIAS
  // -------------------------------------------------------------------------
  console.log('\n--- 2. REGRA DE DIFICULDADE: APENAS DIFÍCIL, MUITO DIFÍCIL E EXPERT ---')
  const easyOrMedium = PORTO_LISBOA_QUESTIONS.filter(
    (q) =>
      q.difficulty < 3 ||
      q.difficultyLevel === 'EASY' ||
      q.difficultyLevel === 'MEDIUM' ||
      (q as any).difficultyLevel === 'facil' ||
      (q as any).difficultyLevel === 'medio'
  )
  assert(
    easyOrMedium.length === 0,
    'Zero perguntas fáceis ou médias no evento Porto vs Lisboa',
    `Encontradas ${easyOrMedium.length} fáceis/médias`
  )

  const hardCount = PORTO_LISBOA_QUESTIONS.filter((q) => q.difficulty === 3).length
  const veryHardCount = PORTO_LISBOA_QUESTIONS.filter((q) => q.difficulty === 4).length
  const expertCount = PORTO_LISBOA_QUESTIONS.filter((q) => q.difficulty === 5).length
  assert(hardCount > 0, `Presença de perguntas HARD (3): ${hardCount}`)
  assert(veryHardCount > 0, `Presença de perguntas VERY_HARD (4): ${veryHardCount}`)
  assert(expertCount > 0, `Presença de perguntas EXPERT (5): ${expertCount}`)
  assert(
    hardCount + veryHardCount + expertCount === 80,
    'Todas as 80 perguntas são estritamente nível 3, 4 ou 5'
  )

  // -------------------------------------------------------------------------
  // 3. ESTRUTURA E VALIDAÇÃO DE CONTEÚDO FACTUAL
  // -------------------------------------------------------------------------
  console.log('\n--- 3. ESTRUTURA DAS PERGUNTAS E OPÇÕES ---')
  let structureOk = true
  for (const q of PORTO_LISBOA_QUESTIONS) {
    if (!q.id || !q.question || q.question.length < 15) structureOk = false
    if (!Array.isArray(q.options) || q.options.length !== 4) structureOk = false
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) structureOk = false
    if (!q.explanation || q.explanation.length < 20) structureOk = false
    // Verificar que não há opções vazias ou duplicadas
    const uniqueOptions = new Set(q.options.map((o) => o.trim().toLowerCase()))
    if (uniqueOptions.size !== 4) structureOk = false
  }
  assert(structureOk, 'Todas as 80 perguntas têm 4 opções distintas, resposta válida e explicação histórica completa')

  // -------------------------------------------------------------------------
  // 4. QUESTION REGISTRY & QUESTION ENGINE INTEGRATION
  // -------------------------------------------------------------------------
  console.log('\n--- 4. REGISTRY E MOTOR DE PERGUNTAS ---')
  const registryQs = QuestionRegistry.getPortoLisboaQuestions()
  assert(registryQs.length === 80, 'QuestionRegistry.getPortoLisboaQuestions() indexa todas as 80 perguntas')

  const loadedPool = loadQuestionsPool('porto-vs-lisboa')
  assert(loadedPool.length === 80, 'loadQuestionsPool("porto-vs-lisboa") carrega o pool do evento', `Total carregado: ${loadedPool.length}`)

  // -------------------------------------------------------------------------
  // 5. CONFIGURAÇÃO OFICIAL DO EVENTO
  // -------------------------------------------------------------------------
  console.log('\n--- 5. CONFIGURAÇÃO OFICIAL DO EVENTO ---')
  assert(OFFICIAL_PORTO_LISBOA_ID === 'porto-lisboa-duelo', 'ID canónico é "porto-lisboa-duelo"')
  assert(OFFICIAL_PORTO_LISBOA_SLUG === 'porto-lisboa-o-grande-duelo', 'Slug oficial é "porto-lisboa-o-grande-duelo"')
  assert(OFFICIAL_EVENT_CONFIG_PORTO_LISBOA.id === 'porto-lisboa-duelo', 'Configuração oficial tem id correto')

  // Verificar coexistência (Portugal em Jogo intacto)
  assert(OFFICIAL_PORTUGAL_EM_JOGO_ID === 'portugal-em-jogo-2026', 'Portugal em Jogo ID mantido intacto')
  assert(OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.id === 'portugal-em-jogo-2026', 'Configuração do Portugal em Jogo preservada')

  const statusNow = getEventStatus(OFFICIAL_EVENT_CONFIG_PORTO_LISBOA)
  assert(statusNow === 'active', `Estado atual do evento Porto vs Lisboa é ativo (${statusNow})`)

  // Recompensas oficiais
  const rewards = OFFICIAL_EVENT_CONFIG_PORTO_LISBOA.rewards
  const first = rewards.find((r) => r.position === 1)
  const second = rewards.find((r) => r.position === 2)
  const third = rewards.find((r) => r.position === 3)
  const top10 = rewards.find((r) => r.position === 4)
  const part = rewards.find((r) => r.position === 5)
  assert(first?.acordas === 15000, 'Recompensa 1.º Lugar: 15.000 Acordas')
  assert(second?.acordas === 10000, 'Recompensa 2.º Lugar: 10.000 Acordas')
  assert(third?.acordas === 7500, 'Recompensa 3.º Lugar: 7.500 Acordas')
  assert(top10?.acordas === 2500, 'Recompensa Top 10: 2.500 Acordas')
  assert(part?.acordas === 500, 'Recompensa Participação: 500 Acordas')

  // Regras
  assert(OFFICIAL_EVENT_CONFIG_PORTO_LISBOA.rules.maxDailyMatches === 10, 'Limite diário é de 10 partidas')

  // -------------------------------------------------------------------------
  // 6. RANKING SORT E TIE-BREAKERS
  // -------------------------------------------------------------------------
  console.log('\n--- 6. RANKING SORT & CRITÉRIOS DE DESEMPATE ---')
  const sampleParticipants: EventParticipant[] = [
    {
      userId: 'user_c',
      displayName: 'Carlos',
      eventPoints: 800,
      totalScore: 7000,
      bestScore: 900,
      countedMatches: 8,
      correctAnswers: 70,
    },
    {
      userId: 'user_a',
      displayName: 'Ana',
      eventPoints: 1000,
      totalScore: 8500,
      bestScore: 950,
      countedMatches: 10,
      correctAnswers: 85,
    },
    {
      userId: 'user_b',
      displayName: 'Bernardo',
      eventPoints: 800,
      totalScore: 7500, // Maior totalScore que Carlos -> desempatado em 2º entre eles
      bestScore: 900,
      countedMatches: 8,
      correctAnswers: 72,
    },
    {
      userId: 'user_d',
      displayName: 'Daniela',
      eventPoints: 800,
      totalScore: 7000,
      bestScore: 900,
      countedMatches: 7, // Menos partidas para os mesmos pontos -> melhor média!
      correctAnswers: 70,
    },
  ]

  const sorted = sortEventParticipants(sampleParticipants)
  assert(sorted[0].userId === 'user_a', '1.º lugar: Ana com 1000 pontos')
  assert(sorted[1].userId === 'user_b', '2.º lugar: Bernardo com 800 pts e maior totalScore (7500)')
  assert(sorted[2].userId === 'user_d', '3.º lugar: Daniela com 800 pts e menos partidas jogadas (7 vs 8)')
  assert(sorted[3].userId === 'user_c', '4.º lugar: Carlos com 800 pts e 8 partidas jogadas')

  // -------------------------------------------------------------------------
  // 7. ARQUIVOS E ROTAS IMPLEMENTADAS
  // -------------------------------------------------------------------------
  console.log('\n--- 7. INTEGRIDADE DAS ROTAS E COMPONENTES NO PROJETO ---')
  const filesToCheck = [
    'lib/data/porto-lisboa-questions.ts',
    'lib/question-system/registry.ts',
    'lib/events-service.ts',
    'app/api/events/route.ts',
    'app/api/events/match/init/route.ts',
    'app/api/events/record-match/route.ts',
    'app/api/events/claim-reward/route.ts',
    'app/api/admin/events/route.ts',
    'components/events/PortoLisboaEvent.tsx',
    'app/eventos/porto-vs-lisboa/page.tsx',
    'app/eventos/page.tsx',
    'components/events.tsx',
    'components/game-hub.tsx',
    'components/quiz/quiz-screen.tsx',
    'components/admin/views/EventosView.tsx',
  ]

  for (const relPath of filesToCheck) {
    const fullPath = path.resolve(process.cwd(), relPath)
    assert(fs.existsSync(fullPath), `Ficheiro obrigatório existe: ${relPath}`)
  }

  // -------------------------------------------------------------------------
  // RESUMO DOS RESULTADOS
  // -------------------------------------------------------------------------
  console.log('\n========================================================================')
  console.log(`📊 RESULTADO FINAL: ${passed} PASSOU | ${failed} FALHOU`)
  console.log('========================================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runPortoLisboaEventTests().catch((err) => {
  console.error('Erro na execução dos testes:', err)
  process.exit(1)
})
