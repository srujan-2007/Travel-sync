import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './ActivityModal.css';

function ActivityModal({ isOpen, onClose, onSave, existingActivity = null }) {
  const [formData, setFormData] = useState({
    activityName: '',
    place: '',
    date: '',
    time: ''
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingActivity) {
      setFormData({
        activityName: existingActivity.activityName || '',
        place: existingActivity.place || '',
        date: existingActivity.date ? new Date(existingActivity.date).toISOString().split('T')[0] : '',
        time: existingActivity.time || ''
      });
    } else {
      setFormData({
        activityName: '',
        place: '',
        date: new Date().toISOString().split('T')[0],
        time: ''
      });
    }
    setError('');
  }, [existingActivity, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validate = () => {
    if (!formData.activityName.trim()) return "Activity Name is required.";
    if (!formData.place.trim()) return "Place/Location is required.";
    if (!formData.date) return "Date is required.";
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
    <div className="activity-modal-overlay" onClick={onClose}>
      <div className="activity-modal-content" onClick={e => e.stopPropagation()}>
        <div className="activity-modal-header">
          <h2>{existingActivity ? 'Edit Activity' : 'Add Activity'}</h2>
          <button className="activity-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && <div className="form-global-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="activity-form-group">
            <label>Activity Name *</label>
            <input 
              type="text" 
              name="activityName" 
              className="activity-input" 
              value={formData.activityName} 
              onChange={handleChange} 
              placeholder="e.g. Scuba Diving, Museum Tour" 
            />
          </div>

          <div className="activity-form-group">
            <label>Place / Location *</label>
            <input 
              type="text" 
              name="place" 
              className="activity-input" 
              value={formData.place} 
              onChange={handleChange} 
              placeholder="e.g. Grand Reef, Louvre Museum" 
            />
          </div>

          <div className="activity-form-group">
            <label>Date *</label>
            <input 
              type="date" 
              name="date" 
              className="activity-input" 
              value={formData.date} 
              onChange={handleChange} 
            />
          </div>

          <div className="activity-form-group">
            <label>Time *</label>
            <input 
              type="time" 
              name="time" 
              className="activity-input" 
              value={formData.time} 
              onChange={handleChange} 
            />
          </div>

          <div className="activity-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ActivityModal;
