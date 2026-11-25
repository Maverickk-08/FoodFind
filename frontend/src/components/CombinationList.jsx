import React from 'react';
import ComboCard from './ComboCard.jsx';
import { 
  Utensils, 
  RefreshCw, 
  MapPinOff, 
  Navigation, 
  Compass, 
  MapPin
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
          <RefreshCw size={32} className="spin-animation text-primary" />
        </div>
        <h3>Computing Food Combinations...</h3>
        <p>Analyzing nearby restaurant menus, matching portions for {people} friends within ₹{budget}.</p>
      </div>
    );
  }

  // 1. Specific Message: Location is OUT OF SERVICE AREA (we don't serve at their location yet)
  if (nearbyStats?.isUnservedLocation) {
    return (
      <div className="combo-list-state empty-state unserved-state animate-fade-in">
        <div className="empty-icon-box unserved-icon-box">
          <MapPinOff size={38} className="text-primary" />
        </div>
        <div className="unserved-badge-pill">Service Area Notice</div>
        <h3>We're not serving in {targetLocationName || "this location"} yet!</h3>
        <p className="unserved-explanation">
          FoodFind is currently active in <strong>Hyderabad</strong> (Gowlidoddy, Gachibowli, Hitec City, Madhapur, KPHB). We are expanding to new neighborhoods soon.
        </p>

        <div className="unserved-city-picker">
          <button
            type="button"
            className="btn-primary unserved-action-btn"
            onClick={onOpenLocationPrompt}
          >
            <MapPin size={17} />
            <span>Choose a Hyderabad Dining Hub</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Specific Message: Served area, but NO RESTAURANTS within user's chosen radius
  if (nearbyStats?.checked && nearbyStats?.restaurantsInRadius === 0 && nearbyStats?.nearestRestaurant) {
    const nearest = nearbyStats.nearestRestaurant;
    const distanceKm = nearest.distanceKm ? nearest.distanceKm.toFixed(1) : '?';
    const suggestedRadius = Math.min(25, Math.ceil((nearest.distanceKm || 3) + 1));

    return (
      <div className="combo-list-state empty-state radius-empty-state animate-fade-in">
        <div className="empty-icon-box">
          <Navigation size={38} className="text-amber-400" />
        </div>
        <div className="radius-badge-pill">Radius Filter</div>
        <h3>No restaurants found within {radiusKm} km of {targetLocationName}</h3>
        <p>
          The closest available spot is <strong>{nearest.name}</strong> ({distanceKm} km away in {nearest.area}).
        </p>

        <div className="radius-action-row">
          <button
            type="button"
            className="btn-primary"
            onClick={() => onExpandRadius && onExpandRadius(suggestedRadius)}
          >
            <RefreshCw size={15} />
            <span>Expand Radius to {suggestedRadius} km</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={onOpenLocationPrompt}
          >
            <MapPin size={15} />
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
          <Utensils size={36} className="text-slate-400" />
        </div>
        <h3>No combinations match within ₹{budget}</h3>
        <p>
          We found restaurants nearby, but couldn't assemble a balanced meal fulfilling group hunger for {people} people within ₹{budget}.
        </p>
        <div className="empty-suggestions-box">
          <span>💡 Quick Suggestions:</span>
          <ul>
            <li>Increase budget slightly (e.g. ₹100 - ₹200).</li>
            <li>Expand radius to {Math.min(15, radiusKm + 2)} km.</li>
            <li>Try "All Cravings" to discover more menu options.</li>
          </ul>
        </div>
        <div className="empty-action-row">
          <button type="button" className="btn-secondary" onClick={onResetFilters}>
            Reset Constraints
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
    <div id="results-section" className="combination-results-section">
      <div className="results-status-bar">
        <div className="status-title-group">
          <h2>
            Found <span className="highlight-count">{combinations.length}</span> Food Recommendations
          </h2>
          <p className="status-subtitle">
            Portion-balanced for {people} friends · ₹{budget} budget near {targetLocationName}
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
