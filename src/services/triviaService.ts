
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
    
    console.log(`Starting ${level} questions generation for ${teamCount} teams, ${questionsPerTeam} questions each`);
    
    // Calculate total questions needed for this level
    const totalQuestionsNeeded = questionsPerTeam * teamCount;
    
    // Fetch all questions for this level at once
    let allLevelQuestions = [];
    
    try {
      if (categoryIds.length > 0) {
        // Fetch questions from each selected category
        for (const categoryId of categoryIds) {
          const questionsFromCategory = Math.ceil(totalQuestionsNeeded / categoryIds.length);
          console.log(`Fetching ${questionsFromCategory} ${level} questions from category ${categoryId}`);
          
          const categoryQuestions = await fetchTriviaQuestions(
            questionsFromCategory,
            categoryId,
            difficultyMap[level]
          );
          
          allLevelQuestions.push(...categoryQuestions);
          console.log(`Got ${categoryQuestions.length} questions from category ${categoryId}`);
        }
      } else {
        // Fetch from general trivia without category filter
        console.log(`Fetching ${totalQuestionsNeeded} ${level} questions from general trivia`);
        const generalQuestions = await fetchTriviaQuestions(
          totalQuestionsNeeded,
          null,
          difficultyMap[level]
        );
        allLevelQuestions.push(...generalQuestions);
        console.log(`Got ${generalQuestions.length} general questions`);
      }
      
      // Shuffle all questions to ensure randomness
      allLevelQuestions = shuffleArray(allLevelQuestions);
      console.log(`Total ${level} questions fetched: ${allLevelQuestions.length}`);
      
      // Distribute questions to teams
      for (let teamIndex = 0; teamIndex < teamCount; teamIndex++) {
        const startIndex = teamIndex * questionsPerTeam;
        const endIndex = startIndex + questionsPerTeam;
        const teamQuestions = allLevelQuestions.slice(startIndex, endIndex);
        
        console.log(`Assigning questions ${startIndex}-${endIndex - 1} to team ${teamIndex + 1}`);
        
        teamQuestions.forEach((triviaQuestion, questionIndex) => {
          if (triviaQuestion) {
            // Shuffle options and find correct answer position
            const shuffledOptions = shuffleArray([
              decodeHtml(triviaQuestion.correct_answer),
              ...triviaQuestion.incorrect_answers.map(decodeHtml)
            ]);
            
            const correctAnswerIndex = shuffledOptions.indexOf(decodeHtml(triviaQuestion.correct_answer));
            
            const question: Question = {
              id: `q_${level}_team${teamIndex}_${questionIndex}_${Date.now()}_${Math.random()}`,
              text: decodeHtml(triviaQuestion.question),
              options: shuffledOptions,
              correctAnswer: correctAnswerIndex,
              level: level,
              teamId: `team_${teamIndex}`
            };
            
            questions.push(question);
            console.log(`Added question for team ${teamIndex + 1}: ${question.text.substring(0, 50)}...`);
          }
        });
        
        // If we don't have enough questions for this team, add fallback questions
        const currentTeamQuestions = questions.filter(q => 
          q.teamId === `team_${teamIndex}` && q.level === level
        );
        
        const neededQuestions = questionsPerTeam - currentTeamQuestions.length;
        if (neededQuestions > 0) {
          console.log(`Adding ${neededQuestions} fallback questions for team ${teamIndex + 1}, level ${level}`);
          
          for (let i = 0; i < neededQuestions; i++) {
            const fallbackQuestion: Question = {
              id: `q_${level}_team${teamIndex}_fallback_${i}_${Date.now()}`,
              text: `${level.charAt(0).toUpperCase() + level.slice(1)} Question ${currentTeamQuestions.length + i + 1} for Team ${teamIndex + 1}`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 0,
              level: level,
              teamId: `team_${teamIndex}`
            };
            questions.push(fallbackQuestion);
          }
        }
      }
      
    } catch (error) {
      console.error(`Error generating ${level} questions:`, error);
      
      // Complete fallback: create sample questions for all teams
      for (let teamIndex = 0; teamIndex < teamCount; teamIndex++) {
        for (let i = 0; i < questionsPerLevel[level]; i++) {
          const fallbackQuestion: Question = {
            id: `q_${level}_team${teamIndex}_${i}_${Date.now()}_fallback`,
            text: `${level.charAt(0).toUpperCase() + level.slice(1)} Question ${i + 1} for Team ${teamIndex + 1}`,
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
  console.log('Questions by team:', questions.reduce((acc, q) => {
    acc[q.teamId] = (acc[q.teamId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));
  
  return questions;
};

const fetchTriviaQuestions = async (amount: number, category: number | null, difficulty: string) => {
  // Trivia API has a limit of 50 questions per request
  const maxPerRequest = 50;
  const questions = [];
  
  let remaining = amount;
  while (remaining > 0) {
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
        break; // Stop trying if API returns error
      }
      
      if (data.results && data.results.length > 0) {
        questions.push(...data.results);
        remaining -= data.results.length;
      } else {
        break; // No more questions available
      }
      
      // Small delay to avoid rate limiting
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      console.error('Error fetching trivia questions:', error);
      break; // Stop on error
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
