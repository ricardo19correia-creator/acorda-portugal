'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import {
  getGoogleAuthProvider,
  getPostLoginRedirectTarget,
  setPostLoginRedirectTarget,
  sanitizeRedirectUrl,
  mapAuthErrorMessage,
  registerUserSession,
} from '@/lib/auth'

interface GoogleAuthButtonProps {
  text?: string
  redirectTarget?: string
  onError?: (error: string) => void
  className?: string
}

export default function GoogleAuthButton({
  text = 'Continuar com o Google',
  redirectTarget = '/jogar',
  onError,
  className,
}: GoogleAuthButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleGoogleClick = async () => {
    if (loading) return
    setLoading(true)

    const safeTarget = sanitizeRedirectUrl(redirectTarget, '/jogar')

    // 1. Deteção de ambiente Capacitor Android (APK Nativo)
    const isCapacitor =
      typeof window !== 'undefined' &&
      (((window as any).Capacitor && typeof (window as any).Capacitor.isNativePlatform === 'function' && (window as any).Capacitor.isNativePlatform()) ||
        (window as any).Capacitor?.platform === 'android' ||
        navigator.userAgent.includes('Capacitor') ||
        window.location.protocol === 'capacitor:')

    if (isCapacitor) {
      console.log('[GOOGLE-AUTH] platform: Capacitor Android')
      console.log('[GOOGLE-AUTH] starting native Google Sign-In with SocialLogin + signInWithCredential')
      
      try {
        const { SocialLogin } = await import('@capgo/capacitor-social-login')
        await SocialLogin.initialize({
          google: {
            webClientId: '130539395859-webclient.apps.googleusercontent.com',
            mode: 'offline',
          }
        }).catch((initErr) => {
          console.warn('[GOOGLE-AUTH] SocialLogin.initialize warning:', initErr)
        })

        console.log('[GOOGLE-AUTH] A solicitar conta Google nativa...')
        const loginRes: any = await SocialLogin.login({
          provider: 'google',
          options: {
            scopes: ['email', 'profile']
          }
        })

        console.log('[GOOGLE-AUTH] Resposta nativa recebida:', loginRes)
        const idToken = loginRes?.result?.idToken || loginRes?.idToken || loginRes?.result?.token
        const accessToken = loginRes?.result?.accessToken?.token || (typeof loginRes?.result?.accessToken === 'string' ? loginRes.result.accessToken : undefined)

        if (!idToken) {
          throw new Error('Google Sign-In não retornou um ID token válido.')
        }

        if (!auth) {
          throw new Error('Firebase Auth não está inicializado.')
        }

        console.log('[GOOGLE-AUTH] credential-created: A converter ID token em credencial Firebase...')
        const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth')
        const credential = GoogleAuthProvider.credential(idToken, accessToken)

        console.log('[GOOGLE-AUTH] A autenticar no Firebase com signInWithCredential...')
        const userCred = await signInWithCredential(auth, credential)

        console.log('[GOOGLE-AUTH] sign-in-success: UID autenticado:', userCred.user.uid)
        await registerUserSession(userCred.user)
        const destination = getPostLoginRedirectTarget(safeTarget)
        router.push(destination)
        return
      } catch (nativeErr: any) {
        console.error('[GOOGLE-AUTH] sign-in-error no fluxo nativo:', nativeErr)
        setLoading(false)
        if (nativeErr?.message && !nativeErr.message.includes('cancel') && !nativeErr.message.includes('user_cancel') && !nativeErr.message.includes('16:')) {
          const errorMsg = mapAuthErrorMessage(nativeErr)
          if (onError) onError(errorMsg)
        }
        return
      }
    }

    // 2. Fluxo Web Standard (Desktop e Mobile Web no Chrome / Safari / Firefox)
    try {
      if (!auth) {
        throw new Error('Firebase Auth não está inicializado.')
      }

      setPostLoginRedirectTarget(safeTarget)
      const provider = getGoogleAuthProvider()

      console.log('[AUTH] A iniciar login Google com signInWithPopup...')
      const userCred = await signInWithPopup(auth, provider)

      console.log('[AUTH] Login Google efetuado com sucesso:', userCred.user.uid)
      await registerUserSession(userCred.user)
      const destination = getPostLoginRedirectTarget(safeTarget)
      router.push(destination)
    } catch (error: any) {
      console.warn('[AUTH] Erro durante autenticação Google:', error?.code, error?.message)
      setLoading(false)
      if (error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') {
        const errorMsg = mapAuthErrorMessage(error)
        if (onError) onError(errorMsg)
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] py-3.5 px-4 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground hover:bg-white/10 hover:border-white/25 active:scale-[0.98] transition cursor-pointer shadow-md ${className || ''}`}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>A autenticar...</span>
        </div>
      ) : (
        <>
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
          <span>{text}</span>
        </>
      )}
    </button>
  )
}


