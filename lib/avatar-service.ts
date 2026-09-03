/**
 * 🇵🇹 ACORDA PORTUGAL — SERVIÇO AUTORITATIVO DE AVATARES (SSOT)
 * Validação estrita de posse, regras de economia e sincronização atómica.
 */

import {
  REAL_AVATARS,
  getAvatarById,
  normalizeAvatarId,
  STARTER_AVATAR_ID,
  DEFAULT_AVATAR,
  type AvatarItem,
} from './avatars'
import { getAdminFirestore } from './firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export interface CanEquipAvatarResult {
  allowed: boolean
  code?: string
  reason?: string
  avatarItem?: AvatarItem
}

/**
 * Validação Server-Side: Verifica se o utilizador pode equipar um determinado avatar
 */
export async function canEquipAvatar(
  userId: string,
  targetAvatarIdOrUrl?: string | null
): Promise<CanEquipAvatarResult> {
  if (!userId || typeof userId !== 'string') {
    return { allowed: false, code: 'INVALID_USER_ID', reason: 'ID de utilizador inválido.' }
  }

  const normalizedId = normalizeAvatarId(targetAvatarIdOrUrl || STARTER_AVATAR_ID)
  const avatarItem = getAvatarById(normalizedId)

  if (!avatarItem) {
    return { allowed: false, code: 'AVATAR_NOT_FOUND', reason: 'Avatar não encontrado no catálogo.' }
  }

  // 1. O avatar inicial gratuito é SEMPRE permitido a todos os jogadores
  if (avatarItem.id === STARTER_AVATAR_ID) {
    return { allowed: true, avatarItem }
  }

  // 2. Consulta à base de dados para verificação de posse real
  try {
    const db = getAdminFirestore()
    const userRef = db.collection('users').doc(userId)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return { allowed: false, code: 'USER_NOT_FOUND', reason: 'Perfil de utilizador não encontrado.' }
    }

    const userData = userSnap.data() || {}
    const inventoryAvatars: string[] = Array.isArray(userData.inventory?.avatars)
      ? userData.inventory.avatars.map(normalizeAvatarId)
      : []
    const unlockedAvatars: string[] = Array.isArray(userData.unlockedAvatars)
      ? userData.unlockedAvatars.map(normalizeAvatarId)
      : []

    // 2.1 Posse direta no inventário
    if (inventoryAvatars.includes(avatarItem.id) || unlockedAvatars.includes(avatarItem.id)) {
      return { allowed: true, avatarItem }
    }

    // 2.2 Verificação de Entitlements VIP (€ Real)
    const entitlementDoc = await userRef.collection('entitlements').doc(avatarItem.id).get()
    if (entitlementDoc.exists && entitlementDoc.data()?.active !== false) {
      return { allowed: true, avatarItem }
    }

    // 2.3 Verificação de Conquistas de Mérito
    if (avatarItem.currency === 'merit' || avatarItem.price === 'Mérito') {
      const achievements: string[] = Array.isArray(userData.unlockedAchievements)
        ? userData.unlockedAchievements
        : []

      if (avatarItem.id === 'avatar_30' && (achievements.includes('top_10_rank') || (userData.stats?.highestRank && userData.stats.highestRank <= 10))) {
        return { allowed: true, avatarItem }
      }
      if (avatarItem.id === 'avatar_35' && (achievements.includes('100_duel_wins') || (userData.stats?.duelsWon || userData.wins || 0) >= 100)) {
        return { allowed: true, avatarItem }
      }
      if (avatarItem.id === 'avatar_36' && achievements.includes('lenda_portugal')) {
        return { allowed: true, avatarItem }
      }
    }

    return {
      allowed: false,
      code: 'AVATAR_NOT_OWNED',
      reason: `Não possuis o avatar «${avatarItem.name}». Adquire-o na Loja ou desbloqueia-o por mérito para o equipares.`,
      avatarItem,
    }
  } catch (err: any) {
    console.warn('[AVATAR_SERVICE] Erro ao validar posse:', err)
    return {
      allowed: false,
      code: 'VALIDATION_ERROR',
      reason: err?.message || 'Erro ao validar posse do avatar no servidor.',
    }
  }
}

/**
 * Equipar Avatar Server-Side: Valida e atualiza users/{uid} e publicProfiles/{uid} atomicamente
 */
export async function equipAvatarServer(
  userId: string,
  targetAvatarIdOrUrl: string
): Promise<{ success: boolean; avatarItem: AvatarItem; message: string }> {
  const check = await canEquipAvatar(userId, targetAvatarIdOrUrl)
  if (!check.allowed || !check.avatarItem) {
    const error: any = new Error(check.reason || 'Não tens permissão para equipar este avatar.')
    error.code = check.code || 'AVATAR_NOT_OWNED'
    error.status = 403
    throw error
  }

  const avatarItem = check.avatarItem
  const db = getAdminFirestore()
  const userRef = db.collection('users').doc(userId)
  const publicProfileRef = db.collection('publicProfiles').doc(userId)

  const batch = db.batch()

  batch.set(
    userRef,
    {
      avatarId: avatarItem.id,
      equippedAvatar: avatarItem.id,
      avatar: avatarItem.image,
      photoURL: avatarItem.image,
      equipped: {
        avatar: avatarItem.image,
        avatarId: avatarItem.id,
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )

  batch.set(
    publicProfileRef,
    {
      avatarId: avatarItem.id,
      equippedAvatar: avatarItem.id,
      avatar: avatarItem.image,
      photoURL: avatarItem.image,
      'equipped.avatar': avatarItem.image,
      'equipped.avatarId': avatarItem.id,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )

  await batch.commit()

  return {
    success: true,
    avatarItem,
    message: `Avatar «${avatarItem.name}» equipado com sucesso!`,
  }
}
