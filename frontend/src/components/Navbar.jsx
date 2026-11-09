import React, { useState } from 'react';
import { UtensilsCrossed, Users, Sparkles, MapPin, Heart, ShieldCheck, Menu, X } from 'lucide-react';

export default function Navbar({ 
  currentLocationName, 
  onOpenDecisionRoom, 
  onSurpriseMeClick,
  onOpenFavorites,
  onOpenAdmin,
  onChangeLocation,
  favoriteCount = 0
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="logo-icon-box">
            <UtensilsCrossed className="logo-icon" size={22} />
          </div>
          <div className="logo-text-group">
            <div className="brand-title">Food<span>Find</span></div>
            <span className="brand-tagline">Group Dining Decision Engine</span>
          </div>
        </div>

        {/* Center Location Pill — hidden on very small screens, shown in mobile menu */}
        <button 
          className="location-pill clickable nav-location-pill-desktop" 
          onClick={onChangeLocation}
          title="Click to switch area or use live GPS"
        >
          <MapPin size={15} className="loc-pin-icon text-primary" />
          <span className="loc-text">{currentLocationName || "Detecting..."}</span>
          <span className="loc-badge">Change ▾</span>
        </button>

        {/* Desktop Action Buttons */}
        <div className="navbar-actions desktop-nav-actions">
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
            <span className="btn-label">Group Room</span>
          </button>
        </div>

        {/* Mobile Right Side: Favorites count + Hamburger */}
        <div className="mobile-nav-right">
          {favoriteCount > 0 && (
            <button className="btn-secondary nav-action-btn mobile-fav-btn" onClick={onOpenFavorites}>
              <Heart size={18} className="text-coral" />
              <span className="fav-count-pill">{favoriteCount}</span>
            </button>
          )}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Location Sub-bar */}
      <div className="mobile-location-bar" onClick={onChangeLocation}>
        <MapPin size={14} className="text-primary" />
        <span>{currentLocationName || "Tap to set location"}</span>
        <span className="loc-badge">Change ▾</span>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-menu">
          <button className="mobile-nav-item" onClick={() => { onChangeLocation(); closeMobile(); }}>
            <MapPin size={18} className="text-primary" />
            <span>Change Location</span>
          </button>
          <button className="mobile-nav-item" onClick={() => { onSurpriseMeClick(); closeMobile(); }}>
            <Sparkles size={18} className="text-primary" />
            <span>Surprise Me</span>
          </button>
          <button className="mobile-nav-item" onClick={() => { onOpenDecisionRoom(); closeMobile(); }}>
            <Users size={18} className="text-primary" />
            <span>Group Decision Room</span>
          </button>
          <button className="mobile-nav-item" onClick={() => { onOpenFavorites(); closeMobile(); }}>
            <Heart size={18} className="text-coral" />
            <span>Saved Combos {favoriteCount > 0 && `(${favoriteCount})`}</span>
          </button>
          <button className="mobile-nav-item mobile-nav-admin" onClick={() => { onOpenAdmin(); closeMobile(); }}>
            <ShieldCheck size={18} />
            <span>Admin Portal</span>
          </button>
        </div>
      )}
    </header>
  );
}
