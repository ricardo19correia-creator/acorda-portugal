import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      problemType,
      type,
      email,
      userEmail,
      description,
      metadata = {},
    } = body

    const finalProblemType = problemType || type || 'Outro assunto'
    const finalEmail = (email || userEmail || '').trim()
    const finalDescription = (description || '').trim()

    // 1. Validações de campos obrigatórios
    if (!finalEmail || !EMAIL_REGEX.test(finalEmail)) {
      return NextResponse.json(
        { error: 'Por favor, introduz um endereço de email válido.' },
        { status: 400 }
      )
    }

    if (!finalDescription || finalDescription.length < 10) {
      return NextResponse.json(
        { error: 'A descrição do problema deve conter pelo menos 10 caracteres.' },
        { status: 400 }
      )
    }

    const {
      userAgent = 'N/A',
      screenResolution = 'N/A',
      url = 'N/A',
      page = '/ajuda',
      userId = null,
      userDisplayName = 'Anónimo',
      timestamp = new Date().toISOString(),
    } = metadata

    // 2. Gravação de Segurança no Firestore (Backup de Bilhetes de Suporte)
    const ticketData = {
      type: finalProblemType,
      description: finalDescription,
      userEmail: finalEmail,
      userId: userId || null,
      userDisplayName: userDisplayName || 'Anónimo',
      userAgent,
      screenResolution,
      url: url || page,
      createdAt: serverTimestamp(),
      submittedAt: timestamp,
      status: 'pendente',
      source: 'api_support',
    }

    try {
      await addDoc(collection(db, 'support_tickets'), ticketData)
      await addDoc(collection(db, 'reports'), ticketData)
    } catch (dbErr) {
      console.warn('Falha ao registar backup no Firestore:', dbErr)
    }

    // 3. Envio de Email via SMTP com Nodemailer
    const smtpHost = process.env.SMTP_HOST || 'mail.acordaportugal.pt'
    const smtpPort = Number(process.env.SMTP_PORT || 465)
    const smtpUser = process.env.SMTP_USER || 'suporte@acordaportugal.pt'
    const smtpPass = process.env.SMTP_PASS || ''
    const isSecure = smtpPort === 465

    if (smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #05070f; color: #f8fafc; margin: 0; padding: 20px; }
            .card { max-width: 620px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 24px; text-align: center; }
            .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
            .badge { display: inline-block; padding: 6px 12px; border-radius: 9999px; background: rgba(255,255,255,0.2); color: #ffffff; font-size: 12px; font-weight: bold; margin-top: 8px; }
            .content { padding: 24px; }
            .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 6px; }
            .desc-box { background: #020617; border: 1px solid #334155; border-radius: 12px; padding: 16px; font-size: 14px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap; margin-bottom: 20px; }
            .meta-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            .meta-table td { padding: 8px 12px; border-bottom: 1px solid #1e293b; color: #cbd5e1; }
            .meta-table td.label { font-weight: bold; color: #64748b; width: 35%; }
            .footer { background: #0b0f19; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>Novo Reporte de Problema</h1>
              <div class="badge">⚠️ ${finalProblemType}</div>
            </div>
            
            <div class="content">
              <div class="section-title">Email de Contacto</div>
              <p style="font-size: 15px; font-weight: bold; color: #34d399; margin: 0 0 20px 0;">
                <a href="mailto:${finalEmail}" style="color: #34d399; text-decoration: none;">${finalEmail}</a>
              </p>

              <div class="section-title">Descrição Detalhada</div>
              <div class="desc-box">${finalDescription}</div>

              <div class="section-title">Metadados Técnicos</div>
              <table class="meta-table">
                <tr><td class="label">Utilizador:</td><td>${userDisplayName} ${userId ? '(' + userId + ')' : ''}</td></tr>
                <tr><td class="label">Página / URL:</td><td>${url}</td></tr>
                <tr><td class="label">Navegador / SO:</td><td>${userAgent}</td></tr>
                <tr><td class="label">Resolução de Ecrã:</td><td>${screenResolution}</td></tr>
                <tr><td class="label">Data / Hora:</td><td>${new Date().toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })}</td></tr>
              </table>
            </div>

            <div class="footer">
              Acorda Portugal — Sistema de Suporte Automatizado &bull; Clica em "Responder" para falar diretamente com o utilizador.
            </div>
          </div>
        </body>
        </html>
      `

      await transporter.sendMail({
        from: `"Acorda Portugal - Suporte" <${smtpUser}>`,
        to: 'suporte@acordaportugal.pt',
        replyTo: finalEmail,
        subject: `[Novo Reporte] ${finalProblemType} - Acorda Portugal`,
        html: htmlContent,
        text: `Novo Reporte de Problema\n\nTipo: ${finalProblemType}\nEmail: ${finalEmail}\nUtilizador: ${userDisplayName}\n\nDescrição:\n${finalDescription}\n\nURL: ${url}\nDispositivo: ${userAgent}\nResolução: ${screenResolution}\nData: ${timestamp}`,
      })
    } else {
      console.log('SMTP_PASS não configurado no ambiente. Reporte guardado no Firestore com sucesso.')
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro na rota de suporte (/api/support):', error)
    return NextResponse.json(
      { error: 'Ocorreu um erro ao processar o teu reporte. Tenta novamente mais tarde.' },
      { status: 500 }
    )
  }
}
