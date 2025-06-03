
import React from 'react';
import { useQuiz, Team } from '@/contexts/QuizContext';

const TeamScore = () => {
  const { activeQuiz, currentTeamIndex } = useQuiz();
  
  if (!activeQuiz) return null;
  
  // Order teams by score (descending)
  const sortedTeams = [...activeQuiz.teams].sort((a, b) => b.score - a.score);
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-medium mb-3 text-center">Team Scores</h3>
      
      <div className="space-y-3">
        {sortedTeams.map((team, index) => (
          <TeamScoreRow
            key={team.id}
            team={team}
            position={index + 1}
            isCurrentTeam={team.id === activeQuiz.teams[currentTeamIndex].id}
          />
        ))}
      </div>
    </div>
  );
};

type TeamScoreRowProps = {
  team: Team;
  position: number;
  isCurrentTeam: boolean;
};

const TeamScoreRow = ({ team, position, isCurrentTeam }: TeamScoreRowProps) => {
  // Define position colors
  const getPositionClass = () => {
    switch (position) {
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-gray-100 text-gray-800';
      case 3:
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };
  
  return (
    <div className={`flex items-center p-2 rounded-lg ${isCurrentTeam ? 'bg-purple-50 border border-quiz-purple' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${getPositionClass()}`}>
        {position}
      </div>
      
      <div className="ml-3 flex-grow">
        <div className="flex items-center">
          <span className={`font-medium ${isCurrentTeam ? 'text-quiz-purple' : ''}`}>{team.name}</span>
          {isCurrentTeam && (
            <span className="ml-2 text-xs bg-quiz-purple text-white px-2 py-0.5 rounded-full">
              Current
            </span>
          )}
        </div>
      </div>
      
      <div className="font-semibold text-lg">
        {team.score}
      </div>
    </div>
  );
};

export default TeamScore;
