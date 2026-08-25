import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAitsm_neLuW95B5spzFIyjzhJWUeF3FzE",
  authDomain: "desafio-nacional-5fe71.firebaseapp.com",
  projectId: "desafio-nacional-5fe71",
  storageBucket: "desafio-nacional-5fe71.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "130539395859",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:130539395859:web:e3b8153477ae41d6fe98e6",
}

export const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp()
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export default app
