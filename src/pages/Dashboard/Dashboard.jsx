import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import { PlaneTakeoff, Wallet, Calendar, Plus, Eye, User, MapPin, Image as ImageIcon, Target, RefreshCw, Quote } from 'lucide-react';

// Services
import tripService from '../../services/tripService';
import expenseService from '../../services/expenseService';
import memoryService from '../../services/memoryService';
import activityService from '../../services/activityService';

import './Dashboard.css';

const TRAVEL_QUOTES = [
  { text: "The world is a book, and those who do not travel read only one page.", author: "Saint Augustine" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "Travel is the only thing you buy that makes you richer.", author: "Anonymous" },
  { text: "Life is short and the world is wide.", author: "Simon Raven" },
  { text: "Collect moments, not things.", author: "Aarti Khurana" },
  { text: "To travel is to discover that everyone is wrong about other countries.", author: "Aldous Huxley" },
  { text: "Investment in travel is an investment in yourself.", author: "Matthew Karsten" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Wherever you go, go with all your heart.", author: "Confucius" },
  { text: "The journey not the arrival matters.", author: "T.S. Eliot" },
  { text: "Take only memories, leave only footprints.", author: "Chief Seattle" },
  { text: "Travel makes one modest. You see what a tiny place you occupy in the world.", author: "Gustave Flaubert" }
];

function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalTrips: 0,
    upcomingTrips: 0,
    totalBudget: 0,
    totalExpenses: 0,
    remainingBudget: 0
  });

  const [tripHighlights, setTripHighlights] = useState([]);
  const [recentActivity, setRecentActivity] = useState({
    trip: null,
    expense: null,
    memory: null,
    activity: null
  });

  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [randomQuote, setRandomQuote] = useState(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * TRAVEL_QUOTES.length);
    setRandomQuote(TRAVEL_QUOTES[randomIndex]);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setIsStatsLoading(true);
    setError(null);
    try {
      const trips = await tripService.getTrips();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let upcoming = 0;
      let totalBudgetCalc = 0;

      trips.forEach(trip => {
        totalBudgetCalc += (trip.budget || 0);
        const startDate = new Date(trip.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (startDate > today) {
          upcoming++;
        }
      });

      // 1. Immediately set base stats and UNBLOCK the UI
      setStats(prev => ({
        ...prev,
        totalTrips: trips.length,
        upcomingTrips: upcoming,
        totalBudget: totalBudgetCalc,
      }));

      // Find recents by sorting descending
      const sortedTrips = [...trips].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setTripHighlights(sortedTrips.slice(0, 3));
      setRecentActivity(prev => ({ ...prev, trip: sortedTrips[0] || null }));
      
      setIsLoading(false); // Unblock screen render!

      // 2. Fetch heavy data asynchronously in the background
      fetchHeavyStats(trips, totalBudgetCalc, sortedTrips);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Could not load dashboard statistics. Please try refreshing.');
      setIsLoading(false);
      setIsStatsLoading(false);
    }
  };

  const fetchHeavyStats = async (trips, totalBudgetCalc, sortedTrips) => {
    try {
      const expensePromises = trips.map(trip => expenseService.getExpensesByTrip(trip._id));
      const memoryPromises = trips.map(trip => memoryService.getMemoriesByTrip(trip._id));
      const activityPromises = trips.map(trip => activityService.getActivitiesByTrip(trip._id));

      const expenseResults = await Promise.allSettled(expensePromises);
      const memoryResults = await Promise.allSettled(memoryPromises);
      const activityResults = await Promise.allSettled(activityPromises);

      let allExpenses = [];
      let totalExpensesCalc = 0;

      // Associate expenses with trips for highlights
      const tripsWithExpenses = trips.map((trip, index) => {
        let tripExpenses = 0;
        if (expenseResults[index].status === 'fulfilled') {
          const exps = expenseResults[index].value;
          allExpenses.push(...exps);
          tripExpenses = exps.reduce((sum, e) => sum + (e.amount || 0), 0);
        }
        totalExpensesCalc += tripExpenses;
        return { ...trip, totalExpenses: tripExpenses };
      });

      let allMemories = [];
      memoryResults.forEach(res => {
        if (res.status === 'fulfilled') allMemories.push(...res.value);
      });

      let allActivities = [];
      activityResults.forEach(res => {
        if (res.status === 'fulfilled') allActivities.push(...res.value);
      });

      setStats(prev => ({
        ...prev,
        totalExpenses: totalExpensesCalc,
        remainingBudget: totalBudgetCalc - totalExpensesCalc
      }));

      // Sort for highlights (recent first)
      const finalHighlights = [...tripsWithExpenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTripHighlights(finalHighlights.slice(0, 3));

      allExpenses.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      allMemories.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      allActivities.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

      setRecentActivity({
        trip: sortedTrips[0] || null,
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const hasAnyActivity = recentActivity.trip || recentActivity.expense || recentActivity.memory || recentActivity.activity;

  if (isLoading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="page-loader">
            <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p>Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <main className="dashboard-main">
        
        {/* HERO SECTION WITH COMPACT STATS */}
        <div className="dashboard-hero glass-panel">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome back, <span className="text-gradient">{currentUser?.name?.split(' ')[0] || 'Traveler'}</span>
            </h1>
            <p className="hero-subtitle">Here is your travel summary at a glance.</p>
            
            <div className="hero-quick-stats">
              <div className="hq-stat">
                <span className="hq-label">Total Trips</span>
                <span className="hq-value">{stats.totalTrips}</span>
              </div>
              <div className="hq-stat">
                <span className="hq-label">Upcoming</span>
                <span className="hq-value">{stats.upcomingTrips}</span>
              </div>
              <div className="hq-stat">
                <span className="hq-label">Total Budget</span>
                <span className="hq-value">{formatCurrency(stats.totalBudget)}</span>
              </div>
              <div className="hq-stat">
                <span className="hq-label">Remaining</span>
                <span className="hq-value" style={{ color: stats.remainingBudget < 0 ? '#ef4444' : 'var(--color-primary)' }}>
                  {formatCurrency(stats.remainingBudget)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="form-global-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <div className="dashboard-content-grid">
          
          {/* TRIP HIGHLIGHTS - PRIMARY FOCUS */}
          <div className="dashboard-main-column">
            <section className="dash-section">
              <div className="dash-section-header">
                <h2 className="dash-section-title">Trip Highlights</h2>
                <button className="view-all-btn" onClick={() => navigate('/trips')}>View All Trips</button>
              </div>
              
              {tripHighlights.length === 0 ? (
                <div className="dash-empty-state glass-panel">
                  <PlaneTakeoff size={48} className="empty-icon" />
                  <h3>No trips found</h3>
                  <p>Ready to explore? Start planning your next adventure today.</p>
                  <button className="create-trip-btn" onClick={() => navigate('/trips/create')} style={{ marginTop: '1rem' }}>
                    Create First Trip
                  </button>
                </div>
              ) : (
                <div className="trip-highlights-expanded">
                  {tripHighlights.map(trip => {
                    const budgetPercent = trip.budget > 0 ? Math.min((trip.totalExpenses / trip.budget) * 100, 100) : 0;
                    return (
                      <div key={trip._id} className="highlight-card-expanded glass-panel">
                        <div className="hc-header">
                          <div className="hc-title-area">
                            <h3>{trip.tripName}</h3>
                            <p className="hc-route"><MapPin size={16} /> {trip.destination}</p>
                          </div>
                          <button className="action-btn-outline" onClick={() => navigate(`/trips/${trip._id}`)}>
                            View Planner
                          </button>
                        </div>
                        
                        <div className="hc-dates">
                          <Calendar size={16} /> {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </div>

                        <div className="hc-finances">
                          <div className="hc-finances-text">
                            <div className="hc-f-block">
                              <span>Budget</span>
                              <strong>{formatCurrency(trip.budget)}</strong>
                            </div>
                            <div className="hc-f-block">
                              <span>Spent</span>
                              <strong style={{ color: trip.totalExpenses > trip.budget ? '#ef4444' : 'var(--color-primary)' }}>
                                {formatCurrency(trip.totalExpenses)}
                              </strong>
                            </div>
                          </div>
                          <div className="hc-progress-bg">
                            <div 
                              className="hc-progress-fill" 
                              style={{ 
                                width: `${budgetPercent}%`,
                                backgroundColor: trip.totalExpenses > trip.budget ? '#ef4444' : 'var(--color-primary)' 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* TRAVEL INSPIRATION */}
            {randomQuote && (
              <section className="dash-quote-card" style={{ marginTop: '2rem' }}>
                <div className="dash-quote-bg-icon">
                  <Quote size={180} />
                </div>
                <div className="dash-quote-content">
                  <div className="dash-quote-header">
                    <Quote size={20} className="quote-accent" />
                    <span>Travel Inspiration</span>
                  </div>
                  <blockquote>"{randomQuote.text}"</blockquote>
                  <div className="dash-quote-author">
                    <div className="author-line"></div>
                    <cite>{randomQuote.author}</cite>
                  </div>
                </div>
              </section>
            )}

          </div>

          {/* SIDEBAR COLUMN: RECENT ACTIVITY & QUICK ACTIONS */}
          <div className="dashboard-side-column">
            
            {/* QUICK ACTIONS */}
            <section className="dash-section">
              <h2 className="dash-section-title">Quick Actions</h2>
              <div className="qa-compact-grid">
                <button className="qa-btn glass-panel" onClick={() => navigate('/trips/create')}>
                  <div className="qa-icon"><Plus size={18} /></div>
                  <span>Create Trip</span>
                </button>
                <button className="qa-btn glass-panel" onClick={() => fetchDashboardData()}>
                  <div className="qa-icon"><RefreshCw size={18} /></div>
                  <span>Refresh</span>
                </button>
              </div>
            </section>

            {/* RECENT ACTIVITY */}
            <section className="dash-section">
              <h2 className="dash-section-title">Recent Activity</h2>
              
              {!hasAnyActivity ? (
                <div className="dash-empty-state glass-panel" style={{ padding: '2rem 1rem' }}>
                  <MapPin size={40} className="empty-icon" />
                  <h4>No activity yet</h4>
                  <p>Your latest travel updates will appear here.</p>
                </div>
              ) : (
                <div className="dash-activity-list">
                  {recentActivity.trip && (
                    <div className="dash-activity-item glass-panel">
                      <div className="dash-act-icon" style={{ color: 'var(--color-primary)' }}><PlaneTakeoff size={18} /></div>
                      <div className="dash-act-details">
                        <h5>New trip to {recentActivity.trip.destination}</h5>
                        <span>{formatDate(recentActivity.trip.createdAt)}</span>
                      </div>
                    </div>
                  )}
                  {recentActivity.expense && (
                    <div className="dash-activity-item glass-panel">
                      <div className="dash-act-icon" style={{ color: '#ef4444' }}><Wallet size={18} /></div>
                      <div className="dash-act-details">
                        <h5>Logged {formatCurrency(recentActivity.expense.amount)}</h5>
                        <span>{formatDate(recentActivity.expense.createdAt)}</span>
                      </div>
                    </div>
                  )}
                  {recentActivity.memory && (
                    <div className="dash-activity-item glass-panel">
                      <div className="dash-act-icon" style={{ color: '#a855f7' }}><ImageIcon size={18} /></div>
                      <div className="dash-act-details">
                        <h5>Memory in {recentActivity.memory.location}</h5>
                        <span>{formatDate(recentActivity.memory.createdAt)}</span>
                      </div>
                    </div>
                  )}
                  {recentActivity.activity && (
                    <div className="dash-activity-item glass-panel">
                      <div className="dash-act-icon" style={{ color: '#3b82f6' }}><Target size={18} /></div>
                      <div className="dash-act-details">
                        <h5>Planned {recentActivity.activity.activityName}</h5>
                        <span>{formatDate(recentActivity.activity.createdAt)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
