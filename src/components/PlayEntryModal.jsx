import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight, Trash2, Hash, Sparkles, Activity } from 'lucide-react';

const QUICK_HITS = [
  { code: '1B', label: 'Single (1B)', type: 'hit', bases: 1 },
  { code: '2B', label: 'Double (2B)', type: 'hit', bases: 2 },
  { code: '3B', label: 'Triple (3B)', type: 'hit', bases: 3 },
  { code: 'HR', label: 'Home Run (HR)', type: 'hr', bases: 4 },
  { code: 'IPHR', label: 'Inside-Park HR', type: 'hr', bases: 4 },
  { code: 'GRD', label: 'Ground Rule 2B', type: 'hit', bases: 2 },
];

const QUICK_OUTS = [
  { code: '6-3', label: 'SS to 1B (6-3)', type: 'out', outs: 1 },
  { code: '4-3', label: '2B to 1B (4-3)', type: 'out', outs: 1 },
  { code: '5-3', label: '3B to 1B (5-3)', type: 'out', outs: 1 },
  { code: '3-1', label: '1B to P (3-1)', type: 'out', outs: 1 },
  { code: '1-3', label: 'P to 1B (1-3)', type: 'out', outs: 1 },
  { code: '3-U', label: 'Unassisted (3-U)', type: 'out', outs: 1 },
  { code: 'F8', label: 'Flyout CF (F8)', type: 'out', outs: 1 },
  { code: 'F7', label: 'Flyout LF (F7)', type: 'out', outs: 1 },
  { code: 'F9', label: 'Flyout RF (F9)', type: 'out', outs: 1 },
  { code: 'L6', label: 'Lineout SS (L6)', type: 'out', outs: 1 },
  { code: 'L4', label: 'Lineout 2B (L4)', type: 'out', outs: 1 },
  { code: 'L5', label: 'Lineout 3B (L5)', type: 'out', outs: 1 },
  { code: 'P2', label: 'Popout C (P2)', type: 'out', outs: 1 },
  { code: 'P6', label: 'Popout SS (P6)', type: 'out', outs: 1 },
  { code: 'P4', label: 'Popout 2B (P4)', type: 'out', outs: 1 },
  { code: 'FC', label: "Fielder's Choice", type: 'out', bases: 1, outs: 1 },
  { code: 'SF', label: 'Sac Fly (SF)', type: 'out', outs: 1 },
  { code: 'SAC', label: 'Sac Bunt (SAC)', type: 'out', outs: 1 },
];

const QUICK_DOUBLE_PLAYS = [
  { code: '6-4-3', label: '6-4-3 DP', type: 'out', outs: 2 },
  { code: '4-6-3', label: '4-6-3 DP', type: 'out', outs: 2 },
  { code: '5-4-3', label: '5-4-3 DP', type: 'out', outs: 2 },
  { code: '1-6-3', label: '1-6-3 DP', type: 'out', outs: 2 },
  { code: '3-6-3', label: '3-6-3 DP', type: 'out', outs: 2 },
  { code: 'DP', label: 'Double Play', type: 'out', outs: 2 },
];

const QUICK_STRIKEOUTS = [
  { code: 'K', label: 'Strikeout Swinging (K)', type: 'strikeout', isLooking: false, outs: 1 },
  { code: 'ꓘ', label: 'Strikeout Looking (ꓘ)', type: 'strikeout', isLooking: true, outs: 1 },
  { code: 'K-PB', label: 'Dropped 3rd K (PB)', type: 'strikeout', bases: 1, outs: 0 },
  { code: 'K-WP', label: 'Dropped 3rd K (WP)', type: 'strikeout', bases: 1, outs: 0 },
];

const QUICK_WALKS = [
  { code: 'BB', label: 'Walk (BB)', type: 'walk', bases: 1, outs: 0 },
  { code: 'IBB', label: 'Intentional Walk (IBB)', type: 'walk', bases: 1, outs: 0 },
  { code: 'HBP', label: 'Hit by Pitch (HBP)', type: 'walk', bases: 1, outs: 0 },
  { code: 'CI', label: "Catcher's Int. (CI)", type: 'walk', bases: 1, outs: 0 },
];

const QUICK_ERRORS = [
  { code: 'E1', label: 'Pitcher Error (E1)', type: 'error', bases: 1, outs: 0 },
  { code: 'E2', label: 'Catcher Error (E2)', type: 'error', bases: 1, outs: 0 },
  { code: 'E3', label: '1st Base Error (E3)', type: 'error', bases: 1, outs: 0 },
  { code: 'E4', label: '2nd Base Error (E4)', type: 'error', bases: 1, outs: 0 },
  { code: 'E5', label: '3rd Base Error (E5)', type: 'error', bases: 1, outs: 0 },
  { code: 'E6', label: 'Shortstop Error (E6)', type: 'error', bases: 1, outs: 0 },
  { code: 'E7', label: 'Left Field Error (E7)', type: 'error', bases: 1, outs: 0 },
  { code: 'E8', label: 'Center Field Error (E8)', type: 'error', bases: 1, outs: 0 },
  { code: 'E9', label: 'Right Field Error (E9)', type: 'error', bases: 1, outs: 0 },
];

export default function PlayEntryModal({
  isOpen,
  onClose,
  cellContext, // { teamKey: 'away'|'home', batterIndex: number, batter: object, inning: number, currentPlay: object }
  onSavePlay,  // (playObj, autoAdvanceNext) => void
  onClearPlay, // () => void
  isDark = false,
}) {
  if (!isOpen || !cellContext) return null;

  const { teamKey, batter, inning, currentPlay, teamName } = cellContext;

  const [code, setCode] = useState('');
  const [playType, setPlayType] = useState('out');
  const [atBatBases, setAtBatBases] = useState(0); // 0..4
  const [endInningBases, setEndInningBases] = useState(0); // 0..4
  const [isLooking, setIsLooking] = useState(false);
  const [extraEvent, setExtraEvent] = useState('');
  const [rbi, setRbi] = useState(0);
  const [outsRecorded, setOutsRecorded] = useState(0);
  const [pitchCount, setPitchCount] = useState('');
  const [hitDistance, setHitDistance] = useState('');
  const [exitVelo, setExitVelo] = useState('');
  const [activeCategory, setActiveCategory] = useState('hits'); // 'hits', 'outs', 'k', 'walks', 'dp', 'errors'

  // Initialize state from existing play
  useEffect(() => {
    if (currentPlay) {
      setCode(currentPlay.code || '');
      setPlayType(currentPlay.type || (currentPlay.code === 'K' || currentPlay.code === 'ꓘ' ? 'strikeout' : 'out'));
      setAtBatBases(currentPlay.atBatBases !== undefined ? currentPlay.atBatBases : (currentPlay.bases || 0));
      setEndInningBases(currentPlay.bases !== undefined ? currentPlay.bases : (currentPlay.atBatBases || 0));
      setIsLooking(Boolean(currentPlay.isLooking || currentPlay.code === 'ꓘ'));
      setExtraEvent(currentPlay.extraEvent || '');
      setRbi(currentPlay.rbi || 0);
      setOutsRecorded(currentPlay.outsRecorded !== undefined ? currentPlay.outsRecorded : (currentPlay.type === 'out' || currentPlay.type === 'strikeout' ? 1 : 0));
      setPitchCount(currentPlay.pitchCount !== undefined ? String(currentPlay.pitchCount) : '');
      setHitDistance(currentPlay.statcast?.totalDistance ? String(Math.round(currentPlay.statcast.totalDistance)) : '');
      setExitVelo(currentPlay.statcast?.launchSpeed ? String(currentPlay.statcast.launchSpeed) : '');
    } else {
      setCode('');
      setPlayType('out');
      setAtBatBases(0);
      setEndInningBases(0);
      setIsLooking(false);
      setExtraEvent('');
      setRbi(0);
      setOutsRecorded(0);
      setPitchCount('');
      setHitDistance('');
      setExitVelo('');
    }
  }, [currentPlay, cellContext]);

  const handleSelectPreset = (preset) => {
    setCode(preset.code);
    setPlayType(preset.type || 'out');
    setIsLooking(Boolean(preset.isLooking));

    const ab = preset.bases || (preset.type === 'hr' ? 4 : 0);
    setAtBatBases(ab);
    setEndInningBases(ab);

    if (preset.outs !== undefined) {
      setOutsRecorded(preset.outs);
    } else if (preset.type === 'out' || preset.type === 'strikeout') {
      setOutsRecorded(1);
    } else {
      setOutsRecorded(0);
    }

    if (preset.type === 'hr' && rbi === 0) {
      setRbi(1);
    }
  };

  const handleToggleAtBatBase = (baseNum) => {
    if (atBatBases === baseNum) {
      setAtBatBases(baseNum - 1);
      if (endInningBases === baseNum) setEndInningBases(baseNum - 1);
    } else {
      setAtBatBases(baseNum);
      if (endInningBases < baseNum) setEndInningBases(baseNum);
    }
  };

  const handleToggleEndInningBase = (baseNum) => {
    if (endInningBases === baseNum) {
      setEndInningBases(baseNum - 1);
    } else {
      setEndInningBases(baseNum);
    }
  };

  const handleSave = (autoAdvance = false) => {
    if (!code.trim()) {
      onClearPlay?.();
      onClose();
      return;
    }

    const distNum = parseFloat(hitDistance);
    const veloNum = parseFloat(exitVelo);
    const pitchesNum = parseInt(pitchCount, 10);

    const playObj = {
      code: code.trim().toUpperCase(),
      type: playType,
      bases: endInningBases,
      atBatBases: atBatBases,
      isLooking: isLooking || code.trim() === 'ꓘ',
      extraEvent: extraEvent.trim().toUpperCase(),
      rbi: rbi > 0 ? rbi : undefined,
      outsRecorded: outsRecorded,
      scoredRun: endInningBases === 4 || playType === 'hr',
      pitchCount: isNaN(pitchesNum) ? undefined : pitchesNum,
      statcast: (distNum || veloNum) ? {
        totalDistance: distNum || undefined,
        launchSpeed: veloNum || undefined,
      } : undefined,
    };

    onSavePlay(playObj, autoAdvance);
  };

  // Visual diamond interactive helper
  const renderInteractiveDiamond = () => {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        backgroundColor: isDark ? '#141417' : '#f4f2ee',
        borderRadius: '10px',
        border: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
      }}>
        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '8px', textTransform: 'uppercase' }}>
          Base Paths & Runner Advance
        </div>

        <svg viewBox="0 0 100 100" width="110" height="110" style={{ overflow: 'visible' }}>
          {/* Base Diamond Outer Outline */}
          <polygon
            points="50,90 90,50 50,10 10,50"
            fill={endInningBases === 4 || playType === 'hr' ? 'rgba(34, 197, 94, 0.25)' : 'none'}
            stroke={isDark ? '#3f3f46' : '#d1d5db'}
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* 1st Base Path */}
          {atBatBases >= 1 ? (
            <line x1="50" y1="90" x2="90" y2="50" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" strokeDasharray="3 4" />
          ) : endInningBases >= 1 ? (
            <line x1="50" y1="90" x2="90" y2="50" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" />
          ) : null}

          {/* 2nd Base Path */}
          {atBatBases >= 2 ? (
            <line x1="90" y1="50" x2="50" y2="10" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" strokeDasharray="3 4" />
          ) : endInningBases >= 2 ? (
            <line x1="90" y1="50" x2="50" y2="10" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" />
          ) : null}

          {/* 3rd Base Path */}
          {atBatBases >= 3 ? (
            <line x1="50" y1="10" x2="10" y2="50" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" strokeDasharray="3 4" />
          ) : endInningBases >= 3 ? (
            <line x1="50" y1="10" x2="10" y2="50" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" />
          ) : null}

          {/* Home Path */}
          {atBatBases >= 4 || playType === 'hr' ? (
            <line x1="10" y1="50" x2="50" y2="90" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" strokeDasharray="3 4" />
          ) : endInningBases >= 4 ? (
            <line x1="10" y1="50" x2="50" y2="90" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" />
          ) : null}

          {/* Interactive Base Nodes */}
          {/* Home Plate */}
          <polygon
            points="50,96 56,90 56,84 44,84 44,90"
            fill={endInningBases === 4 ? '#22c55e' : (isDark ? '#fafafa' : '#1c1917')}
            style={{ cursor: 'pointer' }}
            onClick={() => handleToggleEndInningBase(4)}
          />

          {/* 1st Base */}
          <rect
            x="84" y="44" width="12" height="12"
            fill={endInningBases >= 1 ? (atBatBases >= 1 ? '#3b82f6' : '#22c55e') : (isDark ? '#52525b' : '#9ca3af')}
            transform="rotate(45 90 50)"
            style={{ cursor: 'pointer' }}
            onClick={() => handleToggleAtBatBase(1)}
          />

          {/* 2nd Base */}
          <rect
            x="44" y="4" width="12" height="12"
            fill={endInningBases >= 2 ? (atBatBases >= 2 ? '#3b82f6' : '#22c55e') : (isDark ? '#52525b' : '#9ca3af')}
            transform="rotate(45 50 10)"
            style={{ cursor: 'pointer' }}
            onClick={() => handleToggleAtBatBase(2)}
          />

          {/* 3rd Base */}
          <rect
            x="4" y="44" width="12" height="12"
            fill={endInningBases >= 3 ? (atBatBases >= 3 ? '#3b82f6' : '#22c55e') : (isDark ? '#52525b' : '#9ca3af')}
            transform="rotate(45 10 50)"
            style={{ cursor: 'pointer' }}
            onClick={() => handleToggleAtBatBase(3)}
          />

          {/* Center Code Badge */}
          {code && (
            <text
              x="50" y="54"
              textAnchor="middle"
              fill={isDark ? '#fafafa' : '#111827'}
              fontSize="14"
              fontWeight="900"
              fontFamily="'JetBrains Mono', monospace"
            >
              {code}
            </text>
          )}
        </svg>

        {/* Base Progression Toggles */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', width: '100%' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '9px', fontWeight: 600, color: isDark ? '#71717a' : '#78716c' }}>AT-BAT REACH</span>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[
                { label: 'Out', val: 0 },
                { label: '1B', val: 1 },
                { label: '2B', val: 2 },
                { label: '3B', val: 3 },
                { label: 'HR', val: 4 },
              ].map(b => (
                <button
                  key={b.val}
                  onClick={() => {
                    setAtBatBases(b.val);
                    if (endInningBases < b.val) setEndInningBases(b.val);
                  }}
                  style={{
                    flex: 1, padding: '4px 0', fontSize: '10px', fontWeight: 700, borderRadius: '4px',
                    border: 'none', cursor: 'pointer',
                    backgroundColor: atBatBases === b.val ? '#3b82f6' : (isDark ? '#27272a' : '#e5e7eb'),
                    color: atBatBases === b.val ? '#ffffff' : (isDark ? '#d4d4d8' : '#374151'),
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '9px', fontWeight: 600, color: isDark ? '#71717a' : '#78716c' }}>END OF INNING</span>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[
                { label: 'Out', val: 0 },
                { label: '1B', val: 1 },
                { label: '2B', val: 2 },
                { label: '3B', val: 3 },
                { label: 'Run', val: 4 },
              ].map(b => (
                <button
                  key={b.val}
                  onClick={() => setEndInningBases(b.val)}
                  style={{
                    flex: 1, padding: '4px 0', fontSize: '10px', fontWeight: 700, borderRadius: '4px',
                    border: 'none', cursor: 'pointer',
                    backgroundColor: endInningBases === b.val ? '#22c55e' : (isDark ? '#27272a' : '#e5e7eb'),
                    color: endInningBases === b.val ? '#ffffff' : (isDark ? '#d4d4d8' : '#374151'),
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const categories = [
    { id: 'hits', label: 'Hits', list: QUICK_HITS },
    { id: 'outs', label: 'Ground & Field Outs', list: QUICK_OUTS },
    { id: 'k', label: 'Strikeouts', list: QUICK_STRIKEOUTS },
    { id: 'walks', label: 'Walks / Free', list: QUICK_WALKS },
    { id: 'dp', label: 'Double Plays', list: QUICK_DOUBLE_PLAYS },
    { id: 'errors', label: 'Errors', list: QUICK_ERRORS },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '580px',
        maxHeight: '92vh',
        backgroundColor: isDark ? '#18181c' : '#ffffff',
        color: isDark ? '#f4f4f5' : '#18181b',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
        border: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease-out',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isDark ? '#111113' : '#faf9f6',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '2px 6px', borderRadius: '4px',
                backgroundColor: teamKey === 'away' ? '#0e3386' : '#c41e3a',
                color: '#ffffff',
              }}>
                {teamKey === 'away' ? 'TOP' : 'BOT'} INNING {inning}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>
                #{batter?.jerseyNumber} {batter?.name} ({batter?.position})
              </span>
            </div>
            <div style={{ fontSize: '11px', color: isDark ? '#a1a1aa' : '#78716c', marginTop: '2px' }}>
              {teamName || (teamKey === 'away' ? 'Away Team' : 'Home Team')}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px', borderRadius: '6px', border: 'none',
              backgroundColor: 'transparent', color: isDark ? '#a1a1aa' : '#78716c',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div style={{
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          {/* Top Section: Visual Diamond + Direct Custom Code & Type */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '12px' }}>
            {renderInteractiveDiamond()}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '4px' }}>
                  Play Notation Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 1B, 6-3, K, HR, E6"
                  style={{
                    width: '100%', padding: '8px 10px',
                    fontSize: '15px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                    borderRadius: '6px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                    backgroundColor: isDark ? '#09090b' : '#ffffff',
                    color: isDark ? '#f4f4f5' : '#18181b',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '4px' }}>
                  Play Classification
                </label>
                <select
                  value={playType}
                  onChange={(e) => {
                    const t = e.target.value;
                    setPlayType(t);
                    if (t === 'strikeout') {
                      setOutsRecorded(1);
                    } else if (t === 'hr') {
                      setAtBatBases(4);
                      setEndInningBases(4);
                      if (rbi === 0) setRbi(1);
                    }
                  }}
                  style={{
                    width: '100%', padding: '7px 8px', fontSize: '12px', fontWeight: 600,
                    borderRadius: '6px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                    backgroundColor: isDark ? '#09090b' : '#ffffff',
                    color: isDark ? '#f4f4f5' : '#18181b',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="hit">Hit (1B / 2B / 3B)</option>
                  <option value="hr">Home Run (HR)</option>
                  <option value="out">Groundout / Field Out</option>
                  <option value="strikeout">Strikeout (K / ꓘ)</option>
                  <option value="walk">Walk / HBP / Free Pass</option>
                  <option value="error">Fielding Error</option>
                </select>
              </div>

              {/* Extra Badges & RBIs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                    EXTRA BADGE
                  </label>
                  <select
                    value={extraEvent}
                    onChange={(e) => setExtraEvent(e.target.value)}
                    style={{
                      width: '100%', padding: '5px', fontSize: '11px', fontWeight: 600,
                      borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#09090b' : '#ffffff',
                      color: isDark ? '#f4f4f5' : '#18181b',
                    }}
                  >
                    <option value="">None</option>
                    <option value="SB">SB (Stolen Base)</option>
                    <option value="CS">CS (Caught Stealing)</option>
                    <option value="PO">PO (Pickoff)</option>
                    <option value="WP">WP (Wild Pitch)</option>
                    <option value="PB">PB (Passed Ball)</option>
                    <option value="BK">BK (Balk)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                    RBIs ON PLAY
                  </label>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[0, 1, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        onClick={() => setRbi(num)}
                        style={{
                          flex: 1, padding: '4px 0', fontSize: '11px', fontWeight: 700, borderRadius: '4px',
                          border: 'none', cursor: 'pointer',
                          backgroundColor: rbi === num ? '#f59e0b' : (isDark ? '#27272a' : '#e5e7eb'),
                          color: rbi === num ? '#000000' : (isDark ? '#d4d4d8' : '#374151'),
                        }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Outs on play */}
              <div>
                <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                  OUTS RECORDED
                </label>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[0, 1, 2, 3].map(num => (
                    <button
                      key={num}
                      onClick={() => setOutsRecorded(num)}
                      style={{
                        flex: 1, padding: '4px 0', fontSize: '11px', fontWeight: 700, borderRadius: '4px',
                        border: 'none', cursor: 'pointer',
                        backgroundColor: outsRecorded === num ? '#ef4444' : (isDark ? '#27272a' : '#e5e7eb'),
                        color: outsRecorded === num ? '#ffffff' : (isDark ? '#d4d4d8' : '#374151'),
                      }}
                    >
                      {num} {num === 1 ? 'Out' : 'Outs'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Select Categories Bar */}
          <div>
            <div style={{
              display: 'flex',
              gap: '4px',
              overflowX: 'auto',
              borderBottom: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
              paddingBottom: '6px',
            }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '5px 9px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: activeCategory === cat.id ? (isDark ? '#27272a' : '#e5e7eb') : 'transparent',
                    color: activeCategory === cat.id ? (isDark ? '#fafafa' : '#111827') : (isDark ? '#71717a' : '#78716c'),
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Play Grid for Active Category */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
              gap: '6px',
              marginTop: '8px',
              maxHeight: '140px',
              overflowY: 'auto',
            }}>
              {categories.find(c => c.id === activeCategory)?.list.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  style={{
                    padding: '7px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${code === preset.code ? '#3b82f6' : (isDark ? '#27272a' : '#e4e0da')}`,
                    backgroundColor: code === preset.code ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)') : (isDark ? '#141417' : '#f8f8f8'),
                    color: isDark ? '#fafafa' : '#18181b',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{preset.code}</div>
                  <div style={{ fontSize: '9.5px', color: isDark ? '#a1a1aa' : '#78716c', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {preset.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Statcast / Pitches row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            padding: '8px 10px',
            backgroundColor: isDark ? '#141417' : '#f9f9f8',
            borderRadius: '6px',
            border: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                PITCH COUNT
              </label>
              <input
                type="number"
                value={pitchCount}
                onChange={(e) => setPitchCount(e.target.value)}
                placeholder="e.g. 5"
                style={{
                  width: '100%', padding: '4px 6px', fontSize: '11px',
                  borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  color: isDark ? '#f4f4f5' : '#18181b',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                HR DISTANCE (FT)
              </label>
              <input
                type="number"
                value={hitDistance}
                onChange={(e) => setHitDistance(e.target.value)}
                placeholder="e.g. 415"
                style={{
                  width: '100%', padding: '4px 6px', fontSize: '11px',
                  borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  color: isDark ? '#f4f4f5' : '#18181b',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                EXIT VELO (MPH)
              </label>
              <input
                type="number"
                step="0.1"
                value={exitVelo}
                onChange={(e) => setExitVelo(e.target.value)}
                placeholder="e.g. 104.5"
                style={{
                  width: '100%', padding: '4px 6px', fontSize: '11px',
                  borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  color: isDark ? '#f4f4f5' : '#18181b',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '12px 16px',
          borderTop: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
          backgroundColor: isDark ? '#111113' : '#faf9f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          <div>
            {currentPlay && (
              <button
                onClick={() => {
                  onClearPlay?.();
                  onClose();
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '7px 10px', borderRadius: '6px',
                  border: `1px solid ${isDark ? '#3f3f46' : '#e5e7eb'}`,
                  backgroundColor: 'transparent',
                  color: '#ef4444', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Trash2 style={{ width: '13px', height: '13px' }} />
                Erase Play
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '7px 12px', borderRadius: '6px',
                border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                backgroundColor: isDark ? '#27272a' : '#ffffff',
                color: isDark ? '#d4d4d8' : '#374151',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              onClick={() => handleSave(false)}
              style={{
                padding: '7px 14px', borderRadius: '6px',
                border: 'none',
                backgroundColor: isDark ? '#fafafa' : '#18181b',
                color: isDark ? '#09090b' : '#fafafa',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <Check style={{ width: '14px', height: '14px' }} />
              Save Play
            </button>

            <button
              onClick={() => handleSave(true)}
              style={{
                padding: '7px 14px', borderRadius: '6px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              Save & Next ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
