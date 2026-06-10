import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, ChevronUp } from 'lucide-react';
import Logo from '../Logo';
import './FooterSection.css';

// Custom SVG Social Icons
const FacebookIcon = ({size=18}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const InstagramIcon = ({size=18}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const TwitterIcon = ({size=18}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>;
const LinkedinIcon = ({size=18}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
const YoutubeIcon = ({size=18}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;

const FooterSection = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="footer-section">
      {/* Background Animated Elements */}
      <div className="footer-bg-glow"></div>
      <div className="footer-stars"></div>
      
      {/* Tiny airplane flying across */}
      <motion.div 
        className="footer-airplane"
        animate={{ 
          x: ['-10vw', '110vw'],
          y: [0, -20, 10, -10, 0]
        }}
        transition={{
          duration: 25,
          ease: "linear",
          repeat: Infinity
        }}
      >
        <Plane size={24} color="rgba(20, 184, 166, 0.4)" strokeWidth={1} style={{ transform: 'rotate(90deg)' }} />
      </motion.div>

      <div className="container footer-container">
        
        {/* Top: 5 Columns */}
        <motion.div 
          className="footer-top"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          
          {/* Column 1: Brand */}
          <div className="footer-col brand-col">
            <h2 className="footer-logo">
              <Logo size={32} /> Travel<span className="text-teal-accent">Sync</span>
            </h2>
            <h4 className="footer-tagline">Plan. Track. Remember.</h4>
            <p className="footer-desc">
              Your all-in-one travel companion for planning trips, tracking expenses, organizing itineraries, and preserving memories.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon"><FacebookIcon size={18} /></a>
              <a href="#" className="social-icon"><InstagramIcon size={18} /></a>
              <a href="#" className="social-icon"><TwitterIcon size={18} /></a>
              <a href="#" className="social-icon"><LinkedinIcon size={18} /></a>
              <a href="#" className="social-icon"><YoutubeIcon size={18} /></a>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="footer-col link-col">
            <h4 className="col-title">Product</h4>
            <ul>
              <li><a href="#">Features</a></li>
              <li><a href="#">Trip Planner</a></li>
              <li><a href="#">Itinerary Builder</a></li>
              <li><a href="#">Expense Tracker</a></li>
              <li><a href="#">Travel Memories</a></li>
              <li><a href="#">Trip Summaries</a></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="footer-col link-col">
            <h4 className="col-title">Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="footer-col link-col">
            <h4 className="col-title">Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms & Conditions</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>

        </motion.div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="fb-left">
            © 2026 TravelSync. All Rights Reserved.
          </div>
          <div className="fb-center">
            Made with <span className="heart">❤️</span> for travelers worldwide.
          </div>
          <div className="fb-right">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>

      </div>

      {/* Floating Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button 
            className="scroll-to-top"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(20, 184, 166, 0.6)" }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronUp size={24} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default FooterSection;
