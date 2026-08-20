'use client'

import { useEffect, useState } from 'react'

export function useOnlineUsers() {
  const [onlineCount, setOnlineCount] = useState<number>(1)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Gera ou recupera um ID único por aba/dispositivo
    let sessionId = sessionStorage.getItem('client_presence_id')
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now()
      sessionStorage.setItem('client_presence_id', sessionId)
    }

    const sendPing = async () => {
      try {
        const res = await fetch('/api/presence/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data && typeof data.onlineCount === 'number') {
            setOnlineCount(Math.max(1, data.onlineCount))
          }
        }
      } catch (err) {
        console.error('Erro ao atualizar contador online:', err)
      }
    }

    // Ping imediato ao carregar
    sendPing()

    // Ping a cada 5 segundos
    const interval = setInterval(sendPing, 5000)

    return () => clearInterval(interval)
  }, [])

  return onlineCount
}
