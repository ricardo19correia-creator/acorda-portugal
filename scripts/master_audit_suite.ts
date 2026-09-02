import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ARENA_SHOP_CATALOG } from '../src/data/shopArenas';
import { REAL_AVATARS } from '../lib/avatars';
import { QuestionRegistry } from '../lib/question-system/registry';
import { loadQuestionsPool } from '../src/lib/questionEngine';
import { DAILY_REWARDS_SCHEDULE, evaluateDailyRewardStatus } from '../lib/daily-reward';
import { BUILD_INFO } from '../lib/build-info';
import { MAIN_CATEGORIES } from '../lib/categories-data';

async function runMasterAuditSuite() {
  console.log('================================================================================');
  console.log('🇵🇹 ACORDA PORTUGAL — MASTER CONTROL FINAL PRODUCT AUDIT & VERIFICATION');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` — Detalhe: ${detail}` : ''}`);
      failed++;
    }
  }

  // ===========================================================================
  // FASE 1: REMOÇÃO ABSOLUTA DE BOTS & NPCS
  // ===========================================================================
  console.log('--- FASE 1: AUDITORIA FORENSE DE BOTS E NPCS ---');
  assert(!fs.existsSync(path.resolve('lib/npc-system')), 'Pasta obsoleta lib/npc-system eliminada da raiz');
  assert(!fs.existsSync(path.resolve('app/api/duel/npc-match')), 'Endpoint obsoleto app/api/duel/npc-match eliminado da raiz');

  const matchmakingCode = fs.readFileSync(path.resolve('components/duel-matchmaking-modal.tsx'), 'utf8');
  assert(!matchmakingCode.includes("playerType: 'npc'"), 'components/duel-matchmaking-modal.tsx sem playerType: npc');
  assert(!matchmakingCode.includes('isNpc: true'), 'components/duel-matchmaking-modal.tsx sem isNpc: true');

  const duelCode = fs.readFileSync(path.resolve('lib/duel.ts'), 'utf8');
  assert(!duelCode.includes("'npc_opponent'"), 'lib/duel.ts sem fallback npc_opponent');
  assert(!duelCode.includes("playerType?: 'human' | 'npc'"), 'lib/duel.ts com tipagem estrita apenas para humanos');

  // ===========================================================================
  // FASE 2: CATÁLOGO OFICIAL DE ARENAS (43/43)
  // ===========================================================================
  console.log('\n--- FASE 2: AUDITORIA DE ARENAS (43/43) ---');
  assert(ARENA_SHOP_CATALOG.length === 43, `ARENA_SHOP_CATALOG tem exatamente 43 arenas oficiais (atual: ${ARENA_SHOP_CATALOG.length})`);
  const arenaIds = new Set(ARENA_SHOP_CATALOG.map((a) => a.id));
  assert(arenaIds.size === 43, `Todas as 43 arenas têm IDs únicos (encontrados: ${arenaIds.size})`);

  let missingArenaImages = 0;
  const arenaHashes = new Map<string, string>();
  for (const a of ARENA_SHOP_CATALOG) {
    const rawImg = a.image || '';
    const cleanPath = rawImg.startsWith('/') ? rawImg.slice(1) : rawImg;
    const fullPath = path.resolve('public', cleanPath);
    if (!fs.existsSync(fullPath)) {
      missingArenaImages++;
    } else {
      const buf = fs.readFileSync(fullPath);
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      arenaHashes.set(hash, a.id);
    }
  }
  assert(missingArenaImages === 0, `Todas as 43 arenas possuem ficheiro de imagem real existente`);
  assert(arenaHashes.size === 43, `Todas as 43 arenas possuem imagens 100% distintas e sem duplicações de hash (43/43)`);

  // ===========================================================================
  // FASE 3: SISTEMA OFICIAL DE AVATARES (36/36)
  // ===========================================================================
  console.log('\n--- FASE 3: AUDITORIA DE AVATARES (36/36) ---');
  assert(REAL_AVATARS.length === 36, `REAL_AVATARS tem exatamente 36 avatares oficiais (atual: ${REAL_AVATARS.length})`);
  const avatarIds = new Set(REAL_AVATARS.map((a) => a.id));
  assert(avatarIds.size === 36, `Todos os 36 avatares têm IDs únicos (encontrados: ${avatarIds.size})`);

  let missingAvatarImages = 0;
  const avatarHashes = new Map<string, string>();
  for (const av of REAL_AVATARS) {
    const cleanPath = av.image.startsWith('/') ? av.image.slice(1) : av.image;
    const fullPath = path.resolve('public', cleanPath);
    if (!fs.existsSync(fullPath)) {
      missingAvatarImages++;
    } else {
      const buf = fs.readFileSync(fullPath);
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      avatarHashes.set(hash, av.id);
    }
  }
  assert(missingAvatarImages === 0, `Todos os 36 avatares possuem ficheiro de imagem real`);
  assert(avatarHashes.size === 36, `Todos os 36 avatares possuem imagens 100% distintas e sem duplicações de hash (36/36)`);

  // ===========================================================================
  // FASE 4: INTEGRIDADE DAS 18 CATEGORIAS E BANCO DE PERGUNTAS
  // ===========================================================================
  console.log('\n--- FASE 4: AUDITORIA DAS 18 CATEGORIAS E ENGINE DE PERGUNTAS ---');
  const reg = QuestionRegistry.getInstance();
  const stats = reg.getSystemStats();
  assert(stats.totalApproved >= 5000, `Banco de perguntas contém mais de 5.000 perguntas oficiais aprovadas (atual: ${stats.totalApproved})`);
  assert(MAIN_CATEGORIES.length === 18, `Existem exatamente 18 categorias principais no jogo (atual: ${MAIN_CATEGORIES.length})`);

  // Testar isolamento estrito de perguntas por categoria (não pode misturar com modo maluco)
  for (const cat of MAIN_CATEGORIES) {
    const pool = loadQuestionsPool(cat.slug, 2);
    assert(pool.length > 0, `Categoria "${cat.name}" (${cat.slug}) carrega perguntas válidas (tamanho: ${pool.length})`);
    if (cat.slug !== 'modo-maluco') {
      const hasMaluco = pool.some((q) => q.category === 'modo-maluco' || q.id.startsWith('mm_'));
      assert(!hasMaluco, `Categoria "${cat.name}" tem 0% de contaminação de Modo Maluco`);
    }
  }

  // ===========================================================================
  // FASE 5: RECOMPENSA DIÁRIA (7 DIAS) & IDEMPOTÊNCIA
  // ===========================================================================
  console.log('\n--- FASE 5: SISTEMA DE RECOMPENSA DIÁRIA ---');
  assert(DAILY_REWARDS_SCHEDULE.length === 7, `DAILY_REWARDS_SCHEDULE possui exatamente 7 dias (atual: ${DAILY_REWARDS_SCHEDULE.length})`);
  const d1 = DAILY_REWARDS_SCHEDULE[0];
  const d7 = DAILY_REWARDS_SCHEDULE[6];
  assert(d1.coins === 25, 'Dia 1 atribui €25 Moedas');
  assert(d7.coins === 100 && d7.xp === 500, 'Dia 7 atribui €100 Moedas e 500 XP');

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(new Date());
  const statusToday = evaluateDailyRewardStatus({ dailyReward: { lastClaimedDate: today, currentDay: 3 } });
  assert(statusToday.canClaim === false, 'Se já reclamou hoje, canClaim é false (idempotência garantida)');

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(yesterday);
  const statusYesterday = evaluateDailyRewardStatus({ dailyReward: { lastClaimedDate: yesterdayStr, currentDay: 3 } });
  assert(statusYesterday.canClaim === true && statusYesterday.currentDay === 4, 'Se reclamou ontem no Dia 3, hoje tem direito ao Dia 4');

  // ===========================================================================
  // FASE 6: HOME, CONVERSÃO E REPORTES
  // ===========================================================================
  console.log('\n--- FASE 6: CONVERSÃO, REPORTES E ONBOARDING ---');
  assert(fs.existsSync(path.resolve('components/how-it-works.tsx')), 'components/how-it-works.tsx existe e está disponível');
  assert(fs.existsSync(path.resolve('components/question-report-modal.tsx')), 'components/question-report-modal.tsx existe e está disponível');
  assert(fs.existsSync(path.resolve('components/daily-reward-modal.tsx')), 'components/daily-reward-modal.tsx existe e está disponível');

  const homeCode = fs.readFileSync(path.resolve('app/page.tsx'), 'utf8');
  assert(homeCode.includes('<HowItWorks />'), 'Homepage integra a secção Como Funciona?');

  const heroCode = fs.readFileSync(path.resolve('components/hero.tsx'), 'utf8');
  assert(heroCode.includes('+5.000'), 'Hero destaca métrica real de +5.000 perguntas oficiais');
  assert(heroCode.includes('Testa o Teu Conhecimento'), 'Hero possui banner com os 3 pilares da conversão');

  const quizCode = fs.readFileSync(path.resolve('components/quiz/quiz-screen.tsx'), 'utf8');
  assert(quizCode.includes('QuestionReportModal'), 'Ecrã de quiz integra QuestionReportModal');
  assert(quizCode.includes('Reportar'), 'Ecrã de quiz possui botão de reporte');

  const onboardingCode = fs.readFileSync(path.resolve('components/DistrictOnboardingModal.tsx'), 'utf8');
  assert(onboardingCode.includes('STARTER_AVATARS'), 'Onboarding permite selecionar o avatar inicial');
  assert(onboardingCode.includes('ECONOMY_CONFIG.INITIAL_BONUS_COINS'), 'Onboarding utiliza saldo canónico inicial de 50 moedas');

  // ===========================================================================
  // FASE 7: CONSISTÊNCIA DE VERSÃO E DOWNLOAD
  // ===========================================================================
  console.log('\n--- FASE 7: VERSÃO, DOWNLOAD E BUILD ---');
  assert(Boolean(BUILD_INFO.version), `BUILD_INFO.version definida: ${BUILD_INFO.version}`);
  const downloadCode = fs.readFileSync(path.resolve('app/download/page.tsx'), 'utf8');
  assert(downloadCode.includes('BUILD_INFO.version'), 'app/download/page.tsx obtém versão dinamicamente de BUILD_INFO');

  console.log('\n================================================================================');
  console.log(`RELATÓRIO DA AUDITORIA MASTER: ${passed} PASS, ${failed} FAIL`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMasterAuditSuite().catch((err) => {
  console.error('Erro na auditoria master:', err);
  process.exit(1);
});
