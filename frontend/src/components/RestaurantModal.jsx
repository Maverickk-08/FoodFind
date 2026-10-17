import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  Search, 
  Leaf, 
  Flame, 
  Utensils,
  Tag
} from 'lucide-react';
import { apiUrl } from '../config/api.js';

export default function RestaurantModal({ restaurantId, userLat, userLon, onClose }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    if (!restaurantId) return;

    setLoading(true);
    const params = new URLSearchParams();
    if (userLat) params.append('lat', userLat);
    if (userLon) params.append('lng', userLon);

    fetch(apiUrl(`/api/restaurants/${restaurantId}?${params.toString()}`))
      .then(res => res.json())
      .then(data => {
        setRestaurant(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching restaurant:", err);
        setLoading(false);
      });
  }, [restaurantId, userLat, userLon]);

  if (!restaurantId) return null;

  const categories = restaurant?.menuItems 
    ? ['ALL', ...Array.from(new Set(restaurant.menuItems.map(i => i.category)))]
    : ['ALL'];

  const filteredItems = restaurant?.menuItems?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.tags && item.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  }) || [];

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="restaurant-modal-content" onClick={e => e.stopPropagation()}>
        {/* Modal Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {loading ? (
          <div className="modal-loading-state">
            <div className="spinner-food-box small"></div>
            <p>Loading Restaurant & Menu Details...</p>
          </div>
        ) : restaurant ? (
          <>
            {/* Header Banner */}
            <div className="restaurant-banner">
              {restaurant.imageUrl && (
                <img 
                  src={restaurant.imageUrl} 
                  alt={restaurant.name}
                  className="restaurant-banner-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="restaurant-banner-overlay">
                <div className="banner-badge-row">
                  <span className="cuisine-badge">{restaurant.cuisine}</span>
                  {restaurant.priceRange && <span className="price-badge">{restaurant.priceRange}</span>}
                </div>
                <h2 className="banner-restaurant-name">{restaurant.name}</h2>
                <div className="banner-submeta">
                  <span className="rating-pill large">
                    <Star size={16} className="star-icon fill-gold" />
                    <strong>{restaurant.rating}</strong>
                    <span>({restaurant.reviewCount || 500}+ reviews)</span>
                  </span>
                  {restaurant.distanceKm !== undefined && (
                    <span className="distance-pill">
                      <MapPin size={14} />
                      {restaurant.distanceKm} km away
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Restaurant Quick Info Details */}
            <div className="restaurant-info-bar">
              <div className="info-bar-item">
                <MapPin size={16} className="text-primary" />
                <span>{restaurant.address}</span>
              </div>
              {restaurant.openingHours && (
                <div className="info-bar-item">
                  <Clock size={16} className="text-primary" />
                  <span>{restaurant.openingHours}</span>
                </div>
              )}
              {restaurant.phone && (
                <div className="info-bar-item">
                  <Phone size={16} className="text-primary" />
                  <span>{restaurant.phone}</span>
                </div>
              )}
            </div>

            {restaurant.description && (
              <div className="restaurant-desc-box">
                <p>{restaurant.description}</p>
              </div>
            )}

            {/* Menu Header & Search */}
            <div className="modal-menu-section">
              <div className="menu-section-header">
                <h3>Restaurant Menu ({restaurant.menuItems?.length || 0} items)</h3>
                
                <div className="menu-search-wrapper">
                  <Search size={16} className="menu-search-icon" />
                  <input
                    type="text"
                    placeholder="Search dishes or ingredients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="menu-search-input"
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="menu-categories-scroll">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`menu-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Menu Items List */}
              <div className="modal-menu-grid">
                {filteredItems.map(item => (
                  <div key={item.id} className="menu-item-card">
                    <div className="menu-item-main">
                      <div className="menu-item-title-row">
                        <span className="item-diet-indicator">
                          {item.foodType === 'VEG' ? '🟢' : item.foodType === 'EGGETARIAN' ? '🟡' : '🔴'}
                        </span>
                        <h4 className="item-title">{item.name}</h4>
                        {item.spiceLevel && (
                          <span className="spice-tag-mini" title={`Spice: ${item.spiceLevel}`}>
                            {item.spiceLevel === 'SPICY' || item.spiceLevel === 'EXTRA_SPICY' ? '🌶️' : ''}
                          </span>
                        )}
                      </div>

                      <div className="menu-item-price-tag">
                        ₹{item.price}
                      </div>

                      {item.description && (
                        <p className="menu-item-description">{item.description}</p>
                      )}

                      <div className="menu-item-tags">
                        <span className="item-tag-pill">{item.category}</span>
                        {item.servingCapacity && (
                          <span className="item-tag-pill">Serves ~{item.servingCapacity}</span>
                        )}
                        {item.isSignature && (
                          <span className="item-tag-pill signature">⭐ Chef Specialty</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="modal-error-state">
            <p>Restaurant details not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
