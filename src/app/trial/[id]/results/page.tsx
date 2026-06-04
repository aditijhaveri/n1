// // 'use client'

// // import { useState, useEffect } from 'react'
// // import { useParams, useRouter } from 'next/navigation'
// // import { getSupabaseBrowserClient } from '@/lib/supabase/client'

// // type Interpretation = {
// //   verdict: 'supported' | 'not_supported' | 'inconclusive'
// //   headline: string
// //   summary: string
// //   confidence: 'low' | 'moderate' | 'high'
// //   confidence_reason: string
// //   baseline_avg: number
// //   intervention_avg: number
// //   improvement: number
// //   improvement_pct: number
// //   adherence_rate: number
// //   data_quality: 'good' | 'fair' | 'poor'
// //   confounder_flags: string[]
// //   what_this_means: string
// //   what_this_doesnt_mean: string
// //   next_steps: string[]
// // }

// // type Trial = {
// //   id: string
// //   hypothesis_refined: string | null
// //   hypothesis_raw: string
// //   domain: string | null
// //   dependent_variable: string | null
// //   status: string
// //   concluded_at: string | null
// // }

// // const DOMAIN_COLORS: Record<string, { accent: string; from: string; to: string }> = {
// //   acne:      { accent: '#fb923c', from: '#c2410c', to: '#7c2d12' },
// //   sleep:     { accent: '#818cf8', from: '#1d4ed8', to: '#1e1b4b' },
// //   digestion: { accent: '#4ade80', from: '#15803d', to: '#14532d' },
// //   mood:      { accent: '#c084fc', from: '#7c3aed', to: '#2e1065' },
// //   energy:    { accent: '#fbbf24', from: '#b45309', to: '#451a03' },
// //   other:     { accent: '#2dd4bf', from: '#0f766e', to: '#042f2e' },
// // }

// // const VERDICT_CONFIG = {
// //   supported: {
// //     icon: '✓',
// //     label: 'Hypothesis supported',
// //     color: '#4ade80',
// //     bg: '#22c55e12',
// //     border: '#22c55e25',
// //   },
// //   not_supported: {
// //     icon: '○',
// //     label: 'Hypothesis not supported',
// //     color: '#f87171',
// //     bg: '#ef444412',
// //     border: '#ef444425',
// //   },
// //   inconclusive: {
// //     icon: '◐',
// //     label: 'Inconclusive',
// //     color: '#fbbf24',
// //     bg: '#f59e0b12',
// //     border: '#f59e0b25',
// //   },
// // }

// // const CONFIDENCE_COLORS = {
// //   high: '#4ade80',
// //   moderate: '#fbbf24',
// //   low: '#f87171',
// // }

// // export default function ResultsPage() {
// //   const params = useParams()
// //   const router = useRouter()
// //   const trialId = params.id as string

// //   const [trial, setTrial] = useState<Trial | null>(null)
// //   const [interpretation, setInterpretation] = useState<Interpretation | null>(null)
// //   const [loading, setLoading] = useState(true)
// //   const [generating, setGenerating] = useState(false)
// //   const [cached, setCached] = useState(false)
// //   const [error, setError] = useState<string | null>(null)

// //   useEffect(() => { loadTrial() }, [trialId])

// //   async function loadTrial() {
// //     const supabase = getSupabaseBrowserClient()
// //     const { data } = await supabase
// //       .from('trials').select('*').eq('id', trialId).single()

// //     if (!data) { router.push('/dashboard'); return }
// //     setTrial(data as Trial)
// //     setLoading(false)
// //     generateInterpretation()
// //   }

// //   async function generateInterpretation() {
// //     setGenerating(true)
// //     setError(null)
// //     try {
// //       const res = await fetch('/api/interpret', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ trialId }),
// //       })
// //       const data = await res.json()
// //       if (!res.ok) throw new Error(data.error)
// //       setInterpretation(data.interpretation)
// //       setCached(data.cached)
// //     } catch (e: any) {
// //       setError(e.message || 'Failed to generate interpretation')
// //     }
// //     setGenerating(false)
// //   }

// //   if (loading) {
// //     return (
// //       <div style={s.loadingScreen}>
// //         <div style={s.spinner} />
// //         <p style={s.loadingText}>Loading results...</p>
// //       </div>
// //     )
// //   }

// //   if (!trial) return null

// //   const domain = trial.domain || 'other'
// //   const colors = DOMAIN_COLORS[domain] || DOMAIN_COLORS.other
// //   const verdict = interpretation ? VERDICT_CONFIG[interpretation.verdict] : null
// //   const improvement = interpretation?.improvement || 0
// //   const isPositive = improvement > 0

// //   return (
// //     <div style={{ ...s.root, '--accent': colors.accent } as any}>

// //       {/* Ambient orbs */}
// //       <div style={{ ...s.orb, ...s.orbTop, background: `radial-gradient(circle, ${colors.from}50, transparent 70%)` }} />
// //       <div style={{ ...s.orb, ...s.orbBottom, background: `radial-gradient(circle, ${colors.to}40, transparent 70%)` }} />

// //       {/* Header */}
// //       <header style={s.header}>
// //         <div style={s.headerInner}>
// //           <button onClick={() => router.push(`/trial/${trialId}`)} style={s.backBtn}>
// //             ← Trial
// //           </button>
// //           <button onClick={() => router.push('/dashboard')} style={s.backBtn}>
// //             Dashboard
// //           </button>
// //         </div>
// //         <div style={s.headerInner}>
// //           <div>
// //             <p style={s.headerLabel}>Results</p>
// //             <h1 style={s.hypothesis}>
// //               {trial.hypothesis_refined || trial.hypothesis_raw}
// //             </h1>
// //           </div>
// //         </div>
// //       </header>

// //       <main style={s.main}>

// //         {/* Generating state */}
// //         {generating && (
// //           <div style={s.generatingCard}>
// //             <div style={s.generatingInner}>
// //               <div style={s.spinner} />
// //               <div>
// //                 <p style={s.generatingTitle}>Analysing your trial data...</p>
// //                 <p style={s.generatingSubtitle}>Reading your logs, checking confounders, building your report.</p>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* Error state */}
// //         {error && !generating && (
// //           <div style={s.errorCard}>
// //             <p style={s.errorTitle}>Couldn't generate interpretation</p>
// //             <p style={s.errorText}>{error}</p>
// //             <button onClick={generateInterpretation} style={{ ...s.primaryBtn, background: colors.accent, color: '#0a0a0a' }}>
// //               Try again
// //             </button>
// //           </div>
// //         )}

// //         {/* Results */}
// //         {interpretation && !generating && (
// //           <>
// //             {/* Verdict card */}
// //             <div style={s.card}>
// //               <div style={{ ...s.cardAccent, background: colors.accent }} />

// //               {verdict && (
// //                 <div style={{ ...s.verdictBadge, background: verdict.bg, border: `1px solid ${verdict.border}` }}>
// //                   <span style={{ ...s.verdictIcon, color: verdict.color }}>{verdict.icon}</span>
// //                   <span style={{ ...s.verdictLabel, color: verdict.color }}>{verdict.label}</span>
// //                 </div>
// //               )}

// //               <h2 style={s.headline}>{interpretation.headline}</h2>
// //               <p style={s.summary}>{interpretation.summary}</p>

// //               {/* Score comparison */}
// //               <div style={s.scoreComparison}>
// //                 <div style={s.scoreBlock}>
// //                   <p style={s.scoreLabel}>Baseline avg</p>
// //                   <p style={s.scoreValue}>{interpretation.baseline_avg?.toFixed(1)}<span style={s.scoreDenom}>/10</span></p>
// //                 </div>
// //                 <div style={s.scoreArrow}>
// //                   <span style={{ color: isPositive ? '#4ade80' : '#f87171', fontSize: '20px' }}>
// //                     {isPositive ? '↑' : '↓'}
// //                   </span>
// //                   <span style={{ ...s.scoreChange, color: isPositive ? '#4ade80' : '#f87171' }}>
// //                     {isPositive ? '+' : ''}{improvement.toFixed(1)}
// //                   </span>
// //                 </div>
// //                 <div style={s.scoreBlock}>
// //                   <p style={s.scoreLabel}>Intervention avg</p>
// //                   <p style={{ ...s.scoreValue, color: isPositive ? '#4ade80' : '#f87171' }}>
// //                     {interpretation.intervention_avg?.toFixed(1)}<span style={s.scoreDenom}>/10</span>
// //                   </p>
// //                 </div>
// //               </div>

// //               {cached && (
// //                 <p style={s.cachedNote}>↻ Cached from previous analysis</p>
// //               )}
// //             </div>

// //             {/* Data quality card */}
// //             <div style={s.card}>
// //               <div style={{ ...s.cardAccent, background: colors.accent }} />
// //               <h2 style={s.cardTitle}>Data quality</h2>

// //               <div style={s.metricsRow}>
// //                 <div style={s.metricBlock}>
// //                   <p style={s.metricLabel}>Adherence</p>
// //                   <p style={{ ...s.metricBig, color: interpretation.adherence_rate >= 80 ? '#4ade80' : interpretation.adherence_rate >= 60 ? '#fbbf24' : '#f87171' }}>
// //                     {interpretation.adherence_rate}%
// //                   </p>
// //                 </div>
// //                 <div style={s.metricBlock}>
// //                   <p style={s.metricLabel}>Confidence</p>
// //                   <p style={{ ...s.metricBig, color: CONFIDENCE_COLORS[interpretation.confidence] }}>
// //                     {interpretation.confidence}
// //                   </p>
// //                 </div>
// //                 <div style={s.metricBlock}>
// //                   <p style={s.metricLabel}>Data quality</p>
// //                   <p style={{ ...s.metricBig, color: interpretation.data_quality === 'good' ? '#4ade80' : interpretation.data_quality === 'fair' ? '#fbbf24' : '#f87171' }}>
// //                     {interpretation.data_quality}
// //                   </p>
// //                 </div>
// //               </div>

// //               <p style={s.confidenceReason}>{interpretation.confidence_reason}</p>
// //             </div>

// //             {/* What this means card */}
// //             <div style={s.card}>
// //               <div style={{ ...s.cardAccent, background: colors.accent }} />
// //               <h2 style={s.cardTitle}>What this means</h2>
// //               <p style={s.interpretText}>{interpretation.what_this_means}</p>
// //               <div style={s.caveatBlock}>
// //                 <p style={s.caveatLabel}>Important caveat</p>
// //                 <p style={s.caveatText}>{interpretation.what_this_doesnt_mean}</p>
// //               </div>
// //             </div>

// //             {/* Confounder flags */}
// //             {interpretation.confounder_flags?.length > 0 && (
// //               <div style={s.card}>
// //                 <div style={{ ...s.cardAccent, background: colors.accent }} />
// //                 <h2 style={s.cardTitle}>Things that may have affected results</h2>
// //                 <div style={s.flagList}>
// //                   {interpretation.confounder_flags.map((flag, i) => (
// //                     <div key={i} style={s.flagRow}>
// //                       <span style={s.flagDot}>⚠</span>
// //                       <p style={s.flagText}>{flag}</p>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}

// //             {/* Next steps */}
// //             <div style={s.card}>
// //               <div style={{ ...s.cardAccent, background: colors.accent }} />
// //               <h2 style={s.cardTitle}>What to do next</h2>
// //               <div style={s.nextStepList}>
// //                 {interpretation.next_steps?.map((step, i) => (
// //                   <div key={i} style={s.nextStepRow}>
// //                     <span style={{ ...s.nextStepNum, color: colors.accent }}>{i + 1}</span>
// //                     <p style={s.nextStepText}>{step}</p>
// //                   </div>
// //                 ))}
// //               </div>

// //               <div style={s.nextStepActions}>
// //                 <button
// //                   onClick={() => router.push('/intake')}
// //                   style={{ ...s.primaryBtn, background: colors.accent, color: '#0a0a0a' }}
// //                 >
// //                   Start follow-up experiment
// //                 </button>
// //                 <button
// //                   onClick={() => router.push('/dashboard')}
// //                   style={s.ghostBtn}
// //                 >
// //                   Back to dashboard
// //                 </button>
// //               </div>
// //             </div>

// //             {/* Regenerate */}
// //             <div style={s.regenRow}>
// //               <button onClick={generateInterpretation} style={s.regenBtn}>
// //                 ↻ Regenerate analysis
// //               </button>
// //             </div>
// //           </>
// //         )}

// //       </main>

// //       <style>{`
// //         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
// //         * { box-sizing: border-box; margin: 0; padding: 0; }
// //         button { cursor: pointer; font-family: 'DM Sans', sans-serif; }
// //         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
// //         @keyframes fadeUp {
// //           from { opacity: 0; transform: translateY(12px); }
// //           to { opacity: 1; transform: translateY(0); }
// //         }
// //       `}</style>
// //     </div>
// //   )
// // }

// // const s: Record<string, React.CSSProperties> = {
// //   root: {
// //     minHeight: '100vh',
// //     background: '#080b12',
// //     fontFamily: "'DM Sans', sans-serif",
// //     color: '#ffffff',
// //     position: 'relative',
// //     overflowX: 'hidden',
// //   },
// //   orb: { position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 },
// //   orbTop: { width: '600px', height: '600px', top: '-200px', right: '-100px' },
// //   orbBottom: { width: '500px', height: '500px', bottom: '-150px', left: '-100px' },
// //   loadingScreen: {
// //     minHeight: '100vh', background: '#080b12',
// //     display: 'flex', flexDirection: 'column',
// //     alignItems: 'center', justifyContent: 'center', gap: '16px',
// //   },
// //   spinner: {
// //     width: '28px', height: '28px',
// //     border: '2px solid #ffffff0f',
// //     borderTop: '2px solid #ffffff50',
// //     borderRadius: '50%',
// //     animation: 'spin 0.8s linear infinite',
// //   },
// //   loadingText: { color: '#ffffff30', fontSize: '13px' },
// //   header: {
// //     position: 'relative', zIndex: 10,
// //     padding: '20px 24px 18px',
// //     borderBottom: '1px solid #ffffff08',
// //     background: 'rgba(8,11,18,0.88)',
// //     backdropFilter: 'blur(20px)',
// //     WebkitBackdropFilter: 'blur(20px)',
// //   },
// //   headerInner: {
// //     maxWidth: '680px', margin: '0 auto',
// //     display: 'flex', alignItems: 'center',
// //     gap: '12px', marginBottom: '8px',
// //   },
// //   backBtn: {
// //     background: 'none', border: 'none',
// //     color: '#ffffff35', fontSize: '12px',
// //     cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
// //   },
// //   headerLabel: {
// //     fontSize: '10px', color: '#ffffff30',
// //     textTransform: 'uppercase', letterSpacing: '0.1em',
// //     marginBottom: '4px',
// //   },
// //   hypothesis: {
// //     fontSize: '17px', fontWeight: 400,
// //     color: '#ffffffee', lineHeight: 1.4,
// //     letterSpacing: '-0.01em',
// //   },
// //   main: {
// //     position: 'relative', zIndex: 10,
// //     maxWidth: '680px', margin: '0 auto',
// //     padding: '20px 24px', display: 'flex',
// //     flexDirection: 'column', gap: '14px',
// //   },
// //   generatingCard: {
// //     background: 'rgba(255,255,255,0.04)',
// //     border: '1px solid rgba(255,255,255,0.08)',
// //     borderRadius: '18px', padding: '28px 24px',
// //   },
// //   generatingInner: {
// //     display: 'flex', alignItems: 'center', gap: '20px',
// //   },
// //   generatingTitle: {
// //     fontSize: '15px', fontWeight: 500,
// //     color: '#ffffffcc', marginBottom: '4px',
// //   },
// //   generatingSubtitle: {
// //     fontSize: '13px', color: '#ffffff50', lineHeight: 1.5,
// //   },
// //   errorCard: {
// //     background: '#ef444410',
// //     border: '1px solid #ef444425',
// //     borderRadius: '18px', padding: '24px',
// //     display: 'flex', flexDirection: 'column', gap: '12px',
// //   },
// //   errorTitle: { fontSize: '14px', fontWeight: 500, color: '#fca5a5' },
// //   errorText: { fontSize: '13px', color: '#ffffff60' },
// //   card: {
// //     position: 'relative',
// //     background: 'rgba(255,255,255,0.055)',
// //     backdropFilter: 'blur(24px)',
// //     WebkitBackdropFilter: 'blur(24px)',
// //     border: '1px solid rgba(255,255,255,0.1)',
// //     borderRadius: '18px', padding: '22px',
// //     overflow: 'hidden',
// //     animation: 'fadeUp 0.4s ease forwards',
// //   },
// //   cardAccent: {
// //     position: 'absolute', top: 0, left: 0, right: 0,
// //     height: '2px', opacity: 0.65,
// //   },
// //   cardTitle: {
// //     fontSize: '12px', fontWeight: 500,
// //     color: '#ffffff80', letterSpacing: '0.02em',
// //     textTransform: 'uppercase', marginBottom: '14px',
// //   },
// //   verdictBadge: {
// //     display: 'inline-flex', alignItems: 'center',
// //     gap: '7px', padding: '5px 12px',
// //     borderRadius: '20px', marginBottom: '14px',
// //   },
// //   verdictIcon: { fontSize: '14px', fontWeight: 600 },
// //   verdictLabel: { fontSize: '12px', fontWeight: 500, letterSpacing: '0.02em' },
// //   headline: {
// //     fontSize: '22px', fontWeight: 400,
// //     color: '#ffffffee', lineHeight: 1.3,
// //     letterSpacing: '-0.02em', marginBottom: '10px',
// //   },
// //   summary: {
// //     fontSize: '14px', color: '#ffffff80',
// //     lineHeight: 1.7, marginBottom: '20px',
// //   },
// //   scoreComparison: {
// //     display: 'flex', alignItems: 'center',
// //     gap: '16px', padding: '16px',
// //     background: 'rgba(255,255,255,0.04)',
// //     borderRadius: '12px', marginBottom: '12px',
// //   },
// //   scoreBlock: { flex: 1, textAlign: 'center' },
// //   scoreLabel: { fontSize: '10px', color: '#ffffff35', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' },
// //   scoreValue: {
// //     fontSize: '28px', fontWeight: 300,
// //     color: '#ffffffee', fontFamily: "'DM Mono', monospace",
// //     letterSpacing: '-0.02em',
// //   },
// //   scoreDenom: { fontSize: '14px', color: '#ffffff25' },
// //   scoreArrow: {
// //     display: 'flex', flexDirection: 'column',
// //     alignItems: 'center', gap: '2px',
// //   },
// //   scoreChange: {
// //     fontSize: '16px', fontWeight: 500,
// //     fontFamily: "'DM Mono', monospace",
// //   },
// //   cachedNote: { fontSize: '11px', color: '#ffffff25', marginTop: '4px' },
// //   metricsRow: {
// //     display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
// //     gap: '12px', marginBottom: '14px',
// //   },
// //   metricBlock: {
// //     background: 'rgba(255,255,255,0.04)',
// //     borderRadius: '10px', padding: '12px',
// //     textAlign: 'center',
// //   },
// //   metricLabel: { fontSize: '10px', color: '#ffffff35', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' },
// //   metricBig: {
// //     fontSize: '18px', fontWeight: 500,
// //     fontFamily: "'DM Mono', monospace",
// //     textTransform: 'capitalize',
// //   },
// //   confidenceReason: { fontSize: '13px', color: '#ffffff55', lineHeight: 1.6 },
// //   interpretText: { fontSize: '14px', color: '#ffffffcc', lineHeight: 1.7, marginBottom: '16px' },
// //   caveatBlock: {
// //     background: 'rgba(255,255,255,0.04)',
// //     border: '1px solid rgba(255,255,255,0.07)',
// //     borderRadius: '10px', padding: '14px',
// //   },
// //   caveatLabel: { fontSize: '10px', color: '#ffffff30', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' },
// //   caveatText: { fontSize: '13px', color: '#ffffff65', lineHeight: 1.6 },
// //   flagList: { display: 'flex', flexDirection: 'column', gap: '10px' },
// //   flagRow: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
// //   flagDot: { fontSize: '12px', color: '#fbbf24', flexShrink: 0, marginTop: '1px' },
// //   flagText: { fontSize: '13px', color: '#ffffff70', lineHeight: 1.5 },
// //   nextStepList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
// //   nextStepRow: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
// //   nextStepNum: {
// //     fontSize: '13px', fontWeight: 600,
// //     fontFamily: "'DM Mono', monospace",
// //     flexShrink: 0, marginTop: '1px',
// //   },
// //   nextStepText: { fontSize: '14px', color: '#ffffffcc', lineHeight: 1.6 },
// //   nextStepActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
// //   primaryBtn: {
// //     border: 'none', borderRadius: '10px',
// //     padding: '11px 20px', fontSize: '13px',
// //     fontWeight: 500, cursor: 'pointer',
// //   },
// //   ghostBtn: {
// //     background: 'rgba(255,255,255,0.05)',
// //     border: '1px solid rgba(255,255,255,0.08)',
// //     borderRadius: '10px', padding: '11px 20px',
// //     fontSize: '13px', color: '#ffffff60', cursor: 'pointer',
// //   },
// //   regenRow: { display: 'flex', justifyContent: 'center', paddingBottom: '24px' },
// //   regenBtn: {
// //     background: 'transparent', border: 'none',
// //     fontSize: '12px', color: '#ffffff25',
// //     cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
// //   },
// // }


// 'use client'

// import { useState, useEffect } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { getSupabaseBrowserClient } from '@/lib/supabase/client'

// type Interpretation = {
//   verdict: 'supported' | 'not_supported' | 'inconclusive'
//   headline: string
//   summary: string
//   confidence: 'low' | 'moderate' | 'high'
//   confidence_reason: string
//   baseline_avg: number
//   intervention_avg: number
//   improvement: number
//   improvement_pct: number
//   adherence_rate: number
//   data_quality: 'good' | 'fair' | 'poor'
//   confounder_flags: string[]
//   what_this_means: string
//   what_this_doesnt_mean: string
//   next_steps: string[]
// }

// type Trial = {
//   id: string
//   hypothesis_refined: string | null
//   hypothesis_raw: string
//   domain: string | null
//   dependent_variable: string | null
//   status: string
//   concluded_at: string | null
// }

// const DOMAIN_COLORS: Record<string, { accent: string; from: string; to: string }> = {
//   acne:      { accent: '#fb923c', from: '#c2410c', to: '#7c2d12' },
//   sleep:     { accent: '#818cf8', from: '#1d4ed8', to: '#1e1b4b' },
//   digestion: { accent: '#4ade80', from: '#15803d', to: '#14532d' },
//   mood:      { accent: '#c084fc', from: '#7c3aed', to: '#2e1065' },
//   energy:    { accent: '#fbbf24', from: '#b45309', to: '#451a03' },
//   other:     { accent: '#2dd4bf', from: '#0f766e', to: '#042f2e' },
// }

// const VERDICT_CONFIG = {
//   supported: {
//     icon: '✓',
//     label: 'Hypothesis supported',
//     color: '#4ade80',
//     bg: '#22c55e12',
//     border: '#22c55e25',
//   },
//   not_supported: {
//     icon: '○',
//     label: 'Hypothesis not supported',
//     color: '#f87171',
//     bg: '#ef444412',
//     border: '#ef444425',
//   },
//   inconclusive: {
//     icon: '◐',
//     label: 'Inconclusive',
//     color: '#fbbf24',
//     bg: '#f59e0b12',
//     border: '#f59e0b25',
//   },
// }

// const CONFIDENCE_COLORS = {
//   high: '#4ade80',
//   moderate: '#fbbf24',
//   low: '#f87171',
// }

// export default function ResultsPage() {
//   const params = useParams()
//   const router = useRouter()
//   const trialId = params.id as string

//   const [trial, setTrial] = useState<Trial | null>(null)
//   const [interpretation, setInterpretation] = useState<Interpretation | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [generating, setGenerating] = useState(false)
//   const [cached, setCached] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => { loadTrial() }, [trialId])

//   async function loadTrial() {
//     const supabase = getSupabaseBrowserClient()
//     const { data } = await supabase
//       .from('trials').select('*').eq('id', trialId).single()

//     if (!data) { router.push('/dashboard'); return }
//     setTrial(data as Trial)
//     setLoading(false)
//     generateInterpretation()
//   }

//   async function generateInterpretation() {
//     setGenerating(true)
//     setError(null)
//     try {
//       const res = await fetch('/api/interpret', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ trialId }),
//       })
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error)
//       setInterpretation(data.interpretation)
//       setCached(data.cached)
//     } catch (e: any) {
//       setError(e.message || 'Failed to generate interpretation')
//     }
//     setGenerating(false)
//   }

//   if (loading) {
//     return (
//       <div style={s.loadingScreen}>
//         <div style={s.spinner} />
//         <p style={s.loadingText}>Loading results...</p>
//       </div>
//     )
//   }

//   if (!trial) return null

//   const domain = trial.domain || 'other'
//   const colors = DOMAIN_COLORS[domain] || DOMAIN_COLORS.other
//   const verdict = interpretation ? VERDICT_CONFIG[interpretation.verdict] : null
//   const improvement = interpretation?.improvement || 0
//   const isPositive = improvement > 0

//   return (
//     <div style={{ ...s.root, '--accent': colors.accent } as any}>

//       {/* Ambient orbs */}
//       <div style={{ ...s.orb, ...s.orbTop, background: `radial-gradient(circle, ${colors.from}50, transparent 70%)` }} />
//       <div style={{ ...s.orb, ...s.orbBottom, background: `radial-gradient(circle, ${colors.to}40, transparent 70%)` }} />

//       {/* Header */}
//       <header style={s.header}>
//         <div style={s.headerInner}>
//           <button onClick={() => router.push(`/trial/${trialId}`)} style={s.backBtn}>
//             ← Trial
//           </button>
//           <button onClick={() => router.push('/dashboard')} style={s.backBtn}>
//             Dashboard
//           </button>
//         </div>
//         <div style={s.headerInner}>
//           <div>
//             <p style={s.headerLabel}>Results</p>
//             <h1 style={s.hypothesis}>
//               {trial.hypothesis_refined || trial.hypothesis_raw}
//             </h1>
//           </div>
//         </div>
//       </header>

//       <main style={s.main}>

//         {/* Generating state */}
//         {generating && (
//           <div style={s.generatingCard}>
//             <div style={s.generatingInner}>
//               <div style={s.spinner} />
//               <div>
//                 <p style={s.generatingTitle}>Analysing your trial data...</p>
//                 <p style={s.generatingSubtitle}>Reading your logs, checking confounders, building your report.</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Error state */}
//         {error && !generating && (
//           <div style={s.errorCard}>
//             <p style={s.errorTitle}>Couldn't generate interpretation</p>
//             <p style={s.errorText}>{error}</p>
//             <button onClick={generateInterpretation} style={{ ...s.primaryBtn, background: colors.accent, color: '#0a0a0a' }}>
//               Try again
//             </button>
//           </div>
//         )}

//         {/* Results */}
//         {interpretation && !generating && (
//           <>
//             {/* Verdict card */}
//             <div style={s.card}>
//               <div style={{ ...s.cardAccent, background: colors.accent }} />

//               {verdict && (
//                 <div style={{ ...s.verdictBadge, background: verdict.bg, border: `1px solid ${verdict.border}` }}>
//                   <span style={{ ...s.verdictIcon, color: verdict.color }}>{verdict.icon}</span>
//                   <span style={{ ...s.verdictLabel, color: verdict.color }}>{verdict.label}</span>
//                 </div>
//               )}

//               <h2 style={s.headline}>{interpretation.headline}</h2>
//               <p style={s.summary}>{interpretation.summary}</p>

//               {/* Score comparison */}
//               <div style={s.scoreComparison}>
//                 <div style={s.scoreBlock}>
//                   <p style={s.scoreLabel}>Baseline avg</p>
//                   <p style={s.scoreValue}>{interpretation.baseline_avg?.toFixed(1)}<span style={s.scoreDenom}>/10</span></p>
//                 </div>
//                 <div style={s.scoreArrow}>
//                   <span style={{ color: isPositive ? '#4ade80' : '#f87171', fontSize: '20px' }}>
//                     {isPositive ? '↑' : '↓'}
//                   </span>
//                   <span style={{ ...s.scoreChange, color: isPositive ? '#4ade80' : '#f87171' }}>
//                     {isPositive ? '+' : ''}{improvement.toFixed(1)}
//                   </span>
//                 </div>
//                 <div style={s.scoreBlock}>
//                   <p style={s.scoreLabel}>Intervention avg</p>
//                   <p style={{ ...s.scoreValue, color: isPositive ? '#4ade80' : '#f87171' }}>
//                     {interpretation.intervention_avg?.toFixed(1)}<span style={s.scoreDenom}>/10</span>
//                   </p>
//                 </div>
//               </div>

//               {cached && (
//                 <p style={s.cachedNote}>↻ Cached from previous analysis</p>
//               )}
//             </div>

//             {/* Data quality card */}
//             <div style={s.card}>
//               <div style={{ ...s.cardAccent, background: colors.accent }} />
//               <h2 style={s.cardTitle}>Data quality</h2>

//               <div style={s.metricsRow}>
//                 <div style={s.metricBlock}>
//                   <p style={s.metricLabel}>Adherence</p>
//                   <p style={{ ...s.metricBig, color: interpretation.adherence_rate >= 80 ? '#4ade80' : interpretation.adherence_rate >= 60 ? '#fbbf24' : '#f87171' }}>
//                     {interpretation.adherence_rate}%
//                   </p>
//                 </div>
//                 <div style={s.metricBlock}>
//                   <p style={s.metricLabel}>Confidence</p>
//                   <p style={{ ...s.metricBig, color: CONFIDENCE_COLORS[interpretation.confidence] }}>
//                     {interpretation.confidence}
//                   </p>
//                 </div>
//                 <div style={s.metricBlock}>
//                   <p style={s.metricLabel}>Data quality</p>
//                   <p style={{ ...s.metricBig, color: interpretation.data_quality === 'good' ? '#4ade80' : interpretation.data_quality === 'fair' ? '#fbbf24' : '#f87171' }}>
//                     {interpretation.data_quality}
//                   </p>
//                 </div>
//               </div>

//               <p style={s.confidenceReason}>{interpretation.confidence_reason}</p>
//             </div>

//             {/* What this means card */}
//             <div style={s.card}>
//               <div style={{ ...s.cardAccent, background: colors.accent }} />
//               <h2 style={s.cardTitle}>What this means</h2>
//               <p style={s.interpretText}>{interpretation.what_this_means}</p>
//               <div style={s.caveatBlock}>
//                 <p style={s.caveatLabel}>Important caveat</p>
//                 <p style={s.caveatText}>{interpretation.what_this_doesnt_mean}</p>
//               </div>
//             </div>

//             {/* Confounder flags */}
//             {interpretation.confounder_flags?.length > 0 && (
//               <div style={s.card}>
//                 <div style={{ ...s.cardAccent, background: colors.accent }} />
//                 <h2 style={s.cardTitle}>Things that may have affected results</h2>
//                 <div style={s.flagList}>
//                   {interpretation.confounder_flags.map((flag, i) => (
//                     <div key={i} style={s.flagRow}>
//                       <span style={s.flagDot}>⚠</span>
//                       <p style={s.flagText}>{flag}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Next steps */}
//             <div style={s.card}>
//               <div style={{ ...s.cardAccent, background: colors.accent }} />
//               <h2 style={s.cardTitle}>What to do next</h2>
//               <div style={s.nextStepList}>
//                 {interpretation.next_steps?.map((step, i) => (
//                   <div key={i} style={s.nextStepRow}>
//                     <span style={{ ...s.nextStepNum, color: colors.accent }}>{i + 1}</span>
//                     <p style={s.nextStepText}>{step}</p>
//                   </div>
//                 ))}
//               </div>

//               <div style={s.nextStepActions}>
//                 <button
//                   onClick={() => router.push('/intake')}
//                   style={{ ...s.primaryBtn, background: colors.accent, color: '#0a0a0a' }}
//                 >
//                   Start follow-up experiment
//                 </button>
//                 <button
//                   onClick={() => router.push('/dashboard')}
//                   style={s.ghostBtn}
//                 >
//                   Back to dashboard
//                 </button>
//               </div>
//             </div>

//             {/* Regenerate */}
//             <div style={s.regenRow}>
//               <button onClick={generateInterpretation} style={s.regenBtn}>
//                 ↻ Regenerate analysis
//               </button>
//             </div>
//           </>
//         )}

//       </main>

//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
//         * { box-sizing: border-box; margin: 0; padding: 0; }
//         button { cursor: pointer; font-family: 'DM Sans', sans-serif; }
//         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
//         @keyframes fadeUp {
//           from { opacity: 0; transform: translateY(12px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//       `}</style>
//     </div>
//   )
// }

// const s: Record<string, React.CSSProperties> = {
//   root: {
//     minHeight: '100vh',
//     background: '#080b12',
//     fontFamily: "'DM Sans', sans-serif",
//     color: '#ffffff',
//     position: 'relative',
//     overflowX: 'hidden',
//   },
//   orb: { position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 },
//   orbTop: { width: '600px', height: '600px', top: '-200px', right: '-100px' },
//   orbBottom: { width: '500px', height: '500px', bottom: '-150px', left: '-100px' },
//   loadingScreen: {
//     minHeight: '100vh', background: '#080b12',
//     display: 'flex', flexDirection: 'column',
//     alignItems: 'center', justifyContent: 'center', gap: '16px',
//   },
//   spinner: {
//     width: '28px', height: '28px',
//     border: '2px solid #ffffff0f',
//     borderTop: '2px solid #ffffff50',
//     borderRadius: '50%',
//     animation: 'spin 0.8s linear infinite',
//   },
//   loadingText: { color: '#ffffff30', fontSize: '13px' },
//   header: {
//     position: 'relative', zIndex: 10,
//     padding: '20px 24px 18px',
//     borderBottom: '1px solid #ffffff08',
//     background: 'rgba(8,11,18,0.88)',
//     backdropFilter: 'blur(20px)',
//     WebkitBackdropFilter: 'blur(20px)',
//   },
//   headerInner: {
//     maxWidth: '680px', margin: '0 auto',
//     display: 'flex', alignItems: 'center',
//     gap: '12px', marginBottom: '8px',
//   },
//   backBtn: {
//     background: 'none', border: 'none',
//     color: '#ffffff35', fontSize: '12px',
//     cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
//   },
//   headerLabel: {
//     fontSize: '10px', color: '#ffffff30',
//     textTransform: 'uppercase', letterSpacing: '0.1em',
//     marginBottom: '4px',
//   },
//   hypothesis: {
//     fontSize: '17px', fontWeight: 400,
//     color: '#ffffffee', lineHeight: 1.4,
//     letterSpacing: '-0.01em',
//   },
//   main: {
//     position: 'relative', zIndex: 10,
//     maxWidth: '680px', margin: '0 auto',
//     padding: '20px 24px', display: 'flex',
//     flexDirection: 'column', gap: '14px',
//   },
//   generatingCard: {
//     background: 'rgba(255,255,255,0.04)',
//     border: '1px solid rgba(255,255,255,0.08)',
//     borderRadius: '18px', padding: '28px 24px',
//   },
//   generatingInner: {
//     display: 'flex', alignItems: 'center', gap: '20px',
//   },
//   generatingTitle: {
//     fontSize: '15px', fontWeight: 500,
//     color: '#ffffffcc', marginBottom: '4px',
//   },
//   generatingSubtitle: {
//     fontSize: '13px', color: '#ffffff50', lineHeight: 1.5,
//   },
//   errorCard: {
//     background: '#ef444410',
//     border: '1px solid #ef444425',
//     borderRadius: '18px', padding: '24px',
//     display: 'flex', flexDirection: 'column', gap: '12px',
//   },
//   errorTitle: { fontSize: '14px', fontWeight: 500, color: '#fca5a5' },
//   errorText: { fontSize: '13px', color: '#ffffff60' },
//   card: {
//     position: 'relative',
//     background: 'rgba(255,255,255,0.055)',
//     backdropFilter: 'blur(24px)',
//     WebkitBackdropFilter: 'blur(24px)',
//     border: '1px solid rgba(255,255,255,0.1)',
//     borderRadius: '18px', padding: '22px',
//     overflow: 'hidden',
//     animation: 'fadeUp 0.4s ease forwards',
//   },
//   cardAccent: {
//     position: 'absolute', top: 0, left: 0, right: 0,
//     height: '2px', opacity: 0.65,
//   },
//   cardTitle: {
//     fontSize: '12px', fontWeight: 500,
//     color: '#ffffff80', letterSpacing: '0.02em',
//     textTransform: 'uppercase', marginBottom: '14px',
//   },
//   verdictBadge: {
//     display: 'inline-flex', alignItems: 'center',
//     gap: '7px', padding: '5px 12px',
//     borderRadius: '20px', marginBottom: '14px',
//   },
//   verdictIcon: { fontSize: '14px', fontWeight: 600 },
//   verdictLabel: { fontSize: '12px', fontWeight: 500, letterSpacing: '0.02em' },
//   headline: {
//     fontSize: '22px', fontWeight: 400,
//     color: '#ffffffee', lineHeight: 1.3,
//     letterSpacing: '-0.02em', marginBottom: '10px',
//   },
//   summary: {
//     fontSize: '14px', color: '#ffffff80',
//     lineHeight: 1.7, marginBottom: '20px',
//   },
//   scoreComparison: {
//     display: 'flex', alignItems: 'center',
//     gap: '16px', padding: '16px',
//     background: 'rgba(255,255,255,0.04)',
//     borderRadius: '12px', marginBottom: '12px',
//   },
//   scoreBlock: { flex: 1, textAlign: 'center' },
//   scoreLabel: { fontSize: '10px', color: '#ffffff35', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' },
//   scoreValue: {
//     fontSize: '28px', fontWeight: 300,
//     color: '#ffffffee', fontFamily: "'DM Mono', monospace",
//     letterSpacing: '-0.02em',
//   },
//   scoreDenom: { fontSize: '14px', color: '#ffffff25' },
//   scoreArrow: {
//     display: 'flex', flexDirection: 'column',
//     alignItems: 'center', gap: '2px',
//   },
//   scoreChange: {
//     fontSize: '16px', fontWeight: 500,
//     fontFamily: "'DM Mono', monospace",
//   },
//   cachedNote: { fontSize: '11px', color: '#ffffff25', marginTop: '4px' },
//   metricsRow: {
//     display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
//     gap: '12px', marginBottom: '14px',
//   },
//   metricBlock: {
//     background: 'rgba(255,255,255,0.04)',
//     borderRadius: '10px', padding: '12px',
//     textAlign: 'center',
//   },
//   metricLabel: { fontSize: '10px', color: '#ffffff35', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' },
//   metricBig: {
//     fontSize: '18px', fontWeight: 500,
//     fontFamily: "'DM Mono', monospace",
//     textTransform: 'capitalize',
//   },
//   confidenceReason: { fontSize: '13px', color: '#ffffff55', lineHeight: 1.6 },
//   interpretText: { fontSize: '14px', color: '#ffffffcc', lineHeight: 1.7, marginBottom: '16px' },
//   caveatBlock: {
//     background: 'rgba(255,255,255,0.04)',
//     border: '1px solid rgba(255,255,255,0.07)',
//     borderRadius: '10px', padding: '14px',
//   },
//   caveatLabel: { fontSize: '10px', color: '#ffffff30', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' },
//   caveatText: { fontSize: '13px', color: '#ffffff65', lineHeight: 1.6 },
//   flagList: { display: 'flex', flexDirection: 'column', gap: '10px' },
//   flagRow: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
//   flagDot: { fontSize: '12px', color: '#fbbf24', flexShrink: 0, marginTop: '1px' },
//   flagText: { fontSize: '13px', color: '#ffffff70', lineHeight: 1.5 },
//   nextStepList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
//   nextStepRow: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
//   nextStepNum: {
//     fontSize: '13px', fontWeight: 600,
//     fontFamily: "'DM Mono', monospace",
//     flexShrink: 0, marginTop: '1px',
//   },
//   nextStepText: { fontSize: '14px', color: '#ffffffcc', lineHeight: 1.6 },
//   nextStepActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
//   primaryBtn: {
//     border: 'none', borderRadius: '10px',
//     padding: '11px 20px', fontSize: '13px',
//     fontWeight: 500, cursor: 'pointer',
//   },
//   ghostBtn: {
//     background: 'rgba(255,255,255,0.05)',
//     border: '1px solid rgba(255,255,255,0.08)',
//     borderRadius: '10px', padding: '11px 20px',
//     fontSize: '13px', color: '#ffffff60', cursor: 'pointer',
//   },
//   regenRow: { display: 'flex', justifyContent: 'center', paddingBottom: '24px' },
//   regenBtn: {
//     background: 'transparent', border: 'none',
//     fontSize: '12px', color: '#ffffff25',
//     cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
//   },
// }


'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type Interpretation = {
  verdict: 'supported' | 'not_supported' | 'inconclusive'
  headline: string
  summary: string
  confidence: 'low' | 'moderate' | 'high'
  confidence_reason: string
  baseline_avg: number
  intervention_avg: number
  improvement: number
  improvement_pct: number
  adherence_rate: number
  data_quality: 'good' | 'fair' | 'poor'
  confounder_flags: string[]
  what_this_means: string
  what_this_doesnt_mean: string
  next_steps: string[]
}

type Trial = {
  id: string
  hypothesis_refined: string | null
  hypothesis_raw: string
  domain: string | null
  dependent_variable: string | null
  status: string
  concluded_at: string | null
  started_at: string | null
}

type DailyLog = {
  date: string
  phase: string
  primary_outcome: number | null
  adherence: boolean
}

const DOMAIN_COLORS: Record<string, { accent: string; from: string; to: string }> = {
  acne:      { accent: '#fb923c', from: '#c2410c', to: '#7c2d12' },
  sleep:     { accent: '#818cf8', from: '#1d4ed8', to: '#1e1b4b' },
  digestion: { accent: '#4ade80', from: '#15803d', to: '#14532d' },
  mood:      { accent: '#c084fc', from: '#7c3aed', to: '#2e1065' },
  energy:    { accent: '#fbbf24', from: '#b45309', to: '#451a03' },
  other:     { accent: '#2dd4bf', from: '#0f766e', to: '#042f2e' },
}

const VERDICT_CONFIG = {
  supported:     { icon: '✓', label: 'Hypothesis supported',     color: '#4ade80', bg: '#22c55e12', border: '#22c55e25' },
  not_supported: { icon: '○', label: 'Hypothesis not supported', color: '#f87171', bg: '#ef444412', border: '#ef444425' },
  inconclusive:  { icon: '◐', label: 'Inconclusive',             color: '#fbbf24', bg: '#f59e0b12', border: '#f59e0b25' },
}

const CONFIDENCE_COLORS = { high: '#4ade80', moderate: '#fbbf24', low: '#f87171' }

// =============================================================================
// MINI CHART — inline SVG, no library needed
// =============================================================================

function OutcomeChart({ logs, accent, baselineEnd }: {
  logs: DailyLog[]
  accent: string
  baselineEnd: number | null
}) {
  const validLogs = logs.filter(l => l.primary_outcome !== null)
  if (validLogs.length < 2) return (
    <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '12px', color: '#ffffff25' }}>Not enough data to chart yet</p>
    </div>
  )

  const W = 280
  const H = 120
  const PAD = { top: 12, right: 8, bottom: 24, left: 24 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const values = validLogs.map(l => l.primary_outcome as number)
  const minV = Math.max(0, Math.min(...values) - 1)
  const maxV = Math.min(10, Math.max(...values) + 1)

  const xScale = (i: number) => PAD.left + (i / (validLogs.length - 1)) * chartW
  const yScale = (v: number) => PAD.top + chartH - ((v - minV) / (maxV - minV)) * chartH

  const points = validLogs.map((l, i) => `${xScale(i)},${yScale(l.primary_outcome as number)}`).join(' ')
  const areaPoints = `${xScale(0)},${H - PAD.bottom} ${points} ${xScale(validLogs.length - 1)},${H - PAD.bottom}`

  // Baseline divider x position
  let baselineX: number | null = null
  if (baselineEnd !== null) {
    const idx = validLogs.findIndex((_, i) => i >= baselineEnd)
    if (idx > 0) baselineX = xScale(idx)
  }

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      {/* Y axis labels */}
      {[minV, Math.round((minV + maxV) / 2), maxV].map(v => (
        <text key={v} x={PAD.left - 4} y={yScale(v) + 4} textAnchor="end"
          style={{ fontSize: '9px', fill: '#ffffff25', fontFamily: 'DM Mono, monospace' }}>{Math.round(v)}</text>
      ))}

      {/* Grid lines */}
      {[minV, Math.round((minV + maxV) / 2), maxV].map(v => (
        <line key={v} x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)}
          stroke="#ffffff08" strokeWidth="1" />
      ))}

      {/* Baseline divider */}
      {baselineX && (
        <>
          <line x1={baselineX} y1={PAD.top} x2={baselineX} y2={H - PAD.bottom}
            stroke="#ffffff20" strokeWidth="1" strokeDasharray="3 2" />
          <text x={baselineX - 4} y={PAD.top + 8} textAnchor="end"
            style={{ fontSize: '8px', fill: '#ffffff30', fontFamily: 'DM Mono, monospace' }}>baseline</text>
          <text x={baselineX + 4} y={PAD.top + 8} textAnchor="start"
            style={{ fontSize: '8px', fill: '#ffffff30', fontFamily: 'DM Mono, monospace' }}>intervention</text>
        </>
      )}

      {/* Area fill */}
      <polygon points={areaPoints} fill={`${accent}15`} />

      {/* Line */}
      <polyline points={points} fill="none" stroke={accent} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {validLogs.map((l, i) => (
        <circle key={i} cx={xScale(i)} cy={yScale(l.primary_outcome as number)} r="2.5"
          fill={l.adherence ? accent : '#f87171'} />
      ))}

      {/* X axis — just first and last date */}
      <text x={PAD.left} y={H - 4} textAnchor="start"
        style={{ fontSize: '8px', fill: '#ffffff25', fontFamily: 'DM Mono, monospace' }}>
        {validLogs[0]?.date?.slice(5)}
      </text>
      <text x={W - PAD.right} y={H - 4} textAnchor="end"
        style={{ fontSize: '8px', fill: '#ffffff25', fontFamily: 'DM Mono, monospace' }}>
        {validLogs[validLogs.length - 1]?.date?.slice(5)}
      </text>
    </svg>
  )
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const trialId = params.id as string

  const [trial, setTrial] = useState<Trial | null>(null)
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [cached, setCached] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [concluding, setConcluding] = useState(false)

  useEffect(() => { loadData() }, [trialId])

  async function loadData() {
    const supabase = getSupabaseBrowserClient()
    const { data: trialData } = await supabase.from('trials').select('*').eq('id', trialId).single()
    if (!trialData) { router.push('/dashboard'); return }
    setTrial(trialData as Trial)

    const { data: logData } = await supabase
      .from('daily_logs').select('date, phase, primary_outcome, adherence')
      .eq('trial_id', trialId).order('date', { ascending: true })
    setLogs((logData || []) as DailyLog[])

    setLoading(false)
    generateInterpretation()
  }

  async function generateInterpretation() {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trialId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInterpretation(data.interpretation)
      setCached(data.cached)
    } catch (e: any) {
      setError(e.message || 'Failed to generate interpretation')
    }
    setGenerating(false)
  }

  async function concludeTrial() {
    setConcluding(true)
    const supabase = getSupabaseBrowserClient()
    await supabase.from('trials').update({
      status: 'concluded',
      concluded_at: new Date().toISOString(),
    }).eq('id', trialId)
    setTrial(prev => prev ? { ...prev, status: 'concluded' } : prev)
    setConcluding(false)
  }

  if (loading) {
    return (
      <div style={s.loadingScreen}>
        <div style={s.spinner} />
        <p style={s.loadingText}>Loading results...</p>
      </div>
    )
  }

  if (!trial) return null

  const domain = trial.domain || 'other'
  const colors = DOMAIN_COLORS[domain] || DOMAIN_COLORS.other
  const verdict = interpretation ? VERDICT_CONFIG[interpretation.verdict] : null
  const improvement = interpretation?.improvement || 0
  const isPositive = improvement > 0
  const isPreliminary = trial.status === 'active'

  // Find baseline/intervention split for chart
  const baselineEnd = logs.findIndex(l => l.phase === 'intervention')

  return (
    <div style={{ ...s.root, '--accent': colors.accent } as any}>

      <div style={{ ...s.orb, ...s.orbTop, background: `radial-gradient(circle, ${colors.from}50, transparent 70%)` }} />
      <div style={{ ...s.orb, ...s.orbBottom, background: `radial-gradient(circle, ${colors.to}40, transparent 70%)` }} />

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <button onClick={() => router.push(`/trial/${trialId}`)} style={s.backBtn}>← Trial</button>
          <button onClick={() => router.push('/dashboard')} style={s.backBtn}>Dashboard</button>
          {isPreliminary && (
            <span style={s.prelimBadge}>Preliminary</span>
          )}
        </div>
        <div style={s.headerInner}>
          <div>
            <p style={s.headerLabel}>Results</p>
            <h1 style={s.hypothesis}>{trial.hypothesis_refined || trial.hypothesis_raw}</h1>
          </div>
        </div>
        {isPreliminary && (
          <div style={s.headerInner}>
            <p style={s.prelimNote}>
              Your trial is still running — these are early findings based on {logs.length} days of data so far.
            </p>
          </div>
        )}
      </header>

      <main style={s.main}>

        {/* Generating */}
        {generating && (
          <div style={s.generatingCard}>
            <div style={s.generatingInner}>
              <div style={s.spinner} />
              <div>
                <p style={s.generatingTitle}>Analysing your data...</p>
                <p style={s.generatingSubtitle}>Reading your logs, checking confounders, building your report.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !generating && (
          <div style={s.errorCard}>
            <p style={s.errorTitle}>Couldn't generate interpretation</p>
            <p style={s.errorText}>{error}</p>
            <button onClick={generateInterpretation} style={{ ...s.primaryBtn, background: colors.accent, color: '#0a0a0a' }}>Try again</button>
          </div>
        )}

        {interpretation && !generating && (
          <>
            {/* Verdict + Chart side by side */}
            <div style={s.card}>
              <div style={{ ...s.cardAccent, background: colors.accent }} />

              <div style={s.splitRow}>

                {/* Left — verdict and scores */}
                <div style={s.splitLeft}>
                  {verdict && (
                    <div style={{ ...s.verdictBadge, background: verdict.bg, border: `1px solid ${verdict.border}` }}>
                      <span style={{ ...s.verdictIcon, color: verdict.color }}>{verdict.icon}</span>
                      <span style={{ ...s.verdictLabel, color: verdict.color }}>{verdict.label}</span>
                    </div>
                  )}

                  <h2 style={s.headline}>{interpretation.headline}</h2>

                  {/* Score comparison */}
                  <div style={s.scoreRow}>
                    <div style={s.scoreBlock}>
                      <p style={s.scoreLabel}>Baseline</p>
                      <p style={s.scoreVal}>{interpretation.baseline_avg?.toFixed(1)}<span style={s.scoreDenom}>/10</span></p>
                    </div>
                    <div style={s.scoreArrow}>
                      <span style={{ color: isPositive ? '#4ade80' : '#f87171', fontSize: '18px' }}>{isPositive ? '↑' : '↓'}</span>
                      <span style={{ ...s.scoreChange, color: isPositive ? '#4ade80' : '#f87171' }}>
                        {isPositive ? '+' : ''}{improvement.toFixed(1)}
                      </span>
                    </div>
                    <div style={s.scoreBlock}>
                      <p style={s.scoreLabel}>Intervention</p>
                      <p style={{ ...s.scoreVal, color: isPositive ? '#4ade80' : '#f87171' }}>
                        {interpretation.intervention_avg?.toFixed(1)}<span style={s.scoreDenom}>/10</span>
                      </p>
                    </div>
                  </div>

                  {/* Data quality pills */}
                  <div style={s.qualityRow}>
                    <span style={{ ...s.qualityPill, color: interpretation.adherence_rate >= 80 ? '#4ade80' : interpretation.adherence_rate >= 60 ? '#fbbf24' : '#f87171' }}>
                      {interpretation.adherence_rate}% adherence
                    </span>
                    <span style={{ ...s.qualityPill, color: CONFIDENCE_COLORS[interpretation.confidence] }}>
                      {interpretation.confidence} confidence
                    </span>
                    {cached && <span style={s.cachedPill}>↻ cached</span>}
                  </div>
                </div>

                {/* Right — chart */}
                <div style={s.splitRight}>
                  <p style={s.chartLabel}>{trial.dependent_variable || 'Primary outcome'} over time</p>
                  <OutcomeChart logs={logs} accent={colors.accent} baselineEnd={baselineEnd} />
                  <div style={s.chartLegend}>
                    <span style={s.legendItem}><span style={{ ...s.legendDot, background: colors.accent }} />logged</span>
                    <span style={s.legendItem}><span style={{ ...s.legendDot, background: '#f87171' }} />missed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={s.card}>
              <div style={{ ...s.cardAccent, background: colors.accent }} />
              <h2 style={s.cardTitle}>What your data shows</h2>
              <p style={s.summaryText}>{interpretation.summary}</p>
              <p style={s.confidenceReason}>{interpretation.confidence_reason}</p>
            </div>

            {/* Interpretation */}
            <div style={s.card}>
              <div style={{ ...s.cardAccent, background: colors.accent }} />
              <h2 style={s.cardTitle}>What this means</h2>
              <p style={s.interpretText}>{interpretation.what_this_means}</p>
              <div style={s.caveatBlock}>
                <p style={s.caveatLabel}>Important caveat</p>
                <p style={s.caveatText}>{interpretation.what_this_doesnt_mean}</p>
              </div>
            </div>

            {/* Confounder flags */}
            {interpretation.confounder_flags?.length > 0 && (
              <div style={s.card}>
                <div style={{ ...s.cardAccent, background: colors.accent }} />
                <h2 style={s.cardTitle}>Things that may have affected results</h2>
                <div style={s.flagList}>
                  {interpretation.confounder_flags.map((flag, i) => (
                    <div key={i} style={s.flagRow}>
                      <span style={s.flagDot}>⚠</span>
                      <p style={s.flagText}>{flag}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next steps */}
            <div style={s.card}>
              <div style={{ ...s.cardAccent, background: colors.accent }} />
              <h2 style={s.cardTitle}>What to do next</h2>
              <div style={s.nextStepList}>
                {interpretation.next_steps?.map((step, i) => (
                  <div key={i} style={s.nextStepRow}>
                    <span style={{ ...s.nextStepNum, color: colors.accent }}>{i + 1}</span>
                    <p style={s.nextStepText}>{step}</p>
                  </div>
                ))}
              </div>

              <div style={s.actions}>
                <button
                  onClick={() => router.push('/intake')}
                  style={{ ...s.primaryBtn, background: colors.accent, color: '#0a0a0a' }}
                >
                  Start follow-up experiment
                </button>
                <button onClick={() => router.push('/dashboard')} style={s.ghostBtn}>
                  Dashboard
                </button>
              </div>

              {/* Conclude — explicit user action only */}
              {trial.status === 'active' && (
                <div style={s.concludeSection}>
                  <p style={s.concludeHint}>Done collecting data? Wrap it up officially.</p>
                  <button onClick={concludeTrial} disabled={concluding} style={s.concludeBtn}>
                    {concluding ? 'Concluding...' : 'Conclude this trial'}
                  </button>
                </div>
              )}
            </div>

            {/* Regenerate */}
            <div style={s.regenRow}>
              <button onClick={generateInterpretation} style={s.regenBtn}>↻ Regenerate analysis</button>
            </div>
          </>
        )}

      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; font-family: 'DM Sans', sans-serif; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: '#080b12', fontFamily: "'DM Sans', sans-serif", color: '#ffffff', position: 'relative', overflowX: 'hidden' },
  orb: { position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 },
  orbTop: { width: '600px', height: '600px', top: '-200px', right: '-100px' },
  orbBottom: { width: '500px', height: '500px', bottom: '-150px', left: '-100px' },
  loadingScreen: { minHeight: '100vh', background: '#080b12', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' },
  spinner: { width: '28px', height: '28px', border: '2px solid #ffffff0f', borderTop: '2px solid #ffffff50', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: '#ffffff30', fontSize: '13px' },
  header: { position: 'relative', zIndex: 10, padding: '20px 24px 18px', borderBottom: '1px solid #ffffff08', background: 'rgba(8,11,18,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' },
  headerInner: { maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  backBtn: { background: 'none', border: 'none', color: '#ffffff35', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  prelimBadge: { marginLeft: 'auto', fontSize: '11px', color: '#fbbf24', background: '#f59e0b15', border: '1px solid #f59e0b30', borderRadius: '20px', padding: '3px 10px' },
  headerLabel: { fontSize: '10px', color: '#ffffff25', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' },
  hypothesis: { fontSize: '17px', fontWeight: 400, color: '#ffffffee', lineHeight: 1.4, letterSpacing: '-0.01em' },
  prelimNote: { fontSize: '12px', color: '#ffffff40', lineHeight: 1.5 },
  main: { position: 'relative', zIndex: 10, maxWidth: '680px', margin: '0 auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' },
  generatingCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '28px 24px' },
  generatingInner: { display: 'flex', alignItems: 'center', gap: '20px' },
  generatingTitle: { fontSize: '15px', fontWeight: 500, color: '#ffffffcc', marginBottom: '4px' },
  generatingSubtitle: { fontSize: '13px', color: '#ffffff50', lineHeight: 1.5 },
  errorCard: { background: '#ef444410', border: '1px solid #ef444425', borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' },
  errorTitle: { fontSize: '14px', fontWeight: 500, color: '#fca5a5' },
  errorText: { fontSize: '13px', color: '#ffffff60' },
  card: { position: 'relative', background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '22px', overflow: 'hidden', animation: 'fadeUp 0.4s ease forwards' },
  cardAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: '2px', opacity: 0.65 },
  cardTitle: { fontSize: '11px', fontWeight: 500, color: '#ffffff60', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px' },

  // Split layout
  splitRow: { display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' },
  splitLeft: { flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '12px' },
  splitRight: { flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '6px' },
  chartLabel: { fontSize: '10px', color: '#ffffff30', textTransform: 'uppercase', letterSpacing: '0.06em' },
  chartLegend: { display: 'flex', gap: '12px', marginTop: '4px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#ffffff35' },
  legendDot: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0 },

  verdictBadge: { display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '4px 10px', borderRadius: '20px' },
  verdictIcon: { fontSize: '13px', fontWeight: 600 },
  verdictLabel: { fontSize: '11px', fontWeight: 500, letterSpacing: '0.02em' },
  headline: { fontSize: '18px', fontWeight: 400, color: '#ffffffee', lineHeight: 1.3, letterSpacing: '-0.02em' },
  scoreRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' },
  scoreBlock: { flex: 1, textAlign: 'center' },
  scoreLabel: { fontSize: '9px', color: '#ffffff30', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' },
  scoreVal: { fontSize: '22px', fontWeight: 300, color: '#ffffffee', fontFamily: "'DM Mono', monospace", letterSpacing: '-0.02em' },
  scoreDenom: { fontSize: '12px', color: '#ffffff25' },
  scoreArrow: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  scoreChange: { fontSize: '14px', fontWeight: 500, fontFamily: "'DM Mono', monospace" },
  qualityRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  qualityPill: { fontSize: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '3px 10px' },
  cachedPill: { fontSize: '11px', color: '#ffffff25', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '3px 10px' },

  summaryText: { fontSize: '14px', color: '#ffffffcc', lineHeight: 1.7, marginBottom: '10px' },
  confidenceReason: { fontSize: '12px', color: '#ffffff45', lineHeight: 1.6 },
  interpretText: { fontSize: '14px', color: '#ffffffcc', lineHeight: 1.7, marginBottom: '14px' },
  caveatBlock: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '14px' },
  caveatLabel: { fontSize: '10px', color: '#ffffff30', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' },
  caveatText: { fontSize: '13px', color: '#ffffff65', lineHeight: 1.6 },
  flagList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  flagRow: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
  flagDot: { fontSize: '12px', color: '#fbbf24', flexShrink: 0, marginTop: '1px' },
  flagText: { fontSize: '13px', color: '#ffffff70', lineHeight: 1.5 },
  nextStepList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
  nextStepRow: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  nextStepNum: { fontSize: '13px', fontWeight: 600, fontFamily: "'DM Mono', monospace", flexShrink: 0, marginTop: '1px' },
  nextStepText: { fontSize: '14px', color: '#ffffffcc', lineHeight: 1.6 },
  actions: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '0' },
  primaryBtn: { border: 'none', borderRadius: '10px', padding: '11px 20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' },
  ghostBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '11px 20px', fontSize: '13px', color: '#ffffff60', cursor: 'pointer' },
  concludeSection: { marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
  concludeHint: { fontSize: '12px', color: '#ffffff30' },
  concludeBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', color: '#ffffff40', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 },
  regenRow: { display: 'flex', justifyContent: 'center', paddingBottom: '24px' },
  regenBtn: { background: 'transparent', border: 'none', fontSize: '12px', color: '#ffffff20', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
}