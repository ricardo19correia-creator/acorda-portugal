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
 * Os 9 Avatares Oficiais do Lore do Acorda Portugal
 */
export const REAL_AVATARS: AvatarItem[] = [
  {
    id: 'camoes_2050',
    name: 'Luís de Camões',
    subtitle: 'O Poeta das Quinas e símbolo imortal da cultura portuguesa.',
    image: '/images/avatars/camoes-2050.jpg',
    category: 'cultura',
    price: 'Grátis',
    currency: 'free',
    badge: 'Lendário',
    rarity: 'lendario',
    glowColor: 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.35)]',
    icon: '📜',
    description: 'O Poeta das Quinas e símbolo imortal da cultura portuguesa.',
  },
  {
    id: 'guardiao_acores',
    name: 'Guardião dos Açores',
    subtitle: 'A força vulcânica e a majestade do arquipélago atlântico.',
    image: '/images/avatars/vulcao-acores.jpg',
    category: 'geografia',
    price: 'Grátis',
    currency: 'free',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.35)]',
    icon: '🌋',
    description: 'A força vulcânica e a majestade do arquipélago atlântico.',
  },
  {
    id: 'lenda_futebol',
    name: 'Lenda do Futebol',
    subtitle: 'A garra e mestria do desporto rei português.',
    image: '/images/avatars/lenda-futebol-2050.jpg',
    category: 'desporto',
    price: 'Grátis',
    currency: 'free',
    badge: 'Lendário',
    rarity: 'lendario',
    glowColor: 'border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.35)]',
    icon: '⚽',
    description: 'A garra e mestria do desporto rei português.',
  },
  {
    id: 'alma_alfama',
    name: 'Alma de Alfama',
    subtitle: 'A voz profunda do fado e a alma das vielas históricas de Lisboa.',
    image: '/images/avatars/alma-alfama-2050.jpg',
    category: 'cultura',
    price: 'Grátis',
    currency: 'free',
    badge: 'Raro',
    rarity: 'raro',
    glowColor: 'border-fuchsia-500/60 shadow-[0_0_20px_rgba(217,70,239,0.35)]',
    icon: '🎸',
    description: 'A voz profunda do fado e a alma das vielas históricas de Lisboa.',
  },
  {
    id: 'sebastiao_nevoeiro',
    name: 'D. Sebastião',
    subtitle: 'O Rei adormecido na névoa, mito e esperança de Portugal.',
    image: '/images/avatars/sebastiao-2050.jpg',
    category: 'historia',
    price: 'Grátis',
    currency: 'free',
    badge: 'Mítico',
    rarity: 'mitico',
    glowColor: 'border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.45)]',
    icon: '👑',
    description: 'O Rei adormecido na névoa, mito e esperança de Portugal.',
  },
  {
    id: 'campeao_nacional',
    name: 'Campeão Nacional',
    subtitle: 'A distinção máxima outorgada ao grande campeão de Portugal.',
    image: '/images/avatars/Campeão Nacional.png',
    category: 'geral',
    price: 'Grátis',
    currency: 'free',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-yellow-400/60 shadow-[0_0_20px_rgba(250,204,21,0.35)]',
    icon: '🏆',
    description: 'A distinção máxima outorgada ao grande campeão de Portugal.',
  },
  {
    id: 'lenda_suprema_acorda',
    name: 'Lenda Suprema do Acorda',
    subtitle: 'Forjado na glória imortal das maiores conquistas do Acorda Portugal.',
    image: '/images/avatars/LENDA SUPREMA DO ACORDA.png',
    category: 'historia',
    price: 'Grátis',
    currency: 'free',
    badge: 'Mítico',
    rarity: 'mitico',
    glowColor: 'border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.45)]',
    icon: '🔥',
    description: 'Forjado na glória imortal das maiores conquistas do Acorda Portugal.',
  },
  {
    id: 'representante_distrital',
    name: 'Representante Distrital',
    subtitle: 'O guardião e líder supremo com o brasão honorífico do seu distrito.',
    image: '/images/avatars/REPRESENTANTE DISTRITAL.png',
    category: 'geografia',
    price: 'Grátis',
    currency: 'free',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.35)]',
    icon: '🇵🇹',
    description: 'O guardião e líder supremo com o brasão honorífico do seu distrito.',
  },
  {
    id: 'tita_top_10',
    name: 'Titã do Top 10',
    subtitle: 'Consagrado entre a elite dos melhores estrategas da nação.',
    image: '/images/avatars/TITÃ DO TOP 10.png',
    category: 'geral',
    price: 'Grátis',
    currency: 'free',
    badge: 'Lendário',
    rarity: 'lendario',
    glowColor: 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.35)]',
    icon: '🥇',
    description: 'Consagrado entre a elite dos melhores estrategas da nação.',
  },
];

/**
 * Biblioteca Expandida de 50+ Avatares Estilizados para Jogadores e Bots
 * Combina os 9 avatares de lore com retratos de alta definição e sementes visuais
 */
export const BOT_AVATARS_LIBRARY: string[] = [
  // 9 Avatares do Lore
  '/images/avatars/camoes-2050.jpg',
  '/images/avatars/vulcao-acores.jpg',
  '/images/avatars/lenda-futebol-2050.jpg',
  '/images/avatars/alma-alfama-2050.jpg',
  '/images/avatars/sebastiao-2050.jpg',
  '/images/avatars/Campeão Nacional.png',
  '/images/avatars/LENDA SUPREMA DO ACORDA.png',
  '/images/avatars/REPRESENTANTE DISTRITAL.png',
  '/images/avatars/TITÃ DO TOP 10.png',

  // 45+ Personas Visuais Únicas (Dicebear Adventurer / Lorelei / Avataaars com seeds portuguesas estáveis)
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
  camoes_2050: 'camoes_2050',
  'camoes-2050': 'camoes_2050',
  '/images/avatars/camoes-2050.jpg': 'camoes_2050',
  '/images/avatars/camoes-2050.png': 'camoes_2050',
  '/avatars/camoes-2050.jpg': 'camoes_2050',
  '/avatars/camoes-2050.png': 'camoes_2050',

  guardiao_acores: 'guardiao_acores',
  'vulcao-acores': 'guardiao_acores',
  '/images/avatars/vulcao-acores.jpg': 'guardiao_acores',
  '/images/avatars/vulcao-acores.png': 'guardiao_acores',

  lenda_futebol: 'lenda_futebol',
  'lenda-futebol-2050': 'lenda_futebol',
  '/images/avatars/lenda-futebol-2050.jpg': 'lenda_futebol',
  '/images/avatars/lenda-futebol-2050.png': 'lenda_futebol',

  alma_alfama: 'alma_alfama',
  'alma-alfama-2050': 'alma_alfama',
  '/images/avatars/alma-alfama-2050.jpg': 'alma_alfama',
  '/images/avatars/alma-alfama-2050.png': 'alma_alfama',

  sebastiao_nevoeiro: 'sebastiao_nevoeiro',
  'sebastiao-2050': 'sebastiao_nevoeiro',
  '/images/avatars/sebastiao-2050.jpg': 'sebastiao_nevoeiro',
  '/images/avatars/sebastiao-2050.png': 'sebastiao_nevoeiro',

  campeao_nacional: 'campeao_nacional',
  'campeao-nacional': 'campeao_nacional',
  '/images/avatars/Campeão Nacional.png': 'campeao_nacional',
  '/images/avatars/Campe%C3%A3o%20Nacional.png': 'campeao_nacional',

  lenda_suprema_acorda: 'lenda_suprema_acorda',
  'lenda-suprema-acorda': 'lenda_suprema_acorda',
  '/images/avatars/LENDA SUPREMA DO ACORDA.png': 'lenda_suprema_acorda',
  '/images/avatars/LENDA%20SUPREMA%20DO%20ACORDA.png': 'lenda_suprema_acorda',

  representante_distrital: 'representante_distrital',
  'representante-distrital': 'representante_distrital',
  '/images/avatars/REPRESENTANTE DISTRITAL.png': 'representante_distrital',
  '/images/avatars/REPRESENTANTE%20DISTRITAL.png': 'representante_distrital',

  tita_top_10: 'tita_top_10',
  'tita-top-10': 'tita_top_10',
  '/images/avatars/TITÃ DO TOP 10.png': 'tita_top_10',
  '/images/avatars/TIT%C3%83%20DO%20TOP%2010.png': 'tita_top_10',
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

  // 3. Verificação por substring de ficheiro/nome
  if (lower.includes('camoes')) return REAL_AVATARS[0];
  if (lower.includes('vulcao') || lower.includes('guardiao') || lower.includes('acores')) return REAL_AVATARS[1];
  if (lower.includes('futebol') || lower.includes('quinas')) return REAL_AVATARS[2];
  if (lower.includes('alfama') || lower.includes('fadista')) return REAL_AVATARS[3];
  if (lower.includes('sebastiao')) return REAL_AVATARS[4];
  if (lower.includes('campeao') || lower.includes('campeão')) return REAL_AVATARS[5];
  if (lower.includes('suprema')) return REAL_AVATARS[6];
  if (lower.includes('distrital') || lower.includes('representante')) return REAL_AVATARS[7];
  if (lower.includes('top 10') || lower.includes('top10') || lower.includes('tita') || lower.includes('titã')) return REAL_AVATARS[8];

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
