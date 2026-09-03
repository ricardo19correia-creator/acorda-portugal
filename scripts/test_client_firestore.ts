import { db } from '../lib/firebase'
import { doc, getDoc, runTransaction } from 'firebase/firestore'

async function testClientFirestore() {
  console.log('Testing client firestore connection...')
  try {
    const testDocRef = doc(db, 'users', 'non_existent_test_user')
    const snap = await getDoc(testDocRef)
    console.log('getDoc success! Document exists:', snap.exists())
    return true
  } catch (err: any) {
    console.error('Client Firestore getDoc error:', err)
    return false
  }
}

testClientFirestore()
  .then((ok) => {
    console.log('Result:', ok)
    process.exit(0)
  })
  .catch((err) => {
    console.error('Fatal:', err)
    process.exit(1)
  })
