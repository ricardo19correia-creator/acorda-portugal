// ============================================================================
// ACORDA PORTUGAL — SISTEMA CANÓNICO & DIVERSIDADE VISUAL DE AVATARES
// 9 Avatares Oficiais do Lore + 50+ Personas Virtuais Diversificadas
// ============================================================================

export type AvatarRarity = 'comum' | 'raro' | 'epico' | 'lendario' | 'mitico';

export interface AvatarItem {
  id: string;
  name: string;
  subtitle?: string;
  category: 'geral' | 'historia' | 'geografia' | 'desporto' | 'cultura';
  price: number | string;
  currency: 'free' | 'coins' | 'real_money' | 'points' | 'eur';
  icon?: string;
  image: string;
  description?: string;
  badge?: string;
  rarity?: AvatarRarity;
  borderGlow?: string;
  glowColor?: string;
  disabled?: boolean;
}

/**
 * Os 36 Avatares Oficiais do Acorda Portugal — Desafio Nacional
 * IDs estáveis: avatar_01 a avatar_36
 */
export const REAL_AVATARS: AvatarItem[] = [
  {
    id: 'avatar_01',
    name: 'O Estratega',
    subtitle: 'Mente tática, calculista e frio sob pressão.',
    image: '/images/avatars/avatar_01.png',
    category: 'geral',
    price: 'Grátis',
    currency: 'free',
    badge: 'Inicial',
    rarity: 'comum',
    glowColor: 'border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.35)]',
    icon: '🧠',
    description: 'Mente tática, calculista e frio sob pressão.',
  },
  {
    id: 'avatar_02',
    name: 'A Líder',
    subtitle: 'Presença imponente, determinação e espírito de liderança.',
    image: '/images/avatars/avatar_02.png',
    category: 'geral',
    price: 'Grátis',
    currency: 'free',
    badge: 'Inicial',
    rarity: 'comum',
    glowColor: 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.35)]',
    icon: '👑',
    description: 'Presença imponente, determinação e espírito de liderança.',
  },
  {
    id: 'avatar_03',
    name: 'O Explorador',
    subtitle: 'Curiosidade insaciável e audácia nas grandes rotas.',
    image: '/images/avatars/avatar_03.png',
    category: 'geografia',
    price: 'Grátis',
    currency: 'free',
    badge: 'Inicial',
    rarity: 'comum',
    glowColor: 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.35)]',
    icon: '🧭',
    description: 'Curiosidade insaciável e audácia nas grandes rotas.',
  },
  {
    id: 'avatar_04',
    name: 'A Competidora',
    subtitle: 'Foco absoluto, garra atlética e sede incansável de vitória.',
    image: '/images/avatars/avatar_04.png',
    category: 'desporto',
    price: 'Grátis',
    currency: 'free',
    badge: 'Inicial',
    rarity: 'comum',
    glowColor: 'border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.35)]',
    icon: '⚡',
    description: 'Foco absoluto, garra atlética e sede incansável de vitória.',
  },
  {
    id: 'avatar_05',
    name: 'O Mestre',
    subtitle: 'Sabedoria profunda e serenidade nos momentos decisivos.',
    image: '/images/avatars/avatar_05.png',
    category: 'historia',
    price: 500,
    currency: 'coins',
    badge: 'Raro',
    rarity: 'raro',
    glowColor: 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.35)]',
    icon: '📜',
    description: 'Sabedoria profunda e serenidade nos momentos decisivos.',
  },
  {
    id: 'avatar_06',
    name: 'A Gamer',
    subtitle: 'Reflexos ultrarrápidos e mestria no ecossistema digital.',
    image: '/images/avatars/avatar_06.png',
    category: 'geral',
    price: 500,
    currency: 'coins',
    badge: 'Raro',
    rarity: 'raro',
    glowColor: 'border-fuchsia-500/60 shadow-[0_0_20px_rgba(217,70,239,0.35)]',
    icon: '🎮',
    description: 'Reflexos ultrarrápidos e mestria no ecossistema digital.',
  },
  {
    id: 'avatar_07',
    name: 'O Descontraído',
    subtitle: 'Carisma natural que transforma a pressão do jogo em diversão.',
    image: '/images/avatars/avatar_07.png',
    category: 'geral',
    price: 500,
    currency: 'coins',
    badge: 'Raro',
    rarity: 'raro',
    glowColor: 'border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.35)]',
    icon: '😎',
    description: 'Carisma natural que transforma a pressão do jogo em diversão.',
  },
  {
    id: 'avatar_08',
    name: 'A Visionária',
    subtitle: 'Sempre três passos à frente, desenhando o Portugal de amanhã.',
    image: '/images/avatars/avatar_08.png',
    category: 'cultura',
    price: 750,
    currency: 'coins',
    badge: 'Raro',
    rarity: 'raro',
    glowColor: 'border-violet-500/60 shadow-[0_0_20px_rgba(139,92,246,0.35)]',
    icon: '🔮',
    description: 'Sempre três passos à frente, desenhando o Portugal de amanhã.',
  },
  {
    id: 'avatar_09',
    name: 'O Rebelde',
    subtitle: 'Desafia o óbvio e arrisca tudo pela glória no duelo.',
    image: '/images/avatars/avatar_09.png',
    category: 'geral',
    price: 750,
    currency: 'coins',
    badge: 'Raro',
    rarity: 'raro',
    glowColor: 'border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.35)]',
    icon: '🔥',
    description: 'Desafia o óbvio e arrisca tudo pela glória no duelo.',
  },
  {
    id: 'avatar_10',
    name: 'A Investigadora',
    subtitle: 'Olhar cirúrgico que desvenda qualquer mistério ou detalhe histórico.',
    image: '/images/avatars/avatar_10.png',
    category: 'historia',
    price: 750,
    currency: 'coins',
    badge: 'Raro',
    rarity: 'raro',
    glowColor: 'border-teal-500/60 shadow-[0_0_20px_rgba(20,184,166,0.35)]',
    icon: '🔍',
    description: 'Olhar cirúrgico que desvenda qualquer mistério ou detalhe histórico.',
  },
  {
    id: 'avatar_11',
    name: 'O Desportista',
    subtitle: 'Velocidade, resistência atlética e espírito de superação.',
    image: '/images/avatars/avatar_11.png',
    category: 'desporto',
    price: 1000,
    currency: 'coins',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-green-500/60 shadow-[0_0_20px_rgba(34,197,94,0.35)]',
    icon: '⚽',
    description: 'Velocidade, resistência atlética e espírito de superação.',
  },
  {
    id: 'avatar_12',
    name: 'A Artista',
    subtitle: 'A voz profunda, emoção pura e poesia da alma portuguesa.',
    image: '/images/avatars/avatar_12.png',
    category: 'cultura',
    price: 1000,
    currency: 'coins',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-pink-500/60 shadow-[0_0_20px_rgba(236,72,153,0.35)]',
    icon: '🎨',
    description: 'A voz profunda, emoção pura e poesia da alma portuguesa.',
  },
  {
    id: 'avatar_13',
    name: 'O Professor',
    subtitle: 'A erudição carismática de quem inspira gerações de mentes brilhantes.',
    image: '/images/avatars/avatar_13.png',
    category: 'historia',
    price: 1000,
    currency: 'coins',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-amber-600/60 shadow-[0_0_20px_rgba(217,119,6,0.35)]',
    icon: '📚',
    description: 'A erudição carismática de quem inspira gerações de mentes brilhantes.',
  },
  {
    id: 'avatar_14',
    name: 'A Aventureira',
    subtitle: 'Coragem destemida para conquistar serras, mares e arquipélagos.',
    image: '/images/avatars/avatar_14.png',
    category: 'geografia',
    price: 1250,
    currency: 'coins',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.35)]',
    icon: '🏔️',
    description: 'Coragem destemida para conquistar serras, mares e arquipélagos.',
  },
  {
    id: 'avatar_15',
    name: 'O Técnico',
    subtitle: 'Precisão algorítmica e raciocínio lógico infalível.',
    image: '/images/avatars/avatar_15.png',
    category: 'geral',
    price: 1250,
    currency: 'coins',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-sky-500/60 shadow-[0_0_20px_rgba(14,165,233,0.35)]',
    icon: '💻',
    description: 'Precisão algorítmica e raciocínio lógico infalível.',
  },
  {
    id: 'avatar_16',
    name: 'A Estratega',
    subtitle: 'Paciência cirúrgica que antecipa o adversário xeque por xeque.',
    image: '/images/avatars/avatar_16.png',
    category: 'geral',
    price: 1500,
    currency: 'coins',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-blue-600/60 shadow-[0_0_20px_rgba(37,99,235,0.35)]',
    icon: '♟️',
    description: 'Paciência cirúrgica que antecipa o adversário xeque por xeque.',
  },
  {
    id: 'avatar_17',
    name: 'O Visionário',
    subtitle: 'Audácia e pensamento inovador que quebram velhos paradigmas.',
    image: '/images/avatars/avatar_17.png',
    category: 'geral',
    price: 1500,
    currency: 'coins',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-purple-600/60 shadow-[0_0_20px_rgba(147,51,234,0.35)]',
    icon: '✨',
    description: 'Audácia e pensamento inovador que quebram velhos paradigmas.',
  },
  {
    id: 'avatar_18',
    name: 'A Campeã',
    subtitle: 'A dignidade triunfante de quem ergue a taça nacional.',
    image: '/images/avatars/avatar_18.png',
    category: 'desporto',
    price: 2000,
    currency: 'coins',
    badge: 'Lendário',
    rarity: 'lendario',
    glowColor: 'border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.35)]',
    icon: '🥇',
    description: 'A dignidade triunfante de quem ergue a taça nacional.',
  },
  {
    id: 'avatar_19',
    name: 'O Curioso',
    subtitle: 'A fome insaciável de descobrir novas curiosidades do país.',
    image: '/images/avatars/avatar_19.png',
    category: 'geral',
    price: 750,
    currency: 'coins',
    badge: 'Raro',
    rarity: 'raro',
    glowColor: 'border-yellow-600/60 shadow-[0_0_20px_rgba(202,138,4,0.35)]',
    icon: '💡',
    description: 'A fome insaciável de descobrir novas curiosidades do país.',
  },
  {
    id: 'avatar_20',
    name: 'A Investigadora Urbana',
    subtitle: 'Conhecedora das cidades, do património e da evolução contemporânea.',
    image: '/images/avatars/avatar_20.png',
    category: 'geografia',
    price: 1000,
    currency: 'coins',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-stone-400/60 shadow-[0_0_20px_rgba(168,162,158,0.35)]',
    icon: '🏙️',
    description: 'Conhecedora das cidades, do património e da evolução contemporânea.',
  },
  {
    id: 'avatar_21',
    name: 'O Capitão',
    subtitle: 'O líder firme e respeitado que conduz a tripulação à glória.',
    image: '/images/avatars/avatar_21.png',
    category: 'geografia',
    price: 2500,
    currency: 'coins',
    badge: 'Lendário',
    rarity: 'lendario',
    glowColor: 'border-cyan-600/60 shadow-[0_0_20px_rgba(8,145,178,0.35)]',
    icon: '⚓',
    description: 'O líder firme e respeitado que conduz a tripulação à glória.',
  },
  {
    id: 'avatar_22',
    name: 'A Criativa',
    subtitle: 'Visual vibrante e capacidade singular de encontrar respostas inovadoras.',
    image: '/images/avatars/avatar_22.png',
    category: 'cultura',
    price: 1000,
    currency: 'coins',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-rose-400/60 shadow-[0_0_20px_rgba(251,113,133,0.35)]',
    icon: '🎭',
    description: 'Visual vibrante e capacidade singular de encontrar respostas inovadoras.',
  },
  {
    id: 'avatar_23',
    name: 'O Minimalista',
    subtitle: 'Elegância discreta, sobriedade e eficiência sem distrações.',
    image: '/images/avatars/avatar_23.png',
    category: 'geral',
    price: 1250,
    currency: 'coins',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-zinc-400/60 shadow-[0_0_20px_rgba(161,161,170,0.35)]',
    icon: '🎯',
    description: 'Elegância discreta, sobriedade e eficiência sem distrações.',
  },
  {
    id: 'avatar_24',
    name: 'A Challenger',
    subtitle: 'Espírito irreverente que não teme nenhum titã das tabelas.',
    image: '/images/avatars/avatar_24.png',
    category: 'geral',
    price: 1750,
    currency: 'coins',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-fuchsia-600/60 shadow-[0_0_20px_rgba(192,38,211,0.35)]',
    icon: '💥',
    description: 'Espírito irreverente que não teme nenhum titã das tabelas.',
  },
  {
    id: 'avatar_25',
    name: 'O Geek',
    subtitle: 'Enciclopédia viva com um vasto arsenal de cultura lusa e geral.',
    image: '/images/avatars/avatar_25.png',
    category: 'geral',
    price: 1000,
    currency: 'coins',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-emerald-600/60 shadow-[0_0_20px_rgba(5,150,105,0.35)]',
    icon: '🕹️',
    description: 'Enciclopédia viva com um vasto arsenal de cultura lusa e geral.',
  },
  {
    id: 'avatar_26',
    name: 'A Analista',
    subtitle: 'Raciocínio lógico estruturado e foco absoluto no resultado.',
    image: '/images/avatars/avatar_26.png',
    category: 'geral',
    price: 1500,
    currency: 'coins',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-slate-400/60 shadow-[0_0_20px_rgba(148,163,184,0.35)]',
    icon: '📊',
    description: 'Raciocínio lógico estruturado e foco absoluto no resultado.',
  },
  {
    id: 'avatar_27',
    name: 'O Comunicador',
    subtitle: 'Carisma eloquente que move multidões e contagia o jogo.',
    image: '/images/avatars/avatar_27.png',
    category: 'cultura',
    price: 1250,
    currency: 'coins',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.35)]',
    icon: '🎙️',
    description: 'Carisma eloquente que move multidões e contagia o jogo.',
  },
  {
    id: 'avatar_28',
    name: 'A Exploradora Digital',
    subtitle: 'Navegadora das novas fronteiras da tecnologia e do saber.',
    image: '/images/avatars/avatar_28.png',
    category: 'geral',
    price: 2000,
    currency: 'coins',
    badge: 'Lendário',
    rarity: 'lendario',
    glowColor: 'border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.35)]',
    icon: '🌐',
    description: 'Navegadora das novas fronteiras da tecnologia e do saber.',
  },
  {
    id: 'avatar_29',
    name: 'O Mestre do Quiz',
    subtitle: 'O decifrador supremo de charadas, factos e enigmas da história.',
    image: '/images/avatars/avatar_29.png',
    category: 'historia',
    price: 2500,
    currency: 'coins',
    badge: 'Lendário',
    rarity: 'lendario',
    glowColor: 'border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.35)]',
    icon: '🎩',
    description: 'O decifrador supremo de charadas, factos e enigmas da história.',
  },
  {
    id: 'avatar_30',
    name: 'A Rainha do Ranking',
    subtitle: 'A soberana indiscutível das pontuações máximas nacionais.',
    image: '/images/avatars/avatar_30.png',
    category: 'geral',
    price: 'Mérito',
    currency: 'free',
    badge: 'Exclusivo',
    rarity: 'lendario',
    glowColor: 'border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.45)]',
    icon: '👑',
    description: 'A soberana indiscutível das pontuações máximas nacionais.',
  },
  {
    id: 'avatar_31',
    name: 'O Veterano',
    subtitle: 'Anos de sabedoria e prestígio respeitados por toda a comunidade.',
    image: '/images/avatars/avatar_31.png',
    category: 'historia',
    price: 3500,
    currency: 'coins',
    badge: 'Lendário',
    rarity: 'lendario',
    glowColor: 'border-slate-300/60 shadow-[0_0_25px_rgba(203,213,225,0.45)]',
    icon: '🛡️',
    description: 'Anos de sabedoria e prestígio respeitados por toda a comunidade.',
  },
  {
    id: 'avatar_32',
    name: 'A Nova Geração',
    subtitle: 'A força jovem e vibrante que está a redefinir o futuro da nação.',
    image: '/images/avatars/avatar_32.png',
    category: 'geral',
    price: 1500,
    currency: 'coins',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-pink-500/60 shadow-[0_0_20px_rgba(236,72,153,0.35)]',
    icon: '🌟',
    description: 'A força jovem e vibrante que está a redefinir o futuro da nação.',
  },
  {
    id: 'avatar_33',
    name: 'O Campeão',
    subtitle: 'Consagrado no panteão dos maiores vencedores do Acorda Portugal.',
    image: '/images/avatars/avatar_33.png',
    category: 'desporto',
    price: 5000,
    currency: 'coins',
    badge: 'Lendário',
    rarity: 'lendario',
    glowColor: 'border-yellow-400/60 shadow-[0_0_25px_rgba(250,204,21,0.45)]',
    icon: '🏆',
    description: 'Consagrado no panteão dos maiores vencedores do Acorda Portugal.',
  },
  {
    id: 'avatar_34',
    name: 'A Lenda',
    subtitle: 'Uma presença marcante e memorável que inspira o país inteiro.',
    image: '/images/avatars/avatar_34.png',
    category: 'historia',
    price: 7500,
    currency: 'coins',
    badge: 'Mítico',
    rarity: 'mitico',
    glowColor: 'border-purple-400/60 shadow-[0_0_30px_rgba(192,132,252,0.5)]',
    icon: '🔥',
    description: 'Uma presença marcante e memorável que inspira o país inteiro.',
  },
  {
    id: 'avatar_35',
    name: 'O Desafiante',
    subtitle: 'Audácia competitiva inclemente perante qualquer desafio.',
    image: '/images/avatars/avatar_35.png',
    category: 'geral',
    price: 'Mérito',
    currency: 'free',
    badge: 'Exclusivo',
    rarity: 'mitico',
    glowColor: 'border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.5)]',
    icon: '⚔️',
    description: 'Audácia competitiva inclemente perante qualquer desafio.',
  },
  {
    id: 'avatar_36',
    name: 'A Lenda Portuguesa',
    subtitle: 'O símbolo supremo das Quinas e da alma imortal de Portugal.',
    image: '/images/avatars/avatar_36.png',
    category: 'historia',
    price: 'Mérito',
    currency: 'free',
    badge: 'Exclusivo',
    rarity: 'mitico',
    glowColor: 'border-amber-400/80 shadow-[0_0_35px_rgba(251,191,36,0.6)]',
    icon: '🇵🇹',
    description: 'O símbolo supremo das Quinas e da alma imortal de Portugal.',
  },
];

/**
 * Biblioteca Oficial de Avatares para Jogadores e Sistema
 */
export const BOT_AVATARS_LIBRARY: string[] = [
  // 36 Avatares Oficiais do Acorda Portugal
  ...REAL_AVATARS.map((a) => a.image),

  // Personas Visuais Adicionais para Diversidade Estilizada
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Afonso&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Beatriz&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Carolina&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Duarte&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Eva&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Francisco&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Goncalo&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Helena&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Ines&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Joao&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Katia&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Lourenco&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Madalena&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Nuno&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Olivia&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Pedro&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Raquel&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Salvador&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Teresa&backgroundColor=050505',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Vasco&backgroundColor=050505',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Mariana&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Rodrigo&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Sofia&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Tiago&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Clara&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Martim&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Diana&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Henrique&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Francisca&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Guilherme&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/bottts/svg?seed=LusoBot1&backgroundColor=050505',
  'https://api.dicebear.com/7.x/bottts/svg?seed=LusoBot2&backgroundColor=050505',
  'https://api.dicebear.com/7.x/bottts/svg?seed=LusoBot3&backgroundColor=050505',
  'https://api.dicebear.com/7.x/bottts/svg?seed=LusoBot4&backgroundColor=050505',
  'https://api.dicebear.com/7.x/bottts/svg?seed=LusoBot5&backgroundColor=050505',
  'https://api.dicebear.com/7.x/micah/svg?seed=PortoMinho&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/micah/svg?seed=LisboaSul&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/micah/svg?seed=CentroCoimbra&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/micah/svg?seed=AlentejoEvora&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/micah/svg?seed=AlgarveFaro&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/micah/svg?seed=MadeiraFunchal&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/micah/svg?seed=AcoresPontaDelgada&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/micah/svg?seed=BragaNorte&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/micah/svg?seed=AveiroRia&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/micah/svg?seed=SetubalSado&backgroundColor=0a0a0a',
  'https://api.dicebear.com/7.x/micah/svg?seed=ViseuDao&backgroundColor=0a0a0a',
];

export const DEFAULT_AVATAR: AvatarItem = REAL_AVATARS[0];
export const AVATARS_2050: AvatarItem[] = REAL_AVATARS;
export const AVATAR_CATALOG: AvatarItem[] = REAL_AVATARS;

/**
 * Mapa de aliases para retrocompatibilidade
 */
const ALIAS_MAP: Record<string, string> = {
  // Canónicos avatar_01 a avatar_36
  ...Array.from({ length: 36 }, (_, i) => {
    const id = `avatar_${String(i + 1).padStart(2, '0')}`;
    return {
      [id]: id,
      [`/images/avatars/${id}.png`]: id,
      [`/avatars/${id}.png`]: id,
    };
  }).reduce((acc, curr) => ({ ...acc, ...curr }), {}),

  // Aliases Legados do Lore
  camoes_2050: 'avatar_36',
  'camoes-2050': 'avatar_36',
  '/images/avatars/camoes-2050.jpg': 'avatar_36',
  '/images/avatars/camoes-2050.png': 'avatar_36',
  '/avatars/camoes-2050.jpg': 'avatar_36',
  '/avatars/camoes-2050.png': 'avatar_36',

  guardiao_acores: 'avatar_03',
  'vulcao-acores': 'avatar_03',
  '/images/avatars/vulcao-acores.jpg': 'avatar_03',
  '/images/avatars/vulcao-acores.png': 'avatar_03',

  lenda_futebol: 'avatar_11',
  'lenda-futebol-2050': 'avatar_11',
  '/images/avatars/lenda-futebol-2050.jpg': 'avatar_11',
  '/images/avatars/lenda-futebol-2050.png': 'avatar_11',

  alma_alfama: 'avatar_12',
  'alma-alfama-2050': 'avatar_12',
  '/images/avatars/alma-alfama-2050.jpg': 'avatar_12',
  '/images/avatars/alma-alfama-2050.png': 'avatar_12',

  sebastiao_nevoeiro: 'avatar_34',
  'sebastiao-2050': 'avatar_34',
  '/images/avatars/sebastiao-2050.jpg': 'avatar_34',
  '/images/avatars/sebastiao-2050.png': 'avatar_34',

  campeao_nacional: 'avatar_33',
  'campeao-nacional': 'avatar_33',
  '/images/avatars/Campeão Nacional.png': 'avatar_33',
  '/images/avatars/Campe%C3%A3o%20Nacional.png': 'avatar_33',

  lenda_suprema_acorda: 'avatar_35',
  'lenda-suprema-acorda': 'avatar_35',
  '/images/avatars/LENDA SUPREMA DO ACORDA.png': 'avatar_35',
  '/images/avatars/LENDA%20SUPREMA%20DO%20ACORDA.png': 'avatar_35',

  representante_distrital: 'avatar_21',
  'representante-distrital': 'avatar_21',
  '/images/avatars/REPRESENTANTE DISTRITAL.png': 'avatar_21',
  '/images/avatars/REPRESENTANTE%20DISTRITAL.png': 'avatar_21',

  tita_top_10: 'avatar_30',
  'tita-top-10': 'avatar_30',
  '/images/avatars/TITÃ DO TOP 10.png': 'avatar_30',
  '/images/avatars/TIT%C3%83%20DO%20TOP%2010.png': 'avatar_30',
};

/**
 * Resolve qualquer ID, alias ou URL para o AvatarItem correspondente
 */
export function getAvatarById(idOrUrl?: string | null): AvatarItem {
  if (!idOrUrl || typeof idOrUrl !== 'string') {
    return DEFAULT_AVATAR;
  }

  const cleaned = idOrUrl.trim();
  const lower = cleaned.toLowerCase();

  // 1. Verificação direta no alias map
  const canonicalId = ALIAS_MAP[lower] || ALIAS_MAP[cleaned];
  if (canonicalId) {
    const found = REAL_AVATARS.find((a) => a.id === canonicalId);
    if (found) return found;
  }

  // 2. Se for uma URL externa ou data URI, criar um AvatarItem dinâmico para preservar a imagem
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('data:image/')) {
    return {
      id: `custom_${Math.abs(cleaned.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0))}`,
      name: 'Desafiante Nacional',
      image: cleaned,
      category: 'geral',
      price: 'Grátis',
      currency: 'free',
      rarity: 'raro',
      icon: '🇵🇹',
    };
  }

  // 3. Verificação de ID avatar_XX direto
  const avatarMatch = lower.match(/avatar_([0-9]{1,2})/);
  if (avatarMatch) {
    const num = parseInt(avatarMatch[1], 10);
    if (num >= 1 && num <= REAL_AVATARS.length) {
      return REAL_AVATARS[num - 1];
    }
  }

  // 4. Verificação por nome exato do catálogo
  const foundByName = REAL_AVATARS.find((a) => a.name.toLowerCase() === lower);
  if (foundByName) return foundByName;

  return DEFAULT_AVATAR;
}

/**
 * Retorna o caminho ou URL para a imagem do avatar
 */
export function getAvatarImage(idOrUrl?: string | null): string {
  if (!idOrUrl || typeof idOrUrl !== 'string') {
    return DEFAULT_AVATAR.image;
  }
  const trimmed = idOrUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }
  return getAvatarById(trimmed).image;
}

/**
 * Normaliza qualquer ID/URL para o ID estável
 */
export function normalizeAvatarId(idOrUrl?: string | null): string {
  return getAvatarById(idOrUrl).id;
}

/**
 * Verifica se um determinado ID é um dos 9 avatares do lore
 */
export function isValidAvatarId(id?: string | null): boolean {
  if (!id) return false;
  return REAL_AVATARS.some((a) => a.id === id);
}
