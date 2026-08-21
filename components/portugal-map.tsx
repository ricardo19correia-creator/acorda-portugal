'use client'

import React from 'react'
import { PortugalMap3D } from '@/components/PortugalMap3D'
import { cn } from '@/lib/utils'

/**
 * Interactive 3D Vector Portugal Map Component (replacing static PNG map)
 */
export function PortugalMap({
  className,
  selected,
  onSelect,
  children,
}: {
  className?: string
  selected?: string | null
  onSelect?: (name: string) => void
  float?: boolean
  rings?: boolean
  priority?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className={cn('relative w-full', className)}>
      <PortugalMap3D
        selectedDistrict={selected}
        onSelectDistrict={onSelect}
      />
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

export default PortugalMap
