import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
import { EconomyProvider } from '@/context/economy-context'
import { GameThemeProvider } from '@/context/game-theme-context'
import { AudioProvider } from '@/context/AudioContext'
import DeepLinkHandler from '@/components/DeepLinkHandler'
import { GlobalBackgroundVideo } from '@/components/GlobalBackgroundVideo'
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
  title: 'Acorda Portugal — Desafio Nacional',
  description:
    'O jogo de perguntas oficial de Portugal. Testa o teu conhecimento, representa o teu distrito e chega ao topo do ranking nacional.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050706',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-PT" className={`dark ${spaceGrotesk.variable} ${inter.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var p = window.location.pathname.toLowerCase();
    var s = window.location.search.toLowerCase();
    var isJogar = p === '/jogar' || p === '/jogo';
    var hasMatchParam = s.indexOf('cat=') !== -1 || s.indexOf('category=') !== -1 || s.indexOf('game=') !== -1 || s.indexOf('tema=') !== -1 || s.indexOf('district=') !== -1 || s.indexOf('city=') !== -1 || s.indexOf('distrito=') !== -1 || s.indexOf('cidade=') !== -1 || s.indexOf('gameid=') !== -1;
    var isDuelo = p === '/jogar/duelo' && s.indexOf('id=') !== -1;
    if ((isJogar && hasMatchParam) || isDuelo) {
      document.documentElement.classList.add('ap-arena-match');
    }
  } catch(e) {}
})();
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
html.ap-arena-match #global-background-container,
html.ap-arena-match #global-background-video,
html.ap-arena-match #global-background-overlay {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
            `,
          }}
        />
      </head>
      <body className="relative min-h-screen bg-transparent text-zinc-100 antialiased overflow-x-hidden">
        <AuthProvider>
          <EconomyProvider>
            <DeepLinkHandler />
            <GameThemeProvider>
              <AudioProvider>
                <GlobalBackgroundVideo />
                <div className="relative z-10 min-h-screen flex flex-col">
                  {children}
                </div>
              </AudioProvider>
            </GameThemeProvider>
          </EconomyProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
