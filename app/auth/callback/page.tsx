'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Link from 'next/link'
import { ArrowRight, Smartphone, CheckCircle2 } from 'lucide-react'

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'manual'>('loading')
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) return

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken()
          const res = await fetch('/api/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          })

          const data = await res.json()
          const tokenToUse = data.customToken || idToken
          const targetUrl = `acordaportugal://auth-callback?token=${encodeURIComponent(tokenToUse)}`

          setDeepLinkUrl(targetUrl)
          setStatus('redirecting')

          // Redireciona o Android de volta para o APK
          window.location.href = targetUrl
        } catch (err) {
          console.error('[AUTH CALLBACK] Erro ao transferir sessão para o APK:', err)
          setStatus('manual')
        }
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl mb-4 shadow-inner">
          🇵🇹
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mb-2">
          {status === 'redirecting' ? 'A Redirecionar para a App...' : 'A Autenticar Sessão...'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
          {status === 'redirecting'
            ? 'A tua sessão Google foi validada e está a ser transferida para o Acorda Portugal no teu telemóvel.'
            : 'Se a aplicação não abrir automaticamente em poucos segundos, clica no botão abaixo.'}
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
      </div>
    </div>
  )
}
