import React, { useState } from 'react';
import { 
  Users, 
  IndianRupee, 
  MapPin, 
  Flame, 
  Leaf, 
  Ban, 
  ChevronDown,
  Navigation,
  Utensils
} from 'lucide-react';
import { reverseGeocode } from '../utils/geoUtils.js';

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
    { label: "₹400", value: 400 },
    { label: "₹800", value: 800 },
    { label: "₹1,200", value: 1200 },
    { label: "₹2,000", value: 2000 },
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
      localStorage.setItem('foodfind_user_location', JSON.stringify({
        latitude: selectedHub.latitude,
        longitude: selectedHub.longitude,
        name: selectedHub.name
      }));
    }
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const resolvedName = await reverseGeocode(lat, lng, locationHubs);
          setParams(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            targetLocationName: resolvedName
          }));
          localStorage.setItem('foodfind_user_location', JSON.stringify({
            latitude: lat,
            longitude: lng,
            name: resolvedName
          }));
        },
        () => {
          alert("Could not retrieve GPS location. Please select your area from the dropdown.");
        },
        { timeout: 10000, enableHighAccuracy: true }
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
      <div className="wizard-grid compact-grid">
        {/* 1. Group Size & Budget Side-by-Side */}
        <div className="form-group-box compact-box">
          <div className="compact-header-row">
            <label className="form-label compact-label">
              <Users size={15} className="form-label-icon" />
              <span>Group Size</span>
            </label>
            <span className="people-badge-count">{params.people} People</span>
          </div>
          
          <div className="stepper-controls compact-stepper">
            <button 
              type="button"
              className="btn-stepper"
              onClick={() => handlePeopleChange(params.people - 1)}
              disabled={params.people <= 1}
            >-</button>
            <div className="stepper-display">
              <span className="stepper-num">{params.people}</span>
            </div>
            <button 
              type="button"
              className="btn-stepper"
              onClick={() => handlePeopleChange(params.people + 1)}
              disabled={params.people >= 12}
            >+</button>
          </div>
        </div>

        {/* 2. Budget Controls */}
        <div className="form-group-box compact-box">
          <div className="compact-header-row">
            <label className="form-label compact-label">
              <IndianRupee size={15} className="form-label-icon" />
              <span>Budget</span>
            </label>
            <button
              type="button"
              className="toggle-budget-type"
              onClick={() => setParams(prev => ({ ...prev, isPerPersonBudget: !prev.isPerPersonBudget }))}
            >
              {params.isPerPersonBudget ? "Per Person ▾" : "Total ▾"}
            </button>
          </div>

          <div className="budget-input-wrapper compact-budget">
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
                <span>Total ₹{(params.budget * params.people).toFixed(0)}</span>
              ) : (
                <span>₹{(params.budget / params.people).toFixed(0)}/head</span>
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
        <div className="form-group-box compact-box">
          <div className="compact-header-row">
            <label className="form-label compact-label">
              <MapPin size={15} className="form-label-icon" />
              <span>Location & Radius</span>
            </label>
            <span className="radius-val">{params.radiusKm} km radius</span>
          </div>

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
                  {hub.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn-gps"
              onClick={handleDetectLocation}
              title="Detect live GPS"
            >
              <Navigation size={14} />
              <span>GPS</span>
            </button>
          </div>

          {/* Radius Slider */}
          <div className="radius-slider-group compact-slider">
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

        {/* 4. Dietary & Spice */}
        <div className="form-group-box compact-box">
          <label className="form-label compact-label">
            <Leaf size={15} className="form-label-icon" />
            <span>Dietary & Spice</span>
          </label>
          <div className="dietary-pills-row compact-dietary">
            <button
              type="button"
              className={`diet-pill ${params.foodType === null ? 'active' : ''}`}
              onClick={() => setParams(prev => ({ ...prev, foodType: null }))}
            >
              All
            </button>
            <button
              type="button"
              className={`diet-pill veg ${params.foodType === 'VEG' ? 'active' : ''}`}
              onClick={() => handleDietaryToggle('VEG')}
            >
              🟢 Veg
            </button>
            <button
              type="button"
              className={`diet-pill non-veg ${params.foodType === 'NON_VEG' ? 'active' : ''}`}
              onClick={() => handleDietaryToggle('NON_VEG')}
            >
              🔴 Non-Veg
            </button>
          </div>

          {/* Spice Level */}
          <div className="spice-chips compact-spice">
            {['MILD', 'MEDIUM', 'SPICY', 'EXTRA_SPICY'].map((spice) => (
              <button
                key={spice}
                type="button"
                className={`spice-chip ${params.spiceLevel === spice ? 'active' : ''}`}
                onClick={() => handleSpiceSelect(spice)}
              >
                {spice === 'MILD' && '🌿 Mild'}
                {spice === 'MEDIUM' && '🌶️ Med'}
                {spice === 'SPICY' && '🔥 Hot'}
                {spice === 'EXTRA_SPICY' && '💥 Extra'}
              </button>
            ))}
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
          <span>{showAdvanced ? "Hide More Options" : "+ Cuisines & Exclusions"}</span>
          <ChevronDown size={14} className={`chevron-icon ${showAdvanced ? 'rotated' : ''}`} />
        </button>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvanced && (
        <div className="advanced-filters-panel animate-fade-in">
          {/* Cuisines */}
          <div className="filter-sub-group">
            <span className="sub-label">
              <Utensils size={13} className="inline-icon" /> Preferred Cuisines
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
              <Ban size={13} className="inline-icon text-coral" /> Exclude Dishes (e.g. Biryani, Seafood)
            </span>
            <div className="avoid-input-row">
              <input
                id="avoid-item-input"
                type="text"
                className="avoid-input"
                placeholder="Type dish name..."
                value={avoidInput}
                onChange={(e) => setAvoidInput(e.target.value)}
                onKeyDown={handleAddAvoidTag}
              />
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={handleAddAvoidTag}
              >
                Add
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
          className="btn-primary calculate-btn"
          onClick={onFetchRecommendations}
          disabled={loading}
        >
          {loading ? "Finding Combinations..." : `Find Best Food for ${params.people} Friends →`}
        </button>
      </div>
    </div>
  );
}
