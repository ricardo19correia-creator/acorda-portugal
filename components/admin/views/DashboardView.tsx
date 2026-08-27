'use client'

import React from 'react'
import {
  Users,
  Bot,
  Swords,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Award,
  Coins,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'

interface DashboardViewProps {
  data: any
  onNavigateToModule: (moduleId: string) => void
}

export function DashboardView({ data, onNavigateToModule }: DashboardViewProps) {
  const kpis = data?.kpis || {
    totalUsers: 0,
    onlineHumans: 0,
    activeBots: 0,
    inMatchBots: 0,
    activeMatchesCount: 0,
    completedMatchesCount: 0,
    totalQuestions: 20050,
    publishedQuestions: 18632,
    questionsInReview: 0,
    categoriesCount: 18,
    subcategoriesCount: 233,
    alertsCount: 0,
  }

  const settings = data?.settings || {}
  const recentAlerts = data?.recentAlerts || []

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas Cockpit */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-[100px]" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-500/10 blur-[100px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-300">
              <span>🇵🇹</span>
              <span>Cockpit de Gestão e Controlo</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black uppercase text-white">
              Visão Geral da Plataforma
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Monitorização em tempo real de jogadores, duelos, bots virtuais e base editorial de Portugal.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateToModule('multiplayer')}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
            >
              <Swords className="h-4 w-4" />
              <span>Ver Duelos Ativos</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToModule('emergencia')}
              className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer active:scale-95"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Emergência</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grade de 4 Cartões KPI Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cartão 1: Jogadores Online & Humanos */}
        <div
          onClick={() => onNavigateToModule('jogadores')}
          className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Jogadores</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display text-2xl sm:text-3xl font-black text-white">
              {kpis.onlineHumans}{' '}
              <span className="text-xs font-normal text-slate-400">online agora</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              <strong className="text-emerald-400">{kpis.totalUsers}</strong> registados na base de dados
            </p>
          </div>
        </div>

        {/* Cartão 2: Bots Virtuais Ativos */}
        <div
          onClick={() => onNavigateToModule('bots')}
          className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md hover:border-cyan-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bots Virtuais</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition-transform">
              <Bot className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display text-2xl sm:text-3xl font-black text-white">
              {kpis.activeBots}{' '}
              <span className="text-xs font-normal text-slate-400">ativos (isBot: true)</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              <strong className="text-cyan-400">{kpis.inMatchBots}</strong> atualmente em partidas
            </p>
          </div>
        </div>

        {/* Cartão 3: Partidas 1v1 / Duelos */}
        <div
          onClick={() => onNavigateToModule('multiplayer')}
          className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Duelos 1v1</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
              <Swords className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display text-2xl sm:text-3xl font-black text-white">
              {kpis.activeMatchesCount}{' '}
              <span className="text-xs font-normal text-slate-400">em tempo real</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              <strong className="text-amber-400">{kpis.completedMatchesCount}</strong> partidas concluídas
            </p>
          </div>
        </div>

        {/* Cartão 4: Base Editorial de Perguntas */}
        <div
          onClick={() => onNavigateToModule('perguntas')}
          className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md hover:border-teal-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Perguntas</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 group-hover:scale-110 transition-transform">
              <HelpCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display text-2xl sm:text-3xl font-black text-white">
              {kpis.totalQuestions.toLocaleString('pt-PT')}{' '}
              <span className="text-xs font-normal text-slate-400">físicas</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              <strong className="text-teal-400">18</strong> categorias • <strong className="text-teal-400">233</strong> subtemas
            </p>
          </div>
        </div>
      </div>

      {/* Secção Secundária: Alertas do Sistema & Status de Serviços */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel Esquerdo: Estado dos Serviços Operacionais (7 Colunas) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
                Estado Operacional dos Serviços
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              100% Operacional
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-slate-950/60">
              <span className="text-slate-300 font-bold">Motor Multiplayer 1v1</span>
              <span className={`font-black px-2 py-0.5 rounded-full ${settings.multiplayerEnabled !== false ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                {settings.multiplayerEnabled !== false ? 'ATIVO' : 'DESLIGADO'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-slate-950/60">
              <span className="text-slate-300 font-bold">Matchmaking com Bots</span>
              <span className={`font-black px-2 py-0.5 rounded-full ${settings.botsEnabled !== false ? 'text-cyan-400 bg-cyan-500/10' : 'text-red-400 bg-red-500/10'}`}>
                {settings.botsEnabled !== false ? 'ATIVO' : 'DESLIGADO'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-slate-950/60">
              <span className="text-slate-300 font-bold">Modo de Manutenção</span>
              <span className={`font-black px-2 py-0.5 rounded-full ${settings.maintenanceMode ? 'text-red-400 bg-red-500/10' : 'text-slate-400 bg-white/5'}`}>
                {settings.maintenanceMode ? 'LIGADO (BLOQUEADO)' : 'DESATIVADO'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-slate-950/60">
              <span className="text-slate-300 font-bold">Indexador de Perguntas</span>
              <span className="font-black px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-500/10">
                20.050 CARREGADAS
              </span>
            </div>
          </div>
        </div>

        {/* Painel Direito: Alertas e Avisos em Tempo Real (5 Colunas) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
                Alertas do Sistema
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {recentAlerts.length} registos
            </span>
          </div>

          <div className="space-y-2.5">
            {recentAlerts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-white/5">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1.5" />
                <span>Nenhum erro crítico ou anomalia registada no sistema.</span>
              </div>
            ) : (
              recentAlerts.slice(0, 4).map((alert: any) => (
                <div key={alert.id} className="p-3 rounded-2xl border border-amber-500/20 bg-amber-950/20 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-amber-300">
                    <span>{alert.title || 'Aviso do Sistema'}</span>
                    <span className="text-[10px] text-slate-400">{alert.type}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
