'use client'

/**
 * Modal de conflito de sessão neutralizado em conformidade com o modo fail-open.
 * Retorna estritamente null para não interromper a jogabilidade.
 */
export interface SessionConflictModalProps {
  isOpen?: boolean
  onConfirm?: () => void
}

export const SessionConflictModal = (_props?: SessionConflictModalProps) => null

export default SessionConflictModal
