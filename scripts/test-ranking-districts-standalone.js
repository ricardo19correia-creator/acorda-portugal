const ALL_DISTRICTS_LIST = [
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
    const district = ALL_DISTRICTS_LIST[(i - 1) % ALL_DISTRICTS_LIST.length];
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
      displayName,
      district,
      level,
      xp,
      wins: Math.round(level * 4 + ((i * 13) % 20)),
    });
  }
  return list;
}

const NPC_CATALOG = generateNPCs();

console.log('=== TESTE DE COBERTURA DOS 20 DISTRITOS NO RANKING E MAPA ===\n');

const distMap = {};
ALL_DISTRICTS_LIST.forEach(d => distMap[d] = { count: 0, totalXp: 0, players: [] });

NPC_CATALOG.forEach(npc => {
  distMap[npc.district].count++;
  distMap[npc.district].totalXp += npc.xp;
  distMap[npc.district].players.push(npc);
});

// Simular Utilizador Humano Real em Vila Real (Riky Moreira)
const humanUser = {
  uid: 'user_riky',
  displayName: 'Riky Moreira',
  district: 'Vila Real',
  level: 11,
  xp: 204673,
  wins: 15,
};

distMap['Vila Real'].count++;
distMap['Vila Real'].totalXp += humanUser.xp;
distMap['Vila Real'].players.push(humanUser);

let allValid = true;
ALL_DISTRICTS_LIST.forEach(d => {
  const stat = distMap[d];
  const isValid = stat && stat.count >= 5 && stat.totalXp > 0;
  if (!isValid) allValid = false;

  // Ordenar jogadores do distrito
  stat.players.sort((a, b) => b.xp - a.xp);
  const leader = stat.players[0];

  console.log(` - Distrito: ${d.padEnd(18, ' ')} | Jogadores: ${stat.count} | XP: ${stat.totalXp.toLocaleString('pt-PT').padStart(11, ' ')} XP | Líder: ${leader.displayName} (${leader.xp.toLocaleString('pt-PT')} XP) ${isValid ? '✅' : '❌'}`);
});

console.log('\nTodos os 20 Distritos Ativos e Preenchidos:', allValid ? '✅ SIM (100% OK)' : '❌ NÃO');
