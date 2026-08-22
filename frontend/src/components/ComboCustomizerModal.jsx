import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Utensils, 
  IndianRupee, 
  Users, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  Vote, 
  Share2 
} from 'lucide-react';

export default function ComboCustomizerModal({
  combo,
  budget,
  people,
  onClose,
  onSaveCustomCombo,
  onVoteCombo
}) {
  const [currentItems, setCurrentItems] = useState([]);
  const [restaurantMenu, setRestaurantMenu] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    if (combo && combo.items) {
      setCurrentItems(combo.items.map(item => ({ ...item })));
    }

    if (combo && combo.restaurantId) {
      setLoadingMenu(true);
      fetch(`/api/restaurants/${combo.restaurantId}`)
        .then(res => res.json())
        .then(data => {
          setRestaurantMenu(data.menuItems || []);
          setLoadingMenu(false);
        })
        .catch(err => {
          console.error("Error fetching menu for customizer:", err);
          setLoadingMenu(false);
        });
    }
  }, [combo]);

  // Compute live metrics
  const totalCost = currentItems.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);
  const savings = Math.max(0, budget - totalCost);
  const isOverBudget = totalCost > budget;
  const pricePerPerson = people > 0 ? (totalCost / people).toFixed(0) : 0;
  const totalServings = currentItems.reduce((sum, item) => sum + ((item.servingCapacity || 1.0) * item.quantity), 0).toFixed(1);
  const isPortionAdequate = parseFloat(totalServings) >= (people * 0.85);

  const handleUpdateQuantity = (itemId, delta) => {
    setCurrentItems(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty, subtotal: item.pricePerUnit * newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const handleRemoveItem = (itemId) => {
    setCurrentItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddItemFromMenu = (menuItem) => {
    setCurrentItems(prev => {
      const existing = prev.find(i => i.id === menuItem.id);
      if (existing) {
        return prev.map(i => i.id === menuItem.id 
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.pricePerUnit }
          : i
        );
      } else {
        return [
          ...prev,
          {
            id: menuItem.id,
            name: menuItem.name,
            quantity: 1,
            pricePerUnit: menuItem.price,
            subtotal: menuItem.price,
            foodType: menuItem.foodType,
            category: menuItem.category,
            spiceLevel: menuItem.spiceLevel,
            servingCapacity: menuItem.servingCapacity,
            description: menuItem.description
          }
        ];
      }
    });
  };

  const handleSave = () => {
    const updatedCombo = {
      ...combo,
      id: `${combo.restaurantId}-custom-${Date.now().toString().slice(-4)}`,
      items: currentItems,
      totalPrice: Math.round(totalCost * 100) / 100,
      budgetRemaining: Math.round(savings * 100) / 100,
      pricePerPerson: parseFloat(pricePerPerson),
      totalServingsEstimated: parseFloat(totalServings),
      matchTag: 'Custom Tweak',
      explanation: `Customized bundle for ${people} friends at ${combo.restaurantName}. Total: ₹${totalCost} (₹${pricePerPerson}/person).`
    };

    onSaveCustomCombo(updatedCombo);
    onClose();
  };

  const availableCategories = ['ALL', ...Array.from(new Set(restaurantMenu.map(i => i.category)))];

  const filteredMenuItems = restaurantMenu.filter(m => {
    if (selectedCategory === 'ALL') return true;
    return m.category === selectedCategory;
  });

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="customizer-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Header */}
        <div className="customizer-header">
          <div className="header-badge-row">
            <span className="customizer-badge">
              <Sparkles size={14} /> Tweak & Customize Combo
            </span>
            <span className="restaurant-tag">{combo.restaurantName}</span>
          </div>
          <h2>Fine-Tune Food Choices for {people} Friends</h2>
          <p>Add, remove, or swap dishes. Watch your budget and portion meters update live.</p>
        </div>

        {/* Live Feedback Summary Meter */}
        <div className={`live-meter-card ${isOverBudget ? 'over-budget' : ''}`}>
          <div className="meter-col">
            <span className="meter-label">Total Bill</span>
            <span className={`meter-value ${isOverBudget ? 'text-danger' : ''}`}>₹{totalCost.toFixed(0)}</span>
            <span className="meter-sub">Budget: ₹{budget}</span>
          </div>

          <div className="meter-col">
            <span className="meter-label">Budget Savings</span>
            <span className={`meter-value ${isOverBudget ? 'text-danger' : 'text-success'}`}>
              {isOverBudget ? `-₹${(totalCost - budget).toFixed(0)} Over` : `₹${savings.toFixed(0)} Saved`}
            </span>
            <span className="meter-sub">{pricePerPerson}/person</span>
          </div>

          <div className="meter-col">
            <span className="meter-label">Estimated Food Capacity</span>
            <span className={`meter-value ${isPortionAdequate ? 'text-success' : 'text-warning'}`}>
              ~{totalServings} Servings
            </span>
            <span className="meter-sub">{isPortionAdequate ? `Feeds ${people} well` : `May be light for ${people}`}</span>
          </div>
        </div>

        {isOverBudget && (
          <div className="budget-alert-banner">
            <AlertTriangle size={16} />
            <span>This combo exceeds your ₹{budget} budget by ₹{(totalCost - budget).toFixed(0)}. Reduce item quantities or swap items to stay within budget.</span>
          </div>
        )}

        <div className="customizer-columns-grid">
          {/* Left: Current Combo Items */}
          <div className="customizer-panel">
            <div className="panel-title-row">
              <h3>Items in this Combo ({currentItems.reduce((a, c) => a + c.quantity, 0)})</h3>
            </div>

            {currentItems.length === 0 ? (
              <div className="empty-combo-box">
                <Utensils size={32} className="text-slate-300" />
                <p>Combo is empty. Add dishes from the restaurant menu on the right!</p>
              </div>
            ) : (
              <div className="customizer-items-list">
                {currentItems.map(item => (
                  <div key={item.id} className="customizer-item-row">
                    <div className="item-info-group">
                      <div className="item-title-line">
                        <span>{item.foodType === 'VEG' ? '🟢' : item.foodType === 'EGGETARIAN' ? '🟡' : '🔴'}</span>
                        <strong>{item.name}</strong>
                        <span className="category-pill-mini">{item.category}</span>
                      </div>
                      <span className="unit-cost-sub">₹{item.pricePerUnit} × {item.quantity} = ₹{item.subtotal}</span>
                    </div>

                    <div className="item-stepper-actions">
                      <button
                        type="button"
                        className="btn-step-mini"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="stepper-qty-val">{item.quantity}</span>
                      <button
                        type="button"
                        className="btn-step-mini"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-remove-mini"
                        onClick={() => handleRemoveItem(item.id)}
                        title="Remove dish"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Add from Restaurant Menu */}
          <div className="customizer-panel menu-panel">
            <div className="panel-title-row">
              <h3>Add Dishes from {combo.restaurantName}</h3>
            </div>

            {/* Category Scroll */}
            <div className="customizer-cat-scroll">
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`customizer-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loadingMenu ? (
              <div className="loading-sub-state">Loading menu dishes...</div>
            ) : (
              <div className="available-dishes-list">
                {filteredMenuItems.map(m => (
                  <div key={m.id} className="available-dish-card">
                    <div className="dish-info">
                      <div className="dish-title-line">
                        <span>{m.foodType === 'VEG' ? '🟢' : m.foodType === 'EGGETARIAN' ? '🟡' : '🔴'}</span>
                        <span className="dish-name">{m.name}</span>
                      </div>
                      <span className="dish-price">₹{m.price}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-add-dish"
                      onClick={() => handleAddItemFromMenu(m)}
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="customizer-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={currentItems.length === 0}
          >
            <Check size={16} />
            <span>Save & Apply Customized Combo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
