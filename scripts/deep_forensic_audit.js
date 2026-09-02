const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

function loadJson(relPath) {
  const p = path.join(rootDir, relPath);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return null;
  }
}

// 1. Load taxonomy from lib/categories-data.ts
// We'll read MAIN_CATEGORIES and subcategories directly or parse them
const categoriesDataRaw = fs.readFileSync(path.join(rootDir, 'lib/categories-data.ts'), 'utf8');

// Let's create a JS representation of MAIN_CATEGORIES
// We can extract them cleanly
function cleanSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeCategorySlug(rawNameOrSlug) {
  const map = {
    'portugal': 'portugal',
    'história': 'historia',
    'historia': 'historia',
    'história de portugal': 'historia',
    'geografia': 'geografia',
    'geografia de portugal': 'geografia',
    'cultura': 'cultura',
    'cultura portuguesa': 'cultura',
    'cultura & tradições': 'cultura',
    'cultura e tradições': 'cultura',
    'gastronomia': 'gastronomia',
    'gastronomia portuguesa': 'gastronomia',
    'desporto': 'desporto',
    'desporto português': 'desporto',
    'futebol': 'futebol-portugues',
    'futebol português': 'futebol-portugues',
    'futebol-portugues': 'futebol-portugues',
    'música': 'musica',
    'musica': 'musica',
    'música portuguesa': 'musica',
    'cinema e televisão': 'cinema-tv',
    'cinema & televisão': 'cinema-tv',
    'cinema-tv': 'cinema-tv',
    'ciência e tecnologia': 'ciencia-tecnologia',
    'ciencia-tecnologia': 'ciencia-tecnologia',
    'ciência & física': 'ciencia-tecnologia',
    'tecnologia & informática': 'ciencia-tecnologia',
    'personalidades': 'personalidades',
    'personalidades portuguesas': 'personalidades',
    'atualidade': 'atualidade',
    'atualidade — portugal agora': 'atualidade',
    'portugal político': 'portugal-politico',
    'portugal-politico': 'portugal-politico',
    'empresas portuguesas': 'empresas-portuguesas',
    'empresas-portuguesas': 'empresas-portuguesas',
    'desafio visual': 'desafio-visual',
    'desafio-visual': 'desafio-visual',
    'modo maluco': 'modo-maluco',
    'modo-maluco': 'modo-maluco',
    'humor': 'humor',
    'mundo': 'mundo',
    'história mundial': 'mundo',
    'geografia mundial': 'mundo',
    'cultura geral': 'mundo',
  };

  const clean = (rawNameOrSlug || '').toLowerCase().trim();
  return map[clean] || cleanSlug(clean);
}

// 2. Load all raw files
const categoryFiles = [
  { slug: 'portugal', file: 'lib/data/categories/portugal.json' },
  { slug: 'futebol-portugues', file: 'lib/data/categories/futebol-portugues.json' },
  { slug: 'atualidade', file: 'lib/data/categories/atualidade.json' },
  { slug: 'portugal-politico', file: 'lib/data/categories/portugal-politico.json' },
  { slug: 'empresas-portuguesas', file: 'lib/data/categories/empresas-portuguesas.json' },
  { slug: 'historia', file: 'lib/data/categories/historia.json' },
  { slug: 'geografia', file: 'lib/data/categories/geografia.json' },
  { slug: 'ciencia-tecnologia', file: 'lib/data/categories/ciencia-tecnologia.json' },
  { slug: 'cultura', file: 'lib/data/categories/cultura.json' },
  { slug: 'gastronomia', file: 'lib/data/categories/gastronomia.json' },
  { slug: 'personalidades', file: 'lib/data/categories/personalidades.json' },
  { slug: 'mundo', file: 'lib/data/categories/mundo.json' },
  { slug: 'desporto', file: 'lib/data/categories/desporto.json' },
  { slug: 'humor', file: 'lib/data/categories/humor.json' },
  { slug: 'musica', file: 'lib/data/categories/musica.json' },
  { slug: 'cinema-tv', file: 'lib/data/categories/cinema-tv.json' },
  { slug: 'desafio-visual', file: 'lib/data/categories/desafio-visual.json' },
  { slug: 'modo-maluco', file: 'lib/data/categories/modo-maluco.json' },
];

const externalFiles = [
  { slug: 'desafio-nacional', file: 'src/data/questions_desafio_nacional.json' },
  { slug: 'perguntas-vila-real', file: 'data/perguntas_vila_real_500.json' },
  { slug: 'perguntas-modo-maluco-5000', file: 'data/perguntas_modo_maluco_5000.json' },
  { slug: 'questions-json', file: 'lib/data/questions.json' },
  { slug: 'portugal-50', file: 'lib/data/Portugal.json' },
  { slug: 'questions-backup', file: 'lib/data/questions-backup.json' },
];

// Let's run source analysis
console.log('=== 1. SOURCE ANALYSIS ===');
const sourceCounts = {};
for (const cf of categoryFiles) {
  const d = loadJson(cf.file);
  sourceCounts[cf.file] = d ? d.length : 0;
}
for (const ef of externalFiles) {
  const d = loadJson(ef.file);
  sourceCounts[ef.file] = d ? d.length : 0;
}

console.log(JSON.stringify(sourceCounts, null, 2));

// Check batch files in data/batches
const batchDir = path.join(rootDir, 'data/batches');
let batchQuestions = [];
if (fs.existsSync(batchDir)) {
  const bfiles = fs.readdirSync(batchDir).filter(f => f.endsWith('.json'));
  for (const bf of bfiles) {
    const d = loadJson(path.join('data/batches', bf));
    if (Array.isArray(d)) {
      batchQuestions.push(...d.map(q => ({ ...q, _batchFile: bf })));
    }
  }
}
console.log(`Batches in data/batches: ${batchQuestions.length} questions across 95 files.`);

// Cross-check: Are batch questions already inside lib/data/categories/?
let batchInCat = 0;
let batchNotInCat = 0;
const catQuestionsMap = new Map();
for (const cf of categoryFiles) {
  const d = loadJson(cf.file) || [];
  for (const q of d) {
    const promptKey = String(q.pergunta || q.question || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').trim();
    if (promptKey) catQuestionsMap.set(promptKey, q);
    if (q.id) catQuestionsMap.set(String(q.id).toLowerCase(), q);
  }
}

for (const bq of batchQuestions) {
  const promptKey = String(bq.pergunta || bq.question || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').trim();
  const idKey = String(bq.id || '').toLowerCase();
  if (catQuestionsMap.has(promptKey) || catQuestionsMap.has(idKey)) {
    batchInCat++;
  } else {
    batchNotInCat++;
  }
}
console.log(`Batch questions already in categories: ${batchInCat}, new/unmerged: ${batchNotInCat}`);

// Check questions.json: What is inside lib/data/questions.json?
const qJson = loadJson('lib/data/questions.json') || [];
let qJsonInCat = 0;
let qJsonInDN = 0;
let qJsonInVR = 0;
let qJsonInMM5000 = 0;
let qJsonUnique = 0;

const dnData = loadJson('src/data/questions_desafio_nacional.json') || [];
const dnMap = new Map();
for (const q of dnData) {
  const p = String(q.question || q.pergunta || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').trim();
  if (p) dnMap.set(p, q);
  if (q.id) dnMap.set(String(q.id).toLowerCase(), q);
}

const vrData = loadJson('data/perguntas_vila_real_500.json') || [];
const vrMap = new Map();
for (const q of vrData) {
  const p = String(q.question || q.pergunta || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').trim();
  if (p) vrMap.set(p, q);
  if (q.id) vrMap.set(String(q.id).toLowerCase(), q);
}

const mm5000Data = loadJson('data/perguntas_modo_maluco_5000.json') || [];
const mm5000Map = new Map();
for (const q of mm5000Data) {
  const p = String(q.question || q.pergunta || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').trim();
  if (p) mm5000Map.set(p, q);
  if (q.id) mm5000Map.set(String(q.id).toLowerCase(), q);
}

for (const q of qJson) {
  const p = String(q.question || q.pergunta || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').trim();
  const idKey = String(q.id || '').toLowerCase();
  if (catQuestionsMap.has(p) || catQuestionsMap.has(idKey)) {
    qJsonInCat++;
  } else if (dnMap.has(p) || dnMap.has(idKey)) {
    qJsonInDN++;
  } else if (vrMap.has(p) || vrMap.has(idKey)) {
    qJsonInVR++;
  } else if (mm5000Map.has(p) || mm5000Map.has(idKey)) {
    qJsonInMM5000++;
  } else {
    qJsonUnique++;
  }
}

console.log(`lib/data/questions.json (12017 total):`);
console.log(`  - Overlap with Category Files: ${qJsonInCat}`);
console.log(`  - Overlap with Desafio Nacional: ${qJsonInDN}`);
console.log(`  - Overlap with Vila Real: ${qJsonInVR}`);
console.log(`  - Overlap with MM 5000: ${qJsonInMM5000}`);
console.log(`  - Unique to questions.json: ${qJsonUnique}`);

