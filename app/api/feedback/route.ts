import { NextResponse } from 'next/server'
import { verifyFirebaseIdToken, getAdminFirestore } from '@/lib/firebase-admin'
import { sendFeedbackNotificationEmail, checkEmailConfig } from '@/lib/email-service'
import { FEEDBACK_TYPES, type FeedbackType } from '@/types/feedback'

export const dynamic = 'force-dynamic'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// In-memory rate limiting para prevenir spam no endpoint
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(identifier: string, limit = 5, windowMs = 600000): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs })
    return false
  }

  if (entry.count >= limit) {
    return true
  }

  entry.count += 1
  return false
}

function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/<[^>]*>?/gm, '').trim()
}

export async function POST(req: Request) {
  try {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown-client'

    if (isRateLimited(clientIp, 6, 600000)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Demasiados pedidos num curto intervalo. Por favor, aguarda alguns minutos antes de submeter outro feedback.',
        },
        { status: 429 }
      )
    }

    // 1. Identificar utilizador (autenticado ou convidado)
    const authHeader = req.headers.get('authorization') || ''
    let verifiedUid: string | null = null
    let verifiedEmailFromToken: string | null = null
    let isGuest = true

    if (authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.replace('Bearer ', '').trim()
      if (idToken && idToken !== 'null' && idToken !== 'undefined') {
        const verifiedAuth = await verifyFirebaseIdToken(idToken)
        if (verifiedAuth && verifiedAuth.uid) {
          verifiedUid = verifiedAuth.uid
          verifiedEmailFromToken = verifiedAuth.email || null
          isGuest = false
        }
      }
    }

    // 2. Extração e validação do payload
    const body = await req.json().catch(() => ({}))
    const metadata = body.metadata || {}
    const {
      type = body.problemType || 'erro',
      title = '',
      description = '',
      message = '',
      location = '',
      reproductionSteps = '',
      pageUrl = '',
      platform = 'web',
      userAgent = '',
      appVersion = '1.0.0-beta',
      contactName = '',
      contactEmail = '',
      source = '',
    } = body

    const isAjuda = source === 'ajuda' || pageUrl.includes('/ajuda') || metadata.page?.includes('/ajuda') || body.problemType !== undefined
    const finalPageUrl = pageUrl || body.url || metadata.url || metadata.page || (isAjuda ? 'https://acordaportugal.pt/ajuda' : 'https://acordaportugal.pt/feedback')
    const finalLocation = location || (isAjuda ? 'Central de Ajuda' : 'Outro')
    const finalPlatform = platform !== 'web' ? platform : (metadata.platform || metadata.screenResolution ? `Web (${metadata.screenResolution})` : 'web')
    const finalUserAgent = req.headers.get('user-agent') || userAgent || metadata.userAgent || 'N/A'

    const sanitizedTitle = sanitizeText(title || body.subject || body.problemType || '')
    const sanitizedDescription = sanitizeText(description || message || body.details || '')
    const sanitizedSteps = sanitizeText(reproductionSteps)
    const sanitizedContactName = sanitizeText(contactName || body.userName || body.userDisplayName || metadata.userDisplayName || '')
    const sanitizedContactEmail = (contactEmail || body.userEmail || body.email || verifiedEmailFromToken || '').trim()

    if (sanitizedTitle.length < 3 || sanitizedTitle.length > 120) {
      return NextResponse.json(
        {
          success: false,
          error: 'O assunto/título do problema deve conter entre 3 e 120 caracteres.',
        },
        { status: 400 }
      )
    }

    if (sanitizedDescription.length < 10 || sanitizedDescription.length > 3000) {
      return NextResponse.json(
        {
          success: false,
          error: 'A descrição detalhada do problema deve conter pelo menos 10 caracteres.',
        },
        { status: 400 }
      )
    }

    if (sanitizedContactEmail && !EMAIL_REGEX.test(sanitizedContactEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'O endereço de email fornecido não tem um formato válido.',
        },
        { status: 400 }
      )
    }

    const validTypes = FEEDBACK_TYPES.map((t) => t.id)
    const finalType: FeedbackType = validTypes.includes(type as FeedbackType)
      ? (type as FeedbackType)
      : 'outro'

    // 3. Resolução de perfil e identidade
    const db = getAdminFirestore()
    let resolvedDisplayName = sanitizedContactName || (isGuest ? 'Jogador Convidado' : 'Jogador')
    let resolvedEmail = sanitizedContactEmail || verifiedEmailFromToken || ''
    let resolvedPhotoURL = body.userPhotoURL || ''

    if (!isGuest && verifiedUid) {
      try {
        const userDoc = await db.collection('users').doc(verifiedUid).get()
        if (userDoc.exists) {
          const uData = userDoc.data() || {}
          if (!sanitizedContactName && uData.displayName) resolvedDisplayName = uData.displayName
          if (!resolvedEmail && uData.email) resolvedEmail = uData.email
          if (uData.photoURL) resolvedPhotoURL = uData.photoURL
        }
      } catch (dbReadErr) {
        console.warn('[API FEEDBACK] Aviso ao carregar perfil do utilizador:', dbReadErr)
      }
    } else {
      // Identificador único para convidado
      verifiedUid = `guest_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`
    }

    // 4. Gerar ou validar ID único para idempotência
    const feedbackId = (body.feedbackId && typeof body.feedbackId === 'string' && body.feedbackId.trim().length > 5)
      ? body.feedbackId.trim()
      : db.collection('feedback').doc().id

    const feedbackDocRef = db.collection('feedback').doc(feedbackId)
    const existingSnap = await feedbackDocRef.get()

    // Idempotência: se o mesmo feedbackId já foi enviado com sucesso por email, não duplicar
    if (existingSnap.exists) {
      const existingData = existingSnap.data() || {}
      if (existingData.emailSent === true) {
        return NextResponse.json({
          success: true,
          feedbackId,
          alreadySent: true,
          emailStatus: 'sent',
          emailSent: true,
          message: 'Feedback enviado com sucesso! Obrigado por ajudares a melhorar o Desafio Nacional.',
        })
      }
    }

    const nowIso = new Date().toISOString()

    // 5. Gravar o feedback no Firestore (Garantir persistência prévia imutável)
    const feedbackDocument = {
      id: feedbackId,
      userId: verifiedUid,
      isGuest,
      userName: resolvedDisplayName,
      userDisplayName: resolvedDisplayName,
      userEmail: resolvedEmail,
      userPhotoURL: resolvedPhotoURL,
      type: finalType,
      title: sanitizedTitle,
      description: sanitizedDescription,
      message: sanitizedDescription,
      location: finalLocation,
      reproductionSteps: finalType === 'erro' || finalType === 'bug_visual' || finalType === 'pergunta' ? sanitizedSteps : '',
      source: isAjuda ? 'ajuda' : 'feedback',
      status: 'NEW',
      priority: 'MEDIUM',
      createdAt: existingSnap.exists ? existingSnap.data()?.createdAt || nowIso : nowIso,
      updatedAt: nowIso,
      pageUrl: finalPageUrl,
      platform: finalPlatform,
      userAgent: finalUserAgent,
      appVersion: appVersion || '1.0.0-beta',
      emailStatus: 'pending',
      emailSent: false,
      emailSentAt: null,
      emailError: null,
      emailSending: true,
    }

    await feedbackDocRef.set(feedbackDocument, { merge: true })

    // 6. Enviar imediatamente o email oficial para suporte@acordaportugal.pt
    try {
      const emailResult = await sendFeedbackNotificationEmail({
        feedbackId,
        userName: resolvedDisplayName,
        userEmail: resolvedEmail,
        userId: verifiedUid,
        type: finalType,
        title: sanitizedTitle,
        message: sanitizedDescription,
        location: finalLocation,
        reproductionSteps: finalType === 'erro' || finalType === 'bug_visual' || finalType === 'pergunta' ? sanitizedSteps : '',
        pageUrl: finalPageUrl,
        device: `${finalPlatform} • ${finalUserAgent}`,
        source: isAjuda ? 'ajuda' : 'feedback',
        date: new Date().toLocaleString('pt-PT', {
          timeZone: 'Europe/Lisbon',
          dateStyle: 'full',
          timeStyle: 'medium',
        }),
      })

      // 7. Atualizar Firestore com confirmação de email entregue
      await feedbackDocRef.update({
        emailStatus: 'sent',
        emailSent: true,
        emailSentAt: new Date().toISOString(),
        emailSending: false,
        emailError: null,
        emailMessageId: emailResult.messageId,
      })

      return NextResponse.json({
        success: true,
        feedbackId,
        emailStatus: 'sent',
        emailSent: true,
        emailSentAt: new Date().toISOString(),
        message: isAjuda
          ? 'Problema enviado com sucesso. Obrigado pelo teu reporte. A equipa do Acorda Portugal recebeu a informação.'
          : 'Feedback enviado com sucesso! Obrigado por ajudares a melhorar o Desafio Nacional.',
      })
    } catch (emailError: any) {
      console.error('[API FEEDBACK] Falha no disparo de email:', emailError)

      const technicalMessage = emailError?.message || 'Falha de entrega no serviço de email.'

      // Se falhar o envio de email, NÃO perder o feedback gravado no Firestore
      await feedbackDocRef.update({
        emailStatus: 'failed',
        emailSent: false,
        emailSending: false,
        emailError: technicalMessage,
      }).catch(() => {})

      return NextResponse.json(
        {
          success: false,
          error: isAjuda
            ? 'Não foi possível enviar o email para o suporte de momento. Por favor, tenta novamente mais tarde.'
            : 'O teu feedback foi registado, mas não foi possível entregar a notificação por email de momento. A nossa equipa irá analisar o teu relato diretamente na plataforma.',
          technicalDetails: process.env.NODE_ENV === 'development' ? technicalMessage : undefined,
          feedbackId,
          savedInFirestore: true,
          emailStatus: 'failed',
          emailSent: false,
        },
        { status: 502 }
      )
    }
  } catch (error: any) {
    console.error('[API FEEDBACK POST CRITICAL ERROR]', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao processar o feedback. Por favor, tenta novamente.',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
