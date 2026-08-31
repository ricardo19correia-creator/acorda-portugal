/**
 * Acorda Portugal — Gestor de Conectividade Resiliente & State Machine
 * 
 * Engenharia Robusta de Rede:
 * 1. Baseado em eventos passivos ('online' / 'offline' / 'visibilitychange'), sem polling agressivo que gaste bateria ou dispare falsos-positivos.
 * 2. Grace Period de 8 segundos para absorver transições móveis naturais (Wi-Fi <-> 4G/5G).
 * 3. Verificação pontual (on-demand) apenas sob ação do utilizador ou retorno de visibilidade.
 * 4. Sem bloqueios artificiais nem falsas instabilidades.
 */

export type ConnectionState = 'connected' | 'reconnecting' | 'offline'

export interface ConnectionStatusDetail {
  isOnline: boolean
  isConnected: boolean
  hasError: boolean
  state: ConnectionState
  lastChecked: number
}

export interface ConnectionStatusListener {
  (detail: ConnectionStatusDetail): void
}

class ConnectionManager {
  private state: ConnectionState = 'connected'
  private isOnline: boolean = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true
  private listeners: Set<ConnectionStatusListener> = new Set()
  private offlineGraceTimer: NodeJS.Timeout | null = null
  private lastSuccessfulCheck = Date.now()

  private readonly OFFLINE_GRACE_MS = 8000

  constructor() {
    if (typeof window !== 'undefined') {
      this.initListeners()
    }
  }

  private initListeners() {
    window.addEventListener('online', () => {
      console.log('[ConnectionManager] Evento ONLINE detetado. Ligação restaurada.')
      if (this.offlineGraceTimer) {
        clearTimeout(this.offlineGraceTimer)
        this.offlineGraceTimer = null
      }
      this.isOnline = true
      this.state = 'connected'
      this.lastSuccessfulCheck = Date.now()
      this.notify()
    })

    window.addEventListener('offline', () => {
      console.log('[ConnectionManager] Evento OFFLINE detetado. A aguardar Grace Period...')
      // Grace period para ignorar micro-oscilações de antena
      if (!this.offlineGraceTimer) {
        this.offlineGraceTimer = setTimeout(() => {
          if (typeof navigator !== 'undefined' && !navigator.onLine) {
            this.isOnline = false
            this.state = 'offline'
            console.warn('[ConnectionManager] Perda de rede confirmada após Grace Period.')
            this.notify()
          }
          this.offlineGraceTimer = null
        }, this.OFFLINE_GRACE_MS)
      }
    })

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          this.isOnline = true
          this.state = 'connected'
          this.notify()
        }
      }
    })
  }

  public getDetail(): ConnectionStatusDetail {
    return {
      isOnline: this.isOnline,
      isConnected: this.state === 'connected',
      hasError: this.state === 'offline',
      state: this.state,
      lastChecked: this.lastSuccessfulCheck,
    }
  }

  public subscribe(listener: ConnectionStatusListener): () => void {
    this.listeners.add(listener)
    listener(this.getDetail())
    return () => this.listeners.delete(listener)
  }

  private notify() {
    const detail = this.getDetail()
    this.listeners.forEach((listener) => {
      try {
        listener(detail)
      } catch (err) {
        console.warn('[ConnectionManager] Erro no listener:', err)
      }
    })
  }

  /**
   * Verificação manual acionada pelo utilizador (ex: clicar em 'Tentar Novamente')
   */
  public async checkConnection(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.isOnline = false
      this.state = 'offline'
      this.notify()
      return false
    }

    try {
      // Verificação leve de ping HTTP com timeout generoso (8s)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      const res = await fetch('/robots.txt', {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (res.ok || res.status < 500) {
        this.isOnline = true
        this.state = 'connected'
        this.lastSuccessfulCheck = Date.now()
        this.notify()
        return true
      }
    } catch {
      // Falha no ping pontual
    }

    // Se o browser diz que está online, consideramos online de forma tolerante a falhas
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.isOnline = true
      this.state = 'connected'
      this.notify()
      return true
    }

    this.isOnline = false
    this.state = 'offline'
    this.notify()
    return false
  }

  public async forceReconnect(): Promise<boolean> {
    return this.checkConnection()
  }
}

export const connectionManager = new ConnectionManager()

/**
 * Hook de conectividade para componentes React
 */
export function useConnectionStatus() {
  return connectionManager.getDetail()
}

export function useOnline(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true
}

export function useNetwork() {
  return connectionManager.getDetail()
}
