
import { Question, QuizLevel } from '@/contexts/QuizContext';

// Trivia API endpoints
const TRIVIA_CATEGORIES_URL = 'https://opentdb.com/api_category.php';
const TRIVIA_QUESTIONS_URL = 'https://opentdb.com/api.php';

export interface TriviaCategory {
  id: number;
  name: string;
}

interface QuestionGenerationRequest {
  easy: number;
  medium: number;
  hard: number;
}

export const getTriviaCategories = async (): Promise<TriviaCategory[]> => {
  try {
    const response = await fetch(TRIVIA_CATEGORIES_URL);
    const data = await response.json();
    return data.trivia_categories;
  } catch (error) {
    console.error('Failed to fetch trivia categories:', error);
    return [];
  }
};

export const generateQuizQuestions = async (
  categoryIds: number[], 
  questionsPerLevel: QuestionGenerationRequest,
  teamCount: number
): Promise<Question[]> => {
  const questions: Question[] = [];
  
  // Generate questions for each level
  for (const level of ['easy', 'medium', 'hard'] as QuizLevel[]) {
    const count = questionsPerLevel[level];
    const totalQuestionsNeeded = count * teamCount; // Different questions for each team
    
    // Map difficulty levels
    const difficultyMap = {
      easy: 'easy',
      medium: 'medium',
      hard: 'hard'
    };
    
    try {
      // Fetch questions from multiple categories if needed
      const allQuestions = [];
      
      for (const categoryId of categoryIds) {
        const questionsPerCategory = Math.ceil(totalQuestionsNeeded / categoryIds.length);
        const categoryQuestions = await fetchTriviaQuestions(
          questionsPerCategory,
          categoryId,
          difficultyMap[level]
        );
        allQuestions.push(...categoryQuestions);
      }
      
      // Shuffle and take the required number
      const shuffledQuestions = shuffleArray(allQuestions).slice(0, totalQuestionsNeeded);
      
      // Convert to our Question format
      shuffledQuestions.forEach((triviaQuestion, index) => {
        const question: Question = {
          id: `q_${level}_${index + 1}_${Date.now()}_${Math.random()}`,
          text: decodeHtml(triviaQuestion.question),
          options: shuffleArray([
            decodeHtml(triviaQuestion.correct_answer),
            ...triviaQuestion.incorrect_answers.map(decodeHtml)
          ]),
          correctAnswer: 0, // Will be set after shuffling
          level: level
        };
        
        // Find correct answer index after shuffling
        question.correctAnswer = question.options.indexOf(decodeHtml(triviaQuestion.correct_answer));
        questions.push(question);
      });
      
    } catch (error) {
      console.error(`Failed to generate questions for ${level}:`, error);
      // Fallback to basic questions if API fails
      for (let i = 0; i < totalQuestionsNeeded; i++) {
        const fallbackQuestion: Question = {
          id: `q_${level}_${i + 1}_${Date.now()}_fallback`,
          text: `Sample ${level} question ${i + 1}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          level: level
        };
        questions.push(fallbackQuestion);
      }
    }
  }
  
  return questions;
};

const fetchTriviaQuestions = async (amount: number, category: number, difficulty: string) => {
  const url = `${TRIVIA_QUESTIONS_URL}?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.response_code !== 0) {
    throw new Error(`Trivia API error: ${data.response_code}`);
  }
  
  return data.results;
};

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const decodeHtml = (html: string): string => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};
