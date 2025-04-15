import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryStyles } from "@/utils/categoryStyles";

// Format date to a readable string
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export default async function FavoritesPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch favorite trivia questions with join to get question details
  const { data: favorites, error } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      trivia_questions(
        id,
        question,
        choices,
        answer,
        category,
        difficulty
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching favorites:", error);
  }
  
  // Get all trivia IDs from the favorites
  const triviaIds = favorites?.map(favorite => {
    const question = Array.isArray(favorite.trivia_questions) 
      ? favorite.trivia_questions[0] 
      : favorite.trivia_questions;
    return question?.id;
  }).filter(Boolean) || [];
  
  // Fetch all user answers for these trivia questions
  const { data: userAnswers } = await supabase
    .from('users_answers')
    .select('*')
    .eq('user_id', user.id)
    .in('trivia_id', triviaIds);
  
  // Create a map of trivia_id to user answer for easy lookups
  const userAnswersMap = (userAnswers || []).reduce((map: Record<string, any>, answer) => {
    map[answer.trivia_id] = answer;
    return map;
  }, {});

  return (
    <div className="flex-1 w-full flex flex-col gap-8 text-center px-4">
      <div className="flex flex-col gap-4 items-center">
        <h2 className="font-medium text-xl">Your Favorite Trivia Questions</h2>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/protected">Back to Trivia</Link>
        </Button>

        {favorites && favorites.length > 0 ? (
          <div className="w-full mt-4 space-y-4">
            {favorites.map((favorite: any) => {
              // In Supabase's nested queries, the related data comes as the first item of an array
              const question = Array.isArray(favorite.trivia_questions) 
                ? favorite.trivia_questions[0] 
                : favorite.trivia_questions;
              
              // Get user answer if available
              const userAnswer = userAnswersMap[question?.id];
              
              if (!question) return null;
              
              const { emoji, color } = categoryStyles[question.category] || { emoji: "❓", color: "#808080" };
              
              return (
                <div key={favorite.id} className="border rounded-lg p-4 bg-card text-left text-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </div>
                    <div className="space-y-3 w-full">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-base">{question.question}</h3>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(favorite.created_at)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 items-center mt-1">
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ 
                              backgroundColor: `${color}20`,
                              borderColor: color
                            }}
                          >
                            {emoji} {question.category}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-secondary rounded-full">Difficulty: {question.difficulty}</span>
                          {userAnswer && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${userAnswer.is_correct ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                              {userAnswer.is_correct ? 'Correct' : 'Incorrect'}
                            </span>
                          )}
                          {!userAnswer && (
                            <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-700 rounded-full">
                              Not Answered
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.choices.map((choice: string, choiceIndex: number) => {
                          // Extract the letter part (e.g., "A" from "A: Some choice")
                          const choiceLetter = choice.split(':')[0].trim();
                          
                          // Determine if this is the correct answer
                          const isCorrectAnswer = choiceLetter === question.answer;
                          
                          // Determine if this is the user's selected answer
                          const isSelectedAnswer = userAnswer && choiceLetter === userAnswer.selected_answer;
                          
                          // Add classes for styling based on answer status
                          let className = "p-2 border rounded-md text-xs text-center";
                          
                          if (isCorrectAnswer) {
                            className += " bg-green-500/10 border-green-500";
                          } else if (isSelectedAnswer) {
                            className += " bg-red-500/10 border-red-500";
                          }
                          
                          return (
                            <div
                              key={choiceIndex}
                              className={className}
                            >
                              {choice}
                              {isCorrectAnswer && (
                                <span className="ml-1 text-[10px] text-green-600">(Correct)</span>
                              )}
                              {isSelectedAnswer && !isCorrectAnswer && (
                                <span className="ml-1 text-[10px] text-red-600">(Your Answer)</span>
                              )}
                              {isSelectedAnswer && isCorrectAnswer && (
                                <span className="ml-1 text-[10px] text-green-600">(Your Answer)</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full text-center p-8 border rounded-lg text-sm">
            <p className="text-muted-foreground">You haven't favorited any trivia questions yet.</p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/protected">Go Find Some Trivia</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 