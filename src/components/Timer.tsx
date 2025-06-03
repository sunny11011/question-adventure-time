
import React, { useEffect } from 'react';
import { useQuiz } from '@/contexts/QuizContext';

const Timer = () => {
  const { timeLeft, isRunning, answersRevealed } = useQuiz();
  
  // Calculate normalized percentage for the circle
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timeLeft / 60); // Normalize to 60s max
  
  // Choose color based on time left
  const getTimerColor = () => {
    if (timeLeft > 15) return '#10B981'; // Green
    if (timeLeft > 5) return '#F97316';  // Orange
    return '#EF4444';                     // Red
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Animation class for last 5 seconds
  const pulseClass = timeLeft <= 5 && isRunning ? 'animate-pulse text-quiz-red' : '';

  return (
    <div className={`flex items-center justify-center ${answersRevealed ? 'opacity-50' : ''}`}>
      <div className="relative inline-flex">
        <svg className="w-12 h-12">
          <circle 
            className="text-gray-200" 
            strokeWidth="4" 
            stroke="currentColor" 
            fill="transparent" 
            r={radius} 
            cx="24" 
            cy="24"
          />
          <circle 
            className="transition-all duration-1000 ease-in-out"
            strokeWidth="4" 
            strokeDasharray={circumference} 
            strokeDashoffset={isRunning ? strokeDashoffset : 0} 
            strokeLinecap="round" 
            stroke={getTimerColor()} 
            fill="transparent" 
            r={radius} 
            cx="24" 
            cy="24" 
            transform="rotate(-90 24 24)"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-medium ${pulseClass}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
};

export default Timer;
