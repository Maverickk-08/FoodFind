import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Sparkles, 
  Vote, 
  ExternalLink, 
  Sliders,
  Split,
  Share2,
  Heart,
  ChevronDown,
  ChevronUp
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
  const [expanded, setExpanded] = useState(false);
  const savings = Math.max(0, budget - combo.totalPrice);
  const totalItemCount = combo.items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="combo-card compact-card animate-fade-in">
      {/* 1. Header: Restaurant Info & Score */}
      <div className="combo-card-header compact-header">
        <div className="restaurant-meta-group">
          <div className="restaurant-title-row">
            <h3 className="restaurant-name" onClick={() => onViewRestaurant(combo.restaurantId)}>
              {combo.restaurantName}
            </h3>
            {combo.matchTag && <span className="match-tag-badge">{combo.matchTag}</span>}
          </div>

          <div className="restaurant-submeta">
            <span className="rating-pill">
              <Star size={12} className="star-icon fill-gold" />
              <strong>{combo.restaurantRating}</strong>
            </span>
            <span className="meta-separator">•</span>
            <span className="cuisine-text">{combo.cuisine}</span>
            <span className="meta-separator">•</span>
            <span className="distance-pill">
              <MapPin size={11} />
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

          <div className="compact-score-badge" title="Recommendation Match Score">
            <span className="score-value">{combo.score}</span>
            <span className="score-label">MATCH</span>
          </div>
        </div>
      </div>

      {/* 2. Sleek Price & Split Bar */}
      <div className="combo-price-strip">
        <div className="price-left">
          <span className="price-main">₹{combo.totalPrice}</span>
          <span className="price-per-head">₹{combo.pricePerPerson}/head</span>
        </div>

        <div className="price-tags-right">
          {savings > 0 && (
            <span className="savings-pill">Save ₹{savings.toFixed(0)}</span>
          )}
          <span className="capacity-pill">~{combo.totalServingsEstimated} Servings</span>
        </div>
      </div>

      {/* 3. Items Preview & Expand Accordion */}
      <div className="combo-items-compact-section">
        <div className="items-summary-row" onClick={() => setExpanded(!expanded)}>
          <span className="items-summary-text">
            <strong>{totalItemCount} Items:</strong> {combo.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
          </span>
          <button type="button" className="btn-expand-items">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Detailed breakdown when expanded */}
        {expanded && (
          <div className="expanded-items-list animate-fade-in">
            {combo.items.map((item, idx) => (
              <div key={idx} className="expanded-item-row">
                <span className="item-diet-dot">
                  {item.foodType === 'VEG' ? '🟢' : item.foodType === 'EGGETARIAN' ? '🟡' : '🔴'}
                </span>
                <span className="expanded-item-qty">{item.quantity}×</span>
                <span className="expanded-item-name">{item.name}</span>
                <span className="expanded-item-price">₹{item.subtotal}</span>
              </div>
            ))}

            {combo.explanation && (
              <div className="compact-explanation">
                <Sparkles size={13} className="text-primary flex-shrink-0" />
                <span>{combo.explanation}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Streamlined Card Action Bar */}
      <div className="compact-actions-row">
        <button
          type="button"
          className="btn-card-primary"
          onClick={() => onSplitBill(combo)}
          title="Split Bill & UPI QR"
        >
          <Split size={14} />
          <span>Split Bill</span>
        </button>

        <button
          type="button"
          className="btn-card-secondary"
          onClick={() => onViewRestaurant(combo.restaurantId)}
          title="View Full Menu"
        >
          <ExternalLink size={14} />
          <span>Menu</span>
        </button>

        <div className="compact-icon-actions">
          <button
            type="button"
            className="btn-card-icon"
            onClick={() => onCustomizeCombo(combo)}
            title="Tweak Combo"
          >
            <Sliders size={15} />
          </button>

          <button
            type="button"
            className="btn-card-icon"
            onClick={() => onShareCombo(combo)}
            title="Share via WhatsApp"
          >
            <Share2 size={15} />
          </button>

          <button
            type="button"
            className="btn-card-icon"
            onClick={() => onVoteCombo(combo)}
            title="Add to Group Decision Room"
          >
            <Vote size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
