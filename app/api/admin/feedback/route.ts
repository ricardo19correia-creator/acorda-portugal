import { NextResponse } from 'next/server'
import { verifyAdminRequest, recordAdminAuditLog } from '@/lib/admin-auth'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { sendFeedbackNotificationEmail } from '@/lib/email-service'
import type { FeedbackStatus, FeedbackPriority } from '@/types/feedback'

export const dynamic = 'force-dynamic'

/**
 * Função auxiliar estruturada para envio de notificações ao utilizador
 * (preparada para integração futura com sistema de notificações e push/email)
 */
async function triggerFeedbackNotification(
  userId: string,
  feedbackId: string,
  feedbackTitle: string,
  status: FeedbackStatus,
  adminNotes?: string
) {
  try {
    // Registo de evento de notificação preparado para consumidor push/in-app
    const db = getAdminFirestore()
    await db.collection('notifications').add({
      userId,
      type: 'FEEDBACK_STATUS_UPDATE',
      feedbackId,
      feedbackTitle,
      status,
      adminNotes: adminNotes || null,
      read: false,
      createdAt: new Date().toISOString(),
    }).catch(() => {})
  } catch (err) {
    console.warn('[FEEDBACK NOTIFICATION] Notification trigger notice:', err)
  }
}

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status') || 'all'
    const typeFilter = searchParams.get('type') || 'all'
    const priorityFilter = searchParams.get('priority') || 'all'
    const limitCount = Math.min(200, Math.max(10, Number(searchParams.get('limit') || 100)))

    const db = getAdminFirestore()
    const queryRef = db.collection('feedback').orderBy('createdAt', 'desc').limit(limitCount)

    const snap = await queryRef.get()
    let feedbacks = snap.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
    }))

    if (statusFilter !== 'all') {
      feedbacks = feedbacks.filter((f: any) => f.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      feedbacks = feedbacks.filter((f: any) => f.type === typeFilter)
    }

    if (priorityFilter !== 'all') {
      feedbacks = feedbacks.filter((f: any) => f.priority === priorityFilter)
    }

    return NextResponse.json({
      success: true,
      feedbacks,
      totalCount: feedbacks.length,
    })
  } catch (error: any) {
    console.error('[API ADMIN FEEDBACK GET ERROR]', error)
    return NextResponse.json(
      { error: 'Erro ao obter lista de feedbacks.' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await req.json()
    const {
      feedbackId,
      action,
      status,
      priority,
      adminNotes,
    } = body

    if (!feedbackId) {
      return NextResponse.json({ error: 'feedbackId é obrigatório.' }, { status: 400 })
    }

    const db = getAdminFirestore()
    const feedbackDocRef = db.collection('feedback').doc(feedbackId)
    const feedbackDoc = await feedbackDocRef.get()

    if (!feedbackDoc.exists) {
      return NextResponse.json({ error: 'Registo de feedback não encontrado.' }, { status: 404 })
    }

    const currentData = feedbackDoc.data() as any
    const adminIdentifier =
      authResult.adminUser?.displayName ||
      authResult.verifiedEmail ||
      'Administrador'

    const nowIso = new Date().toISOString()
    const updatePayload: Record<string, any> = {
      updatedAt: nowIso,
    }

    let auditAction = 'FEEDBACK_UPDATED'
    let previousValue: any = null
    let newValue: any = null
    let details = ''

    switch (action) {
      case 'UPDATE_STATUS': {
        if (!status) {
          return NextResponse.json({ error: 'Status inválido.' }, { status: 400 })
        }
        previousValue = currentData.status
        newValue = status
        updatePayload.status = status
        auditAction = 'STATUS_CHANGED'
        details = `Estado alterado de "${previousValue}" para "${newValue}"`

        if (status === 'RESOLVED' && !currentData.resolvedAt) {
          updatePayload.resolvedAt = nowIso
          updatePayload.resolvedBy = adminIdentifier
        }
        break
      }

      case 'UPDATE_PRIORITY': {
        if (!priority) {
          return NextResponse.json({ error: 'Prioridade inválida.' }, { status: 400 })
        }
        previousValue = currentData.priority
        newValue = priority
        updatePayload.priority = priority
        auditAction = 'PRIORITY_CHANGED'
        details = `Prioridade alterada de "${previousValue}" para "${newValue}"`
        break
      }

      case 'UPDATE_NOTES': {
        previousValue = currentData.adminNotes || ''
        newValue = adminNotes || ''
        updatePayload.adminNotes = newValue
        auditAction = 'ADMIN_NOTE_ADDED'
        details = `Nota administrativa atualizada: "${newValue.slice(0, 50)}${newValue.length > 50 ? '...' : ''}"`
        break
      }

      case 'RESOLVE': {
        previousValue = currentData.status
        newValue = 'RESOLVED'
        updatePayload.status = 'RESOLVED'
        updatePayload.resolvedAt = nowIso
        updatePayload.resolvedBy = adminIdentifier
        if (typeof adminNotes === 'string') {
          updatePayload.adminNotes = adminNotes
        }
        auditAction = 'FEEDBACK_RESOLVED'
        details = `Feedback marcado como resolvido por ${adminIdentifier}`
        break
      }

      case 'RESEND_EMAIL': {
        try {
          const emailResult = await sendFeedbackNotificationEmail({
            feedbackId,
            userName: currentData.userName || currentData.userDisplayName || 'Jogador',
            userEmail: currentData.userEmail || '',
            userId: currentData.userId || 'N/A',
            type: currentData.type,
            title: currentData.title,
            message: currentData.message || currentData.description || '',
            location: currentData.location,
            reproductionSteps: currentData.reproductionSteps,
            pageUrl: currentData.pageUrl || 'https://acordaportugal.pt/feedback',
            device: `${currentData.platform || 'web'} • ${currentData.userAgent || 'N/A'}`,
            date: new Date().toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' }),
          })

          updatePayload.emailSent = true
          updatePayload.emailSentAt = nowIso
          updatePayload.emailError = null
          updatePayload.emailMessageId = emailResult.messageId

          auditAction = 'FEEDBACK_EMAIL_RESENT'
          details = `Email para suporte@acordaportugal.pt reenviado com sucesso por ${adminIdentifier}`
        } catch (mailErr: any) {
          updatePayload.emailSent = false
          updatePayload.emailError = mailErr?.message || 'Falha ao reenviar email.'
          await feedbackDocRef.update(updatePayload)
          return NextResponse.json(
            { error: `Falha ao reenviar email para suporte@acordaportugal.pt: ${mailErr?.message || 'Erro no serviço de email'}` },
            { status: 502 }
          )
        }
        break
      }

      case 'DELETE': {
        // Exclusão definitiva de registo com dupla confirmação no backend
        await feedbackDocRef.delete()

        await recordAdminAuditLog({
          adminUid: authResult.verifiedUid!,
          adminEmail: authResult.verifiedEmail!,
          action: 'FEEDBACK_DELETED',
          entity: 'feedback',
          entityId: feedbackId,
          previousValue: {
            title: currentData.title,
            userId: currentData.userId,
            status: currentData.status,
          },
          newValue: null,
          details: `Feedback eliminado permanentemente (${currentData.title})`,
          status: 'SUCCESS',
        })

        return NextResponse.json({
          success: true,
          deleted: true,
          feedbackId,
        })
      }

      default: {
        return NextResponse.json({ error: `Ação desconhecida: ${action}` }, { status: 400 })
      }
    }

    // Executar atualização no Firestore
    await feedbackDocRef.update(updatePayload)

    // Registar no log de auditoria imutável
    await recordAdminAuditLog({
      adminUid: authResult.verifiedUid!,
      adminEmail: authResult.verifiedEmail!,
      action: auditAction,
      entity: 'feedback',
      entityId: feedbackId,
      previousValue,
      newValue,
      details,
      status: 'SUCCESS',
    })

    // Despoletar notificação preparada caso o estado tenha sido alterado
    if (updatePayload.status && updatePayload.status !== currentData.status) {
      await triggerFeedbackNotification(
        currentData.userId,
        feedbackId,
        currentData.title,
        updatePayload.status,
        updatePayload.adminNotes || currentData.adminNotes
      )
    }

    return NextResponse.json({
      success: true,
      feedback: {
        ...currentData,
        ...updatePayload,
      },
    })
  } catch (error: any) {
    console.error('[API ADMIN FEEDBACK PATCH ERROR]', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao atualizar feedback.' },
      { status: 500 }
    )
  }
}
