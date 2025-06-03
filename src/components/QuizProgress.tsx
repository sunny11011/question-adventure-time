
import React from 'react';
import { useQuiz, QuizLevel } from '@/contexts/QuizContext';
import { Progress } from '@/components/ui/progress';

const QuizProgress = () => {
  const { activeQuiz, activeLevel, currentQuestionIndex } = useQuiz();
  
  if (!activeQuiz) return null;
  
  // Get all questions for current level
  const levelQuestions = activeQuiz.questions.filter(q => q.level === activeLevel);
  const totalQuestions = levelQuestions.length;
  const currentProgress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  
  // Define styles based on level
  const getLevelStyles = (level: QuizLevel): { color: string; bgColor: string } => {
    switch (level) {
      case 'easy':
        return { color: 'hsl(142, 76%, 36%)', bgColor: 'bg-green-100' };
      case 'medium':
        return { color: 'hsl(25, 95%, 53%)', bgColor: 'bg-orange-100' };
      case 'hard':
        return { color: 'hsl(0, 84%, 60%)', bgColor: 'bg-red-100' };
      default:
        return { color: 'hsl(221, 83%, 53%)', bgColor: 'bg-blue-100' };
    }
  };
  
  const styles = getLevelStyles(activeLevel);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: styles.color }}
          ></div>
          <span className="font-medium capitalize">
            {activeLevel} Level - Question {currentQuestionIndex + 1}/{totalQuestions}
          </span>
        </div>
        
        <div className="text-sm text-gray-600">
          {Math.round(currentProgress)}% Complete
        </div>
      </div>
      
      <div 
        className={`${styles.bgColor} h-2`}
        style={{
          '--progress-foreground': styles.color,
        } as React.CSSProperties}
      >
        <Progress 
          value={currentProgress}
          className="h-2"
          style={{
            '--progress-foreground': styles.color,
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
};

export default QuizProgress;
