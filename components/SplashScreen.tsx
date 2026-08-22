'use client'

import React, { useState, useEffect } from 'react'

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const [fadeOut, setFadeOut] = useState(false)
  const [hidden, setHidden] = useState(false)

  const handleEnded = () => {
    setFadeOut(true)
    setTimeout(() => {
      setHidden(true)
      if (onFinish) onFinish()
    }, 600) // Transição suave de saída
  }

  // Fallback de segurança para fechar em 7 segundos caso o vídeo trave
  useEffect(() => {
    const timer = setTimeout(() => {
      handleEnded()
    }, 7000)
    return () => clearTimeout(timer)
  }, [])

  if (hidden) return null

  return (
    <div className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-700 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <video
        src="/videos/splash-intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        className="w-full h-full object-cover"
      />
      {/* Botão de Saltar Opcional */}
      <button
        type="button"
        onClick={handleEnded}
        className="absolute bottom-8 right-8 px-4 py-2 bg-black/60 backdrop-blur-md border border-cyan-500/40 rounded-xl text-xs font-bold text-white tracking-widest uppercase hover:bg-cyan-500/20 transition-colors cursor-pointer z-10"
      >
        Saltar ➔
      </button>
    </div>
  )
}

export { SplashScreen }
