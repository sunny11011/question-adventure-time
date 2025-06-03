
import React from 'react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-white border-t py-8 px-6 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Logo />
            <p className="text-sm text-gray-600 mt-2">
              Create exciting multi-choice quizzes for teams!
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 text-sm">
            <div>
              <h3 className="font-semibold mb-2 text-quiz-purple">Features</h3>
              <ul className="space-y-1 text-gray-600">
                <li>AI-Generated Questions</li>
                <li>Multiple Teams</li>
                <li>Level-Based Quiz Flow</li>
                <li>Custom Timers</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-quiz-purple">Support</h3>
              <ul className="space-y-1 text-gray-600">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQs</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} QuizMaster. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
