'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, Zap, Code, StopCircle, Cpu } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import MessageBubble from '@/components/MessageBubble'
import { getUser, getUserChats, createChat, saveMessage, getChatMessages, deleteChat, updateChatTitle } from '@/lib/supabase'

const SUGGESTIONS = [
  "Mera React useEffect infinite loop mein hai, fix karo",
  "Python mein REST API kaise banate hain? Pura code do",
  "JavaScript mein async/await aur Promise ka difference batao",
  "CSS flexbox se responsive navbar banao",
  "SQL query optimize karne ke tips do",
]

export default function ChatPage() {
  const router = useRouter()
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const [user, setUser] = useState(null)
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('groq')
  const [thinking, setThinking] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  const checkAuth = async () => {
    const u = await getUser()
    if (!u) { router.push('/'); return }
    setUser(u)
    loadChats(u.id)
  }

  const loadChats = async (userId) => {
    const { data } = await getUserChats(userId)
    setChats(data || [])
  }

  const handleNewChat = () => {
    setActiveChatId(null)
    setMessages([])
    setInput('')
    inputRef.current?.focus()
  }

  const handleSelectChat = async (chatId) => {
    setActiveChatId(chatId)
    const { data } = await getChatMessages(chatId)
    setMessages(data || [])
  }

  const handleDeleteChat = async (chatId) => {
    await deleteChat(chatId)
    if (activeChatId === chatId) handleNewChat()
    loadChats(user.id)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setThinking('AI soch raha hai...')

    // Chat create karo if not exists
    let chatId = activeChatId
    if (!chatId) {
      const title = input.slice(0, 50) + (input.length > 50 ? '...' : '')
      const { data: newChat } = await createChat(user.id, title)
      chatId = newChat?.id
      setActiveChatId(chatId)
      loadChats(user.id)
    }

    // Save user message
    if (chatId) await saveMessage(chatId, 'user', userMsg.content)

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, model }),
      })

      const data = await res.json()
      
      if (data.error) throw new Error(data.error)

      const aiMsg = { role: 'assistant', content: data.content }
      setMessages(prev => [...prev, aiMsg])

      // Save AI message
      if (chatId) {
        await saveMessage(chatId, 'assistant', data.content)
        // Update title after first response
        if (messages.length === 0) {
          await updateChatTitle(chatId, userMsg.content.slice(0, 50))
          loadChats(user.id)
        }
      }

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ **Error:** ${err.message}\n\nThodi der baad try karo.`
      }])
    }

    setLoading(false)
    setThinking('')
  }

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        user={user}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600 bg-dark-800">
          <div className="flex items-center gap-2 ml-12 md:ml-0">
            <Zap className="w-4 h-4 text-accent-purple" />
            <span className="text-white font-semibold text-sm">Code-Cure AI</span>
          </div>
          {/* Model selector */}
          <div className="flex items-center gap-1 bg-dark-700 rounded-lg p-1">
            {[
              { id: 'groq', label: '⚡ Groq' },
              { id: 'openrouter', label: '🧠 DeepSeek' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  model === m.id ? 'bg-accent-purple text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Code-Cure AI</h2>
                <p className="text-slate-400">Apna error paste karo ya koi bhi coding sawaal pucho</p>
              </div>
              <div className="grid gap-2 w-full max-w-lg">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(s); inputRef.current?.focus() }}
                    className="text-left p-3 rounded-xl bg-dark-700 hover:bg-dark-600 border border-dark-500 hover:border-accent-purple/30 text-sm text-slate-400 hover:text-white transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {thinking && (
            <div className="flex gap-3 msg-appear">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-pink-600 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="bg-dark-700 border border-dark-500 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {thinking}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-dark-600 bg-dark-800">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 bg-dark-700 border border-dark-500 rounded-2xl p-2 focus-within:border-accent-purple/50 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Error paste karo ya coding sawaal likho... (Enter = Send, Shift+Enter = New Line)"
                className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm resize-none outline-none max-h-32 min-h-[40px] py-2 px-2"
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="self-end p-2.5 rounded-xl bg-accent-purple hover:bg-accent-purple/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {loading
                  ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                  : <Send className="w-4 h-4 text-white" />
                }
              </button>
            </div>
            <p className="text-xs text-slate-600 text-center mt-2">
              Code-Cure AI — Groq (Llama3-70B) + OpenRouter (DeepSeek)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
