import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { triviaId, selectedAnswer } = body;

    if (!triviaId || !selectedAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();
    
    // Get user session
    const { data: { user } } = await supabase.auth.getUser();
    
    // If no user is authenticated, return unauthorized
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the correct answer from the trivia question
    const { data: triviaQuestion, error: triviaError } = await supabase
      .from('trivia_questions')
      .select('answer')
      .eq('id', triviaId)
      .single();

    if (triviaError) {
      console.error('Error fetching trivia question:', triviaError);
      return NextResponse.json(
        { error: 'Failed to find trivia question' },
        { status: 404 }
      );
    }

    // Check if the selected answer is correct
    const correctAnswer = triviaQuestion.answer;
    const isCorrect = selectedAnswer === correctAnswer;

    // Save the user's answer
    const { data: savedAnswer, error: insertError } = await supabase
      .from('users_answers')
      .upsert({
        user_id: user.id,
        trivia_id: triviaId,
        selected_answer: selectedAnswer,
        is_correct: isCorrect
      }, {
        onConflict: 'user_id,trivia_id'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving user answer:', insertError);
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      correctAnswer,
      savedAnswer
    });
  } catch (error) {
    console.error('Error processing answer:', error);
    return NextResponse.json(
      { error: 'Failed to process answer' },
      { status: 500 }
    );
  }
} 