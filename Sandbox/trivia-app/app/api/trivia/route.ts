import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const categories = url.searchParams.getAll('categories');
    const minDifficulty = parseInt(url.searchParams.get('minDifficulty') || '1');
    const maxDifficulty = parseInt(url.searchParams.get('maxDifficulty') || '10');

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
    
    // Check if the user has already generated their daily quota of questions
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const { count, error: countError } = await supabase
      .from('trivia_questions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneDayAgo.toISOString());
      
    if (countError) {
      console.error('Error checking question count:', countError);
      return NextResponse.json(
        { error: 'Failed to check rate limit' },
        { status: 500 }
      );
    }
    
    // If the user has already generated 3 or more questions today, return an error
    if (count && count >= 3) {
      return NextResponse.json(
        { error: 'You\'ve reached your daily limit of 3 trivia questions. Please try again tomorrow!' },
        { status: 429 } // 429 Too Many Requests
      );
    }
    
    // Construct the prompt based on user selections
    let categoryPrompt = '';
    if (categories.length > 0) {
      categoryPrompt = `Use only the following categories: ${categories.join(', ')}.`;
    } else {
      categoryPrompt = `Use one of the following categories:
      
Pop Culture, World Cuisine, Strange But True, Legendary Creatures, Internet History, Musical Mashups, Movie Quotes, Hidden Talents of Celebrities, Unusual Inventions, Global Festivals, Ancient Civilizations, Science in Everyday Life, Art Heists, Memes & Viral Moments, Space Oddities, Mythology Mix, Famous Firsts, Fictional Worlds, Historical Underdogs, Language Twists, Tech Through Time, Animal Kingdom Quirks, Sports Scandals, Fashion Through the Ages, Board Games & Beyond`;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using the latest available model
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates trivia questions. Respond with valid JSON.'
        },
        {
          role: 'user',
          content: `Generate 3 trivia questions and format the response as JSON.

${categoryPrompt}

Use a difficulty level between ${minDifficulty} and ${maxDifficulty} (inclusive). Ensure the difficulty level is reflected in the complexity of the question and answer choices.

Each trivia question should be returned as an object with the following structure:
- "question": a string containing the question
- "choices": an array of 4 strings labeled "A:" through "D:", randomly ordered
- "answer": a single capital letter string ("A", "B", "C", or "D") representing the correct answer
- "difficulty": an integer between ${minDifficulty} and ${maxDifficulty}
- "category": a string from the provided list

Return the trivia questions in the following JSON format:
{
  "triviaQuestions": [
    {
      "question": "What was the first video ever uploaded to YouTube?",
      "choices": ["A: Me at the zoo", "B: Charlie bit my finger", "C: The Evolution of Dance", "D: Gangnam Style"],
      "answer": "A",
      "difficulty": 4,
      "category": "Internet History"
    },
    {
      "question": "Which mythical creature is said to live beneath Loch Ness in Scotland?",
      "choices": ["A: Kraken", "B: Nessie", "C: Basilisk", "D: Hydra"],
      "answer": "B",
      "difficulty": 7,
      "category": "Legendary Creatures"
    },
    {
      "question": "Which planet in our solar system has the most moons?",
      "choices": ["A: Saturn", "B: Jupiter", "C: Uranus", "D: Neptune"],
      "answer": "A",
      "difficulty": 3,
      "category": "Space Oddities"
    }
  ]
}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    // Extract the response content
    const content = response.choices[0].message.content;
    console.log('API Response:', content);

    // Parse the JSON if it's a string
    const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    
    // Extract the trivia questions array
    const triviaQuestions = parsedContent.triviaQuestions || [];
    
    // Save each question to the database and collect their IDs
    const savedQuestions = [];
    
    for (const question of triviaQuestions) {
      // Validate required fields
      if (!question.difficulty || !question.question || !question.choices || !question.answer || !question.category) {
        console.error('Missing required fields in question:', question);
        continue;
      }

      // Ensure choices is an array
      if (!Array.isArray(question.choices)) {
        console.error('Choices must be an array:', question);
        continue;
      }

      // Ensure difficulty is a number
      if (typeof question.difficulty !== 'number') {
        console.error('Difficulty must be a number:', question);
        continue;
      }

      // Insert the question into trivia_questions table
      const { data: insertedQuestion, error: insertError } = await supabase
        .from('trivia_questions')
        .insert({
          difficulty: question.difficulty,
          question: question.question,
          choices: question.choices,
          answer: question.answer,
          category: question.category,
          user_id: user.id
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error('Error inserting question:', {
          error: insertError,
          question: question,
          user_id: user.id
        });
        continue;
      }
      
      // Insert into user_trivia_history table
      const { error: historyError } = await supabase
        .from('user_trivia_history')
        .insert({
          user_id: user.id,
          trivia_id: insertedQuestion.id
        });
      
      if (historyError) {
        console.error('Error updating history:', historyError);
      }
      
      // Add the database ID to the question
      savedQuestions.push({
        ...question,
        id: insertedQuestion.id
      });
    }
    
    // Return the saved questions with their database IDs
    return NextResponse.json({
      triviaQuestions: savedQuestions
    });
  } catch (error) {
    console.error('Error calling OpenAI API or saving to database:', error);
    return NextResponse.json(
      { error: 'Failed to generate trivia questions' },
      { status: 500 }
    );
  }
} 