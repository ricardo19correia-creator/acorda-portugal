/**
 * 🇵🇹 ACORDA PORTUGAL — TABELA CENTRAL & FONTE ÚNICA DE VERDADE DA LOJA (SSOT)
 * 
 * Este ficheiro é a autoridade canónica para todos os produtos, cosméticos,
 * consumíveis de gameplay, itens de mérito e exclusivos VIP.
 * 
 * NENHUM preço deve ser hardcoded em componentes React ou rotas do servidor.
 */

import { VIP_CATALOG } from '../src/data/vipCatalog'

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
  icon?: string
  maxOwned?: number
  aliases?: string[]
  unlockCondition?: string
}

export const AID_MAX_OWNED_LIMIT = 50

// ============================================================================
// 1. AJUDAS & UTILIDADES (CONSUMÍVEIS DE GAMEPLAY — 8 PACKS)
// ============================================================================
export const AID_SHOP_ITEMS: ShopCatalogItem[] = [
  {
    id: 'aid_50_50',
    type: 'aid',
    name: 'Pack x5 Ajudas 50/50',
    description: 'Elimina exatamente duas alternativas erradas em perguntas difíceis do quiz.',
    rarity: 'rare',
    currency: 'coins',
    priceCoins: 750,
    consumable: true,
    quantity: 5,
    unlockType: 'purchase',
    asset: '/images/shop/ajuda-5050.jpg',
    active: true,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: 'Pack x5 (150/un.)',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: '✨',
    maxOwned: AID_MAX_OWNED_LIMIT,
    aliases: ['ajuda_5050', 'consumable_50_50', 'help_5050', 'help5050'],
  },
  {
    id: 'aid_public_vote',
    type: 'aid',
    name: 'Pack x3 Pergunta ao Público',
    description: 'Simula a votação do público com percentagens realistas e tendência para a resposta correta.',
    rarity: 'rare',
    currency: 'coins',
    priceCoins: 600,
    consumable: true,
    quantity: 3,
    unlockType: 'purchase',
    asset: '/images/shop/ajuda-publico.jpg',
    active: true,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: 'Pack x3 (200/un.)',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: '👥',
    maxOwned: AID_MAX_OWNED_LIMIT,
    aliases: ['ajuda_publico', 'HELP_005', 'consumable_public_vote', 'publicVote'],
  },
  {
    id: 'aid_freeze_time',
    type: 'aid',
    name: 'Pack x3 Congelar Tempo',
    description: 'Pausa o cronómetro e adiciona +15 segundos ao tempo de resposta.',
    rarity: 'epic',
    currency: 'coins',
    priceCoins: 900,
    consumable: true,
    quantity: 3,
    unlockType: 'purchase',
    asset: '/images/shop/ajuda-congelar.jpg',
    active: true,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: 'Pack x3 (+15s)',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: '⏳',
    maxOwned: AID_MAX_OWNED_LIMIT,
    aliases: ['ajuda_congelar', 'consumable_congelar_tempo', 'freezeTime'],
  },
  {
    id: 'aid_hint',
    type: 'aid',
    name: 'Pack x3 Pista Inteligente',
    description: 'Revela uma dica contextual educativa sem entregar a resposta diretamente.',
    rarity: 'rare',
    currency: 'coins',
    priceCoins: 750,
    consumable: true,
    quantity: 3,
    unlockType: 'purchase',
    asset: '/images/shop/ajuda-pista.jpg',
    active: true,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: 'Pack x3 (Dica)',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: '💡',
    maxOwned: AID_MAX_OWNED_LIMIT,
    aliases: ['ajuda_pista', 'consumable_pista', 'pista_historica', 'hint'],
  },
  {
    id: 'aid_second_chance',
    type: 'aid',
    name: 'Pack x3 Segunda Oportunidade',
    description: 'Permite uma segunda tentativa imediata caso seleciones uma alternativa incorreta.',
    rarity: 'epic',
    currency: 'coins',
    priceCoins: 1250,
    consumable: true,
    quantity: 3,
    unlockType: 'purchase',
    asset: '/images/shop/ajuda-streak.jpg',
    active: true,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: 'Pack x3 (2ª Chance)',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: '🔄',
    maxOwned: AID_MAX_OWNED_LIMIT,
    aliases: ['segunda_chance', 'second_chance', 'consumable_second_chance'],
  },
  {
    id: 'aid_triple_elimination',
    type: 'aid',
    name: 'Pack x3 Eliminação Tripla',
    description: 'Elimina três opções erradas quando a pergunta possui 4 ou mais alternativas.',
    rarity: 'epic',
    currency: 'coins',
    priceCoins: 1500,
    consumable: true,
    quantity: 3,
    unlockType: 'purchase',
    asset: '/images/shop/ajuda-5050.jpg',
    active: true,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: 'Pack x3 (Tripla)',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: '🧠',
    maxOwned: AID_MAX_OWNED_LIMIT,
    aliases: ['eliminacao_tripla', 'triple_elimination', 'consumable_triple_elimination'],
  },
  {
    id: 'aid_fast_answer',
    type: 'aid',
    name: 'Pack x3 Resposta Rápida',
    description: 'Concede uma janela assistida de +5 segundos de tempo sem penalizar o streak.',
    rarity: 'rare',
    currency: 'coins',
    priceCoins: 1000,
    consumable: true,
    quantity: 3,
    unlockType: 'purchase',
    asset: '/images/shop/ajuda-congelar.jpg',
    active: true,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: 'Pack x3 (Velocidade)',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: '⚡',
    maxOwned: AID_MAX_OWNED_LIMIT,
    aliases: ['resposta_rapida', 'fast_answer', 'consumable_fast_answer'],
  },
  {
    id: 'aid_streak_protection',
    type: 'utility',
    name: 'Proteção de Sequência',
    description: 'Salva a tua sequência de dias seguidos (streak) se te esqueceres de jogar 24 horas.',
    rarity: 'epic',
    currency: 'coins',
    priceCoins: 2500,
    consumable: true,
    quantity: 1,
    unlockType: 'purchase',
    asset: '/images/shop/ajuda-streak.jpg',
    active: true,
    category: 'ajudas',
    categoryTitle: 'Ajudas & Utilidades',
    badgeText: '1 Proteção',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: '🛡️',
    maxOwned: 10,
    aliases: ['protecao_streak', 'consumable_protecao_streak', 'streak_protection'],
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
// 3. MOLDURAS VIVAS (24 ITENS)
// ============================================================================
export const FRAME_SHOP_ITEMS: ShopCatalogItem[] = [
  // Raras (1.500–3.000 moedas)
  { id: 'frame_ondas_atlantico', type: 'frame', name: 'Ondas do Atlântico', description: 'Cristas oceânicas bioluminescentes, marés vivas em movimento e partículas de água.', rarity: 'rare', currency: 'coins', priceCoins: 2000, unlockType: 'purchase', active: true, accentColor: '#0ea5e9', secondaryColor: '#06b6d4', cssClass: 'frame-effect-ocean', category: 'elemental' },
  { id: 'frame_gelo_ancestral', type: 'frame', name: 'Zero Absoluto & Gelo Ancestral', description: 'Estalagmites de gelo eterno, geada prismática e névoa ártica congelante.', rarity: 'rare', currency: 'coins', priceCoins: 2200, unlockType: 'purchase', active: true, accentColor: '#a5f3fc', secondaryColor: '#0284c7', cssClass: 'frame-effect-glacial', category: 'elemental' },
  { id: 'frame_terra_viva', type: 'frame', name: 'Raízes Antigas & Terra Viva', description: 'Raízes vivas que respiram em torno do avatar, com botões florais a desabrochar.', rarity: 'rare', currency: 'coins', priceCoins: 2400, unlockType: 'purchase', active: true, accentColor: '#84cc16', secondaryColor: '#15803d', cssClass: 'frame-effect-roots', category: 'elemental' },
  { id: 'frame_orvalho_floresta', type: 'frame', name: 'Esmeralda dos Bosques Sagrados', description: 'Luzes de pirilampos pulsantes, gotas de orvalho reluzente e cipós ancestrais.', rarity: 'rare', currency: 'coins', priceCoins: 2500, unlockType: 'purchase', active: true, accentColor: '#10b981', secondaryColor: '#059669', cssClass: 'frame-effect-forest', category: 'elemental' },
  { id: 'frame_calcada_portuguesa', type: 'frame', name: 'Alma da Calçada & Estilo Urbano', description: 'Padrões geométricos em pedra preta e branca de calcário com reflexos dourados.', rarity: 'rare', currency: 'coins', priceCoins: 2600, unlockType: 'purchase', active: true, accentColor: '#f1f5f9', secondaryColor: '#334155', cssClass: 'frame-effect-pavement', category: 'lusitano' },
  { id: 'frame_azulejo_seculoxvii', type: 'frame', name: 'Mestre dos Azulejos Históricos', description: 'Moldura barroca de cerâmica azul-cobalto e branco com brilho vítreo artesanal.', rarity: 'rare', currency: 'coins', priceCoins: 2700, unlockType: 'purchase', active: true, accentColor: '#1d4ed8', secondaryColor: '#ffffff', cssClass: 'frame-effect-tile', category: 'lusitano' },
  { id: 'frame_caravela_dourada', type: 'frame', name: 'Vento nas Velas & Cruz de Cristo', description: 'Bandeiras das Quinas enfunadas pelo vento atlântico e bússolas de latão animadas.', rarity: 'rare', currency: 'coins', priceCoins: 3000, unlockType: 'purchase', active: true, accentColor: '#dc2626', secondaryColor: '#eab308', cssClass: 'frame-effect-caravel', category: 'lusitano' },
  { id: 'frame_neon_arcade_80s', type: 'frame', name: 'Retro Laser Synthwave 80s', description: 'Tubo de néon rosa-choque e azul-elétrico com pulsação estroboscópica e grelha laser.', rarity: 'rare', currency: 'coins', priceCoins: 2200, unlockType: 'purchase', active: true, accentColor: '#ec4899', secondaryColor: '#06b6d4', cssClass: 'frame-effect-synthwave', category: 'especial' },
  { id: 'frame_matrix_digital', type: 'frame', name: 'Ciber-Rede Nacional & Código Verde', description: 'Chuva de glifos hexadecimais verde-esmeralda e nós de rede neural em fluxo.', rarity: 'rare', currency: 'coins', priceCoins: 2500, unlockType: 'purchase', active: true, accentColor: '#22c55e', secondaryColor: '#15803d', cssClass: 'frame-effect-matrix', category: 'especial' },
  { id: 'frame_prisma_holografico', type: 'frame', name: 'Prisma Holográfico Hexagonal', description: 'Revestimento iridescente prismático que decompõe a luz branca em arco-íris dinâmico.', rarity: 'rare', currency: 'coins', priceCoins: 2800, unlockType: 'purchase', active: true, accentColor: '#f43f5e', secondaryColor: '#8b5cf6', cssClass: 'frame-effect-prism', category: 'especial' },
  { id: 'frame_cyber_glitch_2077', type: 'frame', name: 'Glitch Holográfico Cyber-Luso 2077', description: 'Interferências eletromagnéticas estocásticas, aberração cromática RGB e ruído analógico.', rarity: 'rare', currency: 'coins', priceCoins: 3000, unlockType: 'purchase', active: true, accentColor: '#f43f5e', secondaryColor: '#06b6d4', cssClass: 'frame-effect-glitch', category: 'especial' },
  // Épicas (3.500–6.000 moedas)
  { id: 'frame_fogo_eterno', type: 'frame', name: 'Inferno Solar & Fogo Eterno', description: 'Dentes de magma em combustão ascendente, brasas incandescentes e calor ardente.', rarity: 'epic', currency: 'coins', priceCoins: 4500, unlockType: 'purchase', active: true, accentColor: '#f59e0b', secondaryColor: '#ef4444', cssClass: 'frame-effect-flame', category: 'elemental' },
  { id: 'frame_tempestade_eletrica', type: 'frame', name: 'Fúria do Trovão & Raios', description: 'Arcos elétricos de plasma, relâmpagos estocásticos e nós de alta voltagem.', rarity: 'epic', currency: 'coins', priceCoins: 5000, unlockType: 'purchase', active: true, accentColor: '#38bdf8', secondaryColor: '#818cf8', cssClass: 'frame-effect-lightning', category: 'elemental' },
  { id: 'frame_nevoa_sintrense', type: 'frame', name: 'Névoa Mística de Sintra', description: 'Névoa espessa em tons de ametista e prata, com runas célticas reluzentes.', rarity: 'epic', currency: 'coins', priceCoins: 5500, unlockType: 'purchase', active: true, accentColor: '#c084fc', secondaryColor: '#e879f9', cssClass: 'frame-effect-mist', category: 'elemental' },
  { id: 'frame_ouro_afonso', type: 'frame', name: 'Aço de Guimarães & Ouro Lusitano', description: 'Gume de espada lendária em aço forjado a frio, com rebordo banhado a ouro 24k.', rarity: 'epic', currency: 'coins', priceCoins: 5800, unlockType: 'purchase', active: true, accentColor: '#eab308', secondaryColor: '#94a3b8', cssClass: 'frame-effect-sword', category: 'real' },
  { id: 'frame_galo_barcelos', type: 'frame', name: 'Lenda Viva do Galo de Barcelos', description: 'Crista flamejante em carmesim com ornamentos populares e motivos florais vivos.', rarity: 'epic', currency: 'coins', priceCoins: 6000, unlockType: 'purchase', active: true, accentColor: '#ef4444', secondaryColor: '#eab308', cssClass: 'frame-effect-rooster', category: 'lusitano' },
  // Lendárias (7.500–12.500 moedas)
  { id: 'frame_aurora_boreal', type: 'frame', name: 'Aurora Boreal Atlântica', description: 'Cortinas ondulantes de luz turquesa, esmeralda e violeta.', rarity: 'legendary', currency: 'coins', priceCoins: 10000, unlockType: 'purchase', active: true, accentColor: '#2dd4bf', secondaryColor: '#a855f7', cssClass: 'frame-effect-aurora', category: 'cosmico' },
  { id: 'frame_vortex_cosmico', type: 'frame', name: 'Vórtice Dimensional Infinito', description: 'Espiral gravitacional de buraco negro estelar que curva o espaço-tempo.', rarity: 'legendary', currency: 'coins', priceCoins: 11500, unlockType: 'purchase', active: true, accentColor: '#a855f7', secondaryColor: '#3b82f6', cssClass: 'frame-effect-vortex', category: 'cosmico' },
  { id: 'frame_realeza_lusitana', type: 'frame', name: 'Brasão Real & Ouro Nobre', description: 'Filigrana dourada com relevos da realeza, incrustações de rubis e coroa imperial.', rarity: 'legendary', currency: 'coins', priceCoins: 12000, unlockType: 'purchase', active: true, accentColor: '#eab308', secondaryColor: '#ef4444', cssClass: 'frame-effect-royalty', category: 'real' },
  { id: 'frame_coroa_louros', type: 'frame', name: 'Coroa Imperial dos Vencedores', description: 'Folhas de louro em ouro maciço com chuva perpétua de partículas douradas triunfais.', rarity: 'legendary', currency: 'coins', priceCoins: 12500, unlockType: 'purchase', active: true, accentColor: '#eab308', secondaryColor: '#ca8a04', cssClass: 'frame-effect-laurel', category: 'real' },
  { id: 'frame_cristal_diamante', type: 'frame', name: 'Prisma Imperial de Diamante Puro', description: 'Facetas lapidadas de diamante brilhante com dispersão de luz volumétrica.', rarity: 'legendary', currency: 'coins', priceCoins: 11000, unlockType: 'purchase', active: true, accentColor: '#e2e8f0', secondaryColor: '#60a5fa', cssClass: 'frame-effect-diamond', category: 'real' },
  // Míticas (15.000–28.000 moedas)
  { id: 'frame_sol_dourado', type: 'frame', name: 'Fénix Solar & Labaredas Míticas', description: 'Erupções cromosféricas solares, plumas de plasma dourado e anéis coronais.', rarity: 'mythic', currency: 'coins', priceCoins: 22500, unlockType: 'purchase', active: true, accentColor: '#fbbf24', secondaryColor: '#f97316', cssClass: 'frame-effect-solar', category: 'elemental' },
  { id: 'frame_abismo_oceanico', type: 'frame', name: 'Leviatã do Abismo das Quinas', description: 'Tentáculos bio-mecânicos bioluminescentes que emergem de uma fenda oceânica abissal.', rarity: 'mythic', currency: 'coins', priceCoins: 25000, unlockType: 'purchase', active: true, accentColor: '#06b6d4', secondaryColor: '#4f46e5', cssClass: 'frame-effect-abyss', category: 'cosmico' },
  { id: 'frame_imperador_galactico', type: 'frame', name: 'Singularidade Cósmica das Quinas', description: 'A mais poderosa manifestação cósmica: matéria escura em rotação orbital e anéis de pulsars.', rarity: 'mythic', currency: 'coins', priceCoins: 28000, unlockType: 'purchase', active: true, accentColor: '#f43f5e', secondaryColor: '#8b5cf6', cssClass: 'frame-effect-singularity', category: 'cosmico' },
]

// ============================================================================
// 4. ARENAS & CENÁRIOS (43 BASE + 3 ULTRA-EXCLUSIVAS POR MÉRITO)
// ============================================================================
export const ARENA_SHOP_ITEMS: ShopCatalogItem[] = [
  // Grátis (1)
  { id: 'arena_praca_liberdade', type: 'arena', name: 'Praça da Liberdade', description: 'O coração cívico da cidade com calçada portuguesa e arquitetura imponente.', rarity: 'common', currency: 'free', priceCoins: 0, unlockType: 'free', asset: '/arenas/praca-liberdade.jpg', active: true, category: 'porto', icon: '🏛️' },
  // Comuns (1.500–2.800 moedas)
  { id: 'arena_cidade_norte', type: 'arena', name: 'Cidade Histórica do Norte', description: 'Ruas de granito e casario típico de uma cidade nortenha secular.', rarity: 'common', currency: 'coins', priceCoins: 2000, unlockType: 'purchase', asset: '/arenas/arena-3.jpg', active: true, category: 'porto', icon: '🏰' },
  { id: 'arena_costa_selvagem', type: 'arena', name: 'Falésias da Costa Selvagem', description: 'Encostas rochosas batidas pelas ondas impetuosas do oceano.', rarity: 'common', currency: 'coins', priceCoins: 2500, unlockType: 'purchase', asset: '/arenas/arena-4.jpg', active: true, category: 'natureza', icon: '🌊' },
  { id: 'arena_mosteiro_antigo', type: 'arena', name: 'Claustros do Mosteiro', description: 'Arcadas góticas e silêncio monumental num mosteiro carregado de história.', rarity: 'common', currency: 'coins', priceCoins: 2200, unlockType: 'purchase', asset: '/arenas/arena-5.jpg', active: true, category: 'historia', icon: '⛪' },
  { id: 'arena_festival_portugues', type: 'arena', name: 'Noite de Santos Populares', description: 'Manjericos, balões coloridos e arraiais iluminados sob o céu de junho.', rarity: 'common', currency: 'coins', priceCoins: 2800, unlockType: 'purchase', asset: '/arenas/festival-santos.jpg', active: true, category: 'cultura', icon: '🎉' },
  // Raras (3.000–6.000 moedas)
  { id: 'arena_costa_atlantica', type: 'arena', name: 'Costa Atlântica', description: 'A imensidão do Atlântico a perder de vista sob um pôr do sol dourado.', rarity: 'rare', currency: 'coins', priceCoins: 3500, unlockType: 'purchase', asset: '/arenas/costa-atlantica.jpg', active: true, category: 'natureza', icon: '🌊' },
  { id: 'arena_ponte_d_luis', type: 'arena', name: 'Ponte D. Luís I', description: 'A imponente estrutura de ferro forjado sobre as águas serenas do Rio Douro.', rarity: 'rare', currency: 'coins', priceCoins: 4000, unlockType: 'purchase', asset: '/arenas/ponte-d-luis.jpg', active: true, category: 'porto', icon: '🌉' },
  { id: 'arena_madeira_tropical', type: 'arena', name: 'Madeira Tropical', description: 'Encostas verdejantes e flora exótica na pérola do Atlântico.', rarity: 'rare', currency: 'coins', priceCoins: 4200, unlockType: 'purchase', asset: '/arenas/madeira-tropical.jpg', active: true, category: 'ilhas', icon: '🌺' },
  { id: 'arena_castelo_obidos', type: 'arena', name: 'Castelo de Óbidos', description: 'Muralhas de pedra medievais intactas que guardam séculos de histórias e lendas.', rarity: 'rare', currency: 'coins', priceCoins: 4500, unlockType: 'purchase', asset: '/arenas/castelo-obidos.jpg', active: true, category: 'historia', icon: '🏰' },
  { id: 'arena_madeira_noite', type: 'arena', name: 'Noite do Funchal', description: 'A baía do Funchal iluminada pelas luzes que sobem pelas encostas até às estrelas.', rarity: 'rare', currency: 'coins', priceCoins: 4500, unlockType: 'purchase', asset: '/arenas/madeira-noite.jpg', active: true, category: 'ilhas', icon: '✨' },
  { id: 'arena_fado_alfama', type: 'arena', name: 'Calçadas de Alfama', description: 'Lanternas ambarinas e becos sinuosos onde ecoa a guitarra portuguesa.', rarity: 'rare', currency: 'coins', priceCoins: 4800, unlockType: 'purchase', asset: '/arenas/fado-alfama.jpg', active: true, category: 'cultura', icon: '🎸' },
  { id: 'arena_torre_belem', type: 'arena', name: 'Torre de Belém', description: 'Bastião manuelino das navegações, plantado nas margens douradas do Tejo.', rarity: 'rare', currency: 'coins', priceCoins: 5000, unlockType: 'purchase', asset: '/arenas/torre-belem.jpg', active: true, category: 'lisboa', icon: '⛵' },
  // Épicas (6.000–12.000 moedas)
  { id: 'arena_lisboa_imperial_noturna', type: 'arena', name: 'Lisboa Imperial Noturna', description: 'Os monumentos do Terreiro do Paço banhados por iluminação cénica dourada.', rarity: 'epic', currency: 'coins', priceCoins: 7500, unlockType: 'purchase', asset: '/arenas/arena-lisboa-imperial.jpg', active: true, category: 'lisboa', icon: '🌙' },
  { id: 'arena_ponte_douro_panoramica', type: 'arena', name: 'Ponte do Douro Panorâmica', description: 'Vista aérea épica sobre as pontes e as encostas vinícolas do Douro.', rarity: 'epic', currency: 'coins', priceCoins: 8000, unlockType: 'purchase', asset: '/arenas/arena-ponte-d-luis.jpg', active: true, category: 'porto', icon: '🍷' },
  { id: 'arena_lisboa_imperial', type: 'arena', name: 'Lisboa Imperial', description: 'A grandiosidade pombalina e a luz branca e límpida que só a capital tem.', rarity: 'epic', currency: 'coins', priceCoins: 8500, unlockType: 'purchase', asset: '/arenas/lisboa-imperial.jpg', active: true, category: 'lisboa', icon: '👑' },
  { id: 'arena_portugal_medieval', type: 'arena', name: 'Muralhas Medievais', description: 'Pedras batidas por batalhas que moldaram a fundação da nacionalidade.', rarity: 'epic', currency: 'coins', priceCoins: 8500, unlockType: 'purchase', asset: '/arenas/portugal-medieval.jpg', active: true, category: 'historia', icon: '🛡️' },
  { id: 'arena_vulcao_erupcao', type: 'arena', name: 'Vulcão dos Açores', description: 'A força telúrica das caldeiras e fumarolas vulcânicas em plena atividade.', rarity: 'epic', currency: 'coins', priceCoins: 9000, unlockType: 'purchase', asset: '/arenas/vulcao-acores.jpg', active: true, category: 'ilhas', icon: '🌋' },
  { id: 'arena_vulcao_furnas', type: 'arena', name: 'Caldeiras das Furnas', description: 'Vapor místico e água termal a ferver no coração de São Miguel.', rarity: 'epic', currency: 'coins', priceCoins: 9500, unlockType: 'purchase', asset: '/arenas/arena-vulcao-erupcao.jpg', active: true, category: 'ilhas', icon: '♨️' },
  { id: 'arena_batalha_medieval', type: 'arena', name: 'Campo de Batalha Real', description: 'Estandartes ao vento e espadas cravadas na terra dos heróis de Aljubarrota.', rarity: 'epic', currency: 'coins', priceCoins: 10000, unlockType: 'purchase', asset: '/arenas/batalha-medieval.jpg', active: true, category: 'historia', icon: '⚔️' },
  { id: 'arena_caos_patos', type: 'arena', name: 'Ria de Aveiro & Moliceiros Cyber', description: 'Canais serenos com moliceiros luminosos que rasgam a névoa com néon.', rarity: 'epic', currency: 'coins', priceCoins: 10500, unlockType: 'purchase', asset: '/arenas/patos-aveiro.jpg', active: true, category: 'cyber', icon: '🦆' },
  { id: 'arena_teatro_nacional', type: 'arena', name: 'Palco do Teatro Nacional', description: 'Veludo carmesim, camarotes dourados e o peso das grandes dramaturgias lusas.', rarity: 'epic', currency: 'coins', priceCoins: 11000, unlockType: 'purchase', asset: '/arenas/teatro-nacional.jpg', active: true, category: 'cultura', icon: '🎭' },
  // Lendárias (12.000–22.500 moedas)
  { id: 'arena_estadio_nacional', type: 'arena', name: 'Estádio Nacional do Jamor', description: 'A mítica tribuna de madeira e a atmosfera sagrada das grandes finais da Taça.', rarity: 'legendary', currency: 'coins', priceCoins: 13500, unlockType: 'purchase', asset: '/arenas/estadio-jamor.jpg', active: true, category: 'desporto', icon: '⚽' },
  { id: 'arena_pico_estrelas', type: 'arena', name: 'Pico Sob as Estrelas', description: 'O ponto mais alto de Portugal a tocar o céu nocturno carregado de estrelas.', rarity: 'legendary', currency: 'coins', priceCoins: 14000, unlockType: 'purchase', asset: '/arenas/pico-estrelas.jpg', active: true, category: 'ilhas', icon: '⭐' },
  { id: 'arena_pico_aurora', type: 'arena', name: 'Pico com Aurora Mística', description: 'A majestosa montanha do Pico coroada por feixes de luz mística.', rarity: 'legendary', currency: 'coins', priceCoins: 15000, unlockType: 'purchase', asset: '/arenas/arena-pico-estrelas.jpg', active: true, category: 'ilhas', icon: '🏔️' },
  { id: 'arena_noite_jogo', type: 'arena', name: 'Noite de Clássico', description: 'Relvado iluminado por holofotes potentes sob o rugido ensurdecedor das bancadas.', rarity: 'legendary', currency: 'coins', priceCoins: 15500, unlockType: 'purchase', asset: '/arenas/derbi-noite.jpg', active: true, category: 'desporto', icon: '🏟️' },
  { id: 'arena_era_descobrimentos', type: 'arena', name: 'Cais dos Descobrimentos', description: 'Caravelas prontas a partir rumo ao desconhecido sob a bênção da Cruz de Cristo.', rarity: 'legendary', currency: 'coins', priceCoins: 16000, unlockType: 'purchase', asset: '/arenas/era-descobrimentos.jpg', active: true, category: 'historia', icon: '⛵' },
  { id: 'arena_corte_portuguesa', type: 'arena', name: 'Salão Nobre da Corte', description: 'Tapeçarias sumptuosas, azulejos barrocos e tronos dourados de reis e rainhas.', rarity: 'legendary', currency: 'coins', priceCoins: 17500, unlockType: 'purchase', asset: '/arenas/corte-portuguesa.jpg', active: true, category: 'historia', icon: '👑' },
  { id: 'arena_final_nacional', type: 'arena', name: 'Final da Taça de Portugal', description: 'Chuva de confetes e taça reluzente no centro do relvado sagrado.', rarity: 'legendary', currency: 'coins', priceCoins: 18000, unlockType: 'purchase', asset: '/arenas/final-campeoes.jpg', active: true, category: 'desporto', icon: '🏆' },
  { id: 'arena_noite_selecao', type: 'arena', name: 'Conquista da Seleção das Quinas', description: 'O estádio pintado de verde e rubro na noite em que Portugal foi campeão.', rarity: 'legendary', currency: 'coins', priceCoins: 20000, unlockType: 'purchase', asset: '/arenas/conquista-selecao.jpg', active: true, category: 'desporto', icon: '🇵🇹' },
  { id: 'arena_duelo_1v1_oficial', type: 'arena', name: 'Arena Oficial de Duelos 1v1', description: 'A câmara de competição direta onde apenas a velocidade e conhecimento prevalecem.', rarity: 'legendary', currency: 'coins', priceCoins: 22500, unlockType: 'purchase', asset: '/arenas/arena-1v1.png', active: true, category: 'desporto', icon: '⚔️' },
  // Míticas (22.500–40.000 moedas)
  { id: 'arena_ponte_2077', type: 'arena', name: 'Ponte 25 de Abril Cyber 2077', description: 'A ponte suspensa envolta em néons vermelhos e veículos voadores cortando o Tejo.', rarity: 'mythic', currency: 'coins', priceCoins: 26000, unlockType: 'purchase', asset: '/arenas/ponte-2077.jpg', active: true, category: 'cyber', icon: '🌆' },
  { id: 'arena_cyber_laboratorio', type: 'arena', name: 'Laboratório de Matriz Quântica', description: 'Fibras óticas e servidores holográficos a processar o saber universal.', rarity: 'mythic', currency: 'coins', priceCoins: 28000, unlockType: 'purchase', asset: '/arenas/arena-7.jpg', active: true, category: 'cyber', icon: '🔬' },
  { id: 'arena_portugal_ao_contrario', type: 'arena', name: 'Portugal Invertido', description: 'O mapa do país reflectido numa dimensão paralela de gravidade zero.', rarity: 'mythic', currency: 'coins', priceCoins: 29000, unlockType: 'purchase', asset: '/arenas/portugal-invertido.jpg', active: true, category: 'cyber', icon: '🌀' },
  { id: 'arena_lisboa_cybercore', type: 'arena', name: 'Lisboa Cybercore Néon', description: 'Aranha-céus translúcidos e hologramas gigantes das Quinas projetados nas nuvens.', rarity: 'mythic', currency: 'coins', priceCoins: 30000, unlockType: 'purchase', asset: '/arenas/lisboa-cybercore.jpg', active: true, category: 'cyber', icon: '🌃' },
  { id: 'arena_dimensao_psicadelica', type: 'arena', name: 'Vórtice Onírico Transcendente', description: 'Caleidoscópio cromático infinito de azulejos e calçada em expansão.', rarity: 'mythic', currency: 'coins', priceCoins: 30000, unlockType: 'purchase', asset: '/arenas/arena-8.jpg', active: true, category: 'cyber', icon: '🔮' },
  { id: 'arena_estacao_orbital', type: 'arena', name: 'Estação Orbital Lusitana', description: 'Módulos espaciais em órbita com vista panorâmica para a costa portuguesa.', rarity: 'mythic', currency: 'coins', priceCoins: 32000, unlockType: 'purchase', asset: '/arenas/estacao-orbital.jpg', active: true, category: 'cyber', icon: '🛰️' },
  { id: 'arena_labirinto_onirico', type: 'arena', name: 'Labirinto Sem Fim das Quinas', description: 'Corredores infinitos de espelhos e livros antigos que desafiam a lógica do tempo.', rarity: 'mythic', currency: 'coins', priceCoins: 33000, unlockType: 'purchase', asset: '/arenas/arena-9.jpg', active: true, category: 'cyber', icon: '🧩' },
  { id: 'arena_dentro_cerebro', type: 'arena', name: 'Sinapses do Saber Absoluto', description: 'Impulsos elétricos azuis e dourados a viajar por redes neuronais do conhecimento.', rarity: 'mythic', currency: 'coins', priceCoins: 34000, unlockType: 'purchase', asset: '/arenas/dentro-cerebro.jpg', active: true, category: 'cyber', icon: '🧠' },
  { id: 'arena_megalopolis_lusa', type: 'arena', name: 'Megalópole Atlântica 2077', description: 'Visão futurista de Portugal integrada numa super-cidade conectada aos oceanos.', rarity: 'mythic', currency: 'coins', priceCoins: 35000, unlockType: 'purchase', asset: '/arenas/arena-10.jpg', active: true, category: 'cyber', icon: '🚀' },
  { id: 'arena_portal_galactico', type: 'arena', name: 'Portal Quântico dos Descobrimentos', description: 'Vórtice dimensional estelar que liga o passado marítimo ao futuro interestelar.', rarity: 'mythic', currency: 'coins', priceCoins: 38000, unlockType: 'purchase', asset: '/arenas/portal-galactico.jpg', active: true, category: 'cyber', icon: '🌌' },
  // Ultra-Exclusivas por Mérito (NÃO Comprar com Moedas)
  { id: 'arena_excl_campeao', type: 'arena', name: 'Trono Sagrado do Campeão Nacional', description: 'Destinada exclusivamente ao número 1 do Ranking Nacional de Portugal.', rarity: 'exclusive', currency: 'merit', unlockType: 'ranking', unlockCondition: 'Top 1 no Ranking Nacional', asset: '/arenas/trono-campeao.jpg', active: true, category: 'exclusivos', icon: '👑' },
  { id: 'arena_excl_fundadores', type: 'arena', name: 'Monumento Perpétuo dos Fundadores', description: 'Símbolo eterno de homenagem aos pioneiros e fundadores do Acorda Portugal.', rarity: 'exclusive', currency: 'merit', unlockType: 'founder', unlockCondition: 'Passe Fundador / Pioneiro Oficial', asset: '/arenas/monumento-fundadores.jpg', active: true, category: 'exclusivos', icon: '🏛️' },
  { id: 'arena_excl_lenda_100', type: 'arena', name: 'Coliseu dos Imortais — 100 Vitórias', description: 'Monumento reservado à elite que alcançou a marca mítica de 100 vitórias 1v1.', rarity: 'exclusive', currency: 'merit', unlockType: 'achievement', unlockCondition: 'Conquista de 100 Vitórias em Duelos 1v1', asset: '/arenas/coliseu-100.jpg', active: true, category: 'exclusivos', icon: '⚔️' },
]

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

// ============================================================================
// CATÁLOGO UNIFICADO DEFINITIVO (SSOT)
// ============================================================================
export const SHOP_CATALOG: ShopCatalogItem[] = [
  ...AID_SHOP_ITEMS,
  ...AVATAR_SHOP_ITEMS,
  ...FRAME_SHOP_ITEMS,
  ...ARENA_SHOP_ITEMS,
  ...[STARTER_TITLE_ITEM],
  ...THEMATIC_TITLE_ITEMS,
  ...MERIT_TITLE_ITEMS,
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

  const direct = SHOP_CATALOG.find((item) => item.id === normalized)
  if (direct) return direct

  return SHOP_CATALOG.find((item) => item.aliases?.includes(normalized))
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
