import React from 'react';
import { Filter, X } from 'lucide-react';
import './TripFilters.css';

const TripFilters = ({ filters, setFilters, onClear }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const hasActiveFilters = Object.values(filters).some((val) => val !== '');

  return (
    <div className="trip-filters-container glass-panel">
      <div className="filters-header">
        <Filter size={18} className="filter-icon" />
        <span className="filters-title">Filters</span>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={onClear}>
            <X size={14} /> Clear All
          </button>
        )}
      </div>
      
      <div className="filters-grid">
        <div className="filter-item">
          <label htmlFor="status">Status</label>
          <select 
            id="status" 
            name="status" 
            value={filters.status} 
            onChange={handleChange}
            className="filter-select"
          >
            <option value="">All Trips</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="budget">Budget</label>
          <select 
            id="budget" 
            name="budget" 
            value={filters.budget} 
            onChange={handleChange}
            className="filter-select"
          >
            <option value="">Any Budget</option>
            <option value="Under $10,000">Under $10,000</option>
            <option value="$10,000 - $50,000">$10,000 - $50,000</option>
            <option value="Above $50,000">Above $50,000</option>
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="destination">Destination</label>
          <input 
            type="text" 
            id="destination" 
            name="destination" 
            value={filters.destination} 
            onChange={handleChange}
            placeholder="Country, City, or Name"
            className="filter-input"
          />
        </div>
      </div>
    </div>
  );
};

export default TripFilters;
