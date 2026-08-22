import React from 'react';
import { 
  X, 
  Heart, 
  Trash2, 
  ExternalLink, 
  Users, 
  IndianRupee, 
  Star, 
  UtensilsCrossed 
} from 'lucide-react';

export default function FavoritesDrawer({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onSelectFavorite
}) {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay animate-fade-in" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <Heart size={20} className="text-coral fill-coral" />
            <h2>Saved Group Combos ({favorites.length})</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {favorites.length === 0 ? (
          <div className="drawer-empty-state">
            <UtensilsCrossed size={40} className="text-slate-300" />
            <h3>No Saved Combos Yet</h3>
            <p>Click the bookmark icon (❤️) on any recommended combo card to save it here for future group dinners!</p>
          </div>
        ) : (
          <div className="drawer-favorites-list">
            {favorites.map((fav) => (
              <div key={fav.id || fav.comboId} className="drawer-fav-card">
                <div className="fav-card-header">
                  <div className="fav-title-group">
                    <strong className="fav-rest-name">{fav.restaurantName}</strong>
                    <span className="fav-rating-pill">
                      <Star size={12} className="star-icon fill-gold" /> {fav.restaurantRating}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-delete-fav"
                    onClick={() => onRemoveFavorite(fav.comboId || fav.id)}
                    title="Remove from favorites"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <p className="fav-items-summary">
                  {fav.itemsSummary || (fav.items ? fav.items.map(i => `${i.quantity}x ${i.name}`).join(' + ') : 'Custom Combo')}
                </p>

                <div className="fav-card-footer">
                  <span className="fav-price-tag">₹{fav.totalPrice}</span>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => {
                      onSelectFavorite(fav);
                      onClose();
                    }}
                  >
                    <span>View Details →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
