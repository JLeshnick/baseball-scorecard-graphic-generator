import React, { useState, useEffect } from 'react';
import { X, ChevronRight, RotateCcw } from 'lucide-react';
import { formatPlayerName } from '../utils/constants';

export function getPitcherPlays(pitcherCtx, scorecardData, selectedInning) {
  if (!pitcherCtx || !scorecardData) return [];
  const { teamKey, pitcher } = pitcherCtx;
  const oppBatters = teamKey === 'away'
    ? (scorecardData.homeData?.batters || [])
    : (scorecardData.awayData?.batters || []);

  const matchingPlays = [];

  oppBatters.forEach(b => {
    if (!b.plays) return;
    Object.entries(b.plays).forEach(([innKey, playOrPlays]) => {
      const innNum = parseInt(innKey, 10);
      if (selectedInning !== 'all' && selectedInning != null && innNum !== Number(selectedInning)) {
        return;
      }
      const playsList = Array.isArray(playOrPlays) ? playOrPlays : (playOrPlays ? [playOrPlays] : []);
      playsList.forEach(p => {
        if (!p) return;

        // 1. Check explicit ID match
        const matchesId = p.pitcherId && pitcher?.id && String(p.pitcherId) === String(pitcher.id);

        // 2. Check explicit name match
        const pFullName = (p.pitcherFullName || '').trim().toLowerCase();
        const pName = (p.pitcherName || '').trim().toLowerCase();
        const ptFullName = (pitcher?.fullName || '').trim().toLowerCase();
        const ptName = (pitcher?.name || '').trim().toLowerCase();

        const matchesFullName = pFullName && ptFullName && pFullName === ptFullName;
        const matchesName = pName && ptName && pName === ptName;
        const matchesCross = (pFullName && ptName && pFullName.includes(ptName)) || (ptFullName && pName && ptFullName.includes(pName));

        const isExplicitMatch = matchesId || matchesFullName || matchesName || matchesCross;
        const hasExplicitPitcherOnPlay = Boolean(p.pitcherId || p.pitcherFullName || p.pitcherName);

        if (hasExplicitPitcherOnPlay) {
          if (isExplicitMatch) {
            matchingPlays.push({
              ...p,
              inning: innNum,
              batterName: b.name,
              batterFullName: b.fullName || b.name,
              batterJerseyNumber: b.jerseyNumber,
            });
          }
          return;
        }

        // 3. Fallback only if the play has NO pitcher info attached (e.g. manual scorekeeping):
        // Only attribute if this pitcher was the sole pitcher on the staff who pitched in this inning
        const staff = teamKey === 'away' ? (scorecardData.awayData?.pitchers || []) : (scorecardData.homeData?.pitchers || []);
        const activeInningPitchers = staff.filter(s => (s.pitchesByInning?.[innNum]?.pitches || 0) > 0);
        const isSolePitcherInInning = activeInningPitchers.length === 1 && (
          (pitcher?.id && activeInningPitchers[0].id && String(activeInningPitchers[0].id) === String(pitcher.id)) ||
          (activeInningPitchers[0].name && pitcher?.name && activeInningPitchers[0].name.toLowerCase() === pitcher.name.toLowerCase())
        );

        if (isSolePitcherInInning) {
          matchingPlays.push({
            ...p,
            inning: innNum,
            batterName: b.name,
            batterFullName: b.fullName || b.name,
            batterJerseyNumber: b.jerseyNumber,
          });
        }
      });
    });
  });

  return matchingPlays;
}

export default function PitcherInspectionModal({
  isOpen,
  onClose,
  inspectedPitcher,
  scorecardData,
  isDark,
  c,
}) {
  if (!isOpen || !inspectedPitcher || !scorecardData) return null;

  const { pitcher, teamKey, teamName, inning: initialInning } = inspectedPitcher;

  // Inning selector state: 'all' or specific inning number
  const [selectedInning, setSelectedInning] = useState(() => {
    if (initialInning) return Number(initialInning);
    return 'all';
  });

  // Visualizer mode: 'pitches' | 'spray'
  const [visualizerMode, setVisualizerMode] = useState('pitches');
  // Pitches perspective: 'catcher' | 'side'
  const [pitchPerspective, setPitchPerspective] = useState('catcher');
  // Spray perspective: 'spray' | 'elevation'
  const [hitPerspective, setHitPerspective] = useState('spray');

  const [hoveredBattedBallIndex, setHoveredBattedBallIndex] = useState(null);
  const [hoveredPitchIdx, setHoveredPitchIdx] = useState(null);
  const [pitchFilter, setPitchFilter] = useState('all');

  // Sync selected inning when inspectedPitcher changes
  useEffect(() => {
    if (inspectedPitcher?.inning) {
      setSelectedInning(Number(inspectedPitcher.inning));
    } else {
      setSelectedInning('all');
    }
    setHoveredBattedBallIndex(null);
    setHoveredPitchIdx(null);
    setPitchFilter('all');
  }, [inspectedPitcher]);

  // Extract all innings pitched
  const inningsPitched = Object.entries(pitcher?.pitchesByInning || {})
    .filter(([_, data]) => (data?.pitches || 0) > 0)
    .map(([inn]) => Number(inn))
    .sort((a, b) => a - b);

  // Fetch matching plays
  const matchingPlays = getPitcherPlays(inspectedPitcher, scorecardData, selectedInning);

  // Gather pitches and batted balls
  const allPitches = matchingPlays.flatMap((p, pIdx) => (p.pitches || []).map((pitch, idx) => ({
    ...pitch,
    playDesc: p.description || p.code,
    batterName: p.batterFullName || p.batterName,
    inning: p.inning,
    globalPitchNumber: idx + 1,
  })));

  const allBattedBalls = matchingPlays.flatMap(p => {
    const balls = p.battedBalls?.length ? p.battedBalls : (p.hitData ? [p.hitData] : []);
    return balls.map(b => ({
      ...b,
      batterName: p.batterFullName || p.batterName,
      batterJerseyNumber: p.batterJerseyNumber,
      playCode: p.code,
      playDesc: p.description || p.code,
      inning: p.inning,
    }));
  });

  const allStrikesCount = allPitches.filter(p => p.isStrike || p.resultType === 'strike' || p.resultType === 'foul' || p.callDesc?.toLowerCase().includes('strike') || p.callDesc?.toLowerCase().includes('foul')).length;
  const allBallsCount = allPitches.filter(p => p.isBall || p.resultType === 'ball' || p.callDesc?.toLowerCase().includes('ball')).length;
  const allFoulsCount = allPitches.filter(p => p.resultType === 'foul' || p.callDesc?.toLowerCase().includes('foul')).length;

  const allHitsAllowedCount = allBattedBalls.filter(b => !b.isFoul && (b.isBallInPlay || b.playCode === '1B' || b.playCode === '2B' || b.playCode === '3B' || b.playCode === 'HR' || b.playCode === 'hr')).length;
  const allFoulsAllowedCount = allBattedBalls.filter(b => Boolean(b.isFoul)).length;
  const allOutsAllowedCount = allBattedBalls.filter(b => !b.isFoul && !b.isBallInPlay && b.playCode !== '1B' && b.playCode !== '2B' && b.playCode !== '3B' && b.playCode !== 'HR' && b.playCode !== 'hr').length;

  const pitcherDisplayName = formatPlayerName(pitcher?.fullName || pitcher?.name || 'Pitcher');
  const ks = pitcher?.strikeouts?.length || 0;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      {/* Backdrop tap to close */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div style={{
        position: 'relative',
        zIndex: 1001,
        width: '100%',
        maxHeight: '90vh',
        backgroundColor: isDark ? '#141417' : '#ffffff',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        border: `1px solid ${isDark ? '#27272a' : '#e2e8f0'}`,
        borderBottom: 'none',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Drag handle */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '8px', paddingBottom: '4px' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: isDark ? '#3f3f46' : '#cbd5e1' }} />
        </div>

        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px 12px 16px',
          borderBottom: `1px solid ${isDark ? '#27272a' : '#f1f5f9'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {pitcher?.number && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '28px', height: '28px', borderRadius: '50%',
                backgroundColor: teamKey === 'away' ? '#3b82f6' : '#ef4444',
                color: '#ffffff',
                fontSize: '12px', fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
              }}>
                {pitcher.number}
              </span>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '15px', fontWeight: 800,
                color: isDark ? '#f4f4f5' : '#0f172a',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {pitcherDisplayName}
              </div>
              <div style={{ fontSize: '11px', color: isDark ? '#a1a1aa' : '#64748b' }}>
                {teamName || (teamKey === 'home' ? 'Home Pitcher' : 'Away Pitcher')} · {selectedInning !== 'all' ? `Inning ${selectedInning}` : 'All Outing'} · {pitcher?.ip || '0.0'} IP · {pitcher?.totalPitches ? `${pitcher.totalPitches} Pitches` : ''} · {ks} K
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: isDark ? '#27272a' : '#f1f5f9',
              border: `1px solid ${isDark ? '#3f3f46' : '#e2e8f0'}`,
              color: isDark ? '#e4e4e7' : '#334155',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '12px 16px 24px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Visualizer Mode Tabs (Pitches vs Hit/Foul Spray) */}
          <div style={{
            display: 'flex', gap: '4px', padding: '3px', borderRadius: '10px',
            backgroundColor: isDark ? '#1f1f23' : '#f1f5f9',
            border: `1px solid ${isDark ? '#27272a' : '#e2e8f0'}`,
          }}>
            <button
              onClick={() => setVisualizerMode('pitches')}
              style={{
                flex: 1, padding: '7px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 800,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
                backgroundColor: visualizerMode === 'pitches' ? (isDark ? '#27272a' : '#ffffff') : 'transparent',
                color: visualizerMode === 'pitches' ? (isDark ? '#f4f4f5' : '#0f172a') : (isDark ? '#71717a' : '#64748b'),
                boxShadow: visualizerMode === 'pitches' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              🎯 Pitches {allPitches.length > 0 ? `(${allPitches.length}P · ${allStrikesCount}S ${allBallsCount}B)` : '(0P)'}
            </button>
            <button
              onClick={() => setVisualizerMode('spray')}
              style={{
                flex: 1, padding: '7px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 800,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
                backgroundColor: visualizerMode === 'spray' ? (isDark ? '#27272a' : '#ffffff') : 'transparent',
                color: visualizerMode === 'spray' ? (isDark ? '#f4f4f5' : '#0f172a') : (isDark ? '#71717a' : '#64748b'),
                boxShadow: visualizerMode === 'spray' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              ⚾ Hits Allowed {allBattedBalls.length > 0 ? `(${allBattedBalls.length}B · ${allHitsAllowedCount}H ${allFoulsAllowedCount}F)` : '(0B)'}
            </button>
          </div>

          {/* Perspective Sub-Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {visualizerMode === 'pitches' ? (
              <>
                <button
                  onClick={() => setPitchPerspective('catcher')}
                  style={{
                    padding: '4px 12px', fontSize: '10px', fontWeight: 700, borderRadius: '6px',
                    backgroundColor: pitchPerspective === 'catcher' ? (isDark ? '#3b82f6' : '#2563eb') : 'transparent',
                    color: pitchPerspective === 'catcher' ? '#ffffff' : (isDark ? '#a1a1aa' : '#64748b'),
                    border: `1px solid ${pitchPerspective === 'catcher' ? '#2563eb' : (isDark ? '#27272a' : '#cbd5e1')}`,
                    cursor: 'pointer',
                  }}
                >
                  Catcher Front
                </button>
                <button
                  onClick={() => setPitchPerspective('side')}
                  style={{
                    padding: '4px 12px', fontSize: '10px', fontWeight: 700, borderRadius: '6px',
                    backgroundColor: pitchPerspective === 'side' ? (isDark ? '#3b82f6' : '#2563eb') : 'transparent',
                    color: pitchPerspective === 'side' ? '#ffffff' : (isDark ? '#a1a1aa' : '#64748b'),
                    border: `1px solid ${pitchPerspective === 'side' ? '#2563eb' : (isDark ? '#27272a' : '#cbd5e1')}`,
                    cursor: 'pointer',
                  }}
                >
                  Side Flight Arc (54')
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setHitPerspective('spray')}
                  style={{
                    padding: '4px 12px', fontSize: '10px', fontWeight: 700, borderRadius: '6px',
                    backgroundColor: hitPerspective === 'spray' ? (isDark ? '#3b82f6' : '#2563eb') : 'transparent',
                    color: hitPerspective === 'spray' ? '#ffffff' : (isDark ? '#a1a1aa' : '#64748b'),
                    border: `1px solid ${hitPerspective === 'spray' ? '#2563eb' : (isDark ? '#27272a' : '#cbd5e1')}`,
                    cursor: 'pointer',
                  }}
                >
                  Field Spray
                </button>
                <button
                  onClick={() => setHitPerspective('elevation')}
                  style={{
                    padding: '4px 12px', fontSize: '10px', fontWeight: 700, borderRadius: '6px',
                    backgroundColor: hitPerspective === 'elevation' ? (isDark ? '#3b82f6' : '#2563eb') : 'transparent',
                    color: hitPerspective === 'elevation' ? '#ffffff' : (isDark ? '#a1a1aa' : '#64748b'),
                    border: `1px solid ${hitPerspective === 'elevation' ? '#2563eb' : (isDark ? '#27272a' : '#cbd5e1')}`,
                    cursor: 'pointer',
                  }}
                >
                  Elevation Arc
                </button>
              </>
            )}
          </div>

          {/* Quick Highlight Filter Pills for Pitching */}
          {visualizerMode === 'pitches' && allPitches.length > 1 && (() => {
            const matchesPitchFilter = (p, filter) => {
              if (!filter || filter === 'all') return true;
              if (filter === 'first_pitch') return p.pitchNumber === 1;
              if (filter === 'two_strikes') return p.strikes === 2 || (typeof p.callDesc === 'string' && p.callDesc.toLowerCase().includes('strike 3'));
              if (filter === 'full_count') return p.balls === 3 && p.strikes === 2;
              if (filter === 'strikes') return p.resultType === 'strike' || p.callDesc?.toLowerCase().includes('strike');
              if (filter === 'balls') return p.resultType === 'ball' || p.callDesc?.toLowerCase().includes('ball');
              if (filter.startsWith('type:')) {
                const targetType = filter.replace('type:', '');
                return p.pitchType === targetType || p.pitchTypeName === targetType;
              }
              return true;
            };

            const availablePitchTypes = (() => {
              const map = new Map();
              allPitches.forEach(p => {
                const key = p.pitchTypeName || p.pitchType || 'Other';
                if (!map.has(key)) {
                  map.set(key, { name: key, code: p.pitchType, color: p.color || '#3b82f6', count: 0 });
                }
                map.get(key).count += 1;
              });
              return Array.from(map.values()).sort((a, b) => b.count - a.count);
            })();

            const firstPitchCount = allPitches.filter(p => p.pitchNumber === 1).length;
            const twoStrikesCount = allPitches.filter(p => p.strikes === 2 || p.callDesc?.toLowerCase().includes('strike 3')).length;

            return (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '3px',
                padding: '1px 0 2px 0',
              }}>
                <button
                  onClick={() => setPitchFilter('all')}
                  style={{
                    padding: '2px 6px', borderRadius: '4px', fontSize: '8.5px', fontWeight: 800,
                    backgroundColor: pitchFilter === 'all' ? (isDark ? '#3b82f6' : '#2563eb') : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                    color: pitchFilter === 'all' ? '#ffffff' : (isDark ? '#a1a1aa' : '#64748b'),
                    border: `1px solid ${pitchFilter === 'all' ? '#2563eb' : (isDark ? '#27272a' : '#e2e8f0')}`,
                    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  All ({allPitches.length})
                </button>
                {firstPitchCount > 1 && (
                  <button
                    onClick={() => setPitchFilter(pitchFilter === 'first_pitch' ? 'all' : 'first_pitch')}
                    style={{
                      padding: '2px 6px', borderRadius: '4px', fontSize: '8.5px', fontWeight: 800,
                      backgroundColor: pitchFilter === 'first_pitch' ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                      color: pitchFilter === 'first_pitch' ? '#ffffff' : (isDark ? '#a1a1aa' : '#64748b'),
                      border: `1px solid ${pitchFilter === 'first_pitch' ? '#8b5cf6' : (isDark ? '#27272a' : '#e2e8f0')}`,
                      cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                  >
                    1st Pitch ({firstPitchCount})
                  </button>
                )}
                {twoStrikesCount > 0 && (
                  <button
                    onClick={() => setPitchFilter(pitchFilter === 'two_strikes' ? 'all' : 'two_strikes')}
                    style={{
                      padding: '2px 6px', borderRadius: '4px', fontSize: '8.5px', fontWeight: 800,
                      backgroundColor: pitchFilter === 'two_strikes' ? '#ef4444' : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                      color: pitchFilter === 'two_strikes' ? '#ffffff' : (isDark ? '#a1a1aa' : '#64748b'),
                      border: `1px solid ${pitchFilter === 'two_strikes' ? '#ef4444' : (isDark ? '#27272a' : '#e2e8f0')}`,
                      cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                  >
                    2 Strikes ({twoStrikesCount})
                  </button>
                )}
                {availablePitchTypes.map(pt => {
                  const isSel = pitchFilter === `type:${pt.name}`;
                  return (
                    <button
                      key={pt.name}
                      onClick={() => setPitchFilter(isSel ? 'all' : `type:${pt.name}`)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                        padding: '2px 6px', borderRadius: '4px', fontSize: '8.5px', fontWeight: 800,
                        backgroundColor: isSel ? pt.color : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                        color: isSel ? '#ffffff' : (isDark ? '#a1a1aa' : '#64748b'),
                        border: `1px solid ${isSel ? pt.color : (isDark ? '#27272a' : '#e2e8f0')}`,
                        cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                      }}
                    >
                      <span style={{ width: '4.5px', height: '4.5px', borderRadius: '50%', backgroundColor: isSel ? '#ffffff' : pt.color }} />
                      <span>{pt.name} ({pt.count})</span>
                    </button>
                  );
                })}
              </div>
            );
          })()}

          {/* VISUALIZER CANVAS */}
          <div style={{
            width: '100%',
            height: '240px',
            backgroundColor: isDark ? '#09090b' : '#f8fafc',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#27272a' : '#e2e8f0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {visualizerMode === 'pitches' ? (
              pitchPerspective === 'catcher' ? (
                /* Catcher Front Strike Zone */
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  {/* Batter Boxes */}
                  <rect x="6" y="14" width="16" height="58" rx="2" fill="none" stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="0.8" strokeDasharray="1.5 1.5" />
                  <text x="14" y="45" textAnchor="middle" fill={isDark ? '#52525b' : '#9ca3af'} fontSize="5" fontWeight="800">RHB</text>

                  <rect x="78" y="14" width="16" height="58" rx="2" fill="none" stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="0.8" strokeDasharray="1.5 1.5" />
                  <text x="86" y="45" textAnchor="middle" fill={isDark ? '#52525b' : '#9ca3af'} fontSize="5" fontWeight="800">LHB</text>

                  {/* Strike Zone 9-Grid */}
                  <rect x="25" y="14" width="50" height="58" fill={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'} stroke={isDark ? '#52525b' : '#94a3b8'} strokeWidth="1.5" rx="2" />
                  <line x1="41.6" y1="14" x2="41.6" y2="72" stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="0.8" strokeDasharray="1.5 2" />
                  <line x1="58.3" y1="14" x2="58.3" y2="72" stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="0.8" strokeDasharray="1.5 2" />
                  <line x1="25" y1="33.3" x2="75" y2="33.3" stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="0.8" strokeDasharray="1.5 2" />
                  <line x1="25" y1="52.6" x2="75" y2="52.6" stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="0.8" strokeDasharray="1.5 2" />
                  <polygon points="25,80 75,80 75,85 50,94 25,85" fill={isDark ? '#27272a' : '#cbd5e1'} stroke={isDark ? '#3f3f46' : '#94a3b8'} strokeWidth="0.8" />

                  {/* Plotted Pitches Sorted on Top */}
                  {(() => {
                    const matchesPitchFilter = (p, filter) => {
                      if (!filter || filter === 'all') return true;
                      if (filter === 'first_pitch') return p.pitchNumber === 1;
                      if (filter === 'two_strikes') return p.strikes === 2 || (typeof p.callDesc === 'string' && p.callDesc.toLowerCase().includes('strike 3'));
                      if (filter === 'full_count') return p.balls === 3 && p.strikes === 2;
                      if (filter === 'strikes') return p.resultType === 'strike' || p.callDesc?.toLowerCase().includes('strike');
                      if (filter === 'balls') return p.resultType === 'ball' || p.callDesc?.toLowerCase().includes('ball');
                      if (filter.startsWith('type:')) {
                        const targetType = filter.replace('type:', '');
                        return p.pitchType === targetType || p.pitchTypeName === targetType;
                      }
                      return true;
                    };

                    const isFilterActive = pitchFilter !== 'all';
                    const sortedPitches = allPitches.map((p, idx) => ({ ...p, origIdx: idx }));
                    sortedPitches.sort((a, b) => {
                      if (a.origIdx === hoveredPitchIdx) return 1;
                      if (b.origIdx === hoveredPitchIdx) return -1;
                      const aMatch = matchesPitchFilter(a, pitchFilter);
                      const bMatch = matchesPitchFilter(b, pitchFilter);
                      if (aMatch && !bMatch) return 1;
                      if (!aMatch && bMatch) return -1;
                      return 0;
                    });

                    return sortedPitches.map((p) => {
                      const cx = p.normX ?? 50;
                      const cy = Math.min(74, Math.max(12, (p.normY ?? 40) - 2));
                      const isHovered = hoveredPitchIdx === p.origIdx;
                      const isAnyHovered = hoveredPitchIdx !== null;
                      const isMatching = matchesPitchFilter(p, pitchFilter);

                      let opacity = 1;
                      if (isHovered) {
                        opacity = 1;
                      } else if (isAnyHovered) {
                        opacity = 0.18;
                      } else if (isFilterActive) {
                        opacity = isMatching ? 1 : 0.18;
                      }

                      const isDimmed = (isAnyHovered && !isHovered) || (isFilterActive && !isMatching && !isHovered);
                      const r = isHovered ? 6.5 : (isFilterActive && isMatching ? 5 : 4);

                      return (
                        <g
                          key={p.origIdx}
                          onClick={() => setHoveredPitchIdx(isHovered ? null : p.origIdx)}
                          style={{ cursor: 'pointer' }}
                        >
                          {isHovered && (
                            <circle cx={cx} cy={cy} r="9" fill="none" stroke={p.color || '#3b82f6'} strokeWidth="1.6" strokeDasharray="2 1.5" />
                          )}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={r}
                            fill={isDimmed ? (isDark ? '#3f3f46' : '#94a3b8') : (p.color || '#3b82f6')}
                            stroke="#ffffff"
                            strokeWidth={isHovered ? 1.6 : 1}
                            opacity={opacity}
                          />
                          <text
                            x={cx}
                            y={cy + (isHovered ? 2 : 1.6)}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={isHovered ? '6' : (isFilterActive && isMatching ? '5' : '4.5')}
                            fontWeight="900"
                            opacity={opacity}
                          >
                            {p.pitchNumber || (p.origIdx + 1)}
                          </text>
                        </g>
                      );
                    });
                  })()}
                </svg>
              ) : (
                /* Side Flight Arc (Mound to Plate) */
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  <line x1="5" y1="82" x2="95" y2="82" stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="1" />
                  <text x="12" y="90" textAnchor="middle" fill={isDark ? '#71717a' : '#94a3b8'} fontSize="4" fontWeight="700">MOUND (54')</text>
                  <text x="86" y="90" textAnchor="middle" fill={isDark ? '#71717a' : '#94a3b8'} fontSize="4" fontWeight="700">PLATE</text>

                  {/* Strike Zone Window */}
                  <rect x="83" y="38" width="6" height="36" fill={isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)'} stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="1 1" />

                  {/* Pitches Flight Trajectories Sorted on Top */}
                  {(() => {
                    const matchesPitchFilter = (p, filter) => {
                      if (!filter || filter === 'all') return true;
                      if (filter === 'first_pitch') return p.pitchNumber === 1;
                      if (filter === 'two_strikes') return p.strikes === 2 || (typeof p.callDesc === 'string' && p.callDesc.toLowerCase().includes('strike 3'));
                      if (filter === 'full_count') return p.balls === 3 && p.strikes === 2;
                      if (filter === 'strikes') return p.resultType === 'strike' || p.callDesc?.toLowerCase().includes('strike');
                      if (filter === 'balls') return p.resultType === 'ball' || p.callDesc?.toLowerCase().includes('ball');
                      if (filter.startsWith('type:')) {
                        const targetType = filter.replace('type:', '');
                        return p.pitchType === targetType || p.pitchTypeName === targetType;
                      }
                      return true;
                    };

                    const isFilterActive = pitchFilter !== 'all';
                    const sortedPitches = allPitches.map((p, idx) => ({ ...p, origIdx: idx }));
                    sortedPitches.sort((a, b) => {
                      if (a.origIdx === hoveredPitchIdx) return 1;
                      if (b.origIdx === hoveredPitchIdx) return -1;
                      const aMatch = matchesPitchFilter(a, pitchFilter);
                      const bMatch = matchesPitchFilter(b, pitchFilter);
                      if (aMatch && !bMatch) return 1;
                      if (!aMatch && bMatch) return -1;
                      return 0;
                    });

                    return sortedPitches.map((p) => {
                      const isHovered = hoveredPitchIdx === p.origIdx;
                      const isAnyHovered = hoveredPitchIdx !== null;
                      const isMatching = matchesPitchFilter(p, pitchFilter);
                      const startY = 32 + (p.origIdx % 4) * 2;
                      const endY = Math.min(74, Math.max(38, 38 + ((p.normY || 40) * 0.36)));
                      const ctrlY = startY - 4;

                      let opacity = 0.8;
                      if (isHovered) {
                        opacity = 1;
                      } else if (isAnyHovered) {
                        opacity = 0.15;
                      } else if (isFilterActive) {
                        opacity = isMatching ? 0.95 : 0.15;
                      }

                      const isDimmed = (isAnyHovered && !isHovered) || (isFilterActive && !isMatching && !isHovered);

                      return (
                        <g
                          key={p.origIdx}
                          onClick={() => setHoveredPitchIdx(isHovered ? null : p.origIdx)}
                          style={{ cursor: 'pointer' }}
                        >
                          <path
                            d={`M 12 ${startY} Q 50 ${ctrlY} 86 ${endY}`}
                            fill="none"
                            stroke={isDimmed ? (isDark ? '#3f3f46' : '#94a3b8') : (p.color || '#3b82f6')}
                            strokeWidth={isHovered ? 2.5 : (isFilterActive && isMatching ? 1.8 : 1.2)}
                            opacity={opacity}
                          />
                          <circle
                            cx="86"
                            cy={endY}
                            r={isHovered ? 5.5 : (isFilterActive && isMatching ? 4.2 : 3.5)}
                            fill={isDimmed ? (isDark ? '#3f3f46' : '#94a3b8') : (p.color || '#3b82f6')}
                            stroke="#ffffff"
                            strokeWidth={isHovered ? 1.5 : 0.8}
                            opacity={opacity}
                          />
                          <text
                            x="86"
                            y={endY + (isHovered ? 1.8 : 1.4)}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={isHovered ? '5' : '4'}
                            fontWeight="900"
                            opacity={opacity}
                          >
                            {p.pitchNumber || (p.origIdx + 1)}
                          </text>
                        </g>
                      );
                    });
                  })()}
                </svg>
              )
            ) : (
              hitPerspective === 'spray' ? (
                /* Field Spray Chart */
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  {/* Foul Lines & Outfield Arc */}
                  <path d="M 50 88 L 10 38 A 54 54 0 0 1 90 38 Z" fill={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="1" />
                  <line x1="50" y1="88" x2="10" y2="38" stroke={isDark ? '#ef4444' : '#f87171'} strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="50" y1="88" x2="90" y2="38" stroke={isDark ? '#ef4444' : '#f87171'} strokeWidth="1" strokeDasharray="2 2" />
                  {/* Warning track */}
                  <path d="M 16 43 A 48 48 0 0 1 84 43" fill="none" stroke={isDark ? '#27272a' : '#e2e8f0'} strokeWidth="0.8" strokeDasharray="1.5 1.5" />
                  {/* Infield diamond */}
                  <polygon points="50,88 38,76 50,64 62,76" fill="none" stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="0.8" />

                  {/* Batted Balls Sorted on Top */}
                  {(() => {
                    const sortedBalls = allBattedBalls.map((b, idx) => ({ ...b, origIdx: idx }));
                    if (hoveredBattedBallIndex !== null) {
                      sortedBalls.sort((a, b) => {
                        if (a.origIdx === hoveredBattedBallIndex) return 1;
                        if (b.origIdx === hoveredBattedBallIndex) return -1;
                        return 0;
                      });
                    }
                    return sortedBalls.map((b) => {
                      const normX = b.coordX ? ((b.coordX - 125) / 125) * 40 + 50 : 50;
                      const normY = b.coordY ? 88 - ((200 - b.coordY) / 200) * 60 : 50;
                      const isHovered = hoveredBattedBallIndex === b.origIdx;
                      const isAnyHovered = hoveredBattedBallIndex !== null;
                      const opacity = isHovered ? 1 : (isAnyHovered ? 0.22 : 0.7);

                      return (
                        <g
                          key={b.origIdx}
                          onMouseEnter={() => setHoveredBattedBallIndex(b.origIdx)}
                          onMouseLeave={() => setHoveredBattedBallIndex(null)}
                          style={{ cursor: 'pointer' }}
                        >
                          <line
                            x1="50" y1="88" x2={normX} y2={normY}
                            stroke={isHovered ? '#3b82f6' : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)')}
                            strokeWidth={isHovered ? 2 : 0.8}
                            opacity={opacity}
                          />
                          <circle
                            cx={normX}
                            cy={normY}
                            r={isHovered ? 5.5 : 3.5}
                            fill={isHovered ? '#3b82f6' : (isAnyHovered ? (isDark ? '#3f3f46' : '#94a3b8') : '#ef4444')}
                            stroke="#ffffff"
                            strokeWidth={isHovered ? 1.5 : 1}
                            opacity={opacity}
                          />
                          <text
                            x={normX}
                            y={normY + 1.2}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={isHovered ? '4.5' : '3.8'}
                            fontWeight="900"
                            opacity={opacity}
                          >
                            {b.origIdx + 1}
                          </text>
                        </g>
                      );
                    });
                  })()}
                </svg>
              ) : (
                /* Elevation Arc */
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  <line x1="5" y1="82" x2="95" y2="82" stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="1" />
                  <line x1="88" y1="62" x2="88" y2="82" stroke={isDark ? '#ef4444' : '#f87171'} strokeWidth="1.5" />
                  <text x="88" y="58" textAnchor="middle" fill={isDark ? '#ef4444' : '#dc2626'} fontSize="3.5" fontWeight="800">WALL 10'</text>

                  {(() => {
                    const sortedBalls = allBattedBalls.map((b, idx) => ({ ...b, origIdx: idx }));
                    if (hoveredBattedBallIndex !== null) {
                      sortedBalls.sort((a, b) => {
                        if (a.origIdx === hoveredBattedBallIndex) return 1;
                        if (b.origIdx === hoveredBattedBallIndex) return -1;
                        return 0;
                      });
                    }
                    return sortedBalls.map((b) => {
                      const dist = b.totalDistance || 250;
                      const endX = Math.min(88, 12 + (dist / 450) * 76);
                      const apexH = Math.min(50, Math.max(15, (b.launchAngle || 20) * 1.5));
                      const apexY = 82 - apexH;
                      const isHovered = hoveredBattedBallIndex === b.origIdx;
                      const isAnyHovered = hoveredBattedBallIndex !== null;
                      const opacity = isHovered ? 1 : (isAnyHovered ? 0.22 : 0.7);

                      return (
                        <g
                          key={b.origIdx}
                          onMouseEnter={() => setHoveredBattedBallIndex(b.origIdx)}
                          onMouseLeave={() => setHoveredBattedBallIndex(null)}
                          style={{ cursor: 'pointer' }}
                        >
                          <path
                            d={`M 12 82 Q ${(12 + endX) / 2} ${apexY} ${endX} 82`}
                            fill="none"
                            stroke={isHovered ? '#3b82f6' : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)')}
                            strokeWidth={isHovered ? 2.2 : 1}
                            opacity={opacity}
                          />
                          <circle
                            cx={endX}
                            cy={82}
                            r={isHovered ? 5 : 3}
                            fill={isHovered ? '#3b82f6' : (isAnyHovered ? (isDark ? '#3f3f46' : '#94a3b8') : '#ef4444')}
                            stroke="#ffffff"
                            strokeWidth={isHovered ? 1.5 : 0.8}
                            opacity={opacity}
                          />
                          <text
                            x={endX}
                            y={77}
                            textAnchor="middle"
                            fill={isHovered ? '#3b82f6' : (isDark ? '#a1a1aa' : '#64748b')}
                            fontSize={isHovered ? '4.5' : '3.5'}
                            fontWeight="800"
                            opacity={opacity}
                          >
                            {b.origIdx + 1}
                          </text>
                        </g>
                      );
                    });
                  })()}
                </svg>
              )
            )}
          </div>

          {/* Pitches List or Batted Balls List */}
          {visualizerMode === 'pitches' ? (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#a1a1aa' : '#64748b', marginBottom: '6px' }}>
                Pitch Sequence ({allPitches.length} Pitches)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                {allPitches.map((p, pIdx) => {
                  const isHovered = hoveredPitchIdx === pIdx;
                  const isAnyHovered = hoveredPitchIdx !== null;
                  const matchesPitchFilter = (item, filter) => {
                    if (!filter || filter === 'all') return true;
                    if (filter === 'first_pitch') return item.pitchNumber === 1;
                    if (filter === 'two_strikes') return item.strikes === 2 || (typeof item.callDesc === 'string' && item.callDesc.toLowerCase().includes('strike 3'));
                    if (filter === 'full_count') return item.balls === 3 && item.strikes === 2;
                    if (filter === 'strikes') return item.resultType === 'strike' || item.callDesc?.toLowerCase().includes('strike');
                    if (filter === 'balls') return item.resultType === 'ball' || item.callDesc?.toLowerCase().includes('ball');
                    if (filter.startsWith('type:')) {
                      const targetType = filter.replace('type:', '');
                      return item.pitchType === targetType || item.pitchTypeName === targetType;
                    }
                    return true;
                  };
                  const isFilterActive = pitchFilter !== 'all';
                  const isMatching = matchesPitchFilter(p, pitchFilter);
                  const opacity = isAnyHovered ? (isHovered ? 1 : 0.35) : (isFilterActive ? (isMatching ? 1 : 0.35) : 1);

                  return (
                    <button
                      key={pIdx}
                      onClick={() => setHoveredPitchIdx(isHovered ? null : pIdx)}
                      style={{
                        fontSize: '10px', fontWeight: 700, padding: '3px 7px', borderRadius: '5px',
                        backgroundColor: isHovered
                          ? (isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.15)')
                          : (isFilterActive && isMatching ? (isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0') : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9')),
                        border: `1px solid ${isHovered ? '#3b82f6' : (isFilterActive && isMatching ? (p.color || '#3b82f6') : (isDark ? '#27272a' : '#e2e8f0'))}`,
                        color: p.color || (isDark ? '#f4f4f5' : '#0f172a'),
                        cursor: 'pointer',
                        opacity,
                      }}
                    >
                      #{p.pitchNumber || (pIdx + 1)} {p.speed ? `${p.speed} ` : ''}{p.pitchType || 'P'} {p.callDesc ? `(${p.callDesc})` : ''} · vs {p.batterName}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#a1a1aa' : '#64748b', marginBottom: '6px' }}>
                Batted Balls Allowed ({allBattedBalls.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto' }}>
                {allBattedBalls.map((b, bIdx) => {
                  const isHovered = hoveredBattedBallIndex === bIdx;
                  const isAnyHovered = hoveredBattedBallIndex !== null;
                  return (
                    <div
                      key={bIdx}
                      onMouseEnter={() => setHoveredBattedBallIndex(bIdx)}
                      onMouseLeave={() => setHoveredBattedBallIndex(null)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '6px 8px', borderRadius: '6px',
                        backgroundColor: isHovered ? (isDark ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.1)') : (isDark ? '#18181b' : '#f8fafc'),
                        border: `1px solid ${isHovered ? '#3b82f6' : (isDark ? '#27272a' : '#e2e8f0')}`,
                        cursor: 'pointer',
                        opacity: isAnyHovered && !isHovered ? 0.4 : 1,
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#f4f4f5' : '#0f172a' }}>
                          #{bIdx + 1} {b.playCode || 'Batted Ball'} · {b.batterName} (Inn {b.inning})
                        </div>
                        <div style={{ fontSize: '10px', color: isDark ? '#a1a1aa' : '#64748b' }}>
                          {b.playDesc}
                        </div>
                      </div>
                      {(b.launchSpeed || b.totalDistance) && (
                        <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 800, color: '#3b82f6' }}>
                          {b.launchSpeed ? `${b.launchSpeed} MPH` : ''} {b.totalDistance ? `· ${Math.round(b.totalDistance)} FT` : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
