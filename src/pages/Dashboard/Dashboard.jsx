import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import { PlaneTakeoff, Wallet, Calendar, Plus, MapPin, Image as ImageIcon, Target, RefreshCw, Quote, TrendingUp, Lightbulb, Compass, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Services
import tripService from '../../services/tripService';
import expenseService from '../../services/expenseService';
import memoryService from '../../services/memoryService';
import activityService from '../../services/activityService';
import analyticsService from '../../services/analyticsService';

import './Dashboard.css';

const TRAVEL_QUOTES = [
  { text: "The world is a book, and those who do not travel read only one page.", author: "Saint Augustine" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "Travel is the only thing you buy that makes you richer.", author: "Anonymous" },
  { text: "Life is short and the world is wide.", author: "Simon Raven" },
  { text: "Collect moments, not things.", author: "Aarti Khurana" },
  { text: "To travel is to discover that everyone is wrong about other countries.", author: "Aldous Huxley" }
];

const COLORS = ['#14b8a6', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
    remainingBudget: 0,
    totalMemories: 0,
    totalActivities: 0
  });

  const [analytics, setAnalytics] = useState({
    expensesByCategory: [],
    topDestinations: [],
    tripsByMonth: []
  });

  const [tripHighlights, setTripHighlights] = useState([]);
  const [recentActivity, setRecentActivity] = useState({
    trip: null,
    expense: null,
    memory: null,
    activity: null
  });

  const [randomQuote, setRandomQuote] = useState(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * TRAVEL_QUOTES.length);
    setRandomQuote(TRAVEL_QUOTES[randomIndex]);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Aggregated Statistics
      const [
        summary,
        expensesByCategory,
        topDestinations,
        tripsByMonth,
        trips
      ] = await Promise.all([
        analyticsService.getDashboardSummary(),
        analyticsService.getExpensesByCategory(),
        analyticsService.getTopDestinations(),
        analyticsService.getTripsByMonth(),
        tripService.getTrips()
      ]);

      setStats(summary);
      setAnalytics({
        expensesByCategory,
        topDestinations,
        tripsByMonth
      });

      // 2. Process Trip Highlights (Client-side fast sort for display)
      const sortedTrips = [...trips].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // We map the trips to include an estimated 'totalExpenses' if we don't want to query all of them again.
      // Since we removed manual calculation, we'll fetch only for the top 3 highlights to keep it fast
      const topTrips = sortedTrips.slice(0, 3);
      
      const tripsWithExpenses = await Promise.all(
        topTrips.map(async (trip) => {
          try {
            const exps = await expenseService.getExpensesByTrip(trip._id);
            const tripExpenses = exps.reduce((sum, e) => sum + (e.amount || 0), 0);
            return { ...trip, totalExpenses: tripExpenses };
          } catch {
            return { ...trip, totalExpenses: 0 };
          }
        })
      );
      
      setTripHighlights(tripsWithExpenses);

      // 3. Fetch Recent Activity asynchronously in background so we don't block the UI
      fetchRecentActivity(sortedTrips);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Could not load dashboard statistics. Please try refreshing.');
      setIsLoading(false);
    }
  };

  const fetchRecentActivity = async (sortedTrips) => {
    try {
      // For recent activity we just need the latest 1 item across collections.
      // Since backend doesn't have a "get recent" yet, we'll gracefully fallback 
      // or fetch the latest if possible. For simplicity we'll just check the first trip's items.
      if (sortedTrips.length > 0) {
        const latestTrip = sortedTrips[0];
        
        const [exps, mems, acts] = await Promise.allSettled([
          expenseService.getExpensesByTrip(latestTrip._id),
          memoryService.getMemoriesByTrip(latestTrip._id),
          activityService.getActivitiesByTrip(latestTrip._id)
        ]);

        let recentExp = null;
        if (exps.status === 'fulfilled' && exps.value.length > 0) {
           exps.value.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
           recentExp = exps.value[0];
        }

        let recentMem = null;
        if (mems.status === 'fulfilled' && mems.value.length > 0) {
           mems.value.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
           recentMem = mems.value[0];
        }

        let recentAct = null;
        if (acts.status === 'fulfilled' && acts.value.length > 0) {
           acts.value.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
           recentAct = acts.value[0];
        }

        setRecentActivity({
          trip: latestTrip,
          expense: recentExp,
          memory: recentMem,
          activity: recentAct
        });
      }
    } catch (err) {
      console.error('Recent activity fetch failed:', err);
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

  // Generate dynamic insights
  const generateInsights = () => {
    const insights = [];
    if (analytics.expensesByCategory.length > 0) {
      insights.push(`Your highest spending category is ${analytics.expensesByCategory[0].name}, totaling ${formatCurrency(analytics.expensesByCategory[0].value)}.`);
    }
    if (analytics.topDestinations.length > 0) {
      insights.push(`You have visited ${analytics.topDestinations[0].destination} the most (${analytics.topDestinations[0].count} times).`);
    }
    if (analytics.tripsByMonth.length > 0) {
      const highestMonth = [...analytics.tripsByMonth].sort((a,b) => b.trips - a.trips)[0];
      insights.push(`Your busiest travel period was ${highestMonth.name} with ${highestMonth.trips} trips.`);
    }
    return insights;
  };

  // Generate dynamic recommendations
  const generateRecommendations = () => {
    const recs = [];
    if (stats.remainingBudget < 0) {
      recs.push("You have exceeded your total budget. Consider setting stricter limits on daily expenses for upcoming trips.");
    } else if (stats.remainingBudget > 0) {
      recs.push(`You have ${formatCurrency(stats.remainingBudget)} remaining in your total budget! Time to plan your next adventure?`);
    }
    
    if (stats.totalMemories < stats.totalTrips) {
      recs.push("You haven't logged memories for all your trips. Make sure to capture those moments!");
    } else {
      recs.push("Great job preserving your travels! Keep uploading photos to your memories.");
    }
    return recs;
  };

  const insightsList = generateInsights();
  const recommendationsList = generateRecommendations();
  const hasAnyActivity = recentActivity.trip || recentActivity.expense || recentActivity.memory || recentActivity.activity;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '10px', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: '#f8fafc', fontWeight: '600' }}>{payload[0].name || label}</p>
          <p style={{ margin: 0, color: payload[0].payload.fill || '#14b8a6' }}>
            {payload[0].name ? formatCurrency(payload[0].value) : `${payload[0].value} Trips`}
          </p>
        </div>
      );
    }
    return null;
  };

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
        
        {/* HERO SECTION WITH AGGREGATED STATS */}
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
          
          <div className="dashboard-main-column">
            {/* TRIP HIGHLIGHTS */}
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

            {/* TRAVEL ANALYTICS CHARTS */}
            {stats.totalTrips > 0 && (
              <section className="dash-section">
                <h2 className="dash-section-title">Travel Analytics</h2>
                <div className="analytics-charts-grid">
                  
                  {/* EXPENSES BY CATEGORY CHART */}
                  <div className="chart-card glass-panel">
                    <div className="chart-header">
                      <PieChartIcon size={20} className="chart-icon text-gradient" />
                      <h3>Expenses by Category</h3>
                    </div>
                    {analytics.expensesByCategory.length > 0 ? (
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={analytics.expensesByCategory}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {analytics.expensesByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="chart-empty">No expense data available</div>
                    )}
                  </div>

                  {/* TRIPS BY MONTH CHART */}
                  <div className="chart-card glass-panel">
                    <div className="chart-header">
                      <BarChart2 size={20} className="chart-icon text-gradient" />
                      <h3>Trips over Time</h3>
                    </div>
                    {analytics.tripsByMonth.length > 0 ? (
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={analytics.tripsByMonth}>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                            <Bar dataKey="trips" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="chart-empty">No trip history available</div>
                    )}
                  </div>

                </div>
              </section>
            )}

          </div>

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

            {/* AI TRAVEL INSIGHTS */}
            {insightsList.length > 0 && (
              <section className="dash-section">
                <h2 className="dash-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={20} className="text-gradient" /> Travel Insights
                </h2>
                <div className="insights-container glass-panel">
                  {insightsList.map((insight, idx) => (
                    <div key={idx} className="insight-item">
                      <Lightbulb size={16} className="insight-icon" />
                      <p>{insight}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* RECOMMENDATIONS */}
            {stats.totalTrips > 0 && (
              <section className="dash-section">
                <h2 className="dash-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Compass size={20} className="text-gradient" /> Recommendations
                </h2>
                <div className="recommendations-container glass-panel">
                  {recommendationsList.map((rec, idx) => (
                    <div key={idx} className="recommendation-item">
                      <div className="rec-bullet"></div>
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

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
                        <h5>Memory in {recentActivity.memory.location || 'Trip'}</h5>
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
