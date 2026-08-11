import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Reusable stylised Portugal map visual: glowing halo, faint orbiting rings and
 * a floating holographic map (mainland + Açores + Madeira, baked into the art).
 * `children` can be used to layer floating chips / markers on top.
 */
export function PortugalMap({
  className,
  float = true,
  rings = true,
  priority = false,
  children,
}: {
  className?: string
  float?: boolean
  rings?: boolean
  priority?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className={cn('relative aspect-square w-full', className)}>
      {/* glow halo */}
      <div className="animate-glow-pulse absolute inset-[12%] rounded-full bg-primary/25 blur-3xl" />
      <div
        className="animate-glow-pulse absolute inset-[22%] rounded-full bg-gold/10 blur-2xl"
        style={{ animationDelay: '1.6s' }}
      />

      {/* orbiting rings */}
      {rings && (
        <>
          <div className="animate-spin-slow absolute inset-[6%] rounded-full border border-primary/15" />
          <div className="animate-spin-reverse absolute inset-[16%] rounded-full border border-dashed border-primary/12" />
        </>
      )}

      {/* floating map */}
      <div className={cn('relative h-full w-full', float && 'animate-float')}>
        <Image
          src="/images/portugal-map.png"
          alt="Mapa estilizado de Portugal continental, Açores e Madeira"
          fill
          priority={priority}
          sizes="(max-width: 1024px) 90vw, 45vw"
          className="object-contain drop-shadow-[0_0_40px_oklch(0.76_0.19_150_/_0.35)]"
        />
        {children}
      </div>
    </div>
  )
}
