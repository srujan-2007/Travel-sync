import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './ExpenseModal.css';

function ExpenseModal({ isOpen, onClose, onSave, existingExpense = null }) {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: '',
    description: ''
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingExpense) {
      setFormData({
        category: existingExpense.category || '',
        amount: existingExpense.amount || '',
        date: existingExpense.date ? new Date(existingExpense.date).toISOString().split('T')[0] : '',
        description: existingExpense.description || ''
      });
    } else {
      // Reset for new expense
      setFormData({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0], // Default to today
        description: ''
      });
    }
    setError('');
  }, [existingExpense, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validate = () => {
    if (!formData.category.trim()) return "Category is required.";
    if (!formData.amount || Number(formData.amount) <= 0) return "Amount must be greater than 0.";
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
      await onSave({
        ...formData,
        amount: Number(formData.amount)
      });
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
    <div className="expense-modal-overlay" onClick={onClose}>
      <div className="expense-modal-content" onClick={e => e.stopPropagation()}>
        <div className="expense-modal-header">
          <h2>{existingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="expense-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && <div className="form-global-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="expense-form-group">
            <label>Category *</label>
            <select 
              name="category" 
              className="expense-input" 
              value={formData.category} 
              onChange={handleChange}
              style={{ appearance: 'auto', backgroundColor: '#1a1a1a' }}
            >
              <option value="" disabled>Select a category</option>
              <option value="Flights">Flights</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Transport">Transport</option>
              <option value="Activities">Activities</option>
              <option value="Shopping">Shopping</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <div className="expense-form-group">
            <label>Amount ($) *</label>
            <input 
              type="number" 
              name="amount" 
              className="expense-input" 
              value={formData.amount} 
              onChange={handleChange} 
              placeholder="0.00" 
              step="0.01"
              min="0"
            />
          </div>

          <div className="expense-form-group">
            <label>Date *</label>
            <input 
              type="date" 
              name="date" 
              className="expense-input" 
              value={formData.date} 
              onChange={handleChange} 
            />
          </div>

          <div className="expense-form-group">
            <label>Description (Optional)</label>
            <input 
              type="text" 
              name="description" 
              className="expense-input" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="What was this expense for?" 
            />
          </div>

          <div className="expense-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseModal;
