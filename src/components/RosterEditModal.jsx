import React, { useState } from 'react';
import { X, Check, Users, Shield, Palette, Plus, Trash2 } from 'lucide-react';
import { TEAM_COLORS } from '../services/mlbApi';

const MLB_TEAM_KEYS = Object.keys(TEAM_COLORS);

export default function RosterEditModal({
  isOpen,
  onClose,
  scorecardData,
  onSaveScorecardData,
  isDark = false,
}) {
  if (!isOpen || !scorecardData) return null;

  const [activeTab, setActiveTab] = useState('away'); // 'away', 'home', 'gameInfo'

  // Away Team State
  const [awayName, setAwayName] = useState(scorecardData.gameInfo?.awayTeam?.name || 'VISITING TEAM');
  const [awayAbbr, setAwayAbbr] = useState(scorecardData.gameInfo?.awayTeam?.abbreviation || 'AWAY');
  const [awayColor, setAwayColor] = useState(scorecardData.gameInfo?.awayTeam?.color || '#0e3386');
  const [awaySecondary, setAwaySecondary] = useState(scorecardData.gameInfo?.awayTeam?.secondary || '#cc3433');
  const [awayBatters, setAwayBatters] = useState(
    JSON.parse(JSON.stringify(scorecardData.awayData?.batters || []))
  );
  const [awayPitchers, setAwayPitchers] = useState(
    JSON.parse(JSON.stringify(scorecardData.awayData?.pitchers?.length ? scorecardData.awayData.pitchers : [{ id: 'away_p1', name: 'STARTER', number: '30', ip: '0.0', hits: 0, runs: 0, earnedRuns: 0, walks: 0, strikeouts: [], pitchesByInning: {} }]))
  );

  // Home Team State
  const [homeName, setHomeName] = useState(scorecardData.gameInfo?.homeTeam?.name || 'HOME TEAM');
  const [homeAbbr, setHomeAbbr] = useState(scorecardData.gameInfo?.homeTeam?.abbreviation || 'HOME');
  const [homeColor, setHomeColor] = useState(scorecardData.gameInfo?.homeTeam?.color || '#c41e3a');
  const [homeSecondary, setHomeSecondary] = useState(scorecardData.gameInfo?.homeTeam?.secondary || '#0c2340');
  const [homeBatters, setHomeBatters] = useState(
    JSON.parse(JSON.stringify(scorecardData.homeData?.batters || []))
  );
  const [homePitchers, setHomePitchers] = useState(
    JSON.parse(JSON.stringify(scorecardData.homeData?.pitchers?.length ? scorecardData.homeData.pitchers : [{ id: 'home_p1', name: 'STARTER', number: '40', ip: '0.0', hits: 0, runs: 0, earnedRuns: 0, walks: 0, strikeouts: [], pitchesByInning: {} }]))
  );

  // Game Info State
  const [venue, setVenue] = useState(scorecardData.gameInfo?.venue || 'BALLPARK');
  const [dateDisplay, setDateDisplay] = useState(scorecardData.gameInfo?.dateDisplay || '');
  const [totalInnings, setTotalInnings] = useState(scorecardData.gameInfo?.totalInnings || 9);

  const handleApplyTeamPreset = (abbr, isAway) => {
    const preset = TEAM_COLORS[abbr];
    if (!preset) return;
    if (isAway) {
      setAwayAbbr(abbr);
      setAwayColor(preset.primary);
      setAwaySecondary(preset.secondary);
    } else {
      setHomeAbbr(abbr);
      setHomeColor(preset.primary);
      setHomeSecondary(preset.secondary);
    }
  };

  const handleBatterChange = (isAway, index, field, val) => {
    if (isAway) {
      const updated = [...awayBatters];
      updated[index] = { ...updated[index], [field]: val };
      setAwayBatters(updated);
    } else {
      const updated = [...homeBatters];
      updated[index] = { ...updated[index], [field]: val };
      setHomeBatters(updated);
    }
  };

  const handleAddSubstitute = (isAway, batterIdx) => {
    const targetBatters = isAway ? [...awayBatters] : [...homeBatters];
    const target = { ...targetBatters[batterIdx] };
    if (!target.substitutes) target.substitutes = [];
    const subLetters = ['a', 'b', 'c', 'd', 'e'];
    const letter = subLetters[target.substitutes.length % subLetters.length];
    target.substitutes.push({
      id: `sub_${batterIdx}_${Date.now()}`,
      name: 'SUB',
      jerseyNumber: '',
      position: 'PH',
      subLetter: letter,
    });
    targetBatters[batterIdx] = target;
    if (isAway) setAwayBatters(targetBatters);
    else setHomeBatters(targetBatters);
  };

  const handleSubChange = (isAway, batterIdx, subIdx, field, val) => {
    const targetBatters = isAway ? [...awayBatters] : [...homeBatters];
    const target = { ...targetBatters[batterIdx] };
    const subs = [...(target.substitutes || [])];
    subs[subIdx] = { ...subs[subIdx], [field]: val };
    target.substitutes = subs;
    targetBatters[batterIdx] = target;
    if (isAway) setAwayBatters(targetBatters);
    else setHomeBatters(targetBatters);
  };

  const handleRemoveSubstitute = (isAway, batterIdx, subIdx) => {
    const targetBatters = isAway ? [...awayBatters] : [...homeBatters];
    const target = { ...targetBatters[batterIdx] };
    const subs = [...(target.substitutes || [])];
    subs.splice(subIdx, 1);
    target.substitutes = subs;
    targetBatters[batterIdx] = target;
    if (isAway) setAwayBatters(targetBatters);
    else setHomeBatters(targetBatters);
  };

  const handlePitcherChange = (isAway, index, field, val) => {
    if (isAway) {
      const updated = [...awayPitchers];
      updated[index] = { ...updated[index], [field]: val };
      setAwayPitchers(updated);
    } else {
      const updated = [...homePitchers];
      updated[index] = { ...updated[index], [field]: val };
      setHomePitchers(updated);
    }
  };

  const handleAddPitcher = (isAway) => {
    const newPitcher = {
      id: `p_${Date.now()}`,
      name: 'RELIEVER',
      number: '99',
      ip: '0.0',
      hits: 0,
      runs: 0,
      earnedRuns: 0,
      walks: 0,
      strikeouts: [],
      pitchesByInning: {},
    };
    if (isAway) {
      setAwayPitchers(prev => [...prev, newPitcher]);
    } else {
      setHomePitchers(prev => [...prev, newPitcher]);
    }
  };

  const handleRemovePitcher = (isAway, index) => {
    if (isAway) {
      if (awayPitchers.length <= 1) return;
      setAwayPitchers(prev => prev.filter((_, i) => i !== index));
    } else {
      if (homePitchers.length <= 1) return;
      setHomePitchers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    const next = JSON.parse(JSON.stringify(scorecardData));

    // Update gameInfo
    next.gameInfo.venue = venue;
    next.gameInfo.dateDisplay = dateDisplay;
    next.gameInfo.totalInnings = parseInt(totalInnings, 10) || 9;

    next.gameInfo.awayTeam.name = awayName;
    next.gameInfo.awayTeam.abbreviation = awayAbbr.toUpperCase();
    next.gameInfo.awayTeam.color = awayColor;
    next.gameInfo.awayTeam.secondary = awaySecondary;

    next.gameInfo.homeTeam.name = homeName;
    next.gameInfo.homeTeam.abbreviation = homeAbbr.toUpperCase();
    next.gameInfo.homeTeam.color = homeColor;
    next.gameInfo.homeTeam.secondary = homeSecondary;

    // Update Batters
    next.awayData.batters = awayBatters.map((b, i) => ({
      ...b,
      name: (b.name || `BATTER ${i + 1}`).toUpperCase(),
      jerseyNumber: b.jerseyNumber || String(i + 1),
      position: (b.position || '—').toUpperCase(),
      substitutes: (b.substitutes || []).map(s => ({
        ...s,
        name: (s.name || '').toUpperCase(),
        position: (s.position || 'PH').toUpperCase(),
      })),
    }));

    next.homeData.batters = homeBatters.map((b, i) => ({
      ...b,
      name: (b.name || `BATTER ${i + 1}`).toUpperCase(),
      jerseyNumber: b.jerseyNumber || String(i + 1),
      position: (b.position || '—').toUpperCase(),
      substitutes: (b.substitutes || []).map(s => ({
        ...s,
        name: (s.name || '').toUpperCase(),
        position: (s.position || 'PH').toUpperCase(),
      })),
    }));

    // Update Pitchers
    next.awayData.pitchers = awayPitchers.map((p, i) => ({
      ...p,
      name: (p.name || (i === 0 ? 'STARTER' : 'RELIEVER')).toUpperCase(),
      number: p.number || (i === 0 ? 'P' : `${i + 1}`),
    }));

    next.homeData.pitchers = homePitchers.map((p, i) => ({
      ...p,
      name: (p.name || (i === 0 ? 'STARTER' : 'RELIEVER')).toUpperCase(),
      number: p.number || (i === 0 ? 'P' : `${i + 1}`),
    }));

    onSaveScorecardData(next);
    onClose();
  };

  const renderBatterRows = (batters, isAway) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '28px 46px 56px 1fr 68px', gap: '6px',
          fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', color: isDark ? '#a1a1aa' : '#78716c',
          textTransform: 'uppercase', padding: '0 4px',
        }}>
          <div>#</div>
          <div>NUM</div>
          <div>POS</div>
          <div>PLAYER NAME</div>
          <div style={{ textAlign: 'right' }}>SUB</div>
        </div>

        {batters.map((b, idx) => (
          <div key={b.id || idx} style={{
            display: 'flex', flexDirection: 'column', gap: '4px',
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
            padding: '4px 6px', borderRadius: '6px',
            border: `1px solid ${isDark ? '#27272a' : '#f0ede6'}`,
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '28px 46px 56px 1fr 68px', gap: '6px',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#71717a' : '#9ca3af', textAlign: 'center' }}>
                {idx + 1}
              </span>
              <input
                type="text"
                value={b.jerseyNumber || ''}
                onChange={(e) => handleBatterChange(isAway, idx, 'jerseyNumber', e.target.value)}
                placeholder="27"
                style={{
                  padding: '5px', fontSize: '11px', fontWeight: 700, textAlign: 'center',
                  borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                  backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                }}
              />
              <input
                type="text"
                value={b.position || ''}
                onChange={(e) => handleBatterChange(isAway, idx, 'position', e.target.value.toUpperCase())}
                placeholder="CF"
                style={{
                  padding: '5px', fontSize: '11px', fontWeight: 700, textAlign: 'center',
                  borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                  backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                }}
              />
              <input
                type="text"
                value={b.name || ''}
                onChange={(e) => handleBatterChange(isAway, idx, 'name', e.target.value)}
                placeholder={`Batter ${idx + 1} Name`}
                style={{
                  padding: '5px 8px', fontSize: '12px', fontWeight: 600,
                  borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                  backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                }}
              />
              <button
                type="button"
                onClick={() => handleAddSubstitute(isAway, idx)}
                style={{
                  padding: '4px 6px', fontSize: '10px', fontWeight: 700,
                  borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                  backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                  color: isDark ? '#38bdf8' : '#0284c7',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px',
                }}
                title="Add a pinch hitter / substitute to this lineup spot"
              >
                <Plus style={{ width: '11px', height: '11px' }} />
                <span>+Sub</span>
              </button>
            </div>

            {/* Substitutes under this slot */}
            {b.substitutes && b.substitutes.map((sub, sIdx) => (
              <div key={sub.id || sIdx} style={{
                display: 'grid', gridTemplateColumns: '28px 46px 56px 1fr 28px', gap: '6px',
                alignItems: 'center', paddingLeft: '12px',
              }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: isDark ? '#38bdf8' : '#0284c7', textAlign: 'center' }}>
                  {sub.subLetter ? `${sub.subLetter}.` : 'sub'}
                </span>
                <input
                  type="text"
                  value={sub.jerseyNumber || ''}
                  onChange={(e) => handleSubChange(isAway, idx, sIdx, 'jerseyNumber', e.target.value)}
                  placeholder="15"
                  style={{
                    padding: '4px', fontSize: '10.5px', fontWeight: 700, textAlign: 'center',
                    borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                    backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                  }}
                />
                <input
                  type="text"
                  value={sub.position || ''}
                  onChange={(e) => handleSubChange(isAway, idx, sIdx, 'position', e.target.value.toUpperCase())}
                  placeholder="PH"
                  style={{
                    padding: '4px', fontSize: '10.5px', fontWeight: 700, textAlign: 'center',
                    borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                    backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                  }}
                />
                <input
                  type="text"
                  value={sub.name || ''}
                  onChange={(e) => handleSubChange(isAway, idx, sIdx, 'name', e.target.value)}
                  placeholder="Sub Player Name"
                  style={{
                    padding: '4px 6px', fontSize: '11px', fontWeight: 600,
                    borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                    backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSubstitute(isAway, idx, sIdx)}
                  style={{
                    padding: '4px', borderRadius: '4px', border: 'none',
                    backgroundColor: 'transparent', color: '#ef4444',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  title="Remove substitute"
                >
                  <Trash2 style={{ width: '12px', height: '12px' }} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderPitcherRows = (pitchers, isAway) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '70px 50px 1fr 32px', gap: '6px',
          fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', color: isDark ? '#a1a1aa' : '#78716c',
          textTransform: 'uppercase', padding: '0 4px',
        }}>
          <div>ROLE</div>
          <div>NUM</div>
          <div>PITCHER NAME</div>
          <div></div>
        </div>

        {pitchers.map((p, idx) => (
          <div key={p.id || idx} style={{
            display: 'grid', gridTemplateColumns: '70px 50px 1fr 32px', gap: '6px',
            alignItems: 'center',
          }}>
            <span style={{
              fontSize: '9.5px', fontWeight: 800,
              color: idx === 0 ? (isDark ? '#fbbf24' : '#d97706') : (isDark ? '#a1a1aa' : '#78716c'),
              textTransform: 'uppercase',
            }}>
              {idx === 0 ? 'Starter' : `Relief #${idx}`}
            </span>
            <input
              type="text"
              value={p.number || ''}
              onChange={(e) => handlePitcherChange(isAway, idx, 'number', e.target.value)}
              placeholder="P#"
              style={{
                padding: '6px', fontSize: '11px', fontWeight: 700, textAlign: 'center',
                borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
              }}
            />
            <input
              type="text"
              value={p.name || ''}
              onChange={(e) => handlePitcherChange(isAway, idx, 'name', e.target.value)}
              placeholder={idx === 0 ? 'Starting Pitcher Name' : 'Relief Pitcher Name'}
              style={{
                padding: '6px 8px', fontSize: '12px', fontWeight: 600,
                borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
              }}
            />
            {idx > 0 ? (
              <button
                type="button"
                onClick={() => handleRemovePitcher(isAway, idx)}
                style={{
                  padding: '6px', borderRadius: '4px', border: 'none',
                  backgroundColor: 'transparent', color: '#ef4444',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title="Remove relief pitcher"
              >
                <Trash2 style={{ width: '13px', height: '13px' }} />
              </button>
            ) : <div />}
          </div>
        ))}

        <button
          type="button"
          onClick={() => handleAddPitcher(isAway)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '7px', borderRadius: '6px',
            border: `1px dashed ${isDark ? '#3f3f46' : '#cbd5e1'}`,
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            color: isDark ? '#38bdf8' : '#0284c7',
            fontSize: '11px', fontWeight: 700, cursor: 'pointer', marginTop: '2px',
          }}
        >
          <Plus style={{ width: '13px', height: '13px' }} />
          <span>+ Add Reliever / Pitcher</span>
        </button>
      </div>
    );
  };

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
        maxWidth: '620px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
            <span style={{ fontSize: '14px', fontWeight: 800 }}>
              Edit Teams & Lineups
            </span>
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

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
          padding: '0 12px',
          backgroundColor: isDark ? '#141417' : '#f9f9f8',
        }}>
          {[
            { id: 'away', label: `Away: ${awayName || 'Visiting Team'}` },
            { id: 'home', label: `Home: ${homeName || 'Home Team'}` },
            { id: 'gameInfo', label: 'Venue & Details' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? (isDark ? '#ffffff' : '#000000') : (isDark ? '#71717a' : '#a1a1aa'),
                borderBottom: `2px solid ${activeTab === tab.id ? '#3b82f6' : 'transparent'}`,
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{
          padding: '16px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {activeTab === 'away' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Team Basics */}
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8px',
                padding: '12px', borderRadius: '8px',
                backgroundColor: isDark ? '#141417' : '#f8f8f8',
                border: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                    TEAM FULL NAME
                  </label>
                  <input
                    type="text"
                    value={awayName}
                    onChange={(e) => setAwayName(e.target.value)}
                    style={{
                      width: '100%', padding: '6px 8px', fontSize: '12px', fontWeight: 600,
                      borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                    ABBREV
                  </label>
                  <input
                    type="text"
                    value={awayAbbr}
                    maxLength={4}
                    onChange={(e) => setAwayAbbr(e.target.value.toUpperCase())}
                    style={{
                      width: '100%', padding: '6px 8px', fontSize: '12px', fontWeight: 700,
                      borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                    PRIMARY COLOR
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="color"
                      value={awayColor}
                      onChange={(e) => setAwayColor(e.target.value)}
                      style={{ width: '28px', height: '28px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={awayColor}
                      onChange={(e) => setAwayColor(e.target.value)}
                      style={{
                        width: '100%', padding: '4px 6px', fontSize: '10px', fontWeight: 600,
                        borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                        backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                    SECONDARY COLOR
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="color"
                      value={awaySecondary}
                      onChange={(e) => setAwaySecondary(e.target.value)}
                      style={{ width: '28px', height: '28px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={awaySecondary}
                      onChange={(e) => setAwaySecondary(e.target.value)}
                      style={{
                        width: '100%', padding: '4px 6px', fontSize: '10px', fontWeight: 600,
                        borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                        backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick MLB Presets */}
              <div>
                <span style={{ fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', textTransform: 'uppercase' }}>
                  Quick MLB Color Presets
                </span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {MLB_TEAM_KEYS.slice(0, 15).map(abbr => (
                    <button
                      key={abbr}
                      onClick={() => handleApplyTeamPreset(abbr, true)}
                      style={{
                        padding: '2px 6px', fontSize: '10px', fontWeight: 700, borderRadius: '4px',
                        border: 'none', cursor: 'pointer',
                        backgroundColor: TEAM_COLORS[abbr].primary, color: '#ffffff',
                      }}
                    >
                      {abbr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pitchers (Starter & Relievers) */}
              <div style={{
                padding: '12px', borderRadius: '8px',
                backgroundColor: isDark ? '#141417' : '#f8f8f8',
                border: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
              }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#fafafa' : '#18181b', display: 'block', marginBottom: '8px' }}>
                  Away Pitching Staff
                </span>
                {renderPitcherRows(awayPitchers, true)}
              </div>

              {/* 9 Batter Lineup */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#fafafa' : '#18181b' }}>
                  Starting Batting Order (1–9) & Substitutes
                </span>
                <div style={{ marginTop: '8px' }}>
                  {renderBatterRows(awayBatters, true)}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Team Basics */}
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8px',
                padding: '12px', borderRadius: '8px',
                backgroundColor: isDark ? '#141417' : '#f8f8f8',
                border: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                    TEAM FULL NAME
                  </label>
                  <input
                    type="text"
                    value={homeName}
                    onChange={(e) => setHomeName(e.target.value)}
                    style={{
                      width: '100%', padding: '6px 8px', fontSize: '12px', fontWeight: 600,
                      borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                    ABBREV
                  </label>
                  <input
                    type="text"
                    value={homeAbbr}
                    maxLength={4}
                    onChange={(e) => setHomeAbbr(e.target.value.toUpperCase())}
                    style={{
                      width: '100%', padding: '6px 8px', fontSize: '12px', fontWeight: 700,
                      borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                    PRIMARY COLOR
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="color"
                      value={homeColor}
                      onChange={(e) => setHomeColor(e.target.value)}
                      style={{ width: '28px', height: '28px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={homeColor}
                      onChange={(e) => setHomeColor(e.target.value)}
                      style={{
                        width: '100%', padding: '4px 6px', fontSize: '10px', fontWeight: 600,
                        borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                        backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                    SECONDARY COLOR
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="color"
                      value={homeSecondary}
                      onChange={(e) => setHomeSecondary(e.target.value)}
                      style={{ width: '28px', height: '28px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={homeSecondary}
                      onChange={(e) => setHomeSecondary(e.target.value)}
                      style={{
                        width: '100%', padding: '4px 6px', fontSize: '10px', fontWeight: 600,
                        borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                        backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick MLB Presets */}
              <div>
                <span style={{ fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', textTransform: 'uppercase' }}>
                  Quick MLB Color Presets
                </span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {MLB_TEAM_KEYS.slice(15).map(abbr => (
                    <button
                      key={abbr}
                      onClick={() => handleApplyTeamPreset(abbr, false)}
                      style={{
                        padding: '2px 6px', fontSize: '10px', fontWeight: 700, borderRadius: '4px',
                        border: 'none', cursor: 'pointer',
                        backgroundColor: TEAM_COLORS[abbr].primary, color: '#ffffff',
                      }}
                    >
                      {abbr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pitchers (Starter & Relievers) */}
              <div style={{
                padding: '12px', borderRadius: '8px',
                backgroundColor: isDark ? '#141417' : '#f8f8f8',
                border: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
              }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#fafafa' : '#18181b', display: 'block', marginBottom: '8px' }}>
                  Home Pitching Staff
                </span>
                {renderPitcherRows(homePitchers, false)}
              </div>

              {/* 9 Batter Lineup */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#fafafa' : '#18181b' }}>
                  Starting Batting Order (1–9) & Substitutes
                </span>
                <div style={{ marginTop: '8px' }}>
                  {renderBatterRows(homeBatters, false)}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gameInfo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '4px' }}>
                  BALLPARK / VENUE LOCATION
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Wrigley Field – Chicago, IL"
                  style={{
                    width: '100%', padding: '8px 10px', fontSize: '12px', fontWeight: 600,
                    borderRadius: '6px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                    backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '4px' }}>
                  DATE DISPLAY STRING
                </label>
                <input
                  type="text"
                  value={dateDisplay}
                  onChange={(e) => setDateDisplay(e.target.value)}
                  placeholder="e.g. OCTOBER 8, 2025"
                  style={{
                    width: '100%', padding: '8px 10px', fontSize: '12px', fontWeight: 600,
                    borderRadius: '6px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                    backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '4px' }}>
                  TOTAL INNINGS
                </label>
                <select
                  value={totalInnings}
                  onChange={(e) => setTotalInnings(Number(e.target.value))}
                  style={{
                    width: '100%', padding: '8px 10px', fontSize: '12px', fontWeight: 600,
                    borderRadius: '6px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                    backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value={9}>9 Innings (Standard)</option>
                  <option value={10}>10 Innings (Extra Innings)</option>
                  <option value={11}>11 Innings</option>
                  <option value={12}>12 Innings</option>
                  <option value={13}>13 Innings</option>
                  <option value={14}>14 Innings</option>
                  <option value={15}>15 Innings</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div style={{
          padding: '12px 16px',
          borderTop: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
          backgroundColor: isDark ? '#111113' : '#faf9f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 14px', borderRadius: '6px',
              border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
              backgroundColor: isDark ? '#27272a' : '#ffffff',
              color: isDark ? '#d4d4d8' : '#374151',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            style={{
              padding: '8px 18px', borderRadius: '6px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
            }}
          >
            <Check style={{ width: '14px', height: '14px' }} />
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
