import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Send, 
  MessageSquare, 
  Sparkles,
  MapPin
} from 'lucide-react';

export default function ShareModal({ combo, people, budget, onClose }) {
  const [copied, setCopied] = useState(false);

  const itemsFormatted = combo.items
    ?.map(i => `• ${i.quantity}x ${i.name} (₹${i.subtotal})`)
    .join('\n');

  const shareText = `🍽️ *FoodFind Group Dining Plan!*
📍 *${combo.restaurantName}* (${combo.area} - ${combo.distanceKm} km away)
⭐ Rating: ${combo.restaurantRating}★

🍱 *Recommended Food Bundle:*
${itemsFormatted}

💰 *Bill Summary:*
• Total: *₹${combo.totalPrice}* (₹${combo.pricePerPerson}/person for ${people} friends)
• Budget Savings: *₹${combo.budgetRemaining} Saved* under ₹${budget} budget

💡 *Why this combo:* ${combo.explanation}

🔗 Find & Vote on FoodFind: http://localhost:5173`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="share-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="share-header">
          <div className="share-icon-box">
            <Share2 size={24} className="text-primary" />
          </div>
          <div>
            <h2>Share Dining Plan with Your Group</h2>
            <p>Send formatted food combination details directly to your friends on WhatsApp.</p>
          </div>
        </div>

        {/* WhatsApp Message Preview Bubble */}
        <div className="whatsapp-preview-bubble">
          <div className="bubble-header">
            <MessageSquare size={14} className="text-emerald" />
            <span>WhatsApp Message Preview</span>
          </div>
          <pre className="bubble-content">{shareText}</pre>
        </div>

        {/* Share Action Buttons */}
        <div className="share-actions-row">
          <button
            type="button"
            className="btn-primary btn-lg btn-whatsapp"
            onClick={handleWhatsApp}
          >
            <Send size={18} />
            <span>Share to WhatsApp Group →</span>
          </button>

          <button
            type="button"
            className="btn-secondary btn-lg"
            onClick={handleCopy}
          >
            {copied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
            <span>{copied ? "Copied to Clipboard!" : "Copy Full Text"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
