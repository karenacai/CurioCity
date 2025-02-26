import { createClient } from '@/utils/supabase/client'
import type { TriviaQuestion } from '@/types/trivia'

function generateUUID() {
  // Use crypto API to generate a UUID
  return crypto.randomUUID()
}

export async function saveTrivia(questions: TriviaQuestion[], userId: string) {
  try {
    console.log('Attempting to save questions:', questions)
    
    const supabase = createClient()
    
    // Use the existing IDs instead of generating new ones
    const questionsToSave = questions.map(question => ({
      ...question,
      // No ID generation here - use the existing ID
    }))
    
    console.log('Questions with IDs:', questionsToSave.map(q => q.id))

    // Save questions to trivia_questions table
    const { data: savedQuestions, error: questionsError } = await supabase
      .from('trivia_questions')
      .insert(questionsToSave)
      .select()

    if (questionsError) {
      console.error('Error saving trivia questions:', questionsError)
      throw questionsError
    }

    console.log('Saved questions with IDs:', savedQuestions.map(q => q.id))

    // Save to user_trivia_history with null answers
    const historyEntries = savedQuestions.map(question => ({
      user_id: userId,
      trivia_id: question.id,
      created_at: new Date().toISOString(),
      user_answer: null,
      answered_at: null
    }))

    console.log('Creating history entries with trivia_ids:', historyEntries.map(h => h.trivia_id))

    const { data: savedHistory, error: historyError } = await supabase
      .from('user_trivia_history')
      .insert(historyEntries)
      .select()

    if (historyError) {
      console.error('Error saving to history:', historyError)
      throw historyError
    }

    console.log('Successfully saved history entries:', savedHistory)

    // Store the generated questions in state with their IDs
    // setQuestions(savedQuestions)  // Make sure the component uses these saved questions
    return savedQuestions

  } catch (error) {
    console.error('Failed to save trivia questions:', error)
    throw error
  }
}

export async function saveUserAnswer(triviaId: string, userId: string, userAnswer: string) {
  try {
    const supabase = createClient()
    
    console.log('Attempting to save answer for:', {
      triviaId,
      userId,
      userAnswer
    })
    
    // First, verify the history entry exists
    const { data: existingEntry, error: checkError } = await supabase
      .from('user_trivia_history')
      .select('*')  // Select all columns for debugging
      .eq('trivia_id', triviaId)
      .eq('user_id', userId)

    console.log('Found history entries:', existingEntry)

    if (checkError) {
      console.error('Error checking history entry:', checkError)
      throw checkError
    }

    if (!existingEntry || existingEntry.length === 0) {
      console.error('No history entry found for:', {
        triviaId,
        userId
      })
      throw new Error('No history entry found for this question')
    }
    
    // Update the existing history record
    const { data, error } = await supabase
      .from('user_trivia_history')
      .update({
        user_answer: userAnswer,
        answered_at: new Date().toISOString()
      })
      .eq('trivia_id', triviaId)
      .eq('user_id', userId)
      // .is('answered_at', null)
      .select()

    if (error) {
      console.error('Error saving user answer:', error)
      throw error
    }

    console.log('Updated history entry:', data)
    return data
  } catch (error) {
    console.error('Failed to save user answer:', error)
    throw error
  }
}

export async function toggleFavorite(triviaId: string, userId: string) {
  try {
    const supabase = createClient()
    
    // Check if already favorited
    const { data: existingFavorite } = await supabase
      .from('favorites')
      .select()
      .eq('trivia_id', triviaId)
      .eq('user_id', userId)
      .single()

    if (existingFavorite) {
      // Remove from favorites
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('trivia_id', triviaId)
        .eq('user_id', userId)

      if (deleteError) throw deleteError
      return false // Return false to indicate no longer favorited
    } else {
      // Add to favorites
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          trivia_id: triviaId,
          user_id: userId,
          created_at: new Date().toISOString()
        })

      if (insertError) throw insertError
      return true // Return true to indicate now favorited
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
    throw error
  }
} 