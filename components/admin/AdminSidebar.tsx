'use client'

import React from 'react'
import {
  LayoutDashboard,
  Users,
  Swords,
  HelpCircle,
  Trophy,
  MapPin,
  Target,
  Sparkles,
  Award,
  Coins,
  BarChart3,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Settings,
  AlertOctagon,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type AdminModuleId =
  | 'dashboard'
  | 'jogadores'
  | 'multiplayer'
  | 'perguntas'
  | 'rankings'
  | 'distritos'
  | 'missoes'
  | 'eventos'
  | 'conquistas'
  | 'economia'
  | 'estatisticas'
  | 'alertas'
  | 'seguranca'
  | 'auditoria'
  | 'configuracao'
  | 'emergencia'

interface NavItem {
  id: AdminModuleId
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  badgeColor?: string
  critical?: boolean
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'jogadores', label: 'Jogadores', icon: Users },
  { id: 'multiplayer', label: 'Multiplayer 1v1', icon: Swords, badge: 'Live' },
  { id: 'perguntas', label: 'Perguntas & Duplicados', icon: HelpCircle, badge: '20K' },
  { id: 'rankings', label: 'Rankings', icon: Trophy },
  { id: 'distritos', label: 'Distritos & Regiões', icon: MapPin },
  { id: 'missoes', label: 'Missões', icon: Target },
  { id: 'eventos', label: 'Eventos', icon: Sparkles },
  { id: 'conquistas', label: 'Conquistas', icon: Award },
  { id: 'economia', label: 'Economia & Moedas', icon: Coins },
  { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3 },
  { id: 'alertas', label: 'Alertas do Sistema', icon: AlertTriangle },
  { id: 'seguranca', label: 'Segurança', icon: ShieldCheck },
  { id: 'auditoria', label: 'Auditoria (Logs)', icon: FileText },
  { id: 'configuracao', label: 'Configuração Global', icon: Settings },
  { id: 'emergencia', label: 'Modo Emergência', icon: AlertOctagon, critical: true },
]

interface AdminSidebarProps {
  activeModule: AdminModuleId
  onSelectModule: (id: AdminModuleId) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  onExitAdmin: () => void
}

export function AdminSidebar({
  activeModule,
  onSelectModule,
  isCollapsed,
  onExitAdmin,
}: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        'relative flex flex-col bg-slate-950 border-r border-white/10 transition-all duration-300 z-30 h-screen sticky top-0',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Topo do Menu com Logótipo Oficial */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 h-18 shrink-0">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-amber-500 p-0.5 shadow-lg shadow-emerald-500/20">
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 font-display font-black text-sm text-emerald-400">
            🇵🇹
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-display font-black text-xs uppercase tracking-wider text-white truncate">
              CENTRO DE CONTROLO
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
              ACORDA PORTUGAL
            </span>
          </div>
        )}
      </div>

      {/* Lista de Navegação dos 17 Módulos */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeModule === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectModule(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group relative text-left',
                isActive
                  ? item.critical
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/10'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : item.critical
                  ? 'text-red-400/70 hover:bg-red-500/10 hover:text-red-300'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                  isActive
                    ? item.critical
                      ? 'text-red-400'
                      : 'text-emerald-400'
                    : item.critical
                    ? 'text-red-400/80'
                    : 'text-slate-400'
                )}
              />

              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>

                  {item.badge && (
                    <span
                      className={cn(
                        'text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider',
                        isActive
                          ? 'bg-emerald-400 text-slate-950 font-black'
                          : 'bg-white/10 text-slate-300'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {isActive && (
                <div
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full',
                    item.critical ? 'bg-red-500' : 'bg-emerald-400'
                  )}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Rodapé: Botão de Sair para o Jogo Público */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <button
          type="button"
          onClick={onExitAdmin}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          {!isCollapsed && <span>Voltar ao Jogo</span>}
        </button>
      </div>
    </aside>
  )
}
