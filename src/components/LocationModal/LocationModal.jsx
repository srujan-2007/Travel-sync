import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './LocationModal.css';

function LocationModal({ isOpen, onClose, onSave, existingLocation = null }) {
  const [formData, setFormData] = useState({
    placeName: '',
    visitDate: '',
    visitTime: ''
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingLocation) {
      setFormData({
        placeName: existingLocation.placeName || '',
        visitDate: existingLocation.visitDate ? new Date(existingLocation.visitDate).toISOString().split('T')[0] : '',
        visitTime: existingLocation.visitTime || ''
      });
    } else {
      setFormData({
        placeName: '',
        visitDate: new Date().toISOString().split('T')[0],
        visitTime: ''
      });
    }
    setError('');
  }, [existingLocation, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validate = () => {
    if (!formData.placeName.trim()) return "Location Name is required.";
    if (!formData.visitDate) return "Visit Date is required.";
    if (!formData.visitTime.trim()) return "Visit Time is required.";
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
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal-content" onClick={e => e.stopPropagation()}>
        <div className="location-modal-header">
          <h2>{existingLocation ? 'Edit Location' : 'Add Location'}</h2>
          <button className="location-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && <div className="form-global-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="location-form-group">
            <label>Location Name *</label>
            <input 
              type="text" 
              name="placeName" 
              className="location-input" 
              value={formData.placeName} 
              onChange={handleChange} 
              placeholder="e.g. Eiffel Tower, Central Park" 
            />
          </div>

          <div className="location-form-group">
            <label>Visit Date *</label>
            <input 
              type="date" 
              name="visitDate" 
              className="location-input" 
              value={formData.visitDate} 
              onChange={handleChange} 
            />
          </div>

          <div className="location-form-group">
            <label>Visit Time *</label>
            <input 
              type="time" 
              name="visitTime" 
              className="location-input" 
              value={formData.visitTime} 
              onChange={handleChange} 
            />
          </div>

          <div className="location-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LocationModal;
