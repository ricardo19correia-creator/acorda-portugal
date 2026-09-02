// Acorda Portugal — Serviço Central de Persistência e Equipamento de Títulos
// Garante atomicidade, idempotência, segurança e sincronização entre users e publicProfiles

import { doc, getDoc, runTransaction, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  DEFAULT_STARTER_TITLE_ID,
  DEFAULT_STARTER_TITLE_NAME,
  resolveTitle,
  isTitleOwned,
  sanitizeTitleName,
  type ResolvedTitle,
} from '@/lib/titles'

export interface EquipTitleResult {
  success: boolean
  message: string
  equippedTitleId?: string | null
  equippedTitle?: string
}

/**
 * Equipa um título no perfil do jogador com validação de posse e persistência atómica no Firestore.
 */
export async function equipTitle(
  userId: string,
  titleIdOrName: string | null,
): Promise<EquipTitleResult> {
  if (!userId || userId.startsWith('guest_')) {
    return { success: false, message: 'Inicia sessão para equipar títulos.' }
  }

  // 1. Caso de Desequipar
  if (!titleIdOrName) {
    return await unequipTitle(userId)
  }

  // 2. Resolução do Título no Catálogo Mestre Oficial
  const targetItem = resolveTitle(titleIdOrName)
  if (!targetItem) {
    return {
      success: false,
      message: `Título "${titleIdOrName}" não foi encontrado no catálogo oficial.`,
    }
  }

  const canonicalId = targetItem.id
  const cleanName = sanitizeTitleName(targetItem.name)

  try {
    const userRef = doc(db, 'users', userId)
    const publicProfileRef = doc(db, 'publicProfiles', userId)

    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef)
      if (!userDoc.exists()) {
        throw new Error('Perfil de utilizador não encontrado no sistema.')
      }

      const userData = userDoc.data() || {}
      const inventoryTitles = userData.inventory?.titles || []

      // Validar posse (tit_novico é starter e gratuito para todos)
      const owned = isTitleOwned(inventoryTitles, canonicalId)
      if (!owned) {
        throw new Error(`Não possuis o título «${cleanName}» no teu inventário. Adquire-o na Loja primeiro.`)
      }

      const existingEquipped = userData.equipped || {}
      const updatedEquipped = {
        ...existingEquipped,
        title: canonicalId,
        titleId: canonicalId,
        titleName: cleanName,
      }

      // Atualizar documento principal de utilizador
      transaction.update(userRef, {
        equippedTitleId: canonicalId,
        equippedTitle: cleanName,
        title: cleanName,
        equipped: updatedEquipped,
        updatedAt: serverTimestamp(),
      })

      // Atualizar / criar documento público sincronizado
      transaction.set(
        publicProfileRef,
        {
          uid: userId,
          equippedTitleId: canonicalId,
          equippedTitle: cleanName,
          title: cleanName,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    })

    // Atualização imediata do LocalStorage para evitar flashes de estado
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('equipped_title_id', canonicalId)
        localStorage.setItem('equipped_title', cleanName)
        localStorage.setItem('user_equipped_title', cleanName)
      } catch (storageErr) {
        console.warn('[TITLES] Aviso localStorage restrito:', storageErr)
      }

      // Disparar eventos reativos imediatos
      window.dispatchEvent(new Event('titleChanged'))
      window.dispatchEvent(new Event('inventory_updated'))
      window.dispatchEvent(new Event('storage'))
    }

    return {
      success: true,
      message: `Título «${cleanName}» equipado com sucesso!`,
      equippedTitleId: canonicalId,
      equippedTitle: cleanName,
    }
  } catch (err: any) {
    console.error('[TITLES] Erro ao equipar título:', err)
    return {
      success: false,
      message: err?.message || 'Ocorreu um erro ao equipar o título.',
    }
  }
}

/**
 * Desequipa o título ativo do utilizador, revertendo para o padrão
 */
export async function unequipTitle(userId: string): Promise<EquipTitleResult> {
  if (!userId || userId.startsWith('guest_')) {
    return { success: false, message: 'Inicia sessão para alterar cosméticos.' }
  }

  try {
    const userRef = doc(db, 'users', userId)
    const publicProfileRef = doc(db, 'publicProfiles', userId)

    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef)
      if (!userDoc.exists()) {
        throw new Error('Perfil de utilizador não encontrado.')
      }

      const userData = userDoc.data() || {}
      const existingEquipped = { ...(userData.equipped || {}) }
      delete existingEquipped.title
      delete existingEquipped.titleId
      delete existingEquipped.titleName

      transaction.update(userRef, {
        equippedTitleId: null,
        equippedTitle: null,
        title: null,
        equipped: existingEquipped,
        updatedAt: serverTimestamp(),
      })

      transaction.set(
        publicProfileRef,
        {
          equippedTitleId: null,
          equippedTitle: null,
          title: null,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    })

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('equipped_title_id')
        localStorage.removeItem('equipped_title')
        localStorage.removeItem('user_equipped_title')
      } catch {}

      window.dispatchEvent(new Event('titleChanged'))
      window.dispatchEvent(new Event('inventory_updated'))
      window.dispatchEvent(new Event('storage'))
    }

    return {
      success: true,
      message: 'Título desequipado com sucesso.',
      equippedTitleId: null,
      equippedTitle: undefined,
    }
  } catch (err: any) {
    console.error('[TITLES] Erro ao desequipar título:', err)
    return {
      success: false,
      message: err?.message || 'Erro ao desequipar título.',
    }
  }
}
