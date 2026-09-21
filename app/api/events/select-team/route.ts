import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import {
  OFFICIAL_PORTO_LISBOA_ID,
  OFFICIAL_EVENT_CONFIG_PORTO_LISBOA,
  type EventTeamId,
} from '@/lib/events-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Não autorizado. Sessão obrigatória para escolher uma equipa.' },
        { status: 401 }
      )
    }

    const idToken = authHeader.split('Bearer ')[1]
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(idToken).catch(() => null)

    if (!decodedToken || !decodedToken.uid) {
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada.' },
        { status: 401 }
      )
    }

    const userId = decodedToken.uid
    const body = await request.json().catch(() => ({}))
    const eventId = body.eventId || OFFICIAL_PORTO_LISBOA_ID
    const rawTeam = (body.team || '').toString().toLowerCase().trim()

    if (rawTeam !== 'porto' && rawTeam !== 'lisboa') {
      return NextResponse.json(
        { error: 'Equipa inválida. Escolhe "porto" (🔵) ou "lisboa" (🔴).' },
        { status: 400 }
      )
    }

    const chosenTeam = rawTeam as EventTeamId
    const teamLabel = chosenTeam === 'porto' ? 'Porto 🔵' : 'Lisboa 🔴'

    const db = getAdminFirestore()
    const eventRef = db.collection('events').doc(eventId)
    const participantRef = eventRef.collection('participants').doc(userId)
    const userRef = db.collection('users').doc(userId)

    const result = await db.runTransaction(async (transaction: any) => {
      const [eventSnap, pSnap, uSnap] = await Promise.all([
        transaction.get(eventRef),
        transaction.get(participantRef),
        transaction.get(userRef),
      ])

      // Se o evento ainda não tiver o seed no Firestore, inicializar com a configuração padrão
      if (!eventSnap.exists) {
        transaction.set(
          eventRef,
          {
            ...OFFICIAL_EVENT_CONFIG_PORTO_LISBOA,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )
      }

      const pData = pSnap.exists ? pSnap.data() || {} : {}
      const uData = uSnap.exists ? uSnap.data() || {} : {}

      // 🔒 REGRA ANTI-TROCA: Bloqueio estrito de troca arbitrária de equipa
      if (pData.team) {
        if (pData.team !== chosenTeam) {
          const currentTeamLabel = pData.team === 'porto' ? 'Porto 🔵' : 'Lisboa 🔴'
          return {
            alreadySet: true,
            team: pData.team,
            error: `A tua equipa já está definida como ${currentTeamLabel}. Por integridade e rivalidade desportiva, a escolha de equipa é definitiva durante o Grande Duelo.`,
          }
        }

        // Idempotência: já tinha escolhido esta equipa
        return {
          success: true,
          team: pData.team,
          alreadyChosen: true,
          message: `Já fazes parte da Equipa ${teamLabel}!`,
        }
      }

      // Preparar dados do participante
      const displayName =
        uData.displayName ||
        uData.username ||
        decodedToken.name ||
        decodedToken.email?.split('@')[0] ||
        'Jogador'

      const photoURL =
        uData.photoURL ||
        uData.avatar ||
        decodedToken.picture ||
        '/images/avatars/avatar_01.png'

      const district = uData.district || uData.distrito || 'Portugal'
      const existingPoints = typeof pData.eventPoints === 'number' ? pData.eventPoints : 0

      // Atualizar / Criar documento do participante no evento com a equipa escolhida
      transaction.set(
        participantRef,
        {
          userId,
          eventId,
          displayName,
          photoURL,
          avatar: photoURL,
          district,
          distrito: district,
          team: chosenTeam,
          teamSelectedAt: FieldValue.serverTimestamp(),
          totalPoints: existingPoints,
          eventPoints: existingPoints,
          points: existingPoints,
          gamesPlayed: typeof pData.gamesPlayed === 'number' ? pData.gamesPlayed : (typeof pData.totalMatches === 'number' ? pData.totalMatches : 0),
          totalMatches: typeof pData.totalMatches === 'number' ? pData.totalMatches : (typeof pData.gamesPlayed === 'number' ? pData.gamesPlayed : 0),
          countedMatches: typeof pData.countedMatches === 'number' ? pData.countedMatches : 0,
          createdAt: pData.createdAt || FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      // Atualizar contadores atómicos da equipa no documento principal do evento
      const eventTeamUpdate: Record<string, any> = {
        [`teams.${chosenTeam}.playerCount`]: FieldValue.increment(1),
        totalParticipants: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      }

      if (existingPoints > 0) {
        eventTeamUpdate[`teams.${chosenTeam}.points`] = FieldValue.increment(existingPoints)
      }

      transaction.update(eventRef, eventTeamUpdate)

      // Sincronizar equipa no documento de utilizador para persistência e portabilidade
      transaction.set(
        userRef,
        {
          [`events.${eventId}.team`]: chosenTeam,
          [`events.${eventId}.teamSelectedAt`]: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      return {
        success: true,
        team: chosenTeam,
        message: `Entraste oficialmente na Equipa ${teamLabel}! Prepara-te para o Grande Duelo.`,
      }
    })

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          team: result.team,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      team: result.team,
      message: result.message,
    })
  } catch (error: any) {
    console.error('[API /api/events/select-team ERROR]:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao gravar escolha de equipa.' },
      { status: 500 }
    )
  }
}
