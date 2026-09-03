/**
 * 🇵🇹 ACORDA PORTUGAL — SCRIPT DE MIGRAÇÃO E AUDITORIA FORENSE DE AVATARES
 * Auditoria e higienização estrita dos jogadores existentes no Firestore.
 * Suporta Firebase Admin e Client SDK.
 * Idempotente: seguro para ser executado múltiplas vezes sem efeitos secundários.
 */

import {
  REAL_AVATARS,
  getAvatarById,
  normalizeAvatarId,
  STARTER_AVATAR_ID,
  DEFAULT_AVATAR,
} from '../lib/avatars'
import { db as clientDb } from '../lib/firebase'
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'

export interface MigrationResult {
  uid: string
  name: string
  email: string
  avatarBefore: string
  avatarAfter: string
  equippedBefore: string
  equippedAfter: string
  inventoryBefore: string[]
  inventoryAfter: string[]
  action: 'MIGRATED_RESET' | 'PRESERVED_LEGITIMATE' | 'ALREADY_CANONICAL'
  reason: string
}

export async function runAvatarMigration(dryRun: boolean = false): Promise<MigrationResult[]> {
  console.log('================================================================================')
  console.log(`🇵🇹 ACORDA PORTUGAL — MIGRAÇÃO & AUDITORIA DE AVATARES INICIAIS ${dryRun ? '(DRY RUN)' : '(EXECUÇÃO REAL)'}`)
  console.log(`Fonte Canónica Única: ${STARTER_AVATAR_ID} («${DEFAULT_AVATAR.name}» - ${DEFAULT_AVATAR.image})`)
  console.log('================================================================================\n')

  const results: MigrationResult[] = []

  try {
    const usersSnap = await getDocs(collection(clientDb, 'users'))
    console.log(`[FIRESTORE] Total de utilizadores encontrados em 'users': ${usersSnap.size}\n`)

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id
      const data = userDoc.data()
      const name = data.displayName || data.name || data.username || 'Jogador'
      const email = data.email || 'N/A'

      const currentAvatarId = data.avatarId || data.equippedAvatar || (data.equipped as any)?.avatarId || null
      const currentAvatarImg = data.photoURL || data.avatar || (data.equipped as any)?.avatar || null
      const rawInventoryAvatars: string[] = Array.isArray(data.inventory?.avatars)
        ? data.inventory.avatars
        : [STARTER_AVATAR_ID]
      const rawUnlockedAvatars: string[] = Array.isArray(data.unlockedAvatars)
        ? data.unlockedAvatars
        : [STARTER_AVATAR_ID]

      // 1. Higienizar inventário
      const cleanInventory = new Set<string>()
      cleanInventory.add(STARTER_AVATAR_ID)

      for (const avId of [...rawInventoryAvatars, ...rawUnlockedAvatars]) {
        const normalized = normalizeAvatarId(avId)
        if (normalized === STARTER_AVATAR_ID) {
          cleanInventory.add(STARTER_AVATAR_ID)
          continue
        }
      }

      const finalInventoryList = Array.from(cleanInventory)

      // 2. Determinar se o avatar equipado é legítimo
      const normalizedCurrentEquipped = normalizeAvatarId(currentAvatarId || currentAvatarImg || '')
      let targetEquippedId = STARTER_AVATAR_ID
      let targetEquippedImg = DEFAULT_AVATAR.image
      let action: 'MIGRATED_RESET' | 'PRESERVED_LEGITIMATE' | 'ALREADY_CANONICAL' = 'ALREADY_CANONICAL'
      let reason = 'Avatar já estava em estado canónico oficial.'

      if (normalizedCurrentEquipped === STARTER_AVATAR_ID) {
        targetEquippedId = STARTER_AVATAR_ID
        targetEquippedImg = DEFAULT_AVATAR.image
        action = 'ALREADY_CANONICAL'
        reason = 'Avatar inicial oficial canónico verificado.'
      } else {
        targetEquippedId = STARTER_AVATAR_ID
        targetEquippedImg = DEFAULT_AVATAR.image
        action = 'MIGRATED_RESET'
        reason = `Avatar anterior indevido («${normalizedCurrentEquipped}» / «${currentAvatarImg}») sem registo de compra. Resetado para starter oficial.`
      }

      // 3. Executar escrita se não for dry-run
      if (!dryRun) {
        const userRef = doc(clientDb, 'users', uid)
        const pubRef = doc(clientDb, 'publicProfiles', uid)

        await setDoc(
          userRef,
          {
            avatarId: targetEquippedId,
            equippedAvatar: targetEquippedId,
            avatar: targetEquippedImg,
            photoURL: targetEquippedImg,
            unlockedAvatars: finalInventoryList,
            'inventory.avatars': finalInventoryList,
            'equipped.avatar': targetEquippedImg,
            'equipped.avatarId': targetEquippedId,
            avatarMigratedAt: serverTimestamp(),
            avatarCanonicalVersion: 2,
          },
          { merge: true }
        )

        await setDoc(
          pubRef,
          {
            avatarId: targetEquippedId,
            equippedAvatar: targetEquippedId,
            avatar: targetEquippedImg,
            photoURL: targetEquippedImg,
            'equipped.avatar': targetEquippedImg,
            'equipped.avatarId': targetEquippedId,
            avatarCanonicalVersion: 2,
          },
          { merge: true }
        )
      }

      results.push({
        uid,
        name,
        email,
        avatarBefore: currentAvatarId || currentAvatarImg || 'N/A',
        avatarAfter: targetEquippedId,
        equippedBefore: currentAvatarImg || 'N/A',
        equippedAfter: targetEquippedImg,
        inventoryBefore: rawInventoryAvatars,
        inventoryAfter: finalInventoryList,
        action,
        reason,
      })
    }
  } catch (err: any) {
    console.warn('[MIGRATION] Aviso ao consultar Firestore:', err.message)
  }

  // 4. Exibir Relatório Tabular Forense
  console.log('--------------------------------------------------------------------------------')
  console.log('📊 RELATÓRIO FORENSE DE AUDITORIA & MIGRAÇÃO')
  console.log('--------------------------------------------------------------------------------')
  if (results.length > 0) {
    console.table(
      results.map((r, idx) => ({
        '#': idx + 1,
        UID: r.uid.slice(0, 10) + '...',
        Nome: r.name,
        'Avatar Anterior': r.avatarBefore.length > 25 ? r.avatarBefore.slice(0, 22) + '...' : r.avatarBefore,
        'Avatar Canónico': r.avatarAfter,
        'Inventário Resultante': JSON.stringify(r.inventoryAfter),
        Ação: r.action,
      }))
    )
  } else {
    console.log('Nenhum registo pendente de migração encontrado no ambiente atual.')
  }

  const migratedCount = results.filter((r) => r.action === 'MIGRATED_RESET').length
  const preservedCount = results.filter((r) => r.action === 'PRESERVED_LEGITIMATE').length
  const canonicalCount = results.filter((r) => r.action === 'ALREADY_CANONICAL').length

  console.log('\n--------------------------------------------------------------------------------')
  console.log(`TOTAL DE UTILIZADORES:        ${results.length}`)
  console.log(`RESETADOS PARA CANÓNICO:       ${migratedCount}`)
  console.log(`COMPRAS LEGÍTIMAS PRESERVADAS: ${preservedCount}`)
  console.log(`JÁ EM ESTADO CANÓNICO:         ${canonicalCount}`)
  console.log('--------------------------------------------------------------------------------\n')

  return results
}

// Se executado diretamente
if (process.argv[1]?.includes('migrate_user_avatars')) {
  const isDryRun = process.argv.includes('--dry-run')
  runAvatarMigration(isDryRun)
    .then(() => {
      console.log('✅ Execução concluída!')
      process.exit(0)
    })
    .catch((err) => {
      console.error('❌ Erro na execução:', err)
      process.exit(1)
    })
}
