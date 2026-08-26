/**
 * Auditoria Completa de Taxonomia (Categorias e Subcategorias) vs Perguntas
 */

const fs = require('fs')
const path = require('path')
const ts = require('typescript')

function requireTs(filePath) {
  const code = fs.readFileSync(filePath, 'utf8')
  const result = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
  })
  const m = { exports: {} }
  const customRequire = (id) => {
    if (id.startsWith('@/')) {
      const resolved = path.join(__dirname, '..', id.replace('@/', ''))
      if (fs.existsSync(resolved + '.ts')) return requireTs(resolved + '.ts')
      if (fs.existsSync(resolved + '.tsx')) return requireTs(resolved + '.tsx')
      if (fs.existsSync(resolved + '.json')) return JSON.parse(fs.readFileSync(resolved + '.json', 'utf8'))
      if (fs.existsSync(resolved)) {
        if (fs.statSync(resolved).isDirectory()) {
          if (fs.existsSync(path.join(resolved, 'index.ts'))) return requireTs(path.join(resolved, 'index.ts'))
        }
        return JSON.parse(fs.readFileSync(resolved, 'utf8'))
      }
    }
    if (id.endsWith('.json')) {
      const resolved = path.resolve(path.dirname(filePath), id)
      return JSON.parse(fs.readFileSync(resolved, 'utf8'))
    }
    return require(id)
  }
  const fn = new Function('require', 'exports', 'module', '__filename', '__dirname', result.outputText)
  fn(customRequire, m.exports, m, filePath, path.dirname(filePath))
  return m.exports
}

console.log('=== AUDITORIA COMPLETA DE TAXONOMIA E RUNTIME ===\n')

const categoriesModule = requireTs(path.join(__dirname, '..', 'lib/categories-data.ts'))
const { MAIN_CATEGORIES, normalizeCategorySlug } = categoriesModule

console.log(`1. Catálogo Oficial: ${MAIN_CATEGORIES.length} Categorias Principais:`)

let totalCatalogSubthemes = 0
for (const cat of MAIN_CATEGORIES) {
  totalCatalogSubthemes += cat.subcategories.length
  console.log(`   - ${cat.name} (${cat.slug}): ${cat.subcategories.length} subcategorias`)
}
console.log(`   Total de Subcategorias no Catálogo: ${totalCatalogSubthemes}\n`)

// Carregar QuestionRegistry
const registryModule = requireTs(path.join(__dirname, '..', 'lib/question-system/registry.ts'))
const registry = registryModule.QuestionRegistry.getInstance()
const allQuestions = registry.getAllQuestions()

console.log(`2. QuestionRegistry: ${allQuestions.length} perguntas carregadas e indexadas.`)

// Mapeamento Taxonómico
const taxonomyReport = []
let totalFuncionais = 0

for (const cat of MAIN_CATEGORIES) {
  const catThemeQuestions = registry.getTemaCompleto(cat.slug)
  const catReport = {
    categoriaId: cat.id,
    categoriaSlug: cat.slug,
    categoriaNome: cat.name,
    totalPerguntasTema: catThemeQuestions.length,
    subcategorias: [],
  }

  for (const sub of cat.subcategories) {
    const subSlug = normalizeCategorySlug(sub.id || sub.name)
    const subQuestions = registry.getBySubtheme(cat.slug, subSlug)
    totalFuncionais += subQuestions.length

    catReport.subcategorias.push({
      subcategoriaId: sub.id,
      subcategoriaNome: sub.name,
      subcategoriaSlug: subSlug,
      perguntasFuncionais: subQuestions.length,
      sampleIds: subQuestions.slice(0, 3).map(q => q.id),
    })
  }
  taxonomyReport.push(catReport)
}

console.log(`\n3. Resumo por Categoria e Subcategorias no Runtime:`)
for (const cat of taxonomyReport) {
  const subZero = cat.subcategorias.filter(s => s.perguntasFuncionais === 0).length
  const subWithQs = cat.subcategorias.filter(s => s.perguntasFuncionais > 0).length
  console.log(`📁 ${cat.categoriaNome} (${cat.categoriaSlug}): ${cat.totalPerguntasTema} Qs no Tema | Subtemas: ${subWithQs} com perguntas, ${subZero} sem perguntas`)
}

// Gravar relatório detalhado
const auditOutputPath = path.join(__dirname, '..', 'data/question-runtime-audit.json')
fs.writeFileSync(auditOutputPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  totalQuestionsInRegistry: allQuestions.length,
  totalThemes: MAIN_CATEGORIES.length,
  totalSubthemes: totalCatalogSubthemes,
  themes: taxonomyReport
}, null, 2))

console.log(`\n✓ Relatório gravado em data/question-runtime-audit.json`)
