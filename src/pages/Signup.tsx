
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in the context and shown as toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Sign up to start creating exciting quizzes</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="quiz-label" htmlFor="name">Full Name</label>
              <Input
                id="name"
                type="text" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
                className="quiz-input"
              />
            </div>
            
            <div className="space-y-2">
              <label className="quiz-label" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email" 
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="quiz-input"
              />
            </div>
            
            <div className="space-y-2">
              <label className="quiz-label" htmlFor="password">Password</label>
              <Input
                id="password"
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="quiz-input"
              />
            </div>
            
            <div className="space-y-2">
              <label className="quiz-label" htmlFor="confirmPassword">Confirm Password</label>
              <Input
                id="confirmPassword"
                type="password" 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                className="quiz-input"
              />
            </div>
            
            {error && (
              <div className="text-sm text-quiz-red font-medium mt-2">
                {error}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full quiz-button-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <div className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-quiz-purple hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
