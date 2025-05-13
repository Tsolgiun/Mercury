import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="container-narrow py-16">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-medium mb-6">Page Not Found</h2>
        <p className="text-muted mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn">
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
