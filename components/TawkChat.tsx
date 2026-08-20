'use client'

import { useEffect } from 'react'

export default function TawkChat() {
  useEffect(() => {
    // Evita recarregar se já existir
    if (document.getElementById('tawk-script')) return

    const Tawk_API = (window as any).Tawk_API || {}
    const Tawk_LoadStart = new Date()
    ;(window as any).Tawk_API = Tawk_API
    ;(window as any).Tawk_LoadStart = Tawk_LoadStart

    const s1 = document.createElement('script')
    s1.id = 'tawk-script'
    s1.async = true
    s1.src = 'https://embed.tawk.to/6a864376bc557a344a5e35b8/1k0e7f2bh'
    s1.charset = 'UTF-8'
    s1.setAttribute('crossorigin', '*')

    document.head.appendChild(s1)
  }, [])

  return null
}
