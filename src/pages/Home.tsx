
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

const Home = () => {
  const { user } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-bg text-white py-16 md:py-24">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Create Exciting Quiz Competitions
              </h1>
              <p className="text-lg mb-8 opacity-90">
                Generate AI-powered quiz questions, manage teams, and run multi-level competitions with custom timers. Perfect for classrooms, team building, or friendly competitions!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="bg-white text-quiz-purple hover:bg-gray-100 font-medium">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button size="lg" className="bg-white text-quiz-purple hover:bg-gray-100 font-medium">
                        Get Started
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="bg-white p-6 rounded-xl shadow-xl transform rotate-2 animate-slide-up">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="h-4 w-3/4 bg-quiz-purple-light/30 rounded mb-3"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-10 bg-quiz-purple-light/20 rounded"></div>
                    <div className="h-10 bg-quiz-purple-light/20 rounded"></div>
                    <div className="h-10 bg-quiz-purple-light/20 rounded"></div>
                    <div className="h-10 bg-quiz-purple-light/20 rounded"></div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                  <div className="h-6 w-1/4 bg-quiz-orange/50 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features for Amazing Quizzes
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-quiz-purple text-xl font-bold">AI</span>
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Generated Questions</h3>
              <p className="text-gray-600">
                Input your topics and let our AI create challenging and engaging questions automatically.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-quiz-orange text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Three Difficulty Levels</h3>
              <p className="text-gray-600">
                Progressively challenge participants with easy, medium, and hard questions.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-green-600 text-xl font-bold">⏱</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Custom Timers</h3>
              <p className="text-gray-600">
                Set different time limits for each difficulty level to keep the quiz exciting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            How QuizMaster Works
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Create and run exciting quizzes in just a few simple steps
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-quiz-purple text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-bold mb-2">Create Quiz</h3>
              <p className="text-gray-600 text-sm">
                Enter topics, add teams, and set question parameters
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-quiz-purple text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-bold mb-2">AI Generates Questions</h3>
              <p className="text-gray-600 text-sm">
                Our AI creates custom questions at three difficulty levels
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-quiz-purple text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-bold mb-2">Run the Quiz</h3>
              <p className="text-gray-600 text-sm">
                Teams take turns answering questions with custom timers
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-quiz-purple text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
              <h3 className="font-bold mb-2">View Results</h3>
              <p className="text-gray-600 text-sm">
                Get detailed scores and review all answers at the end
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to={user ? "/dashboard" : "/signup"}>
              <Button className="quiz-button-primary px-8">
                {user ? "Create Your Quiz" : "Sign Up Now"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
