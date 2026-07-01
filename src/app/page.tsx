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
      <nav style={{
        ...s.nav,
        background: scrolled ? 'rgba(6,8,14,0.95)' : 'transparent',
        borderBottom: scrolled ? '1px solid #ffffff08' : '1px solid transparent',
      }}>
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
            N=1 turns your health hunch into a structured personal experiment — so you can finally understand what's actually happening in your body, not just guess.
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
              Years later, one doctor mentioned I might be insulin sensitive. That one offhand comment sent me down a rabbit hole. I started tracking everything — what I ate, when I slept, my stress levels. Eventually I figured it out: even a little sugar broke me out. Not because I was unhealthy. Because my body specifically reacts to glucose spikes.
            </p>
            <p style={s.quoteText}>
              The answer was in my own data the whole time. I just didn't have the tools to find it.
            </p>
            <div style={s.quoteAuthor}>
              <div style={s.quoteAvatar}>A</div>
              <div>
                <p style={s.quoteName}>Aditi Jhaveri</p>
                <p style={s.quoteRole}>Founder, N=1 · Master's in Applied Data Science, University of Michigan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionEyebrow}>The problem</div>
          <h2 style={s.sectionTitle}>The medical system is built for populations.<br />Not for you.</h2>
          <p style={s.sectionBody}>
            Lab values, dietary guidelines, treatment protocols — they're derived from large studies and designed to work for most people, most of the time. If you fall outside the average, you get told you're normal and sent home.
          </p>
          <p style={s.sectionBody}>
            So you start experimenting yourself. You cut something out. You add something in. You try a new routine. But without structure, you're changing five variables at once, drawing conclusions from noise, and missing the confounders that are quietly running the show.
          </p>
          <p style={s.sectionBody}>
            This isn't just a skin problem. It's sleep, digestion, mood, energy, hormones. The question isn't whether something is wrong with you — it's figuring out what's specifically true for you.
          </p>

          <div style={s.problemCards}>
            {[
              { title: 'Too many variables at once', body: 'You can\'t isolate a cause when ten things change simultaneously. You end up with data that tells you nothing.' },
              { title: 'No baseline to compare against', body: 'Without a stable baseline, you\'re measuring change against noise — not against your actual normal.' },
              { title: 'Confounders hiding the signal', body: 'Stress, sleep, hormones, and a dozen other factors affect the same outcomes you\'re tracking. Most experiments never account for them.' },
              { title: 'Biological timing ignored', body: 'Skin takes 4–6 weeks to reflect what you eat. Most self-experiments run for two weeks and call it inconclusive.' },
            ].map((card, i) => (
              <div key={i} style={s.problemCard}>
                <h3 style={s.problemCardTitle}>{card.title}</h3>
                <p style={s.problemCardBody}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section style={{ ...s.section, background: 'rgba(255,255,255,0.02)', borderTop: '1px solid #ffffff06', borderBottom: '1px solid #ffffff06' }}>
        <div style={s.sectionInner}>
          <div style={s.sectionEyebrow}>The solution</div>
          <h2 style={s.sectionTitle}>An AI investigator<br />running your case.</h2>
          <p style={s.sectionBody}>
            N=1 applies the methodology of a clinical trial to your personal health questions. Not a tracker. Not a chatbot. An autonomous agent that designs your experiment, monitors it daily, and tells you what your data actually suggests.
          </p>

          <div style={s.steps}>
            {[
              {
                num: '01',
                title: 'You bring the hunch',
                body: 'Tell N=1 what you suspect. "I think sugar is causing my acne." "Caffeine might be ruining my sleep." Your observation is the starting point — the agent does the rest.',
                accent: '#fb923c',
              },
              {
                num: '02',
                title: 'The agent designs your protocol',
                body: 'A clinical intake conversation refines your hypothesis, surfaces confounders you might have missed, and generates a protocol built around your situation — not a generic template.',
                accent: '#818cf8',
              },
              {
                num: '03',
                title: 'It monitors your experiment every day',
                body: 'Every morning, the agent reads your trial state and acts. If adherence drops, it asks why. If a confounder spikes, it flags it. It keeps the investigation clean so the data actually means something.',
                accent: '#4ade80',
              },
              {
                num: '04',
                title: 'You get a calibrated interpretation',
                body: 'At the end, the agent delivers a plain-language summary of what your data suggests — with honest confidence levels, confounder notes, and a suggested next step. Not a claim. An observation worth acting on.',
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

      {/* Who it's for */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionEyebrow}>Who it's for</div>
          <h2 style={s.sectionTitle}>If you've ever been told<br />"your labs are normal"</h2>
          <p style={s.sectionBody}>
            N=1 is for people who are already experimenting — just without a structure that makes the data mean anything.
          </p>

          <div style={s.forCards}>
            {[
              'You\'ve tried a dozen skincare routines and still can\'t isolate what\'s triggering your breakouts',
              'You sleep eight hours but wake up exhausted and can\'t figure out why',
              'Your digestion is unpredictable — bloated some days, fine on others, no pattern you can see',
              'Your mood or energy shifts in ways that don\'t match what\'s happening in your life',
              'You suspect a specific food, habit, or lifestyle factor is driving a symptom but can\'t prove it',
              'You\'ve been through the medical system and left without a useful answer',
            ].map((text, i) => (
              <div key={i} style={s.forCard}>
                <div style={s.forDot} />
                <p style={s.forText}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section style={{ ...s.section, paddingTop: '0' }}>
        <div style={s.sectionInner}>
          <div style={s.safetyCard}>
            <h3 style={s.safetyTitle}>What N=1 is — and isn't</h3>
            <p style={s.safetyBody}>
              N=1 is a personal wellness experimentation tool for healthy adults exploring lifestyle variables. It is not a medical device and does not diagnose, treat, or replace professional medical care. Every finding is framed as a personal observation with honest uncertainty — not a clinical conclusion.
            </p>
            <p style={s.safetyBody}>
              If you have a diagnosed medical condition or are experiencing serious symptoms, please see a healthcare provider. N=1 is for the questions the system can't answer because they're not about whether you're sick — they're about what's specifically true for you.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={s.ctaSection}>
        <div style={s.ctaOrb} />
        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle}>Your body already has the data.<br />Let's find the signal.</h2>
          <p style={s.ctaSub}>Start with a hunch. End with something worth acting on.</p>
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
            A personal wellness experimentation tool. Not a medical device. Always consult a healthcare provider for medical decisions.
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
    background: 'radial-gradient(circle, #fb923c15, transparent 65%)',
    pointerEvents: 'none',
  },
  heroOrb2: {
    position: 'absolute',
    width: '600px', height: '600px',
    bottom: '-200px', left: '-150px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #818cf812, transparent 65%)',
    pointerEvents: 'none',
  },
  heroInner: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '720px',
    margin: '0 auto',
    textAlign: 'center',
  },
  eyebrow: {
    display: 'inline-block',
    fontSize: '11px',
    color: '#fb923c',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontFamily: "'DM Mono', monospace",
    marginBottom: '28px',
    padding: '5px 14px',
    background: '#fb923c10',
    borderRadius: '20px',
    border: '1px solid #fb923c22',
  },
  heroTitle: {
    fontSize: 'clamp(38px, 6vw, 68px)',
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
    fontSize: '17px',
    color: '#ffffff65',
    lineHeight: 1.7,
    maxWidth: '500px',
    margin: '0 auto 40px',
    fontWeight: 300,
  },
  heroCta: {
    background: '#fb923c',
    border: 'none',
    borderRadius: '12px',
    padding: '15px 30px',
    fontSize: '15px',
    fontWeight: 500,
    color: '#06080e',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    display: 'block',
    margin: '0 auto 14px',
  },
  heroNote: {
    fontSize: '12px',
    color: '#ffffff28',
    letterSpacing: '0.02em',
  },
  storySection: {
    padding: '80px 24px',
    borderTop: '1px solid #ffffff08',
    borderBottom: '1px solid #ffffff08',
    background: 'rgba(251,146,60,0.025)',
  },
  storyInner: {
    maxWidth: '640px',
    margin: '0 auto',
  },
  storyQuote: {
    position: 'relative',
    paddingLeft: '28px',
    borderLeft: '2px solid #fb923c35',
  },
  quoteMark: {
    fontSize: '72px',
    color: '#fb923c18',
    fontFamily: "'DM Serif Display', serif",
    lineHeight: 0.8,
    marginBottom: '20px',
  },
  quoteText: {
    fontSize: '16px',
    color: '#ffffffcc',
    lineHeight: 1.85,
    marginBottom: '18px',
    fontWeight: 300,
  },
  quoteAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #ffffff08',
  },
  quoteAvatar: {
    width: '38px', height: '38px',
    borderRadius: '50%',
    background: '#fb923c18',
    border: '1px solid #fb923c35',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 500,
    color: '#fb923c',
    flexShrink: 0,
  },
  quoteName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#ffffffcc',
    marginBottom: '2px',
  },
  quoteRole: {
    fontSize: '11px',
    color: '#ffffff35',
  },
  section: {
    padding: '100px 24px',
  },
  sectionInner: {
    maxWidth: '720px',
    margin: '0 auto',
  },
  sectionEyebrow: {
    fontSize: '11px',
    color: '#ffffff30',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontFamily: "'DM Mono', monospace",
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: 'clamp(26px, 4vw, 44px)',
    fontWeight: 300,
    fontFamily: "'DM Serif Display', serif",
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    color: '#ffffffee',
    marginBottom: '24px',
  },
  sectionBody: {
    fontSize: '15px',
    color: '#ffffff65',
    lineHeight: 1.8,
    marginBottom: '18px',
    maxWidth: '580px',
    fontWeight: 300,
  },
  problemCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '14px',
    marginTop: '48px',
  },
  problemCard: {
    background: 'rgba(255,255,255,0.035)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '22px',
  },
  problemCardTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#ffffffcc',
    marginBottom: '8px',
    letterSpacing: '-0.01em',
  },
  problemCardBody: {
    fontSize: '13px',
    color: '#ffffff50',
    lineHeight: 1.65,
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '48px',
  },
  step: {
    display: 'flex',
    gap: '24px',
    paddingBottom: '36px',
  },
  stepNum: {
    fontSize: '12px',
    fontWeight: 500,
    fontFamily: "'DM Mono', monospace",
    width: '40px',
    height: '40px',
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
    paddingBottom: '36px',
    borderBottom: '1px solid #ffffff05',
  },
  stepTitle: {
    fontSize: '17px',
    fontWeight: 400,
    color: '#ffffffee',
    marginBottom: '10px',
    letterSpacing: '-0.01em',
  },
  stepBody: {
    fontSize: '14px',
    color: '#ffffff55',
    lineHeight: 1.75,
    fontWeight: 300,
  },
  forCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '36px',
  },
  forCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '16px 20px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
  },
  forDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#ffffff30',
    flexShrink: 0,
    marginTop: '7px',
  },
  forText: {
    fontSize: '14px',
    color: '#ffffff70',
    lineHeight: 1.6,
  },
  safetyCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '14px',
    padding: '24px',
  },
  safetyTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#ffffff60',
    marginBottom: '12px',
    letterSpacing: '0.01em',
  },
  safetyBody: {
    fontSize: '12px',
    color: '#ffffff35',
    lineHeight: 1.75,
    marginBottom: '10px',
  },
  ctaSection: {
    position: 'relative',
    padding: '120px 24px',
    textAlign: 'center',
    overflow: 'hidden',
    borderTop: '1px solid #ffffff08',
  },
  ctaOrb: {
    position: 'absolute',
    width: '700px', height: '700px',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #fb923c0c, transparent 60%)',
    pointerEvents: 'none',
  },
  ctaInner: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '560px',
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: 'clamp(26px, 4vw, 44px)',
    fontWeight: 300,
    fontFamily: "'DM Serif Display', serif",
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    color: '#ffffffee',
    marginBottom: '16px',
  },
  ctaSub: {
    fontSize: '15px',
    color: '#ffffff45',
    marginBottom: '40px',
    fontWeight: 300,
  },
  ctaBtn: {
    background: '#fb923c',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '15px',
    fontWeight: 500,
    color: '#06080e',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    display: 'block',
    margin: '0 auto 14px',
  },
  ctaNote: {
    fontSize: '11px',
    color: '#ffffff22',
  },
  footer: {
    borderTop: '1px solid #ffffff08',
    padding: '28px 40px',
  },
  footerInner: {
    maxWidth: '720px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    flexWrap: 'wrap',
  },
  footerLogo: {
    fontSize: '15px',
    fontWeight: 500,
    fontFamily: "'DM Mono', monospace",
    color: '#ffffff40',
  },
  footerNote: {
    fontSize: '11px',
    color: '#ffffff20',
    lineHeight: 1.5,
    maxWidth: '380px',
    flex: 1,
  },
  footerLinks: {
    display: 'flex',
    gap: '16px',
  },
  footerLink: {
    background: 'none',
    border: 'none',
    color: '#ffffff30',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
}