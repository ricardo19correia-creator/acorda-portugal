// Acorda Portugal — Sistema Canónico de Gestão de Eventos
// Quando não existem eventos publicados no Firestore, devolve vazio sem qualquer fallback simulado.

import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'

export type EventStatus = 'upcoming' | 'active' | 'ended'

export interface OfficialEventReward {
  position: number
  title: string
  acordas: number
  medal: string
  label: string
}

export interface OfficialEventConfig {
  id: string
  title: string
  subtitle: string
  tag: string
  type: string
  description: string
  startDate: string
  endDate: string
  timezone: string
  rewards: OfficialEventReward[]
  rules: {
    maxDailyMatches: number
    pointDivisor: number
  }
}

export interface EventParticipant {
  userId: string
  displayName: string
  photoURL?: string | null
  district?: string
  eventPoints: number
  totalMatches: number
  dailyMatches?: Record<string, number>
  bestScore?: number
  totalScore?: number
  lastPlayedAt?: any
  updatedAt?: any
  pos?: number
}

export interface CountdownDetails {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalMs: number
  status: EventStatus
  statusLabel: string
}

/**
 * Nenhum evento fictício hardcoded.
 * Mantido como null quando não há evento estático definido.
 */
export const OFFICIAL_EVENT: OfficialEventConfig | null = null

/**
 * Devolve a data atual em formato YYYY-MM-DD no fuso horário Europe/Lisbon (Portugal Continental)
 */
export function getLisbonDateString(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Lisbon',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    return formatter.format(date)
  } catch {
    return date.toISOString().slice(0, 10)
  }
}

/**
 * Calcula o estado dinâmico de um evento ("upcoming", "active", "ended") com base nas datas reais
 */
export function getEventStatus(event?: OfficialEventConfig | null, now: Date = new Date()): EventStatus | null {
  if (!event || !event.startDate || !event.endDate) return null
  const startMs = new Date(event.startDate).getTime()
  const endMs = new Date(event.endDate).getTime()
  const curMs = now.getTime()

  if (curMs < startMs) return 'upcoming'
  if (curMs > endMs) return 'ended'
  return 'active'
}

/**
 * Rótulo descritivo oficial do estado
 */
export function getEventStatusLabel(status: EventStatus | null): string {
  switch (status) {
    case 'upcoming':
      return 'Em breve'
    case 'active':
      return 'A decorrer'
    case 'ended':
      return 'Terminado'
    default:
      return 'Inativo'
  }
}

/**
 * Calcula a contagem decrescente com base no fuso horário e datas reais de um evento
 */
export function getEventCountdown(event?: OfficialEventConfig | null, now: Date = new Date()): CountdownDetails | null {
  if (!event || !event.startDate || !event.endDate) return null
  const status = getEventStatus(event, now)
  if (!status) return null

  const statusLabel = getEventStatusLabel(status)
  const startMs = new Date(event.startDate).getTime()
  const endMs = new Date(event.endDate).getTime()
  const curMs = now.getTime()

  let targetMs = endMs
  if (status === 'upcoming') {
    targetMs = startMs
  }

  const totalMs = Math.max(0, targetMs - curMs)
  const totalSec = Math.floor(totalMs / 1000)

  const days = Math.floor(totalSec / (3600 * 24))
  const hours = Math.floor((totalSec % (3600 * 24)) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs,
    status,
    statusLabel,
  }
}

/**
 * Converte a pontuação da partida em Pontos de Evento com divisor configurável (padrão: 10)
 */
export function calculateEventPoints(matchScore: number, divisor: number = 10): number {
  if (typeof matchScore !== 'number' || isNaN(matchScore) || matchScore <= 0 || divisor <= 0) {
    return 0
  }
  return Math.round(matchScore / divisor)
}

/**
 * Obtém o número de partidas contabilizadas pelo jogador no dia de hoje (fuso horário de Lisboa)
 */
export function getDailyMatchesCount(
  participant: EventParticipant | null,
  dateStr?: string
): number {
  if (!participant || !participant.dailyMatches) return 0
  const targetDate = dateStr || getLisbonDateString()
  return Number(participant.dailyMatches[targetDate] || 0)
}

/**
 * Ordenação determinística de ranking de participantes reais
 */
export function sortEventParticipants(list: EventParticipant[]): EventParticipant[] {
  return [...list]
    .sort((a, b) => {
      if ((b.eventPoints || 0) !== (a.eventPoints || 0)) {
        return (b.eventPoints || 0) - (a.eventPoints || 0)
      }
      if ((b.totalScore || 0) !== (a.totalScore || 0)) {
        return (b.totalScore || 0) - (a.totalScore || 0)
      }
      if ((b.bestScore || 0) !== (a.bestScore || 0)) {
        return (b.bestScore || 0) - (a.bestScore || 0)
      }
      return (a.displayName || '').localeCompare(b.displayName || '', 'pt-PT')
    })
    .map((p, idx) => ({ ...p, pos: idx + 1 }))
}

/**
 * Subscrição a eventos publicados em tempo real a partir do Firestore
 */
export function subscribePublishedEvents(
  callback: (events: OfficialEventConfig[]) => void
): Unsubscribe {
  if (!db) {
    callback([])
    return () => {}
  }

  try {
    const eventsRef = collection(db, 'events')
    return onSnapshot(
      eventsRef,
      (snapshot) => {
        const list: OfficialEventConfig[] = []
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() || {}
          if (data.published === true || data.active === true) {
            list.push({
              id: docSnap.id,
              title: data.title || '',
              subtitle: data.subtitle || '',
              tag: data.tag || '',
              type: data.type || 'Evento',
              description: data.description || '',
              startDate: data.startDate || '',
              endDate: data.endDate || '',
              timezone: data.timezone || 'Europe/Lisbon',
              rewards: data.rewards || [],
              rules: data.rules || { maxDailyMatches: 10, pointDivisor: 10 },
            })
          }
        })
        callback(list)
      },
      (err) => {
        console.warn('[EVENTS] Erro ao subscrever eventos:', err)
        callback([])
      }
    )
  } catch (err) {
    console.error('[EVENTS] Falha na subscrição de eventos:', err)
    callback([])
    return () => {}
  }
}

/**
 * Subscrição em tempo real aos participantes reais de um evento no Firestore
 */
export function subscribeEventRanking(
  eventId?: string | null,
  callback?: (participants: EventParticipant[]) => void,
  limitCount: number = 50
): Unsubscribe {
  if (!db || !eventId || !callback) {
    if (callback) callback([])
    return () => {}
  }

  try {
    const participantsRef = collection(db, 'events', eventId, 'participants')
    const q = query(
      participantsRef,
      orderBy('eventPoints', 'desc'),
      orderBy('totalScore', 'desc'),
      limit(limitCount)
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const rawList: EventParticipant[] = []
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() || {}
          rawList.push({
            userId: docSnap.id,
            displayName: data.displayName || 'Jogador',
            photoURL: data.photoURL || null,
            district: data.district || 'Portugal',
            eventPoints: typeof data.eventPoints === 'number' ? data.eventPoints : 0,
            totalMatches: typeof data.totalMatches === 'number' ? data.totalMatches : 0,
            dailyMatches: data.dailyMatches || {},
            bestScore: typeof data.bestScore === 'number' ? data.bestScore : 0,
            totalScore: typeof data.totalScore === 'number' ? data.totalScore : 0,
            lastPlayedAt: data.lastPlayedAt,
            updatedAt: data.updatedAt,
          })
        })

        const sorted = sortEventParticipants(rawList)
        callback(sorted)
      },
      (error) => {
        console.warn('[EVENTS] Erro ao subscrever ranking de evento:', error)
        const fallbackQ = query(participantsRef, limit(limitCount))
        getDocs(fallbackQ)
          .then((fallbackSnap) => {
            const rawList: EventParticipant[] = []
            fallbackSnap.forEach((docSnap) => {
              const data = docSnap.data() || {}
              rawList.push({
                userId: docSnap.id,
                displayName: data.displayName || 'Jogador',
                photoURL: data.photoURL || null,
                district: data.district || 'Portugal',
                eventPoints: typeof data.eventPoints === 'number' ? data.eventPoints : 0,
                totalMatches: typeof data.totalMatches === 'number' ? data.totalMatches : 0,
                dailyMatches: data.dailyMatches || {},
                bestScore: typeof data.bestScore === 'number' ? data.bestScore : 0,
                totalScore: typeof data.totalScore === 'number' ? data.totalScore : 0,
                lastPlayedAt: data.lastPlayedAt,
                updatedAt: data.updatedAt,
              })
            })
            callback(sortEventParticipants(rawList))
          })
          .catch(() => callback([]))
      }
    )
  } catch (err) {
    console.error('[EVENTS] Falha na subscrição:', err)
    if (callback) callback([])
    return () => {}
  }
}

/**
 * Subscrição em tempo real ao progresso individual do utilizador autenticado num evento real
 */
export function subscribeUserEventProgress(
  userId?: string | null,
  eventId?: string | null,
  callback?: (participant: EventParticipant | null) => void
): Unsubscribe {
  if (!db || !userId || !eventId || !callback) {
    if (callback) callback(null)
    return () => {}
  }

  try {
    const userDocRef = doc(db, 'events', eventId, 'participants', userId)
    return onSnapshot(
      userDocRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          callback(null)
          return
        }
        const data = docSnap.data() || {}
        callback({
          userId: docSnap.id,
          displayName: data.displayName || 'Jogador',
          photoURL: data.photoURL || null,
          district: data.district || 'Portugal',
          eventPoints: typeof data.eventPoints === 'number' ? data.eventPoints : 0,
          totalMatches: typeof data.totalMatches === 'number' ? data.totalMatches : 0,
          dailyMatches: data.dailyMatches || {},
          bestScore: typeof data.bestScore === 'number' ? data.bestScore : 0,
          totalScore: typeof data.totalScore === 'number' ? data.totalScore : 0,
          lastPlayedAt: data.lastPlayedAt,
          updatedAt: data.updatedAt,
        })
      },
      (err) => {
        console.warn('[EVENTS] Erro ao subscrever progresso pessoal:', err)
        callback(null)
      }
    )
  } catch (err) {
    console.error('[EVENTS] Falha na subscrição de progresso pessoal:', err)
    if (callback) callback(null)
    return () => {}
  }
}
