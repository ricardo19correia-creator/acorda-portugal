import type { Timestamp } from 'firebase/firestore'

export interface CommunityPost {
  id: string
  authorName: string
  authorHandle: string
  district: string
  category: string
  content: string
  likes: number
  commentsCount: number
  createdAt: Timestamp | Date | string | number | null
  destaque?: boolean
  oficial?: boolean
  autor?: string
  tag?: string
  distrito?: string
  categoria?: string
  conteudo?: string
  comentariosCount?: number
}

export type PublicacaoComunidade = CommunityPost

/**
 * Utilitário de formatação de data e hora para publicações da comunidade
 */
export function formatPostDate(dateInput: any): string {
  if (!dateInput) return 'Agora mesmo'

  let date: Date
  if (typeof dateInput === 'object' && dateInput !== null) {
    if (typeof dateInput.toDate === 'function') {
      date = dateInput.toDate()
    } else if (typeof dateInput.seconds === 'number') {
      date = new Date(dateInput.seconds * 1000)
    } else if (dateInput instanceof Date) {
      date = dateInput
    } else {
      date = new Date()
    }
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput)
  } else if (typeof dateInput === 'string') {
    date = new Date(dateInput)
  } else {
    date = new Date()
  }

  if (isNaN(date.getTime())) return 'Agora mesmo'

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Agora mesmo'
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `Há ${diffInMinutes} min`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `Há ${diffInHours} h`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return 'Ontem'
  if (diffInDays < 7) return `Há ${diffInDays} dias`

  // Formatação com data e hora real em português (ex: 28 ago • 14:30)
  const day = date.getDate()
  const month = date.toLocaleDateString('pt-PT', { month: 'short' })
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day} ${month} • ${hours}:${minutes}`
}

/**
 * Retorna a data e hora completa formatada para tooltip/hover (ex: 28/08/2026 às 14:30:00)
 */
export function getFullFormattedDate(dateInput: any): string {
  if (!dateInput) return ''
  let date: Date
  if (typeof dateInput === 'object' && dateInput !== null && typeof dateInput.toDate === 'function') {
    date = dateInput.toDate()
  } else if (typeof dateInput?.seconds === 'number') {
    date = new Date(dateInput.seconds * 1000)
  } else {
    date = new Date(dateInput)
  }
  if (isNaN(date.getTime())) return ''
  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
