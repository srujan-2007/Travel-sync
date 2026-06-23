import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AIChatWidget from './AIChatWidget';

/**
 * AIAssistantWrapper Component
 * 
 * Why does this exist?
 * We only want the AI Assistant to be visible to logged-in users AND only on protected routes.
 * Since we can't easily put logic directly in `App.jsx` without cluttering it,
 * this small wrapper checks authentication and the current route, rendering the widget if authorized.
 */

const AIAssistantWrapper = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Define public routes where the assistant should NEVER appear
  const publicRoutes = ['/', '/login', '/signup'];

  // If the user is not logged in OR they are on a public page, return null (render nothing)
  if (!isAuthenticated || publicRoutes.includes(location.pathname)) return null;

  return <AIChatWidget />;
};

export default AIAssistantWrapper;
