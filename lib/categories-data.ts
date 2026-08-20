// Acorda Portugal — Sistema Completo de Categorias, Subcategorias e Territórios
// Arquitetura unificada e escalável para perguntas, desafios, rankings, missões e expansões.

import type { ComponentType } from 'react'
import {
  Flag,
  Landmark,
  Globe,
  Medal,
  Music,
  UtensilsCrossed,
  Clapperboard,
  Lightbulb,
  Laugh,
  FlaskConical,
  Cpu,
  Earth,
  Drama,
  Trophy,
  MapPin,
  Building2,
  Swords,
  Sparkles,
  BookOpen,
  Film,
  Disc,
  History,
  Languages,
  Atom,
  HelpCircle,
  Clock,
  Compass,
  Award,
  Shield,
  Eye,
  Zap,
  TrendingUp,
  Briefcase,
  Vote,
  Camera,
  Layers,
  Smile,
  Heart,
  Palette,
  Target,
} from 'lucide-react'

// ============================================================================
// 1. TIPOS FUNDAMENTAIS
// ============================================================================

export type CategoryTone = 'primary' | 'gold' | 'red' | 'accent' | 'purple' | 'emerald' | 'blue'

export type CategoryGroup =
  | 'portugal'
  | 'atualidade_politica'
  | 'conhecimento'
  | 'cultura_entretenimento'
  | 'especial_caos'

export interface SubcategoryItem {
  id: string
  name: string
  description?: string
  tags?: string[]
  icon?: ComponentType<{ className?: string }>
}

export interface MainCategory {
  id: string
  slug: string
  name: string
  emoji: string
  group: CategoryGroup
  tone: CategoryTone
  icon: ComponentType<{ className?: string }>
  description: string
  difficultyDefault: 'Fácil' | 'Médio' | 'Difícil' | 'Variado' | 'Insano'
  special?: boolean
  isVisual?: boolean
  isTimeSensitive?: boolean // para atualidade
  subcategories: SubcategoryItem[]
  tags: string[]
  questionCountEstimate?: number
}

// ============================================================================
// 2. CATÁLOGO COMPLETO DAS 18 CATEGORIAS PRINCIPAIS
// ============================================================================

export const MAIN_CATEGORIES: MainCategory[] = [
  // --------------------------------------------------------------------------
  // 1. 🇵🇹 PORTUGAL
  // --------------------------------------------------------------------------
  {
    id: 'portugal',
    slug: 'portugal',
    name: 'Portugal',
    emoji: '🇵🇹',
    group: 'portugal',
    tone: 'primary',
    icon: Flag,
    description: 'A identidade, raízes, história, geografia e encantos de Portugal.',
    difficultyDefault: 'Variado',
    tags: ['portugal', 'nacional', 'cultura', 'historia', 'geografia', 'tradicao'],
    questionCountEstimate: 250,
    subcategories: [
      { id: 'historia-portugal', name: 'História de Portugal', tags: ['historia', 'nacional'] },
      { id: 'geografia-portugal', name: 'Geografia de Portugal', tags: ['geografia', 'territorio'] },
      { id: 'cultura-portuguesa', name: 'Cultura Portuguesa', tags: ['cultura', 'costumes'] },
      { id: 'tradicoes', name: 'Tradições', tags: ['tradicao', 'festas', 'folclore'] },
      { id: 'monumentos', name: 'Monumentos', tags: ['patrimonio', 'castelos', 'monumentos'] },
      { id: 'cidades', name: 'Cidades', tags: ['cidades', 'urbanismo'] },
      { id: 'vilas-aldeias', name: 'Vilas e Aldeias', tags: ['aldeias', 'interior', 'vilas'] },
      { id: 'praias', name: 'Praias', tags: ['litoral', 'costa', 'praias', 'mar'] },
      { id: 'regioes', name: 'Regiões', tags: ['norte', 'centro', 'alentejo', 'algarve', 'ilhas'] },
      { id: 'gastronomia-portuguesa', name: 'Gastronomia Portuguesa', tags: ['comida', 'pratos', 'vinhos'] },
      { id: 'personalidades-portuguesas', name: 'Personalidades Portuguesas', tags: ['figuras', 'notaveis'] },
      { id: 'curiosidades-portugal', name: 'Curiosidades de Portugal', tags: ['factos', 'recordes'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 2. 📰 ATUALIDADE — PORTUGAL AGORA
  // --------------------------------------------------------------------------
  {
    id: 'atualidade',
    slug: 'atualidade',
    name: 'Atualidade — Portugal Agora',
    emoji: '📰',
    group: 'atualidade_politica',
    tone: 'blue',
    icon: TrendingUp,
    description: 'Factos recentes, economia, sociedade e acontecimentos nacionais verificáveis.',
    difficultyDefault: 'Médio',
    isTimeSensitive: true,
    tags: ['atualidade', 'noticias', 'sociedade', 'portugal-agora', 'economia'],
    questionCountEstimate: 140,
    subcategories: [
      { id: 'politica-governo', name: 'Política e Governo', tags: ['governo', 'estado'] },
      { id: 'assembleia-republica', name: 'Assembleia da República', tags: ['parlamento', 'leis'] },
      { id: 'partidos-politicos', name: 'Partidos Políticos', tags: ['partidos', 'democracia'] },
      { id: 'lideres-politicos', name: 'Líderes Políticos', tags: ['lideres', 'politica'] },
      { id: 'economia', name: 'Economia', tags: ['financas', 'mercados'] },
      { id: 'salario-minimo', name: 'Salário Mínimo', tags: ['trabalho', 'salario'] },
      { id: 'inflacao', name: 'Inflação', tags: ['precos', 'custo-vida'] },
      { id: 'pib', name: 'PIB', tags: ['contas-publicas', 'crescimento'] },
      { id: 'emprego', name: 'Emprego', tags: ['trabalho', 'mercado'] },
      { id: 'habitacao', name: 'Habitação', tags: ['casas', 'rendas', 'imobiliario'] },
      { id: 'euribor', name: 'Euribor', tags: ['juros', 'bancos'] },
      { id: 'turismo', name: 'Turismo', tags: ['hoteis', 'visitantes', 'viagens'] },
      { id: 'empresas-portuguesas-atual', name: 'Empresas Portuguesas', tags: ['negocios', 'marcas'] },
      { id: 'cultura-atual', name: 'Cultura', tags: ['eventos', 'premios'] },
      { id: 'desporto-atual', name: 'Desporto', tags: ['resultados', 'campeonatos'] },
      { id: 'acontecimentos-nacionais', name: 'Acontecimentos Nacionais', tags: ['sociedade', 'acontecimentos'] },
      { id: 'noticias-verificaveis', name: 'Notícias e Factos Verificáveis', tags: ['factos', 'noticias'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 3. 🏛️ PORTUGAL POLÍTICO
  // --------------------------------------------------------------------------
  {
    id: 'portugal-politico',
    slug: 'portugal-politico',
    name: 'Portugal Político',
    emoji: '🏛️',
    group: 'atualidade_politica',
    tone: 'gold',
    icon: Vote,
    description: 'História política, constituição, instituições democráticas e sistema eleitoral.',
    difficultyDefault: 'Médio',
    tags: ['politica', 'democracia', 'constituicao', 'eleicoes', 'instituicoes'],
    questionCountEstimate: 110,
    subcategories: [
      { id: 'partidos', name: 'Partidos', tags: ['partidos', 'bancadas'] },
      { id: 'representacao-parlamentar', name: 'Representação Parlamentar', tags: ['deputados', 'hemiciclo'] },
      { id: 'lideres', name: 'Líderes', tags: ['chefes-partido', 'lideranca'] },
      { id: 'historia-politica', name: 'História Política', tags: ['democracia', 'evolucao'] },
      { id: 'instituicoes', name: 'Instituições', tags: ['tribunais', 'conselho-estado', 'governo'] },
      { id: 'constituicao', name: 'Constituição', tags: ['crp', 'leis-fundamentais'] },
      { id: 'sistema-politico', name: 'Sistema Político', tags: ['semi-presidencialismo', 'voto'] },
      { id: 'eleicoes', name: 'Eleições', tags: ['legislativas', 'presidenciais', 'autarquicas'] },
      { id: 'propostas-politicas', name: 'Propostas Políticas', tags: ['programas', 'reformas'] },
      { id: 'governos', name: 'Governos', tags: ['executivo', 'ministerios'] },
      { id: 'presidentes-republica', name: 'Presidentes da República', tags: ['belem', 'chefes-estado'] },
      { id: 'primeiros-ministros', name: 'Primeiros-Ministros', tags: ['sao-bento', 'chefes-governo'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 4. 🏢 EMPRESAS PORTUGUESAS
  // --------------------------------------------------------------------------
  {
    id: 'empresas-portuguesas',
    slug: 'empresas-portuguesas',
    name: 'Empresas Portuguesas',
    emoji: '🏢',
    group: 'atualidade_politica',
    tone: 'primary',
    icon: Briefcase,
    description: 'Marcas históricas, inovação, fundadores, comércio e grupos empresariais.',
    difficultyDefault: 'Médio',
    tags: ['empresas', 'marcas', 'economia', 'negocios', 'inovacao'],
    questionCountEstimate: 90,
    subcategories: [
      { id: 'empresas', name: 'Empresas', tags: ['corporacoes', 'setores'] },
      { id: 'marcas', name: 'Marcas', tags: ['branding', 'produtos-famosos'] },
      { id: 'fundadores', name: 'Fundadores', tags: ['empreendedores', 'pioneiros'] },
      { id: 'historia-empresarial', name: 'História Empresarial', tags: ['origens', 'sec-xx'] },
      { id: 'setores', name: 'Setores', tags: ['energia', 'retalho', 'banca', 'cortica'] },
      { id: 'produtos', name: 'Produtos', tags: ['fabricacao', 'exportacao'] },
      { id: 'servicos', name: 'Serviços', tags: ['telecomunicacoes', 'logistica'] },
      { id: 'empresas-historicas', name: 'Empresas Históricas', tags: ['tradicionais', 'centenarias'] },
      { id: 'empresas-atuais', name: 'Empresas Atuais', tags: ['psi-20', 'cotadas'] },
      { id: 'empresas-tecnologicas', name: 'Empresas Tecnológicas', tags: ['unicorneos', 'startups'] },
      { id: 'empresas-internacionais', name: 'Empresas Internacionais Portuguesas', tags: ['expansao', 'multinacionais'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 5. ⚽ FUTEBOL PORTUGUÊS
  // --------------------------------------------------------------------------
  {
    id: 'futebol-portugues',
    slug: 'futebol-portugues',
    name: 'Futebol Português',
    emoji: '⚽',
    group: 'portugal',
    tone: 'red',
    icon: Trophy,
    description: 'Clubes, craques, seleção das quinas, estádios, dérbis e taças históricas.',
    difficultyDefault: 'Variado',
    tags: ['futebol', 'desporto', 'selecao', 'clubes', 'liga-portugal'],
    questionCountEstimate: 200,
    subcategories: [
      { id: 'clubes', name: 'Clubes', tags: ['benfica', 'sporting', 'porto', 'braga', 'vitoria'] },
      { id: 'jogadores', name: 'Jogadores', tags: ['craques', 'lendas', 'avancados'] },
      { id: 'jogadoras', name: 'Jogadoras', tags: ['futebol-feminino', 'atletas'] },
      { id: 'estadios', name: 'Estádios', tags: ['arenas', 'recintos'] },
      { id: 'competicoes', name: 'Competições', tags: ['torneios', 'campeonatos'] },
      { id: 'liga-portuguesa', name: 'Liga Portuguesa', tags: ['primeira-liga', 'tabela'] },
      { id: 'taca-portugal', name: 'Taça de Portugal', tags: ['jamor', 'prova-rainha'] },
      { id: 'selecao-nacional', name: 'Seleção Nacional', tags: ['quinas', 'euro-2016', 'mundial'] },
      { id: 'futebol-feminino', name: 'Futebol Feminino', tags: ['selecao-feminina', 'liga-bpi'] },
      { id: 'treinadores', name: 'Treinadores', tags: ['tecnicos', 'tatica'] },
      { id: 'historia-futebol', name: 'História do Futebol', tags: ['origens', 'anos-dourados'] },
      { id: 'momentos-marcantes', name: 'Momentos Marcantes', tags: ['finais', 'golos-lendarios'] },
      { id: 'derbis', name: 'Dérbis & Clássicos', tags: ['derbi-eterno', 'classico'] },
      { id: 'recordes-futebol', name: 'Recordes', tags: ['melhores-marcadores', 'titulos'] },
      { id: 'transferencias', name: 'Transferências', tags: ['mercado', 'valores'] },
      { id: 'equipamentos', name: 'Equipamentos', tags: ['camisolas', 'cores'] },
      { id: 'futebol-europeu', name: 'Futebol Europeu & Clubes Portugueses', tags: ['champions', 'liga-europa'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 6. 👁️ DESAFIO VISUAL
  // --------------------------------------------------------------------------
  {
    id: 'desafio-visual',
    slug: 'desafio-visual',
    name: 'Desafio Visual',
    emoji: '👁️',
    group: 'especial_caos',
    tone: 'purple',
    icon: Eye,
    description: 'Imagens, monumentos, bandeiras, brasões e observação rápida de detalhes.',
    difficultyDefault: 'Médio',
    special: true,
    isVisual: true,
    tags: ['visual', 'imagem', 'desafio-visual', 'bandeiras', 'mapas', 'reconhecimento'],
    questionCountEstimate: 120,
    subcategories: [
      { id: 'que-lugar-e-este', name: 'Que lugar é este?', tags: ['paisagens', 'reconhecimento'] },
      { id: 'quem-e-esta-pessoa', name: 'Quem é esta pessoa?', tags: ['retratos', 'figuras'] },
      { id: 'bandeiras', name: 'Bandeiras', tags: ['paises', 'municipios'] },
      { id: 'bracoes', name: 'Brasões', tags: ['heraldica', 'cidades'] },
      { id: 'simbolos', name: 'Símbolos', tags: ['icones', 'logos'] },
      { id: 'gastronomia-visual', name: 'Gastronomia', tags: ['pratos', 'doces-visuais'] },
      { id: 'futebol-visual', name: 'Futebol', tags: ['jogadores', 'equipamentos-visuais'] },
      { id: 'estadios-visual', name: 'Estádios', tags: ['recintos', 'fotos-estadios'] },
      { id: 'monumentos-visual', name: 'Monumentos', tags: ['castelos', 'patrimonio-foto'] },
      { id: 'cidades-visual', name: 'Cidades', tags: ['panoramicas', 'postais'] },
      { id: 'praias-visual', name: 'Praias', tags: ['falésias', 'areais'] },
      { id: 'vilas-aldeias-visual', name: 'Vilas e Aldeias', tags: ['tipico', 'xisto', 'castelos'] },
      { id: 'onde-fica-visual', name: 'Onde fica?', tags: ['localizacao', 'mapa-visual'] },
      { id: 'encontra-detalhe', name: 'Encontra o detalhe', tags: ['percepcao', 'olho-clinico'] },
      { id: 'fotografias-historicas', name: 'Fotografias Históricas', tags: ['arquivo', 'preto-branco'] },
      { id: 'imagens-objetos', name: 'Imagens de Objetos', tags: ['utensilios', 'pecas'] },
      { id: 'imagens-animais', name: 'Imagens de Animais', tags: ['fauna', 'especies'] },
      { id: 'imagens-natureza', name: 'Imagens de Natureza', tags: ['flora', 'parques-naturais'] },
      { id: 'desafio-visual-maluco', name: 'Desafio Visual Maluco', tags: ['ilusao', 'humor-visual'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 7. 🤪 MODO MALUCO
  // --------------------------------------------------------------------------
  {
    id: 'modo-maluco',
    slug: 'modo-maluco',
    name: 'Modo Maluco',
    emoji: '🤪',
    group: 'especial_caos',
    tone: 'red',
    icon: Laugh,
    description: 'Humor absurdo, perguntas inesperadas, regras caóticas e lógica invertida.',
    difficultyDefault: 'Insano',
    special: true,
    tags: ['maluco', 'humor', 'caos', 'absurdo', 'pegadinhas', 'modo-maluco'],
    questionCountEstimate: 150,
    subcategories: [
      { id: 'perguntas-absurdas', name: 'Perguntas Absurdas', tags: ['nonsense', 'bizarro'] },
      { id: 'perguntas-inesperadas', name: 'Perguntas Inesperadas', tags: ['surpresa', 'rasteira'] },
      { id: 'humor-maluco', name: 'Humor & Rir', tags: ['anedotas', 'piadas'] },
      { id: 'cultura-popular-maluca', name: 'Cultura Popular Insólita', tags: ['bloopers', 'televisao'] },
      { id: 'regras-aleatorias', name: 'Regras Aleatórias', tags: ['modificadores', 'caos'] },
      { id: 'desafios-rapidos', name: 'Desafios Rápidos', tags: ['tempo-curto', 'reflexos'] },
      { id: 'efeitos-especiais', name: 'Efeitos Especiais', tags: ['audio-visual', 'dinamico'] },
      { id: 'modificadores-jogo', name: 'Modificadores de Jogo', tags: ['multiplicadores', 'reversao'] },
      { id: 'perguntas-logica-diferente', name: 'Perguntas com Lógica Diferente', tags: ['charadas', 'enigmas'] },
      { id: 'modo-caos', name: 'Modo Caos', tags: ['extremo', 'insano'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 8. 🏺 HISTÓRIA
  // --------------------------------------------------------------------------
  {
    id: 'historia',
    slug: 'historia',
    name: 'História',
    emoji: '🏺',
    group: 'conhecimento',
    tone: 'gold',
    icon: Landmark,
    description: 'Dos grandes reis e Descobrimentos às civilizações da antiguidade.',
    difficultyDefault: 'Médio',
    tags: ['historia', 'passado', 'reis', 'descobrimentos', 'revolucoes'],
    questionCountEstimate: 180,
    subcategories: [
      { id: 'historia-de-portugal', name: 'História de Portugal', tags: ['nacional', 'dinastias'] },
      { id: 'historia-mundial', name: 'História Mundial', tags: ['mundo', 'eras'] },
      { id: 'reis-e-rainhas', name: 'Reis e Rainhas', tags: ['monarquia', 'coroa'] },
      { id: 'descobrimentos', name: 'Descobrimentos & Navegações', tags: ['caravelas', 'mar'] },
      { id: 'batalhas', name: 'Batalhas & Conflitos', tags: ['alcacer-quibir', 'aljubarrota'] },
      { id: 'imperios', name: 'Impérios Históricos', tags: ['romano', 'bizantino', 'lusitano'] },
      { id: 'revolucoes', name: 'Revoluções', tags: ['1910', '1820', 'revolucoes-globais'] },
      { id: 'republica', name: 'Implantação da República', tags: ['1910', 'democracia'] },
      { id: 'estado-novo', name: 'Estado Novo', tags: ['salazar', 'sec-xx'] },
      { id: 'vinte-cinco-abril', name: '25 de Abril & Cravos', tags: ['liberdade', 'mfa'] },
      { id: 'personalidades-historicas', name: 'Personalidades Históricas', tags: ['herois', 'lideres'] },
      { id: 'civilizacoes-antigas', name: 'Civilizações Antigas', tags: ['grecia', 'egito', 'roma'] },
      { id: 'idade-media', name: 'Idade Média', tags: ['castelos', 'cavaleiros'] },
      { id: 'idade-moderna', name: 'Idade Moderna', tags: ['renascimento', 'luzes'] },
      { id: 'historia-contemporanea', name: 'História Contemporânea', tags: ['sec-xx', 'sec-xxi'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 9. 🌍 GEOGRAFIA
  // --------------------------------------------------------------------------
  {
    id: 'geografia',
    slug: 'geografia',
    name: 'Geografia',
    emoji: '🌍',
    group: 'conhecimento',
    tone: 'primary',
    icon: Globe,
    description: 'Capitais do mundo, rios, ilhas, serras, oceanos e fronteiras globais.',
    difficultyDefault: 'Médio',
    tags: ['geografia', 'mapas', 'capitais', 'paises', 'relevo', 'natureza'],
    questionCountEstimate: 160,
    subcategories: [
      { id: 'geografia-portugal', name: 'Geografia de Portugal', tags: ['continente', 'ilhas'] },
      { id: 'geografia-europa', name: 'Europa', tags: ['uniao-europeia', 'continente'] },
      { id: 'geografia-mundo', name: 'Mundo', tags: ['continentes', 'planeta'] },
      { id: 'paises', name: 'Países', tags: ['nacoes', 'estados'] },
      { id: 'capitais', name: 'Capitais', tags: ['cidades-capitais', 'mundo'] },
      { id: 'cidades-mundo', name: 'Grandes Cidades', tags: ['metropoles', 'urbanismo'] },
      { id: 'rios', name: 'Rios', tags: ['tejo', 'douro', 'rios-mundiais'] },
      { id: 'montanhas', name: 'Montanhas & Serras', tags: ['estrela', 'pico', 'himalaias'] },
      { id: 'ilhas', name: 'Ilhas & Arquipélagos', tags: ['acores', 'madeira', 'ilhas-globais'] },
      { id: 'oceanos-mares', name: 'Oceanos & Mares', tags: ['atlantico', 'mediterraneo'] },
      { id: 'fronteiras', name: 'Fronteiras & Tratados', tags: ['raia', 'limites'] },
      { id: 'regioes-mundo', name: 'Regiões', tags: ['zonas-climaticas', 'biomas'] },
      { id: 'mapas', name: 'Mapas & Cartografia', tags: ['coordenadas', 'escalas'] },
      { id: 'localizacao-geografica', name: 'Localização Geográfica', tags: ['onde-fica', 'posicao'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 10. 🔬 CIÊNCIA E TECNOLOGIA
  // --------------------------------------------------------------------------
  {
    id: 'ciencia-tecnologia',
    slug: 'ciencia-tecnologia',
    name: 'Ciência e Tecnologia',
    emoji: '🔬',
    group: 'conhecimento',
    tone: 'accent',
    icon: FlaskConical,
    description: 'Invenções, inteligência artificial, física, biologia e o universo.',
    difficultyDefault: 'Médio',
    tags: ['ciencia', 'tecnologia', 'universo', 'ia', 'fisica', 'biologia'],
    questionCountEstimate: 140,
    subcategories: [
      { id: 'ciencia-geral', name: 'Ciência Geral', tags: ['metodo-cientifico', 'leis'] },
      { id: 'fisica', name: 'Física', tags: ['gravidade', 'energia', 'materia'] },
      { id: 'quimica', name: 'Química', tags: ['tabela-periodica', 'reacoes'] },
      { id: 'biologia', name: 'Biologia', tags: ['vida', 'celulas', 'genetica'] },
      { id: 'astronomia-espaco', name: 'Astronomia & Espaço', tags: ['planetas', 'galáxias', 'nasa'] },
      { id: 'corpo-humano', name: 'Corpo Humano', tags: ['anatomia', 'orgaos', 'saude'] },
      { id: 'animais-natureza', name: 'Animais & Natureza', tags: ['fauna', 'ecologia'] },
      { id: 'tecnologia-geral', name: 'Tecnologia', tags: ['gadgets', 'eletronica'] },
      { id: 'informatica-internet', name: 'Informática & Internet', tags: ['web', 'computadores', 'software'] },
      { id: 'inteligencia-artificial', name: 'Inteligência Artificial', tags: ['ia', 'algoritmos', 'futuro'] },
      { id: 'invencoes', name: 'Invenções', tags: ['patentes', 'criacoes'] },
      { id: 'descobertas-cientificas', name: 'Descobertas Científicas', tags: ['nobel', 'pioneiros'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 11. 🎭 CULTURA
  // --------------------------------------------------------------------------
  {
    id: 'cultura',
    slug: 'cultura',
    name: 'Cultura',
    emoji: '🎭',
    group: 'cultura_entretenimento',
    tone: 'accent',
    icon: Drama,
    description: 'Artes plásticas, literatura, teatro, folclore, tradições e património imaterial.',
    difficultyDefault: 'Variado',
    tags: ['cultura', 'arte', 'literatura', 'folclore', 'teatro', 'tradicoes'],
    questionCountEstimate: 130,
    subcategories: [
      { id: 'cultura-portuguesa-geral', name: 'Cultura Portuguesa', tags: ['nacional', 'azulejos'] },
      { id: 'cultura-mundial', name: 'Cultura Mundial', tags: ['universal', 'patrimonio-unesco'] },
      { id: 'arte-pintura-escultura', name: 'Arte, Pintura e Escultura', tags: ['museus', 'obras-primas'] },
      { id: 'literatura', name: 'Literatura', tags: ['poesia', 'romances', 'escritores'] },
      { id: 'teatro', name: 'Teatro', tags: ['pecas', 'dramaturgia'] },
      { id: 'fotografia', name: 'Fotografia', tags: ['mestres-lente', 'imagens'] },
      { id: 'musica-cultura', name: 'Música Erudita & Tradicional', tags: ['sinfonias', 'canto'] },
      { id: 'cinema-cultura', name: 'Cinema de Autor', tags: ['festivais', 'arte-setima'] },
      { id: 'televisao-cultura', name: 'Televisão Cultural', tags: ['documentarios', 'historia-tv'] },
      { id: 'cultura-popular', name: 'Cultura Popular', tags: ['romarias', 'lendas'] },
      { id: 'tradicoes-folclore', name: 'Tradições & Folclore', tags: ['ranchos', 'caretos', 'festas'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 12. 🍲 GASTRONOMIA
  // --------------------------------------------------------------------------
  {
    id: 'gastronomia',
    slug: 'gastronomia',
    name: 'Gastronomia',
    emoji: '🍲',
    group: 'cultura_entretenimento',
    tone: 'gold',
    icon: UtensilsCrossed,
    description: 'Bacalhau, pastéis de nata, vinhos, queijos, petiscos e culinária internacional.',
    difficultyDefault: 'Fácil',
    tags: ['gastronomia', 'culinaria', 'vinhos', 'pratos-tipicos', 'doces'],
    questionCountEstimate: 150,
    subcategories: [
      { id: 'gastronomia-portuguesa-geral', name: 'Gastronomia Portuguesa', tags: ['pratos-nacionais'] },
      { id: 'pratos-portugueses', name: 'Pratos Típicos Portugueses', tags: ['francesinha', 'cozido', 'bacalhau'] },
      { id: 'doces-portugueses', name: 'Doces & Sobremesas Tradicionais', tags: ['pasteis-de-nata', 'ovos-moles'] },
      { id: 'bebidas-vinhos', name: 'Bebidas & Vinhos de Portugal', tags: ['vinho-porto', 'verde', 'alentejo'] },
      { id: 'ingredientes', name: 'Ingredientes & Especiarias', tags: ['azeite', 'louro', 'marisco'] },
      { id: 'receitas-tradicionais', name: 'Receitas Tradicionais', tags: ['confeccao', 'segredos'] },
      { id: 'regioes-gastronomicas', name: 'Regiões Gastronómicas', tags: ['barrada', 'serra-estrela'] },
      { id: 'gastronomia-mundial', name: 'Gastronomia Mundial', tags: ['italia', 'franca', 'japao'] },
      { id: 'comida-internacional', name: 'Comida Internacional', tags: ['pizza', 'sushi', 'tacos'] },
      { id: 'identificacao-visual-pratos', name: 'Identificação Visual de Pratos', tags: ['foto-prato', 'visual'] },
      { id: 'curiosidades-gastronomicas', name: 'Curiosidades Gastronómicas', tags: ['origens-pratos', 'estorias'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 13. 🏆 DESPORTO
  // --------------------------------------------------------------------------
  {
    id: 'desporto',
    slug: 'desporto',
    name: 'Desporto',
    emoji: '🏆',
    group: 'cultura_entretenimento',
    tone: 'red',
    icon: Medal,
    description: 'Jogos Olímpicos, atletismo, ténis, ciclismo, surf, F1 e heróis desportivos.',
    difficultyDefault: 'Variado',
    tags: ['desporto', 'atletas', 'olimpiadas', 'modalidades', 'campeonatos'],
    questionCountEstimate: 140,
    subcategories: [
      { id: 'futebol-modalidade', name: 'Futebol Geral', tags: ['modalidade', 'regras'] },
      { id: 'atletismo', name: 'Atletismo & Maratonas', tags: ['carlos-lopes', 'rosa-mota'] },
      { id: 'tenis', name: 'Ténis', tags: ['grand-slam', 'court'] },
      { id: 'ciclismo', name: 'Ciclismo & Volta a Portugal', tags: ['bicicletas', 'camisolas'] },
      { id: 'basquetebol', name: 'Basquetebol & NBA', tags: ['cesto', 'neemias-queta'] },
      { id: 'formula-1', name: 'Fórmula 1 & Motores', tags: ['f1', 'pilotos', 'estoril', 'portimao'] },
      { id: 'surf', name: 'Surf & Ondas Gigantes', tags: ['nazare', 'garrett', 'peniche'] },
      { id: 'natacao', name: 'Natação & Desportos Aquáticos', tags: ['piscinas', 'mar'] },
      { id: 'jogos-olimpicos', name: 'Jogos Olímpicos', tags: ['ouro', 'tocha', 'medalhas'] },
      { id: 'artes-marciais', name: 'Artes Marciais & Judo', tags: ['judo', 'telma-monteiro'] },
      { id: 'motociclismo', name: 'Motociclismo & MotoGP', tags: ['miguel-oliveira'] },
      { id: 'desporto-portugues', name: 'Desporto Português', tags: ['conquistas-nacionais'] },
      { id: 'desporto-internacional', name: 'Desporto Internacional', tags: ['mundial'] },
      { id: 'recordes-desportivos', name: 'Recordes Mundiais', tags: ['marcas', 'tempos'] },
      { id: 'competicoes-desportivas', name: 'Grandes Competições', tags: ['torneios', 'tacas'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 14. 😂 HUMOR
  // --------------------------------------------------------------------------
  {
    id: 'humor',
    slug: 'humor',
    name: 'Humor',
    emoji: '😂',
    group: 'especial_caos',
    tone: 'gold',
    icon: Laugh,
    description: 'Expressões portuguesas, piadas, memes, comédia e tiradas inesquecíveis.',
    difficultyDefault: 'Fácil',
    tags: ['humor', 'comedia', 'memes', 'expressoes', 'rir'],
    questionCountEstimate: 120,
    subcategories: [
      { id: 'humor-portugues', name: 'Humor Português', tags: ['stand-up', 'humoristas'] },
      { id: 'expressoes-portuguesas', name: 'Expressões Populares Portuguesas', tags: ['ditados', 'proverbios'] },
      { id: 'memes', name: 'Memes & Internet', tags: ['viral', 'redes-sociais'] },
      { id: 'cultura-popular-humor', name: 'Comédia na TV & Cinema', tags: ['gato-fedorento', 'herman'] },
      { id: 'situacoes-quotidiano', name: 'Situações do Quotidiano', tags: ['tuga', 'dia-a-dia'] },
      { id: 'perguntas-engracadas', name: 'Perguntas Engraçadas', tags: ['charadas', 'rir'] },
      { id: 'curiosidades-engracadas', name: 'Curiosidades Hilariantes', tags: ['factos-comicos'] },
      { id: 'modo-maluco-humor', name: 'Humor Absurdo', tags: ['loucura', 'rir-muito'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 15. 🎵 MÚSICA
  // --------------------------------------------------------------------------
  {
    id: 'musica',
    slug: 'musica',
    name: 'Música',
    emoji: '🎵',
    group: 'cultura_entretenimento',
    tone: 'accent',
    icon: Music,
    description: 'Do Fado ao Rock, do Pop aos festivais, bandas lendárias e grandes sucessos.',
    difficultyDefault: 'Variado',
    tags: ['musica', 'fado', 'rock', 'pop', 'artistas', 'cancoes'],
    questionCountEstimate: 150,
    subcategories: [
      { id: 'musica-portuguesa-geral', name: 'Música Portuguesa', tags: ['nacional', 'autores'] },
      { id: 'fado', name: 'Fado & Guitarra Portuguesa', tags: ['amalia', 'mariza', 'alfama', 'coimbra'] },
      { id: 'musica-popular-portuguesa', name: 'Música Popular & Pimba', tags: ['quim-barreiros', 'romarias'] },
      { id: 'artistas-portugueses', name: 'Artistas & Cantores Portugueses', tags: ['vozes', 'solistas'] },
      { id: 'bandas-portuguesas', name: 'Bandas Portuguesas', tags: ['xutos', 'orquestra', 'gNR'] },
      { id: 'musica-internacional', name: 'Música Internacional', tags: ['hits', 'global'] },
      { id: 'artistas-internacionais', name: 'Artistas Internacionais', tags: ['estrelas', 'grammy'] },
      { id: 'bandas-internacionais', name: 'Bandas Internacionais Lendárias', tags: ['queen', 'beatles'] },
      { id: 'cancoes', name: 'Grandes Canções', tags: ['letras', 'refrões'] },
      { id: 'albuns', name: 'Álbuns Históricos', tags: ['discos', 'vinil'] },
      { id: 'instrumentos', name: 'Instrumentos Musicais', tags: ['cavaquinho', 'orquestra'] },
      { id: 'historia-musica', name: 'História da Música', tags: ['barroco', 'rock-n-roll'] },
      { id: 'festivais-musica', name: 'Festivais de Música', tags: ['rock-in-rio', 'super-bock', 'nos-alive'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 16. 🎬 CINEMA E TELEVISÃO
  // --------------------------------------------------------------------------
  {
    id: 'cinema-tv',
    slug: 'cinema-tv',
    name: 'Cinema e Televisão',
    emoji: '🎬',
    group: 'cultura_entretenimento',
    tone: 'red',
    icon: Clapperboard,
    description: 'Filmes icónicos, séries, novelas portuguesas, atores e momentos de antena.',
    difficultyDefault: 'Médio',
    tags: ['cinema', 'tv', 'filmes', 'series', 'novelas', 'atores'],
    questionCountEstimate: 130,
    subcategories: [
      { id: 'filmes', name: 'Grandes Filmes', tags: ['hollywood', 'oscares'] },
      { id: 'series', name: 'Séries Marcantes', tags: ['streaming', 'temporadas'] },
      { id: 'atores-atrizes', name: 'Atores e Atrizes', tags: ['estrelas', 'elenco'] },
      { id: 'personagens', name: 'Personagens Inesquecíveis', tags: ['herois', 'viloes'] },
      { id: 'realizadores', name: 'Realizadores', tags: ['cinema-autores', 'direcao'] },
      { id: 'cinema-portugues', name: 'Cinema Português', tags: ['manoel-de-oliveira', 'capitaes-abril'] },
      { id: 'televisao-portuguesa', name: 'Televisão Portuguesa', tags: ['rtp', 'sic', 'tvi'] },
      { id: 'programas-televisao', name: 'Programas de Televisão Clássicos', tags: ['concursos', 'talk-shows'] },
      { id: 'streaming', name: 'Streaming & Novas Séries', tags: ['netflix', 'hbo', 'disney'] },
      { id: 'cultura-pop', name: 'Cultura Pop & Geek', tags: ['super-herois', 'animacao'] },
      { id: 'filmes-classicos', name: 'Filmes Clássicos', tags: ['anos-dourados', 'preto-e-branco'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 17. 👤 PERSONALIDADES
  // --------------------------------------------------------------------------
  {
    id: 'personalidades',
    slug: 'personalidades',
    name: 'Personalidades',
    emoji: '👤',
    group: 'conhecimento',
    tone: 'primary',
    icon: Lightbulb,
    description: 'Figuras que marcaram a história, a ciência, as artes e o mundo moderno.',
    difficultyDefault: 'Médio',
    tags: ['personalidades', 'biografias', 'escritores', 'cientistas', 'lideres'],
    questionCountEstimate: 140,
    subcategories: [
      { id: 'figuras-historicas', name: 'Figuras Históricas', tags: ['passado', 'reis', 'pioneiros'] },
      { id: 'politicos', name: 'Políticos & Estadistas', tags: ['chefes-de-estado', 'diplomatas'] },
      { id: 'artistas', name: 'Artistas & Pintores', tags: ['paula-rego', 'amadeo'] },
      { id: 'atletas', name: 'Atletas Lendários', tags: ['cr7', 'egase-moniz'] },
      { id: 'cientistas', name: 'Cientistas & Pensadores', tags: ['nobel', 'egase-moniz'] },
      { id: 'empresarios', name: 'Empresários & Empreendedores', tags: ['negocios', 'criadores'] },
      { id: 'escritores', name: 'Escritores & Poetas', tags: ['camoes', 'pessoa', 'saramago'] },
      { id: 'musicos', name: 'Músicos & Compositores', tags: ['artistas-musicais'] },
      { id: 'atores', name: 'Atores & Intérpretes', tags: ['artes-cenicas'] },
      { id: 'criadores', name: 'Criadores & Inovadores', tags: ['inventores'] },
      { id: 'personalidades-internacionais', name: 'Personalidades Internacionais', tags: ['figuras-mundiais'] },
      { id: 'personalidades-portuguesas', name: 'Personalidades Portuguesas', tags: ['lusitanos-notaveis'] },
    ],
  },

  // --------------------------------------------------------------------------
  // 18. 🌐 MUNDO
  // --------------------------------------------------------------------------
  {
    id: 'mundo',
    slug: 'mundo',
    name: 'Mundo',
    emoji: '🌐',
    group: 'conhecimento',
    tone: 'primary',
    icon: Earth,
    description: 'Culturas globais, capitais, história mundial, geopolítica e maravilhas da Terra.',
    difficultyDefault: 'Variado',
    tags: ['mundo', 'internacional', 'global', 'paises', 'capitais', 'culturas'],
    questionCountEstimate: 180,
    subcategories: [
      { id: 'paises-mundo', name: 'Países & Continentes', tags: ['mapa-mundi', 'geopolitica'] },
      { id: 'capitais-mundo', name: 'Capitais do Mundo', tags: ['capitais-globais'] },
      { id: 'historia-mundial-geral', name: 'História Mundial', tags: ['eras-globais'] },
      { id: 'geografia-mundial-geral', name: 'Geografia Mundial', tags: ['oceanos', 'montanhas-globo'] },
      { id: 'cultura-mundo', name: 'Culturas & Costumes Globais', tags: ['tradicoes-mundo'] },
      { id: 'ciencia-tecnologia-mundo', name: 'Ciência & Tecnologia no Mundo', tags: ['avancos-globais'] },
      { id: 'economia-mundo', name: 'Economia Global', tags: ['mercados-mundiais'] },
      { id: 'desporto-mundo', name: 'Desporto Mundial', tags: ['campeonatos-globais'] },
      { id: 'musica-mundo', name: 'Música do Mundo', tags: ['sons-do-planeta'] },
      { id: 'cinema-mundo', name: 'Cinema Internacional', tags: ['festivais-globais'] },
      { id: 'personalidades-mundo', name: 'Personalidades do Mundo', tags: ['figuras-universais'] },
      { id: 'curiosidades-mundo', name: 'Curiosidades Mundiais', tags: ['factos-estupendos'] },
      { id: 'atualidade-internacional', name: 'Atualidade Internacional', tags: ['noticias-mundo'] },
    ],
  },
]

// ============================================================================
// 3. CATEGORIAS TERRITORIAIS (DISTRITOS DE PORTUGAL & EXPANSÃO)
// ============================================================================

export interface DistrictTerritory {
  name: string
  code: string
  region: 'Norte' | 'Centro' | 'Lisboa e Vale do Tejo' | 'Alentejo' | 'Algarve' | 'Açores' | 'Madeira'
  capital: string
  titleBadge: string // ex: "Rei de Vila Real"
  conquerEventName: string // ex: "Conquista de Vila Real"
  subcategories: string[]
}

export const PORTUGAL_20_TERRITORIES: DistrictTerritory[] = [
  {
    name: 'Aveiro',
    code: 'AVR',
    region: 'Centro',
    capital: 'Aveiro',
    titleBadge: 'Rei da Ria de Aveiro',
    conquerEventName: 'Conquista de Aveiro',
    subcategories: ['História Local', 'Geografia Local', 'Ria & Costa', 'Ovos Moles & Gastronomia', 'Monumentos', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Beja',
    code: 'BJA',
    region: 'Alentejo',
    capital: 'Beja',
    titleBadge: 'Rei do Baixo Alentejo',
    conquerEventName: 'Conquista de Beja',
    subcategories: ['História Local', 'Geografia Local', 'Cultura Alentejana', 'Gastronomia', 'Castelo & Monumentos', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Braga',
    code: 'BRG',
    region: 'Norte',
    capital: 'Braga',
    titleBadge: 'Rei dos Arcebispos de Braga',
    conquerEventName: 'Conquista de Braga',
    subcategories: ['História Romana & Religiosa', 'Geografia do Minho', 'Tradições & Festas', 'Gastronomia Minhota', 'Bom Jesus & Sé', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Bragança',
    code: 'BGC',
    region: 'Norte',
    capital: 'Bragança',
    titleBadge: 'Rei de Trás-os-Montes',
    conquerEventName: 'Conquista de Bragança',
    subcategories: ['História de Bragança', 'Montesinho & Geografia', 'Caretos & Tradições', 'Alheira & Gastronomia', 'Cidadela & Monumentos', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Castelo Branco',
    code: 'CTB',
    region: 'Centro',
    capital: 'Castelo Branco',
    titleBadge: 'Rei da Beira Baixa',
    conquerEventName: 'Conquista de Castelo Branco',
    subcategories: ['História Templária', 'Geografia da Beira Baixa', 'Bordados & Tradições', 'Gastronomia', 'Monumentos & Aldeias Históricas', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Coimbra',
    code: 'CBR',
    region: 'Centro',
    capital: 'Coimbra',
    titleBadge: 'Rei do Conhecimento de Coimbra',
    conquerEventName: 'Conquista de Coimbra',
    subcategories: ['Universidade & História', 'Rio Mondego & Geografia', 'Fado de Coimbra & Tradições', 'Chanfana & Gastronomia', 'Monumentos', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Évora',
    code: 'EVR',
    region: 'Alentejo',
    capital: 'Évora',
    titleBadge: 'Rei da História de Évora',
    conquerEventName: 'Conquista de Évora',
    subcategories: ['Templo Romano & História', 'Planície Alentejana', 'Cante Alentejano', 'Açordas & Vinhos', 'Capela dos Ossos & Monumentos', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Faro',
    code: 'FAR',
    region: 'Algarve',
    capital: 'Faro',
    titleBadge: 'Rei do Algarve',
    conquerEventName: 'Conquista de Faro',
    subcategories: ['História Mourisca & Marítima', 'Ria Formosa & Praias', 'Tradições Algarvias', 'Cataplana & Doces de Figo', 'Fortalezas & Monumentos', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Guarda',
    code: 'GRD',
    region: 'Centro',
    capital: 'Guarda',
    titleBadge: 'Rei da Mais Alta de Portugal',
    conquerEventName: 'Conquista da Guarda',
    subcategories: ['História Medieval', 'Serra da Estrela & Neve', 'Aldeias Históricas', 'Queijo da Serra & Sabores', 'Sé Catedral & Castelos', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Leiria',
    code: 'LRA',
    region: 'Centro',
    capital: 'Leiria',
    titleBadge: 'Rei do Pinhal de Leiria',
    conquerEventName: 'Conquista de Leiria',
    subcategories: ['Batalha, Alcobaça & História', 'Pinhal & Costa de Prata', 'Tradições do Oeste', 'Brisa do Lis & Gastronomia', 'Mosteiros & Castelo', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Lisboa',
    code: 'LIS',
    region: 'Lisboa e Vale do Tejo',
    capital: 'Lisboa',
    titleBadge: 'Rei da Capital Lisboa',
    conquerEventName: 'Conquista de Lisboa',
    subcategories: ['História da Capital', 'Sete Colinas & Tejo', 'Marchas Populares & Fado', 'Pastéis de Belém & Gastronomia', 'Torre de Belém & Jerónimos', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Portalegre',
    code: 'PTG',
    region: 'Alentejo',
    capital: 'Portalegre',
    titleBadge: 'Rei de São Mamede',
    conquerEventName: 'Conquista de Portalegre',
    subcategories: ['História & Castelos de Fronteira', 'Serra de São Mamede', 'Tapeçarias & Tradições', 'Gastronomia Alentejana', 'Marvão, Elvas & Monumentos', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Porto',
    code: 'PRT',
    region: 'Norte',
    capital: 'Porto',
    titleBadge: 'Rei da Cidade Invicta',
    conquerEventName: 'Conquista do Porto',
    subcategories: ['História da Invicta', 'Rio Douro & Ribeira', 'São João & Tradições', 'Francesinha & Tripas', 'Torre dos Clérigos & Pontes', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Santarém',
    code: 'STR',
    region: 'Lisboa e Vale do Tejo',
    capital: 'Santarém',
    titleBadge: 'Rei do Ribatejo',
    conquerEventName: 'Conquista de Santarém',
    subcategories: ['Capital do Gótico & História', 'Lezíria do Tejo', 'Campinos & Tradições', 'Sopa da Pedra & Sabores', 'Convento de Cristo & Monumentos', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Setúbal',
    code: 'STB',
    region: 'Lisboa e Vale do Tejo',
    capital: 'Setúbal',
    titleBadge: 'Rei da Península de Setúbal',
    conquerEventName: 'Conquista de Setúbal',
    subcategories: ['Bocage & História Marítima', 'Arrábida & Estuário do Sado', 'Tradições de Pescadores', 'Choco Frito & Moscatel', 'Fortaleza & Castelos', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Viana do Castelo',
    code: 'VNC',
    region: 'Norte',
    capital: 'Viana do Castelo',
    titleBadge: 'Rei do Alto Minho',
    conquerEventName: 'Conquista de Viana do Castelo',
    subcategories: ['História dos Navegadores', 'Rio Lima & Litoral Norte', 'Romaria d Agonia & Ouro', 'Bacalhau à Viana & Sabores', 'Santa Luzia & Monumentos', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Vila Real',
    code: 'VLR',
    region: 'Norte',
    capital: 'Vila Real',
    titleBadge: 'Rei de Trás-os-Montes e Douro',
    conquerEventName: 'Conquista de Vila Real',
    subcategories: ['História & Diogo Cão', 'Alto Douro Vinhateiro & Marão', 'Barro Preto & Tradições', 'Carne Maronesa & Covilhetes', 'Palácio de Mateus & Monumentos', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Viseu',
    code: 'VIS',
    region: 'Centro',
    capital: 'Viseu',
    titleBadge: 'Rei da Cidade de Viriato',
    conquerEventName: 'Conquista de Viseu',
    subcategories: ['Viriato, Grão Vasco & História', 'Dão Lafões & Geografia', 'Feira de São Mateus & Tradições', 'Rancho & Vinhos do Dão', 'Sé de Viseu & Monumentos', 'Personalidades', 'Curiosidades'],
  },
  {
    name: 'Açores',
    code: 'ACO',
    region: 'Açores',
    capital: 'Ponta Delgada',
    titleBadge: 'Rei do Arquipélago dos Açores',
    conquerEventName: 'Conquista dos Açores',
    subcategories: ['História Insular', '9 Ilhas, Vulcões & Lagoas', 'Espírito Santo & Tradições', 'Cozido das Furnas & Queijo', 'Igrejas, Miradouros & Monumentos', 'Personalidades Açorianas', 'Curiosidades'],
  },
  {
    name: 'Madeira',
    code: 'MAD',
    region: 'Madeira',
    capital: 'Funchal',
    titleBadge: 'Rei da Pérola do Atlântico',
    conquerEventName: 'Conquista da Madeira',
    subcategories: ['Zarco & História da Madeira', 'Laurissilva, Levadas & Picos', 'Festa da Flor & Carnaval', 'Espetada, Bolo do Caco & Poncha', 'Forte de São Tiago & Monumentos', 'Personalidades Madeirenses', 'Curiosidades'],
  },
]

// ============================================================================
// 4. ESTRUTURA PARA EXPANSÃO FUTURA (BRASIL & MUNDO LUSÓFONO)
// ============================================================================

export interface LusophoneCountry {
  code: string
  name: string
  emoji: string
  active: boolean
  statesOrProvincesCount?: number
}

export const LUSOPHONE_COUNTRIES: LusophoneCountry[] = [
  { code: 'PT', name: 'Portugal', emoji: '🇵🇹', active: true, statesOrProvincesCount: 20 },
  { code: 'BR', name: 'Brasil', emoji: '🇧🇷', active: false, statesOrProvincesCount: 27 },
  { code: 'AO', name: 'Angola', emoji: '🇦🇴', active: false, statesOrProvincesCount: 18 },
  { code: 'MZ', name: 'Moçambique', emoji: '🇲🇿', active: false, statesOrProvincesCount: 11 },
  { code: 'CV', name: 'Cabo Verde', emoji: '🇨🇻', active: false, statesOrProvincesCount: 22 },
  { code: 'GW', name: 'Guiné-Bissau', emoji: '🇬🇼', active: false, statesOrProvincesCount: 8 },
  { code: 'ST', name: 'São Tomé e Príncipe', emoji: '🇸🇹', active: false, statesOrProvincesCount: 7 },
  { code: 'TL', name: 'Timor-Leste', emoji: '🇹🇱', active: false, statesOrProvincesCount: 14 },
]

export const BRAZIL_EXPANSION_SCHEMA = {
  country: 'BR',
  name: 'Acorda Brasil',
  states: [
    'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal',
    'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul',
    'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí',
    'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia',
    'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins',
  ],
  modules: [
    'História do Brasil', 'Geografia do Brasil', 'Cultura Brasileira',
    'Gastronomia Brasileira', 'Música & MPB', 'Futebol Brasileiro',
    'Natureza & Amazónia', 'Monumentos & Cidades', 'Personalidades',
    'Desafio Visual Brasil', 'Portugal vs Brasil',
  ],
}

// ============================================================================
// 5. TIPOS E MODOS ESPECIAIS DE PERGUNTA
// ============================================================================

export type QuestionType =
  | 'multipla_escolha'
  | 'verdadeiro_ou_falso'
  | 'pergunta_rapida'
  | 'pergunta_facil'
  | 'pergunta_media'
  | 'pergunta_dificil'
  | 'pergunta_elite'
  | 'desafio_relampago'
  | 'quem_sou_eu'
  | 'onde_fica'
  | 'encontra_detalhe'
  | 'desafio_mapas'
  | 'desafio_bandeiras'
  | 'desafio_bracoes'
  | 'desafio_fotografias'
  | 'desafio_visual'
  | 'curiosidade'
  | 'pergunta_do_dia'
  | 'atualidade_do_dia'
  | 'evento_especial'
  | 'desafio_nacional'
  | 'caca_ao_tesouro'

export interface QuestionTypeConfig {
  type: QuestionType
  name: string
  description: string
  timeLimitSeconds: number
  icon?: ComponentType<{ className?: string }>
}

export const QUESTION_TYPES_CONFIG: Record<QuestionType, QuestionTypeConfig> = {
  multipla_escolha: { type: 'multipla_escolha', name: 'Múltipla Escolha', description: 'Pergunta clássica de 4 opções', timeLimitSeconds: 20 },
  verdadeiro_ou_falso: { type: 'verdadeiro_ou_falso', name: 'Verdadeiro ou Falso', description: 'Duas opções rápidas', timeLimitSeconds: 12 },
  pergunta_rapida: { type: 'pergunta_rapida', name: 'Pergunta Rápida', description: 'Velocidade máxima com tempo reduzido', timeLimitSeconds: 10 },
  pergunta_facil: { type: 'pergunta_facil', name: 'Pergunta Fácil', description: 'Conceitos fundamentais', timeLimitSeconds: 20 },
  pergunta_media: { type: 'pergunta_media', name: 'Pergunta Média', description: 'Desafio equilibrado', timeLimitSeconds: 20 },
  pergunta_dificil: { type: 'pergunta_dificil', name: 'Pergunta Difícil', description: 'Conhecimento aprofundado', timeLimitSeconds: 20 },
  pergunta_elite: { type: 'pergunta_elite', name: 'Pergunta de Elite', description: 'Para verdadeiros mestres', timeLimitSeconds: 25 },
  desafio_relampago: { type: 'desafio_relampago', name: 'Desafio Relâmpago', description: 'Série de respostas sem pausas', timeLimitSeconds: 8 },
  quem_sou_eu: { type: 'quem_sou_eu', name: 'Quem Sou Eu?', description: 'Pistas para adivinhar a personalidade', timeLimitSeconds: 20 },
  onde_fica: { type: 'onde_fica', name: 'Onde Fica?', description: 'Localização de terras, praias e monumentos', timeLimitSeconds: 20 },
  encontra_detalhe: { type: 'encontra_detalhe', name: 'Encontra o Detalhe', description: 'Observação atenta de uma imagem', timeLimitSeconds: 20 },
  desafio_mapas: { type: 'desafio_mapas', name: 'Desafio de Mapas', description: 'Geografia cartográfica', timeLimitSeconds: 20 },
  desafio_bandeiras: { type: 'desafio_bandeiras', name: 'Desafio de Bandeiras', description: 'Reconhecimento de bandeiras', timeLimitSeconds: 15 },
  desafio_bracoes: { type: 'desafio_bracoes', name: 'Desafio de Brasões', description: 'Heráldica das vilas e cidades', timeLimitSeconds: 20 },
  desafio_fotografias: { type: 'desafio_fotografias', name: 'Desafio de Fotografias', description: 'Fotos históricas e postais', timeLimitSeconds: 20 },
  desafio_visual: { type: 'desafio_visual', name: 'Desafio Visual', description: 'Pergunta baseada em imagem', timeLimitSeconds: 20 },
  curiosidade: { type: 'curiosidade', name: 'Curiosidade', description: 'Factos surpreendentes e insólitos', timeLimitSeconds: 20 },
  pergunta_do_dia: { type: 'pergunta_do_dia', name: 'Pergunta do Dia', description: 'Desafio diário com bónus de XP', timeLimitSeconds: 20 },
  atualidade_do_dia: { type: 'atualidade_do_dia', name: 'Atualidade do Dia', description: 'Acontecimentos recentes em Portugal', timeLimitSeconds: 20 },
  evento_especial: { type: 'evento_especial', name: 'Evento Especial', description: 'Desafio temático de temporada', timeLimitSeconds: 20 },
  desafio_nacional: { type: 'desafio_nacional', name: 'Desafio Nacional', description: 'Confronto geral por distritos', timeLimitSeconds: 20 },
  caca_ao_tesouro: { type: 'caca_ao_tesouro', name: 'Caça ao Tesouro', description: 'Pistas consecutivas de património', timeLimitSeconds: 25 },
}

// ============================================================================
// 6. DIFICULDADES E MULTIPLICADORES
// ============================================================================

export type DifficultySlug = 'facil' | 'medio' | 'dificil' | 'muito_dificil' | 'elite'

export interface ExtendedDifficultyConfig {
  slug: DifficultySlug
  label: string
  name: string
  xpMultiplier: number
  coinMultiplier: number
  color: string
}

export const EXTENDED_DIFFICULTIES: Record<DifficultySlug, ExtendedDifficultyConfig> = {
  facil: { slug: 'facil', label: 'Fácil', name: 'Nível 1 — Fácil', xpMultiplier: 1.0, coinMultiplier: 1.0, color: '#22c55e' },
  medio: { slug: 'medio', label: 'Médio', name: 'Nível 2 — Médio', xpMultiplier: 1.2, coinMultiplier: 1.2, color: '#3b82f6' },
  dificil: { slug: 'dificil', label: 'Difícil', name: 'Nível 3 — Difícil', xpMultiplier: 1.5, coinMultiplier: 1.5, color: '#f97316' },
  muito_dificil: { slug: 'muito_dificil', label: 'Muito Difícil', name: 'Nível 4 — Muito Difícil', xpMultiplier: 2.0, coinMultiplier: 2.0, color: '#ef4444' },
  elite: { slug: 'elite', label: 'Elite', name: 'Nível 5 — Elite', xpMultiplier: 3.0, coinMultiplier: 3.0, color: '#a855f7' },
}

// ============================================================================
// 7. ESTRUTURA EXPANDIDA DE PERGUNTA (SCHEMAS & FILTROS)
// ============================================================================

export interface ExtendedQuizQuestion {
  id: string | number
  category: string
  subcategory?: string
  questionType?: QuestionType
  question: string
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[]
  correct: 'A' | 'B' | 'C' | 'D'
  explanation?: string
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Muito Difícil' | 'Elite' | 'Variado'
  points?: number
  country?: string // ex: 'PT', 'BR', 'WORLD'
  district?: string // ex: 'Vila Real', 'Porto', 'Lisboa'
  city?: string
  tags?: string[]
  image?: string
  source?: string
  validUntil?: string // para notícias e atualidade
  active?: boolean
  season?: string
  event?: string
  createdAt?: string
  updatedAt?: string
}

export interface QuestionFilterCriteria {
  categorySlug?: string
  subcategorySlug?: string
  questionType?: QuestionType
  difficulty?: string
  country?: string
  district?: string
  city?: string
  tag?: string
  search?: string
  activeOnly?: boolean
  season?: string
  event?: string
}

// ============================================================================
// 8. FUNÇÕES UTILITÁRIAS DE CONSULTA E MAPEAMENTO
// ============================================================================

/** Obter todas as categorias principais */
export function getAllCategories(): MainCategory[] {
  return MAIN_CATEGORIES
}

/** Obter uma categoria pelo slug */
export function getCategoryBySlug(slug: string): MainCategory | undefined {
  const clean = (slug || '').toLowerCase().trim()
  return MAIN_CATEGORIES.find((c) => c.slug === clean || c.id === clean)
}

/** Obter todas as subcategorias de uma categoria */
export function getSubcategoriesForCategory(categorySlug: string): SubcategoryItem[] {
  const cat = getCategoryBySlug(categorySlug)
  return cat ? cat.subcategories : []
}

/** Obter dados de um território/distrito */
export function getDistrictTerritory(nameOrCode: string): DistrictTerritory | undefined {
  const clean = (nameOrCode || '').toLowerCase().trim()
  return PORTUGAL_20_TERRITORIES.find(
    (d) => d.name.toLowerCase() === clean || d.code.toLowerCase() === clean,
  )
}

/** Mapeamento gracioso de nomes de categoria para slugs normalizados */
export function normalizeCategorySlug(rawNameOrSlug: string): string {
  const map: Record<string, string> = {
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
    'música': 'musica',
    'musica': 'musica',
    'música portuguesa': 'musica',
    'cinema e televisão': 'cinema-tv',
    'cinema & televisão': 'cinema-tv',
    'cinema-tv': 'cinema-tv',
    'ciência e tecnologia': 'ciencia-tecnologia',
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
  }

  const clean = (rawNameOrSlug || '').toLowerCase().trim()
  return map[clean] || clean.replace(/\s+/g, '-')
}

/** Filtrar perguntas por múltiplos critérios flexíveis */
export function filterQuizQuestions(
  questionsList: ExtendedQuizQuestion[],
  criteria: QuestionFilterCriteria,
): ExtendedQuizQuestion[] {
  return questionsList.filter((q) => {
    if (criteria.activeOnly && q.active === false) return false

    if (criteria.categorySlug) {
      const catNorm = normalizeCategorySlug(criteria.categorySlug)
      const qCatNorm = normalizeCategorySlug(q.category)
      if (catNorm !== 'todos' && catNorm !== 'todas' && qCatNorm !== catNorm) {
        return false
      }
    }

    if (criteria.subcategorySlug && q.subcategory) {
      const subNorm = criteria.subcategorySlug.toLowerCase().trim()
      const qSubNorm = q.subcategory.toLowerCase().trim()
      if (subNorm !== 'todas' && subNorm !== 'todos' && qSubNorm !== subNorm) {
        return false
      }
    }

    if (criteria.questionType && q.questionType && q.questionType !== criteria.questionType) {
      return false
    }

    if (criteria.difficulty && q.difficulty) {
      const diffNorm = criteria.difficulty.toLowerCase().trim()
      const qDiffNorm = q.difficulty.toLowerCase().trim()
      if (diffNorm !== 'variado' && qDiffNorm !== diffNorm) {
        return false
      }
    }

    if (criteria.country && q.country && q.country !== criteria.country) {
      return false
    }

    if (criteria.district && q.district) {
      if (q.district.toLowerCase().trim() !== criteria.district.toLowerCase().trim()) {
        return false
      }
    }

    if (criteria.city && q.city) {
      if (q.city.toLowerCase().trim() !== criteria.city.toLowerCase().trim()) {
        return false
      }
    }

    if (criteria.season && q.season && q.season !== criteria.season) {
      return false
    }

    if (criteria.event && q.event && q.event !== criteria.event) {
      return false
    }

    if (criteria.tag && q.tags) {
      const targetTag = criteria.tag.toLowerCase().trim()
      const hasTag = q.tags.some((t) => t.toLowerCase() === targetTag)
      if (!hasTag) return false
    }

    if (criteria.search) {
      const s = criteria.search.toLowerCase().trim()
      const inQuestion = q.question.toLowerCase().includes(s)
      const inExplanation = q.explanation?.toLowerCase().includes(s) ?? false
      const inCategory = q.category.toLowerCase().includes(s)
      const inSubcategory = q.subcategory?.toLowerCase().includes(s) ?? false
      if (!inQuestion && !inExplanation && !inCategory && !inSubcategory) {
        return false
      }
    }

    return true
  })
}

