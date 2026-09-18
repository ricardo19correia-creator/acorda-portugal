import { NextResponse } from 'next/server'
import { verifyFirebaseIdToken, getAdminFirestore } from '@/lib/firebase-admin'
import { sendFeedbackNotificationEmail } from '@/lib/email-service'
import { FEEDBACK_TYPES, type FeedbackType } from '@/types/feedback'

export const dynamic = 'force-dynamic'

function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/<[^>]*>?/gm, '').trim()
}

export async function POST(req: Request) {
  try {
    // 1. Identificar e autenticar o utilizador via Firebase Auth ID Token
    const authHeader = req.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Não autenticado. Inicia sessão para enviar feedback.' },
        { status: 401 }
      )
    }

    const idToken = authHeader.replace('Bearer ', '').trim()
    const verifiedAuth = await verifyFirebaseIdToken(idToken)

    if (!verifiedAuth || !verifiedAuth.uid) {
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada. Por favor, reinicia a sessão.' },
        { status: 401 }
      )
    }

    const verifiedUid = verifiedAuth.uid

    // 2. Extração e validação do payload
    const body = await req.json().catch(() => ({}))
    const {
      type = 'erro',
      title = '',
      description = '',
      message = '',
      location = 'Outro',
      reproductionSteps = '',
      pageUrl = 'https://acordaportugal.pt/feedback',
      platform = 'web',
      userAgent = '',
      appVersion = '1.0.0-beta',
    } = body

    const sanitizedTitle = sanitizeText(title)
    const sanitizedDescription = sanitizeText(description || message)
    const sanitizedSteps = sanitizeText(reproductionSteps)

    if (sanitizedTitle.length < 4 || sanitizedTitle.length > 100) {
      return NextResponse.json(
        { error: 'O título do feedback deve conter entre 4 e 100 caracteres.' },
        { status: 400 }
      )
    }

    if (sanitizedDescription.length < 15 || sanitizedDescription.length > 2000) {
      return NextResponse.json(
        { error: 'A descrição detalhada do feedback deve conter entre 15 e 2000 caracteres.' },
        { status: 400 }
      )
    }

    const validTypes = FEEDBACK_TYPES.map((t) => t.id)
    const finalType: FeedbackType = validTypes.includes(type as FeedbackType)
      ? (type as FeedbackType)
      : 'outro'

    // Obter dados de perfil do utilizador na BD Firestore para enriquecer nome e avatar
    const db = getAdminFirestore()
    let resolvedDisplayName = body.userName || body.userDisplayName || 'Jogador'
    let resolvedEmail = verifiedAuth.email || body.userEmail || ''
    let resolvedPhotoURL = body.userPhotoURL || ''

    try {
      const userDoc = await db.collection('users').doc(verifiedUid).get()
      if (userDoc.exists) {
        const uData = userDoc.data() || {}
        if (uData.displayName) resolvedDisplayName = uData.displayName
        if (uData.email) resolvedEmail = uData.email
        if (uData.photoURL) resolvedPhotoURL = uData.photoURL
      }
    } catch (dbReadErr) {
      console.warn('[API FEEDBACK] Aviso ao carregar perfil do utilizador:', dbReadErr)
    }

    // 3. Gerar ou validar ID único para idempotência
    const feedbackId = (body.feedbackId && typeof body.feedbackId === 'string' && body.feedbackId.trim().length > 5)
      ? body.feedbackId.trim()
      : db.collection('feedback').doc().id

    const feedbackDocRef = db.collection('feedback').doc(feedbackId)
    const existingSnap = await feedbackDocRef.get()

    // Idempotência: se o mesmo feedbackId já foi enviado com sucesso por email, não duplicar!
    if (existingSnap.exists) {
      const existingData = existingSnap.data() || {}
      if (existingData.emailSent === true) {
        return NextResponse.json({
          success: true,
          feedbackId,
          alreadySent: true,
          message: 'Feedback enviado com sucesso. Obrigado por ajudares a melhorar o Desafio Nacional.',
        })
      }
    }

    const nowIso = new Date().toISOString()
    const finalUserAgent = req.headers.get('user-agent') || userAgent || 'N/A'

    // 4. Gravar o feedback no Firestore (Garantir persistência prévia)
    const feedbackDocument = {
      id: feedbackId,
      userId: verifiedUid,
      userName: resolvedDisplayName,
      userDisplayName: resolvedDisplayName,
      userEmail: resolvedEmail,
      userPhotoURL: resolvedPhotoURL,
      type: finalType,
      title: sanitizedTitle,
      description: sanitizedDescription,
      message: sanitizedDescription,
      location: location || 'Outro',
      reproductionSteps: finalType === 'erro' ? sanitizedSteps : '',
      status: 'NEW',
      priority: 'MEDIUM',
      createdAt: existingSnap.exists ? existingSnap.data()?.createdAt || nowIso : nowIso,
      updatedAt: nowIso,
      pageUrl: pageUrl || 'https://acordaportugal.pt/feedback',
      platform: platform || 'web',
      userAgent: finalUserAgent,
      appVersion: appVersion || '1.0.0-beta',
      emailSent: false,
      emailSentAt: null,
      emailError: null,
      emailSending: true,
    }

    await feedbackDocRef.set(feedbackDocument, { merge: true })

    // 5. Enviar imediatamente o email para suporte@acordaportugal.pt
    try {
      const emailResult = await sendFeedbackNotificationEmail({
        feedbackId,
        userName: resolvedDisplayName,
        userEmail: resolvedEmail,
        userId: verifiedUid,
        type: finalType,
        title: sanitizedTitle,
        message: sanitizedDescription,
        location: location || 'Outro',
        reproductionSteps: finalType === 'erro' ? sanitizedSteps : '',
        pageUrl: pageUrl || 'https://acordaportugal.pt/feedback',
        device: `${platform} • ${finalUserAgent}`,
        date: new Date().toLocaleString('pt-PT', {
          timeZone: 'Europe/Lisbon',
          dateStyle: 'full',
          timeStyle: 'medium',
        }),
      })

      // 6. Atualizar estado com confirmação de email enviado
      await feedbackDocRef.update({
        emailSent: true,
        emailSentAt: new Date().toISOString(),
        emailSending: false,
        emailError: null,
        emailMessageId: emailResult.messageId,
      })

      return NextResponse.json({
        success: true,
        feedbackId,
        emailSent: true,
        emailSentAt: new Date().toISOString(),
        message: 'Feedback enviado com sucesso. Obrigado por ajudares a melhorar o Desafio Nacional.',
      })
    } catch (emailError: any) {
      console.error('[API FEEDBACK] Falha no disparo de email SMTP:', emailError)

      // Se falhar o envio de email, NÃO perder o feedback gravado no Firestore
      await feedbackDocRef.update({
        emailSent: false,
        emailSending: false,
        emailError: emailError?.message || 'Erro desconhecido no servidor de email SMTP.',
      }).catch(() => {})

      return NextResponse.json(
        {
          success: false,
          error: 'Não foi possível enviar o feedback. Tenta novamente.',
          technicalDetails: emailError?.message || 'Falha de entrega no servidor SMTP.',
          feedbackId,
          savedInFirestore: true,
        },
        { status: 502 }
      )
    }
  } catch (error: any) {
    console.error('[API FEEDBACK POST CRITICAL ERROR]', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Não foi possível enviar o feedback. Tenta novamente.',
        details: error?.message || 'Erro interno do servidor.',
      },
      { status: 500 }
    )
  }
}
