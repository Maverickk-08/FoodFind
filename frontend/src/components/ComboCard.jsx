import React from 'react';
import { 
  Star, 
  MapPin, 
  Sparkles, 
  Vote, 
  ExternalLink, 
  Sliders,
  Split,
  Share2,
  Heart
} from 'lucide-react';

export default function ComboCard({ 
  combo, 
  budget, 
  people, 
  onViewRestaurant, 
  onVoteCombo,
  onCustomizeCombo,
  onSplitBill,
  onShareCombo,
  onToggleFavorite,
  isFavorite
}) {
  const savings = Math.max(0, budget - combo.totalPrice);
  const savingsPercent = budget > 0 ? Math.round((savings / budget) * 100) : 0;

  return (
    <div className="combo-card animate-fade-in">
      {/* Card Header */}
      <div className="combo-card-header">
        <div className="restaurant-meta-group">
          <div className="restaurant-title-row">
            <h3 className="restaurant-name" onClick={() => onViewRestaurant(combo.restaurantId)}>
              {combo.restaurantName}
            </h3>
            <span className="match-tag-badge">{combo.matchTag}</span>
          </div>

          <div className="restaurant-submeta">
            <span className="rating-pill">
              <Star size={14} className="star-icon fill-gold" />
              <strong>{combo.restaurantRating}</strong>
              <span className="review-count">({combo.reviewCount || '500+'})</span>
            </span>

            <span className="meta-separator">•</span>
            <span className="cuisine-text">{combo.cuisine}</span>
            <span className="meta-separator">•</span>
            <span className="distance-pill">
              <MapPin size={13} />
              {combo.distanceKm} km ({combo.area})
            </span>
          </div>
        </div>

        <div className="combo-header-right">
          <button
            type="button"
            className={`btn-fav-icon ${isFavorite ? 'active' : ''}`}
            onClick={() => onToggleFavorite(combo)}
            title={isFavorite ? "Remove from favorites" : "Save this combo"}
          >
            <Heart size={18} className={isFavorite ? "fill-coral text-coral" : "text-slate-400"} />
          </button>

          <div className="combo-score-badge" title="Recommendation Match Score">
            <span className="score-label">Match Score</span>
            <span className="score-value">{combo.score}</span>
          </div>
        </div>
      </div>

      {/* Highlight Tags */}
      {combo.highlightBadges && combo.highlightBadges.length > 0 && (
        <div className="highlight-badges-row">
          {combo.highlightBadges.map((badge, idx) => (
            <span key={idx} className="highlight-badge-pill">
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Itemized Combo Breakdown */}
      <div className="combo-items-box">
        <div className="combo-items-header">
          <span className="box-title">Recommended Food Combination:</span>
          <span className="items-count-badge">{combo.items.reduce((acc, curr) => acc + curr.quantity, 0)} Items Total</span>
        </div>

        <div className="combo-items-list">
          {combo.items.map((item, idx) => (
            <div key={idx} className="combo-item-row">
              <div className="item-qty-badge">
                {item.quantity}×
              </div>

              <div className="item-details">
                <div className="item-name-row">
                  <span className="item-diet-dot" title={item.foodType}>
                    {item.foodType === 'VEG' ? '🟢' : item.foodType === 'EGGETARIAN' ? '🟡' : '🔴'}
                  </span>
                  <span className="item-name">{item.name}</span>
                  {item.spiceLevel && (
                    <span className="item-spice-tag">
                      {item.spiceLevel === 'SPICY' || item.spiceLevel === 'EXTRA_SPICY' ? '🌶️' : '🌿'}
                    </span>
                  )}
                  <span className="item-category-tag">{item.category}</span>
                </div>
                {item.description && (
                  <p className="item-desc-snippet">{item.description}</p>
                )}
              </div>

              <div className="item-price-calc">
                <span className="item-unit-price">₹{item.pricePerUnit} ea</span>
                <span className="item-subtotal">₹{item.subtotal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial & Serving Breakdown Grid */}
      <div className="combo-metrics-grid">
        <div className="metric-cell total-price-cell">
          <span className="metric-label">Total Combo Bill</span>
          <span className="metric-big-val">₹{combo.totalPrice}</span>
          <span className="metric-subtext">for {people} friends</span>
        </div>

        <div className="metric-cell savings-cell">
          <span className="metric-label">Budget Savings</span>
          <span className="metric-big-val savings-green">₹{savings.toFixed(0)}</span>
          <span className="metric-subtext">{savingsPercent}% under ₹{budget}</span>
        </div>

        <div className="metric-cell per-head-cell">
          <span className="metric-label">Cost Per Person</span>
          <span className="metric-big-val">₹{combo.pricePerPerson}</span>
          <span className="metric-subtext">Fair split</span>
        </div>

        <div className="metric-cell servings-cell">
          <span className="metric-label">Food Capacity</span>
          <span className="metric-big-val">~{combo.totalServingsEstimated}</span>
          <span className="metric-subtext">Servings fulfilled</span>
        </div>
      </div>

      {/* Explanation Rationale Box */}
      <div className="explanation-callout-box">
        <div className="explanation-icon-wrapper">
          <Sparkles size={16} className="text-primary" />
        </div>
        <div className="explanation-content">
          <span className="explanation-title">Why this combination for your group:</span>
          <p className="explanation-text">{combo.explanation}</p>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="combo-card-actions-grid">
        <button
          type="button"
          className="btn-card-action btn-tweak"
          onClick={() => onCustomizeCombo(combo)}
          title="Swap or add dishes to customize this combo"
        >
          <Sliders size={14} />
          <span>Tweak Combo</span>
        </button>

        <button
          type="button"
          className="btn-card-action btn-split"
          onClick={() => onSplitBill(combo)}
          title="Calculate equal or veg/non-veg split & generate UPI QR"
        >
          <Split size={14} />
          <span>Split Bill & UPI</span>
        </button>

        <button
          type="button"
          className="btn-card-action btn-share"
          onClick={() => onShareCombo(combo)}
          title="Share to WhatsApp group"
        >
          <Share2 size={14} />
          <span>Share</span>
        </button>

        <button
          type="button"
          className="btn-card-action btn-menu"
          onClick={() => onViewRestaurant(combo.restaurantId)}
          title="View full restaurant menu"
        >
          <ExternalLink size={14} />
          <span>Full Menu</span>
        </button>

        <button
          type="button"
          className="btn-card-action btn-vote"
          onClick={() => onVoteCombo(combo)}
          title="Add vote to group decision room"
        >
          <Vote size={14} />
          <span>Vote</span>
        </button>
      </div>
    </div>
  );
}
