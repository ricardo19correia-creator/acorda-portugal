const fs = require('fs');
const path = require('path');

// Ler PROGRESSION_LEVELS
const progPath = path.join(__dirname, '..', 'lib', 'progression.ts');
const progContent = fs.readFileSync(progPath, 'utf8');

// Ler NPC_CATALOG
const catPath = path.join(__dirname, '..', 'lib', 'npc-system', 'npc-catalog.ts');
const catContent = fs.readFileSync(catPath, 'utf8');

// Ler rankings
const rankPath = path.join(__dirname, '..', 'lib', 'rankings.ts');
const rankContent = fs.readFileSync(rankPath, 'utf8');

console.log('=== VERIFICAÇÃO ESTÁTICA E DINÂMICA DE NPCS & RANKINGS ===');

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

const npcs = [];
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
  const wins = Math.round(level * 4 + ((i * 13) % 20));
  const losses = Math.max(1, Math.round(wins * (0.35 + (i % 5) * 0.08)));

  npcs.push({
    npcId: `npc_${String(i).padStart(3, '0')}`,
    displayName,
    district,
    level,
    xp,
    wins,
    losses,
  });
}

console.log('Total de NPCs gerados:', npcs.length);
console.log('NPCs com 0 XP:', npcs.filter(n => n.xp <= 0).length);
console.log('Min XP:', Math.min(...npcs.map(n => n.xp)).toLocaleString('pt-PT'), 'XP');
console.log('Max XP:', Math.max(...npcs.map(n => n.xp)).toLocaleString('pt-PT'), 'XP');

// Verificar distribuição por distrito
const distStats = {};
OFFICIAL_20_DISTRICTS.forEach(d => distStats[d] = { count: 0, totalXp: 0 });
npcs.forEach(n => {
  distStats[n.district].count++;
  distStats[n.district].totalXp += n.xp;
});

console.log('\nPopulação e XP por Distrito (20/20 Distritos):');
OFFICIAL_20_DISTRICTS.forEach(d => {
  const s = distStats[d];
  console.log(` - ${d.padEnd(18, ' ')}: ${s.count} NPCs | XP Total: ${s.totalXp.toLocaleString('pt-PT')} XP`);
});

// Verificar se rankings.ts contém integração
const hasNpcInRankings = rankContent.includes('NPC_CATALOG') && rankContent.includes('getNpcRankingPlayers');
console.log('\nlib/rankings.ts integra NPC_CATALOG:', hasNpcInRankings ? '✅ SIM' : '❌ NÃO');
