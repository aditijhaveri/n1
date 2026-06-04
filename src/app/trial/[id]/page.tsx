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

// =============================================================================
// CONFOUNDER INPUT SYSTEM
// =============================================================================

type ConfounderConfig = {
  type: 'tap_scale' | 'stepper' | 'toggle' | 'dropdown' | 'number'
  label: string
  options?: string[]
  min?: number
  max?: number
  step?: number
  unit?: string
  scaleLabels?: [string, string]
}

const CONFOUNDER_CONFIGS: Record<string, ConfounderConfig> = {
  stress:          { type: 'tap_scale', label: 'Stress level', scaleLabels: ['Low', 'High'], min: 1, max: 5 },
  sleep_hours:     { type: 'stepper', label: 'Sleep', unit: 'hrs', min: 3, max: 13, step: 0.5 },
  hormonal_cycle:  { type: 'dropdown', label: 'Cycle phase', options: ['N/A', 'Follicular', 'Ovulatory', 'Luteal', 'Menstrual'] },
  dairy:           { type: 'toggle', label: 'Had dairy' },
  alcohol:         { type: 'toggle', label: 'Had alcohol' },
  caffeine_timing: { type: 'dropdown', label: 'Caffeine timing', options: ['None', 'Before noon', 'After noon', 'After 3pm'] },
  screen_time:     { type: 'tap_scale', label: 'Screen time', scaleLabels: ['Low', 'High'], min: 1, max: 5 },
  water_ml:        { type: 'number', label: 'Water intake', unit: 'ml', min: 0, max: 5000 },
  fiber_g:         { type: 'number', label: 'Fiber', unit: 'g', min: 0, max: 100 },
  eating_speed:    { type: 'dropdown', label: 'Eating speed', options: ['Slow', 'Normal', 'Fast'] },
  food_variety:    { type: 'tap_scale', label: 'Food variety', scaleLabels: ['Low', 'High'], min: 1, max: 5 },
  exercise:        { type: 'dropdown', label: 'Exercise', options: ['None', 'Light', 'Moderate', 'Intense'] },
  exercise_timing: { type: 'dropdown', label: 'Exercise timing', options: ['None', 'Morning', 'Afternoon', 'Evening'] },
  social_contact:  { type: 'tap_scale', label: 'Social contact', scaleLabels: ['None', 'High'], min: 1, max: 5 },
  hydration:       { type: 'tap_scale', label: 'Hydration', scaleLabels: ['Low', 'High'], min: 1, max: 5 },
  meal_timing:     { type: 'dropdown', label: 'Meal timing', options: ['Regular', 'Irregular', 'Late meals'] },
}

function getConfig(key: string): ConfounderConfig {
  if (CONFOUNDER_CONFIGS[key]) return CONFOUNDER_CONFIGS[key]
  for (const [k, v] of Object.entries(CONFOUNDER_CONFIGS)) {
    if (key.includes(k) || k.includes(key)) return v
  }
  return { type: 'tap_scale', label: key.replace(/_/g, ' '), scaleLabels: ['Low', 'High'], min: 1, max: 5 }
}

function ConfounderInput({ name, value, onChange, accent }: {
  name: string; value: string; onChange: (val: string) => void; accent: string
}) {
  const config = getConfig(name)

  if (config.type === 'tap_scale') {
    const min = config.min || 1
    const max = config.max || 5
    const points = Array.from({ length: max - min + 1 }, (_, i) => i + min)
    const current = value ? parseInt(value) : null
    return (
      <div style={ci.group}>
        <div style={ci.labelRow}>
          <span style={ci.label}>{config.label}</span>
          {config.scaleLabels && <span style={ci.scaleHint}>{config.scaleLabels[0]} → {config.scaleLabels[1]}</span>}
        </div>
        <div style={ci.tapRow}>
          {points.map(n => (
            <button key={n} type="button" onClick={() => onChange(String(n))} style={{
              ...ci.tapBtn,
              background: current === n ? accent : 'rgba(255,255,255,0.05)',
              color: current === n ? '#0a0a0a' : '#ffffff70',
              borderColor: current === n ? accent : 'rgba(255,255,255,0.1)',
            }}>{n}</button>
          ))}
        </div>
      </div>
    )
  }

  if (config.type === 'toggle') {
    const isYes = value === 'true' || value === 'yes'
    const isNo = value === 'false' || value === 'no'
    return (
      <div style={ci.group}>
        <span style={ci.label}>{config.label}</span>
        <div style={ci.toggleRow}>
          <button type="button" onClick={() => onChange('yes')} style={{
            ...ci.toggleBtn,
            background: isYes ? '#4ade80' : 'rgba(255,255,255,0.05)',
            color: isYes ? '#0a0a0a' : '#ffffff60',
            borderColor: isYes ? '#4ade80' : 'rgba(255,255,255,0.1)',
          }}>Yes</button>
          <button type="button" onClick={() => onChange('no')} style={{
            ...ci.toggleBtn,
            background: isNo ? '#f87171' : 'rgba(255,255,255,0.05)',
            color: isNo ? '#0a0a0a' : '#ffffff60',
            borderColor: isNo ? '#f87171' : 'rgba(255,255,255,0.1)',
          }}>No</button>
        </div>
      </div>
    )
  }

  if (config.type === 'stepper') {
    const num = value ? parseFloat(value) : null
    const min = config.min || 0
    const max = config.max || 24
    const step = config.step || 1
    return (
      <div style={ci.group}>
        <span style={ci.label}>{config.label}</span>
        <div style={ci.stepperRow}>
          <button type="button" onClick={() => onChange(String(Math.max((num ?? min) - step, min)))} style={ci.stepBtn}>−</button>
          <div style={ci.stepDisplay}>
            <span style={{ ...ci.stepValue, color: num ? '#ffffffee' : '#ffffff30' }}>{num ?? '—'}</span>
            {config.unit && <span style={ci.stepUnit}>{config.unit}</span>}
          </div>
          <button type="button" onClick={() => onChange(String(Math.min((num ?? min) + step, max)))} style={ci.stepBtn}>+</button>
        </div>
      </div>
    )
  }

  if (config.type === 'dropdown') {
    return (
      <div style={ci.group}>
        <span style={ci.label}>{config.label}</span>
        <div style={ci.selectWrap}>
          <select value={value || ''} onChange={e => onChange(e.target.value)} style={ci.select}>
            <option value="">Select...</option>
            {config.options?.map(opt => <option key={opt} value={opt.toLowerCase()}>{opt}</option>)}
          </select>
          <span style={ci.selectArrow}>▾</span>
        </div>
      </div>
    )
  }

  if (config.type === 'number') {
    return (
      <div style={ci.group}>
        <span style={ci.label}>{config.label}</span>
        <div style={ci.numberRow}>
          <input type="number" value={value || ''} onChange={e => onChange(e.target.value)}
            min={config.min} max={config.max} placeholder="0" style={ci.numberInput} />
          {config.unit && <span style={ci.numberUnit}>{config.unit}</span>}
        </div>
      </div>
    )
  }

  return null
}

const ci: Record<string, React.CSSProperties> = {
  group: { display: 'flex', flexDirection: 'column', gap: '8px' },
  labelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: '12px', color: '#ffffff70', fontWeight: 500, textTransform: 'capitalize' },
  scaleHint: { fontSize: '10px', color: '#ffffff30', letterSpacing: '0.03em' },
  tapRow: { display: 'flex', gap: '6px' },
  tapBtn: { flex: 1, height: '36px', border: '1px solid', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Mono', monospace" },
  toggleRow: { display: 'flex', gap: '8px' },
  toggleBtn: { flex: 1, height: '36px', border: '1px solid', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' },
  stepperRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  stepBtn: { width: '36px', height: '36px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff80', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
  stepDisplay: { flex: 1, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' },
  stepValue: { fontSize: '24px', fontWeight: 300, fontFamily: "'DM Mono', monospace", letterSpacing: '-0.02em' },
  stepUnit: { fontSize: '12px', color: '#ffffff40' },
  selectWrap: { position: 'relative' },
  select: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 32px 9px 12px', color: '#ffffffcc', fontSize: '13px', cursor: 'pointer', appearance: 'none' as any, WebkitAppearance: 'none' as any, fontFamily: "'DM Sans', sans-serif" },
  selectArrow: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ffffff40', fontSize: '12px', pointerEvents: 'none' },
  numberRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  numberInput: { flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#ffffffcc', fontSize: '13px', fontFamily: "'DM Mono', monospace" },
  numberUnit: { fontSize: '13px', color: '#ffffff50', flexShrink: 0 },
}

// =============================================================================
// TYPES
// =============================================================================

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
// AGENT FEED
// =============================================================================

function AgentFeed({ trialId, accentColor }: { trialId: string; accentColor: string }) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [runSuccess, setRunSuccess] = useState(false)

  useEffect(() => { loadEvents() }, [trialId])

  async function loadEvents() {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase
      .from('trial_events').select('*')
      .eq('trial_id', trialId).eq('visible', true)
      .order('timestamp', { ascending: false }).limit(20)
    setEvents(data || [])
    setLoading(false)
  }

  async function runMonitor() {
    setRunning(true)
    setRunSuccess(false)
    try {
      await fetch('/api/monitor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      await new Promise(r => setTimeout(r, 1000))
      await loadEvents()
      setRunSuccess(true)
      setTimeout(() => setRunSuccess(false), 3000)
    } catch (e) { console.error('Monitor error:', e) }
    setRunning(false)
  }

  const EVENT_ICONS: Record<string, string> = {
    request_log: '📋', send_insight: '💡', adherence_warning: '⚠️',
    phase_transition: '→', conclude_trial: '✓', intake_complete: '✓', propose_followup: '↻',
  }

  return (
    <div style={styles.card}>
      <div style={{ ...styles.cardAccentBar, background: accentColor }} />
      <div style={styles.cardHeader}>
        <h2 style={{ ...styles.cardTitle, marginBottom: 0 }}>Agent feed</h2>
        <button onClick={runMonitor} disabled={running} style={{
          ...feedS.runBtn,
          borderColor: runSuccess ? '#4ade8040' : `${accentColor}35`,
          color: runSuccess ? '#4ade80' : accentColor,
          opacity: running ? 0.5 : 1,
        }}>
          {running ? (
            <span style={feedS.runBtnInner}><span style={feedS.spinner} />Running...</span>
          ) : runSuccess ? '✓ Done' : 'Run agent'}
        </button>
      </div>
      {loading ? (
        <p style={feedS.empty}>Loading...</p>
      ) : events.length === 0 ? (
        <p style={feedS.empty}>No agent activity yet. Click "Run agent" to see its first observation.</p>
      ) : (
        <div style={feedS.timeline}>
          {events.map((event, i) => (
            <div key={event.id} style={feedS.eventRow}>
              <div style={feedS.eventLeft}>
                <div style={{ ...feedS.eventDot, background: i === 0 ? accentColor : '#ffffff18', boxShadow: i === 0 ? `0 0 8px ${accentColor}50` : 'none' }} />
                {i < events.length - 1 && <div style={feedS.eventLine} />}
              </div>
              <div style={feedS.eventContent}>
                <div style={feedS.eventHeader}>
                  <span style={feedS.eventIcon}>{EVENT_ICONS[event.type] || '·'}</span>
                  <span style={feedS.eventType}>{event.type.replace(/_/g, ' ')}</span>
                  <span style={feedS.eventTime}>{new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {event.payload?.message && <p style={feedS.eventMessage}>{event.payload.message}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const feedS: Record<string, React.CSSProperties> = {
  runBtn: { background: 'transparent', border: '1px solid', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s', minWidth: '90px', textAlign: 'center' },
  runBtnInner: { display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' },
  spinner: { display: 'inline-block', width: '10px', height: '10px', border: '1.5px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  empty: { fontSize: '13px', color: '#ffffff30', textAlign: 'center', padding: '20px 0', lineHeight: 1.6 },
  timeline: { display: 'flex', flexDirection: 'column' },
  eventRow: { display: 'flex', gap: '12px', paddingBottom: '16px' },
  eventLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '10px', flexShrink: 0, paddingTop: '4px' },
  eventDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, transition: 'all 0.3s' },
  eventLine: { width: '1px', flex: 1, background: '#ffffff0c', marginTop: '5px', minHeight: '12px' },
  eventContent: { flex: 1 },
  eventHeader: { display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' },
  eventIcon: { fontSize: '12px' },
  eventType: { fontSize: '11px', color: '#ffffff45', textTransform: 'capitalize', flex: 1 },
  eventTime: { fontSize: '10px', color: '#ffffff22', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap' as const },
  eventMessage: { fontSize: '13px', color: '#ffffffaa', lineHeight: 1.6 },
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
    const { data: trialData, error } = await supabase.from('trials').select('*').eq('id', trialId).single()
    if (error || !trialData) { router.push('/dashboard'); return }
    setTrial(trialData as Trial)
    const { data: logData } = await supabase.from('daily_logs').select('*').eq('trial_id', trialId).eq('date', today).single()
    if (logData) setTodayLog(logData as DailyLog)
    setWearableData(simulateWearableData(trialId, today, (trialData.domain || 'other') as any))
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
    await supabase.from('trials').update({ status: 'active', started_at: new Date().toISOString() }).eq('id', trialId)
    loadTrial()
  }

  async function submitLog() {
    if (adherence === null || !primaryOutcome) return
    setSaving(true)
    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('daily_logs').insert({
      trial_id: trialId, user_id: user!.id, date: today,
      phase: getCurrentPhase()?.name || 'baseline',
      protocol_version: trial?.protocol?.active_version || 1,
      adherence, primary_outcome: parseFloat(primaryOutcome),
      confounders: confounderValues, notes: notes || null,
    })
    setShowLogForm(false)
    setSaving(false)
    loadTrial()
  }

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingSpinner} />
        <p style={styles.loadingText}>Loading trial...</p>
      </div>
    )
  }

  if (!trial) return null

  const domain = trial.domain || 'other'
  const colors = DOMAIN_COLORS[domain] || DOMAIN_COLORS.other
  const currentPhase = getCurrentPhase()
  const primaryMetrics = wearableData ? getPrimaryMetricsForDomain(domain as any) : []
  const activeProtocol = trial.protocol?.versions?.find((v: any) => v.version === trial.protocol.active_version)

  return (
    <div style={{ ...styles.root, '--accent': colors.accent } as any}>

      <div style={{ ...styles.orb, ...styles.orbTop, background: `radial-gradient(circle, ${colors.from}55, transparent 70%)` }} />
      <div style={{ ...styles.orb, ...styles.orbBottom, background: `radial-gradient(circle, ${colors.to}45, transparent 70%)` }} />

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <button onClick={() => router.push('/dashboard')} style={styles.backBtn}>← Dashboard</button>
          <button onClick={() => router.push(`/trial/${trialId}/results`)} style={styles.resultsBtn}>Results →</button>
          <div style={styles.headerMeta}>
            <span style={{ ...styles.badge, background: trial.status === 'active' ? '#22c55e18' : '#f59e0b18', color: trial.status === 'active' ? '#86efac' : '#fcd34d', border: `1px solid ${trial.status === 'active' ? '#22c55e30' : '#f59e0b30'}` }}>
              {trial.status}
            </span>
            {trial.domain && <span style={styles.domainBadge}>{trial.domain}</span>}
          </div>
        </div>
        <div style={styles.headerInner}>
          <h1 style={styles.hypothesis}>{trial.hypothesis_refined || trial.hypothesis_raw}</h1>
        </div>
        {currentPhase && (
          <div style={styles.headerInner}>
            <div style={styles.phaseBar}>
              <div style={styles.phaseBarTrack}>
                <div style={{ ...styles.phaseBarFill, width: `${currentPhase.progress}%`, background: colors.accent }} />
              </div>
              <span style={styles.phaseLabel}>{currentPhase.name} · day {currentPhase.day} of {currentPhase.totalDays}</span>
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
            <p style={styles.cardSubtitle}>Your protocol is set. Starting the trial kicks off the baseline phase and activates daily logging.</p>
            <button onClick={activateTrial} style={{ ...styles.primaryBtn, background: colors.accent, color: '#0a0a0a' }}>Start trial</button>
          </div>
        )}

        {/* Daily log */}
        {trial.status === 'active' && (
          <div style={styles.card}>
            <div style={{ ...styles.cardAccentBar, background: colors.accent }} />
            <div style={styles.cardHeader}>
              <h2 style={{ ...styles.cardTitle, marginBottom: 0 }}>Today's log</h2>
              <span style={styles.dateChip}>{today}</span>
            </div>
            {todayLog ? (
              <div style={styles.loggedState}>
                <div style={styles.loggedRow}>
                  <span style={{ ...styles.dot, background: todayLog.adherence ? '#4ade80' : '#f87171' }} />
                  <span style={styles.loggedText}>{todayLog.adherence ? 'Protocol followed' : 'Protocol not followed'}</span>
                </div>
                {todayLog.primary_outcome !== null && (
                  <div style={styles.outcomeDisplay}>
                    <span style={styles.outcomeLabel}>{trial.dependent_variable}</span>
                    <span style={{ ...styles.outcomeValue, color: colors.accent }}>{todayLog.primary_outcome}<span style={styles.outcomeDenom}>/10</span></span>
                  </div>
                )}
                <p style={styles.loggedConfirm}>✓ Logged for today</p>
              </div>
            ) : !showLogForm ? (
              <button onClick={() => setShowLogForm(true)} style={{ ...styles.primaryBtn, background: colors.accent, color: '#0a0a0a' }}>Log today's data</button>
            ) : (
              <div style={styles.logForm}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Did you follow the protocol today?</label>
                  <div style={styles.toggleRow}>
                    {[true, false].map(val => (
                      <button key={String(val)} type="button" onClick={() => setAdherence(val)}
                        style={{ ...styles.toggleBtn, ...(adherence === val ? { background: colors.accent, color: '#0a0a0a', borderColor: colors.accent } : {}) }}>
                        {val ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    {trial.dependent_variable || 'Primary outcome'}
                    <span style={styles.formHint}> · 1 = worst, 10 = best</span>
                  </label>
                  <div style={styles.scoreRow}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button key={n} type="button" onClick={() => setPrimaryOutcome(String(n))}
                        style={{ ...styles.scoreBtn, ...(primaryOutcome === String(n) ? { background: colors.accent, color: '#0a0a0a', borderColor: colors.accent } : {}) }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {trial.confounders.length > 0 && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Things that could affect the results</label>
                    <div style={styles.confounderGrid}>
                      {trial.confounders.map(c => (
                        <ConfounderInput key={c} name={c} value={confounderValues[c] || ''}
                          onChange={val => setConfounderValues(p => ({ ...p, [c]: val }))} accent={colors.accent} />
                      ))}
                    </div>
                  </div>
                )}

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Notes <span style={styles.formHint}>(optional)</span></label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Anything worth noting today..." rows={2} style={styles.textarea} />
                </div>

                <div style={styles.formActions}>
                  <button type="button" onClick={() => setShowLogForm(false)} style={styles.ghostBtn}>Cancel</button>
                  <button type="button" onClick={submitLog} disabled={adherence === null || !primaryOutcome || saving}
                    style={{ ...styles.primaryBtn, background: colors.accent, color: '#0a0a0a', opacity: (adherence === null || !primaryOutcome) ? 0.4 : 1 }}>
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
              <h2 style={{ ...styles.cardTitle, marginBottom: 0 }}>Biometrics</h2>
              <span style={styles.simulatedChip}>Simulated · Oura-ready</span>
            </div>
            <div style={styles.metricsGrid}>
              {primaryMetrics.map(metric => {
                const value = wearableData[metric]
                if (value === null) return null
                return (
                  <div key={metric} style={styles.metricCard}>
                    <p style={styles.metricLabel}>{METRIC_LABELS[metric]}</p>
                    <p style={styles.metricValue}>{value}<span style={styles.metricUnit}> {METRIC_UNITS[metric]}</span></p>
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
                    <span style={{ ...styles.phaseDot, background: currentPhase?.name === phase.name ? colors.accent : '#ffffff18', boxShadow: currentPhase?.name === phase.name ? `0 0 6px ${colors.accent}60` : 'none' }} />
                    <span style={{ ...styles.phaseName, color: currentPhase?.name === phase.name ? colors.accent : '#ffffff60' }}>{phase.name}</span>
                    <span style={styles.phaseDays}>{phase.duration_days}d</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View results button */}
        <div style={{ textAlign: 'center' as const }}>
          <button
            onClick={() => router.push(`/trial/${trialId}/results`)}
            style={{
              background: 'transparent',
              border: `1px solid ${colors.accent}40`,
              borderRadius: '10px',
              padding: '10px 24px',
              fontSize: '13px',
              color: colors.accent,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'border-color 0.2s',
            }}
          >
            View results →
          </button>
        </div>

        {/* Agent feed */}
        <AgentFeed trialId={trialId} accentColor={colors.accent} />

      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=number] { -moz-appearance: textfield; }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input::placeholder, textarea::placeholder { color: #ffffff20; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: var(--accent) !important; }
        button { cursor: pointer; font-family: 'DM Sans', sans-serif; }
        select option { background: #1a1f2e; color: #ffffff; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: '#080b12', fontFamily: "'DM Sans', sans-serif", color: '#ffffff', position: 'relative', overflowX: 'hidden' },
  orb: { position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 },
  orbTop: { width: '600px', height: '600px', top: '-200px', right: '-100px' },
  orbBottom: { width: '500px', height: '500px', bottom: '-150px', left: '-100px' },
  loadingScreen: { minHeight: '100vh', background: '#080b12', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' },
  loadingSpinner: { width: '32px', height: '32px', border: '2px solid #ffffff0f', borderTop: '2px solid #ffffff50', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: '#ffffff35', fontSize: '13px' },
  header: { position: 'relative', zIndex: 10, padding: '20px 24px 18px', borderBottom: '1px solid #ffffff08', background: 'rgba(8,11,18,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' },
  headerInner: { maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  backBtn: { background: 'none', border: 'none', color: '#ffffff35', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  resultsBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', color: '#ffffff60', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  headerMeta: { display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' },
  badge: { fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize', letterSpacing: '0.02em' },
  domainBadge: { fontSize: '11px', color: '#ffffff35', textTransform: 'capitalize' },
  hypothesis: { fontSize: '17px', fontWeight: 400, color: '#ffffffee', lineHeight: 1.4, letterSpacing: '-0.01em' },
  phaseBar: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%' },
  phaseBarTrack: { flex: 1, height: '2px', background: '#ffffff0c', borderRadius: '2px', overflow: 'hidden' },
  phaseBarFill: { height: '100%', borderRadius: '2px', transition: 'width 0.6s ease' },
  phaseLabel: { fontSize: '11px', color: '#ffffff40', whiteSpace: 'nowrap' as const, textTransform: 'capitalize', fontFamily: "'DM Mono', monospace" },
  main: { position: 'relative', zIndex: 10, maxWidth: '680px', margin: '0 auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' },
  card: { position: 'relative', background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '20px 22px', overflow: 'hidden' },
  cardAccentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: '2px', opacity: 0.65 },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  cardTitle: { fontSize: '13px', fontWeight: 500, color: '#ffffffcc', letterSpacing: '0.01em', marginBottom: '10px' },
  cardSubtitle: { fontSize: '13px', color: '#ffffff65', lineHeight: 1.6, marginBottom: '14px' },
  dateChip: { fontSize: '11px', color: '#ffffff35', fontFamily: "'DM Mono', monospace" },
  simulatedChip: { fontSize: '10px', color: '#ffffff28', border: '1px solid #ffffff12', borderRadius: '20px', padding: '2px 8px', letterSpacing: '0.03em' },
  primaryBtn: { border: 'none', borderRadius: '10px', padding: '11px 22px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'opacity 0.2s' },
  ghostBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '11px 22px', fontSize: '13px', color: '#ffffff60', cursor: 'pointer' },
  loggedState: { display: 'flex', flexDirection: 'column', gap: '10px' },
  loggedRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  loggedText: { fontSize: '13px', color: '#ffffff80' },
  outcomeDisplay: { display: 'flex', alignItems: 'baseline', gap: '10px' },
  outcomeLabel: { fontSize: '12px', color: '#ffffff45', textTransform: 'capitalize' },
  outcomeValue: { fontSize: '26px', fontWeight: 300, fontFamily: "'DM Mono', monospace", letterSpacing: '-0.02em' },
  outcomeDenom: { fontSize: '14px', color: '#ffffff25' },
  loggedConfirm: { fontSize: '11px', color: '#4ade8070', letterSpacing: '0.02em' },
  logForm: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  formLabel: { fontSize: '12px', color: '#ffffff70', fontWeight: 500 },
  formHint: { fontWeight: 400, color: '#ffffff30', fontSize: '11px' },
  toggleRow: { display: 'flex', gap: '8px' },
  toggleBtn: { flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#ffffff60', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s' },
  scoreRow: { display: 'flex', gap: '5px', flexWrap: 'wrap' },
  scoreBtn: { width: '36px', height: '36px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#ffffff60', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Mono', monospace" },
  confounderGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  textarea: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', color: '#ffffffcc', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", resize: 'none', lineHeight: 1.6, transition: 'border-color 0.2s' },
  formActions: { display: 'flex', gap: '8px' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' },
  metricCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px 14px' },
  metricLabel: { fontSize: '10px', color: '#ffffff38', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' },
  metricValue: { fontSize: '20px', fontWeight: 300, color: '#ffffffdd', fontFamily: "'DM Mono', monospace", letterSpacing: '-0.02em' },
  metricUnit: { fontSize: '11px', color: '#ffffff38', fontWeight: 400, fontFamily: "'DM Sans', sans-serif" },
  protocolSection: { marginBottom: '14px' },
  protocolLabel: { fontSize: '10px', color: '#ffffff28', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' },
  protocolText: { fontSize: '13px', color: '#ffffff80', lineHeight: 1.6 },
  phaseList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  phaseRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  phaseDot: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, transition: 'all 0.3s' },
  phaseName: { fontSize: '12px', textTransform: 'capitalize', flex: 1, transition: 'color 0.3s' },
  phaseDays: { fontSize: '11px', color: '#ffffff28', fontFamily: "'DM Mono', monospace" },
}