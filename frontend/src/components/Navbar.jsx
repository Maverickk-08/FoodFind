import React from 'react';
import { UtensilsCrossed, Users, Sparkles, MapPin, Heart, ShieldCheck } from 'lucide-react';

export default function Navbar({ 
  currentLocationName, 
  onOpenDecisionRoom, 
  onSurpriseMeClick,
  onOpenFavorites,
  onOpenAdmin,
  onChangeLocation,
  favoriteCount = 0
}) {
  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="logo-icon-box">
            <UtensilsCrossed className="logo-icon" size={24} />
          </div>
          <div className="logo-text-group">
            <div className="brand-title">Food<span>Find</span></div>
            <span className="brand-tagline">Group Dining Decision Engine</span>
          </div>
        </div>

        {/* Center Location Pill (Clickable to change location) */}
        <button 
          className="location-pill clickable" 
          onClick={onChangeLocation}
          title="Click to switch area or use live GPS"
        >
          <MapPin size={16} className="loc-pin-icon text-primary" />
          <span className="loc-text">{currentLocationName || "Detecting Location..."}</span>
          <span className="loc-badge">Change ▾</span>
        </button>

        {/* Action Buttons */}
        <div className="navbar-actions">
          <button 
            id="nav-favorites-btn"
            className="btn-secondary nav-action-btn"
            onClick={onOpenFavorites}
            title="View saved favorite combos"
          >
            <Heart size={16} className="text-coral" />
            <span className="btn-label">Saved</span>
            {favoriteCount > 0 && <span className="fav-count-pill">{favoriteCount}</span>}
          </button>

          <button 
            id="nav-surprise-btn"
            className="btn-secondary nav-action-btn"
            onClick={onSurpriseMeClick}
            title="Get a unique unexpected food combination"
          >
            <Sparkles size={16} className="spin-on-hover" />
            <span className="btn-label">Surprise Me</span>
          </button>

          <button 
            id="nav-admin-btn"
            className="btn-secondary nav-action-btn"
            onClick={onOpenAdmin}
            title="Admin Portal - Manage Restaurants & Menus"
          >
            <ShieldCheck size={16} className="text-primary" />
            <span className="btn-label">Admin</span>
          </button>

          <button 
            id="nav-decision-room-btn"
            className="btn-primary nav-action-btn"
            onClick={onOpenDecisionRoom}
            title="Open Friend Voting & Decision Room"
          >
            <Users size={16} />
            <span className="btn-label">Group Decision Room</span>
          </button>
        </div>
      </div>
    </header>
  );
}
