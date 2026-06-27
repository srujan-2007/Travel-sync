import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '../../components/AuthInput/AuthInput';
import { CONFIG } from '../../config/constants';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth(); // Destructure login from real AuthContext
  const [googleError, setGoogleError] = useState('');
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const handleGoogleLogin = () => {
    setGlobalError('');
    setGoogleError('');
    setIsLoading(true);

    const clientId = CONFIG.GOOGLE_CLIENT_ID;
    if (!clientId) {
      setGlobalError('Google Client ID is not configured.');
      setIsLoading(false);
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const state = Math.random().toString(36).substring(2);
    const nonce = Math.random().toString(36).substring(2);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=openid%20email%20profile&state=${state}&nonce=${nonce}`;

    // Center the popup window
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const popup = window.open(authUrl, 'Google Auth', `width=${width},height=${height},top=${top},left=${left}`);

    if (!popup) {
      setGlobalError('Popup blocked! Please allow popups for this site.');
      setIsLoading(false);
      return;
    }

    const messageListener = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        const idToken = event.data.idToken;
        try {
          await loginWithGoogle(idToken);
          navigate('/dashboard');
        } catch (error) {
          if (error.response && error.response.data && error.response.data.message) {
            setGlobalError(error.response.data.message);
          } else {
            setGlobalError('Failed to login with Google. Please try again.');
          }
        } finally {
          setIsLoading(false);
        }
        window.removeEventListener('message', messageListener);
      } else if (event.data && event.data.type === 'GOOGLE_AUTH_FAILURE') {
        setGlobalError(event.data.error || 'Google authentication failed.');
        setIsLoading(false);
        window.removeEventListener('message', messageListener);
      }
    };

    window.addEventListener('message', messageListener);

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setIsLoading(false);
        window.removeEventListener('message', messageListener);
      }
    }, 1000);
  };

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

        <div className="auth-separator">
          <span>OR</span>
        </div>

        <button 
          type="button" 
          className="auth-google-btn" 
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link></p>
          <button className="back-to-home-btn" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
