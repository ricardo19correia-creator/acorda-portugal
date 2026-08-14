import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDMARrDXtL6-AamKwLSXyu34iIZ6KuR-WM',
  authDomain: 'desafio-nacional-site-oficial.firebaseapp.com',
  projectId: 'desafio-nacional-site-oficial',
  storageBucket: 'desafio-nacional-site-oficial.firebasestorage.app',
  messagingSenderId: '789316383907',
  appId: '1:789316383907:web:3b597f5edafd2cd1f73b16',
}

// Reuse the existing app during Fast Refresh instead of passing an undefined
// value to Auth/Firestore when Firebase has already been initialized.
const app = getApps()[0] ?? initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
