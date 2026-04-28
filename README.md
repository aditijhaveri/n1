# N=1 — Personal Clinical Trial Agent

> The medical system tells you if you're normal. N=1 tells you what's true for you.

N=1 is an AI-driven personal health experimentation system. It takes a health hypothesis — "I think sugar is causing my cystic acne" — conducts a structured clinical intake interview, designs a rigorous personal experiment, monitors it daily, and delivers calibrated findings. It acts as an AI investigator while you are both subject and stakeholder.

**Live demo:** https://n1-pink.vercel.app

---

## What it does

- **Intake agent** — a conversational AI clinical coordinator that refines your hypothesis, identifies confounders, and designs a protocol grounded in clinical trial methodology
- **Trial engine** — tracks your experiment across phases (baseline → intervention → crossover), manages daily logging, and monitors adherence
- **Agentic monitoring loop** — runs daily for every active trial, assesses the trial state, and delivers proactive insights, warnings, and observations without being asked
- **Wearable simulation** — generates realistic biometric data (sleep, HRV, heart rate, glucose) seeded to each trial and date
- **Agent feed** — a timeline of everything the AI investigator observed and decided, displayed on the trial page

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | Supabase (Postgres + RLS + Realtime) |
| AI | Claude API (claude-opus-4-5) |
| Styling | Inline styles with glassmorphic design system |
| Auth | Supabase Auth |
| Deployment | Vercel |

---

## Project structure

```
n1/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── intake/route.ts      # Intake agent API route
│   │   │   └── monitor/route.ts     # Daily monitoring agent API route
│   │   ├── dashboard/page.tsx       # Experiment list
│   │   ├── intake/page.tsx          # Intake conversation UI
│   │   ├── trial/[id]/page.tsx      # Active trial page
│   │   ├── login/page.tsx           # Auth
│   │   ├── signup/page.tsx          # Auth
│   │   └── page.tsx                 # Root redirect
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            # Browser Supabase client
│   │   │   └── server.ts            # Server + service role clients
│   │   ├── wearable-simulator.ts    # Deterministic wearable data generation
│   │   └── utils.ts                 # Shared utilities
│   ├── types/
│   │   └── database.ts              # TypeScript types for all DB tables
│   └── middleware.ts                # Auth protection for all routes
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql   # Full DB schema with RLS policies
```

---

## Setup instructions

### Prerequisites

- Node.js v18 or higher
- A Supabase account (free) — [supabase.com](https://supabase.com)
- An Anthropic API account — [console.anthropic.com](https://console.anthropic.com)

### 1. Clone the repository

```bash
git clone https://github.com/aditijhaveri/n1.git
cd n1
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → **New query**
3. Paste the contents of `supabase/migrations/001_initial_schema.sql` and click **Run**
4. Go to **Authentication → Providers → Email** and disable **Confirm email** for local development

### 4. Configure environment variables

Create a `.env.local` file in the root of the project:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
CRON_SECRET=any_random_string_you_choose
```

Find your Supabase keys at **Settings → API** in the Supabase dashboard.
Find your Anthropic API key at [console.anthropic.com](https://console.anthropic.com) → API Keys.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to use it

1. **Sign up** at `/signup`
2. **Start a new experiment** — click "New experiment" on the dashboard
3. **Talk to the intake agent** — describe your health hypothesis in plain language (e.g. "I think caffeine is affecting my sleep quality")
4. **Follow the clinical interview** — the agent will refine your hypothesis, surface confounders, and design a protocol
5. **Approve the protocol** — review and confirm the generated experiment design
6. **Start the trial** — activate the trial on the trial page to begin the baseline phase
7. **Log daily** — record adherence, your primary outcome score, and confounder values each day
8. **Run the agent** — click "Run agent now" to trigger the monitoring agent, which assesses your trial state and delivers insights

---

## Agentic monitoring loop

The monitoring agent runs daily for every active trial. It:

1. Fetches the full trial state from the database
2. Constructs a trial briefing (hypothesis, phase, adherence rate, outcome trend, recent events)
3. Calls Claude with the briefing and a structured decision prompt
4. Parses the agent's action from the structured JSON response
5. Executes the action (request log, send insight, flag confounder, conclude trial)
6. Appends the event to the `trial_events` table

In production, this is triggered via Supabase `pg_cron` at 8am UTC daily. During development, trigger it manually via the "Run agent now" button on the trial page.

To set up the cron job in Supabase after deploying:

```sql
select cron.schedule(
  'daily-trial-monitor',
  '0 8 * * *',
  $$
  select net.http_post(
    url := 'https://your-app.vercel.app/api/monitor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer your-cron-secret"}'::jsonb,
    body := '{}'::jsonb
  )
  $$
);
```

---

## Safety & scope

N=1 is a **personal wellness experimentation tool**, not a medical device. It is designed for healthy adults exploring lifestyle variables that affect general wellbeing.

The agent is constrained to:
- **Green tier** (permitted): dietary changes, sleep hygiene, exercise timing, skincare, OTC supplements, stress management
- **Yellow tier** (permitted with caveat): extended elimination diets, intermittent fasting up to 24hrs
- **Red tier** (declined): prescription medication changes, symptoms suggesting serious illness, any intervention requiring medical supervision

The interpretation agent never claims causation, never diagnoses, and always frames results as personal observations with calibrated uncertainty.

---

## Wearable integration (simulated)

The current implementation simulates wearable data deterministically — the same trial ID and date always produce the same values, making it reproducible and testable. In production, each simulator function would be replaced by a real API call:

| Data source | Real API |
|---|---|
| Apple Health | HealthKit REST API (requires iOS app + entitlements) |
| Oura Ring | `https://cloud.ouraring.com/v2/usercollection/daily_sleep` |
| Garmin | `https://apis.garmin.com/wellness-api/rest` |
| Google Fit | `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate` |
| CGM (Dexcom) | Dexcom Developer API |

---

## Data model

Four core tables:

- **`trials`** — the experiment record (hypothesis, protocol, status, confounders)
- **`daily_logs`** — one row per day per trial (adherence, primary outcome, confounder values)
- **`trial_events`** — append-only agent memory and audit trail
- **`wearable_logs`** — simulated or real biometric data per day
- **`profiles`** — user preferences (timezone for cron timing)

All tables have row-level security — users can only access their own data. The service role key (server-side only) is used for agent actions that bypass RLS.

---

## Known limitations & future work

- Results/interpretation page not yet built (Phase 3)
- Confounder inputs need smart field types (units, scales, steppers)
- No real wearable API integration yet
- Daily monitoring loop requires manual trigger in development
- No experiment history or follow-up trial flow yet

---

## License

MIT
