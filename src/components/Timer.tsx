
import React, { useEffect } from 'react';
import { useQuiz } from '@/contexts/QuizContext';

const Timer = () => {
  const { timeLeft, isRunning, answersRevealed, activeQuiz, activeLevel } = useQuiz();
  
  // Get the initial time for the current level to calculate progress
  const initialTime = activeQuiz?.timeouts_in_seconds[activeLevel] || 60;
  
  // Calculate progress percentage (0 to 1)
  const progress = timeLeft / initialTime;
  
  // Calculate circle properties
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  
  // Choose color based on time left percentage
  const getTimerColor = () => {
    if (progress > 0.5) return '#10B981'; // Green
    if (progress > 0.25) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get size classes based on urgency
  const getSizeClasses = () => {
    if (timeLeft <= 5 && isRunning) return 'w-16 h-16'; // Larger when urgent
    return 'w-14 h-14'; // Normal size
  };
  
  // Animation classes for urgency
  const getAnimationClasses = () => {
    if (timeLeft <= 10 && timeLeft > 5 && isRunning) return 'animate-pulse';
    if (timeLeft <= 5 && isRunning) return 'animate-bounce';
    return '';
  };

  return (
    <div className={`flex items-center justify-center ${answersRevealed ? 'opacity-60' : ''}`}>
      <div className={`relative inline-flex ${getSizeClasses()} ${getAnimationClasses()}`}>
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle 
            className="text-gray-200" 
            strokeWidth="3" 
            stroke="currentColor" 
            fill="transparent" 
            r={radius} 
            cx="50%" 
            cy="50%"
          />
          {/* Progress circle */}
          <circle 
            className="transition-all duration-1000 ease-linear"
            strokeWidth="3" 
            strokeDasharray={circumference} 
            strokeDashoffset={isRunning ? strokeDashoffset : 0} 
            strokeLinecap="round" 
            stroke={getTimerColor()} 
            fill="transparent" 
            r={radius} 
            cx="50%" 
            cy="50%"
          />
        </svg>
        
        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold ${
            timeLeft <= 5 && isRunning ? 'text-red-600' : 'text-gray-700'
          }`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        
        {/* Warning indicator for last 10 seconds */}
        {timeLeft <= 10 && isRunning && !answersRevealed && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        )}
      </div>
      
      {/* Status text */}
      <div className="ml-3 text-sm">
        <div className="font-medium text-gray-700">
          {isRunning && !answersRevealed ? 'Time Running' : 'Paused'}
        </div>
        <div className="text-xs text-gray-500">
          {initialTime}s total
        </div>
      </div>
    </div>
  );
};

export default Timer;
