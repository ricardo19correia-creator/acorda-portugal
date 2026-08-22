import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, description, page, userEmail } = body

    if (!description) {
      return NextResponse.json({ error: 'Descrição obrigatória' }, { status: 400 })
    }

    // Grava no Firestore pelo servidor
    try {
      await addDoc(collection(db, 'reports'), {
        type: type || 'Erro técnico',
        description,
        page: page || 'N/A',
        userEmail: userEmail || 'anónimo',
        createdAt: serverTimestamp(),
        status: 'pendente',
        platform: 'web-mobile',
      })
    } catch (dbErr) {
      console.log('Firebase fallback log:', body)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API Report Error:', error)
    return NextResponse.json({ success: true }) // Retorna sucesso para o utilizador
  }
}
