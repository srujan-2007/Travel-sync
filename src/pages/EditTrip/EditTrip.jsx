import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import AuthInput from '../../components/AuthInput/AuthInput';
import tripService from '../../services/tripService';
import '../CreateTrip/CreateTrip.css'; // Reuse the identical styles

function EditTrip() {
  const { id } = useParams();
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
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch trip data on mount
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const trip = await tripService.getTripById(id);
        
        // Format dates for HTML <input type="date"> (YYYY-MM-DD)
        const formatForInput = (dateString) => {
          if (!dateString) return '';
          return new Date(dateString).toISOString().split('T')[0];
        };

        setFormData({
          tripName: trip.tripName || '',
          startingPoint: trip.startingPoint || '',
          destination: trip.destination || '',
          startDate: formatForInput(trip.startDate),
          endDate: formatForInput(trip.endDate),
          budget: trip.budget || '',
          numberOfTravelers: trip.numberOfTravelers || ''
        });
      } catch (err) {
        console.error("Failed to fetch trip for editing:", err);
        setGlobalError("Failed to load trip details. The trip might have been deleted or you don't have access.");
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchTrip();
  }, [id]);

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
      setIsSaving(true);
      try {
        const tripPayload = {
          ...formData,
          budget: Number(formData.budget),
          numberOfTravelers: Number(formData.numberOfTravelers)
        };

        await tripService.updateTrip(id, tripPayload);
        
        setSuccessMessage('Trip updated successfully!');
        setTimeout(() => {
          navigate(`/trips/${id}`);
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
        setIsSaving(false);
      }
    }
  };

  if (isFetching) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main create-trip-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="text-gradient">Loading trip details...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main create-trip-main">
        <div className="create-trip-container glass-panel">
          <h1 className="create-trip-title text-gradient">Edit Trip Details</h1>
          <p className="create-trip-subtitle">Update your travel plans for {formData.tripName || 'this trip'}.</p>
          
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
                onClick={() => navigate(`/trips/${id}`)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`create-btn ${isSaving ? 'loading' : ''}`}
                disabled={isSaving || successMessage}
              >
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditTrip;
