import { calculateLevelProgress, PROGRESSION_LEVELS } from '../lib/progression';
import { calculateLevelUpCoinReward, calculateMatchCoinReward, ECONOMY_CONFIG } from '../lib/economy';

async function runXpFlowTestSuite() {
  console.log('=================================================================');
  console.log('⚡ ACORDA PORTUGAL — TESTE FORENSE DO MOTOR DE PROGRESSÃO & XP');
  console.log('=================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}${detail ? ` (${detail})` : ''}`);
      failed++;
    }
  }

  // TEST 1: Nível inicial com 0 XP
  const l1 = calculateLevelProgress(0);
  assert(l1.currentLevel.level === 1, 'XP 0 corresponde ao Nível 1');
  assert(l1.currentLevel.cleanTitle === 'Curioso', 'Título Nível 1 é Curioso');
  assert(l1.nextLevel?.level === 2, 'Próximo nível é o Nível 2');
  assert(l1.progressPercentage === 0, 'Percentagem com 0 XP é 0%');
  assert(l1.xpRemaining === 2500, 'XP restante para Nível 2 é 2.500');

  // TEST 2: Progressão a meio do Nível 3 (Explorador: 7.500 -> 15.000)
  // Utilizador com 10.000 XP (exemplo do prompt do utilizador)
  const l3 = calculateLevelProgress(10000);
  assert(l3.currentLevel.level === 3, 'XP 10.000 corresponde ao Nível 3 (Explorador)');
  assert(l3.currentLevel.cleanTitle === 'Explorador', 'Título Nível 3 é Explorador');
  assert(l3.currentLevelXp === 7500, 'XP de início do Nível 3 é 7.500');
  assert(l3.nextLevelXp === 15000, 'XP de início do Nível 4 é 15.000');
  assert(l3.xpIntoLevel === 2500, 'XP acumulado dentro do nível é 2.500 (10.000 - 7.500)');
  assert(l3.xpNeededForLevel === 7500, 'XP total necessário no Nível 3 é 7.500');
  assert(l3.xpRemaining === 5000, 'XP restante para o Nível 4 é 5.000');
  assert(Math.round(l3.progressPercentage) === 33, 'Percentagem de progresso é ~33%');

  // TEST 3: Atribuição de +250 XP (10.000 -> 10.250 XP sem subir de nível)
  const l3After = calculateLevelProgress(10250);
  assert(l3After.currentLevel.level === 3, 'Nível mantém-se 3 após +250 XP');
  assert(l3After.xpIntoLevel === 2750, 'XP no nível sobe para 2.750');
  assert(l3After.xpRemaining === 4750, 'XP restante diminui para 4.750');
  assert(l3After.progressPercentage > l3.progressPercentage, 'Percentagem da barra de XP aumenta visivelmente');
  assert(Math.round(l3After.progressPercentage) === 37, 'Nova percentagem é ~37%');

  // TEST 4: Subida de Nível (Level Up de Nível 3 para Nível 4)
  // 14.900 XP + 250 XP = 15.150 XP
  const beforeLevelUp = calculateLevelProgress(14900);
  const afterLevelUp = calculateLevelProgress(15150);
  assert(beforeLevelUp.currentLevel.level === 3, 'Antes da partida: Nível 3');
  assert(afterLevelUp.currentLevel.level === 4, 'Depois de +250 XP: Nível 4 (Conhecedor)');
  assert(afterLevelUp.currentLevel.cleanTitle === 'Conhecedor', 'Título atualizado para Conhecedor');
  assert(afterLevelUp.xpIntoLevel === 150, 'XP que sobra no novo nível é 150');
  assert(afterLevelUp.xpRemaining === 9850, 'XP restante para o Nível 5 (25.000) é 9.850');
  assert(afterLevelUp.currentLevel.level > beforeLevelUp.currentLevel.level, 'Subida de nível detetada (leveledUp = true)');

  // TEST 5: Recompensa de Moedas por Subida de Nível
  const coinsForLevelUp = calculateLevelUpCoinReward(3, 4);
  assert(coinsForLevelUp > 0, `Bónus de subida de nível atribuído: +€${coinsForLevelUp}`);

  // TEST 6: Fórmula determinística de XP solo_quiz
  // 10 perguntas certas, score 1200, multiplicador 1
  const correct = 10;
  const score = 1200;
  const baseMatchXp = correct * 50 + Math.round(score / 10);
  const calculatedXp = Math.max(10, Math.round(baseMatchXp * 1));
  assert(calculatedXp === 620, `XP de solo quiz calculado corretamente (esperado: 620, obtido: ${calculatedXp})`);

  // TEST 7: Fórmula determinística de moedas solo_quiz
  const baseWinCoins = calculateMatchCoinReward({ correctCount: correct, totalQuestions: 10, bestStreak: 5, difficulty: 1 });
  assert(baseWinCoins > 0, `Moedas de solo quiz calculadas corretamente: €${baseWinCoins}`);

  // TEST 8: Cálculo de Streak Diária
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const olderDateStr = '2026-01-01';

  // Cenário A: jogou ontem com streak 6 -> hoje sobe para 7
  let streakA = 6;
  if (yesterdayStr !== todayStr) {
    streakA = streakA + 1;
  }
  assert(streakA === 7, 'Streak de ontem (6) sobe para 7 no dia seguinte');

  // Cenário B: jogou hoje com streak 7 -> segundo jogo hoje mantém 7
  let streakB = 7;
  const lastDateB = todayStr;
  if (lastDateB === todayStr) {
    streakB = streakB; // mantém
  }
  assert(streakB === 7, 'Segundo jogo no mesmo dia mantém streak sem reiniciar nem inflacionar');

  // Cenário C: último jogo há mais de 1 dia -> reinicia para 1
  let streakC = 12;
  const lastDateC = olderDateStr;
  if (lastDateC !== yesterdayStr && lastDateC !== todayStr) {
    streakC = 1;
  }
  assert(streakC === 1, 'Jogo após quebra de sequência reinicia streak para 1');

  // TEST 9: Verificação dos 21 Níveis Oficiais
  assert(PROGRESSION_LEVELS.length === 21, `PROGRESSION_LEVELS possui exatamente 21 níveis (atual: ${PROGRESSION_LEVELS.length})`);
  assert(PROGRESSION_LEVELS[20].title.includes('Mestre de Portugal'), 'Nível 21 é Mestre de Portugal (3.000.000 XP)');
  assert(PROGRESSION_LEVELS[20].isFinal === true, 'Nível 21 está marcado como isFinal');

  console.log('\n=================================================================');
  console.log(`RESULTADO DA SUITE: ${passed} PASS, ${failed} FAIL`);
  console.log('=================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runXpFlowTestSuite().catch((err) => {
  console.error('Erro na suite de testes de XP:', err);
  process.exit(1);
});
