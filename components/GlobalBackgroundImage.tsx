import React from 'react'

/**
 * 🇵🇹 ACORDA PORTUGAL — FUNDO GLOBAL OFICIAL
 * 
 * Imagem de fundo oficial do Desafio Nacional:
 * /images/desafio-nacional-background.jpg
 * 
 * Características:
 * - Ocupa todo o viewport (100vw, 100dvh)
 * - Camada inferior (z-index: 0)
 * - Fixo durante a navegação
 * - Responsivo: centraliza o estúdio e o escudo de Portugal em mobile/desktop
 * - Overlay subtil para contraste da interface
 * - Sem vídeo, sem timers, sem consumo de recursos em background
 * - Funciona no browser e dentro do APK (Capacitor)
 */
export function GlobalBackgroundImage() {
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
      {/* 0 → IMAGEM OFICIAL DE FUNDO DO DESAFIO NACIONAL */}
      <img
        id="global-background-image"
        src="/images/desafio-nacional-background.jpg"
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchPriority="high"
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

      {/* 1 → OVERLAY SUBTIL PARA GARANTIR LEGIBILIDADE DA UI */}
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
