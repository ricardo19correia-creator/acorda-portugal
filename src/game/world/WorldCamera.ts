import type { Map } from 'maplibre-gl'
import type { DistrictItem } from '@/src/data/districts'
import type { WorldSector } from './WorldState'

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
   * Snappy, cinematic flyTo to a specific district
   */
  public focusDistrict(district: DistrictItem, duration = 850) {
    if (!this.map) return

    const mobile = this.isMobile()
    const targetZoom = mobile ? Math.max(7.2, district.zoom - 0.8) : district.zoom

    this.map.flyTo({
      center: district.center,
      zoom: targetZoom,
      pitch: mobile ? 30 : district.pitch || 40,
      bearing: district.bearing || -6,
      speed: 1.8,
      curve: 1.3,
      duration,
      essential: true,
    })
  }

  /**
   * Fit camera into bounding box with padding
   */
  public fitDistrictBounds(district: DistrictItem, duration = 800) {
    if (!this.map) return
    const pad = this.isMobile() ? 40 : 80
    this.map.fitBounds(
      [
        district.bounds.southWest,
        district.bounds.northEast,
      ],
      {
        padding: pad,
        duration,
        pitch: this.isMobile() ? 25 : 38,
        essential: true,
      }
    )
  }

  /**
   * Fly to predefined regional sectors
   */
  public goToSector(sector: WorldSector, duration = 900) {
    if (!this.map) return
    const mobile = this.isMobile()

    if (sector === 'acores') {
      this.map.flyTo({
        center: [-26.5, 38.2],
        zoom: mobile ? 5.8 : 6.8,
        pitch: 35,
        bearing: 0,
        speed: 1.8,
        duration,
        essential: true,
      })
    } else if (sector === 'madeira') {
      this.map.flyTo({
        center: [-16.95, 32.75],
        zoom: mobile ? 8.2 : 9.2,
        pitch: 40,
        bearing: 10,
        speed: 1.8,
        duration,
        essential: true,
      })
    } else {
      // Mainland Continente
      this.map.flyTo({
        center: [-8.2245, 39.55],
        zoom: mobile ? 5.4 : 6.3,
        pitch: mobile ? 28 : 38,
        bearing: -4,
        speed: 1.8,
        duration,
        essential: true,
      })
    }
  }

  /**
   * Quick reset to full Portugal view
   */
  public resetOverview(duration = 750) {
    this.goToSector('continente', duration)
  }

  public zoomIn() {
    this.map.zoomIn({ duration: 300 })
  }

  public zoomOut() {
    this.map.zoomOut({ duration: 300 })
  }
}
