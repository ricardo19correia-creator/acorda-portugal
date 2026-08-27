import type { BotPlayerRecord, BotStatus } from './types'

export interface BotActivitySchedule {
  preferredStartHour: number // 0-23
  preferredEndHour: number // 0-23
  matchesPerDayTarget: number
  activeDaysPerWeek: number
}

/**
 * Determina se um bot deve estar no estado ONLINE ou IDLE com base no horário de Lisboa (Europe/Lisbon)
 */
export function evaluateBotCircadianStatus(
  bot: BotPlayerRecord,
  currentDate = new Date()
): BotStatus {
  if (bot.status === 'RETIRED' || bot.status === 'SUSPENDED') {
    return bot.status
  }
  if (bot.status === 'IN_MATCH') {
    return 'IN_MATCH'
  }

  // Obter hora local em Portugal (Europe/Lisbon)
  const lisbonTimeStr = currentDate.toLocaleString('en-US', { timeZone: 'Europe/Lisbon', hour12: false })
  const lisbonHour = new Date(lisbonTimeStr).getHours()

  // Semente determinística baseada no ID do bot para gerar horários consistentes
  const botNum = parseInt(bot.id.replace(/\D/g, ''), 10) || 1
  const startHour = (botNum * 7) % 24
  const durationHours = 8 + (botNum % 8) // 8 a 15 horas de atividade diária
  const endHour = (startHour + durationHours) % 24

  let isWithinActiveWindow = false
  if (startHour < endHour) {
    isWithinActiveWindow = lisbonHour >= startHour && lisbonHour < endHour
  } else {
    // Janela que passa pela meia-noite
    isWithinActiveWindow = lisbonHour >= startHour || lisbonHour < endHour
  }

  return isWithinActiveWindow ? 'ACTIVE' : 'INACTIVE'
}
