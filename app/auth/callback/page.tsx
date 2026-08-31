'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import Link from 'next/link'
import { CheckCircle2, Smartphone, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { AppBackground } from '@/components/AppBackground'
import { getGoogleAuthProvider, mapAuthErrorMessage } from '@/lib/auth-helpers'
import { useSearchParams } from 'next/navigation'

function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const targetParam = searchParams.get('target') || '/jogar'
  const autoParam = searchParams.get('auto') === 'true'

  const [status, setStatus] = useState<'checking' | 'requesting_token' | 'redirecting' | 'manual_login' | 'error'>('checking')
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const autoTriggeredRef = useRef(false)

  const handleBrowserGoogleLogin = async () => {
    if (isSigningIn) return
    setIsSigningIn(true)
    setErrorDetails(null)

    try {
      if (!auth) throw new Error('Firebase Auth não inicializado.')
      const provider = getGoogleAuthProvider()
      console.log('[AUTH CALLBACK] A executar signInWithPopup no browser...')
      const userCred = await signInWithPopup(auth, provider)
      console.log('[AUTH CALLBACK] Sucesso signInWithPopup:', userCred.user.uid)
    } catch (err: any) {
      console.warn('[AUTH CALLBACK] Erro signInWithPopup:', err?.code, err?.message)
      setIsSigningIn(false)
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setErrorDetails(mapAuthErrorMessage(err))
      }
    }
  }

  useEffect(() => {
    if (!auth) return

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email)
        setStatus('requesting_token')

        try {
          console.log('[AUTH CALLBACK] Utilizador autenticado no browser:', user.uid)
          const idToken = await user.getIdToken(true)

          console.log('[AUTH CALLBACK] A obter credencial de transferência...')
          let deepLink = ''
          try {
            const res = await fetch('/api/auth/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            })
            if (res.ok) {
              const data = await res.json()
              if (data.customToken) {
                deepLink = `acordaportugal://auth-callback?type=custom_token&token=${encodeURIComponent(data.customToken)}&target=${encodeURIComponent(targetParam)}`
              } else {
                deepLink = `acordaportugal://auth-callback?type=google_credential&idToken=${encodeURIComponent(idToken)}&target=${encodeURIComponent(targetParam)}`
              }
            } else {
              deepLink = `acordaportugal://auth-callback?type=google_credential&idToken=${encodeURIComponent(idToken)}&target=${encodeURIComponent(targetParam)}`
            }
          } catch (fetchErr) {
            console.warn('[AUTH CALLBACK] Fallback para google_credential idToken:', fetchErr)
            deepLink = `acordaportugal://auth-callback?type=google_credential&idToken=${encodeURIComponent(idToken)}&target=${encodeURIComponent(targetParam)}`
          }

          console.log('[AUTH CALLBACK] Deep link preparado:', deepLink)
          setDeepLinkUrl(deepLink)
          setStatus('redirecting')

          // Redireciona o Android de volta para o APK
          try {
            window.location.href = deepLink
          } catch (navErr) {
            console.warn('[AUTH CALLBACK] Redirecionamento automático bloqueado pelo navegador:', navErr)
          }
        } catch (err: any) {
          console.error('[AUTH CALLBACK] Erro ao obter token do servidor:', err)
          setErrorDetails(err?.message || 'Erro de comunicação.')
          setStatus('error')
        }
      } else {
        setStatus('manual_login')
        if (autoParam && !autoTriggeredRef.current) {
          autoTriggeredRef.current = true
          handleBrowserGoogleLogin()
        }
      }
    })

    return () => unsubscribe()
  }, [targetParam, autoParam])

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-center text-white">
      <AppBackground />
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center">
        {status === 'redirecting' ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl mb-4 shadow-inner animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mb-2">
              Login Efetuado com Sucesso!
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              {userEmail && <strong className="text-white block mb-1">{userEmail}</strong>}
              A redirecionar de volta para a aplicação Acorda Portugal... Se a app não abrir automaticamente, clica no botão abaixo.
            </p>

            {deepLinkUrl && (
              <a
                href={deepLinkUrl}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-3 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Abrir na App Acorda Portugal</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}

            <Link
              href="/jogar"
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors mt-2"
            >
              Continuar no Navegador Web →
            </Link>
          </>
        ) : status === 'requesting_token' ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-3xl mb-4 animate-pulse">
              🇵🇹
            </div>

            <h2 className="text-xl font-black text-white mb-2">A Preparar Sessão...</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              A gerar credencial segura de autenticação para o APK. Aguarda um segundo...
            </p>
          </>
        ) : status === 'error' ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-3xl mb-4">
              ⚠️
            </div>

            <h2 className="text-xl font-black text-white mb-2">Erro na Autenticação</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {errorDetails || 'Não foi possível transferir a credencial para a aplicação.'}
            </p>

            <button
              type="button"
              onClick={handleBrowserGoogleLogin}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            >
              Tentar Novamente
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-3xl mb-4 shadow-inner">
              🇵🇹
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mb-2">
              Iniciar Sessão com Google
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              Clica abaixo para escolher a tua conta Google e regressar à aplicação Acorda Portugal.
            </p>

            {errorDetails && (
              <div className="w-full mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorDetails}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleBrowserGoogleLogin}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.08] py-3.5 px-4 font-display text-sm font-bold uppercase tracking-wider text-foreground hover:bg-white/15 hover:border-white/30 active:scale-[0.98] transition cursor-pointer shadow-md mb-4"
            >
              {isSigningIn ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
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
                  <span>Continuar com o Google</span>
                </>
              )}
            </button>

            <Link
              href="/jogar"
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors mt-2"
            >
              Continuar no Navegador Web →
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
