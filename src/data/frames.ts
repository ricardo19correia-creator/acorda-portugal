export type FrameRarity = 'Raro' | 'Épico' | 'Lendário' | 'Mítico';

export interface AnimatedFrame {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  priceCoins: number;
  rarity: FrameRarity;
  type: string;
  categoryKey: 'elemental' | 'cosmico' | 'real' | 'lusitano' | 'especial';
  categoryTitle: string;
  accentColor: string;
  secondaryColor?: string;
  cssClass?: string;
  story?: string;
  badge?: string;
  badgeColor?: string;
}

export function getFrameRarityBadge(rarity: FrameRarity): string {
  switch (rarity) {
    case 'Mítico':
      return 'bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white border-pink-400/80 shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse font-black';
    case 'Lendário':
      return 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.4)] font-black';
    case 'Épico':
      return 'bg-purple-500/25 text-purple-300 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.35)] font-black';
    case 'Raro':
    default:
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)] font-bold';
  }
}

/**
 * 🇵🇹 COLEÇÃO OFICIAL DE 9 MOLDURAS VIVAS AAA (SSOT)
 * 
 * Substituição integral de alta fidelidade:
 * Cada moldura é um objeto volumétrico 3D vivo, com matéria, luz volumétrica,
 * partículas ativas e efeitos que transbordam da silhueta sem cobrir o avatar.
 */
export const ANIMATED_FRAMES: AnimatedFrame[] = [
  // 1. INFERNO SOLAR & FOGO ETERNO
  {
    id: 'frame_inferno_solar',
    slug: 'inferno-solar',
    name: 'Inferno Solar & Fogo Eterno',
    description: 'Estrutura espessa de obsidiana e metal incandescente com chamas reais estilizadas a subir pelas laterais e topo, brasas, luz quente e faíscas que saem para fora da silhueta.',
    price: 4500,
    priceCoins: 4500,
    rarity: 'Épico',
    type: 'inferno_solar',
    categoryKey: 'elemental',
    categoryTitle: 'Elemental AAA',
    accentColor: '#f97316',
    secondaryColor: '#ef4444',
    cssClass: 'frame-effect-inferno',
    story: 'Forjada no fogo primordial do núcleo da terra, esta moldura arde com chamas perpétuas e matéria incandescente.',
    badge: 'Épico',
    badgeColor: getFrameRarityBadge('Épico'),
  },

  // 2. ONDAS DO ATLÂNTICO
  {
    id: 'frame_ondas_atlantico',
    slug: 'ondas-do-atlantico',
    name: 'Ondas do Atlântico',
    description: 'Moldura grossa tridimensional com água animada a circular pela estrutura, cristas de ondas oceânicas, espuma nas extremidades, gotículas e bioluminescência ciano contínua.',
    price: 3000,
    priceCoins: 3000,
    rarity: 'Raro',
    type: 'ondas_atlantico',
    categoryKey: 'elemental',
    categoryTitle: 'Elemental AAA',
    accentColor: '#06b6d4',
    secondaryColor: '#0ea5e9',
    cssClass: 'frame-effect-oceanic',
    story: 'As marés gigantes e selvagens da Costa Portuguesa condensadas num anel perpétuo de água viva bioluminescente.',
    badge: 'Raro',
    badgeColor: getFrameRarityBadge('Raro'),
  },

  // 3. FÚRIA DO TROVÃO & RAIOS
  {
    id: 'frame_furia_trovao',
    slug: 'furia-do-trovao',
    name: 'Fúria do Trovão & Raios',
    description: 'Estrutura espessa de liga e plasma com raios elétricos a percorrer a moldura, arcos estocásticos que ultrapassam a borda, pulsos de alta voltagem e forte glow violeta.',
    price: 5000,
    priceCoins: 5000,
    rarity: 'Épico',
    type: 'furia_trovao',
    categoryKey: 'elemental',
    categoryTitle: 'Elemental AAA',
    accentColor: '#38bdf8',
    secondaryColor: '#a855f7',
    cssClass: 'frame-effect-lightning-storm',
    story: 'Um acumulador eletrostático tempestuoso que descarrega arcos voltaicos dinâmicos e imprevisíveis.',
    badge: 'Épico',
    badgeColor: getFrameRarityBadge('Épico'),
  },

  // 4. ZERO ABSOLUTO
  {
    id: 'frame_zero_absoluto',
    slug: 'zero-absoluto',
    name: 'Zero Absoluto',
    description: 'Moldura espessa de gelo e cristal lapidado em 3D. Estalagmites afiadas nos cantos, geada acumulada, partículas congeladas e névoa fria com brilho azul-gelo.',
    price: 3500,
    priceCoins: 3500,
    rarity: 'Raro',
    type: 'zero_absoluto',
    categoryKey: 'elemental',
    categoryTitle: 'Elemental AAA',
    accentColor: '#a5f3fc',
    secondaryColor: '#e0f2fe',
    cssClass: 'frame-effect-glacial-ice',
    story: 'Cristais congelados no pico mais alto e gélido da Serra da Estrela a temperaturas abaixo do zero absoluto.',
    badge: 'Raro',
    badgeColor: getFrameRarityBadge('Raro'),
  },

  // 5. FORNALHA DE MAGMA
  {
    id: 'frame_fornalha_magma',
    slug: 'fornalha-de-magma',
    name: 'Fornalha de Magma',
    description: 'Estrutura pesada de rocha basáltica vulcânica muito espessa, com fluxo denso de lava incandescente nas fissuras profundas, faíscas ativas e projeções de fogo.',
    price: 6000,
    priceCoins: 6000,
    rarity: 'Épico',
    type: 'fornalha_magma',
    categoryKey: 'elemental',
    categoryTitle: 'Elemental AAA',
    accentColor: '#ea580c',
    secondaryColor: '#dc2626',
    cssClass: 'frame-effect-volcanic-magma',
    story: 'Basalto vulcânico das ilhas açorianas fraturado por rios viscosos de lava viva sob tremenda pressão tectónica.',
    badge: 'Épico',
    badgeColor: getFrameRarityBadge('Épico'),
  },

  // 6. NEBULOSA & POEIRA ESTELAR
  {
    id: 'frame_nebulosa_estelar',
    slug: 'nebulosa-poeira-estelar',
    name: 'Nebulosa & Poeira Estelar',
    description: 'Estrutura cósmica profunda com anéis orbitais dourados, nuvens de nebulosa interestelar violeta e anil, constelações cintilantes e poeira estelar em rotação tridimensional.',
    price: 8500,
    priceCoins: 8500,
    rarity: 'Lendário',
    type: 'nebulosa_estelar',
    categoryKey: 'cosmico',
    categoryTitle: 'Cósmico AAA',
    accentColor: '#c084fc',
    secondaryColor: '#6366f1',
    cssClass: 'frame-effect-cosmic-nebula',
    story: 'Uma janela para o cosmos profundo onde poeira estelar e órbitas celestes giram em harmonia perpétua.',
    badge: 'Lendário',
    badgeColor: getFrameRarityBadge('Lendário'),
  },

  // 7. RAÍZES DA FLORESTA VIVA
  {
    id: 'frame_floresta_viva',
    slug: 'raizes-da-floresta-viva',
    name: 'Raízes da Floresta Viva',
    description: 'Troncos e raízes nobres tridimensionais a abraçar o avatar, seiva esmeralda rúnica a pulsar pelo interior da madeira, flores douradas e pirilampos brilhantes flutuantes.',
    price: 8000,
    priceCoins: 8000,
    rarity: 'Lendário',
    type: 'floresta_viva',
    categoryKey: 'elemental',
    categoryTitle: 'Natureza Viva AAA',
    accentColor: '#22c55e',
    secondaryColor: '#eab308',
    cssClass: 'frame-effect-living-roots',
    story: 'A essência viva das matas sagradas do Gerês, onde a madeira antiga respira e floresce em simbiose com o avatar.',
    badge: 'Lendário',
    badgeColor: getFrameRarityBadge('Lendário'),
  },

  // 8. VAZIO ABISSAL
  {
    id: 'frame_vazio_abissal',
    slug: 'vazio-abissal',
    name: 'Vazio Abissal',
    description: 'Moldura negra e púrpura profunda feita de matéria escura. Tentáculos de sombra enigmáticos que absorvem a luz ao redor, fendas dimensionais e partículas quânticas em vórtice.',
    price: 12500,
    priceCoins: 12500,
    rarity: 'Mítico',
    type: 'vazio_abissal',
    categoryKey: 'cosmico',
    categoryTitle: 'Abissal AAA',
    accentColor: '#9333ea',
    secondaryColor: '#3b0764',
    cssClass: 'frame-effect-abyssal-void',
    story: 'Um horizonte de eventos onde o espaço-tempo se curva e a matéria escura consome a luz em silêncio absoluto.',
    badge: 'Mítico',
    badgeColor: getFrameRarityBadge('Mítico'),
  },

  // 9. OURO REAL DOS NAVEGADORES
  {
    id: 'frame_ouro_navegadores',
    slug: 'ouro-real-dos-navegadores',
    name: 'Ouro Real dos Navegadores',
    description: 'Moldura luxuosa de espessura imponente, esculpida em filigrana portuguesa de ouro maciço com esferas armilares, curvas de astrolábio, rubis nobres incrustados e reflexos especulares.',
    price: 15000,
    priceCoins: 15000,
    rarity: 'Mítico',
    type: 'ouro_navegadores',
    categoryKey: 'real',
    categoryTitle: 'Real Lendário AAA',
    accentColor: '#fbbf24',
    secondaryColor: '#dc2626',
    cssClass: 'frame-effect-navigators-gold',
    story: 'A relíquia suprema dos Descobrimentos: ouro imperial moldado com a arte da filigrana e a ciência das estrelas de Sagres.',
    badge: 'Mítico',
    badgeColor: getFrameRarityBadge('Mítico'),
  },
];

/**
 * Dicionário de Mapeamento e Retrocompatibilidade
 * Mapeia todos os IDs legados para o seu respetivo equivalente canónico entre as 9 novas molduras AAA.
 */
export const FRAME_ALIASES: Record<string, string> = {
  // Aliases Diretos dos 9 novos
  'inferno-solar': 'frame_inferno_solar',
  'ondas-do-atlantico': 'frame_ondas_atlantico',
  'furia-do-trovao': 'frame_furia_trovao',
  'zero-absoluto': 'frame_zero_absoluto',
  'fornalha-de-magma': 'frame_fornalha_magma',
  'nebulosa-poeira-estelar': 'frame_nebulosa_estelar',
  'raizes-da-floresta-viva': 'frame_floresta_viva',
  'vazio-abissal': 'frame_vazio_abissal',
  'ouro-real-dos-navegadores': 'frame_ouro_navegadores',

  // Mapeamentos das 29 Molduras Antigas -> 9 Novas Molduras Canónicas
  // 1. Fogo / Magma / Chama
  'frame_fogo_eterno': 'frame_inferno_solar',
  'frame_solar_flame': 'frame_inferno_solar',
  'frame_chama_sebastiao': 'frame_inferno_solar',
  'frame_plasma_solar': 'frame_inferno_solar',
  'fogo-campeao': 'frame_inferno_solar',
  'AP-VIP-FRAME-005': 'frame_inferno_solar',
  'vip_frame_005': 'frame_inferno_solar',
  'vip_frame_006': 'frame_inferno_solar',

  // 2. Ondas / Mar
  'frame_abismo_atlantico': 'frame_ondas_atlantico',
  'frame_onda_nazare': 'frame_ondas_atlantico',
  'frame_mar_portugues': 'frame_ondas_atlantico',

  // 3. Trovão / Eletricidade / Cyber
  'frame_tempestade_eletrica': 'frame_furia_trovao',
  'frame_cyber_laser': 'frame_furia_trovao',
  'frame_cyber_galo': 'frame_furia_trovao',
  'frame_cyber_neon': 'frame_furia_trovao',
  'frame_matrix_digital': 'frame_furia_trovao',
  'frame_quantum_matrix': 'frame_furia_trovao',
  'frame_arcade_8bit': 'frame_furia_trovao',
  'frame_arcade_pixel': 'frame_furia_trovao',
  'frame_neon_arcade_80s': 'frame_furia_trovao',
  'frame_cyber_glitch_2077': 'frame_furia_trovao',
  'frame_farol_sagres': 'frame_furia_trovao',
  'frame_luz_de_sagres': 'frame_furia_trovao',

  // 4. Gelo / Cristal
  'frame_gelo_ancestral': 'frame_zero_absoluto',
  'frame_geada_glacial': 'frame_zero_absoluto',
  'frame_diamante_sagrado': 'frame_zero_absoluto',
  'frame_cristal_diamante': 'frame_zero_absoluto',
  'frame_prisma_holografico': 'frame_zero_absoluto',
  'diamante-lusitano': 'frame_zero_absoluto',
  'AP-VIP-FRAME-004': 'frame_zero_absoluto',
  'vip_frame_004': 'frame_zero_absoluto',

  // 5. Vulcão / Basalto / Fornalha
  'frame_dragao_fumegante': 'frame_fornalha_magma',
  'frame_dragao_antigo': 'frame_fornalha_magma',
  'frame_gladiador_ferro': 'frame_fornalha_magma',
  'frame_sangue_gladiador': 'frame_fornalha_magma',
  'frame_muralha_castelo': 'frame_fornalha_magma',
  'frame_castelo_muralha': 'frame_fornalha_magma',

  // 6. Cósmico / Nebulosa
  'frame_galaxia_profunda': 'frame_nebulosa_estelar',
  'frame_nevoa_sintrense': 'frame_nebulosa_estelar',
  'frame_aurora_boreal': 'frame_nebulosa_estelar',
  'frame_imperador_galactico': 'frame_nebulosa_estelar',
  'trono-celestial': 'frame_nebulosa_estelar',
  'AP-VIP-FRAME-003': 'frame_nebulosa_estelar',
  'vip_frame_003': 'frame_nebulosa_estelar',

  // 7. Natureza / Floresta
  'frame_natureza_viva': 'frame_floresta_viva',
  'frame_esmeralda_natureza': 'frame_floresta_viva',
  'frame_terra_viva': 'frame_floresta_viva',
  'frame_verde_esperanca': 'frame_floresta_viva',
  'frame_orvalho_floresta': 'frame_floresta_viva',
  'frame_esmeralda_imperial': 'frame_floresta_viva',
  'frame_coroa_louros': 'frame_floresta_viva',
  'frame_sakura_zen': 'frame_floresta_viva',
  'frame_biohazard_toxic': 'frame_floresta_viva',
  'frame_veneno_toxico': 'frame_floresta_viva',

  // 8. Vazio / Abismo
  'frame_horizonte_eventos': 'frame_vazio_abissal',
  'frame_void_abyss': 'frame_vazio_abissal',
  'frame_abismo_oceanico': 'frame_vazio_abissal',

  // 9. Ouro / Filigrana / Realeza
  'frame_ouro_real': 'frame_ouro_navegadores',
  'frame_fundador_ouro': 'frame_ouro_navegadores',
  'frame_ouro_afonso': 'frame_ouro_navegadores',
  'frame_luz_divina': 'frame_ouro_navegadores',
  'frame_ouro_dos_deuses': 'frame_ouro_navegadores',
  'frame_realeza_lusitana': 'frame_ouro_navegadores',
  'frame_quinas_portugal': 'frame_ouro_navegadores',
  'frame_portugal_glory': 'frame_ouro_navegadores',
  'frame_rosa_dos_ventos': 'frame_ouro_navegadores',
  'frame_filigrana_coracao': 'frame_ouro_navegadores',
  'frame_azulejo_portugues': 'frame_ouro_navegadores',
  'frame_azulejo_manuelino': 'frame_ouro_navegadores',
  'frame_calcada_portuguesa': 'frame_ouro_navegadores',
  'frame_azulejo_nobre': 'frame_ouro_navegadores',
  'frame_azulejo_seculoxvii': 'frame_ouro_navegadores',
  'frame_padrao_descobrimentos': 'frame_ouro_navegadores',
  'frame_galo_barcelos': 'frame_ouro_navegadores',
  'frame_fado_guitarra': 'frame_ouro_navegadores',
  'frame_fadista_noite': 'frame_ouro_navegadores',
  'frame_caravela_dourada': 'frame_ouro_navegadores',
  'coroa-imperio': 'frame_ouro_navegadores',
  'portugal-ouro': 'frame_ouro_navegadores',
  'AP-VIP-FRAME-001': 'frame_ouro_navegadores',
  'AP-VIP-FRAME-002': 'frame_ouro_navegadores',
  'vip_frame_001': 'frame_ouro_navegadores',
  'vip_frame_002': 'frame_ouro_navegadores',
};

export function getFrameById(id?: string | null): AnimatedFrame | undefined {
  if (!id || id === 'default') return undefined;
  const canonicalId = FRAME_ALIASES[id] || id;
  return ANIMATED_FRAMES.find((f) => f.id === canonicalId);
}
