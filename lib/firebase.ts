import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'COLOCA_AQUI_A_API_KEY',
  authDomain: 'COLOCA_AQUI_O_AUTH_DOMAIN',
  projectId: 'COLOCA_AQUI_O_PROJECT_ID',
  storageBucket: 'COLOCA_AQUI_O_STORAGE_BUCKET',
  messagingSenderId: 'COLOCA_AQUI_O_MESSAGING_SENDER_ID',
  appId: 'COLOCA_AQUI_O_APP_ID',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()