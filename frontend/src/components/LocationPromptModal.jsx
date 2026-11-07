import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  X, 
  Search, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  Building2,
  Compass
} from 'lucide-react';
import { reverseGeocode } from '../utils/geoUtils.js';

const PRESET_HUBS = [
  // Visakhapatnam (Vizag) Hubs
  { name: 'Siripuram', city: 'Visakhapatnam', lat: 17.7214, lng: 83.3156, tagline: 'Andhra Messes, MLA Biryani & Student Cafes' },
  { name: 'MVP Colony', city: 'Visakhapatnam', lat: 17.7412, lng: 83.3341, tagline: 'Tiffin Centers, Fast Food Rolls & Family Dhabas' },
  { name: 'Jagadamba Junction', city: 'Visakhapatnam', lat: 17.7126, lng: 83.3006, tagline: 'Heritage Andhra Thalis, Biryani & Street Food' },
  { name: 'Rushikonda Beach', city: 'Visakhapatnam', lat: 17.7820, lng: 83.3852, tagline: 'Spicy Seafood Dhabas, Prawn Fry & Sea-view Cafes' },
  { name: 'Gajuwaka', city: 'Visakhapatnam', lat: 17.6905, lng: 83.2095, tagline: 'Family Dining, Spicy Curries & Tandoori Grills' },

  // Hyderabad Hubs
  { name: 'KPHB Colony', city: 'Hyderabad', lat: 17.4933, lng: 78.3914, tagline: 'Biryani, Shawarmas & Student Street Food' },
  { name: 'Madhapur', city: 'Hyderabad', lat: 17.4483, lng: 78.3915, tagline: 'Arabian Mandi & Rooftop Cafes' },
  { name: 'Hitec City', city: 'Hyderabad', lat: 17.4435, lng: 78.3772, tagline: 'Tech Parks, Gourmet Burgers & Quick Combos' },
  { name: 'Gachibowli', city: 'Hyderabad', lat: 17.4401, lng: 78.3489, tagline: 'Night Dhabas & Tandoori Grills' },
  { name: 'Jubilee Hills', city: 'Hyderabad', lat: 17.4319, lng: 78.4073, tagline: 'Artisan Pizzas, Cafes & Continental' },
  { name: 'Banjara Hills', city: 'Hyderabad', lat: 17.4156, lng: 78.4357, tagline: 'Authentic Hyderabadi Haleem & Mughlai' }
];

export default function LocationPromptModal({ onClose, onSelectLocation, currentLocationName }) {
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [customSearch, setCustomSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL'); // 'ALL' | 'VISAKHAPATNAM' | 'HYDERABAD'

  // 1. Handle Native Browser Geolocation (GPS) with true reverse geocoding
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingGps(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Asynchronously reverse geocode coordinates to real locality and city
          const resolvedName = await reverseGeocode(lat, lng, PRESET_HUBS);

          const locationData = {
            latitude: lat,
            longitude: lng,
            name: resolvedName
          };

          localStorage.setItem('foodfind_user_location', JSON.stringify(locationData));
          onSelectLocation(locationData);
          onClose();
        } catch (e) {
          setGpsError("Could not resolve location name. Please select your dining hub below.");
        } finally {
          setDetectingGps(false);
        }
      },
      (error) => {
        setDetectingGps(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError("Location permission was denied. Please pick your neighborhood manually below.");
        } else {
          setGpsError("Could not retrieve GPS coordinates. Please select an area manually.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // 2. Handle Preset Hub Selection
  const handleSelectHub = (hub) => {
    const locationData = {
      latitude: hub.lat,
      longitude: hub.lng,
      name: `${hub.name} (${hub.city})`
    };
    localStorage.setItem('foodfind_user_location', JSON.stringify(locationData));
    onSelectLocation(locationData);
    onClose();
  };

  // 3. Handle Custom Area Search
  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const query = customSearch.trim().toLowerCase();
    if (!query) return;

    // Check if query matches any known hub or city
    const match = PRESET_HUBS.find(h => 
      h.name.toLowerCase().includes(query) || h.city.toLowerCase().includes(query)
    );

    let locationData;
    if (match) {
      locationData = {
        latitude: match.lat,
        longitude: match.lng,
        name: `${match.name} (${match.city})`
      };
    } else if (query.includes('vizag') || query.includes('visakhapatnam')) {
      locationData = {
        latitude: 17.7214,
        longitude: 83.3156,
        name: "Siripuram (Visakhapatnam)"
      };
    } else if (query.includes('hyderabad')) {
      locationData = {
        latitude: 17.4933,
        longitude: 78.3914,
        name: "KPHB Colony (Hyderabad)"
      };
    } else {
      // Custom named location (defaults to Vizag if contains coastal / vizag clues, else KPHB)
      locationData = {
        latitude: 17.4933,
        longitude: 78.3914,
        name: customSearch.trim()
      };
    }

    localStorage.setItem('foodfind_user_location', JSON.stringify(locationData));
    onSelectLocation(locationData);
    onClose();
  };

  const filteredHubs = PRESET_HUBS.filter(h => {
    if (cityFilter === 'VISAKHAPATNAM') return h.city === 'Visakhapatnam';
    if (cityFilter === 'HYDERABAD') return h.city === 'Hyderabad';
    return true;
  });

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="location-prompt-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} title="Dismiss">
          <X size={20} />
        </button>

        <div className="location-prompt-header">
          <div className="location-prompt-icon-ring">
            <MapPin size={32} className="text-primary" />
          </div>
          <h2>Where are you eating today?</h2>
          <p>
            FoodFind detects portion-balanced meal bundles and budget savings for restaurants in your area.
          </p>
        </div>

        {/* GPS Button */}
        <div className="location-gps-action">
          <button 
            type="button" 
            className="btn-primary location-gps-btn" 
            onClick={handleDetectGPS}
            disabled={detectingGps}
          >
            {detectingGps ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>Detecting precise location & city...</span>
              </>
            ) : (
              <>
                <Navigation size={18} />
                <span>Use My Live Location (GPS)</span>
              </>
            )}
          </button>

          {gpsError && (
            <div className="location-error-badge">
              <AlertCircle size={15} />
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        <div className="location-divider">
          <span>OR CHOOSE YOUR DINING HUB</span>
        </div>

        {/* City Filter Pills */}
        <div className="location-city-pills">
          <button
            type="button"
            className={`city-pill-btn ${cityFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setCityFilter('ALL')}
          >
            All Cities ({PRESET_HUBS.length})
          </button>
          <button
            type="button"
            className={`city-pill-btn ${cityFilter === 'VISAKHAPATNAM' ? 'active' : ''}`}
            onClick={() => setCityFilter('VISAKHAPATNAM')}
          >
            🌊 Visakhapatnam (Vizag)
          </button>
          <button
            type="button"
            className={`city-pill-btn ${cityFilter === 'HYDERABAD' ? 'active' : ''}`}
            onClick={() => setCityFilter('HYDERABAD')}
          >
            🏛️ Hyderabad
          </button>
        </div>

        {/* Custom Input */}
        <form onSubmit={handleCustomSubmit} className="location-custom-search-row">
          <div className="location-search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Type your neighborhood, landmark, or campus..." 
              value={customSearch}
              onChange={e => setCustomSearch(e.target.value)}
              className="location-search-input"
            />
          </div>
          <button type="submit" className="btn-secondary location-set-btn">
            Set
          </button>
        </form>

        {/* Preset Food Hubs Grid */}
        <div className="location-hubs-grid">
          {filteredHubs.map(hub => {
            const isCurrent = currentLocationName && currentLocationName.toLowerCase().includes(hub.name.toLowerCase());
            return (
              <button
                key={hub.name}
                type="button"
                className={`location-hub-card ${isCurrent ? 'selected' : ''}`}
                onClick={() => handleSelectHub(hub)}
              >
                <div className="hub-card-top">
                  <Building2 size={16} className="text-primary" />
                  <h4>{hub.name}</h4>
                  <span className="hub-city-tag">{hub.city}</span>
                  {isCurrent && <span className="hub-current-tag">Current</span>}
                </div>
                <p className="hub-tagline">{hub.tagline}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
