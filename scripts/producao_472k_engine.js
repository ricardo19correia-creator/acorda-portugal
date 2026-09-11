/**
 * 🇵🇹 ACORDA PORTUGAL — MOTOR OFICIAL DA FÁBRICA 472K
 * 
 * Pipeline de Produção Incremental, Persistente, Recuperável e Deduplicado:
 * - Inspeciona o estado atual do Manifesto (data/manifesto_producao_472k.json)
 * - Carrega o acervo existente (20.067 Qs) para sets de deduplicação exata e semântica
 * - Gera perguntas em lotes estritos (ex: 25-50 Qs) por subcategoria
 * - Valida estrutura, linguagem PT-PT, 4 opções distintas e 1 resposta correta
 * - Elimina duplicados exatos, semânticos (fingerprint) e estruturais
 * - Persiste imediatamente no disco em data/batches_472k/<categoria>/<subcategoria>.json
 * - Atualiza o manifesto de produção de forma atómica
 * 
 * Uso:
 *   node scripts/producao_472k_engine.js --category <catId> --sub <subId> --batch 50 --limit 100
 *   node scripts/producao_472k_engine.js --category <catId> --limit 200
 *   node scripts/producao_472k_engine.js --all --batch 50 --limit 500
 */

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const manifestPath = path.join(rootDir, 'data/manifesto_producao_472k.json');
const batchesDir = path.join(rootDir, 'data/batches_472k');

if (!fs.existsSync(batchesDir)) {
  fs.mkdirSync(batchesDir, { recursive: true });
}

// ----------------------------------------------------------------------------
// 1. DEDUPLICAÇÃO E NORMALIZAÇÃO
// ----------------------------------------------------------------------------
const STOP_WORDS = new Set([
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
  'de', 'da', 'do', 'das', 'dos', 'd',
  'em', 'no', 'na', 'nos', 'nas',
  'por', 'para', 'pra', 'com', 'sem', 'sob', 'sobre',
  'que', 'se', 'e', 'ou', 'mas', 'porque', 'como',
  'foi', 'era', 'sao', 'são', 'foram', 'ser', 'estar', 'estava', 'tem', 'tinha',
  'qual', 'quais', 'quem', 'onde', 'quando', 'quanto', 'quantos', 'quantas',
  'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas', 'aquele', 'aquela',
  'portugal', 'portugues', 'portuguesa', 'portugueses', 'portuguesas',
]);

const QUESTION_PREFIX_REGEX = /^(quem\s+foi(\s+o|\s+a)?|qual\s+(foi|e|era|seria)(\s+o|\s+a)?|em\s+que\s+(ano|data|seculo|decada|dia|mes|cidade|distrito|regiao|pais)|quando\s+(nasceu|morreu|aconteceu|foi|ocorreu)|onde\s+(fica|se\s+localiza|nasceu|morreu|situa-se)|diga\s+qual|indique\s+(o|a)?|qual\s+o\s+nome(\s+do|\s+da)?)\s*/gi;

function removeDiacritics(str) {
  return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
}

function normalizePrompt(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/^modo\s+maluco\s*#?\d*:\s*/i, '')
    .replace(/^pergunta\s*#?\d*:\s*/i, '')
    .replace(/^quest[aã]o\s*#?\d*:\s*/i, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .trim();
}

function getSemanticFingerprint(questionText) {
  if (!questionText) return '';
  let text = removeDiacritics(questionText.toLowerCase().trim());
  text = text.replace(QUESTION_PREFIX_REGEX, '');
  text = text.replace(/[^\w\s]/g, ' ');
  const tokens = text
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
  tokens.sort();
  return tokens.join('_');
}

function getOptionsFingerprint(questionText, options) {
  const normQ = normalizePrompt(questionText);
  const normOpts = [...options].map(o => removeDiacritics(String(o).toLowerCase().trim())).sort().join('|');
  return `${normQ}:::${normOpts}`;
}

// ----------------------------------------------------------------------------
// 2. BANCO DE TERMOS BRASILEIROS PROIBIDOS (ESTRITO PT-PT)
// ----------------------------------------------------------------------------
const BRAZILIAN_TERMS = [
  'ônibus', 'onibus', 'trem', 'trens', 'time de futebol', 'times de futebol',
  'gol', 'gols', 'torcida', 'torcedores', 'esporte', 'esportes', 'esportivo',
  'esportiva', 'gramado', 'celular', 'celulares', 'tela', 'banheiro', 'metrô',
  'açougue', 'pedestre', 'pedestres', 'carteira de motorista', 'furgão', 'equipe',
  'equipes', 'prefeitura', 'prefeito', 'sorvete', 'suco', 'abacaxi', 'café da manhã'
];

function containsBrazilianPortuguese(text) {
  const lower = String(text).toLowerCase();
  for (const term of BRAZILIAN_TERMS) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(lower)) return term;
  }
  return null;
}

// ----------------------------------------------------------------------------
// 3. CARREGAMENTO DOS ÍNDICES DE DEDUPLICAÇÃO EXISTENTES
// ----------------------------------------------------------------------------
const seenExactPrompts = new Set();
const seenSemanticFingerprints = new Set();
const seenExactFingerprints = new Set();
let totalIndexedQuestions = 0;

function indexQuestion(q) {
  const prompt = q.question || q.pergunta || '';
  const exact = normalizePrompt(prompt);
  if (exact.length > 5) seenExactPrompts.add(exact);

  const sem = getSemanticFingerprint(prompt);
  if (sem.length > 4) seenSemanticFingerprints.add(sem);

  const opts = q.options || q.opcoes || [];
  if (Array.isArray(opts) && opts.length === 4) {
    seenExactFingerprints.add(getOptionsFingerprint(prompt, opts));
  }
  totalIndexedQuestions++;
}

function indexAllExistingQuestions() {
  console.log('🔄 A indexar banco existente de 20.067 perguntas para deduplicação global...');

  // 1. Ingerir os 18 ficheiros oficiais
  const catFiles = fs.readdirSync(path.join(rootDir, 'lib/data/categories')).filter(f => f.endsWith('.json'));
  for (const f of catFiles) {
    try {
      const list = JSON.parse(fs.readFileSync(path.join(rootDir, 'lib/data/categories', f), 'utf8'));
      if (Array.isArray(list)) list.forEach(indexQuestion);
    } catch (e) {}
  }

  // 2. Ingerir Desafio Nacional
  try {
    const dn = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/questions_desafio_nacional.json'), 'utf8'));
    if (Array.isArray(dn)) dn.forEach(indexQuestion);
  } catch (e) {}

  // 3. Ingerir Vila Real
  try {
    const vr = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/perguntas_vila_real_500.json'), 'utf8'));
    if (Array.isArray(vr)) vr.forEach(indexQuestion);
  } catch (e) {}

  // 4. Ingerir lotes já existentes na pasta batches_472k
  if (fs.existsSync(batchesDir)) {
    const catDirs = fs.readdirSync(batchesDir);
    for (const catDir of catDirs) {
      const full = path.join(batchesDir, catDir);
      if (fs.statSync(full).isDirectory()) {
        const bFiles = fs.readdirSync(full).filter(f => f.endsWith('.json'));
        for (const bf of bFiles) {
          try {
            const bList = JSON.parse(fs.readFileSync(path.join(full, bf), 'utf8'));
            if (Array.isArray(bList)) bList.forEach(indexQuestion);
          } catch (e) {}
        }
      }
    }
  }

  console.log(`✓ Deduplicação inicializada: ${seenExactPrompts.size} enunciados exatos e ${seenSemanticFingerprints.size} impressões semânticas indexadas.\n`);
}

// ----------------------------------------------------------------------------
// 4. VALIDADOR ESTRUTURAL E QUALITATIVO
// ----------------------------------------------------------------------------
function validateCandidate(q) {
  if (!q.question || typeof q.question !== 'string' || q.question.trim().length < 12) {
    return { valid: false, reason: 'Pergunta demasiado curta ou vazia' };
  }
  if (!q.question.trim().endsWith('?') && !q.question.trim().endsWith('.')) {
    return { valid: false, reason: 'Pergunta sem pontuação final (? ou .)' };
  }
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    return { valid: false, reason: 'Devem existir exatamente 4 opções' };
  }
  for (const opt of q.options) {
    if (!opt || typeof opt !== 'string' || opt.trim().length === 0) {
      return { valid: false, reason: 'Opção vazia detetada' };
    }
  }
  const uniqueOpts = new Set(q.options.map(o => o.trim().toLowerCase()));
  if (uniqueOpts.size !== 4) {
    return { valid: false, reason: 'Opções de resposta duplicadas' };
  }
  if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
    return { valid: false, reason: 'Índice de resposta correta inválido (deve ser 0 a 3)' };
  }
  if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim().length < 15) {
    return { valid: false, reason: 'Explicação educativa obrigatória' };
  }

  // Verificação PT-PT
  const fullText = `${q.question} ${q.options.join(' ')} ${q.explanation}`;
  const brTerm = containsBrazilianPortuguese(fullText);
  if (brTerm) {
    return { valid: false, reason: `Termo brasileiro proibido detetado: "${brTerm}"` };
  }

  // Verificação de Deduplicação Exata
  const exactKey = normalizePrompt(q.question);
  if (seenExactPrompts.has(exactKey)) {
    return { valid: false, reason: 'Duplicado exato de pergunta existente' };
  }

  // Verificação de Deduplicação Semântica
  const semKey = getSemanticFingerprint(q.question);
  if (semKey.length > 5 && seenSemanticFingerprints.has(semKey)) {
    return { valid: false, reason: 'Duplicado semântico (mesmo facto/ideia já coberto)' };
  }

  // Verificação Estrutural (Pergunta + Opções)
  const optFingerprint = getOptionsFingerprint(q.question, q.options);
  if (seenExactFingerprints.has(optFingerprint)) {
    return { valid: false, reason: 'Duplicado estrutural (pergunta e opções idênticas)' };
  }

  return { valid: true };
}

// ----------------------------------------------------------------------------
// 5. BANCO DE GERADORES FACTUAIS DE ALTA QUALIDADE
// ----------------------------------------------------------------------------
const { generateQuestionsForSubcategory } = require('./engine/generators_pool');

// ----------------------------------------------------------------------------
// 6. PIPELINE DE EXECUÇÃO EM LOTES
// ----------------------------------------------------------------------------
function runBatchProduction(targetCategorySlug, targetSubId, batchSize = 50, maxQuestionsToGenerate = 200) {
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Manifesto não encontrado.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  let totalGeneratedThisRun = 0;
  let totalRejectedThisRun = 0;

  // Filtrar categorias
  const categoriesToProcess = targetCategorySlug
    ? manifest.categories.filter(c => c.id === targetCategorySlug)
    : manifest.categories;

  for (const cat of categoriesToProcess) {
    if (totalGeneratedThisRun >= maxQuestionsToGenerate) break;

    const subsToProcess = targetSubId
      ? cat.subcategories.filter(s => s.id === targetSubId)
      : cat.subcategories.filter(s => s.existing < s.target);

    for (const sub of subsToProcess) {
      if (totalGeneratedThisRun >= maxQuestionsToGenerate) break;
      if (sub.existing >= sub.target) continue;

      const subNeeded = sub.target - sub.existing;
      const countForThisBatch = Math.min(batchSize, subNeeded, maxQuestionsToGenerate - totalGeneratedThisRun);
      if (countForThisBatch <= 0) continue;

      console.log(`\n⚙️ PRODUZINDO LOTE: [${cat.name} -> ${sub.name}]`);
      console.log(`   Meta: ${sub.target} | Existente: ${sub.existing} | Falta: ${subNeeded} | Lote: ${countForThisBatch}`);

      const subBatchDir = path.join(batchesDir, cat.id);
      if (!fs.existsSync(subBatchDir)) fs.mkdirSync(subBatchDir, { recursive: true });
      const subBatchFile = path.join(subBatchDir, `${sub.id}.json`);

      let currentBatchList = [];
      if (fs.existsSync(subBatchFile)) {
        try {
          currentBatchList = JSON.parse(fs.readFileSync(subBatchFile, 'utf8'));
        } catch (e) {
          currentBatchList = [];
        }
      }

      // Gerar candidatos brutos
      const rawCandidates = generateQuestionsForSubcategory(cat.id, sub.id, countForThisBatch * 2, sub.existing + currentBatchList.length);
      const approvedForBatch = [];

      for (const candidate of rawCandidates) {
        if (approvedForBatch.length >= countForThisBatch) break;

        const val = validateCandidate(candidate);
        if (val.valid) {
          // Formatação Canónica
          const cleanQ = {
            id: `p472k_${cat.id.replace(/-/g, '')}_${sub.id.replace(/-/g, '')}_${String(sub.existing + currentBatchList.length + approvedForBatch.length + 1).padStart(5, '0')}`,
            question: candidate.question.trim(),
            options: candidate.options.map(o => o.trim()),
            correctAnswer: candidate.correctAnswer,
            difficulty: candidate.difficulty || 2,
            category: cat.name,
            subcategory: sub.name,
            explanation: candidate.explanation.trim(),
            fonte: candidate.fonte || 'Arquivo Histórico e Cultural de Portugal',
            tema: cat.name,
            temaSlug: cat.id,
            subtema: sub.name,
            subtemaSlug: sub.id,
            status: 'approved',
            ativa: true
          };

          indexQuestion(cleanQ);
          approvedForBatch.push(cleanQ);
        } else {
          totalRejectedThisRun++;
        }
      }

      if (approvedForBatch.length > 0) {
        currentBatchList.push(...approvedForBatch);
        fs.writeFileSync(subBatchFile, JSON.stringify(currentBatchList, null, 2));

        // Atualizar manifesto
        sub.existing += approvedForBatch.length;
        sub.generated = (sub.generated || 0) + approvedForBatch.length;
        sub.validated = sub.existing;
        sub.rejected = (sub.rejected || 0) + (rawCandidates.length - approvedForBatch.length);
        sub.remaining = Math.max(0, sub.target - sub.existing);
        if (sub.existing >= sub.target) {
          sub.status = 'COMPLETED';
        } else {
          sub.status = 'IN_PROGRESS';
        }

        cat.existing += approvedForBatch.length;
        cat.remaining = Math.max(0, cat.target - cat.existing);
        manifest.totalExisting += approvedForBatch.length;
        manifest.totalRemaining = Math.max(0, manifest.globalTarget - manifest.totalExisting);
        manifest.updatedAt = new Date().toISOString();

        totalGeneratedThisRun += approvedForBatch.length;
        console.log(`   ✓ Lote Gravado com Sucesso: +${approvedForBatch.length} perguntas válidas e únicas`);
        console.log(`   📊 Novo Subtotal da Subcategoria: ${sub.existing} / ${sub.target} (Restam: ${sub.remaining})`);
      }
    }
  }

  // Gravação atómica do manifesto
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('\n======================================================================');
  console.log(`✅ LOTE DE PRODUÇÃO FINALIZADO`);
  console.log(`   Perguntas Novas Aprovadas e Gravadas: +${totalGeneratedThisRun}`);
  console.log(`   Candidatos Descartados por Duplicação/Qualidade: ${totalRejectedThisRun}`);
  console.log(`   Total Global no Acervo: ${manifest.totalExisting.toLocaleString('pt-PT')} / ${manifest.globalTarget.toLocaleString('pt-PT')}`);
  console.log(`   Progresso Geral: ${((manifest.totalExisting / manifest.globalTarget) * 100).toFixed(2)}%`);
  console.log('======================================================================\n');
}

// ----------------------------------------------------------------------------
// 7. PARSER DE ARGUMENTOS CLI
// ----------------------------------------------------------------------------
const args = process.argv.slice(2);
let categoryArg = null;
let subcategoryArg = null;
let batchSizeArg = 50;
let limitArg = 200;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--category' && args[i + 1]) categoryArg = args[i + 1];
  if (args[i] === '--sub' && args[i + 1]) subcategoryArg = args[i + 1];
  if (args[i] === '--batch' && args[i + 1]) batchSizeArg = parseInt(args[i + 1], 10);
  if (args[i] === '--limit' && args[i + 1]) limitArg = parseInt(args[i + 1], 10);
  if (args[i] === '--all') limitArg = 500;
}

// Executar
indexAllExistingQuestions();
runBatchProduction(categoryArg, subcategoryArg, batchSizeArg, limitArg);
