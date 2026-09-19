import nodemailer from 'nodemailer'
import { FEEDBACK_TYPES, type FeedbackType } from '@/types/feedback'

export interface FeedbackEmailPayload {
  feedbackId: string
  userName: string
  userEmail: string
  userId: string
  type: FeedbackType | string
  title?: string
  message: string
  location?: string
  reproductionSteps?: string
  pageUrl?: string
  device?: string
  date?: string
}

export function getFeedbackTypeLabel(type: string): string {
  const found = FEEDBACK_TYPES.find((t) => t.id === type)
  if (found) return found.label
  return type || 'Geral'
}

export interface EmailServiceStatus {
  configured: boolean
  provider: 'resend' | 'smtp' | 'none'
  details?: string
}

/**
 * Verifica se existe algum provedor de email configurado no ambiente.
 */
export function checkEmailConfig(): EmailServiceStatus {
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 0) {
    return { configured: true, provider: 'resend' }
  }
  const smtpHost = process.env.SMTP_HOST
  const smtpPass = process.env.SMTP_PASS
  if (smtpHost && smtpPass) {
    return { configured: true, provider: 'smtp' }
  }
  return {
    configured: false,
    provider: 'none',
    details: 'Nenhum serviço de email configurado no servidor.',
  }
}

/**
 * Cria o transporter Nodemailer configurado com as variáveis de ambiente do sistema.
 */
export function createMailTransporter() {
  const smtpHost = process.env.SMTP_HOST || 'authsmtp.amen.pt'
  const smtpPort = Number(process.env.SMTP_PORT || (process.env.SMTP_SECURE === 'true' ? 465 : 587))
  const smtpUser = process.env.SMTP_USER || 'suporte@acordaportugal.pt'
  const smtpPass = process.env.SMTP_PASS || ''
  const isSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : smtpPort === 465

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: isSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    connectionTimeout: 8000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
    },
  })
}

/**
 * Dispara o email oficial de novo feedback para suporte@acordaportugal.pt
 */
export async function sendFeedbackNotificationEmail(
  payload: FeedbackEmailPayload
): Promise<{ success: boolean; messageId: string }> {
  const {
    feedbackId,
    userName,
    userEmail,
    userId,
    type,
    title,
    message,
    location,
    reproductionSteps,
    pageUrl = 'https://acordaportugal.pt/feedback',
    device = 'Web / Desconhecido',
    date,
  } = payload

  const typeLabel = getFeedbackTypeLabel(type)
  const formattedDate =
    date ||
    new Date().toLocaleString('pt-PT', {
      timeZone: 'Europe/Lisbon',
      dateStyle: 'full',
      timeStyle: 'medium',
    })

  // 1. Assunto canónico exigido
  const subject = `[NOVO FEEDBACK] Desafio Nacional — ${typeLabel}`

  // 2. Corpo em Texto Simples Canónico exigido
  const plainText = `NOVO FEEDBACK — ACORDA PORTUGAL
Desafio Nacional — Beta Público

Utilizador:
${userName}

Email:
${userEmail || 'Não fornecido'}

UID:
${userId}

Tipo:
${typeLabel}

Data:
${formattedDate}

ID do Feedback:
${feedbackId}

Mensagem:
${title ? `[${title}]\n` : ''}${message}${reproductionSteps ? `\n\nPassos para Reproduzir:\n${reproductionSteps}` : ''}${location ? `\n\nLocal onde aconteceu: ${location}` : ''}

Informações adicionais:
Página:
${pageUrl}

Dispositivo:
${device}

Este feedback foi enviado através de:
https://acordaportugal.pt/feedback`

  // 3. Corpo HTML Profissional e Responsivo
  const htmlBody = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 24px 12px;
      background-color: #05070f;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f1f5f9;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 640px;
      margin: 0 auto;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%);
      padding: 30px 24px;
      text-align: center;
      border-bottom: 1px solid #10b981;
    }
    .brand-title {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #a7f3d0;
      margin: 0 0 6px 0;
    }
    .main-title {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .badge {
      display: inline-block;
      margin-top: 12px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 9999px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 28px 24px;
    }
    .field-group {
      margin-bottom: 20px;
    }
    .label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    .value-box {
      background: #020617;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 16px;
      font-size: 14px;
      line-height: 1.6;
      color: #f8fafc;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .table-info {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 22px;
      font-size: 13px;
      background: #020617;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #1e293b;
    }
    .table-info td {
      padding: 10px 14px;
      border-bottom: 1px solid #1e293b;
    }
    .table-info tr:last-child td {
      border-bottom: none;
    }
    .table-info td.name {
      width: 32%;
      color: #94a3b8;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .table-info td.val {
      color: #f1f5f9;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 12px;
    }
    .action-btn {
      display: inline-block;
      background: #10b981;
      color: #022c22;
      font-size: 13px;
      font-weight: 800;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 10px;
    }
    .footer {
      background: #090d16;
      padding: 20px 24px;
      text-align: center;
      border-top: 1px solid #1e293b;
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
    }
    .footer a {
      color: #34d399;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand-title">Acorda Portugal &bull; Desafio Nacional</div>
      <h1 class="main-title">Novo Feedback Recebido</h1>
      <div class="badge">${typeLabel}</div>
    </div>

    <div class="content">
      <table class="table-info">
        <tr>
          <td class="name">Utilizador</td>
          <td class="val" style="color: #34d399; font-weight: bold;">${userName}</td>
        </tr>
        <tr>
          <td class="name">Email</td>
          <td class="val">
            ${userEmail ? `<a href="mailto:${userEmail}" style="color: #38bdf8; text-decoration: none;">${userEmail}</a>` : '<span style="color: #64748b;">Não fornecido</span>'}
          </td>
        </tr>
        <tr>
          <td class="name">UID</td>
          <td class="val">${userId}</td>
        </tr>
        <tr>
          <td class="name">Tipo</td>
          <td class="val">${typeLabel}</td>
        </tr>
        <tr>
          <td class="name">Data / Hora</td>
          <td class="val">${formattedDate}</td>
        </tr>
        <tr>
          <td class="name">ID do Feedback</td>
          <td class="val" style="color: #fbbf24;">${feedbackId}</td>
        </tr>
        ${location ? `<tr><td class="name">Local / Ecrã</td><td class="val">${location}</td></tr>` : ''}
      </table>

      ${title ? `
      <div class="field-group">
        <div class="label">Título</div>
        <div class="value-box" style="font-weight: 700; color: #ffffff;">${title}</div>
      </div>` : ''}

      <div class="field-group">
        <div class="label">Mensagem Completa</div>
        <div class="value-box">${message}</div>
      </div>

      ${reproductionSteps ? `
      <div class="field-group">
        <div class="label" style="color: #f43f5e;">Passos para Reproduzir</div>
        <div class="value-box" style="border-color: rgba(244,63,94,0.3); background: rgba(244,63,94,0.03);">${reproductionSteps}</div>
      </div>` : ''}

      <div class="field-group">
        <div class="label">Informações Adicionais</div>
        <table class="table-info">
          <tr>
            <td class="name">Página</td>
            <td class="val"><a href="${pageUrl}" style="color: #38bdf8; text-decoration: none;">${pageUrl}</a></td>
          </tr>
          <tr>
            <td class="name">Dispositivo / UserAgent</td>
            <td class="val" style="font-size: 11px;">${device}</td>
          </tr>
        </table>
      </div>

      ${userEmail ? `
      <div style="text-align: center; margin-top: 24px;">
        <a href="mailto:${userEmail}?subject=Re: [Feedback Acorda Portugal] ${encodeURIComponent(title || typeLabel)}" class="action-btn">
          Responder Diretamente ao Jogador
        </a>
      </div>` : ''}
    </div>

    <div class="footer">
      Este feedback foi enviado automaticamente através de <a href="https://acordaportugal.pt/feedback">https://acordaportugal.pt/feedback</a>.<br>
      Sistema de Feedback Automatizado &bull; Acorda Portugal &bull; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>`

  const emailStatus = checkEmailConfig()

  // Provedor 1: Resend API (HTTPS REST — recomendado e ultra-rápido na Vercel)
  if (emailStatus.provider === 'resend') {
    const resendApiKey = process.env.RESEND_API_KEY!.trim()
    const fromAddress =
      (process.env.EMAIL_FROM && process.env.EMAIL_FROM.trim().length > 0)
        ? process.env.EMAIL_FROM.trim()
        : (process.env.RESEND_FROM && process.env.RESEND_FROM.trim().length > 0)
          ? process.env.RESEND_FROM.trim()
          : 'Acorda Portugal <onboarding@resend.dev>'

    const payloadBody: Record<string, any> = {
      from: fromAddress,
      to: ['suporte@acordaportugal.pt'],
      subject,
      text: plainText,
      html: htmlBody,
    }

    if (userEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      payloadBody.reply_to = userEmail
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(payloadBody),
      signal: AbortSignal.timeout(10000),
    })

    if (!resendResponse.ok) {
      const errorJson = await resendResponse.json().catch(() => ({}))
      const errMsg = errorJson?.message || errorJson?.error?.message || `Erro HTTP ${resendResponse.status} na API Resend`
      throw new Error(`Falha no envio via Resend: ${errMsg}`)
    }

    const resendData = await resendResponse.json().catch(() => ({}))
    return {
      success: true,
      messageId: resendData?.id || feedbackId,
    }
  }

  // Provedor 2: SMTP Nodemailer
  if (emailStatus.provider === 'smtp') {
    const transporter = createMailTransporter()
    const smtpUser = process.env.SMTP_USER || 'suporte@acordaportugal.pt'

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Acorda Portugal — Feedback" <${smtpUser}>`,
      to: 'suporte@acordaportugal.pt',
      subject,
      text: plainText,
      html: htmlBody,
    }

    if (userEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      mailOptions.replyTo = userEmail
    }

    try {
      const info = await transporter.sendMail(mailOptions)
      return {
        success: true,
        messageId: info.messageId || feedbackId,
      }
    } catch (smtpErr: any) {
      throw new Error(
        `Falha no servidor SMTP: ${smtpErr?.message || 'Erro de conexão/autenticação'}`
      )
    }
  }

  // Nenhum provedor configurado
  throw new Error('Nenhum serviço de email configurado no servidor.')
}
