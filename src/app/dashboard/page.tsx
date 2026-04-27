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

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  intake:    { bg: '#f59e0b15', text: '#fbbf24', border: '#f59e0b30' },
  active:    { bg: '#22c55e15', text: '#4ade80', border: '#22c55e30' },
  paused:    { bg: '#6366f115', text: '#818cf8', border: '#6366f130' },
  concluded: { bg: '#ffffff10', text: '#ffffff50', border: '#ffffff20' },
  abandoned: { bg: '#ef444415', text: '#f87171', border: '#ef444430' },
}

function getProgress(trial: Trial): number {
  if (!trial.started_at || !trial.protocol?.versions) return 0
  const started = new Date(trial.started_at)
  const daysSinceStart = Math.floor((Date.now() - started.getTime()) / 86400000)
  const activeVersion = trial.protocol.versions?.find(
    (v: any) => v.version === trial.protocol.active_version
  )
  if (!activeVersion?.phases) return 0
  const totalDays = activeVersion.phases.reduce((sum: number, p: any) => sum + p.duration_days, 0)
  return Math.min((daysSinceStart / totalDays) * 100, 100)
}

function getCurrentPhase(trial: Trial): string | null {
  if (!trial.started_at || !trial.protocol?.versions) return null
  const started = new Date(trial.started_at)
  const daysSinceStart = Math.floor((Date.now() - started.getTime()) / 86400000)
  const activeVersion = trial.protocol.versions?.find(
    (v: any) => v.version === trial.protocol.active_version
  )
  if (!activeVersion?.phases) return null
  let dayCount = 0
  for (const phase of activeVersion.phases) {
    if (daysSinceStart < dayCount + phase.duration_days) return phase.name
    dayCount += phase.duration_days
  }
  return null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
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
      .from('trials')
      .select('*')
      .order('created_at', { ascending: false })

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
      <div style={styles.loadingScreen}>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={styles.root}>

      {/* Ambient orbs */}
      <div style={styles.orbTopRight} />
      <div style={styles.orbBottomLeft} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={styles.logo}>N=1</h1>
            <p style={styles.logoSub}>Personal Clinical Trials</p>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.userEmail}>{user?.email}</span>
            <button onClick={handleSignOut} style={styles.signOutBtn}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>

        {/* Top bar */}
        <div style={styles.topBar}>
          <div>
            <h2 style={styles.pageTitle}>My experiments</h2>
            <p style={styles.pageSubtitle}>
              {trials.length === 0
                ? 'No experiments yet'
                : `${trials.length} experiment${trials.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <button
            onClick={() => router.push('/intake')}
            style={styles.newBtn}
          >
            + New experiment
          </button>
        </div>

        {/* Empty state */}
        {trials.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>⬡</div>
            <h3 style={styles.emptyTitle}>No experiments yet</h3>
            <p style={styles.emptySubtitle}>
              Start by describing a health hypothesis. The agent will design a rigorous protocol to test it.
            </p>
            <button
              onClick={() => router.push('/intake')}
              style={styles.emptyBtn}
            >
              Start your first experiment
            </button>
          </div>
        )}

        {/* Active trials */}
        {activeTrials.length > 0 && (
          <section style={styles.section}>
            <p style={styles.sectionLabel}>Active</p>
            <div style={styles.trialList}>
              {activeTrials.map(trial => (
                <TrialCard
                  key={trial.id}
                  trial={trial}
                  onClick={() => router.push(`/trial/${trial.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Other trials */}
        {otherTrials.length > 0 && (
          <section style={styles.section}>
            <p style={styles.sectionLabel}>
              {activeTrials.length > 0 ? 'Other' : 'All experiments'}
            </p>
            <div style={styles.trialList}>
              {otherTrials.map(trial => (
                <TrialCard
                  key={trial.id}
                  trial={trial}
                  onClick={() => router.push(`/trial/${trial.id}`)}
                />
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
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function TrialCard({ trial, onClick }: { trial: Trial; onClick: () => void }) {
  const progress = getProgress(trial)
  const currentPhase = getCurrentPhase(trial)
  const accentColor = DOMAIN_COLORS[trial.domain || 'other'] || DOMAIN_COLORS.other
  const statusStyle = STATUS_COLORS[trial.status] || STATUS_COLORS.intake
  const activeVersion = trial.protocol?.versions?.find(
    (v: any) => v.version === trial.protocol?.active_version
  )

  return (
    <div onClick={onClick} style={styles.card}>
      <div style={{ ...styles.cardAccent, background: accentColor }} />

      <div style={styles.cardTop}>
        <div style={styles.cardMeta}>
          {trial.domain && (
            <span style={{ ...styles.domainPill, color: accentColor, background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}>
              {trial.domain}
            </span>
          )}
          <span style={{ ...styles.statusPill, background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}>
            {trial.status}
          </span>
        </div>
        {currentPhase && (
          <span style={styles.phaseChip}>{currentPhase}</span>
        )}
      </div>

      <h3 style={styles.cardTitle}>
        {trial.hypothesis_refined || trial.hypothesis_raw}
      </h3>

      {activeVersion?.intervention_definition && (
        <p style={styles.cardSub}>
          {activeVersion.intervention_definition}
        </p>
      )}

      {trial.status === 'active' && (
        <div style={styles.progressSection}>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progress}%`, background: accentColor }} />
          </div>
          <span style={styles.progressPct}>{Math.round(progress)}%</span>
        </div>
      )}

      <div style={styles.cardFooter}>
        <span style={styles.cardDate}>
          Started {trial.started_at ? new Date(trial.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'not yet'}
        </span>
        <span style={{ ...styles.cardArrow, color: accentColor }}>→</span>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: '#080b12',
    fontFamily: "'DM Sans', sans-serif",
    color: '#ffffff',
    position: 'relative',
    overflowX: 'hidden',
  },
  orbTopRight: {
    position: 'fixed',
    width: '500px',
    height: '500px',
    top: '-150px',
    right: '-150px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #1d4ed830, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  orbBottomLeft: {
    position: 'fixed',
    width: '400px',
    height: '400px',
    bottom: '-100px',
    left: '-100px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #7c3aed20, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  loadingScreen: {
    minHeight: '100vh',
    background: '#080b12',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff30',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    position: 'relative',
    zIndex: 10,
    borderBottom: '1px solid #ffffff08',
    background: 'rgba(8,11,18,0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '20px 24px',
  },
  headerInner: {
    maxWidth: '760px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    color: '#ffffffee',
    fontFamily: "'DM Mono', monospace",
  },
  logoSub: {
    fontSize: '11px',
    color: '#ffffff30',
    letterSpacing: '0.05em',
    marginTop: '2px',
    textTransform: 'uppercase',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userEmail: {
    fontSize: '13px',
    color: '#ffffff40',
  },
  signOutBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '6px 14px',
    fontSize: '13px',
    color: '#ffffff60',
    cursor: 'pointer',
  },
  main: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '760px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  topBar: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '32px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 400,
    color: '#ffffffee',
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#ffffff40',
    marginTop: '4px',
  },
  newBtn: {
    background: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#080b12',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    flexShrink: 0,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    textAlign: 'center',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '24px',
  },
  emptyIcon: {
    fontSize: '40px',
    marginBottom: '20px',
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: 400,
    color: '#ffffff80',
    marginBottom: '10px',
  },
  emptySubtitle: {
    fontSize: '14px',
    color: '#ffffff40',
    lineHeight: 1.6,
    maxWidth: '340px',
    marginBottom: '28px',
  },
  emptyBtn: {
    background: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#080b12',
    cursor: 'pointer',
  },
  section: {
    marginBottom: '32px',
  },
  sectionLabel: {
    fontSize: '11px',
    color: '#ffffff30',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '12px',
  },
  trialList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    position: 'relative',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '22px 24px',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
    animation: 'fadeUp 0.3s ease forwards',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    opacity: 0.5,
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  domainPill: {
    fontSize: '11px',
    fontWeight: 500,
    padding: '3px 10px',
    borderRadius: '20px',
    textTransform: 'capitalize',
    letterSpacing: '0.02em',
  },
  statusPill: {
    fontSize: '11px',
    fontWeight: 500,
    padding: '3px 10px',
    borderRadius: '20px',
    textTransform: 'capitalize',
  },
  phaseChip: {
    fontSize: '11px',
    color: '#ffffff40',
    textTransform: 'capitalize',
    fontFamily: "'DM Mono', monospace",
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 400,
    color: '#ffffffcc',
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
    marginBottom: '6px',
  },
  cardSub: {
    fontSize: '13px',
    color: '#ffffff40',
    lineHeight: 1.5,
    marginBottom: '14px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  progressSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
  },
  progressTrack: {
    flex: 1,
    height: '3px',
    background: '#ffffff10',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.6s ease',
  },
  progressPct: {
    fontSize: '11px',
    color: '#ffffff30',
    fontFamily: "'DM Mono', monospace",
    width: '30px',
    textAlign: 'right',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDate: {
    fontSize: '12px',
    color: '#ffffff30',
  },
  cardArrow: {
    fontSize: '16px',
    opacity: 0.6,
  },
}