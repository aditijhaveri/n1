'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import {
  simulateWearableData,
  getPrimaryMetricsForDomain,
  METRIC_LABELS,
  METRIC_UNITS,
  type WearableData
} from '@/lib/wearable-simulator'

type Trial = {
  id: string
  status: string
  hypothesis_refined: string | null
  hypothesis_raw: string
  domain: string | null
  confounders: string[]
  protocol: any
  started_at: string | null
  expected_end_date: string | null
  independent_variable: string | null
  dependent_variable: string | null
}

type DailyLog = {
  date: string
  adherence: boolean
  primary_outcome: number | null
  confounders: Record<string, any>
  notes: string | null
}

const DOMAIN_COLORS: Record<string, { from: string; to: string; accent: string }> = {
  acne:      { from: '#c2410c', to: '#7c2d12', accent: '#fb923c' },
  sleep:     { from: '#1d4ed8', to: '#1e1b4b', accent: '#818cf8' },
  digestion: { from: '#15803d', to: '#14532d', accent: '#4ade80' },
  mood:      { from: '#7c3aed', to: '#2e1065', accent: '#c084fc' },
  energy:    { from: '#b45309', to: '#451a03', accent: '#fbbf24' },
  other:     { from: '#0f766e', to: '#042f2e', accent: '#2dd4bf' },
}

// =============================================================================
// AGENT FEED COMPONENT
// =============================================================================

function AgentFeed({ trialId, accentColor }: { trialId: string; accentColor: string }) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  useEffect(() => { loadEvents() }, [trialId])

  async function loadEvents() {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase
      .from('trial_events')
      .select('*')
      .eq('trial_id', trialId)
      .eq('visible', true)
      .order('timestamp', { ascending: false })
      .limit(20)
    setEvents(data || [])
    setLoading(false)
  }

  async function runMonitor() {
    setRunning(true)
    try {
      const res = await fetch('/api/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      console.log('Monitor result:', data)
      await loadEvents()
    } catch (e) {
      console.error('Monitor error:', e)
    }
    setRunning(false)
  }

  const EVENT_ICONS: Record<string, string> = {
    request_log:       '📋',
    send_insight:      '💡',
    adherence_warning: '⚠️',
    phase_transition:  '→',
    conclude_trial:    '✓',
    intake_complete:   '✓',
    propose_followup:  '↻',
  }

  return (
    <div style={feedStyles.card}>
      <div style={{ ...feedStyles.cardAccent, background: accentColor }} />
      <div style={feedStyles.cardHeader}>
        <h2 style={feedStyles.cardTitle}>Agent feed</h2>
        <button
          onClick={runMonitor}
          disabled={running}
          style={{
            ...feedStyles.runBtn,
            borderColor: `${accentColor}40`,
            color: accentColor,
            opacity: running ? 0.5 : 1,
          }}
        >
          {running ? 'Running...' : 'Run agent now'}
        </button>
      </div>

      {loading ? (
        <p style={feedStyles.empty}>Loading...</p>
      ) : events.length === 0 ? (
        <p style={feedStyles.empty}>
          No agent activity yet. Click "Run agent now" to see its first observation.
        </p>
      ) : (
        <div style={feedStyles.timeline}>
          {events.map((event, i) => (
            <div key={event.id} style={feedStyles.eventRow}>
              <div style={feedStyles.eventLeft}>
                <div style={{
                  ...feedStyles.eventDot,
                  background: i === 0 ? accentColor : '#ffffff20',
                  boxShadow: i === 0 ? `0 0 8px ${accentColor}60` : 'none',
                }} />
                {i < events.length - 1 && <div style={feedStyles.eventLine} />}
              </div>
              <div style={feedStyles.eventContent}>
                <div style={feedStyles.eventHeader}>
                  <span style={feedStyles.eventIcon}>
                    {EVENT_ICONS[event.type] || '·'}
                  </span>
                  <span style={feedStyles.eventType}>
                    {event.type.replace(/_/g, ' ')}
                  </span>
                  <span style={feedStyles.eventTime}>
                    {new Date(event.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {event.payload?.message && (
                  <p style={feedStyles.eventMessage}>{event.payload.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const feedStyles: Record<string, React.CSSProperties> = {
  card: {
    position: 'relative',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '24px',
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '2px',
    opacity: 0.6,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#ffffffcc',
    letterSpacing: '0.01em',
  },
  runBtn: {
    background: 'transparent',
    border: '1px solid',
    borderRadius: '8px',
    padding: '6px 14px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.2s',
  },
  empty: {
    fontSize: '13px',
    color: '#ffffff30',
    textAlign: 'center',
    padding: '24px 0',
    lineHeight: 1.6,
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
  },
  eventRow: {
    display: 'flex',
    gap: '14px',
    paddingBottom: '20px',
  },
  eventLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '12px',
    flexShrink: 0,
    paddingTop: '3px',
  },
  eventDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'background 0.3s',
  },
  eventLine: {
    width: '1px',
    flex: 1,
    background: '#ffffff10',
    marginTop: '6px',
    minHeight: '16px',
  },
  eventContent: {
    flex: 1,
    paddingBottom: '4px',
  },
  eventHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  eventIcon: {
    fontSize: '13px',
  },
  eventType: {
    fontSize: '12px',
    color: '#ffffff50',
    textTransform: 'capitalize',
    flex: 1,
  },
  eventTime: {
    fontSize: '11px',
    color: '#ffffff25',
    fontFamily: "'DM Mono', monospace",
    whiteSpace: 'nowrap' as const,
  },
  eventMessage: {
    fontSize: '14px',
    color: '#ffffff80',
    lineHeight: 1.6,
  },
}

// =============================================================================
// MAIN TRIAL PAGE
// =============================================================================

export default function TrialPage() {
  const params = useParams()
  const router = useRouter()
  const trialId = params.id as string

  const [trial, setTrial] = useState<Trial | null>(null)
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null)
  const [wearableData, setWearableData] = useState<WearableData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showLogForm, setShowLogForm] = useState(false)

  const [adherence, setAdherence] = useState<boolean | null>(null)
  const [primaryOutcome, setPrimaryOutcome] = useState('')
  const [confounderValues, setConfounderValues] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { loadTrial() }, [trialId])

  async function loadTrial() {
    const supabase = getSupabaseBrowserClient()
    const { data: trialData, error } = await supabase
      .from('trials').select('*').eq('id', trialId).single()

    if (error || !trialData) { router.push('/dashboard'); return }
    setTrial(trialData as Trial)

    const { data: logData } = await supabase
      .from('daily_logs').select('*')
      .eq('trial_id', trialId).eq('date', today).single()

    if (logData) setTodayLog(logData as DailyLog)

    const domain = (trialData.domain || 'other') as any
    setWearableData(simulateWearableData(trialId, today, domain))
    setLoading(false)
  }

  function getCurrentPhase(): { name: string; day: number; totalDays: number; progress: number } | null {
    if (!trial?.started_at || !trial?.protocol?.versions) return null
    const started = new Date(trial.started_at)
    const daysSinceStart = Math.floor((Date.now() - started.getTime()) / 86400000)
    const activeVersion = trial.protocol.versions?.find((v: any) => v.version === trial.protocol.active_version)
    if (!activeVersion?.phases) return null

    let dayCount = 0
    for (const phase of activeVersion.phases) {
      if (daysSinceStart < dayCount + phase.duration_days) {
        const day = daysSinceStart - dayCount + 1
        return { name: phase.name, day, totalDays: phase.duration_days, progress: (day / phase.duration_days) * 100 }
      }
      dayCount += phase.duration_days
    }
    return null
  }

  async function activateTrial() {
    const supabase = getSupabaseBrowserClient()
    await supabase.from('trials').update({
      status: 'active',
      started_at: new Date().toISOString(),
    }).eq('id', trialId)
    loadTrial()
  }

  async function submitLog() {
    if (adherence === null || !primaryOutcome) return
    setSaving(true)
    const supabase = getSupabaseBrowserClient()
    const currentPhase = getCurrentPhase()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('daily_logs').insert({
      trial_id: trialId,
      user_id: user!.id,
      date: today,
      phase: currentPhase?.name || 'baseline',
      protocol_version: trial?.protocol?.active_version || 1,
      adherence,
      primary_outcome: parseFloat(primaryOutcome),
      confounders: confounderValues,
      notes: notes || null,
    })

    setShowLogForm(false)
    setSaving(false)
    loadTrial()
  }

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingOrb} />
        <p style={styles.loadingText}>Loading trial...</p>
      </div>
    )
  }

  if (!trial) return null

  const domain = trial.domain || 'other'
  const colors = DOMAIN_COLORS[domain] || DOMAIN_COLORS.other
  const currentPhase = getCurrentPhase()
  const primaryMetrics = wearableData ? getPrimaryMetricsForDomain(domain as any) : []
  const activeProtocol = trial.protocol?.versions?.find(
    (v: any) => v.version === trial.protocol.active_version
  )

  return (
    <div style={{ ...styles.root, '--accent': colors.accent, '--grad-from': colors.from, '--grad-to': colors.to } as any}>

      {/* Ambient background orbs */}
      <div style={{ ...styles.orb, ...styles.orbTop, background: `radial-gradient(circle, ${colors.from}60, transparent 70%)` }} />
      <div style={{ ...styles.orb, ...styles.orbBottom, background: `radial-gradient(circle, ${colors.to}50, transparent 70%)` }} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <button onClick={() => router.push('/dashboard')} style={styles.backBtn}>
            ← Dashboard
          </button>
          <div style={styles.headerMeta}>
            <span style={{
              ...styles.badge,
              background: trial.status === 'active' ? '#22c55e22' : '#f59e0b22',
              color: trial.status === 'active' ? '#4ade80' : '#fbbf24',
              border: `1px solid ${trial.status === 'active' ? '#22c55e44' : '#f59e0b44'}`,
            }}>
              {trial.status}
            </span>
            {trial.domain && <span style={styles.domainBadge}>{trial.domain}</span>}
          </div>
        </div>
        <div style={styles.headerInner}>
          <h1 style={styles.title}>
            {trial.hypothesis_refined || trial.hypothesis_raw}
          </h1>
        </div>
        {currentPhase && (
          <div style={styles.headerInner}>
            <div style={styles.phaseBar}>
              <div style={styles.phaseBarTrack}>
                <div style={{ ...styles.phaseBarFill, width: `${currentPhase.progress}%`, background: colors.accent }} />
              </div>
              <span style={styles.phaseLabel}>
                {currentPhase.name} · day {currentPhase.day} of {currentPhase.totalDays}
              </span>
            </div>
          </div>
        )}
      </header>

      <main style={styles.main}>

        {/* Activate banner */}
        {trial.status === 'intake' && (
          <div style={styles.card}>
            <div style={{ ...styles.cardAccentBar, background: colors.accent }} />
            <h2 style={styles.cardTitle}>Ready to begin</h2>
            <p style={styles.cardSubtitle}>
              Your protocol is designed. Starting the trial activates daily logging and begins the baseline phase.
            </p>
            <button
              onClick={activateTrial}
              style={{ ...styles.primaryBtn, background: colors.accent, color: '#0a0a0a' }}
            >
              Start trial
            </button>
          </div>
        )}

        {/* Daily log */}
        {trial.status === 'active' && (
          <div style={styles.card}>
            <div style={{ ...styles.cardAccentBar, background: colors.accent }} />
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Today's log</h2>
              <span style={styles.dateChip}>{today}</span>
            </div>

            {todayLog ? (
              <div style={styles.loggedState}>
                <div style={styles.loggedRow}>
                  <span style={{ ...styles.dot, background: todayLog.adherence ? '#4ade80' : '#f87171' }} />
                  <span style={styles.loggedText}>
                    {todayLog.adherence ? 'Protocol followed' : 'Protocol not followed'}
                  </span>
                </div>
                {todayLog.primary_outcome !== null && (
                  <div style={styles.outcomeDisplay}>
                    <span style={styles.outcomeLabel}>{trial.dependent_variable}</span>
                    <span style={{ ...styles.outcomeValue, color: colors.accent }}>
                      {todayLog.primary_outcome}
                      <span style={styles.outcomeDenom}>/10</span>
                    </span>
                  </div>
                )}
                <p style={styles.loggedConfirm}>✓ Logged for today</p>
              </div>
            ) : !showLogForm ? (
              <button
                onClick={() => setShowLogForm(true)}
                style={{ ...styles.primaryBtn, background: colors.accent, color: '#0a0a0a' }}
              >
                Log today's data
              </button>
            ) : (
              <div style={styles.logForm}>

                {/* Adherence */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Did you follow the protocol today?</label>
                  <div style={styles.toggleRow}>
                    {[true, false].map(val => (
                      <button
                        key={String(val)}
                        onClick={() => setAdherence(val)}
                        style={{
                          ...styles.toggleBtn,
                          ...(adherence === val ? {
                            background: colors.accent,
                            color: '#0a0a0a',
                            borderColor: colors.accent,
                          } : {}),
                        }}
                      >
                        {val ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary outcome */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    {trial.dependent_variable || 'Primary outcome'}
                    <span style={styles.formHint}> (1 = worst, 10 = best)</span>
                  </label>
                  <div style={styles.scoreRow}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button
                        key={n}
                        onClick={() => setPrimaryOutcome(String(n))}
                        style={{
                          ...styles.scoreBtn,
                          ...(primaryOutcome === String(n) ? {
                            background: colors.accent,
                            color: '#0a0a0a',
                            borderColor: colors.accent,
                          } : {}),
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confounders */}
                {trial.confounders.length > 0 && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Confounders</label>
                    <div style={styles.confounderGrid}>
                      {trial.confounders.map(c => (
                        <div key={c} style={styles.confounderRow}>
                          <span style={styles.confounderLabel}>{c.replace(/_/g, ' ')}</span>
                          <input
                            type="text"
                            placeholder="—"
                            value={confounderValues[c] || ''}
                            onChange={e => setConfounderValues(p => ({ ...p, [c]: e.target.value }))}
                            style={styles.confounderInput}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    Notes <span style={styles.formHint}>(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Anything worth noting..."
                    rows={2}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.formActions}>
                  <button onClick={() => setShowLogForm(false)} style={styles.ghostBtn}>
                    Cancel
                  </button>
                  <button
                    onClick={submitLog}
                    disabled={adherence === null || !primaryOutcome || saving}
                    style={{
                      ...styles.primaryBtn,
                      background: colors.accent,
                      color: '#0a0a0a',
                      opacity: (adherence === null || !primaryOutcome) ? 0.4 : 1,
                    }}
                  >
                    {saving ? 'Saving...' : 'Save log'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wearable data */}
        {wearableData && (
          <div style={styles.card}>
            <div style={{ ...styles.cardAccentBar, background: colors.accent }} />
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Biometrics</h2>
              <span style={styles.simulatedChip}>Simulated</span>
            </div>
            <div style={styles.metricsGrid}>
              {primaryMetrics.map(metric => {
                const value = wearableData[metric]
                if (value === null) return null
                return (
                  <div key={metric} style={styles.metricCard}>
                    <p style={styles.metricLabel}>{METRIC_LABELS[metric]}</p>
                    <p style={styles.metricValue}>
                      {value}
                      <span style={styles.metricUnit}> {METRIC_UNITS[metric]}</span>
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Protocol */}
        {activeProtocol && (
          <div style={styles.card}>
            <div style={{ ...styles.cardAccentBar, background: colors.accent }} />
            <h2 style={styles.cardTitle}>Protocol</h2>
            <div style={styles.protocolSection}>
              <p style={styles.protocolLabel}>Intervention</p>
              <p style={styles.protocolText}>{activeProtocol.intervention_definition}</p>
            </div>
            <div style={styles.protocolSection}>
              <p style={styles.protocolLabel}>Success criteria</p>
              <p style={styles.protocolText}>{activeProtocol.success_criteria}</p>
            </div>
            <div style={styles.protocolSection}>
              <p style={styles.protocolLabel}>Phases</p>
              <div style={styles.phaseList}>
                {activeProtocol.phases?.map((phase: any, i: number) => (
                  <div key={i} style={styles.phaseRow}>
                    <span style={{
                      ...styles.phaseDot,
                      background: currentPhase?.name === phase.name ? colors.accent : '#ffffff20',
                    }} />
                    <span style={{
                      ...styles.phaseName,
                      color: currentPhase?.name === phase.name ? colors.accent : '#ffffff80',
                    }}>
                      {phase.name}
                    </span>
                    <span style={styles.phaseDays}>{phase.duration_days} days</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Agent feed */}
        <AgentFeed trialId={trialId} accentColor={colors.accent} />

      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder, textarea::placeholder { color: #ffffff30; }
        input:focus, textarea:focus { outline: none; border-color: var(--accent) !important; }
        button { cursor: pointer; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ffffff20; border-radius: 2px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .card-animate { animation: fadeUp 0.4s ease forwards; }
      `}</style>
    </div>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: '#080b12',
    fontFamily: "'DM Sans', sans-serif",
    color: '#ffffff',
    position: 'relative',
    overflowX: 'hidden',
  },
  orb: {
    position: 'fixed',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 0,
  },
  orbTop: {
    width: '600px',
    height: '600px',
    top: '-200px',
    right: '-100px',
  },
  orbBottom: {
    width: '500px',
    height: '500px',
    bottom: '-150px',
    left: '-100px',
  },
  loadingScreen: {
    minHeight: '100vh',
    background: '#080b12',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  loadingOrb: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid #ffffff10',
    borderTop: '2px solid #ffffff60',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#ffffff40',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    position: 'relative',
    zIndex: 10,
    padding: '24px 24px 20px',
    borderBottom: '1px solid #ffffff08',
    background: 'rgba(8,11,18,0.8)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  headerInner: {
    maxWidth: '680px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#ffffff40',
    fontSize: '13px',
    padding: '0',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginLeft: 'auto',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 500,
    padding: '3px 10px',
    borderRadius: '20px',
    textTransform: 'capitalize',
    letterSpacing: '0.02em',
  },
  domainBadge: {
    fontSize: '11px',
    color: '#ffffff40',
    textTransform: 'capitalize',
    letterSpacing: '0.05em',
  },
  title: {
    fontSize: '18px',
    fontWeight: 400,
    color: '#ffffffdd',
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  phaseBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  phaseBarTrack: {
    flex: 1,
    height: '3px',
    background: '#ffffff10',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  phaseBarFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.6s ease',
  },
  phaseLabel: {
    fontSize: '12px',
    color: '#ffffff50',
    whiteSpace: 'nowrap' as const,
    textTransform: 'capitalize',
    fontFamily: "'DM Mono', monospace",
  },
  main: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '680px',
    margin: '0 auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    position: 'relative',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '24px',
    overflow: 'hidden',
  },
  cardAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    opacity: 0.6,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#ffffffcc',
    letterSpacing: '0.01em',
    marginBottom: '12px',
  },
  cardSubtitle: {
    fontSize: '13px',
    color: '#ffffff60',
    lineHeight: 1.6,
    marginBottom: '16px',
  },
  dateChip: {
    fontSize: '12px',
    color: '#ffffff40',
    fontFamily: "'DM Mono', monospace",
  },
  simulatedChip: {
    fontSize: '10px',
    color: '#ffffff30',
    border: '1px solid #ffffff15',
    borderRadius: '20px',
    padding: '2px 8px',
    letterSpacing: '0.05em',
  },
  primaryBtn: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.1s',
    letterSpacing: '0.01em',
  },
  ghostBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '14px',
    color: '#ffffff80',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  loggedState: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  loggedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  loggedText: {
    fontSize: '14px',
    color: '#ffffff80',
  },
  outcomeDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
  },
  outcomeLabel: {
    fontSize: '13px',
    color: '#ffffff50',
    textTransform: 'capitalize',
  },
  outcomeValue: {
    fontSize: '28px',
    fontWeight: 300,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '-0.02em',
  },
  outcomeDenom: {
    fontSize: '16px',
    color: '#ffffff30',
  },
  loggedConfirm: {
    fontSize: '12px',
    color: '#4ade8080',
    letterSpacing: '0.02em',
  },
  logForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  formLabel: {
    fontSize: '13px',
    color: '#ffffff70',
    fontWeight: 500,
  },
  formHint: {
    fontWeight: 400,
    color: '#ffffff30',
    fontSize: '12px',
  },
  toggleRow: {
    display: 'flex',
    gap: '8px',
  },
  toggleBtn: {
    flex: 1,
    padding: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#ffffff70',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  scoreRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  scoreBtn: {
    width: '38px',
    height: '38px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#ffffff70',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: "'DM Mono', monospace",
  },
  confounderGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  confounderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  confounderLabel: {
    fontSize: '13px',
    color: '#ffffff50',
    width: '140px',
    flexShrink: 0,
    textTransform: 'capitalize',
  },
  confounderInput: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#ffffff',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s',
  },
  textarea: {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#ffffff',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    resize: 'none',
    lineHeight: 1.6,
    transition: 'border-color 0.2s',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  metricCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '14px',
    padding: '14px 16px',
  },
  metricLabel: {
    fontSize: '11px',
    color: '#ffffff40',
    marginBottom: '6px',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: '22px',
    fontWeight: 300,
    color: '#ffffffdd',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '-0.02em',
  },
  metricUnit: {
    fontSize: '12px',
    color: '#ffffff40',
    fontWeight: 400,
    fontFamily: "'DM Sans', sans-serif",
  },
  protocolSection: {
    marginBottom: '16px',
  },
  protocolLabel: {
    fontSize: '11px',
    color: '#ffffff30',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '6px',
  },
  protocolText: {
    fontSize: '14px',
    color: '#ffffff80',
    lineHeight: 1.6,
  },
  phaseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  phaseRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  phaseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'background 0.3s',
  },
  phaseName: {
    fontSize: '13px',
    textTransform: 'capitalize',
    flex: 1,
    transition: 'color 0.3s',
  },
  phaseDays: {
    fontSize: '12px',
    color: '#ffffff30',
    fontFamily: "'DM Mono', monospace",
  },
}