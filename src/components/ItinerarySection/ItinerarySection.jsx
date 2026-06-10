import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, MapPin, Activity, Wallet, Heart, ChevronRight } from 'lucide-react';
import './ItinerarySection.css';

const itineraryData = [
  { 
    day: 1, 
    title: 'Arrival in Paris', 
    subtitle: 'Eiffel Tower • Seine River Cruise',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop',
    location: 'Paris, France',
    desc: 'Begin your journey in the city of love.'
  },
  { 
    day: 2, 
    title: 'Explore the City', 
    subtitle: 'Louvre Museum • Notre Dame',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=600&fit=crop',
    location: 'Paris, France',
    desc: 'Discover world-class art and architecture.'
  },
  { 
    day: 3, 
    title: 'Fly to Dubai', 
    subtitle: 'Burj Khalifa • Desert Safari',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
    location: 'Dubai, UAE',
    desc: 'Experience luxury and the highest views.'
  },
  { 
    day: 4, 
    title: 'Relax in Bali', 
    subtitle: 'Beach Day • Sunset Dinner',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop',
    location: 'Bali, Indonesia',
    desc: 'Unwind and relax in paradise.'
  },
  { 
    day: 5, 
    title: 'Adventure Awaits', 
    subtitle: 'Water Sports • Local Exploration',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=600&fit=crop',
    location: 'Bali, Indonesia',
    desc: 'End your trip with thrilling activities.'
  }
];

const ItinerarySection = () => {
  const [activeDay, setActiveDay] = useState(4); // Default to Day 4 as in the image

  const nextDay = () => setActiveDay(prev => prev < 5 ? prev + 1 : 1);

  return (
    <section className="itinerary-section">
      <div className="container itinerary-layout">
        
        {/* Left Side: Vertical Timeline */}
        <div className="itinerary-left">
          <motion.div 
            className="itinerary-badge"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge-icon"><Plus size={14} strokeWidth={3} /></span> YOUR TRIP, DAY BY DAY
          </motion.div>
          
          <motion.h2 
            className="itinerary-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Beautiful Itineraries,<br />
            <span className="text-teal-accent">Effortlessly Planned</span>
          </motion.h2>

          <div className="vertical-timeline">
            {/* Timeline continuous vertical line */}
            <div className="timeline-vertical-track"></div>

            {itineraryData.map((item, index) => {
              const isActive = activeDay === item.day;
              // Specific colors for the day circles based on the image
              const circleColors = ['#b45309', '#7c3aed', '#0ea5e9', '#d97706', '#ea580c'];
              
              return (
                <motion.div 
                  key={item.day}
                  className={`timeline-row ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveDay(item.day)}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + (index * 0.1) }}
                >
                  <div className="timeline-node-wrapper">
                    <div 
                      className="day-circle" 
                      style={{ backgroundColor: isActive ? circleColors[index] : 'transparent', borderColor: circleColors[index], color: isActive ? '#fff' : circleColors[index] }}
                    >
                      <Calendar size={12} strokeWidth={2.5} />
                    </div>
                    <span className="day-label">Day {item.day}</span>
                    <div className={`timeline-dot ${isActive ? 'active' : ''}`}></div>
                  </div>
                  
                  <div className="timeline-content">
                    <h4 className="item-title">{item.title}</h4>
                    <p className="item-subtitle">{item.subtitle}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Side: 3D Carousel & Stats */}
        <div className="itinerary-right">
          
          <div className="carousel-wrapper">
            <div className="carousel-container">
              {itineraryData.map((item, index) => {
                const offset = index - (activeDay - 1);
                const absOffset = Math.abs(offset);
                const zIndex = 10 - absOffset;
                const scale = 1 - absOffset * 0.15;
                const x = offset * 90; // Pixels to shift horizontally
                
                return (
                  <motion.div 
                    key={item.day}
                    className="carousel-card"
                    animate={{
                      x: x,
                      scale: scale,
                      zIndex: zIndex,
                      opacity: absOffset > 2 ? 0 : 1, // Hide cards that are too far
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    onClick={() => setActiveDay(item.day)}
                  >
                    <img src={item.image} alt={item.title} className="carousel-image" />
                    
                    {/* Only show full details on the active card */}
                    <AnimatePresence>
                      {activeDay === item.day && (
                        <motion.div 
                          className="carousel-active-overlay"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="carousel-top-bar">
                            <span className="carousel-day-badge">Day {item.day}</span>
                            <Heart size={20} color="#fff" />
                          </div>
                          <div className="carousel-bottom-info">
                            <h3>{item.location}</h3>
                            <p>{item.desc}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Dark overlay for inactive cards */}
                    {activeDay !== item.day && <div className="carousel-inactive-overlay"></div>}
                  </motion.div>
                );
              })}
            </div>
            
            {/* Arrow and Dots */}
            <button className="carousel-next-btn" onClick={nextDay}>
              <ChevronRight size={24} color="#14b8a6" />
            </button>
            <div className="carousel-dots">
              {itineraryData.map((_, i) => (
                <div 
                  key={i} 
                  className={`dot ${activeDay === i + 1 ? 'active' : ''}`}
                  onClick={() => setActiveDay(i + 1)}
                />
              ))}
            </div>
          </div>

          {/* Bottom Summary Boxes */}
          <motion.div 
            className="summary-boxes"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="summary-box">
              <div className="box-icon-circle pink">
                <Calendar size={16} color="#f43f5e" />
              </div>
              <div className="box-text">
                <span className="box-val">5</span>
                <span className="box-label">Days</span>
              </div>
            </div>
            
            <div className="summary-box">
              <div className="box-icon-circle yellow">
                <MapPin size={16} color="#eab308" />
              </div>
              <div className="box-text">
                <span className="box-val">3</span>
                <span className="box-label">Destinations</span>
              </div>
            </div>
            
            <div className="summary-box">
              <div className="box-icon-circle orange">
                <Activity size={16} color="#f97316" />
              </div>
              <div className="box-text">
                <span className="box-val">12</span>
                <span className="box-label">Activities</span>
              </div>
            </div>
            
            <div className="summary-box wide">
              <div className="box-icon-circle green">
                <Wallet size={16} color="#10b981" />
              </div>
              <div className="box-text">
                <span className="box-val">₹45,600</span>
                <span className="box-label">Est. Budget</span>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default ItinerarySection;
