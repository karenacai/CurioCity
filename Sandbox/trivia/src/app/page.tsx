'use client'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import type { TriviaQuestion } from '@/types/trivia'
import { saveTrivia, saveUserAnswer, toggleFavorite } from '@/utils/supabase/trivia'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Range } from 'react-range'

// Add categories constant
const CATEGORIES = [
  'History', 'Geography', 'Science', 'Literature', 'Movies',
  'Music', 'Sports', 'Technology', 'Art', 'Food & Drink',
  'Nature', 'Space', 'Mathematics', 'Language', 'Politics',
  'Mythology', 'Religion', 'Philosophy', 'Business', 'Pop Culture'
] as const

// Add color mapping for categories
const CATEGORY_COLORS: Record<string, { bg: string, text: string, border: string }> = {
  'History': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  'Geography': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  'Science': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'Literature': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  'Movies': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  'Music': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300' },
  'Sports': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  'Technology': { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300' },
  'Art': { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300' },
  'Food & Drink': { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-300' },
  'Nature': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  'Space': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  'Mathematics': { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
  'Language': { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-300' },
  'Politics': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  'Mythology': { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
  'Religion': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  'Philosophy': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300' },
  'Business': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  'Pop Culture': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' }
}

// Add categories with emojis
const CATEGORIES_WITH_EMOJIS: Record<string, { emoji: string }> = {
  'History': { emoji: '📜' },
  'Geography': { emoji: '🌎' },
  'Science': { emoji: '🧬' },
  'Literature': { emoji: '📚' },
  'Movies': { emoji: '🎬' },
  'Music': { emoji: '🎵' },
  'Sports': { emoji: '⚽' },
  'Technology': { emoji: '💻' },
  'Art': { emoji: '🎨' },
  'Food & Drink': { emoji: '🍽️' },
  'Nature': { emoji: '🌿' },
  'Space': { emoji: '🚀' },
  'Mathematics': { emoji: '🔢' },
  'Language': { emoji: '💭' },
  'Politics': { emoji: '🏛️' },
  'Mythology': { emoji: '🐉' },
  'Religion': { emoji: '⛪' },
  'Philosophy': { emoji: '🤔' },
  'Business': { emoji: '💼' },
  'Pop Culture': { emoji: '🌟' }
}

// Create Supabase client outside component
const supabase = createClient()

export default function Home() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [difficultyRange, setDifficultyRange] = useState({
    min: 1,
    max: 10
  })
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set())
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Check if user has generated questions in the last 24 hours
  const checkDailyLimit = async (userId: string) => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data, error } = await supabase
        .from('trivia_questions')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())
        .limit(1)

      if (error) throw error

      return data && data.length > 0
    } catch (error) {
      console.error('Error checking daily limit:', error)
      return false
    }
  }

  useEffect(() => {
    // Get initial user state
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
    }
    
    fetchUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      
      // Clear questions when user signs out
      if (event === 'SIGNED_OUT') {
        setQuestions([])
        setAnsweredQuestions(new Set())
        setUserAnswers({})
        setFavorites(new Set())
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Add useEffect to fetch existing favorites
  useEffect(() => {
    if (user) {
      supabase
        .from('favorites')
        .select('trivia_id')
        .eq('user_id', user.id)
        .then(({ data, error }) => {
          if (!error && data) {
            setFavorites(new Set(data.map(f => f.trivia_id)))
          }
        })
    }
  }, [user])

  const generateTrivia = async () => {
    if (!user) {
      setError('Please sign in to generate trivia questions')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Check daily limit
      const hasRecentQuestions = await checkDailyLimit(user.id)
      
      if (hasRecentQuestions) {
        setError('Only one set of questions can be generated per day! Come back again tomorrow for more!')
        return
      }

      const response = await fetch('/api/trivia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categories: selectedCategories,
          difficulty: difficultyRange
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate trivia')
      }

      const data = await response.json()
      setQuestions(data)

      try {
        console.log('Saving questions to Supabase...')
        const savedData = await saveTrivia(data, user.id)
        console.log('Questions saved successfully:', savedData)
      } catch (saveError) {
        console.error('Failed to save to Supabase:', saveError)
        setError(`Generated questions but failed to save: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerClick = async (questionId: string, choice: string) => {
    // Prevent multiple answers
    if (answeredQuestions.has(questionId)) return

    try {
      console.log('Handling answer click:', {
        questionId,
        userId: user.id,
        choice
      })

      // Save the user's answer
      setUserAnswers(prev => ({
        ...prev,
        [questionId]: choice
      }))

      // Mark question as answered
      setAnsweredQuestions(prev => {
        const newSet = new Set(prev)
        newSet.add(questionId)
        return newSet
      })

      // Save to history with the user's answer
      const result = await saveUserAnswer(questionId, user.id, choice)
      console.log('Save user answer result:', result)

      // Automatically reveal the correct answer
      setRevealedAnswers(prev => {
        const newSet = new Set(prev)
        newSet.add(questionId)
        return newSet
      })
    } catch (error) {
      console.error('Failed to save answer:', error)
      setError('Failed to save your answer. Please try again.')
    }
  }

  const handleFavoriteClick = async (questionId: string) => {
    if (!user) return

    try {
      const isFavorited = await toggleFavorite(questionId, user.id)
      setFavorites(prev => {
        const newFavorites = new Set(prev)
        if (isFavorited) {
          newFavorites.add(questionId)
        } else {
          newFavorites.delete(questionId)
        }
        return newFavorites
      })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      setError('Failed to update favorite status')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to CurioCity</h1>
        <p className="text-lg text-gray-600 mb-8">Your journey begins here</p>
        
        {user ? (
          <div className="space-y-6">
            {/* Categories Selection */}
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-2">Select Categories</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategories(prev => 
                      prev.includes(category) 
                        ? prev.filter(c => c !== category)
                        : [...prev, category]
                    )}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCategories.includes(category)
                        ? `${CATEGORY_COLORS[category].bg} ${CATEGORY_COLORS[category].text}`
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {CATEGORIES_WITH_EMOJIS[category].emoji} {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Range Slider */}
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">Difficulty Range</h3>
              <div className="px-4">
                <Range
                  step={1}
                  min={1}
                  max={10}
                  values={[difficultyRange.min, difficultyRange.max]}
                  onChange={(values) => setDifficultyRange({
                    min: values[0],
                    max: values[1]
                  })}
                  renderTrack={({ props, children }) => {
                    const { key, ...trackProps } = props
                    return (
                      <div
                        key={key}
                        {...trackProps}
                        className="h-1 w-full bg-gray-200 rounded-full relative"
                      >
                        <div
                          className="h-full rounded-full absolute"
                          style={{
                            backgroundColor: '#EF4444',
                            left: `${(difficultyRange.min - 1) * 11.111}%`,
                            width: `${(difficultyRange.max - difficultyRange.min) * 11.111}%`
                          }}
                        />
                        {children}
                      </div>
                    )
                  }}
                  renderThumb={({ props, isDragged, index }) => {
                    const { key, ...thumbProps } = props
                    return (
                      <div
                        key={key}
                        {...thumbProps}
                        className={`h-4 w-4 rounded-full focus:outline-none ${
                          isDragged ? 'bg-red-600' : 'bg-red-500'
                        } shadow-md hover:shadow-lg transition-shadow`}
                        style={{
                          ...thumbProps.style,
                          boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.2)',
                        }}
                      >
                        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs">
                          {index === 0 ? difficultyRange.min : difficultyRange.max}
                        </div>
                      </div>
                    )
                  }}
                />
                {/* Numbers below slider */}
                <div className="relative mt-2 mx-4">
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <div 
                        key={num} 
                        className="flex flex-col items-center"
                      >
                        <div className="h-2 w-px bg-gray-300 mb-1"></div>
                        <span className="text-xs text-gray-500">{num}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={generateTrivia}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Generating...' : 'Generate Trivia Questions'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">Please sign in to generate trivia questions</p>
            <Link 
              href="/login"
              className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign In
            </Link>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-500 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
      </div>

      {questions.length > 0 && (
        <div className="w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">Generated Questions</h2>
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-semibold px-2 py-1 rounded ${CATEGORY_COLORS[q.category].bg} ${CATEGORY_COLORS[q.category].text}`}>
                    {CATEGORIES_WITH_EMOJIS[q.category].emoji} {q.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFavoriteClick(q.id)}
                      className="focus:outline-none"
                    >
                      {favorites.has(q.id) ? (
                        <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-gray-400 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      )}
                    </button>
                    <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      Difficulty: {q.difficulty}/10
                    </span>
                  </div>
                </div>
                <p className="text-lg font-medium mb-4">{q.question}</p>
                <div className="space-y-2">
                  {q.choices.map((choice, index) => (
                    <div 
                      key={`${q.id}-choice-${index}`}
                      onClick={() => !answeredQuestions.has(q.id) && handleAnswerClick(q.id, choice)}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        answeredQuestions.has(q.id)
                          ? choice === q.answer
                            ? `${CATEGORY_COLORS[q.category].bg} ${CATEGORY_COLORS[q.category].border} border`
                            : choice === userAnswers[q.id]
                              ? 'bg-red-100 border border-red-300'
                              : 'bg-gray-50'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{choice}</span>
                        {answeredQuestions.has(q.id) && (
                          <span className="text-sm">
                            {choice === q.answer && '✅'}
                            {choice === userAnswers[q.id] && choice !== q.answer && '❌'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {!answeredQuestions.has(q.id) && (
                  <div className="mt-4 text-sm text-gray-500">
                    Click an answer to submit your response
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
