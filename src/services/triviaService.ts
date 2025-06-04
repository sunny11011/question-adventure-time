
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
  
  console.log('Generating questions for', teamCount, 'teams with categories:', categoryIds);
  
  // Generate questions for each level
  for (const level of ['easy', 'medium', 'hard'] as QuizLevel[]) {
    const questionsPerTeam = questionsPerLevel[level];
    
    // Map difficulty levels
    const difficultyMap = {
      easy: 'easy',
      medium: 'medium',
      hard: 'hard'
    };
    
    try {
      // For each team, generate separate questions
      for (let teamIndex = 0; teamIndex < teamCount; teamIndex++) {
        console.log(`Generating ${questionsPerTeam} ${level} questions for team ${teamIndex + 1}`);
        
        // Fetch questions from API
        const totalQuestionsNeeded = questionsPerTeam;
        const allQuestions = [];
        
        // Try to get questions from selected categories
        if (categoryIds.length > 0) {
          for (const categoryId of categoryIds) {
            const questionsPerCategory = Math.ceil(totalQuestionsNeeded / categoryIds.length);
            try {
              const categoryQuestions = await fetchTriviaQuestions(
                questionsPerCategory,
                categoryId,
                difficultyMap[level]
              );
              allQuestions.push(...categoryQuestions);
            } catch (error) {
              console.warn(`Failed to fetch questions for category ${categoryId}:`, error);
            }
          }
        } else {
          // Fallback: get questions without category filter
          try {
            const generalQuestions = await fetchTriviaQuestions(
              totalQuestionsNeeded,
              null,
              difficultyMap[level]
            );
            allQuestions.push(...generalQuestions);
          } catch (error) {
            console.warn('Failed to fetch general questions:', error);
          }
        }
        
        // Shuffle and take the required number
        const shuffledQuestions = shuffleArray(allQuestions).slice(0, totalQuestionsNeeded);
        
        console.log(`Got ${shuffledQuestions.length} questions for team ${teamIndex + 1}, level ${level}`);
        
        // Convert to our Question format
        shuffledQuestions.forEach((triviaQuestion, index) => {
          const question: Question = {
            id: `q_${level}_team${teamIndex}_${index + 1}_${Date.now()}_${Math.random()}`,
            text: decodeHtml(triviaQuestion.question),
            options: shuffleArray([
              decodeHtml(triviaQuestion.correct_answer),
              ...triviaQuestion.incorrect_answers.map(decodeHtml)
            ]),
            correctAnswer: 0, // Will be set after shuffling
            level: level,
            teamId: `team_${teamIndex}` // Associate with specific team
          };
          
          // Find correct answer index after shuffling
          question.correctAnswer = question.options.indexOf(decodeHtml(triviaQuestion.correct_answer));
          questions.push(question);
        });
        
        // If we didn't get enough questions from API, add fallback questions
        const currentTeamQuestions = questions.filter(q => q.teamId === `team_${teamIndex}` && q.level === level);
        const needed = questionsPerTeam - currentTeamQuestions.length;
        
        for (let i = 0; i < needed; i++) {
          const fallbackQuestion: Question = {
            id: `q_${level}_team${teamIndex}_fallback_${i + 1}_${Date.now()}`,
            text: `Sample ${level} question ${i + 1} for team ${teamIndex + 1}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0,
            level: level,
            teamId: `team_${teamIndex}`
          };
          questions.push(fallbackQuestion);
        }
      }
      
    } catch (error) {
      console.error(`Failed to generate questions for ${level}:`, error);
      
      // Complete fallback: create sample questions for all teams
      for (let teamIndex = 0; teamIndex < teamCount; teamIndex++) {
        for (let i = 0; i < questionsPerLevel[level]; i++) {
          const fallbackQuestion: Question = {
            id: `q_${level}_team${teamIndex}_${i + 1}_${Date.now()}_fallback`,
            text: `Sample ${level} question ${i + 1} for team ${teamIndex + 1}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0,
            level: level,
            teamId: `team_${teamIndex}`
          };
          questions.push(fallbackQuestion);
        }
      }
    }
  }
  
  console.log('Total questions generated:', questions.length);
  return questions;
};

const fetchTriviaQuestions = async (amount: number, category: number | null, difficulty: string) => {
  let url = `${TRIVIA_QUESTIONS_URL}?amount=${amount}&difficulty=${difficulty}&type=multiple`;
  
  if (category !== null) {
    url += `&category=${category}`;
  }
  
  console.log('Fetching from:', url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  console.log('API Response:', data);
  
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
