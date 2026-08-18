import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function PitcherEditModal({
  isOpen,
  onClose,
  pitcherContext, // { teamKey: 'away'|'home', pitcher: object, pitcherIndex: number, inning?: number, teamName: string }
  onSavePitcher,  // ({ teamKey, pitcherIndex, updatedPitcher }) => void
  totalInnings = 9,
  isDark = false,
}) {
  if (!isOpen || !pitcherContext) return null;

  const { teamKey, pitcher, pitcherIndex, inning, teamName } = pitcherContext;

  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [ip, setIp] = useState('0.0');
  const [hits, setHits] = useState(0);
  const [runs, setRuns] = useState(0);
  const [earnedRuns, setEarnedRuns] = useState(0);
  const [walks, setWalks] = useState(0);
  const [strikeoutsCount, setStrikeoutsCount] = useState(0);
  const [pitchesByInning, setPitchesByInning] = useState({});

  useEffect(() => {
    if (pitcher) {
      setName(pitcher.name || '');
      setNumber(pitcher.number || '');
      setIp(pitcher.ip || '0.0');
      setHits(pitcher.hits ?? 0);
      setRuns(pitcher.runs ?? 0);
      setEarnedRuns(pitcher.earnedRuns ?? 0);
      setWalks(pitcher.walks ?? 0);
      setStrikeoutsCount(pitcher.strikeouts ? pitcher.strikeouts.length : (pitcher.kCount || 0));
      setPitchesByInning(JSON.parse(JSON.stringify(pitcher.pitchesByInning || {})));
    }
  }, [pitcher, pitcherContext]);

  const handleInningPitchChange = (innNum, field, val) => {
    const parsed = parseInt(val, 10);
    const num = isNaN(parsed) ? 0 : parsed;
    setPitchesByInning(prev => {
      const current = prev[innNum] || { pitches: 0, strikes: 0, balls: 0 };
      const updatedInn = { ...current, [field]: num };
      if (field === 'strikes' && num + (updatedInn.balls || 0) > (updatedInn.pitches || 0)) {
        updatedInn.pitches = num + (updatedInn.balls || 0);
      } else if (field === 'balls' && num + (updatedInn.strikes || 0) > (updatedInn.pitches || 0)) {
        updatedInn.pitches = num + (updatedInn.strikes || 0);
      }
      return { ...prev, [innNum]: updatedInn };
    });
  };

  const handleSave = () => {
    let totalP = 0;
    let totalS = 0;
    let totalB = 0;
    Object.values(pitchesByInning).forEach(inn => {
      totalP += inn.pitches || 0;
      totalS += inn.strikes || 0;
      totalB += inn.balls || 0;
    });

    const updated = {
      ...pitcher,
      name: name.trim().toUpperCase(),
      number: number.trim(),
      ip: String(ip).trim(),
      hits: parseInt(hits, 10) || 0,
      runs: parseInt(runs, 10) || 0,
      earnedRuns: parseInt(earnedRuns, 10) || 0,
      walks: parseInt(walks, 10) || 0,
      strikeouts: Array.from({ length: parseInt(strikeoutsCount, 10) || 0 }, (_, i) => ({
        id: `k_${i + 1}`,
        isLooking: false,
        batterName: '',
      })),
      pitchesByInning,
      totalPitches: totalP || pitcher?.totalPitches || 0,
      totalStrikes: totalS || pitcher?.totalStrikes || 0,
      totalBalls: totalB || pitcher?.totalBalls || 0,
    };

    onSavePitcher({
      teamKey,
      pitcherIndex,
      updatedPitcher: updated,
    });
    onClose();
  };

  const inningsList = Array.from({ length: totalInnings }, (_, i) => i + 1);

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
        maxWidth: '560px',
        maxHeight: '90vh',
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
          padding: '12px 16px',
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
                {teamKey === 'away' ? 'AWAY' : 'HOME'} PITCHER
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>
                {name || 'Pitcher'} {number ? `#${number}` : ''}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: isDark ? '#a1a1aa' : '#78716c', marginTop: '2px' }}>
              {teamName || (teamKey === 'away' ? 'Away Team' : 'Home Team')} · Pitch Count & Stat Editor
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

        {/* Content */}
        <div style={{
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          {/* Pitcher Identity row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '3px' }}>
                Jersey #
              </label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g. 35"
                style={{
                  width: '100%', padding: '6px 8px', fontSize: '12px', fontWeight: 700,
                  borderRadius: '6px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  color: isDark ? '#f4f4f5' : '#18181b',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '3px' }}>
                Pitcher Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                placeholder="e.g. MCCLANAHAN"
                style={{
                  width: '100%', padding: '6px 8px', fontSize: '12px', fontWeight: 700,
                  borderRadius: '6px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  color: isDark ? '#f4f4f5' : '#18181b',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Core Stats Row: IP, H, R, ER, BB, K */}
          <div>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: isDark ? '#a1a1aa' : '#78716c', marginBottom: '6px' }}>
              Overall Pitching Box Stats
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
              {[
                { label: 'IP', val: ip, set: setIp, type: 'text' },
                { label: 'H', val: hits, set: setHits, type: 'number' },
                { label: 'R', val: runs, set: setRuns, type: 'number' },
                { label: 'ER', val: earnedRuns, set: setEarnedRuns, type: 'number' },
                { label: 'BB', val: walks, set: setWalks, type: 'number' },
                { label: 'K', val: strikeoutsCount, set: setStrikeoutsCount, type: 'number' },
              ].map(st => (
                <div key={st.label}>
                  <span style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: isDark ? '#a1a1aa' : '#78716c', textAlign: 'center', marginBottom: '2px' }}>
                    {st.label}
                  </span>
                  <input
                    type={st.type}
                    value={st.val}
                    onChange={(e) => st.set(e.target.value)}
                    style={{
                      width: '100%', padding: '5px 4px', fontSize: '12px', fontWeight: 700, textAlign: 'center',
                      borderRadius: '4px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#09090b' : '#ffffff',
                      color: isDark ? '#f4f4f5' : '#18181b',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Inning-by-Inning Pitches Breakdown */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: isDark ? '#a1a1aa' : '#78716c' }}>
                Inning-by-Inning Pitches, Strikes & Balls
              </label>
              <span style={{ fontSize: '9.5px', color: isDark ? '#71717a' : '#a8a29e' }}>
                P = Pitches · S = Strikes · B = Balls
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '6px',
            }}>
              {inningsList.map(innNum => {
                const innData = pitchesByInning[innNum] || { pitches: '', strikes: '', balls: '' };
                const isCurrentInning = inning === innNum;
                return (
                  <div
                    key={innNum}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: `1px solid ${isCurrentInning ? '#3b82f6' : (isDark ? '#27272a' : '#e4e0da')}`,
                      backgroundColor: isCurrentInning ? (isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.06)') : (isDark ? '#141417' : '#f9f9f8'),
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 800, color: isCurrentInning ? '#3b82f6' : (isDark ? '#d4d4d8' : '#374151'), marginBottom: '4px' }}>
                      Inning {innNum}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3px' }}>
                      <div>
                        <span style={{ fontSize: '8px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', display: 'block', textAlign: 'center' }}>P</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={innData.pitches ?? ''}
                          onChange={(e) => handleInningPitchChange(innNum, 'pitches', e.target.value)}
                          style={{
                            width: '100%', padding: '3px 1px', fontSize: '11px', fontWeight: 700, textAlign: 'center',
                            borderRadius: '3px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                            backgroundColor: isDark ? '#09090b' : '#ffffff',
                            color: isDark ? '#f4f4f5' : '#18181b',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '8px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', display: 'block', textAlign: 'center' }}>S</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={innData.strikes ?? ''}
                          onChange={(e) => handleInningPitchChange(innNum, 'strikes', e.target.value)}
                          style={{
                            width: '100%', padding: '3px 1px', fontSize: '11px', fontWeight: 700, textAlign: 'center',
                            borderRadius: '3px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                            backgroundColor: isDark ? '#09090b' : '#ffffff',
                            color: isDark ? '#f4f4f5' : '#18181b',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '8px', fontWeight: 700, color: isDark ? '#a1a1aa' : '#78716c', display: 'block', textAlign: 'center' }}>B</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={innData.balls ?? ''}
                          onChange={(e) => handleInningPitchChange(innNum, 'balls', e.target.value)}
                          style={{
                            width: '100%', padding: '3px 1px', fontSize: '11px', fontWeight: 700, textAlign: 'center',
                            borderRadius: '3px', border: `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                            backgroundColor: isDark ? '#09090b' : '#ffffff',
                            color: isDark ? '#f4f4f5' : '#18181b',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
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
            Save Pitcher Stats
          </button>
        </div>
      </div>
    </div>
  );
}
