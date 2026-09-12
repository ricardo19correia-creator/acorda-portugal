'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DesafioVisualRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/jogar?cat=desafio-visual')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-3">
        <span className="text-3xl animate-pulse">👁️</span>
        <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">
          A carregar Desafio Visual...
        </p>
      </div>
    </div>
  )
}
