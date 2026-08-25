import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// Configuração oficial do projeto Firebase "desafio-nacional-5fe71"
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAitsm_neLuW95B5spzFIyjzhJWUeF3FzE",
  authDomain: "acordaportugal.pt",
  projectId: "desafio-nacional-5fe71",
  storageBucket: "desafio-nacional-5fe71.firebasestorage.app",
  messagingSenderId: "130539395859",
  appId: "1:130539395859:web:e3b8153477ae41d6fe98e6",
}

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "acordaportugal.pt",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
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




