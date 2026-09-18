'use client'

import React from 'react'

export interface SessionConflictModalProps {
  isOpen?: boolean
  message?: string
  onConfirm?: () => void
}

/**
 * Componente inócuo mantido para retrocompatibilidade sem causar bloqueios ou redirecionamentos.
 * A aplicação suporta multi-dispositivo sem conflitos de sessão.
 */
export function SessionConflictModal(_props: SessionConflictModalProps) {
  return null
}

export default SessionConflictModal

