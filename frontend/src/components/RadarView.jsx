import React from 'react';
import { Compass, MapPin, Star, Navigation } from 'lucide-react';

export default function RadarView({
  combinations,
  radiusKm,
  locationName,
  onSelectRestaurant
}) {
  // Extract unique restaurants from combinations
  const uniqueRestaurants = [];
  const seenIds = new Set();
  
  combinations.forEach(c => {
    if (!seenIds.has(c.restaurantId)) {
      seenIds.add(c.restaurantId);
      uniqueRestaurants.push(c);
    }
  });

  return (
    <div className="radar-view-card animate-fade-in">
      <div className="radar-header">
        <div className="radar-title-row">
          <Compass size={20} className="text-primary" />
          <h3>Proximity Radar Map</h3>
        </div>
        <span className="radar-radius-badge">Within {radiusKm} km radius</span>
      </div>

      <div className="radar-circle-display">
        {/* Concentric Circles */}
        <div className="radar-ring ring-outer"></div>
        <div className="radar-ring ring-mid"></div>
        <div className="radar-ring ring-inner"></div>
        <div className="radar-axis axis-h"></div>
        <div className="radar-axis axis-v"></div>

        {/* Center User Pin */}
        <div className="radar-center-pin" title={`Your Location: ${locationName}`}>
          <div className="center-pulse"></div>
          <div className="center-dot">
            <Navigation size={12} className="text-white" />
          </div>
          <span className="center-label">You ({locationName})</span>
        </div>

        {/* Plotted Restaurant Pins */}
        {uniqueRestaurants.slice(0, 8).map((rest, index) => {
          // Angle around circle based on index
          const angle = (index * (360 / Math.min(uniqueRestaurants.length, 8))) * (Math.PI / 180);
          // Distance normalized from 0.2 to 0.85 of radius
          const distFactor = Math.min(0.85, Math.max(0.25, (rest.distanceKm / (radiusKm || 5.0))));
          const x = 50 + (distFactor * 42 * Math.cos(angle));
          const y = 50 + (distFactor * 42 * Math.sin(angle));

          return (
            <div
              key={rest.restaurantId}
              className="radar-restaurant-pin"
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => onSelectRestaurant(rest.restaurantId)}
              title={`${rest.restaurantName} - ${rest.distanceKm} km away (${rest.restaurantRating}★)`}
            >
              <div className="pin-dot">
                <span className="pin-rating">★{rest.restaurantRating}</span>
              </div>
              <span className="pin-name-label">{rest.restaurantName} ({rest.distanceKm}km)</span>
            </div>
          );
        })}
      </div>

      <div className="radar-footer-legend">
        <span className="legend-item">🎯 Center: Your Location</span>
        <span className="legend-item">📍 Dots: Nearby Dining Hubs</span>
        <span className="legend-item">💡 Click any pin to view full restaurant menu</span>
      </div>
    </div>
  );
}
