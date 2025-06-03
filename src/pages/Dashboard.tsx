
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuiz } from '@/contexts/QuizContext';
import { useAuth } from '@/contexts/AuthContext';
import QuizCard from '@/components/QuizCard';
import QuizForm from '@/components/QuizForm';
import Layout from '@/components/Layout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { quizzes, isCreating, setIsCreating, startQuiz } = useQuiz();
  
  // Filter quizzes for the current user
  const userQuizzes = quizzes.filter(quiz => quiz.created_by === user?.id);
  
  const handleCreateQuiz = () => {
    setIsCreating(true);
  };
  
  const handleStartQuiz = (quizId: string) => {
    startQuiz(quizId);
    navigate('/quiz');
  };
  
  return (
    <Layout>
      <div className="container max-w-6xl py-8">
        {isCreating ? (
          <QuizForm />
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-gray-600">Manage your quizzes and create new ones</p>
              </div>
              <Button 
                className="quiz-button-primary mt-4 md:mt-0"
                onClick={handleCreateQuiz}
              >
                Create Quiz
              </Button>
            </div>
            
            {userQuizzes.length === 0 ? (
              <div className="bg-white rounded-xl border p-8 text-center">
                <h2 className="text-xl font-medium mb-2">No quizzes yet</h2>
                <p className="text-gray-600 mb-6">
                  Create your first quiz to get started.
                </p>
                <Button 
                  className="quiz-button-primary"
                  onClick={handleCreateQuiz}
                >
                  Create Your First Quiz
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userQuizzes.map((quiz) => (
                  <QuizCard 
                    key={quiz.id} 
                    quiz={quiz} 
                    onStart={() => handleStartQuiz(quiz.id)} 
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
