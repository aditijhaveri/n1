// 'use client'

// import { useState, useRef, useEffect } from 'react'
// import { useRouter } from 'next/navigation'

// type Message = {
//   role: 'user' | 'assistant'
//   content: string
// }

// export default function IntakePage() {
//   const router = useRouter()
//   const [messages, setMessages] = useState<Message[]>([])
//   const [input, setInput] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [started, setStarted] = useState(false)
//   const bottomRef = useRef<HTMLDivElement>(null)

//   // Auto-scroll to latest message
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   // Send the opening message when user lands on the page
//   useEffect(() => {
//     if (!started) {
//       setStarted(true)
//       sendMessage('Hi, I have a health hypothesis I want to test.')
//     }
//   }, [])

//   async function sendMessage(userText: string) {
//     const newMessages: Message[] = [
//       ...messages,
//       { role: 'user', content: userText }
//     ]

//     setMessages(newMessages)
//     setInput('')
//     setLoading(true)

//     try {
//       const response = await fetch('/api/intake', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ messages: newMessages }),
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.error || 'Something went wrong')
//       }

//       setMessages([
//         ...newMessages,
//         { role: 'assistant', content: data.message }
//       ])

//       // Intake complete — redirect to the new trial
//       if (data.intake_complete && data.trial_id) {
//         setTimeout(() => {
//           router.push(`/trial/${data.trial_id}`)
//         }, 2000)
//       }

//     } catch (error) {
//       console.error('Error:', error)
//       setMessages([
//         ...newMessages,
//         {
//           role: 'assistant',
//           content: 'Something went wrong. Please try again.'
//         }
//       ])
//     } finally {
//       setLoading(false)
//     }
//   }

//   function handleSubmit(e: React.FormEvent) {
//     e.preventDefault()
//     if (!input.trim() || loading) return
//     sendMessage(input.trim())
//   }

//   function handleKeyDown(e: React.KeyboardEvent) {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       handleSubmit(e as any)
//     }
//   }

//   return (
//     <div className="flex flex-col h-screen bg-white">

//       {/* Header */}
//       <div className="border-b border-gray-100 px-6 py-4">
//         <h1 className="text-lg font-medium text-gray-900">
//           New Experiment
//         </h1>
//         <p className="text-sm text-gray-500 mt-0.5">
//           Tell me what you want to test
//         </p>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
//         {messages
//           .filter(m => m.role === 'assistant' || 
//             m.content !== 'Hi, I have a health hypothesis I want to test.')
//           .map((message, index) => (
//             <div
//               key={index}
//               className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
//             >
//               {/* Agent avatar */}
//               {message.role === 'assistant' && (
//                 <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
//                   <span className="text-white text-xs font-medium">N</span>
//                 </div>
//               )}

//               <div
//                 className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
//                   message.role === 'user'
//                     ? 'bg-gray-900 text-white rounded-br-sm'
//                     : 'bg-gray-50 text-gray-800 rounded-bl-sm'
//                 }`}
//               >
//                 {/* Render newlines as line breaks */}
//                 {message.content.split('\n').map((line, i) => (
//                   <span key={i}>
//                     {line}
//                     {i < message.content.split('\n').length - 1 && <br />}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           ))}

//         {/* Loading indicator */}
//         {loading && (
//           <div className="flex justify-start">
//             <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
//               <span className="text-white text-xs font-medium">N</span>
//             </div>
//             <div className="bg-gray-50 rounded-2xl rounded-bl-sm px-4 py-3">
//               <div className="flex space-x-1.5">
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
//                      style={{ animationDelay: '0ms' }} />
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
//                      style={{ animationDelay: '150ms' }} />
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
//                      style={{ animationDelay: '300ms' }} />
//               </div>
//             </div>
//           </div>
//         )}

//         <div ref={bottomRef} />
//       </div>

//       {/* Input */}
//       <div className="border-t border-gray-100 px-6 py-4">
//         <form onSubmit={handleSubmit} className="flex items-end gap-3">
//           <textarea
//             value={input}
//             onChange={e => setInput(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Describe your hypothesis..."
//             rows={1}
//             className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
//             style={{ minHeight: '44px', maxHeight: '120px' }}
//           />
//           <button
//             type="submit"
//             disabled={!input.trim() || loading}
//             className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
//           >
//             Send
//           </button>
//         </form>
//         <p className="text-xs text-gray-400 mt-2 text-center">
//           Press Enter to send · Shift+Enter for new line
//         </p>
//       </div>

//     </div>
//   )
// }


'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const STEPS = [
  'Your hunch',
  'History',
  'Refine',
  'Feasibility',
  'Tracking',
  'Measure',
  'Success bar',
  'Game plan',
]

export default function IntakePage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!started) {
      setStarted(true)
      sendMessage('Hi, I have a health hypothesis I want to test.')
    }
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  async function sendMessage(userText: string) {
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userText }
    ]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Something went wrong')

      setMessages([...newMessages, { role: 'assistant', content: data.message }])
      setStep(s => Math.min(s + 1, STEPS.length - 1))

      if (data.intake_complete && data.trial_id) {
        setDone(true)
        setTimeout(() => router.push(`/trial/${data.trial_id}`), 2000)
      }
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return
    sendMessage(input.trim())
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const visibleMessages = messages.filter(m =>
    !(m.role === 'user' && m.content === 'Hi, I have a health hypothesis I want to test.')
  )

  return (
    <div style={s.root}>
      {/* Background orbs */}
      <div style={s.orbTL} />
      <div style={s.orbBR} />

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div>
            <span style={s.logo}>N=1</span>
            <span style={s.headerTitle}>New Experiment</span>
          </div>
          {/* Step progress */}
          <div style={s.stepRow}>
            {STEPS.map((label, i) => (
              <div key={i} style={s.stepItem}>
                <div style={{
                  ...s.stepDot,
                  background: i < step ? '#4ade80' : i === step ? '#ffffff' : '#ffffff18',
                  boxShadow: i === step ? '0 0 8px #ffffff60' : 'none',
                }} />
                {i < STEPS.length - 1 && (
                  <div style={{
                    ...s.stepLine,
                    background: i < step ? '#4ade8040' : '#ffffff10',
                  }} />
                )}
              </div>
            ))}
          </div>
          <span style={s.stepLabel}>{STEPS[Math.min(step, STEPS.length - 1)]}</span>
        </div>
      </header>

      {/* Messages */}
      <div style={s.messages}>
        <div style={s.messagesInner}>

          {/* Intro state */}
          {visibleMessages.length === 0 && !loading && (
            <div style={s.intro}>
              <p style={s.introTitle}>What's your hunch?</p>
              <p style={s.introSub}>Describe what you suspect is affecting your health. We'll turn it into a plan you can actually test.</p>
            </div>
          )}

          {visibleMessages.map((msg, i) => (
            <div key={i} style={{
              ...s.msgRow,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              {msg.role === 'assistant' && (
                <div style={s.avatar}>N</div>
              )}
              <div style={{
                ...s.bubble,
                ...(msg.role === 'user' ? s.bubbleUser : s.bubbleAgent),
              }}>
                {msg.content.split('\n').map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
              <div style={s.avatar}>N</div>
              <div style={{ ...s.bubble, ...s.bubbleAgent }}>
                <div style={s.dots}>
                  <span style={{ ...s.dot, animationDelay: '0ms' }} />
                  <span style={{ ...s.dot, animationDelay: '160ms' }} />
                  <span style={{ ...s.dot, animationDelay: '320ms' }} />
                </div>
              </div>
            </div>
          )}

          {done && (
            <div style={s.doneMsg}>
              Game plan locked in. Taking you to your trial...
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={s.inputArea}>
        <div style={s.inputInner}>
          <form onSubmit={handleSubmit} style={s.form}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              rows={1}
              style={s.textarea}
              disabled={loading || done}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || done}
              style={{
                ...s.sendBtn,
                opacity: (!input.trim() || loading || done) ? 0.35 : 1,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
          <p style={s.hint}>Enter to send · Shift+Enter for new line</p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea { font-family: 'DM Sans', sans-serif; }
        textarea::placeholder { color: #ffffff28; }
        textarea:focus { outline: none; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#080b12',
    fontFamily: "'DM Sans', sans-serif",
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  },
  orbTL: {
    position: 'fixed',
    width: '500px', height: '500px',
    top: '-200px', left: '-100px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #1d4ed825, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  orbBR: {
    position: 'fixed',
    width: '400px', height: '400px',
    bottom: '-150px', right: '-100px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #7c3aed18, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    position: 'relative',
    zIndex: 10,
    borderBottom: '1px solid #ffffff0a',
    background: 'rgba(8,11,18,0.9)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '16px 24px',
    flexShrink: 0,
  },
  headerInner: {
    maxWidth: '680px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logo: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#ffffff',
    fontFamily: "'DM Mono', monospace",
    marginRight: '12px',
  },
  headerTitle: {
    fontSize: '13px',
    color: '#ffffff50',
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    gap: '0px',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'all 0.3s ease',
  },
  stepLine: {
    height: '1px',
    flex: 1,
    transition: 'background 0.3s ease',
  },
  stepLabel: {
    fontSize: '11px',
    color: '#ffffff40',
    whiteSpace: 'nowrap' as const,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.04em',
  },
  messages: {
    flex: 1,
    overflowY: 'auto' as const,
    position: 'relative',
    zIndex: 10,
  },
  messagesInner: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '32px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  intro: {
    textAlign: 'center',
    padding: '48px 24px',
    animation: 'fadeUp 0.5s ease forwards',
  },
  introTitle: {
    fontSize: '22px',
    fontWeight: 400,
    color: '#ffffffcc',
    marginBottom: '10px',
    letterSpacing: '-0.02em',
  },
  introSub: {
    fontSize: '14px',
    color: '#ffffff45',
    lineHeight: 1.6,
    maxWidth: '340px',
    margin: '0 auto',
  },
  msgRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
    animation: 'fadeUp 0.3s ease forwards',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 500,
    color: '#ffffffcc',
    flexShrink: 0,
    fontFamily: "'DM Mono', monospace",
  },
  bubble: {
    maxWidth: '520px',
    borderRadius: '18px',
    padding: '12px 16px',
    fontSize: '14px',
    lineHeight: 1.65,
  },
  bubbleAgent: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#ffffffdd',
    borderBottomLeftRadius: '4px',
  },
  bubbleUser: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: '#ffffff',
    borderBottomRightRadius: '4px',
  },
  dots: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
    padding: '2px 0',
  },
  dot: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#ffffff50',
    animation: 'bounce 1.2s infinite ease-in-out',
  },
  doneMsg: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#4ade80',
    padding: '12px',
    animation: 'fadeUp 0.4s ease forwards',
  },
  inputArea: {
    position: 'relative',
    zIndex: 10,
    borderTop: '1px solid #ffffff0a',
    background: 'rgba(8,11,18,0.9)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '16px 24px 20px',
    flexShrink: 0,
  },
  inputInner: {
    maxWidth: '680px',
    margin: '0 auto',
  },
  form: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '16px',
    padding: '10px 10px 10px 16px',
  },
  textarea: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '14px',
    lineHeight: 1.5,
    resize: 'none' as const,
    minHeight: '24px',
    maxHeight: '120px',
    overflowY: 'auto' as const,
  },
  sendBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: '#ffffff',
    border: 'none',
    color: '#080b12',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'opacity 0.2s',
  },
  hint: {
    fontSize: '11px',
    color: '#ffffff20',
    textAlign: 'center' as const,
    marginTop: '8px',
    letterSpacing: '0.02em',
  },
}