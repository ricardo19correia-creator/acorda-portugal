import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
import { PresenceManager } from '@/components/presence-manager'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Acorda Portugal â€” Desafio Nacional',
  description:
    'O jogo de perguntas oficial de Portugal. Testa o teu conhecimento, representa o teu distrito e chega ao topo do ranking nacional.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#05130d',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-PT" className={`dark ${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="bg-background font-sans antialiased">
        <AuthProvider>
          <PresenceManager />
          {children}
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}


