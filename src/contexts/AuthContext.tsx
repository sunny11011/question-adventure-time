
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in local storage on initial load
    const storedUser = localStorage.getItem('quizUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('quizUser');
      }
    }
    setLoading(false);
  }, []);

  // Mock authentication functions for now - would be replaced with real backend calls
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (!email.includes('@') || password.length < 6) {
        throw new Error('Invalid credentials');
      }
      
      // For demo purposes, create a mock user
      const mockUser = {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        name: email.split('@')[0],
        email
      };
      
      setUser(mockUser);
      localStorage.setItem('quizUser', JSON.stringify(mockUser));
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Login failed: ' + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (!email.includes('@') || password.length < 6) {
        throw new Error('Invalid credentials');
      }
      
      // For demo purposes, create a mock user
      const mockUser = {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        name,
        email
      };
      
      setUser(mockUser);
      localStorage.setItem('quizUser', JSON.stringify(mockUser));
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error('Signup failed: ' + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quizUser');
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
