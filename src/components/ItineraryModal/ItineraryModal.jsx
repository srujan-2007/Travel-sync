import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './ItineraryModal.css';

function ItineraryModal({ isOpen, onClose, onSave, existingItinerary = null }) {
  const [formData, setFormData] = useState({
    dayNumber: '',
    place: '',
    activity: '',
    time: ''
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingItinerary) {
      setFormData({
        dayNumber: existingItinerary.dayNumber || '',
        place: existingItinerary.place || '',
        activity: existingItinerary.activity || '',
        time: existingItinerary.time || ''
      });
    } else {
      setFormData({
        dayNumber: '',
        place: '',
        activity: '',
        time: ''
      });
    }
    setError('');
  }, [existingItinerary, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validate = () => {
    if (!formData.dayNumber || formData.dayNumber <= 0) return "Valid Day Number is required.";
    if (!formData.place.trim()) return "Place is required.";
    if (!formData.activity.trim()) return "Activity is required.";
    if (!formData.time.trim()) return "Time is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="itinerary-modal-overlay" onClick={onClose}>
      <div className="itinerary-modal-content" onClick={e => e.stopPropagation()}>
        <div className="itinerary-modal-header">
          <h2>{existingItinerary ? 'Edit Itinerary Item' : 'Add Itinerary Item'}</h2>
          <button className="itinerary-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && <div className="form-global-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="itinerary-form-group">
            <label>Day Number *</label>
            <input 
              type="number" 
              name="dayNumber" 
              className="itinerary-input" 
              value={formData.dayNumber} 
              onChange={handleChange} 
              placeholder="e.g. 1" 
              min="1"
            />
          </div>

          <div className="itinerary-form-group">
            <label>Time *</label>
            <input 
              type="time" 
              name="time" 
              className="itinerary-input" 
              value={formData.time} 
              onChange={handleChange} 
            />
          </div>

          <div className="itinerary-form-group">
            <label>Place *</label>
            <input 
              type="text" 
              name="place" 
              className="itinerary-input" 
              value={formData.place} 
              onChange={handleChange} 
              placeholder="e.g. Hotel, Airport, Museum" 
            />
          </div>

          <div className="itinerary-form-group">
            <label>Activity *</label>
            <textarea 
              name="activity" 
              className="itinerary-input" 
              value={formData.activity} 
              onChange={handleChange} 
              placeholder="Describe the activity..." 
              rows="3"
            />
          </div>

          <div className="itinerary-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ItineraryModal;
