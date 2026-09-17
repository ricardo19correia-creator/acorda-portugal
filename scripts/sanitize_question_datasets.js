const fs = require('fs');
const path = require('path');

function cleanQuestionPrompt(text) {
  if (!text) return '';
  let cleaned = String(text).trim();

  let prev = '';
  let iterations = 0;
  while (prev !== cleaned && iterations < 10) {
    prev = cleaned;
    iterations++;

    // 1. Remove bracketed / parenthesized tags: [História #123], [Cultura], [#123], [ID: 123], [Nível 2], (História #123)
    cleaned = cleaned.replace(/^\[\s*(?:[A-Za-zÀ-ÿ0-9_\s\-\/]+#\d+|#\d+|ID[:\s]*#?\w+|N[íi]vel\s*\w+|Dificuldade\s*\w+|Quest[aã]o\s*#?\d*|Pergunta\s*#?\d*|[A-Za-zÀ-ÿ\s]+)\s*\]\s*[-–—:.]*\s*/i, '');
    cleaned = cleaned.replace(/^\(\s*(?:[A-Za-zÀ-ÿ0-9_\s\-\/]+#\d+|#\d+|ID[:\s]*#?\w+|N[íi]vel\s*\w+|Dificuldade\s*\w+|Quest[aã]o\s*#?\d*|Pergunta\s*#?\d*)\s*\)\s*[-–—:.]*\s*/i, '');

    // 2. Remove category with #number and separator: "História #345:", "Cultura #123 -", "Ciência e Tecnologia #11:", "Portugal Questão #160:"
    cleaned = cleaned.replace(/^[A-Za-zÀ-ÿ0-9_\s\-\/]+?#\d+\s*[:\-–—.]\s*/i, '');

    // 3. Remove generic Pergunta / Questão / Modo Maluco / Desafio Visual / Nível / Dificuldade prefixes:
    cleaned = cleaned.replace(/^(?:Modo\s+Maluco|Desafio\s+Visual|Desafio\s+Nacional|Categoria|Tema|Subtema|T[óo]pico|Pergunta|Quest[aã]o)\s*(?:#?\d+)?\s*[:\-–—.]\s*/i, '');
    cleaned = cleaned.replace(/^(?:N[íi]vel|Nivel|Dificuldade)\s*(?:[:\-–—.]\s*)?(?:#?\d+|F[áa]cil|Normal|M[ée]dio|Dif[íi]cil|Mestre)?\s*[:\-–—.]\s*/i, '');

    // 4. Remove standalone ID / #number prefixes:
    cleaned = cleaned.replace(/^(?:ID|Ref|C[óo]digo)\s*[:#\s]*\w+\s*[:\-–—.]\s*/i, '');
    cleaned = cleaned.replace(/^#\d+\s*[:\-–—.]\s*/, '');

    // 5. Trim leading punctuation and spaces
    cleaned = cleaned.replace(/^[:\-–—.\s]+/, '').trim();
  }

  return cleaned;
}

const filesToSanitize = [];

// 1. All categories in lib/data/categories/
const catDir = path.join(__dirname, '..', 'lib', 'data', 'categories');
if (fs.existsSync(catDir)) {
  for (const f of fs.readdirSync(catDir)) {
    if (f.endsWith('.json')) {
      filesToSanitize.push(path.join(catDir, f));
    }
  }
}

// 2. Specific json question databases
const extraFiles = [
  path.join(__dirname, '..', 'lib', 'data', 'questions.json'),
  path.join(__dirname, '..', 'data', 'perguntas_modo_maluco_5000.json'),
  path.join(__dirname, '..', 'data', 'perguntas_vila_real_500.json'),
  path.join(__dirname, '..', 'data', 'questions_missing_sources.json')
];

for (const ef of extraFiles) {
  if (fs.existsSync(ef)) {
    filesToSanitize.push(ef);
  }
}

let totalProcessed = 0;
let totalCleaned = 0;

for (const filePath of filesToSanitize) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const isArray = Array.isArray(data);
    const list = isArray ? data : (data.questions || []);

    let fileModified = 0;
    for (const item of list) {
      totalProcessed++;
      if (item.question) {
        const cleaned = cleanQuestionPrompt(item.question);
        if (cleaned !== item.question) {
          item.question = cleaned;
          fileModified++;
          totalCleaned++;
        }
      }
      if (item.pergunta) {
        const cleaned = cleanQuestionPrompt(item.pergunta);
        if (cleaned !== item.pergunta) {
          item.pergunta = cleaned;
          fileModified++;
          totalCleaned++;
        }
      }
    }

    if (fileModified > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`[OK] Sanitized ${fileModified} questions in ${path.relative(path.join(__dirname, '..'), filePath)}`);
    } else {
      console.log(`[OK] Already clean: ${path.relative(path.join(__dirname, '..'), filePath)}`);
    }
  } catch (err) {
    console.error(`[ERROR] Processing ${filePath}:`, err.message);
  }
}

console.log(`\n=== SANITIZATION COMPLETE ===`);
console.log(`Total questions checked: ${totalProcessed}`);
console.log(`Total question prompts cleaned: ${totalCleaned}`);
