'use client'

import React, { useState } from 'react'
import { SiteHeader } from '@/components/site-header'
import HomeContent from '@/components/home/HomeContent'
import { SiteFooter } from '@/components/site-footer'
import { useAuth } from '@/components/auth-provider'
import { AuthWallModal } from '@/components/auth-wall-modal'

export default function HomePage() {
  const { user } = useAuth()
  const [authWallOpen, setAuthWallOpen] = useState(false)
  const [authWallTarget, setAuthWallTarget] = useState('/jogar')

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent text-foreground flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      <div className="relative z-10 flex-1 flex flex-col justify-between bg-transparent">
        <SiteHeader />

        <main className="flex-1 flex flex-col justify-start py-2 bg-transparent">
          {/* CONTEÚDO PRINCIPAL DO HOME / LOBBY */}
          <HomeContent />
        </main>

        <SiteFooter />
      </div>

      {/* 🔒 MODAL DE BLOQUEIO DE CONVIDADO / LOGIN OBRIGATÓRIO */}
      <AuthWallModal
        isOpen={authWallOpen}
        onClose={() => setAuthWallOpen(false)}
        targetUrl={authWallTarget}
      />
    </div>
  )
}