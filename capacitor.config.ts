import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pt.acordaportugal.app',
  appName: 'Acorda Portugal — Desafio Nacional',
  webDir: 'public',
  server: {
    url: 'https://acordaportugal.pt',
    cleartext: false
  }
};

export default config;