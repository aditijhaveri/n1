import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MONITOR_SYSTEM_PROMPT = `You are an autonomous clinical trial monitoring agent.

You are given the current state of a personal health experiment. 
Your job is to assess the state and decide on exactly ONE action 
to take. You are running daily — the user has not asked you anything. 
You are acting on their behalf as their trial coordinator.

DECISION LOGIC — follow this priority order:

1. If no log has been submitted today and the trial is active:
   → action: request_log
   → message: a warm, brief reminder to log today's data

2. If 7-day adherence is below 60% and 3+ days missed recently:
   → action: adherence_warning
   → message: a concerned but non-judgmental observation, 
     ask what's making it hard

3. If a high-severity confounder was flagged in the last 3 days:
   → action: send_insight
   → message: note the confounder spike and what it might mean 
     for interpreting data from those days

4. If the primary outcome shows a clear directional trend 
   over the last 7+ days (consistently improving or worsening):
   → action: send_insight
   → message: describe the trend you observe, with appropriate 
     epistemic humility — "your data suggests" not "this proves"

5. If the current phase duration is complete:
   → action: phase_transition
   → message: announce the phase change and what comes next

6. If all phases are complete and there are 14+ data points 
   per phase:
   → action: conclude_trial
   → message: signal that enough data exists to interpret results

7. If nothing significant to report:
   → action: none
   → message: null

LANGUAGE RULES — never violate:
- Never claim causation. Use "associated with", "your data suggests"
- Never diagnose. Never say "you have [condition]"
- Always frame results as personal observations, not medical facts
- Be warm and direct. Not clinical. Not cheerful.
- Keep messages concise — 2-4 sentences maximum

OUTPUT FORMAT — return only this JSON, nothing else:
{
  "action": "request_log|adherence_warning|send_insight|phase_transition|conclude_trial|none",
  "message": "the message to show the user, or null if action is none",
  "payload": {}
}`

function buildTrialBriefing(trial: any, logs: any[], events: any[]): string {
  const today = new Date().toISOString().split('T')[0]
  const todayLog = logs.find(l => l.date === today)
  const recentLogs = logs.slice(0, 7)

  const adherence7d = recentLogs.length > 0
    ? Math.round((recentLogs.filter(l => l.adherence).length / recentLogs.length) * 100)
    : null

  const consecutiveMissed = (() => {
    let count = 0
    for (const log of recentLogs) {
      if (!log.adherence) count++
      else break
    }
    return count
  })()

  const activeVersion = trial.protocol?.versions?.find(
    (v: any) => v.version === trial.protocol?.active_version
  )

  const currentPhase = (() => {
    if (!trial.started_at || !activeVersion?.phases) return null
    const started = new Date(trial.started_at)
    const daysSinceStart = Math.floor((Date.now() - started.getTime()) / 86400000)
    let dayCount = 0
    for (const phase of activeVersion.phases) {
      if (daysSinceStart < dayCount + phase.duration_days) {
        return { name: phase.name, day: daysSinceStart - dayCount + 1, totalDays: phase.duration_days }
      }
      dayCount += phase.duration_days
    }
    return null
  })()

  const outcomeValues = recentLogs
    .filter(l => l.primary_outcome !== null)
    .map(l => l.primary_outcome)

  return `
TRIAL STATE
-----------
Trial ID:             ${trial.id}
Status:               ${trial.status}
Domain:               ${trial.domain}
Hypothesis:           ${trial.hypothesis_refined || trial.hypothesis_raw}
Independent variable: ${trial.independent_variable}
Dependent variable:   ${trial.dependent_variable}
Today's date:         ${today}
Log submitted today:  ${todayLog ? 'YES' : 'NO'}

CURRENT PHASE
-------------
${currentPhase
  ? `Phase: ${currentPhase.name} (day ${currentPhase.day} of ${currentPhase.totalDays})`
  : 'No active phase (trial may not have started)'}

ADHERENCE (last 7 days)
-----------------------
Rate:               ${adherence7d !== null ? `${adherence7d}%` : 'No data yet'}
Consecutive missed: ${consecutiveMissed} days

PRIMARY OUTCOME TREND (last 7 days)
------------------------------------
Values (newest first): ${outcomeValues.length > 0 ? outcomeValues.join(', ') : 'No data yet'}

RECENT AGENT EVENTS (last 5)
-----------------------------
${events.slice(0, 5).map(e => `[${e.timestamp}] ${e.type}: ${JSON.stringify(e.payload)}`).join('\n') || 'None'}

INTERVENTION DEFINITION
-----------------------
${activeVersion?.intervention_definition || 'Not defined'}
`.trim()
}
export async function POST(request: NextRequest) {
  console.log('Monitor triggered at', new Date().toISOString())
  try {
    const isDev = process.env.NODE_ENV === 'development'
    if (!isDev) {
      const authHeader = request.headers.get('authorization')
      const cronSecret = process.env.CRON_SECRET
      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
// export async function POST(request: NextRequest) {
//   try {
//     // Verify the request is from our cron secret or internal
//     // In development, skip auth check
// // In production, verify cron secret
// const isDev = process.env.NODE_ENV === 'development'
// if (!isDev) {
//   const authHeader = request.headers.get('authorization')
//   const cronSecret = process.env.CRON_SECRET
//   if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }
// }

    const serviceClient = createServiceClient()

    // Get all active trials
    const { data: trials, error: trialsError } = await serviceClient
      .from('trials')
      .select('*')
      .eq('status', 'active')

    if (trialsError) throw trialsError
    if (!trials || trials.length === 0) {
      return NextResponse.json({ message: 'No active trials', processed: 0 })
    }

    const results = []

    for (const trial of trials) {
      try {
        // Fetch recent logs for this trial
        const { data: logs } = await serviceClient
          .from('daily_logs')
          .select('*')
          .eq('trial_id', trial.id)
          .order('date', { ascending: false })
          .limit(14)

        // Fetch recent visible events
        const { data: events } = await serviceClient
          .from('trial_events')
          .select('*')
          .eq('trial_id', trial.id)
          .eq('visible', true)
          .order('timestamp', { ascending: false })
          .limit(10)

        // Build the trial briefing
        const briefing = buildTrialBriefing(trial, logs || [], events || [])

        // Call Claude
        const response = await anthropic.messages.create({
          model: 'claude-opus-4-5',
          max_tokens: 512,
          system: MONITOR_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: briefing }],
        })

        const text = response.content[0].type === 'text' ? response.content[0].text : ''

        // Parse the action
        // let agentDecision: any = { action: 'none', message: null, payload: {} }
        // try {
        //   const jsonMatch = text.match(/\{[\s\S]*\}/)
        //   if (jsonMatch) agentDecision = JSON.parse(jsonMatch[0])
        // } catch {
        //   console.error('Failed to parse agent decision for trial', trial.id)
        // }
        let agentDecision: any = { action: 'none', message: null, payload: {} }
try {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) agentDecision = JSON.parse(jsonMatch[0])
} catch {
  console.error('Failed to parse agent decision for trial', trial.id)
}
console.log('Agent raw response:', text)
console.log('Agent decision:', JSON.stringify(agentDecision))

        // Execute the action
        if (agentDecision.action !== 'none' && agentDecision.message) {

          // Handle phase transition
          if (agentDecision.action === 'phase_transition') {
            const activeVersion = trial.protocol?.versions?.find(
              (v: any) => v.version === trial.protocol?.active_version
            )
            const phases = activeVersion?.phases || []
            const started = new Date(trial.started_at)
            const daysSinceStart = Math.floor((Date.now() - started.getTime()) / 86400000)
            let dayCount = 0
            let nextPhase = null
            let currentPhaseName = null
            for (let i = 0; i < phases.length; i++) {
              if (daysSinceStart < dayCount + phases[i].duration_days) {
                currentPhaseName = phases[i].name
                nextPhase = phases[i + 1] || null
                break
              }
              dayCount += phases[i].duration_days
            }
            agentDecision.payload = { from_phase: currentPhaseName, to_phase: nextPhase?.name }
          }

          // Handle trial conclusion
          if (agentDecision.action === 'conclude_trial') {
            await serviceClient
              .from('trials')
              .update({ status: 'concluded', concluded_at: new Date().toISOString() })
              .eq('id', trial.id)
          }

          // Record the event
          await serviceClient
            .from('trial_events')
            .insert({
              trial_id: trial.id,
              user_id: trial.user_id,
              type: agentDecision.action === 'adherence_warning'
                ? 'adherence_warning'
                : agentDecision.action === 'phase_transition'
                ? 'phase_transition'
                : agentDecision.action === 'conclude_trial'
                ? 'conclude_trial'
                : 'send_insight',
              payload: {
                message: agentDecision.message,
                ...agentDecision.payload,
              },
              visible: true,
            })
        }

        results.push({
          trial_id: trial.id,
          action: agentDecision.action,
          success: true,
        })

      } catch (trialError) {
        console.error(`Error processing trial ${trial.id}:`, trialError)
        results.push({ trial_id: trial.id, action: 'error', success: false })
      }
    }

    return NextResponse.json({ processed: trials.length, results })

  } catch (error: any) {
    console.error('Monitor API error full:', error)
    return NextResponse.json(
      { error: error?.message || 'Monitor failed', stack: error?.stack },
      { status: 500 }
    )
  }
}