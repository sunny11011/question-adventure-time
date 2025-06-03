
import React from 'react';

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-2xl font-bold gradient-text">QuizMaster</span>
      <div className="ml-2 flex gap-0.5">
        <div className="h-2 w-2 rounded-full bg-quiz-purple animate-pulse-light"></div>
        <div className="h-2 w-2 rounded-full bg-quiz-orange animate-pulse-light" style={{ animationDelay: "0.2s" }}></div>
        <div className="h-2 w-2 rounded-full bg-quiz-purple-light animate-pulse-light" style={{ animationDelay: "0.4s" }}></div>
      </div>
    </div>
  );
};

export default Logo;
