'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import {
  PortugalSatelliteEngine,
  type MapSector,
} from '@/src/game/world/PortugalSatelliteEngine'
import {
  usePortugalVivoData,
  type PortugalVivoDistrict,
  type ResolvedPlayerPin,
} from '@/src/hooks/usePortugalVivoData'
import { useAuth } from '@/components/auth-provider'
import { sendRealHeartbeat } from '@/lib/real-presence'
import { PortugalAgoraHUD } from './PortugalAgoraHUD'
import { DistrictActionPanel } from './DistrictActionPanel'
import { PlayerContextCard } from './PlayerContextCard'
import { cn } from '@/lib/utils'

export interface PortugalVivoMapProps {
  initialDistrict?: string
  className?: string
  onSelectDistrict?: (district: PortugalVivoDistrict | null) => void
  onSelectPlayer?: (player: ResolvedPlayerPin | null) => void
}

// Cálculo de distância haversine em metros entre duas coordenadas geográficas
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export function PortugalVivoMap({
  initialDistrict,
  className,
  onSelectDistrict: externalSelectDistrict,
  onSelectPlayer: externalSelectPlayer,
}: PortugalVivoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<PortugalSatelliteEngine | null>(null)

  const { user, profile } = useAuth()
  const [isEngineReady, setIsEngineReady] = useState(false)
  const [currentSector, setCurrentSector] = useState<MapSector>('continente')
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(() => initialDistrict || null)
  const [selectedPlayer, setSelectedPlayer] = useState<ResolvedPlayerPin | null>(null)
  const [geoNoticeText, setGeoNoticeText] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  // 1. Hook de Dados Reais da Nação em Tempo Real (Firestore)
  const data = usePortugalVivoData(user?.uid)

  // Rastreio da última posição e timestamp enviados para evitar flooding
  const lastLocationRef = useRef<{ lat: number; lng: number; time: number } | null>(null)

  // 2. GPS Contínuo (navigator.geolocation.watchPosition) com throttling inteligente
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return

    // 2.1. Heartbeat inicial imediato com cache se existir
    let cachedCoords: [number, number] | undefined = undefined
    try {
      const cached = localStorage.getItem('ap_user_geo_coords') || sessionStorage.getItem('ap_user_geo_coords')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length === 2 && typeof parsed[0] === 'number') {
          cachedCoords = [parsed[0], parsed[1]]
        }
      }
    } catch {}

    if (user?.uid) {
      sendRealHeartbeat(
        user,
        profile,
        'browsing',
        cachedCoords,
        cachedCoords ? 15 : null,
        cachedCoords ? 'gps' : undefined
      )
    }

    // 2.2. watchPosition contínuo de alta precisão
    const handlePositionUpdate = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      const accuracy = Math.round(pos.coords.accuracy)
      const now = Date.now()

      const last = lastLocationRef.current
      if (last) {
        const distance = getDistanceMeters(last.lat, last.lng, lat, lng)
        const timeElapsed = now - last.time

        // Só enviar nova posição se houver alteração relevante (>= 25 metros) ou após 30 segundos
        if (distance < 25 && timeElapsed < 30_000) {
          return
        }
      }

      lastLocationRef.current = { lat, lng, time: now }
      const coords: [number, number] = [lng, lat]

      try {
        localStorage.setItem('ap_user_geo_coords', JSON.stringify(coords))
        sessionStorage.setItem('ap_user_geo_coords', JSON.stringify(coords))
      } catch {}

      if (user?.uid) {
        sendRealHeartbeat(user, profile, 'browsing', coords, accuracy, 'gps')
      }
    }

    let watchId: number | null = null
    try {
      watchId = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        () => {}, // Falhas silenciosas no watch não devem incomodar o utilizador
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 10000,
        }
      )
    } catch (e) {
      console.debug('[GPS] watchPosition não suportado:', e)
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [user?.uid, profile?.displayName, profile?.district, profile?.city])

  // Distrito selecionado derivado diretamente dos dados reativos
  const selectedDistrict = useMemo(() => {
    if (!selectedDistrictId) return null
    return data.districtMap.get(selectedDistrictId.toLowerCase()) || null
  }, [selectedDistrictId, data.districtMap])

  // 3. Inicialização do Motor MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (engineRef.current) return

    const engine = new PortugalSatelliteEngine({
      container: mapContainerRef.current,
      initialSector: 'continente',
      initialDistrictId,
      onSelectDistrict: (district) => {
        setSelectedPlayer(null)
        setSelectedDistrictId(district ? district.id : null)
        if (externalSelectDistrict) {
          externalSelectDistrict(district)
        }
      },
      onSelectPlayer: (player) => {
        setSelectedDistrictId(null)
        setSelectedPlayer(player)
        if (externalSelectPlayer) {
          externalSelectPlayer(player)
        }
      },
      onSectorChange: (sector) => {
        setCurrentSector(sector)
      },
      onReady: () => {
        setIsEngineReady(true)
      },
    })

    engineRef.current = engine

    const handleResize = () => {
      engine.resize()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      engine.destroy()
      engineRef.current = null
    }
  }, [initialDistrict, externalSelectDistrict, externalSelectPlayer]) // eslint-disable-line react-hooks/exhaustive-deps

  // 4. Propagação Reativa Instantânea para o Motor (Distritos e Jogadores Online)
  useEffect(() => {
    if (engineRef.current && isEngineReady && data.districts.length > 0) {
      engineRef.current.updateData(
        data.districts,
        [],
        data.onlinePlayers,
        []
      )
    }
  }, [data.districts, data.onlinePlayers, isEngineReady])

  // 5. Seleção de Setor (Continente | Açores | Madeira)
  const handleSelectSector = useCallback((sector: MapSector) => {
    setCurrentSector(sector)
    setSelectedDistrictId(null)
    setSelectedPlayer(null)
    engineRef.current?.fitSector(sector)
  }, [])

  // 6. Botão "Minha Localização" (Sem condições impeditivas — Pede GPS Real e Voa para a Posição)
  const handleLocateMe = useCallback(() => {
    if (isLocating || !engineRef.current) return
    setIsLocating(true)
    setGeoNoticeText('A obter sinal GPS de alta precisão...')

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false)
          const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude]
          const accuracy = Math.round(pos.coords.accuracy)

          try {
            localStorage.setItem('ap_user_geo_coords', JSON.stringify(coords))
            sessionStorage.setItem('ap_user_geo_coords', JSON.stringify(coords))
          } catch {}

          // Atualizar Firestore com GPS real e atualizar marcador
          if (user?.uid) {
            sendRealHeartbeat(user, profile, 'browsing', coords, accuracy, 'gps')
          }

          // Voar suavemente até à posição real com zoom aproximado
          engineRef.current?.locateUser(coords, 14)
          setGeoNoticeText('📍 GPS Confirmado — Centrado na tua posição!')
          setTimeout(() => setGeoNoticeText(null), 3500)
        },
        (err) => {
          setIsLocating(false)
          console.debug('[GPS] Erro de geolocalização:', err?.message)

          // Se tiver posição de concelho ou cache prévia
          if (data.currentUserPin?.coords) {
            engineRef.current?.locateUser(data.currentUserPin.coords, 13)
            setGeoNoticeText(
              `Localização aproximada por concelho (${data.currentUserPin.city || data.currentUserPin.district}).`
            )
          } else {
            const userDistrict = profile?.district || 'Lisboa'
            const targetDist = data.districtMap.get(userDistrict.toLowerCase())
            if (targetDist) {
              engineRef.current?.locateUser(targetDist.center, 11)
              setSelectedDistrictId(targetDist.id)
              setGeoNoticeText(`Focado no distrito de ${targetDist.name}.`)
            } else {
              engineRef.current?.fitSector('continente')
              setGeoNoticeText('GPS indisponível — a mostrar Continente.')
            }
          }
          setTimeout(() => setGeoNoticeText(null), 4000)
        },
        { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
      )
    } else {
      setIsLocating(false)
      if (data.currentUserPin?.coords) {
        engineRef.current?.locateUser(data.currentUserPin.coords, 13)
        setGeoNoticeText(`Navegador sem GPS — a focar concelho de ${data.currentUserPin.city || data.currentUserPin.district}.`)
      }
      setTimeout(() => setGeoNoticeText(null), 3500)
    }
  }, [isLocating, data.currentUserPin, data.districtMap, user, profile])

  // 7. Repor Visão Nacional
  const handleResetView = useCallback(() => {
    setSelectedDistrictId(null)
    setSelectedPlayer(null)
    engineRef.current?.clearSelection()
  }, [])

  // 8. Alternar Modo 3D
  const handleToggle3D = useCallback(() => {
    engineRef.current?.toggle3D()
  }, [])

  const handleZoomIn = useCallback(() => {
    engineRef.current?.zoomIn()
  }, [])

  const handleZoomOut = useCallback(() => {
    engineRef.current?.zoomOut()
  }, [])

  return (
    <div
      className={cn(
        'relative w-full h-full min-h-[100dvh] overflow-hidden bg-slate-950 select-none touch-none',
        className
      )}
    >
      {/* HUD Superior Minimalista Oficial */}
      <PortugalAgoraHUD
        onlineCount={data.onlineCount}
        currentSector={currentSector}
        onSelectSector={handleSelectSector}
        onToggle3D={handleToggle3D}
        onResetView={handleResetView}
        onLocateMe={handleLocateMe}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        isLocating={isLocating}
        geoNoticeText={geoNoticeText}
      />

      {/* Contentor do Mapa MapLibre GL */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[100dvh] cursor-grab active:cursor-grabbing outline-none"
      />

      {/* Painel Contextual de Distrito Selecionado */}
      {selectedDistrict && (
        <DistrictActionPanel
          district={selectedDistrict}
          onClose={() => {
            setSelectedDistrictId(null)
            engineRef.current?.clearSelection()
          }}
        />
      )}

      {/* Painel Contextual de Jogador Selecionado */}
      {selectedPlayer && (
        <PlayerContextCard
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  )
}
