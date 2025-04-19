'use client';

import { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { categoryStyles } from "@/utils/categoryStyles";

interface TriviaQuestion {
  id?: string; // UUID from the database
  question: string;
  choices: string[];
  answer: string;
  difficulty: number;
  category: string;
}

interface TriviaResponse {
  triviaQuestions: TriviaQuestion[];
}

interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
}

const CATEGORIES = [
  "Pop Culture",
  "World Cuisine",
  "Strange But True",
  "Legendary Creatures",
  "Internet History",
  "Musical Mashups",
  "Movie Quotes",
  "Hidden Talents of Celebrities",
  "Unusual Inventions",
  "Global Festivals",
  "Ancient Civilizations",
  "Science in Everyday Life",
  "Art Heists",
  "Memes & Viral Moments",
  "Space Oddities",
  "Mythology Mix",
  "Famous Firsts",
  "Fictional Worlds",
  "Historical Underdogs",
  "Language Twists",
  "Tech Through Time",
  "Animal Kingdom Quirks",
  "Sports Scandals",
  "Fashion Through the Ages",
  "Board Games & Beyond"
];

// Group categories for staggered layout
const CATEGORY_ROWS = [
  CATEGORIES.slice(0, 6),
  CATEGORIES.slice(6, 11),
  CATEGORIES.slice(11, 17),
  CATEGORIES.slice(17, 21),
  CATEGORIES.slice(21)
];

export default function TriviaButton() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [difficultyRange, setDifficultyRange] = useState<number[]>([1, 10]);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  const [answerLoading, setAnswerLoading] = useState<Record<string, boolean>>({});
  const [favoriteLoading, setFavoriteLoading] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [dailyQuotaUsed, setDailyQuotaUsed] = useState<number | null>(null);
  const [dailyQuotaChecked, setDailyQuotaChecked] = useState<boolean>(false);

  // Check daily quota on component mount
  useEffect(() => {
    const checkDailyQuota = async () => {
      try {
        const response = await fetch('/api/quota');
        if (response.ok) {
          const data = await response.json();
          setDailyQuotaUsed(data.questionsGenerated || 0);
        }
        setDailyQuotaChecked(true);
      } catch (error) {
        console.error('Error checking daily quota:', error);
        setDailyQuotaChecked(true);
      }
    };

    checkDailyQuota();
  }, []);

  const updateDailyQuota = () => {
    if (dailyQuotaUsed !== null) {
      setDailyQuotaUsed(prev => (prev || 0) + 3);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const fetchTrivia = async () => {
    setLoading(true);
    setError(null);
    setUserAnswers({});
    
    // Prevent fetching if quota is exhausted
    if (dailyQuotaUsed !== null && dailyQuotaUsed >= 3) {
      setError('You\'ve reached your daily limit of 3 trivia questions. Please try again tomorrow!');
      setLoading(false);
      return;
    }
    
    try {
      const requestParams = new URLSearchParams();
      
      if (selectedCategories.length > 0) {
        selectedCategories.forEach(category => {
          requestParams.append('categories', category);
        });
      }
      
      requestParams.append('minDifficulty', difficultyRange[0].toString());
      requestParams.append('maxDifficulty', difficultyRange[1].toString());
      
      const url = `/api/trivia?${requestParams.toString()}`;
      const response = await fetch(url);
      
      if (response.status === 401) {
        setError('You must be logged in to generate trivia questions');
        return;
      }
      
      if (response.status === 429) {
        const errorData = await response.json();
        setError('You\'ve reached your daily limit of 3 trivia questions. Please try again tomorrow!');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch trivia questions');
      }
      
      const data: TriviaResponse = await response.json();
      setQuestions(data.triviaQuestions || []);
      
      // Update quota counter on successful fetch
      updateDailyQuota();
      
      // Log the saved questions with their IDs
      console.log('Saved trivia questions:', data.triviaQuestions);
    } catch (error) {
      console.error('Error fetching trivia questions:', error);
      setError('Failed to generate trivia questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionId: string, selectedAnswer: string) => {
    if (!questionId) {
      console.error('Question ID is required');
      return;
    }

    // Don't allow changing answer if already answered
    if (userAnswers[questionId]) {
      return;
    }

    setAnswerLoading(prev => ({ ...prev, [questionId]: true }));
    
    try {
      const response = await fetch('/api/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          triviaId: questionId,
          selectedAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();
      
      setUserAnswers(prev => ({
        ...prev,
        [questionId]: {
          questionId,
          selectedAnswer,
          isCorrect: data.isCorrect,
          correctAnswer: data.correctAnswer,
        },
      }));

    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setAnswerLoading(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const getChoiceClassName = (questionId: string, choice: string, index: number) => {
    // Extract the letter part (e.g., "A" from "A: Some choice")
    const choiceLetter = choice.split(':')[0].trim();
    const userAnswer = userAnswers[questionId];

    // If this question has not been answered yet, make it clickable
    if (!userAnswer) {
      return "p-2 border rounded-md cursor-pointer hover:bg-accent/10 text-center text-xs";
    }

    // If this is the correct answer
    if (choiceLetter === userAnswer.correctAnswer) {
      return "p-2 border rounded-md bg-green-500/10 border-green-500 text-center text-xs";
    }

    // If this is the incorrect answer the user selected
    if (choiceLetter === userAnswer.selectedAnswer && !userAnswer.isCorrect) {
      return "p-2 border rounded-md bg-red-500/10 border-red-500 text-center text-xs";
    }

    // Other choices
    return "p-2 border rounded-md opacity-70 text-center text-xs";
  };

  const toggleFavorite = async (questionId: string) => {
    if (!questionId || favoriteLoading[questionId]) {
      return;
    }

    setFavoriteLoading(prev => ({ ...prev, [questionId]: true }));
    
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          triviaId: questionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      const data = await response.json();
      
      setFavorites(prev => ({
        ...prev,
        [questionId]: data.favorited,
      }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(prev => ({ ...prev, [questionId]: false }));
    }
  };

  // Check favorite status for questions when they load
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (questions.length === 0) return;
      
      for (const question of questions) {
        if (!question.id) continue;
        
        try {
          const response = await fetch(`/api/favorites?triviaId=${question.id}`);
          
          if (!response.ok) {
            console.error(`Failed to check favorite status for question ${question.id}`);
            continue;
          }
          
          const data = await response.json();
          
          setFavorites(prev => ({
            ...prev,
            [question.id!]: data.favorited,
          }));
        } catch (error) {
          console.error(`Error checking favorite status for question ${question.id}:`, error);
        }
      }
    };
    
    checkFavoriteStatus();
  }, [questions]);

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Select Categories</h3>
            <button 
              onClick={() => setSelectedCategories(selectedCategories.length === CATEGORIES.length ? [] : [...CATEGORIES])} 
              className="text-xs text-primary"
            >
              {selectedCategories.length === CATEGORIES.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          
          <div className="space-y-3">
            {CATEGORY_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex flex-wrap justify-center gap-2">
                {row.map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  const { color, emoji } = categoryStyles[category];
                  
                  return (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`
                        text-[10px] py-1 px-2 rounded-lg transition-all
                        flex items-center gap-1 
                        ${isSelected 
                          ? `bg-opacity-20 border` 
                          : 'bg-accent/5 border border-transparent'
                        }
                      `}
                      style={{
                        backgroundColor: isSelected ? `${color}20` : '',
                        borderColor: isSelected ? color : 'transparent',
                      }}
                    >
                      <span>{emoji}</span>
                      <span className="truncate">{category}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-center mb-2">
            <Label className="text-xs">Difficulty Range: {difficultyRange[0]} - {difficultyRange[1]}</Label>
          </div>
          <Slider
            defaultValue={[1, 10]}
            min={1}
            max={10}
            step={1}
            value={difficultyRange}
            onValueChange={setDifficultyRange}
            className="my-4"
          />
        </div>
      </div>

      {/* Generate button */}
      <div className="flex justify-center">
        <Button 
          onClick={fetchTrivia}
          className="bg-primary text-white px-4 py-1 rounded-md hover:bg-primary/90 transition-colors text-xs"
          disabled={loading || (dailyQuotaUsed !== null && dailyQuotaUsed >= 3)}
          size="sm"
        >
          {loading ? 'Loading...' : 'Generate Trivia Questions'}
        </Button>
      </div>
      
      {dailyQuotaUsed !== null && dailyQuotaUsed >= 3 && (
        <div className="text-center text-sm text-muted-foreground mt-2">
          You have generated your set of trivia questions for the day. Come back again tomorrow for more!
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-2 bg-destructive/10 border border-destructive rounded-md text-destructive text-xs">
          {error}
        </div>
      )}

      {questions.length > 0 && (
        <div className="mt-4 space-y-4">
          {questions.map((question, questionIndex) => {
            const { emoji, color } = categoryStyles[question.category] || { emoji: "❓", color: "#808080" };
            
            return (
              <div key={questionIndex} className="border rounded-lg p-3 bg-card">
                <div className="flex items-start gap-2">
                  <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {questionIndex + 1}
                  </span>
                  <div className="space-y-3 w-full text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm">{question.question}</h3>
                        <div className="flex flex-wrap gap-1 items-center mt-1">
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ 
                              backgroundColor: `${color}20` || '#80808020',
                              borderColor: color || '#808080'
                            }}
                          >
                            {emoji} {question.category}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-secondary rounded-full">Difficulty: {question.difficulty}</span>
                          {userAnswers[question.id!] && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${userAnswers[question.id!].isCorrect ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                              {userAnswers[question.id!].isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => toggleFavorite(question.id!)}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={favoriteLoading[question.id!]}
                      >
                        {favoriteLoading[question.id!] ? (
                          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary border-r-transparent"></span>
                        ) : (
                          <Heart 
                            className={`h-3 w-3 ${favorites[question.id!] ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                          />
                        )}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {question.choices.map((choice, choiceIndex) => (
                        <div
                          key={choiceIndex}
                          className={getChoiceClassName(question.id!, choice, choiceIndex)}
                          onClick={() => {
                            const letter = choice.split(':')[0].trim();
                            if (!userAnswers[question.id!] && !answerLoading[question.id!]) {
                              submitAnswer(question.id!, letter);
                            }
                          }}
                        >
                          {answerLoading[question.id!] && choice.startsWith(choice.split(':')[0]) ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary border-r-transparent"></span>
                              {choice}
                            </div>
                          ) : (
                            choice
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 