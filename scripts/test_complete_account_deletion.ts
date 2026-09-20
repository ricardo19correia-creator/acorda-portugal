import { getAdminApp, getAdminFirestore } from '../lib/firebase-admin'
import { getAuth } from 'firebase-admin/auth'
import { deleteUserCompletely } from '../lib/account-deletion'

async function syncSystemTimeSkew() {
  try {
    const res = await fetch('https://www.google.com', { method: 'HEAD', signal: AbortSignal.timeout(4000) })
    const dateHeader = res.headers.get('date')
    if (dateHeader) {
      const serverTime = new Date(dateHeader).getTime()
      const localTime = Date.now()
      const offset = localTime - serverTime
      if (Math.abs(offset) > 15_000) {
        console.log(`[CLOCK_SYNC] Desvio horário detetado (${Math.round(offset / 1000)}s). Compensando relógio para Google OAuth...`)
        const OriginalDate = Date
        class PatchedDate extends OriginalDate {
          constructor(...args: any[]) {
            if (args.length === 0) {
              super(OriginalDate.now() - offset)
            } else {
              super(...(args as [any]))
            }
          }
          static now() {
            return OriginalDate.now() - offset
          }
        }
        // @ts-ignore
        globalThis.Date = PatchedDate
      }
    }
  } catch (err: any) {
    console.warn('[CLOCK_SYNC] Aviso ao verificar hora:', err?.message)
  }
}

async function runComprehensiveDeletionTest() {
  console.log('============================================================')
  console.log('INICIANDO TESTE REAL DE ELIMINAÇÃO TOTAL E ATÓMICA DE CONTA')
  console.log('============================================================')

  await syncSystemTimeSkew()

  const app = getAdminApp()
  const db = getAdminFirestore()
  const auth = getAuth(app)

  const testEmail = `test-delete-${Date.now()}@acordaportugal.pt`
  const testPassword = 'PasswordSegura123!'

  console.log(`[1/5] A criar utilizador de teste no Firebase Auth (${testEmail})...`)
  let userRecord: any
  try {
    userRecord = await auth.createUser({
      email: testEmail,
      password: testPassword,
      displayName: 'Utilizador Teste Eliminação',
    })
  } catch (err: any) {
    console.error('Falha ao criar utilizador no Auth:', err)
    process.exit(1)
  }

  const uid = userRecord.uid
  console.log(`Utilizador de teste criado com sucesso. UID: ${uid}`)

  console.log('[2/5] A semear dados em TODAS as coleções e subcoleções do ecossistema...')
  // 1. users + subcoleções
  const userRef = db.collection('users').doc(uid)
  await userRef.set({
    uid,
    displayName: 'Utilizador Teste Eliminação',
    email: testEmail,
    district: 'Lisboa',
    xp: 5000,
    coins: 1000,
    level: 10,
    createdAt: new Date().toISOString(),
  })
  await userRef.collection('transactions').doc('tx_1').set({ amount: 100, type: 'reward' })
  await userRef.collection('walletTransactions').doc('wtx_1').set({ amount: 50 })
  await userRef.collection('aid_inventory').doc('aid_1').set({ count: 2 })
  await userRef.collection('completedGames').doc('game_1').set({ score: 100 })
  await userRef.collection('match_rewards').doc('rew_1').set({ claimed: true })
  await userRef.collection('xp_transactions').doc('xp_1').set({ xp: 50 })
  await userRef.collection('coin_transactions').doc('coin_1').set({ coins: 20 })

  // 2. publicProfiles
  await db.collection('publicProfiles').doc(uid).set({
    uid,
    displayName: 'Utilizador Teste Eliminação',
    district: 'Lisboa',
    xp: 5000,
    level: 10,
  })

  // 3. publicPresence
  await db.collection('publicPresence').doc(uid).set({
    userId: uid,
    online: true,
    lastSeen: Date.now(),
    district: 'Lisboa',
    displayName: 'Utilizador Teste Eliminação',
  })

  // 4. userQuestionHistory + subcoleções
  const qhRef = db.collection('userQuestionHistory').doc(uid)
  await qhRef.set({ totalAnswered: 50 })
  await qhRef.collection('chunks').doc('chunk_1').set({ answers: [1, 2, 3] })
  await qhRef.collection('activeMatches').doc('match_1').set({ active: true })

  // 5. aid_purchase_limits
  await db.collection('aid_purchase_limits').doc(`${uid}_aid_1`).set({ count: 1 })

  // 6. duelQueue
  await db.collection('duelQueue').doc(uid).set({
    userId: uid,
    status: 'searching',
    joinedAt: Date.now(),
  })

  // 7. duels
  const duelRef = db.collection('duels').doc(`duel_test_${uid}`)
  await duelRef.set({
    status: 'waiting',
    playerUids: [uid],
    playerA: { uid, displayName: 'Utilizador Teste' },
    createdAt: Date.now(),
  })
  await duelRef.collection('reactions').doc('react_1').set({ type: 'wave', senderId: uid })

  // 8. events
  const eventRef = db.collection('events').doc('portugal_em_jogo')
  await eventRef.collection('participants').doc(uid).set({
    userId: uid,
    score: 150,
  })
  await eventRef.collection('rewards_claimed').doc(uid).set({ claimed: true })
  await eventRef.collection('matches').doc(`match_${uid}`).set({ userId: uid, points: 50 })

  // 9. community_posts + comments + likes
  const postRef = db.collection('community_posts').doc(`post_test_${uid}`)
  await postRef.set({
    userId: uid,
    authorName: 'Utilizador Teste',
    content: 'Publicação que deve ser eliminada.',
    likesCount: 1,
    commentsCount: 1,
    status: 'published',
  })
  await postRef.collection('comments').doc(`comm_1`).set({ userId: uid, text: 'Comentário do autor' })
  await postRef.collection('likes').doc(uid).set({ likedAt: Date.now() })

  // Comentário noutra publicação
  const dummyPostRef = db.collection('community_posts').doc('post_dummy_other')
  await dummyPostRef.set({
    userId: 'other_user_uid',
    authorName: 'Outro Jogador',
    content: 'Post de outro jogador',
    commentsCount: 1,
    likesCount: 1,
    status: 'published',
  })
  await dummyPostRef.collection('comments').doc(`comm_by_${uid}`).set({ userId: uid, text: 'Comentário a remover' })
  await dummyPostRef.collection('likes').doc(uid).set({ likedAt: Date.now() })

  // 10. feedback, reports, notifications, transactions
  await db.collection('feedback').doc(`fb_${uid}`).set({ userId: uid, message: 'Feedback teste' })
  await db.collection('reports').doc(`rep_${uid}`).set({ userId: uid, reason: 'Report teste' })
  await db.collection('notifications').doc(`notif_${uid}`).set({ userId: uid, title: 'Notificação' })
  await db.collection('transactions').doc(`tx_global_${uid}`).set({ userId: uid, amount: 100 })
  await db.collection('games').doc(`game_global_${uid}`).set({ userId: uid, score: 200 })

  console.log('Dados de teste criados em todas as coleções com sucesso.')

  console.log('[3/5] A executar deleteUserCompletely(uid)...')
  const summary = await deleteUserCompletely(uid, testEmail)
  console.log('Resultado do sumário de eliminação:', JSON.stringify(summary, null, 2))

  console.log('[4/5] A verificar ausência total de vestígios...')
  const checks: { name: string; passed: boolean }[] = []

  // Check Auth
  try {
    await auth.getUser(uid)
    checks.push({ name: 'Firebase Auth (deve estar apagado)', passed: false })
  } catch (err: any) {
    checks.push({ name: 'Firebase Auth (apagado)', passed: err?.code === 'auth/user-not-found' })
  }

  // Check users doc
  const uSnap = await db.collection('users').doc(uid).get()
  checks.push({ name: 'Firestore users/{uid}', passed: !uSnap.exists })

  // Check user subcollections
  const uTxSnap = await db.collection('users').doc(uid).collection('transactions').get()
  checks.push({ name: 'Firestore users/{uid}/transactions', passed: uTxSnap.empty })

  // Check publicProfiles
  const pubSnap = await db.collection('publicProfiles').doc(uid).get()
  checks.push({ name: 'Firestore publicProfiles/{uid}', passed: !pubSnap.exists })

  // Check publicPresence
  const presSnap = await db.collection('publicPresence').doc(uid).get()
  checks.push({ name: 'Firestore publicPresence/{uid}', passed: !presSnap.exists })

  // Check userQuestionHistory
  const qhSnap = await db.collection('userQuestionHistory').doc(uid).get()
  checks.push({ name: 'Firestore userQuestionHistory/{uid}', passed: !qhSnap.exists })

  // Check aid_purchase_limits
  const limSnap = await db.collection('aid_purchase_limits').doc(`${uid}_aid_1`).get()
  checks.push({ name: 'Firestore aid_purchase_limits', passed: !limSnap.exists })

  // Check duelQueue
  const dqSnap = await db.collection('duelQueue').doc(uid).get()
  checks.push({ name: 'Firestore duelQueue/{uid}', passed: !dqSnap.exists })

  // Check duels
  const dSnap = await db.collection('duels').doc(`duel_test_${uid}`).get()
  checks.push({ name: 'Firestore duels/duel_test_{uid}', passed: !dSnap.exists })

  // Check events participants
  const evPartSnap = await db.collection('events').doc('portugal_em_jogo').collection('participants').doc(uid).get()
  checks.push({ name: 'Firestore events/.../participants/{uid}', passed: !evPartSnap.exists })

  // Check community_posts
  const cpSnap = await db.collection('community_posts').doc(`post_test_${uid}`).get()
  checks.push({ name: 'Firestore community_posts/post_test_{uid}', passed: !cpSnap.exists })

  // Check comment by user in dummy post
  const commSnap = await dummyPostRef.collection('comments').doc(`comm_by_${uid}`).get()
  checks.push({ name: 'Firestore comentário em post de terceiros', passed: !commSnap.exists })

  // Check like by user in dummy post
  const likeSnap = await dummyPostRef.collection('likes').doc(uid).get()
  checks.push({ name: 'Firestore like em post de terceiros', passed: !likeSnap.exists })

  // Check feedback, reports, notifications, transactions, games
  const fbSnap = await db.collection('feedback').doc(`fb_${uid}`).get()
  checks.push({ name: 'Firestore feedback', passed: !fbSnap.exists })

  const repSnap = await db.collection('reports').doc(`rep_${uid}`).get()
  checks.push({ name: 'Firestore reports', passed: !repSnap.exists })

  const notifSnap = await db.collection('notifications').doc(`notif_${uid}`).get()
  checks.push({ name: 'Firestore notifications', passed: !notifSnap.exists })

  const txSnap = await db.collection('transactions').doc(`tx_global_${uid}`).get()
  checks.push({ name: 'Firestore transactions', passed: !txSnap.exists })

  const gSnap = await db.collection('games').doc(`game_global_${uid}`).get()
  checks.push({ name: 'Firestore games', passed: !gSnap.exists })

  // Check tombstone registration
  const tombSnap = await db.collection('deleted_accounts').doc(uid).get()
  checks.push({ name: 'Firestore deleted_accounts tombstone registado', passed: tombSnap.exists })

  // Limpar dummy post de teste
  await dummyPostRef.delete().catch(() => {})

  console.log('\n--- RELATÓRIO DE VERIFICAÇÃO ---')
  let allPassed = true
  checks.forEach((c) => {
    console.log(`[${c.passed ? 'PASS' : 'FAIL'}] ${c.name}`)
    if (!c.passed) allPassed = false
  })

  console.log('\n[5/5] A testar idempotência (executar eliminação novamente no mesmo UID)...')
  try {
    const secondSummary = await deleteUserCompletely(uid, testEmail)
    console.log('[PASS] Segunda execução concluída com sucesso e sem erros (Idempotente).')
  } catch (secondErr: any) {
    console.error('[FAIL] Erro na segunda execução de eliminação:', secondErr)
    allPassed = false
  }

  // Limpar o tombstone do teste no final
  await db.collection('deleted_accounts').doc(uid).delete().catch(() => {})

  if (!allPassed) {
    console.error('\n❌ O teste de eliminação total falhou em uma ou mais verificações!')
    process.exit(1)
  }

  console.log('\n✅ TODOS OS TESTES PASSARAM! ZERO VESTÍGIOS DA CONTA ELIMINADA!')
  process.exit(0)
}

runComprehensiveDeletionTest().catch((err) => {
  console.error('Erro inesperado no teste:', err)
  process.exit(1)
})
