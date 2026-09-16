import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
import { EconomyProvider } from '@/context/economy-context'
import { GameThemeProvider } from '@/context/game-theme-context'
import { AudioProvider } from '@/context/AudioContext'
import DeepLinkHandler from '@/components/DeepLinkHandler'
import { GlobalBackgroundImage } from '@/components/GlobalBackgroundImage'
import { MobileBottomBar } from '@/components/navigation/MobileBottomBar'
import { ArenaLayoutSync } from '@/components/navigation/ArenaLayoutSync'
import { RouteTracker } from '@/components/navigation/RouteTracker'
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
  metadataBase: new URL('https://acordaportugal.pt'),
  title: 'Acorda Portugal — Desafio Nacional',
  description:
    'Acorda Portugal — Desafio Nacional. Joga, compete, participa e descobre uma nova experiência nacional portuguesa.',
  alternates: {
    canonical: 'https://acordaportugal.pt/',
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/icon.png',
    apple: [
      { url: '/icon.png', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://acordaportugal.pt/',
    siteName: 'Acorda Portugal — Desafio Nacional',
    title: 'Acorda Portugal — Desafio Nacional',
    description:
      'Acorda Portugal — Desafio Nacional. Joga, compete, participa e descobre uma nova experiência nacional portuguesa.',
    images: [
      {
        url: 'https://acordaportugal.pt/logo-oficial.png',
        width: 512,
        height: 512,
        alt: 'Acorda Portugal — Desafio Nacional',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acorda Portugal — Desafio Nacional',
    description:
      'Acorda Portugal — Desafio Nacional. Joga, compete, participa e descobre uma nova experiência nacional portuguesa.',
    images: ['https://acordaportugal.pt/logo-oficial.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
        {/* Dados Estruturados Schema.org para Google (WebSite & Organization) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Acorda Portugal — Desafio Nacional',
              alternateName: 'Acorda Portugal',
              url: 'https://acordaportugal.pt/',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Acorda Portugal — Desafio Nacional',
              alternateName: 'Acorda Portugal',
              url: 'https://acordaportugal.pt/',
              logo: 'https://acordaportugal.pt/logo-oficial.png',
            }),
          }}
        />
        <link
          rel="preload"
          href="/images/desafio-nacional-background.jpg"
          as="image"
          type="image/jpeg"
        />
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
    } else {
      document.documentElement.classList.remove('ap-arena-match');
    }
  } catch(e) {}
})();
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
html.ap-arena-match,
html.ap-arena-match body {
  overflow: hidden !important;
  height: 100dvh !important;
  max-height: 100dvh !important;
  touch-action: manipulation;
}
html.ap-arena-match #app-main-layout {
  padding-bottom: 0 !important;
  min-height: 100dvh !important;
  height: 100dvh !important;
  max-height: 100dvh !important;
  overflow: hidden !important;
}
html.ap-arena-match #global-background-container,
html.ap-arena-match #global-background-video,
html.ap-arena-match #global-background-image,
html.ap-arena-match #global-background-overlay,
html.ap-arena-match #mobile-bottom-dock {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
            `,
          }}
        />
      </head>
      <body className="relative min-h-screen bg-[#050706] text-zinc-100 antialiased overflow-x-hidden">
        {/* 0 → IMAGEM DE FUNDO GLOBAL OFICIAL (IMEDIATO, PERSISTENTE E EM Z-INDEX: 0) */}
        <GlobalBackgroundImage />

        <AuthProvider>
          <EconomyProvider>
            <DeepLinkHandler />
            <RouteTracker />
            <ArenaLayoutSync />
            <GameThemeProvider>
              <AudioProvider>
                <div id="app-main-layout" className="relative z-10 min-h-screen flex flex-col pb-16 lg:pb-0">
                  {children}
                </div>
                <MobileBottomBar />
              </AudioProvider>
            </GameThemeProvider>
          </EconomyProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
