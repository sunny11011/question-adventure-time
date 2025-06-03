
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quiz } from '@/contexts/QuizContext';
import { Trash } from 'lucide-react';

type QuizCardProps = {
  quiz: Quiz;
  onStart: () => void;
  onDelete: (quizId: string) => void;
};

const QuizCard = ({ quiz, onStart, onDelete }: QuizCardProps) => {
  const navigate = useNavigate();
  
  // Helper to format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      onDelete(quiz.id);
    }
  };

  return (
    <Card className="quiz-card overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{quiz.title}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">
              {formatDate(quiz.created_at)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <div className="mb-3">
          <div className="flex flex-wrap gap-2 mb-2">
            {quiz.topics.map((topic, index) => (
              <div 
                key={index}
                className="text-xs font-medium px-2 py-1 rounded-full bg-quiz-purple-light/20 text-quiz-purple"
              >
                {topic}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-600">
            <p className="mb-1">
              <span className="font-medium">Teams:</span> {quiz.teams.map(t => t.name).join(', ')}
            </p>
            <p className="mb-1">
              <span className="font-medium">Questions:</span> {
                Object.values(quiz.questions_per_level).reduce((acc: number, curr: number) => acc + curr, 0)
              }
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs mt-2">
          <div className="p-2 rounded-md bg-green-50 border border-green-100">
            <div className="font-semibold text-green-600 mb-1">Easy</div>
            <div>{quiz.questions_per_level.easy} Q / {quiz.timeouts_in_seconds.easy}s</div>
          </div>
          <div className="p-2 rounded-md bg-orange-50 border border-orange-100">
            <div className="font-semibold text-orange-600 mb-1">Medium</div>
            <div>{quiz.questions_per_level.medium} Q / {quiz.timeouts_in_seconds.medium}s</div>
          </div>
          <div className="p-2 rounded-md bg-red-50 border border-red-100">
            <div className="font-semibold text-red-600 mb-1">Hard</div>
            <div>{quiz.questions_per_level.hard} Q / {quiz.timeouts_in_seconds.hard}s</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          className="w-full quiz-button-primary"
          onClick={onStart}
        >
          Start Quiz
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
