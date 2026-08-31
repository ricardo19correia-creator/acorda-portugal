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

        const token = parsed.searchParams.get('token')

        if (!token || !token.trim()) {
          console.warn(`[DEEP LINK - ${source}] Nenhum token encontrado no URL:`, urlStr)
          return
        }

        const cleanToken = token.trim()

        // Evitar processar o mesmo token repetidamente em ciclo
        if (processedTokensRef.current.has(cleanToken)) {
          console.log(`[DEEP LINK - ${source}] Token já processado anteriormente.`)
          return
        }

        processedTokensRef.current.add(cleanToken)

        if (!auth) {
          console.error(`[DEEP LINK - ${source}] Firebase Auth não está inicializado.`)
          return
        }

        console.log(`[DEEP LINK - ${source}] A autenticar no Firebase com o token recebido...`)
        let loggedUser = null
        try {
          const userCred = await signInWithCustomToken(auth, cleanToken)
          loggedUser = userCred?.user
        } catch (customErr: any) {
          console.warn(`[DEEP LINK - ${source}] signInWithCustomToken falhou (${customErr?.code || customErr?.message}), a tentar via GoogleAuthProvider credential...`)
          try {
            const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth')
            const credential = GoogleAuthProvider.credential(cleanToken)
            const userCred = await signInWithCredential(auth, credential)
            loggedUser = userCred?.user
          } catch (credErr) {
            console.error(`[DEEP LINK - ${source}] Erro final ao autenticar com credential:`, credErr)
          }
        }

        const activeUser = loggedUser || auth.currentUser
        if (activeUser) {
          console.log(`[DEEP LINK - ${source}] Autenticação confirmada para UID:`, activeUser.uid)
          const { registerUserSession } = await import('@/lib/session-manager')
          await registerUserSession(activeUser)
          const target = parsed.searchParams.get('target') || '/jogar'
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
        const handle = await App.addListener('appUrlOpen', async (event) => {
          console.log('[DEEP LINK - RESUME] Evento appUrlOpen recebido:', event.url)
          await processDeepLinkUrl(event.url, 'APP_URL_OPEN')
        })

        removeListener = () => {
          handle.remove()
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
