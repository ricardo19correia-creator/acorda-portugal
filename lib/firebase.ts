import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDMARrDXtL6-AamKwLSXyu34iIZ6KuR-WM',
  authDomain: 'desafio-nacional-5fe71.firebaseapp.com',
  projectId: 'desafio-nacional-5fe71',
  storageBucket: 'desafio-nacional-5fe71.appspot.com',
  messagingSenderId: '789316383907',
  appId: '1:789316383907:web:3b597f5edafd2cd1f73b16',
}

const app = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)