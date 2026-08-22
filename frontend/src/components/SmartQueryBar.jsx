import React, { useState } from 'react';
import { Sparkles, ArrowRight, Wand2, RefreshCw } from 'lucide-react';

export default function SmartQueryBar({ onParseQuery, isParsing }) {
  const [queryText, setQueryText] = useState('');

  const samplePrompts = [
    "I'm with 3 friends, got ₹800, want spicy non-veg and no biryani in KPHB",
    "4 of us, ₹1000 budget, something different and spicy in Madhapur",
    "2 people budget ₹400 quick bites and shawarma",
    "5 friends ₹1500 pure veg North Indian feast"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    onParseQuery(queryText);
  };

  const handleSelectSample = (sample) => {
    setQueryText(sample);
    onParseQuery(sample);
  };

  return (
    <div className="smart-query-container">
      <div className="smart-query-badge">
        <Wand2 size={14} className="sparkle-icon" />
        <span>Smart Natural Language Decision Box</span>
      </div>

      <form onSubmit={handleSubmit} className="smart-query-form">
        <div className="smart-input-wrapper">
          <input
            id="smart-query-input"
            type="text"
            className="smart-query-input"
            placeholder="e.g. We are 3 friends, have ₹800, want spicy non-veg and no biryani..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
          <button
            id="smart-query-submit-btn"
            type="submit"
            className="btn-primary smart-submit-btn"
            disabled={isParsing || !queryText.trim()}
          >
            {isParsing ? (
              <RefreshCw size={18} className="spin-animation" />
            ) : (
              <>
                <span>Solve What to Eat</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggestion Chips */}
      <div className="sample-prompts-row">
        <span className="sample-label">Try asking:</span>
        <div className="sample-chips-list">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              className="sample-prompt-chip"
              onClick={() => handleSelectSample(prompt)}
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
