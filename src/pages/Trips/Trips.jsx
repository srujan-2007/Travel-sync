import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import SearchBar from '../../components/SearchBar/SearchBar';
import TripFilters from '../../components/TripFilters/TripFilters';
import tripService from '../../services/tripService';
import { 
  Plus, PlaneTakeoff, MapPin, Calendar, 
  Users, Wallet, Eye, Edit, Trash2, AlertTriangle 
} from 'lucide-react';
import './Trips.css';

function Trips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    budget: '',
    destination: ''
  });

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTrips();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filters]);

  const fetchTrips = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        q: searchQuery,
        ...filters
      };
      const data = await tripService.getTrips(params);
      setTrips(data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response && err.response.status === 404) {
        setError('Trips not found.');
      } else if (err.request) {
        setError('Network error. Could not connect to the server.');
      } else {
        setError('An unexpected server error occurred while fetching trips.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({ status: '', budget: '', destination: '' });
  };

  const openDeleteModal = (trip) => {
    setTripToDelete(trip);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setTripToDelete(null);
  };

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;
    
    setIsDeleting(true);
    try {
      await tripService.deleteTrip(tripToDelete._id);
      
      // Update UI React state without refreshing the page
      setTrips(trips.filter(t => t._id !== tripToDelete._id));
      
      // Show success toast message
      setSuccessMessage('Trip deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      closeDeleteModal();
    } catch (err) {
      console.error('Failed to delete trip:', err);
      // Fallback alert for deletion errors
      alert('Failed to delete the trip. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main trips-main">
        
        {/* Success Toast */}
        {successMessage && (
          <div className="global-success-message">
            {successMessage}
          </div>
        )}

        <div className="trips-header">
          <h1 className="trips-title text-gradient">My Trips</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Search trips..." 
            />
            <Link to="/trips/create" className="create-trip-btn">
              <Plus size={20} /> Create Trip
            </Link>
          </div>
        </div>

        <TripFilters 
          filters={filters} 
          setFilters={setFilters} 
          onClear={handleClearFilters} 
        />

        {/* Error State Premium Card */}
        {error && (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Oops! Something went wrong</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{error}</p>
            <button className="create-trip-btn" onClick={fetchTrips} style={{ margin: '0 auto' }}>
              Try Again
            </button>
          </div>
        )}

        {/* Loading State Skeleton Cards */}
        {!error && isLoading && (
          <div className="trips-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-card"></div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!error && !isLoading && trips.length === 0 && (
          <div className="trips-empty-state">
            <PlaneTakeoff size={64} className="empty-illustration" />
            {searchQuery || Object.values(filters).some(val => val !== '') ? (
              <h2>No trips match the selected filters.</h2>
            ) : (
              <>
                <h2>No Trips Yet</h2>
                <p>Start planning your first journey and make unforgettable memories.</p>
                <Link to="/trips/create" className="create-trip-btn">
                  <Plus size={20} /> Create Trip
                </Link>
              </>
            )}
          </div>
        )}

        {/* Trips Grid */}
        {!error && !isLoading && trips.length > 0 && (
          <div className="trips-grid">
            {trips.map((trip) => (
              <div key={trip._id} className="trip-card glass-panel">
                <div className="trip-card-header">
                  <div>
                    <h3 className="trip-name">{trip.tripName}</h3>
                    <div className="trip-route">
                      <MapPin size={14} /> 
                      {trip.startingPoint} &rarr; {trip.destination}
                    </div>
                  </div>
                </div>

                <div className="trip-details-grid">
                  <div className="detail-item">
                    <Calendar size={16} className="detail-icon" />
                    <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                  </div>
                  <div className="detail-item">
                    <Wallet size={16} className="detail-icon" />
                    <span>${trip.budget}</span>
                  </div>
                  <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                    <Users size={16} className="detail-icon" />
                    <span>{trip.numberOfTravelers} Traveler{trip.numberOfTravelers > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="trip-footer">
                  <div className="created-date">
                    Created: {formatDate(trip.createdAt)}
                  </div>
                  <div className="trip-actions">
                    <button 
                      className="icon-btn view" 
                      onClick={() => navigate(`/trips/${trip._id}`)}
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="icon-btn edit" 
                      onClick={() => navigate(`/trips/edit/${trip._id}`)}
                      title="Edit Trip"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="icon-btn delete" 
                      onClick={() => openDeleteModal(trip)}
                      title="Delete Trip"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AlertTriangle size={48} className="modal-icon" />
            <h2 className="modal-title">Delete Trip?</h2>
            <p className="modal-text">
              Are you sure you want to delete "<strong>{tripToDelete?.tripName}</strong>"? 
              This action cannot be undone and will permanently remove all associated data.
            </p>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel" 
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="modal-btn delete" 
                onClick={handleDeleteTrip}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Trips;
