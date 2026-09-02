// Sistema oficial de economia dos € Acorda (Moeda Virtual) do Acorda Portugal
// Esta moeda é 100% virtual, para uso exclusivo dentro do jogo, sem qualquer valor monetário real.

import { db } from '@/lib/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore'
import {
  ECONOMY_CONFIG,
  getDifficultyMultiplier,
  calculateMatchCoinReward,
  calculateLevelUpCoinReward,
} from '@/src/data/economy'
import { equipTitle } from '@/lib/titles-service'

export {
  ECONOMY_CONFIG,
  getDifficultyMultiplier,
  calculateMatchCoinReward,
  calculateLevelUpCoinReward,
}

import { ANIMATED_FRAMES } from '@/data/frames'

export type ItemCategory = 'arenas' | 'soundpacks' | 'streaks' | 'personalizacao' | 'utilidade' | 'prestigio' | 'packs'
export type ItemRarity = 'comum' | 'raro' | 'epico' | 'lendario'
export type ItemType = 'permanent' | 'consumable'

export function formatRarityLabel(rarity: ItemRarity): string {
  switch (rarity) {
    case 'comum':
      return 'Comum'
    case 'raro':
      return 'Raro'
    case 'epico':
      return 'Épico'
    case 'lendario':
      return 'Lendário'
    default:
      return 'Comum'
  }
}

export function formatItemStatusBadge(rarity: ItemRarity, isEquipped: boolean): string {
  const rarityLabel = formatRarityLabel(rarity)
  if (isEquipped) {
    return `${rarityLabel} · Equipado`
  }
  return rarityLabel
}

export type EquipSlot = 'frame' | 'title' | 'theme' | 'aura' | 'sfx' | 'soundpack' | 'streak_effect'

export type ShopItem = {
  id: string
  name: string
  description: string
  category: ItemCategory
  rarity: ItemRarity
  type: ItemType
  price: number
  icon: string
  slot?: EquipSlot
  badgeText?: string
  effectValue?: number
  previewColor?: string
  active?: boolean
}

export function getItemSlot(item: ShopItem): EquipSlot | null {
  if (item.slot) return item.slot
  if (item.id.startsWith('frame_')) return 'frame'
  if (item.id.startsWith('title_')) return 'title'
  if (item.id.startsWith('theme_')) return 'theme'
  if (item.id.startsWith('soundpack_')) return 'soundpack'
  if (item.id.startsWith('streak_')) return 'streak_effect'
  if (item.id.startsWith('prestige_aura_')) return 'aura'
  if (item.id.startsWith('sfx_')) return 'sfx'
  return null
}

export type WalletTransaction = {
  id: string
  userId: string
  type: 'earn' | 'spend'
  amount: number
  reason: string
  itemId?: string
  matchId?: string
  createdAt: any
}

// Configuração centralizada de preços e produtos da loja
export const SHOP_CATALOG: ShopItem[] = [
  // 🎨 PERSONALIZAÇÃO: MOLDURAS VIVAS DE AVATAR (24 Molduras Canónicas)
  ...ANIMATED_FRAMES.map((f): ShopItem => ({
    id: f.id,
    name: f.name,
    description: f.description,
    category: 'personalizacao',
    rarity: f.rarity === 'Mítico' ? 'lendario' : f.rarity === 'Lendário' ? 'lendario' : f.rarity === 'Épico' ? 'epico' : 'raro',
    type: 'permanent',
    slot: 'frame',
    price: f.price,
    icon: f.rarity === 'Mítico' ? 'Flame' : f.rarity === 'Lendário' ? 'Crown' : f.rarity === 'Épico' ? 'Sparkles' : 'Shield',
    previewColor: `border-[${f.accentColor}]`,
  })),

  // 🏷️ PERSONALIZAÇÃO: TÍTULOS DE PERFIL COM ANIMAÇÃO
  {
    id: 'title_rei_18_distritos',
    name: 'Título: «Rei dos 18 Distritos»',
    description: 'Título lendário dourado com efeito de brilho metálico contínuo (shimmer animation).',
    category: 'personalizacao',
    rarity: 'lendario',
    type: 'permanent',
    slot: 'title',
    price: 18000,
    icon: 'Crown',
  },
  {
    id: 'title_tuga_cibernetico',
    name: 'Título: «Tuga Cibernético»',
    description: 'Título futurista com efeito glitch e luz néon esmeralda pulsante.',
    category: 'personalizacao',
    rarity: 'epico',
    type: 'permanent',
    slot: 'title',
    price: 6000,
    icon: 'Zap',
  },
  {
    id: 'title_terror_do_quiz',
    name: 'Título: «Terror do Quiz»',
    description: 'Título temido com aura carmesim e contorno néon de alta intensidade.',
    category: 'personalizacao',
    rarity: 'raro',
    type: 'permanent',
    slot: 'title',
    price: 2800,
    icon: 'Flame',
  },
  {
    id: 'title_guardiao_lusitano',
    name: 'Título: «Guardião Lusitano»',
    description: 'Título especial para defensores da história e cultura do país.',
    category: 'personalizacao',
    rarity: 'epico',
    type: 'permanent',
    slot: 'title',
    price: 2500,
    icon: 'Award',
  },
  {
    id: 'title_voz_do_povo',
    name: 'Título: «Voz do Povo»',
    description: 'Título clássico em relevo prateado para os grandes mestres do saber popular.',
    category: 'personalizacao',
    rarity: 'comum',
    type: 'permanent',
    slot: 'title',
    price: 850,
    icon: 'Award',
  },
  {
    id: 'title_patriota',
    name: 'Título: «O Patriota»',
    description: 'Exibe o título de Patriota no teu perfil, rankings e duelos 1v1.',
    category: 'personalizacao',
    rarity: 'comum',
    type: 'permanent',
    slot: 'title',
    price: 750,
    icon: 'Award',
  },

  // 🌌 ARENAS DINÂMICAS & TEMAS DE JOGO (Alteram o fundo da partida)
  {
    id: 'theme_matriz_tron',
    name: 'Tema: Tron Cyber Nacional',
    description: 'Grelha digital em verde-esmeralda vibrante e circuitos a pulsar ao ritmo do cronómetro da pergunta. (Desbloqueado para todos).',
    category: 'arenas',
    rarity: 'comum',
    type: 'permanent',
    slot: 'theme',
    price: 0,
    icon: 'Cpu',
    previewColor: 'from-emerald-950/90 via-teal-950/60 to-black',
  },
  {
    id: 'theme_ondas_nazare',
    name: 'Tema: Ondas da Nazaré',
    description: 'Fundo azul-marinho profundo com feixes de luz bio-luminescentes e partículas de espuma néon em movimento.',
    category: 'arenas',
    rarity: 'raro',
    type: 'permanent',
    slot: 'theme',
    price: 6000,
    icon: 'Sparkles',
    previewColor: 'from-cyan-950/90 via-blue-950/70 to-black',
  },
  {
    id: 'theme_fado_cyberpunk',
    name: 'Tema: Noite de Fado em Alfama',
    description: 'Fundo em tons púrpura e néon âmbar com silhuetas de calçada portuguesa e névoa animada.',
    category: 'arenas',
    rarity: 'epico',
    type: 'permanent',
    slot: 'theme',
    price: 12500,
    icon: 'Palette',
    previewColor: 'from-purple-950/90 via-amber-950/60 to-black',
  },
  {
    id: 'theme_vulcao_acores',
    name: 'Tema: Fogo dos Açores / Vulcão',
    description: 'Fundo com brasas e faíscas incandescentes em ascensão com rebordo de ecrã a pulsar em vermelho-lava.',
    category: 'arenas',
    rarity: 'lendario',
    type: 'permanent',
    slot: 'theme',
    price: 25000,
    icon: 'Flame',
    previewColor: 'from-red-950/90 via-amber-950/70 to-black',
  },
  {
    id: 'theme_templo_dinis',
    name: 'Tema VIP: Templo de Ouro de D. Dinis',
    description: 'Reflexos dourados volumétricos e chuva de partículas de ouro nobre reluzente. (Exclusivo VIP).',
    category: 'arenas',
    rarity: 'lendario',
    type: 'permanent',
    slot: 'theme',
    price: 35000,
    icon: 'Crown',
    previewColor: 'from-yellow-950/90 via-amber-950/80 to-black',
  },
  {
    id: 'theme_matriz_cosmica',
    name: 'Tema VIP: Matriz Cósmica dos Descobrimentos',
    description: 'Constelações holográficas e ondas de choque néon violeta e ciano nas sequências de acertos. (Exclusivo VIP).',
    category: 'arenas',
    rarity: 'lendario',
    type: 'permanent',
    slot: 'theme',
    price: 45000,
    icon: 'Sparkles',
    previewColor: 'from-indigo-950/95 via-purple-950/80 to-black',
  },

  // 🎙️ VOZES & ÁUDIOS DE RESPOSTA (Soundpacks Tugas com reações ativadas na partida)
  {
    id: 'soundpack_comentador_futebol',
    name: 'Pack Vozes: Comentador de Futebol Tuga',
    description: 'Grito de "É GOOOOLO!" ao acertar no último segundo, "Foi ao poste!" ao errar e narração desportiva vibrante.',
    category: 'soundpacks',
    rarity: 'epico',
    type: 'permanent',
    slot: 'soundpack',
    price: 6000,
    icon: 'Volume2',
  },
  {
    id: 'soundpack_taberna_antiga',
    name: 'Pack Vozes: Taberna Antiga',
    description: 'Som de brinde com copos de vinho, "Saúde, carago!" e gargalhadas clássicas de vitória com alma portuguesa.',
    category: 'soundpacks',
    rarity: 'raro',
    type: 'permanent',
    slot: 'soundpack',
    price: 4500,
    icon: 'UtensilsCrossed',
  },
  {
    id: 'soundpack_scifi_80s',
    name: 'Pack Áudio: Sintetizador Sci-Fi 80s',
    description: 'Sons retro/arcade com sintetizadores espaciais analógicos e arpeggios laser eletrónicos.',
    category: 'soundpacks',
    rarity: 'raro',
    type: 'permanent',
    slot: 'soundpack',
    price: 3000,
    icon: 'Zap',
  },

  // 💥 EFEITOS DE RESPOSTA E STREAK DE FOGO
  {
    id: 'streak_chama_tripla',
    name: 'Efeito: Chama Tripla Verde-Néon',
    description: 'Atinge 3x Streak e incendeia o cronómetro e a tua pontuação com labaredas verde-néon incandescentes.',
    category: 'streaks',
    rarity: 'epico',
    type: 'permanent',
    slot: 'streak_effect',
    price: 7500,
    icon: 'Flame',
  },
  {
    id: 'streak_moedas_ouro',
    name: 'Efeito: Explosão de Moedas de Ouro',
    description: 'Moedas 3D reluzentes voam pelo ecrã ao acertar perguntas em sequência ou cravar 10/10 no duelo.',
    category: 'streaks',
    rarity: 'lendario',
    type: 'permanent',
    slot: 'streak_effect',
    price: 10000,
    icon: 'Coins',
  },
  {
    id: 'sfx_cravos_abril',
    name: 'Efeito 1v1: Cravos de Abril 3D',
    description: 'Quando acertas uma pergunta no duelo 1v1, explode uma rajada de pétalas e cravos vermelhos 3D no teu lado.',
    category: 'streaks',
    rarity: 'epico',
    type: 'permanent',
    slot: 'streak_effect',
    price: 7500,
    icon: 'Sparkles',
  },
  {
    id: 'sfx_raio_lusitano',
    name: 'Efeito 1v1: Raio Néon Lusitano',
    description: 'Ao acertar em sequência no 1v1, dispara um relâmpago verde e dourado na tua barra de pontuação.',
    category: 'streaks',
    rarity: 'lendario',
    type: 'permanent',
    slot: 'streak_effect',
    price: 12000,
    icon: 'Zap',
  },
  {
    id: 'sfx_espada_conquistador',
    name: 'Efeito 1v1: Espada de D. Afonso Henriques',
    description: 'Espada lendária em aço e ouro desce em chamas ao vencer duelos ou acertar sequências épicas.',
    category: 'streaks',
    rarity: 'lendario',
    type: 'permanent',
    slot: 'streak_effect',
    price: 15000,
    icon: 'Swords',
  },
  {
    id: 'frame_fundador_ouro',
    name: 'Moldura Fundador da Nação',
    description: 'Moldura exclusiva em ouro nobre com a bandeira de Portugal animada.',
    category: 'personalizacao',
    rarity: 'lendario',
    type: 'permanent',
    slot: 'frame',
    price: 25000,
    icon: 'Crown',
  },
  {
    id: 'title_conquistador_supremo',
    name: 'Título: «O Conquistador Supremo»',
    description: 'Título régio 3D banhado a ouro em honra ao primeiro Rei de Portugal.',
    category: 'personalizacao',
    rarity: 'lendario',
    type: 'permanent',
    slot: 'title',
    price: 20000,
    icon: 'Award',
  },
  {
    id: 'prestige_aura_dourada',
    name: 'Aura Dourada Radiante',
    description: 'Efeito luminoso permanente à volta do teu avatar nos rankings, duelos e perfil.',
    category: 'prestigio',
    rarity: 'lendario',
    type: 'permanent',
    slot: 'aura',
    price: 25000,
    icon: 'Sun',
  },
  {
    id: 'title_lenda_viva',
    name: 'Título: «Lenda Viva»',
    description: 'O título de maior prestígio para quem domina todos os desafios de Portugal.',
    category: 'prestigio',
    rarity: 'lendario',
    type: 'permanent',
    slot: 'title',
    price: 30000,
    icon: 'Crown',
  },
  // 💬 PROVOCAÇÕES & REAÇÕES 1v1
  {
    id: 'PROV_010',
    name: 'Quem manda aqui soy yoo',
    description: 'Provocação oficial assertiva para duelos 1v1 com balão de fala.',
    category: 'provocacao_1v1' as any,
    rarity: 'epico',
    type: 'taunt' as any,
    slot: 'taunt' as any,
    price: 250,
    icon: 'Crown',
  },

  // ⚡ UTILIDADE (Consumíveis de jogo)
  {
    id: 'consumable_50_50',
    name: 'Ajuda 50/50',
    description: 'Elimina duas opções erradas numa pergunta difícil durante o quiz.',
    category: 'utilidade',
    rarity: 'comum',
    type: 'consumable',
    price: 300,
    icon: 'Sparkles',
  },
  {
    id: 'consumable_pista',
    name: 'Pista Histórica',
    description: 'Recebe uma dica contextual que aponta para a resposta certa.',
    category: 'utilidade',
    rarity: 'comum',
    type: 'consumable',
    price: 250,
    icon: 'Lightbulb',
  },
  {
    id: 'consumable_congelar_tempo',
    name: 'Congelar Tempo',
    description: 'Pausa o cronómetro durante 15 segundos para pensares com calma.',
    category: 'utilidade',
    rarity: 'raro',
    type: 'consumable',
    price: 400,
    icon: 'Timer',
  },
  {
    id: 'HELP_005',
    name: 'Pergunta ao Público',
    description: 'Gera uma votação simulada da plateia com percentagens em cada opção de resposta.',
    category: 'ajudas_utilidades' as any,
    rarity: 'raro',
    type: 'consumable',
    price: 500,
    icon: 'Users',
  },
  {
    id: 'consumable_protecao_streak',
    name: 'Proteção de Sequência',
    description: 'Salva a tua sequência de dias se te esqueceres de jogar durante 24 horas.',
    category: 'utilidade',
    rarity: 'epico',
    type: 'consumable',
    price: 750,
    icon: 'Flame',
  },

  // 🎁 PACKS (Conjuntos com desconto)
  {
    id: 'pack_iniciado',
    name: 'Pack Iniciado',
    description: 'Inclui 2x 50/50, 2x Pistas e a Moldura Verde Esperança.',
    category: 'packs',
    rarity: 'raro',
    type: 'consumable',
    price: 900,
    icon: 'Package',
  },
  {
    id: 'pack_mestre',
    name: 'Pack Grande Mestre',
    description: 'Inclui 5x 50/50, 5x Congelar Tempo, 2x Proteções de Streak e Moldura Azulejo Nobre.',
    category: 'packs',
    rarity: 'epico',
    type: 'consumable',
    price: 6500,
    icon: 'PackageCheck',
  },
]

// Fontes de Recompensa Centralizadas
export const REWARD_CONFIG = {
  MATCH_BASE_WIN_COINS: ECONOMY_CONFIG.MATCH_REWARDS.BASE_WIN_COINS, // 15
  MATCH_PERFECT_BONUS: ECONOMY_CONFIG.MATCH_REWARDS.PERFECT_SCORE_BONUS, // 10
  STREAK_BONUS_MAX: ECONOMY_CONFIG.MATCH_REWARDS.STREAK_BONUS_MAX, // 10
  LEVEL_UP_REWARD: ECONOMY_CONFIG.LEVEL_UP_REWARDS.COINS_PER_LEVEL, // 25
  STREAK_3_DAYS: 50,
  STREAK_7_DAYS: 150,
  DAILY_CHALLENGE: 50,
  WEEKLY_MISSION: 250,
}

export type PurchaseResult = {
  success: boolean
  message: string
  newBalance?: number
  inventory?: Record<string, number>
}

/**
 * Executa uma compra segura e atómica no Firestore associada ao UID do jogador
 */
export async function buyShopItem(userId: string, itemId: string): Promise<PurchaseResult> {
  if (!userId || userId.startsWith('guest_')) {
    return { success: false, message: 'Inicia sessão para efetuar compras na loja.' }
  }

  const item = SHOP_CATALOG.find((i) => i.id === itemId)
  if (!item) {
    return { success: false, message: 'Produto não encontrado no catálogo.' }
  }

  try {
    const userRef = doc(db, 'users', userId)
    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef)
      if (!userDoc.exists()) {
        throw new Error('Conta de utilizador não encontrada.')
      }

      const userData = userDoc.data()
      const currentBalance = typeof userData.euros === 'number' ? userData.euros : 0
      const currentInventory: Record<string, number> = userData.inventory || {}

      // Verificar se já possui o item se for permanente
      if (item.type === 'permanent' && (currentInventory[itemId] || 0) > 0) {
        throw new Error('Já possuis este cosmético permanente no teu inventário.')
      }

      // Verificar saldo suficiente
      if (currentBalance < item.price) {
        throw new Error(`Não tens € Acorda suficientes. Necessitas de €${item.price.toLocaleString('pt-PT')}, mas o teu saldo é de €${currentBalance.toLocaleString('pt-PT')}.`)
      }

      const newBalance = currentBalance - item.price
      const updatedInventory = { ...currentInventory }

      // Tratar packs especiais
      if (itemId === 'pack_iniciado') {
        updatedInventory['consumable_50_50'] = (updatedInventory['consumable_50_50'] || 0) + 2
        updatedInventory['consumable_pista'] = (updatedInventory['consumable_pista'] || 0) + 2
        updatedInventory['frame_verde_esperanca'] = 1
      } else if (itemId === 'pack_mestre') {
        updatedInventory['consumable_50_50'] = (updatedInventory['consumable_50_50'] || 0) + 5
        updatedInventory['consumable_congelar_tempo'] = (updatedInventory['consumable_congelar_tempo'] || 0) + 5
        updatedInventory['consumable_protecao_streak'] = (updatedInventory['consumable_protecao_streak'] || 0) + 2
        updatedInventory['frame_azulejo_nobre'] = 1
      } else {
        updatedInventory[itemId] = (updatedInventory[itemId] || 0) + 1
      }

      // 1. Atualizar documento do utilizador
      transaction.update(userRef, {
        euros: newBalance,
        coins: newBalance,
        inventory: updatedInventory,
        updatedAt: serverTimestamp(),
      })

      // 2. Registar transação no histórico
      const txRef = doc(collection(db, 'users', userId, 'transactions'))
      transaction.set(txRef, {
        id: txRef.id,
        userId,
        type: 'spend',
        amount: -item.price,
        reason: `Compra na Loja: ${item.name}`,
        itemId: item.id,
        createdAt: serverTimestamp(),
      })

      return { newBalance, inventory: updatedInventory }
    })

    return {
      success: true,
      message: `Compraste «${item.name}» com sucesso por €${item.price.toLocaleString('pt-PT')}!`,
      newBalance: result.newBalance,
      inventory: result.inventory,
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Ocorreu um erro ao processar a compra.',
    }
  }
}

/**
 * Equipa um cosmético do inventário
 */
export async function equipItem(
  userId: string,
  itemId: string | null,
  slot?: EquipSlot,
): Promise<{ success: boolean; message: string }> {
  if (!userId || userId.startsWith('guest_')) return { success: false, message: 'Inicia sessão para equipar itens.' }

  let targetSlot = slot
  if (!targetSlot && itemId) {
    if (itemId.startsWith('tit_') || itemId.startsWith('title_')) {
      targetSlot = 'title'
    } else {
      const item = SHOP_CATALOG.find((i) => i.id === itemId)
      if (item) {
        targetSlot = getItemSlot(item) || undefined
      }
    }
  }

  if (targetSlot === 'title') {
    return await equipTitle(userId, itemId)
  }

  if (!targetSlot) {
    return { success: false, message: 'Tipo de slot cosmético inválido.' }
  }

  try {
    const userRef = doc(db, 'users', userId)
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef)
      if (!userDoc.exists()) throw new Error('Utilizador não encontrado.')

      const data = userDoc.data()
      const inventory = data.inventory || {}
      const equipped = data.equipped || {}

      // theme_matriz_tron é grátis e desbloqueado para todos
      if (itemId && itemId !== 'theme_matriz_tron' && !inventory[itemId]) {
        throw new Error('Não possuis este item no inventário.')
      }

      const updatedEquipped = { ...equipped }
      if (itemId) {
        updatedEquipped[targetSlot!] = itemId
      } else {
        delete updatedEquipped[targetSlot!]
      }

      const updatePayload: Record<string, any> = {
        equipped: updatedEquipped,
        updatedAt: serverTimestamp(),
      }

      if (targetSlot === 'theme') {
        updatePayload.equipped_game_theme = itemId || 'theme_matriz_tron'
      }

      transaction.update(userRef, updatePayload)
    })

    return { success: true, message: itemId ? 'Item equipado com sucesso!' : 'Item desequipado.' }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erro ao equipar item.' }
  }
}

/**
 * Atribui recompensa de partida validada com proteção contra duplicações
 */
export async function processMatchEurosReward({
  userId,
  matchId,
  correctCount,
  totalQuestions,
  score,
  bestStreak = 0,
  difficulty = 1,
}: {
  userId: string
  matchId: string
  correctCount: number
  totalQuestions: number
  score: number
  bestStreak?: number
  difficulty?: string | number | null
}): Promise<{ eurosAwarded: number; newBalance: number }> {
  const totalEuros = calculateMatchCoinReward({
    correctCount,
    totalQuestions,
    bestStreak,
    difficulty,
  })

  const userRef = doc(db, 'users', userId)
  const matchHistoryRef = doc(db, 'users', userId, 'match_rewards', matchId)

  const result = await runTransaction(db, async (transaction) => {
    // Verificar se este matchId já recebeu recompensa
    const matchSnap = await transaction.get(matchHistoryRef)
    if (matchSnap.exists()) {
      const userSnap = await transaction.get(userRef)
      return { eurosAwarded: 0, newBalance: userSnap.data()?.euros || 0 }
    }

    const userSnap = await transaction.get(userRef)
    const currentEuros = typeof userSnap.data()?.euros === 'number' ? userSnap.data()?.euros : 0
    const newBalance = currentEuros + totalEuros

    // Marcar matchId como processado
    transaction.set(matchHistoryRef, {
      matchId,
      euros: totalEuros,
      processedAt: serverTimestamp(),
    })

    // Atualizar saldo
    transaction.update(userRef, {
      euros: newBalance,
      coins: newBalance,
      updatedAt: serverTimestamp(),
    })

    // Registar no histórico de transações
    const txRef = doc(collection(db, 'users', userId, 'transactions'))
    transaction.set(txRef, {
      id: txRef.id,
      userId,
      type: 'earn',
      amount: totalEuros,
      reason: `Recompensa de Partida (${correctCount}/${totalQuestions} certas)`,
      matchId,
      createdAt: serverTimestamp(),
    })

    return { eurosAwarded: totalEuros, newBalance }
  })

  return result
}

export type ConsumablePowerUpId =
  | 'consumable_50_50'
  | 'consumable_pista'
  | 'consumable_congelar_tempo'
  | 'consumable_public_vote'
  | 'HELP_005'
  | 'ajuda_publico'

/**
 * Consome 1 unidade de power-up do inventário de forma atómica no Firestore
 */
export async function useConsumablePowerUp(
  userId: string,
  powerUpId: ConsumablePowerUpId,
): Promise<{ success: boolean; remainingCount: number; message?: string }> {
  if (!userId || userId.startsWith('guest_')) {
    return { success: false, remainingCount: 0, message: 'Inicia sessão para usar ajudas.' }
  }

  // Utilizador com Conta Registada (Transação Atómica no Firestore)
  try {
    const userRef = doc(db, 'users', userId)
    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef)
      if (!userDoc.exists()) throw new Error('Utilizador não encontrado.')

      const data = userDoc.data()
      const inventory: Record<string, number> = data.inventory || {}
      
      const count1 = inventory[powerUpId] || 0
      const count2 = (powerUpId === 'HELP_005' || powerUpId === 'consumable_public_vote' || powerUpId === 'ajuda_publico')
        ? (inventory['HELP_005'] || inventory['consumable_public_vote'] || data.consumables?.publicVote || 0)
        : 0
      const currentCount = Math.max(count1, count2)

      if (currentCount <= 0) {
        throw new Error('Não tens este power-up disponível no inventário.')
      }

      const newCount = currentCount - 1
      const updatedInventory = {
        ...inventory,
        [powerUpId]: newCount,
        ...(powerUpId === 'HELP_005' || powerUpId === 'consumable_public_vote' || powerUpId === 'ajuda_publico'
          ? { HELP_005: newCount, consumable_public_vote: newCount }
          : {}),
      }

      const updatePayload: Record<string, any> = {
        inventory: updatedInventory,
        updatedAt: serverTimestamp(),
      }

      if (powerUpId === 'HELP_005' || powerUpId === 'consumable_public_vote' || powerUpId === 'ajuda_publico') {
        updatePayload['consumables.publicVote'] = newCount
      } else if (powerUpId === 'consumable_50_50') {
        updatePayload['consumables.help5050'] = newCount
      } else if (powerUpId === 'consumable_congelar_tempo') {
        updatePayload['consumables.freezeTime'] = newCount
      }

      transaction.update(userRef, updatePayload)

      return { remainingCount: newCount }
    })

    return { success: true, remainingCount: result.remainingCount }
  } catch (err: any) {
    return { success: false, remainingCount: 0, message: err?.message || 'Erro ao usar power-up.' }
  }
}

