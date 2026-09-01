import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pt.acordaportugal.app',
  appName: 'Acorda Portugal — Desafio Nacional',
  webDir: 'public',
  server: {
    url: 'https://acordaportugal.pt',
    cleartext: false
  },
  plugins: {
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: false,
        twitter: false,
      },
    },
  },
};

export default config;