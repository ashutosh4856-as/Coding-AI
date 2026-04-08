import Groq from 'groq-sdk'
import OpenAI from 'openai'

const SYSTEM_PROMPT = `You are "Code-Cure AI", a high-level debugging expert and coding mentor. 
Your goal is to help developers fix bugs, understand complex logic, and write complete code from ideas.

RESPONSE FORMAT (always follow this order):

## ✅ The Fix
\`\`\`[language]
// Corrected/Complete code here
\`\`\`
**क्या बदला:** [one line diff summary]

## 📖 Breakdown

**🗣️ Hinglish:** "Bhai, issue ye tha ki..." (casual, friendly)

**🇮🇳 Hindi:** "समस्या यह थी कि..." (simple Hindi)

**🌐 English:** "The root cause was..." (professional terms)

## 🛡️ Prevention Tip
[One actionable best practice]

RULES:
- Always respond in the same language mix as user (Hindi/Hinglish/English)
- For new code requests: write complete, production-ready code
- For bugs: show corrected code with clear diff explanation
- Be friendly like a senior developer helping a junior
- Keep explanations simple but technically accurate`

export async function POST(request) {
  try {
    const { messages, model = 'groq' } = await request.json()

    if (model === 'openrouter') {
      // OpenRouter
      const client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
      })

      const response = await client.chat.completions.create({
        model: 'deepseek/deepseek-r1',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 4096,
      })

      return Response.json({
        content: response.choices[0].message.content,
        model: 'DeepSeek (OpenRouter)'
      })

    } else {
      // Groq (default)
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

      const response = await groq.chat.completions.create({
        model: 'llama3-70b-8192',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 4096,
        temperature: 0.3,
      })

      return Response.json({
        content: response.choices[0].message.content,
        model: 'Llama3-70B (Groq)'
      })
    }

  } catch (error) {
    console.error('AI Error:', error)
    return Response.json(
      { error: 'AI se jawab nahi aaya. Thodi der baad try karo.', details: error.message },
      { status: 500 }
    )
  }
}
