'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import Link from 'next/link'
import { CheckCircle2, Smartphone, ArrowRight, Sparkles } from 'lucide-react'
import GoogleAuthButton from '@/components/google-auth-button'

function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const [status, setStatus] = useState<'checking' | 'authorizing' | 'success' | 'manual'>('checking')
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) return

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setStatus('authorizing')
        setUserEmail(user.email)

        try {
          const idToken = await user.getIdToken()
          
          let customToken: string | null = null
          try {
            const res = await fetch('/api/auth/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            })
            const data = await res.json()
            customToken = data.customToken || null
          } catch (e) {
            console.warn('Erro ao obter customToken do servidor:', e)
          }

          const tokenToShare = customToken || idToken

          // 1. Atualizar o documento de sessão no Firestore para o handshake em tempo real
          if (sessionId && db) {
            try {
              console.log('[AUTH CALLBACK] A atualizar auth_sessions/' + sessionId + ' no Firestore...')
              await setDoc(
                doc(db, 'auth_sessions', sessionId),
                {
                  status: 'authorized',
                  token: tokenToShare,
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  updatedAt: Date.now(),
                },
                { merge: true },
              )
              console.log('[AUTH CALLBACK] Handshake Firestore concluído com sucesso!')
            } catch (err) {
              console.error('[AUTH CALLBACK] Erro ao gravar handshake no Firestore:', err)
            }
          }

          // 2. Disparar deep link de retorno como fallback secundário
          const targetUrl = `acordaportugal://auth-callback?token=${encodeURIComponent(tokenToShare)}`
          setDeepLinkUrl(targetUrl)
          setStatus('success')

          try {
            window.location.href = targetUrl
          } catch {
            // Ignora se o browser bloquear redirecionamento automático
          }
        } catch (err) {
          console.error('[AUTH CALLBACK] Erro no processamento de callback:', err)
          setStatus('manual')
        }
      } else {
        setStatus('manual')
      }
    })

    return () => unsubscribe()
  }, [sessionId])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center">
        {status === 'success' ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl mb-4 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mb-2">
              Login Efetuado com Sucesso!
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              {userEmail && <strong className="text-white block mb-1">{userEmail}</strong>}
              Podes fechar esta janela e voltar ao jogo. A tua sessão já foi sincronizada na aplicação.
            </p>

            {deepLinkUrl && (
              <a
                href={deepLinkUrl}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-3 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Voltar à App Acorda Portugal</span>
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
        ) : status === 'authorizing' ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-3xl mb-4 animate-pulse">
              🇵🇹
            </div>

            <h2 className="text-xl font-black text-white mb-2">A Sincronizar Sessão...</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              A transferir a tua identidade para a aplicação Acorda Portugal. Aguarda um segundo...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-3xl mb-4 shadow-inner">
              🇵🇹
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mb-2">
              Iniciar Sessão no Acorda Portugal
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              Seleciona a tua conta Google para transferir o teu progresso para o jogo.
            </p>

            <div className="w-full mb-4">
              <GoogleAuthButton redirectTarget={`/auth/callback${sessionId ? `?sessionId=${sessionId}` : ''}`} />
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
