'use client'

/**
 * 🇵🇹 ACORDA PORTUGAL — SUBSTITUIÇÃO DO VÍDEO GLOBAL POR IMAGEM OFICIAL
 * 
 * O antigo vídeo global de fundo (global-background.mp4) foi definitivamente
 * removido para máxima performance, menor consumo de recursos e consistência visual.
 * 
 * Este ficheiro reexporta o GlobalBackgroundImage para garantir compatibilidade
 * retroativa sem qualquer carregamento de vídeo, timers ou listeners.
 */
export { GlobalBackgroundImage, GlobalBackgroundImage as GlobalBackgroundVideo } from './GlobalBackgroundImage'
export { default } from './GlobalBackgroundImage'
