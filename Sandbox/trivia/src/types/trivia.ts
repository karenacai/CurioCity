export interface TriviaQuestion {
  id: string  // UUID is stored as string in TypeScript
  user_id: string
  difficulty: number
  question: string
  answer: string
  choices: string[]
  category: string
  created_at: string
} 