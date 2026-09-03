import { db } from '../lib/firebase'
import { doc, getDoc, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore'

async function testTransaction() {
  console.log('Testing runTransaction with lib/firebase...')
  const testRef = doc(db, 'system_test', 'transaction_test_doc')
  try {
    const res = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(testRef)
      const prev = snap.exists() ? snap.data().counter || 0 : 0
      transaction.set(testRef, {
        counter: prev + 1,
        updatedAt: serverTimestamp(),
      })
      return prev + 1
    })
    console.log('Transaction succeeded! Counter is now:', res)
    return true
  } catch (err: any) {
    console.error('runTransaction failed:', err)
    return false
  }
}

testTransaction()
  .then((ok) => {
    console.log('Test result:', ok)
    process.exit(0)
  })
  .catch((e) => {
    console.error('Fatal:', e)
    process.exit(1)
  })
