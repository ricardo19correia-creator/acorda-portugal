'use client'

import { cn } from '@/lib/utils'

export function PortugalMapIntro({ startAnimation }: { startAnimation: boolean }) {
  return (
    <svg
      viewBox="0 0 200 300"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="map-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g
        className={cn(
          'map-container',
          startAnimation ? 'animate-map-container' : ''
        )}
      >
        {/* Mainland */}
        <path
          className="map-outline"
          d="M86.3,286.6L29.5,210.1l-3.8-53.3l20.9-44.1l18-47.2l-23-40.3L76.2,8.6l71.5,1.5l48.3,19.3l37.9,32.4l30.4-1.5l22.7,21.3l18.3,24.3l10.6,35l-16.7,31.2l12.2,35.7l-18.3,39.5l12.2,41.8l-27.4,35.7l-29,37.2l15.2,48.6l-44.1,41.8l-45.6,33.4l-74.5-3.8l-32-22.8l-30.4-30.4l-21.3-32.4l-12.2-32.4l13.7-48.6L86.3,286.6z"
        />
        {/* Azores */}
        <path className="map-islands" d="M15,180 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0 M5,195 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0" />
        {/* Madeira */}
        <path className="map-islands" d="M40,280 a6,4 0 1,0 12,0 a6,4 0 1,0 -12,0" />
      </g>
    </svg>
  )
}