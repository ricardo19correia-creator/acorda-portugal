'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { signOut, updateProfile } from 'firebase/auth'
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { Activity, Award, CheckCircle2, Coins, Crown, Flame, Gamepad2, MapPin, Pencil, Save, Sparkles, Target, Trophy, UserRound, XCircle } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { AchievementCard } from '@/components/achievement-card'
import { ProfilePanel } from '@/components/profile-panel'
import { auth, db } from '@/lib/firebase'
import type { UserProfile } from '@/lib/game-data'

const achievements = [
  { id: 'primeira-vitoria', title: 'Primeira Vitória', text: 'Ganha a tua primeira partida.', icon: Trophy, tone: 'gold' as const },
  { id: 'imparavel', title: 'Imparável', text: 'Acerta 10 perguntas seguidas.', icon: Flame, tone: 'red' as const },
  { id: 'conhecedor-portugal', title: 'Conhecedor de Portugal', text: 'Responde a 100 perguntas sobre Portugal.', icon: Award, tone: 'primary' as const },
  { id: 'mestre-historia', title: 'Mestre de História', text: 'Completa a categoria de História.', icon: Sparkles, tone: 'accent' as const },
]
const districts = ['Vila Real', 'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal', 'Viana do Castelo', 'Viseu']
const format = (value: number) => value.toLocaleString('pt-PT')

function Avatar({ profile, small = false }: { profile: UserProfile; small?: boolean }) {
  const size = small ? 'h-20 w-20' : 'h-28 w-28 sm:h-32 sm:w-32'
  if (profile.photoURL) return <img src={profile.photoURL} alt={profile.displayName} className={`${size} rounded-3xl object-cover ring-4 ring-primary/30`} /> // eslint-disable-line @next/next/no-img-element
  return <div className={`grid ${size} place-items-center rounded-3xl bg-gradient-to-br from-primary/40 to-accent/20 font-display text-4xl font-black text-primary ring-4 ring-primary/30`}>{profile.displayName.charAt(0).toUpperCase()}</div>
}

export function PlayerProfile() {
  const { user, authResolved, authInitializationError, profile, profileLoading, profileError, retryProfile } = useAuth()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [draft, setDraft] = useState({ displayName: '', district: 'Vila Real' })
  const [override, setOverride] = useState<UserProfile | null>(null)
  const player = override ?? profile

  useEffect(() => { if (profile) { setDraft({ displayName: profile.displayName, district: profile.district }); setOverride(null) } }, [profile])
  const accuracy = useMemo(() => player?.totalQuestions ? (player.correctAnswers / player.totalQuestions) * 100 : 0, [player])

  const save = async () => {
    if (!user || !player) return
    const displayName = draft.displayName.trim()
    if (!displayName) { setSaveError('O nome não pode ficar vazio.'); return }
    try {
      setSaving(true); setSaveError(null)
      await updateDoc(doc(db, 'users', user.uid), { displayName, district: draft.district, updatedAt: serverTimestamp() })
      await updateProfile(user, { displayName })
      setOverride({ ...player, displayName, district: draft.district, updatedAt: new Date() })
      setEditing(false); retryProfile()
    } catch (error) { setSaveError(`Não foi possível guardar as alterações. [Firebase: ${error instanceof Error ? error.message : 'erro desconhecido'}]`) } finally { setSaving(false) }
  }
  const logout = async () => { await signOut(auth); router.replace('/') }

  if (!authResolved) return <StateCard text="A verificar a tua conta..." />
  if (authInitializationError) return <ErrorCard message={authInitializationError} onRetry={() => window.location.reload()} />
  if (!user) return <section className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Acorda Portugal</p><h1 className="mt-3 font-display text-4xl font-black">Perfil de Jogador</h1><p className="mt-4 text-muted-foreground">Cria uma conta ou faz login para veres o teu progresso.</p><div className="mt-8 text-left"><ProfilePanel /></div></section>
  if (profileError) return <ErrorCard message={profileError} onRetry={retryProfile} />
  if (profileLoading || !player) return <StateCard text="A carregar o teu perfil..." />

  const threshold = player.level * 500
  const progress = Math.max(0, Math.min(100, ((player.xp - (player.level - 1) * 500) / 500) * 100))
  const stats = [[Target, 'Perguntas respondidas', format(player.totalQuestions), 'text-primary'], [CheckCircle2, 'Respostas certas', format(player.correctAnswers), 'text-accent'], [XCircle, 'Respostas erradas', format(player.incorrectAnswers), 'text-flag-red'], [Sparkles, 'Taxa de acerto', `${accuracy.toFixed(1)}%`, 'text-gold'], [Gamepad2, 'Jogos realizados', format(player.gamesPlayed), 'text-primary'], [Sparkles, 'XP total', format(player.xp), 'text-accent'], [Flame, 'Melhor streak', `${player.bestStreak} dias`, 'text-flag-red'], [Coins, 'Euros', `€${format(player.euros)}`, 'text-gold']] as const

  return <div className="animate-rise space-y-8 sm:space-y-10">
    <section className="relative overflow-hidden rounded-4xl border border-primary/25 bg-card/75 p-6 backdrop-blur-xl sm:p-8"><div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" /><div className="relative flex flex-col gap-6 sm:flex-row sm:items-center"><Avatar profile={player} /><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Perfil de jogador</p><h1 className="mt-2 truncate font-display text-4xl font-black uppercase sm:text-5xl">{player.displayName}</h1><p className="mt-1 truncate text-sm text-muted-foreground">{player.email}</p><div className="mt-4 flex flex-wrap gap-2 text-sm font-bold"><span className="rounded-full bg-gold/15 px-3 py-1.5 text-gold">NÍVEL {player.level}</span><span className="flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-primary"><MapPin className="h-4 w-4" />{player.district}</span><span className="flex items-center gap-1.5 rounded-full bg-flag-red/15 px-3 py-1.5 text-flag-red"><Flame className="h-4 w-4 fill-current" />{player.streak} dias</span></div></div></div><div className="relative mt-7"><div className="mb-2 flex justify-between gap-4 text-sm font-semibold"><span className="text-primary">{format(player.xp)} / {format(threshold)} XP</span><span className="text-muted-foreground">Próximo nível</span></div><div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="shimmer relative h-full rounded-full bg-gradient-to-r from-primary via-accent to-gold" style={{ width: `${progress}%` }} /></div></div></section>
    <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]"><div className="sheen relative overflow-hidden rounded-4xl border border-gold/25 bg-gradient-to-br from-gold/15 via-card/85 to-primary/10 p-6 sm:p-8"><div className="relative flex items-center gap-5"><Avatar profile={player} small /><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Player card</p><h2 className="mt-1 font-display text-3xl font-black uppercase">{player.displayName}</h2><p className="mt-1 text-sm text-muted-foreground">Nível {player.level} · {player.district}</p></div></div><div className="relative mt-7 grid grid-cols-2 gap-3"><Metric label="Euros virtuais" value={`€${format(player.euros)}`} /><Metric label="Ranking" value="Em breve" /></div></div><div className="rounded-4xl border border-flag-red/25 bg-card/75 p-6 backdrop-blur"><div className="flex items-center gap-3"><Flame className="h-8 w-8 text-flag-red" /><div><p className="font-display text-xl font-bold">Sequência ativa</p><p className="text-sm text-muted-foreground">Joga hoje para a manter.</p></div></div><p className="mt-7 font-display text-5xl font-black text-flag-red">{player.streak}<span className="ml-2 text-lg text-muted-foreground">dias</span></p><div className="mt-5 flex justify-between rounded-2xl bg-white/[0.04] px-4 py-3 text-sm"><span className="text-muted-foreground">Melhor sequência</span><strong>{player.bestStreak} dias</strong></div></div></section>
    <Section title="Estatísticas" description="O teu desempenho no Desafio Nacional."><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{stats.map(([Icon, label, value, color]) => <div key={label} className="rounded-2xl border border-white/10 bg-card/65 p-4 transition hover:-translate-y-1 hover:border-white/20"><Icon className={`h-5 w-5 ${color}`} /><p className="mt-4 font-display text-2xl font-black">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}</div></Section>
    <Section title="Conquistas" description={`${player.unlockedAchievements.length} desbloqueadas`}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{achievements.map((achievement) => <AchievementCard key={achievement.id} achievement={achievement} unlocked={player.unlockedAchievements.includes(achievement.id)} />)}</div></Section>
    <section className="grid gap-5 lg:grid-cols-2"><Info icon={MapPin} title="O teu distrito"><p className="font-display text-3xl font-black">{player.district}</p><p className="mt-4 text-sm text-muted-foreground">Posição distrital e XP do distrito estarão disponíveis em breve.</p></Info><Info icon={Crown} title="Ranking"><div className="space-y-3"><div className="flex justify-between rounded-2xl bg-white/[0.04] p-4"><span>Ranking nacional</span><strong className="text-muted-foreground">Em breve</strong></div><div className="flex justify-between rounded-2xl bg-white/[0.04] p-4"><span>Ranking distrital</span><strong className="text-muted-foreground">Em breve</strong></div></div></Info></section>
    <Section title="Atividade recente" description="O teu histórico de jogo e recompensas."><div className="flex min-h-44 flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-card/60 p-8 text-center"><Activity className="h-9 w-9 text-muted-foreground" /><p className="mt-4 text-sm text-muted-foreground">Começa a jogar para veres a tua atividade aqui.</p></div></Section>
    <Section title="Personalização" description="Atualiza os dados que podem ser guardados com segurança no teu perfil."><div className="rounded-3xl border border-white/10 bg-card/65 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><UserRound className="h-5 w-5 text-primary" /><div><p className="font-semibold">Nome e distrito</p><p className="text-sm text-muted-foreground">O avatar da conta será suportado numa próxima atualização.</p></div></div><button onClick={() => { setEditing(!editing); setSaveError(null) }} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"><Pencil className="h-4 w-4" />Editar</button></div>{editing && <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm text-muted-foreground">Nome<input value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-background/60 px-3 py-2.5 text-foreground" /></label><label className="text-sm text-muted-foreground">Distrito<select value={draft.district} onChange={(event) => setDraft({ ...draft, district: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-background/60 px-3 py-2.5 text-foreground">{districts.map((district) => <option key={district}>{district}</option>)}</select></label><div className="sm:col-span-2"><button disabled={saving} onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'A guardar...' : 'Guardar alterações'}</button>{saveError && <p className="mt-3 text-sm text-red-200">{saveError}</p>}</div></div>}</div></Section>
    <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-flag-red/30 bg-flag-red/10 px-5 py-4 font-semibold text-flag-red transition hover:bg-flag-red/20">Terminar sessão</button>
  </div>
}

function StateCard({ text }: { text: string }) { return <div className="rounded-3xl border border-white/10 bg-card/70 p-8 text-center backdrop-blur"><Sparkles className="mx-auto h-7 w-7 animate-pulse text-primary" /><p className="mt-4 text-muted-foreground">{text}</p></div> }
function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="rounded-3xl border border-flag-red/30 bg-card/70 p-7 text-center backdrop-blur"><p className="text-red-200">{message}</p><button onClick={onRetry} className="mt-5 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/15">Tentar novamente</button></div> }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-black/10 p-4"><p className="font-display text-xl font-black">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div> }
function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <section><div className="mb-5"><h2 className="font-display text-3xl font-black">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{children}</section> }
function Info({ icon: Icon, title, children }: { icon: typeof MapPin; title: string; children: ReactNode }) { return <div className="rounded-3xl border border-white/10 bg-card/65 p-6"><div className="mb-5 flex items-center gap-3"><Icon className="h-6 w-6 text-primary" /><h2 className="font-display text-2xl font-black">{title}</h2></div>{children}</div> }
