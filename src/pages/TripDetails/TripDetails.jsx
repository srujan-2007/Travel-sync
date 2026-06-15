import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import { 
  ArrowLeft, MapPin, Calendar, Users, Wallet, 
  Image as ImageIcon, Map, Clock, AlertTriangle, Plus, Edit, List, Trash2
} from 'lucide-react';

import ExpenseModal from '../../components/ExpenseModal/ExpenseModal';
import MemoryModal from '../../components/MemoryModal/MemoryModal';
import ActivityModal from '../../components/ActivityModal/ActivityModal';
import LocationModal from '../../components/LocationModal/LocationModal';
import ItineraryModal from '../../components/ItineraryModal/ItineraryModal';

// Services
import tripService from '../../services/tripService';
import expenseService from '../../services/expenseService';
import memoryService from '../../services/memoryService';
import activityService from '../../services/activityService';
import locationService from '../../services/locationService';
import itineraryService from '../../services/itineraryService';

import './TripDetails.css';

function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data States
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [memories, setMemories] = useState([]);
  const [activities, setActivities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [itineraries, setItineraries] = useState([]);

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [memoryToEdit, setMemoryToEdit] = useState(null);

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState(null);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState(null);

  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);
  const [itineraryToEdit, setItineraryToEdit] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'expense', 'memory', etc.
  const [isDeleting, setIsDeleting] = useState(false);

  // Lock background scrolling when any modal is open
  useEffect(() => {
    if (isExpenseModalOpen || isMemoryModalOpen || isActivityModalOpen || isLocationModalOpen || isItineraryModalOpen || deleteModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isExpenseModalOpen, isMemoryModalOpen, isActivityModalOpen, isLocationModalOpen, isItineraryModalOpen, deleteModalOpen]);

  useEffect(() => {
    fetchTripData();
    // eslint-disable-next-line
  }, [id]);

  const fetchTripData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use Promise.all to fetch all related data concurrently.
      // We use .catch() on the child records so that if a specific collection fails
      // (or doesn't exist yet for this user), it doesn't crash the entire page.
      const [
        tripData, 
        expensesData, 
        memoriesData, 
        activitiesData, 
        locationsData, 
        itinerariesData
      ] = await Promise.all([
        tripService.getTripById(id),
        expenseService.getExpensesByTrip(id).catch(() => []),
        memoryService.getMemoriesByTrip(id).catch(() => []),
        activityService.getActivitiesByTrip(id).catch(() => []),
        locationService.getLocationsByTrip(id).catch(() => []),
        itineraryService.getItinerariesByTrip(id).catch(() => [])
      ]);

      setTrip(tripData);
      setExpenses(expensesData || []);
      setMemories(memoriesData || []);
      setActivities(activitiesData || []);
      setLocations(locationsData || []);
      setItineraries(itinerariesData || []);
    } catch (err) {
      console.error('Failed to fetch trip details:', err);
      if (err.response && err.response.status === 404) {
        setError('Trip not found. It may have been deleted.');
      } else {
        setError('Failed to load trip details. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Expense Handlers
  const handleAddExpense = () => {
    setExpenseToEdit(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (expenseData) => {
    if (expenseToEdit) {
      await expenseService.updateExpense(expenseToEdit._id, expenseData);
    } else {
      await expenseService.createExpense({ ...expenseData, tripId: id });
    }
    // Refresh expenses
    const updatedExpenses = await expenseService.getExpensesByTrip(id);
    setExpenses(updatedExpenses);
  };

  // Memory Handlers
  const handleAddMemory = () => {
    setMemoryToEdit(null);
    setIsMemoryModalOpen(true);
  };

  const handleEditMemory = (memory) => {
    setMemoryToEdit(memory);
    setIsMemoryModalOpen(true);
  };

  const handleSaveMemory = async (memoryData) => {
    if (memoryToEdit) {
      await memoryService.updateMemory(memoryToEdit._id, memoryData);
    } else {
      await memoryService.createMemory({ ...memoryData, tripId: id });
    }
    // Refresh memories
    const updatedMemories = await memoryService.getMemoriesByTrip(id);
    setMemories(updatedMemories);
  };

  // Activity Handlers
  const handleAddActivity = () => {
    setActivityToEdit(null);
    setIsActivityModalOpen(true);
  };

  const handleEditActivity = (activity) => {
    setActivityToEdit(activity);
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = async (activityData) => {
    if (activityToEdit) {
      await activityService.updateActivity(activityToEdit._id, activityData);
    } else {
      await activityService.createActivity({ ...activityData, tripId: id });
    }
    // Refresh activities
    const updatedActivities = await activityService.getActivitiesByTrip(id);
    setActivities(updatedActivities);
  };

  // Location Handlers
  const handleAddLocation = () => {
    setLocationToEdit(null);
    setIsLocationModalOpen(true);
  };

  const handleEditLocation = (location) => {
    setLocationToEdit(location);
    setIsLocationModalOpen(true);
  };

  const handleSaveLocation = async (locationData) => {
    if (locationToEdit) {
      await locationService.updateLocation(locationToEdit._id, locationData);
    } else {
      await locationService.createLocation({ ...locationData, tripId: id });
    }
    // Refresh locations
    const updatedLocations = await locationService.getLocationsByTrip(id);
    setLocations(updatedLocations);
  };

  // Itinerary Handlers
  const handleAddItinerary = () => {
    setItineraryToEdit(null);
    setIsItineraryModalOpen(true);
  };

  const handleEditItinerary = (itinerary) => {
    setItineraryToEdit(itinerary);
    setIsItineraryModalOpen(true);
  };

  const handleSaveItinerary = async (itineraryData) => {
    if (itineraryToEdit) {
      await itineraryService.updateItinerary(itineraryToEdit._id, itineraryData);
    } else {
      await itineraryService.createItinerary({ ...itineraryData, tripId: id });
    }
    // Refresh itineraries
    const updatedItineraries = await itineraryService.getItinerariesByTrip(id);
    setItineraries(updatedItineraries);
  };

  // Delete Handlers
  const confirmDelete = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
    setDeleteType('');
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (deleteType === 'expense') {
        await expenseService.deleteExpense(itemToDelete._id);
        setExpenses(expenses.filter(e => e._id !== itemToDelete._id));
      } else if (deleteType === 'memory') {
        await memoryService.deleteMemory(itemToDelete._id);
        setMemories(memories.filter(m => m._id !== itemToDelete._id));
      } else if (deleteType === 'activity') {
        await activityService.deleteActivity(itemToDelete._id);
        setActivities(activities.filter(a => a._id !== itemToDelete._id));
      } else if (deleteType === 'location') {
        await locationService.deleteLocation(itemToDelete._id);
        setLocations(locations.filter(l => l._id !== itemToDelete._id));
      } else if (deleteType === 'itinerary') {
        await itineraryService.deleteItinerary(itemToDelete._id);
        setItineraries(itineraries.filter(i => i._id !== itemToDelete._id));
      }
      closeDeleteModal();
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper Functions
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getTripStatus = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    today.setHours(0,0,0,0);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);

    if (today < start) return { label: 'Upcoming', class: 'upcoming' };
    if (today > end) return { label: 'Completed', class: 'completed' };
    return { label: 'Ongoing', class: 'ongoing' };
  };

  const calculateDuration = (start, end) => {
    const diffTime = Math.abs(new Date(end) - new Date(start));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays + 1; // Inclusive of start day
  };

  // Render Functions for Tabs
  const renderOverviewTab = () => {
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const remaining = trip.budget - totalExpenses;

    return (
      <div className="overview-grid">
        <div className="overview-main">
          <div className="overview-card glass-panel">
            <h3>Trip Information</h3>
            <div className="overview-info-grid">
              <div className="info-item">
                <span className="info-label">Destination</span>
                <span className="info-value">{trip.destination}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Starting Point</span>
                <span className="info-value">{trip.startingPoint}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Duration</span>
                <span className="info-value">{calculateDuration(trip.startDate, trip.endDate)} Days</span>
              </div>
              <div className="info-item">
                <span className="info-label">Travelers</span>
                <span className="info-value">{trip.numberOfTravelers} Person(s)</span>
              </div>
            </div>
          </div>

          <div className="overview-card glass-panel">
            <h3>Budget Summary</h3>
            <div className="overview-info-grid">
              <div className="info-item">
                <span className="info-label">Total Budget</span>
                <span className="info-value">${trip.budget}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Spent</span>
                <span className="info-value danger">${totalExpenses}</span>
              </div>
              <div className="info-item" style={{ gridColumn: 'span 2' }}>
                <span className="info-label">Remaining Balance</span>
                <span className={`info-value ${remaining < 0 ? 'danger' : 'primary'}`} style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  ${remaining}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="overview-sidebar">
          <div className="overview-card glass-panel">
            <h3>Quick Actions</h3>
            <div className="quick-actions-list">
              <Link to={`/trips/edit/${trip._id}`} className="quick-action-link">
                <Edit size={18} /> Edit Trip Details
              </Link>
              <div className="quick-action-link" onClick={() => { setActiveTab('expenses'); handleAddExpense(); }}>
                <Wallet size={18} /> Add Expense
              </div>
              <div className="quick-action-link" onClick={() => { setActiveTab('memories'); handleAddMemory(); }}>
                <ImageIcon size={18} /> Upload Memory
              </div>
              <div className="quick-action-link" onClick={() => { setActiveTab('locations'); handleAddLocation(); }}>
                <MapPin size={18} /> Add Location
              </div>
              <div className="quick-action-link" onClick={() => { setActiveTab('itinerary'); handleAddItinerary(); }}>
                <List size={18} /> Create Itinerary
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderExpensesTab = () => {
    if (expenses.length === 0) {
      return (
        <div className="tab-empty-state">
          <Wallet size={48} />
          <h3>No Expenses Yet</h3>
          <p>Keep track of your spending by adding your first expense.</p>
          <div className="action-btn-sm" onClick={handleAddExpense}>
            <Plus size={16} /> Add Expense
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="tab-section-header">
          <h2 className="tab-section-title">Expenses</h2>
          <div className="action-btn-sm" onClick={handleAddExpense}>
            <Plus size={16} /> Add New
          </div>
        </div>
        <div className="expenses-grid">
          {expenses.map((exp) => (
            <div key={exp._id} className="expense-card glass-panel">
              <div className="expense-header">
                <span className="expense-category">{exp.category || 'General'}</span>
                <span className="expense-amount">${exp.amount}</span>
              </div>
              <div className="expense-desc">{exp.description}</div>
              <div className="expense-date" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{formatDate(exp.date || exp.createdAt)}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="icon-btn edit" onClick={() => handleEditExpense(exp)}><Edit size={14} /></button>
                  <button className="icon-btn delete" onClick={() => confirmDelete(exp, 'expense')}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMemoriesTab = () => {
    if (memories.length === 0) {
      return (
        <div className="tab-empty-state">
          <ImageIcon size={48} />
          <h3>No Memories Yet</h3>
          <p>Upload photos and notes to remember your journey.</p>
          <div className="action-btn-sm" onClick={handleAddMemory}>
            <Plus size={16} /> Upload Memory
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="tab-section-header">
          <h2 className="tab-section-title">Memories</h2>
          <div className="action-btn-sm" onClick={handleAddMemory}>
            <Plus size={16} /> Upload New
          </div>
        </div>
        <div className="memories-grid">
          {memories.map((mem) => (
            <div key={mem._id} className="memory-card glass-panel">
              <div className="memory-img-placeholder">
                {mem.mediaUrl ? (
                  <img src={mem.mediaUrl} alt={mem.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <ImageIcon size={32} />
                )}
              </div>
              <div className="memory-content">
                <div className="memory-caption">{mem.title || mem.caption || 'Untitled Memory'}</div>
                <div className="memory-note">{mem.description || mem.travelNote || 'No description provided.'}</div>
                <div className="memory-date" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span>{formatDate(mem.date || mem.createdAt)}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="icon-btn edit" onClick={() => handleEditMemory(mem)}><Edit size={14} /></button>
                    <button className="icon-btn delete" onClick={() => confirmDelete(mem, 'memory')}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderActivitiesTab = () => {
    if (activities.length === 0) {
      return (
        <div className="tab-empty-state">
          <Clock size={48} />
          <h3>No Activities Yet</h3>
          <p>Plan your days by adding activities to your timeline.</p>
          <div className="action-btn-sm" onClick={handleAddActivity}>
            <Plus size={16} /> Add Activity
          </div>
        </div>
      );
    }

    // Sort activities by date, then time
    const sortedActivities = [...activities].sort((a, b) => {
      const dateA = new Date(`${a.date.split('T')[0]}T${a.time}`);
      const dateB = new Date(`${b.date.split('T')[0]}T${b.time}`);
      return dateA - dateB;
    });

    return (
      <div>
        <div className="tab-section-header">
          <h2 className="tab-section-title">Activity Timeline</h2>
          <div className="action-btn-sm" onClick={handleAddActivity}>
            <Plus size={16} /> Add New
          </div>
        </div>
        <div className="trip-timeline">
          {sortedActivities.map((act) => (
            <div key={act._id} className="trip-timeline-item">
              <div className="trip-timeline-content glass-panel">
                <div className="trip-timeline-header">
                  <span className="trip-timeline-title">{act.activityName}</span>
                  <span className="trip-timeline-time">{formatDate(act.date)} at {act.time}</span>
                </div>
                {act.place && (
                  <div className="trip-timeline-place">
                    <MapPin size={14} /> {act.place}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className="icon-btn edit" onClick={() => handleEditActivity(act)}><Edit size={14} /></button>
                  <button className="icon-btn delete" onClick={() => confirmDelete(act, 'activity')}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLocationsTab = () => {
    if (locations.length === 0) {
      return (
        <div className="tab-empty-state">
          <Map size={48} />
          <h3>No Locations Yet</h3>
          <p>Track the places you visit during your trip.</p>
          <div className="action-btn-sm" onClick={handleAddLocation}>
            <Plus size={16} /> Add Location
          </div>
        </div>
      );
    }

    // Sort locations by date, then time
    const sortedLocations = [...locations].sort((a, b) => {
      const dateA = new Date(`${a.visitDate.split('T')[0]}T${a.visitTime}`);
      const dateB = new Date(`${b.visitDate.split('T')[0]}T${b.visitTime}`);
      return dateA - dateB;
    });

    return (
      <div>
        <div className="tab-section-header">
          <h2 className="tab-section-title">Visited Locations</h2>
          <div className="action-btn-sm" onClick={handleAddLocation}>
            <Plus size={16} /> Add New
          </div>
        </div>
        <div className="locations-list">
          {sortedLocations.map((loc) => (
            <div key={loc._id} className="location-item glass-panel">
              <div className="location-info">
                <div className="location-icon"><MapPin size={24} /></div>
                <div style={{ flex: 1 }}>
                  <div className="location-name">{loc.placeName}</div>
                  <div className="location-date">{formatDate(loc.visitDate)} at {loc.visitTime}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                  <button className="icon-btn edit" onClick={() => handleEditLocation(loc)}><Edit size={14} /></button>
                  <button className="icon-btn delete" onClick={() => confirmDelete(loc, 'location')}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderItineraryTab = () => {
    if (itineraries.length === 0) {
      return (
        <div className="tab-empty-state">
          <List size={48} />
          <h3>No Itinerary Yet</h3>
          <p>Create a day-by-day plan for your journey.</p>
          <div className="action-btn-sm" onClick={handleAddItinerary}>
            <Plus size={16} /> Create Itinerary
          </div>
        </div>
      );
    }

    // Sort by day number then time
    const sortedItin = [...itineraries].sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) {
        return (a.dayNumber || 0) - (b.dayNumber || 0);
      }
      return a.time.localeCompare(b.time);
    });

    return (
      <div>
        <div className="tab-section-header">
          <h2 className="tab-section-title">Trip Itinerary</h2>
          <div className="action-btn-sm" onClick={handleAddItinerary}>
            <Plus size={16} /> Add Item
          </div>
        </div>
        <div className="trip-timeline">
          {sortedItin.map((day) => (
            <div key={day._id} className="trip-timeline-item">
              <div className="trip-timeline-content glass-panel">
                <div className="trip-timeline-header">
                  <span className="trip-timeline-title">Day {day.dayNumber || '-'}</span>
                  <span className="trip-timeline-time">{day.time}</span>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ fontWeight: '500' }}>{day.place}</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{day.activity}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className="icon-btn edit" onClick={() => handleEditItinerary(day)}><Edit size={14} /></button>
                  <button className="icon-btn delete" onClick={() => confirmDelete(day, 'itinerary')}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Main Render
  if (isLoading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main trip-details-main">
          <div className="page-loader">
            <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p>Loading trip details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main trip-details-main">
          <div className="page-error">
            <AlertTriangle size={64} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h2>{error || 'Trip not found'}</h2>
            <Link to="/trips" className="action-btn-sm" style={{ marginTop: '1.5rem', background: 'var(--color-primary)', border: 'none' }}>
              Back to My Trips
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Pre-calculate top stats
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const remainingBudget = trip.budget - totalExpenses;
  const status = getTripStatus(trip.startDate, trip.endDate);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main trip-details-main">
        
        {/* Top Banner */}
        <div className="trip-banner">
          <Link to="/trips" className="back-btn">
            <ArrowLeft size={20} /> Back to My Trips
          </Link>
          
          <div className="trip-banner-header">
            <div>
              <h1 className="trip-banner-title">{trip.tripName}</h1>
              <div className="trip-banner-route">
                {trip.startingPoint} <MapPin size={18} /> {trip.destination}
              </div>
            </div>
            <span className={`status-badge ${status.class}`}>
              {status.label}
            </span>
          </div>

          <div className="trip-banner-details">
            <div className="banner-detail-item">
              <Calendar size={16} className="banner-detail-icon" />
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </div>
            <div className="banner-detail-item">
              <Clock size={16} className="banner-detail-icon" />
              {calculateDuration(trip.startDate, trip.endDate)} Days
            </div>
            <div className="banner-detail-item">
              <Users size={16} className="banner-detail-icon" />
              {trip.numberOfTravelers} Travelers
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="stats-container">
          <div className="stats-grid">
            <div className="stat-card glass-panel">
              <span className="stat-label">Total Budget</span>
              <span className="stat-value">${trip.budget}</span>
            </div>
            <div className="stat-card glass-panel">
              <span className="stat-label">Total Expenses</span>
              <span className="stat-value danger">${totalExpenses}</span>
            </div>
            <div className="stat-card glass-panel">
              <span className="stat-label">Remaining</span>
              <span className={`stat-value ${remainingBudget < 0 ? 'danger' : 'primary'}`}>
                ${remainingBudget}
              </span>
            </div>
            <div className="stat-card glass-panel">
              <span className="stat-label">Memories</span>
              <span className="stat-value">{memories.length}</span>
            </div>
            <div className="stat-card glass-panel">
              <span className="stat-label">Activities</span>
              <span className="stat-value">{activities.length}</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs-nav">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'expenses', label: 'Expenses' },
            { id: 'memories', label: 'Memories' },
            { id: 'activities', label: 'Activities' },
            { id: 'locations', label: 'Locations' },
            { id: 'itinerary', label: 'Itinerary' }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'expenses' && renderExpensesTab()}
          {activeTab === 'memories' && renderMemoriesTab()}
          {activeTab === 'activities' && renderActivitiesTab()}
          {activeTab === 'locations' && renderLocationsTab()}
          {activeTab === 'itinerary' && renderItineraryTab()}
        </div>

      </main>

      {/* Expense Modal */}
      <ExpenseModal 
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        existingExpense={expenseToEdit}
      />

      {/* Memory Modal */}
      <MemoryModal 
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        onSave={handleSaveMemory}
        existingMemory={memoryToEdit}
      />

      {/* Activity Modal */}
      <ActivityModal 
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSave={handleSaveActivity}
        existingActivity={activityToEdit}
      />

      {/* Location Modal */}
      <LocationModal 
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSave={handleSaveLocation}
        existingLocation={locationToEdit}
      />

      {/* Itinerary Modal */}
      <ItineraryModal 
        isOpen={isItineraryModalOpen}
        onClose={() => setIsItineraryModalOpen(false)}
        onSave={handleSaveItinerary}
        existingItinerary={itineraryToEdit}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AlertTriangle size={48} className="modal-icon" />
            <h2 className="modal-title">Delete Item?</h2>
            <p className="modal-text">
              Are you sure you want to delete this {deleteType}? This action cannot be undone.
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
                onClick={handleDeleteConfirm}
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

export default TripDetails;
