// ============================================================================
// ACORDA PORTUGAL — FONTE ÚNICA DE VERDADE DOS AVATARES
// EXCLUSIVAMENTE OS 9 AVATARES REAIS DO PROJETO
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
 * Os 9 Avatares Reais e Canónicos do Acorda Portugal
 * Ficheiros reais em /public/images/avatars/ e /public/imagens/avatar/
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

export const DEFAULT_AVATAR: AvatarItem = REAL_AVATARS[0];

export const AVATARS_2050: AvatarItem[] = REAL_AVATARS;
export const AVATAR_CATALOG: AvatarItem[] = REAL_AVATARS;

/**
 * Mapa de aliases para retrocompatibilidade com dados de Firestore, LocalStorage e caminhos
 */
const ALIAS_MAP: Record<string, string> = {
  // 1. Camões
  camoes_2050: 'camoes_2050',
  'camoes-2050': 'camoes_2050',
  avatar_camoes_2050: 'camoes_2050',
  'avatar-01': 'camoes_2050',
  camoes: 'camoes_2050',
  '/images/avatars/camoes-2050.jpg': 'camoes_2050',
  '/imagens/avatar/camoes-2050.jpg': 'camoes_2050',
  '/avatars/camoes-2050.jpg': 'camoes_2050',

  // 2. Guardião dos Açores
  guardiao_acores: 'guardiao_acores',
  'guardiao-vulcanico': 'guardiao_acores',
  'vulcao-acores': 'guardiao_acores',
  avatar_vulcao_acores: 'guardiao_acores',
  'avatar-02': 'guardiao_acores',
  'acores-guardiao-2050': 'guardiao_acores',
  '/images/avatars/vulcao-acores.jpg': 'guardiao_acores',
  '/images/avatars/guardiao-vulcanico.jpg': 'guardiao_acores',
  '/images/avatars/acores-guardiao-2050.jpg': 'guardiao_acores',
  '/imagens/avatar/vulcao-acores.jpg': 'guardiao_acores',
  '/avatars/vulcao-acores.jpg': 'guardiao_acores',

  // 3. Lenda do Futebol
  lenda_futebol: 'lenda_futebol',
  'lenda-futebol-2050': 'lenda_futebol',
  avatar_lenda_futebol: 'lenda_futebol',
  'cyborg-quinas': 'lenda_futebol',
  'avatar-03': 'lenda_futebol',
  '/images/avatars/lenda-futebol-2050.jpg': 'lenda_futebol',
  '/images/shop/cyborg-quinas.jpg': 'lenda_futebol',
  '/imagens/avatar/lenda-futebol-2050.jpg': 'lenda_futebol',
  '/avatars/lenda-futebol-2050.jpg': 'lenda_futebol',

  // 4. Alma de Alfama
  alma_alfama: 'alma_alfama',
  'alma-alfama-2050': 'alma_alfama',
  avatar_alma_alfama: 'alma_alfama',
  'fadista-cyber-alfama': 'alma_alfama',
  avatar_fadista_cyber: 'alma_alfama',
  'avatar-04': 'alma_alfama',
  '/images/avatars/alma-alfama-2050.jpg': 'alma_alfama',
  '/images/shop/fadista-cyber.jpg': 'alma_alfama',
  '/imagens/avatar/alma-alfama-2050.jpg': 'alma_alfama',
  '/avatars/alma-alfama-2050.jpg': 'alma_alfama',

  // 5. D. Sebastião
  sebastiao_nevoeiro: 'sebastiao_nevoeiro',
  'sebastiao-2050': 'sebastiao_nevoeiro',
  avatar_sebastiao_2050: 'sebastiao_nevoeiro',
  sebastiao: 'sebastiao_nevoeiro',
  'avatar-05': 'sebastiao_nevoeiro',
  '/images/avatars/sebastiao-2050.jpg': 'sebastiao_nevoeiro',
  '/imagens/avatar/sebastiao-2050.jpg': 'sebastiao_nevoeiro',
  '/avatars/sebastiao-2050.jpg': 'sebastiao_nevoeiro',

  // 6. Campeão Nacional
  campeao_nacional: 'campeao_nacional',
  'campeao-nacional': 'campeao_nacional',
  'exclusivo_campeao': 'campeao_nacional',
  'campeão nacional': 'campeao_nacional',
  'campeao nacional.png': 'campeao_nacional',
  '/images/avatars/Campeão Nacional.png': 'campeao_nacional',
  '/images/avatars/Campe%C3%A3o%20Nacional.png': 'campeao_nacional',
  '/imagens/avatar/Campeão Nacional.png': 'campeao_nacional',
  '/imagens/avatar/Campe%C3%A3o%20Nacional.png': 'campeao_nacional',
  '/avatars/Campeão Nacional.png': 'campeao_nacional',
  '/avatars/Campe%C3%A3o%20Nacional.png': 'campeao_nacional',

  // 7. Lenda Suprema do Acorda
  lenda_suprema_acorda: 'lenda_suprema_acorda',
  'lenda-suprema-acorda': 'lenda_suprema_acorda',
  'exclusivo_lenda_100': 'lenda_suprema_acorda',
  'lenda suprema do acorda': 'lenda_suprema_acorda',
  'lenda suprema do acorda.png': 'lenda_suprema_acorda',
  '/images/avatars/LENDA SUPREMA DO ACORDA.png': 'lenda_suprema_acorda',
  '/images/avatars/LENDA%20SUPREMA%20DO%20ACORDA.png': 'lenda_suprema_acorda',
  '/imagens/avatar/LENDA SUPREMA DO ACORDA.png': 'lenda_suprema_acorda',
  '/imagens/avatar/LENDA%20SUPREMA%20DO%20ACORDA.png': 'lenda_suprema_acorda',
  '/avatars/LENDA SUPREMA DO ACORDA.png': 'lenda_suprema_acorda',
  '/avatars/LENDA%20SUPREMA%20DO%20ACORDA.png': 'lenda_suprema_acorda',

  // 8. Representante Distrital
  representante_distrital: 'representante_distrital',
  'representante-distrital': 'representante_distrital',
  'exclusivo_distrital': 'representante_distrital',
  'representante distrital': 'representante_distrital',
  'representante distrital.png': 'representante_distrital',
  '/images/avatars/REPRESENTANTE DISTRITAL.png': 'representante_distrital',
  '/images/avatars/REPRESENTANTE%20DISTRITAL.png': 'representante_distrital',
  '/imagens/avatar/REPRESENTANTE DISTRITAL.png': 'representante_distrital',
  '/imagens/avatar/REPRESENTANTE%20DISTRITAL.png': 'representante_distrital',
  '/avatars/REPRESENTANTE DISTRITAL.png': 'representante_distrital',
  '/avatars/REPRESENTANTE%20DISTRITAL.png': 'representante_distrital',

  // 9. Titã do Top 10
  tita_top_10: 'tita_top_10',
  'tita-top-10': 'tita_top_10',
  'exclusivo_top10': 'tita_top_10',
  'titã do top 10': 'tita_top_10',
  'tita do top 10': 'tita_top_10',
  'titã do top 10.png': 'tita_top_10',
  '/images/avatars/TITÃ DO TOP 10.png': 'tita_top_10',
  '/images/avatars/TIT%C3%83%20DO%20TOP%2010.png': 'tita_top_10',
  '/imagens/avatar/TITÃ DO TOP 10.png': 'tita_top_10',
  '/imagens/avatar/TIT%C3%83%20DO%20TOP%2010.png': 'tita_top_10',
  '/avatars/TITÃ DO TOP 10.png': 'tita_top_10',
  '/avatars/TIT%C3%83%20DO%20TOP%2010.png': 'tita_top_10',
};

/**
 * Resolve qualquer ID, alias ou caminho antigo para o AvatarItem oficial correspondente
 */
export function getAvatarById(idOrUrl?: string | null): AvatarItem {
  if (!idOrUrl || typeof idOrUrl !== 'string') {
    return DEFAULT_AVATAR;
  }

  const cleaned = idOrUrl.trim().toLowerCase();

  // 1. Verificação direta no alias map
  const canonicalId = ALIAS_MAP[cleaned] || ALIAS_MAP[idOrUrl.trim()];
  if (canonicalId) {
    const found = REAL_AVATARS.find((a) => a.id === canonicalId);
    if (found) return found;
  }

  // 2. Verificação por substring de ficheiro/nome
  if (cleaned.includes('camoes')) return REAL_AVATARS[0];
  if (cleaned.includes('vulcao') || cleaned.includes('guardiao') || cleaned.includes('acores')) return REAL_AVATARS[1];
  if (cleaned.includes('futebol') || cleaned.includes('quinas')) return REAL_AVATARS[2];
  if (cleaned.includes('alfama') || cleaned.includes('fadista')) return REAL_AVATARS[3];
  if (cleaned.includes('sebastiao')) return REAL_AVATARS[4];
  if (cleaned.includes('campeao') || cleaned.includes('campeão')) return REAL_AVATARS[5];
  if (cleaned.includes('suprema')) return REAL_AVATARS[6];
  if (cleaned.includes('distrital') || cleaned.includes('representante')) return REAL_AVATARS[7];
  if (cleaned.includes('top 10') || cleaned.includes('top10') || cleaned.includes('tita') || cleaned.includes('titã')) return REAL_AVATARS[8];

  // 3. Fallback seguro para o primeiro avatar real
  return DEFAULT_AVATAR;
}

/**
 * Retorna o caminho absoluto público para a imagem do avatar oficial
 */
export function getAvatarImage(idOrUrl?: string | null): string {
  return getAvatarById(idOrUrl).image;
}

/**
 * Normaliza qualquer ID/URL para o ID canónico estável
 */
export function normalizeAvatarId(idOrUrl?: string | null): string {
  return getAvatarById(idOrUrl).id;
}

/**
 * Verifica se um determinado ID é um dos 9 avatares reais
 */
export function isValidAvatarId(id?: string | null): boolean {
  if (!id) return false;
  return REAL_AVATARS.some((a) => a.id === id);
}
