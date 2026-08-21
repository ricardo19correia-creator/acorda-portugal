import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface MbwayRequestBody {
  phone?: string
  amount?: number
  itemId?: string
  userId?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: MbwayRequestBody = await req.json().catch(() => ({}))
    const { phone, amount, itemId, userId } = body

    // 1. Validação estrita do número de telefone português (9 dígitos)
    const cleanPhone = String(phone || '').replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length !== 9 || !/^9\d{8}$/.test(cleanPhone)) {
      return NextResponse.json(
        {
          sucesso: false,
          error: 'Número de telemóvel inválido. Insira um número português com 9 dígitos (ex: 912345678).',
        },
        { status: 400 },
      )
    }

    // 2. Validação do montante
    const cleanAmount = Number(amount)
    if (!cleanAmount || cleanAmount <= 0) {
      return NextResponse.json(
        {
          sucesso: false,
          error: 'Montante inválido para transação.',
        },
        { status: 400 },
      )
    }

    const apiKey = process.env.EUPAGO_API_KEY || 'demo-f293-7179-0c7b-707'
    const isSandbox = process.env.EUPAGO_SANDBOX !== 'false'
    const gatewayUrl = isSandbox
      ? 'https://sandbox.eupago.pt/clientes/rest_api/mbway/create'
      : 'https://clientes.eupago.pt/clientes/rest_api/mbway/create'

    // Formato de identificador único: userId:itemId:timestamp
    const userIdentifier = userId ? `${userId}:${itemId || 'compra'}` : `guest:${itemId || 'compra'}`
    const orderId = `AP_${Date.now()}_${cleanPhone.slice(-4)}`

    // 3. Chamada defensiva à API REST EuPago
    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        chave: apiKey,
        valor: cleanAmount,
        alias: cleanPhone,
        id: orderId,
        identificador: userIdentifier,
        descricao: `Acorda Portugal - ${itemId || 'Apoio Nacional'}`,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[MB WAY ERROR]: Gateway returned status', response.status, errorText)
      return NextResponse.json(
        {
          sucesso: false,
          error: 'Não foi possível comunicar com o gateway da euPago. Tente novamente mais tarde.',
        },
        { status: 502 },
      )
    }

    const data = await response.json()
    console.log('[MB WAY SUCCESS]:', data)

    return NextResponse.json({
      sucesso: data.sucesso !== false,
      referencia: data.referencia || orderId,
      transacao: data.transacao || null,
      mensagem: data.resposta || 'Pedido MB WAY enviado com sucesso. Confirme a notificação no seu telemóvel.',
      dados: data,
    })
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Falha desconhecida'
    console.error('[MB WAY EXCEPTION]:', errorMsg)
    return NextResponse.json(
      {
        sucesso: false,
        error: 'Erro interno ao processar o pedido MB WAY.',
      },
      { status: 500 },
    )
  }
}
