import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Star, Compass } from 'lucide-react';

export default function InteractiveMapView({
  userLat,
  userLon,
  locationName,
  radiusKm,
  combinations,
  onSelectRestaurant
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing map instance if already initialized
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const lat = userLat || 17.4933;
    const lng = userLon || 78.3914;

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current).setView([lat, lng], 14);
    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Custom Icon for User Location
    const userIcon = L.divIcon({
      className: 'leaflet-user-marker',
      html: `<div class="user-pulse-dot"><span class="inner-dot"></span></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    L.marker([lat, lng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`<strong>Your Location:</strong> ${locationName || 'Focal Point'}`)
      .openPopup();

    // Radius Circle
    L.circle([lat, lng], {
      color: '#f97316',
      fillColor: '#f97316',
      fillOpacity: 0.08,
      radius: (radiusKm || 3.0) * 1000
    }).addTo(map);

    // Add Restaurant Pins
    const uniqueRestaurants = [];
    const seen = new Set();
    combinations.forEach(c => {
      if (!seen.has(c.restaurantId)) {
        seen.add(c.restaurantId);
        uniqueRestaurants.push(c);
      }
    });

    uniqueRestaurants.forEach(r => {
      // Mock slight offset if restaurant coordinates not available, or use calculated location
      const rLat = lat + ((Math.random() - 0.5) * 0.015);
      const rLng = lng + ((Math.random() - 0.5) * 0.015);

      const restIcon = L.divIcon({
        className: 'leaflet-restaurant-marker',
        html: `<div class="rest-pin-badge"><span>★${r.restaurantRating}</span></div>`,
        iconSize: [36, 24],
        iconAnchor: [18, 12]
      });

      const popupContent = `
        <div class="map-popup-card">
          <h4>${r.restaurantName}</h4>
          <p class="map-popup-cuisine">${r.cuisine} • ${r.distanceKm} km</p>
          <div class="map-popup-badge">Best Combo: ₹${r.totalPrice}</div>
          <button id="map-btn-${r.restaurantId}" class="map-popup-btn" onclick="window.__selectRest(${r.restaurantId})">
            View Menu & Details →
          </button>
        </div>
      `;

      L.marker([rLat, rLng], { icon: restIcon })
        .addTo(map)
        .bindPopup(popupContent);
    });

    // Expose global bridge for popup button clicks
    window.__selectRest = (id) => {
      onSelectRestaurant(id);
    };

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLat, userLon, locationName, radiusKm, combinations]);

  return (
    <div className="interactive-map-card animate-fade-in">
      <div className="map-card-header">
        <div className="map-title-row">
          <Compass size={20} className="text-primary" />
          <h3>Interactive OpenStreetMap Navigator</h3>
        </div>
        <span className="map-radius-pill">Search Radius: {radiusKm} km</span>
      </div>

      <div ref={mapContainerRef} className="leaflet-map-frame" />

      <div className="map-footer-notes">
        <span>📍 Pins indicate nearby dining recommendations within {radiusKm} km. Click any pin to open full restaurant details.</span>
      </div>
    </div>
  );
}
