
import React from 'react';
import { useQuiz, Team, Question } from '@/contexts/QuizContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const QuizResults = () => {
  const { activeQuiz, endQuiz } = useQuiz();
  
  if (!activeQuiz) return null;
  
  // Get all quiz questions
  const allQuestions = activeQuiz.questions;
  
  // Order teams by score (descending)
  const sortedTeams = [...activeQuiz.teams].sort((a, b) => b.score - a.score);
  const winningTeam = sortedTeams[0];
  const isTie = sortedTeams.length > 1 && sortedTeams[0].score === sortedTeams[1].score;
  
  // Calculate total possible score
  const totalQuestions = allQuestions.length;
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Card className="mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-quiz-purple to-quiz-purple-light text-white p-6">
          <h2 className="text-2xl font-bold text-center">Quiz Results</h2>
          <p className="text-center opacity-90">
            Thank you for playing!
          </p>
        </div>
        
        <CardHeader>
          <CardTitle className="text-center">
            {isTie ? (
              <div className="text-xl">It's a tie!</div>
            ) : (
              <div>
                <div className="text-xl">Winner: <span className="text-quiz-purple">{winningTeam.name}</span></div>
                <div className="text-sm text-gray-500 mt-1">
                  with {winningTeam.score} points ({Math.round((winningTeam.score / totalQuestions) * 100)}% correct)
                </div>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-3">Final Standings</h3>
            <div className="space-y-2">
              {sortedTeams.map((team, index) => (
                <TeamResultRow
                  key={team.id}
                  team={team}
                  position={index + 1}
                  totalQuestions={totalQuestions}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Questions & Answers</h3>
            <div className="space-y-6">
              {allQuestions.map((question) => (
                <QuestionResultCard 
                  key={question.id}
                  question={question}
                  teams={activeQuiz.teams}
                />
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pb-6">
          <Button
            className="quiz-button-primary px-8"
            onClick={endQuiz}
          >
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
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
  
  // Define position colors
  const getPositionBadge = () => {
    switch (position) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-100 border border-yellow-300 flex items-center justify-center text-yellow-800 font-bold">
            1
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-800 font-bold">
            2
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold">
            3
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 font-bold">
            {position}
          </div>
        );
    }
  };
  
  return (
    <div className="flex items-center p-3 rounded-lg bg-white border">
      {getPositionBadge()}
      
      <div className="ml-4 flex-grow">
        <div className="font-medium">{team.name}</div>
        <div className="text-sm text-gray-500">
          {correctAnswers} of {totalQuestions} correct ({percentage}%)
        </div>
      </div>
      
      <div className="font-bold text-xl text-quiz-purple">
        {team.score}
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
        return <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">Easy</span>;
      case 'medium':
        return <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Medium</span>;
      case 'hard':
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">Hard</span>;
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
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="font-medium">
            {question.text}
          </div>
          <div className="ml-3">
            {getLevelBadge()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {question.options.map((option, i) => (
            <div 
              key={i}
              className={`p-3 rounded-lg border ${
                question.correctAnswer === i ? 'bg-green-50 border-quiz-green' : 'bg-white'
              }`}
            >
              <div className="flex justify-between">
                <div>
                  <span className={`inline-block w-5 h-5 rounded-full mr-2 text-xs flex items-center justify-center ${
                    question.correctAnswer === i 
                      ? 'bg-quiz-green text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </div>
                
                {question.correctAnswer === i && (
                  <div className="text-quiz-green text-sm font-medium">
                    Correct Answer
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
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.answer?.correct
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.teamName}: {item.answer?.selectedOption !== undefined 
                    ? String.fromCharCode(65 + item.answer.selectedOption) 
                    : 'No answer'}
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
