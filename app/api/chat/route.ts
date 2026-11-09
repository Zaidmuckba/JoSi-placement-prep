import { NextRequest, NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'

const SYSTEM_PROMPT = `You are JoSi, the official placement guidance chatbot for St. Xavier's College, Mumbai. You are an expert in campus placements and career development, with deep knowledge about St. Xavier's College Mumbai's placement processes, companies that visit, and student success stories.

Your key areas of expertise include:
- Campus placement process and requirements
- Company information and statistics
- Interview preparation (Technical & HR)
- Resume building and portfolio development
- Career development guidance
- Placement statistics and success stories

Please provide detailed, actionable advice focused on St. Xavier's College Mumbai context. Use examples and success stories when relevant.

Format your responses in a clean, readable way:
1. Use clear section headers (e.g., Overview, Key Points, Next Steps)
2. Use bullet points for lists
3. Bold important terms
4. Keep paragraphs short and focused
5. Include success stories when relevant`

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    
    const HF_ACCESS_TOKEN = process.env.HF_ACCESS_TOKEN
    if (!HF_ACCESS_TOKEN) {
      throw new Error('HF_ACCESS_TOKEN is not configured')
    }

    const hf = new HfInference(HF_ACCESS_TOKEN)
    
    console.log('Sending request to Hugging Face API...')
    const response = await hf.textGeneration({
      model: 'google/flan-t5-base',
      inputs: `You are JoSi, a helpful placement guidance chatbot for St. Xavier's College Mumbai.

Question: ${message}

Provide a detailed response with clear sections, bullet points, and examples.

Response:`,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.95,
        do_sample: true,
        return_full_text: false
      }
    })

    console.log('Received response from Hugging Face API:', response.generated_text)

    // Format the response with markdown
    const formattedResponse = response.generated_text
      .trim()
      // Add markdown headers
      .replace(/^([\w\s]+:)/gm, '### $1')
      // Add bullet points for dashes
      .replace(/^(\s*)-\s/gm, '* ')
      // Add bold text for key terms
      .replace(/\b(Technical|HR|Important|Note|Remember|Tip|Key|Success|Example):/g, '**$1:**')
      // Add numbers for steps
      .replace(/^(\d+)\.\s/gm, '**$1.** ')

    return NextResponse.json({ 
      response: formattedResponse,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in chat API route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
