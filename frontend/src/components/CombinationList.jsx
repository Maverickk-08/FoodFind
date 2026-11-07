import React from 'react';
import ComboCard from './ComboCard.jsx';
import { 
  Utensils, 
  AlertCircle, 
  RefreshCw, 
  MapPinOff, 
  Navigation, 
  Compass, 
  MapPin,
  ArrowRight
} from 'lucide-react';

export default function CombinationList({
  combinations,
  budget,
  people,
  loading,
  nearbyStats,
  targetLocationName,
  radiusKm = 3.0,
  onExpandRadius,
  onSwitchToCityHub,
  onOpenLocationPrompt,
  onViewRestaurant,
  onVoteCombo,
  onCustomizeCombo,
  onSplitBill,
  onShareCombo,
  onToggleFavorite,
  favorites = [],
  onResetFilters
}) {
  if (loading) {
    return (
      <div className="combo-list-state loading-state">
        <div className="spinner-food-box">
          <RefreshCw size={36} className="spin-animation text-primary" />
        </div>
        <h3>Computing Food Combinations...</h3>
        <p>Analyzing nearby restaurant menus, matching portions for {people} friends, and optimizing budget fit.</p>
      </div>
    );
  }

  // 1. Specific Message: Location is OUT OF SERVICE AREA (we don't serve at their location)
  if (nearbyStats?.isUnservedLocation) {
    return (
      <div className="combo-list-state empty-state unserved-state animate-fade-in">
        <div className="empty-icon-box unserved-icon-box">
          <MapPinOff size={44} className="text-primary" />
        </div>
        <div className="unserved-badge-pill">Service Area Notice</div>
        <h3>We don't serve in {targetLocationName || "your location"} yet!</h3>
        <p className="unserved-explanation">
          FoodFind's dining discovery and portion-optimized group bundles are currently active in <strong>Visakhapatnam (Vizag)</strong> and <strong>Hyderabad</strong>. We haven't launched in your current location yet.
        </p>

        <div className="unserved-city-picker">
          <span className="unserved-picker-title">Explore active foodie cities:</span>
          <div className="unserved-city-buttons">
            <button
              type="button"
              className="btn-primary unserved-action-btn"
              onClick={() => onSwitchToCityHub && onSwitchToCityHub('VISAKHAPATNAM')}
            >
              <Compass size={18} />
              <span>Explore Visakhapatnam (Vizag) Hubs</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="btn-secondary unserved-action-btn"
              onClick={() => onSwitchToCityHub && onSwitchToCityHub('HYDERABAD')}
            >
              <Compass size={18} />
              <span>Explore Hyderabad Hubs</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <button 
          type="button" 
          className="btn-outline-text"
          onClick={onOpenLocationPrompt}
        >
          <MapPin size={15} />
          <span>Pick a specific neighborhood manually ▾</span>
        </button>
      </div>
    );
  }

  // 2. Specific Message: Served city, but NO RESTAURANTS within user's chosen radius
  if (nearbyStats?.checked && nearbyStats?.restaurantsInRadius === 0 && nearbyStats?.nearestRestaurant) {
    const nearest = nearbyStats.nearestRestaurant;
    const distanceKm = nearest.distanceKm ? nearest.distanceKm.toFixed(1) : '?';
    const suggestedRadius = Math.min(25, Math.ceil((nearest.distanceKm || 3) + 1));

    return (
      <div className="combo-list-state empty-state radius-empty-state animate-fade-in">
        <div className="empty-icon-box">
          <Navigation size={42} className="text-amber-400" />
        </div>
        <div className="radius-badge-pill">Radius Filter</div>
        <h3>No restaurants found within {radiusKm} km of {targetLocationName}</h3>
        <p>
          We couldn't find active partner restaurants inside your current {radiusKm} km search radius.
          The closest available spot is <strong>{nearest.name}</strong> ({distanceKm} km away in {nearest.area}).
        </p>

        <div className="radius-action-row">
          <button
            type="button"
            className="btn-primary"
            onClick={() => onExpandRadius && onExpandRadius(suggestedRadius)}
          >
            <RefreshCw size={16} />
            <span>Expand Search Radius to {suggestedRadius} km</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={onOpenLocationPrompt}
          >
            <MapPin size={16} />
            <span>Change Neighborhood</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Fallback: Restaurants exist in radius, but NO COMBOS match budget / dietary constraints
  if (!combinations || combinations.length === 0) {
    return (
      <div className="combo-list-state empty-state animate-fade-in">
        <div className="empty-icon-box">
          <Utensils size={40} className="text-slate-400" />
        </div>
        <h3>No meal combination match within ₹{budget}</h3>
        <p>
          We found restaurants in your area, but couldn't assemble a balanced meal satisfying all group constraints for {people} people within ₹{budget} budget.
        </p>
        <div className="empty-suggestions-box">
          <span>💡 Suggestions to find great food:</span>
          <ul>
            <li>Increase your budget by ₹100 - ₹200.</li>
            <li>Expand your search radius from {radiusKm} km to {Math.min(20, radiusKm + 3)} km.</li>
            <li>Relax dietary or cuisine filters to discover more restaurant menus.</li>
          </ul>
        </div>
        <div className="empty-action-row">
          <button type="button" className="btn-secondary" onClick={onResetFilters}>
            Reset Constraints to Default
          </button>
          <button type="button" className="btn-secondary" onClick={onOpenLocationPrompt}>
            Change Location
          </button>
        </div>
      </div>
    );
  }

  const isFavorite = (comboId) => {
    return favorites.some(f => f.comboId === comboId || f.id === comboId);
  };

  return (
    <div className="combination-results-section">
      <div className="results-status-bar">
        <div className="status-title-group">
          <h2>
            Found <span className="highlight-count">{combinations.length}</span> Optimal Food Recommendations
          </h2>
          <p className="status-subtitle">
            Ranked by score for a group of {people} with ₹{budget} budget near {targetLocationName}
          </p>
        </div>
      </div>

      <div className="combination-cards-grid">
        {combinations.map((combo) => (
          <ComboCard
            key={combo.id}
            combo={combo}
            budget={budget}
            people={people}
            onViewRestaurant={onViewRestaurant}
            onVoteCombo={onVoteCombo}
            onCustomizeCombo={onCustomizeCombo}
            onSplitBill={onSplitBill}
            onShareCombo={onShareCombo}
            onToggleFavorite={onToggleFavorite}
            isFavorite={isFavorite(combo.id)}
          />
        ))}
      </div>
    </div>
  );
}
