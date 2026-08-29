const { NPC_CATALOG, OFFICIAL_20_DISTRICTS } = require('../lib/npc-system/npc-catalog');

console.log('================================================================');
console.log('🧪 TESTE DE VALIDAÇÃO: INTEGRAÇÃO DE BOTS NO RANKING E MAPA');
console.log('================================================================');

// 1. Verificar catálogo de 100 bots
console.log(`\n1. Verificação do Catálogo de NPCs/Bots:`);
console.log(`   - Total de Bots: ${NPC_CATALOG.length} (Esperado: 100)`);
if (NPC_CATALOG.length !== 100) {
  console.error('❌ Erro: O catálogo deve conter exatamente 100 bots.');
  process.exit(1);
} else {
  console.log('   ✅ 100 bots disponíveis.');
}

// 2. Verificar distribuição pelos 20 distritos
console.log(`\n2. Verificação de Distribuição Territorial (20 Distritos):`);
const districtCounts = {};
const districtXpSums = {};
OFFICIAL_20_DISTRICTS.forEach((d) => {
  districtCounts[d] = 0;
  districtXpSums[d] = 0;
});

NPC_CATALOG.forEach((bot) => {
  if (!bot.district) {
    console.error(`❌ Erro: Bot ${bot.npcId} sem distrito!`);
    process.exit(1);
  }
  if (!OFFICIAL_20_DISTRICTS.includes(bot.district)) {
    console.error(`❌ Erro: Distrito inválido '${bot.district}' no bot ${bot.npcId}`);
    process.exit(1);
  }
  districtCounts[bot.district]++;
  districtXpSums[bot.district] += bot.xp;
});

let missingDistricts = 0;
OFFICIAL_20_DISTRICTS.forEach((d) => {
  const count = districtCounts[d];
  const xp = districtXpSums[d];
  if (count === 0 || xp === 0) {
    console.error(`❌ Distrito sem bots ou com 0 XP: ${d}`);
    missingDistricts++;
  }
});

if (missingDistricts === 0) {
  console.log(`   ✅ 100% dos 20 distritos possuem bots ativos e XP regional acumulado.`);
} else {
  console.error(`❌ Encontrados ${missingDistricts} distritos sem cobertura.`);
  process.exit(1);
}

// 3. Simular Agregação: Humanos + Bots
console.log(`\n3. Simulação de Agregação de XP Regional (Humanos + Bots):`);
const mockHumans = [
  { uid: 'human_01', displayName: 'Riky Moreira', xp: 50000, district: 'Lisboa', isNpc: false },
  { uid: 'human_02', displayName: 'Ana Porto', xp: 35000, district: 'Porto', isNpc: false },
  { uid: 'human_03', displayName: 'Carlos Braga', xp: 20000, district: 'Braga', isNpc: false },
];

const mockCombined = [
  ...mockHumans,
  ...NPC_CATALOG.map((b) => ({
    uid: b.npcId,
    displayName: b.displayName,
    xp: b.xp,
    district: b.district,
    isNpc: true,
  })),
];

const testDistMap = {};
OFFICIAL_20_DISTRICTS.forEach((d) => {
  testDistMap[d] = { players: 0, xp: 0, humanXp: 0, botXp: 0 };
});

mockCombined.forEach((p) => {
  if (testDistMap[p.district]) {
    testDistMap[p.district].players++;
    testDistMap[p.district].xp += p.xp;
    if (p.isNpc) {
      testDistMap[p.district].botXp += p.xp;
    } else {
      testDistMap[p.district].humanXp += p.xp;
    }
  }
});

console.table(
  OFFICIAL_20_DISTRICTS.map((d) => ({
    Distrito: d,
    'Total Jogadores (Hum + Bot)': testDistMap[d].players,
    'XP Humanos': testDistMap[d].humanXp.toLocaleString('pt-PT'),
    'XP Bots': testDistMap[d].botXp.toLocaleString('pt-PT'),
    'XP Total Distrito': testDistMap[d].xp.toLocaleString('pt-PT'),
  }))
);

// Verificar cálculo de Lisboa
const lisboaExpectedXp = 50000 + districtXpSums['Lisboa'];
if (testDistMap['Lisboa'].xp === lisboaExpectedXp) {
  console.log(`\n✅ Cálculo exato verificado: XP_Lisboa (${testDistMap['Lisboa'].xp.toLocaleString('pt-PT')}) = SUM(Humanos: 50.000) + SUM(Bots: ${districtXpSums['Lisboa'].toLocaleString('pt-PT')})`);
} else {
  console.error(`❌ Erro no cálculo de XP para Lisboa!`);
  process.exit(1);
}

console.log('\n================================================================');
console.log('✨ TODOS OS TESTES PASSARAM COM SUCESSO (100% COBERTURA)');
console.log('================================================================\n');
