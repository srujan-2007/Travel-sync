import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import './MemoryModal.css';
import uploadService from '../../services/uploadService';

function MemoryModal({ isOpen, onClose, onSave, existingMemory = null }) {
  const [formData, setFormData] = useState({
    mediaType: 'Photo',
    mediaUrl: '',
    caption: '',
    travelNote: '',
    date: ''
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (existingMemory) {
      setFormData({
        mediaType: existingMemory.mediaType || 'Photo',
        mediaUrl: existingMemory.mediaUrl || '',
        caption: existingMemory.caption || '',
        travelNote: existingMemory.travelNote || '',
        date: existingMemory.date ? new Date(existingMemory.date).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        mediaType: 'Photo',
        mediaUrl: '',
        caption: '',
        travelNote: '',
        date: new Date().toISOString().split('T')[0]
      });
      setPreviewUrl('');
    }
    setFile(null);
    setError('');
  }, [existingMemory, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      if (error) setError('');
    }
  };

  const validate = () => {
    if (!formData.mediaUrl && !file) return "Please upload an image or video.";
    if (!formData.date) return "Date is required.";
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
      let finalMediaUrl = formData.mediaUrl;

      // If a new file was selected, upload it first
      if (file) {
        const uploadResult = await uploadService.uploadFile(file);
        finalMediaUrl = uploadResult.url;
      }

      await onSave({ ...formData, mediaUrl: finalMediaUrl });
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
    <div className="memory-modal-overlay" onClick={onClose}>
      <div className="memory-modal-content" onClick={e => e.stopPropagation()}>
        <div className="memory-modal-header">
          <h2>{existingMemory ? 'Edit Memory' : 'Upload Memory'}</h2>
          <button className="memory-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && <div className="form-global-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="memory-form-group">
            <label>Media Type *</label>
            <select 
              name="mediaType" 
              className="memory-input" 
              value={formData.mediaType} 
              onChange={handleChange}
              style={{ appearance: 'auto', backgroundColor: '#1a1a1a' }}
            >
              <option value="Photo">Photo</option>
              <option value="Video">Video</option>
            </select>
          </div>

          <div className="memory-form-group">
            <label>Upload Media *</label>
            <div className="file-upload-container" style={{
              border: '2px dashed rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'center',
              position: 'relative',
              cursor: 'pointer',
              background: 'rgba(0,0,0,0.2)',
              marginBottom: '0.5rem'
            }}>
              <input 
                type="file" 
                accept="image/*,video/*"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <Upload size={24} style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }} />
              <div style={{ color: 'var(--color-text-main)' }}>Click or drag file to upload</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Max size 20MB</div>
            </div>
            
            {/* Preview Section */}
            {(previewUrl || formData.mediaUrl) && (
              <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                {formData.mediaType === 'Video' ? (
                  <video 
                    src={previewUrl || formData.mediaUrl} 
                    controls 
                    style={{ width: '100%', maxHeight: '200px', display: 'block', backgroundColor: '#000' }} 
                  />
                ) : (
                  <img 
                    src={previewUrl || formData.mediaUrl} 
                    alt="Preview" 
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} 
                  />
                )}
              </div>
            )}
          </div>

          <div className="memory-form-group">
            <label>Date *</label>
            <input 
              type="date" 
              name="date" 
              className="memory-input" 
              value={formData.date} 
              onChange={handleChange} 
            />
          </div>

          <div className="memory-form-group">
            <label>Caption</label>
            <input 
              type="text" 
              name="caption" 
              className="memory-input" 
              value={formData.caption} 
              onChange={handleChange} 
              placeholder="A short title or caption" 
            />
          </div>

          <div className="memory-form-group">
            <label>Travel Note</label>
            <textarea 
              name="travelNote" 
              className="memory-input" 
              value={formData.travelNote} 
              onChange={handleChange} 
              placeholder="Write about this memory..." 
              rows="3"
            />
          </div>

          <div className="memory-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MemoryModal;
