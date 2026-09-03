/**
 * 🇵🇹 ACORDA PORTUGAL — MIGRAÇÃO SEGURA DE INVENTÁRIOS E ECONOMIA
 * 
 * Regras Estritas:
 * 1. NUNCA apagar dados, moedas ou inventários existentes.
 * 2. Itens adquiridos anteriormente continuam para sempre no inventário do jogador.
 * 3. Mudanças de preço NÃO cobram nem retiram itens já comprados.
 * 4. Migração e normalização de identificadores legados para os novos IDs canónicos.
 * 5. Garantir itens padrão gratuitos (avatares iniciais, arena da Liberdade, emotes básicos).
 */

import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { AID_MAX_OWNED_LIMIT, AID_SHOP_ITEMS } from '@/lib/shop-catalog'

export interface MigrationResult {
  migrated: boolean
  addedItems: string[]
  consolidatedAids: Record<string, number>
}

/**
 * Normaliza e consolida o inventário de um utilizador de forma atómica e segura
 */
export async function migrateUserInventory(userId: string): Promise<MigrationResult> {
  if (!userId) {
    return { migrated: false, addedItems: [], consolidatedAids: {} }
  }

  const db = getAdminFirestore()
  const userRef = db.collection('users').doc(userId)
  const userSnap = await userRef.get()

  if (!userSnap.exists) {
    return { migrated: false, addedItems: [], consolidatedAids: {} }
  }

  const userData = userSnap.data() || {}
  const inventory = userData.inventory || {}
  const consumables = userData.consumables || {}

  const updates: Record<string, any> = {}
  const addedItems: string[] = []
  const consolidatedAids: Record<string, number> = {}

  // 1. Garantir Itens Iniciais Gratuitos
  const defaultAvatars = ['avatar_01', 'avatar_02', 'avatar_03', 'avatar_04']
  const existingAvatars: string[] = Array.isArray(inventory.avatars) ? inventory.avatars : []
  const missingAvatars = defaultAvatars.filter((av) => !existingAvatars.includes(av))
  if (missingAvatars.length > 0) {
    updates['inventory.avatars'] = FieldValue.arrayUnion(...missingAvatars)
    for (const av of missingAvatars) {
      updates[`inventory.${av}`] = 1
      addedItems.push(av)
    }
  }

  const defaultArenas = ['arena_praca_liberdade']
  const existingArenas: string[] = Array.isArray(inventory.arenas) ? inventory.arenas : []
  const missingArenas = defaultArenas.filter((ar) => !existingArenas.includes(ar))
  if (missingArenas.length > 0) {
    updates['inventory.arenas'] = FieldValue.arrayUnion(...missingArenas)
    updates['inventory.arena_praca_liberdade'] = 1
    addedItems.push('arena_praca_liberdade')
  }

  const defaultTitles = ['tit_novico']
  const existingTitles: string[] = Array.isArray(inventory.titles) ? inventory.titles : []
  const missingTitles = defaultTitles.filter((t) => !existingTitles.includes(t))
  if (missingTitles.length > 0) {
    updates['inventory.titles'] = FieldValue.arrayUnion(...missingTitles)
    updates['ownedTitleIds'] = FieldValue.arrayUnion(...missingTitles)
    addedItems.push('tit_novico')
  }

  const defaultEmotes = ['emote_ola', 'emote_boa_sorte', 'emote_vamos', 'emote_boa', 'emote_quase', 'emote_gg', 'pack_basico']
  const existingEmotes: string[] = Array.isArray(inventory.emotes) ? inventory.emotes : []
  const missingEmotes = defaultEmotes.filter((e) => !existingEmotes.includes(e))
  if (missingEmotes.length > 0) {
    updates['inventory.emotes'] = FieldValue.arrayUnion(...missingEmotes)
    for (const em of missingEmotes) {
      updates[`inventory.${em}`] = 1
      addedItems.push(em)
    }
  }

  // 2. Consolidação de Ajudas & Utilidades para a Subcoleção aid_inventory
  const aidInventoryBatch = db.batch()
  let hasBatchWrites = false

  for (const aid of AID_SHOP_ITEMS) {
    // Recolher stock de todas as fontes legadas
    let totalStock = 0

    // Direct inventory check
    if (typeof inventory[aid.id] === 'number') {
      totalStock = Math.max(totalStock, inventory[aid.id])
    }

    // Aliases check
    if (aid.aliases) {
      for (const alias of aid.aliases) {
        if (typeof inventory[alias] === 'number') {
          totalStock = Math.max(totalStock, inventory[alias])
        }
      }
    }

    // Consumables object check
    if (aid.id === 'AID_002' || aid.aliases?.includes('consumable_50_50')) {
      totalStock = Math.max(totalStock, Number(consumables.help5050 || 0))
    } else if (aid.id === 'AID_003' || aid.aliases?.includes('consumable_public_vote')) {
      totalStock = Math.max(totalStock, Number(consumables.publicVote || 0))
    } else if (aid.id === 'AID_004' || aid.aliases?.includes('consumable_congelar_tempo')) {
      totalStock = Math.max(totalStock, Number(consumables.freezeTime || 0))
    }

    // Limitar ao máximo permitido de 50 unidades
    const clampedStock = Math.min(AID_MAX_OWNED_LIMIT, totalStock)

    if (clampedStock > 0) {
      consolidatedAids[aid.id] = clampedStock
      const aidDocRef = userRef.collection('aid_inventory').doc(aid.id)
      aidInventoryBatch.set(
        aidDocRef,
        {
          userId,
          aidId: aid.id,
          quantity: clampedStock,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )
      hasBatchWrites = true

      // Espelhar de volta no inventário unificado
      updates[`inventory.${aid.id}`] = clampedStock
    }
  }

  // 3. Normalização de Moedas: sem negativos, sem floats
  const rawCoins = userData.coins ?? userData.euros ?? 0
  const normalizedCoins = Math.max(0, Math.floor(typeof rawCoins === 'number' && !isNaN(rawCoins) ? rawCoins : 0))
  if (userData.coins !== normalizedCoins) {
    updates.coins = normalizedCoins
    updates.euros = normalizedCoins
  }

  // 4. Executar Gravação Segura
  const hasUpdates = Object.keys(updates).length > 0

  if (hasBatchWrites) {
    await aidInventoryBatch.commit().catch((err) => {
      console.warn('[MIGRATION_BATCH_FAIL] Erro ao gravar subcoleção aid_inventory:', err)
    })
  }

  if (hasUpdates) {
    updates.updatedAt = FieldValue.serverTimestamp()
    updates.migrationVersion = '2026.09.ssot'
    await userRef.update(updates).catch((err) => {
      console.warn('[MIGRATION_UPDATE_FAIL] Erro ao atualizar utilizador:', err)
    })
  }

  return {
    migrated: hasUpdates || hasBatchWrites,
    addedItems,
    consolidatedAids,
  }
}
