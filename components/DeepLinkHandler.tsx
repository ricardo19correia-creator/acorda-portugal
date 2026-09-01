'use client'

import { useEffect } from 'react'
import { signInWithCustomToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

const globalProcessedTokens = new Set<string>()

function isTokenProcessed(tokenKey: string): boolean {
  if (globalProcessedTokens.has(tokenKey)) return true
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(`auth_deeplink_${tokenKey.substring(0, 32)}`)
      if (stored) return true
    } catch {}
  }
  return false
}

function markTokenProcessed(tokenKey: string): void {
  globalProcessedTokens.add(tokenKey)
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(`auth_deeplink_${tokenKey.substring(0, 32)}`, String(Date.now()))
    } catch {}
  }
}

export default function DeepLinkHandler() {
  const router = useRouter()

  useEffect(() => {
    let removeListener: (() => void) | undefined

    const processDeepLinkUrl = async (urlStr: string | null | undefined, source: string) => {
      if (!urlStr || typeof urlStr !== 'string') return

      const cleanUrl = urlStr.trim()
      if (!cleanUrl.includes('auth-callback') && !cleanUrl.startsWith('acordaportugal://')) {
        return
      }

      console.log(`[AUTH][DEEPLINK] URL RECEBIDO (source: ${source})`)

      try {
        const normalizedUrl = cleanUrl.replace(/^acordaportugal:\/\//i, 'https://auth-callback.local/')
        const parsed = new URL(normalizedUrl)

        const type = parsed.searchParams.get('type') || (parsed.searchParams.has('idToken') ? 'google_credential' : 'custom_token')
        const token = parsed.searchParams.get('token')
        const idToken = parsed.searchParams.get('idToken')
        const accessToken = parsed.searchParams.get('accessToken')
        const target = parsed.searchParams.get('target') || '/jogar'

        const rawToken = (idToken || token || '').trim()
        const idTokenPresent = Boolean(rawToken)

        console.log('[AUTH][DEEPLINK] type=', type)
        console.log('[AUTH][DEEPLINK] idToken presente=', idTokenPresent, idTokenPresent ? `(length: ${rawToken.length}, preview: ${rawToken.substring(0, 6)}...${rawToken.slice(-4)})` : '')

        if (!rawToken) {
          console.warn('[AUTH][DEEPLINK] Nenhum token encontrado no URL.')
          return
        }

        if (isTokenProcessed(rawToken)) {
          console.log('[AUTH][DEEPLINK] Token já processado anteriormente (idempotência garantida).')
          return
        }
        markTokenProcessed(rawToken)

        if (!auth) {
          console.error('[AUTH][FIREBASE] ERROR: Firebase Auth não está inicializado.')
          return
        }

        let loggedUser = null

        if (type === 'custom_token' && token) {
          console.log('[AUTH][FIREBASE] signInWithCustomToken START')
          try {
            const userCred = await signInWithCustomToken(auth, token.trim())
            console.log('[AUTH][FIREBASE] signInWithCustomToken SUCCESS')
            loggedUser = userCred?.user
          } catch (customErr: any) {
            console.error('[AUTH][FIREBASE] ERROR code=', customErr?.code, 'message=', customErr?.message)
          }
        } else if ((type === 'google_credential' || idToken) && rawToken) {
          try {
            const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth')
            const credential = GoogleAuthProvider.credential(rawToken, accessToken ? accessToken.trim() : undefined)
            console.log('[AUTH][GOOGLE] credential criada')

            console.log('[AUTH][FIREBASE] signInWithCredential START')
            const userCred = await signInWithCredential(auth, credential)
            console.log('[AUTH][FIREBASE] signInWithCredential SUCCESS')
            loggedUser = userCred?.user
          } catch (credErr: any) {
            console.error('[AUTH][GOOGLE] credential ERROR:', {
              code: credErr?.code,
              message: credErr?.message,
              stack: credErr?.stack,
            })
            console.error('[AUTH][FIREBASE] ERROR code=', credErr?.code, 'message=', credErr?.message)
          }
        }

        const activeUser = loggedUser || auth.currentUser
        if (activeUser) {
          console.log('[AUTH][FIREBASE] currentUser EXISTS uid=', activeUser.uid, 'email=', activeUser.email || 'N/A')

          // Fechar janela do browser se estiver aberta
          try {
            const { Browser } = await import('@capacitor/browser')
            await Browser.close()
          } catch {}

          const { registerUserSession } = await import('@/lib/session-manager')
          await registerUserSession(activeUser)

          console.log('[AUTH][STATE] authenticated uid=', activeUser.uid, 'email=', activeUser.email || 'N/A')
          console.log('[AUTH] A navegar para o destino:', target)
          router.replace(target)
        } else {
          console.error('[AUTH][FIREBASE] currentUser NULL - Falha na autenticação após deep link')
        }
      } catch (err: any) {
        console.error('[AUTH][FIREBASE] ERROR inesperado ao processar deep link:', err)
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
