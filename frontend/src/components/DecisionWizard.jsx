import React, { useState } from 'react';
import { 
  Users, 
  IndianRupee, 
  MapPin, 
  Compass, 
  Flame, 
  Leaf, 
  Ban, 
  SlidersHorizontal,
  ChevronDown,
  Navigation,
  Utensils
} from 'lucide-react';

export default function DecisionWizard({
  params,
  setParams,
  locationHubs,
  onFetchRecommendations,
  loading
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [avoidInput, setAvoidInput] = useState('');

  const cuisineOptions = [
    "Hyderabadi",
    "North Indian",
    "Arabian",
    "Chinese",
    "Street Food",
    "South Indian",
    "Burgers",
    "Cafe"
  ];

  const budgetPresets = [
    { label: "₹400 (Quick Bites)", value: 400 },
    { label: "₹800 (Group Meal)", value: 800 },
    { label: "₹1,200 (Feast)", value: 1200 },
    { label: "₹2,000 (Royal Party)", value: 2000 },
  ];

  const handlePeopleChange = (newCount) => {
    if (newCount >= 1 && newCount <= 12) {
      setParams(prev => ({ ...prev, people: newCount }));
    }
  };

  const handleLocationHubSelect = (e) => {
    const hubId = e.target.value;
    const selectedHub = locationHubs.find(h => h.id.toString() === hubId);
    if (selectedHub) {
      setParams(prev => ({
        ...prev,
        latitude: selectedHub.latitude,
        longitude: selectedHub.longitude,
        targetLocationName: selectedHub.name
      }));
    }
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setParams(prev => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            targetLocationName: "Your Live GPS Location"
          }));
        },
        (err) => {
          alert("Could not retrieve GPS location. Using default location hub.");
        }
      );
    }
  };

  const handleDietaryToggle = (type) => {
    setParams(prev => ({
      ...prev,
      foodType: prev.foodType === type ? null : type
    }));
  };

  const handleSpiceSelect = (level) => {
    setParams(prev => ({
      ...prev,
      spiceLevel: prev.spiceLevel === level ? null : level
    }));
  };

  const handleCuisineToggle = (c) => {
    setParams(prev => {
      const current = prev.cuisines || [];
      const updated = current.includes(c) 
        ? current.filter(x => x !== c)
        : [...current, c];
      return { ...prev, cuisines: updated };
    });
  };

  const handleAddAvoidTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = avoidInput.trim().toLowerCase();
      if (val && (!params.avoidItems || !params.avoidItems.includes(val))) {
        setParams(prev => ({
          ...prev,
          avoidItems: [...(prev.avoidItems || []), val]
        }));
        setAvoidInput('');
      }
    }
  };

  const handleRemoveAvoidTag = (tag) => {
    setParams(prev => ({
      ...prev,
      avoidItems: (prev.avoidItems || []).filter(t => t !== tag)
    }));
  };

  return (
    <div className="decision-wizard-card">
      <div className="wizard-header">
        <div className="wizard-header-title">
          <SlidersHorizontal size={20} className="text-primary" />
          <h2>Group Dining Decision Criteria</h2>
        </div>
        <p className="wizard-subtitle">
          Configure your group's constraints to generate the best nearby food combinations.
        </p>
      </div>

      <div className="wizard-grid">
        {/* 1. Group Size Stepper */}
        <div className="form-group-box">
          <label className="form-label">
            <Users size={16} className="form-label-icon" />
            <span>How many people?</span>
            <span className="people-badge-count">{params.people} Friends</span>
          </label>
          <div className="stepper-row">
            <div className="stepper-controls">
              <button 
                type="button"
                className="btn-stepper"
                onClick={() => handlePeopleChange(params.people - 1)}
                disabled={params.people <= 1}
              >-</button>
              <div className="stepper-display">
                <span className="stepper-num">{params.people}</span>
                <span className="stepper-unit">{params.people === 1 ? 'Person' : 'People'}</span>
              </div>
              <button 
                type="button"
                className="btn-stepper"
                onClick={() => handlePeopleChange(params.people + 1)}
                disabled={params.people >= 12}
              >+</button>
            </div>
            
            {/* Visual Avatars */}
            <div className="avatars-preview">
              {Array.from({ length: Math.min(params.people, 6) }).map((_, i) => (
                <span key={i} className="friend-avatar" title={`Friend ${i + 1}`}>
                  {['😎', '😋', '🥳', '🤩', '🤠', '😇'][i % 6]}
                </span>
              ))}
              {params.people > 6 && <span className="friend-avatar-more">+{params.people - 6}</span>}
            </div>
          </div>
        </div>

        {/* 2. Budget Controls */}
        <div className="form-group-box">
          <div className="budget-label-row">
            <label className="form-label">
              <IndianRupee size={16} className="form-label-icon" />
              <span>{params.isPerPersonBudget ? "Budget Per Person" : "Total Group Budget"}</span>
            </label>
            <button
              type="button"
              className="toggle-budget-type"
              onClick={() => setParams(prev => ({ ...prev, isPerPersonBudget: !prev.isPerPersonBudget }))}
            >
              Switch to {params.isPerPersonBudget ? "Total Budget" : "Per-Person"}
            </button>
          </div>

          <div className="budget-input-wrapper">
            <span className="currency-symbol">₹</span>
            <input
              id="budget-input-field"
              type="number"
              min="50"
              step="50"
              className="budget-input"
              value={params.budget}
              onChange={(e) => setParams(prev => ({ ...prev, budget: Math.max(50, Number(e.target.value)) }))}
            />
            <div className="effective-budget-calc">
              {params.isPerPersonBudget ? (
                <span>Total: ₹{(params.budget * params.people).toFixed(0)}</span>
              ) : (
                <span>₹{(params.budget / params.people).toFixed(0)} / person</span>
              )}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="preset-chips">
            {budgetPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className={`preset-chip ${params.budget === preset.value && !params.isPerPersonBudget ? 'active' : ''}`}
                onClick={() => setParams(prev => ({ ...prev, budget: preset.value, isPerPersonBudget: false }))}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Location & Radius */}
        <div className="form-group-box">
          <label className="form-label">
            <MapPin size={16} className="form-label-icon" />
            <span>Where are you eating?</span>
          </label>
          <div className="location-select-row">
            <select
              id="location-hub-select"
              className="form-select location-dropdown"
              onChange={handleLocationHubSelect}
              value={locationHubs.find(h => h.latitude === params.latitude && h.longitude === params.longitude)?.id || ""}
            >
              <option value="" disabled>Select Food Hub</option>
              {locationHubs.map(hub => (
                <option key={hub.id} value={hub.id}>
                  {hub.name} ({hub.city})
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn-gps"
              onClick={handleDetectLocation}
              title="Detect live GPS"
            >
              <Navigation size={16} />
              <span>GPS</span>
            </button>
          </div>

          {/* Radius Slider */}
          <div className="radius-slider-group">
            <div className="radius-label-row">
              <span className="sub-label">Search Radius</span>
              <span className="radius-val">{params.radiusKm} km</span>
            </div>
            <input
              id="radius-slider"
              type="range"
              min="1"
              max="10"
              step="0.5"
              className="range-slider"
              value={params.radiusKm}
              onChange={(e) => setParams(prev => ({ ...prev, radiusKm: parseFloat(e.target.value) }))}
            />
          </div>
        </div>

        {/* 4. Dietary & Food Type */}
        <div className="form-group-box">
          <label className="form-label">
            <Leaf size={16} className="form-label-icon" />
            <span>Dietary Preference</span>
          </label>
          <div className="dietary-pills-row">
            <button
              type="button"
              className={`diet-pill ${params.foodType === null ? 'active' : ''}`}
              onClick={() => setParams(prev => ({ ...prev, foodType: null }))}
            >
              All Cravings
            </button>
            <button
              type="button"
              className={`diet-pill veg ${params.foodType === 'VEG' ? 'active' : ''}`}
              onClick={() => handleDietaryToggle('VEG')}
            >
              🟢 Pure Veg
            </button>
            <button
              type="button"
              className={`diet-pill non-veg ${params.foodType === 'NON_VEG' ? 'active' : ''}`}
              onClick={() => handleDietaryToggle('NON_VEG')}
            >
              🔴 Non-Veg
            </button>
            <button
              type="button"
              className={`diet-pill egg ${params.foodType === 'EGGETARIAN' ? 'active' : ''}`}
              onClick={() => handleDietaryToggle('EGGETARIAN')}
            >
              🟡 Eggetarian
            </button>
          </div>

          {/* Spice Level */}
          <div className="spice-row-group">
            <span className="sub-label">
              <Flame size={14} className="inline-icon text-coral" /> Spice Level
            </span>
            <div className="spice-chips">
              {['MILD', 'MEDIUM', 'SPICY', 'EXTRA_SPICY'].map((spice) => (
                <button
                  key={spice}
                  type="button"
                  className={`spice-chip ${params.spiceLevel === spice ? 'active' : ''}`}
                  onClick={() => handleSpiceSelect(spice)}
                >
                  {spice === 'MILD' && '🌿 Mild'}
                  {spice === 'MEDIUM' && '🌶️ Medium'}
                  {spice === 'SPICY' && '🔥 Spicy'}
                  {spice === 'EXTRA_SPICY' && '💥 Extra Hot'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Toggle */}
      <div className="advanced-toggle-row">
        <button
          type="button"
          className="btn-link-subtle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span>{showAdvanced ? "Hide Cuisine & Avoid Filters" : "+ Add Cuisines & Items to Avoid"}</span>
          <ChevronDown size={16} className={`chevron-icon ${showAdvanced ? 'rotated' : ''}`} />
        </button>
      </div>

      {/* Advanced Filter Box */}
      {showAdvanced && (
        <div className="advanced-filters-panel animate-fade-in">
          {/* Cuisines */}
          <div className="filter-sub-group">
            <span className="sub-label">
              <Utensils size={14} className="inline-icon" /> Preferred Cuisines (Optional)
            </span>
            <div className="cuisine-chips-grid">
              {cuisineOptions.map(c => {
                const isSelected = params.cuisines?.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    className={`cuisine-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => handleCuisineToggle(c)}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avoid items */}
          <div className="filter-sub-group">
            <span className="sub-label">
              <Ban size={14} className="inline-icon text-coral" /> Exclude Specific Items (e.g. Biryani, Seafood)
            </span>
            <div className="avoid-input-row">
              <input
                id="avoid-item-input"
                type="text"
                className="avoid-input"
                placeholder="Type item name and press Enter..."
                value={avoidInput}
                onChange={(e) => setAvoidInput(e.target.value)}
                onKeyDown={handleAddAvoidTag}
              />
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={handleAddAvoidTag}
              >
                Add Tag
              </button>
            </div>

            {/* Avoid Tags List */}
            {params.avoidItems && params.avoidItems.length > 0 && (
              <div className="avoid-tags-list">
                {params.avoidItems.map(tag => (
                  <span key={tag} className="avoid-tag">
                    <span>No {tag}</span>
                    <button type="button" onClick={() => handleRemoveAvoidTag(tag)}>&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Calculate Action */}
      <div className="wizard-action-footer">
        <button
          id="calculate-combos-btn"
          type="button"
          className="btn-primary btn-lg calculate-btn"
          onClick={onFetchRecommendations}
          disabled={loading}
        >
          {loading ? "Analyzing Menus & Finding Combinations..." : `Find Best Food Combinations for ${params.people} Friends →`}
        </button>
      </div>
    </div>
  );
}
