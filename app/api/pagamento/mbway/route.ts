import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, amount, itemId } = body;

    const apiKey = 'demo-f293-7179-0c7b-707';
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const cleanAmount = Number(amount || 2.99);
    const cleanId = `AP_${itemId || 'item'}_${Date.now()}`;

    // Endpoint oficial REST Sandbox da EuPago
    const res = await fetch('https://sandbox.eupago.pt/clientes/rest_api/mbway/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        chave: apiKey,
        valor: cleanAmount,
        alias: cleanPhone,
        id: cleanId,
        descricao: `Acorda Portugal - ${itemId || 'compra'}`,
      }),
    });

    const data = await res.json();
    console.log('EuPago Response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na rota MB WAY:', error);
    return NextResponse.json({ error: 'Falha de comunicação com gateway' }, { status: 500 });
  }
}
