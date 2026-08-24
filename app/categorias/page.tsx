import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { Categories } from '@/components/categories'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { ArrowLeft, Play, LayoutGrid, Sparkles } from 'lucide-react'

export default function CategoriasPage() {
  return (
    <div className="relative min-h-screen bg-transparent flex flex-col">
      <BackgroundFx variant="categories" />

      <div className="relative z-20 flex-1 flex flex-col">
        <SiteHeader />

        <main className="flex-1">
          {/* Header Banner */}
          <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-white/10 hover:text-white backdrop-blur-md"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Início
                </Link>
                <div className="mt-3 flex items-center gap-2">
                  <span className="badge-hud text-primary border-primary/40 bg-primary/15 shadow-md shadow-primary/20 flex items-center gap-1.5">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    18 Temas de Conteúdo
                  </span>
                </div>
                <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tight text-foreground text-glow-primary">
                  Catálogo de Categorias
                </h1>
                <p className="mt-1.5 text-sm sm:text-base text-muted-foreground font-medium">
                  Escolhe a tua especialidade e joga perguntas selecionadas por tema e subtema.
                </p>
              </div>

              <Link
                href="/jogar"
                className="button-game-primary inline-flex items-center gap-2.5 rounded-2xl px-7 py-4 font-display text-sm font-black uppercase tracking-wider cursor-pointer shadow-xl"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Central de Jogo</span>
              </Link>
            </div>
          </div>

          {/* Categories Grid Section */}
          <Categories />
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
