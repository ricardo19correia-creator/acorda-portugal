'use client'

import React from 'react'
import { InteractiveDailyVault } from './InteractiveDailyVault'
import type { VaultRewardInfo } from '@/lib/vault-service'

interface DailyVaultViewProps {
  onRewardClaimed?: (reward: VaultRewardInfo, streak: number) => void
  onClose?: () => void
  isModal?: boolean
}

export function DailyVaultView({ onRewardClaimed, onClose, isModal = false }: DailyVaultViewProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <InteractiveDailyVault
        onRewardClaimed={onRewardClaimed}
        variant="page"
      />
    </div>
  )
}
