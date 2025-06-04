import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateQuizQuestions } from '@/services/triviaService';
import { toast } from 'sonner';

export type QuizLevel = 'easy' | 'medium' | 'hard';

export type Question = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  level: QuizLevel;
  teamId?: string;
};

export type Team = {
  id: string;
  name: string;
  score: number;
  answeredQuestions: {
    questionId: string;
    correct: boolean;
    selectedOption?: number;
  }[];
};

export type Quiz = {
  id: string;
  title: string;
  topics: string[];
  created_by: string;
  created_at: Date;
  teams: Team[];
  questions: Question[];
  show_answers_at_end: boolean;
  timeouts_in_seconds: {
    easy: number;
    medium: number;
    hard: number;
  };
  questions_per_level: {
    easy: number;
    medium: number;
    hard: number;
  };
  category_ids: number[];  // Make this required instead of optional
};

interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export type QuizContextType = {
  quizzes: Quiz[];
  activeQuiz: Quiz | null;
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
  activeLevel: QuizLevel;
  setActiveLevel: (level: QuizLevel) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  currentTeamIndex: number;
  setCurrentTeamIndex: (index: number) => void;
  setTimeLeft: (time: number) => void;
  timeLeft: number;
  isRunning: boolean;
  setIsRunning: (value: boolean) => void;
  selectedOption: number | null;
  setSelectedOption: (option: number | null) => void;
  answersRevealed: boolean;
  setAnswersRevealed: (revealed: boolean) => void;
  isLoadingQuestions: boolean;
  
  createQuiz: (quizData: Omit<Quiz, 'id' | 'created_at' | 'questions'>) => Promise<void>;
  startQuiz: (quizId: string) => void;
  answerQuestion: (questionId: string, optionIndex: number) => void;
  nextQuestion: () => void;
  nextLevel: () => Promise<boolean>;
  endQuiz: () => void;
  loadQuizzes: () => Promise<void>;
  deleteQuiz: (quizId: string) => Promise<void>;
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

type QuizProviderProps = {
  children: ReactNode;
};

export const QuizProvider = ({ children }: QuizProviderProps) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeLevel, setActiveLevel] = useState<QuizLevel>('easy');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answersRevealed, setAnswersRevealed] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [levelQuestions, setLevelQuestions] = useState<Question[]>([]);

  // Load quizzes when user changes
  useEffect(() => {
    if (user) {
      loadQuizzes();
    } else {
      setQuizzes([]);
    }
  }, [user]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0 && !answersRevealed) {
      const timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            setAnswersRevealed(true);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimer(timerInterval);
      
      return () => clearInterval(timerInterval);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, answersRevealed]);

  const loadQuizzes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedQuizzes: Quiz[] = data.map(quiz => ({
        ...quiz,
        created_at: new Date(quiz.created_at),
        teams: quiz.teams as Team[],
        questions: quiz.questions as Question[],
        timeouts_in_seconds: quiz.timeouts_in_seconds as {
          easy: number;
          medium: number;
          hard: number;
        },
        questions_per_level: quiz.questions_per_level as {
          easy: number;
          medium: number;
          hard: number;
        },
        category_ids: quiz.category_ids || []
      }));

      setQuizzes(formattedQuizzes);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.error('Failed to load quizzes');
    }
  };

  const fetchQuestionsForCategory = async (
    categoryId: number,
    difficulty: string,
    amount: number
  ): Promise<TriviaQuestion[]> => {
    try {
      const response = await fetch(
        `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=${difficulty}&type=multiple`
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error(`Error fetching questions for category ${categoryId}:`, error);
      return [];
    }
  };

  // Replace the existing loadQuestionsForLevel function
  const loadQuestionsForLevel = async (quiz: Quiz, level: QuizLevel) => {
    setIsLoadingQuestions(true);
    console.log(`Loading questions for level: ${level}`);
    
    try {
      const questionsNeeded = quiz.questions_per_level[level] * quiz.teams.length;
      const questionsPerCategory = Math.ceil(questionsNeeded / (quiz.category_ids?.length || 1));
      
      if (!quiz.category_ids || quiz.category_ids.length === 0) {
        throw new Error('No categories selected for quiz');
      }

      // Fetch questions from all selected categories
      const questionPromises = quiz.category_ids.map(categoryId =>
        fetchQuestionsForCategory(
          categoryId,
          level.toLowerCase(),
          questionsPerCategory
        )
      );

      const categoryResults = await Promise.all(questionPromises);
      const allQuestions = categoryResults.flat();
      
      if (allQuestions.length === 0) {
        throw new Error('No questions available for selected categories');
      }

      // Shuffle all questions
      const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
      
      // Take only the number of questions we need
      const questionsToUse = shuffledQuestions.slice(0, questionsNeeded);
      
      // Format and distribute questions to teams
      const finalQuestions: Question[] = [];
      
      // Distribute questions to teams in round-robin fashion
      quiz.teams.forEach((team, teamIndex) => {
        // Get questions for this team
        const teamQuestionsCount = quiz.questions_per_level[level];
        const startIdx = teamIndex * teamQuestionsCount;
        const teamQuestions = questionsToUse.slice(startIdx, startIdx + teamQuestionsCount);
        
        // Format and add team's questions
        teamQuestions.forEach((q, qIndex) => {
          const options = [q.correct_answer, ...q.incorrect_answers].sort(() => Math.random() - 0.5);
          
          finalQuestions.push({
            id: `${level}_${teamIndex}_${qIndex}_${Date.now()}`,
            text: q.question,
            options: options,
            correctAnswer: options.indexOf(q.correct_answer),
            level: level,
            teamId: team.id // Assign the team ID to each question
          });
        });
      });

      // Update active quiz with new questions
      const updatedQuiz = {
        ...quiz,
        questions: [
          ...quiz.questions.filter(q => q.level !== level),
          ...finalQuestions
        ]
      };
      
      setActiveQuiz(updatedQuiz);
      setLevelQuestions(finalQuestions);
      
      console.log(`Loaded ${finalQuestions.length} questions for level ${level}`, finalQuestions);
      setIsLoadingQuestions(false);
      
    } catch (error) {
      console.error('Error loading questions:', error);
      
      // Create fallback questions if API fails
      const fallbackQuestions: Question[] = [];
      
      // Generate fallback questions for each team
      quiz.teams.forEach((team, teamIndex) => {
        const questionsPerTeam = quiz.questions_per_level[level];
        
        for (let i = 0; i < questionsPerTeam; i++) {
          fallbackQuestions.push({
            id: `${level}_fallback_${teamIndex}_${i}_${Date.now()}`,
            text: `${level.charAt(0).toUpperCase() + level.slice(1)} Question ${i + 1} for ${team.name}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0,
            level: level,
            teamId: team.id
          });
        }
      });
      
      // Update active quiz with fallback questions
      const updatedQuiz = {
        ...quiz,
        questions: [
          ...quiz.questions.filter(q => q.level !== level),
          ...fallbackQuestions
        ]
      };
      
      setActiveQuiz(updatedQuiz);
      setLevelQuestions(fallbackQuestions);
      setIsLoadingQuestions(false);
      toast.error('Using fallback questions due to API error');
    }
  };

  const createQuiz = async (quizData: Omit<Quiz, 'id' | 'created_at' | 'questions'>) => {
    if (!user) {
      toast.error('You must be logged in to create a quiz');
      return;
    }

    try {
      console.log('Starting quiz creation with data:', quizData);
      
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          title: quizData.title,
          topics: quizData.topics,
          created_by: user.id,
          teams: quizData.teams,
          questions: [],
          show_answers_at_end: quizData.show_answers_at_end,
          timeouts_in_seconds: quizData.timeouts_in_seconds,
          questions_per_level: quizData.questions_per_level,
          category_ids: quizData.category_ids || []
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Quiz saved to database:', data);

      await loadQuizzes();
      
      toast.success('Quiz created successfully!');
    } catch (error: unknown) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    }
  };

  const deleteQuiz = async (quizId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete a quiz');
      return;
    }

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId)
        .eq('created_by', user.id);

      if (error) throw error;

      setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
      
      toast.success('Quiz deleted successfully!');
    } catch (error: unknown) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    }
  };

  const startQuiz = async (quizId: string) => {
    try {
      const quiz = quizzes.find(q => q.id === quizId);
      if (!quiz) {
        toast.error('Quiz not found');
        return;
      }
      
      setIsLoadingQuestions(true);
      
      console.log('Starting quiz:', quiz);
      
      setActiveQuiz(quiz);
      setActiveLevel('easy');
      setCurrentQuestionIndex(0);
      setCurrentTeamIndex(0);
      setSelectedOption(null);
      setAnswersRevealed(false);
      setLevelQuestions([]);
      
      // Load questions for the first level before starting
      await loadQuestionsForLevel(quiz, 'easy');
      
      const initialTime = quiz.timeouts_in_seconds.easy;
      setTimeLeft(initialTime);
      setIsRunning(true);
      setIsLoadingQuestions(false);
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error('Failed to start quiz');
      setIsLoadingQuestions(false);
    }
  };

  const answerQuestion = (questionId: string, optionIndex: number) => {
    if (!activeQuiz) return;
    
    const question = activeQuiz.questions.find(q => q.id === questionId);
    if (!question) return;
    
    setSelectedOption(optionIndex);
    
    if (!activeQuiz.show_answers_at_end) {
      setAnswersRevealed(true);
      setIsRunning(false);
      if (timer) clearInterval(timer);
    } else {
      setIsRunning(false);
      if (timer) clearInterval(timer);
    }
    
    const isCorrect = optionIndex === question.correctAnswer;
    
    const updatedTeams = activeQuiz.teams.map((team, i) => {
      if (i === currentTeamIndex) {
        return {
          ...team,
          score: isCorrect ? team.score + 1 : team.score,
          answeredQuestions: [
            ...team.answeredQuestions,
            {
              questionId,
              correct: isCorrect,
              selectedOption: optionIndex
            }
          ]
        };
      }
      return team;
    });
    
    setActiveQuiz({
      ...activeQuiz,
      teams: updatedTeams
    });
  };

  const nextQuestion = () => {
    if (!activeQuiz) return;
    
    setSelectedOption(null);
    setAnswersRevealed(false);
    
    const currentTeam = activeQuiz.teams[currentTeamIndex];
    const teamQuestions = activeQuiz.questions.filter(q => 
      q.level === activeLevel && q.teamId === currentTeam.id
    );
    
    if (currentQuestionIndex >= teamQuestions.length - 1) {
      return;
    }
    
    const nextTeamIndex = (currentTeamIndex + 1) % activeQuiz.teams.length;
    setCurrentTeamIndex(nextTeamIndex);
    
    if (nextTeamIndex === 0) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
    
    const timerDuration = activeQuiz.timeouts_in_seconds[activeLevel];
    setTimeLeft(timerDuration);
    setIsRunning(true);
  };

  const nextLevel = async (): Promise<boolean> => {
    if (!activeQuiz) return false;
    
    try {
      setIsLoadingQuestions(true);
      
      if (activeLevel === 'easy') {
        await loadQuestionsForLevel(activeQuiz, 'medium');
        setActiveLevel('medium');
        setCurrentQuestionIndex(0);
        setCurrentTeamIndex(0);
        setSelectedOption(null);
        setAnswersRevealed(false);
        
        const timerDuration = activeQuiz.timeouts_in_seconds.medium;
        setTimeLeft(timerDuration);
        setIsRunning(true);
        setIsLoadingQuestions(false);
        return true;
      } else if (activeLevel === 'medium') {
        await loadQuestionsForLevel(activeQuiz, 'hard');
        setActiveLevel('hard');
        setCurrentQuestionIndex(0);
        setCurrentTeamIndex(0);
        setSelectedOption(null);
        setAnswersRevealed(false);
        
        const timerDuration = activeQuiz.timeouts_in_seconds.hard;
        setTimeLeft(timerDuration);
        setIsRunning(true);
        setIsLoadingQuestions(false);
        return true;
      }
      
      setIsLoadingQuestions(false);
      return false;
    } catch (error) {
      console.error('Error transitioning to next level:', error);
      toast.error('Failed to load next level');
      setIsLoadingQuestions(false);
      return false;
    }
  };

  const endQuiz = () => {
    setActiveQuiz(null);
    setActiveLevel('easy');
    setCurrentQuestionIndex(0);
    setCurrentTeamIndex(0);
    setIsRunning(false);
    setSelectedOption(null);
    setAnswersRevealed(false);
    setLevelQuestions([]);
    if (timer) clearInterval(timer);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    quizzes,
    activeQuiz,
    isCreating,
    setIsCreating,
    activeLevel,
    setActiveLevel,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    currentTeamIndex,
    setCurrentTeamIndex,
    setTimeLeft,
    timeLeft,
    isRunning,
    setIsRunning,
    selectedOption,
    setSelectedOption,
    answersRevealed,
    setAnswersRevealed,
    isLoadingQuestions,
    createQuiz,
    startQuiz,
    answerQuestion,
    nextQuestion,
    nextLevel,
    endQuiz,
    loadQuizzes,
    deleteQuiz,
  }), [
    quizzes,
    activeQuiz,
    isCreating,
    activeLevel,
    currentQuestionIndex,
    currentTeamIndex,
    timeLeft,
    isRunning,
    selectedOption,
    answersRevealed,
    isLoadingQuestions,
  ]);

  return (
    <QuizContext.Provider value={contextValue}>
      {children}
    </QuizContext.Provider>
  );
};
