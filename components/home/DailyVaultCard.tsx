'use client'

import React from 'react'
import { LobbyVaultObject } from '@/components/vault/LobbyVaultObject'

interface DailyVaultCardProps {
  className?: string
  onOpenVaultModal?: () => void
  onOpenAuth?: () => void
  isAuthenticated?: boolean
}

/**
 * @deprecated Use LobbyVaultObject directly for the physical 3D/2.5D game object in the lobby.
 */
export function DailyVaultCard({ onOpenAuth, isAuthenticated = true }: DailyVaultCardProps) {
  return <LobbyVaultObject onOpenAuth={onOpenAuth} isAuthenticated={isAuthenticated} />
}
