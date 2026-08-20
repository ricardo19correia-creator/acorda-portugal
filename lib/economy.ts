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

export type ItemCategory = 'personalizacao' | 'utilidade' | 'prestigio' | 'packs'
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

export type EquipSlot = 'frame' | 'title' | 'theme' | 'aura' | 'sfx'

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
  // 🎨 PERSONALIZAÇÃO: MOLDURAS DE AVATAR (Cosméticos permanentes animados)
  {
    id: 'frame_chama_sebastiao',
    name: 'Moldura Chama de D. Sebastião',
    description: 'Moldura mítica em chamas holográficas rubi e douradas com partículas e fumo néon a subir.',
    category: 'personalizacao',
    rarity: 'lendario',
    type: 'permanent',
    slot: 'frame',
    price: 25000,
    icon: 'Flame',
    previewColor: 'border-amber-500',
  },
  {
    id: 'frame_cyber_galo',
    name: 'Moldura Cyber Galo de Barcelos',
    description: 'Crista e arestas néon multicolor com rotação de brilho e reflexos cyberpunk.',
    category: 'personalizacao',
    rarity: 'epico',
    type: 'permanent',
    slot: 'frame',
    price: 8500,
    icon: 'Crown',
    previewColor: 'border-emerald-400',
  },
  {
    id: 'frame_onda_nazare',
    name: 'Moldura Onda da Nazaré',
    description: 'Vórtice de água translúcida com reflexos azuis néon e maré pulsante em tempo real.',
    category: 'personalizacao',
    rarity: 'raro',
    type: 'permanent',
    slot: 'frame',
    price: 3200,
    icon: 'Sparkles',
    previewColor: 'border-cyan-400',
  },
  {
    id: 'frame_padrao_descobrimentos',
    name: 'Moldura Padrão dos Descobrimentos',
    description: 'Acabamento nobre em pedra calcária cinzelada com iluminação laser verde esmeralda.',
    category: 'personalizacao',
    rarity: 'comum',
    type: 'permanent',
    slot: 'frame',
    price: 1200,
    icon: 'Shield',
    previewColor: 'border-emerald-600',
  },
  {
    id: 'frame_ouro_real',
    name: 'Moldura Ouro Real',
    description: 'Moldura lendária banhada a ouro maciço com brilho reluzente para mestres do saber.',
    category: 'personalizacao',
    rarity: 'lendario',
    type: 'permanent',
    slot: 'frame',
    price: 15000,
    icon: 'Crown',
    previewColor: 'border-gold',
  },
  {
    id: 'frame_azulejo_nobre',
    name: 'Moldura Azulejo Nobre',
    description: 'Padrão tradicional de azulejo português refinado com reflexos prateados e violeta.',
    category: 'personalizacao',
    rarity: 'epico',
    type: 'permanent',
    slot: 'frame',
    price: 5000,
    icon: 'Sparkles',
    previewColor: 'border-purple-400',
  },
  {
    id: 'frame_mar_portugues',
    name: 'Moldura Mar Português',
    description: 'Moldura aquática inspirada na epopeia e bravura dos navegadores portugueses.',
    category: 'personalizacao',
    rarity: 'raro',
    type: 'permanent',
    slot: 'frame',
    price: 1500,
    icon: 'Sparkles',
    previewColor: 'border-cyan-400',
  },
  {
    id: 'frame_verde_esperanca',
    name: 'Moldura Verde Esperança',
    description: 'Moldura de avatar clássica com o anel de luz verde néon nacional.',
    category: 'personalizacao',
    rarity: 'comum',
    type: 'permanent',
    slot: 'frame',
    price: 500,
    icon: 'Shield',
    previewColor: 'border-primary',
  },

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

  // 💥 PERSONALIZAÇÃO: EFEITOS DE RESPOSTA NO DUELO 1V1
  {
    id: 'sfx_cravos_abril',
    name: 'Efeito 1v1: Cravos de Abril',
    description: 'Quando acertas uma pergunta no duelo 1v1, explode uma rajada de pétalas e cravos vermelhos 3D no teu lado.',
    category: 'personalizacao',
    rarity: 'epico',
    type: 'permanent',
    slot: 'sfx',
    price: 7500,
    icon: 'Sparkles',
  },
  {
    id: 'sfx_raio_lusitano',
    name: 'Efeito 1v1: Raio Néon Lusitano',
    description: 'Ao acertar em sequência no 1v1, dispara um relâmpago verde e dourado na tua barra de pontuação.',
    category: 'personalizacao',
    rarity: 'lendario',
    type: 'permanent',
    slot: 'sfx',
    price: 12000,
    icon: 'Zap',
  },

  // 🎨 TEMAS & AURAS
  {
    id: 'theme_noite_fado',
    name: 'Tema: Noite de Fado',
    description: 'Aparência visual exclusiva com tons aveludados e atmosfera de Alfama.',
    category: 'personalizacao',
    rarity: 'epico',
    type: 'permanent',
    slot: 'theme',
    price: 5000,
    icon: 'Palette',
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
  MATCH_BASE_PER_CORRECT: 15, // € por resposta certa (~150€ por 10 perguntas)
  MATCH_PERFECT_BONUS: 50, // Bónus por 100% de acerto
  STREAK_3_DAYS: 150,
  STREAK_7_DAYS: 500,
  LEVEL_UP_REWARD: 200,
  DAILY_CHALLENGE: 150,
  WEEKLY_MISSION: 1000,
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
    const item = SHOP_CATALOG.find((i) => i.id === itemId)
    if (item) {
      targetSlot = getItemSlot(item) || undefined
    }
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

      if (itemId && !inventory[itemId]) {
        throw new Error('Não possuis este item no inventário.')
      }

      const updatedEquipped = { ...equipped }
      if (itemId) {
        updatedEquipped[targetSlot!] = itemId
      } else {
        delete updatedEquipped[targetSlot!]
      }

      transaction.update(userRef, {
        equipped: updatedEquipped,
        updatedAt: serverTimestamp(),
      })
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
}: {
  userId: string
  matchId: string
  correctCount: number
  totalQuestions: number
  score: number
}): Promise<{ eurosAwarded: number; newBalance: number }> {
  const isPerfect = correctCount === totalQuestions && totalQuestions > 0
  const baseReward = correctCount * REWARD_CONFIG.MATCH_BASE_PER_CORRECT
  const bonusReward = isPerfect ? REWARD_CONFIG.MATCH_PERFECT_BONUS : Math.round(score / 50)
  const totalEuros = Math.max(20, baseReward + bonusReward)

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
      const currentCount = inventory[powerUpId] || 0

      if (currentCount <= 0) {
        throw new Error('Não tens este power-up disponível no inventário.')
      }

      const newCount = currentCount - 1
      const updatedInventory = { ...inventory, [powerUpId]: newCount }

      transaction.update(userRef, {
        inventory: updatedInventory,
        updatedAt: serverTimestamp(),
      })

      return { remainingCount: newCount }
    })

    return { success: true, remainingCount: result.remainingCount }
  } catch (err: any) {
    return { success: false, remainingCount: 0, message: err?.message || 'Erro ao usar power-up.' }
  }
}

