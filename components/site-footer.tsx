import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'

const LINKS = [
  { label: 'Jogar', href: '/jogar' },
  { label: 'Rankings', href: '/rankings' },
  { label: 'Categorias', href: '/categorias' },
  { label: 'Portugal & Mapa', href: '/portugal' },
  { label: 'Eventos', href: '/eventos' },
  { label: 'Explorar & Sobre', href: '/explorar' },
  { label: 'Loja', href: '/loja' },
  { label: 'Termos', href: '/termos' },
  { label: 'Central de Ajuda', href: '/ajuda' },
]

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-zinc-950/40 backdrop-blur-md mt-16">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <BrandLogo />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              O jogo de perguntas que junta todo o país. Joga, compete e mostra que sabes.
            </p>
          </div>

          <nav aria-label="Rodapé">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 md:justify-end">
              {LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-muted-foreground sm:flex-row">
          {/* Esquerda */}
          <p>© 2026 Acorda Portugal</p>

          {/* Centro — assinatura do criador */}
          <p className="text-center font-medium tracking-wide">
            Uma criação de{' '}
            <span className="font-bold text-foreground">
              Riky Moreira
            </span>{' '}
            🇵🇹
          </p>

          {/* Direita */}
          <p className="flex items-center gap-1.5">
            Feito com orgulho em Portugal
            <span className="inline-block h-3 w-4.5 overflow-hidden rounded-[2px] align-middle">
              <span className="flex h-full w-full">
                <span className="h-full w-2/5 bg-primary" />
                <span className="h-full w-3/5 bg-flag-red" />
              </span>
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}