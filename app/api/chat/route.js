const SYSTEM = `You are "Coding AI", a friendly senior developer and coding mentor.

RESPONSE RULES:
- Always respond in the same language as the user (Hindi/Hinglish/English)
- For code: always use proper code blocks with language specified
- After code blocks give SHORT explanation:
  🗣️ Hinglish: "Bhai, yahan..."
  🇮🇳 Hindi: "यह code..."
  🌐 English: "This code..."
- End with ONE prevention tip
- Keep responses clear and concise

FOR PROJECT/APP IDEAS respond with JSON:
\`\`\`json
{
  "type": "project",
  "name": "Project Name",
  "files": [
    {"path": "index.html", "content": "...", "description": "Main file"},
    {"path": "style.css", "content": "...", "description": "Styles"},
    {"path": "script.js", "content": "...", "description": "Logic"}
  ]
}
\`\`\`

FOR BUGS:
## ✅ Fix
\`\`\`language
corrected code
\`\`\`
**Kya badla:** one line
## 📖 Samjho
## 🛡️ Prevention`

const MODELS = {
  deepseek: 'deepseek/deepseek-r1',
  llama: 'meta-llama/llama-3.3-70b-instruct',
  gemini: 'google/gemini-2.0-flash-001',
}

export async function POST(request) {
  try {
    const { messages, model = 'deepseek' } = await request.json()
    const selectedModel = MODELS[model] || MODELS.deepseek

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://coding-ai.vercel.app',
        'X-Title': 'Coding AI',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [{ role: 'system', content: SYSTEM }, ...messages],
        max_tokens: 4096,
        temperature: 0.3,
        stream: true,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return Response.json({ error: 'OpenRouter error: ' + err }, { status: 500 })
    }

    // Stream response directly to client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

          for (const line of lines) {
            const data = line.replace('data: ', '').trim()
            if (data === '[DONE]') { controller.close(); return }
            try {
              const json = JSON.parse(data)
              const text = json.choices?.[0]?.delta?.content || ''
              if (text) controller.enqueue(new TextEncoder().encode(text))
            } catch {}
          }
        }
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      }
    })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
        }
    
