'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function IntakePage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send the opening message when user lands on the page
  useEffect(() => {
    if (!started) {
      setStarted(true)
      sendMessage('Hi, I have a health hypothesis I want to test.')
    }
  }, [])

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

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.message }
      ])

      // Intake complete — redirect to the new trial
      if (data.intake_complete && data.trial_id) {
        setTimeout(() => {
          router.push(`/trial/${data.trial_id}`)
        }, 2000)
      }

    } catch (error) {
      console.error('Error:', error)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Something went wrong. Please try again.'
        }
      ])
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

  return (
    <div className="flex flex-col h-screen bg-white">

      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4">
        <h1 className="text-lg font-medium text-gray-900">
          New Experiment
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Tell me what you want to test
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages
          .filter(m => m.role === 'assistant' || 
            m.content !== 'Hi, I have a health hypothesis I want to test.')
          .map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Agent avatar */}
              {message.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <span className="text-white text-xs font-medium">N</span>
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-gray-900 text-white rounded-br-sm'
                    : 'bg-gray-50 text-gray-800 rounded-bl-sm'
                }`}
              >
                {/* Render newlines as line breaks */}
                {message.content.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < message.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
              <span className="text-white text-xs font-medium">N</span>
            </div>
            <div className="bg-gray-50 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                     style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                     style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                     style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your hypothesis..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            Send
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>

    </div>
  )
}