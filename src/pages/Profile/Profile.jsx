import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Save, AlertTriangle, CheckCircle2, MapPin, Wallet, Image as ImageIcon, Target } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import authService from '../../services/authService';
import tripService from '../../services/tripService';
import expenseService from '../../services/expenseService';
import memoryService from '../../services/memoryService';
import activityService from '../../services/activityService';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

function Profile() {
  const { currentUser, login } = useAuth(); // login from context updates user state

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    mobileNumber: '',
    createdAt: ''
  });

  const [stats, setStats] = useState({
    totalTrips: 0,
    totalExpenses: 0,
    totalMemories: 0,
    totalActivities: 0
  });

  const [recentActivity, setRecentActivity] = useState({
    trip: null,
    expense: null,
    memory: null,
    activity: null
  });

  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    fetchProfileAndStats();
  }, []);

  const fetchProfileAndStats = async () => {
    setIsLoading(true);
    setIsStatsLoading(true);
    setError(null);
    try {
      // 1. Fetch Profile Data (Very Fast)
      const userProfile = await authService.getProfile();
      setProfileData({
        name: userProfile.name || '',
        username: userProfile.username || '',
        mobileNumber: userProfile.mobileNumber || '',
        createdAt: userProfile.createdAt || ''
      });
      
      // 2. Unblock the UI render!
      setIsLoading(false);

      // 3. Fetch Heavy Stats in Background
      fetchHeavyProfileStats();

    } catch (err) {
      console.error('Failed to load profile data:', err);
      setError('Could not load profile information. Please try again.');
      setIsLoading(false);
      setIsStatsLoading(false);
    }
  };

  const fetchHeavyProfileStats = async () => {
    try {
      const trips = await tripService.getTrips();
      
      const expensePromises = trips.map(t => expenseService.getExpensesByTrip(t._id));
      const memoryPromises = trips.map(t => memoryService.getMemoriesByTrip(t._id));
      const activityPromises = trips.map(t => activityService.getActivitiesByTrip(t._id));

      const expenseResults = await Promise.allSettled(expensePromises);
      const memoryResults = await Promise.allSettled(memoryPromises);
      const activityResults = await Promise.allSettled(activityPromises);

      let allExpenses = [];
      expenseResults.forEach(res => {
        if (res.status === 'fulfilled') allExpenses.push(...res.value);
      });

      let allMemories = [];
      memoryResults.forEach(res => {
        if (res.status === 'fulfilled') allMemories.push(...res.value);
      });

      let allActivities = [];
      activityResults.forEach(res => {
        if (res.status === 'fulfilled') allActivities.push(...res.value);
      });

      setStats({
        totalTrips: trips.length,
        totalExpenses: allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
        totalMemories: allMemories.length,
        totalActivities: allActivities.length
      });

      // Find recents by sorting descending
      trips.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      allExpenses.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      allMemories.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      allActivities.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

      setRecentActivity({
        trip: trips[0] || null,
        expense: allExpenses[0] || null,
        memory: allMemories[0] || null,
        activity: allActivities[0] || null
      });

    } catch (err) {
      console.error('Background fetch failed:', err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setError(null);
    setSuccessMsg('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    if (!profileData.mobileNumber.trim()) {
      setError('Mobile Number cannot be empty.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMsg('');

    try {
      const updatedUser = await authService.updateProfile({
        name: profileData.name,
        mobileNumber: profileData.mobileNumber
      });
      
      // Update global context user state
      login(updatedUser);
      setSuccessMsg('Profile updated successfully!');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const hasAnyActivity = recentActivity.trip || recentActivity.expense || recentActivity.memory || recentActivity.activity;

  if (isLoading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="profile-main">
          <div className="page-loader">
            <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p>Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="profile-main">
        
        {/* HERO SECTION */}
        <div className="profile-hero glass-panel">
          <div className="profile-avatar-large">
            {getInitials(profileData.name)}
          </div>
          <div className="profile-info">
            <h1 className="text-gradient">{profileData.name}</h1>
            <div className="profile-subtitle">Travel Explorer</div>
            <div className="profile-meta">
              <span><Mail size={16} /> {profileData.username}</span>
              <span><Calendar size={16} /> Member since {formatDate(profileData.createdAt)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="form-global-error" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} /> {error}
          </div>
        )}
        
        {successMsg && (
          <div className="global-success-message" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <CheckCircle2 size={20} /> {successMsg}
          </div>
        )}

        {/* STATISTICS GRID */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card glass-panel">
            <div className="stat-emoji">🌍</div>
            <div className="profile-stat-value">{stats.totalTrips}</div>
            <div className="profile-stat-label">Trips</div>
          </div>
          <div className="profile-stat-card glass-panel">
            <div className="stat-emoji">💰</div>
            <div className="profile-stat-value">${stats.totalExpenses}</div>
            <div className="profile-stat-label">Expenses</div>
          </div>
          <div className="profile-stat-card glass-panel">
            <div className="stat-emoji">📸</div>
            <div className="profile-stat-value">{stats.totalMemories}</div>
            <div className="profile-stat-label">Memories</div>
          </div>
          <div className="profile-stat-card glass-panel">
            <div className="stat-emoji">🎯</div>
            <div className="profile-stat-value">{stats.totalActivities}</div>
            <div className="profile-stat-label">Activities</div>
          </div>
        </div>

        {/* CONTENT GRID: Activity + Edit Profile */}
        <div className="profile-content-grid">
          
          {/* RECENT ACTIVITY */}
          <div className="profile-activity-section glass-panel" style={{ padding: '2rem' }}>
            <h2 className="profile-section-title">Recent Activity</h2>
            
            {!hasAnyActivity ? (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <MapPin size={48} className="empty-icon" />
                <h3>No activity yet</h3>
                <p style={{ maxWidth: '100%' }}>Start planning a trip to see your activity here.</p>
              </div>
            ) : (
              <div className="activity-list">
                {recentActivity.trip && (
                  <div className="activity-item">
                    <div className="activity-icon" style={{ color: 'var(--color-primary)' }}><MapPin size={20} /></div>
                    <div className="activity-details">
                      <h4>Started a new trip to {recentActivity.trip.destination}</h4>
                      <p>{formatDate(recentActivity.trip.createdAt)}</p>
                    </div>
                  </div>
                )}
                {recentActivity.expense && (
                  <div className="activity-item">
                    <div className="activity-icon" style={{ color: '#ef4444' }}><Wallet size={20} /></div>
                    <div className="activity-details">
                      <h4>Logged ${recentActivity.expense.amount} for {recentActivity.expense.category}</h4>
                      <p>{formatDate(recentActivity.expense.createdAt)}</p>
                    </div>
                  </div>
                )}
                {recentActivity.memory && (
                  <div className="activity-item">
                    <div className="activity-icon" style={{ color: '#a855f7' }}><ImageIcon size={20} /></div>
                    <div className="activity-details">
                      <h4>Saved a memory in {recentActivity.memory.location}</h4>
                      <p>{formatDate(recentActivity.memory.createdAt)}</p>
                    </div>
                  </div>
                )}
                {recentActivity.activity && (
                  <div className="activity-item">
                    <div className="activity-icon" style={{ color: '#3b82f6' }}><Target size={20} /></div>
                    <div className="activity-details">
                      <h4>Planned {recentActivity.activity.activityName}</h4>
                      <p>{formatDate(recentActivity.activity.createdAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* EDIT PROFILE */}
          <div className="profile-edit-section glass-panel" style={{ padding: '2rem' }}>
            <h2 className="profile-section-title">Edit Details</h2>
            <form onSubmit={handleSaveProfile}>
              <div className="profile-form-group">
                <label>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--color-text-muted)' }} />
                  <input 
                    type="text" 
                    name="name"
                    className="profile-input" 
                    style={{ paddingLeft: '2.5rem' }}
                    value={profileData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>Username</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--color-text-muted)' }} />
                  <input 
                    type="text" 
                    className="profile-input" 
                    style={{ paddingLeft: '2.5rem' }}
                    value={profileData.username}
                    disabled
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--color-text-muted)' }} />
                  <input 
                    type="text" 
                    name="mobileNumber"
                    className="profile-input" 
                    style={{ paddingLeft: '2.5rem' }}
                    value={profileData.mobileNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="create-trip-btn" 
                style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Profile;
