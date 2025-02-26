import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Define the type for history entries
type HistoryEntry = {
  id: string
  created_at: string
  user_answer: string | null
  trivia_questions: {
    question: string
    answer: string
    choices: string[]
    category: string
    difficulty: number
  }
}

export default async function HistoryPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Simply redirect if no user - don't log error
  if (!user) {
    redirect('/login')
  }

  const { data: historyEntries, error } = await supabase
    .from('user_trivia_history')
    .select(`
      *,
      trivia_questions (
        question,
        answer,
        choices,
        category,
        difficulty
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching history:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Trivia History</h1>
        
        {!historyEntries || historyEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't answered any trivia questions yet.</p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Some Trivia
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {(historyEntries as HistoryEntry[]).map((entry) => (
              <div key={entry.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm text-gray-500">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    entry.user_answer === entry.trivia_questions.answer
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {entry.user_answer === entry.trivia_questions.answer ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <p className="text-lg font-medium mb-4">{entry.trivia_questions.question}</p>
                <div className="space-y-2">
                  {entry.trivia_questions.choices.map((choice: string, index: number) => (
                    <div
                      key={index}
                      className={`p-2 rounded ${
                        choice === entry.trivia_questions.answer
                          ? 'bg-green-100 border border-green-300'
                          : choice === entry.user_answer
                          ? 'bg-red-100 border border-red-300'
                          : 'bg-gray-50'
                      }`}
                    >
                      {choice}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 