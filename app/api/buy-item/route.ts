/**
 * Rota de retrocompatibilidade para compras na loja.
 * Delega 100% da execução para a rota canónica autoritativa: /api/shop/purchase
 */
import { POST as shopPurchasePost } from '@/app/api/shop/purchase/route'

export const dynamic = 'force-dynamic'

export const POST = shopPurchasePost
