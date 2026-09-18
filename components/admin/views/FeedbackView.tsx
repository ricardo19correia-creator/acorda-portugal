'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  MessageSquarePlus,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpDown,
  X,
  User,
  ShieldCheck,
  Check,
  Trash2,
  Send,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Flame,
  AlertTriangle,
} from 'lucide-react'
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  type FeedbackItem,
  type FeedbackType,
  type FeedbackStatus,
  type FeedbackPriority,
  type FeedbackLocation,
  FEEDBACK_TYPES,
  FEEDBACK_STATUSES,
  FEEDBACK_PRIORITIES,
  FEEDBACK_LOCATIONS,
} from '@/types/feedback'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/user-avatar'
import { DEFAULT_AVATAR } from '@/lib/avatars'

interface FeedbackViewProps {
  getIdToken: () => Promise<string | null>
  adminUser?: any
}

type SortOption = 'newest' | 'oldest' | 'priority' | 'updated'

export function FeedbackView({ getIdToken, adminUser }: FeedbackViewProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filters State
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Detail Modal State
  const [activeFeedback, setActiveFeedback] = useState<FeedbackItem | null>(null)
  const [modalStatus, setModalStatus] = useState<FeedbackStatus>('NEW')
  const [modalPriority, setModalPriority] = useState<FeedbackPriority>('MEDIUM')
  const [modalNotes, setModalNotes] = useState<string>('')
  const [isSavingAction, setIsSavingAction] = useState(false)
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null)
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null)

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 1. Realtime Firestore Listener
  useEffect(() => {
    setLoading(true)
    const q = query(
      collection(db, 'feedback'),
      orderBy('createdAt', 'desc'),
      limit(250)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: FeedbackItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }))
        setFeedbacks(items)
        setLoading(false)
      },
      (error) => {
        console.warn('[ADMIN FEEDBACK REALTIME ERROR]', error)
        // Fallback para API caso o listener falhe por regras locais de sessão
        fetchFromApi()
      }
    )

    return () => unsubscribe()
  }, [])

  // Manual API fetch fallback
  const fetchFromApi = useCallback(async () => {
    setRefreshing(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/feedback?limit=250', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success && Array.isArray(json.feedbacks)) {
        setFeedbacks(json.feedbacks)
      }
    } catch (e) {
      console.error('[ADMIN FEEDBACK FETCH ERROR]', e)
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }, [getIdToken])

  // Open Feedback Detail Modal
  const handleOpenDetail = (item: FeedbackItem) => {
    setActiveFeedback(item)
    setModalStatus(item.status || 'NEW')
    setModalPriority(item.priority || 'MEDIUM')
    setModalNotes(item.adminNotes || '')
    setActionSuccessMsg(null)
    setActionErrorMsg(null)
    setShowDeleteConfirm(false)
  }

  // Save Modal Changes
  const handleSaveAction = async (action: 'UPDATE_STATUS' | 'UPDATE_PRIORITY' | 'UPDATE_NOTES' | 'RESOLVE' | 'DELETE') => {
    if (!activeFeedback) return
    setIsSavingAction(true)
    setActionSuccessMsg(null)
    setActionErrorMsg(null)

    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error('Sessão administrativa expirada.')
      }

      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          feedbackId: activeFeedback.id,
          action,
          status: modalStatus,
          priority: modalPriority,
          adminNotes: modalNotes,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erro ao processar alteração.')
      }

      if (action === 'DELETE') {
        setActiveFeedback(null)
        setShowDeleteConfirm(false)
      } else {
        setActiveFeedback((prev) => (prev ? { ...prev, ...json.feedback } : null))
        setActionSuccessMsg('Ação gravada e registada com sucesso na auditoria!')
        setTimeout(() => setActionSuccessMsg(null), 4000)
      }
    } catch (err: any) {
      setActionErrorMsg(err?.message || 'Falha ao executar ação.')
    } finally {
      setIsSavingAction(false)
    }
  }

  // Real Metrics Calculation from Firestore
  const metrics = useMemo(() => {
    const total = feedbacks.length
    const novos = feedbacks.filter((f) => f.status === 'NEW').length
    const emAnalise = feedbacks.filter((f) => f.status === 'IN_REVIEW').length
    const emDesenvolvimento = feedbacks.filter((f) => f.status === 'IN_PROGRESS').length
    const resolvidos = feedbacks.filter((f) => f.status === 'RESOLVED').length
    const altaPrioridade = feedbacks.filter(
      (f) => f.priority === 'HIGH' || f.priority === 'CRITICAL'
    ).length

    return { total, novos, emAnalise, emDesenvolvimento, resolvidos, altaPrioridade }
  }, [feedbacks])

  // Filtered and Sorted Feedbacks
  const filteredFeedbacks = useMemo(() => {
    let result = [...feedbacks]

    if (selectedType !== 'all') {
      result = result.filter((f) => f.type === selectedType)
    }

    if (selectedStatus !== 'all') {
      result = result.filter((f) => f.status === selectedStatus)
    }

    if (selectedPriority !== 'all') {
      result = result.filter((f) => f.priority === selectedPriority)
    }

    if (selectedLocation !== 'all') {
      result = result.filter((f) => f.location === selectedLocation)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (f) =>
          (f.title && f.title.toLowerCase().includes(q)) ||
          (f.description && f.description.toLowerCase().includes(q)) ||
          (f.userDisplayName && f.userDisplayName.toLowerCase().includes(q)) ||
          (f.userEmail && f.userEmail.toLowerCase().includes(q))
      )
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime()
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime()
        return timeB - timeA
      }
      if (sortBy === 'oldest') {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime()
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime()
        return timeA - timeB
      }
      if (sortBy === 'priority') {
        const orderA = FEEDBACK_PRIORITIES[a.priority]?.order || 0
        const orderB = FEEDBACK_PRIORITIES[b.priority]?.order || 0
        return orderB - orderA
      }
      if (sortBy === 'updated') {
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : new Date(a.updatedAt || 0).getTime()
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : new Date(b.updatedAt || 0).getTime()
        return timeB - timeA
      }
      return 0
    })

    return result
  }, [feedbacks, selectedType, selectedStatus, selectedPriority, selectedLocation, searchQuery, sortBy])

  return (
    <div className="space-y-6">
      {/* 1. Header do Módulo & Ação de Atualização */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div>
          <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-emerald-400" />
            <span>Centro de Feedback dos Jogadores</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Consulta, triagem, acompanhamento e resolução de erros e ideias recebidas em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchFromApi}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing ? 'animate-spin text-emerald-400' : '')} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* 2. Top Statistics Cards (Dados Reais do Firestore) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-md">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
            Total
          </span>
          <span className="text-2xl font-display font-black text-white mt-1 block">
            {metrics.total}
          </span>
        </div>

        {/* Novos */}
        <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 backdrop-blur-md">
          <span className="text-[11px] uppercase tracking-wider text-blue-300 font-bold block">
            Novos
          </span>
          <span className="text-2xl font-display font-black text-blue-400 mt-1 block">
            {metrics.novos}
          </span>
        </div>

        {/* Em Análise */}
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-md">
          <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold block">
            Em Análise
          </span>
          <span className="text-2xl font-display font-black text-amber-400 mt-1 block">
            {metrics.emAnalise}
          </span>
        </div>

        {/* Em Desenvolvimento */}
        <div className="p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md">
          <span className="text-[11px] uppercase tracking-wider text-cyan-300 font-bold block">
            Em Desenv.
          </span>
          <span className="text-2xl font-display font-black text-cyan-400 mt-1 block">
            {metrics.emDesenvolvimento}
          </span>
        </div>

        {/* Resolvidos */}
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md">
          <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold block">
            Resolvidos
          </span>
          <span className="text-2xl font-display font-black text-emerald-400 mt-1 block">
            {metrics.resolvidos}
          </span>
        </div>

        {/* Alta Prioridade */}
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-md">
          <span className="text-[11px] uppercase tracking-wider text-rose-300 font-bold block">
            Alta Prioridade
          </span>
          <span className="text-2xl font-display font-black text-rose-400 mt-1 block">
            {metrics.altaPrioridade}
          </span>
        </div>
      </div>

      {/* 3. Filtros, Pesquisa e Ordenação */}
      <div className="p-5 rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl backdrop-blur-md space-y-4">
        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por título, descrição, utilizador ou email..."
            className="w-full rounded-2xl border border-white/15 bg-slate-950/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Seletores de Filtro */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Tipo */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Tipo
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">Todos os Tipos</option>
              {FEEDBACK_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.emoji} {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">Todos os Estados</option>
              {Object.entries(FEEDBACK_STATUSES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Prioridade
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">Todas as Prioridades</option>
              {Object.entries(FEEDBACK_PRIORITIES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Localização */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Localização
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">Todas as Localizações</option>
              {FEEDBACK_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenação */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Ordenamento
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="newest">Mais recentes primeiro</option>
              <option value="oldest">Mais antigos primeiro</option>
              <option value="priority">Prioridade mais alta</option>
              <option value="updated">Última atualização</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Lista de Feedbacks: Desktop Table & Mobile Cards */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-md">
        <div className="p-4 border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold">
            A apresentar <span className="text-white font-mono">{filteredFeedbacks.length}</span> de{' '}
            <span className="text-white font-mono">{feedbacks.length}</span> feedbacks
          </span>
          <span className="text-[11px] font-mono text-emerald-400">
            Sincronização em tempo real ativa
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <RefreshCw className="h-7 w-7 animate-spin mx-auto text-emerald-400" />
            <p className="text-xs font-bold uppercase tracking-wider">
              A carregar feedbacks dos jogadores...
            </p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <MessageSquarePlus className="h-8 w-8 mx-auto text-slate-600" />
            <p className="text-sm font-bold text-white">Nenhum feedback encontrado</p>
            <p className="text-xs text-slate-400">
              Experimenta ajustar os filtros ou os termos da pesquisa.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table (hidden on mobile/tablet pequeno) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-white/10 bg-slate-950/60 font-display text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">Tipo</th>
                    <th className="px-4 py-3.5">Título</th>
                    <th className="px-4 py-3.5">Jogador</th>
                    <th className="px-4 py-3.5">Local</th>
                    <th className="px-4 py-3.5">Data</th>
                    <th className="px-4 py-3.5">Prioridade</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredFeedbacks.map((item) => {
                    const typeCfg = FEEDBACK_TYPES.find((t) => t.id === item.type) || FEEDBACK_TYPES[0]
                    const statusCfg = FEEDBACK_STATUSES[item.status] || FEEDBACK_STATUSES.NEW
                    const priorityCfg = FEEDBACK_PRIORITIES[item.priority] || FEEDBACK_PRIORITIES.MEDIUM

                    const dateStr = item.createdAt?.toDate
                      ? item.createdAt.toDate().toLocaleDateString('pt-PT', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : 'Recente'

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleOpenDetail(item)}
                        className="hover:bg-white/5 transition cursor-pointer select-none group"
                      >
                        {/* Tipo */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border',
                              typeCfg.badgeClass
                            )}
                          >
                            <span>{typeCfg.emoji}</span>
                            <span>{typeCfg.label}</span>
                          </span>
                        </td>

                        {/* Título & Snippet */}
                        <td className="px-4 py-3.5 max-w-xs truncate">
                          <span className="font-bold text-white group-hover:text-emerald-300 transition-colors block truncate">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {item.description}
                          </span>
                        </td>

                        {/* Jogador */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <UserAvatar
                              avatarUrl={item.userPhotoURL || DEFAULT_AVATAR.image}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <span className="block font-bold text-white text-[11px] truncate">
                                {item.userDisplayName || 'Jogador'}
                              </span>
                              {item.userEmail && (
                                <span className="block text-[10px] text-slate-400 truncate">
                                  {item.userEmail}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Local */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                          {item.location || '—'}
                        </td>

                        {/* Data */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                          {dateStr}
                        </td>

                        {/* Prioridade */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border',
                              priorityCfg.badgeClass
                            )}
                          >
                            {priorityCfg.label}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border',
                              statusCfg.badgeClass
                            )}
                          >
                            <span className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dotClass)} />
                            <span>{statusCfg.label}</span>
                          </span>
                        </td>

                        {/* Ação */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                            <span>Gerir</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (displayed below lg) */}
            <div className="block lg:hidden divide-y divide-white/5">
              {filteredFeedbacks.map((item) => {
                const typeCfg = FEEDBACK_TYPES.find((t) => t.id === item.type) || FEEDBACK_TYPES[0]
                const statusCfg = FEEDBACK_STATUSES[item.status] || FEEDBACK_STATUSES.NEW
                const priorityCfg = FEEDBACK_PRIORITIES[item.priority] || FEEDBACK_PRIORITIES.MEDIUM

                const dateStr = item.createdAt?.toDate
                  ? item.createdAt.toDate().toLocaleDateString('pt-PT', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : 'Recente'

                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className="p-4 space-y-2.5 hover:bg-white/5 transition cursor-pointer select-none active:scale-99"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border',
                          typeCfg.badgeClass
                        )}
                      >
                        <span>{typeCfg.emoji}</span>
                        <span>{typeCfg.label}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border',
                            priorityCfg.badgeClass
                          )}
                        >
                          {priorityCfg.label}
                        </span>

                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border',
                            statusCfg.badgeClass
                          )}
                        >
                          <span className={cn('w-1 h-1 rounded-full', statusCfg.dotClass)} />
                          <span>{statusCfg.label}</span>
                        </span>
                      </div>
                    </div>

                    <h4 className="font-display font-black text-sm text-white">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-white/5">
                      <span className="font-medium text-slate-300">
                        {item.userDisplayName || 'Jogador'}
                      </span>
                      <span>
                        {item.location ? `${item.location} • ` : ''}
                        {dateStr}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* 5. Modal de Detalhes e Gestão Administrativa */}
      {activeFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto custom-scrollbar space-y-6">
            {/* Fechar Modal */}
            <button
              type="button"
              onClick={() => setActiveFeedback(null)}
              className="absolute right-4 top-4 h-8 w-8 grid place-items-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="space-y-2 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                {(() => {
                  const t = FEEDBACK_TYPES.find((x) => x.id === activeFeedback.type) || FEEDBACK_TYPES[0]
                  return (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border',
                        t.badgeClass
                      )}
                    >
                      <span>{t.emoji}</span>
                      <span>{t.label}</span>
                    </span>
                  )
                })()}

                <span className="text-xs text-slate-400 font-mono">
                  ID: {activeFeedback.id}
                </span>
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                {activeFeedback.title}
              </h3>
            </div>

            {/* Dados do Utilizador e Dispositivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl border border-white/10 bg-slate-950/60 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Jogador
                </span>
                <div className="flex items-center gap-2 pt-0.5">
                  <UserAvatar
                    avatarUrl={activeFeedback.userPhotoURL || DEFAULT_AVATAR.image}
                    size="sm"
                  />
                  <div>
                    <span className="block font-bold text-white">
                      {activeFeedback.userDisplayName || 'Jogador'}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {activeFeedback.userEmail || 'Sem email'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Origem & Ambiente
                </span>
                <div className="space-y-0.5 pt-0.5 text-[11px]">
                  <p className="text-slate-300">
                    <strong className="text-white">Local:</strong> {activeFeedback.location || 'Outro'}
                  </p>
                  <p className="text-slate-300">
                    <strong className="text-white">Versão:</strong> v{activeFeedback.appVersion || '1.0.0-beta'} (
                    <span className="uppercase text-emerald-400">{activeFeedback.platform || 'web'}</span>)
                  </p>
                  <p className="text-slate-500 font-mono text-[10px] truncate" title={activeFeedback.userAgent}>
                    {activeFeedback.userAgent || 'Web UserAgent'}
                  </p>
                </div>
              </div>
            </div>

            {/* Conteúdo do Feedback */}
            <div className="space-y-3">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Descrição Fornecida:
                </span>
                <p className="p-3.5 rounded-2xl border border-white/10 bg-slate-950/70 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {activeFeedback.description}
                </p>
              </div>

              {activeFeedback.reproductionSteps && (
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1">
                    Passos de Reprodução:
                  </span>
                  <p className="p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-xs text-rose-200 whitespace-pre-wrap leading-relaxed">
                    {activeFeedback.reproductionSteps}
                  </p>
                </div>
              )}
            </div>

            {/* Painel de Ações do Administrador */}
            <div className="p-5 rounded-2xl border border-emerald-500/30 bg-slate-950/90 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-display text-xs font-black uppercase tracking-wider text-white">
                  Ações Administrativas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Alterar Status */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Estado do Feedback
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as FeedbackStatus)}
                    className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-xs font-bold text-white focus:border-emerald-500"
                  >
                    {Object.entries(FEEDBACK_STATUSES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Alterar Prioridade */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={modalPriority}
                    onChange={(e) => setModalPriority(e.target.value as FeedbackPriority)}
                    className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-xs font-bold text-white focus:border-emerald-500"
                  >
                    {Object.entries(FEEDBACK_PRIORITIES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nota Administrativa */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Notas Administrativas (Visível na resposta):
                </label>
                <textarea
                  rows={3}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Ex.: Problema confirmado. Corrigir na próxima release."
                  className="w-full rounded-xl border border-white/15 bg-slate-900 p-3 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Mensagens de Sucesso e Erro */}
              {actionSuccessMsg && (
                <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {actionErrorMsg && (
                <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {/* Marcar como Resolvido Rápido */}
                  <button
                    type="button"
                    disabled={isSavingAction || modalStatus === 'RESOLVED'}
                    onClick={() => {
                      setModalStatus('RESOLVED')
                      handleSaveAction('RESOLVE')
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-display text-xs font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-40"
                  >
                    Marcar como Resolvido
                  </button>

                  {/* Guardar Alterações Gerais */}
                  <button
                    type="button"
                    disabled={isSavingAction}
                    onClick={() => {
                      if (modalStatus !== activeFeedback.status) {
                        handleSaveAction('UPDATE_STATUS')
                      } else if (modalPriority !== activeFeedback.priority) {
                        handleSaveAction('UPDATE_PRIORITY')
                      } else {
                        handleSaveAction('UPDATE_NOTES')
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    {isSavingAction ? 'A Gravar...' : 'Guardar Alterações'}
                  </button>
                </div>

                {/* Eliminação Segura */}
                <div>
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Apagar</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-rose-400 font-bold">
                        Confirmar eliminação?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSaveAction('DELETE')}
                        disabled={isSavingAction}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase cursor-pointer"
                      >
                        Sim, Apagar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-2 py-1.5 rounded-lg border border-white/20 text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
