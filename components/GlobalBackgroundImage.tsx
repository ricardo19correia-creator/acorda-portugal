'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

/**
 * 🇵🇹 ACORDA PORTUGAL — FUNDO GLOBAL DO JOGO (DESAFIO NACIONAL)
 * 
 * Imagem de fundo oficial do jogo:
 * /images/desafio-nacional-background.jpg
 * 
 * Importante:
 * - A homepage institucional ('/') e páginas institucionais possuem o seu próprio fundo exclusivo.
 * - Este fundo do jogo só é ativo nas áreas de jogo e rotas secundárias do Desafio Nacional.
 */
export function GlobalBackgroundImage() {
  const pathname = usePathname()

  // Ocultar completamente na homepage institucional e páginas institucionais
  if (
    !pathname ||
    pathname === '/' ||
    pathname === '/termos' ||
    pathname === '/privacidade' ||
    pathname === '/ajuda' ||
    pathname === '/conta-eliminada'
  ) {
    return null
  }

  return (
    <div
      id="global-background-container"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: '#050706',
      }}
      aria-hidden="true"
    >
      {/* IMAGEM DE FUNDO DO DESAFIO NACIONAL (APENAS NO JOGO) */}
      <img
        id="global-background-image"
        src="/images/desafio-nacional-background.jpg"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none block"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          pointerEvents: 'none',
          userSelect: 'none',
          display: 'block',
        }}
      />

      {/* OVERLAY PARA CONTRASTE */}
      <div
        id="global-background-overlay"
        className="absolute inset-0 w-full h-full pointer-events-none select-none block"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          backgroundColor: 'rgba(5, 7, 6, 0.22)',
        }}
      />
    </div>
  )
}

export default GlobalBackgroundImage

