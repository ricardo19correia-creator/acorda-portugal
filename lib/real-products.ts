// Catálogo oficial de pacotes com dinheiro real (Stripe / MB WAY) do Acorda Portugal
// O backend é a fonte de verdade para preços, recompensas e inventário.

export type RealProductType = 'arena_theme' | 'coins' | 'pass' | 'pack' | 'license'

export interface RealProductReward {
  euros: number
  xp?: number
  items?: Record<string, number>
  badge?: string
  vipPass?: boolean
  isFounder?: boolean
  authorLicense?: boolean
}

export interface RealProduct {
  id: string
  name: string
  subtitle?: string
  description: string
  type: RealProductType
  priceInCents: number // em cêntimos (ex: 199 = 1,99 €)
  currency: 'eur'
  badgeText?: string
  popular?: boolean
  bestValue?: boolean
  exclusive?: boolean
  themeKey?: string // Identificador do tema para equipar e preview
  icon: string
  reward: RealProductReward
  perks: string[]
  active: boolean
}

export const REAL_PRODUCTS_CATALOG: RealProduct[] = [
  // =========================================================================
  // 🏛️ ARENAS & TEMAS DE JOGO EXCLUSIVOS VIP (DINHEIRO REAL)
  // =========================================================================
  {
    id: 'arena_templo_dourado',
    name: '👑 Arena Mítica: «Templo Dourado dos Descobrimentos»',
    subtitle: 'Acabamento Ouro Real & Reflexos Volumétricos',
    description:
      'Fundo em preto e ouro escovado com colunas de luz volumétrica e partículas douradas a subir sempre que respondes.',
    type: 'arena_theme',
    themeKey: 'theme_templo_dinis',
    priceInCents: 199, // 1,99 €
    currency: 'eur',
    icon: 'Crown',
    exclusive: true,
    badgeText: 'Mítico',
    perks: [
      'Tema Dinâmico: Templo Dourado Vitalício',
      'Reflexos de Luz Volumétrica Dourada',
      'Partículas de Ouro nos Acertos',
      '+5.000 € Acorda de Bónus',
    ],
    reward: {
      euros: 5000,
      xp: 250,
      items: {
        theme_templo_dinis: 1,
        arena_templo_dourado: 1,
        templo_dourado: 1,
      },
    },
    active: true,
  },
  {
    id: 'arena_matriz_cosmica',
    name: '🌌 Arena Lendária: «Matriz Cósmica Portuguesa»',
    subtitle: 'Nebulosa 3D & Constelações',
    description:
      'Nebulosa espacial animada com constelações das caravelas e ondas de choque néon ao acertar streaks.',
    type: 'arena_theme',
    themeKey: 'theme_matriz_cosmica',
    priceInCents: 249, // 2,49 €
    currency: 'eur',
    icon: 'Sparkles',
    exclusive: true,
    badgeText: 'Lendário',
    perks: [
      'Tema Dinâmico: Matriz Cósmica Vitalícia',
      'Constelações Holográficas e Ondas de Choque Néon',
      'Poeira Cósmica Violeta e Ciano nas Sequências',
      '+7.500 € Acorda de Bónus',
    ],
    reward: {
      euros: 7500,
      xp: 350,
      items: {
        theme_matriz_cosmica: 1,
        arena_matriz_cosmica: 1,
        matriz_cosmica: 1,
      },
    },
    active: true,
  },
  {
    id: 'arena_fogo_acores',
    name: '🔥 Arena Épica: «Fogo Vulcânico dos Açores»',
    subtitle: 'Basalto Ardente & Alerta Lava',
    description:
      'Fundo escuro com brasas incandescentes e rebordo do ecrã a pulsar em vermelho-lava vivo nos últimos 10 segundos.',
    type: 'arena_theme',
    themeKey: 'theme_vulcao_acores',
    priceInCents: 149, // 1,49 €
    currency: 'eur',
    icon: 'Flame',
    popular: true,
    badgeText: 'Épico',
    perks: [
      'Tema Dinâmico: Vulcão dos Açores Vitalício',
      'Brasas Incandescentes em Ascensão',
      'Rebordo do Ecrã a Pulsar em Vermelho-Lava (10s)',
      '+3.500 € Acorda de Bónus',
    ],
    reward: {
      euros: 3500,
      xp: 200,
      items: {
        theme_vulcao_acores: 1,
        arena_fogo_acores: 1,
        fogo_acores: 1,
      },
    },
    active: true,
  },
  {
    id: 'arena_vortice_nazare',
    name: '🌊 Arena Rara: «Vórtice da Nazaré Cyber»',
    subtitle: 'Ondas Bioluminescentes 3D',
    description: 'Ondas 3D estilizadas em tons azul-marinho e ciano néon com partículas de espuma luminosa.',
    type: 'arena_theme',
    themeKey: 'theme_ondas_nazare',
    priceInCents: 99, // 0,99 €
    currency: 'eur',
    icon: 'Sparkles',
    badgeText: 'Raro',
    perks: [
      'Tema Dinâmico: Nazaré Cyber Vitalício',
      'Feixes de Luz Bioluminescentes e Espuma Néon',
      'Fundo Azul-Marinho Profundo em Partidas',
      '+2.500 € Acorda de Bónus',
    ],
    reward: {
      euros: 2500,
      xp: 150,
      items: {
        theme_ondas_nazare: 1,
        arena_vortice_nazare: 1,
        vortice_nazare: 1,
      },
    },
    active: true,
  },
  {
    id: 'pass_todas_arenas_vip',
    name: '📦 Mega Passe: «Todas as Arenas VIP Vitalícias»',
    subtitle: 'Coleção Definitiva de Cenários',
    description:
      'Desbloqueio imediato de todas as arenas atuais e de todos os temas futuros que forem adicionados ao jogo.',
    type: 'pass',
    themeKey: 'theme_matriz_cosmica',
    priceInCents: 499, // 4,99 €
    currency: 'eur',
    icon: 'Crown',
    bestValue: true,
    badgeText: 'Melhor Valor',
    perks: [
      'Todas as Arenas Atuais e Futuras Desbloqueadas',
      'Templo de D. Dinis + Matriz Cósmica + Vulcão + Nazaré',
      'Distintivo Exclusivo «Mestre das Arenas»',
      '+30.000 € Acorda + 1.500 XP',
    ],
    reward: {
      euros: 30000,
      xp: 1500,
      badge: 'Mestre das Arenas',
      items: {
        theme_matriz_tron: 1,
        theme_ondas_nazare: 1,
        theme_fado_cyberpunk: 1,
        theme_vulcao_acores: 1,
        theme_templo_dinis: 1,
        theme_matriz_cosmica: 1,
        arena_templo_dourado: 1,
        arena_matriz_cosmica: 1,
        arena_fogo_acores: 1,
        arena_vortice_nazare: 1,
      },
    },
    active: true,
  },

  // =========================================================================
  // 👑 PASSES & PACOTES ESPECIAIS
  // =========================================================================
  {
    id: 'pass_fundador_nacao',
    name: 'Passe «Fundador da Nação»',
    subtitle: 'Estatuto Vitalício & Multiplicadores',
    description:
      'Multiplicador passivo vitalício de +25% XP e +25% moedas, Distintivo permanente de Fundador no perfil e no 1v1, e Moldura exclusiva de Ouro com Bandeira Animada.',
    type: 'pass',
    priceInCents: 299, // 2,99 €
    currency: 'eur',
    icon: 'Crown',
    exclusive: true,
    badgeText: 'Vitalício',
    perks: [
      '+25% XP e Moedas Passivo Para Sempre',
      'Badge Oficial «Fundador da Nação»',
      'Moldura Ouro com Bandeira Animada',
      '10.000 € Acorda de Bónus Imediato',
    ],
    reward: {
      euros: 10000,
      xp: 1000,
      isFounder: true,
      vipPass: true,
      badge: 'Fundador da Nação',
      items: {
        frame_fundador_ouro: 1,
      },
    },
    active: true,
  },
  {
    id: 'pack_afonso_henriques',
    name: 'Mega Pacote «D. Afonso Henriques»',
    subtitle: 'O Conquistador Supremo',
    description:
      'Título 3D dourado exclusivo «O Conquistador Supremo», Efeito de vitória de espada 1v1 animada no ecrã e 75.000 € Acorda creditados de imediato.',
    type: 'pack',
    priceInCents: 499, // 4,99 €
    currency: 'eur',
    icon: 'Swords',
    popular: true,
    badgeText: 'Mais Vendido',
    perks: [
      '75.000 € Acorda Imediatos',
      'Título 3D Dourado «O Conquistador Supremo»',
      'Efeito de Vitória: Espada de D. Afonso Henriques',
      '+1.500 XP de Progressão Nacional',
    ],
    reward: {
      euros: 75000,
      xp: 1500,
      badge: 'O Conquistador Supremo',
      items: {
        title_conquistador_supremo: 1,
        sfx_espada_conquistador: 1,
        streak_espada_conquistador: 1,
      },
    },
    active: true,
  },
  {
    id: 'license_autor_perguntas',
    name: 'Licença «Autor de Perguntas»',
    subtitle: 'Criador Oficial de Quizzes',
    description:
      'Acesso exclusivo ao formulário de submissão de perguntas com assinatura oficial do autor nos quizzes nacionais de Portugal + 15.000 € Acorda.',
    type: 'license',
    priceInCents: 349, // 3,49 €
    currency: 'eur',
    icon: 'Sparkles',
    badgeText: 'Criador',
    perks: [
      'Acesso ao Envio de Perguntas Nacionais',
      'Assinatura do teu Nome em Perguntas Oficiais',
      'Distintivo «Autor Oficial» no Perfil',
      '15.000 € Acorda + 500 XP',
    ],
    reward: {
      euros: 15000,
      xp: 500,
      authorLicense: true,
      badge: 'Autor Oficial',
    },
    active: true,
  },

  // =========================================================================
  // 💰 COFRES DE MOEDAS VIRTUAIS (€ ACORDA)
  // =========================================================================
  {
    id: 'coin_pack_tasca',
    name: 'Saco da Tasca (20 000 €)',
    subtitle: 'Pack Inicial Económico',
    description: '20.000 € Acorda adicionados instantaneamente à tua conta para gastares livremente em temas, molduras e utilidades.',
    type: 'coins',
    priceInCents: 99, // 0,99 €
    currency: 'eur',
    icon: 'Coins',
    badgeText: 'Económico',
    perks: [
      '20.000 € Acorda Imediatos',
      'Saldo Imediato para a Loja',
      'Entrega Instantânea',
    ],
    reward: {
      euros: 20000,
      xp: 150,
    },
    active: true,
  },
  {
    id: 'coin_pack_cofre_nacional',
    name: 'Cofre Forte Nacional (80 000 €)',
    subtitle: 'Reserva de Ouro & Power-Ups',
    description: '80.000 € Acorda + 3x 50/50 e 3x Pistas de bónus para dominares os quizzes mais difíceis.',
    type: 'coins',
    priceInCents: 299, // 2,99 €
    currency: 'eur',
    icon: 'Shield',
    popular: true,
    badgeText: 'Popular',
    perks: [
      '80.000 € Acorda Imediatos',
      '3x Power-Ups 50/50',
      '3x Pistas Reveladoras',
      '+500 XP de Bónus',
    ],
    reward: {
      euros: 80000,
      xp: 500,
      items: {
        consumable_50_50: 3,
        consumable_pista: 3,
      },
    },
    active: true,
  },
  {
    id: 'coin_pack_tesouro_descobrimentos',
    name: 'Tesouro dos Descobrimentos (250 000 €)',
    subtitle: 'Fortuna Máxima + Todos os Temas',
    description:
      '250.000 € Acorda + Desbloqueio imediato de todos os Temas Dinâmicos de Fundo de Arena + Distintivo exclusivo «Grande Navegador».',
    type: 'coins',
    priceInCents: 799, // 7,99 €
    currency: 'eur',
    icon: 'Crown',
    bestValue: true,
    badgeText: 'Melhor Valor',
    perks: [
      '250.000 € Acorda na Conta',
      'Todos os Temas de Arena Desbloqueados',
      'Distintivo Lendário «Grande Navegador»',
      '+2.500 XP Nacional',
    ],
    reward: {
      euros: 250000,
      xp: 2500,
      badge: 'Grande Navegador',
      items: {
        theme_fado_cyberpunk: 1,
        theme_ondas_nazare: 1,
        theme_vulcao_acores: 1,
        theme_matriz_tron: 1,
        theme_templo_dinis: 1,
        theme_matriz_cosmica: 1,
        arena_templo_dourado: 1,
        arena_matriz_cosmica: 1,
        arena_fogo_acores: 1,
        arena_vortice_nazare: 1,
      },
    },
    active: true,
  },
]

export function getRealProductById(id: string): RealProduct | undefined {
  return REAL_PRODUCTS_CATALOG.find((p) => (p.id === id || (p as any).themeKey === id) && p.active)
}
