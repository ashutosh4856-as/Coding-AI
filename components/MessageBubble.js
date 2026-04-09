'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState } from 'react'
import { Copy, Check, Code2, User } from 'lucide-react'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-[#2d2d4a] hover:bg-[#3d3d5a] text-slate-300 hover:text-white transition-all"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 msg-appear">
        <div className="max-w-[75%]">
          <div className="bg-violet-600 rounded-2xl rounded-tr-sm px-4 py-3 text-white text-sm leading-relaxed">
            <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
          </div>
          <div className="flex justify-end mt-1">
            <CopyButton text={message.content} />
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 msg-appear">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-700 to-pink-600 flex items-center justify-center flex-shrink-0 mt-1">
        <Code2 className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 max-w-[85%]">
        <div className="text-slate-200 text-sm leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                const codeText = String(children).replace(/\n$/, '')
                if (!inline && match) {
                  return (
                    <div className="rounded-xl overflow-hidden my-3 border border-[#2d2d4a]">
                      <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d14] border-b border-[#2d2d4a]">
                        <span className="text-xs text-violet-400 font-mono font-semibold">{match[1].toUpperCase()}</span>
                        <CopyButton text={codeText} />
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, background: '#0d0d14', padding: '1rem', fontSize: '13px' }}
                        {...props}
                      >
                        {codeText}
                      </SyntaxHighlighter>
                    </div>
                  )
                }
                return (
                  <code className="bg-[#1a1a27] text-violet-400 px-1.5 py-0.5 rounded text-xs font-mono border border-[#2d2d4a]" {...props}>
                    {children}
                  </code>
                )
              },
              p: ({ children }) => <p className="mb-3 last:mb-0 leading-7">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1.5 text-slate-300">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1.5 text-slate-300">{children}</ol>,
              li: ({ children }) => <li className="leading-6">{children}</li>,
              strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
              h1: ({ children }) => <h1 className="text-white font-bold text-xl mt-4 mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-white font-bold text-lg mt-4 mb-2 flex items-center gap-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-white font-semibold mt-3 mb-1">{children}</h3>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-violet-500 pl-4 text-slate-400 my-3 italic">{children}</blockquote>
              ),
              hr: () => <hr className="border-[#2d2d4a] my-4" />,
              table: ({ children }) => (
                <div className="overflow-x-auto my-3">
                  <table className="w-full text-sm border-collapse border border-[#2d2d4a] rounded-xl">{children}</table>
                </div>
              ),
              th: ({ children }) => <th className="bg-[#1a1a27] text-white font-semibold px-4 py-2 border border-[#2d2d4a] text-left">{children}</th>,
              td: ({ children }) => <td className="px-4 py-2 border border-[#2d2d4a] text-slate-300">{children}</td>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="mt-2">
          <CopyButton text={message.content} />
        </div>
      </div>
    </div>
  )
        }
        
