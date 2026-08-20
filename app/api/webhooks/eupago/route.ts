import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Webhook EuPago recebido:', body);

    // Validar se o pagamento foi concluído com sucesso
    if (body.sucesso === true || body.estado === 'paga' || body.transacao) {
      const identificador = body.identificador || '';
      console.log('Pagamento MB WAY validado com sucesso para:', identificador);
      // Aqui regista/desbloqueia o item na BD do jogador
    }

    return NextResponse.json({ sucesso: true, mensagem: 'Webhook processado' });
  } catch (error) {
    console.error('Erro no Webhook EuPago:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
