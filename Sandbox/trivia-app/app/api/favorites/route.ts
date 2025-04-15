import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// POST endpoint to toggle a favorite
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { triviaId } = body;

    if (!triviaId) {
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

    // Check if the favorite already exists
    const { data: existingFavorite } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('trivia_id', triviaId)
      .single();

    // If the favorite exists, remove it
    if (existingFavorite) {
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existingFavorite.id);

      if (deleteError) {
        console.error('Error deleting favorite:', deleteError);
        return NextResponse.json(
          { error: 'Failed to remove from favorites' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        favorited: false,
        message: 'Removed from favorites'
      });
    }
    
    // If it doesn't exist, add it
    const { error: insertError } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        trivia_id: triviaId
      });

    if (insertError) {
      console.error('Error adding favorite:', insertError);
      return NextResponse.json(
        { error: 'Failed to add to favorites' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      favorited: true,
      message: 'Added to favorites'
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if a trivia question is favorited
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const triviaId = url.searchParams.get('triviaId');

    if (!triviaId) {
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

    // Check if the favorite already exists
    const { data: favorites } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('trivia_id', triviaId);

    return NextResponse.json({
      favorited: favorites && favorites.length > 0
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
} 