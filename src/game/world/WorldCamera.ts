import type { Map } from 'maplibre-gl'
import type { DistrictItem } from '@/src/data/districts'
import type { WorldSector } from './WorldState'

export const SECTOR_BOUNDS: Record<WorldSector, [[number, number], [number, number]]> = {
  continente: [
    [-9.55, 36.95], // SW [lng, lat] (Cabo da Roca / Sagres / Algarve)
    [-6.18, 42.16], // NE [lng, lat] (Miranda do Douro / Melgaço)
  ],
  acores: [
    [-31.35, 36.92], // SW (Corvo/Flores até Santa Maria)
    [-24.95, 39.75], // NE (São Miguel / Graciosa)
  ],
  madeira: [
    [-17.35, 32.60], // SW (Ponta do Pargo / Desertas)
    [-16.25, 33.15], // NE (Porto Santo)
  ],
}

export class WorldCamera {
  private map: Map

  constructor(map: Map) {
    this.map = map
  }

  public isMobile(): boolean {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  }

  /**
   * Calculates responsive padding based on real container dimensions
   * to guarantee Portugal occupies 65% to 80% of useful viewport
   */
  public getSectorPadding(sector: WorldSector): { top: number; bottom: number; left: number; right: number } {
    let width = 1200
    let height = 800

    if (this.map && typeof this.map.getContainer === 'function') {
      const el = this.map.getContainer()
      if (el && el.clientWidth > 0 && el.clientHeight > 0) {
        width = el.clientWidth
        height = el.clientHeight
      }
    } else if (typeof window !== 'undefined') {
      width = window.innerWidth
      height = window.innerHeight
    }

    const isMobile = width < 768

    if (sector === 'continente') {
      if (isMobile) {
        return {
          top: Math.max(60, Math.round(height * 0.08)),
          bottom: Math.max(60, Math.round(height * 0.08)),
          left: Math.max(16, Math.round(width * 0.04)),
          right: Math.max(16, Math.round(width * 0.04)),
        }
      }

      // Desktop / Tablet:
      // Balanced padding guarantees mainland Portugal is 100% centered horizontally
      // and occupies 70%-80% of screen height without touching top HUD or bottom buttons
      const vertPad = Math.max(68, Math.round(height * 0.09))
      const horizPad = Math.max(48, Math.round(width * 0.12))

      return {
        top: vertPad,
        bottom: vertPad,
        left: horizPad,
        right: horizPad,
      }
    }

    if (sector === 'acores') {
      return {
        top: Math.max(70, Math.round(height * 0.10)),
        bottom: Math.max(70, Math.round(height * 0.10)),
        left: Math.max(28, Math.round(width * 0.06)),
        right: Math.max(28, Math.round(width * 0.06)),
      }
    }

    // Madeira
    return {
      top: Math.max(80, Math.round(height * 0.12)),
      bottom: Math.max(80, Math.round(height * 0.12)),
      left: Math.max(36, Math.round(width * 0.08)),
      right: Math.max(36, Math.round(width * 0.08)),
    }
  }

  /**
   * Fit camera into regional sector bounding box (Continente, Açores, Madeira)
   */
  public fitSector(sector: WorldSector, options?: { duration?: number; animate?: boolean }) {
    if (!this.map) return

    const bounds = SECTOR_BOUNDS[sector] || SECTOR_BOUNDS.continente
    const padding = this.getSectorPadding(sector)
    const animate = options?.animate ?? true
    const duration = animate ? (options?.duration ?? 850) : 0

    try {
      this.map.fitBounds(bounds, {
        padding,
        pitch: 0,   // Pure upright projection without tilt distortions
        bearing: 0, // Clean north orientation
        duration,
        animate,
        essential: true,
      })
    } catch (err) {
      console.warn('[WorldCamera] Erro em fitSector:', err)
    }
  }

  /**
   * Fly to predefined regional sectors using mathematical fitBounds
   */
  public goToSector(sector: WorldSector, duration = 850) {
    this.fitSector(sector, { duration, animate: true })
  }

  /**
   * Snappy, cinematic fitBounds to a specific selected district
   */
  public focusDistrict(district: DistrictItem, duration = 850) {
    if (!this.map) return

    const pad = this.isMobile() ? 40 : 80
    try {
      this.map.fitBounds(
        [
          district.bounds.southWest,
          district.bounds.northEast,
        ],
        {
          padding: pad,
          duration,
          pitch: this.isMobile() ? 15 : 25,
          bearing: 0,
          essential: true,
        }
      )
    } catch (err) {
      console.warn('[WorldCamera] Erro em focusDistrict:', err)
    }
  }

  /**
   * Quick reset to full Portugal view
   */
  public resetOverview(duration = 750) {
    this.fitSector('continente', { duration, animate: true })
  }

  public zoomIn() {
    this.map.zoomIn({ duration: 300 })
  }

  public zoomOut() {
    this.map.zoomOut({ duration: 300 })
  }
}
