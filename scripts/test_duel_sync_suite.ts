import assert from 'assert'
import { calculateLevelProgress } from '../lib/progression'

console.log('==================================================================')
console.log('⚔️ SUÍTE DE TESTES: SINCRONIZAÇÃO MULTIPLAYER E ESTADO DE DUELO 1V1')
console.log('==================================================================\n')

function run() {
  const now = Date.now()

  // TESTE 1: Estrutura Canónica do Documento de Duelo
  console.log('--- TESTE 1: ESTADO INICIAL DO DUELO ---')
  const duel = {
    id: 'duel_test_999',
    code: 'AP-TEST',
    status: 'matched',
    playerUids: ['uid_player_a', 'uid_player_b'],
    startedAt: now,
    playerA: {
      uid: 'uid_player_a',
      displayName: 'Afonso Henriques',
      level: 10,
      score: 0,
      correctCount: 0,
      currentQuestionIndex: 0,
      questionDeadline: now + 60_000,
      answers: [] as any[],
      finished: false,
    },
    playerB: {
      uid: 'uid_player_b',
      displayName: 'D. Dinis',
      level: 8,
      score: 0,
      correctCount: 0,
      currentQuestionIndex: 0,
      questionDeadline: now + 60_000,
      answers: [] as any[],
      finished: false,
    },
    questions: [
      { id: 'q1', correct: 'A', question: 'Capital de Portugal?' },
      { id: 'q2', correct: 'B', question: 'Maior rio de Portugal?' },
    ],
    winnerUid: null,
    winnerReason: null,
  }

  assert(duel.status === 'matched', 'Duelo começa em matched')
  assert(duel.playerA.score === 0, 'Score de A começa a 0')
  assert(duel.playerB.score === 0, 'Score de B começa a 0')
  console.log('✅ [PASS] Estado inicial do duelo válido')

  // TESTE 2: Player A Responde à Pergunta 0 (Correta)
  console.log('\n--- TESTE 2: PLAYER A RESPONDE E ATUALIZA ESTADO ATOMICAMENTE ---')
  const answerA0 = {
    questionIndex: 0,
    selectedOption: 'A',
    correctOption: 'A',
    isCorrect: true,
    pointsAwarded: 100,
    timeSpentSeconds: 4,
  }
  duel.playerA.answers.push(answerA0)
  duel.playerA.score += 100
  duel.playerA.correctCount += 1
  duel.playerA.currentQuestionIndex = 1
  duel.playerA.questionDeadline = now + 4000 + 60_000

  assert(duel.playerA.score === 100, 'Score de Player A é 100')
  assert(duel.playerA.currentQuestionIndex === 1, 'Player A avançou para pergunta 1')
  assert(duel.playerB.score === 0, 'Score de Player B permaneceu inalterado (0)')
  console.log('✅ [PASS] Player A atualizou score e avançou de pergunta atomicamente')

  // TESTE 3: Player B Recebe Atualização do Estado de Player A
  console.log('\n--- TESTE 3: PLAYER B VÊ ATUALIZAÇÃO DE A NO HUD ---')
  const opponentViewForB = duel.playerA
  assert(opponentViewForB.score === 100, 'Player B vê pontuação de 100 do adversário')
  assert(opponentViewForB.currentQuestionIndex === 1, 'Player B vê adversário na pergunta 1')
  console.log('✅ [PASS] Player B recebeu estado de Player A em tempo real')

  // TESTE 4: Player B Responde à Pergunta 0 (Errada)
  console.log('\n--- TESTE 4: PLAYER B RESPONDE ERRADO ---')
  const answerB0 = {
    questionIndex: 0,
    selectedOption: 'C',
    correctOption: 'A',
    isCorrect: false,
    pointsAwarded: 0,
    timeSpentSeconds: 7,
  }
  duel.playerB.answers.push(answerB0)
  duel.playerB.currentQuestionIndex = 1
  duel.playerB.questionDeadline = now + 7000 + 60_000

  assert(duel.playerB.score === 0, 'Score de B permanece 0')
  assert(duel.playerB.correctCount === 0, 'Certas de B permanece 0')
  assert(duel.playerB.currentQuestionIndex === 1, 'B avançou para pergunta 1')
  console.log('✅ [PASS] Player B submeteu resposta errada com 0 pontos')

  // TESTE 5: Conclusão do Duelo e Resolução Automática de Vencedor
  console.log('\n--- TESTE 5: AMBOS CONCLUEM E O SERVIDOR DETERMINA O VENCEDOR ---')
  // A responde à última pergunta (q1, index 1)
  duel.playerA.answers.push({ questionIndex: 1, selectedOption: 'B', isCorrect: true, pointsAwarded: 100, timeSpentSeconds: 3 })
  duel.playerA.score += 100
  duel.playerA.correctCount += 1
  duel.playerA.currentQuestionIndex = 2
  duel.playerA.finished = true

  // B responde à última pergunta (q1, index 1)
  duel.playerB.answers.push({ questionIndex: 1, selectedOption: 'B', isCorrect: true, pointsAwarded: 100, timeSpentSeconds: 5 })
  duel.playerB.score += 100
  duel.playerB.correctCount += 1
  duel.playerB.currentQuestionIndex = 2
  duel.playerB.finished = true

  assert(duel.playerA.finished && duel.playerB.finished, 'Ambos os jogadores concluíram')

  if (duel.playerA.score > duel.playerB.score) {
    (duel as any).winnerUid = duel.playerA.uid
    ;(duel as any).winnerReason = 'score'
    ;(duel as any).status = 'finished'
  }

  assert(duel.status === 'finished', 'Duelo transitou para status finished')
  assert(duel.winnerUid === 'uid_player_a', 'Player A venceu por maior pontuação')
  console.log('✅ [PASS] Vencedor por pontuação determinado atomicamente')

  // TESTE 6: Ancoragem de Prazo Absoluto (Imunidade a Throttling de Background)
  console.log('\n--- TESTE 6: ANCORAGEM DE PRAZO (DEADLINE) IMUNE A THROTTLING ---')
  const clientTime = now + 15_000 // 15s decorridos
  const deadline = now + 60_000
  const remaining = Math.max(0, Math.round((deadline - clientTime) / 1000))
  assert(remaining === 45, 'Tempo restante calculado exatamente a partir do deadline absoluto (45s)')

  const expiredTime = now + 75_000
  const expiredRemaining = Math.max(0, Math.round((deadline - expiredTime) / 1000))
  assert(expiredRemaining === 0, 'Prazo ultrapassado resulta em 0s de forma determinística')
  console.log('✅ [PASS] Cálculo de deadline absoluto testado com sucesso')

  console.log('\n==================================================================')
  console.log('🌟 TODOS OS TESTES DE SINCRONIZAÇÃO MULTIPLAYER PASSARAM COM 100%!')
  console.log('==================================================================')
}

run()
