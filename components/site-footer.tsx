import { BrandLogo } from '@/components/brand-logo'

const LINKS = ['Jogar', 'Ranking', 'Categorias', 'Como jogar', 'Termos', 'Privacidade']

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="max-w-xs">
            <BrandLogo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              O jogo de perguntas que junta todo o país. Joga, compete e mostra que sabes.
            </p>
          </div>

          <nav aria-label="Rodapé">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 md:justify-end">
              {LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#top"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 Acorda Portugal</p>
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
