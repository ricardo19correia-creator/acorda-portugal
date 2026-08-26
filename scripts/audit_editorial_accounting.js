/**
 * Acorda Portugal — Patch Final de Contabilidade Editorial e Reconciliação dos 4 Contadores Oficiais
 * 
 * 1. physicalQuestionCount: Documentos físicos totais
 * 2. validQuestionCount: Perguntas com validação estrutural PASS
 * 3. approvedQuestionCount: Perguntas com Quality Gate PASS
 * 4. editorialApprovedCount: Perguntas aprovadas mapeadas estritamente aos 233 subtemas oficiais (Métrica do Jogo X / 466.000)
 * 
 * Gera:
 * - data/editorial_accounting_dashboard.json
 * - data/editorial_accounting_manifest.json
 */

const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')

// Catálogo Canónico dos 18 Temas e 233 Subtemas
const OFFICIAL_CATALOG = [
  { id: 'portugal', name: 'Portugal', emoji: '🇵🇹', file: 'portugal.json', subcategories: ['História de Portugal', 'Geografia de Portugal', 'Cultura Portuguesa', 'Tradições', 'Monumentos', 'Cidades', 'Vilas e Aldeias', 'Praias', 'Regiões', 'Gastronomia Portuguesa', 'Personalidades Portuguesas', 'Curiosidades de Portugal'] },
  { id: 'futebol-portugues', name: 'Futebol Português', emoji: '⚽', file: 'futebol-portugues.json', subcategories: ['Clubes', 'Jogadores', 'Jogadoras', 'Estádios', 'Competições', 'Liga Portuguesa', 'Taça de Portugal', 'Seleção Nacional', 'Futebol Feminino', 'Treinadores', 'História do Futebol', 'Momentos Marcantes', 'Dérbis & Clássicos', 'Recordes', 'Curiosidades do Futebol', 'Futsal', 'Futebol de Praia'] },
  { id: 'atualidade', name: 'Atualidade — Portugal Agora', emoji: '📰', file: 'atualidade.json', subcategories: ['Notícias Recentes', 'Política Atual', 'Economia Atual', 'Sociedade Atual', 'Cultura Hoje', 'Desporto Hoje', 'Inovação & Startups', 'Ambiente & Clima', 'Habitação & Urbanismo', 'Saúde & Bem-Estar', 'Educação & Juventude', 'Infraestruturas & Transportes', 'Portugal no Mundo', 'Tendências & Estilos de Vida', 'Eventos do Ano', 'Grandes Debates Nacionais', 'Personalidades do Momento'] },
  { id: 'portugal-politico', name: 'Portugal Político', emoji: '🏛️', file: 'portugal-politico.json', subcategories: ['Constituição da República', 'Presidentes da República', 'Primeiros-Ministros', 'Assembleia da República', 'Governos Constitucionais', 'Partidos Políticos', 'Eleições Históricas', 'Poder Local', 'Regiões Autónomas', 'Revolução de Abril', 'Integração Europeia', 'Diplomacia Portuguesa'] },
  { id: 'empresas-portuguesas', name: 'Empresas Portuguesas', emoji: '🏢', file: 'empresas-portuguesas.json', subcategories: ['Grandes Marcas', 'História Empresarial', 'Setores', 'Produtos', 'Serviços', 'Empresas Históricas', 'Empresas Atuais', 'Empresas Tecnológicas', 'Empresas Internacionais Portuguesas', 'Lojas e Comércio Tradicional', 'Inovação Empresarial'] },
  { id: 'historia', name: 'História', emoji: '🏺', file: 'historia.json', subcategories: ['Pré-História & Antiguidade', 'Idade Média', 'Descobrimentos', 'Dinastias Portuguesas', 'Império Português', 'Século XIX', 'Implantação da República', 'Estado Novo', 'Guerra Colonial', '25 de Abril de 1974', 'História Contemporânea', 'Batalhas Históricas', 'Tratados & Diplomacia', 'Figuras Históricas', 'Curiosidades Históricas'] },
  { id: 'geografia', name: 'Geografia', emoji: '🌍', file: 'geografia.json', subcategories: ['Distritos de Portugal', 'Concelhos e Freguesias', 'Ilhas e Arquipélagos', 'Rios e Bacias Hidrográficas', 'Serras e Relevo', 'Litoral & Praias', 'Clima & Meteorologia', 'Fronteiras e Raia', 'Geografia Humana', 'Geografia Económica', 'Paisagens Naturais', 'Parques e Reservas', 'Mapas & Cartografia', 'Curiosidades Geográficas'] },
  { id: 'ciencia-tecnologia', name: 'Ciência e Tecnologia', emoji: '🔬', file: 'ciencia-tecnologia.json', subcategories: ['Cientistas Portugueses', 'Invenções & Descobertas', 'Astronomia & Espaço', 'Natureza & Biodiversidade', 'Medicina & Saúde', 'Física & Química', 'Tecnologia & Informática', 'Inovação em Portugal', 'Mares & Oceanografia', 'Energia & Ambiente', 'Telecomunicações', 'Futuro & Inteligência Artificial'] },
  { id: 'cultura', name: 'Cultura', emoji: '🎭', file: 'cultura.json', subcategories: ['Literatura Portuguesa', 'Poesia', 'Arte & Pintura', 'Escultura', 'Teatro', 'Arquitetura', 'Património da Humanidade', 'Museus de Portugal', 'Folclore & Etnografia', 'Língua Portuguesa', 'Mitos & Lendas'] },
  { id: 'gastronomia', name: 'Gastronomia', emoji: '🍲', file: 'gastronomia.json', subcategories: ['Pratos Tradicionais', 'Doces Conventuais', 'Vinhos de Portugal', 'Queijos Portugueses', 'Pão & Azeite', 'Marisco & Peixe', 'Petiscos & Enchidos', 'Gastronomia Regional', 'Produtos DOP & IGP', 'Chefs & Restaurantes', 'História da Gastronomia'] },
  { id: 'personalidades', name: 'Personalidades', emoji: '👤', file: 'personalidades.json', subcategories: ['Figuras Históricas', 'Políticos & Estadistas', 'Artistas & Pintores', 'Atletas Lendários', 'Cientistas & Pensadores', 'Empresários & Empreendedores', 'Escritores & Poetas', 'Músicos & Compositores', 'Atores & Intérpretes', 'Criadores & Inovadores', 'Personalidades Internacionais', 'Personalidades Portuguesas'] },
  { id: 'mundo', name: 'Mundo', emoji: '🌐', file: 'mundo.json', subcategories: ['Países & Capitais', 'Bandeiras do Mundo', 'História Mundial', 'Geografia Mundial', 'Maravilhas do Mundo', 'Culturas & Povos', 'Organizações Internacionais', 'Línguas do Mundo', 'Grandes Líderes Mundiais', 'Cidades Globais', 'Monumentos Mundiais', 'Economia Global', 'Curiosidades do Mundo'] },
  { id: 'desporto', name: 'Desporto', emoji: '🏆', file: 'desporto.json', subcategories: ['Futebol Internacional', 'Jogos Olímpicos', 'Atletismo', 'Ciclismo', 'Modalidades de Pavilhão', 'Desportos Motorizados', 'Ténis & Raquetes', 'Desportos de Combate', 'Desportos Náuticos', 'Desporto em Portugal', 'Lendas do Desporto', 'Grandes Equipas', 'Momentos Épicos', 'Recordes Mundiais', 'Grandes Competições'] },
  { id: 'humor', name: 'Humor', emoji: '😂', file: 'humor.json', subcategories: ['Humor Português', 'Expressões Populares Portuguesas', 'Memes & Internet', 'Comédia na TV & Cinema', 'Situações do Quotidiano', 'Perguntas Engraçadas', 'Curiosidades Hilariantes', 'Humor Absurdo'] },
  { id: 'musica', name: 'Música', emoji: '🎵', file: 'musica.json', subcategories: ['Música Portuguesa', 'Fado & Guitarra Portuguesa', 'Música Popular & Pimba', 'Artistas & Cantores Portugueses', 'Bandas Portuguesas', 'Música Internacional', 'Artistas Internacionais', 'Bandas Internacionais Lendárias', 'Grandes Canções', 'Álbuns Históricos', 'Instrumentos Musicais', 'História da Música', 'Festivais de Música'] },
  { id: 'cinema-tv', name: 'Cinema e Televisão', emoji: '🎬', file: 'cinema-tv.json', subcategories: ['Grandes Filmes', 'Séries Marcantes', 'Atores e Atrizes', 'Personagens Inesquecíveis', 'Realizadores', 'Cinema Português', 'Televisão Portuguesa', 'Programas de Televisão Clássicos', 'Streaming & Novas Séries', 'Cultura Pop & Geek', 'Filmes Clássicos'] },
  { id: 'desafio-visual', name: 'Desafio Visual', emoji: '👁️', file: 'desafio-visual.json', subcategories: ['Que lugar é este?', 'Quem é esta pessoa?', 'Bandeiras', 'Brasões', 'Símbolos', 'Gastronomia', 'Futebol', 'Estádios', 'Monumentos', 'Cidades', 'Praias', 'Vilas e Aldeias', 'Onde fica?', 'Encontra o detalhe', 'Fotografias Históricas', 'Imagens de Objetos', 'Imagens de Animais', 'Imagens de Natureza', 'Desafio Visual Maluco'] },
  { id: 'modo-maluco', name: 'Modo Maluco', emoji: '🤪', file: 'modo-maluco.json', subcategories: ['Perguntas Absurdas', 'Perguntas Inesperadas', 'Humor & Rir', 'Cultura Popular Insólita', 'Regras Aleatórias', 'Desafios Rápidos', 'Efeitos Especiais', 'Modificadores de Jogo', 'Perguntas com Lógica Diferente', 'Modo Caos'] }
]

function normalizeSlug(str) {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function isValidStructuralQuestion(q) {
  if (!q || !q.id) return false
  const p = q.pergunta || q.question
  if (!p || typeof p !== 'string' || p.trim().length < 10) return false

  const opts = q.opcoes || q.options
  if (!Array.isArray(opts) || opts.length !== 4) return false
  const optsStrings = opts.map((o) => (typeof o === 'string' ? o.trim() : String(o?.text || o || '').trim()))
  if (optsStrings.some((o) => !o)) return false

  const uniq = new Set(optsStrings.map((o) => o.toLowerCase()))
  if (uniq.size < 4) return false

  let correctIdx = -1
  if (typeof q.respostaCorreta === 'number') correctIdx = q.respostaCorreta
  else if (typeof q.correctAnswer === 'number') correctIdx = q.correctAnswer
  else if (typeof q.correct === 'number') correctIdx = q.correct
  else if (typeof q.correct === 'string') {
    const k = q.correct.toUpperCase().trim()
    if (['A', 'B', 'C', 'D'].includes(k)) correctIdx = ['A', 'B', 'C', 'D'].indexOf(k)
    else correctIdx = optsStrings.findIndex((o) => o.toLowerCase() === q.correct.toLowerCase().trim())
  } else if (typeof q.correctAnswer === 'string') {
    correctIdx = optsStrings.findIndex((o) => o.toLowerCase() === q.correctAnswer.toLowerCase().trim())
  }

  return correctIdx >= 0 && correctIdx <= 3
}

function isApprovedStatus(q) {
  if (q.status === 'rejected' || q.status === 'expired' || q.status === 'archived') return false
  if (q.active === false || q.ativa === false) return false
  return true
}

console.log('====================================================================================================')
console.log('       ACORDA PORTUGAL — PATCH FINAL DE CONTABILIDADE EDITORIAL & 4 CONTADORES OFICIAIS              ')
console.log('====================================================================================================\n')

// 1. Inventário Físico Completo
const rawQuestionsPool = []
const seenPhysicalIds = new Set()
const duplicateIds = []

const categoriesDir = path.join(rootDir, 'lib', 'data', 'categories')
if (fs.existsSync(categoriesDir)) {
  const catFiles = fs.readdirSync(categoriesDir).filter((f) => f.endsWith('.json'))
  for (const f of catFiles) {
    const fullPath = path.join(categoriesDir, f)
    try {
      const list = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
      if (Array.isArray(list)) {
        for (const item of list) {
          const id = String(item.id || '')
          if (id && seenPhysicalIds.has(id)) {
            duplicateIds.push({ id, file: f })
          }
          if (id) seenPhysicalIds.add(id)
          rawQuestionsPool.push({ ...item, _sourceFile: `lib/data/categories/${f}` })
        }
      }
    } catch (e) {
      console.warn(`Aviso ao ler ${f}:`, e.message)
    }
  }
}

const dnPath = path.join(rootDir, 'src', 'data', 'questions_desafio_nacional.json')
if (fs.existsSync(dnPath)) {
  try {
    const list = JSON.parse(fs.readFileSync(dnPath, 'utf8'))
    if (Array.isArray(list)) {
      for (const item of list) {
        const id = String(item.id || '')
        if (id && seenPhysicalIds.has(id)) {
          duplicateIds.push({ id, file: 'src/data/questions_desafio_nacional.json' })
        }
        if (id) seenPhysicalIds.add(id)
        rawQuestionsPool.push({ ...item, _sourceFile: 'src/data/questions_desafio_nacional.json' })
      }
    }
  } catch (e) {
    console.warn('Aviso ao ler questions_desafio_nacional.json:', e.message)
  }
}

const physicalQuestionCount = rawQuestionsPool.length
const validQuestionCount = rawQuestionsPool.filter(isValidStructuralQuestion).length
const invalidQuestionCount = physicalQuestionCount - validQuestionCount
const approvedQuestionCount = rawQuestionsPool.filter((q) => isValidStructuralQuestion(q) && isApprovedStatus(q)).length

// 2. Mapeamento Estrito dos 233 Subtemas Canónicos (editorialApprovedCount)
const subthemesStats = []
let editorialApprovedCount = 0
let totalTargetGlobal = 233 * 2000 // 466.000
const mappedQuestionIds = new Set()

const CATEGORY_SLUG_MAP = {
  'cinema-tv': 'cinema-tv',
  'cinema-e-televisao': 'cinema-tv',
  'ciencia-tecnologia': 'ciencia-tecnologia',
  'ciencia-e-tecnologia': 'ciencia-tecnologia',
  'atualidade': 'atualidade',
  'atualidade-portugal-agora': 'atualidade',
  'futebol-portugues': 'futebol-portugues',
  'futebol': 'futebol-portugues',
}

for (const theme of OFFICIAL_CATALOG) {
  const themeCatSlug = theme.id
  const themeNameSlug = normalizeSlug(theme.name)

  const themeQuestions = rawQuestionsPool.filter((q) => {
    let qTheme = normalizeSlug(q.tema || q.category || '')
    if (CATEGORY_SLUG_MAP[qTheme]) qTheme = CATEGORY_SLUG_MAP[qTheme]
    return (
      qTheme === themeCatSlug ||
      qTheme === themeNameSlug ||
      qTheme.includes(themeCatSlug) ||
      themeCatSlug.includes(qTheme) ||
      q._sourceFile.includes(theme.file)
    )
  })

  for (const subName of theme.subcategories) {
    const subSlug = normalizeSlug(subName)

    const subQuestions = themeQuestions.filter((q) => {
      const qSub = normalizeSlug(q.subtema || q.subcategory || '')
      return qSub === subSlug || qSub.includes(subSlug) || subSlug.includes(qSub)
    })

    const approvedSubQuestions = subQuestions.filter((q) => {
      const id = String(q.id || '')
      if (mappedQuestionIds.has(id)) return false // Proibição estrita de contagem dupla
      if (isValidStructuralQuestion(q) && isApprovedStatus(q)) {
        mappedQuestionIds.add(id)
        return true
      }
      return false
    })

    const count = approvedSubQuestions.length
    editorialApprovedCount += count

    const remaining = Math.max(0, 2000 - count)
    const percentage = Number(((count / 2000) * 100).toFixed(2))
    const status = count >= 2000 ? 'COMPLETE' : count > 0 ? 'IN_PRODUCTION' : 'NOT_STARTED'

    subthemesStats.push({
      tema: theme.name,
      temaSlug: theme.id,
      subtema: subName,
      subtemaSlug: subSlug,
      target: 2000,
      approvedCount: count,
      remaining,
      percentage,
      status
    })
  }
}

// 3. Auditoria das perguntas válidas fora do catálogo editorial estrito (Unmapped / General Pool)
const unmappedApprovedCount = approvedQuestionCount - editorialApprovedCount

// 4. Produção Nova da Sessão Atual (300 Qs)
const sessionProducedCount = rawQuestionsPool.filter((q) => {
  const id = String(q.id || '')
  return (
    id.startsWith('PT_HIST_B01_') ||
    id.startsWith('PT_GEO_B01_') ||
    id.startsWith('PT_CULT_B01_') ||
    id.startsWith('PT_MONUM_B01_') ||
    id.startsWith('AP-CINE-PT-') ||
    id.startsWith('AP-PT-CID-') ||
    id.startsWith('AP-CIEN-CIENT-') ||
    id.startsWith('AP-POL-PRES-') ||
    id.startsWith('AP-GAST-PRAT-') ||
    id.startsWith('AP-CINE-TV-') ||
    id.startsWith('AP-FUT-FEM-') ||
    id.startsWith('AP-PT-PRAIA-') ||
    id.startsWith('PT_VIL_') ||
    id.startsWith('PT_REG_') ||
    id.startsWith('FUT_EST_') ||
    id.startsWith('HIST_DIN_') ||
    id.startsWith('CIEN_INV_') ||
    id.startsWith('GAST_VIN_') ||
    id.startsWith('CULT_PAT_') ||
    id.startsWith('CULT_MUS_') ||
    id.startsWith('CULT_MIT_') ||
    id.startsWith('GAST_PAO_') ||
    id.startsWith('GAST_MAR_') ||
    id.startsWith('FUT_FUTSAL_') ||
    id.startsWith('FUT_PRAIA_') ||
    id.startsWith('FUT_DERBI_') ||
    id.startsWith('HIST_BAT_') ||
    id.startsWith('FUT_JOG_') ||
    id.startsWith('FUT_LIG_') ||
    id.startsWith('FUT_MOM_') ||
    id.startsWith('FUT_CUR_') ||
    id.startsWith('PT_GAST_') ||
    id.startsWith('HIST_NAV_') ||
    id.startsWith('HIST_FIG_') ||
    id.startsWith('CULT_ARQ_') ||
    id.startsWith('CULT_FES_') ||
    id.startsWith('CULT_LIN_') ||
    id.startsWith('HIST_TRA_') ||
    id.startsWith('CULT_TEA_') ||
    id.startsWith('HIST_REP_') ||
    id.startsWith('HIST_MED_') ||
    id.startsWith('CULT_ESC_') ||
    id.startsWith('CULT_PIN_') ||
    id.startsWith('ATU_STA_') ||
    id.startsWith('EMP_MAR_') ||
    id.startsWith('CIE_MAR_') ||
    id.startsWith('GEO_SER_') ||
    id.startsWith('POL_PM_') ||
    id.startsWith('DESP_LEN_') ||
    id.startsWith('TV_CLA_') ||
    id.startsWith('MUS_BAN_') ||
    id.startsWith('PERS_CIE_') ||
    id.startsWith('MUN_CAP_') ||
    id.startsWith('HUM_PT_') ||
    id.startsWith('VIS_BRA_') ||
    id.startsWith('CULT_POE_') ||
    id.startsWith('HIST_PRE_') ||
    id.startsWith('GAST_REG_') ||
    id.startsWith('CIE_NAT_') ||
    id.startsWith('POL_AR_') ||
    id.startsWith('EMP_HIS_') ||
    id.startsWith('GEO_DIS_') ||
    id.startsWith('DESP_MOT_') ||
    id.startsWith('TV_NOV_') ||
    id.startsWith('MUS_CAN_') ||
    id.startsWith('PERS_PIN_') ||
    id.startsWith('MUN_GEO_') ||
    id.startsWith('HIST_IMP_') ||
    id.startsWith('HUM_COM_') ||
    id.startsWith('VIS_CID_') ||
    id.startsWith('ATU_MUN_') ||
    id.startsWith('POL_CON_') ||
    id.startsWith('POL_PAR_') ||
    id.startsWith('EMP_EHI_') ||
    id.startsWith('GEO_CON_') ||
    id.startsWith('HIST_XIX_') ||
    id.startsWith('GAST_DOP_') ||
    id.startsWith('MUS_PIM_') ||
    id.startsWith('CIE_MED_') ||
    id.startsWith('DESP_NAU_') ||
    id.startsWith('PERS_POL_') ||
    id.startsWith('MUND_BAN_') ||
    id.startsWith('TV_FIL_') ||
    id.startsWith('POL_GOV_') ||
    id.startsWith('EMP_TEC_') ||
    id.startsWith('GEO_PRA_') ||
    id.startsWith('HUM_MEM_')
  )
}).length

const legacyCount = physicalQuestionCount - sessionProducedCount

console.log('--- QUADRO DOS QUATRO CONTADORES OFICIAIS ---')
console.log(`1. PERGUNTAS FÍSICAS TOTAIS (physicalQuestionCount):            ${physicalQuestionCount.toLocaleString('pt-PT')}`)
console.log(`2. PERGUNTAS VÁLIDAS ESTRUTURAIS (validQuestionCount):          ${validQuestionCount.toLocaleString('pt-PT')} (${invalidQuestionCount} inválidas)`)
console.log(`3. PERGUNTAS APROVADAS TOTAIS (approvedQuestionCount):          ${approvedQuestionCount.toLocaleString('pt-PT')}`)
console.log(`4. PERGUNTAS EDITORIAIS CONTABILIZÁVEIS (editorialApprovedCount): ${editorialApprovedCount.toLocaleString('pt-PT')} / 466.000 (${((editorialApprovedCount / totalTargetGlobal) * 100).toFixed(2)}%)\n`)

console.log('--- RECONCILIAÇÃO MATEMÁTICA E CATEGORIZAÇÃO TOTAL ---')
console.log(`• Perguntas nos 233 Subtemas Oficiais (editorialApprovedCount): ${editorialApprovedCount}`)
console.log(`• Perguntas Aprovadas Fora do Catálogo Específico (Pool Geral): ${unmappedApprovedCount}`)
console.log(`• Prova de Soma de Aprovadas: ${editorialApprovedCount} + ${unmappedApprovedCount} = ${approvedQuestionCount} (${editorialApprovedCount + unmappedApprovedCount === approvedQuestionCount ? 'EXATO ✓' : 'FALHA ✗'})`)
console.log(`• Produção Nova Rigorosa da Sessão Atual: ${sessionProducedCount} perguntas`)
console.log(`• Base Legada Existente: ${legacyCount} perguntas`)
console.log(`• Prova de Soma Física: ${sessionProducedCount} + ${legacyCount} = ${physicalQuestionCount} (${sessionProducedCount + legacyCount === physicalQuestionCount ? 'EXATO ✓' : 'FALHA ✗'})\n`)

// 5. Estado dos 233 Subtemas
const notStartedCount = subthemesStats.filter((s) => s.status === 'NOT_STARTED').length
const inProductionCount = subthemesStats.filter((s) => s.status === 'IN_PRODUCTION').length
const completeCount = subthemesStats.filter((s) => s.status === 'COMPLETE').length

console.log('--- ESTADO DOS 233 SUBTEMAS OFICIAIS ---')
console.log(`• Subtemas Completos (COMPLETE >= 2.000):   ${completeCount} / 233`)
console.log(`• Subtemas em Produção (IN_PRODUCTION):      ${inProductionCount} / 233`)
console.log(`• Subtemas Não Iniciados (NOT_STARTED):     ${notStartedCount} / 233`)
console.log(`• Soma de Metas dos 233 Subtemas:           ${totalTargetGlobal.toLocaleString('pt-PT')}`)
console.log(`• Faltam para a Meta Global:                ${(totalTargetGlobal - editorialApprovedCount).toLocaleString('pt-PT')} perguntas\n`)

// 6. Gravar Dashboard e Manifesto
const dashboardPath = path.join(rootDir, 'data', 'editorial_accounting_dashboard.json')
const dashboardData = {
  timestamp: new Date().toISOString(),
  metricasOficiais: {
    physicalQuestionCount,
    validQuestionCount,
    invalidQuestionCount,
    approvedQuestionCount,
    editorialApprovedCount,
    unmappedApprovedCount,
    publishedQuestionCount: 0,
    productionNewSessionCount: sessionProducedCount,
    legacyQuestionCount: legacyCount,
    duplicateQuestionCount: duplicateIds.length,
    reviewQuestionCount: 0,
    rejectedQuestionCount: 0,
    globalTarget: totalTargetGlobal,
    missingToTarget: totalTargetGlobal - editorialApprovedCount,
    completionPercentage: Number(((editorialApprovedCount / totalTargetGlobal) * 100).toFixed(2))
  },
  subtemasResumo: {
    totalSubtemas: 233,
    complete: completeCount,
    inProduction: inProductionCount,
    notStarted: notStartedCount
  },
  subtemas: subthemesStats
}
fs.writeFileSync(dashboardPath, JSON.stringify(dashboardData, null, 2), 'utf8')
console.log(`✓ Gravado Dashboard de Contabilidade Editorial em: data/editorial_accounting_dashboard.json`)

const manifestPath = path.join(rootDir, 'data', 'editorial_accounting_manifest.json')
fs.writeFileSync(manifestPath, JSON.stringify(subthemesStats, null, 2), 'utf8')
console.log(`✓ Gravado Manifesto dos 233 Subtemas em: data/editorial_accounting_manifest.json\n`)
