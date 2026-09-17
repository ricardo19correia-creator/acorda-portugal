// Acorda Portugal — Sistema Canónico de Gestão de Eventos Oficiais
// SSOT para modelos, cálculo de datas no fuso Europe/Lisbon, pontuação e rankings reais.

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
  name: string
  title: string
  subtitle: string
  tag: string
  type: string
  theme?: string
  description: string
  startDate: string
  endDate: string
  startAt?: string
  endAt?: string
  timezone: string
  published?: boolean
  active?: boolean
  enabled?: boolean
  rewards: OfficialEventReward[]
  rules: {
    maxDailyMatches: number
    pointDivisor: number
    maxEventPointsPerMatch?: number
  }
  scoring?: {
    pointDivisor: number
    maxEventPointsPerMatch: number
  }
  dailyMatchLimit?: number
  rewardsDistributed?: boolean
  createdAt?: any
  updatedAt?: any
}

export interface EventParticipant {
  userId: string
  displayName: string
  photoURL?: string | null
  avatar?: string | null
  district?: string
  distrito?: string
  eventPoints: number
  points?: number
  countedMatches?: number
  totalMatches: number
  matchesToday?: number
  dailyMatches?: Record<string, number>
  bestScore?: number
  totalScore?: number
  lastPlayedDate?: string
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

export const OFFICIAL_PORTUGAL_EM_JOGO_ID = 'portugal-em-jogo-2026'
export const DEFAULT_OFFICIAL_EVENT_ID = OFFICIAL_PORTUGAL_EM_JOGO_ID

export const OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO: OfficialEventConfig = {
  id: OFFICIAL_PORTUGAL_EM_JOGO_ID,
  name: 'PRIMEIRO DESAFIO NACIONAL — PORTUGAL EM JOGO',
  title: 'PRIMEIRO DESAFIO NACIONAL — PORTUGAL EM JOGO',
  subtitle: 'PORTUGAL EM JOGO',
  tag: 'Oficial',
  type: 'Evento Especial',
  theme:
    'História, Geografia, Cultura, Tradições, Sociedade, Atualidade, Desporto, Curiosidades, Personalidades e Património',
  description:
    'Um grande desafio sobre Portugal, misturando conhecimento de História, Geografia, Cultura, Tradições, Sociedade, Atualidade, Desporto, Curiosidades, Personalidades e Património. Joga partidas normais válidas do jogo para subir no ranking nacional!',
  startDate: '2026-09-16T20:00:00+01:00',
  endDate: '2026-09-30T23:59:59+01:00',
  startAt: '2026-09-16T20:00:00+01:00',
  endAt: '2026-09-30T23:59:59+01:00',
  timezone: 'Europe/Lisbon',
  published: true,
  active: true,
  enabled: true,
  dailyMatchLimit: 10,
  scoring: {
    pointDivisor: 10,
    maxEventPointsPerMatch: 100,
  },
  rules: {
    maxDailyMatches: 10,
    pointDivisor: 10,
    maxEventPointsPerMatch: 100,
  },
  rewards: [
    { position: 1, title: '1.º Lugar', acordas: 10000, medal: '🥇', label: '10.000 Acordas' },
    { position: 2, title: '2.º Lugar', acordas: 7500, medal: '🥈', label: '7.500 Acordas' },
    { position: 3, title: '3.º Lugar', acordas: 5000, medal: '🥉', label: '5.000 Acordas' },
  ],
  rewardsDistributed: false,
}

export const OFFICIAL_EVENT: OfficialEventConfig = OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO

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
export function getEventStatus(
  event?: OfficialEventConfig | null,
  now: Date = new Date()
): EventStatus | null {
  if (!event) return null
  const startStr = event.startDate || event.startAt
  const endStr = event.endDate || event.endAt
  if (!startStr || !endStr) return null

  const startMs = new Date(startStr).getTime()
  const endMs = new Date(endStr).getTime()
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
export function getEventCountdown(
  event?: OfficialEventConfig | null,
  now: Date = new Date()
): CountdownDetails | null {
  if (!event) return null
  const startStr = event.startDate || event.startAt
  const endStr = event.endDate || event.endAt
  if (!startStr || !endStr) return null

  const status = getEventStatus(event, now)
  if (!status) return null

  const statusLabel = getEventStatusLabel(status)
  const startMs = new Date(startStr).getTime()
  const endMs = new Date(endStr).getTime()
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
 * Converte a pontuação da partida em Pontos de Evento:
 * - Divisor configurável (padrão: 10)
 * - Teto máximo por partida válida de 100 pontos de evento
 * - Arredondamento determinístico
 *   1000 pts jogo -> 100 pts evento
 *   800 pts jogo  -> 80 pts evento
 *   600 pts jogo  -> 60 pts evento
 *   400 pts jogo  -> 40 pts evento
 *   200 pts jogo  -> 20 pts evento
 */
export function calculateEventPoints(
  matchScore: number,
  divisor: number = 10,
  maxPoints: number = 100
): number {
  if (typeof matchScore !== 'number' || isNaN(matchScore) || matchScore <= 0 || divisor <= 0) {
    return 0
  }
  const raw = Math.round(matchScore / divisor)
  return Math.min(maxPoints, Math.max(0, raw))
}

/**
 * Obtém o número de partidas contabilizadas pelo jogador no dia de hoje (fuso horário de Lisboa)
 */
export function getDailyMatchesCount(
  participant: EventParticipant | null,
  dateStr?: string
): number {
  if (!participant) return 0
  const targetDate = dateStr || getLisbonDateString()
  if (participant.dailyMatches && typeof participant.dailyMatches[targetDate] === 'number') {
    return Number(participant.dailyMatches[targetDate])
  }
  if (participant.lastPlayedDate === targetDate && typeof participant.matchesToday === 'number') {
    return Number(participant.matchesToday)
  }
  return 0
}

/**
 * Ordenação determinística de ranking de participantes reais
 * Critérios rigorosos de desempate:
 * 1. Pontos de evento DESC
 * 2. Pontuação total bruta no jogo DESC
 * 3. Melhor pontuação numa única partida DESC
 * 4. Menor número de partidas contabilizadas ASC (eficiência)
 * 5. Nome de exibição ASC
 * 6. userId ASC (estabilidade matemática total)
 */
export function sortEventParticipants(list: EventParticipant[]): EventParticipant[] {
  return [...list]
    .sort((a, b) => {
      const ptsA = Number(a.eventPoints ?? a.points ?? 0)
      const ptsB = Number(b.eventPoints ?? b.points ?? 0)
      if (ptsB !== ptsA) return ptsB - ptsA

      const totA = Number(a.totalScore || 0)
      const totB = Number(b.totalScore || 0)
      if (totB !== totA) return totB - totA

      const bestA = Number(a.bestScore || 0)
      const bestB = Number(b.bestScore || 0)
      if (bestB !== bestA) return bestB - bestA

      const matchesA = Number(a.countedMatches ?? a.totalMatches ?? 0)
      const matchesB = Number(b.countedMatches ?? b.totalMatches ?? 0)
      if (matchesA !== matchesB) return matchesA - matchesB

      const nameDiff = (a.displayName || '').localeCompare(b.displayName || '', 'pt-PT')
      if (nameDiff !== 0) return nameDiff

      return (a.userId || '').localeCompare(b.userId || '')
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
    callback([OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO])
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
          if (data.published === true || data.active === true || data.enabled === true) {
            list.push({
              id: docSnap.id,
              name: data.name || data.title || 'Evento Especial',
              title: data.title || data.name || 'Evento Especial',
              subtitle: data.subtitle || '',
              tag: data.tag || 'Oficial',
              type: data.type || 'Evento Especial',
              theme: data.theme || '',
              description: data.description || '',
              startDate: data.startDate || data.startAt || '',
              endDate: data.endDate || data.endAt || '',
              startAt: data.startAt || data.startDate || '',
              endAt: data.endAt || data.endDate || '',
              timezone: data.timezone || 'Europe/Lisbon',
              published: Boolean(data.published ?? true),
              active: Boolean(data.active ?? true),
              enabled: Boolean(data.enabled ?? true),
              rewards: Array.isArray(data.rewards)
                ? data.rewards
                : OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.rewards,
              rules: {
                maxDailyMatches: Number(data.rules?.maxDailyMatches || 10),
                pointDivisor: Number(data.rules?.pointDivisor || 10),
                maxEventPointsPerMatch: Number(data.rules?.maxEventPointsPerMatch || 100),
              },
              scoring: {
                pointDivisor: Number(data.scoring?.pointDivisor || data.rules?.pointDivisor || 10),
                maxEventPointsPerMatch: Number(
                  data.scoring?.maxEventPointsPerMatch || data.rules?.maxEventPointsPerMatch || 100
                ),
              },
              dailyMatchLimit: Number(data.dailyMatchLimit || data.rules?.maxDailyMatches || 10),
              rewardsDistributed: Boolean(data.rewardsDistributed),
            })
          }
        })

        if (list.length === 0) {
          // Fallback autoritativo para o evento canónico oficial
          callback([OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO])
        } else {
          callback(list)
        }
      },
      (err) => {
        console.warn('[EVENTS] Aviso na subscrição de eventos, a usar configuração oficial:', err)
        callback([OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO])
      }
    )
  } catch (err) {
    console.error('[EVENTS] Falha na subscrição de eventos:', err)
    callback([OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO])
    return () => {}
  }
}

/**
 * Subscrição em tempo real aos participantes reais de um evento no Firestore
 * Usa consulta simples de campo único com indexação padrão automática,
 * aplicando critérios determinísticos de desempate via JavaScript para máxima resiliência.
 */
export function subscribeEventRanking(
  eventId: string = OFFICIAL_PORTUGAL_EM_JOGO_ID,
  callback?: (participants: EventParticipant[]) => void,
  limitCount: number = 50
): Unsubscribe {
  if (!db || !eventId || !callback) {
    if (callback) callback([])
    return () => {}
  }

  try {
    const participantsRef = collection(db, 'events', eventId, 'participants')
    // Indexação padrão automática de campo único por eventPoints
    const q = query(
      participantsRef,
      orderBy('eventPoints', 'desc'),
      limit(limitCount)
    )

    const mapDocToParticipant = (docSnap: any): EventParticipant => {
      const data = docSnap.data() || {}
      const ep =
        typeof data.eventPoints === 'number'
          ? data.eventPoints
          : typeof data.points === 'number'
          ? data.points
          : 0
      const cm =
        typeof data.countedMatches === 'number'
          ? data.countedMatches
          : typeof data.totalMatches === 'number'
          ? data.totalMatches
          : 0
      const tm = typeof data.totalMatches === 'number' ? data.totalMatches : cm
      return {
        userId: docSnap.id,
        displayName: data.displayName || 'Jogador',
        photoURL: data.photoURL || data.avatar || null,
        avatar: data.avatar || data.photoURL || null,
        district: data.district || data.distrito || 'Portugal',
        distrito: data.distrito || data.district || 'Portugal',
        eventPoints: ep,
        points: ep,
        countedMatches: cm,
        totalMatches: tm,
        matchesToday:
          typeof data.matchesToday === 'number'
            ? data.matchesToday
            : undefined,
        dailyMatches: data.dailyMatches || {},
        bestScore: typeof data.bestScore === 'number' ? data.bestScore : 0,
        totalScore: typeof data.totalScore === 'number' ? data.totalScore : 0,
        lastPlayedDate: data.lastPlayedDate,
        lastPlayedAt: data.lastPlayedAt,
        updatedAt: data.updatedAt,
      }
    }

    return onSnapshot(
      q,
      (snapshot) => {
        const rawList: EventParticipant[] = []
        snapshot.forEach((docSnap) => {
          rawList.push(mapDocToParticipant(docSnap))
        })

        const sorted = sortEventParticipants(rawList)
        callback(sorted)
      },
      (error) => {
        console.warn('[EVENTS] Aviso no orderBy do ranking, a usar escuta direta sem índice:', error)
        const fallbackQ = query(participantsRef, limit(limitCount))
        return onSnapshot(
          fallbackQ,
          (fallbackSnap) => {
            const rawList: EventParticipant[] = []
            fallbackSnap.forEach((docSnap) => {
              rawList.push(mapDocToParticipant(docSnap))
            })
            callback(sortEventParticipants(rawList))
          },
          (err2) => {
            console.error('[EVENTS] Falha na subscrição fallback de ranking:', err2)
            callback([])
          }
        )
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
  eventId: string = OFFICIAL_PORTUGAL_EM_JOGO_ID,
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
        const ep =
          typeof data.eventPoints === 'number'
            ? data.eventPoints
            : typeof data.points === 'number'
            ? data.points
            : 0
        const cm =
          typeof data.countedMatches === 'number'
            ? data.countedMatches
            : typeof data.totalMatches === 'number'
            ? data.totalMatches
            : 0
        const tm = typeof data.totalMatches === 'number' ? data.totalMatches : cm

        callback({
          userId: docSnap.id,
          displayName: data.displayName || 'Jogador',
          photoURL: data.photoURL || data.avatar || null,
          avatar: data.avatar || data.photoURL || null,
          district: data.district || data.distrito || 'Portugal',
          distrito: data.distrito || data.district || 'Portugal',
          eventPoints: ep,
          points: ep,
          countedMatches: cm,
          totalMatches: tm,
          matchesToday:
            typeof data.matchesToday === 'number'
              ? data.matchesToday
              : undefined,
          dailyMatches: data.dailyMatches || {},
          bestScore: typeof data.bestScore === 'number' ? data.bestScore : 0,
          totalScore: typeof data.totalScore === 'number' ? data.totalScore : 0,
          lastPlayedDate: data.lastPlayedDate,
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
