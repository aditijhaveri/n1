// =============================================================================
// N=1 — Database Types
// Mirrors the Supabase schema exactly. Pass `Database` to createClient<Database>()
// =============================================================================

// ---------------------------------------------------------------------------
// Domain primitives
// ---------------------------------------------------------------------------

export type TrialStatus   = 'intake' | 'active' | 'paused' | 'concluded' | 'abandoned'
export type RiskTier      = 'green' | 'yellow' | 'red'
export type Domain        = 'acne' | 'sleep' | 'digestion' | 'mood' | 'energy' | 'other'
export type Phase         = 'baseline' | 'intervention' | 'crossover' | 'washout'
export type TrialEventType =
  | 'request_log'
  | 'flag_confounder'
  | 'send_insight'
  | 'adjust_protocol'
  | 'conclude_trial'
  | 'propose_followup'
  | 'intake_complete'
  | 'phase_transition'
  | 'adherence_warning'
  | 'pause_requested'
  | 'pause_lifted'
  | 'protocol_revised'
  | 'trial_abandoned'
  | 'user_message'

// ---------------------------------------------------------------------------
// Protocol JSONB structure
// Stored in trials.protocol — versioned so mid-trial revisions
// don't corrupt pre-revision data.
// ---------------------------------------------------------------------------

export interface ProtocolPhase {
  name: Phase
  duration_days: number
  instructions: string
}

export type ProtocolRevisionReason = 'initial' | 'adherence_revision' | 'design_revision'

export interface ProtocolVersion {
  version: number
  created_at: string           // ISO timestamptz
  reason: ProtocolRevisionReason
  revision_note: string | null // null for version 1
  intervention_definition: string
  measurement_instructions: string
  success_criteria: string
  washout_needed: boolean
  phases: ProtocolPhase[]
}

export interface Protocol {
  active_version: number
  versions: ProtocolVersion[]
}

// ---------------------------------------------------------------------------
// Confounder JSONB structure
// Keys mirror the trials.confounders string array.
// Values are flexible — numeric scores, booleans, or named strings.
// ---------------------------------------------------------------------------

export type ConfounderValue = number | boolean | string | null

export type ConfounderLog = Record<string, ConfounderValue>

// ---------------------------------------------------------------------------
// Table row types
// ---------------------------------------------------------------------------

export interface ProfileRow {
  id: string           // uuid — references auth.users
  timezone: string     // IANA timezone e.g. "America/New_York"
  created_at: string   // ISO timestamptz
}

export interface TrialRow {
  id: string
  user_id: string
  status: TrialStatus

  hypothesis_raw: string
  hypothesis_refined: string | null
  independent_variable: string | null
  dependent_variable: string | null
  expected_lag_days: number | null
  domain: Domain | null
  risk_tier: RiskTier

  protocol: Protocol            // typed JSONB
  confounders: string[]

  created_at: string
  intake_completed_at: string | null
  started_at: string | null
  expected_end_date: string | null   // ISO date
  concluded_at: string | null
}

export interface DailyLogRow {
  id: string
  trial_id: string
  user_id: string
  date: string              // ISO date e.g. "2026-03-22"
  phase: Phase
  protocol_version: number

  adherence: boolean
  primary_outcome: number | null   // numeric(5,2)
  confounders: ConfounderLog       // typed JSONB
  notes: string | null
  submitted_at: string
}

export interface TrialEventRow {
  id: string
  trial_id: string
  user_id: string
  timestamp: string
  type: TrialEventType
  payload: TrialEventPayload   // typed JSONB — see below
  visible: boolean
}

// ---------------------------------------------------------------------------
// Trial event payload types (per event type)
// ---------------------------------------------------------------------------

export interface RequestLogPayload {
  fields: string[]             // confounder keys to request
  message: string              // agent message shown to user
}

export interface FlagConfounderPayload {
  date: string
  factor: string
  severity: 'low' | 'medium' | 'high'
  note: string
}

export interface SendInsightPayload {
  message: string
}

export interface AdjustProtocolPayload {
  proposed_change: string
  reason: string
  awaiting_approval: boolean
}

export interface ConcludeTrialPayload {
  findings: string
  confidence: 'low' | 'moderate' | 'high'
  effect_observed: boolean
  recommended_followup: string | null
}

export interface ProposeFollowupPayload {
  hypothesis: string
  rationale: string
}

export interface ProtocolRevisedPayload {
  from_version: number
  to_version: number
  reason: string
  revision_note: string
}

export interface AdherenceWarningPayload {
  adherence_7d_pct: number
  consecutive_missed: number
  message: string
}

export interface PhaseTransitionPayload {
  from_phase: Phase
  to_phase: Phase
  day: number
}

export type TrialEventPayload =
  | RequestLogPayload
  | FlagConfounderPayload
  | SendInsightPayload
  | AdjustProtocolPayload
  | ConcludeTrialPayload
  | ProposeFollowupPayload
  | ProtocolRevisedPayload
  | AdherenceWarningPayload
  | PhaseTransitionPayload
  | Record<string, unknown>   // fallback for simple event types

// ---------------------------------------------------------------------------
// Trial briefing — returned by get_trial_briefing() DB function
// This is what gets injected into every LLM call.
// ---------------------------------------------------------------------------

export interface TrialBriefing {
  trial_id: string
  status: TrialStatus
  domain: Domain | null
  hypothesis_refined: string | null
  independent_variable: string | null
  dependent_variable: string | null
  expected_lag_days: number | null
  confounders: string[]
  active_protocol: ProtocolVersion | null
  started_at: string | null
  expected_end_date: string | null
  adherence_7d_pct: number | null
  recent_logs: Pick<DailyLogRow, 'date' | 'phase' | 'protocol_version' | 'adherence' | 'primary_outcome' | 'confounders' | 'notes'>[]
  recent_events: Pick<TrialEventRow, 'timestamp' | 'type' | 'payload'>[]
  current_date: string
}

// ---------------------------------------------------------------------------
// Intake object — the structured output the intake agent builds
// through conversation. Populated progressively; ready_to_protocol
// must be true before a Trial is created.
// ---------------------------------------------------------------------------

export interface IntakeObject {
  hypothesis_raw: string
  hypothesis_refined: string | null
  independent_variable: string | null
  dependent_variable: string | null

  subject_context: {
    symptom_duration: string | null
    prior_experiments: string | null
    relevant_history: string | null
  }

  intervention: {
    definition: string | null
    feasibility: boolean | null
    washout_needed: boolean | null
  }

  outcome: {
    primary_measure: string | null
    measurement_method: string | null
    expected_lag_days: number | null
  }

  domain: Domain | null
  risk_tier: RiskTier
  confounders: string[]
  success_criteria: string | null
  ready_to_protocol: boolean
}

// ---------------------------------------------------------------------------
// Supabase Database type — pass to createClient<Database>()
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Omit<ProfileRow, 'created_at'> & { created_at?: string }
        Update: Partial<Omit<ProfileRow, 'id'>>
      }
      trials: {
        Row: TrialRow
        Insert: Omit<TrialRow,
          | 'id'
          | 'created_at'
          | 'intake_completed_at'
          | 'started_at'
          | 'expected_end_date'
          | 'concluded_at'
        > & {
          id?: string
          created_at?: string
          intake_completed_at?: string | null
          started_at?: string | null
          expected_end_date?: string | null
          concluded_at?: string | null
        }
        Update: Partial<Omit<TrialRow, 'id' | 'user_id' | 'created_at'>>
      }
      daily_logs: {
        Row: DailyLogRow
        Insert: Omit<DailyLogRow, 'id' | 'submitted_at'> & {
          id?: string
          submitted_at?: string
        }
        Update: never   // logs are immutable once submitted
      }
      trial_events: {
        Row: TrialEventRow
        Insert: Omit<TrialEventRow, 'id' | 'timestamp'> & {
          id?: string
          timestamp?: string
        }
        Update: never   // events are append-only
      }
    }
    Functions: {
      get_trial_briefing: {
        Args: { p_trial_id: string }
        Returns: TrialBriefing
      }
    }
    Enums: {}
  }
}