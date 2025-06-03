
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

const NotFound = () => {
  const location = useLocation();

  return (
    <Layout>
      <div className="container max-w-6xl py-16 text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-quiz-purple mb-4">404</h1>
          <p className="text-2xl font-medium mb-2">Page Not Found</p>
          <p className="text-gray-600 mb-8">
            We couldn't find the page you were looking for: {location.pathname}
          </p>
          <Link to="/">
            <Button className="quiz-button-primary">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
