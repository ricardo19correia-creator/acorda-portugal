export type AchievementCategory = 
  | 'todas'
  | 'geral' 
  | 'duelos' 
  | 'sequencias' 
  | 'categorias' 
  | 'distritos' 
  | 'economia' 
  | 'maluco' 
  | 'especiais'

export interface AchievementReward {
  coins: number                  // € Acorda
  title?: string                 // Título exclusivo para equipar
  utilities?: {                  // Consumíveis diretos para o stock
    fiftyFifty?: number
    freezeTime?: number
    skipQuestion?: number
  }
  arenaId?: string               // Arena exclusiva desbloqueada
  avatarId?: string              // Avatar exclusivo desbloqueado
}

export interface AchievementItem {
  id: string
  title: string
  description: string
  category: AchievementCategory
  categoryLabel: string
  icon: string
  maxProgress: number
  statKey: string
  reward: AchievementReward
}

export const ACHIEVEMENTS_LIST: AchievementItem[] = [
  // ==========================================
  // GERAL & PROGRESSÃO
  // ==========================================
  {
    id: 'ach_primeiros_passos',
    title: 'Primeiros Passos',
    description: 'Conclui a tua primeira partida de quiz no Acorda Portugal.',
    category: 'geral',
    categoryLabel: 'Geral',
    icon: '🎯',
    maxProgress: 1,
    statKey: 'gamesPlayed',
    reward: {
      coins: 750,
      utilities: { fiftyFifty: 1 }
    }
  },
  {
    id: 'ach_aprendiz_lusitano',
    title: 'Aprendiz Lusitano',
    description: 'Responde a 25 perguntas em qualquer modo de jogo.',
    category: 'geral',
    categoryLabel: 'Geral',
    icon: '📚',
    maxProgress: 25,
    statKey: 'questionsAnswered',
    reward: {
      coins: 2000,
      utilities: { fiftyFifty: 2, freezeTime: 1 }
    }
  },
  {
    id: 'ach_sabio_nacao',
    title: 'Sábio da Nação',
    description: 'Responde a 100 perguntas com sucesso.',
    category: 'geral',
    categoryLabel: 'Geral',
    icon: '🧠',
    maxProgress: 100,
    statKey: 'questionsAnswered',
    reward: {
      coins: 6000,
      title: 'Enciclopédia Viva',
      utilities: { fiftyFifty: 3, freezeTime: 2 }
    }
  },
  {
    id: 'ach_mestre_supremo',
    title: 'Mestre Supremo',
    description: 'Responde a 500 perguntas sobre a história e cultura do país.',
    category: 'geral',
    categoryLabel: 'Geral',
    icon: '👑',
    maxProgress: 500,
    statKey: 'questionsAnswered',
    reward: {
      coins: 25000,
      title: 'Oráculo de Portugal',
      utilities: { fiftyFifty: 5, freezeTime: 5 }
    }
  },
  {
    id: 'ach_nivel_5',
    title: 'Veterano em Ascensão',
    description: 'Alcança o Nível 5 de jogador acumulando XP.',
    category: 'geral',
    categoryLabel: 'Geral',
    icon: '⚡',
    maxProgress: 5,
    statKey: 'level',
    reward: {
      coins: 4000,
      title: 'Veterano Lusitano',
      utilities: { freezeTime: 2 }
    }
  },
  {
    id: 'ach_nivel_10',
    title: 'Lenda Viva',
    description: 'Alcança o Nível 10 de prestígio nacional.',
    category: 'geral',
    categoryLabel: 'Geral',
    icon: '🌟',
    maxProgress: 10,
    statKey: 'level',
    reward: {
      coins: 15000,
      title: 'Lenda Viva de Portugal',
      utilities: { fiftyFifty: 4, freezeTime: 4 }
    }
  },

  // ==========================================
  // DUELOS 1V1
  // ==========================================
  {
    id: 'ach_primeiro_duelo',
    title: 'Primeiro Sangue',
    description: 'Vence o teu primeiro duelo em tempo real contra outro jogador.',
    category: 'duelos',
    categoryLabel: 'Duelos 1v1',
    icon: '⚔️',
    maxProgress: 1,
    statKey: 'duelsWon',
    reward: {
      coins: 1500,
      utilities: { freezeTime: 1 }
    }
  },
  {
    id: 'ach_gladiador_iberico',
    title: 'Gladiador Ibérico',
    description: 'Vence 5 duelos 1v1 no campo de batalha.',
    category: 'duelos',
    categoryLabel: 'Duelos 1v1',
    icon: '🛡️',
    maxProgress: 5,
    statKey: 'duelsWon',
    reward: {
      coins: 4500,
      utilities: { fiftyFifty: 2, freezeTime: 2 }
    }
  },
  {
    id: 'ach_terror_dos_duelos',
    title: 'Terror dos Duelos',
    description: 'Vence 15 confrontos diretos contra adversários.',
    category: 'duelos',
    categoryLabel: 'Duelos 1v1',
    icon: '🗡️',
    maxProgress: 15,
    statKey: 'duelsWon',
    reward: {
      coins: 12000,
      title: 'Guerreiro Imbatível',
      utilities: { fiftyFifty: 4, freezeTime: 4 }
    }
  },
  {
    id: 'ach_rei_da_arena',
    title: 'Rei da Arena',
    description: 'Alcança a marca lendária de 50 vitórias em duelos 1v1.',
    category: 'duelos',
    categoryLabel: 'Duelos 1v1',
    icon: '🏰',
    maxProgress: 50,
    statKey: 'duelsWon',
    reward: {
      coins: 40000,
      title: 'Rei da Arena',
      utilities: { fiftyFifty: 8, freezeTime: 8 }
    }
  },

  // ==========================================
  // SEQUÊNCIAS (STREAKS)
  // ==========================================
  {
    id: 'ach_aquecimento_streak',
    title: 'Aquecimento Rápido',
    description: 'Acerta 3 perguntas consecutivas sem falhar.',
    category: 'sequencias',
    categoryLabel: 'Sequências',
    icon: '🔥',
    maxProgress: 3,
    statKey: 'bestStreak',
    reward: {
      coins: 1000,
      utilities: { fiftyFifty: 1 }
    }
  },
  {
    id: 'ach_em_chamas_streak',
    title: 'Em Chamas',
    description: 'Mantém uma sequência de 7 respostas corretas consecutivas.',
    category: 'sequencias',
    categoryLabel: 'Sequências',
    icon: '💥',
    maxProgress: 7,
    statKey: 'bestStreak',
    reward: {
      coins: 3500,
      utilities: { fiftyFifty: 2, freezeTime: 1 }
    }
  },
  {
    id: 'ach_imparavel_streak',
    title: 'Sequência Imparável',
    description: 'Alcança 10 respostas corretas seguidas num único jogo.',
    category: 'sequencias',
    categoryLabel: 'Sequências',
    icon: '⚡',
    maxProgress: 10,
    statKey: 'bestStreak',
    reward: {
      coins: 8000,
      title: 'Fogo Lusitano',
      utilities: { fiftyFifty: 3, freezeTime: 3 }
    }
  },
  {
    id: 'ach_perfeicao_streak',
    title: 'Perfeição Absoluta',
    description: 'Atinge a mítica sequência de 15 respostas certas consecutivas.',
    category: 'sequencias',
    categoryLabel: 'Sequências',
    icon: '🌠',
    maxProgress: 15,
    statKey: 'bestStreak',
    reward: {
      coins: 20000,
      title: 'Impecável',
      utilities: { fiftyFifty: 5, freezeTime: 5 }
    }
  },

  // ==========================================
  // CATEGORIAS DE CONHECIMENTO
  // ==========================================
  {
    id: 'ach_historiador_patria',
    title: 'Historiador da Pátria',
    description: 'Acerta 40 perguntas na categoria de História de Portugal.',
    category: 'categorias',
    categoryLabel: 'Categorias',
    icon: '🏛️',
    maxProgress: 40,
    statKey: 'historiaCorrect',
    reward: {
      coins: 5000,
      title: 'Historiador da Pátria',
      utilities: { fiftyFifty: 2 }
    }
  },
  {
    id: 'ach_navegador_sagres',
    title: 'Navegador de Sagres',
    description: 'Acerta 40 perguntas na categoria de Geografia & Território.',
    category: 'categorias',
    categoryLabel: 'Categorias',
    icon: '🌍',
    maxProgress: 40,
    statKey: 'geografiaCorrect',
    reward: {
      coins: 5000,
      title: 'Navegador de Sagres',
      utilities: { fiftyFifty: 2 }
    }
  },
  {
    id: 'ach_campeao_nacional',
    title: 'Campeão Nacional',
    description: 'Acerta 40 perguntas na categoria de Desporto Nacional.',
    category: 'categorias',
    categoryLabel: 'Categorias',
    icon: '⚽',
    maxProgress: 40,
    statKey: 'desportoCorrect',
    reward: {
      coins: 5000,
      title: 'Campeão Nacional',
      utilities: { freezeTime: 2 }
    }
  },
  {
    id: 'ach_guardiao_tradicoes',
    title: 'Guardião das Tradições',
    description: 'Acerta 40 perguntas na categoria de Cultura & Tradições.',
    category: 'categorias',
    categoryLabel: 'Categorias',
    icon: '🎭',
    maxProgress: 40,
    statKey: 'culturaCorrect',
    reward: {
      coins: 5000,
      title: 'Guardião das Tradições',
      utilities: { fiftyFifty: 2 }
    }
  },
  {
    id: 'ach_alma_lusitana',
    title: 'Alma Lusitana',
    description: 'Acerta 40 perguntas na categoria de Símbolos & Gastronomia.',
    category: 'categorias',
    categoryLabel: 'Categorias',
    icon: '🇵🇹',
    maxProgress: 40,
    statKey: 'simbolosCorrect',
    reward: {
      coins: 5000,
      title: 'Alma Lusitana',
      utilities: { freezeTime: 2 }
    }
  },

  // ==========================================
  // DISTRITOS & TERRITÓRIO
  // ==========================================
  {
    id: 'ach_orgulho_distrital',
    title: 'Orgulho Distrital',
    description: 'Joga 5 partidas a representar o teu distrito de origem.',
    category: 'distritos',
    categoryLabel: 'Distritos',
    icon: '📍',
    maxProgress: 5,
    statKey: 'districtGames',
    reward: {
      coins: 2500,
      utilities: { fiftyFifty: 2 }
    }
  },
  {
    id: 'ach_explorador_regional',
    title: 'Explorador Regional',
    description: 'Joga duelos contra adversários de 5 distritos diferentes.',
    category: 'distritos',
    categoryLabel: 'Distritos',
    icon: '🗺️',
    maxProgress: 5,
    statKey: 'districtsFaced',
    reward: {
      coins: 6000,
      title: 'Explorador Regional',
      utilities: { freezeTime: 3 }
    }
  },
  {
    id: 'ach_unificador_portugal',
    title: 'Unificador do Território',
    description: 'Disputa duelos em todas as 20 regiões e ilhas de Portugal.',
    category: 'distritos',
    categoryLabel: 'Distritos',
    icon: '🛡️',
    maxProgress: 20,
    statKey: 'districtsFaced',
    reward: {
      coins: 30000,
      title: 'Conquistador de Portugal',
      utilities: { fiftyFifty: 5, freezeTime: 5 }
    }
  },

  // ==========================================
  // ECONOMIA & MOEDAS
  // ==========================================
  {
    id: 'ach_poupador_nacional',
    title: 'Pequeno Poupador',
    description: 'Acumula um saldo total de 5.000 € Acorda.',
    category: 'economia',
    categoryLabel: 'Economia',
    icon: '🪙',
    maxProgress: 5000,
    statKey: 'coins',
    reward: {
      coins: 1500,
      utilities: { fiftyFifty: 1 }
    }
  },
  {
    id: 'ach_barao_portugal',
    title: 'Barão da República',
    description: 'Acumula um saldo superior a 50.000 € Acorda.',
    category: 'economia',
    categoryLabel: 'Economia',
    icon: '💰',
    maxProgress: 50000,
    statKey: 'coins',
    reward: {
      coins: 10000,
      title: 'Barão de Portugal',
      utilities: { fiftyFifty: 3, freezeTime: 3 }
    }
  },
  {
    id: 'ach_magnata_supremo',
    title: 'Magnata de Portugal',
    description: 'Acumula a fortuna colossal de 250.000 € Acorda.',
    category: 'economia',
    categoryLabel: 'Economia',
    icon: '💎',
    maxProgress: 250000,
    statKey: 'coins',
    reward: {
      coins: 50000,
      title: 'Magnata de Portugal',
      utilities: { fiftyFifty: 6, freezeTime: 6 }
    }
  },

  // ==========================================
  // MODO MALUCO
  // ==========================================
  {
    id: 'ach_primeira_loucura',
    title: 'Sobrevivente do Caos',
    description: 'Completa a tua primeira partida desafiante no Modo Maluco.',
    category: 'maluco',
    categoryLabel: 'Modo Maluco',
    icon: '🤪',
    maxProgress: 1,
    statKey: 'malucoGames',
    reward: {
      coins: 2000,
      utilities: { freezeTime: 1 }
    }
  },
  {
    id: 'ach_mestre_do_caos',
    title: 'Mestre do Caos',
    description: 'Acerta 25 perguntas sob as regras insanas do Modo Maluco.',
    category: 'maluco',
    categoryLabel: 'Modo Maluco',
    icon: '🌀',
    maxProgress: 25,
    statKey: 'malucoCorrect',
    reward: {
      coins: 7000,
      title: 'D. Sebastião no Nevoeiro',
      utilities: { fiftyFifty: 3, freezeTime: 2 }
    }
  },
  {
    id: 'ach_loucura_suprema',
    title: 'Insano Nacional',
    description: 'Acerta 100 perguntas com sucesso no Modo Maluco.',
    category: 'maluco',
    categoryLabel: 'Modo Maluco',
    icon: '🎭',
    maxProgress: 100,
    statKey: 'malucoCorrect',
    reward: {
      coins: 25000,
      title: 'Maluco dos Sete Mares',
      utilities: { fiftyFifty: 5, freezeTime: 5 }
    }
  },

  // ==========================================
  // ESPECIAIS & PRESTÍGIO
  // ==========================================
  {
    id: 'ach_membro_fundador',
    title: 'Membro Fundador',
    description: 'Registado como pioneiro na temporada inaugural do Acorda Portugal.',
    category: 'especiais',
    categoryLabel: 'Especiais',
    icon: '👑',
    maxProgress: 1,
    statKey: 'isFounder',
    reward: {
      coins: 10000,
      title: 'Fundador',
      utilities: { fiftyFifty: 5, freezeTime: 5 }
    }
  },
  {
    id: 'ach_top10_nacional',
    title: 'Top 10 Nacional',
    description: 'Alcança uma posição entre os 10 melhores jogadores da tabela geral.',
    category: 'especiais',
    categoryLabel: 'Especiais',
    icon: '🏆',
    maxProgress: 1,
    statKey: 'isTop10',
    reward: {
      coins: 20000,
      title: 'Top 10 Nacional',
      utilities: { fiftyFifty: 5, freezeTime: 5 }
    }
  },
  {
    id: 'ach_rei_portugal',
    title: 'Coroa de Portugal',
    description: 'Alcança o glorioso 1º Lugar da tabela nacional de liderança.',
    category: 'especiais',
    categoryLabel: 'Especiais',
    icon: '🥇',
    maxProgress: 1,
    statKey: 'isTop1',
    reward: {
      coins: 50000,
      title: 'Rei de Portugal',
      utilities: { fiftyFifty: 10, freezeTime: 10 }
    }
  }
]
