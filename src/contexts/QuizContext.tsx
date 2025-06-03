
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type QuizLevel = 'easy' | 'medium' | 'hard';

export type Question = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  level: QuizLevel;
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
  createdBy: string;
  createdAt: Date;
  teams: Team[];
  questions: Question[];
  showAnswersAtEnd: boolean;
  timeoutsInSeconds: {
    easy: number;
    medium: number;
    hard: number;
  };
  questionsPerLevel: {
    easy: number;
    medium: number;
    hard: number;
  };
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
  
  createQuiz: (quizData: Omit<Quiz, 'id' | 'createdAt' | 'questions'>) => Promise<void>;
  startQuiz: (quizId: string) => void;
  answerQuestion: (questionId: string, optionIndex: number) => void;
  nextQuestion: () => void;
  nextLevel: () => boolean;
  endQuiz: () => void;
  generateQuestions: (topics: string[], questionsPerLevel: Quiz['questionsPerLevel']) => Promise<Question[]>;
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

  useEffect(() => {
    // Load saved quizzes from localStorage
    const savedQuizzes = localStorage.getItem('quizzes');
    if (savedQuizzes) {
      try {
        const parsed = JSON.parse(savedQuizzes);
        // Convert date strings back to Date objects
        const quizzesWithDates = parsed.map((quiz: any) => ({
          ...quiz,
          createdAt: new Date(quiz.createdAt)
        }));
        setQuizzes(quizzesWithDates);
      } catch (error) {
        console.error('Failed to parse saved quizzes:', error);
        localStorage.removeItem('quizzes');
      }
    }
  }, []);

  useEffect(() => {
    // Save quizzes to localStorage whenever they change
    if (quizzes.length > 0) {
      localStorage.setItem('quizzes', JSON.stringify(quizzes));
    }
  }, [quizzes]);

  useEffect(() => {
    // Timer logic
    if (isRunning && timeLeft > 0 && !answersRevealed) {
      const timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            setAnswersRevealed(true);
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

  // Mock function to generate quiz questions based on topics
  const generateQuestions = async (
    topics: string[], 
    questionsPerLevel: Quiz['questionsPerLevel']
  ): Promise<Question[]> => {
    // In a real app, this would call an AI API to generate questions
    // For now, we'll return mock questions based on the topics and levels

    const mockQuestions: Question[] = [];
    
    // Generate easy questions
    for (let i = 0; i < questionsPerLevel.easy; i++) {
      const topicIndex = i % topics.length;
      mockQuestions.push({
        id: `q_easy_${i}`,
        text: `Easy question about ${topics[topicIndex]} (#${i + 1})`,
        options: [
          `Answer option A for ${topics[topicIndex]}`,
          `Answer option B for ${topics[topicIndex]}`,
          `Answer option C for ${topics[topicIndex]}`,
          `Answer option D for ${topics[topicIndex]}`
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        level: 'easy'
      });
    }
    
    // Generate medium questions
    for (let i = 0; i < questionsPerLevel.medium; i++) {
      const topicIndex = i % topics.length;
      mockQuestions.push({
        id: `q_medium_${i}`,
        text: `Medium question about ${topics[topicIndex]} (#${i + 1})`,
        options: [
          `Answer option A for ${topics[topicIndex]}`,
          `Answer option B for ${topics[topicIndex]}`,
          `Answer option C for ${topics[topicIndex]}`,
          `Answer option D for ${topics[topicIndex]}`
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        level: 'medium'
      });
    }
    
    // Generate hard questions
    for (let i = 0; i < questionsPerLevel.hard; i++) {
      const topicIndex = i % topics.length;
      mockQuestions.push({
        id: `q_hard_${i}`,
        text: `Hard question about ${topics[topicIndex]} (#${i + 1})`,
        options: [
          `Answer option A for ${topics[topicIndex]}`,
          `Answer option B for ${topics[topicIndex]}`,
          `Answer option C for ${topics[topicIndex]}`,
          `Answer option D for ${topics[topicIndex]}`
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        level: 'hard'
      });
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return mockQuestions;
  };

  const createQuiz = async (quizData: Omit<Quiz, 'id' | 'createdAt' | 'questions'>) => {
    try {
      toast.loading('Generating quiz questions...');
      
      // Generate questions using our mock function
      const questions = await generateQuestions(
        quizData.topics, 
        quizData.questionsPerLevel
      );
      
      // Create the new quiz
      const newQuiz: Quiz = {
        ...quizData,
        id: `quiz_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date(),
        questions,
      };
      
      setQuizzes((prev) => [...prev, newQuiz]);
      toast.success('Quiz created successfully!');
      return;
    } catch (error) {
      toast.error('Failed to create quiz: ' + (error as Error).message);
      throw error;
    }
  };

  const startQuiz = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) {
      toast.error('Quiz not found');
      return;
    }
    
    // Reset quiz state
    setActiveQuiz(quiz);
    setActiveLevel('easy');
    setCurrentQuestionIndex(0);
    setCurrentTeamIndex(0);
    setSelectedOption(null);
    setAnswersRevealed(false);
    
    // Set the timeout for the first question
    setTimeLeft(quiz.timeoutsInSeconds.easy);
    setIsRunning(true);
  };

  const answerQuestion = (questionId: string, optionIndex: number) => {
    if (!activeQuiz) return;
    
    const question = activeQuiz.questions.find(q => q.id === questionId);
    if (!question) return;
    
    setSelectedOption(optionIndex);
    
    // If we're not showing answers at the end, reveal it now
    if (!activeQuiz.showAnswersAtEnd) {
      setAnswersRevealed(true);
      setIsRunning(false);
      if (timer) clearInterval(timer);
    }
    
    // Update team score
    const currentTeam = activeQuiz.teams[currentTeamIndex];
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
    
    // Find questions filtered by current level
    const levelQuestions = activeQuiz.questions.filter(q => q.level === activeLevel);
    
    // If we've reached the end of the level, stay at the last question
    if (currentQuestionIndex >= levelQuestions.length - 1) {
      return;
    }
    
    // Move to next team
    const nextTeamIndex = (currentTeamIndex + 1) % activeQuiz.teams.length;
    setCurrentTeamIndex(nextTeamIndex);
    
    // If we've gone through all teams, move to the next question
    if (nextTeamIndex === 0) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
    
    // Reset timer
    setTimeLeft(activeQuiz.timeoutsInSeconds[activeLevel]);
    setIsRunning(true);
  };

  const nextLevel = () => {
    if (!activeQuiz) return false;
    
    // Move to next level
    if (activeLevel === 'easy') {
      setActiveLevel('medium');
      setCurrentQuestionIndex(0);
      setCurrentTeamIndex(0);
      setTimeLeft(activeQuiz.timeoutsInSeconds.medium);
      setIsRunning(true);
      return true;
    } else if (activeLevel === 'medium') {
      setActiveLevel('hard');
      setCurrentQuestionIndex(0);
      setCurrentTeamIndex(0);
      setTimeLeft(activeQuiz.timeoutsInSeconds.hard);
      setIsRunning(true);
      return true;
    }
    
    // No more levels
    return false;
  };

  const endQuiz = () => {
    // Update the quizzes list with the results
    if (activeQuiz) {
      setQuizzes(prev => 
        prev.map(q => q.id === activeQuiz.id ? activeQuiz : q)
      );
    }
    
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

  return (
    <QuizContext.Provider value={{
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
      generateQuestions,
    }}>
      {children}
    </QuizContext.Provider>
  );
};
