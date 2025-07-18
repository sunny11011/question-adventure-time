import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz, QuizLevel } from '@/contexts/QuizContext';
import { Button } from '@/components/ui/button';
import QuizProgress from '@/components/QuizProgress';
import Timer from '@/components/Timer';
import TeamScore from '@/components/TeamScore';
import QuizResults from '@/components/QuizResults';
import Layout from '@/components/Layout';

const QuizScreen = () => {
  const navigate = useNavigate();
  const { 
    activeQuiz, 
    activeLevel, 
    currentQuestionIndex, 
    currentTeamIndex,
    selectedOption, 
    answersRevealed,
    isRunning,
    isLoadingQuestions,
    nextQuestion,
    nextLevel,
    answerQuestion,
    setAnswersRevealed,
    setIsRunning,
    // Add missing state setters
    setCurrentTeamIndex,
    setCurrentQuestionIndex,
    setSelectedOption,
    setTimeLeft
  } = useQuiz();
  
  if (!activeQuiz) {
    return (
      <Layout>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No active quiz</h1>
          <p>Please return to the dashboard and start a quiz.</p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 quiz-button-primary"
          >
            Go to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  // Show loading state when fetching questions
  if (isLoadingQuestions) {
    return (
      <Layout>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Questions...</h1>
          <p>Fetching questions for {activeLevel} level</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quiz-purple mx-auto mt-4"></div>
        </div>
      </Layout>
    );
  }
  
  // Get current team
  const currentTeam = activeQuiz.teams[currentTeamIndex];
  
  // Get questions for current team and level
  const teamQuestions = activeQuiz.questions.filter(q => 
    q.level === activeLevel && q.teamId === currentTeam.id
  );
  
  // Check if we're at the end of all levels
  const isLastQuestion = currentQuestionIndex >= teamQuestions.length - 1;
  const isLastTeam = currentTeamIndex >= activeQuiz.teams.length - 1;
  const isLastLevel = activeLevel === 'hard';
  const isQuizComplete = isLastQuestion && isLastTeam && isLastLevel;
  
  // If all questions are answered for all levels, show the results
  if (isQuizComplete) {
    return (
      <Layout>
        <QuizResults />
      </Layout>
    );
  }
  
  // Get current question for this team
  const currentQuestion = teamQuestions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <Layout>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No questions available</h1>
          <p>There are no questions for this team and level.</p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 quiz-button-primary"
          >
            Go to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }
  
  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    if (answersRevealed || selectedOption !== null) return;
    
    answerQuestion(currentQuestion.id, optionIndex);
  };
  
  // Handle next question
  const handleNext = async () => {
    if (isLastQuestion) {
      if (isLastLevel) {
        return;
      } else {
        await nextLevel();
      }
    } else {
      if (isLastTeam) {
        setCurrentTeamIndex(0);
        // Fix: Use direct number instead of function
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Fix: Use direct number instead of function
        setCurrentTeamIndex(currentTeamIndex + 1);
      }
      
      setSelectedOption(null);
      setAnswersRevealed(false);
      setTimeLeft(activeQuiz.timeouts_in_seconds[activeLevel]);
      setIsRunning(true);
    }
  };
  
  // Handle continue to next level
  const handleContinueToNextLevel = async () => {
    const hasNextLevel = await nextLevel();
    if (!hasNextLevel) {
      // No more levels, quiz is complete
      // Results will be shown automatically due to isQuizComplete check above
    }
  };
  
  // Get label for button based on current state
  const getButtonLabel = () => {
    // If showing answers at end and answer not selected, disable button
    if (activeQuiz.show_answers_at_end && selectedOption === null) {
      return 'Select an Answer';
    }
    
    // If not showing answers at end and answer not revealed
    if (!activeQuiz.show_answers_at_end && !answersRevealed) {
      return 'Reveal Answer';
    }
    
    if (isLastQuestion) {
      if (isLastLevel) {
        return 'Show Final Results';
      }
      return 'Continue to Next Level';
    }
    
    return 'Next Question';
  };
  
  // Handle button click
  const handleButtonClick = () => {
    // If showing answers at end, skip reveal step
    if (activeQuiz.show_answers_at_end) {
      if (selectedOption === null) return; // Can't proceed without selection
      
      if (isLastQuestion) {
        if (isLastLevel) {
          // Quiz is complete, results will be shown automatically
          return;
        } else {
          // Go to next level
          handleContinueToNextLevel();
        }
      } else {
        // Go to next question
        handleNext();
      }
      return;
    }
    
    // If not showing answers at end, reveal answer first
    if (!answersRevealed) {
      setAnswersRevealed(true);
      setIsRunning(false);
      return;
    }
    
    if (isLastQuestion) {
      if (isLastLevel) {
        // Quiz is complete, results will be shown automatically
        return;
      } else {
        // Go to next level
        handleContinueToNextLevel();
      }
    } else {
      // Go to next question
      handleNext();
    }
  };
  
  // Get level information
  const getLevelInfo = (level: QuizLevel) => {
    switch (level) {
      case 'easy':
        return { title: 'Level 1: Easy', color: 'text-green-600' };
      case 'medium':
        return { title: 'Level 2: Medium', color: 'text-orange-600' };
      case 'hard':
        return { title: 'Level 3: Hard', color: 'text-red-600' };
    }
  };
  
  const levelInfo = getLevelInfo(activeLevel);
  
  // Determine if answers should be shown
  const shouldShowAnswers = !activeQuiz.show_answers_at_end ? answersRevealed : false;
  
  return (
    <Layout>
      <div className="container max-w-5xl py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="lg:w-3/4 order-2 lg:order-1">
            <div className="bg-white rounded-xl border shadow-md p-6">
              {/* Level information */}
              <div className="mb-6">
                <h1 className={`text-2xl font-bold mb-1 ${levelInfo.color}`}>
                  {levelInfo.title}
                </h1>
                <p className="text-gray-600">
                  Questions with {activeQuiz.timeouts_in_seconds[activeLevel]} second timer
                </p>
              </div>
              
              {/* Progress bar */}
              <QuizProgress />
              
              {/* Current team */}
              <div className="mb-6 bg-purple-50 border border-quiz-purple rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Current Team</div>
                  <div className="font-bold text-quiz-purple">{currentTeam.name}</div>
                </div>
                <Timer />
              </div>
              
              {/* Question */}
              <div className="mb-6">
                <h2 className="text-xl font-medium mb-4">
                  {currentQuestion.text}
                </h2>
                
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    // Determine card style
                    let cardClass = "option-card ";
                    
                    if (shouldShowAnswers) {
                      if (index === currentQuestion.correctAnswer) {
                        cardClass += "option-card-correct";
                      } else if (index === selectedOption) {
                        cardClass += "option-card-incorrect";
                      } else {
                        cardClass += "option-card-default";
                      }
                    } else if (index === selectedOption) {
                      cardClass += "option-card-selected";
                    } else {
                      cardClass += "option-card-default";
                    }
                    
                    return (
                      <div
                        key={index}
                        className={cardClass}
                        onClick={() => handleOptionSelect(index)}
                      >
                        <div className="flex items-center">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white ${
                              shouldShowAnswers && index === currentQuestion.correctAnswer
                                ? 'bg-quiz-green'
                                : index === selectedOption
                                  ? 'bg-quiz-purple'
                                  : 'bg-gray-300'
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div>{option}</div>
                        </div>
                        
                        {shouldShowAnswers && index === currentQuestion.correctAnswer && (
                          <div className="absolute top-3 right-3 text-quiz-green font-medium text-sm">
                            Correct Answer
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Action button */}
              <div className="flex justify-center">
                <Button
                  className={`px-8 py-6 text-lg ${
                    isLastQuestion && isLastLevel && (shouldShowAnswers || activeQuiz.show_answers_at_end)
                      ? 'quiz-button-primary'
                      : shouldShowAnswers || (activeQuiz.show_answers_at_end && selectedOption !== null)
                        ? 'quiz-button-primary'
                        : 'quiz-button-secondary'
                  }`}
                  disabled={activeQuiz.show_answers_at_end ? selectedOption === null : (!shouldShowAnswers && selectedOption === null && isRunning)}
                  onClick={handleButtonClick}
                >
                  {getButtonLabel()}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/4 order-1 lg:order-2">
            <TeamScore />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuizScreen;
