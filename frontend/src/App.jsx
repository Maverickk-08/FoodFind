import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import SmartQueryBar from './components/SmartQueryBar.jsx';
import DecisionWizard from './components/DecisionWizard.jsx';
import ModeSwitcher from './components/ModeSwitcher.jsx';
import CombinationList from './components/CombinationList.jsx';
import RadarView from './components/RadarView.jsx';
import InteractiveMapView from './components/InteractiveMapView.jsx';
import RestaurantModal from './components/RestaurantModal.jsx';
import DecisionRoomModal from './components/DecisionRoomModal.jsx';
import ComboCustomizerModal from './components/ComboCustomizerModal.jsx';
import BillSplitterModal from './components/BillSplitterModal.jsx';
import ShareModal from './components/ShareModal.jsx';
import FavoritesDrawer from './components/FavoritesDrawer.jsx';
import AdminPage from './components/AdminPage.jsx';
import LocationPromptModal from './components/LocationPromptModal.jsx';
import { Sparkles, UtensilsCrossed } from 'lucide-react';
import { apiUrl } from './config/api.js';
import './App.css';

export default function App() {
  const [params, setParams] = useState(() => {
    let savedLoc = null;
    try {
      const item = localStorage.getItem('foodfind_user_location');
      if (item) savedLoc = JSON.parse(item);
    } catch (e) {}

    return {
      people: 3,
      budget: 800.0,
      isPerPersonBudget: false,
      latitude: savedLoc?.latitude || 17.4933,
      longitude: savedLoc?.longitude || 78.3914,
      targetLocationName: savedLoc?.name || "KPHB Colony",
      radiusKm: 3.0,
      foodType: 'NON_VEG',
      spiceLevel: null,
      cuisines: [],
      categories: [],
      avoidItems: [],
      mode: 'BEST_OVERALL'
    };
  });

  const [locationHubs, setLocationHubs] = useState([]);
  const [combinations, setCombinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [activeTab, setActiveTab] = useState('COMBOS'); // 'COMBOS' | 'MAP' | 'RADAR'
  
  // View state: 'APP' (Customer dining app) or 'ADMIN' (Dedicated Full-Page Admin Dashboard)
  const [currentView, setCurrentView] = useState(() => {
    return window.location.pathname === '/admin' || window.location.search.includes('view=admin') ? 'ADMIN' : 'APP';
  });

  // Location prompt modal (shown on first visit if no location is stored)
  const [showLocationPrompt, setShowLocationPrompt] = useState(() => {
    return !localStorage.getItem('foodfind_user_location');
  });

  // Modals state
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [showDecisionRoom, setShowDecisionRoom] = useState(false);
  const [votedCombos, setVotedCombos] = useState([]);
  const [customizingCombo, setCustomizingCombo] = useState(null);
  const [splitBillCombo, setSplitBillCombo] = useState(null);
  const [sharingCombo, setSharingCombo] = useState(null);
  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('foodfind_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Location Coverage & Serviceability Stats
  const [nearbyStats, setNearbyStats] = useState({
    restaurantsInRadius: 0,
    nearestRestaurant: null,
    isUnservedLocation: false,
    checked: false
  });

  // Lightweight Analytics Event Tracker
  const getSessionToken = () => {
    let sid = sessionStorage.getItem('foodfind_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      sessionStorage.setItem('foodfind_session_id', sid);
    }
    return sid;
  };

  const trackEvent = useCallback((eventType, area, details) => {
    try {
      fetch(apiUrl('/api/analytics/track'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          area: area || params.targetLocationName,
          sessionToken: getSessionToken(),
          details: details || ''
        })
      }).catch(() => {});
    } catch (e) {}
  }, [params.targetLocationName]);

  // Log page view on initial visit
  useEffect(() => {
    trackEvent('PAGE_VIEW', params.targetLocationName, 'User visited site');
  }, []);

  // Fetch initial location hubs
  useEffect(() => {
    fetch(apiUrl('/api/locations/hubs'))
      .then(res => res.json())
      .then(data => {
        setLocationHubs(data);
        // Only set default hub if user has not picked a location
        const saved = localStorage.getItem('foodfind_user_location');
        if (!saved && data && data.length > 0) {
          const defaultHub = data[0];
          setParams(prev => ({
            ...prev,
            latitude: defaultHub.latitude,
            longitude: defaultHub.longitude,
            targetLocationName: defaultHub.name
          }));
        }
      })
      .catch(err => console.error("Error fetching location hubs:", err));
  }, []);

  // Sync favorites with backend
  useEffect(() => {
    fetch(apiUrl('/api/favorites'))
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setFavorites(data);
        }
      })
      .catch(err => console.error("Error fetching backend favorites:", err));
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('foodfind_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch recommendations and location coverage stats
  const fetchRecommendations = useCallback((overrideParams) => {
    const currentParams = overrideParams || params;
    setLoading(true);

    fetch(apiUrl('/api/recommendations'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentParams)
    })
      .then(res => res.json())
      .then(data => {
        setCombinations(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching recommendations:", err);
        setLoading(false);
      });

    // Check location coverage and distance to nearest restaurants
    if (currentParams.latitude != null && currentParams.longitude != null) {
      fetch(apiUrl(`/api/restaurants?lat=${currentParams.latitude}&lng=${currentParams.longitude}`))
        .then(res => res.json())
        .then(restaurants => {
          if (!restaurants || restaurants.length === 0) {
            setNearbyStats({
              restaurantsInRadius: 0,
              nearestRestaurant: null,
              isUnservedLocation: true,
              checked: true
            });
            return;
          }

          const sorted = [...restaurants].sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
          const nearest = sorted[0];
          const inRadius = sorted.filter(r => (r.distanceKm || 0) <= (currentParams.radiusKm || 3.0));

          // If nearest partner restaurant is > 35 km away, we do not serve this city/area yet
          const isUnserved = !nearest || (nearest.distanceKm > 35.0);

          setNearbyStats({
            restaurantsInRadius: inRadius.length,
            nearestRestaurant: nearest,
            isUnservedLocation: isUnserved,
            checked: true
          });
        })
        .catch(() => {});
    }
  }, [params]);

  // Initial load
  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Handle Natural Language Query
  const handleParseQuery = async (queryText) => {
    setIsParsing(true);
    try {
      const res = await fetch(apiUrl(`/api/query/parse?q=${encodeURIComponent(queryText)}`));
      const parsed = await res.json();

      const updatedParams = {
        ...params,
        people: parsed.people || params.people,
        budget: parsed.budget || params.budget,
        isPerPersonBudget: parsed.isPerPersonBudget || false,
        foodType: parsed.foodType || null,
        spiceLevel: parsed.spiceLevel || null,
        avoidItems: parsed.avoidItems || [],
        mode: parsed.mode || 'BEST_OVERALL'
      };

      if (parsed.latitude && parsed.longitude) {
        updatedParams.latitude = parsed.latitude;
        updatedParams.longitude = parsed.longitude;
        updatedParams.targetLocationName = parsed.locationName || params.targetLocationName;
      }

      setParams(updatedParams);
      fetchRecommendations(updatedParams);
      trackEvent('SEARCH', updatedParams.targetLocationName, queryText);
    } catch (err) {
      console.error("Error parsing query:", err);
    } finally {
      setIsParsing(false);
    }
  };

  // Handle Mode Selection
  const handleSelectMode = (newMode) => {
    const updated = { ...params, mode: newMode };
    setParams(updated);
    fetchRecommendations(updated);
    trackEvent('MODE_CHANGE', params.targetLocationName, newMode);
  };

  // Handle Surprise Me Action
  const handleSurpriseMe = () => {
    const updated = { ...params, mode: 'SURPRISE_ME' };
    setParams(updated);
    fetchRecommendations(updated);
    trackEvent('SURPRISE_ME', params.targetLocationName, 'Surprise Me Clicked');
  };

  // Handle Vote Action
  const handleVoteCombo = (combo) => {
    setVotedCombos(prev => {
      const exists = prev.find(c => c.id === combo.id);
      if (exists) {
        return prev.map(c => c.id === combo.id ? { ...c, votes: (c.votes || 0) + 1 } : c);
      }
      return [...prev, { ...combo, votes: 1 }];
    });
    trackEvent('VOTE', params.targetLocationName, combo.restaurantName);
    setShowDecisionRoom(true);
  };

  // Handle Favorite Toggle
  const handleToggleFavorite = (combo) => {
    const isFav = favorites.some(f => f.comboId === combo.id || f.id === combo.id);
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.comboId !== combo.id && f.id !== combo.id));
      fetch(apiUrl(`/api/favorites/${combo.id}`), { method: 'DELETE' }).catch(() => {});
    } else {
      const newFav = {
        comboId: combo.id,
        restaurantId: combo.restaurantId,
        restaurantName: combo.restaurantName,
        cuisine: combo.cuisine,
        totalPrice: combo.totalPrice,
        restaurantRating: combo.restaurantRating,
        people: params.people,
        itemsSummary: combo.items.map(i => `${i.quantity}x ${i.name}`).join(' + ')
      };
      setFavorites(prev => [newFav, ...prev]);
      fetch(apiUrl('/api/favorites'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFav)
      }).catch(() => {});
    }
  };

  const handleRemoveFavorite = (id) => {
    setFavorites(prev => prev.filter(f => f.comboId !== id && f.id !== id));
    fetch(apiUrl(`/api/favorites/${id}`), { method: 'DELETE' }).catch(() => {});
  };

  // Handle Custom Combo Saved from Customizer
  const handleSaveCustomCombo = (customCombo) => {
    setCombinations(prev => [customCombo, ...prev]);
    trackEvent('COMBO_TWEAK', params.targetLocationName, customCombo.restaurantName);
  };

  // Handle updates made in Admin Modal (refresh combos and hubs)
  const handleDataChanged = () => {
    fetchRecommendations();
    fetch(apiUrl('/api/locations/hubs'))
      .then(res => res.json())
      .then(data => setLocationHubs(data))
      .catch(() => {});
  };

  // Reset Filters
  const handleResetFilters = () => {
    const reset = {
      people: 3,
      budget: 800.0,
      isPerPersonBudget: false,
      latitude: 17.4933,
      longitude: 78.3914,
      targetLocationName: "KPHB Colony",
      radiusKm: 3.0,
      foodType: null,
      spiceLevel: null,
      cuisines: [],
      categories: [],
      avoidItems: [],
      mode: 'BEST_OVERALL'
    };
    setParams(reset);
    fetchRecommendations(reset);
  };

  const handleExpandRadius = (newRadius) => {
    const updated = { ...params, radiusKm: newRadius };
    setParams(updated);
    fetchRecommendations(updated);
  };

  const handleSwitchToCityHub = (city) => {
    let hub = null;
    if (city === 'VISAKHAPATNAM') {
      hub = locationHubs.find(h => h.city?.toLowerCase().includes('visakha') || h.name.includes('Siripuram'))
        || { name: 'Siripuram', city: 'Visakhapatnam', latitude: 17.7214, longitude: 83.3156 };
    } else {
      hub = locationHubs.find(h => h.city?.toLowerCase().includes('hyder') || h.name.includes('KPHB'))
        || { name: 'KPHB Colony', city: 'Hyderabad', latitude: 17.4933, longitude: 78.3914 };
    }

    const displayName = hub.city ? `${hub.name} (${hub.city})` : hub.name;
    const updated = {
      ...params,
      latitude: hub.latitude,
      longitude: hub.longitude,
      targetLocationName: displayName
    };
    localStorage.setItem('foodfind_user_location', JSON.stringify({
      latitude: hub.latitude,
      longitude: hub.longitude,
      name: displayName
    }));
    setParams(updated);
    fetchRecommendations(updated);
    trackEvent('LOCATION_SET', displayName, `User explored ${city} from unserved notice`);
  };

  const effectiveBudget = params.budget * (params.isPerPersonBudget ? params.people : 1);

  // If user navigated to Admin view, render full-screen Admin Portal
  if (currentView === 'ADMIN') {
    return (
      <AdminPage
        onExitToCustomerApp={() => setCurrentView('APP')}
        onDataChanged={handleDataChanged}
      />
    );
  }

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <Navbar
        currentLocationName={params.targetLocationName}
        onOpenDecisionRoom={() => setShowDecisionRoom(true)}
        onSurpriseMeClick={handleSurpriseMe}
        onOpenFavorites={() => setIsFavoritesDrawerOpen(true)}
        onOpenAdmin={() => setCurrentView('ADMIN')}
        onChangeLocation={() => setShowLocationPrompt(true)}
        favoriteCount={favorites.length}
      />

      {/* Main Content Area */}
      <main className="main-content-container">
        {/* Hero Section */}
        <section className="hero-banner-section">
          <div className="hero-content">
            <div className="hero-pill-badge">
              <Sparkles size={14} className="text-primary" />
              <span>Smart Group Dining Engine</span>
            </div>
            <h1 className="hero-headline">
              "We have <strong>{params.people} friends</strong>, <strong>₹{effectiveBudget} budget</strong>, at <strong>{params.targetLocationName}</strong>. What should we eat?"
            </h1>
            <p className="hero-description">
              FoodFind solves group indecision by calculating exact food portions and generating balanced meal combinations nearby.
            </p>
          </div>

          {/* Smart NLP Search Bar */}
          <SmartQueryBar
            onParseQuery={handleParseQuery}
            isParsing={isParsing}
          />
        </section>

        {/* Wizard Controls */}
        <section className="wizard-section">
          <DecisionWizard
            params={params}
            setParams={setParams}
            locationHubs={locationHubs}
            onFetchRecommendations={() => fetchRecommendations()}
            loading={loading}
          />
        </section>

        {/* Mode Switcher */}
        <section className="modes-section">
          <div className="section-label-row">
            <span className="section-eyebrow">Choose Decision Strategy</span>
          </div>
          <ModeSwitcher
            currentMode={params.mode}
            onSelectMode={handleSelectMode}
          />
        </section>

        {/* Results View Switcher */}
        <div className="view-toggle-row">
          <div className="view-tab-buttons">
            <button
              className={`btn-view-tab ${activeTab === 'COMBOS' ? 'active' : ''}`}
              onClick={() => setActiveTab('COMBOS')}
            >
              🍱 Food Combinations ({combinations.length})
            </button>
            <button
              className={`btn-view-tab ${activeTab === 'MAP' ? 'active' : ''}`}
              onClick={() => setActiveTab('MAP')}
            >
              🗺️ OpenStreetMap Navigator
            </button>
            <button
              className={`btn-view-tab ${activeTab === 'RADAR' ? 'active' : ''}`}
              onClick={() => setActiveTab('RADAR')}
            >
              📡 Proximity Radar Map
            </button>
          </div>
        </div>

        {/* Results Body */}
        <section className="results-section">
          {activeTab === 'COMBOS' && (
            <CombinationList
              combinations={combinations}
              budget={effectiveBudget}
              people={params.people}
              loading={loading}
              nearbyStats={nearbyStats}
              targetLocationName={params.targetLocationName}
              radiusKm={params.radiusKm}
              onExpandRadius={handleExpandRadius}
              onSwitchToCityHub={handleSwitchToCityHub}
              onOpenLocationPrompt={() => setShowLocationPrompt(true)}
              onViewRestaurant={(id) => setSelectedRestaurantId(id)}
              onVoteCombo={handleVoteCombo}
              onCustomizeCombo={(combo) => setCustomizingCombo(combo)}
              onSplitBill={(combo) => {
                setSplitBillCombo(combo);
                trackEvent('BILL_SPLIT', params.targetLocationName, combo.restaurantName);
              }}
              onShareCombo={(combo) => setSharingCombo(combo)}
              onToggleFavorite={handleToggleFavorite}
              favorites={favorites}
              onResetFilters={handleResetFilters}
            />
          )}

          {activeTab === 'MAP' && (
            <InteractiveMapView
              userLat={params.latitude}
              userLon={params.longitude}
              locationName={params.targetLocationName}
              radiusKm={params.radiusKm}
              combinations={combinations}
              onSelectRestaurant={(id) => setSelectedRestaurantId(id)}
            />
          )}

          {activeTab === 'RADAR' && (
            <RadarView
              combinations={combinations}
              radiusKm={params.radiusKm}
              locationName={params.targetLocationName}
              onSelectRestaurant={(id) => setSelectedRestaurantId(id)}
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <UtensilsCrossed size={20} className="text-primary" />
            <span>FoodFind • Solving "What should we eat?" together</span>
          </div>
          <p className="footer-copy">
            Built for groups, friends, and foodies who want great food within their budget.
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {selectedRestaurantId && (
        <RestaurantModal
          restaurantId={selectedRestaurantId}
          userLat={params.latitude}
          userLon={params.longitude}
          onClose={() => setSelectedRestaurantId(null)}
        />
      )}

      {showDecisionRoom && (
        <DecisionRoomModal
          combinations={combinations}
          votedCombos={votedCombos}
          setVotedCombos={setVotedCombos}
          onClose={() => setShowDecisionRoom(false)}
          people={params.people}
        />
      )}

      {customizingCombo && (
        <ComboCustomizerModal
          combo={customizingCombo}
          budget={effectiveBudget}
          people={params.people}
          onClose={() => setCustomizingCombo(null)}
          onSaveCustomCombo={handleSaveCustomCombo}
          onVoteCombo={handleVoteCombo}
        />
      )}

      {splitBillCombo && (
        <BillSplitterModal
          combo={splitBillCombo}
          people={params.people}
          onClose={() => setSplitBillCombo(null)}
        />
      )}

      {sharingCombo && (
        <ShareModal
          combo={sharingCombo}
          people={params.people}
          budget={effectiveBudget}
          onClose={() => setSharingCombo(null)}
        />
      )}

      <FavoritesDrawer
        isOpen={isFavoritesDrawerOpen}
        onClose={() => setIsFavoritesDrawerOpen(false)}
        favorites={favorites}
        onRemoveFavorite={handleRemoveFavorite}
        onSelectFavorite={(fav) => {
          if (fav.restaurantId) setSelectedRestaurantId(fav.restaurantId);
        }}
      />

      {showLocationPrompt && (
        <LocationPromptModal
          currentLocationName={params.targetLocationName}
          onClose={() => setShowLocationPrompt(false)}
          onSelectLocation={(loc) => {
            const updated = {
              ...params,
              latitude: loc.latitude,
              longitude: loc.longitude,
              targetLocationName: loc.name
            };
            setParams(updated);
            fetchRecommendations(updated);
            trackEvent('LOCATION_SET', loc.name, 'User selected location');
          }}
        />
      )}
    </div>
  );
}
