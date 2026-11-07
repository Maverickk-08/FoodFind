import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Link, 
  FileText, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  Check, 
  Trash2, 
  Plus, 
  ExternalLink, 
  Building2,
  UtensilsCrossed,
  Key
} from 'lucide-react';
import { apiUrl } from '../config/api.js';

export default function MenuScannerModal({ 
  restaurants = [], 
  selectedRestaurantId, 
  onClose, 
  onMenuImported 
}) {
  const [activeTab, setActiveTab] = useState('IMAGE'); // 'IMAGE' | 'URL' | 'PASTE'
  const [targetRestaurantId, setTargetRestaurantId] = useState(() => {
    return selectedRestaurantId || (restaurants.length > 0 ? restaurants[0].id : '');
  });
  const [isCreatingNewRestaurant, setIsCreatingNewRestaurant] = useState(false);
  const [newRestaurantData, setNewRestaurantData] = useState({
    name: '',
    cuisine: '',
    address: '',
    area: 'Siripuram',
    latitude: 17.7214,
    longitude: 83.3156
  });

  // Staging items extracted by AI / URL / Paste
  const [stagedItems, setStagedItems] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Image Scanner State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('foodfind_gemini_key') || '';
  });
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  // 2. URL Importer State
  const [importUrl, setImportUrl] = useState('');

  // 3. Smart Paste State
  const [pasteText, setPasteText] = useState('');

  const adminToken = localStorage.getItem('foodfind_admin_token') || 'foodfind-secret-token-2026';

  // Save Gemini Key to LocalStorage
  const handleSaveApiKey = (key) => {
    setGeminiApiKey(key);
    localStorage.setItem('foodfind_gemini_key', key.trim());
    setShowKeyConfig(false);
  };

  // Handle Image File Selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setErrorMessage('');
  };

  // Convert File to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // 1. Scan Menu Photo with Gemini 1.5 Flash Vision
  const handleScanMenuImage = async () => {
    if (!imageFile && !imagePreview) {
      setErrorMessage("Please select or upload an image of the menu first.");
      return;
    }

    const key = geminiApiKey.trim();
    if (!key) {
      setShowKeyConfig(true);
      setErrorMessage("Please enter your free Google Gemini API key to scan menu photos with AI Vision.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Scanning menu with Gemini 1.5 Flash Vision AI...");
    setErrorMessage('');

    try {
      const base64Data = imageFile ? await fileToBase64(imageFile) : imagePreview.split(',')[1];
      const mimeType = imageFile?.type || 'image/jpeg';

      const prompt = `You are an expert restaurant menu digitizer. 
Examine this restaurant menu card image and extract ALL dishes, beverages, and items.
For every item, determine:
- "name": The clean dish title (e.g. "Chicken Dum Biryani", "Paneer 65")
- "description": A brief description or ingredients if mentioned, otherwise a short appetizing summary.
- "price": The exact numerical price in INR (e.g. 260). If multiple sizes exist (Half/Full), extract as separate items or pick the standard/full price.
- "foodType": STRICTLY one of "VEG", "NON_VEG", or "EGG". (Check for green/red symbols or words like chicken, mutton, fish, prawn, paneer, egg).
- "category": STRICTLY one of "STARTER", "MAIN", "QUICK_BITE", "DESSERT", "BEVERAGE", or "COMBO_PACK".
- "servingCapacity": Estimated number of people this single portion serves (e.g. 1.5 for biryanis/curries, 1.0 for starters/rolls, 0.5 for desserts, 0.25 for tea/beverages).
- "spiceLevel": STRICTLY one of "MILD", "MEDIUM", "SPICY", or "EXTRA_SPICY".
- "isSignature": boolean, true if marked as chef special or popular.

Return ONLY a raw valid JSON array of objects without markdown formatting or backticks. Example:
[
  { "name": "Chicken Biryani", "description": "Fragrant basmati rice", "price": 260, "foodType": "NON_VEG", "category": "MAIN", "servingCapacity": 1.5, "spiceLevel": "SPICY", "isSignature": true }
]`;

      const requestBody = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.95
        }
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Gemini API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Clean up markdown code fences if model returned them
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const items = JSON.parse(cleanJson);

      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Could not detect any food items in this image. Please ensure the menu text and prices are legible.");
      }

      setStagedItems(items);
      setSelectedIndices(new Set(items.map((_, i) => i)));
      setStatusMessage(`✨ Successfully extracted ${items.length} menu items from image!`);
    } catch (err) {
      console.error("AI Menu Scan Error:", err);
      setErrorMessage(err.message || "Failed to scan menu image with AI. Please check your API key.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Fetch & Parse Swiggy / Zomato URL
  const handleFetchUrl = async () => {
    if (!importUrl.trim()) {
      setErrorMessage("Please enter a valid Swiggy or Zomato restaurant link.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Fetching restaurant menu from URL...");
    setErrorMessage('');

    try {
      const res = await fetch(apiUrl('/api/admin/importer/url'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({ url: importUrl.trim() })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.blocked) {
          setErrorMessage(data.message);
          // Suggest switching to Smart Paste
          return;
        }
        throw new Error(data.message || "Failed to extract menu from URL.");
      }

      // If restaurant details were returned, offer to create it
      if (data.restaurantName) {
        setNewRestaurantData(prev => ({
          ...prev,
          name: data.restaurantName,
          cuisine: data.cuisine || prev.cuisine,
          address: data.address || prev.address,
          area: data.area || prev.area
        }));
      }

      if (data.menuItems && data.menuItems.length > 0) {
        setStagedItems(data.menuItems);
        setSelectedIndices(new Set(data.menuItems.map((_, i) => i)));
        setStatusMessage(`✨ Extracted ${data.menuItems.length} items from ${data.restaurantName || 'URL'}!`);
      } else {
        setErrorMessage("No menu items found at this URL. You can copy the page text and use the Smart Paste tab!");
      }
    } catch (err) {
      console.error("URL Import Error:", err);
      setErrorMessage(err.message || "Error fetching menu from URL. Try copying the page text to the Smart Paste tab.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Smart Text / WhatsApp Paste Parser
  const handleSmartPaste = async () => {
    if (!pasteText.trim()) {
      setErrorMessage("Please paste the menu text first.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Parsing lines and extracting dishes...");
    setErrorMessage('');

    try {
      const res = await fetch(apiUrl('/api/admin/importer/smart-paste'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({ text: pasteText.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not parse text.");
      }

      if (data.items && data.items.length > 0) {
        setStagedItems(data.items);
        setSelectedIndices(new Set(data.items.map((_, i) => i)));
        setStatusMessage(`✨ Parsed ${data.items.length} dishes from text!`);
      } else {
        setErrorMessage("Could not detect dish names and prices. Ensure each line has a format like: 'Dish Name - 250'.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to parse pasted text.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Load Sample Menu (For instant testing without user's own file)
  const handleLoadDemoItems = () => {
    const demo = [
      { name: "Special Boneless Chicken Biryani", description: "Tender boneless chicken tossed in aromatic basmati rice.", price: 290, foodType: "NON_VEG", category: "MAIN", servingCapacity: 1.5, spiceLevel: "SPICY", isSignature: true },
      { name: "Apollo Fish Fry", description: "Crispy seer fish slices coated with spicy yogurt sauce and curry leaves.", price: 270, foodType: "NON_VEG", category: "STARTER", servingCapacity: 1.0, spiceLevel: "SPICY", isSignature: true },
      { name: "Paneer Butter Masala", description: "Rich buttery tomato cashew gravy with fresh cottage cheese cubes.", price: 220, foodType: "VEG", category: "MAIN", servingCapacity: 2.0, spiceLevel: "MEDIUM", isSignature: false },
      { name: "Butter Tandoori Naan (2 pcs)", description: "Crisp and soft refined flour bread brushed with desi butter.", price: 60, foodType: "VEG", category: "MAIN", servingCapacity: 1.0, spiceLevel: "MILD", isSignature: false },
      { name: "Double Egg Chicken Kathi Roll", description: "Flaky paratha rolled with twin eggs, spiced chicken, and mint chutney.", price: 130, foodType: "NON_VEG", category: "QUICK_BITE", servingCapacity: 1.0, spiceLevel: "SPICY", isSignature: false },
      { name: "Apricot Delight Custard", description: "Velvety custard layered with stewed golden apricots and dry fruits.", price: 140, foodType: "VEG", category: "DESSERT", servingCapacity: 1.0, spiceLevel: "MILD", isSignature: true },
      { name: "Special Irani Chai", description: "Slow-brewed creamy Hyderabadi cardamom tea.", price: 30, foodType: "VEG", category: "BEVERAGE", servingCapacity: 0.25, spiceLevel: "MILD", isSignature: false }
    ];
    setStagedItems(demo);
    setSelectedIndices(new Set(demo.map((_, i) => i)));
    setStatusMessage("Loaded 7 demo menu items. Ready to review and import!");
  };

  // Toggle Selection
  const toggleSelect = (index) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === stagedItems.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(stagedItems.map((_, i) => i)));
    }
  };

  // Update item in staging table
  const updateStagedItem = (index, field, value) => {
    setStagedItems(prev => prev.map((item, i) => {
      if (i === index) return { ...item, [field]: value };
      return item;
    }));
  };

  // Delete item from staging table
  const deleteStagedItem = (index) => {
    setStagedItems(prev => prev.filter((_, i) => i !== index));
    const next = new Set();
    selectedIndices.forEach(idx => {
      if (idx < index) next.add(idx);
      else if (idx > index) next.add(idx - 1);
    });
    setSelectedIndices(next);
  };

  // Final Action: Bulk Save Items to Restaurant
  const handleConfirmImport = async () => {
    const selectedItems = stagedItems.filter((_, i) => selectedIndices.has(i));
    if (selectedItems.length === 0) {
      setErrorMessage("Please select at least one menu item to import.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Saving items to restaurant in database...");
    setErrorMessage('');

    try {
      let finalRestaurantId = targetRestaurantId;

      // 1. If creating a new restaurant first
      if (isCreatingNewRestaurant) {
        if (!newRestaurantData.name.trim()) {
          throw new Error("Please enter a name for the new restaurant.");
        }
        const createRes = await fetch(apiUrl('/api/admin/restaurants'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': adminToken
          },
          body: JSON.stringify(newRestaurantData)
        });
        if (!createRes.ok) throw new Error("Failed to create new restaurant.");
        const createdRest = await createRes.json();
        finalRestaurantId = createdRest.id;
      }

      if (!finalRestaurantId) {
        throw new Error("Please select a target restaurant.");
      }

      // 2. Bulk Save Menu Items
      const bulkRes = await fetch(apiUrl(`/api/admin/restaurants/${finalRestaurantId}/menu-items/bulk`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify(selectedItems)
      });

      if (!bulkRes.ok) {
        const errData = await bulkRes.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to bulk import menu items.");
      }

      setStatusMessage(`🎉 Successfully saved ${selectedItems.length} menu items!`);
      setTimeout(() => {
        if (onMenuImported) onMenuImported(finalRestaurantId);
        onClose();
      }, 1000);

    } catch (err) {
      console.error("Bulk Import Save Error:", err);
      setErrorMessage(err.message || "Error saving items.");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedCount = selectedIndices.size;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="scanner-modal-card" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="scanner-header">
          <div className="scanner-header-left">
            <div className="scanner-icon-box">
              <Sparkles size={24} className="text-primary" />
            </div>
            <div>
              <h3>Smart Menu Onboarder</h3>
              <p>Upload menu photos or import from Swiggy/Zomato to digitize dishes automatically.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Source Tabs */}
        <div className="scanner-tab-bar">
          <button
            type="button"
            className={`scanner-tab-btn ${activeTab === 'IMAGE' ? 'active' : ''}`}
            onClick={() => { setActiveTab('IMAGE'); setErrorMessage(''); }}
          >
            <Camera size={16} />
            <span>📸 Scan Menu Photo (AI)</span>
          </button>
          <button
            type="button"
            className={`scanner-tab-btn ${activeTab === 'URL' ? 'active' : ''}`}
            onClick={() => { setActiveTab('URL'); setErrorMessage(''); }}
          >
            <Link size={16} />
            <span>🔗 Swiggy / Zomato URL</span>
          </button>
          <button
            type="button"
            className={`scanner-tab-btn ${activeTab === 'PASTE' ? 'active' : ''}`}
            onClick={() => { setActiveTab('PASTE'); setErrorMessage(''); }}
          >
            <FileText size={16} />
            <span>📋 Smart Text Paste</span>
          </button>
        </div>

        {/* TAB 1: Menu Image Scanner */}
        {activeTab === 'IMAGE' && (
          <div className="scanner-content-pane">
            <div className="scanner-dropzone-row">
              <label className="scanner-dropzone">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageSelect}
                  className="scanner-file-input"
                />
                {imagePreview ? (
                  <div className="scanner-preview-wrapper">
                    <img src={imagePreview} alt="Menu Preview" className="scanner-image-preview" />
                    <div className="scanner-change-overlay">
                      <Camera size={20} />
                      <span>Change Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="scanner-dropzone-empty">
                    <Upload size={36} className="text-primary" />
                    <h4>Select or Drop Menu Card Photo</h4>
                    <p>Supports PNG, JPG, WebP. High-resolution captures deliver the best AI accuracy.</p>
                  </div>
                )}
              </label>

              <div className="scanner-controls-side">
                <div className="gemini-key-pill">
                  <div className="gemini-key-info">
                    <Key size={14} className="text-amber-400" />
                    <span>Gemini Vision AI: {geminiApiKey ? '✅ Key Configured' : '⚠️ Free Key Needed'}</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-tiny"
                    onClick={() => setShowKeyConfig(!showKeyConfig)}
                  >
                    {showKeyConfig ? 'Hide' : 'Configure'}
                  </button>
                </div>

                {showKeyConfig && (
                  <div className="gemini-config-box animate-fade-in">
                    <label>Google Gemini API Key (100% Free):</label>
                    <div className="gemini-input-row">
                      <input 
                        type="password"
                        placeholder="Paste AI Studio API Key..."
                        value={geminiApiKey}
                        onChange={e => setGeminiApiKey(e.target.value)}
                        className="form-input"
                      />
                      <button 
                        type="button" 
                        className="btn-primary"
                        onClick={() => handleSaveApiKey(geminiApiKey)}
                      >
                        Save
                      </button>
                    </div>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gemini-link"
                    >
                      <span>Get a free API key at Google AI Studio</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                <button
                  type="button"
                  className="btn-primary scanner-action-btn"
                  onClick={handleScanMenuImage}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="spin-icon" />
                      <span>AI Analyzing Menu Card...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Extract Dishes & Prices with AI</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-secondary scanner-demo-btn"
                  onClick={handleLoadDemoItems}
                  title="Test staging table with pre-built sample dishes"
                >
                  Load Sample Dishes (No Key Required)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Swiggy / Zomato URL Importer */}
        {activeTab === 'URL' && (
          <div className="scanner-content-pane">
            <div className="url-importer-box">
              <label className="form-label">Paste Restaurant Link (Swiggy or Zomato):</label>
              <div className="url-input-row">
                <input
                  type="url"
                  placeholder="e.g. https://www.swiggy.com/city/visakhapatnam/the-spicy-venue-siripuram-..."
                  value={importUrl}
                  onChange={e => setImportUrl(e.target.value)}
                  className="form-input"
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleFetchUrl}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Link size={16} />
                      <span>Extract Menu</span>
                    </>
                  )}
                </button>
              </div>
              <p className="url-hint">
                💡 Tip: If Swiggy or Zomato activates anti-bot verification, simply copy the text from the open tab and paste it into the <strong>Smart Text Paste</strong> tab.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: Smart Text Paste */}
        {activeTab === 'PASTE' && (
          <div className="scanner-content-pane">
            <div className="smart-paste-box">
              <label className="form-label">Paste Menu Text (from WhatsApp, PDF, or website):</label>
              <textarea
                rows={6}
                placeholder={"Chicken Biryani Full - 260\nMutton Biryani 350\nPaneer Butter Masala 220\nButter Naan 40\nThums Up 25"}
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                className="form-textarea"
              />
              <div className="paste-actions-row">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSmartPaste}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Parsing...</span>
                    </>
                  ) : (
                    <>
                      <FileText size={16} />
                      <span>Parse Dishes & Prices</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status & Error Alerts */}
        {errorMessage && (
          <div className="scanner-alert error animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusMessage && (
          <div className="scanner-alert success animate-fade-in">
            <Check size={16} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* STAGING & REVIEW TABLE (If items have been extracted) */}
        {stagedItems.length > 0 && (
          <div className="scanner-staging-section animate-fade-in">
            <div className="staging-header-row">
              <div className="staging-title-group">
                <h4>Extracted Menu Items ({stagedItems.length})</h4>
                <span className="staging-selected-pill">{selectedCount} Selected for Import</span>
              </div>

              {/* Destination Restaurant Selector */}
              <div className="staging-target-row">
                <span className="target-label">Import Destination:</span>
                <select
                  className="form-select staging-rest-select"
                  value={isCreatingNewRestaurant ? 'NEW' : targetRestaurantId}
                  onChange={e => {
                    if (e.target.value === 'NEW') {
                      setIsCreatingNewRestaurant(true);
                    } else {
                      setIsCreatingNewRestaurant(false);
                      setTargetRestaurantId(e.target.value);
                    }
                  }}
                >
                  <option value="" disabled>Select Target Restaurant</option>
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.area || 'Active'})
                    </option>
                  ))}
                  <option value="NEW">+ Create New Restaurant from Scanned Data</option>
                </select>
              </div>
            </div>

            {/* If Creating New Restaurant, show inline details */}
            {isCreatingNewRestaurant && (
              <div className="new-rest-inline-card animate-fade-in">
                <div className="new-rest-grid">
                  <div>
                    <label>Restaurant Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Raju Gaari Dhaba"
                      value={newRestaurantData.name}
                      onChange={e => setNewRestaurantData({ ...newRestaurantData, name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label>Cuisine</label>
                    <input
                      type="text"
                      placeholder="e.g. Andhra, Seafood"
                      value={newRestaurantData.cuisine}
                      onChange={e => setNewRestaurantData({ ...newRestaurantData, cuisine: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label>Neighborhood / Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Siripuram, Visakhapatnam"
                      value={newRestaurantData.area}
                      onChange={e => setNewRestaurantData({ ...newRestaurantData, area: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Staging Items Table */}
            <div className="staging-table-container">
              <table className="staging-table">
                <thead>
                  <tr>
                    <th width="40">
                      <input
                        type="checkbox"
                        checked={selectedCount === stagedItems.length && stagedItems.length > 0}
                        onChange={toggleSelectAll}
                        title="Select All"
                      />
                    </th>
                    <th>Dish Name</th>
                    <th width="140">Category</th>
                    <th width="110">Type</th>
                    <th width="100">Price (₹)</th>
                    <th width="90">Serves</th>
                    <th width="120">Spice</th>
                    <th width="50"></th>
                  </tr>
                </thead>
                <tbody>
                  {stagedItems.map((item, index) => {
                    const isSelected = selectedIndices.has(index);
                    return (
                      <tr key={index} className={isSelected ? 'selected-row' : 'unselected-row'}>
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(index)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.name}
                            onChange={e => updateStagedItem(index, 'name', e.target.value)}
                            className="staging-inline-input"
                          />
                        </td>
                        <td>
                          <select
                            value={item.category || 'MAIN'}
                            onChange={e => updateStagedItem(index, 'category', e.target.value)}
                            className="staging-inline-select"
                          >
                            <option value="MAIN">Main</option>
                            <option value="STARTER">Starter</option>
                            <option value="QUICK_BITE">Quick Bite</option>
                            <option value="DESSERT">Dessert</option>
                            <option value="BEVERAGE">Beverage</option>
                            <option value="COMBO_PACK">Combo Pack</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={item.foodType || 'NON_VEG'}
                            onChange={e => updateStagedItem(index, 'foodType', e.target.value)}
                            className="staging-inline-select"
                          >
                            <option value="VEG">🟢 Veg</option>
                            <option value="NON_VEG">🔴 Non-Veg</option>
                            <option value="EGG">🟡 Egg</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.price || 0}
                            onChange={e => updateStagedItem(index, 'price', parseFloat(e.target.value) || 0)}
                            className="staging-inline-input price-input"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.25"
                            value={item.servingCapacity || 1.0}
                            onChange={e => updateStagedItem(index, 'servingCapacity', parseFloat(e.target.value) || 1.0)}
                            className="staging-inline-input"
                            title="Serves how many people"
                          />
                        </td>
                        <td>
                          <select
                            value={item.spiceLevel || 'MEDIUM'}
                            onChange={e => updateStagedItem(index, 'spiceLevel', e.target.value)}
                            className="staging-inline-select"
                          >
                            <option value="MILD">Mild</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="SPICY">Spicy</option>
                            <option value="EXTRA_SPICY">Extra Spicy</option>
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="staging-delete-btn"
                            onClick={() => deleteStagedItem(index)}
                            title="Remove from batch"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions Bar */}
            <div className="staging-footer-bar">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setStagedItems(prev => [
                    ...prev,
                    { name: 'New Custom Dish', price: 150, foodType: 'NON_VEG', category: 'MAIN', servingCapacity: 1.0, spiceLevel: 'MEDIUM' }
                  ]);
                  setSelectedIndices(prev => new Set([...prev, stagedItems.length]));
                }}
              >
                <Plus size={16} />
                <span>Add Extra Item</span>
              </button>

              <div className="staging-right-actions">
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary confirm-bulk-btn"
                  onClick={handleConfirmImport}
                  disabled={isProcessing || selectedCount === 0}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="spin-icon" />
                      <span>Saving {selectedCount} Items...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      <span>Confirm & Bulk Import ({selectedCount} Dishes)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
