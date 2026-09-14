/**
 * 🇵🇹 ACORDA PORTUGAL — TABELA CENTRAL & FONTE ÚNICA DE VERDADE DA LOJA (SSOT)
 * 
 * Este ficheiro é a autoridade canónica para todos os produtos, cosméticos,
 * consumíveis de gameplay, itens de mérito e exclusivos VIP.
 * 
 * NENHUM preço deve ser hardcoded em componentes React ou rotas do servidor.
 */

import { VIP_CATALOG } from '../src/data/vipCatalog'
import { TITLE_SHOP_CATALOG } from '../src/data/shopTitles'
import { OFFICIAL_EMOTES } from '../src/data/emotes'
import { ANIMATED_FRAMES, type AnimatedFrame, type FrameRarity } from '../src/data/frames'
import { ARENA_SHOP_CATALOG, LEGACY_ARENA_ALIASES } from '../src/data/shopArenas'

export type ShopItemType =
  | 'avatar'
  | 'frame'
  | 'arena'
  | 'title'
  | 'reaction'
  | 'aid'
  | 'utility'
  | 'vip'

export type ShopRarity =
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'exclusive'

export type ShopCurrency =
  | 'coins'
  | 'real_eur'
  | 'merit'
  | 'free'

export type ShopUnlockType =
  | 'purchase'
  | 'free'
  | 'achievement'
  | 'ranking'
  | 'season'
  | 'founder'
  | 'level'
  | 'vip'

export interface ShopCatalogItem {
  id: string
  type: ShopItemType
  name: string
  description: string
  rarity: ShopRarity
  currency: ShopCurrency
  priceCoins?: number
  priceEur?: number
  consumable?: boolean
  quantity?: number
  unlockType: ShopUnlockType
  asset?: string
  image?: string
  active: boolean

  // Metadados complementares para UI e gameplay
  category?: string
  categoryTitle?: string
  badgeText?: string
  badgeColor?: string
  accentColor?: string
  secondaryColor?: string
  previewColor?: string
  cssClass?: string
  effect?: string
  story?: string
  icon?: string
  maxOwned?: number
  purchaseLimit24h?: number
  aliases?: string[]
  unlockCondition?: string
}

export const AID_MAX_OWNED_LIMIT = 50
export const AID_PURCHASE_DAILY_LIMIT = 3

// ============================================================================
// 1. AJUDAS & UTILIDADES (CONSUMÍVEIS DE GAMEPLAY — 3 AJUDAS CANÓNICAS OFICIAIS)
// Regra Absoluta: Máximo 3 compras por 24h móveis. Limite de stock: 50 unidades.
// ============================================================================
export const AID_SHOP_ITEMS: ShopCatalogItem[] = [
  {
    id: 'AID_002',
    type: 'aid',
    name: 'Pack x5 Ajudas 50/50',
    description: 'Elimina exatamente duas alternativas erradas, deixando duas respostas possíveis.',
    rarity: 'rare',
    currency: 'coins',
    priceCoins: 750,
    consumable: true,
    quantity: 5,
    unlockType: 'purchase',
    asset: '/assets/shop/aids/aid-50-50.webp',
    active: true,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: 'Pack x5 · 50/50',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: '🌓',
    maxOwned: AID_MAX_OWNED_LIMIT,
    purchaseLimit24h: AID_PURCHASE_DAILY_LIMIT,
    aliases: ['aid_50_50', 'ajuda_5050', 'consumable_50_50', 'help_5050', 'help5050'],
  },
  {
    id: 'AID_004',
    type: 'aid',
    name: 'Pack x3 Congelar Tempo',
    description: 'Pausa o cronómetro e adiciona +15 segundos para responder com mais calma.',
    rarity: 'epic',
    currency: 'coins',
    priceCoins: 900,
    consumable: true,
    quantity: 3,
    unlockType: 'purchase',
    asset: '/assets/shop/aids/aid-freeze-time.webp',
    active: true,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: 'Pack x3 · +15s',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    icon: '⏱️',
    maxOwned: AID_MAX_OWNED_LIMIT,
    purchaseLimit24h: AID_PURCHASE_DAILY_LIMIT,
    aliases: ['aid_freeze_time', 'ajuda_congelar', 'consumable_congelar_tempo', 'freezeTime'],
  },
  {
    id: 'AID_003',
    type: 'aid',
    name: 'Pack x3 Pergunta ao Público',
    description: 'Simula uma votação do público com percentagens realistas e tendência para a resposta correta.',
    rarity: 'epic',
    currency: 'coins',
    priceCoins: 1500,
    consumable: true,
    quantity: 3,
    unlockType: 'purchase',
    asset: '/assets/shop/aids/aid-publico.webp',
    active: true,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: 'Pack x3 · Premium',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: '🗳️',
    maxOwned: AID_MAX_OWNED_LIMIT,
    purchaseLimit24h: AID_PURCHASE_DAILY_LIMIT,
    aliases: ['aid_public_vote', 'ajuda_publico', 'HELP_005', 'consumable_public_vote', 'publicVote'],
  },
]

// ============================================================================
// ITENS LEGADOS (RETROCOMPATIBILIDADE DE INVENTÁRIO — DESATIVADOS DA LOJA)
// Não aparecem na loja nem no catálogo ativo, mas permanecem no inventário de quem os possui.
// ============================================================================
export const LEGACY_AID_ITEMS: ShopCatalogItem[] = [
  {
    id: 'AID_001',
    type: 'aid',
    name: 'Pista Histórica',
    description: 'Revela uma dica contextual educativa inteligente sem entregar a resposta diretamente.',
    rarity: 'rare',
    currency: 'coins',
    priceCoins: 750,
    consumable: true,
    quantity: 1,
    unlockType: 'purchase',
    asset: '/assets/shop/aids/aid-pista-historica.webp',
    active: false,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: 'Legado',
    badgeColor: 'bg-slate-700 text-slate-400',
    icon: '💡',
    maxOwned: AID_MAX_OWNED_LIMIT,
    purchaseLimit24h: AID_PURCHASE_DAILY_LIMIT,
    aliases: ['aid_hint', 'ajuda_pista', 'consumable_pista', 'pista_historica', 'hint'],
  },
  {
    id: 'AID_005',
    type: 'aid',
    name: 'Segunda Oportunidade',
    description: 'Permite uma segunda tentativa imediata caso seleciones uma alternativa incorreta.',
    rarity: 'epic',
    currency: 'coins',
    priceCoins: 1250,
    consumable: true,
    quantity: 1,
    unlockType: 'purchase',
    asset: '/images/shop/aids/aid-segunda-oportunidade.webp',
    active: false,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: 'Legado',
    badgeColor: 'bg-slate-700 text-slate-400',
    icon: '🔄',
    maxOwned: AID_MAX_OWNED_LIMIT,
    purchaseLimit24h: AID_PURCHASE_DAILY_LIMIT,
    aliases: ['aid_second_chance', 'segunda_chance', 'second_chance', 'consumable_second_chance'],
  },
  {
    id: 'AID_006',
    type: 'aid',
    name: 'Eliminação Tripla',
    description: 'Elimina três opções erradas quando a pergunta possui 4 ou mais alternativas.',
    rarity: 'epic',
    currency: 'coins',
    priceCoins: 1500,
    consumable: true,
    quantity: 1,
    unlockType: 'purchase',
    asset: '/images/shop/aids/aid-eliminacao-tripla.webp',
    active: false,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: 'Legado',
    badgeColor: 'bg-slate-700 text-slate-400',
    icon: '🧠',
    maxOwned: AID_MAX_OWNED_LIMIT,
    purchaseLimit24h: AID_PURCHASE_DAILY_LIMIT,
    aliases: ['aid_triple_elimination', 'eliminacao_tripla', 'triple_elimination', 'consumable_triple_elimination'],
  },
  {
    id: 'AID_007',
    type: 'aid',
    name: 'Resposta Rápida',
    description: 'Concede uma janela assistida de +5 segundos de tempo sem penalizar o streak.',
    rarity: 'rare',
    currency: 'coins',
    priceCoins: 1000,
    consumable: true,
    quantity: 1,
    unlockType: 'purchase',
    asset: '/images/shop/aids/aid-resposta-rapida.webp',
    active: false,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: 'Legado',
    badgeColor: 'bg-slate-700 text-slate-400',
    icon: '⚡',
    maxOwned: AID_MAX_OWNED_LIMIT,
    purchaseLimit24h: AID_PURCHASE_DAILY_LIMIT,
    aliases: ['aid_fast_answer', 'resposta_rapida', 'fast_answer', 'consumable_fast_answer'],
  },
  {
    id: 'AID_008',
    type: 'utility',
    name: 'Proteção de Sequência',
    description: 'Salva a tua sequência de dias seguidos (streak) se te esqueceres de jogar 24 horas.',
    rarity: 'epic',
    currency: 'coins',
    priceCoins: 2500,
    consumable: true,
    quantity: 1,
    unlockType: 'purchase',
    asset: '/images/shop/aids/aid-protecao-sequencia.webp',
    active: false,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: 'Legado',
    badgeColor: 'bg-slate-700 text-slate-400',
    icon: '🛡️',
    maxOwned: 10,
    purchaseLimit24h: AID_PURCHASE_DAILY_LIMIT,
    aliases: ['aid_streak_protection', 'protecao_streak', 'consumable_protecao_streak', 'streak_protection'],
  },
]

// ============================================================================
// 2. AVATARES OFICIAIS (36 ITENS)
// ============================================================================
export const AVATAR_SHOP_ITEMS: ShopCatalogItem[] = [
  // 1-4: Iniciais Gratuitos
  { id: 'avatar_01', type: 'avatar', name: 'O Estratega', description: 'Mente tática, calculista e frio sob pressão.', rarity: 'common', currency: 'free', priceCoins: 0, unlockType: 'free', asset: '/images/avatars/avatar_01.png', active: true, category: 'Cidadania', icon: '🧠' },
  { id: 'avatar_02', type: 'avatar', name: 'A Líder', description: 'Presença imponente, determinação e espírito de liderança.', rarity: 'common', currency: 'free', priceCoins: 0, unlockType: 'free', asset: '/images/avatars/avatar_02.png', active: true, category: 'Cidadania', icon: '👑' },
  { id: 'avatar_03', type: 'avatar', name: 'O Explorador', description: 'Curiosidade insaciável e audácia nas grandes rotas.', rarity: 'common', currency: 'free', priceCoins: 0, unlockType: 'free', asset: '/images/avatars/avatar_03.png', active: true, category: 'Cultura', icon: '🧭' },
  { id: 'avatar_04', type: 'avatar', name: 'A Competidora', description: 'Foco absoluto, garra atlética e sede incansável de vitória.', rarity: 'common', currency: 'free', priceCoins: 0, unlockType: 'free', asset: '/images/avatars/avatar_04.png', active: true, category: 'Desporto', icon: '⚡' },
  // 5-10 & 19: Raros (500–1.000 moedas)
  { id: 'avatar_05', type: 'avatar', name: 'O Mestre', description: 'Sabedoria profunda e serenidade nos momentos decisivos.', rarity: 'rare', currency: 'coins', priceCoins: 500, unlockType: 'purchase', asset: '/images/avatars/avatar_05.png', active: true, category: 'História', icon: '📜' },
  { id: 'avatar_06', type: 'avatar', name: 'A Gamer', description: 'Reflexos ultrarrápidos e mestria no ecossistema digital.', rarity: 'rare', currency: 'coins', priceCoins: 600, unlockType: 'purchase', asset: '/images/avatars/avatar_06.png', active: true, category: 'Cultura', icon: '🎮' },
  { id: 'avatar_07', type: 'avatar', name: 'O Descontraído', description: 'Carisma natural que transforma a pressão do jogo em diversão.', rarity: 'rare', currency: 'coins', priceCoins: 700, unlockType: 'purchase', asset: '/images/avatars/avatar_07.png', active: true, category: 'Cidadania', icon: '😎' },
  { id: 'avatar_08', type: 'avatar', name: 'A Visionária', description: 'Sempre três passos à frente, desenhando o Portugal de amanhã.', rarity: 'rare', currency: 'coins', priceCoins: 800, unlockType: 'purchase', asset: '/images/avatars/avatar_08.png', active: true, category: 'Cultura', icon: '🔮' },
  { id: 'avatar_09', type: 'avatar', name: 'O Rebelde', description: 'Desafia o óbvio e arrisca tudo pela glória no duelo.', rarity: 'rare', currency: 'coins', priceCoins: 900, unlockType: 'purchase', asset: '/images/avatars/avatar_09.png', active: true, category: 'Cidadania', icon: '🔥' },
  { id: 'avatar_10', type: 'avatar', name: 'A Investigadora', description: 'Olhar cirúrgico que desvenda qualquer mistério ou detalhe histórico.', rarity: 'rare', currency: 'coins', priceCoins: 1000, unlockType: 'purchase', asset: '/images/avatars/avatar_10.png', active: true, category: 'História', icon: '🔍' },
  { id: 'avatar_19', type: 'avatar', name: 'O Curioso', description: 'A fome insaciável de descobrir novas curiosidades do país.', rarity: 'rare', currency: 'coins', priceCoins: 850, unlockType: 'purchase', asset: '/images/avatars/avatar_19.png', active: true, category: 'Cultura', icon: '💡' },
  // 11-17, 20, 22-27, 32: Épicos (1.250–2.500 moedas)
  { id: 'avatar_11', type: 'avatar', name: 'O Desportista', description: 'Velocidade, resistência atlética e espírito de superação.', rarity: 'epic', currency: 'coins', priceCoins: 1250, unlockType: 'purchase', asset: '/images/avatars/avatar_11.png', active: true, category: 'Desporto', icon: '⚽' },
  { id: 'avatar_12', type: 'avatar', name: 'A Artista', description: 'A voz profunda, emoção pura e poesia da alma portuguesa.', rarity: 'epic', currency: 'coins', priceCoins: 1400, unlockType: 'purchase', asset: '/images/avatars/avatar_12.png', active: true, category: 'Cultura', icon: '🎨' },
  { id: 'avatar_13', type: 'avatar', name: 'O Professor', description: 'A erudição carismática de quem inspira gerações de mentes brilhantes.', rarity: 'epic', currency: 'coins', priceCoins: 1500, unlockType: 'purchase', asset: '/images/avatars/avatar_13.png', active: true, category: 'História', icon: '📚' },
  { id: 'avatar_14', type: 'avatar', name: 'A Aventureira', description: 'Coragem destemida para conquistar serras, mares e arquipélagos.', rarity: 'epic', currency: 'coins', priceCoins: 1600, unlockType: 'purchase', asset: '/images/avatars/avatar_14.png', active: true, category: 'Cultura', icon: '🏔️' },
  { id: 'avatar_15', type: 'avatar', name: 'O Técnico', description: 'Precisão algorítmica e raciocínio lógico infalível.', rarity: 'epic', currency: 'coins', priceCoins: 1800, unlockType: 'purchase', asset: '/images/avatars/avatar_15.png', active: true, category: 'Cidadania', icon: '💻' },
  { id: 'avatar_16', type: 'avatar', name: 'A Estratega', description: 'Paciência cirúrgica que antecipa o adversário xeque por xeque.', rarity: 'epic', currency: 'coins', priceCoins: 2000, unlockType: 'purchase', asset: '/images/avatars/avatar_16.png', active: true, category: 'Cidadania', icon: '♟️' },
  { id: 'avatar_17', type: 'avatar', name: 'O Visionário', description: 'Audácia e pensamento inovador que quebram velhos paradigmas.', rarity: 'epic', currency: 'coins', priceCoins: 2200, unlockType: 'purchase', asset: '/images/avatars/avatar_17.png', active: true, category: 'Cultura', icon: '✨' },
  { id: 'avatar_20', type: 'avatar', name: 'A Investigadora Urbana', description: 'Conhecedora das cidades, do património e da evolução contemporânea.', rarity: 'epic', currency: 'coins', priceCoins: 1750, unlockType: 'purchase', asset: '/images/avatars/avatar_20.png', active: true, category: 'Cultura', icon: '🏙️' },
  { id: 'avatar_22', type: 'avatar', name: 'A Criativa', description: 'Visual vibrante e capacidade singular de encontrar respostas inovadoras.', rarity: 'epic', currency: 'coins', priceCoins: 1900, unlockType: 'purchase', asset: '/images/avatars/avatar_22.png', active: true, category: 'Cultura', icon: '🎭' },
  { id: 'avatar_23', type: 'avatar', name: 'O Minimalista', description: 'Elegância discreta, sobriedade e eficiência sem distrações.', rarity: 'epic', currency: 'coins', priceCoins: 2100, unlockType: 'purchase', asset: '/images/avatars/avatar_23.png', active: true, category: 'Cidadania', icon: '🎯' },
  { id: 'avatar_24', type: 'avatar', name: 'A Challenger', description: 'Espírito irreverente que não teme nenhum titã das tabelas.', rarity: 'epic', currency: 'coins', priceCoins: 2300, unlockType: 'purchase', asset: '/images/avatars/avatar_24.png', active: true, category: 'Desporto', icon: '💥' },
  { id: 'avatar_25', type: 'avatar', name: 'O Geek', description: 'Enciclopédia viva com um vasto arsenal de cultura lusa e geral.', rarity: 'epic', currency: 'coins', priceCoins: 2400, unlockType: 'purchase', asset: '/images/avatars/avatar_25.png', active: true, category: 'Cultura', icon: '🕹️' },
  { id: 'avatar_26', type: 'avatar', name: 'A Analista', description: 'Raciocínio lógico estruturado e foco absoluto no resultado.', rarity: 'epic', currency: 'coins', priceCoins: 2500, unlockType: 'purchase', asset: '/images/avatars/avatar_26.png', active: true, category: 'Cidadania', icon: '📊' },
  { id: 'avatar_27', type: 'avatar', name: 'O Comunicador', description: 'Carisma eloquente que move multidões e contagia o jogo.', rarity: 'epic', currency: 'coins', priceCoins: 2500, unlockType: 'purchase', asset: '/images/avatars/avatar_27.png', active: true, category: 'Cultura', icon: '🎙️' },
  { id: 'avatar_32', type: 'avatar', name: 'A Nova Geração', description: 'A força jovem e vibrante que está a redefinir o futuro da nação.', rarity: 'epic', currency: 'coins', priceCoins: 2500, unlockType: 'purchase', asset: '/images/avatars/avatar_32.png', active: true, category: 'Cidadania', icon: '🌟' },
  // 18, 21, 28, 29, 31, 33: Lendários (3.000–6.000 moedas)
  { id: 'avatar_18', type: 'avatar', name: 'A Campeã', description: 'A dignidade triunfante de quem ergue a taça nacional.', rarity: 'legendary', currency: 'coins', priceCoins: 3500, unlockType: 'purchase', asset: '/images/avatars/avatar_18.png', active: true, category: 'Desporto', icon: '🥇' },
  { id: 'avatar_21', type: 'avatar', name: 'O Capitão', description: 'O líder firme e respeitado que conduz a tripulação à glória.', rarity: 'legendary', currency: 'coins', priceCoins: 4000, unlockType: 'purchase', asset: '/images/avatars/avatar_21.png', active: true, category: 'Cidadania', icon: '⚓' },
  { id: 'avatar_28', type: 'avatar', name: 'A Exploradora Digital', description: 'Navegadora das novas fronteiras da tecnologia e do saber.', rarity: 'legendary', currency: 'coins', priceCoins: 4500, unlockType: 'purchase', asset: '/images/avatars/avatar_28.png', active: true, category: 'Cultura', icon: '🌐' },
  { id: 'avatar_29', type: 'avatar', name: 'O Mestre do Quiz', description: 'O decifrador supremo de charadas, factos e enigmas da história.', rarity: 'legendary', currency: 'coins', priceCoins: 5000, unlockType: 'purchase', asset: '/images/avatars/avatar_29.png', active: true, category: 'História', icon: '🎩' },
  { id: 'avatar_31', type: 'avatar', name: 'O Veterano', description: 'Anos de sabedoria e prestígio respeitados por toda a comunidade.', rarity: 'legendary', currency: 'coins', priceCoins: 5500, unlockType: 'purchase', asset: '/images/avatars/avatar_31.png', active: true, category: 'História', icon: '🛡️' },
  { id: 'avatar_33', type: 'avatar', name: 'O Campeão', description: 'Consagrado no panteão dos maiores vencedores do Acorda Portugal.', rarity: 'legendary', currency: 'coins', priceCoins: 6000, unlockType: 'purchase', asset: '/images/avatars/avatar_33.png', active: true, category: 'Desporto', icon: '🏆' },
  // 34: Mítico (9.500 moedas)
  { id: 'avatar_34', type: 'avatar', name: 'A Lenda', description: 'Uma presença marcante e memorável que inspira o país inteiro.', rarity: 'mythic', currency: 'coins', priceCoins: 9500, unlockType: 'purchase', asset: '/images/avatars/avatar_34.png', active: true, category: 'História', icon: '🔥' },
  // 30, 35, 36: Exclusivos por Mérito (NÃO Comprar com Moedas)
  { id: 'avatar_30', type: 'avatar', name: 'A Rainha do Ranking', description: 'A soberana indiscutível das pontuações máximas nacionais.', rarity: 'exclusive', currency: 'merit', unlockType: 'ranking', unlockCondition: 'Alcançar o Top 10 no Ranking Nacional', asset: '/images/avatars/avatar_30.png', active: true, category: 'Exclusivos', icon: '👑' },
  { id: 'avatar_35', type: 'avatar', name: 'O Desafiante', description: 'Audácia competitiva inclemente perante qualquer desafio.', rarity: 'exclusive', currency: 'merit', unlockType: 'achievement', unlockCondition: 'Conquista de 100 Vitórias Consecutivas 1v1', asset: '/images/avatars/avatar_35.png', active: true, category: 'Exclusivos', icon: '⚔️' },
  { id: 'avatar_36', type: 'avatar', name: 'A Lenda Portuguesa', description: 'O símbolo supremo das Quinas e da alma imortal de Portugal.', rarity: 'exclusive', currency: 'merit', unlockType: 'achievement', unlockCondition: 'Conquistar o Título Máximo de Lenda de Portugal', asset: '/images/avatars/avatar_36.png', active: true, category: 'Exclusivos', icon: '🇵🇹' },
]

// ============================================================================
// 3. MOLDURAS VIVAS (24 ITENS OFICIAIS CANÓNICOS)
// ============================================================================
const frameRarityMap: Record<FrameRarity, ShopRarity> = {
  'Raro': 'rare',
  'Épico': 'epic',
  'Lendário': 'legendary',
  'Mítico': 'mythic',
}

export const FRAME_SHOP_ITEMS: ShopCatalogItem[] = ANIMATED_FRAMES.map((f): ShopCatalogItem => ({
  id: f.id,
  type: 'frame',
  name: f.name,
  description: f.description,
  rarity: frameRarityMap[f.rarity] || 'rare',
  currency: 'coins',
  priceCoins: f.priceCoins || f.price,
  unlockType: 'purchase',
  active: true,
  category: f.categoryKey,
  categoryTitle: f.categoryTitle,
  accentColor: f.accentColor,
  secondaryColor: f.secondaryColor,
  cssClass: f.cssClass,
  story: f.story,
  badgeText: f.badge || f.rarity,
  badgeColor: f.badgeColor,
}))

// ============================================================================
// 4. ARENAS & CENÁRIOS (50 ARENAS OFICIAIS CANÓNICAS)
// ============================================================================
export const ARENA_SHOP_ITEMS: ShopCatalogItem[] = ARENA_SHOP_CATALOG.map((a) => ({
  id: a.id,
  type: 'arena' as const,
  name: a.name,
  description: a.description,
  rarity: (a.rarity === 'Comum' ? 'common' : a.rarity === 'Rara' ? 'rare' : a.rarity === 'Épica' ? 'epic' : a.rarity === 'Lendária' ? 'legendary' : 'mythic') as ShopRarity,
  currency: (a.price === 0 ? 'free' : 'coins') as ShopCurrency,
  priceCoins: a.price || 0,
  unlockType: (a.price === 0 ? 'free' : 'purchase') as ShopUnlockType,
  asset: a.image || '',
  active: true,
  category: a.category,
  categoryTitle: a.categoryLabel,
  icon: a.icon || '🏟️',
  badgeText: a.rarity,
  badgeColor: a.badgeColor,
}))

// ============================================================================
// 5. TÍTULOS DE PERFIL (STARTER, TEMÁTICOS & MÉRITO)
// ============================================================================
export const STARTER_TITLE_ITEM: ShopCatalogItem = {
  id: 'tit_novico',
  type: 'title',
  name: 'Noviço da Nação',
  description: 'Título inicial oficial de boas-vindas atribuído a todos os cidadãos do jogo.',
  rarity: 'common',
  currency: 'free',
  priceCoins: 0,
  unlockType: 'free',
  active: true,
  category: 'geral',
  icon: '🔰',
}

// Lista de categorias de conhecimento para geração consistente de títulos temáticos
const THEME_CATEGORIES = [
  { key: 'portugal', name: 'Portugal' },
  { key: 'atualidade', name: 'Atualidade' },
  { key: 'politica', name: 'Portugal Político' },
  { key: 'empresas', name: 'Empresas Portuguesas' },
  { key: 'futebol', name: 'Futebol Português' },
  { key: 'historia', name: 'História' },
  { key: 'geografia', name: 'Geografia' },
  { key: 'desporto', name: 'Desporto' },
  { key: 'cultura', name: 'Cultura' },
  { key: 'musica', name: 'Música' },
  { key: 'gastronomia', name: 'Gastronomia' },
  { key: 'cinema-tv', name: 'Cinema e TV' },
  { key: 'ciencia', name: 'Ciência e Tecnologia' },
  { key: 'personalidades', name: 'Grandes Personalidades' },
  { key: 'mundo', name: 'Portugal no Mundo' },
  { key: 'maluco', name: 'Modo Maluco' },
  { key: 'humor', name: 'Humor Português' },
  { key: 'desafio-visual', name: 'Desafio Visual' },
]

// Progressão canónica de títulos temáticos: Comum (150-250), Raro (450-800), Épico (1.200-1.800), Lendário (2.500), Mítico (4.000)
export const THEMATIC_TITLE_ITEMS: ShopCatalogItem[] = THEME_CATEGORIES.flatMap((cat) => [
  { id: `tit_${cat.key}_1`, type: 'title', name: `Aprendiz de ${cat.name}`, description: `Título oficial exibido no perfil e nos rankings (${cat.name}).`, rarity: 'common', currency: 'coins', priceCoins: 150, unlockType: 'purchase', active: true, category: cat.key, icon: '📜' },
  { id: `tit_${cat.key}_2`, type: 'title', name: `Conhecedor de ${cat.name}`, description: `Título oficial exibido no perfil e nos rankings (${cat.name}).`, rarity: 'common', currency: 'coins', priceCoins: 250, unlockType: 'purchase', active: true, category: cat.key, icon: '📜' },
  { id: `tit_${cat.key}_3`, type: 'title', name: `Especialista em ${cat.name}`, description: `Título oficial exibido no perfil e nos rankings (${cat.name}).`, rarity: 'rare', currency: 'coins', priceCoins: 500, unlockType: 'purchase', active: true, category: cat.key, icon: '🔍' },
  { id: `tit_${cat.key}_4`, type: 'title', name: `Mestre em ${cat.name}`, description: `Título oficial exibido no perfil e nos rankings (${cat.name}).`, rarity: 'rare', currency: 'coins', priceCoins: 800, unlockType: 'purchase', active: true, category: cat.key, icon: '⭐' },
  { id: `tit_${cat.key}_5`, type: 'title', name: `Guardião de ${cat.name}`, description: `Título oficial exibido no perfil e nos rankings (${cat.name}).`, rarity: 'epic', currency: 'coins', priceCoins: 1500, unlockType: 'purchase', active: true, category: cat.key, icon: '🛡️' },
  { id: `tit_${cat.key}_6`, type: 'title', name: `Soberano de ${cat.name}`, description: `Título régio de grande prestígio (${cat.name}).`, rarity: 'legendary', currency: 'coins', priceCoins: 2500, unlockType: 'purchase', active: true, category: cat.key, icon: '👑' },
  { id: `tit_${cat.key}_7`, type: 'title', name: `Lenda Imortal de ${cat.name}`, description: `O patamar supremo de maestria em ${cat.name}.`, rarity: 'mythic', currency: 'coins', priceCoins: 4000, unlockType: 'purchase', active: true, category: cat.key, icon: '🔥' },
])

// Títulos de Mérito Estrito (NUNCA Comprar com Moedas)
export const MERIT_TITLE_ITEMS: ShopCatalogItem[] = [
  { id: 'tit_excl_rank1', type: 'title', name: '#1 Nacional', description: 'Consagrado como o número um incontestável de Portugal.', rarity: 'mythic', currency: 'merit', unlockType: 'ranking', unlockCondition: 'Top 1 no Ranking Nacional', active: true, category: 'exclusivo', icon: '🥇' },
  { id: 'tit_excl_top3', type: 'title', name: 'Top 3 Nacional', description: 'Pódio de honra dos maiores mestres de quiz de Portugal.', rarity: 'mythic', currency: 'merit', unlockType: 'ranking', unlockCondition: 'Top 3 no Ranking Nacional', active: true, category: 'exclusivo', icon: '🥈' },
  { id: 'tit_excl_top10', type: 'title', name: 'Top 10 Nacional', description: 'Membro da elite dos dez melhores jogadores do país.', rarity: 'legendary', currency: 'merit', unlockType: 'ranking', unlockCondition: 'Top 10 no Ranking Nacional', active: true, category: 'exclusivo', icon: '🥉' },
  { id: 'tit_excl_top100', type: 'title', name: 'Top 100 Nacional', description: 'Presença no prestigiado Top 100 de Portugal.', rarity: 'epic', currency: 'merit', unlockType: 'ranking', unlockCondition: 'Top 100 no Ranking Nacional', active: true, category: 'exclusivo', icon: '⭐' },
  { id: 'tit_excl_campeao_nac', type: 'title', name: 'Campeão Nacional', description: 'Vencedor absoluto da Temporada de Competição.', rarity: 'mythic', currency: 'merit', unlockType: 'season', unlockCondition: 'Vencedor do Ranking da Temporada', active: true, category: 'exclusivo', icon: '🏆' },
  { id: 'tit_excl_fundador', type: 'title', name: 'Fundador da Nação', description: 'Título perpétuo de homenagem aos fundadores do projeto.', rarity: 'mythic', currency: 'merit', unlockType: 'founder', unlockCondition: 'Passe Fundador / Pioneiro Oficial', active: true, category: 'exclusivo', icon: '🏛️' },
  { id: 'tit_excl_pioneiro', type: 'title', name: 'Pioneiro', description: 'Um dos primeiros 1.000 jogadores a registar conta.', rarity: 'legendary', currency: 'merit', unlockType: 'achievement', unlockCondition: 'Primeiros 1.000 Jogadores Registados', active: true, category: 'exclusivo', icon: '⛵' },
  { id: 'tit_excl_100v', type: 'title', name: '100 Vitórias', description: 'Veterano invicto de cem duelos 1v1 vencidos.', rarity: 'rare', currency: 'merit', unlockType: 'achievement', unlockCondition: 'Alcançar 100 vitórias em Duelos 1v1', active: true, category: 'exclusivo', icon: '⚔️' },
  { id: 'tit_excl_500v', type: 'title', name: '500 Vitórias', description: 'Mestre consagrado com quinhentos duelos conquistados.', rarity: 'epic', currency: 'merit', unlockType: 'achievement', unlockCondition: 'Alcançar 500 vitórias em Duelos 1v1', active: true, category: 'exclusivo', icon: '⚔️' },
  { id: 'tit_excl_1000v', type: 'title', name: '1.000 Vitórias', description: 'Titã lendário com mil vitórias em duelos no histórico.', rarity: 'mythic', currency: 'merit', unlockType: 'achievement', unlockCondition: 'Alcançar 1.000 vitórias em Duelos 1v1', active: true, category: 'exclusivo', icon: '👑' },
  { id: 'tit_excl_10streak', type: 'title', name: '10 Vitórias Consecutivas', description: 'Sequência invicta de dez vitórias em duelos 1v1.', rarity: 'epic', currency: 'merit', unlockType: 'achievement', unlockCondition: 'Sequência invicta de 10 vitórias 1v1', active: true, category: 'exclusivo', icon: '🔥' },
  { id: 'tit_excl_50streak', type: 'title', name: '50 Vitórias Consecutivas', description: 'Série lendária de cinquenta duelos consecutivos sem perder.', rarity: 'mythic', currency: 'merit', unlockType: 'achievement', unlockCondition: 'Sequência invicta de 50 vitórias 1v1', active: true, category: 'exclusivo', icon: '⚡' },
  { id: 'tit_excl_mestre_todas', type: 'title', name: 'Mestre de Todas as Categorias', description: 'Alcançou o nível máximo em todas as 18 categorias de saber.', rarity: 'mythic', currency: 'merit', unlockType: 'achievement', unlockCondition: 'Nível máximo nas 18 categorias', active: true, category: 'exclusivo', icon: '🧠' },
]

// ============================================================================
// 6. PROVOCAÇÕES & REAÇÕES 1v1 (EMOTES & TAUNT PACKS)
// ============================================================================
export const REACTION_SHOP_ITEMS: ShopCatalogItem[] = [
  // Gratuitas (6)
  { id: 'emote_ola', type: 'reaction', name: '👋 Olá!', description: 'Saudação cordial para o início da partida.', rarity: 'common', currency: 'free', priceCoins: 0, unlockType: 'free', active: true, icon: '👋' },
  { id: 'emote_boa_sorte', type: 'reaction', name: '🍀 Boa sorte!', description: 'Desejo desportivo de boa sorte para o adversário.', rarity: 'common', currency: 'free', priceCoins: 0, unlockType: 'free', active: true, icon: '🍀' },
  { id: 'emote_vamos', type: 'reaction', name: '🔥 Vamos!', description: 'Grito de determinação e garra competitiva.', rarity: 'common', currency: 'free', priceCoins: 0, unlockType: 'free', active: true, icon: '🔥' },
  { id: 'emote_boa', type: 'reaction', name: '👏 Boa!', description: 'Reconhecimento de uma boa jogada do adversário.', rarity: 'common', currency: 'free', priceCoins: 0, unlockType: 'free', active: true, icon: '👏' },
  { id: 'emote_quase', type: 'reaction', name: '😅 Quase!', description: 'Reação de alívio ou surpresa por um acerto à justa.', rarity: 'common', currency: 'free', priceCoins: 0, unlockType: 'free', active: true, icon: '😅' },
  { id: 'emote_gg', type: 'reaction', name: '🏆 GG!', description: 'Bom jogo! Saudação de respeito no final do duelo.', rarity: 'common', currency: 'free', priceCoins: 0, unlockType: 'free', active: true, icon: '🏆' },
  // Comuns & Raras (350–1.200 moedas)
  { id: 'emote_ahahah', type: 'reaction', name: '😂 Ahahah!', description: 'Gargalhada espontânea nos momentos cómicos do quiz.', rarity: 'common', currency: 'coins', priceCoins: 350, unlockType: 'purchase', active: true, icon: '😂' },
  { id: 'emote_uau', type: 'reaction', name: '😱 Uau!', description: 'Expressão de espanto perante uma jogada surpreendente.', rarity: 'common', currency: 'coins', priceCoins: 350, unlockType: 'purchase', active: true, icon: '😱' },
  { id: 'emote_hmm', type: 'reaction', name: '🤔 Hmm...', description: 'Sinal de ponderação perante uma pergunta ardilosa.', rarity: 'rare', currency: 'coins', priceCoins: 750, unlockType: 'purchase', active: true, icon: '🤔' },
  { id: 'emote_forca', type: 'reaction', name: '💪 Força!', description: 'Demonstração de vigor e resistência atlética.', rarity: 'rare', currency: 'coins', priceCoins: 750, unlockType: 'purchase', active: true, icon: '💪' },
  { id: 'emote_acertei', type: 'reaction', name: '🎯 Acertei!', description: 'Comemoração de um tiro certeiro no alvo.', rarity: 'rare', currency: 'coins', priceCoins: 850, unlockType: 'purchase', active: true, icon: '🎯' },
  { id: 'emote_calma', type: 'reaction', name: '🧘 Calma...', description: 'Apelo à serenidade nos momentos de maior tensão.', rarity: 'rare', currency: 'coins', priceCoins: 900, unlockType: 'purchase', active: true, icon: '🧘' },
  { id: 'emote_duvido', type: 'reaction', name: '🤨 Duvido...', description: 'Olhar de ceticismo e desafio ao oponente.', rarity: 'rare', currency: 'coins', priceCoins: 950, unlockType: 'purchase', active: true, icon: '🤨' },
  { id: 'emote_perdi', type: 'reaction', name: '🤦 Ai que perdi...', description: 'Gesto de autocrítica após uma distração infantil.', rarity: 'rare', currency: 'coins', priceCoins: 1000, unlockType: 'purchase', active: true, icon: '🤦' },
  { id: 'emote_chora', type: 'reaction', name: '😭 Chora agora!', description: 'Provocação desportiva após um grande golpe de mestre.', rarity: 'rare', currency: 'coins', priceCoins: 1100, unlockType: 'purchase', active: true, icon: '😭' },
  { id: 'emote_genio', type: 'reaction', name: '🧠 Génio!', description: 'Reconhecimento de raciocínio de calibre superior.', rarity: 'rare', currency: 'coins', priceCoins: 1200, unlockType: 'purchase', active: true, icon: '🧠' },
  // Épicas (2.000–3.500 moedas)
  { id: 'PROV_010', type: 'reaction', name: '👑 Quem manda aqui soy yoo', description: 'Provocação lendária assertiva com balão de fala dinâmico.', rarity: 'epic', currency: 'coins', priceCoins: 2500, unlockType: 'purchase', active: true, icon: '👑' },
  // Taunt Packs
  { id: 'pack_basico', type: 'reaction', name: 'Pack Básico (6 Reações)', description: 'Conjunto completo das saudações fundamentais de jogo.', rarity: 'common', currency: 'free', priceCoins: 0, unlockType: 'free', active: true, icon: '💬' },
  { id: 'pack_pressao', type: 'reaction', name: 'Guerra Psicológica & Pressão', description: 'Aumenta a tensão na contagem decrescente com provocações afiadas.', rarity: 'epic', currency: 'coins', priceCoins: 3500, unlockType: 'purchase', active: true, icon: '⏳' },
  { id: 'pack_bairrismo', type: 'reaction', name: 'Bairrismo & Orgulho Distrital', description: 'Leva as rivalidades regionais e os costumes locais para o duelo.', rarity: 'epic', currency: 'coins', priceCoins: 3500, unlockType: 'purchase', active: true, icon: '🏰' },
  { id: 'pack_nostalgia', type: 'reaction', name: 'Saudades & Nostalgia Lusitana', description: 'Expressões clássicas e tradições da alma portuguesa.', rarity: 'legendary', currency: 'coins', priceCoins: 4500, unlockType: 'purchase', active: true, icon: '🍷' },
  { id: 'pack_futebol', type: 'reaction', name: 'Bancada do Dérbi & Futebol', description: 'Provocações dignas das grandes tardes de clássico desportivo.', rarity: 'legendary', currency: 'coins', priceCoins: 5000, unlockType: 'purchase', active: true, icon: '⚽' },
  { id: 'pack_glitch', type: 'reaction', name: 'Glitch Cyberpunk & Provocações', description: 'Efeitos sonoros e visuais futuristas de sobrecarga neural.', rarity: 'legendary', currency: 'coins', priceCoins: 5500, unlockType: 'purchase', active: true, icon: '👾' },
  { id: 'pack_descobrimentos', type: 'reaction', name: 'Caravelas & Conquistas', description: 'Frases imponentes da era dourada dos navegadores.', rarity: 'legendary', currency: 'coins', priceCoins: 6000, unlockType: 'purchase', active: true, icon: '⛵' },
]

// ============================================================================
// 7. EXCLUSIVOS VIP (€ REAL — 38 ITENS DO VIP_CATALOG)
// ============================================================================
export const VIP_SHOP_ITEMS: ShopCatalogItem[] = VIP_CATALOG.map((vip): ShopCatalogItem => {
  const normalizedRarity = String(vip.rarity).toLowerCase()
  const shopRarity =
    normalizedRarity === 'legendary'
      ? 'legendary'
      : normalizedRarity === 'epic'
      ? 'epic'
      : normalizedRarity === 'rare'
      ? 'rare'
      : 'mythic'

  return {
    id: vip.id,
    type: 'vip',
    name: vip.name,
    description: vip.description || vip.visualConcept,
    rarity: shopRarity,
    currency: 'real_eur',
    priceEur: vip.priceCents / 100,
    priceCoins: undefined,
    consumable: false,
    quantity: undefined,
    unlockType: 'vip',
    asset: vip.assetPath,
    image: vip.image || `/store/vip/${vip.id}.webp`,
    active: true,
    category: 'vip',
    categoryTitle: 'Exclusivos VIP (€ Real)',
    badgeText: `VIP (€${(vip.priceCents / 100).toFixed(2).replace('.', ',')})`,
    badgeColor: vip.badgeColor,
    accentColor: vip.accentColor || '#f59e0b',
    secondaryColor: vip.secondaryColor || '#eab308',
    icon:
      vip.category === 'avatar'
        ? '👤'
        : vip.category === 'frame'
        ? '✨'
        : vip.category === 'title'
        ? '👑'
        : vip.category === 'arena'
        ? '🏟️'
        : '💬',
  }
})

export const TITLE_CATALOG_ITEMS: ShopCatalogItem[] = TITLE_SHOP_CATALOG.map((t): ShopCatalogItem => {
  const isFree = t.price === 0
  const isMerit = t.price === null
  const rMap: Record<string, ShopRarity> = {
    comum: 'common',
    raro: 'rare',
    épico: 'epic',
    lendário: 'legendary',
    mítico: 'mythic',
  }
  const rarity = rMap[t.rarity.toLowerCase()] || 'common'
  return {
    id: t.id,
    type: 'title',
    name: t.name,
    description: t.requirement ? `Desbloqueio: ${t.requirement}` : `Título oficial exibido no teu perfil, duelos e rankings.`,
    rarity,
    currency: isFree ? 'free' : isMerit ? 'merit' : 'coins',
    priceCoins: isMerit ? undefined : (t.price ?? 0),
    unlockType: isFree ? 'free' : isMerit ? 'achievement' : 'purchase',
    unlockCondition: t.requirement,
    active: true,
    category: t.categoryKey,
    categoryTitle: t.categoryTitle,
    badgeText: t.rarity,
    badgeColor: t.badgeColor,
    icon: '📜',
  }
})

export const EMOTE_CATALOG_ITEMS: ShopCatalogItem[] = OFFICIAL_EMOTES.map((e): ShopCatalogItem => {
  const isFree = e.price === 0
  const rMap: Record<string, ShopRarity> = {
    comum: 'common',
    raro: 'rare',
    épico: 'epic',
    lendário: 'legendary',
    mítico: 'mythic',
  }
  const rarity = rMap[e.rarity.toLowerCase()] || 'common'
  return {
    id: e.id,
    type: 'reaction',
    name: e.text,
    description: `Reação oficial para duelos multiplayer 1v1 (${e.category}).`,
    rarity,
    currency: isFree ? 'free' : 'coins',
    priceCoins: e.price,
    unlockType: isFree ? 'free' : 'purchase',
    active: true,
    category: e.category,
    icon: e.emoji,
  }
})

// ============================================================================
// CATÁLOGO UNIFICADO DEFINITIVO (SSOT)
// ============================================================================
export const SHOP_CATALOG: ShopCatalogItem[] = [
  ...AID_SHOP_ITEMS,
  ...LEGACY_AID_ITEMS,
  ...AVATAR_SHOP_ITEMS,
  ...FRAME_SHOP_ITEMS,
  ...ARENA_SHOP_ITEMS,
  ...TITLE_CATALOG_ITEMS,
  ...[STARTER_TITLE_ITEM],
  ...THEMATIC_TITLE_ITEMS,
  ...MERIT_TITLE_ITEMS,
  ...EMOTE_CATALOG_ITEMS,
  ...REACTION_SHOP_ITEMS,
  ...VIP_SHOP_ITEMS,
]

// ============================================================================
// FUNÇÕES UTILITÁRIAS DE ACESSO E VALIDAÇÃO (SERVER & CLIENT)
// ============================================================================

/**
 * Procura um produto no catálogo por ID canónico ou alias
 */
export function getShopCatalogItem(itemId: string): ShopCatalogItem | undefined {
  if (!itemId) return undefined
  const normalized = itemId.trim()

  const vipAliases: Record<string, string> = {
    vip_avatar_001: 'AP-VIP-SIGNATURE-001',
    vip_arena_001: 'AP-VIP-ARENA-ULTIMATE-004',
    vip_arena_002: 'AP-VIP-ARENA-ULTIMATE-003',
    vip_arena_003: 'AP-VIP-ARENA-ULTIMATE-002',
    vip_arena_004: 'AP-VIP-ARENA-ULTIMATE-001',
    vip_arena_005: 'AP-VIP-ARENA-ULTIMATE-005',
    vip_arena_006: 'AP-VIP-ARENA-ULTIMATE-002',
  }

  const arenaAlias = LEGACY_ARENA_ALIASES[normalized] || LEGACY_ARENA_ALIASES[itemId.trim()]
  const resolvedId = vipAliases[normalized] || arenaAlias || normalized

  const direct = SHOP_CATALOG.find((item) => item.id === resolvedId)
  if (direct) return direct

  return SHOP_CATALOG.find((item) => item.aliases?.includes(resolvedId) || item.aliases?.includes(normalized))
}

/**
 * Retorna todos os produtos de um determinado tipo
 */
export function getShopItemsByType(type: ShopItemType): ShopCatalogItem[] {
  return SHOP_CATALOG.filter((item) => item.type === type && item.active)
}

/**
 * Retorna todos os produtos de uma determinada moeda
 */
export function getShopItemsByCurrency(currency: ShopCurrency): ShopCatalogItem[] {
  return SHOP_CATALOG.filter((item) => item.currency === currency && item.active)
}

/**
 * Retorna a regra canónica para uma ajuda ou consumível
 */
export function getConsumableAidRule(itemId: string): ShopCatalogItem | undefined {
  const item = getShopCatalogItem(itemId)
  if (item && (item.type === 'aid' || item.type === 'utility' || item.consumable)) {
    return item
  }
  return undefined
}

/**
 * Valida se um item é legalmente elegível para compra com moedas virtuais
 */
export function isItemPurchasableWithCoins(itemOrId: ShopCatalogItem | string): { allowed: boolean; reason?: string } {
  const item = typeof itemOrId === 'string' ? getShopCatalogItem(itemOrId) : itemOrId
  if (!item) {
    return { allowed: false, reason: 'Item não encontrado no catálogo.' }
  }
  if (item.currency === 'real_eur' || item.unlockType === 'vip') {
    return { allowed: false, reason: 'Este produto é um Exclusivo VIP em € Real e não pode ser comprado com moedas.' }
  }
  if (item.currency === 'merit' || item.unlockType === 'achievement' || item.unlockType === 'ranking' || item.unlockType === 'season' || item.unlockType === 'founder') {
    return { allowed: false, reason: `O item «${item.name}» é conquistado exclusivamente por mérito (${item.unlockCondition || 'Conquista'}). Não pode ser comprado.` }
  }
  if (item.priceCoins === undefined || item.priceCoins === null) {
    return { allowed: false, reason: 'Item sem preço monetário associado.' }
  }
  return { allowed: true }
}
