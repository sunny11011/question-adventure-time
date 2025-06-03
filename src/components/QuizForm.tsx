
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quiz, useQuiz } from '@/contexts/QuizContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const QuizForm = () => {
  const { createQuiz, setIsCreating } = useQuiz();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [topicsInput, setTopicsInput] = useState('');
  const [teamInput, setTeamInput] = useState('');
  const [teams, setTeams] = useState<string[]>([]);
  
  const [easyQuestions, setEasyQuestions] = useState(6);
  const [mediumQuestions, setMediumQuestions] = useState(5);
  const [hardQuestions, setHardQuestions] = useState(4);
  
  const [easyTimeout, setEasyTimeout] = useState(20);
  const [mediumTimeout, setMediumTimeout] = useState(30);
  const [hardTimeout, setHardTimeout] = useState(45);
  
  const [showAnswers, setShowAnswers] = useState('end');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTeam = () => {
    if (!teamInput.trim()) return;
    setTeams([...teams, teamInput.trim()]);
    setTeamInput('');
  };

  const handleRemoveTeam = (index: number) => {
    setTeams(teams.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title) {
      toast.error('Please enter a quiz title');
      return;
    }
    
    if (!topicsInput) {
      toast.error('Please enter at least one topic');
      return;
    }
    
    if (teams.length === 0) {
      toast.error('Please add at least one team');
      return;
    }
    
    // Parse topics
    const topics = topicsInput
      .split(',')
      .map(topic => topic.trim())
      .filter(topic => topic);
    
    if (topics.length === 0) {
      toast.error('Please enter valid topics separated by commas');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const quizData: Omit<Quiz, 'id' | 'createdAt' | 'questions'> = {
        title,
        topics,
        createdBy: user?.id || 'anonymous',
        teams: teams.map(name => ({
          id: `team_${Math.random().toString(36).substring(2, 9)}`,
          name,
          score: 0,
          answeredQuestions: []
        })),
        timeoutsInSeconds: {
          easy: easyTimeout,
          medium: mediumTimeout,
          hard: hardTimeout
        },
        questionsPerLevel: {
          easy: easyQuestions,
          medium: mediumQuestions,
          hard: hardQuestions
        },
        showAnswersAtEnd: showAnswers === 'end'
      };
      
      await createQuiz(quizData);
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create a New Quiz</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="quiz-label">Quiz Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your quiz"
                className="quiz-input"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label htmlFor="topics" className="quiz-label">Topics</Label>
              <Textarea
                id="topics"
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                placeholder="Enter topics separated by commas (e.g., History, Math, Science)"
                className="quiz-input min-h-20"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                AI will generate questions based on these topics
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="quiz-label">Teams</Label>
              <div className="flex space-x-2">
                <Input
                  value={teamInput}
                  onChange={(e) => setTeamInput(e.target.value)}
                  placeholder="Enter team name"
                  className="quiz-input"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  onClick={handleAddTeam}
                  className="quiz-button-secondary"
                  disabled={isSubmitting}
                >
                  Add Team
                </Button>
              </div>
              
              {teams.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {teams.map((team, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-quiz-purple-light/20 text-quiz-purple px-3 py-1 rounded-full text-sm"
                    >
                      <span>{team}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTeam(index)}
                        className="ml-2 text-quiz-purple hover:text-red-500"
                        disabled={isSubmitting}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Number of Questions</h3>
              
              <div>
                <Label htmlFor="easyQuestions" className="quiz-label">Level 1 (Easy)</Label>
                <Input
                  id="easyQuestions"
                  type="number"
                  min={1}
                  value={easyQuestions}
                  onChange={(e) => setEasyQuestions(parseInt(e.target.value) || 0)}
                  className="quiz-input"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="mediumQuestions" className="quiz-label">Level 2 (Medium)</Label>
                <Input
                  id="mediumQuestions"
                  type="number"
                  min={1}
                  value={mediumQuestions}
                  onChange={(e) => setMediumQuestions(parseInt(e.target.value) || 0)}
                  className="quiz-input"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="hardQuestions" className="quiz-label">Level 3 (Hard)</Label>
                <Input
                  id="hardQuestions"
                  type="number"
                  min={1}
                  value={hardQuestions}
                  onChange={(e) => setHardQuestions(parseInt(e.target.value) || 0)}
                  className="quiz-input"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Timeout per Question (seconds)</h3>
              
              <div>
                <Label htmlFor="easyTimeout" className="quiz-label">Level 1 (Easy)</Label>
                <Input
                  id="easyTimeout"
                  type="number"
                  min={5}
                  value={easyTimeout}
                  onChange={(e) => setEasyTimeout(parseInt(e.target.value) || 0)}
                  className="quiz-input"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="mediumTimeout" className="quiz-label">Level 2 (Medium)</Label>
                <Input
                  id="mediumTimeout"
                  type="number"
                  min={5}
                  value={mediumTimeout}
                  onChange={(e) => setMediumTimeout(parseInt(e.target.value) || 0)}
                  className="quiz-input"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="hardTimeout" className="quiz-label">Level 3 (Hard)</Label>
                <Input
                  id="hardTimeout"
                  type="number"
                  min={5}
                  value={hardTimeout}
                  onChange={(e) => setHardTimeout(parseInt(e.target.value) || 0)}
                  className="quiz-input"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">When to Show Correct Answers</h3>
            <RadioGroup
              value={showAnswers}
              onValueChange={setShowAnswers}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="question" id="question" disabled={isSubmitting} />
                <Label htmlFor="question">After each question</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="end" id="end" disabled={isSubmitting} />
                <Label htmlFor="end">After the whole quiz ends</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="quiz-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Quiz...' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuizForm;
