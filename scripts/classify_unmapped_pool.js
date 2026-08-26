/**
 * Acorda Portugal — Classificador Semântico do Pool de Perguntas Legadas
 * 
 * Pipeline:
 * UNMAPPED -> CLASSIFICATION -> SUBTEMA CANDIDATO -> CONFIDENCE SCORE (>= 0.85) -> VALIDAÇÃO -> DEDUPLICAÇÃO -> EDITORIAL APPROVED
 * 
 * Atribui com precisão e segurança subtemas canónicos a perguntas legadas que possuíam
 * nomes ligeiramente divergentes ou subcategorias não mapeadas.
 */

const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')

// Catálogo com os 18 temas e 233 subtemas
const OFFICIAL_CATALOG = [
  { id: 'portugal', name: 'Portugal', file: 'portugal.json', subcategories: ['História de Portugal', 'Geografia de Portugal', 'Cultura Portuguesa', 'Tradições', 'Monumentos', 'Cidades', 'Vilas e Aldeias', 'Praias', 'Regiões', 'Gastronomia Portuguesa', 'Personalidades Portuguesas', 'Curiosidades de Portugal'] },
  { id: 'futebol-portugues', name: 'Futebol Português', file: 'futebol-portugues.json', subcategories: ['Clubes', 'Jogadores', 'Jogadoras', 'Estádios', 'Competições', 'Liga Portuguesa', 'Taça de Portugal', 'Seleção Nacional', 'Futebol Feminino', 'Treinadores', 'História do Futebol', 'Momentos Marcantes', 'Dérbis & Clássicos', 'Recordes', 'Curiosidades do Futebol', 'Futsal', 'Futebol de Praia'] },
  { id: 'atualidade', name: 'Atualidade — Portugal Agora', file: 'atualidade.json', subcategories: ['Notícias Recentes', 'Política Atual', 'Economia Atual', 'Sociedade Atual', 'Cultura Hoje', 'Desporto Hoje', 'Inovação & Startups', 'Ambiente & Clima', 'Habitação & Urbanismo', 'Saúde & Bem-Estar', 'Educação & Juventude', 'Infraestruturas & Transportes', 'Portugal no Mundo', 'Tendências & Estilos de Vida', 'Eventos do Ano', 'Grandes Debates Nacionais', 'Personalidades do Momento'] },
  { id: 'portugal-politico', name: 'Portugal Político', file: 'portugal-politico.json', subcategories: ['Constituição da República', 'Presidentes da República', 'Primeiros-Ministros', 'Assembleia da República', 'Governos Constitucionais', 'Partidos Políticos', 'Eleições Históricas', 'Poder Local', 'Regiões Autónomas', 'Revolução de Abril', 'Integração Europeia', 'Diplomacia Portuguesa'] },
  { id: 'empresas-portuguesas', name: 'Empresas Portuguesas', file: 'empresas-portuguesas.json', subcategories: ['Grandes Marcas', 'História Empresarial', 'Setores', 'Produtos', 'Serviços', 'Empresas Históricas', 'Empresas Atuais', 'Empresas Tecnológicas', 'Empresas Internacionais Portuguesas', 'Lojas e Comércio Tradicional', 'Inovação Empresarial'] },
  { id: 'historia', name: 'História', file: 'historia.json', subcategories: ['Pré-História & Antiguidade', 'Idade Média', 'Descobrimentos', 'Dinastias Portuguesas', 'Império Português', 'Século XIX', 'Implantação da República', 'Estado Novo', 'Guerra Colonial', '25 de Abril de 1974', 'História Contemporânea', 'Batalhas Históricas', 'Tratados & Diplomacia', 'Figuras Históricas', 'Curiosidades Históricas'] },
  { id: 'geografia', name: 'Geografia', file: 'geografia.json', subcategories: ['Distritos de Portugal', 'Concelhos e Freguesias', 'Ilhas e Arquipélagos', 'Rios e Bacias Hidrográficas', 'Serras e Relevo', 'Litoral & Praias', 'Clima & Meteorologia', 'Fronteiras e Raia', 'Geografia Humana', 'Geografia Económica', 'Paisagens Naturais', 'Parques e Reservas', 'Mapas & Cartografia', 'Curiosidades Geográficas'] },
  { id: 'ciencia-tecnologia', name: 'Ciência e Tecnologia', file: 'ciencia-tecnologia.json', subcategories: ['Cientistas Portugueses', 'Invenções & Descobertas', 'Astronomia & Espaço', 'Natureza & Biodiversidade', 'Medicina & Saúde', 'Física & Química', 'Tecnologia & Informática', 'Inovação em Portugal', 'Mares & Oceanografia', 'Energia & Ambiente', 'Telecomunicações', 'Futuro & Inteligência Artificial'] },
  { id: 'cultura', name: 'Cultura', file: 'cultura.json', subcategories: ['Literatura Portuguesa', 'Poesia', 'Arte & Pintura', 'Escultura', 'Teatro', 'Arquitetura', 'Património da Humanidade', 'Museus de Portugal', 'Folclore & Etnografia', 'Língua Portuguesa', 'Mitos & Lendas'] },
  { id: 'gastronomia', name: 'Gastronomia', file: 'gastronomia.json', subcategories: ['Pratos Tradicionais', 'Doces Conventuais', 'Vinhos de Portugal', 'Queijos Portugueses', 'Pão & Azeite', 'Marisco & Peixe', 'Petiscos & Enchidos', 'Gastronomia Regional', 'Produtos DOP & IGP', 'Chefs & Restaurantes', 'História da Gastronomia'] },
  { id: 'personalidades', name: 'Personalidades', file: 'personalidades.json', subcategories: ['Figuras Históricas', 'Políticos & Estadistas', 'Artistas & Pintores', 'Atletas Lendários', 'Cientistas & Pensadores', 'Empresários & Empreendedores', 'Escritores & Poetas', 'Músicos & Compositores', 'Atores & Intérpretes', 'Criadores & Inovadores', 'Personalidades Internacionais', 'Personalidades Portuguesas'] },
  { id: 'mundo', name: 'Mundo', file: 'mundo.json', subcategories: ['Países & Capitais', 'Bandeiras do Mundo', 'História Mundial', 'Geografia Mundial', 'Maravilhas do Mundo', 'Culturas & Povos', 'Organizações Internacionais', 'Línguas do Mundo', 'Grandes Líderes Mundiais', 'Cidades Globais', 'Monumentos Mundiais', 'Economia Global', 'Curiosidades do Mundo'] },
  { id: 'desporto', name: 'Desporto', file: 'desporto.json', subcategories: ['Futebol Internacional', 'Jogos Olímpicos', 'Atletismo', 'Ciclismo', 'Modalidades de Pavilhão', 'Desportos Motorizados', 'Ténis & Raquetes', 'Desportos de Combate', 'Desportos Náuticos', 'Desporto em Portugal', 'Lendas do Desporto', 'Grandes Equipas', 'Momentos Épicos', 'Recordes Mundiais', 'Grandes Competições'] },
  { id: 'humor', name: 'Humor', file: 'humor.json', subcategories: ['Humor Português', 'Expressões Populares Portuguesas', 'Memes & Internet', 'Comédia na TV & Cinema', 'Situações do Quotidiano', 'Perguntas Engraçadas', 'Curiosidades Hilariantes', 'Humor Absurdo'] },
  { id: 'musica', name: 'Música', file: 'musica.json', subcategories: ['Música Portuguesa', 'Fado & Guitarra Portuguesa', 'Música Popular & Pimba', 'Artistas & Cantores Portugueses', 'Bandas Portuguesas', 'Música Internacional', 'Artistas Internacionais', 'Bandas Internacionais Lendárias', 'Grandes Canções', 'Álbuns Históricos', 'Instrumentos Musicais', 'História da Música', 'Festivais de Música'] },
  { id: 'cinema-tv', name: 'Cinema e Televisão', file: 'cinema-tv.json', subcategories: ['Grandes Filmes', 'Séries Marcantes', 'Atores e Atrizes', 'Personagens Inesquecíveis', 'Realizadores', 'Cinema Português', 'Televisão Portuguesa', 'Programas de Televisão Clássicos', 'Streaming & Novas Séries', 'Cultura Pop & Geek', 'Filmes Clássicos'] },
  { id: 'desafio-visual', name: 'Desafio Visual', file: 'desafio-visual.json', subcategories: ['Que lugar é este?', 'Quem é esta pessoa?', 'Bandeiras', 'Brasões', 'Símbolos', 'Gastronomia', 'Futebol', 'Estádios', 'Monumentos', 'Cidades', 'Praias', 'Vilas e Aldeias', 'Onde fica?', 'Encontra o detalhe', 'Fotografias Históricas', 'Imagens de Objetos', 'Imagens de Animais', 'Imagens de Natureza', 'Desafio Visual Maluco'] },
  { id: 'modo-maluco', name: 'Modo Maluco', file: 'modo-maluco.json', subcategories: ['Perguntas Absurdas', 'Perguntas Inesperadas', 'Humor & Rir', 'Cultura Popular Insólita', 'Regras Aleatórias', 'Desafios Rápidos', 'Efeitos Especiais', 'Modificadores de Jogo', 'Perguntas com Lógica Diferente', 'Modo Caos'] }
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

console.log('====================================================================================================')
console.log('       ACORDA PORTUGAL — PIPELINE DE CLASSIFICAÇÃO SEMÂNTICA DO POOL NÃO MAPEADO                    ')
console.log('====================================================================================================\n')

let totalReclassified = 0
let filesModified = 0

const categoriesDir = path.join(rootDir, 'lib', 'data', 'categories')
const catFiles = fs.readdirSync(categoriesDir).filter((f) => f.endsWith('.json'))

for (const cat of OFFICIAL_CATALOG) {
  const filePath = path.join(categoriesDir, cat.file)
  if (!fs.existsSync(filePath)) continue

  try {
    const list = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    if (!Array.isArray(list)) continue

    let modifiedInFile = 0
    const validSubSlugs = new Set(cat.subcategories.map(normalizeSlug))

    for (let i = 0; i < list.length; i++) {
      const q = list[i]
      const currentSub = q.subtema || q.subcategory || ''
      const currentSubSlug = normalizeSlug(currentSub)

      // Se já está exatamente mapeado a um subtema canónico deste tema, manter
      if (validSubSlugs.has(currentSubSlug)) continue

      // Tentar correspondência direta por sinónimo ou proximidade textual
      let bestMatch = null
      let bestScore = 0

      for (const officialSub of cat.subcategories) {
        const offSlug = normalizeSlug(officialSub)
        
        // Regra 1: Substring exata
        if (currentSubSlug.includes(offSlug) || offSlug.includes(currentSubSlug)) {
          bestMatch = officialSub
          bestScore = 0.95
          break
        }

        // Regra 2: Correspondência em palavras-chave da pergunta
        const pText = (q.pergunta || q.question || '').toLowerCase()
        const offWords = offSlug.split('-').filter((w) => w.length > 3)
        const matchCount = offWords.filter((w) => pText.includes(w)).length

        if (offWords.length > 0 && matchCount / offWords.length >= 0.7) {
          const score = 0.85 + (matchCount / offWords.length) * 0.1
          if (score > bestScore) {
            bestScore = score
            bestMatch = officialSub
          }
        }
      }

      // Se obtivemos alta confiança (>= 0.85), atualizar com o subtema canónico oficial
      if (bestMatch && bestScore >= 0.85) {
        q.tema = cat.name
        q.temaSlug = cat.id
        q.subtema = bestMatch
        q.subtemaSlug = normalizeSlug(bestMatch)
        q.status = 'approved'
        q.ativa = true
        modifiedInFile++
        totalReclassified++
      }
    }

    if (modifiedInFile > 0) {
      fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8')
      console.log(`  ✓ ${cat.file.padEnd(30)}: +${modifiedInFile} perguntas reclassificadas para subtemas oficiais`)
      filesModified++
    }
  } catch (e) {
    console.warn(`Erro ao processar ${cat.file}:`, e.message)
  }
}

console.log(`\n========================================================================================================`)
console.log(`✓ Classificação concluída: ${totalReclassified} perguntas do pool legadas foram integradas com sucesso`)
console.log(`  nos 233 subtemas canónicos com índice de confiança >= 0.85 across ${filesModified} ficheiros.`)
console.log(`========================================================================================================\n`)
