
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './Logo';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get user display name from metadata or email
  const getUserDisplayName = () => {
    if (!user) return '';
    if (user.user_metadata?.name) return user.user_metadata.name;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <nav className="bg-white border-b py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
              >
                Logout
              </Button>
              <div className="hidden md:flex items-center gap-2 bg-quiz-purple text-white text-sm font-medium px-3 py-1.5 rounded-full">
                <div className="h-2 w-2 rounded-full bg-white"></div>
                {getUserDisplayName()}
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
