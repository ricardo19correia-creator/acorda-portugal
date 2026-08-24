import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <div className={cn(align === 'center' ? 'mx-auto max-w-2xl text-center' : 'text-left', className)}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)' }}>{eyebrow}</p>
      )}
      <h2
        className="mt-2 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl"
        style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)' }}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-pretty text-base leading-relaxed text-slate-300 font-medium" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)' }}>
          {description}
        </p>
      )}
    </div>
  )
}
