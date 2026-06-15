import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import Navbar from '../Navbar/Navbar';
import SearchCard from '../SearchCard/SearchCard';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="hero-section">
      <Navbar />
      
      <motion.div 
        className="hero-background"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 15, ease: 'linear', repeat: Infinity, repeatType: "reverse" }}
      />
      <div className="hero-overlay"></div>

      <div className="container hero-container">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-badge"
          >
            <Sparkles size={16} color="#c084fc" />
            Your Journey, <span style={{ color: '#c084fc', marginLeft: '4px' }}>Perfectly Organized</span>
          </motion.div>

          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Plan Smarter.<br />
            <span className="text-gradient">Travel Better.<br />
            Remember Forever.</span>
          </motion.h1>

          <motion.p 
            className="hero-description"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            TravelSync is your all-in-one travel companion to plan trips, track activities, manage expenses, and save memories that last a lifetime.
          </motion.p>

          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <button className="btn-primary-hero" onClick={() => navigate('/signup')}>
              Start Planning Now <ArrowRight size={18} />
            </button>
            <button className="btn-secondary-hero" onClick={() => alert('Demo video coming soon!')}>
              <Play size={18} fill="currentColor" /> Watch Demo
            </button>
          </motion.div>
        </div>

      </div>

      <div className="hero-search-area">
        <SearchCard />
      </div>
    </section>
  );
};

export default Hero;
