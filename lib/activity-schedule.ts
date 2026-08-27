/**
 * Motor de Análise de Atividade 24 Horas em Horário Local Português (Europe/Lisbon)
 * Fornece contexto informativo sobre o ritmo do jogo ao longo do dia SEM NUNCA falsificar humanos online.
 */

export interface ActivityScheduleInfo {
  hourLisbon: number
  minuteLisbon: number
  timeStringLisbon: string
  phaseName: string
  phaseIcon: string
  intensity: 'calm' | 'moderate' | 'high' | 'peak'
  badgeLabel: string
  description: string
  isPeakHour: boolean
}

/**
 * Retorna as informações da fase de atividade atual de 24 horas para o fuso horário de Portugal (Europe/Lisbon)
 */
export function getLisbonActivitySchedule(date = new Date(), liveMatchesCount = 0): ActivityScheduleInfo {
  let hour = 12
  let minute = 0

  try {
    const formatter = new Intl.DateTimeFormat('pt-PT', {
      timeZone: 'Europe/Lisbon',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    })
    const parts = formatter.formatToParts(date)
    const rawHour = parseInt(parts.find((p) => p.type === 'hour')?.value || '12', 10)
    hour = (isNaN(rawHour) ? date.getHours() : rawHour) % 24
    const rawMin = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10)
    minute = isNaN(rawMin) ? date.getMinutes() : rawMin
  } catch {
    hour = date.getHours() % 24
    minute = date.getMinutes()
  }

  const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

  // Curva de Atividade 24 Horas em Portugal
  if (hour >= 0 && hour < 6) {
    return {
      hourLisbon: hour,
      minuteLisbon: minute,
      timeStringLisbon: timeString,
      phaseName: 'Madrugada',
      phaseIcon: '🌙',
      intensity: 'calm',
      badgeLabel: '🌙 Horário Calmo',
      description: 'Período noturno de menor afluência. Ideal para treinos e partidas tranquilas.',
      isPeakHour: false,
    }
  }

  if (hour >= 6 && hour < 9) {
    return {
      hourLisbon: hour,
      minuteLisbon: minute,
      timeStringLisbon: timeString,
      phaseName: 'Início da Manhã',
      phaseIcon: '🌅',
      intensity: 'moderate',
      badgeLabel: '🌅 Despertar Nacional',
      description: 'Início do dia com os primeiros desafios territoriais.',
      isPeakHour: false,
    }
  }

  if (hour >= 9 && hour < 12) {
    return {
      hourLisbon: hour,
      minuteLisbon: minute,
      timeStringLisbon: timeString,
      phaseName: 'Manhã Ativa',
      phaseIcon: '☀️',
      intensity: 'moderate',
      badgeLabel: '☀️ Manhã Ativa',
      description: 'Atividade contínua em quizzes diários e rankings distritais.',
      isPeakHour: false,
    }
  }

  if (hour >= 12 && hour < 14) {
    return {
      hourLisbon: hour,
      minuteLisbon: minute,
      timeStringLisbon: timeString,
      phaseName: 'Hora de Almoço',
      phaseIcon: '🍽️',
      intensity: 'high',
      badgeLabel: '🍽️ Movimento Alto',
      description: 'Pausa de almoço com fluxo elevado de partidas rápidas e duelos 1v1.',
      isPeakHour: true,
    }
  }

  if (hour >= 14 && hour < 18) {
    return {
      hourLisbon: hour,
      minuteLisbon: minute,
      timeStringLisbon: timeString,
      phaseName: 'Tarde',
      phaseIcon: '🌤️',
      intensity: 'moderate',
      badgeLabel: '🌤️ Tarde Ativa',
      description: 'Ritmo constante de partidas e subidas de nível.',
      isPeakHour: false,
    }
  }

  if (hour >= 18 && hour < 20) {
    return {
      hourLisbon: hour,
      minuteLisbon: minute,
      timeStringLisbon: timeString,
      phaseName: 'Fim de Tarde',
      phaseIcon: '🌆',
      intensity: 'high',
      badgeLabel: '🌆 Alta Atividade',
      description: 'Regresso a casa com aumento significativo de duelos entre distritos.',
      isPeakHour: true,
    }
  }

  if (hour >= 20 && hour < 23) {
    return {
      hourLisbon: hour,
      minuteLisbon: minute,
      timeStringLisbon: timeString,
      phaseName: 'Horário Nobre',
      phaseIcon: '🔥',
      intensity: 'peak',
      badgeLabel: '🔥 Maior Movimento Agora',
      description: 'Horário nobre nacional com máxima afluência competitiva em direto.',
      isPeakHour: true,
    }
  }

  // 23:00 às 23:59
  return {
    hourLisbon: hour,
    minuteLisbon: minute,
    timeStringLisbon: timeString,
    phaseName: 'Noite',
    phaseIcon: '✨',
    intensity: liveMatchesCount > 2 ? 'high' : 'moderate',
    badgeLabel: '✨ Noite Competitiva',
    description: 'Últimas partidas do dia e disputas finais pelas posições no ranking diário.',
    isPeakHour: false,
  }
}
