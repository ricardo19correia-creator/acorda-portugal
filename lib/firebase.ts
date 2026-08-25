import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// Configuração oficial do projeto Firebase "desafio-nacional-5fe71"
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAitsm_neLuW95B5spzFIyjzhJWUeF3FzE",
  authDomain: "desafio-nacional-5fe71.firebaseapp.com",
  projectId: "desafio-nacional-5fe71",
  storageBucket: "desafio-nacional-5fe71.firebasestorage.app",
  messagingSenderId: "130539395859",
  appId: "1:130539395859:web:e3b8153477ae41d6fe98e6",
}

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAitsm_neLuW95B5spzFIyjzhJWUeF3FzE",
  authDomain: "desafio-nacional-5fe71.firebaseapp.com",
  projectId: "desafio-nacional-5fe71",
  storageBucket: "desafio-nacional-5fe71.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "130539395859",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:130539395859:web:e3b8153477ae41d6fe98e6",
}

// Inicialização segura de instância única (Singleton)
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp()
  }
  return initializeApp(firebaseConfig)
}

export const app: FirebaseApp = getFirebaseApp()
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })




