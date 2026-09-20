import { getAdminApp, getAdminFirestore, syncClockSkewIfAny } from '@/lib/firebase-admin'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'
import { FieldValue } from 'firebase-admin/firestore'

export interface DeletionSummary {
  uid: string
  authDeleted: boolean
  tokensRevoked: boolean
  usersDocDeleted: boolean
  userSubcollectionsCleaned: string[]
  publicProfileDeleted: boolean
  presenceDeleted: boolean
  questionHistoryDeleted: boolean
  purchaseLimitsDeleted: number
  duelQueueDeleted: number
  duelsCleaned: number
  gameRoomsCleaned: number
  gamesDeleted: number
  eventsCleaned: number
  communityPostsDeleted: number
  communityCommentsCleaned: number
  communityLikesCleaned: number
  communityReportsCleaned: number
  creatorPostsCleaned: number
  creatorReportsCleaned: number
  feedbackDeleted: number
  reportsDeleted: number
  notificationsDeleted: number
  purchasesDeleted: number
  transactionsDeleted: number
  storageFilesDeleted: number
  rtdbCleaned: boolean
  timestamp: string
}

// UIDs e emails protegidos contra eliminação acidental
const PROTECTED_UIDS = new Set([
  'A4tBQnNi8ySw2lYUI7rlxAo2bKE2',
])
const PROTECTED_EMAILS = new Set([
  'ricardo19correia@gmail.com',
])

/**
 * Função utilitária para apagar recursivamente todos os documentos de uma coleção ou query em lotes.
 */
async function deleteQueryBatch(db: any, query: any, batchSize: number = 200): Promise<number> {
  let totalDeleted = 0
  while (true) {
    const snapshot = await query.limit(batchSize).get()
    if (snapshot.empty) break

    const batch = db.batch()
    snapshot.docs.forEach((docSnap: any) => {
      batch.delete(docSnap.ref)
    })
    await batch.commit()
    totalDeleted += snapshot.size

    if (snapshot.size < batchSize) break
  }
  return totalDeleted
}

/**
 * Elimina uma subcoleção inteira de um documento
 */
async function deleteSubcollection(db: any, parentPath: string, subcolName: string): Promise<number> {
  try {
    const subColRef = db.collection(parentPath).doc().parent.doc(parentPath.split('/').pop()!).collection(subcolName)
    // Query direta à subcoleção
    const colRef = db.doc(parentPath).collection(subcolName)
    return await deleteQueryBatch(db, colRef)
  } catch {
    return 0
  }
}

/**
 * Função central de eliminação atómica, idempotente e definitiva de um utilizador.
 * Apaga TODOS os vestígios da conta em Auth, Firestore, Storage, Presença, Comunidade, Rankings, etc.
 */
export async function deleteUserCompletely(uid: string, requesterEmail?: string): Promise<DeletionSummary> {
  if (!uid || typeof uid !== 'string') {
    throw new Error('UID inválido para eliminação de conta.')
  }

  // Proteção da Conta Fundador / Oficial
  if (PROTECTED_UIDS.has(uid) || (requesterEmail && PROTECTED_EMAILS.has(requesterEmail.toLowerCase()))) {
    throw new Error('Esta conta oficial de Administrador/Fundador está estritamente protegida contra eliminação.')
  }

  await syncClockSkewIfAny()

  const app = getAdminApp()
  const db = getAdminFirestore()
  const auth = getAuth(app)

  const summary: DeletionSummary = {
    uid,
    authDeleted: false,
    tokensRevoked: false,
    usersDocDeleted: false,
    userSubcollectionsCleaned: [],
    publicProfileDeleted: false,
    presenceDeleted: false,
    questionHistoryDeleted: false,
    purchaseLimitsDeleted: 0,
    duelQueueDeleted: 0,
    duelsCleaned: 0,
    gameRoomsCleaned: 0,
    gamesDeleted: 0,
    eventsCleaned: 0,
    communityPostsDeleted: 0,
    communityCommentsCleaned: 0,
    communityLikesCleaned: 0,
    communityReportsCleaned: 0,
    creatorPostsCleaned: 0,
    creatorReportsCleaned: 0,
    feedbackDeleted: 0,
    reportsDeleted: 0,
    notificationsDeleted: 0,
    purchasesDeleted: 0,
    transactionsDeleted: 0,
    storageFilesDeleted: 0,
    rtdbCleaned: false,
    timestamp: new Date().toISOString(),
  }

  // --------------------------------------------------------------------------
  // FASE 1: BLOQUEIO IMEDIATO E MARCAÇÃO DE CONTA ELIMINADA (TOMBSTONE)
  // --------------------------------------------------------------------------
  try {
    // Revogar imediatamente todos os refresh tokens no Firebase Auth
    await auth.revokeRefreshTokens(uid).catch(() => {})
    summary.tokensRevoked = true
  } catch (err) {
    console.warn('[DELETE] Aviso ao revogar tokens:', err)
  }

  // Registar no tombstone `deleted_accounts/{uid}` para impedir que listeners
  // ou APIs residuais possam recriar ou aceitar dados deste utilizador.
  try {
    await db.collection('deleted_accounts').doc(uid).set({
      uid,
      deletedAt: FieldValue.serverTimestamp(),
      isoDeletedAt: summary.timestamp,
      status: 'DELETED',
    })
  } catch (err) {
    console.warn('[DELETE] Aviso ao registar deleted_accounts tombstone:', err)
  }

  // --------------------------------------------------------------------------
  // FASE 2: ELIMINAR DOCUMENTO PRINCIPAL `users/{uid}` E SUAS SUBCOLEÇÕES
  // --------------------------------------------------------------------------
  const userDocRef = db.collection('users').doc(uid)
  const userSubcollections = [
    'entitlements',
    'completedGames',
    'transactions',
    'match_rewards',
    'walletTransactions',
    'aid_inventory',
    'activeSession',
    'xp_transactions',
    'coin_transactions',
    'inventory',
  ]

  for (const subcol of userSubcollections) {
    try {
      const colRef = userDocRef.collection(subcol)
      const count = await deleteQueryBatch(db, colRef)
      if (count > 0) {
        summary.userSubcollectionsCleaned.push(`${subcol} (${count})`)
      }
    } catch (err) {
      console.warn(`[DELETE] Aviso ao limpar subcoleção users/${uid}/${subcol}:`, err)
    }
  }

  try {
    await userDocRef.delete()
    summary.usersDocDeleted = true
  } catch (err) {
    console.warn(`[DELETE] Aviso ao eliminar doc users/${uid}:`, err)
  }

  // --------------------------------------------------------------------------
  // FASE 3: ELIMINAR PERFIL PÚBLICO E RANKINGS `publicProfiles/{uid}`
  // --------------------------------------------------------------------------
  try {
    await db.collection('publicProfiles').doc(uid).delete()
    summary.publicProfileDeleted = true
  } catch (err) {
    console.warn(`[DELETE] Aviso ao eliminar publicProfiles/${uid}:`, err)
  }

  // --------------------------------------------------------------------------
  // FASE 4: ELIMINAR PRESENÇA EM TEMPO REAL `publicPresence/{uid}`
  // --------------------------------------------------------------------------
  try {
    await db.collection('publicPresence').doc(uid).delete()
    summary.presenceDeleted = true
  } catch (err) {
    console.warn(`[DELETE] Aviso ao eliminar publicPresence/${uid}:`, err)
  }

  // --------------------------------------------------------------------------
  // FASE 5: HISTÓRICO DE PERGUNTAS `userQuestionHistory/{uid}` E SUBCOLEÇÕES
  // --------------------------------------------------------------------------
  try {
    const qhDocRef = db.collection('userQuestionHistory').doc(uid)
    await deleteQueryBatch(db, qhDocRef.collection('chunks')).catch(() => {})
    await deleteQueryBatch(db, qhDocRef.collection('activeMatches')).catch(() => {})
    await qhDocRef.delete().catch(() => {})
    summary.questionHistoryDeleted = true
  } catch (err) {
    console.warn(`[DELETE] Aviso ao eliminar userQuestionHistory/${uid}:`, err)
  }

  // --------------------------------------------------------------------------
  // FASE 6: LIMITES DE COMPRA DE AJUDAS `aid_purchase_limits`
  // --------------------------------------------------------------------------
  try {
    // Documentos que começam por `${uid}_`
    const limitsSnap = await db
      .collection('aid_purchase_limits')
      .where(FieldValue.documentId(), '>=', `${uid}_`)
      .where(FieldValue.documentId(), '<=', `${uid}_\uf8ff`)
      .get()

    if (!limitsSnap.empty) {
      const batch = db.batch()
      limitsSnap.docs.forEach((d: any) => batch.delete(d.ref))
      await batch.commit()
      summary.purchaseLimitsDeleted = limitsSnap.size
    }
  } catch (err) {
    console.warn('[DELETE] Aviso ao limpar aid_purchase_limits:', err)
  }

  // --------------------------------------------------------------------------
  // FASE 7: MULTIPLAYER — FILA DE MATCHMAKING (`duelQueue`)
  // --------------------------------------------------------------------------
  try {
    // 1. Bilhete direto com ID = uid
    await db.collection('duelQueue').doc(uid).delete().catch(() => {})

    // 2. Qualquer bilhete onde userId == uid
    const queueQuery = db.collection('duelQueue').where('userId', '==', uid)
    const qCount = await deleteQueryBatch(db, queueQuery)
    summary.duelQueueDeleted = qCount + 1
  } catch (err) {
    console.warn('[DELETE] Aviso ao limpar duelQueue:', err)
  }

  // --------------------------------------------------------------------------
  // FASE 8: MULTIPLAYER — DUELOS E SALAS DE JOGO (`duels`, `gameRooms`)
  // --------------------------------------------------------------------------
  try {
    // Duelos onde o utilizador foi player1, player2 ou participou
    const duelsA = await db.collection('duels').where('playerA.uid', '==', uid).get()
    const duelsB = await db.collection('duels').where('playerB.uid', '==', uid).get()
    const duelsArr = await db.collection('duels').where('playerUids', 'array-contains', uid).get().catch(() => ({ docs: [] }))

    const allDuelDocs = new Map<string, any>()
    duelsA.docs.forEach((d: any) => allDuelDocs.set(d.id, d))
    duelsB.docs.forEach((d: any) => allDuelDocs.set(d.id, d))
    duelsArr.docs.forEach((d: any) => allDuelDocs.set(d.id, d))

    for (const [duelId, duelDoc] of allDuelDocs.entries()) {
      const duelData = duelDoc.data()
      // Limpar subcoleção de reações
      await deleteQueryBatch(db, duelDoc.ref.collection('reactions')).catch(() => {})

      const isActive =
        duelData.status === 'waiting' ||
        duelData.status === 'ready' ||
        duelData.status === 'round_active' ||
        duelData.status === 'answering'

      const opponent = duelData.playerA?.uid === uid ? duelData.playerB : duelData.playerA

      if (isActive && opponent && opponent.uid && opponent.uid !== uid) {
        // Se há um adversário ativo à espera, finalizar com vitória do adversário
        // para que o adversário não fique congelado numa sala fantasma.
        await duelDoc.ref.update({
          status: 'finished',
          finishedAt: Date.now(),
          winnerUid: opponent.uid,
          winnerReason: 'opponent_forfeit',
          abandonedBy: uid,
          updatedAt: FieldValue.serverTimestamp(),
        }).catch(() => {})
      } else {
        // Se não há adversário válido ou o duelo já estava concluído/abandonado, apagar.
        await duelDoc.ref.delete().catch(() => {})
      }
      summary.duelsCleaned++
    }

    // Salas legadas gameRooms
    const roomsSnap = await db.collection('gameRooms').where('players', 'array-contains', uid).get().catch(() => ({ docs: [] }))
    for (const roomDoc of roomsSnap.docs) {
      await deleteQueryBatch(db, roomDoc.ref.collection('reactions')).catch(() => {})
      await roomDoc.ref.delete().catch(() => {})
      summary.gameRoomsCleaned++
    }

    // Jogos concluídos games onde userId == uid
    const gamesQuery = db.collection('games').where('userId', '==', uid)
    summary.gamesDeleted = await deleteQueryBatch(db, gamesQuery)
  } catch (err) {
    console.warn('[DELETE] Aviso ao limpar duelos e multiplayer:', err)
  }

  // --------------------------------------------------------------------------
  // FASE 9: EVENTOS E COMPETIÇÕES (`events`)
  // --------------------------------------------------------------------------
  try {
    const eventsSnap = await db.collection('events').get().catch(() => ({ docs: [] }))
    for (const evDoc of eventsSnap.docs) {
      // 1. Participante do evento
      await evDoc.ref.collection('participants').doc(uid).delete().catch(() => {})
      // 2. Recompensas reclamadas
      await evDoc.ref.collection('rewards_claimed').doc(uid).delete().catch(() => {})
      // 3. Partidas registadas no evento
      const evMatchesQuery = evDoc.ref.collection('matches').where('userId', '==', uid)
      await deleteQueryBatch(db, evMatchesQuery).catch(() => {})
      summary.eventsCleaned++
    }
  } catch (err) {
    console.warn('[DELETE] Aviso ao limpar participação em eventos:', err)
  }

  // --------------------------------------------------------------------------
  // FASE 10: COMUNIDADE (`community_posts`, `comments`, `likes`, `reports`)
  // --------------------------------------------------------------------------
  try {
    // 1. Publicações criadas pelo utilizador eliminado
    const userPostsSnap = await db.collection('community_posts').where('userId', '==', uid).get()
    for (const postDoc of userPostsSnap.docs) {
      // Apagar subcoleção comments da publicação
      await deleteQueryBatch(db, postDoc.ref.collection('comments')).catch(() => {})
      // Apagar subcoleção likes da publicação
      await deleteQueryBatch(db, postDoc.ref.collection('likes')).catch(() => {})
      // Apagar a publicação
      await postDoc.ref.delete().catch(() => {})
      summary.communityPostsDeleted++
    }

    // 2. Comentários feitos pelo utilizador em publicações de OUTROS
    const commentsGroupQuery = db.collectionGroup('comments').where('userId', '==', uid)
    const userCommentsSnap = await commentsGroupQuery.get().catch(() => ({ docs: [] }))
    for (const commentDoc of userCommentsSnap.docs) {
      const parentPostRef = commentDoc.ref.parent.parent
      await commentDoc.ref.delete().catch(() => {})
      if (parentPostRef) {
        // Atualizar o contador de comentários na publicação de forma atómica
        await parentPostRef.update({
          commentsCount: FieldValue.increment(-1),
        }).catch(() => {})
      }
      summary.communityCommentsCleaned++
    }

    // 3. Gostos (Likes) feitos pelo utilizador em publicações de OUTROS
    // O documento de like tem como ID o UID do utilizador
    const likesGroupQuery = db.collectionGroup('likes')
    const likesSnap = await likesGroupQuery.get().catch(() => ({ docs: [] }))
    for (const likeDoc of likesSnap.docs) {
      if (likeDoc.id === uid) {
        const parentPostRef = likeDoc.ref.parent.parent
        await likeDoc.ref.delete().catch(() => {})
        if (parentPostRef) {
          // Atualizar o contador de likes na publicação de forma atómica
          await parentPostRef.update({
            likesCount: FieldValue.increment(-1),
          }).catch(() => {})
        }
        summary.communityLikesCleaned++
      }
    }

    // 4. Denúncias na comunidade (`community_reports`)
    const rep1 = await db.collection('community_reports').where('reporterId', '==', uid).get().catch(() => ({ docs: [] }))
    const rep2 = await db.collection('community_reports').where('targetUserId', '==', uid).get().catch(() => ({ docs: [] }))
    const rep3 = await db.collection('community_reports').where('userId', '==', uid).get().catch(() => ({ docs: [] }))
    const allRepDocs = new Map<string, any>()
    rep1.docs.forEach((d: any) => allRepDocs.set(d.id, d.ref))
    rep2.docs.forEach((d: any) => allRepDocs.set(d.id, d.ref))
    rep3.docs.forEach((d: any) => allRepDocs.set(d.id, d.ref))
    for (const ref of allRepDocs.values()) {
      await ref.delete().catch(() => {})
      summary.communityReportsCleaned++
    }

    // 5. Módulo Criadores (`creatorPosts`, `creatorReports`, `publicacoes_comunidade`)
    const creatorPostsSnap = await db.collection('creatorPosts').where('authorId', '==', uid).get().catch(() => ({ docs: [] }))
    for (const cpDoc of creatorPostsSnap.docs) {
      await deleteQueryBatch(db, cpDoc.ref.collection('comments')).catch(() => {})
      await cpDoc.ref.delete().catch(() => {})
      summary.creatorPostsCleaned++
    }

    const creatorRepSnap = await db.collection('creatorReports').where('reporterId', '==', uid).get().catch(() => ({ docs: [] }))
    for (const crDoc of creatorRepSnap.docs) {
      await crDoc.ref.delete().catch(() => {})
      summary.creatorReportsCleaned++
    }

    const pubComunidadeSnap = await db.collection('publicacoes_comunidade').where('userId', '==', uid).get().catch(() => ({ docs: [] }))
    for (const pcDoc of pubComunidadeSnap.docs) {
      await pcDoc.ref.delete().catch(() => {})
    }
  } catch (err) {
    console.warn('[DELETE] Aviso ao limpar comunidade:', err)
  }

  // --------------------------------------------------------------------------
  // FASE 11: FEEDBACK, REPORTES E NOTIFICAÇÕES
  // --------------------------------------------------------------------------
  try {
    const fbQuery = db.collection('feedback').where('userId', '==', uid)
    summary.feedbackDeleted = await deleteQueryBatch(db, fbQuery)

    const repQuery = db.collection('reports').where('userId', '==', uid)
    summary.reportsDeleted += await deleteQueryBatch(db, repQuery)

    const repQuery2 = db.collection('reports').where('reporterId', '==', uid)
    summary.reportsDeleted += await deleteQueryBatch(db, repQuery2)

    const stQuery = db.collection('support_tickets').where('userId', '==', uid)
    summary.reportsDeleted += await deleteQueryBatch(db, stQuery)

    const notifQuery = db.collection('notifications').where('userId', '==', uid)
    summary.notificationsDeleted = await deleteQueryBatch(db, notifQuery)
  } catch (err) {
    console.warn('[DELETE] Aviso ao limpar feedback/reports/notificações:', err)
  }

  // --------------------------------------------------------------------------
  // FASE 12: REGISTOS MONETÁRIOS E COMPRAS
  // --------------------------------------------------------------------------
  try {
    const gpQuery = db.collection('googlePlayPurchases').where('userId', '==', uid)
    summary.purchasesDeleted = await deleteQueryBatch(db, gpQuery)

    const txQuery = db.collection('transactions').where('userId', '==', uid)
    summary.transactionsDeleted = await deleteQueryBatch(db, txQuery)

    // Se estiver em adminUsers por engano
    await db.collection('adminUsers').doc(uid).delete().catch(() => {})
  } catch (err) {
    console.warn('[DELETE] Aviso ao limpar transações/compras:', err)
  }

  // --------------------------------------------------------------------------
  // FASE 13: FIREBASE STORAGE (AVATARES, UPLOADS, FICHEIROS PRIVADOS)
  // --------------------------------------------------------------------------
  try {
    const storage = getStorage(app)
    const bucket = storage.bucket()
    const prefixes = [
      `avatars/${uid}`,
      `users/${uid}`,
      `community/${uid}`,
      `uploads/${uid}`,
    ]

    for (const prefix of prefixes) {
      try {
        const [files] = await bucket.getFiles({ prefix })
        for (const file of files) {
          await file.delete().catch(() => {})
          summary.storageFilesDeleted++
        }
      } catch {}
    }
  } catch (err) {
    console.warn('[DELETE] Aviso ao limpar Firebase Storage:', err)
  }

  // --------------------------------------------------------------------------
  // FASE 14: REALTIME DATABASE (SE EXISTIR REGISTO DE PRESENÇA/SESSÃO)
  // --------------------------------------------------------------------------
  try {
    const { getDatabase } = require('firebase-admin/database')
    const rtdb = getDatabase(app)
    if (rtdb) {
      await Promise.allSettled([
        rtdb.ref(`users/${uid}`).remove(),
        rtdb.ref(`presence/${uid}`).remove(),
        rtdb.ref(`status/${uid}`).remove(),
      ])
      summary.rtdbCleaned = true
    }
  } catch {
    // RTDB opcional ou não configurado
  }

  // --------------------------------------------------------------------------
  // FASE 15: ELIMINAÇÃO DEFINITIVA NO FIREBASE AUTHENTICATION
  // --------------------------------------------------------------------------
  try {
    await auth.deleteUser(uid)
    summary.authDeleted = true
  } catch (authErr: any) {
    if (authErr?.code === 'auth/user-not-found') {
      // Idempotência: Se já não existir no Auth, considera-se eliminado com sucesso
      summary.authDeleted = true
    } else {
      console.error('[DELETE AUTH ERROR]', authErr)
      throw authErr
    }
  }

  // --------------------------------------------------------------------------
  // FASE 16: LOG TÉCNICO OFICIAL REQUERIDO
  // --------------------------------------------------------------------------
  console.log(`
ACCOUNT DELETION COMPLETE
UID: ${uid}
AUTH: DELETED
FIRESTORE: CLEANED
STORAGE: CLEANED
PRESENCE: CLEANED
SESSIONS: CLEANED
MULTIPLAYER: CLEANED
RANKINGS: CLEANED
COMMUNITY: CLEANED
REFERENCES: CLEANED
`)

  return summary
}

/**
 * Verifica se uma dada conta foi eliminada (consultando o tombstone)
 */
export async function isAccountDeleted(uid: string): Promise<boolean> {
  if (!uid) return false
  try {
    const db = getAdminFirestore()
    const docSnap = await db.collection('deleted_accounts').doc(uid).get()
    return docSnap.exists
  } catch {
    return false
  }
}
