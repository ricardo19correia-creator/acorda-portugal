import { CATEGORIES } from '@/lib/game-data'
import { SectionHeading } from '@/components/section-heading'
import { CategoryCard } from '@/components/category-card'

export function Categories() {
  return (
    <section id="categorias" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Escolhe uma arena"
        title="Escolhe o teu desafio"
        description="18 temas oficiais, das raízes de Portugal ao Modo Maluco e Desafio Visual. Cada partida vale XP, euros virtuais e posição no ranking."
      />

      {/* Horizontal scroll on mobile, grid on larger screens */}
      <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <CategoryCard key={cat.name} cat={cat} />
        ))}
      </div>
    </section>
  )
}
