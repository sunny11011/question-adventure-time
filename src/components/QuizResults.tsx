
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz, Team, Question } from '@/contexts/QuizContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { award } from 'lucide-react';

const QuizResults = () => {
  const navigate = useNavigate();
  const { activeQuiz, endQuiz } = useQuiz();
  
  if (!activeQuiz) return null;
  
  // Get all quiz questions
  const allQuestions = activeQuiz.questions;
  
  // Order teams by score (descending)
  const sortedTeams = [...activeQuiz.teams].sort((a, b) => b.score - a.score);
  const winningTeam = sortedTeams[0];
  const isTie = sortedTeams.length > 1 && sortedTeams[0].score === sortedTeams[1].score;
  
  // Calculate total possible score per team
  const questionsPerTeam = allQuestions.filter(q => q.teamId === activeQuiz.teams[0].id).length;
  
  const handleReturnToDashboard = () => {
    endQuiz();
    navigate('/dashboard');
  };
  
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Winner announcement */}
      <Card className="mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-quiz-purple via-quiz-purple-light to-quiz-purple text-white p-8 text-center relative">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10">
            <award className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
            <h1 className="text-4xl font-bold mb-2">🎉 Quiz Complete! 🎉</h1>
            {isTie ? (
              <div>
                <p className="text-2xl mb-2">It's a tie!</p>
                <p className="text-lg opacity-90">
                  Multiple teams scored {winningTeam.score} points
                </p>
              </div>
            ) : (
              <div>
                <p className="text-2xl mb-2">
                  🏆 Winner: <span className="font-bold text-yellow-300">{winningTeam.name}</span>
                </p>
                <p className="text-lg opacity-90">
                  with {winningTeam.score} out of {questionsPerTeam} points 
                  ({Math.round((winningTeam.score / questionsPerTeam) * 100)}% correct)
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Final standings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            🏅 Final Standings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedTeams.map((team, index) => (
              <TeamResultRow
                key={team.id}
                team={team}
                position={index + 1}
                totalQuestions={questionsPerTeam}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiz statistics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">📊 Quiz Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{activeQuiz.teams.length}</div>
              <div className="text-gray-600">Teams Participated</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{questionsPerTeam}</div>
              <div className="text-gray-600">Questions per Team</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(sortedTeams.reduce((acc, team) => acc + (team.score / questionsPerTeam * 100), 0) / sortedTeams.length)}%
              </div>
              <div className="text-gray-600">Average Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions review */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">📝 Questions & Answers Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Group questions by level */}
            {(['easy', 'medium', 'hard'] as const).map(level => {
              const levelQuestions = allQuestions.filter(q => q.level === level);
              if (levelQuestions.length === 0) return null;
              
              const levelColors = {
                easy: 'text-green-600',
                medium: 'text-orange-600', 
                hard: 'text-red-600'
              };
              
              return (
                <div key={level}>
                  <h3 className={`text-xl font-bold mb-4 ${levelColors[level]} capitalize`}>
                    {level} Questions
                  </h3>
                  <div className="space-y-4">
                    {levelQuestions.slice(0, Math.ceil(levelQuestions.length / activeQuiz.teams.length)).map((question) => (
                      <QuestionResultCard 
                        key={question.id}
                        question={question}
                        teams={activeQuiz.teams}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="text-center pb-8">
        <Button
          className="quiz-button-primary px-12 py-4 text-lg"
          onClick={handleReturnToDashboard}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

type TeamResultRowProps = {
  team: Team;
  position: number;
  totalQuestions: number;
};

const TeamResultRow = ({ team, position, totalQuestions }: TeamResultRowProps) => {
  const correctAnswers = team.answeredQuestions.filter(q => q.correct).length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Define position colors and medals
  const getPositionDisplay = () => {
    switch (position) {
      case 1:
        return {
          medal: '🥇',
          bgColor: 'bg-gradient-to-r from-yellow-100 to-yellow-200',
          borderColor: 'border-yellow-300',
          textColor: 'text-yellow-800'
        };
      case 2:
        return {
          medal: '🥈',
          bgColor: 'bg-gradient-to-r from-gray-100 to-gray-200',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-800'
        };
      case 3:
        return {
          medal: '🥉',
          bgColor: 'bg-gradient-to-r from-orange-100 to-orange-200',
          borderColor: 'border-orange-300',
          textColor: 'text-orange-800'
        };
      default:
        return {
          medal: `#${position}`,
          bgColor: 'bg-white',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-600'
        };
    }
  };
  
  const positionStyle = getPositionDisplay();
  
  return (
    <div className={`flex items-center p-4 rounded-lg border-2 ${positionStyle.bgColor} ${positionStyle.borderColor} transition-all hover:shadow-md`}>
      <div className="text-2xl mr-4 min-w-[3rem] text-center">
        {positionStyle.medal}
      </div>
      
      <div className="flex-grow">
        <div className="font-bold text-lg">{team.name}</div>
        <div className="text-sm text-gray-600">
          {correctAnswers} of {totalQuestions} correct • {percentage}% accuracy
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-bold text-2xl text-quiz-purple">
          {team.score}
        </div>
        <div className="text-sm text-gray-500">points</div>
      </div>
    </div>
  );
};

type QuestionResultCardProps = {
  question: Question;
  teams: Team[];
};

const QuestionResultCard = ({ question, teams }: QuestionResultCardProps) => {
  // Get level style
  const getLevelBadge = () => {
    switch (question.level) {
      case 'easy':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Easy</span>;
      case 'medium':
        return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">Medium</span>;
      case 'hard':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Hard</span>;
    }
  };
  
  // Get teams that answered this question
  const teamAnswers = teams.map(team => {
    const answer = team.answeredQuestions.find(q => q.questionId === question.id);
    return {
      teamName: team.name,
      answer,
    };
  }).filter(item => item.answer);
  
  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="font-medium flex-grow pr-4">
            {question.text}
          </div>
          <div>
            {getLevelBadge()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {question.options.map((option, i) => (
            <div 
              key={i}
              className={`p-3 rounded-lg border transition-colors ${
                question.correctAnswer === i ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className={`inline-block w-6 h-6 rounded-full mr-3 text-sm flex items-center justify-center font-medium ${
                    question.correctAnswer === i 
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{option}</span>
                </div>
                
                {question.correctAnswer === i && (
                  <div className="text-green-600 text-sm font-medium flex items-center">
                    ✓ Correct Answer
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {teamAnswers.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="text-sm font-medium mb-2">Team Answers:</div>
            <div className="flex flex-wrap gap-2">
              {teamAnswers.map((item, i) => (
                <div 
                  key={i}
                  className={`text-sm px-3 py-1 rounded-full ${
                    item.answer?.correct
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {item.teamName}: {item.answer?.selectedOption !== undefined 
                    ? String.fromCharCode(65 + item.answer.selectedOption) 
                    : 'No answer'}
                  {item.answer?.correct ? ' ✓' : ' ✗'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResults;
