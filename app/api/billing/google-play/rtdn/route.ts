import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { logGooglePlayEvent, maskToken } from '@/lib/google-play-server'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * Endpoint de Recepção de Google Play Real-time Developer Notifications (RTDN via Google Cloud Pub/Sub).
 * Notificações para: OneTimeProductNotification (PURCHASED, CANCELED), VoidedPurchases.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))

    // O payload do Google Cloud Pub/Sub vem no formato { message: { data: "base64...", messageId: "..." } }
    const pubSubMessage = body?.message
    if (!pubSubMessage || !pubSubMessage.data) {
      return NextResponse.json({ success: true, ignored: true }, { status: 200 })
    }

    const decodedString = Buffer.from(pubSubMessage.data, 'base64').toString('utf8')
    let rtdnData: any = {}
    try {
      rtdnData = JSON.parse(decodedString)
    } catch {
      return NextResponse.json({ success: true, ignored: true }, { status: 200 })
    }

    const { packageName, oneTimeProductNotification, testNotification } = rtdnData

    if (testNotification) {
      console.log('[RTDN] Recebida notificação de teste do Google Play Console.')
      return NextResponse.json({ success: true, test: true })
    }

    // Tratamento de notificações de One-Time Products (Acordas / Consumíveis)
    if (oneTimeProductNotification) {
      const { notificationType, purchaseToken, sku } = oneTimeProductNotification
      const masked = maskToken(purchaseToken)

      console.log('[RTDN] OneTimeProductNotification recebida:', {
        notificationType,
        sku,
        maskedToken: masked,
      })

      // notificationType:
      // 1 = ONE_TIME_PRODUCT_PURCHASED
      // 2 = ONE_TIME_PRODUCT_CANCELED
      const db = getAdminFirestore()

      if (purchaseToken) {
        const hash = createHash('sha256').update(purchaseToken.trim()).digest('hex')
        const purchaseDocId = `gp_${hash}`
        const purchaseRef = db.collection('googlePlayPurchases').doc(purchaseDocId)

        if (notificationType === 2) {
          // ONE_TIME_PRODUCT_CANCELED ou revogado
          await purchaseRef.set(
            {
              revoked: true,
              revokedAt: FieldValue.serverTimestamp(),
              rtdnNotificationType: notificationType,
            },
            { merge: true }
          )

          logGooglePlayEvent('GOOGLE_PLAY_PURCHASE_FAILED', {
            productId: sku,
            maskedToken: masked,
            error: 'RTDN_ONE_TIME_PRODUCT_CANCELED',
          })
        }
      }
    }

    // Sempre responder 200 OK para confirmar recepção ao Google Cloud Pub/Sub
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[RTDN_EXCEPTION]', err)
    return NextResponse.json({ success: false, error: err?.message }, { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Google Play RTDN Webhook Acorda Portugal',
  })
}
