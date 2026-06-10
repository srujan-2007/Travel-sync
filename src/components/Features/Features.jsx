import React from 'react';
import { motion } from 'framer-motion';
import { Map, Activity, Wallet, Camera, BarChart2 } from 'lucide-react';
import './Features.css';

const Features = () => {
  const features = [
    { 
      icon: Map, 
      title: 'Smart Itinerary', 
      desc: 'Plan day-by-day itineraries with ease and stay on track.',
    },
    { 
      icon: Activity, 
      title: 'Activity Tracking', 
      desc: 'Log activities, notes, and rate your experiences.',
    },
    { 
      icon: Wallet, 
      title: 'Expense Management', 
      desc: 'Track expenses, set budgets, and manage spending.',
    },
    { 
      icon: Camera, 
      title: 'Memory Collection', 
      desc: 'Upload photos, videos, and travel memories.',
    },
    { 
      icon: BarChart2, 
      title: 'Travel Summaries', 
      desc: 'Generate beautiful summaries and insights from your trips.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    },
  };

  return (
    <section className="features-section" id="features">
      <div className="container">
        <motion.div 
          className="features-header-centered"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="features-subtitle">WHY CHOOSE TRAVELSYNC?</p>
          <h2 className="features-title">
            Everything You Need for the <span className="text-teal-accent">Perfect Trip</span>
          </h2>
          <p className="features-desc">
            Plan, track, manage, and remember every journey with powerful travel tools designed for modern explorers.
          </p>
        </motion.div>

        <motion.div 
          className="features-grid-row"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={index} 
                className="feature-card-premium"
                variants={itemVariants}
                whileHover={{ 
                  y: -10, 
                  scale: 1.03,
                  boxShadow: "0 25px 50px -12px rgba(20, 184, 166, 0.25)",
                  borderColor: "rgba(20, 184, 166, 0.4)"
                }}
              >
                <div className="feature-icon-wrapper">
                  <Icon size={28} className="feature-icon-svg" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
