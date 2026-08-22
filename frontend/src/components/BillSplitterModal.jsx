import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  IndianRupee, 
  Users, 
  QrCode, 
  Copy, 
  Check, 
  Share2, 
  Split, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import QRCode from 'qrcode';

export default function BillSplitterModal({ combo, people, onClose }) {
  const [splitMode, setSplitMode] = useState('EQUAL'); // 'EQUAL' or 'DIETARY'
  const [upiId, setUpiId] = useState('friend@upi');
  const [copied, setCopied] = useState(false);
  const [vegCount, setVegCount] = useState(1);
  const [nonVegCount, setNonVegCount] = useState(Math.max(1, people - 1));
  const canvasRef = useRef(null);

  const totalBill = combo.totalPrice || 0;

  // Calculate Dietary Split Breakdown
  const vegItemsTotal = combo.items
    ?.filter(i => i.foodType === 'VEG')
    .reduce((sum, i) => sum + (i.pricePerUnit * i.quantity), 0) || 0;

  const nonVegItemsTotal = combo.items
    ?.filter(i => i.foodType === 'NON_VEG' || i.foodType === 'EGGETARIAN')
    .reduce((sum, i) => sum + (i.pricePerUnit * i.quantity), 0) || 0;

  const totalEaters = vegCount + nonVegCount;
  
  // Veg eaters pay their share of veg items
  const perVegShare = vegCount > 0 ? (vegItemsTotal / totalEaters).toFixed(0) : 0;
  // Non-veg eaters pay their share of veg items + their share of non-veg items
  const perNonVegShare = nonVegCount > 0 
    ? ((vegItemsTotal / totalEaters) + (nonVegItemsTotal / nonVegCount)).toFixed(0) 
    : 0;

  const equalShare = people > 0 ? (totalBill / people).toFixed(0) : 0;
  const activeShareAmount = splitMode === 'EQUAL' ? equalShare : perNonVegShare;

  // Generate UPI Payment URI: upi://pay?pa=...&pn=FoodFind&am=...&cu=INR
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=FoodFind%20Dining&am=${activeShareAmount}&cu=INR&tn=${encodeURIComponent(`FoodFind - ${combo.restaurantName}`)}`;

  // Render QR Code onto Canvas
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, upiUri, {
        width: 180,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }, (err) => {
        if (err) console.error("QR Code generation error:", err);
      });
    }
  }, [upiUri]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = splitMode === 'EQUAL'
      ? `🍽️ *FoodFind Bill Split: ${combo.restaurantName}*\nTotal Bill: ₹${totalBill}\nEqual Split (${people} friends): *₹${equalShare} per person*\n\n📲 Pay via UPI: ${upiUri}`
      : `🍽️ *FoodFind Itemized Split: ${combo.restaurantName}*\nTotal Bill: ₹${totalBill}\n🟢 Veg Friends (${vegCount}): *₹${perVegShare} each*\n🔴 Non-Veg Friends (${nonVegCount}): *₹${perNonVegShare} each*\n\n📲 Pay via UPI: ${upiUri}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="bill-splitter-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="splitter-header">
          <div className="splitter-icon-box">
            <Split size={24} className="text-primary" />
          </div>
          <div>
            <h2>Smart Group Bill Splitter & UPI QR</h2>
            <p>{combo.restaurantName} • Total Bill: <strong>₹{totalBill}</strong></p>
          </div>
        </div>

        {/* Split Mode Tabs */}
        <div className="split-mode-tabs">
          <button
            type="button"
            className={`split-tab-btn ${splitMode === 'EQUAL' ? 'active' : ''}`}
            onClick={() => setSplitMode('EQUAL')}
          >
            <Users size={16} />
            <span>Equal Split ({people} Friends)</span>
          </button>

          <button
            type="button"
            className={`split-tab-btn ${splitMode === 'DIETARY' ? 'active' : ''}`}
            onClick={() => setSplitMode('DIETARY')}
          >
            <Sparkles size={16} />
            <span>Itemized Veg vs Non-Veg Split</span>
          </button>
        </div>

        {/* Split Calculation Cards */}
        <div className="split-results-panel">
          {splitMode === 'EQUAL' ? (
            <div className="equal-split-card">
              <span className="split-card-label">Everyone Pays Equally:</span>
              <div className="split-big-amount">
                <span className="rupee">₹</span>
                <span className="num">{equalShare}</span>
                <span className="unit">/ person</span>
              </div>
              <p className="split-helper-text">
                Fair division for {people} friends across all dishes (₹{totalBill} total).
              </p>
            </div>
          ) : (
            <div className="dietary-split-container">
              <div className="dietary-stepper-row">
                <div className="diet-stepper-item">
                  <label>🟢 Veg Friends</label>
                  <div className="stepper-mini-wrap">
                    <button type="button" onClick={() => setVegCount(Math.max(1, vegCount - 1))}>-</button>
                    <span>{vegCount}</span>
                    <button type="button" onClick={() => setVegCount(vegCount + 1)}>+</button>
                  </div>
                </div>

                <div className="diet-stepper-item">
                  <label>🔴 Non-Veg Friends</label>
                  <div className="stepper-mini-wrap">
                    <button type="button" onClick={() => setNonVegCount(Math.max(1, nonVegCount - 1))}>-</button>
                    <span>{nonVegCount}</span>
                    <button type="button" onClick={() => setNonVegCount(nonVegCount + 1)}>+</button>
                  </div>
                </div>
              </div>

              <div className="dietary-cards-grid">
                <div className="dietary-split-card veg">
                  <span className="diet-title">🟢 Veg Share</span>
                  <span className="diet-price">₹{perVegShare}</span>
                  <span className="diet-sub">Only pays for veg dishes & shared sides</span>
                </div>

                <div className="dietary-split-card non-veg">
                  <span className="diet-title">🔴 Non-Veg Share</span>
                  <span className="diet-price">₹{perNonVegShare}</span>
                  <span className="diet-sub">Pays for meat dishes + shared veg sides</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* UPI QR & Payment Section */}
        <div className="upi-payment-section">
          <div className="upi-config-bar">
            <label htmlFor="upi-vpa-input">
              <Smartphone size={14} /> Receiver UPI ID (VPA):
            </label>
            <input
              id="upi-vpa-input"
              type="text"
              className="upi-input"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. mobile@upi, name@okhdfcbank"
            />
          </div>

          <div className="qr-and-actions-row">
            {/* QR Canvas */}
            <div className="qr-box">
              <canvas ref={canvasRef} />
              <span className="qr-scan-label">Scan with GPay, PhonePe, Paytm</span>
            </div>

            {/* Quick Share Buttons */}
            <div className="payment-actions-col">
              <button
                type="button"
                className="btn-primary btn-action-upi"
                onClick={handleWhatsAppShare}
              >
                <Share2 size={16} />
                <span>Send Bill Split to WhatsApp</span>
              </button>

              <button
                type="button"
                className="btn-secondary btn-action-upi"
                onClick={handleCopyLink}
              >
                {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                <span>{copied ? "UPI Link Copied!" : "Copy Direct UPI Link"}</span>
              </button>

              <div className="upi-app-badges">
                <span>Supports:</span>
                <span className="app-tag">Google Pay</span>
                <span className="app-tag">PhonePe</span>
                <span className="app-tag">Paytm</span>
                <span className="app-tag">BHIM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
