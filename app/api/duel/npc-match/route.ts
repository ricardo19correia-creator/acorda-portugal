import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { db as clientDb } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getCompatibleNpcForDuel } from '@/lib/npc-system/npc-catalog'
import { simulateNpcDuelPerformance } from '@/lib/npc-system/npc-duel-engine'

export const dynamic = 'force-dynamic'

const QUESTION_TIME_MS = 60_000

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: 'Emparelhamento com bots desativado permanentemente no Acorda Portugal.' },
    { status: 410 }
  )
}

export async function GET() {
  return NextResponse.json(
    { error: 'Emparelhamento com bots desativado permanentemente no Acorda Portugal.' },
    { status: 410 }
  )
}
