// 

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type Trial = {
  id: string
  status: string
  hypothesis_raw: string
  hypothesis_refined: string | null
  domain: string | null
  created_at: string
  started_at: string | null
  expected_end_date: string | null
  protocol: any
  confounders: string[]
}

const DOMAIN_COLORS: Record<string, string> = {
  acne:      '#fb923c',
  sleep:     '#818cf8',
  digestion: '#4ade80',
  mood:      '#c084fc',
  energy:    '#fbbf24',
  other:     '#2dd4bf',
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  intake:    { bg: '#f59e0b12', text: '#fcd34d', border: '#f59e0b25' },
  active:    { bg: '#22c55e12', text: '#86efac', border: '#22c55e25' },
  paused:    { bg: '#6366f112', text: '#a5b4fc', border: '#6366f125' },
  concluded: { bg: '#ffffff08', text: '#ffffff50', border: '#ffffff15' },
  abandoned: { bg: '#ef444412', text: '#fca5a5', border: '#ef444425' },
}

function getProgress(trial: Trial): number {
  if (!trial.started_at || !trial.protocol?.versions) return 0
  const started = new Date(trial.started_at)
  const daysSinceStart = Math.floor((Date.now() - started.getTime()) / 86400000)
  const activeVersion = trial.protocol.versions?.find((v: any) => v.version === trial.protocol.active_version)
  if (!activeVersion?.phases) return 0
  const totalDays = activeVersion.phases.reduce((sum: number, p: any) => sum + p.duration_days, 0)
  return Math.min((daysSinceStart / totalDays) * 100, 100)
}

function getCurrentPhase(trial: Trial): string | null {
  if (!trial.started_at || !trial.protocol?.versions) return null
  const started = new Date(trial.started_at)
  const daysSinceStart = Math.floor((Date.now() - started.getTime()) / 86400000)
  const activeVersion = trial.protocol.versions?.find((v: any) => v.version === trial.protocol.active_version)
  if (!activeVersion?.phases) return null
  let dayCount = 0
  for (const phase of activeVersion.phases) {
    if (daysSinceStart < dayCount + phase.duration_days) return phase.name
    dayCount += phase.duration_days
  }
  return null
}

export default function DashboardPage() {
  const router = useRouter()
  const [trials, setTrials] = useState<Trial[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    const { data } = await supabase
      .from('trials').select('*').order('created_at', { ascending: false })
    setTrials((data as Trial[]) || [])
    setLoading(false)
  }

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const activeTrials = trials.filter(t => t.status === 'active')
  const otherTrials = trials.filter(t => t.status !== 'active')

  if (loading) {
    return (
      <div style={s.loadingScreen}>
        <p style={s.loadingText}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={s.root}>
      <div style={s.orbTR} />
      <div style={s.orbBL} />

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div>
            <h1 style={s.logo}>N=1</h1>
            <p style={s.logoSub}>Personal Clinical Trials</p>
          </div>
          <div style={s.headerRight}>
            <span style={s.userEmail}>{user?.email}</span>
            <button onClick={handleSignOut} style={s.signOutBtn}>Sign out</button>
          </div>
        </div>
      </header>

      <main style={s.main}>

        {/* Top bar */}
        <div style={s.topBar}>
          <div>
            <h2 style={s.pageTitle}>My experiments</h2>
            <p style={s.pageSubtitle}>
              {trials.length === 0 ? 'No experiments yet' : `${trials.length} experiment${trials.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <button onClick={() => router.push('/intake')} style={s.newBtn}>
            + New experiment
          </button>
        </div>

        {/* Empty state */}
        {trials.length === 0 && (
          <div style={s.emptyState}>
            <p style={s.emptyIcon}>◈</p>
            <h3 style={s.emptyTitle}>No experiments yet</h3>
            <p style={s.emptySubtitle}>
              Start by describing a health hunch. We'll help you turn it into something you can actually test.
            </p>
            <button onClick={() => router.push('/intake')} style={s.emptyBtn}>
              Start your first experiment
            </button>
          </div>
        )}

        {/* Active */}
        {activeTrials.length > 0 && (
          <section style={s.section}>
            <p style={s.sectionLabel}>Active</p>
            <div style={s.trialList}>
              {activeTrials.map(trial => (
                <TrialCard key={trial.id} trial={trial} onClick={() => router.push(`/trial/${trial.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* Other */}
        {otherTrials.length > 0 && (
          <section style={s.section}>
            <p style={s.sectionLabel}>{activeTrials.length > 0 ? 'Other' : 'All experiments'}</p>
            <div style={s.trialList}>
              {otherTrials.map(trial => (
                <TrialCard key={trial.id} trial={trial} onClick={() => router.push(`/trial/${trial.id}`)} />
              ))}
            </div>
          </section>
        )}

      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function TrialCard({ trial, onClick }: { trial: Trial; onClick: () => void }) {
  const progress = getProgress(trial)
  const currentPhase = getCurrentPhase(trial)
  const accent = DOMAIN_COLORS[trial.domain || 'other'] || DOMAIN_COLORS.other
  const statusStyle = STATUS_STYLES[trial.status] || STATUS_STYLES.intake
  const activeVersion = trial.protocol?.versions?.find((v: any) => v.version === trial.protocol?.active_version)

  return (
    <div onClick={onClick} style={s.card}>
      {/* Top accent line */}
      <div style={{ ...s.cardAccent, background: accent }} />

      {/* Top row */}
      <div style={s.cardTopRow}>
        <div style={s.pills}>
          {trial.domain && (
            <span style={{ ...s.domainPill, color: accent, background: `${accent}15`, border: `1px solid ${accent}28` }}>
              {trial.domain}
            </span>
          )}
          <span style={{ ...s.statusPill, ...statusStyle }}>
            {trial.status}
          </span>
        </div>
        {currentPhase && (
          <span style={s.phaseChip}>{currentPhase}</span>
        )}
      </div>

      {/* Hypothesis */}
      <p style={s.cardHypothesis}>
        {trial.hypothesis_refined || trial.hypothesis_raw}
      </p>

      {/* Intervention */}
      {activeVersion?.intervention_definition && (
        <p style={s.cardIntervention}>
          {activeVersion.intervention_definition}
        </p>
      )}

      {/* Progress bar */}
      {trial.status === 'active' && (
        <div style={s.progressRow}>
          <div style={s.progressTrack}>
            <div style={{ ...s.progressFill, width: `${progress}%`, background: accent }} />
          </div>
          <span style={s.progressPct}>{Math.round(progress)}%</span>
        </div>
      )}

      {/* Footer */}
      <div style={s.cardFooter}>
        <span style={s.cardDate}>
          {trial.started_at
            ? `Started ${new Date(trial.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            : 'Not started'}
        </span>
        <span style={{ ...s.cardArrow, color: accent }}>→</span>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: '#080b12',
    fontFamily: "'DM Sans', sans-serif",
    color: '#ffffff',
    position: 'relative',
    overflowX: 'hidden',
  },
  orbTR: {
    position: 'fixed',
    width: '500px', height: '500px',
    top: '-150px', right: '-150px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #1d4ed820, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  orbBL: {
    position: 'fixed',
    width: '400px', height: '400px',
    bottom: '-100px', left: '-100px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #7c3aed15, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  loadingScreen: {
    minHeight: '100vh',
    background: '#080b12',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff25',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    position: 'relative', zIndex: 10,
    borderBottom: '1px solid #ffffff0a',
    background: 'rgba(8,11,18,0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '18px 24px',
  },
  headerInner: {
    maxWidth: '760px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: '18px',
    fontWeight: 500,
    color: '#ffffff',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '-0.01em',
  },
  logoSub: {
    fontSize: '11px',
    color: '#ffffff28',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginTop: '2px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userEmail: {
    fontSize: '12px',
    color: '#ffffff35',
  },
  signOutBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '5px 14px',
    fontSize: '12px',
    color: '#ffffff50',
    cursor: 'pointer',
  },
  main: {
    position: 'relative', zIndex: 10,
    maxWidth: '760px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  topBar: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '28px',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: 400,
    color: '#ffffffee',
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#ffffff35',
    marginTop: '3px',
  },
  newBtn: {
    background: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '9px 18px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#080b12',
    cursor: 'pointer',
    flexShrink: 0,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '72px 24px',
    textAlign: 'center',
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '20px',
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '16px',
    opacity: 0.2,
  },
  emptyTitle: {
    fontSize: '17px',
    fontWeight: 400,
    color: '#ffffff70',
    marginBottom: '8px',
  },
  emptySubtitle: {
    fontSize: '13px',
    color: '#ffffff35',
    lineHeight: 1.6,
    maxWidth: '320px',
    marginBottom: '24px',
  },
  emptyBtn: {
    background: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 22px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#080b12',
    cursor: 'pointer',
  },
  section: { marginBottom: '28px' },
  sectionLabel: {
    fontSize: '10px',
    color: '#ffffff28',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '10px',
  },
  trialList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  card: {
    position: 'relative',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '16px',
    padding: '18px 20px',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'background 0.2s, border-color 0.2s',
    animation: 'fadeUp 0.3s ease forwards',
  },
  cardAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '2px',
    opacity: 0.7,
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  pills: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  domainPill: {
    fontSize: '11px',
    fontWeight: 500,
    padding: '2px 9px',
    borderRadius: '20px',
    textTransform: 'capitalize',
  },
  statusPill: {
    fontSize: '11px',
    fontWeight: 400,
    padding: '2px 9px',
    borderRadius: '20px',
    textTransform: 'capitalize',
  },
  phaseChip: {
    fontSize: '11px',
    color: '#ffffff35',
    fontFamily: "'DM Mono', monospace",
    textTransform: 'capitalize',
  },
  cardHypothesis: {
    fontSize: '14px',
    fontWeight: 400,
    color: '#ffffffcc',
    lineHeight: 1.45,
    letterSpacing: '-0.01em',
    marginBottom: '5px',
  },
  cardIntervention: {
    fontSize: '12px',
    color: '#ffffff45',
    lineHeight: 1.5,
    marginBottom: '12px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  progressTrack: {
    flex: 1,
    height: '2px',
    background: '#ffffff0f',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.6s ease',
  },
  progressPct: {
    fontSize: '10px',
    color: '#ffffff28',
    fontFamily: "'DM Mono', monospace",
    width: '28px',
    textAlign: 'right',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDate: {
    fontSize: '11px',
    color: '#ffffff28',
  },
  cardArrow: {
    fontSize: '14px',
    opacity: 0.5,
  },
}