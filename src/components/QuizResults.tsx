
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz, Team } from '@/contexts/QuizContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

const QuizResults = () => {
  const navigate = useNavigate();
  const { activeQuiz, endQuiz } = useQuiz();
  
  if (!activeQuiz) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">No quiz results available</h1>
        <Button onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  // Sort teams by score (descending)
  const sortedTeams = [...activeQuiz.teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];
  
  const handleReturnToDashboard = () => {
    endQuiz();
    navigate('/dashboard');
  };
  
  // Calculate total questions
  const totalQuestions = Object.values(activeQuiz.questions_per_level).reduce((acc: number, curr: number) => acc + curr, 0);
  
  return (
    <div className="container max-w-4xl py-8">
      {/* Winner Announcement */}
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-4">
          <Award className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
        <h2 className="text-2xl font-semibold text-quiz-purple mb-1">
          🎉 {winner.name} Wins! 🎉
        </h2>
        <p className="text-lg text-gray-600">
          with {winner.score} out of {totalQuestions} correct answers
        </p>
      </div>

      {/* Team Rankings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Final Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedTeams.map((team, index) => (
              <TeamResultCard 
                key={team.id} 
                team={team} 
                position={index + 1}
                totalQuestions={totalQuestions}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiz Statistics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Quiz Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{activeQuiz.teams.length}</div>
              <div className="text-sm text-gray-600">Teams Participated</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{activeQuiz.topics.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      {activeQuiz.show_answers_at_end && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Question Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeQuiz.questions.slice(0, 5).map((question, index) => (
                <div key={question.id} className="border-l-4 border-quiz-purple pl-4">
                  <p className="font-medium mb-2">Q{index + 1}: {question.text}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex}
                        className={`p-2 rounded text-sm ${
                          optionIndex === question.correctAnswer
                            ? 'bg-green-100 text-green-800 font-medium'
                            : 'bg-gray-50 text-gray-600'
                        }`}
                      >
                        {option} {optionIndex === question.correctAnswer && '✓'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {activeQuiz.questions.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  ... and {activeQuiz.questions.length - 5} more questions
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="text-center">
        <Button 
          className="quiz-button-primary px-8 py-3 text-lg"
          onClick={handleReturnToDashboard}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

type TeamResultCardProps = {
  team: Team;
  position: number;
  totalQuestions: number;
};

const TeamResultCard = ({ team, position, totalQuestions }: TeamResultCardProps) => {
  const getPositionBadge = () => {
    switch (position) {
      case 1:
        return <Badge className="bg-yellow-500 text-white">🥇 1st Place</Badge>;
      case 2:
        return <Badge className="bg-gray-400 text-white">🥈 2nd Place</Badge>;
      case 3:
        return <Badge className="bg-amber-600 text-white">🥉 3rd Place</Badge>;
      default:
        return <Badge variant="outline">{position}th Place</Badge>;
    }
  };

  const percentage = Math.round((team.score / totalQuestions) * 100);

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
      position === 1 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-center space-x-4">
        <div className="flex flex-col items-center">
          {getPositionBadge()}
        </div>
        <div>
          <h3 className="font-bold text-lg">{team.name}</h3>
          <p className="text-sm text-gray-600">
            {team.score}/{totalQuestions} correct ({percentage}%)
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-2xl font-bold text-quiz-purple">{team.score}</div>
        <div className="text-sm text-gray-500">points</div>
      </div>
    </div>
  );
};

export default QuizResults;
