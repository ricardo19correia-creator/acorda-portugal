'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { District } from '@/lib/game-data'

type DistrictMapProps = {
  districts: District[]
  selectedDistrict: string
  onDistrictSelect: (districtName: string) => void
}

/**
 * Accessible district selector. The previous unused SVG source was truncated
 * and prevented TypeScript from parsing the project.
 */
export function DistrictMap({ districts, selectedDistrict, onDistrictSelect }: DistrictMapProps) {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="listbox" aria-label="Seleciona o teu distrito">
      {districts.map((district) => {
        const selected = district.name === selectedDistrict
        const hovered = district.name === hoveredDistrict

        return (
          <button
            key={district.name}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onDistrictSelect(district.name)}
            onMouseEnter={() => setHoveredDistrict(district.name)}
            onMouseLeave={() => setHoveredDistrict(null)}
            className={cn(
              'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
              selected
                ? 'border-primary bg-primary/20 text-primary'
                : hovered
                  ? 'border-white/20 bg-white/10 text-foreground'
                  : 'border-white/10 bg-card/60 text-muted-foreground',
            )}
          >
            {district.name}
          </button>
        )
      })}
    </div>
  )
}
