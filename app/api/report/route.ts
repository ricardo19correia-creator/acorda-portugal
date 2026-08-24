import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      type, 
      description, 
      userEmail, 
      userId,
      userDisplayName,
      userAgent,
      screenResolution,
      url,
      page
    } = body

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return NextResponse.json({ error: 'A descrição deve ter pelo menos 10 caracteres.' }, { status: 400 })
    }

    const reportData = {
      type: type || 'Outro assunto',
      description: description.trim(),
      userEmail: userEmail || 'anónimo',
      userId: userId || null,
      userDisplayName: userDisplayName || null,
      userAgent: userAgent || 'N/A',
      screenResolution: screenResolution || 'N/A',
      url: url || page || 'N/A',
      page: page || url || 'N/A',
      createdAt: serverTimestamp(),
      status: 'pendente',
      platform: 'web-mobile',
    }

    try {
      await addDoc(collection(db, 'support_tickets'), reportData)
      await addDoc(collection(db, 'reports'), reportData)
    } catch (dbErr) {
      console.log('Firebase report fallback:', reportData, dbErr)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API Report Error:', error)
    return NextResponse.json({ error: 'Ocorreu um erro ao registar o relatório.' }, { status: 500 })
  }
}
