import React from 'react';
import { Briefcase, MapPin, Camera, Wallet, Star } from 'lucide-react';
import './StatsBar.css';

const StatsBar = () => {
  const stats = [
    { icon: Briefcase, color: '#8b5cf6', value: '10K+', label: 'Trips Planned' },
    { icon: MapPin, color: '#ec4899', value: '25K+', label: 'Happy Travelers' },
    { icon: Camera, color: '#f59e0b', value: '50K+', label: 'Memories Saved' },
    { icon: Wallet, color: '#10b981', value: '15K+', label: 'Expenses Tracked' },
    { icon: Star, color: '#3b82f6', value: '4.8/5', label: 'User Rating' },
  ];

  return (
    <div className="stats-bar-wrapper">
      <div className="container">
        <div className="stats-bar glass-panel">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <React.Fragment key={index}>
                <div className="stat-item">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}20` }}>
                    <Icon size={20} color={stat.color} />
                  </div>
                  <div className="stat-details">
                    <h4>{stat.value}</h4>
                    <p>{stat.label}</p>
                  </div>
                </div>
                {index < stats.length - 1 && <div className="stat-divider"></div>}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
