import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Vote, 
  Dices, 
  Trophy, 
  Sparkles, 
  Share2, 
  RotateCw,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiUrl } from '../config/api.js';

export default function DecisionRoomModal({ 
  combinations, 
  votedCombos, 
  setVotedCombos, 
  onClose,
  people 
}) {
  const [voterName, setVoterName] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(null);

  // Available options for group decision (either user-voted combos or top candidate recommendations)
  const optionsToDecide = votedCombos.length > 0 
    ? votedCombos 
    : combinations.slice(0, 5);

  const handleVote = (comboId) => {
    if (!voterName.trim()) {
      alert("Please enter your name first!");
      return;
    }

    setVotedCombos(prev => {
      const existing = prev.find(c => c.id === comboId);
      if (existing) {
        return prev.map(c => c.id === comboId ? { ...c, votes: (c.votes || 0) + 1 } : c);
      } else {
        const fullCombo = combinations.find(c => c.id === comboId);
        if (fullCombo) {
          return [...prev, { ...fullCombo, votes: 1 }];
        }
        return prev;
      }
    });

    // Also call backend vote API
    fetch(apiUrl('/api/decisions/vote'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'group-room-1',
        voterName: voterName.trim(),
        optionId: comboId
      })
    }).catch(err => console.error("Vote error:", err));
  };

  const handleSpinRoulette = () => {
    if (optionsToDecide.length === 0) return;

    setSpinning(true);
    setSelectedWinner(null);

    let count = 0;
    const maxCycles = 20;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * optionsToDecide.length);
      setSelectedWinner(optionsToDecide[randomIdx]);
      count++;

      if (count >= maxCycles) {
        clearInterval(interval);
        setSpinning(false);
        const finalWinner = optionsToDecide[Math.floor(Math.random() * optionsToDecide.length)];
        setSelectedWinner(finalWinner);
        
        // Trigger victory confetti!
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    }, 100);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="decision-room-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="decision-room-header">
          <div className="room-icon-box">
            <Users size={24} className="text-primary" />
          </div>
          <div className="room-title-group">
            <h2>Friend Dining Decision Room</h2>
            <p>Can't agree on what to eat? Vote with your friends or let the wheel decide!</p>
          </div>
        </div>

        {/* Voter Identity Box */}
        <div className="voter-identity-card">
          <label htmlFor="voter-name-input">Who is voting right now?</label>
          <div className="voter-input-row">
            <input
              id="voter-name-input"
              type="text"
              placeholder="Enter your name (e.g. Rahul, Sneha, Alex)..."
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              className="voter-input"
            />
          </div>
        </div>

        {/* Decision Tools Split: Voting vs Spin Wheel */}
        <div className="decision-tools-grid">
          {/* Column 1: Vote Leaderboard */}
          <div className="decision-col voting-col">
            <div className="col-header">
              <Vote size={18} className="text-primary" />
              <h3>Live Combination Poll</h3>
            </div>

            <div className="decision-options-list">
              {optionsToDecide.map((combo) => {
                const votes = combo.votes || 0;
                return (
                  <div key={combo.id} className="decision-option-card">
                    <div className="option-info">
                      <div className="option-rest-title">
                        <strong>{combo.restaurantName}</strong>
                        <span className="option-price">₹{combo.totalPrice}</span>
                      </div>
                      <p className="option-items-summary">
                        {combo.items.map(i => `${i.quantity}x ${i.name}`).join(' + ')}
                      </p>
                      <div className="option-tags">
                        <span className="pill-mini">★ {combo.restaurantRating}</span>
                        <span className="pill-mini">{combo.distanceKm} km</span>
                        <span className="pill-mini green">Saves ₹{combo.budgetRemaining}</span>
                      </div>
                    </div>

                    <div className="option-vote-action">
                      <div className="vote-tally">
                        <span className="vote-num">{votes}</span>
                        <span className="vote-label">Votes</span>
                      </div>
                      <button
                        type="button"
                        className="btn-vote-submit"
                        onClick={() => handleVote(combo.id)}
                        disabled={!voterName.trim()}
                      >
                        Vote +1
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Spin the Wheel / Roll Dice */}
          <div className="decision-col roulette-col">
            <div className="col-header">
              <Dices size={18} className="text-primary" />
              <h3>The Indecision Settle Wheel</h3>
            </div>

            <div className="wheel-action-box">
              <div className={`roulette-display-card ${spinning ? 'spinning' : ''} ${selectedWinner ? 'winner' : ''}`}>
                {selectedWinner ? (
                  <div className="winner-content animate-fade-in">
                    <div className="winner-trophy-badge">
                      <Trophy size={20} className="text-primary" />
                      <span>Tonight's Food Winner!</span>
                    </div>
                    <h4>{selectedWinner.restaurantName}</h4>
                    <p className="winner-items">
                      {selectedWinner.items.map(i => `${i.quantity}x ${i.name}`).join(' + ')}
                    </p>
                    <div className="winner-price-row">
                      <span>Total: ₹{selectedWinner.totalPrice}</span>
                      <span className="winner-savings">Save ₹{selectedWinner.budgetRemaining}</span>
                    </div>
                  </div>
                ) : (
                  <div className="roulette-idle-state">
                    <Dices size={44} className="text-slate-300 idle-dice" />
                    <p>Spin to randomly pick the ultimate group combination among top contenders!</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="btn-primary btn-lg btn-spin-roulette"
                onClick={handleSpinRoulette}
                disabled={spinning || optionsToDecide.length === 0}
              >
                <RotateCw size={18} className={spinning ? 'spin-animation' : ''} />
                <span>{spinning ? "Selecting Your Feast..." : "Roll The Food Dice / Spin Wheel 🎲"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
