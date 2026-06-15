import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import AuthInput from '../../components/AuthInput/AuthInput'; // Reusing this for consistent input styles
import tripService from '../../services/tripService';
import './CreateTrip.css';

function CreateTrip() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tripName: '',
    startingPoint: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    numberOfTravelers: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.tripName.trim()) newErrors.tripName = 'Trip Name is required';
    if (!formData.startingPoint.trim()) newErrors.startingPoint = 'Starting Point is required';
    if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    
    if (!formData.startDate) newErrors.startDate = 'Start Date is required';
    if (!formData.endDate) newErrors.endDate = 'End Date is required';
    
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End Date cannot be before Start Date';
      }
    }

    if (!formData.budget) newErrors.budget = 'Budget is required';
    else if (Number(formData.budget) <= 0) newErrors.budget = 'Budget must be greater than 0';

    if (!formData.numberOfTravelers) newErrors.numberOfTravelers = 'Number of Travelers is required';
    else if (Number(formData.numberOfTravelers) < 1) newErrors.numberOfTravelers = 'At least 1 traveler required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setSuccessMessage('');
    
    if (validate()) {
      setIsLoading(true);
      try {
        // Format numeric fields for the backend schema
        const tripPayload = {
          ...formData,
          budget: Number(formData.budget),
          numberOfTravelers: Number(formData.numberOfTravelers)
        };

        await tripService.createTrip(tripPayload);
        
        setSuccessMessage('Trip created successfully!');
        setTimeout(() => {
          navigate('/trips');
        }, 1500);

      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          setGlobalError(error.response.data.message);
        } else if (error.request) {
          setGlobalError('Network error. Please check your connection.');
        } else {
          setGlobalError('An unexpected server error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main create-trip-main">
        <div className="create-trip-container glass-panel">
          <h1 className="create-trip-title text-gradient">Plan a New Trip</h1>
          <p className="create-trip-subtitle">Enter your trip details to start organizing your journey.</p>
          
          {globalError && <div className="form-global-error">{globalError}</div>}
          {successMessage && <div className="form-global-success">{successMessage}</div>}

          <form className="create-trip-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <AuthInput
                label="Trip Name"
                type="text"
                name="tripName"
                value={formData.tripName}
                onChange={handleChange}
                placeholder="e.g. Summer in Paris"
                error={errors.tripName}
              />
            </div>
            
            <div className="form-row split-row">
              <AuthInput
                label="Starting Point"
                type="text"
                name="startingPoint"
                value={formData.startingPoint}
                onChange={handleChange}
                placeholder="City or Airport"
                error={errors.startingPoint}
              />
              <AuthInput
                label="Destination"
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="City or Country"
                error={errors.destination}
              />
            </div>

            <div className="form-row split-row">
              <AuthInput
                label="Start Date"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
              />
              <AuthInput
                label="End Date"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                error={errors.endDate}
              />
            </div>

            <div className="form-row split-row">
              <AuthInput
                label="Total Budget ($)"
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. 1500"
                error={errors.budget}
              />
              <AuthInput
                label="Number of Travelers"
                type="number"
                name="numberOfTravelers"
                value={formData.numberOfTravelers}
                onChange={handleChange}
                placeholder="e.g. 2"
                error={errors.numberOfTravelers}
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => navigate('/dashboard')}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`create-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading || successMessage}
              >
                {isLoading ? 'Creating...' : 'Create Trip'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateTrip;
