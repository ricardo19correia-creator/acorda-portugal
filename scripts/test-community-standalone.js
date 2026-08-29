// Teste puro em Node.js de validação das invariantes de CommunityState e Curva 24h

const OFFICIAL_20_DISTRICTS = [
  'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
  'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
  'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
  'Viana do Castelo', 'Vila Real', 'Viseu', 'Açores', 'Madeira',
];

const PROGRESSION_LEVELS = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 2500 },
  { level: 3, xpRequired: 7500 },
  { level: 4, xpRequired: 15000 },
  { level: 5, xpRequired: 25000 },
  { level: 6, xpRequired: 40000 },
  { level: 7, xpRequired: 60000 },
  { level: 8, xpRequired: 85000 },
  { level: 9, xpRequired: 115000 },
  { level: 10, xpRequired: 150000 },
  { level: 11, xpRequired: 200000 },
  { level: 12, xpRequired: 275000 },
  { level: 13, xpRequired: 375000 },
  { level: 14, xpRequired: 500000 },
  { level: 15, xpRequired: 650000 },
  { level: 16, xpRequired: 825000 },
  { level: 17, xpRequired: 1050000 },
  { level: 18, xpRequired: 1350000 },
  { level: 19, xpRequired: 1750000 },
  { level: 20, xpRequired: 2250000 },
  { level: 21, xpRequired: 3000000 },
];

function calculateLevelProgress(xp) {
  const safeXp = Math.max(0, typeof xp === 'number' && !isNaN(xp) ? xp : 0);
  let currentTierIndex = 0;
  for (let i = PROGRESSION_LEVELS.length - 1; i >= 0; i--) {
    if (safeXp >= PROGRESSION_LEVELS[i].xpRequired) {
      currentTierIndex = i;
      break;
    }
  }
  return { currentLevel: PROGRESSION_LEVELS[currentTierIndex] };
}

const FIRST_NAMES = [
  'Rui', 'Inês', 'Tiago', 'Catarina', 'Gonçalo', 'Beatriz', 'Afonso', 'Mariana',
  'Diogo', 'Matilde', 'Martim', 'Leonor', 'Rodrigo', 'Sofia', 'Duarte', 'Laura',
  'Tomás', 'Francisca', 'Guilherme', 'Carolina', 'Henrique', 'Margarida', 'Bernardo',
  'Alice', 'Vasco', 'Clara', 'Gabriel', 'Diana', 'Salvador', 'Madalena',
  'Lourenço', 'Joana', 'Santiago', 'Rita', 'Pedro', 'Camila', 'Francisco',
  'Constança', 'Manuel', 'Mafalda', 'Simão', 'Sara', 'João', 'Marta',
  'Lucas', 'Bárbara', 'António', 'Helena', 'Dinis', 'Teresa',
];

const LAST_NAMES = [
  'Mendes', 'Carvalho', 'Fernandes', 'Neves', 'Silva', 'Lopes', 'Rocha',
  'Santos', 'Ribeiro', 'Sousa', 'Pinto', 'Castro', 'Ferreira', 'Pereira',
  'Martins', 'Alves', 'Dias', 'Vaz', 'Cunha', 'Coelho', 'Gomes', 'Teixeira',
  'Costa', 'Moreira', 'Rodrigues', 'Nunes', 'Marques', 'Almeida', 'Cardoso',
  'Vieira', 'Barbosa', 'Barros', 'Ramos', 'Reis', 'Monteiro', 'Borges',
];

function generateNPCs() {
  const list = [];
  for (let i = 1; i <= 100; i++) {
    const firstName = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 11) % LAST_NAMES.length];
    const displayName = `${firstName} ${lastName}`;
    const district = OFFICIAL_20_DISTRICTS[(i - 1) % OFFICIAL_20_DISTRICTS.length];
    const level = 2 + ((i * 7) % 19);

    const tierIndex = PROGRESSION_LEVELS.findIndex((t) => t.level === level);
    const currentTier = tierIndex >= 0 ? PROGRESSION_LEVELS[tierIndex] : PROGRESSION_LEVELS[1];
    const nextTier = tierIndex >= 0 && tierIndex < PROGRESSION_LEVELS.length - 1 ? PROGRESSION_LEVELS[tierIndex + 1] : null;
    const baseXp = currentTier.xpRequired;
    const span = nextTier ? Math.max(100, nextTier.xpRequired - baseXp - 100) : 50000;
    const progressFraction = ((i * 37) % 85) / 100;
    const xp = Math.round(baseXp + span * progressFraction);
    const npcId = `npc_${String(i).padStart(3, '0')}`;

    list.push({
      id: npcId,
      npcId,
      playerType: 'npc',
      isNpc: true,
      name: displayName,
      displayName,
      district,
      level,
      xp,
      rating: 850 + Math.round((level / 21) * 1200 + ((i * 19) % 80)),
    });
  }
  return list;
}

const NPC_CATALOG = generateNPCs();

function getActiveNPCs(date = new Date()) {
  let hour = 12;
  let minute = 0;

  try {
    const formatter = new Intl.DateTimeFormat('pt-PT', {
      timeZone: 'Europe/Lisbon',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const rawHour = parseInt(parts.find((p) => p.type === 'hour')?.value || '12', 10);
    hour = (isNaN(rawHour) ? date.getHours() : rawHour) % 24;
    const rawMin = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    minute = isNaN(rawMin) ? date.getMinutes() : rawMin;
  } catch {
    hour = date.getHours() % 24;
    minute = date.getMinutes();
  }

  const fiveMinBucket = Math.floor(minute / 5);

  let targetCount = 12;
  if (hour >= 0 && hour < 6) {
    targetCount = 5; // 00:00–06:00
  } else if (hour >= 6 && hour < 9) {
    targetCount = 8; // 06:00–09:00
  } else if (hour >= 9 && hour < 12) {
    targetCount = 12; // 09:00–12:00
  } else if (hour >= 12 && hour < 14) {
    targetCount = 18; // 12:00–14:00
  } else if (hour >= 14 && hour < 18) {
    targetCount = 14; // 14:00–18:00
  } else if (hour >= 18 && hour < 20) {
    targetCount = 20; // 18:00–20:00
  } else if (hour >= 20 && hour < 23) {
    targetCount = 26; // 20:00–23:00
  } else {
    targetCount = 12; // 23:00–00:00
  }

  const offset = (hour * 12 + fiveMinBucket) % NPC_CATALOG.length;
  const selectedNpcs = [];
  for (let i = 0; i < targetCount; i++) {
    const index = (offset + i * 3) % NPC_CATALOG.length;
    selectedNpcs.push(NPC_CATALOG[index]);
  }

  return {
    activeNpcs: selectedNpcs,
    npcCount: selectedNpcs.length,
    targetCount,
  };
}

function getCommunityState(rawHumanDocs = [], date = new Date(), currentSessionOrUid) {
  const nowMs = date.getTime();
  const OFFLINE_THRESHOLD_MS = 45000;

  const activeHumansMap = new Map();
  rawHumanDocs.forEach((doc) => {
    if (!doc || !doc.userId) return;
    const isOnline = doc.online !== false;
    const isRecent = typeof doc.lastSeen === 'number' && nowMs - doc.lastSeen <= OFFLINE_THRESHOLD_MS;
    if (isOnline && isRecent) {
      activeHumansMap.set(doc.userId, doc);
    }
  });

  const humanOnlineList = [];
  activeHumansMap.forEach((doc) => {
    const rawDist = (doc.district || '').trim();
    const matchedDist = OFFICIAL_20_DISTRICTS.find((d) => d.toLowerCase() === rawDist.toLowerCase()) || 'Lisboa';
    humanOnlineList.push({
      id: doc.userId,
      name: doc.username || 'Jogador',
      district: matchedDist,
      level: doc.level || 1,
      xp: doc.xp || 0,
      playerType: 'human',
      isCurrentUser: Boolean(currentSessionOrUid && doc.userId === currentSessionOrUid),
      lastSeen: doc.lastSeen,
    });
  });

  const { activeNpcs, npcCount } = getActiveNPCs(date);
  const npcOnlineList = activeNpcs.map((npc) => ({
    id: npc.id,
    name: npc.displayName,
    district: npc.district,
    level: npc.level,
    xp: npc.xp,
    playerType: 'npc',
    isCurrentUser: false,
    lastSeen: nowMs,
  }));

  const humanOnline = humanOnlineList.length;
  const npcOnline = npcCount;
  const totalVisibleOnline = humanOnline + npcOnline;

  const participants = [...humanOnlineList, ...npcOnlineList];

  const byDistrict = {};
  for (const d of OFFICIAL_20_DISTRICTS) {
    byDistrict[d] = { name: d, total: 0, humans: 0, npcs: 0 };
  }

  participants.forEach((p) => {
    const rawDist = (p.district || '').trim();
    const matched = OFFICIAL_20_DISTRICTS.find((d) => d.toLowerCase() === rawDist.toLowerCase()) || 'Lisboa';
    byDistrict[matched].total += 1;
    if (p.playerType === 'human') {
      byDistrict[matched].humans += 1;
    } else {
      byDistrict[matched].npcs += 1;
    }
  });

  return {
    humanOnline,
    npcOnline,
    totalVisibleOnline,
    participants,
    byDistrict,
  };
}

console.log('=== TESTE DE INVARIANTES MATEMÁTICAS E VALIDAÇÃO DE NÍVEIS ===\n');

// 1. Validar calculateLevelProgress(npc.xp).currentLevel.level === npc.level
let xpLevelMismatchCount = 0;
NPC_CATALOG.forEach(npc => {
  const calc = calculateLevelProgress(npc.xp).currentLevel.level;
  if (calc !== npc.level) {
    xpLevelMismatchCount++;
    console.error(`❌ Mismatch no NPC ${npc.id}: level=${npc.level}, calculatedLevel=${calc}, xp=${npc.xp}`);
  }
});

console.log(`Validação de Nível vs XP nos 100 NPCs: ${xpLevelMismatchCount === 0 ? '✅ 100/100 PERFEITOS' : `❌ ${xpLevelMismatchCount} MISMATCHES`}`);

// 2. Teste da Curva de 24 Horas usando horários locais de Lisboa (WEST UTC+1 / WET UTC+0)
console.log('\n--- Teste da Curva 24 Horas em Europe/Lisbon ---');
const testHours = [
  { hourIso: '2026-08-27T02:30:00+01:00', name: 'Madrugada (02:30)', expected: 5 },
  { hourIso: '2026-08-27T07:30:00+01:00', name: 'Início da Manhã (07:30)', expected: 8 },
  { hourIso: '2026-08-27T10:30:00+01:00', name: 'Manhã (10:30)', expected: 12 },
  { hourIso: '2026-08-27T13:30:00+01:00', name: 'Almoço (13:30)', expected: 18 },
  { hourIso: '2026-08-27T16:30:00+01:00', name: 'Tarde (16:30)', expected: 14 },
  { hourIso: '2026-08-27T19:30:00+01:00', name: 'Fim de Tarde (19:30)', expected: 20 },
  { hourIso: '2026-08-27T21:30:00+01:00', name: 'Horário Nobre (21:30)', expected: 26 },
  { hourIso: '2026-08-27T23:30:00+01:00', name: 'Noite (23:30)', expected: 12 },
];

let curvePass = true;
testHours.forEach(t => {
  const d = new Date(t.hourIso);
  const { npcCount } = getActiveNPCs(d);
  const ok = npcCount === t.expected;
  if (!ok) curvePass = false;
  console.log(`[${t.name.padEnd(26, ' ')}] Ativos: ${npcCount} (Esperado: ${t.expected}) ${ok ? '✅' : '❌'}`);
});

// 3. Teste de Invariantes
console.log('\n--- Teste de Invariantes Matemáticas ---');
const testDate = new Date('2026-08-27T13:30:00+01:00'); // 18 NPCs
const nowMs = testDate.getTime();

const mockHumanDocs = [
  { userId: 'u1', online: true, lastSeen: nowMs - 1000, district: 'Porto', level: 5, xp: 25000, username: 'User1' },
  { userId: 'u2', online: true, lastSeen: nowMs - 5000, district: 'Lisboa', level: 10, xp: 150000, username: 'User2' },
  { userId: 'u3', online: true, lastSeen: nowMs - 10000, district: 'Faro', level: 2, xp: 3000, username: 'User3' },
  { userId: 'u4_offline', online: false, lastSeen: nowMs - 80000, district: 'Braga', level: 1, xp: 0, username: 'User4' },
];

const state = getCommunityState(mockHumanDocs, testDate, 'u1');

const inv1 = state.totalVisibleOnline === state.humanOnline + state.npcOnline;
const sumTotal = Object.values(state.byDistrict).reduce((acc, d) => acc + d.total, 0);
const inv2 = sumTotal === state.totalVisibleOnline;
const sumHumans = Object.values(state.byDistrict).reduce((acc, d) => acc + d.humans, 0);
const inv3 = sumHumans === state.humanOnline;
const sumNpcs = Object.values(state.byDistrict).reduce((acc, d) => acc + d.npcs, 0);
const inv4 = sumNpcs === state.npcOnline;

console.log(` - humanOnline: ${state.humanOnline} (3 humanos ativos)`);
console.log(` - npcOnline: ${state.npcOnline} (18 NPCs ativos às 13:30 em Lisboa)`);
console.log(` - totalVisibleOnline: ${state.totalVisibleOnline} (21 total)`);
console.log(` - Invariante 1 (total === human + npc): ${inv1 ? '✅' : '❌'}`);
console.log(` - Invariante 2 (SUM(byDistrict.total) === totalVisibleOnline): ${sumTotal} === ${state.totalVisibleOnline} ${inv2 ? '✅' : '❌'}`);
console.log(` - Invariante 3 (SUM(byDistrict.humans) === humanOnline): ${sumHumans} === ${state.humanOnline} ${inv3 ? '✅' : '❌'}`);
console.log(` - Invariante 4 (SUM(byDistrict.npcs) === npcOnline): ${sumNpcs} === ${state.npcOnline} ${inv4 ? '✅' : '❌'}`);

if (xpLevelMismatchCount === 0 && curvePass && inv1 && inv2 && inv3 && inv4) {
  console.log('\n🌟 100% DOS TESTES MATEMÁTICOS E DE ARQUITETURA PASSARAM COM SUCESSO! 🌟');
} else {
  process.exit(1);
}
