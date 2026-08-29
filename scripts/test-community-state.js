const { getCommunityState, OFFLINE_THRESHOLD_MS } = require('../lib/presence.ts');
const { getActiveNPCs } = require('../lib/npc-system/npc-schedule-engine.ts');
const { OFFICIAL_20_DISTRICTS } = require('../lib/npc-system/npc-catalog.ts');

console.log('=== TESTE DE INVARIANTES MATEMÁTICAS DO COMMUNITY STATE ===\n');

// 1. Teste da Curva de 24 Horas
console.log('--- 1. Teste da Curva 24 Horas em Europe/Lisbon ---');
const testHours = [
  { hour: 2, name: 'Madrugada (02:00)', expected: 5 },
  { hour: 7, name: 'Início da Manhã (07:00)', expected: 8 },
  { hour: 10, name: 'Manhã (10:00)', expected: 12 },
  { hour: 13, name: 'Almoço (13:00)', expected: 18 },
  { hour: 16, name: 'Tarde (16:00)', expected: 14 },
  { hour: 19, name: 'Fim de Tarde (19:00)', expected: 20 },
  { hour: 21, name: 'Horário Nobre (21:30)', expected: 26 },
  { hour: 23, name: 'Noite (23:30)', expected: 12 },
];

let curvePass = true;
testHours.forEach(t => {
  const d = new Date();
  d.setHours(t.hour, 30, 0, 0);
  const { activeNpcs, npcCount } = getActiveNPCs(d);
  const ok = npcCount === t.expected;
  if (!ok) curvePass = false;
  console.log(`[${t.name.padEnd(26, ' ')}] Ativos: ${npcCount} (Esperado: ${t.expected}) ${ok ? '✅' : '❌'}`);
});

// 2. Teste de Invariantes Matemáticas de Agregação
console.log('\n--- 2. Teste de Invariantes Matemáticas de Presença ---');

const now = Date.now();
const mockHumanDocs = [
  {
    userId: 'human_user_1',
    online: true,
    lastSeen: now - 5000,
    activity: 'playing',
    district: 'Porto',
    level: 12,
    xp: 280000,
    username: 'Ricardo Silva',
  },
  {
    userId: 'human_user_2',
    online: true,
    lastSeen: now - 12000,
    activity: 'duel',
    district: 'Lisboa',
    level: 7,
    xp: 65000,
    username: 'Inês Costa',
  },
  {
    userId: 'human_user_3',
    online: true,
    lastSeen: now - 20000,
    activity: 'browsing',
    district: 'Faro',
    level: 3,
    xp: 8500,
    username: 'Tiago Santos',
  },
  {
    userId: 'human_user_offline',
    online: false,
    lastSeen: now - 60000,
    activity: 'browsing',
    district: 'Braga',
    level: 1,
    xp: 0,
    username: 'Offline User',
  }
];

const testDate = new Date();
testDate.setHours(13, 0, 0, 0); // 18 NPCs

const state = getCommunityState(mockHumanDocs, testDate, 'human_user_1');

console.log('Resultados do getCommunityState:');
console.log(` - humanOnline: ${state.humanOnline} (Esperado: 3)`);
console.log(` - npcOnline: ${state.npcOnline} (Esperado: 18)`);
console.log(` - totalVisibleOnline: ${state.totalVisibleOnline} (Esperado: 21)`);
console.log(` - participants.length: ${state.participants.length} (Esperado: 21)`);

// Teste Invariante 1: totalVisibleOnline === humanOnline + npcOnline
const inv1 = state.totalVisibleOnline === state.humanOnline + state.npcOnline;
console.log(`\nInvariante 1 [totalVisibleOnline === humanOnline + npcOnline]: ${inv1 ? '✅ PASSOU' : '❌ FALHOU'}`);

// Teste Invariante 2: SUM(byDistrict.total) === totalVisibleOnline
const sumDistrictTotal = Object.values(state.byDistrict).reduce((acc, d) => acc + d.total, 0);
const inv2 = sumDistrictTotal === state.totalVisibleOnline;
console.log(`Invariante 2 [SUM(byDistrict.total) === totalVisibleOnline]: ${sumDistrictTotal} === ${state.totalVisibleOnline} ${inv2 ? '✅ PASSOU' : '❌ FALHOU'}`);

// Teste Invariante 3: SUM(byDistrict.humans) === humanOnline
const sumDistrictHumans = Object.values(state.byDistrict).reduce((acc, d) => acc + d.humans, 0);
const inv3 = sumDistrictHumans === state.humanOnline;
console.log(`Invariante 3 [SUM(byDistrict.humans) === humanOnline]: ${sumDistrictHumans} === ${state.humanOnline} ${inv3 ? '✅ PASSOU' : '❌ FALHOU'}`);

// Teste Invariante 4: SUM(byDistrict.npcs) === npcOnline
const sumDistrictNpcs = Object.values(state.byDistrict).reduce((acc, d) => acc + d.npcs, 0);
const inv4 = sumDistrictNpcs === state.npcOnline;
console.log(`Invariante 4 [SUM(byDistrict.npcs) === npcOnline]: ${sumDistrictNpcs} === ${state.npcOnline} ${inv4 ? '✅ PASSOU' : '❌ FALHOU'}`);

// Teste Invariante 5: Participante atual identificado
const currentUserParticipant = state.participants.find(p => p.isCurrentUser);
const inv5 = currentUserParticipant && currentUserParticipant.id === 'human_user_1';
console.log(`Invariante 5 [Utilizador Atual Identificado]: ${inv5 ? '✅ PASSOU' : '❌ FALHOU'}`);

if (curvePass && inv1 && inv2 && inv3 && inv4 && inv5) {
  console.log('\n🌟 TODOS OS TESTES DE COMMUNITY STATE PASSARAM COM SUCESSO! 🌟');
  process.exit(0);
} else {
  console.error('\n❌ FALHA NOS TESTES DE COMMUNITY STATE');
  process.exit(1);
}
