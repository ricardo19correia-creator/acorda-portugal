import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDMARrDXtL6-AamKwLSXyu34iIZ6KuR-WM',
  authDomain: 'desafio-nacional-site-oficial.firebaseapp.com',
  projectId: 'desafio-nacional-site-oficial',
  storageBucket: 'desafio-nacional-site-oficial.firebasestorage.app',
  messagingSenderId: '789316383907',
  appId: '1:789316383907:web:3b597f5edafd2cd1f73b16',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()