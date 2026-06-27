import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import LandingPage from './pages/LandingPage/LandingPage';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Trips from './pages/Trips/Trips';
import CreateTrip from './pages/CreateTrip/CreateTrip';
import EditTrip from './pages/EditTrip/EditTrip';
import TripDetails from './pages/TripDetails/TripDetails';
import Profile from './pages/Profile/Profile';
import GoogleCallback from './pages/Auth/GoogleCallback';

// Import Protected Route Component
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Import AI Assistant Context & Wrapper
import { AIChatProvider } from './context/AIChatContext';
import AIAssistantWrapper from './components/AIAssistant/AIAssistantWrapper';

function App() {
  return (
    <AIChatProvider>
      <Router>
        <div className="app">
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trips" 
            element={
              <ProtectedRoute>
                <Trips />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trips/create" 
            element={
              <ProtectedRoute>
                <CreateTrip />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trips/edit/:id" 
            element={
              <ProtectedRoute>
                <EditTrip />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trips/:id" 
            element={
              <ProtectedRoute>
                <TripDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
          
          {/* AI Travel Assistant Wrapper - will only show when authenticated */}
          <AIAssistantWrapper />
        </div>
      </Router>
    </AIChatProvider>
  );
}

export default App;
