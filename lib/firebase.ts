import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAitsm_neLuW95B5spzFIyjzhJWUeF3FzE',
  authDomain: 'desafio-nacional-5fe71.firebaseapp.com',
  projectId: 'desafio-nacional-5fe71',
  storageBucket: 'desafio-nacional-5fe71.firebasestorage.app',
  messagingSenderId: '130539395859',
  appId: '1:130539395859:web:e3b8153477ae41d6fe98e6',
}

const app = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
