import { db } from '@/lib/firebase'
import { doc, getDoc, collection, getDocs, setDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore'
import { getVipProductById, type VipProduct, type VipCategory } from '@/src/data/vipCatalog'

export interface VipEntitlementData {
  productId: string
  sku: string
  category: VipCategory
  acquisitionType: 'vip_real_money'
  acquiredAt: any
  paymentId: string
  status: 'active' | 'revoked' | 'refunded'
  entitlementType: 'permanent'
  priceCents: number
  currency: 'EUR'
  revokedAt?: any
}

export type PaymentConfigStatus = 'READY' | 'BLOCKED_PENDING_PROVIDER_CONFIG'

/**
 * Retorna o status de configuração do fornecedor de pagamentos reais.
 * Se a chave STRIPE_SECRET_KEY não existir no ambiente do servidor,
 * retorna explicitamente BLOCKED_PENDING_PROVIDER_CONFIG.
 */
export function getPaymentConfigStatus(): { status: PaymentConfigStatus; provider: string; message?: string } {
  const hasStripeSecret = Boolean(process.env.STRIPE_SECRET_KEY)
  if (!hasStripeSecret) {
    return {
      status: 'BLOCKED_PENDING_PROVIDER_CONFIG',
      provider: 'stripe',
      message: 'PAYMENT_PROVIDER_CONFIGURATION_REQUIRED: STRIPE_SECRET_KEY não configurada no ambiente do servidor.',
    }
  }
  return {
    status: 'READY',
    provider: 'stripe',
  }
}

/**
 * Verifica se um utilizador possui um entitlement ativo para determinado produto VIP no Firestore.
 */
export async function hasActiveVipEntitlement(userId: string, productId: string): Promise<boolean> {
  if (!userId || !productId) return false
  if (userId.startsWith('guest_')) return false

  try {
    const entitlementRef = doc(db, 'users', userId, 'entitlements', productId)
    const snap = await getDoc(entitlementRef)
    if (snap.exists()) {
      const data = snap.data()
      return data.status === 'active'
    }

    // Fallback de verificação no documento do utilizador
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    if (userSnap.exists()) {
      const udata = userSnap.data()
      const entitlementsList: string[] = udata.vipEntitlements || []
      if (entitlementsList.includes(productId)) return true
      const inventory = udata.inventory || {}
      if (inventory[productId] && inventory[productId] > 0) return true
    }
  } catch (error) {
    console.error(`[VIP SERVICE] Erro ao verificar entitlement para ${userId}/${productId}:`, error)
  }

  return false
}

/**
 * Lista todos os entitlements VIP ativos de um utilizador.
 */
export async function getUserVipEntitlements(userId: string): Promise<Record<string, VipEntitlementData>> {
  if (!userId || userId.startsWith('guest_')) return {}

  const results: Record<string, VipEntitlementData> = {}

  try {
    const entitlementsCol = collection(db, 'users', userId, 'entitlements')
    const querySnap = await getDocs(entitlementsCol)
    querySnap.forEach((docSnap) => {
      const data = docSnap.data() as VipEntitlementData
      if (data.status === 'active') {
        results[docSnap.id] = data
      }
    })

    // Complementar com vipEntitlements array no perfil se a subcoleção estiver vazia
    if (Object.keys(results).length === 0) {
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        const udata = userSnap.data()
        const vipIds: string[] = udata.vipEntitlements || []
        vipIds.forEach((pid) => {
          const p = getVipProductById(pid)
          if (p) {
            results[pid] = {
              productId: p.id,
              sku: p.sku,
              category: p.category,
              acquisitionType: 'vip_real_money',
              acquiredAt: new Date().toISOString(),
              paymentId: 'legacy_or_profile_granted',
              status: 'active',
              entitlementType: 'permanent',
              priceCents: p.priceCents,
              currency: 'EUR',
            }
          }
        })
      }
    }
  } catch (error) {
    console.error(`[VIP SERVICE] Erro ao listar entitlements de ${userId}:`, error)
  }

  return results
}

/**
 * Atribui de forma server-authoritative o entitlement VIP no Firestore.
 */
export async function grantVipEntitlement(
  userId: string,
  product: VipProduct,
  paymentId: string,
): Promise<boolean> {
  if (!userId || !product) return false

  try {
    const entitlementRef = doc(db, 'users', userId, 'entitlements', product.id)
    const userRef = doc(db, 'users', userId)

    const entitlementData: VipEntitlementData = {
      productId: product.id,
      sku: product.sku,
      category: product.category,
      acquisitionType: 'vip_real_money',
      acquiredAt: serverTimestamp(),
      paymentId,
      status: 'active',
      entitlementType: 'permanent',
      priceCents: product.priceCents,
      currency: 'EUR',
    }

    // Criar subdocumento de entitlement canónico
    await setDoc(entitlementRef, entitlementData, { merge: true })

    // Atualizar arrays e inventário de perfil do utilizador
    const updates: Record<string, any> = {
      [`inventory.${product.id}`]: 1,
      vipEntitlements: arrayUnion(product.id),
      updatedAt: serverTimestamp(),
    }

    if (product.category === 'avatar') {
      updates['inventory.avatars'] = arrayUnion(product.id)
      updates['unlockedAvatars'] = arrayUnion(product.id)
    } else if (product.category === 'frame') {
      updates['inventory.frames'] = arrayUnion(product.id)
      updates['unlockedFrames'] = arrayUnion(product.id)
    } else if (product.category === 'title') {
      updates['inventory.titles'] = arrayUnion(product.id)
      updates['ownedTitleIds'] = arrayUnion(product.id)
    } else if (product.category === 'arena') {
      updates['inventory.arenas'] = arrayUnion(product.id)
      updates['unlockedArenas'] = arrayUnion(product.id)
    } else if (product.category === 'emote') {
      updates['inventory.emotes'] = arrayUnion(product.id)
      updates['unlockedEmotes'] = arrayUnion(product.id)
    } else if (product.category === 'tauntpack') {
      updates['inventory.tauntpacks'] = arrayUnion(product.id)
      updates['unlockedTauntPacks'] = arrayUnion(product.id)
      // Desbloquear também as frases individuais do pack
      if (product.taunts) {
        product.taunts.forEach((t) => {
          updates[`inventory.taunts`] = arrayUnion(t.id)
        })
      }
    }

    await updateDoc(userRef, updates)
    return true
  } catch (error) {
    console.error(`[VIP SERVICE] Falha ao conceder entitlement para ${userId}/${product.id}:`, error)
    return false
  }
}

/**
 * Revoga um entitlement VIP (por exemplo, em caso de reembolso ou estorno legítimo).
 */
export async function revokeVipEntitlement(userId: string, productId: string): Promise<boolean> {
  if (!userId || !productId) return false

  try {
    const entitlementRef = doc(db, 'users', userId, 'entitlements', productId)
    const userRef = doc(db, 'users', userId)

    await updateDoc(entitlementRef, {
      status: 'revoked',
      revokedAt: serverTimestamp(),
    })

    await updateDoc(userRef, {
      vipEntitlements: arrayRemove(productId),
      [`inventory.${productId}`]: 0,
      updatedAt: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error(`[VIP SERVICE] Falha ao revogar entitlement ${userId}/${productId}:`, error)
    return false
  }
}
