
import { Question, QuizLevel } from '@/contexts/QuizContext';

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
  
  console.log('Generating questions with config:', { categoryIds, questionsPerLevel, teamCount });
  
  for (const level of ['easy', 'medium', 'hard'] as QuizLevel[]) {
    const questionsNeeded = questionsPerLevel[level];
    
    if (questionsNeeded === 0) {
      console.log(`Skipping ${level} level - no questions needed`);
      continue;
    }
    
    console.log(`Generating ${questionsNeeded} ${level} questions`);
    
    const difficultyMap = {
      easy: 'easy',
      medium: 'medium',
      hard: 'hard'
    };
    
    try {
      let allLevelQuestions = [];
      
      if (categoryIds.length > 0) {
        // Fetch questions from each category separately
        const questionsPerCategory = Math.ceil(questionsNeeded / categoryIds.length);
        
        for (const categoryId of categoryIds) {
          console.log(`Fetching ${questionsPerCategory} ${level} questions from category ${categoryId}`);
          
          const categoryQuestions = await fetchTriviaQuestions(
            questionsPerCategory,
            categoryId,
            difficultyMap[level]
          );
          
          allLevelQuestions.push(...categoryQuestions);
          console.log(`Got ${categoryQuestions.length} questions from category ${categoryId}`);
        }
      } else {
        console.log(`Fetching ${questionsNeeded} ${level} questions from general trivia`);
        const generalQuestions = await fetchTriviaQuestions(
          questionsNeeded,
          null,
          difficultyMap[level]
        );
        allLevelQuestions.push(...generalQuestions);
        console.log(`Got ${generalQuestions.length} general questions`);
      }
      
      allLevelQuestions = shuffleArray(allLevelQuestions);
      console.log(`Total ${level} questions fetched: ${allLevelQuestions.length}`);
      
      const questionsToUse = allLevelQuestions.slice(0, questionsNeeded);
      
      // Distribute questions to teams
      questionsToUse.forEach((triviaQuestion, index) => {
        if (triviaQuestion) {
          const shuffledOptions = shuffleArray([
            decodeHtml(triviaQuestion.correct_answer),
            ...triviaQuestion.incorrect_answers.map(decodeHtml)
          ]);
          
          const correctAnswerIndex = shuffledOptions.indexOf(decodeHtml(triviaQuestion.correct_answer));
          
          // Calculate which team this question belongs to
          const teamIndex = index % teamCount;
          
          const question: Question = {
            id: `q_${level}_${index}_${Date.now()}_${Math.random()}`,
            text: decodeHtml(triviaQuestion.question),
            options: shuffledOptions,
            correctAnswer: correctAnswerIndex,
            level: level,
            teamId: `team_${teamIndex}`
          };
          
          questions.push(question);
          console.log(`Added ${level} question for team ${teamIndex}: ${question.text.substring(0, 50)}...`);
        }
      });
      
      // Add fallback questions if we don't have enough
      const currentLevelQuestions = questions.filter(q => q.level === level);
      const neededFallbacks = questionsNeeded - currentLevelQuestions.length;
      
      if (neededFallbacks > 0) {
        console.log(`Adding ${neededFallbacks} fallback questions for ${level} level`);
        
        for (let i = 0; i < neededFallbacks; i++) {
          const teamIndex = (currentLevelQuestions.length + i) % teamCount;
          const fallbackQuestion: Question = {
            id: `q_${level}_fallback_${i}_${Date.now()}`,
            text: `${level.charAt(0).toUpperCase() + level.slice(1)} Question ${currentLevelQuestions.length + i + 1}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0,
            level: level,
            teamId: `team_${teamIndex}`
          };
          questions.push(fallbackQuestion);
        }
      }
      
    } catch (error) {
      console.error(`Error generating ${level} questions:`, error);
      
      for (let i = 0; i < questionsNeeded; i++) {
        const teamIndex = i % teamCount;
        const fallbackQuestion: Question = {
          id: `q_${level}_error_fallback_${i}_${Date.now()}`,
          text: `${level.charAt(0).toUpperCase() + level.slice(1)} Question ${i + 1}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          level: level,
          teamId: `team_${teamIndex}`
        };
        questions.push(fallbackQuestion);
      }
    }
  }
  
  console.log('Total questions generated:', questions.length);
  return questions;
};

const fetchTriviaQuestions = async (amount: number, category: number | null, difficulty: string) => {
  const maxPerRequest = 50;
  const questions = [];
  
  let remaining = amount;
  while (remaining > 0 && questions.length < amount) {
    const requestAmount = Math.min(remaining, maxPerRequest);
    
    let url = `${TRIVIA_QUESTIONS_URL}?amount=${requestAmount}&difficulty=${difficulty}&type=multiple`;
    
    if (category !== null) {
      url += `&category=${category}`;
    }
    
    console.log('Fetching from:', url);
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('API Response for', requestAmount, 'questions:', {
        response_code: data.response_code,
        results_count: data.results?.length || 0
      });
      
      if (data.response_code !== 0) {
        console.warn(`Trivia API warning: response code ${data.response_code}`);
        break;
      }
      
      if (data.results && data.results.length > 0) {
        questions.push(...data.results);
        remaining -= data.results.length;
      } else {
        break;
      }
      
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
    } catch (error) {
      console.error('Error fetching trivia questions:', error);
      break;
    }
  }
  
  console.log(`Successfully fetched ${questions.length} out of ${amount} requested questions`);
  return questions;
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
