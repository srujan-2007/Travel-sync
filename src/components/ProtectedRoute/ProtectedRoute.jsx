import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token, logout } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const verifyToken = () => {
      // 1. Check if token exists
      if (!token || !isAuthenticated) {
        setIsValid(false);
        setIsChecking(false);
        return;
      }

      // 2. Check if token is corrupted (A basic JWT has 3 parts separated by dots)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        // Token is corrupted, automatically log out and clear storage
        console.warn('Corrupted token detected. Logging out.');
        logout();
        setIsValid(false);
        setIsChecking(false);
        return;
      }

      // If token looks structurally valid, allow access
      setIsValid(true);
      setIsChecking(false);
    };

    verifyToken();
  }, [token, isAuthenticated, logout]);

  // Prevent redirect flickering by showing a loading state while checking
  if (isChecking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--color-primary)' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  // If not authenticated or token is invalid, redirect to login and save the attempted location
  if (!isValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If valid, render the protected component
  return children;
};

export default ProtectedRoute;
