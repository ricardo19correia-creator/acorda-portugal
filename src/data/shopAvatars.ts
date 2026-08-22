export type AvatarRarity = 'Comum' | 'Raro' | 'Épico' | 'Lendário' | 'Exclusivo'

export interface AvatarItem {
  id: string
  name: string
  categoryKey: string
  categoryTitle: string
  rarity: AvatarRarity
  price: number | null // null se for Exclusivo de Mérito
  unlockCondition?: string // Ex: 'Top 10 Nacional Temporada 1', 'Vencedor do Torneio', 'Fundador'
  description: string
  image: string
  icon: string
  isExclusive: boolean
}

export interface AvatarCategoryMeta {
  key: string
  title: string
  icon: string
}

export const AVATAR_18_CATEGORIES: AvatarCategoryMeta[] = [
  { key: 'todos', title: 'Todos os Avatares', icon: '✨' },
  { key: 'exclusivos', title: '👑 Exclusivos & Mérito', icon: '👑' },
  { key: 'portugal', title: '🇵🇹 Portugal & Heróis', icon: '🇵🇹' },
  { key: 'atualidade', title: '📰 Atualidade', icon: '📰' },
  { key: 'politica', title: '🏛️ Política & Cidadania', icon: '🏛️' },
  { key: 'empresas', title: '💼 Empresas & Economia', icon: '💼' },
  { key: 'futebol', title: '⚽ Futebol Nacional', icon: '⚽' },
  { key: 'visual', title: '👁️ Desafio Visual', icon: '👁️' },
  { key: 'modo-maluco', title: '🤪 Modo Maluco', icon: '🤪' },
  { key: 'historia', title: '📜 História & Conquistadores', icon: '📜' },
  { key: 'geografia', title: '🌍 Geografia & Território', icon: '🌍' },
  { key: 'ciencia', title: '🔬 Ciência & Tecnologia', icon: '🔬' },
  { key: 'cultura', title: '🎨 Cultura & Tradições', icon: '🎨' },
  { key: 'musica', title: '🎵 Música & Fado', icon: '🎵' },
  { key: 'gastronomia', title: '🍲 Gastronomia Portuguesa', icon: '🍲' },
  { key: 'cinema-tv', title: '🎬 Cinema & Televisão', icon: '🎬' },
  { key: 'desporto', title: '🏆 Desporto Geral', icon: '🏆' },
  { key: 'curiosidades', title: '💡 Curiosidades & Sabedoria', icon: '💡' },
  { key: 'gaming', title: '🎮 Gaming & Cultura Pop', icon: '🎮' },
  { key: 'mundo', title: '🌐 Portugal no Mundo', icon: '🌐' }
]

export const avatarShopList: AvatarItem[] = [
  // ============================================================================
  // SECÇÃO ESPECIAL: AVATARES EXCLUSIVOS POR MÉRITO & CONQUISTAS (SEM PREÇO)
  // ============================================================================
  {
    id: 'exclusivo_fundador',
    name: 'Guardião Fundador',
    categoryKey: 'exclusivos',
    categoryTitle: 'Prestígio',
    rarity: 'Exclusivo',
    price: null,
    unlockCondition: 'Exclusivo dos Pioneiros / Passe Fundador',
    description: 'Selo mítico e moldura estelar reservada aos jogadores fundadores do Acorda Portugal.',
    image: '/images/shop/passe-fundador.jpg',
    icon: '🏅',
    isExclusive: true
  },
  {
    id: 'exclusivo_campeao',
    name: 'Campeão Nacional',
    categoryKey: 'exclusivos',
    categoryTitle: 'Torneios',
    rarity: 'Exclusivo',
    price: null,
    unlockCondition: 'Vencedor de Evento ou Torneio Oficial',
    description: 'A distinção máxima outorgada ao grande campeão de um torneio nacional do Acorda Portugal.',
    image: '/images/avatars/camoes-2050.jpg',
    icon: '🏆',
    isExclusive: true
  },
  {
    id: 'exclusivo_top10',
    name: 'Titã do Top 10',
    categoryKey: 'exclusivos',
    categoryTitle: 'Rankings',
    rarity: 'Exclusivo',
    price: null,
    unlockCondition: 'Top 10 Nacional na Temporada 1',
    description: 'Consagrado entre a elite dos 10 melhores estrategas de Portugal.',
    image: '/images/avatars/afonso-mecha.jpg',
    icon: '🥇',
    isExclusive: true
  },
  {
    id: 'exclusivo_distrital',
    name: 'Representante Distrital',
    categoryKey: 'exclusivos',
    categoryTitle: 'Distrital',
    rarity: 'Exclusivo',
    price: null,
    unlockCondition: 'Top 1 no Ranking do teu Distrito',
    description: 'O guardião e líder supremo com o brasão honorífico do seu distrito.',
    image: '/images/avatars/sentinela-estrela.jpg',
    icon: '🇵🇹',
    isExclusive: true
  },
  {
    id: 'exclusivo_lenda_100',
    name: 'Lenda Suprema do Acorda',
    categoryKey: 'exclusivos',
    categoryTitle: 'Conquistas',
    rarity: 'Exclusivo',
    price: null,
    unlockCondition: 'Conquista de 100 Vitórias Consecutivas',
    description: 'Forjado na glória imortal de 100 batalhas invictas no modo 1v1.',
    image: '/images/avatars/tita-nazare.jpg',
    icon: '🔥',
    isExclusive: true
  },

  // ============================================================================
  // 1. PORTUGAL & HERÓIS
  // ============================================================================
  {
    id: 'av_portugues_classico',
    name: 'Português Clássico',
    categoryKey: 'portugal',
    categoryTitle: 'Portugal & Heróis',
    rarity: 'Comum',
    price: 500,
    description: 'Orgulhoso cidadão lusitano de alma nobre e coração valente.',
    image: '/images/avatars/guardiao-vulcanico.jpg',
    icon: '🇵🇹',
    isExclusive: false
  },
  {
    id: 'av_guardiao_quinas',
    name: 'Guardião das Quinas',
    categoryKey: 'portugal',
    categoryTitle: 'Portugal & Heróis',
    rarity: 'Épico',
    price: 3000,
    description: 'Armadura reluzente ornada pelos cinco escudos e castelos da nação.',
    image: '/images/shop/cyborg-quinas.jpg',
    icon: '🛡️',
    isExclusive: false
  },
  {
    id: 'av_heroi_portugal',
    name: 'Herói de Portugal',
    categoryKey: 'portugal',
    categoryTitle: 'Portugal & Heróis',
    rarity: 'Lendário',
    price: 4500,
    description: 'A encarnação do espírito indomável que moldou quase nove séculos de história.',
    image: '/images/avatars/afonso-mecha.jpg',
    icon: '👑',
    isExclusive: false
  },

  // ============================================================================
  // 2. ATUALIDADE
  // ============================================================================
  {
    id: 'av_reporter_digital',
    name: 'Repórter Digital',
    categoryKey: 'atualidade',
    categoryTitle: 'Atualidade',
    rarity: 'Comum',
    price: 600,
    description: 'Sempre na linha da frente a captar as notícias que movem o país.',
    image: '/images/avatars/piloto-estoril.jpg',
    icon: '🎙️',
    isExclusive: false
  },
  {
    id: 'av_investigador_noticias',
    name: 'Investigador de Notícias',
    categoryKey: 'atualidade',
    categoryTitle: 'Atualidade',
    rarity: 'Épico',
    price: 2800,
    description: 'Mente analítica implacável que desvenda factos e cruza dados em tempo real.',
    image: '/images/avatars/sentinela-estrela.jpg',
    icon: '📰',
    isExclusive: false
  },

  // ============================================================================
  // 3. POLÍTICA & CIDADANIA
  // ============================================================================
  {
    id: 'av_eleitor_consciente',
    name: 'Eleitor Consciente',
    categoryKey: 'politica',
    categoryTitle: 'Política & Cidadania',
    rarity: 'Comum',
    price: 600,
    description: 'Cidadão informado e defensor ativo da democracia participativa.',
    image: '/images/avatars/camoes-2050.jpg',
    icon: '🗳️',
    isExclusive: false
  },
  {
    id: 'av_mestre_republica',
    name: 'Mestre da República',
    categoryKey: 'politica',
    categoryTitle: 'Política & Cidadania',
    rarity: 'Lendário',
    price: 3800,
    description: 'Guardião dos princípios constitucionais e dos grandes debates nacionais.',
    image: '/images/avatars/afonso-mecha.jpg',
    icon: '🏛️',
    isExclusive: false
  },

  // ============================================================================
  // 4. EMPRESAS & ECONOMIA
  // ============================================================================
  {
    id: 'av_jovem_empresario',
    name: 'Jovem Empreendedor',
    categoryKey: 'empresas',
    categoryTitle: 'Empresas & Economia',
    rarity: 'Raro',
    price: 1500,
    description: 'Fundador de startups inovadoras forjadas nos hubs tecnológicos do país.',
    image: '/images/avatars/piloto-estoril.jpg',
    icon: '💡',
    isExclusive: false
  },
  {
    id: 'av_magnata_portugues',
    name: 'Magnata Português',
    categoryKey: 'empresas',
    categoryTitle: 'Empresas & Economia',
    rarity: 'Lendário',
    price: 4500,
    description: 'Líder dos grandes conglomerados industriais e comerciais lusos.',
    image: '/images/shop/titulo-conquistador.jpg',
    icon: '💼',
    isExclusive: false
  },

  // ============================================================================
  // 5. FUTEBOL NACIONAL
  // ============================================================================
  {
    id: 'av_adepto_ferrenho',
    name: 'Adepto das Bancadas',
    categoryKey: 'futebol',
    categoryTitle: 'Futebol Nacional',
    rarity: 'Comum',
    price: 700,
    description: 'Voz inconfundível dos cânticos de apoio nas noites mágicas de estádio.',
    image: '/images/avatars/guardiao-vulcanico.jpg',
    icon: '📣',
    isExclusive: false
  },
  {
    id: 'cyborg-quinas',
    name: 'Cyborg Camisola das Quinas',
    categoryKey: 'futebol',
    categoryTitle: 'Futebol Nacional',
    rarity: 'Épico',
    price: 3500,
    description: 'O goleador cibernético com chuteiras de propulsão iónica e instinto matador.',
    image: '/images/shop/cyborg-quinas.jpg',
    icon: '⚽',
    isExclusive: false
  },
  {
    id: 'av_lenda_futebol_quinas',
    name: 'Lenda do Futebol Português',
    categoryKey: 'futebol',
    categoryTitle: 'Futebol Nacional',
    rarity: 'Lendário',
    price: 4500,
    description: 'Mito eterno consagrado nos anais do desporto rei e das competições europeias.',
    image: '/images/shop/cyborg-quinas.jpg',
    icon: '🏆',
    isExclusive: false
  },

  // ============================================================================
  // 6. DESAFIO VISUAL
  // ============================================================================
  {
    id: 'av_observador_agil',
    name: 'Observador Ágil',
    categoryKey: 'visual',
    categoryTitle: 'Desafio Visual',
    rarity: 'Comum',
    price: 800,
    description: 'Olhos de lince capazes de detetar o mais ínfimo detalhe gráfico.',
    image: '/images/avatars/guardiao-vulcanico.jpg',
    icon: '👁️',
    isExclusive: false
  },
  {
    id: 'av_mestre_visual',
    name: 'Mestre da Perceção Visual',
    categoryKey: 'visual',
    categoryTitle: 'Desafio Visual',
    rarity: 'Épico',
    price: 3000,
    description: 'Visor holográfico calibrado para reconhecimento de padrões instantâneo.',
    image: '/images/avatars/infante-estelar.jpg',
    icon: '🔮',
    isExclusive: false
  },

  // ============================================================================
  // 7. MODO MALUCO
  // ============================================================================
  {
    id: 'av_maluco_do_quiz',
    name: 'Maluco do Quiz',
    categoryKey: 'modo-maluco',
    categoryTitle: 'Modo Maluco',
    rarity: 'Raro',
    price: 1600,
    description: 'Velocidade frenética e imprevisibilidade total em cada resposta.',
    image: '/images/avatars/galo-barcelos.jpg',
    icon: '🤪',
    isExclusive: false
  },
  {
    id: 'av_rei_do_caos',
    name: 'Rei do Caos Cibernético',
    categoryKey: 'modo-maluco',
    categoryTitle: 'Modo Maluco',
    rarity: 'Lendário',
    price: 4500,
    description: 'Domina as perguntas mais bizarras, surreais e hilariantes de Portugal.',
    image: '/images/avatars/careto-cyber.jpg',
    icon: '⚡',
    isExclusive: false
  },

  // ============================================================================
  // 8. HISTÓRIA & CONQUISTADORES
  // ============================================================================
  {
    id: 'padeiro-aljubarrota-cyber',
    name: 'Brites de Almeida Cyber-Pá',
    categoryKey: 'historia',
    categoryTitle: 'História & Conquistadores',
    rarity: 'Raro',
    price: 1800,
    description: 'A lendária heroína de Aljubarrota armada com pá de titânio energizada.',
    image: '/images/avatars/brites-cyber.jpg',
    icon: '🥖',
    isExclusive: false
  },
  {
    id: 'infante-navegador-neon',
    name: 'Infante D. Henrique Estelar',
    categoryKey: 'historia',
    categoryTitle: 'História & Conquistadores',
    rarity: 'Épico',
    price: 3500,
    description: 'Mestre da navegação espacial equipado com astrolábio holográfico de precisão.',
    image: '/images/avatars/infante-estelar.jpg',
    icon: '🧭',
    isExclusive: false
  },
  {
    id: 'camoes-2050',
    name: 'Luís de Camões 2050',
    categoryKey: 'historia',
    categoryTitle: 'História & Conquistadores',
    rarity: 'Lendário',
    price: 2500,
    description: 'O poeta épico d’Os Lusíadas renascido com visor cibernético e louros digitais.',
    image: '/images/avatars/camoes-2050.jpg',
    icon: '📜',
    isExclusive: false
  },
  {
    id: 'afonso-mecha-rei',
    name: 'D. Afonso Henriques Mecha',
    categoryKey: 'historia',
    categoryTitle: 'História & Conquistadores',
    rarity: 'Lendário',
    price: 5000,
    description: 'Exoesqueleto real forjado no Castelo de Guimarães com espada de plasma puro.',
    image: '/images/avatars/afonso-mecha.jpg',
    icon: '⚔️',
    isExclusive: false
  },

  // ============================================================================
  // 9. GEOGRAFIA & TERRITÓRIO
  // ============================================================================
  {
    id: 'espectro-serra-estrela',
    name: 'Sentinela da Serra da Estrela',
    categoryKey: 'geografia',
    categoryTitle: 'Geografia & Território',
    rarity: 'Raro',
    price: 1500,
    description: 'Guerreiro coberto por mantos glaciais e névoa mística da Torre.',
    image: '/images/avatars/sentinela-estrela.jpg',
    icon: '🏔️',
    isExclusive: false
  },
  {
    id: 'guardiao-vulcanico',
    name: 'Guardião Vulcânico Açores',
    categoryKey: 'geografia',
    categoryTitle: 'Geografia & Território',
    rarity: 'Épico',
    price: 3500,
    description: 'Armadura forjada nas profundezas geotérmicas da Lagoa das Furnas.',
    image: '/images/avatars/guardiao-vulcanico.jpg',
    icon: '🌋',
    isExclusive: false
  },
  {
    id: 'tita-cabo-roca',
    name: 'Titã das Ondas de Nazaré',
    categoryKey: 'geografia',
    categoryTitle: 'Geografia & Território',
    rarity: 'Lendário',
    price: 4500,
    description: 'Colosso aquático impulsionado pela força brutal do canhão submarino da Nazaré.',
    image: '/images/avatars/tita-nazare.jpg',
    icon: '🌊',
    isExclusive: false
  },

  // ============================================================================
  // 10. CIÊNCIA & TECNOLOGIA
  // ============================================================================
  {
    id: 'av_cientista_inovador',
    name: 'Cientista Inovador',
    categoryKey: 'ciencia',
    categoryTitle: 'Ciência & Tecnologia',
    rarity: 'Raro',
    price: 1800,
    description: 'Pioneiro em biotecnologia e energias limpas oceânicas.',
    image: '/images/avatars/infante-estelar.jpg',
    icon: '🔬',
    isExclusive: false
  },
  {
    id: 'av_genio_cientifico',
    name: 'Génio Científico Quântico',
    categoryKey: 'ciencia',
    categoryTitle: 'Ciência & Tecnologia',
    rarity: 'Lendário',
    price: 4200,
    description: 'Mente visionária que concebeu as autoestradas de informação quântica.',
    image: '/images/avatars/camoes-2050.jpg',
    icon: '⚛️',
    isExclusive: false
  },

  // ============================================================================
  // 11. CULTURA & TRADIÇÕES
  // ============================================================================
  {
    id: 'galo-barcelos-mecha',
    name: 'Galo de Barcelos Synthwave',
    categoryKey: 'cultura',
    categoryTitle: 'Cultura & Tradições',
    rarity: 'Comum',
    price: 800,
    description: 'O clássico símbolo da lealdade e justiça em formato autómato iluminado.',
    image: '/images/avatars/galo-barcelos.jpg',
    icon: '🐓',
    isExclusive: false
  },
  {
    id: 'av_mestre_cultura',
    name: 'Mestre da Cultura Tradicional',
    categoryKey: 'cultura',
    categoryTitle: 'Cultura & Tradições',
    rarity: 'Épico',
    price: 3000,
    description: 'Preservador incansável dos contos, festas populares e lendas centenares.',
    image: '/images/avatars/sentinela-estrela.jpg',
    icon: '🎨',
    isExclusive: false
  },
  {
    id: 'careto-cibernetico',
    name: 'Careto Podence Cibernético',
    categoryKey: 'cultura',
    categoryTitle: 'Cultura & Tradições',
    rarity: 'Lendário',
    price: 4000,
    description: 'Franjas de fibra ótica multicores e chocalhos emissores de impulsos PEM.',
    image: '/images/avatars/careto-cyber.jpg',
    icon: '🎭',
    isExclusive: false
  },

  // ============================================================================
  // 12. MÚSICA & FADO
  // ============================================================================
  {
    id: 'fadista-cyber-alfama',
    name: 'Fadista Cyber-Alfama',
    categoryKey: 'musica',
    categoryTitle: 'Música & Fado',
    rarity: 'Raro',
    price: 1500,
    description: 'Manto de néon roxo com guitarra portuguesa sintonizada a frequências sónicas.',
    image: '/images/shop/fadista-cyber.jpg',
    icon: '🎸',
    isExclusive: false
  },
  {
    id: 'av_lenda_musica_portuguesa',
    name: 'Lenda da Música Portuguesa',
    categoryKey: 'musica',
    categoryTitle: 'Música & Fado',
    rarity: 'Lendário',
    price: 4200,
    description: 'A alma de Amália e Zeca Afonso traduzida em melodias imortais.',
    image: '/images/shop/fadista-cyber.jpg',
    icon: '🎵',
    isExclusive: false
  },

  // ============================================================================
  // 13. GASTRONOMIA PORTUGUESA
  // ============================================================================
  {
    id: 'av_cozinheiro_tradicional',
    name: 'Cozinheiro de Taberna',
    categoryKey: 'gastronomia',
    categoryTitle: 'Gastronomia Portuguesa',
    rarity: 'Comum',
    price: 700,
    description: 'Mestre nos segredos do bacalhau, cozido à portuguesa e pastéis de nata.',
    image: '/images/avatars/guardiao-vulcanico.jpg',
    icon: '🍲',
    isExclusive: false
  },
  {
    id: 'av_mestre_gastronomia',
    name: 'Chef Estrela Michelin Lusa',
    categoryKey: 'gastronomia',
    categoryTitle: 'Gastronomia Portuguesa',
    rarity: 'Lendário',
    price: 3800,
    description: 'Elevou a culinária nacional ao pináculo da alta gastronomia mundial.',
    image: '/images/shop/titulo-conquistador.jpg',
    icon: '👨‍🍳',
    isExclusive: false
  },

  // ============================================================================
  // 14. CINEMA & TELEVISÃO
  // ============================================================================
  {
    id: 'av_cinefilo_nacional',
    name: 'Cinéfilo de Festivais',
    categoryKey: 'cinema-tv',
    categoryTitle: 'Cinema & Televisão',
    rarity: 'Raro',
    price: 1600,
    description: 'Conhecedor de cada plano e clássico da sétima arte portuguesa.',
    image: '/images/avatars/piloto-estoril.jpg',
    icon: '🎬',
    isExclusive: false
  },
  {
    id: 'av_estrela_ecra',
    name: 'Estrela dos Ecrãs Nacionais',
    categoryKey: 'cinema-tv',
    categoryTitle: 'Cinema & Televisão',
    rarity: 'Épico',
    price: 3200,
    description: 'Figura incontornável das noites de televisão e séries consagradas.',
    image: '/images/shop/passe-fundador.jpg',
    icon: '🌟',
    isExclusive: false
  },

  // ============================================================================
  // 15. DESPORTO GERAL
  // ============================================================================
  {
    id: 'piloto-estoril-neon',
    name: 'Piloto Speed Estoril 2088',
    categoryKey: 'desporto',
    categoryTitle: 'Desporto Geral',
    rarity: 'Raro',
    price: 1800,
    description: 'Corredor urbano com fato ignífugo reforçado a fibra de carbono.',
    image: '/images/avatars/piloto-estoril.jpg',
    icon: '🏎️',
    isExclusive: false
  },
  {
    id: 'av_lenda_olimpica',
    name: 'Lenda Olímpica Dourada',
    categoryKey: 'desporto',
    categoryTitle: 'Desporto Geral',
    rarity: 'Lendário',
    price: 4500,
    description: 'Medalhado de ouro que fez ouvir A Portuguesa no topo dos pódios mundiais.',
    image: '/images/shop/cyborg-quinas.jpg',
    icon: '🥇',
    isExclusive: false
  },

  // ============================================================================
  // 16. CURIOSIDADES & SABEDORIA
  // ============================================================================
  {
    id: 'av_curioso_nato',
    name: 'Curioso Nato',
    categoryKey: 'curiosidades',
    categoryTitle: 'Curiosidades & Sabedoria',
    rarity: 'Comum',
    price: 600,
    description: 'Colecionador de factos invulgares, recordes e estatísticas surpreendentes.',
    image: '/images/avatars/guardiao-vulcanico.jpg',
    icon: '💡',
    isExclusive: false
  },
  {
    id: 'av_cerebro_supremo',
    name: 'Cérebro Supremo Lusitano',
    categoryKey: 'curiosidades',
    categoryTitle: 'Curiosidades & Sabedoria',
    rarity: 'Lendário',
    price: 4000,
    description: 'Enciclopédia viva capaz de responder à pergunta mais recôndita sem hesitar.',
    image: '/images/avatars/camoes-2050.jpg',
    icon: '🧠',
    isExclusive: false
  },

  // ============================================================================
  // 17. GAMING & CULTURA POP
  // ============================================================================
  {
    id: 'av_gamer_pixel',
    name: 'Gamer Arcade Nacional',
    categoryKey: 'gaming',
    categoryTitle: 'Gaming & Cultura Pop',
    rarity: 'Comum',
    price: 800,
    description: 'Nostálgico dos salões de jogos e mestre dos comandos clássicos.',
    image: '/images/avatars/galo-barcelos.jpg',
    icon: '👾',
    isExclusive: false
  },
  {
    id: 'av_lenda_esports',
    name: 'Lenda Esports Portugal',
    categoryKey: 'gaming',
    categoryTitle: 'Gaming & Cultura Pop',
    rarity: 'Épico',
    price: 3200,
    description: 'Pro player com reflexos sobre-humanos e títulos internacionais.',
    image: '/images/avatars/piloto-estoril.jpg',
    icon: '🎮',
    isExclusive: false
  },

  // ============================================================================
  // 18. PORTUGAL NO MUNDO
  // ============================================================================
  {
    id: 'av_viajante_diáspora',
    name: 'Viajante da Diáspora',
    categoryKey: 'mundo',
    categoryTitle: 'Portugal no Mundo',
    rarity: 'Raro',
    price: 1800,
    description: 'Levou a bandeira e as tradições de Portugal aos quatro cantos do planeta.',
    image: '/images/avatars/infante-estelar.jpg',
    icon: '✈️',
    isExclusive: false
  },
  {
    id: 'av_mestre_do_mundo',
    name: 'Embaixador Global de Portugal',
    categoryKey: 'mundo',
    categoryTitle: 'Portugal no Mundo',
    rarity: 'Lendário',
    price: 4500,
    description: 'Representante supremo da cultura e do conhecimento luso em escala global.',
    image: '/images/avatars/afonso-mecha.jpg',
    icon: '🌐',
    isExclusive: false
  }
]
