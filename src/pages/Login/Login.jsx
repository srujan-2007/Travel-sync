import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '../../components/AuthInput/AuthInput';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Destructure login from real AuthContext
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    
    if (validate()) {
      setIsLoading(true);
      try {
        // Connect to real backend API via AuthContext
        await login(formData);
        
        // On success, navigate to dashboard
        navigate('/dashboard'); 
      } catch (error) {
        // Handle specific backend errors
        if (error.response && error.response.data && error.response.data.message) {
          setGlobalError(error.response.data.message);
        } else if (error.request) {
          // Network error (backend might be down)
          setGlobalError('Network error. Please check if the server is running.');
        } else {
          // Unknown error
          setGlobalError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass-panel">
        <div className="auth-header">
          <Link to="/" className="auth-logo text-gradient">TravelSync</Link>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Login to access your travel plans</p>
        </div>

        {globalError && <div className="auth-global-error">{globalError}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <AuthInput
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            error={errors.username}
            autoComplete="new-password"
          />
          <AuthInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={errors.password}
            showPasswordToggle={true}
            autoComplete="new-password"
          />

          <button 
            type="submit" 
            className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link></p>
          <button className="back-to-home-btn" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
