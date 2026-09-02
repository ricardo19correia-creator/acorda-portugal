import { NextResponse } from 'next/server'
import { getPaymentConfigStatus, getUserVipEntitlements } from '@/lib/vip-service'
import { getAllVipProducts } from '@/src/data/vipCatalog'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    const configStatus = getPaymentConfigStatus()
    const products = getAllVipProducts()

    let userEntitlements: Record<string, any> = {}
    if (userId && !userId.startsWith('guest_')) {
      userEntitlements = await getUserVipEntitlements(userId)
    }

    return NextResponse.json({
      success: true,
      providerConfig: configStatus,
      totalVipProducts: products.length,
      products,
      userEntitlements,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao carregar estado VIP.' },
      { status: 500 },
    )
  }
}
