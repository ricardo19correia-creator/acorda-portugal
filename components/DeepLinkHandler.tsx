'use client'

import { useEffect } from 'react'
import { signInWithCustomToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export default function DeepLinkHandler() {
  const router = useRouter()

  useEffect(() => {
    let removeListener: (() => void) | undefined

    const setupAppListener = async () => {
      try {
        const { App } = await import('@capacitor/app')
        const handle = await App.addListener('appUrlOpen', async (event) => {
          console.log('[DEEP LINK] Evento appUrlOpen recebido:', event.url)
          // Exemplo de URL: acordaportugal://auth-callback?token=XYZ...
          if (event.url && event.url.includes('auth-callback')) {
            try {
              const dummyUrl = new URL(event.url.replace(/^acordaportugal:\/\//, 'https://dummy.com/'))
              const token = dummyUrl.searchParams.get('token')
              if (token && auth) {
                console.log('[DEEP LINK] A autenticar com customToken no Firebase...')
                await signInWithCustomToken(auth, token)
                console.log('[DEEP LINK] Sessão autenticada com sucesso no APK!')
                router.push('/jogar')
              }
            } catch (err) {
              console.error('[DEEP LINK] Erro ao autenticar token via deep link:', err)
            }
          }
        })

        removeListener = () => {
          handle.remove()
        }
      } catch (e) {
        // Ignora caso não esteja em ambiente Capacitor
      }
    }

    setupAppListener()

    return () => {
      if (removeListener) removeListener()
    }
  }, [router])

  return null
}
