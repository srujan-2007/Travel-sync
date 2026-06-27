import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// Create the Context
const AuthContext = createContext();

// Create a custom hook for easy access to the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create the Provider component
export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage so authentication persists across reloads
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });
  
  // Derived state to easily check if someone is logged in
  const isAuthenticated = !!token && !!currentUser;

  // Real login function connecting to backend
  const login = async (credentials) => {
    try {
      // Calls the real backend via authService (POST /api/auth/login)
      const data = await authService.login(credentials);
      
      // Store token and user data in local storage
      localStorage.setItem('token', data.token);
      
      // Create user object without the token for state
      const userObj = {
        _id: data._id,
        name: data.name,
        username: data.username
      };
      
      localStorage.setItem('user', JSON.stringify(userObj));
      
      // Update state
      setToken(data.token);
      setCurrentUser(userObj);
      
      return data;
    } catch (error) {
      // Re-throw the error so the UI can catch and display it
      throw error;
    }
  };

  // Google login function connecting to backend
  const loginWithGoogle = async (idToken) => {
    try {
      const data = await authService.loginWithGoogle(idToken);
      
      // Store token and user data in local storage
      localStorage.setItem('token', data.token);
      
      const userObj = {
        _id: data._id,
        name: data.name,
        username: data.username,
        avatar: data.avatar
      };
      
      localStorage.setItem('user', JSON.stringify(userObj));
      
      // Update state
      setToken(data.token);
      setCurrentUser(userObj);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Real signup function connecting to backend
  const signup = async (userData) => {
    try {
      // Calls the real backend via authService (POST /api/auth/signup)
      const data = await authService.signup(userData);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset state
    setCurrentUser(null);
    setToken(null);
  };

  const value = {
    currentUser,
    token,
    isAuthenticated,
    login,
    signup,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
