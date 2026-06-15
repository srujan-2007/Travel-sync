import React, { useState } from 'react';
import './AuthInput.css';

const AuthInput = ({ label, type, name, value, onChange, placeholder, error, showPasswordToggle, autoComplete }) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="auth-input-group">
      <label className="auth-label" htmlFor={name}>{label}</label>
      <div className="auth-input-wrapper">
        <input
          className={`auth-input ${error ? 'auth-input-error' : ''}`}
          type={inputType}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete || "off"}
        />
        {showPasswordToggle && (
          <button 
            type="button" 
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <span className="auth-error-text">{error}</span>}
    </div>
  );
};

export default AuthInput;
