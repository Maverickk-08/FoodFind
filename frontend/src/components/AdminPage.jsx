import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Utensils, 
  Star, 
  MapPin, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  Clock,
  Phone,
  Flame,
  Sparkles,
  RefreshCw,
  BarChart3,
  Users,
  Eye,
  TrendingUp,
  Sliders,
  DollarSign,
  Tag,
  ChevronRight,
  X,
  Camera,
  Link as LinkIcon
} from 'lucide-react';
import { apiUrl } from '../config/api.js';
import MenuScannerModal from './MenuScannerModal.jsx';

const PRESET_HUBS = [
  // Visakhapatnam (Vizag) Hubs
  { name: 'Siripuram', lat: 17.7214, lng: 83.3156 },
  { name: 'MVP Colony', lat: 17.7412, lng: 83.3341 },
  { name: 'Jagadamba Junction', lat: 17.7126, lng: 83.3006 },
  { name: 'Rushikonda Beach', lat: 17.7820, lng: 83.3852 },
  { name: 'Gajuwaka', lat: 17.6905, lng: 83.2095 },

  // Hyderabad Hubs
  { name: 'KPHB Colony', lat: 17.4933, lng: 78.3914 },
  { name: 'Madhapur', lat: 17.4483, lng: 78.3915 },
  { name: 'Hitec City', lat: 17.4435, lng: 78.3772 },
  { name: 'Gachibowli', lat: 17.4401, lng: 78.3489 },
  { name: 'Jubilee Hills', lat: 17.4319, lng: 78.4073 },
  { name: 'Banjara Hills', lat: 17.4156, lng: 78.4357 }
];

export default function AdminPage({ onExitToCustomerApp, onDataChanged }) {
  const [token, setToken] = useState(() => localStorage.getItem('foodfind_admin_token') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login Form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState('ANALYTICS'); // 'ANALYTICS' | 'RESTAURANTS' | 'MENU_ITEMS'

  // Data states
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [foodTypeFilter, setFoodTypeFilter] = useState('ALL');

  // Analytics Stats
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Sub-modal states
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [editingRestaurantId, setEditingRestaurantId] = useState(null);
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    cuisine: '',
    address: '',
    area: 'KPHB Colony',
    latitude: 17.4933,
    longitude: 78.3914,
    rating: 4.3,
    reviewCount: 450,
    priceRange: '₹₹',
    isTrending: false,
    isHiddenGem: false,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    openingHours: '11:00 AM - 11:00 PM',
    phone: '+91 98480 99999',
    description: 'Famous local restaurant with delicious specialties.'
  });

  const [showDishForm, setShowDishForm] = useState(false);
  const [editingDishId, setEditingDishId] = useState(null);
  const [dishForm, setDishForm] = useState({
    name: '',
    description: 'Fresh ingredients cooked with authentic spices.',
    price: 180,
    foodType: 'NON_VEG',
    category: 'MAIN',
    spiceLevel: 'SPICY',
    servingCapacity: 1.0,
    isPopular: false,
    isSignature: false,
    tags: 'Spicy, Hot',
    imageUrl: ''
  });

  const [showScannerModal, setShowScannerModal] = useState(false);

  // Verify auth on mount
  useEffect(() => {
    if (!token) {
      setCheckingAuth(false);
      setIsLoggedIn(false);
      return;
    }

    fetch(apiUrl('/api/admin/verify'), {
      headers: { 'X-Admin-Token': token }
    })
      .then(res => {
        if (res.ok) {
          setIsLoggedIn(true);
          setSessionExpired(false);
        } else {
          localStorage.removeItem('foodfind_admin_token');
          setToken('');
          setIsLoggedIn(false);
          setSessionExpired(true); // show "session expired" on login page
        }
      })
      .catch(() => setIsLoggedIn(false))
      .finally(() => setCheckingAuth(false));
  }, [token]);

  // Fetch data
  const fetchData = useCallback(() => {
    if (!token) return;
    setLoadingData(true);

    fetch(apiUrl('/api/admin/restaurants'), {
      headers: { 'X-Admin-Token': token }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRestaurants(data);
          if (!selectedRestaurant && data.length > 0) {
            setSelectedRestaurant(data[0]);
          } else if (selectedRestaurant) {
            const updated = data.find(r => r.id === selectedRestaurant.id);
            if (updated) setSelectedRestaurant(updated);
          }
        }
      })
      .catch(err => console.error("Error loading restaurants:", err))
      .finally(() => setLoadingData(false));
  }, [token, selectedRestaurant]);

  // Fetch Analytics Stats
  const fetchAnalytics = useCallback(() => {
    if (!token) return;
    setLoadingAnalytics(true);
    fetch(apiUrl('/api/admin/analytics/stats'), {
      headers: { 'X-Admin-Token': token }
    })
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error("Error loading analytics:", err))
      .finally(() => setLoadingAnalytics(false));
  }, [token]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
      fetchAnalytics();
    }
  }, [isLoggedIn]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('foodfind_admin_token', data.token);
        setToken(data.token);
        setIsLoggedIn(true);
      } else {
        setLoginError(data.message || 'Invalid admin credentials');
      }
    } catch (err) {
      setLoginError('Could not connect to backend server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout — invalidates the session on the server too
  const handleLogout = async () => {
    try {
      await fetch(apiUrl('/api/admin/logout'), {
        method: 'POST',
        headers: { 'X-Admin-Token': token }
      });
    } catch (_) { /* best-effort */ }
    localStorage.removeItem('foodfind_admin_token');
    setToken('');
    setIsLoggedIn(false);
    setSessionExpired(false);
  };

  // Restaurant CRUD Handlers
  const handleOpenAddRestaurant = () => {
    setEditingRestaurantId(null);
    setRestaurantForm({
      name: '',
      cuisine: 'Biryani, North Indian, Chinese',
      address: 'Road No 1, KPHB',
      area: 'KPHB Colony',
      latitude: 17.4933,
      longitude: 78.3914,
      rating: 4.3,
      reviewCount: 350,
      priceRange: '₹₹',
      isTrending: false,
      isHiddenGem: false,
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
      openingHours: '11:00 AM - 11:00 PM',
      phone: '+91 98480 12345',
      description: 'Popular spot known for great food and quick service.'
    });
    setShowRestaurantForm(true);
  };

  const handleOpenEditRestaurant = (r) => {
    setEditingRestaurantId(r.id);
    setRestaurantForm({
      name: r.name || '',
      cuisine: r.cuisine || '',
      address: r.address || '',
      area: r.area || 'KPHB Colony',
      latitude: r.latitude || 17.4933,
      longitude: r.longitude || 78.3914,
      rating: r.rating || 4.0,
      reviewCount: r.reviewCount || 100,
      priceRange: r.priceRange || '₹₹',
      isTrending: !!r.isTrending,
      isHiddenGem: !!r.isHiddenGem,
      imageUrl: r.imageUrl || '',
      openingHours: r.openingHours || '11:00 AM - 11:00 PM',
      phone: r.phone || '',
      description: r.description || ''
    });
    setShowRestaurantForm(true);
  };

  const handleSaveRestaurant = async (e) => {
    e.preventDefault();
    const endpoint = editingRestaurantId 
      ? apiUrl(`/api/admin/restaurants/${editingRestaurantId}`)
      : apiUrl('/api/admin/restaurants');
    const method = editingRestaurantId ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token
        },
        body: JSON.stringify(restaurantForm)
      });

      if (res.ok) {
        setShowRestaurantForm(false);
        fetchData();
        fetchAnalytics();
        if (onDataChanged) onDataChanged();
      } else {
        alert("Failed to save restaurant.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteRestaurant = async (id, name) => {
    if (!window.confirm(`Delete restaurant "${name}" and all its dishes?`)) return;

    try {
      const res = await fetch(apiUrl(`/api/admin/restaurants/${id}`), {
        method: 'DELETE',
        headers: { 'X-Admin-Token': token }
      });

      if (res.ok) {
        fetchData();
        fetchAnalytics();
        if (selectedRestaurant?.id === id) {
          setSelectedRestaurant(null);
        }
        if (onDataChanged) onDataChanged();
      } else {
        alert("Failed to delete restaurant.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Dish CRUD Handlers
  const handleOpenAddDish = (r) => {
    if (r) setSelectedRestaurant(r);
    setEditingDishId(null);
    setDishForm({
      name: '',
      description: 'Cooked with fresh ingredients and secret spices.',
      price: 220,
      foodType: 'NON_VEG',
      category: 'MAIN',
      spiceLevel: 'SPICY',
      servingCapacity: 1.0,
      isPopular: false,
      isSignature: false,
      tags: 'Delicious, Chef Special',
      imageUrl: ''
    });
    setShowDishForm(true);
  };

  const handleOpenEditDish = (d) => {
    setEditingDishId(d.id);
    setDishForm({
      name: d.name || '',
      description: d.description || '',
      price: d.price || 100,
      foodType: d.foodType || 'NON_VEG',
      category: d.category || 'MAIN',
      spiceLevel: d.spiceLevel || 'MEDIUM',
      servingCapacity: d.servingCapacity || 1.0,
      isPopular: !!d.isPopular,
      isSignature: !!d.isSignature,
      tags: d.tags || '',
      imageUrl: d.imageUrl || ''
    });
    setShowDishForm(true);
  };

  const handleSaveDish = async (e) => {
    e.preventDefault();
    if (!selectedRestaurant) return;

    const endpoint = editingDishId
      ? apiUrl(`/api/admin/menu-items/${editingDishId}`)
      : apiUrl(`/api/admin/restaurants/${selectedRestaurant.id}/menu`);
    const method = editingDishId ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token
        },
        body: JSON.stringify(dishForm)
      });

      if (res.ok) {
        setShowDishForm(false);
        fetchData();
        fetchAnalytics();
        if (onDataChanged) onDataChanged();
      } else {
        alert("Failed to save menu item.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteDish = async (dishId, dishName) => {
    if (!window.confirm(`Delete dish "${dishName}"?`)) return;

    try {
      const res = await fetch(apiUrl(`/api/admin/menu-items/${dishId}`), {
        method: 'DELETE',
        headers: { 'X-Admin-Token': token }
      });

      if (res.ok) {
        fetchData();
        fetchAnalytics();
        if (onDataChanged) onDataChanged();
      } else {
        alert("Failed to delete dish.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Filtered restaurants
  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.cuisine && r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.area && r.area.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filtered dishes
  const filteredDishes = (selectedRestaurant?.menuItems || []).filter(dish => {
    const matchesCategory = categoryFilter === 'ALL' || dish.category === categoryFilter;
    const matchesType = foodTypeFilter === 'ALL' || dish.foodType === foodTypeFilter;
    return matchesCategory && matchesType;
  });

  return (
    <div className="admin-page-root animate-fade-in">
      {checkingAuth ? (
        <div className="admin-page-loader">
          <RefreshCw size={32} className="spin-icon text-primary" />
          <p>Verifying Admin Privileges...</p>
        </div>
      ) : !isLoggedIn ? (
        /* ================= 1. DEDICATED LOGIN SCREEN ================= */
        <div className="admin-login-screen">
          <div className="admin-login-top-bar">
            <button onClick={onExitToCustomerApp} className="btn-secondary admin-exit-btn">
              <ArrowLeft size={16} />
              <span>Back to FoodFind Dining App</span>
            </button>
          </div>

          <div className="admin-login-box">
            <div className="admin-login-badge">
              <ShieldCheck size={40} className="text-primary" />
            </div>
            <h2>FoodFind Admin Portal</h2>
            <p>Full-screen management for restaurants, menus, portions, and traffic analytics.</p>

            {sessionExpired && (
              <div className="admin-error-banner" style={{ background: 'rgba(251,146,60,0.15)', borderColor: 'rgba(251,146,60,0.4)' }}>
                <AlertCircle size={18} style={{ color: '#fb923c' }} />
                <span style={{ color: '#fb923c' }}>Your session expired after 8 hours. Please log in again.</span>
              </div>
            )}

            {loginError && (
              <div className="admin-error-banner">
                <AlertCircle size={18} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="admin-login-form">
              <div className="admin-input-group">
                <label>Admin Username</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  required 
                  className="admin-input"
                />
              </div>

              <div className="admin-input-group">
                <label>Admin Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="admin-input"
                />
              </div>

              <div className="admin-credentials-hint">
                <span>Default credentials: <code>admin</code> / <code>admin123</code></span>
              </div>

              <button type="submit" disabled={isLoggingIn} className="btn-primary admin-submit-btn">
                {isLoggingIn ? <RefreshCw size={18} className="spin-icon" /> : <LogIn size={18} />}
                <span>{isLoggingIn ? "Authenticating..." : "Sign In to Admin Portal"}</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* ================= 2. FULL-PAGE ADMIN DASHBOARD ================= */
        <div className="admin-portal-layout">
          {/* Top Bar */}
          <header className="admin-top-navbar">
            <div className="admin-brand-group">
              <div className="admin-logo-icon">
                <ShieldCheck size={22} className="text-primary" />
              </div>
              <div>
                <h1 className="admin-brand-title">FoodFind <span>Admin</span></h1>
                <span className="admin-subtag">Control Center & Traffic Intelligence</span>
              </div>
            </div>

            <div className="admin-top-actions">
              <button 
                onClick={onExitToCustomerApp} 
                className="btn-primary admin-exit-to-app-btn"
                title="Return to public food discovery app"
              >
                <Eye size={16} />
                <span>Exit to Customer App</span>
              </button>

              <button 
                onClick={() => { fetchData(); fetchAnalytics(); }} 
                className="btn-secondary admin-round-btn"
                title="Refresh All Data"
              >
                <RefreshCw size={16} className={loadingData || loadingAnalytics ? "spin-icon" : ""} />
              </button>

              <button 
                onClick={handleLogout} 
                className="btn-secondary admin-round-btn danger"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          <div className="admin-body-container">
            {/* Left Sidebar Navigation */}
            <aside className="admin-sidebar">
              <nav className="admin-nav-list">
                <button 
                  className={`admin-nav-item ${activeTab === 'ANALYTICS' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ANALYTICS')}
                >
                  <BarChart3 size={18} />
                  <span>Overview & Analytics</span>
                </button>

                <button 
                  className={`admin-nav-item ${activeTab === 'RESTAURANTS' ? 'active' : ''}`}
                  onClick={() => setActiveTab('RESTAURANTS')}
                >
                  <Utensils size={18} />
                  <span>Restaurants ({restaurants.length})</span>
                </button>

                <button 
                  className={`admin-nav-item ${activeTab === 'MENU_ITEMS' ? 'active' : ''}`}
                  onClick={() => setActiveTab('MENU_ITEMS')}
                >
                  <Tag size={18} />
                  <span>Menu Dishes ({selectedRestaurant?.menuItems?.length || 0})</span>
                </button>
              </nav>

              {/* Quick Info Box in Sidebar */}
              <div className="admin-sidebar-status-box">
                <span className="status-dot green"></span>
                <div>
                  <strong>Backend Live</strong>
                  <p>Connected to Render Engine</p>
                </div>
              </div>
            </aside>

            {/* Main Admin Workspace Area */}
            <main className="admin-main-workspace">
              {/* ================= VIEW 1: ANALYTICS & OVERVIEW ================= */}
              {activeTab === 'ANALYTICS' && (
                <div className="admin-analytics-view animate-fade-in">
                  <div className="admin-section-header">
                    <div>
                      <h2>Platform Traffic & Metrics</h2>
                      <p>Live user engagement, searches conducted, and dining hub popularity.</p>
                    </div>
                  </div>

                  {/* 6 Key Performance Indicator Cards */}
                  <div className="admin-kpi-grid">
                    <div className="admin-kpi-card">
                      <div className="kpi-icon-box blue">
                        <Eye size={22} />
                      </div>
                      <div className="kpi-content">
                        <span className="kpi-label">Total Visits / Page Views</span>
                        <h3 className="kpi-value">{analytics?.totalPageViews || 0}</h3>
                        <span className="kpi-sub">Total page visits logged</span>
                      </div>
                    </div>

                    <div className="admin-kpi-card">
                      <div className="kpi-icon-box purple">
                        <Users size={22} />
                      </div>
                      <div className="kpi-content">
                        <span className="kpi-label">Unique User Sessions</span>
                        <h3 className="kpi-value">{analytics?.totalUniqueSessions || 0}</h3>
                        <span className="kpi-sub">Distinct active user devices</span>
                      </div>
                    </div>

                    <div className="admin-kpi-card">
                      <div className="kpi-icon-box orange">
                        <Sparkles size={22} />
                      </div>
                      <div className="kpi-content">
                        <span className="kpi-label">Recommendation Searches</span>
                        <h3 className="kpi-value">{analytics?.totalSearches || 0}</h3>
                        <span className="kpi-sub">Group queries parsed</span>
                      </div>
                    </div>

                    <div className="admin-kpi-card">
                      <div className="kpi-icon-box emerald">
                        <Utensils size={22} />
                      </div>
                      <div className="kpi-content">
                        <span className="kpi-label">Active Restaurants</span>
                        <h3 className="kpi-value">{restaurants.length}</h3>
                        <span className="kpi-sub">Seeded & Admin restaurants</span>
                      </div>
                    </div>

                    <div className="admin-kpi-card">
                      <div className="kpi-icon-box cyan">
                        <Sliders size={22} />
                      </div>
                      <div className="kpi-content">
                        <span className="kpi-label">Combos Tweaked</span>
                        <h3 className="kpi-value">{analytics?.totalComboTweaks || 0}</h3>
                        <span className="kpi-sub">Interactions with portion steppers</span>
                      </div>
                    </div>

                    <div className="admin-kpi-card">
                      <div className="kpi-icon-box green">
                        <DollarSign size={22} />
                      </div>
                      <div className="kpi-content">
                        <span className="kpi-label">Bill Splits & UPI Scans</span>
                        <h3 className="kpi-value">{analytics?.totalBillSplits || 0}</h3>
                        <span className="kpi-sub">Group calculations performed</span>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Visual Breakdown Columns */}
                  <div className="admin-analytics-columns">
                    {/* Top Visited Areas */}
                    <div className="admin-chart-card">
                      <div className="chart-card-header">
                        <MapPin size={18} className="text-primary" />
                        <h3>Top Dining Hubs by User Demand</h3>
                      </div>
                      <div className="top-areas-list">
                        {(!analytics?.topAreas || analytics.topAreas.length === 0) ? (
                          <p className="empty-text">No location data logged yet. Traffic will appear as users browse.</p>
                        ) : (
                          analytics.topAreas.map((item, idx) => {
                            const max = analytics.topAreas[0]?.count || 1;
                            const percent = Math.round((item.count / max) * 100);
                            return (
                              <div key={idx} className="area-stat-row">
                                <div className="area-stat-info">
                                  <strong>{item.area}</strong>
                                  <span>{item.count} searches</span>
                                </div>
                                <div className="area-progress-bar-bg">
                                  <div className="area-progress-bar-fill" style={{ width: `${percent}%` }}></div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Live Recent Event Feed */}
                    <div className="admin-chart-card">
                      <div className="chart-card-header">
                        <TrendingUp size={18} className="text-primary" />
                        <h3>Recent User Activity Stream</h3>
                      </div>
                      <div className="activity-stream-list">
                        {(!analytics?.recentActivity || analytics.recentActivity.length === 0) ? (
                          <p className="empty-text">Activity stream will update live as users navigate.</p>
                        ) : (
                          analytics.recentActivity.map((event) => (
                            <div key={event.id} className="activity-item">
                              <span className={`event-type-badge ${event.eventType.toLowerCase()}`}>
                                {event.eventType}
                              </span>
                              <div className="activity-details">
                                <span className="activity-text">
                                  {event.details || (event.area ? `Location: ${event.area}` : 'Page interaction')}
                                </span>
                                <span className="activity-time">{event.time}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= VIEW 2: RESTAURANTS DIRECTORY ================= */}
              {activeTab === 'RESTAURANTS' && (
                <div className="admin-restaurants-view animate-fade-in">
                  <div className="admin-section-header">
                    <div>
                      <h2>Restaurant Catalog</h2>
                      <p>View, add, edit, or delete restaurants across all cities and food hubs.</p>
                    </div>

                    <div className="admin-header-actions-group">
                      <button 
                        type="button"
                        onClick={() => setShowScannerModal(true)} 
                        className="btn-secondary admin-scanner-btn"
                        title="Upload a menu card photo or paste Swiggy/Zomato URL to onboard dishes automatically"
                      >
                        <Camera size={16} className="text-primary" />
                        <span>📸 AI Menu Scanner / URL Importer</span>
                      </button>

                      <button 
                        onClick={handleOpenAddRestaurant} 
                        className="btn-primary admin-primary-cta"
                      >
                        <Plus size={18} />
                        <span>Add New Restaurant</span>
                      </button>
                    </div>
                  </div>

                  {/* Toolbar */}
                  <div className="admin-toolbar-row">
                    <div className="admin-search-box">
                      <Search size={16} className="search-icon" />
                      <input 
                        type="text" 
                        placeholder="Search by restaurant name, cuisine, or area..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="admin-search-input"
                      />
                    </div>
                    <span className="results-badge">Showing {filteredRestaurants.length} restaurants</span>
                  </div>

                  {/* Restaurant Cards Grid */}
                  <div className="admin-restaurants-grid">
                    {loadingData ? (
                      <div className="admin-loading-state">
                        <RefreshCw size={24} className="spin-icon text-primary" />
                        <p>Loading restaurant catalog...</p>
                      </div>
                    ) : filteredRestaurants.length === 0 ? (
                      <div className="admin-empty-state-box">
                        <Utensils size={40} className="text-muted" />
                        <h3>No restaurants match your search</h3>
                        <p>Try different keywords or click "Add New Restaurant" above.</p>
                      </div>
                    ) : (
                      filteredRestaurants.map(r => (
                        <div key={r.id} className="admin-restaurant-card">
                          <div className="rest-card-cover">
                            {r.imageUrl ? (
                              <img src={r.imageUrl} alt={r.name} onError={e => { e.target.style.display = 'none'; }} />
                            ) : (
                              <div className="no-image-box">🍽️</div>
                            )}
                            <div className="card-top-badges">
                              <span className="cuisine-badge">{r.cuisine}</span>
                              {r.isTrending && <span className="trending-badge">🔥 Trending</span>}
                              {r.isHiddenGem && <span className="gem-badge">💎 Hidden Gem</span>}
                            </div>
                          </div>

                          <div className="rest-card-content">
                            <div className="rest-card-title-row">
                              <h3>{r.name}</h3>
                              <span className="rating-pill">
                                <Star size={13} className="text-gold fill-gold" /> {r.rating}
                              </span>
                            </div>

                            <p className="rest-card-address">📍 {r.address} ({r.area})</p>

                            <div className="rest-card-stats-row">
                              <span className="card-stat-pill">
                                <Utensils size={13} /> {r.menuItems?.length || 0} Dishes
                              </span>
                              <span className="card-stat-pill">{r.priceRange}</span>
                              <span className="card-stat-pill">{r.reviewCount || 100}+ reviews</span>
                            </div>

                            <p className="rest-card-desc">{r.description}</p>
                          </div>

                          <div className="rest-card-actions-footer">
                            <button 
                              className="btn-primary rest-menu-manage-btn"
                              onClick={() => {
                                setSelectedRestaurant(r);
                                setActiveTab('MENU_ITEMS');
                              }}
                            >
                              <Tag size={15} />
                              <span>Manage Menu ({r.menuItems?.length || 0})</span>
                              <ChevronRight size={14} />
                            </button>

                            <div className="rest-secondary-actions">
                              <button 
                                className="btn-secondary icon-btn"
                                onClick={() => handleOpenEditRestaurant(r)}
                                title="Edit Restaurant Details"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button 
                                className="btn-secondary icon-btn danger"
                                onClick={() => handleDeleteRestaurant(r.id, r.name)}
                                title="Delete Restaurant"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ================= VIEW 3: MENU ITEMS MANAGER ================= */}
              {activeTab === 'MENU_ITEMS' && (
                <div className="admin-menu-manager-view animate-fade-in">
                  <div className="admin-section-header">
                    <div>
                      <h2>Restaurant Menu Builder</h2>
                      <p>Add and configure dishes, portion capacities, spice levels, and prices.</p>
                    </div>

                    <div className="admin-header-actions-group">
                      <button 
                        type="button"
                        onClick={() => setShowScannerModal(true)} 
                        className="btn-secondary admin-scanner-btn"
                        title="Upload menu card photo or import from Swiggy/Zomato"
                      >
                        <Camera size={16} className="text-primary" />
                        <span>📸 Scan Menu / URL</span>
                      </button>

                      <button 
                        onClick={() => handleOpenAddDish(selectedRestaurant)} 
                        className="btn-primary admin-primary-cta"
                        disabled={!selectedRestaurant}
                      >
                        <Plus size={18} />
                        <span>Add New Dish</span>
                      </button>
                    </div>
                  </div>

                  {/* Restaurant Selector Bar */}
                  <div className="restaurant-selector-banner">
                    <div className="selector-info">
                      <label>Currently Managing Restaurant:</label>
                      <select 
                        value={selectedRestaurant?.id || ''} 
                        onChange={e => {
                          const r = restaurants.find(item => item.id === parseInt(e.target.value));
                          if (r) setSelectedRestaurant(r);
                        }}
                        className="admin-select"
                      >
                        {restaurants.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name} — {r.area} ({r.menuItems?.length || 0} dishes)
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedRestaurant && (
                      <div className="selected-rest-mini-stats">
                        <span>Cuisine: <strong>{selectedRestaurant.cuisine}</strong></span>
                        <span>Area: <strong>{selectedRestaurant.area}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="menu-filters-row">
                    <div className="filter-group">
                      <span className="filter-label">Category:</span>
                      {['ALL', 'MAIN', 'STARTER', 'QUICK_BITE', 'BEVERAGE', 'DESSERT'].map(cat => (
                        <button
                          key={cat}
                          className={`filter-pill ${categoryFilter === cat ? 'active' : ''}`}
                          onClick={() => setCategoryFilter(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="filter-group">
                      <span className="filter-label">Diet:</span>
                      {['ALL', 'VEG', 'NON_VEG', 'EGGETARIAN'].map(type => (
                        <button
                          key={type}
                          className={`filter-pill ${foodTypeFilter === type ? 'active' : ''}`}
                          onClick={() => setFoodTypeFilter(type)}
                        >
                          {type === 'VEG' ? '🟢 Veg' : type === 'NON_VEG' ? '🔴 Non-Veg' : type === 'EGGETARIAN' ? '🟡 Egg' : 'All'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dishes Table / List */}
                  <div className="dishes-table-container">
                    {(!selectedRestaurant || filteredDishes.length === 0) ? (
                      <div className="admin-empty-state-box">
                        <Tag size={40} className="text-muted" />
                        <h3>No dishes found for this filter</h3>
                        <p>Click "Add New Dish" to add items to this restaurant's menu.</p>
                      </div>
                    ) : (
                      <table className="dishes-table">
                        <thead>
                          <tr>
                            <th>Dish Name</th>
                            <th>Category</th>
                            <th>Diet</th>
                            <th>Spice</th>
                            <th>Price</th>
                            <th>Portion Capacity</th>
                            <th>Badges</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDishes.map(dish => (
                            <tr key={dish.id}>
                              <td>
                                <div className="dish-name-cell">
                                  <strong>{dish.name}</strong>
                                  <p>{dish.description}</p>
                                </div>
                              </td>
                              <td><span className="table-badge cat">{dish.category}</span></td>
                              <td>
                                <span className={`table-badge diet ${dish.foodType.toLowerCase()}`}>
                                  {dish.foodType === 'VEG' ? '🟢 Veg' : dish.foodType === 'NON_VEG' ? '🔴 Non-Veg' : '🟡 Egg'}
                                </span>
                              </td>
                              <td><span className="table-badge spice">🌶️ {dish.spiceLevel}</span></td>
                              <td><strong className="dish-table-price">₹{dish.price}</strong></td>
                              <td>
                                <span className="portion-capacity-tag">
                                  Feeds ~{dish.servingCapacity} {dish.servingCapacity === 1.0 ? 'person' : 'people'}
                                </span>
                              </td>
                              <td>
                                <div className="dish-badges-cell">
                                  {dish.isSignature && <span className="mini-badge gold">⭐ Signature</span>}
                                  {dish.isPopular && <span className="mini-badge orange">🔥 Popular</span>}
                                </div>
                              </td>
                              <td>
                                <div className="table-actions-cell">
                                  <button 
                                    className="btn-secondary icon-btn"
                                    onClick={() => handleOpenEditDish(dish)}
                                    title="Edit Dish"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button 
                                    className="btn-secondary icon-btn danger"
                                    onClick={() => handleDeleteDish(dish.id, dish.name)}
                                    title="Delete Dish"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT RESTAURANT MODAL ================= */}
      {showRestaurantForm && (
        <div className="admin-submodal-overlay animate-fade-in" onClick={() => setShowRestaurantForm(false)}>
          <div className="admin-submodal-card" onClick={e => e.stopPropagation()}>
            <div className="submodal-header">
              <h3>{editingRestaurantId ? "Edit Restaurant Details" : "Add New Restaurant"}</h3>
              <button className="submodal-close-btn" onClick={() => setShowRestaurantForm(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRestaurant} className="admin-form-grid">
              <div className="form-group full-width">
                <label>Restaurant Name *</label>
                <input 
                  type="text" 
                  required 
                  value={restaurantForm.name} 
                  onChange={e => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                  placeholder="e.g. Mandi 36"
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label>Cuisine(s) *</label>
                <input 
                  type="text" 
                  required 
                  value={restaurantForm.cuisine} 
                  onChange={e => setRestaurantForm({ ...restaurantForm, cuisine: e.target.value })}
                  placeholder="e.g. Arabian, Mandi, Middle Eastern"
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label>Area Hub</label>
                <select 
                  value={restaurantForm.area} 
                  onChange={e => {
                    const selected = PRESET_HUBS.find(h => h.name === e.target.value);
                    if (selected) {
                      setRestaurantForm({
                        ...restaurantForm,
                        area: selected.name,
                        latitude: selected.lat,
                        longitude: selected.lng
                      });
                    } else {
                      setRestaurantForm({ ...restaurantForm, area: e.target.value });
                    }
                  }}
                  className="admin-input"
                >
                  {PRESET_HUBS.map(h => (
                    <option key={h.name} value={h.name}>{h.name}</option>
                  ))}
                  <option value="Other">Other / Custom</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Full Street Address *</label>
                <input 
                  type="text" 
                  required 
                  value={restaurantForm.address} 
                  onChange={e => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                  placeholder="e.g. Metro Pillar 12, KPHB Main Road"
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label>Latitude (GPS)</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  value={restaurantForm.latitude} 
                  onChange={e => setRestaurantForm({ ...restaurantForm, latitude: parseFloat(e.target.value) || 0 })}
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label>Longitude (GPS)</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  value={restaurantForm.longitude} 
                  onChange={e => setRestaurantForm({ ...restaurantForm, longitude: parseFloat(e.target.value) || 0 })}
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label>Rating (1.0 - 5.0)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="1.0" 
                  max="5.0" 
                  value={restaurantForm.rating} 
                  onChange={e => setRestaurantForm({ ...restaurantForm, rating: parseFloat(e.target.value) || 4.0 })}
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label>Price Range</label>
                <select 
                  value={restaurantForm.priceRange} 
                  onChange={e => setRestaurantForm({ ...restaurantForm, priceRange: e.target.value })}
                  className="admin-input"
                >
                  <option value="₹">₹ (Budget / Street Food)</option>
                  <option value="₹₹">₹₹ (Moderate / Casual Dining)</option>
                  <option value="₹₹₹">₹₹₹ (Premium / Fine Dining)</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Cover Photo URL</label>
                <input 
                  type="url" 
                  value={restaurantForm.imageUrl} 
                  onChange={e => setRestaurantForm({ ...restaurantForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label>Opening Hours</label>
                <input 
                  type="text" 
                  value={restaurantForm.openingHours} 
                  onChange={e => setRestaurantForm({ ...restaurantForm, openingHours: e.target.value })}
                  placeholder="11:00 AM - 11:30 PM"
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={restaurantForm.phone} 
                  onChange={e => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                  placeholder="+91 98480 12345"
                  className="admin-input"
                />
              </div>

              <div className="form-group full-width">
                <label>Description & Specialties</label>
                <textarea 
                  rows="2" 
                  value={restaurantForm.description} 
                  onChange={e => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
                  placeholder="Known for authentic mandi platters, spiced chicken, and garlic dips..."
                  className="admin-textarea"
                />
              </div>

              <div className="form-group checkbox-row full-width">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={restaurantForm.isTrending} 
                    onChange={e => setRestaurantForm({ ...restaurantForm, isTrending: e.target.checked })} 
                  />
                  <span>🔥 Mark as Trending (High popularity)</span>
                </label>

                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={restaurantForm.isHiddenGem} 
                    onChange={e => setRestaurantForm({ ...restaurantForm, isHiddenGem: e.target.checked })} 
                  />
                  <span>💎 Mark as Hidden Gem (Discovery)</span>
                </label>
              </div>

              <div className="submodal-actions full-width">
                <button type="button" className="btn-secondary" onClick={() => setShowRestaurantForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} />
                  <span>{editingRestaurantId ? "Update Restaurant" : "Create Restaurant"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT DISH MODAL ================= */}
      {showDishForm && (
        <div className="admin-submodal-overlay animate-fade-in" onClick={() => setShowDishForm(false)}>
          <div className="admin-submodal-card" onClick={e => e.stopPropagation()}>
            <div className="submodal-header">
              <h3>{editingDishId ? "Edit Dish" : `Add Dish to ${selectedRestaurant?.name}`}</h3>
              <button className="submodal-close-btn" onClick={() => setShowDishForm(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="admin-form-grid">
              <div className="form-group full-width">
                <label>Dish Name *</label>
                <input 
                  type="text" 
                  required 
                  value={dishForm.name} 
                  onChange={e => setDishForm({ ...dishForm, name: e.target.value })}
                  placeholder="e.g. Mutton Juicy Mandi"
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label>Price (₹) *</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  step="5" 
                  value={dishForm.price} 
                  onChange={e => setDishForm({ ...dishForm, price: parseFloat(e.target.value) || 0 })}
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label>Food Type</label>
                <select 
                  value={dishForm.foodType} 
                  onChange={e => setDishForm({ ...dishForm, foodType: e.target.value })}
                  className="admin-input"
                >
                  <option value="NON_VEG">🔴 Non-Vegetarian</option>
                  <option value="VEG">🟢 Vegetarian</option>
                  <option value="EGGETARIAN">🟡 Eggetarian</option>
                </select>
              </div>

              <div className="form-group">
                <label>Meal Category</label>
                <select 
                  value={dishForm.category} 
                  onChange={e => setDishForm({ ...dishForm, category: e.target.value })}
                  className="admin-input"
                >
                  <option value="MAIN">Main Dish (Biryani, Thali, Mandi, Bowl)</option>
                  <option value="STARTER">Starter / Appetizer (Chicken 65, Paneer Tikka)</option>
                  <option value="QUICK_BITE">Quick Bite (Shawarma, Roll, Burger)</option>
                  <option value="BEVERAGE">Beverage / Drink (Lassi, Mojito, Soda)</option>
                  <option value="DESSERT">Dessert / Sweet (Double Ka Meetha, Kunafa)</option>
                  <option value="COMBO_PACK">Pre-set Meal Pack</option>
                </select>
              </div>

              <div className="form-group">
                <label>Spice Level</label>
                <select 
                  value={dishForm.spiceLevel} 
                  onChange={e => setDishForm({ ...dishForm, spiceLevel: e.target.value })}
                  className="admin-input"
                >
                  <option value="MILD">Mild (Low spice / Sweet)</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="SPICY">Spicy 🌶️</option>
                  <option value="EXTRA_SPICY">Extra Spicy 🌶️🌶️</option>
                </select>
              </div>

              <div className="form-group">
                <label>Serving Capacity (People)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0.1" 
                  max="10.0" 
                  value={dishForm.servingCapacity} 
                  onChange={e => setDishForm({ ...dishForm, servingCapacity: parseFloat(e.target.value) || 1.0 })}
                  className="admin-input"
                />
                <small className="input-hint">E.g., 1.5 for heavy Biryani/Mandi, 1.0 for Shawarma, 0.6 for Starter</small>
              </div>

              <div className="form-group">
                <label>Tags (Comma separated)</label>
                <input 
                  type="text" 
                  value={dishForm.tags} 
                  onChange={e => setDishForm({ ...dishForm, tags: e.target.value })}
                  placeholder="Mandi, Mutton, Rice, Fragrant"
                  className="admin-input"
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea 
                  rows="2" 
                  value={dishForm.description} 
                  onChange={e => setDishForm({ ...dishForm, description: e.target.value })}
                  placeholder="Slow-cooked tender meat served over spiced basmati rice..."
                  className="admin-textarea"
                />
              </div>

              <div className="form-group checkbox-row full-width">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={dishForm.isPopular} 
                    onChange={e => setDishForm({ ...dishForm, isPopular: e.target.checked })} 
                  />
                  <span>🔥 Customer Favorite</span>
                </label>

                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={dishForm.isSignature} 
                    onChange={e => setDishForm({ ...dishForm, isSignature: e.target.checked })} 
                  />
                  <span>⭐ Chef's Signature</span>
                </label>
              </div>

              <div className="submodal-actions full-width">
                <button type="button" className="btn-secondary" onClick={() => setShowDishForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} />
                  <span>{editingDishId ? "Update Dish" : "Add Dish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Menu Photo Scanner & Swiggy/Zomato URL Importer Modal */}
      {showScannerModal && (
        <MenuScannerModal
          restaurants={restaurants}
          selectedRestaurantId={selectedRestaurant?.id}
          onClose={() => setShowScannerModal(false)}
          onMenuImported={(targetRestId) => {
            fetchDashboardData();
            if (onDataChanged) onDataChanged();
            if (targetRestId) {
              const match = restaurants.find(r => r.id === targetRestId);
              if (match) setSelectedRestaurant(match);
            }
          }}
        />
      )}
    </div>
  );
}
