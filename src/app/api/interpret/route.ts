import Anthropic from '@anthropic-ai/sdk'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const INTERPRET_SYSTEM_PROMPT = `You are a personal health experiment analyst — the same research buddy who helped design the trial. Your job is to look at the data honestly and tell the user what it actually shows.

Your voice: warm, direct, honest. You celebrate real signals. You don't oversell weak data. You're the friend who tells you the truth kindly.

ANALYSIS RULES:
- Compare baseline average vs intervention average
- Flag any high-severity confounder periods and note their potential impact
- Assess data quality based on adherence rate and number of data points
- Set confidence based on: sample size, adherence rate, effect size, confounder noise
- Never claim causation. Use "associated with", "your data suggests", "it looks like"
- If data is inconclusive, say so clearly and explain why — that's still useful information
- Always end with actionable next steps

CONFIDENCE LEVELS:
high: 14+ data points per phase, >80% adherence, clear effect (3+ points), low confounder noise
moderate: 10+ data points, 60-80% adherence, some effect (1.5-3 points), some noise
low: <10 data points, <60% adherence, weak effect (<1.5 points), or high confounder noise

LANGUAGE RULES — never violate:
Never say: "proves", "causes", "diagnoses", "you have [condition]"
Always say: "suggests", "associated with", "it looks like", "your data shows"
Never recommend medication changes. Always suggest discussing notable findings with a doctor.

OUTPUT — return ONLY this JSON, no text before or after:
{
  "verdict": "supported|not_supported|inconclusive",
  "headline": "one punchy plain-language finding, max 12 words",
  "summary": "2-3 sentence honest plain-language summary of what the data shows",
  "confidence": "low|moderate|high",
  "confidence_reason": "one sentence explaining why this confidence level",
  "baseline_avg": 0.0,
  "intervention_avg": 0.0,
  "improvement": 0.0,
  "improvement_pct": 0.0,
  "adherence_rate": 0,
  "data_quality": "good|fair|poor",
  "confounder_flags": ["any notable confounder periods that may have affected results"],
  "what_this_means": "one plain sentence — the most honest interpretation",
  "what_this_doesnt_mean": "one plain sentence — the most important caveat",
  "next_steps": ["specific actionable suggestion 1", "specific actionable suggestion 2"]
}`

function buildInterpretationBriefing(trial: any, logs: any[], events: any[]): string {
  const baselineLogs = logs.filter(l => l.phase === 'baseline' && l.primary_outcome !== null)
  const interventionLogs = logs.filter(l => l.phase === 'intervention' && l.primary_outcome !== null)

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null

  const baselineAvg = avg(baselineLogs.map(l => parseFloat(l.primary_outcome)))
  const interventionAvg = avg(interventionLogs.map(l => parseFloat(l.primary_outcome)))
  const improvement = baselineAvg !== null && interventionAvg !== null
    ? Math.round((interventionAvg - baselineAvg) * 10) / 10
    : null

  const totalLogs = logs.length
  const adherentLogs = logs.filter(l => l.adherence).length
  const adherenceRate = totalLogs > 0 ? Math.round((adherentLogs / totalLogs) * 100) : 0

  const highSeverityEvents = events.filter(e =>
    e.type === 'flag_confounder' && e.payload?.severity === 'high'
  )

  const activeVersion = trial.protocol?.versions?.find(
    (v: any) => v.version === trial.protocol?.active_version
  )

  return `
TRIAL SUMMARY
─────────────
Hypothesis: ${trial.hypothesis_refined || trial.hypothesis_raw}
Domain: ${trial.domain}
Independent variable: ${trial.independent_variable}
Dependent variable: ${trial.dependent_variable}
Success criteria: ${activeVersion?.success_criteria || 'Not defined'}
Intervention: ${activeVersion?.intervention_definition || 'Not defined'}

DATA SUMMARY
─────────────
Baseline data points: ${baselineLogs.length}
Intervention data points: ${interventionLogs.length}
Baseline average score: ${baselineAvg !== null ? baselineAvg.toFixed(1) : 'No data'}
Intervention average score: ${interventionAvg !== null ? interventionAvg.toFixed(1) : 'No data'}
Change: ${improvement !== null ? (improvement > 0 ? '+' : '') + improvement : 'Cannot calculate'}
Overall adherence rate: ${adherenceRate}%

BASELINE DAILY SCORES (chronological):
${baselineLogs.map(l => `${l.date}: ${l.primary_outcome} (adherence: ${l.adherence ? 'yes' : 'no'})`).join('\n') || 'No baseline data'}

INTERVENTION DAILY SCORES (chronological):
${interventionLogs.map(l => `${l.date}: ${l.primary_outcome} (adherence: ${l.adherence ? 'yes' : 'no'})`).join('\n') || 'No intervention data'}

CONFOUNDER FLAGS:
${highSeverityEvents.map(e => `${e.timestamp}: ${e.payload?.factor} (${e.payload?.severity})`).join('\n') || 'No high-severity flags'}

AGENT OBSERVATIONS DURING TRIAL:
${events.filter(e => e.type === 'send_insight').slice(0, 5).map(e => `- ${e.payload?.message}`).join('\n') || 'None'}
`.trim()
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { trialId } = await request.json()
    if (!trialId) {
      return NextResponse.json({ error: 'trialId is required' }, { status: 400 })
    }

    const serviceClient = createServiceClient()

    // Check for cached interpretation
    const { data: cachedEvent } = await serviceClient
      .from('trial_events')
      .select('*')
      .eq('trial_id', trialId)
      .eq('type', 'conclude_trial')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (cachedEvent?.payload?.interpretation) {
      return NextResponse.json({
        interpretation: cachedEvent.payload.interpretation,
        cached: true,
      })
    }

    // Fetch trial data
    const { data: trial } = await serviceClient
      .from('trials').select('*').eq('id', trialId).single()

    if (!trial) {
      return NextResponse.json({ error: 'Trial not found' }, { status: 404 })
    }

    // Fetch all logs
    const { data: logs } = await serviceClient
      .from('daily_logs').select('*')
      .eq('trial_id', trialId)
      .order('date', { ascending: true })

    // Fetch all events
    const { data: events } = await serviceClient
      .from('trial_events').select('*')
      .eq('trial_id', trialId)
      .order('timestamp', { ascending: false })

    const briefing = buildInterpretationBriefing(trial, logs || [], events || [])

    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: INTERPRET_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: briefing }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    let interpretation: any = null
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) interpretation = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json({ error: 'Failed to parse interpretation' }, { status: 500 })
    }

    // Cache the interpretation in trial_events
    await serviceClient.from('trial_events').insert({
      trial_id: trialId,
      user_id: user.id,
      type: 'conclude_trial',
      payload: { interpretation, message: interpretation.headline },
      visible: true,
    })

    // Mark trial as concluded if not already
    if (trial.status !== 'concluded') {
      await serviceClient.from('trials').update({
        status: 'concluded',
        concluded_at: new Date().toISOString(),
      }).eq('id', trialId)
    }

    return NextResponse.json({ interpretation, cached: false })

  } catch (error: any) {
    console.error('Interpret API error:', error)
    return NextResponse.json(
      { error: error?.message || 'Interpretation failed' },
      { status: 500 }
    )
  }
}