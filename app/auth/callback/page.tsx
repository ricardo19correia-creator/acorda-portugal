'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Link from 'next/link'
import { CheckCircle2, Smartphone, ArrowRight, RefreshCw } from 'lucide-react'
import GoogleAuthButton from '@/components/google-auth-button'

function AuthCallbackContent() {
  const [status, setStatus] = useState<'checking' | 'requesting_token' | 'redirecting' | 'manual_login' | 'error'>('checking')
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) return

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email)
        setStatus('requesting_token')

        try {
          console.log('[AUTH CALLBACK] Utilizador autenticado no browser:', user.uid)
          const idToken = await user.getIdToken()

          console.log('[AUTH CALLBACK] A pedir customToken ao endpoint /api/auth/token...')
          const res = await fetch('/api/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          })

          const data = await res.json()

          if (!res.ok || (!data.customToken && !data.idToken)) {
            throw new Error(data.error || 'Não foi possível gerar a credencial de transferência.')
          }

          const token = data.customToken || data.idToken
          const deepLink = `acordaportugal://auth-callback?token=${encodeURIComponent(token)}`

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
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
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

            <Link
              href="/entrar"
              className="w-full py-3 px-4 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition"
            >
              Tentar Novamente
            </Link>
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
              Seleciona a tua conta Google para autenticar e regressar à aplicação.
            </p>

            <div className="w-full mb-4">
              <GoogleAuthButton redirectTarget="/auth/callback" />
            </div>

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
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
