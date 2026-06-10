import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Navigation, Bookmark, Plus, Crosshair, PlusCircle, MinusCircle, Star } from 'lucide-react';
import './JourneySection.css';

const MapsSection = () => {
  const features = [
    "Discover amazing spots",
    "Plan and visualize routes",
    "Get distance and travel time",
    "Save places you love"
  ];

  return (
    <section className="maps-section">
      <div className="container maps-container">
        
        {/* Left Side: Text Content */}
        <motion.div 
          className="maps-text-content"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="maps-badge">
            <span className="badge-icon"><Plus size={14} strokeWidth={3} /></span> EXPLORE THE WORLD
          </div>
          
          <h2 className="maps-title">
            Maps That Bring<br />
            <span className="text-teal-accent">Journeys to Life</span>
          </h2>
          
          <ul className="maps-features-list">
            {features.map((feature, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
              >
                <div className="custom-check">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
          
          <motion.button 
            className="btn-explore-maps"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Maps <ArrowRight size={18} />
          </motion.button>
        </motion.div>

        {/* Right Side: Map Card */}
        <motion.div 
          className="maps-visual-card"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="map-glass-container">
            {/* Top Toolbar */}
            <div className="map-toolbar">
              <div className="toolbar-tabs">
                <button className="tab active">
                  <MapPin size={14} /> Spots
                </button>
                <button className="tab">
                  <Navigation size={14} /> Routes
                </button>
                <button className="tab">
                  <Bookmark size={14} /> Saved Places
                </button>
              </div>
              <button className="btn-add-spot solid">
                <Plus size={14} strokeWidth={2.5} /> Add Spot
              </button>
            </div>

            {/* Map Canvas area */}
            <div className="map-canvas-area">
              {/* World map background */}
              <div className="map-pattern-bg">
                <img src="/map-bg.png" alt="World Map" className="world-map-img" />
              </div>

              {/* Animated Route Line */}
              <svg className="flight-route-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path 
                  d="M 28 35 Q 40 30, 51 43 Q 65 55, 80 68" 
                  fill="none" 
                  stroke="rgba(255, 255, 255, 0.6)" 
                  strokeWidth="0.6" 
                  strokeDasharray="2 3"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: "easeInOut", delay: 0.8 }}
                />
              </svg>

              {/* Node 1: Paris */}
              <motion.div className="map-node node-paris" initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }} viewport={{ once: true }}>
                <div className="node-image-wrapper">
                  <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=100&h=100&fit=crop" alt="Paris" />
                </div>
                <div className="pin-and-label">
                  <MapPin size={22} fill="#3b82f6" stroke="#fff" strokeWidth={2} />
                  <span className="node-label">Paris</span>
                </div>
              </motion.div>

              {/* Node 2: Dubai */}
              <motion.div className="map-node node-dubai" initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5 }} viewport={{ once: true }}>
                <div className="pin-and-label">
                  <MapPin size={22} fill="#eab308" stroke="#fff" strokeWidth={2} />
                  <span className="node-label">Dubai</span>
                </div>
              </motion.div>

              {/* Node 3: Bali */}
              <motion.div className="map-node node-bali" initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 2 }} viewport={{ once: true }}>
                <div className="node-image-wrapper">
                  <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100&h=100&fit=crop" alt="Bali" />
                </div>
                <div className="pin-and-label">
                  <MapPin size={22} fill="#f43f5e" stroke="#fff" strokeWidth={2} />
                  <span className="node-label">Bali</span>
                </div>
              </motion.div>

              {/* Route Details Box */}
              <motion.div 
                className="route-details-box"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 2.2, duration: 0.5 }}
              >
                <div className="route-row">
                  <span className="route-cities"><Crosshair size={12} color="#3b82f6" /> Paris → Dubai</span>
                  <span className="route-time"><Star size={12} fill="#eab308" color="#eab308" /> 6h 45m</span>
                </div>
                <div className="route-row">
                  <span className="route-cities"><Crosshair size={12} color="#f43f5e" /> Dubai → Bali</span>
                  <span className="route-time"><Star size={12} fill="#eab308" color="#eab308" /> 9h 30m</span>
                </div>
                <div className="route-divider"></div>
                <div className="route-row">
                  <span className="route-total-label">Total Distance</span>
                  <span className="route-total-val">11,550 km</span>
                </div>
              </motion.div>

              {/* Zoom Controls */}
              <div className="map-controls">
                <button><Crosshair size={16} /></button>
                <div className="zoom-btns">
                  <button><Plus size={16} /></button>
                  <div className="divider"></div>
                  <button><MinusCircle size={16} /></button>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MapsSection;
