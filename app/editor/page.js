'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Play, Upload, Plus, X, Github, Loader2, File, Terminal, Check, AlertCircle, ChevronRight, Folder } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { getUser, getUserChats, createChat, deleteChat } from '@/lib/supabase'
import { pushToGitHub, getGitHubUser } from '@/lib/github'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const LANGUAGES = ['javascript','typescript','python','java','cpp','c','rust','go','php','ruby','kotlin','bash','html','css','json']

const LANG_ICONS = { javascript:'🟡', typescript:'🔵', python:'🐍', java:'☕', cpp:'⚙️', html:'🌐', css:'🎨', json:'📋', rust:'🦀', go:'🐹' }

const LANG_DEFAULTS = {
  python: '# Python\nprint("Hello, World!")',
  javascript: '// JavaScript\nconsole.log("Hello, World!");',
  typescript: '// TypeScript\nconst greet = (name: string): string => `Hello, ${name}!`;\nconsole.log(greet("World"));',
  java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}',
  cpp: '#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello, World!" << endl;\n  return 0;\n}',
  html: '<!DOCTYPE html>\n<html>\n<head><title>My Page</title></head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>',
}

export default function EditorPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [chats, setChats] = useState([])
  const [files, setFiles] = useState([{ id: 1, name: 'main.py', content: LANG_DEFAULTS.python, language: 'python' }])
  const [activeFile, setActiveFile] = useState(0)
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [outputType, setOutputType] = useState('')
  const [showGitHub, setShowGitHub] = useState(false)
  const [ghToken, setGhToken] = useState('')
  const [ghRepo, setGhRepo] = useState('')
  const [ghNewRepo, setGhNewRepo] = useState(false)
  const [ghPushing, setGhPushing] = useState(false)
  const [ghResult, setGhResult] = useState(null)
  const [ghUser, setGhUser] = useState(null)
  const [stdin, setStdin] = useState('')
  const [showStdin, setShowStdin] = useState(false)

  useEffect(() => {
    checkAuth()
    const token = localStorage.getItem('gh_token')
    if (token) { setGhToken(token); verifyGH(token) }
  }, [])

  const checkAuth = async () => {
    const u = await getUser()
    if (!u) { router.push('/'); return }
    setUser(u)
    const { data } = await getUserChats(u.id)
    setChats(data || [])
  }

  const verifyGH = async (token) => {
    try { const u = await getGitHubUser(token); if (u.login) setGhUser(u) } catch {}
  }

  const runCode = async () => {
    setRunning(true)
    setOutput('⏳ Running...')
    setOutputType('')
    try {
      const res = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: files[activeFile]?.language, code: files[activeFile]?.content, stdin })
      })
      const data = await res.json()
      if (data.error) { setOutput('❌ ' + data.error); setOutputType('error'); return }
      if (data.stderr && !data.stdout) { setOutput(data.stderr); setOutputType('error') }
      else {
        setOutput((data.stdout || '(No output)') + (data.stderr ? '\n\n⚠️ Warnings:\n' + data.stderr : ''))
        setOutputType('success')
      }
    } catch (err) {
      setOutput('❌ Network error: ' + err.message)
      setOutputType('error')
    }
    setRunning(false)
  }

  const addFile = () => {
    const name = prompt('File ka naam? (jaise: helper.py, utils.js)')
    if (!name) return
    const ext = name.split('.').pop()
    const langMap = { py: 'python', js: 'javascript', ts: 'typescript', java: 'java', cpp: 'cpp', c: 'c', html: 'html', css: 'css', json: 'json' }
    const lang = langMap[ext] || 'python'
    setFiles(prev => [...prev, { id: Date.now(), name, content: LANG_DEFAULTS[lang] || '', language: lang }])
    setActiveFile(files.length)
  }

  const removeFile = (idx) => {
    if (files.length === 1) return
    setFiles(prev => prev.filter((_, i) => i !== idx))
    setActiveFile(Math.max(0, idx - 1))
  }

  const updateContent = (content) => {
    setFiles(prev => prev.map((f, i) => i === activeFile ? { ...f, content } : f))
  }

  const changeLang = (lang) => {
    setFiles(prev => prev.map((f, i) => i === activeFile ? { ...f, language: lang } : f))
  }

  const pushCode = async () => {
    if (!ghToken || !ghRepo) return
    setGhPushing(true)
    setGhResult(null)
    try {
      const results = await pushToGitHub({
        token: ghToken, owner: ghUser?.login, repo: ghRepo,
        files: files.map(f => ({ path: f.name, content: f.content })),
        commitMessage: 'Code-Cure AI se push', createNew: ghNewRepo
      })
      setGhResult(results)
      localStorage.setItem('gh_token', ghToken)
    } catch (err) { setGhResult([{ success: false, error: err.message }]) }
    setGhPushing(false)
  }

  const currentFile = files[activeFile]

  return (
    <div className="flex h-screen bg-[#1e1e1e] overflow-hidden font-mono">
      <Sidebar chats={chats} onNewChat={() => router.push('/chat')} onSelectChat={() => router.push('/chat')}
        onDeleteChat={async (id) => { await deleteChat(id); const { data } = await getUserChats(user?.id); setChats(data || []) }} user={user} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* VS Code style title bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#323233] border-b border-[#252526] ml-0">
          <span className="text-white font-semibold text-sm ml-12 md:ml-0">⌨️ Code Editor</span>
          <div className="flex-1" />
          <select value={currentFile?.language} onChange={e => changeLang(e.target.value)}
            className="bg-[#3c3c3c] border border-[#555] text-slate-200 text-xs rounded px-2 py-1 outline-none">
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button onClick={() => setShowStdin(!showStdin)}
            className="px-2 py-1 text-xs bg-[#3c3c3c] hover:bg-[#4c4c4c] text-slate-300 rounded border border-[#555] transition-colors">
            📥 Input
          </button>
          <button onClick={runCode} disabled={running}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50">
            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            Run
          </button>
          <button onClick={() => setShowGitHub(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-slate-200 rounded text-xs border border-[#555] transition-colors">
            <Github className="w-3 h-3" />
            Push
          </button>
        </div>

        {/* File tabs - VS Code style */}
        <div className="flex items-center bg-[#252526] border-b border-[#1e1e1e] overflow-x-auto">
          {files.map((f, i) => (
            <div key={f.id} onClick={() => setActiveFile(i)}
              className={`flex items-center gap-2 px-4 py-2 text-xs cursor-pointer border-r border-[#1e1e1e] group min-w-max transition-colors ${
                activeFile === i ? 'bg-[#1e1e1e] text-white border-t border-t-blue-500' : 'bg-[#2d2d2d] text-slate-400 hover:bg-[#2a2a2a] hover:text-slate-200'
              }`}>
              <span>{LANG_ICONS[f.name.split('.').pop()] || '📄'}</span>
              <span>{f.name}</span>
              {files.length > 1 && (
                <button onClick={e => { e.stopPropagation(); removeFile(i) }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all ml-1">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button onClick={addFile} className="px-3 py-2 text-slate-500 hover:text-white hover:bg-[#2a2a2a] transition-colors text-lg">+</button>
        </div>

        {/* Stdin input */}
        {showStdin && (
          <div className="bg-[#252526] border-b border-[#1e1e1e] px-4 py-2">
            <p className="text-xs text-slate-400 mb-1">Program Input (stdin):</p>
            <textarea value={stdin} onChange={e => setStdin(e.target.value)}
              placeholder="Agar program kuch input maange to yahan likho..."
              className="w-full bg-[#1e1e1e] text-slate-200 text-xs rounded p-2 outline-none resize-none h-16 border border-[#3c3c3c] font-mono" />
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 min-h-0">
          <MonacoEditor
            height="100%"
            language={currentFile?.language || 'python'}
            value={currentFile?.content || ''}
            onChange={updateContent}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
              fontLigatures: true,
              padding: { top: 12, bottom: 12 },
              lineNumbers: 'on',
              roundedSelection: true,
              wordWrap: 'on',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              formatOnPaste: true,
              formatOnType: true,
              autoIndent: 'full',
              tabSize: 2,
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true, indentation: true },
              renderWhitespace: 'selection',
              suggest: { showKeywords: true, showSnippets: true },
            }}
          />
        </div>

        {/* Terminal output - VS Code style */}
        <div className="h-44 bg-[#1e1e1e] border-t border-[#252526] flex flex-col">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-[#252526] border-b border-[#1e1e1e]">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-semibold">TERMINAL</span>
            {outputType === 'success' && <span className="text-xs text-green-400 ml-auto">✅ Success</span>}
            {outputType === 'error' && <span className="text-xs text-red-400 ml-auto">❌ Error</span>}
            {output && <button onClick={() => setOutput('')} className="text-slate-600 hover:text-slate-400 ml-2"><X className="w-3 h-3" /></button>}
          </div>
          <pre className={`flex-1 overflow-y-auto p-4 text-xs font-mono leading-relaxed ${
            outputType === 'error' ? 'text-red-400' : outputType === 'success' ? 'text-green-300' : 'text-slate-400'
          }`}>
            {output || '$ Run button dabao — output yahan aayega...'}
          </pre>
        </div>
      </div>

      {/* GitHub Modal */}
      {showGitHub && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#252526] border border-[#3c3c3c] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-white" />
                <h3 className="text-white font-bold">GitHub Push</h3>
              </div>
              <button onClick={() => setShowGitHub(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">GitHub Personal Access Token</label>
                <div className="flex gap-2">
                  <input type="password" placeholder="ghp_xxxxxxxxxxxx" value={ghToken} onChange={e => setGhToken(e.target.value)}
                    className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500" />
                  <button onClick={() => verifyGH(ghToken)} className="px-3 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-400 rounded-lg text-xs">Verify</button>
                </div>
                {ghUser && <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> @{ghUser.login}</p>}
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Repository Name</label>
                <input placeholder="my-project" value={ghRepo} onChange={e => setGhRepo(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={ghNewRepo} onChange={e => setGhNewRepo(e.target.checked)} />
                <span className="text-sm text-slate-300">Nayi repository banao</span>
              </label>
              <div className="bg-[#1e1e1e] rounded-lg p-3 border border-[#3c3c3c]">
                <p className="text-xs text-slate-400 mb-2">Files ({files.length}):</p>
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300 py-0.5">
                    <File className="w-3 h-3 text-slate-500" />{f.name}
                  </div>
                ))}
              </div>
              <button onClick={pushCode} disabled={!ghToken || !ghRepo || ghPushing}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-colors">
                {ghPushing ? <><Loader2 className="w-4 h-4 animate-spin" /> Push ho raha hai...</> : <><Upload className="w-4 h-4" /> Push to GitHub</>}
              </button>
              {ghResult && (
                <div className="space-y-1">
                  {ghResult.map((r, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${r.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {r.success ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {r.file} — {r.success ? '✅ Push ho gaya!' : '❌ Failed'}
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
  
