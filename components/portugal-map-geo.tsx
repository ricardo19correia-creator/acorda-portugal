'use client'

import React, { useEffect, useRef, useState } from 'react'
import { DISTRICT_MAP } from '@/lib/district-map'

export function PortugalMapGeo({
  className,
  selected,
  onSelect,
}: {
  className?: string
  selected?: string
  onSelect?: (name: string) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [svgLoaded, setSvgLoaded] = useState(false)

  useEffect(() => {
    let mounted = true
    const url = '/images/portugal-districts.svg'
    async function load() {
      try {
        const res = await fetch(url)
        const text = await res.text()
        if (!mounted) return
        if (containerRef.current) {
          containerRef.current.innerHTML = text
          setSvgLoaded(true)
        }
      } catch (err) {
        console.error('Failed to load SVG map', err)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!svgLoaded) return
    const container = containerRef.current
    if (!container) return

    // prepare mapping from district slug -> display name (from lib/district-map)
    const slugToName: Record<string, string> = {}
    for (const d of DISTRICT_MAP) {
      slugToName[d.slug] = d.name
    }

    const pathEls: Element[] = []

    // Attach events to paths with ids that start with 'district-'
    const nodes = container.querySelectorAll('[id^="district-"]')
    nodes.forEach((el) => {
      // ensure it's an SVG element that can be focused
      if (!(el instanceof SVGElement)) return
      const id = el.id // e.g., 'district-porto'
      const slug = id.replace(/^district-/, '')
      const name = slugToName[slug] ?? slug

      el.setAttribute('role', 'button')
      el.setAttribute('tabindex', '0')
      el.setAttribute('aria-label', `Distrito ${name}`)
      el.setAttribute('aria-pressed', 'false')

      const onClick = () => onSelect?.(name)
      const onKey = (ev: KeyboardEvent) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault()
          onSelect?.(name)
        }
      }
      const onEnter = () => el.classList.add('hover')
      const onLeave = () => el.classList.remove('hover')

      el.addEventListener('click', onClick)
      el.addEventListener('keydown', onKey)
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
      el.addEventListener('focus', onEnter)
      el.addEventListener('blur', onLeave)

      pathEls.push(el)
    })

    // Sync selected state
    function applySelected() {
      pathEls.forEach((el) => {
        const id = el.id
        const slug = id.replace(/^district-/, '')
        const mapped = DISTRICT_MAP.find((d) => d.slug === slug)
        const name = mapped?.name ?? slug
        if (name === selected) {
          el.classList.add('selected')
          el.setAttribute('aria-pressed', 'true')
        } else {
          el.classList.remove('selected')
          el.setAttribute('aria-pressed', 'false')
        }
      })
    }

    applySelected()

    return () => {
      // cleanup listeners
      pathEls.forEach((el) => {
        // remove all listeners by cloning node
        const clone = el.cloneNode(true) as Element
        el.parentNode?.replaceChild(clone, el)
      })
    }
  }, [svgLoaded, onSelect, selected])

  // keep a minimal wrapper style; visuals come from CSS and inline SVG styles
  return (
    <div className={className} ref={containerRef} style={{ width: '100%', height: 'auto' }} />
  )
}
