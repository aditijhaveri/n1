// 'use client'

// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { getSupabaseBrowserClient } from '@/lib/supabase/client'

// export default function HomePage() {
//   const router = useRouter()

//   useEffect(() => {
//     async function checkAuth() {
//       const supabase = getSupabaseBrowserClient()
//       const { data: { user } } = await supabase.auth.getUser()
//       if (user) {
//         router.push('/dashboard')
//       } else {
//         router.push('/login')
//       }
//     }
//     checkAuth()
//   }, [])

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: '#080b12',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//     }}>
//       <p style={{
//         color: '#ffffff20',
//         fontSize: '14px',
//         fontFamily: 'monospace',
//       }}>
//         Loading...
//       </p>
//     </div>
//   )
// }




// // import Image from "next/image";

// // export default function Home() {
// //   return (
// //     <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
// //       <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
// //         <Image
// //           className="dark:invert"
// //           src="/next.svg"
// //           alt="Next.js logo"
// //           width={100}
// //           height={20}
// //           priority
// //         />
// //         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
// //           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
// //             To get started, edit the page.tsx file.
// //           </h1>
// //           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
// //             Looking for a starting point or more instructions? Head over to{" "}
// //             <a
// //               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
// //               className="font-medium text-zinc-950 dark:text-zinc-50"
// //             >
// //               Templates
// //             </a>{" "}
// //             or the{" "}
// //             <a
// //               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
// //               className="font-medium text-zinc-950 dark:text-zinc-50"
// //             >
// //               Learning
// //             </a>{" "}
// //             center.
// //           </p>
// //         </div>
// //         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
// //           <a
// //             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
// //             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
// //             target="_blank"
// //             rel="noopener noreferrer"
// //           >
// //             <Image
// //               className="dark:invert"
// //               src="/vercel.svg"
// //               alt="Vercel logomark"
// //               width={16}
// //               height={16}
// //             />
// //             Deploy Now
// //           </a>
// //           <a
// //             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
// //             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
// //             target="_blank"
// //             rel="noopener noreferrer"
// //           >
// //             Documentation
// //           </a>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // }


'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={s.root}>

      {/* Nav */}
      <nav style={{ ...s.nav, background: scrolled ? 'rgba(6,8,14,0.95)' : 'transparent', borderBottom: scrolled ? '1px solid #ffffff08' : '1px solid transparent' }}>
        <span style={s.navLogo}>N=1</span>
        <div style={s.navRight}>
          <button onClick={() => router.push('/login')} style={s.navLogin}>Sign in</button>
          <button onClick={() => router.push('/signup')} style={s.navCta}>Start your first experiment</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroOrb1} />
        <div style={s.heroOrb2} />
        <div style={s.heroInner}>

          <div style={s.eyebrow}>Personal clinical trials</div>

          <h1 style={s.heroTitle}>
            Your body has been<br />
            <span style={s.heroAccent}>trying to tell you something.</span>
          </h1>

          <p style={s.heroSub}>
            N=1 turns your health hunch into a structured experiment — so you finally get a real answer, not just another guess.
          </p>

          <button onClick={() => router.push('/signup')} style={s.heroCta}>
            Start your first experiment →
          </button>

          <p style={s.heroNote}>Free · No credit card · Takes 5 minutes</p>
        </div>
      </section>

      {/* Personal story */}
      <section style={s.storySection}>
        <div style={s.storyInner}>
          <div style={s.storyQuote}>
            <div style={s.quoteMark}>"</div>
            <p style={s.quoteText}>
              I dealt with cystic acne from age 13. Three rounds of Accutane. Healthy weight, very active, ate well. Every lab came back normal. Every doctor said the same thing: <em>you're fine.</em>
            </p>
            <p style={s.quoteText}>
              Years later, one doctor mentioned I might be insulin sensitive. That one offhand comment sent me down a rabbit hole. I started tracking everything obsessively — what I ate, when I slept, my stress levels. Eventually I figured it out: even a little sugar broke me out. Not because I was unhealthy. Because my body specifically reacts to glucose spikes.
            </p>
            <p style={s.quoteText}>
              The answer existed in my own data the whole time. I just didn't have the tools to find it.
            </p>
            <div style={s.quoteAuthor}>
              <div style={s.quoteAvatar}>A</div>
              <div>
                <p style={s.quoteName}>Aditi Jhaveri</p>
                <p style={s.quoteRole}>Founder, N=1 · Master's in Applied Data Science</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionEyebrow}>The problem</div>
          <h2 style={s.sectionTitle}>Guess-and-check hell</h2>
          <p style={s.sectionBody}>
            You try cutting dairy on Monday. You start a new serum on Wednesday. You break out on Friday. You have absolutely no idea which variable caused what.
          </p>
          <p style={s.sectionBody}>
            Meanwhile, your labs come back normal. Your doctor says you're fine. And you're left with a dozen hunches, no data, and no way to tell which one is right.
          </p>
          <p style={s.sectionBody}>
            This isn't just a skin problem. It's sleep, bloating, mood, energy, hormones. The medical system is built for populations. It tells you if you're normal. It doesn't tell you what's true <em>for you.</em>
          </p>

          <div style={s.problemCards}>
            {[
              { icon: '🔄', title: 'Changing too many things at once', body: 'You can\'t isolate a cause if ten variables shift simultaneously.' },
              { icon: '📊', title: 'No baseline to compare against', body: 'Without a baseline, you\'re measuring change against nothing.' },
              { icon: '🌀', title: 'Confounders hiding the signal', body: 'Stress, sleep, hormones — they all affect the same outcomes you\'re tracking.' },
              { icon: '⏳', title: 'Misreading biological lag times', body: 'Skin takes 4–6 weeks to reflect what you eat. Two-week trials produce garbage data.' },
            ].map((card, i) => (
              <div key={i} style={s.problemCard}>
                <span style={s.problemIcon}>{card.icon}</span>
                <h3 style={s.problemCardTitle}>{card.title}</h3>
                <p style={s.problemCardBody}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section style={{ ...s.section, background: 'rgba(255,255,255,0.02)' }}>
        <div style={s.sectionInner}>
          <div style={s.sectionEyebrow}>The solution</div>
          <h2 style={s.sectionTitle}>An AI investigator<br />running your case</h2>
          <p style={s.sectionBody}>
            N=1 isn't a tracker. It's an autonomous clinical detective that takes your hunch and turns it into a closed-case investigation — using the same methodology as a real clinical trial, built around your specific biology.
          </p>

          <div style={s.steps}>
            {[
              {
                num: '01',
                title: 'You bring the hunch',
                body: 'Tell N=1 what you suspect. "I think sugar is causing my acne." "Caffeine might be ruining my sleep." Your observation is the starting point.',
                accent: '#fb923c',
              },
              {
                num: '02',
                title: 'The agent designs your trial',
                body: 'A clinical intake conversation refines your hypothesis, identifies what else could be muddying the results, and designs a protocol built around your biology — not a generic template.',
                accent: '#818cf8',
              },
              {
                num: '03',
                title: 'It monitors your experiment daily',
                body: 'Every morning, the agent checks in on your trial. If your adherence drops, it asks why. If a confounding factor spikes, it flags it. If your skin barrier shows signs of damage, it pauses the trial and pivots.',
                accent: '#4ade80',
              },
              {
                num: '04',
                title: 'Case closed — with an actual verdict',
                body: 'At the end, you get a definitive finding. Not a graph to interpret yourself. A verdict: supported, not supported, or inconclusive — with a plain-language explanation of what your data actually shows.',
                accent: '#c084fc',
              },
            ].map((step, i) => (
              <div key={i} style={s.step}>
                <div style={{ ...s.stepNum, color: step.accent, borderColor: `${step.accent}30` }}>{step.num}</div>
                <div style={s.stepContent}>
                  <h3 style={s.stepTitle}>{step.title}</h3>
                  <p style={s.stepBody}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example verdict */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionEyebrow}>What a verdict looks like</div>
          <h2 style={s.sectionTitle}>Not a graph.<br />An answer.</h2>

          <div style={s.verdictCard}>
            <div style={s.verdictHeader}>
              <div style={s.verdictBadge}>
                <span style={s.verdictCheck}>○</span>
                <span style={s.verdictLabel}>Hypothesis not supported</span>
              </div>
              <span style={s.verdictConfidence}>Moderate confidence</span>
            </div>

            <h3 style={s.verdictHeadline}>
              Dairy wasn't the culprit — cortisol was.
            </h3>

            <p style={s.verdictBody}>
              You eliminated dairy perfectly for 28 days, but your cystic blemish count didn't decrease. However, your data showed an 87% correlation between blemish spikes and days where your sleep efficiency dropped below 75% alongside elevated stress scores.
            </p>

            <div style={s.verdictCaveat}>
              <p style={s.verdictCaveatLabel}>What this means</p>
              <p style={s.verdictCaveatText}>Your acne pattern points toward cortisol-driven inflammation, not dairy. The next trial should isolate stress and sleep as the independent variables.</p>
            </div>

            <div style={s.verdictNext}>
              <p style={s.verdictNextLabel}>Suggested follow-up</p>
              <p style={s.verdictNextText}>→ Test: does a consistent sleep schedule (7+ hrs, same bedtime) reduce blemish count over 3 weeks?</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section style={{ ...s.section, background: 'rgba(255,255,255,0.02)' }}>
        <div style={s.sectionInner}>
          <div style={s.sectionEyebrow}>Who it's for</div>
          <h2 style={s.sectionTitle}>If you've ever said<br />"my labs are normal but..."</h2>

          <div style={s.forCards}>
            {[
              { emoji: '🧴', text: 'You\'ve tried a dozen skincare routines and still can\'t figure out what\'s triggering your breakouts' },
              { emoji: '😴', text: 'You sleep 8 hours but wake up exhausted and can\'t figure out why' },
              { emoji: '🫁', text: 'Your digestion is a mystery — bloated some days, fine on others, no pattern you can see' },
              { emoji: '😶‍🌫️', text: 'Your mood fluctuates in ways that don\'t match what\'s happening in your life' },
              { emoji: '⚡', text: 'Your energy crashes at the same time every day and you\'ve tried everything' },
              { emoji: '🩺', text: 'You\'ve been told you\'re healthy but you know something is off' },
            ].map((card, i) => (
              <div key={i} style={s.forCard}>
                <span style={s.forEmoji}>{card.emoji}</span>
                <p style={s.forText}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety note */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.safetyCard}>
            <h3 style={s.safetyTitle}>What N=1 is — and isn't</h3>
            <p style={s.safetyBody}>
              N=1 is a personal wellness experimentation tool for healthy adults exploring lifestyle variables. It is not a medical device and does not diagnose, treat, or replace professional medical care. Every finding is framed as a personal observation, not a clinical conclusion.
            </p>
            <p style={s.safetyBody}>
              If you have a diagnosed medical condition or are experiencing serious symptoms, please see a healthcare provider. N=1 is for the questions your doctor can't answer because they're not about whether you're sick — they're about what's true for you specifically.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={s.ctaSection}>
        <div style={s.ctaOrb} />
        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle}>Your body already has the data.<br />Let's find the answer.</h2>
          <p style={s.ctaSub}>Start with a hunch. Get a verdict.</p>
          <button onClick={() => router.push('/signup')} style={s.ctaBtn}>
            Start your first experiment →
          </button>
          <p style={s.ctaNote}>Free to use · No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.footerLogo}>N=1</span>
          <p style={s.footerNote}>
            N=1 is a wellness tool, not a medical device. Always consult a healthcare provider for medical decisions.
          </p>
          <div style={s.footerLinks}>
            <button onClick={() => router.push('/login')} style={s.footerLink}>Sign in</button>
            <button onClick={() => router.push('/signup')} style={s.footerLink}>Sign up</button>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&family=DM+Mono:wght@400;500&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        button { cursor: pointer; }
        em { font-style: italic; font-family: 'DM Serif Display', serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: '#06080e',
    color: '#ffffff',
    fontFamily: "'DM Sans', sans-serif",
    overflowX: 'hidden',
  },

  // Nav
  nav: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '16px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'background 0.3s, border-color 0.3s',
  },
  navLogo: {
    fontSize: '18px',
    fontWeight: 500,
    fontFamily: "'DM Mono', monospace",
    color: '#ffffff',
    letterSpacing: '-0.01em',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navLogin: {
    background: 'none',
    border: 'none',
    color: '#ffffff60',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  navCta: {
    background: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#06080e',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },

  // Hero
  hero: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '120px 24px 80px',
    overflow: 'hidden',
  },
  heroOrb1: {
    position: 'absolute',
    width: '700px', height: '700px',
    top: '-200px', right: '-200px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #fb923c18, transparent 65%)',
    pointerEvents: 'none',
  },
  heroOrb2: {
    position: 'absolute',
    width: '600px', height: '600px',
    bottom: '-200px', left: '-150px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #818cf815, transparent 65%)',
    pointerEvents: 'none',
  },
  heroInner: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '760px',
    margin: '0 auto',
    textAlign: 'center',
    animation: 'fadeUp 0.8s ease forwards',
  },
  eyebrow: {
    display: 'inline-block',
    fontSize: '12px',
    color: '#fb923c',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontFamily: "'DM Mono', monospace",
    marginBottom: '24px',
    padding: '6px 16px',
    background: '#fb923c12',
    borderRadius: '20px',
    border: '1px solid #fb923c25',
  },
  heroTitle: {
    fontSize: 'clamp(40px, 6vw, 72px)',
    fontWeight: 300,
    fontFamily: "'DM Serif Display', serif",
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    color: '#ffffffee',
    marginBottom: '24px',
  },
  heroAccent: {
    color: '#fb923c',
    fontStyle: 'italic',
  },
  heroSub: {
    fontSize: '18px',
    color: '#ffffff70',
    lineHeight: 1.7,
    maxWidth: '520px',
    margin: '0 auto 40px',
    fontWeight: 300,
  },
  heroCta: {
    background: '#fb923c',
    border: 'none',
    borderRadius: '14px',
    padding: '16px 32px',
    fontSize: '15px',
    fontWeight: 500,
    color: '#06080e',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    display: 'block',
    margin: '0 auto 16px',
  },
  heroNote: {
    fontSize: '12px',
    color: '#ffffff30',
    letterSpacing: '0.02em',
  },

  // Story
  storySection: {
    padding: '80px 24px',
    borderTop: '1px solid #ffffff08',
    borderBottom: '1px solid #ffffff08',
    background: 'rgba(251, 146, 60, 0.03)',
  },
  storyInner: {
    maxWidth: '680px',
    margin: '0 auto',
  },
  storyQuote: {
    position: 'relative',
    paddingLeft: '32px',
    borderLeft: '2px solid #fb923c40',
  },
  quoteMark: {
    fontSize: '80px',
    color: '#fb923c20',
    fontFamily: "'DM Serif Display', serif",
    lineHeight: 0.8,
    marginBottom: '16px',
  },
  quoteText: {
    fontSize: '17px',
    color: '#ffffffcc',
    lineHeight: 1.8,
    marginBottom: '20px',
    fontWeight: 300,
  },
  quoteAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #ffffff0a',
  },
  quoteAvatar: {
    width: '40px', height: '40px',
    borderRadius: '50%',
    background: '#fb923c20',
    border: '1px solid #fb923c40',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 500,
    color: '#fb923c',
    flexShrink: 0,
  },
  quoteName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#ffffffcc',
    marginBottom: '2px',
  },
  quoteRole: {
    fontSize: '12px',
    color: '#ffffff40',
  },

  // Sections
  section: {
    padding: '100px 24px',
  },
  sectionInner: {
    maxWidth: '760px',
    margin: '0 auto',
  },
  sectionEyebrow: {
    fontSize: '11px',
    color: '#ffffff35',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontFamily: "'DM Mono', monospace",
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: 'clamp(28px, 4vw, 48px)',
    fontWeight: 300,
    fontFamily: "'DM Serif Display', serif",
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    color: '#ffffffee',
    marginBottom: '24px',
  },
  sectionBody: {
    fontSize: '16px',
    color: '#ffffff70',
    lineHeight: 1.8,
    marginBottom: '20px',
    maxWidth: '600px',
    fontWeight: 300,
  },

  // Problem cards
  problemCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginTop: '48px',
  },
  problemCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
  },
  problemIcon: {
    fontSize: '24px',
    display: 'block',
    marginBottom: '12px',
  },
  problemCardTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#ffffffcc',
    marginBottom: '8px',
  },
  problemCardBody: {
    fontSize: '13px',
    color: '#ffffff55',
    lineHeight: 1.6,
  },

  // Steps
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    marginTop: '48px',
  },
  step: {
    display: 'flex',
    gap: '28px',
    paddingBottom: '40px',
    position: 'relative',
  },
  stepNum: {
    fontSize: '13px',
    fontWeight: 500,
    fontFamily: "'DM Mono', monospace",
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  stepContent: {
    flex: 1,
    paddingBottom: '40px',
    borderBottom: '1px solid #ffffff06',
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: 400,
    color: '#ffffffee',
    marginBottom: '10px',
    letterSpacing: '-0.01em',
  },
  stepBody: {
    fontSize: '15px',
    color: '#ffffff60',
    lineHeight: 1.7,
    fontWeight: 300,
  },

  // Verdict card
  verdictCard: {
    marginTop: '48px',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '32px',
    borderTop: '2px solid #f87171',
  },
  verdictHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  verdictBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#ef444412',
    border: '1px solid #ef444425',
    borderRadius: '20px',
    padding: '5px 14px',
  },
  verdictCheck: {
    fontSize: '14px',
    color: '#f87171',
  },
  verdictLabel: {
    fontSize: '12px',
    color: '#f87171',
    fontWeight: 500,
  },
  verdictConfidence: {
    fontSize: '11px',
    color: '#fbbf24',
    background: '#f59e0b12',
    border: '1px solid #f59e0b25',
    borderRadius: '20px',
    padding: '3px 10px',
  },
  verdictHeadline: {
    fontSize: '22px',
    fontWeight: 400,
    fontFamily: "'DM Serif Display', serif",
    color: '#ffffffee',
    lineHeight: 1.3,
    marginBottom: '16px',
    letterSpacing: '-0.01em',
  },
  verdictBody: {
    fontSize: '14px',
    color: '#ffffff80',
    lineHeight: 1.7,
    marginBottom: '20px',
  },
  verdictCaveat: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
  },
  verdictCaveatLabel: {
    fontSize: '10px',
    color: '#ffffff30',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '6px',
    fontFamily: "'DM Mono', monospace",
  },
  verdictCaveatText: {
    fontSize: '13px',
    color: '#ffffff70',
    lineHeight: 1.6,
  },
  verdictNext: {
    padding: '12px 0 0',
  },
  verdictNextLabel: {
    fontSize: '10px',
    color: '#ffffff25',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '6px',
    fontFamily: "'DM Mono', monospace",
  },
  verdictNextText: {
    fontSize: '13px',
    color: '#4ade80',
    lineHeight: 1.6,
  },

  // For cards
  forCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '12px',
    marginTop: '40px',
  },
  forCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '20px',
  },
  forEmoji: {
    fontSize: '20px',
    flexShrink: 0,
    marginTop: '1px',
  },
  forText: {
    fontSize: '13px',
    color: '#ffffff70',
    lineHeight: 1.6,
  },

  // Safety
  safetyCard: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '28px',
  },
  safetyTitle: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#ffffff80',
    marginBottom: '12px',
  },
  safetyBody: {
    fontSize: '13px',
    color: '#ffffff45',
    lineHeight: 1.7,
    marginBottom: '12px',
  },

  // CTA section
  ctaSection: {
    position: 'relative',
    padding: '120px 24px',
    textAlign: 'center',
    overflow: 'hidden',
    borderTop: '1px solid #ffffff08',
  },
  ctaOrb: {
    position: 'absolute',
    width: '800px', height: '800px',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #fb923c10, transparent 60%)',
    pointerEvents: 'none',
  },
  ctaInner: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '600px',
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: 'clamp(28px, 4vw, 48px)',
    fontWeight: 300,
    fontFamily: "'DM Serif Display', serif",
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    color: '#ffffffee',
    marginBottom: '16px',
  },
  ctaSub: {
    fontSize: '16px',
    color: '#ffffff50',
    marginBottom: '40px',
    fontWeight: 300,
  },
  ctaBtn: {
    background: '#fb923c',
    border: 'none',
    borderRadius: '14px',
    padding: '18px 36px',
    fontSize: '16px',
    fontWeight: 500,
    color: '#06080e',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    display: 'block',
    margin: '0 auto 16px',
  },
  ctaNote: {
    fontSize: '12px',
    color: '#ffffff25',
  },

  // Footer
  footer: {
    borderTop: '1px solid #ffffff08',
    padding: '32px 40px',
  },
  footerInner: {
    maxWidth: '760px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    flexWrap: 'wrap',
  },
  footerLogo: {
    fontSize: '16px',
    fontWeight: 500,
    fontFamily: "'DM Mono', monospace",
    color: '#ffffff50',
  },
  footerNote: {
    fontSize: '11px',
    color: '#ffffff25',
    lineHeight: 1.5,
    maxWidth: '400px',
    flex: 1,
  },
  footerLinks: {
    display: 'flex',
    gap: '16px',
  },
  footerLink: {
    background: 'none',
    border: 'none',
    color: '#ffffff35',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
}
