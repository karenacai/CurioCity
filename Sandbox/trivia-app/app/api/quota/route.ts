import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
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
    
    // Get the timestamp for 24 hours ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // Count how many questions the user has generated in the last 24 hours
    const { count, error } = await supabase
      .from('trivia_questions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneDayAgo.toISOString());
      
    if (error) {
      console.error('Error checking question count:', error);
      return NextResponse.json(
        { error: 'Failed to check quota' },
        { status: 500 }
      );
    }
    
    // Return the number of questions generated today and the daily limit
    return NextResponse.json({
      questionsGenerated: count || 0,
      dailyLimit: 3,
      remaining: Math.max(0, 3 - (count || 0))
    });
  } catch (error) {
    console.error('Error checking quota:', error);
    return NextResponse.json(
      { error: 'Failed to check quota' },
      { status: 500 }
    );
  }
} 