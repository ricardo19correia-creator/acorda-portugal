'use client'

import { useEffect, useRef } from 'react'
import { signInWithCustomToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export default function DeepLinkHandler() {
  const router = useRouter()
  const processedTokensRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    let removeListener: (() => void) | undefined

    const processDeepLinkUrl = async (urlStr: string | null | undefined, source: string) => {
      if (!urlStr || typeof urlStr !== 'string') return

      console.log(`[DEEP LINK - ${source}] A processar URL:`, urlStr)

      try {
        if (!urlStr.includes('auth-callback') && !urlStr.startsWith('acordaportugal://')) {
          return
        }

        const normalizedUrl = urlStr.replace(/^acordaportugal:\/\//i, 'https://auth-callback.local/')
        const parsed = new URL(normalizedUrl)

        const isAuthCallback =
          parsed.hostname === 'auth-callback.local' ||
          parsed.hostname === 'auth-callback' ||
          parsed.pathname.includes('auth-callback')

        if (!isAuthCallback) {
          console.warn(`[DEEP LINK - ${source}] Host/Path não corresponde a auth-callback:`, urlStr)
          return
        }

        const type = parsed.searchParams.get('type') || (parsed.searchParams.has('idToken') ? 'google_credential' : 'custom_token')
        const token = parsed.searchParams.get('token')
        const idToken = parsed.searchParams.get('idToken')
        const accessToken = parsed.searchParams.get('accessToken')
        const target = parsed.searchParams.get('target') || '/jogar'

        const uniqueKey = token || idToken
        if (!uniqueKey || !uniqueKey.trim()) {
          console.warn(`[DEEP LINK - ${source}] Nenhum token encontrado no URL:`, urlStr)
          return
        }

        const cleanKey = uniqueKey.trim()
        if (processedTokensRef.current.has(cleanKey)) {
          console.log(`[DEEP LINK - ${source}] Token já processado anteriormente.`)
          return
        }
        processedTokensRef.current.add(cleanKey)

        if (!auth) {
          console.error(`[DEEP LINK - ${source}] Firebase Auth não está inicializado.`)
          return
        }

        let loggedUser = null
        if (type === 'custom_token' && token) {
          console.log(`[DEEP LINK - ${source}] A executar signInWithCustomToken com Custom Token...`)
          try {
            const userCred = await signInWithCustomToken(auth, token.trim())
            loggedUser = userCred?.user
          } catch (customErr: any) {
            console.error(`[DEEP LINK - ${source}] Erro ao autenticar com Custom Token:`, customErr)
          }
        } else if ((type === 'google_credential' || idToken) && (idToken || token)) {
          const rawIdToken = (idToken || token)!.trim()
          console.log(`[DEEP LINK - ${source}] A executar GoogleAuthProvider.credential + signInWithCredential...`)
          try {
            const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth')
            const credential = GoogleAuthProvider.credential(rawIdToken, accessToken ? accessToken.trim() : undefined)
            const userCred = await signInWithCredential(auth, credential)
            loggedUser = userCred?.user
          } catch (credErr: any) {
            console.error(`[DEEP LINK - ${source}] Erro ao autenticar com Google Credential:`, credErr)
          }
        }

        const activeUser = loggedUser || auth.currentUser
        if (activeUser) {
          console.log(`[DEEP LINK - ${source}] Autenticação confirmada para UID:`, activeUser.uid)
          const { registerUserSession } = await import('@/lib/session-manager')
          await registerUserSession(activeUser)
          router.push(target)
        }
      } catch (err: any) {
        console.error(`[DEEP LINK - ${source}] Erro ao processar autenticação via deep link:`, err)
      }
    }

    const initCapacitorAppListener = async () => {
      try {
        const { App } = await import('@capacitor/app')

        // 1. Tratar URL inicial de lançamento do APK (Cold Start / Resume)
        try {
          const launchUrlData = await App.getLaunchUrl()
          if (launchUrlData?.url) {
            console.log('[DEEP LINK - COLD START] Launch URL detectado:', launchUrlData.url)
            await processDeepLinkUrl(launchUrlData.url, 'LAUNCH_URL')
          }
        } catch (launchErr) {
          console.warn('[DEEP LINK] Não foi possível obter getLaunchUrl:', launchErr)
        }

        // 2. Tratar eventos de abertura de URL enquanto a aplicação está ativa / em background
        const urlHandle = await App.addListener('appUrlOpen', async (event) => {
          console.log('[DEEP LINK - RESUME] Evento appUrlOpen recebido:', event.url)
          await processDeepLinkUrl(event.url, 'APP_URL_OPEN')
        })

        // 3. Tratar botão físico / gestual de voltar (Android Back Button)
        const backHandle = await App.addListener('backButton', ({ canGoBack }) => {
          if (typeof window !== 'undefined') {
            const path = window.location.pathname
            if (path === '/' || path === '') {
              App.minimizeApp().catch(() => App.exitApp())
            } else {
              if (window.history.length > 1) {
                window.history.back()
              } else {
                router.push('/')
              }
            }
          }
        })

        removeListener = () => {
          urlHandle.remove()
          backHandle.remove()
        }
      } catch (err) {
        // Não está em ambiente Capacitor ou plugin indisponível
      }
    }

    initCapacitorAppListener()

    return () => {
      if (removeListener) removeListener()
    }
  }, [router])

  return null
}
