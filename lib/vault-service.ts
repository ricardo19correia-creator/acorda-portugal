/**
 * 🇵🇹 ACORDA PORTUGAL — SERVIÇO CLIENTE DO COFRE DIÁRIO (SSOT)
 */

import { auth } from '@/lib/firebase'
import type { VaultRewardKey } from '@/lib/vault-config'

export interface VaultRewardInfo {
  id: VaultRewardKey
  type: 'acordas' | 'aid'
  amount: number
  label: string
  shortLabel: string
  icon: string
  aidId?: 'AID_002' | 'AID_003' | 'AID_004' | null
  description?: string
}

export interface VaultStatusResponse {
  ok: boolean
  success: boolean
  vaultEnabled: boolean
  canClaim: boolean
  cooldownRemainingMs: number
  nextAvailableAt: number
  currentStreak: number
  displayedStreak: number
  bestStreak: number
  totalOpened: number
  totalAcordasWon: number
  totalAidsWon: number
  lastReward: any
  lastOpenedAt: number | null
  isDay7Special: boolean
  serverTime: number
  error?: string
  code?: string
}

export interface VaultClaimResponse {
  ok: boolean
  success: boolean
  idempotent?: boolean
  claimId: string
  reward: VaultRewardInfo
  streak: number
  bestStreak: number
  isDay7Special: boolean
  openedAt: number
  newCoinsTotal?: number | null
  cooldownRemainingMs: number
  nextAvailableAt: number
  error?: string
  code?: string
  message?: string
}

/**
 * Obtém o Firebase ID Token atual
 */
async function getIdToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  try {
    if (auth && auth.currentUser) {
      return await auth.currentUser.getIdToken(false)
    }
  } catch (err) {
    console.warn('[VAULT_SERVICE] Falha ao obter idToken:', err)
  }
  return null
}

/**
 * Consulta o estado atual do cofre diário no servidor
 */
export async function fetchVaultStatus(): Promise<VaultStatusResponse | null> {
  try {
    const token = await getIdToken()
    if (!token) return null

    const res = await fetch('/api/vault/status', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache',
      },
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.warn('[VAULT_SERVICE] Erro ao consultar estado:', errData)
      return null
    }

    return await res.json()
  } catch (err) {
    console.error('[VAULT_SERVICE] Exceção em fetchVaultStatus:', err)
    return null
  }
}

/**
 * Executa a operação de abertura autoritativa do Cofre Diário
 */
export async function claimDailyVault(clientClaimId?: string): Promise<VaultClaimResponse> {
  const token = await getIdToken()
  if (!token) {
    return {
      ok: false,
      success: false,
      code: 'AUTH_REQUIRED',
      error: 'Precisas de iniciar sessão para abrir o Cofre Diário.',
      claimId: '',
      reward: null as any,
      streak: 0,
      bestStreak: 0,
      isDay7Special: false,
      openedAt: 0,
      cooldownRemainingMs: 0,
      nextAvailableAt: 0,
    }
  }

  // Gerar claimId de idempotência se não fornecido
  const claimId =
    clientClaimId ||
    `dvc_${auth.currentUser?.uid || 'user'}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  try {
    const res = await fetch('/api/vault/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ claimId }),
    })

    const data: VaultClaimResponse = await res.json()

    // Se foi atribuída recompensa com sucesso, sincronizar a interface global
    if (res.ok && data.success && data.reward) {
      if (typeof window !== 'undefined') {
        // 1. Atualizar saldo se for Acordas
        if (data.reward.type === 'acordas' && typeof data.newCoinsTotal === 'number') {
          try {
            localStorage.setItem('user_coins', String(data.newCoinsTotal))
          } catch {}
          window.dispatchEvent(
            new CustomEvent('balance_updated', { detail: { coins: data.newCoinsTotal } })
          )
        }

        // 2. Atualizar inventário se for Ajuda
        if (data.reward.type === 'aid' && data.reward.aidId) {
          window.dispatchEvent(new CustomEvent('inventory_updated'))
          window.dispatchEvent(new CustomEvent('consumables_updated'))
        }

        // 3. Atualizar perfil e cofre
        window.dispatchEvent(
          new CustomEvent('profile_updated', {
            detail: {
              streak: data.streak,
              bestStreak: data.bestStreak,
              ...(typeof data.newCoinsTotal === 'number' ? { coins: data.newCoinsTotal } : {}),
            },
          })
        )
        window.dispatchEvent(new CustomEvent('vault_updated', { detail: data }))
      }
    }

    return data
  } catch (err: any) {
    console.error('[VAULT_SERVICE] Exceção ao abrir cofre:', err)
    return {
      ok: false,
      success: false,
      code: 'NETWORK_ERROR',
      error: err?.message || 'Falha de rede ao contactar o servidor.',
      claimId,
      reward: null as any,
      streak: 0,
      bestStreak: 0,
      isDay7Special: false,
      openedAt: 0,
      cooldownRemainingMs: 0,
      nextAvailableAt: 0,
    }
  }
}

/**
 * Formata milissegundos restantes para exibição legível (ex: 23h 59m 45s)
 */
export function formatCooldownTime(ms: number, includeSeconds = true): string {
  if (ms <= 0) return '00:00'

  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    if (includeSeconds) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
    }
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`
  }

  return `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
}
