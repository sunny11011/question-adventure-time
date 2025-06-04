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
  teamId?: string; // Add team-specific questions
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
  category_ids?: number[];
};

type QuizContextType = {
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
  timeLeft: number;
  isRunning: boolean;
  setIsRunning: (value: boolean) => void;
  selectedOption: number | null;
  setSelectedOption: (option: number | null) => void;
  answersRevealed: boolean;
  setAnswersRevealed: (revealed: boolean) => void;
  
  createQuiz: (quizData: Omit<Quiz, 'id' | 'created_at' | 'questions'>) => Promise<void>;
  startQuiz: (quizId: string) => void;
  answerQuestion: (questionId: string, optionIndex: number) => void;
  nextQuestion: () => void;
  nextLevel: () => boolean;
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

  const createQuiz = async (quizData: Omit<Quiz, 'id' | 'created_at' | 'questions'>) => {
    if (!user) {
      toast.error('You must be logged in to create a quiz');
      return;
    }

    try {
      console.log('Starting quiz creation with data:', quizData);
      
      // Generate questions using Trivia API with different questions for each team
      const questions = await generateQuizQuestions(
        quizData.category_ids || [], 
        quizData.questions_per_level,
        quizData.teams.length
      );

      console.log('Generated questions:', questions);

      // Assign questions to teams using proper team IDs
      const questionsWithTeams = questions.map((question, index) => {
        const teamIndex = parseInt(question.teamId?.split('_')[1] || '0');
        return {
          ...question,
          teamId: quizData.teams[teamIndex]?.id || quizData.teams[0].id
        };
      });

      console.log('Questions with team assignments:', questionsWithTeams);

      // Save to Supabase
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          title: quizData.title,
          topics: quizData.topics,
          created_by: user.id,
          teams: quizData.teams,
          questions: questionsWithTeams,
          show_answers_at_end: quizData.show_answers_at_end,
          timeouts_in_seconds: quizData.timeouts_in_seconds,
          questions_per_level: quizData.questions_per_level,
          category_ids: quizData.category_ids || []
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Quiz saved to database:', data);

      // Reload quizzes
      await loadQuizzes();
      
      toast.success('Quiz created successfully!');
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz: ' + error.message);
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

      // Update local state
      setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
      
      toast.success('Quiz deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz: ' + error.message);
    }
  };

  const startQuiz = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) {
      toast.error('Quiz not found');
      return;
    }
    
    console.log('Starting quiz:', quiz);
    
    // Reset quiz state
    setActiveQuiz(quiz);
    setActiveLevel('easy');
    setCurrentQuestionIndex(0);
    setCurrentTeamIndex(0);
    setSelectedOption(null);
    setAnswersRevealed(false);
    
    // Set the timeout for the first question and start timer immediately
    const initialTime = quiz.timeouts_in_seconds.easy;
    setTimeLeft(initialTime);
    setIsRunning(true);
    
    console.log('Quiz state set, timer started with', initialTime, 'seconds');
  };

  const answerQuestion = (questionId: string, optionIndex: number) => {
    if (!activeQuiz) return;
    
    const question = activeQuiz.questions.find(q => q.id === questionId);
    if (!question) return;
    
    setSelectedOption(optionIndex);
    
    // If we're not showing answers at the end, reveal it now
    if (!activeQuiz.show_answers_at_end) {
      setAnswersRevealed(true);
      setIsRunning(false);
      if (timer) clearInterval(timer);
    }
    
    // Update team score
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
    
    // Reset answer state
    setSelectedOption(null);
    setAnswersRevealed(false);
    
    // Get questions for current team and level
    const currentTeam = activeQuiz.teams[currentTeamIndex];
    const teamQuestions = activeQuiz.questions.filter(q => 
      q.level === activeLevel && q.teamId === currentTeam.id
    );
    
    // If we've reached the end of the level for this team, stay at the last question
    if (currentQuestionIndex >= teamQuestions.length - 1) {
      return;
    }
    
    // Move to next team
    const nextTeamIndex = (currentTeamIndex + 1) % activeQuiz.teams.length;
    setCurrentTeamIndex(nextTeamIndex);
    
    // If we've gone through all teams, move to the next question
    if (nextTeamIndex === 0) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
    
    // Reset timer and start immediately
    const timerDuration = activeQuiz.timeouts_in_seconds[activeLevel];
    setTimeLeft(timerDuration);
    setIsRunning(true);
  };

  const nextLevel = () => {
    if (!activeQuiz) return false;
    
    // Move to next level
    if (activeLevel === 'easy') {
      setActiveLevel('medium');
      setCurrentQuestionIndex(0);
      setCurrentTeamIndex(0);
      setSelectedOption(null);
      setAnswersRevealed(false);
      const timerDuration = activeQuiz.timeouts_in_seconds.medium;
      setTimeLeft(timerDuration);
      setIsRunning(true);
      return true;
    } else if (activeLevel === 'medium') {
      setActiveLevel('hard');
      setCurrentQuestionIndex(0);
      setCurrentTeamIndex(0);
      setSelectedOption(null);
      setAnswersRevealed(false);
      const timerDuration = activeQuiz.timeouts_in_seconds.hard;
      setTimeLeft(timerDuration);
      setIsRunning(true);
      return true;
    }
    
    // No more levels
    return false;
  };

  const endQuiz = () => {
    // Reset quiz state
    setActiveQuiz(null);
    setActiveLevel('easy');
    setCurrentQuestionIndex(0);
    setCurrentTeamIndex(0);
    setIsRunning(false);
    setSelectedOption(null);
    setAnswersRevealed(false);
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
    timeLeft,
    isRunning,
    setIsRunning,
    selectedOption,
    setSelectedOption,
    answersRevealed,
    setAnswersRevealed,
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
  ]);

  return (
    <QuizContext.Provider value={contextValue}>
      {children}
    </QuizContext.Provider>
  );
};
