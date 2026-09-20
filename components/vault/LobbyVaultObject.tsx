'use client'

import React from 'react'
import { InteractiveDailyVault } from './InteractiveDailyVault'

interface LobbyVaultObjectProps {
  onOpenAuth?: () => void
  isAuthenticated?: boolean
}

export function LobbyVaultObject({ onOpenAuth, isAuthenticated = true }: LobbyVaultObjectProps) {
  return (
    <InteractiveDailyVault
      onOpenAuth={onOpenAuth}
      isAuthenticated={isAuthenticated}
      variant="home"
    />
  )
}
