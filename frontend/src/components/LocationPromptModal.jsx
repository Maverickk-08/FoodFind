import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  X, 
  Search, 
  Loader2, 
  AlertCircle,
  Building2
} from 'lucide-react';
import { reverseGeocode } from '../utils/geoUtils.js';

// Hyderabad Food Hubs & Localities
const PRESET_HUBS = [
  { name: 'Gowlidoddy', city: 'Hyderabad', lat: 17.4292, lng: 78.3378, tagline: 'Hostels, Student Dhabas & Fast Bites' },
  { name: 'Gachibowli', city: 'Hyderabad', lat: 17.4401, lng: 78.3489, tagline: 'Night Dhabas, Tandoori & Mandi Hubs' },
  { name: 'Hitec City', city: 'Hyderabad', lat: 17.4435, lng: 78.3772, tagline: 'Tech Parks, Gourmet Burgers & Quick Combos' },
  { name: 'Madhapur', city: 'Hyderabad', lat: 17.4483, lng: 78.3915, tagline: 'Arabian Mandi, Cafes & Biryani' },
  { name: 'Kondapur', city: 'Hyderabad', lat: 17.4687, lng: 78.3615, tagline: 'North Indian Dhabas, Thalis & Biryani' },
  { name: 'KPHB Colony', city: 'Hyderabad', lat: 17.4933, lng: 78.3914, tagline: 'Biryani, Shawarmas & Student Street Food' },
  { name: 'Jubilee Hills', city: 'Hyderabad', lat: 17.4319, lng: 78.4073, tagline: 'Artisan Pizzas, Cafes & Continental' },
  { name: 'Banjara Hills', city: 'Hyderabad', lat: 17.4156, lng: 78.4357, tagline: 'Authentic Hyderabadi Haleem & Mughlai' }
];

export default function LocationPromptModal({ onClose, onSelectLocation, currentLocationName }) {
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [customSearch, setCustomSearch] = useState('');

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

          // Asynchronously reverse geocode coordinates to true neighborhood (e.g. Gowlidoddy)
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
          setGpsError("Could not resolve location name. Please select your area below.");
        } finally {
          setDetectingGps(false);
        }
      },
      (error) => {
        setDetectingGps(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError("Location permission denied. Please select your neighborhood below.");
        } else {
          setGpsError("Could not retrieve GPS coordinates. Please select an area below.");
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
      name: hub.name
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

    // Check if query matches any known hub
    const match = PRESET_HUBS.find(h => 
      h.name.toLowerCase().includes(query) || (h.tagline && h.tagline.toLowerCase().includes(query))
    );

    let locationData;
    if (match) {
      locationData = {
        latitude: match.lat,
        longitude: match.lng,
        name: match.name
      };
    } else {
      // Default to KPHB coordinates with custom label
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

  const filteredHubs = customSearch.trim()
    ? PRESET_HUBS.filter(h => 
        h.name.toLowerCase().includes(customSearch.toLowerCase()) || 
        h.tagline.toLowerCase().includes(customSearch.toLowerCase())
      )
    : PRESET_HUBS;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="location-bottom-sheet" onClick={e => e.stopPropagation()}>
        {/* Bottom sheet handle bar */}
        <div className="sheet-handle-bar" />

        <div className="location-sheet-header">
          <div className="location-sheet-title">
            <MapPin size={22} className="text-primary" />
            <h3>Select Dining Location</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Dismiss">
            <X size={18} />
          </button>
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
                <span>Locating your position...</span>
              </>
            ) : (
              <>
                <Navigation size={17} />
                <span>Use Current Live GPS Location</span>
              </>
            )}
          </button>

          {gpsError && (
            <div className="location-error-badge">
              <AlertCircle size={14} />
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        {/* Search Input */}
        <form onSubmit={handleCustomSubmit} className="location-search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search neighborhood (e.g. Gowlidoddy, Madhapur)..." 
            value={customSearch}
            onChange={e => setCustomSearch(e.target.value)}
            className="location-search-input"
          />
          {customSearch && (
            <button type="submit" className="btn-set-text">
              Set
            </button>
          )}
        </form>

        <div className="location-sheet-subtitle">
          <span>POPULAR DINING HUBS</span>
        </div>

        {/* Preset Food Hubs List */}
        <div className="location-hubs-scroll">
          {filteredHubs.map(hub => {
            const isCurrent = currentLocationName && currentLocationName.toLowerCase().includes(hub.name.toLowerCase());
            return (
              <button
                key={hub.name}
                type="button"
                className={`location-hub-item ${isCurrent ? 'selected' : ''}`}
                onClick={() => handleSelectHub(hub)}
              >
                <div className="hub-item-left">
                  <Building2 size={16} className="text-primary" />
                  <div className="hub-item-text">
                    <span className="hub-name">{hub.name}</span>
                    <span className="hub-tagline">{hub.tagline}</span>
                  </div>
                </div>
                {isCurrent && <span className="hub-current-tag">Current</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
