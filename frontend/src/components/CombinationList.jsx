import React from 'react';
import ComboCard from './ComboCard.jsx';
import { Utensils, AlertCircle, RefreshCw } from 'lucide-react';

export default function CombinationList({
  combinations,
  budget,
  people,
  loading,
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

  if (!combinations || combinations.length === 0) {
    return (
      <div className="combo-list-state empty-state">
        <div className="empty-icon-box">
          <Utensils size={40} className="text-slate-400" />
        </div>
        <h3>No direct combination match within ₹{budget}</h3>
        <p>
          We couldn't generate a complete meal combination satisfying all constraints for {people} people within ₹{budget} budget.
        </p>
        <div className="empty-suggestions-box">
          <span>💡 Suggestions to find great food:</span>
          <ul>
            <li>Increase your budget by ₹100 - ₹200.</li>
            <li>Expand your search radius from 3 km to 5 km.</li>
            <li>Relax dietary or cuisine filters to discover more restaurants.</li>
          </ul>
        </div>
        <button type="button" className="btn-secondary" onClick={onResetFilters}>
          Reset Constraints to Default
        </button>
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
            Ranked by score for a group of {people} with ₹{budget} budget
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
