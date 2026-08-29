'use client'

/**
 * Componente neutralizado de acordo com a regra de tolerância a falhas e modo silencioso.
 * Retorna estritamente null para não renderizar qualquer overlay ou bloqueio no DOM.
 */
export const OnlineConnectionStatus = () => null
export const NetworkErrorModal = () => null
export const ConnectionGuard = () => null
export const ConnectivityGuard = () => null
export const OfflineOverlay = () => null

export default OnlineConnectionStatus
