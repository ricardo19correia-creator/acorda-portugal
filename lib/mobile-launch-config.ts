/**
 * Configuração Centralizada Oficial — Lançamento Mobile do Acorda Portugal
 * acordaportugal.pt
 *
 * Data Oficial: 11 de setembro de 2026 às 22:00 — Europe/Lisbon (WEST / UTC+1)
 */

export interface PlatformConfig {
  name: string
  status: 'available' | 'coming_soon'
  url?: string
  comingSoonText: string
  buttonText: string
  iconType: 'android' | 'apple'
}

export interface MobileLaunchConfig {
  targetDateIso: string
  timezone: string
  targetTimestampMs: number
  preLaunch: {
    badge: string
    title: string
    subtitle: string
    platformsBadge: string
    testSection: {
      badge: string
      title: string
      subtitle: string
      buttonText: string
      href: string
    }
    competeSection: {
      title: string
      description: string
    }
  }
  postLaunch: {
    badge: string
    title: string
    subtitle: string
    competeSection: {
      title: string
      description: string
    }
  }
  platforms: {
    android: PlatformConfig
    ios: PlatformConfig
  }
}

/**
 * Data oficial com offset explícito para Western European Summer Time (UTC+1).
 * 11 de setembro de 2026 às 22:00 (Europe/Lisbon) = 2026-09-11T21:00:00.000Z
 */
export const OFFICIAL_LAUNCH_DATE_ISO = '2026-09-11T22:00:00+01:00'
export const OFFICIAL_LAUNCH_TIMEZONE = 'Europe/Lisbon'

export const MOBILE_LAUNCH_CONFIG: MobileLaunchConfig = {
  targetDateIso: OFFICIAL_LAUNCH_DATE_ISO,
  timezone: OFFICIAL_LAUNCH_TIMEZONE,
  targetTimestampMs: new Date(OFFICIAL_LAUNCH_DATE_ISO).getTime(),
  preLaunch: {
    badge: '🚀 LANÇAMENTO MOBILE',
    title: 'O DESAFIO ESTÁ A CHEGAR AO TEU TELEMÓVEL',
    subtitle: 'Prepara-te para competir, testar os teus conhecimentos e desafiar os teus amigos.',
    platformsBadge: '📱 ANDROID + iOS',
    testSection: {
      badge: '🧪 JÁ PODES TESTAR',
      title: 'A versão de testes está online.',
      subtitle: 'Experimenta já toda a trivia nacional no teu navegador.',
      buttonText: 'TESTAR AGORA',
      href: '/jogar',
    },
    competeSection: {
      title: 'COMPETE COM UM AMIGO 🇵🇹',
      description: 'Testem o vosso conhecimento sobre centenas de temas e descubram quem sabe mais.',
    },
  },
  postLaunch: {
    badge: '🎉 JÁ ESTÁ DISPONÍVEL!',
    title: 'O ACORDA PORTUGAL CHEGOU AO TEU TELEMÓVEL',
    subtitle: 'É hora de competir. 🇵🇹',
    competeSection: {
      title: 'COMPETE COM UM AMIGO 🇵🇹',
      description: 'Testem o vosso conhecimento e descubram quem sabe mais.',
    },
  },
  platforms: {
    android: {
      name: 'Android',
      status: 'coming_soon',
      url: '', // Inserir a URL oficial da Google Play Store quando publicada
      comingSoonText: 'Disponível em breve',
      buttonText: 'DESCARREGAR ANDROID',
      iconType: 'android',
    },
    ios: {
      name: 'iOS',
      status: 'coming_soon',
      url: '', // Inserir a URL oficial da Apple App Store quando publicada
      comingSoonText: 'Disponível em breve',
      buttonText: 'DESCARREGAR iOS',
      iconType: 'apple',
    },
  },
}
