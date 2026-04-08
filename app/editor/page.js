'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Play, Upload, Plus, Trash2, FolderPlus, FilePlus,
  Github, Loader2, ChevronRight, ChevronDown, File, Folder,
  Terminal, X, Check, AlertCircle, Save
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { getUser, getUserChats, createChat, saveMessage, getChatMessages, deleteChat } from '@/lib/supabase'
import { pushToGitHub, getUserRepos, getGitHubUser } from '@/lib/github'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c',
  'rust', 'go', 'php', 'ruby', 'kotlin', 'bash'
]

const FILE_ICONS = {
  js: '🟡', ts: '🔵', py: '🐍', java: '☕', cpp: '⚙️',
  html: '🌐', css: '🎨', json: '📋', md: '📝', txt: '📄',
}

function getFileIcon(name) {
  const ext = name.split('.').pop()
  return FILE_ICONS[ext] || '📄'
}

export default function EditorPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [chats, setChats] = useState([])

  // Editor state
  const [files, setFiles] = useState([{ name: 'main.py', content: '# Code-Cure AI Editor\nprint("Hello, World!")', language: 'python' }])
  const [activeFile, setActiveFile] = useState(0)
  const [language, setLanguage] = useState('python')

  // Run state
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [outputType, setOutputType] = useState('') // success | error

  // GitHub state
  const [showGitHub, setShowGitHub] = useState(false)
  const [ghToken, setGhToken] = useState('')
  const [ghRepo, setGhRepo] = useState('')
  const [ghNewRepo, setGhNewRepo] = useState(false)
  const [ghPushing, setGhPushing] = useState(false)
  const [ghResult, setGhResult] = useState(null)
  const [ghUser, setGhUser] = useState(null)
  const [savedToken, setSavedToken] = useState('')

  useEffect(() => {
    checkAuth()
    const token = localStorage.getItem('gh_token')
    if (token) { setSavedToken(token); setGhToken(token) }
  }, [])

  const checkAuth = async () => {
    const u = await getUser()
    if (!u) { router.push('/'); return }
    setUser(u)
    const { data } = await getUserChats(u.id)
    setChats(data || [])
  }

  const runCode = async () => {
    setRunning(true)
    setOutput('Running...')
    setOutputType('')
    try {
      const res = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: files[activeFile]?.language || language,
          code: files[activeFile]?.content || '',
        })
      })
      const data = await res.json()
      if (data.error) { setOutput(data.error); setOutputType('error'); return }
      if (data.stderr) { setOutput(data.stderr); setOutputType('error') }
      else { setOutput(data.stdout || '(No output)'); setOutputType('success') }
    } catch (err) {
      setOutput('Network error: ' + err.message)
      setOutputType('error')
    }
    setRunning(false)
  }

  const addFile = () => {
    const name = prompt('File ka naam? (e.g., helper.py)')
    if (!name) return
    const ext = name.split('.').pop()
    const langMap = { py: 'python', js: 'javascript', ts: 'typescript', java: 'java', cpp: 'cpp' }
    setFiles(prev => [...prev, { name, content: '', language: langMap[ext] || 'python' }])
    setActiveFile(files.length)
  }

  const removeFile = (idx) => {
    if (files.length === 1) return
    setFiles(prev => prev.filter((_, i) => i !== idx))
    setActiveFile(Math.max(0, idx - 1))
  }

  const updateFileContent = (content) => {
    setFiles(prev => prev.map((f, i) => i === activeFile ? { ...f, content } : f))
  }

  const verifyGitHub = async () => {
    const u = await getGitHubUser(ghToken)
    if (u.login) {
      setGhUser(u)
      localStorage.setItem('gh_token', ghToken)
      setSavedToken(ghToken)
    }
  }

  const pushCode = async () => {
    if (!ghToken || !ghRepo) return
    setGhPushing(true)
    setGhResult(null)
    try {
      const filesToPush = files.map(f => ({ path: f.name, content: f.content }))
      const owner = ghUser?.login
      const results = await pushToGitHub({
        token: ghToken, owner, repo: ghRepo,
        files: filesToPush,
        commitMessage: 'Code-Cure AI se push kiya',
        createNew: ghNewRepo,
      })
      setGhResult(results)
    } catch (err) {
      setGhResult([{ success: false, error: err.message }])
    }
    setGhPushing(false)
  }

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <Sidebar
        chats={chats}
        onNewChat={() => router.push('/chat')}
        onSelectChat={(id) => router.push('/chat')}
        onDeleteChat={async (id) => { await deleteChat(id); const { data } = await getUserChats(user?.id); setChats(data || []) }}
        user={user}
      />

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-dark-600 bg-dark-800 flex-wrap">
          <span className="text-white font-semibold text-sm ml-12 md:ml-0">⌨️ Editor</span>
          <div className="flex-1" />
          {/* Language selector */}
          <select
            value={files[activeFile]?.language || language}
            onChange={e => {
              const l = e.target.value
              setLanguage(l)
              setFiles(prev => prev.map((f, i) => i === activeFile ? { ...f, language: l } : f))
            }}
            className="bg-dark-700 border border-dark-500 text-slate-300 text-xs rounded-lg px-2 py-1.5 outline-none"
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {/* Run */}
          <button
            onClick={runCode}
            disabled={running}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent-green/20 hover:bg-accent-green/30 border border-accent-green/30 text-accent-green rounded-lg text-xs font-medium transition-colors"
          >
            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            Run
          </button>
          {/* GitHub */}
          <button
            onClick={() => setShowGitHub(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 border border-dark-500 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            <Github className="w-3 h-3" />
            Push to GitHub
          </button>
        </div>

        {/* File tabs */}
        <div className="flex items-center gap-1 px-3 py-1.5 bg-dark-800 border-b border-dark-600 overflow-x-auto">
          {files.map((f, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-t-lg text-xs cursor-pointer group ${
                activeFile === i
                  ? 'bg-dark-700 text-white border border-dark-500 border-b-dark-700'
                  : 'text-slate-400 hover:text-white hover:bg-dark-700'
              }`}
              onClick={() => setActiveFile(i)}
            >
              <span>{getFileIcon(f.name)}</span>
              <span>{f.name}</span>
              {files.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); removeFile(i) }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addFile}
            className="px-2 py-1 text-slate-500 hover:text-white hover:bg-dark-700 rounded text-xs transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 min-h-0">
          <MonacoEditor
            height="100%"
            language={files[activeFile]?.language || language}
            value={files[activeFile]?.content || ''}
            onChange={updateFileContent}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              fontLigatures: true,
              padding: { top: 16 },
              lineNumbers: 'on',
              roundedSelection: true,
              wordWrap: 'on',
              cursorBlinking: 'smooth',
            }}
          />
        </div>

        {/* Output Terminal */}
        <div className="h-40 bg-dark-900 border-t border-dark-600 flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-dark-600">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-500 font-medium">Output</span>
            {output && (
              <button onClick={() => setOutput('')} className="ml-auto text-slate-600 hover:text-slate-400">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <pre className={`flex-1 overflow-y-auto p-4 text-xs font-mono ${
            outputType === 'error' ? 'text-red-400' :
            outputType === 'success' ? 'text-green-400' : 'text-slate-400'
          }`}>
            {output || 'Run button dabao aur output yahan aayega...'}
          </pre>
        </div>
      </div>

      {/* GitHub Modal */}
      {showGitHub && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-white" />
                <h3 className="text-white font-semibold">GitHub Push</h3>
              </div>
              <button onClick={() => setShowGitHub(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Token */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">GitHub Token (Personal Access Token)</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={ghToken}
                    onChange={e => setGhToken(e.target.value)}
                    className="flex-1 bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-accent-purple"
                  />
                  <button onClick={verifyGitHub} className="px-3 py-2 bg-accent-purple/20 hover:bg-accent-purple/30 border border-accent-purple/30 text-accent-purple rounded-xl text-xs">
                    Verify
                  </button>
                </div>
                {ghUser && <p className="text-xs text-green-400 mt-1">✅ Connected: @{ghUser.login}</p>}
              </div>

              {/* Repo */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Repository Name</label>
                <input
                  placeholder="my-project"
                  value={ghRepo}
                  onChange={e => setGhRepo(e.target.value)}
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-accent-purple"
                />
              </div>

              {/* New repo toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={ghNewRepo} onChange={e => setGhNewRepo(e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm text-slate-300">Nayi repo banao (agar exist nahi karti)</span>
              </label>

              {/* Files list */}
              <div className="bg-dark-700 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-2">Push hogi files ({files.length}):</p>
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <span>{getFileIcon(f.name)}</span>
                    <span>{f.name}</span>
                  </div>
                ))}
              </div>

              {/* Push button */}
              <button
                onClick={pushCode}
                disabled={!ghToken || !ghRepo || ghPushing}
                className="w-full py-3 bg-gradient-to-r from-accent-purple to-accent-blue rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {ghPushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {ghPushing ? 'Push ho raha hai...' : 'Push to GitHub'}
              </button>

              {/* Result */}
              {ghResult && (
                <div className="space-y-1">
                  {ghResult.map((r, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${r.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {r.success ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>{r.file} — {r.success ? 'Push ho gaya!' : 'Failed'}</span>
                      {r.url && <a href={r.url} target="_blank" className="underline ml-auto">View</a>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
