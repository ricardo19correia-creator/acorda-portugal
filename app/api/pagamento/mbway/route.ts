import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone, amount, itemId } = await req.json();
    const apiKey = process.env.EUPAGO_API_KEY || 'demo-f293-7179-0c7b-707';

    if (!phone || !amount) {
      return NextResponse.json({ error: 'Dados em falta' }, { status: 400 });
    }

    // Chamada oficial à API Sandbox da EuPago para iniciar transação MB WAY
    const cleanPhone = phone.replace(/\s+/g, '');
    const res = await fetch('https://sandbox.eupago.pt/api/v1.02/mbway/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chave: apiKey,
        valor: amount,
        alias: cleanPhone,
        identificador: `AP_${itemId}_${Date.now()}`,
        descricao: `Acorda Portugal - ${itemId}`,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na chamada EuPago:', error);
    return NextResponse.json({ error: 'Erro ao comunicar com a EuPago' }, { status: 500 });
  }
}
