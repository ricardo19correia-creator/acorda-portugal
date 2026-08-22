'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import Script from 'next/script'
import { GoogleAuthProvider, signInWithCredential, signInWithCustomToken } from 'firebase/auth'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { handleGoogleLogin, getPostLoginRedirectTarget } from '@/lib/auth'

interface GoogleAuthButtonProps {
  redirectTarget?: string
  onError?: (error: string) => void
}

export default function GoogleAuthButton({ redirectTarget = '/jogar', onError }: GoogleAuthButtonProps) {
  const router = useRouter()
  const [gisLoaded, setGisLoaded] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [handshakeWaiting, setHandshakeWaiting] = useState(false)
  const unsubscribeSnapshotRef = useRef<(() => void) | null>(null)

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current()
      }
    }
  }, [])

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      try {
        if (!response?.credential) return
        setIsSigningIn(true)
        console.log('[AUTH GIS] Resposta de credencial recebida. A autenticar no Firebase...')

        const credential = GoogleAuthProvider.credential(response.credential)
        const userCred = await signInWithCredential(auth, credential)

        console.log('[AUTH GIS] signInWithCredential concluído com sucesso para UID:', userCred.user.uid)
        const destination = getPostLoginRedirectTarget(redirectTarget)
        router.push(destination)
      } catch (error: any) {
        console.error('[AUTH GIS] Erro ao autenticar com Google GIS:', error)
        setIsSigningIn(false)
        if (onError) {
          onError(error?.message || 'Erro na autenticação com o Google.')
        }
      }
    },
    [redirectTarget, router, onError],
  )

  const initGis = useCallback(() => {
    if (typeof window === 'undefined' || !(window as any).google?.accounts?.id) return

    try {
      const clientId =
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        '130539395859-b1dvd01dckqj0f456rbbjksb543j9qgq.apps.googleusercontent.com'

      ;(window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      const btnContainer = document.getElementById('googleSignInDiv')
      if (btnContainer) {
        btnContainer.innerHTML = ''
        ;(window as any).google.accounts.id.renderButton(btnContainer, {
          theme: 'filled_black',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
        })
      }

      // Ativa o prompt One Tap nativo na página
      try {
        ;(window as any).google.accounts.id.prompt()
      } catch {
        // Ignora caso o prompt não seja suportado no contexto
      }

      setGisLoaded(true)
    } catch (err) {
      console.warn('[AUTH GIS] Aviso na inicialização do GIS:', err)
    }
  }, [handleCredentialResponse])

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      initGis()
    }
  }, [initGis])

  // Inicia o Handshake Realtime Firestore para APK / WebView
  const startFirestoreHandshake = async () => {
    setIsSigningIn(true)
    setHandshakeWaiting(true)

    try {
      const sessionId = 'auth_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now()
      console.log('[AUTH HANDSHAKE] A criar sessão Firestore:', sessionId)

      // 1. Criar registo pending no Firestore
      if (db) {
        await setDoc(doc(db, 'auth_sessions', sessionId), {
          status: 'pending',
          createdAt: Date.now(),
        })

        // 2. Ficar a escutar em tempo real
        const unsub = onSnapshot(doc(db, 'auth_sessions', sessionId), async (snap) => {
          const data = snap.data()
          console.log('[AUTH HANDSHAKE] Atualização recebida do Firestore:', data?.status)

          if (data?.status === 'authorized' && data?.token) {
            unsub()
            unsubscribeSnapshotRef.current = null
            setHandshakeWaiting(false)

            try {
              console.log('[AUTH HANDSHAKE] A autenticar com token recebido no APK...')
              await signInWithCustomToken(auth, data.token)
              console.log('[AUTH HANDSHAKE] Autenticação APK concluída com sucesso!')
              const destination = getPostLoginRedirectTarget(redirectTarget)
              router.push(destination)
            } catch (authErr) {
              console.error('[AUTH HANDSHAKE] Erro ao autenticar customToken:', authErr)
              const destination = getPostLoginRedirectTarget(redirectTarget)
              router.push(destination)
            }
          }
        })

        unsubscribeSnapshotRef.current = unsub
      }

      // 3. Abrir o navegador externo com a página de callback contendo o sessionId
      const callbackUrl = `https://acordaportugal.pt/auth/callback?sessionId=${sessionId}`
      
      // Tenta abrir no browser do dispositivo
      if (typeof window !== 'undefined') {
        const opened = window.open(callbackUrl, '_blank')
        if (!opened) {
          window.location.href = callbackUrl
        }
      }
    } catch (err: any) {
      console.error('[AUTH HANDSHAKE] Erro no handshake:', err)
      setIsSigningIn(false)
      setHandshakeWaiting(false)
      // Fallback para redirect tradicional
      await handleGoogleLogin(redirectTarget)
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center my-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGis}
      />

      {isSigningIn && (
        <div className="flex items-center gap-2 text-xs text-primary font-bold mb-2 animate-pulse">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>{handshakeWaiting ? 'A aguardar confirmação no navegador...' : 'A autenticar com Google...'}</span>
        </div>
      )}

      {/* Contentor do botão nativo GIS One Tap */}
      <div id="googleSignInDiv" className="w-full min-h-[44px] flex justify-center items-center" />

      {/* Botão de Entrada e Handshake para APK / Web */}
      {(!gisLoaded || handshakeWaiting) && (
        <button
          type="button"
          onClick={startFirestoreHandshake}
          disabled={isSigningIn && handshakeWaiting}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] py-3.5 px-4 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground hover:bg-white/10 hover:border-white/25 active:scale-[0.98] transition cursor-pointer shadow-md mt-2"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{handshakeWaiting ? 'A sincronizar com a app...' : 'Continuar com o Google'}</span>
        </button>
      )}
    </div>
  )
}
