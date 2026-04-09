import Groq from 'groq-sdk'

const PROJECT_SYSTEM = `You are an expert full-stack developer. When given an app idea, generate complete, working code.

CRITICAL: Respond ONLY with valid JSON in this exact format, nothing else:
{
  "name": "project-name",
  "description": "What this project does",
  "files": [
    {
      "path": "index.html",
      "content": "complete file content here",
      "description": "Main HTML file"
    },
    {
      "path": "css/style.css", 
      "content": "complete css content",
      "description": "Styles"
    },
    {
      "path": "js/script.js",
      "content": "complete js content", 
      "description": "Main logic"
    }
  ],
  "preview_file": "index.html",
  "tech_stack": ["HTML", "CSS", "JavaScript"]
}

RULES:
- Write COMPLETE, working code — no placeholders
- Link all files properly (CSS in HTML head, JS before </body>)
- Use modern, clean design with CSS
- Add comments in code to explain sections
- For Python/backend projects, include requirements.txt
- Make it production-ready`

export async function POST(request) {
  try {
    const { idea } = await request.json()
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const response = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: PROJECT_SYSTEM },
        { role: 'user', content: `Build this app: ${idea}` }
      ],
      max_tokens: 8192,
      temperature: 0.2,
    })

    const content = response.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('AI ne sahi format mein jawab nahi diya')
    
    const project = JSON.parse(jsonMatch[0])
    return Response.json({ project })
  } catch (error) {
    return Response.json({ error: 'Project generate nahi hua: ' + error.message }, { status: 500 })
  }
}
