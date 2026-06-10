import React, { useState } from 'react';
import { MapPin, Calendar, Users, Search, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import './SearchCard.css';

const SearchCard = () => {
  const [activeTab, setActiveTab] = useState('Destination');

  const tabs = [
    { name: 'Destination', icon: MapPin },
    { name: 'Dates', icon: Calendar },
    { name: 'Travelers', icon: Users },
    { name: 'Budget', icon: Wallet },
  ];

  return (
    <div className="search-wrapper">
      <motion.div 
        className="search-card-container glass-panel"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="search-tabs">
          {tabs.map((tab) => (
            <button 
              key={tab.name}
              className={`search-tab ${activeTab === tab.name ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.name)}
            >
              <tab.icon size={16} />
              {tab.name}
            </button>
          ))}
        </div>
        
        <div className="search-divider-horizontal"></div>

        <div className="search-fields">
          <div className="search-field">
            <div className="field-icon">
              <MapPin size={20} color="#a1a1aa" />
            </div>
            <div className="field-content">
              <label>Where do you want to go?</label>
            </div>
          </div>

          <div className="field-divider"></div>

          <div className="search-field">
            <div className="field-icon">
              <Calendar size={20} color="#a1a1aa" />
            </div>
            <div className="field-content">
              <label>Check-in</label>
              <input type="text" placeholder="Add dates" />
            </div>
          </div>

          <div className="field-divider"></div>

          <div className="search-field">
            <div className="field-icon">
              <Calendar size={20} color="#a1a1aa" />
            </div>
            <div className="field-content">
              <label>Check-out</label>
              <input type="text" placeholder="Add dates" />
            </div>
          </div>

          <div className="field-divider"></div>

          <div className="search-field">
            <div className="field-icon">
              <Users size={20} color="#a1a1aa" />
            </div>
            <div className="field-content">
              <label>Travelers</label>
              <input type="text" placeholder="1 Traveler" />
            </div>
          </div>
          
          <button className="search-button">
            <Search size={20} />
          </button>
        </div>
      </motion.div>
      
      <div className="search-arrow-annotation">
        <span>Let's plan your<br/>next adventure!</span>
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 10 Q 50 20, 80 80 M 60 80 L 80 80 L 80 60" stroke="#a1a1aa" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default SearchCard;
