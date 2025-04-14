import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DotLoading } from 'antd-mobile';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const AntProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <DotLoading color="primary" />
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page using React Router's Navigate
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AntProtectedRoute;
