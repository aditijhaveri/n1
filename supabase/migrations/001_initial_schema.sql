-- =============================================================================
-- N=1 Personal Clinical Trial Agent — Initial Schema
-- =============================================================================
-- Run this file in the Supabase SQL editor or via the Supabase CLI.
-- All statements are idempotent where possible.
-- =============================================================================

-- Enable UUID generation (required for gen_random_uuid())
create extension if not exists "pgcrypto";


-- =============================================================================
-- PROFILES
-- Auto-created when a user signs up via auth.users trigger.
-- Stores user preferences — timezone is critical for daily cron timing.
-- =============================================================================

create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  timezone    text not null default 'UTC',
  created_at  timestamptz not null default now()
);

-- Trigger: auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, timezone)
  values (new.id, 'UTC')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =============================================================================
-- TRIALS
-- The core experiment record. Created during intake, mostly immutable
-- after the user approves the protocol.
--
-- protocol JSONB structure:
-- {
--   "active_version": 1,
--   "versions": [
--     {
--       "version": 1,
--       "created_at": "2026-03-01T00:00:00Z",
--       "reason": "initial",
--       "revision_note": null,
--       "intervention_definition": "No refined sugar or high-GI foods",
--       "measurement_instructions": "Photo daily, same lighting, same angle, 8am",
--       "success_criteria": "30% reduction in active lesion count over 6 weeks",
--       "washout_needed": false,
--       "phases": [
--         { "name": "baseline", "duration_days": 14, "instructions": "..." },
--         { "name": "intervention", "duration_days": 42, "instructions": "..." }
--       ]
--     }
--   ]
-- }
-- =============================================================================

create table if not exists public.trials (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users not null,

  status                text not null default 'intake'
                        check (status in ('intake','active','paused','concluded','abandoned')),

  -- Hypothesis fields (populated progressively during intake)
  hypothesis_raw        text not null,
  hypothesis_refined    text,
  independent_variable  text,
  dependent_variable    text,
  expected_lag_days     int,
  domain                text
                        check (domain in ('acne','sleep','digestion','mood','energy','other')),
  risk_tier             text not null default 'green'
                        check (risk_tier in ('green','yellow','red')),

  -- Protocol stored as versioned JSONB (see structure above)
  -- Versioning is essential: a mid-trial revision creates a new version
  -- so pre- and post-revision data can be analysed separately.
  protocol              jsonb not null default '{}',

  -- Confounder list drives the daily log form fields.
  -- e.g. '{"stress","sleep_hours","hormonal_cycle","alcohol"}'
  confounders           text[] not null default '{}',

  -- Timestamps
  created_at            timestamptz not null default now(),
  intake_completed_at   timestamptz,
  started_at            timestamptz,   -- set when user approves protocol
  expected_end_date     date,
  concluded_at          timestamptz
);

create index if not exists trials_user_id_idx on public.trials (user_id);
create index if not exists trials_status_idx  on public.trials (status);


-- =============================================================================
-- DAILY LOGS
-- One row per day per trial. The raw time-series data the interpretation
-- agent reasons over. Immutable once submitted.
--
-- confounders JSONB structure (keys mirror trials.confounders array):
-- {
--   "stress": 3,
--   "sleep_hours": 7.5,
--   "hormonal_cycle": "luteal",
--   "alcohol": false
-- }
-- =============================================================================

create table if not exists public.daily_logs (
  id                uuid primary key default gen_random_uuid(),
  trial_id          uuid references public.trials on delete cascade not null,
  user_id           uuid references auth.users not null,  -- denormalized for RLS
  date              date not null,
  phase             text not null
                    check (phase in ('baseline','intervention','crossover','washout')),

  -- Records the active protocol version at log time.
  -- Prevents mixing pre- and post-revision data in interpretation.
  protocol_version  int not null default 1,

  adherence         boolean not null,         -- did user follow the protocol today?
  primary_outcome   numeric(5,2),             -- the dependent variable score (e.g. 1.00–10.00)
  confounders       jsonb not null default '{}',
  notes             text,
  submitted_at      timestamptz not null default now(),

  -- One log per day per trial — enforced at DB level
  unique (trial_id, date)
);

create index if not exists daily_logs_trial_id_idx on public.daily_logs (trial_id);
create index if not exists daily_logs_date_idx     on public.daily_logs (date);
create index if not exists daily_logs_user_id_idx  on public.daily_logs (user_id);


-- =============================================================================
-- TRIAL EVENTS
-- Append-only agent memory and audit trail. Every action the agent takes
-- is recorded here. The last N events are injected into every LLM call
-- as the agent's "memory" — the agent has no persistent conversation thread.
--
-- Client gets SELECT only. All inserts are server-side via service role.
-- This makes the event log trustworthy and tamper-proof from the client.
--
-- payload JSONB examples by type:
--   send_insight:     { "message": "Adherence dropped below 70% this week..." }
--   flag_confounder:  { "date": "2026-03-15", "factor": "stress", "severity": "high" }
--   conclude_trial:   { "findings": {...}, "confidence": "moderate" }
--   protocol_revised: { "from_version": 1, "to_version": 2, "reason": "..." }
-- =============================================================================

create table if not exists public.trial_events (
  id          uuid primary key default gen_random_uuid(),
  trial_id    uuid references public.trials on delete cascade not null,
  user_id     uuid references auth.users not null,  -- denormalized for RLS
  timestamp   timestamptz not null default now(),

  type        text not null check (type in (
                'request_log',
                'flag_confounder',
                'send_insight',
                'adjust_protocol',
                'conclude_trial',
                'propose_followup',
                'intake_complete',
                'phase_transition',
                'adherence_warning',
                'pause_requested',
                'pause_lifted',
                'protocol_revised',
                'trial_abandoned',
                'user_message'
              )),

  payload     jsonb not null default '{}',

  -- visible=false for internal agent decisions (e.g. sufficiency checks).
  -- Only visible=true events appear in the user's feed.
  visible     boolean not null default true
);

create index if not exists trial_events_trial_id_idx  on public.trial_events (trial_id);
create index if not exists trial_events_timestamp_idx on public.trial_events (timestamp);
create index if not exists trial_events_user_id_idx   on public.trial_events (user_id);


-- =============================================================================
-- ROW LEVEL SECURITY
-- Every table has RLS enabled. Users can only access their own data.
-- The service role (used server-side for agent actions) bypasses RLS.
-- =============================================================================

alter table public.profiles     enable row level security;
alter table public.trials       enable row level security;
alter table public.daily_logs   enable row level security;
alter table public.trial_events enable row level security;

-- Drop existing policies before recreating (idempotent)
drop policy if exists "users manage own profile"      on public.profiles;
drop policy if exists "users manage own trials"       on public.trials;
drop policy if exists "users read own logs"           on public.daily_logs;
drop policy if exists "users insert own logs"         on public.daily_logs;
drop policy if exists "users read own events"         on public.trial_events;

-- PROFILES: users can read and update their own profile
-- Insert is handled by the trigger above, not the client
create policy "users manage own profile"
  on public.profiles
  for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- TRIALS: users can read, create, and update their own trials
-- No delete — trials are permanent records even if abandoned
create policy "users manage own trials"
  on public.trials
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- DAILY LOGS: users can read and insert their own logs
-- No update or delete — logs are immutable once submitted
create policy "users read own logs"
  on public.daily_logs
  for select
  using (user_id = auth.uid());

create policy "users insert own logs"
  on public.daily_logs
  for insert
  with check (user_id = auth.uid());

-- TRIAL EVENTS: users can only read their own events
-- All inserts are server-side via service role key (bypasses RLS)
-- This ensures the agent event log cannot be tampered with by the client
create policy "users read own events"
  on public.trial_events
  for select
  using (user_id = auth.uid());


-- =============================================================================
-- HELPER FUNCTION: get_trial_briefing
-- Assembles the trial briefing object the agent receives on every LLM call.
-- Called server-side; returns a single JSONB row with everything the agent
-- needs to reason about the current state of a trial.
-- =============================================================================

create or replace function public.get_trial_briefing(p_trial_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_trial         public.trials%rowtype;
  v_recent_logs   jsonb;
  v_recent_events jsonb;
  v_adherence_7d  numeric;
  v_active_proto  jsonb;
begin
  -- Fetch the trial
  select * into v_trial
  from public.trials
  where id = p_trial_id;

  if not found then
    raise exception 'Trial not found: %', p_trial_id;
  end if;

  -- Active protocol version
  v_active_proto := (
    select elem
    from jsonb_array_elements(v_trial.protocol->'versions') as elem
    where (elem->>'version')::int = (v_trial.protocol->>'active_version')::int
    limit 1
  );

  -- 7-day rolling adherence rate
  select
    round(
      100.0 * count(*) filter (where adherence = true)
      / nullif(count(*), 0),
      1
    )
  into v_adherence_7d
  from public.daily_logs
  where trial_id = p_trial_id
    and date >= current_date - interval '7 days';

  -- Last 7 daily logs (summarised)
  select jsonb_agg(
    jsonb_build_object(
      'date',            date,
      'phase',           phase,
      'protocol_version', protocol_version,
      'adherence',       adherence,
      'primary_outcome', primary_outcome,
      'confounders',     confounders,
      'notes',           notes
    ) order by date desc
  )
  into v_recent_logs
  from (
    select * from public.daily_logs
    where trial_id = p_trial_id
    order by date desc
    limit 7
  ) sub;

  -- Last 10 visible agent events
  select jsonb_agg(
    jsonb_build_object(
      'timestamp', timestamp,
      'type',      type,
      'payload',   payload
    ) order by timestamp desc
  )
  into v_recent_events
  from (
    select * from public.trial_events
    where trial_id = p_trial_id
      and visible = true
    order by timestamp desc
    limit 10
  ) sub;

  -- Assemble and return the briefing
  return jsonb_build_object(
    'trial_id',             v_trial.id,
    'status',               v_trial.status,
    'domain',               v_trial.domain,
    'hypothesis_refined',   v_trial.hypothesis_refined,
    'independent_variable', v_trial.independent_variable,
    'dependent_variable',   v_trial.dependent_variable,
    'expected_lag_days',    v_trial.expected_lag_days,
    'confounders',          v_trial.confounders,
    'active_protocol',      v_active_proto,
    'started_at',           v_trial.started_at,
    'expected_end_date',    v_trial.expected_end_date,
    'adherence_7d_pct',     v_adherence_7d,
    'recent_logs',          coalesce(v_recent_logs, '[]'::jsonb),
    'recent_events',        coalesce(v_recent_events, '[]'::jsonb),
    'current_date',         current_date
  );
end;
$$;