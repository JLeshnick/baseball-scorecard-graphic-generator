import React, { useState } from 'react';
import { BookOpen, Pin, PinOff, X, Search, CheckCircle, HelpCircle } from 'lucide-react';

const GUIDE_SECTIONS = [
  {
    category: 'Hits & Reaching Base',
    items: [
      { code: '1B', name: 'Single', desc: 'Dashed line to 1st base', badgeColor: '#3b82f6' },
      { code: '2B', name: 'Double', desc: 'Dashed lines to 1st and 2nd base', badgeColor: '#3b82f6' },
      { code: '3B', name: 'Triple', desc: 'Dashed lines around to 3rd base', badgeColor: '#3b82f6' },
      { code: 'HR', name: 'Home Run', desc: 'Full diamond highlight & 4 bases', badgeColor: '#eab308' },
      { code: 'BB', name: 'Walk / Base on Balls', desc: 'Free pass to 1st base', badgeColor: '#10b981' },
      { code: 'IBB', name: 'Intentional Walk', desc: 'Intentional free pass', badgeColor: '#10b981' },
      { code: 'HBP', name: 'Hit by Pitch', desc: 'Awarded 1st base', badgeColor: '#10b981' },
      { code: 'CI', name: "Catcher's Interference", desc: 'Awarded 1st base', badgeColor: '#10b981' },
    ],
  },
  {
    category: 'Strikeouts',
    items: [
      { code: 'K', name: 'Strikeout Swinging', desc: 'Forward K in diamond center', badgeColor: '#8b5cf6' },
      { code: 'ꓘ', name: 'Strikeout Looking', desc: 'Backwards K (called 3rd strike)', badgeColor: '#8b5cf6' },
      { code: 'K-WP', name: 'Dropped 3rd Strike (WP)', desc: 'Wild pitch allows reach to 1B', badgeColor: '#8b5cf6' },
      { code: 'K-PB', name: 'Dropped 3rd Strike (PB)', desc: 'Passed ball allows reach to 1B', badgeColor: '#8b5cf6' },
    ],
  },
  {
    category: 'Field Outs & Groundouts',
    items: [
      { code: '6-3', name: 'Groundout SS → 1B', desc: 'Shortstop to First Baseman', badgeColor: '#64748b' },
      { code: '4-3', name: 'Groundout 2B → 1B', desc: 'Second Baseman to First', badgeColor: '#64748b' },
      { code: '5-3', name: 'Groundout 3B → 1B', desc: 'Third Baseman to First', badgeColor: '#64748b' },
      { code: '1-3 / 3-1', name: 'P → 1B / 1B → P', desc: 'Covered first base out', badgeColor: '#64748b' },
      { code: 'F8 / F7 / F9', name: 'Flyout CF / LF / RF', desc: 'Catch in the outfield', badgeColor: '#64748b' },
      { code: 'L6 / L4 / L5', name: 'Lineout SS / 2B / 3B', desc: 'Line drive caught by infielder', badgeColor: '#64748b' },
      { code: 'P2 / P4 / P6', name: 'Popout C / 2B / SS', desc: 'Pop fly caught in infield', badgeColor: '#64748b' },
      { code: '6-4-3 DP', name: 'Double Play', desc: 'SS to 2B to 1B (2 outs recorded)', badgeColor: '#ef4444' },
      { code: 'FC', name: "Fielder's Choice", desc: 'Out made on lead runner', badgeColor: '#f97316' },
      { code: 'SF', name: 'Sacrifice Fly', desc: 'Flyout scoring a runner (RBI)', badgeColor: '#06b6d4' },
      { code: 'SAC', name: 'Sacrifice Bunt', desc: 'Bunt advancing a runner', badgeColor: '#06b6d4' },
      { code: 'E6 / E4 / E5', name: 'Fielding Error', desc: 'Batter reached on defensive miscue', badgeColor: '#ef4444' },
    ],
  },
  {
    category: 'Basepath Outs & Advancement',
    items: [
      { code: '✕ 2B / 3B / HP', name: 'Thrown Out on Basepaths', desc: 'Red ✕ mark on basepath where out occurred', badgeColor: '#ef4444' },
      { code: 'CS', name: 'Caught Stealing', desc: 'Runner tagged out attempting steal', badgeColor: '#ef4444' },
      { code: 'PO', name: 'Pickoff', desc: 'Pitcher/Catcher caught runner off base', badgeColor: '#ef4444' },
      { code: 'SB', name: 'Stolen Base', desc: 'Extra event badge in top-left', badgeColor: '#10b981' },
      { code: 'WP / PB', name: 'Wild Pitch / Passed Ball', desc: 'Runner advanced on misplay', badgeColor: '#f59e0b' },
      { code: '① / ②', name: 'Multiple At-Bats in Inning', desc: 'Team batted around (1st PA vs 2nd PA)', badgeColor: '#3b82f6' },
      { code: 'a. / b.', name: 'Lineup Substitution', desc: 'Pinch hitter or defensive replacement', badgeColor: '#38bdf8' },
    ],
  },
  {
    category: 'Field Position Numbers',
    items: [
      { code: '1', name: 'Pitcher (P)', desc: 'Defensive position #1', badgeColor: '#3b82f6' },
      { code: '2', name: 'Catcher (C)', desc: 'Defensive position #2', badgeColor: '#3b82f6' },
      { code: '3', name: 'First Baseman (1B)', desc: 'Defensive position #3', badgeColor: '#3b82f6' },
      { code: '4', name: 'Second Baseman (2B)', desc: 'Defensive position #4', badgeColor: '#3b82f6' },
      { code: '5', name: 'Third Baseman (3B)', desc: 'Defensive position #5', badgeColor: '#3b82f6' },
      { code: '6', name: 'Shortstop (SS)', desc: 'Defensive position #6', badgeColor: '#3b82f6' },
      { code: '7', name: 'Left Fielder (LF)', desc: 'Defensive position #7', badgeColor: '#3b82f6' },
      { code: '8', name: 'Center Fielder (CF)', desc: 'Defensive position #8', badgeColor: '#3b82f6' },
      { code: '9', name: 'Right Fielder (RF)', desc: 'Defensive position #9', badgeColor: '#3b82f6' },
    ],
  },
];

export default function ScoringGuide({
  isDark = false,
  isPinned = false,
  onTogglePin = null,
  onClose = null,
  isModal = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = GUIDE_SECTIONS.map(sec => {
    if (!searchQuery.trim()) return sec;
    const q = searchQuery.toLowerCase();
    const filteredItems = sec.items.filter(it =>
      it.code.toLowerCase().includes(q) ||
      it.name.toLowerCase().includes(q) ||
      it.desc.toLowerCase().includes(q)
    );
    return { ...sec, items: filteredItems };
  }).filter(sec => sec.items.length > 0);

  const containerStyle = isModal ? {
    position: 'fixed',
    inset: 0,
    zIndex: 99999,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  } : isPinned ? {
    position: 'fixed',
    top: '70px',
    right: '24px',
    zIndex: 90,
    width: '320px',
    maxHeight: 'calc(100vh - 100px)',
    borderRadius: '12px',
    boxShadow: '0 16px 36px rgba(0,0,0,0.28)',
    border: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
    backgroundColor: isDark ? '#141417' : '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'fadeIn 0.15s ease',
  } : {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  };

  const cardStyle = isModal ? {
    width: '100%',
    maxWidth: '540px',
    maxHeight: '85vh',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    border: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
    backgroundColor: isDark ? '#141417' : '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  } : null;

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
        backgroundColor: isDark ? '#0f0f12' : '#faf9f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
          <div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: isDark ? '#fafafa' : '#18181b', display: 'block' }}>
              Scoring Guide & Legend
            </span>
            <span style={{ fontSize: '10px', color: isDark ? '#a1a1aa' : '#78716c' }}>
              Baseball Scorekeeping Notation Key
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {onTogglePin && (
            <button
              onClick={onTogglePin}
              style={{
                padding: '5px 8px', borderRadius: '6px',
                border: `1px solid ${isPinned ? (isDark ? '#6366f1' : '#4f46e5') : (isDark ? '#3f3f46' : '#d1d5db')}`,
                backgroundColor: isPinned ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(79,70,229,0.1)') : 'transparent',
                color: isPinned ? (isDark ? '#818cf8' : '#4f46e5') : (isDark ? '#a1a1aa' : '#78716c'),
                fontSize: '10.5px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
              title={isPinned ? 'Unpin from screen' : 'Pin guide alongside scorecard'}
            >
              {isPinned ? <PinOff style={{ width: '12px', height: '12px' }} /> : <Pin style={{ width: '12px', height: '12px' }} />}
              <span>{isPinned ? 'Pinned' : 'Pin'}</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '5px', borderRadius: '6px', border: 'none',
                backgroundColor: 'transparent', color: isDark ? '#a1a1aa' : '#78716c',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div style={{ padding: '8px 12px', borderBottom: `1px solid ${isDark ? '#27272a' : '#f0ede6'}` }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 10px', borderRadius: '6px',
          border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
          backgroundColor: isDark ? '#09090b' : '#f8f8f8',
        }}>
          <Search style={{ width: '13px', height: '13px', color: isDark ? '#71717a' : '#9ca3af' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, symbol, or term (e.g. CS, HR, 6-4-3)..."
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: '11px', outline: 'none',
              color: isDark ? '#fafafa' : '#18181b',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', color: isDark ? '#71717a' : '#9ca3af' }}
            >
              <X style={{ width: '12px', height: '12px' }} />
            </button>
          )}
        </div>
      </div>

      {/* Guide Content List */}
      <div style={{ padding: '12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredSections.map((sec, sIdx) => (
          <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{
              fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: isDark ? '#38bdf8' : '#0284c7',
            }}>
              {sec.category}
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sec.items.map((item, iIdx) => (
                <div
                  key={iIdx}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '5px 8px', borderRadius: '6px',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${isDark ? '#27272a' : '#f0ede6'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: '2px 6px', borderRadius: '4px',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
                      color: item.badgeColor || (isDark ? '#fafafa' : '#18181b'),
                      fontSize: '10px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                      minWidth: '28px', textAlign: 'center',
                    }}>
                      {item.code}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#e4e4e7' : '#27272a' }}>
                      {item.name}
                    </span>
                  </div>

                  <span style={{ fontSize: '10px', color: isDark ? '#a1a1aa' : '#78716c', textAlign: 'right', paddingLeft: '8px' }}>
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {content}
    </div>
  );
}
