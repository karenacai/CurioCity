import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

function generateUUID() {
  return crypto.randomUUID()
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Predefined categories for trivia questions
const CATEGORIES = [
  'History', 'Geography', 'Science', 'Literature', 'Movies',
  'Music', 'Sports', 'Technology', 'Art', 'Food & Drink',
  'Nature', 'Space', 'Mathematics', 'Language', 'Politics',
  'Mythology', 'Religion', 'Philosophy', 'Business', 'Pop Culture'
]

interface TriviaQuestion {
  id: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  category: string;
  difficulty: string;
  [key: string]: string | string[];
}

export async function POST(request: Request) {
  try {
    let { categories, difficulty } = await request.json()
    
    // Default values
    if (!categories || categories.length === 0) {
      // Randomly select 3 categories
      categories = CATEGORIES
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
    }

    // Default difficulty range
    difficulty = difficulty || { min: 1, max: 10 }
    
    // Get the user from Supabase
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const systemPrompt = `You are a trivia question generator. Generate multiple-choice questions that are challenging but answerable.`
    
    const userPrompt = `Generate 3 trivia questions${categories.length === 3 
      ? `, one from each of these categories: ${categories.join(', ')}`
      : ` from these categories: ${categories.join(', ')}`
    }.
    The difficulty should be between ${difficulty.min} and ${difficulty.max} (1=easiest, 10=hardest).
    Return the response as a JSON object with a "questions" array containing objects with these exact properties:
    {
      "difficulty": number between ${difficulty.min} and ${difficulty.max},
      "question": string,
      "answer": string (the correct answer),
      "choices": array of 4 strings (including the correct answer),
      "category": string (must be one of the provided categories)
    }
    
    Make sure:
    1. The choices array always contains exactly 4 options
    2. One of the choices matches the answer exactly
    3. All choices are plausible but only one is correct
    4. Choices are shuffled randomly
    5. The difficulty matches the specified range
    6. The category is from the provided list`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Updated to a current model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 2048
    })

    const rawResponse = completion.choices[0].message.content
    if (!rawResponse) {
      throw new Error('No response from OpenAI')
    }

    const parsedResponse = JSON.parse(rawResponse)
    
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid response format from OpenAI')
    }

    // Validate and format each question
    const formattedQuestions = parsedResponse.questions.map((q: TriviaQuestion) => {
      if (!q.difficulty || !q.question || !q.answer || !q.choices || !q.category) {
        throw new Error(`Invalid question format`)
      }

      const difficulty = Math.min(Math.max(parseInt(q.difficulty), 1), 10)

      return {
        id: generateUUID(),
        user_id: user.id,
        difficulty,
        question: typeof q.question === 'string' ? q.question.trim() : q.question,
        answer: typeof q.answer === 'string' ? q.answer.trim() : q.answer,
        choices: Array.isArray(q.choices) ? q.choices.map((c: string) => typeof c === 'string' ? c.trim() : c) : q.choices,
        category: typeof q.category === 'string' ? q.category.trim() : q.category,
        created_at: new Date().toISOString()
      }
    })

    return NextResponse.json(formattedQuestions)

  } catch (error: unknown) {
    console.error('Error generating trivia:', error)
    
    // Improved type guard to check if error is an APIError with a message property
    if (
      error && 
      typeof error === 'object' && 
      'name' in error && 
      error.name === 'APIError' &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return NextResponse.json(
        { error: 'OpenAI API error', details: error.message },
        { status: 502 }
      )
    }

    // Handle generic error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate trivia questions', details: errorMessage },
      { status: 500 }
    )
  }
} 