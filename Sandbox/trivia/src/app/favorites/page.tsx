import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PageTitle from '@/components/PageTitle'

type FavoriteEntry = {
  id: string
  created_at: string
  trivia_questions: {
    question: string
    answer: string
    choices: string[]
    category: string
    difficulty: number
  }
}

export default async function FavoritesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Simply redirect if no user - don't log error
  if (!user) {
    redirect('/login')
  }

  const { data: favorites, error } = await supabase
    .from('favorites')
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
    console.error('Error fetching favorites:', error)
  }

  return (
    <>
      <PageTitle title="Favorites | CurioCity" description="View and manage your favorite trivia questions" />
      
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">Your Favorite Questions</h1>
          
          {!favorites || favorites.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven&apos;t favorited any questions yet.</p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Find Questions to Favorite
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {(favorites as FavoriteEntry[]).map((favorite) => (
                <div key={favorite.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-500">
                      {new Date(favorite.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-800">
                        Difficulty: {favorite.trivia_questions.difficulty}/10
                      </span>
                      <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                        {favorite.trivia_questions.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-lg font-medium mb-4">{favorite.trivia_questions.question}</p>
                  <div className="space-y-2">
                    {favorite.trivia_questions.choices.map((choice: string, index: number) => (
                      <div
                        key={index}
                        className={`p-2 rounded ${
                          choice === favorite.trivia_questions.answer
                            ? 'bg-green-100 border border-green-300'
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
    </>
  )
} 