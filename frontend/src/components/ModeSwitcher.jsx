import React from 'react';
import { 
  Sparkles, 
  Tag, 
  Trophy, 
  Percent, 
  Layers, 
  Flame, 
  Compass 
} from 'lucide-react';

export default function ModeSwitcher({ currentMode, onSelectMode }) {
  const modes = [
    {
      id: 'BEST_OVERALL',
      label: 'Best Overall',
      icon: Sparkles,
      tagline: 'Balanced Rating, Distance & Budget'
    },
    {
      id: 'BEST_VALUE',
      label: 'Best Value',
      icon: Percent,
      tagline: 'Highest Portions per ₹ Spent'
    },
    {
      id: 'CHEAPEST',
      label: 'Budget Saver',
      icon: Tag,
      tagline: 'Maximum Savings under Budget'
    },
    {
      id: 'HIGHEST_RATED',
      label: 'Top Rated',
      icon: Trophy,
      tagline: 'Highest Quality 4.5+ Stars'
    },
    {
      id: 'MOST_VARIETY',
      label: 'Most Variety',
      icon: Layers,
      tagline: 'Mains + Starters + Drinks'
    },
    {
      id: 'SURPRISE_ME',
      label: 'Discovery / Surprise',
      icon: Compass,
      tagline: 'Hidden Gems & New Tastes'
    },
    {
      id: 'TRENDING',
      label: 'Trending',
      icon: Flame,
      tagline: 'Local Crowd Favorites'
    }
  ];

  return (
    <div className="mode-switcher-container">
      <div className="mode-switcher-scroll">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;

          return (
            <button
              key={mode.id}
              id={`mode-btn-${mode.id.toLowerCase()}`}
              className={`mode-tab-card ${isActive ? 'active' : ''}`}
              onClick={() => onSelectMode(mode.id)}
            >
              <div className="mode-icon-wrapper">
                <Icon size={18} />
              </div>
              <div className="mode-info">
                <span className="mode-title">{mode.label}</span>
                <span className="mode-tagline">{mode.tagline}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
