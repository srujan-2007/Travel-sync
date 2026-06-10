import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, Star, ShieldCheck, Cloud, Users, MapPin, Wallet, Image as ImageIcon, BarChart3, Plane } from 'lucide-react';
import './TestimonialSection.css';

const testimonialsData = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Travel Blogger',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    text: 'TravelSync made our Europe trip so well organized. Tracking expenses and memories in one place was amazing.',
    rating: 5
  },
  {
    id: 2,
    name: 'David Chen',
    role: 'Digital Nomad',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    text: 'The best itinerary planner I have ever used. Being able to sync across devices seamlessly is a game changer for my remote work.',
    rating: 5
  },
  {
    id: 3,
    name: 'Sarah Jenkins',
    role: 'Family Traveler',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    text: 'Planning a trip for a family of 5 used to be a nightmare. TravelSync organized everything perfectly. Highly recommended!',
    rating: 5
  }
];

const TestimonialSection = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const nextTestimonial = () => {
    setActiveIdx((prev) => (prev === testimonialsData.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setActiveIdx((prev) => (prev === 0 ? testimonialsData.length - 1 : prev - 1));
  };

  const activeTestimonial = testimonialsData[activeIdx];

  return (
    <section className="testimonial-section">
      <div className="container">
        
        {/* Main Split Layout */}
        <div className="testimonial-layout">
          
          {/* Left Side: Testimonial */}
          <div className="test-left">
            <div className="test-badge">
              <Heart size={16} strokeWidth={2.5} className="badge-icon" /> TRAVELERS LOVE TRAVELSYNC
            </div>
            
            <h2 className="test-title">
              Trusted by Thousands<br />
              of <span className="text-teal-accent">Happy Travelers</span>
            </h2>
            
            <p className="test-desc">
              Real stories from real travelers who've
              made every journey unforgettable.
            </p>

            <motion.div 
              className="test-card"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="quote-icon">“</div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="user-profile">
                    <img src={activeTestimonial.image} alt={activeTestimonial.name} className="user-avatar" />
                    <div className="user-info">
                      <h4>{activeTestimonial.name}</h4>
                      <span className="user-role">{activeTestimonial.role}</span>
                      <div className="stars">
                        {[...Array(activeTestimonial.rating)].map((_, i) => <Star key={i} size={14} fill="#eab308" color="#eab308" />)}
                      </div>
                    </div>
                  </div>
                  
                  <p className="review-text">
                    {activeTestimonial.text}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <div className="test-controls">
              <button className="nav-arrow" onClick={prevTestimonial}><ChevronLeft size={18} strokeWidth={2.5} /></button>
              <div className="nav-dots">
                {testimonialsData.map((_, i) => (
                  <div 
                    key={i} 
                    className={`dot ${i === activeIdx ? 'active' : ''}`}
                    onClick={() => setActiveIdx(i)}
                    style={{ cursor: 'pointer' }}
                  ></div>
                ))}
              </div>
              <button className="nav-arrow" onClick={nextTestimonial}><ChevronRight size={18} strokeWidth={2.5} /></button>
            </div>
            
          </div>

          {/* Right Side: Cinematic CTA */}
          <div className="test-right">
            <div className="cta-card">
              <img src="/cappadocia.png" alt="Cappadocia Balloons" className="cta-bg-image" />
              
              <div className="cta-content-overlay">
                <div className="cta-text-content">
                  <h2>Ready to Plan Your<br />Next <span className="text-teal-accent" style={{whiteSpace: 'nowrap'}}>Adventure?</span></h2>
                  <p>Join thousands of travelers and create unforgettable memories with TravelSync.</p>
                  
                  <motion.button 
                    className="btn-start-journey"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <BriefcaseIcon /> Start Your Journey Today <ChevronRight size={16} strokeWidth={2.5} />
                  </motion.button>
                </div>

                {/* Animated Airplane & Route */}
                <div className="airplane-animation-container">
                  <svg className="airplane-route-svg" viewBox="0 0 300 150">
                    <path 
                      id="planePath"
                      d="M 10 120 Q 80 130, 150 80 T 280 20" 
                      fill="none" 
                      stroke="#14b8a6" 
                      strokeWidth="2" 
                      strokeDasharray="5 5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <motion.div 
                    className="floating-airplane"
                    animate={{ 
                      offsetDistance: ["0%", "100%"]
                    }}
                    transition={{
                      duration: 8,
                      ease: "linear",
                      repeat: Infinity
                    }}
                    style={{
                      offsetPath: "path('M 10 120 Q 80 130, 150 80 T 280 20')"
                    }}
                  >
                    <AirplaneSVG />
                  </motion.div>
                </div>

                {/* Bottom Stats Bar within CTA */}
                <div className="cta-bottom-bar">
                  <div className="cta-feature">
                    <div className="cta-icon-circle"><ShieldCheck size={20} strokeWidth={2} /></div>
                    <div className="feature-text">
                      <span className="ft-title">Secure & Private</span>
                      <span className="ft-desc">Your data is safe with us</span>
                    </div>
                  </div>
                  
                  <div className="cta-divider"></div>
                  
                  <div className="cta-feature">
                    <div className="cta-icon-circle"><Cloud size={20} strokeWidth={2} /></div>
                    <div className="feature-text">
                      <span className="ft-title">Access Anywhere</span>
                      <span className="ft-desc">Sync across all your devices</span>
                    </div>
                  </div>
                  
                  <div className="cta-divider"></div>
                  
                  <div className="cta-feature">
                    <div className="cta-icon-circle"><Users size={20} strokeWidth={2} /></div>
                    <div className="feature-text">
                      <span className="ft-title">Trusted Community</span>
                      <span className="ft-desc">Join thousands of happy travelers</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Global Bottom Features Bar */}
        <div className="global-bottom-bar">
          <div className="global-feature">
            <div className="gf-icon-circle"><MapPin size={22} strokeWidth={2} /></div>
            <div className="gf-text">
              <span className="gf-title">Plan Smart</span>
              <span className="gf-desc">Create perfect itineraries</span>
            </div>
          </div>
          
          <div className="global-feature">
            <div className="gf-icon-circle"><Wallet size={22} strokeWidth={2} /></div>
            <div className="gf-text">
              <span className="gf-title">Track Everything</span>
              <span className="gf-desc">Expenses, activities & more</span>
            </div>
          </div>
          
          <div className="global-feature">
            <div className="gf-icon-circle"><ImageIcon size={22} strokeWidth={2} /></div>
            <div className="gf-text">
              <span className="gf-title">Save Memories</span>
              <span className="gf-desc">Photos, notes & moments</span>
            </div>
          </div>
          
          <div className="global-feature">
            <div className="gf-icon-circle"><BarChart3 size={22} strokeWidth={2} /></div>
            <div className="gf-text">
              <span className="gf-title">Get Insights</span>
              <span className="gf-desc">Beautiful trip summaries</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

// Custom Briefcase/Suitcase Icon for the button
const BriefcaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    <path d="M9 14l2 2 4-4"></path>
  </svg>
);

// Custom Airplane SVG matching the image better than Lucide's default
const AirplaneSVG = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="#f8fafc" stroke="#f8fafc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg)' }}>
    <path d="M17.8 19.2L16 11l4-4a2 2 0 0 0-2.8-2.8l-4 4-8.2-1.8a.7.7 0 0 0-.8.8l1.5 5.5-3.5 3.5a.7.7 0 0 0 0 1l2 2 2 2a.7.7 0 0 0 1 0l3.5-3.5 5.5 1.5a.7.7 0 0 0 .8-.8z"></path>
  </svg>
);

export default TestimonialSection;
