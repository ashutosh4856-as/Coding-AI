import Groq from 'groq-sdk'
import OpenAI from 'openai'

const CHAT_SYSTEM = `You are "Coding AI", a friendly senior developer and coding mentor.

RESPONSE RULES:
- Always respond in the same language as the user (Hindi/Hinglish/English)
- Keep responses concise and clear — not too long
- For code: always use proper code blocks with language specified
- Every code block must have a comment explaining what it does
- After every code block, give a SHORT explanation in 3 parts:
  🗣️ Hinglish: "Bhai, yahan kya hua..."
  🇮🇳 Hindi: "यह code..."  
  🌐 English: "This code..."
- End with ONE prevention tip

FOR PROJECT/APP IDEAS:
When user asks to build an app or project, respond with this EXACT JSON format:
\`\`\`json
{
  "type": "project",
  "name": "Project Name",
  "files": [
    {"path": "index.html", "content": "full file content here", "description": "Main HTML file"},
    {"path": "style.css", "content": "full css content", "description": "Styles"},
    {"path": "script.js", "content": "full js content", "description": "Logic"}
  ]
}
\`\`\`

FOR BUGS/ERRORS:
## ✅ Fix
\`\`\`language
corrected code
\`\`\`
**Kya badla:** one line

## 📖 Samjho
🗣️ Hinglish | 🇮🇳 Hindi | 🌐 English

## 🛡️ Prevention
One tip`

export async function POST(request) {
  try {
    const { messages, model = 'groq' } = await request.json()

    if (model === 'openrouter') {
      const client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
        defaultHeaders: { 'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://code-cure-ai.vercel.app' }
      })
      const response = await client.chat.completions.create({
        model: 'deepseek/deepseek-r1',
        messages: [{ role: 'system', content: CHAT_SYSTEM }, ...messages],
        max_tokens: 4096,
      })
      return Response.json({ content: response.choices[0].message.content, model: 'DeepSeek' })
    } else {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
      const response = await groq.chat.completions.create({
        model: 'llama3-70b-8192',
        messages: [{ role: 'system', content: CHAT_SYSTEM }, ...messages],
        max_tokens: 4096,
        temperature: 0.3,
      })
      return Response.json({ content: response.choices[0].message.content, model: 'Groq' })
    }
  } catch (error) {
    console.error('AI Error:', error)
    return Response.json({ error: 'AI se jawab nahi aaya: ' + error.message }, { status: 500 })
  }
    }
    
