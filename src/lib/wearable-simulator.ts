// =============================================================================
// Wearable Data Simulator
// Generates realistic daily health metrics that mirror what real wearable
// APIs would return. In production, replace each function with the
// corresponding API call:
//   Apple Health  → HealthKit REST API (requires iOS app + entitlements)
//   Oura          → https://cloud.ouraring.com/v2/usercollection/daily_sleep
//   Garmin        → https://apis.garmin.com/wellness-api/rest
//   Google Fit    → https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate
//   CGM           → Dexcom API or Libre LinkUp API
// =============================================================================

type Domain = 'acne' | 'sleep' | 'digestion' | 'mood' | 'energy' | 'other'

export interface WearableData {
  // Sleep
  sleep_duration_hrs: number        // e.g. 7.2
  sleep_quality_score: number       // 0-100
  sleep_deep_pct: number            // % of sleep in deep stage
  sleep_rem_pct: number             // % of sleep in REM stage

  // Heart
  resting_heart_rate: number        // bpm
  hrv_ms: number                    // heart rate variability in ms

  // Activity
  steps: number
  active_minutes: number
  calories_burned: number

  // Glucose (CGM — null if not relevant to domain)
  glucose_fasting_mg_dl: number | null
  glucose_peak_mg_dl: number | null
  glucose_variability: number | null  // standard deviation of readings
}

// Seeded random — same date + trial always produces same values
// This prevents data changing on page refresh
function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return function() {
    hash = ((hash << 5) - hash) + 1
    hash = hash & hash
    return Math.abs(hash) / 2147483647
  }
}

// Clamp a value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Generate realistic variation around a baseline
function vary(
  rand: () => number,
  baseline: number,
  variance: number
): number {
  return baseline + (rand() - 0.5) * 2 * variance
}

export function simulateWearableData(
  trialId: string,
  date: string,
  domain: Domain
): WearableData {
  const rand = seededRandom(`${trialId}-${date}`)

  // Base values — realistic human averages
  const sleepHrs = clamp(vary(rand, 7.0, 1.2), 4.5, 9.5)
  const sleepQuality = clamp(vary(rand, 72, 18), 30, 98)
  const deepPct = clamp(vary(rand, 20, 6), 8, 35)
  const remPct = clamp(vary(rand, 22, 6), 10, 35)
  const rhr = clamp(vary(rand, 62, 8), 45, 85)
  const hrv = clamp(vary(rand, 45, 18), 15, 100)
  const steps = clamp(vary(rand, 8000, 3000), 1000, 18000)
  const activeMinutes = clamp(vary(rand, 45, 20), 5, 120)
  const calories = clamp(vary(rand, 2100, 300), 1400, 3200)

  // Glucose — only simulate for relevant domains
  const showGlucose = domain === 'acne' || domain === 'energy' || domain === 'mood'
  const glucoseFasting = showGlucose
    ? clamp(vary(rand, 88, 12), 70, 115)
    : null
  const glucosePeak = showGlucose
    ? clamp(vary(rand, 130, 25), 90, 180)
    : null
  const glucoseVariability = showGlucose
    ? clamp(vary(rand, 18, 8), 5, 40)
    : null

  return {
    sleep_duration_hrs:   Math.round(sleepHrs * 10) / 10,
    sleep_quality_score:  Math.round(sleepQuality),
    sleep_deep_pct:       Math.round(deepPct),
    sleep_rem_pct:        Math.round(remPct),
    resting_heart_rate:   Math.round(rhr),
    hrv_ms:               Math.round(hrv),
    steps:                Math.round(steps),
    active_minutes:       Math.round(activeMinutes),
    calories_burned:      Math.round(calories),
    glucose_fasting_mg_dl: glucoseFasting
      ? Math.round(glucoseFasting)
      : null,
    glucose_peak_mg_dl:   glucosePeak
      ? Math.round(glucosePeak)
      : null,
    glucose_variability:  glucoseVariability
      ? Math.round(glucoseVariability * 10) / 10
      : null,
  }
}

// Returns which metrics are most relevant for a given domain
// Used to decide which to surface prominently in the UI
export function getPrimaryMetricsForDomain(domain: Domain): (keyof WearableData)[] {
  switch (domain) {
    case 'acne':
      return ['sleep_duration_hrs', 'sleep_quality_score', 'glucose_fasting_mg_dl', 'glucose_peak_mg_dl', 'hrv_ms']
    case 'sleep':
      return ['sleep_duration_hrs', 'sleep_quality_score', 'sleep_deep_pct', 'sleep_rem_pct', 'resting_heart_rate', 'hrv_ms']
    case 'digestion':
      return ['sleep_duration_hrs', 'steps', 'active_minutes', 'hrv_ms']
    case 'mood':
      return ['sleep_duration_hrs', 'sleep_quality_score', 'hrv_ms', 'resting_heart_rate', 'glucose_fasting_mg_dl']
    case 'energy':
      return ['sleep_duration_hrs', 'sleep_quality_score', 'resting_heart_rate', 'hrv_ms', 'glucose_fasting_mg_dl', 'steps']
    default:
      return ['sleep_duration_hrs', 'resting_heart_rate', 'hrv_ms', 'steps']
  }
}

// Human-readable labels for each metric
export const METRIC_LABELS: Record<keyof WearableData, string> = {
  sleep_duration_hrs:    'Sleep duration',
  sleep_quality_score:   'Sleep quality',
  sleep_deep_pct:        'Deep sleep',
  sleep_rem_pct:         'REM sleep',
  resting_heart_rate:    'Resting heart rate',
  hrv_ms:                'HRV',
  steps:                 'Steps',
  active_minutes:        'Active minutes',
  calories_burned:       'Calories burned',
  glucose_fasting_mg_dl: 'Fasting glucose',
  glucose_peak_mg_dl:    'Peak glucose',
  glucose_variability:   'Glucose variability',
}

// Units for each metric
export const METRIC_UNITS: Record<keyof WearableData, string> = {
  sleep_duration_hrs:    'hrs',
  sleep_quality_score:   '/100',
  sleep_deep_pct:        '%',
  sleep_rem_pct:         '%',
  resting_heart_rate:    'bpm',
  hrv_ms:                'ms',
  steps:                 'steps',
  active_minutes:        'min',
  calories_burned:       'kcal',
  glucose_fasting_mg_dl: 'mg/dL',
  glucose_peak_mg_dl:    'mg/dL',
  glucose_variability:   'mg/dL',
}