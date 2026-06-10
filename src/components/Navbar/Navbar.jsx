import React from 'react';
import Logo from '../Logo';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar container">
      <div className="navbar-logo">
        <div className="logo-icon" style={{ background: 'transparent', padding: 0 }}>
          <Logo size={32} />
        </div>
        <span className="logo-text">TravelSync<br/><small>Plan. Track. Remember.</small></span>
      </div>
      
      <ul className="navbar-links">
        <li className="active"><a href="#home">Home</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#how-it-works">How It Works</a></li>
        <li><a href="#trips">Trips</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#about">About Us</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      
      <div className="navbar-actions">
        <button className="btn-login">Login</button>
        <button className="btn-get-started">Get Started &rarr;</button>
      </div>
    </nav>
  );
};

export default Navbar;
