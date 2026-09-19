import { POST as feedbackPost } from '@/app/api/feedback/route'

export const dynamic = 'force-dynamic'

/**
 * Rota unificada de Suporte: delega com total fidelidade para a API oficial de feedback e tickets.
 * Garante persistência unificada no Firestore (coleção 'feedback'), validação rigorosa,
 * rate-limiting, envio de email oficial (Resend / SMTP) para suporte@acordaportugal.pt
 * e visualização imediata no Centro de Controlo Administrativo.
 */
export async function POST(req: Request) {
  return feedbackPost(req)
}
