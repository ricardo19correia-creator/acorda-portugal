'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapPin, Users, Sparkles, Medal, Trophy, ChevronRight } from 'lucide-react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { SectionHeading } from '@/components/section-heading'
import { PortugalMapInteractive, type DistrictStatItem } from '@/components/portugal-map-interactive'
import { useAuth } from '@/components/auth-provider'
import { cn } from '@/lib/utils'

export const ALL_20_DISTRICTS = [
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Vila Real',
  'Viseu',
  'Açores',
  'Madeira',
]

const MEDAL_ICONS = ['🥇', '🥈', '🥉']
const MEDAL_TONES = ['text-gold', 'text-white/90', 'text-flag-red']

export function DistrictRanking() {
  const { profile, user } = useAuth()
  const [selected, setSelected] = useState<string>('Vila Real')
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false)
  const [districtData, setDistrictData] = useState<Map<string, DistrictStatItem>>(new Map())
  const [loading, setLoading] = useState(true)

  // Real-time listener to aggregate player counts and XP per district from Firestore publicProfiles
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    try {
      const q = query(collection(db, 'publicProfiles'))
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          // Initialize map with all 20 districts with 0 stats
          const tempMap = new Map<string, { players: number; xp: number }>()
          for (const d of ALL_20_DISTRICTS) {
            tempMap.set(d, { players: 0, xp: 0 })
          }

          snapshot.forEach((docSnap) => {
            const data = docSnap.data()
            if (!data) return

            // Normalize district name
            const rawDistrict = (data.district || '').trim()
            const xp = typeof data.xp === 'number' && !isNaN(data.xp) ? data.xp : 0

            // Match to known districts
            const matchedName = ALL_20_DISTRICTS.find(
              (d) => d.toLowerCase() === rawDistrict.toLowerCase(),
            )

            if (matchedName) {
              const current = tempMap.get(matchedName)!
              tempMap.set(matchedName, {
                players: current.players + 1,
                xp: current.xp + xp,
              })
            }
          })

          // Sort all 20 districts by XP descending, then players count, then alphabetical
          const sortedList = Array.from(tempMap.entries()).map(([name, stat]) => ({
            name,
            players: stat.players,
            xp: stat.xp,
          }))

          sortedList.sort((a, b) => {
            if (b.xp !== a.xp) return b.xp - a.xp
            if (b.players !== a.players) return b.players - a.players
            return a.name.localeCompare(b.name, 'pt-PT')
          })

          // Build final Map with official position ranks
          const finalMap = new Map<string, DistrictStatItem>()
          sortedList.forEach((item, index) => {
            finalMap.set(item.name, {
              name: item.name,
              pos: index + 1,
              players: item.players,
              xp: item.xp,
            })
          })

          setDistrictData(finalMap)
          setLoading(false)
        },
        (err) => {
          console.error('[DISTRICTS] Erro ao carregar dados distritais:', err)
          setLoading(false)
        },
      )
    } catch (e) {
      console.error('[DISTRICTS] Erro ao criar subscrição:', e)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  // Auto-select user's district when profile loads
  useEffect(() => {
    if (!hasInitializedSelection) {
      const userDistrict = profile?.district
      if (userDistrict && ALL_20_DISTRICTS.includes(userDistrict)) {
        setSelected(userDistrict)
        setHasInitializedSelection(true)
      } else if (!loading && districtData.size > 0) {
        // Default to first ranked district if user district is not set
        const first = Array.from(districtData.values())[0]
        if (first) {
          setSelected(first.name)
          setHasInitializedSelection(true)
        }
      }
    }
  }, [profile, districtData, hasInitializedSelection, loading])

  // Current selected district stats
  const current = useMemo(() => {
    const stat = districtData.get(selected)
    if (stat) return stat

    return {
      name: selected,
      pos: ALL_20_DISTRICTS.indexOf(selected) + 1,
      players: 0,
      xp: 0,
    }
  }, [districtData, selected])

  // Sorted list of all 20 districts for leaderboard
  const rankedDistrictsList = useMemo(() => {
    const list = Array.from(districtData.values())
    if (list.length === 0) {
      return ALL_20_DISTRICTS.map((name, index) => ({
        name,
        pos: index + 1,
        players: 0,
        xp: 0,
      }))
    }
    return list.sort((a, b) => a.pos - b.pos)
  }, [districtData])

  const handleSelectDistrict = (name: string) => {
    setSelected(name)

    // Smooth scroll to leaderboard item on mobile/desktop if needed
    if (typeof window !== 'undefined') {
      const element = document.getElementById(`district-row-${name.toLowerCase().replace(/\s+/g, '-')}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }

  return (
    <section id="distritos" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <span id="mapa" className="absolute -top-24 pointer-events-none" />
      <SectionHeading
        eyebrow="Orgulho local"
        title="Representa o teu distrito"
        description="Cada resposta certa soma pontos ao teu distrito. Juntos, subam ao topo do mapa."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
        {/* Left Column: Interactive Vector Map + Selected District Card */}
        <div className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-card/60 p-4 sm:p-7 backdrop-blur-xl shadow-2xl">
            {/* Interactive SVG Map */}
            <PortugalMapInteractive
              selected={selected}
              onSelect={handleSelectDistrict}
              districtStats={districtData}
            />

            {/* Hint below map */}
            <p className="mt-4 text-center text-xs font-semibold text-muted-foreground flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Toca num distrito ou ilha para consultar as estatísticas
            </p>
          </div>

          {/* Selected District Detail Card */}
          <div className="rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/15 via-card/85 to-primary/10 p-6 text-center backdrop-blur-xl shadow-xl transition-all duration-300">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-gold">
              Distrito selecionado
            </p>
            <p className="mt-1 font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
              {current.name}
            </p>
            <p className="mt-2 font-display text-5xl sm:text-6xl font-black text-brand-gradient">
              {current.pos}
              <span className="align-top text-2xl font-bold">.º</span>
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
              Posição Nacional
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <StatItem
                icon={Users}
                value={current.players.toLocaleString('pt-PT')}
                label={current.players === 1 ? 'Jogador' : 'Jogadores'}
              />
              <StatItem
                icon={Sparkles}
                value={`${current.xp.toLocaleString('pt-PT')} XP`}
                label="XP Total"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Complete 20 Districts Leaderboard */}
        <div className="overflow-hidden rounded-4xl border border-white/10 bg-card/60 backdrop-blur-xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-card/80">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gold/15 text-gold ring-1 ring-gold/30">
                <Medal className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Ranking dos Distritos</h3>
                <p className="text-xs text-muted-foreground">Portugal Continental e Ilhas</p>
              </div>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-muted-foreground">
              20 Regiões
            </span>
          </div>

          {/* List of 20 Districts */}
          <div className="max-h-[720px] overflow-y-auto divide-y divide-white/5 scrollbar-thin">
            {rankedDistrictsList.map((d, i) => {
              const active = d.name === selected
              const isTop3 = i < 3

              return (
                <button
                  key={d.name}
                  id={`district-row-${d.name.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => handleSelectDistrict(d.name)}
                  className={cn(
                    'flex w-full items-center gap-4 px-5 py-4 text-left transition-all duration-200 cursor-pointer outline-none',
                    active
                      ? 'bg-primary/20 border-l-4 border-primary ring-1 ring-primary/30'
                      : 'hover:bg-white/[0.04]',
                  )}
                >
                  {/* Position Badge */}
                  <span
                    className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display text-sm font-black transition-transform',
                      isTop3
                        ? 'bg-white/10 ring-1 ring-white/20'
                        : 'bg-white/5 text-muted-foreground',
                      active && 'scale-110 ring-2 ring-primary',
                    )}
                  >
                    {isTop3 ? MEDAL_ICONS[i] : `${d.pos}.º`}
                  </span>

                  {/* Name + Players */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn('truncate font-display font-bold text-foreground', active && 'text-primary')}>
                        {d.name}
                      </p>
                      {active && (
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[0.62rem] font-black uppercase text-primary">
                          Ativo
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Users className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span>{d.players.toLocaleString('pt-PT')} {d.players === 1 ? 'jogador' : 'jogadores'}</span>
                    </p>
                  </div>

                  {/* XP total */}
                  <div className="text-right shrink-0">
                    <p className={cn('font-display text-base font-black', isTop3 ? MEDAL_TONES[i] : 'text-foreground/90')}>
                      {d.xp.toLocaleString('pt-PT')}
                    </p>
                    <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">
                      XP
                    </p>
                  </div>

                  <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', active ? 'text-primary translate-x-0.5' : 'opacity-40')} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function StatItem({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
}) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-3.5 border border-white/5 backdrop-blur">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1.5 font-display text-lg font-black text-foreground">{value}</p>
      <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  )
}
