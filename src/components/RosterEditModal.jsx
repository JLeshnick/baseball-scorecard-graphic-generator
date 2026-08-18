import React, { useState } from 'react';
import { X, Check, Users, Shield, Palette } from 'lucide-react';
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
  const [awayPitcherName, setAwayPitcherName] = useState(
    scorecardData.awayData?.pitchers?.[0]?.name || 'STARTER'
  );
  const [awayPitcherNum, setAwayPitcherNum] = useState(
    scorecardData.awayData?.pitchers?.[0]?.number || '30'
  );

  // Home Team State
  const [homeName, setHomeName] = useState(scorecardData.gameInfo?.homeTeam?.name || 'HOME TEAM');
  const [homeAbbr, setHomeAbbr] = useState(scorecardData.gameInfo?.homeTeam?.abbreviation || 'HOME');
  const [homeColor, setHomeColor] = useState(scorecardData.gameInfo?.homeTeam?.color || '#c41e3a');
  const [homeSecondary, setHomeSecondary] = useState(scorecardData.gameInfo?.homeTeam?.secondary || '#0c2340');
  const [homeBatters, setHomeBatters] = useState(
    JSON.parse(JSON.stringify(scorecardData.homeData?.batters || []))
  );
  const [homePitcherName, setHomePitcherName] = useState(
    scorecardData.homeData?.pitchers?.[0]?.name || 'STARTER'
  );
  const [homePitcherNum, setHomePitcherNum] = useState(
    scorecardData.homeData?.pitchers?.[0]?.number || '40'
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
    }));

    next.homeData.batters = homeBatters.map((b, i) => ({
      ...b,
      name: (b.name || `BATTER ${i + 1}`).toUpperCase(),
      jerseyNumber: b.jerseyNumber || String(i + 1),
      position: (b.position || '—').toUpperCase(),
    }));

    // Update Pitchers
    if (!next.awayData.pitchers || next.awayData.pitchers.length === 0) {
      next.awayData.pitchers = [{ id: 'away_p1' }];
    }
    next.awayData.pitchers[0].name = (awayPitcherName || 'PITCHER').toUpperCase();
    next.awayData.pitchers[0].number = awayPitcherNum || 'P';

    if (!next.homeData.pitchers || next.homeData.pitchers.length === 0) {
      next.homeData.pitchers = [{ id: 'home_p1' }];
    }
    next.homeData.pitchers[0].name = (homePitcherName || 'PITCHER').toUpperCase();
    next.homeData.pitchers[0].number = homePitcherNum || 'P';

    onSaveScorecardData(next);
    onClose();
  };

  const renderBatterRows = (batters, isAway) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '32px 50px 60px 1fr', gap: '8px',
          fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', color: isDark ? '#a1a1aa' : '#78716c',
          textTransform: 'uppercase', padding: '0 4px',
        }}>
          <div>#</div>
          <div>NUM</div>
          <div>POS</div>
          <div>PLAYER NAME</div>
        </div>

        {batters.map((b, idx) => (
          <div key={b.id || idx} style={{
            display: 'grid', gridTemplateColumns: '32px 50px 60px 1fr', gap: '8px',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#71717a' : '#9ca3af', textAlign: 'center' }}>
              {idx + 1}
            </span>
            <input
              type="text"
              value={b.jerseyNumber || ''}
              onChange={(e) => handleBatterChange(isAway, idx, 'jerseyNumber', e.target.value)}
              placeholder="e.g. 27"
              style={{
                padding: '6px', fontSize: '11px', fontWeight: 700, textAlign: 'center',
                borderRadius: '6px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
              }}
            />
            <input
              type="text"
              value={b.position || ''}
              onChange={(e) => handleBatterChange(isAway, idx, 'position', e.target.value.toUpperCase())}
              placeholder="CF"
              style={{
                padding: '6px', fontSize: '11px', fontWeight: 700, textAlign: 'center',
                borderRadius: '6px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
              }}
            />
            <input
              type="text"
              value={b.name || ''}
              onChange={(e) => handleBatterChange(isAway, idx, 'name', e.target.value)}
              placeholder={`Batter ${idx + 1} Last Name`}
              style={{
                padding: '6px 8px', fontSize: '12px', fontWeight: 600,
                borderRadius: '6px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
              }}
            />
          </div>
        ))}
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
            { id: 'away', label: `Visiting Team (${awayAbbr})` },
            { id: 'home', label: `Home Team (${homeAbbr})` },
            { id: 'gameInfo', label: 'Venue & Game Info' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '10px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                color: activeTab === t.id ? (isDark ? '#fafafa' : '#18181b') : (isDark ? '#71717a' : '#78716c'),
                borderBottom: `2px solid ${activeTab === t.id ? '#3b82f6' : 'transparent'}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Body (Scrollable) */}
        <div style={{
          padding: '16px',
          overflowY: 'auto',
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

              {/* Starting Pitcher */}
              <div style={{
                display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px',
                padding: '10px 12px', borderRadius: '8px',
                backgroundColor: isDark ? '#141417' : '#f8f8f8',
                border: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                    PITCHER #
                  </label>
                  <input
                    type="text"
                    value={awayPitcherNum}
                    onChange={(e) => setAwayPitcherNum(e.target.value)}
                    style={{
                      width: '100%', padding: '6px', fontSize: '11px', fontWeight: 700, textAlign: 'center',
                      borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                    STARTING PITCHER NAME
                  </label>
                  <input
                    type="text"
                    value={awayPitcherName}
                    onChange={(e) => setAwayPitcherName(e.target.value)}
                    style={{
                      width: '100%', padding: '6px 8px', fontSize: '12px', fontWeight: 600,
                      borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* 9 Batter Lineup */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#fafafa' : '#18181b' }}>
                  Starting Batting Order (1–9)
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
                  {MLB_TEAM_KEYS.slice(15, 30).map(abbr => (
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

              {/* Starting Pitcher */}
              <div style={{
                display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px',
                padding: '10px 12px', borderRadius: '8px',
                backgroundColor: isDark ? '#141417' : '#f8f8f8',
                border: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                    PITCHER #
                  </label>
                  <input
                    type="text"
                    value={homePitcherNum}
                    onChange={(e) => setHomePitcherNum(e.target.value)}
                    style={{
                      width: '100%', padding: '6px', fontSize: '11px', fontWeight: 700, textAlign: 'center',
                      borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '2px' }}>
                    STARTING PITCHER NAME
                  </label>
                  <input
                    type="text"
                    value={homePitcherName}
                    onChange={(e) => setHomePitcherName(e.target.value)}
                    style={{
                      width: '100%', padding: '6px 8px', fontSize: '12px', fontWeight: 600,
                      borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* 9 Batter Lineup */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#fafafa' : '#18181b' }}>
                  Starting Batting Order (1–9)
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
                  BALLPARK / VENUE & CITY
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
                  GAME DATE DISPLAY TEXT
                </label>
                <input
                  type="text"
                  value={dateDisplay}
                  onChange={(e) => setDateDisplay(e.target.value)}
                  placeholder="e.g. OCTOBER 14, 2026"
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
                  TOTAL INNINGS (9 standard, or 10+ for extra innings)
                </label>
                <select
                  value={totalInnings}
                  onChange={(e) => setTotalInnings(parseInt(e.target.value, 10))}
                  style={{
                    width: '100%', padding: '8px 10px', fontSize: '12px', fontWeight: 600,
                    borderRadius: '6px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                    backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#fafafa' : '#18181b',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value={9}>9 Innings (Standard Game)</option>
                  <option value={10}>10 Innings (Extra Innings)</option>
                  <option value={11}>11 Innings (Extra Innings)</option>
                  <option value={12}>12 Innings (Extra Innings)</option>
                  <option value={13}>13 Innings (Extra Innings)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
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
              padding: '7px 14px', borderRadius: '6px',
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
              padding: '7px 16px', borderRadius: '6px',
              border: 'none',
              backgroundColor: isDark ? '#fafafa' : '#18181b',
              color: isDark ? '#09090b' : '#fafafa',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Check style={{ width: '14px', height: '14px' }} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
