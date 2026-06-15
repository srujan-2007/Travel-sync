import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '../../components/AuthInput/AuthInput';
import { useAuth } from '../../context/AuthContext';
import '../Login/Login.css'; // Reusing the authentication styles

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth(); // Destructure signup from real AuthContext
  
  const [formData, setFormData] = useState({
    name: '', // The backend schema uses "name", not "fullName"
    username: '',
    mobileNumber: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
    else if (formData.mobileNumber.length < 10) newErrors.mobileNumber = 'Mobile number must be at least 10 digits';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setSuccessMessage('');
    
    if (validate()) {
      setIsLoading(true);
      try {
        // Map frontend state keys to exactly what backend expects 
        // Our backend User.js schema expects: name, username, mobileNumber, password
        const signupData = {
          name: formData.name,
          username: formData.username,
          mobileNumber: formData.mobileNumber,
          password: formData.password
        };

        // Call the real backend API
        await signup(signupData);
        
        // Show success and redirect
        setSuccessMessage('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);

      } catch (error) {
        // Display backend validation or duplicate user errors
        if (error.response && error.response.data && error.response.data.message) {
          setGlobalError(error.response.data.message);
        } else if (error.request) {
          // Network error
          setGlobalError('Network error. Please check if the backend server is running.');
        } else {
          // Unknown error
          setGlobalError('An unexpected error occurred during signup.');
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start planning your next adventure</p>
        </div>

        {globalError && <div className="auth-global-error">{globalError}</div>}
        {successMessage && <div className="auth-global-error" style={{background: 'rgba(20, 184, 166, 0.1)', borderColor: 'rgba(20, 184, 166, 0.3)', color: 'var(--color-primary)'}}>{successMessage}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <AuthInput
            label="Full Name"
            type="text"
            name="name" // Fixed to match backend schema "name" instead of "fullName"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            error={errors.name}
          />
          <AuthInput
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            error={errors.username}
          />
          <AuthInput
            label="Mobile Number"
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            placeholder="Enter your mobile number"
            error={errors.mobileNumber}
          />
          <AuthInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            error={errors.password}
            showPasswordToggle={true}
          />
          <AuthInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
            showPasswordToggle={true}
          />

          <button 
            type="submit" 
            className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || successMessage}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Login</Link></p>
          <button className="back-to-home-btn" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
