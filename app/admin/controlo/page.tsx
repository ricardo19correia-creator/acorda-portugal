'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { handleGoogleLogin } from '@/lib/auth-helpers'
import { AdminSidebar, type AdminModuleId, ADMIN_NAV_ITEMS } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import type { AdminUserRecord } from '@/lib/admin-auth'

// 17 Views dos Módulos
import { DashboardView } from '@/components/admin/views/DashboardView'
import { JogadoresView } from '@/components/admin/views/JogadoresView'
import { MultiplayerView } from '@/components/admin/views/MultiplayerView'
import { PerguntasView } from '@/components/admin/views/PerguntasView'
import { RankingsView } from '@/components/admin/views/RankingsView'
import { DistritosView } from '@/components/admin/views/DistritosView'
import { MissoesView } from '@/components/admin/views/MissoesView'
import { EventosView } from '@/components/admin/views/EventosView'
import { ConquistasView } from '@/components/admin/views/ConquistasView'
import { EconomiaView } from '@/components/admin/views/EconomiaView'
import { EstatisticasView } from '@/components/admin/views/EstatisticasView'
import { AlertasView } from '@/components/admin/views/AlertasView'
import { SegurancaView } from '@/components/admin/views/SegurancaView'
import { AuditoriaView } from '@/components/admin/views/AuditoriaView'
import { ConfiguracaoView } from '@/components/admin/views/ConfiguracaoView'
import { EmergenciaView } from '@/components/admin/views/EmergenciaView'

import { ShieldAlert, Lock, ArrowLeft, RefreshCw } from 'lucide-react'

export default function CentroDeControloPage() {
  const router = useRouter()
  const { user, authResolved } = useAuth()

  const [isMounted, setIsMounted] = useState(false)
  const [activeModule, setActiveModule] = useState<AdminModuleId>('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Estado de Autorização do Servidor
  const [adminUser, setAdminUser] = useState<AdminUserRecord | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Dados Globais do Dashboard
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Obter Token de Autenticação Atual
  const getIdToken = useCallback(async (): Promise<string | null> => {
    const currentUser = auth.currentUser || user
    if (!currentUser) return null
    try {
      return await currentUser.getIdToken(false)
    } catch {
      return null
    }
  }, [user])

  // Validar Autorização no Servidor
  const verifyServerAuth = useCallback(async () => {
    const token = await getIdToken()
    if (!token) {
      setIsCheckingAuth(false)
      setAuthError('Sessão não iniciada. Por favor, inicia sessão com a conta autorizada.')
      return
    }

    setIsCheckingAuth(true)
    setAuthError(null)

    try {
      const res = await fetch('/api/admin/auth', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (res.ok && data.authorized) {
        setAdminUser(data.adminUser)
        setAuthError(null)
      } else {
        setAdminUser(null)
        setAuthError(data.error || 'Acesso Recusado (403). A tua conta não possui privilégios de administrador.')
      }
    } catch (e: any) {
      setAuthError('Erro de conexão ao validar autorização administrativa.')
    } finally {
      setIsCheckingAuth(false)
    }
  }, [getIdToken])

  // Carregar Dados do Dashboard
  const refreshDashboardData = useCallback(async () => {
    const token = await getIdToken()
    if (!token) return

    setIsRefreshing(true)
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        setDashboardData(json.data)
      }
    } catch (e) {
      console.error('[DASHBOARD FETCH ERROR]', e)
    } finally {
      setIsRefreshing(false)
    }
  }, [getIdToken])

  useEffect(() => {
    if (authResolved) {
      verifyServerAuth()
    }
  }, [authResolved, verifyServerAuth])

  useEffect(() => {
    if (adminUser) {
      refreshDashboardData()
    }
  }, [adminUser, refreshDashboardData])

  if (!isMounted || !authResolved || isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
          <span className="font-display text-xs font-black uppercase tracking-widest text-slate-400">
            A autenticar Centro de Controlo Máximo...
          </span>
        </div>
      </div>
    )
  }

  // Ecrã de Acesso Recusado / Não Autorizado (403)
  if (!adminUser || authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/15 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/10">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              403 • Acesso Restrito
            </span>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white mt-2">
              Centro de Controlo
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">{authError}</p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            {!user ? (
              <button
                type="button"
                onClick={() => handleGoogleLogin('/admin/controlo')}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
              >
                Iniciar Sessão com Google
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleGoogleLogin('/admin/controlo')}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Trocar de Conta Google
              </button>
            )}

            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 font-bold text-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar à Página Inicial</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentNav = ADMIN_NAV_ITEMS.find((n) => n.id === activeModule)

  return (
    <div className="flex min-h-screen bg-slate-950 text-zinc-100 antialiased font-sans">
      {/* Barra Lateral com os 17 Módulos */}
      <AdminSidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onExitAdmin={() => router.push('/')}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra Superior do Cockpit */}
        <AdminHeader
          adminUser={adminUser}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onRefreshData={refreshDashboardData}
          isRefreshing={isRefreshing}
          isEmergencyActive={dashboardData?.settings?.maintenanceMode || false}
          activeModuleName={currentNav?.label || 'Centro de Controlo'}
        />

        {/* Ecrã Ativo */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeModule === 'dashboard' && (
            <DashboardView
              data={dashboardData}
              onNavigateToModule={(mod: string) => setActiveModule(mod as AdminModuleId)}
            />
          )}

          {activeModule === 'jogadores' && <JogadoresView getIdToken={getIdToken} />}

          {activeModule === 'multiplayer' && <MultiplayerView getIdToken={getIdToken} />}

          {activeModule === 'perguntas' && <PerguntasView getIdToken={getIdToken} />}

          {activeModule === 'rankings' && <RankingsView getIdToken={getIdToken} />}

          {activeModule === 'distritos' && <DistritosView />}

          {activeModule === 'missoes' && <MissoesView />}

          {activeModule === 'eventos' && <EventosView />}

          {activeModule === 'conquistas' && <ConquistasView />}

          {activeModule === 'economia' && <EconomiaView getIdToken={getIdToken} />}

          {activeModule === 'estatisticas' && <EstatisticasView />}

          {activeModule === 'alertas' && <AlertasView />}

          {activeModule === 'seguranca' && <SegurancaView adminUser={adminUser} />}

          {activeModule === 'auditoria' && <AuditoriaView getIdToken={getIdToken} />}

          {activeModule === 'configuracao' && <ConfiguracaoView getIdToken={getIdToken} />}

          {activeModule === 'emergencia' && <EmergenciaView getIdToken={getIdToken} />}
        </main>
      </div>
    </div>
  )
}
