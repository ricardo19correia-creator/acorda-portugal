// Motor de Áudio & Síntese Procedural do Acorda Portugal
// Suporta Soundpacks de Vozes Tugas, Efeitos Eletroacústicos e Síntese Web Audio sem dependências externas.

import type { SoundpackId } from '@/lib/cosmetics'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        audioCtx = new AudioContextClass()
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }
    return audioCtx
  } catch {
    return null
  }
}

// Síntese de Voz Portuguesa nativa para comentários e falas tugas
export function speakPortuguese(text: string, options: { pitch?: number; rate?: number; volume?: number } = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  try {
    window.speechSynthesis.cancel() // Cancel previous queued utterances
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-PT'
    utterance.pitch = options.pitch ?? 1.1
    utterance.rate = options.rate ?? 1.15
    utterance.volume = options.volume ?? 1.0

    const voices = window.speechSynthesis.getVoices()
    const ptVoice = voices.find((v) => v.lang.startsWith('pt-PT') || v.lang.startsWith('pt'))
    if (ptVoice) {
      utterance.voice = ptVoice
    }

    window.speechSynthesis.speak(utterance)
  } catch (e) {
    console.warn('[AUDIO ENGINE] Speech synthesis error:', e)
  }
}

// 1. Som de Apito de Árbitro de Futebol
export function playRefereeWhistle() {
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'triangle'
    osc2.type = 'sine'
    osc1.frequency.setValueAtTime(2600, ctx.currentTime)
    osc2.frequency.setValueAtTime(2850, ctx.currentTime)

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
    gain.gain.setValueAtTime(0.25, ctx.currentTime + 0.18)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start()
    osc2.start()
    osc1.stop(ctx.currentTime + 0.35)
    osc2.stop(ctx.currentTime + 0.35)
  } catch {}
}

// 2. Som de Corneta / Golo Fanfare
export function playStadiumHorn() {
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    const notes = [392, 523.25, 659.25, 783.99] // G4, C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08)

      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08)
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.08 + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.45)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + i * 0.08)
      osc.stop(ctx.currentTime + i * 0.08 + 0.45)
    })
  } catch {}
}

// 3. Som de Brinde de Copos de Vinho (Taberna)
export function playWineClink() {
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    const frequencies = [2450, 3120, 4200]
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.7)
    })
  } catch {}
}

// 4. Som de Acordeão / Taberna Alegre
export function playTavernAccordion() {
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    const chord = [261.63, 329.63, 392.0, 523.25] // C Major
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05 + idx * 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.6)
    })
  } catch {}
}

// 5. Som de Sintetizador 80s / Sci-Fi Synthwave
export function playSciFiArpeggio() {
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    const notes = [440, 554.37, 659.25, 880, 1108.73] // A Major Arpeggio
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(2000, ctx.currentTime + i * 0.06)
      filter.frequency.exponentialRampToValueAtTime(8000, ctx.currentTime + i * 0.06 + 0.15)

      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.06)
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.06 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.35)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + i * 0.06)
      osc.stop(ctx.currentTime + i * 0.06 + 0.35)
    })
  } catch {}
}

// 6. Som de Chime de Acerto Padrão
export function playDefaultCorrect() {
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07)

      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.07)
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.07 + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.4)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + i * 0.07)
      osc.stop(ctx.currentTime + i * 0.07 + 0.4)
    })
  } catch {}
}

// 7. Som de Erro Padrão
export function playDefaultWrong() {
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(180, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.28)

    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch {}
}

// 8. Som de Explosão de Moedas de Ouro
export function playGoldCoinsShower() {
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    for (let i = 0; i < 8; i++) {
      const delay = i * 0.05 + Math.random() * 0.04
      const freq = 1200 + Math.random() * 800
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)

      gain.gain.setValueAtTime(0, ctx.currentTime + delay)
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + delay + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + 0.2)
    }
  } catch {}
}

export type SoundEvent =
  | 'correct'
  | 'last_second_correct'
  | 'wrong'
  | 'streak'
  | 'victory'
  | 'defeat'
  | 'coins'

/**
 * Ponto de entrada central para reproduzir efeitos de acordo com o soundpack equipado
 */
export function triggerSoundpackAudio(soundpackId: string | null | undefined, event: SoundEvent) {
  const pack = soundpackId || 'default'

  switch (pack) {
    case 'soundpack_comentador_futebol': {
      if (event === 'correct' || event === 'last_second_correct') {
        playRefereeWhistle()
        playStadiumHorn()
        const phrases =
          event === 'last_second_correct'
            ? ['É GOOOOLO no último segundo!', 'Que golaço monumental!', 'Cravou na hora certa!']
            : ['É GOOOOLO!', 'Que golaço de craque!', 'Direto ao ângulo!']
        const phrase = phrases[Math.floor(Math.random() * phrases.length)]
        setTimeout(() => speakPortuguese(phrase, { pitch: 1.25, rate: 1.25 }), 120)
      } else if (event === 'wrong') {
        playDefaultWrong()
        const phrases = ['Foi ao poste!', 'Passou a rasar a trave!', 'Que perigo! Falhou por pouco!']
        const phrase = phrases[Math.floor(Math.random() * phrases.length)]
        setTimeout(() => speakPortuguese(phrase, { pitch: 1.0, rate: 1.2 }), 100)
      } else if (event === 'streak') {
        playStadiumHorn()
        speakPortuguese('Que jogada fantástica!', { pitch: 1.2, rate: 1.2 })
      } else if (event === 'victory') {
        playRefereeWhistle()
        playStadiumHorn()
        speakPortuguese('Vitória épica de Portugal!', { pitch: 1.2, rate: 1.15 })
      }
      break
    }

    case 'soundpack_taberna_antiga': {
      if (event === 'correct' || event === 'last_second_correct') {
        playWineClink()
        playTavernAccordion()
        const phrases = ['Saúde, carago!', 'À nossa!', 'Assim é que se responde!', 'Ora viva!']
        const phrase = phrases[Math.floor(Math.random() * phrases.length)]
        setTimeout(() => speakPortuguese(phrase, { pitch: 0.95, rate: 1.1 }), 120)
      } else if (event === 'wrong') {
        playDefaultWrong()
        const phrases = ['Ai valha-me Deus!', 'Foi ao lado!', 'Para a próxima acertas!']
        const phrase = phrases[Math.floor(Math.random() * phrases.length)]
        setTimeout(() => speakPortuguese(phrase, { pitch: 0.9, rate: 1.05 }), 100)
      } else if (event === 'streak') {
        playWineClink()
        playTavernAccordion()
        speakPortuguese('Mais uma rodada para a mesa!', { pitch: 0.95, rate: 1.1 })
      } else if (event === 'victory') {
        playWineClink()
        playTavernAccordion()
        speakPortuguese('Viva o grande campeão!', { pitch: 1.0, rate: 1.1 })
      }
      break
    }

    case 'soundpack_scifi_80s': {
      if (event === 'correct' || event === 'last_second_correct') {
        playSciFiArpeggio()
      } else if (event === 'wrong') {
        playDefaultWrong()
      } else if (event === 'streak') {
        playSciFiArpeggio()
        playGoldCoinsShower()
      } else if (event === 'victory') {
        playSciFiArpeggio()
        playGoldCoinsShower()
      }
      break
    }

    default: {
      if (event === 'correct' || event === 'last_second_correct') {
        playDefaultCorrect()
      } else if (event === 'wrong') {
        playDefaultWrong()
      } else if (event === 'coins') {
        playGoldCoinsShower()
      } else if (event === 'streak') {
        playDefaultCorrect()
        playGoldCoinsShower()
      }
      break
    }
  }
}
