import React, { useState, useEffect } from 'react';
import { X, ChevronRight, RotateCcw } from 'lucide-react';
import { formatPlayerName } from '../utils/constants';

export default function AtBatInspectionModal({
  isOpen,
  onClose,
  inspectedCell,
  scorecardData,
  isDark,
  c,
}) {
  const [visualizerTab, setVisualizerTab] = useState('strikezone'); // 'strikezone' | 'hit'
  const [viewPerspective, setViewPerspective] = useState('front'); // 'front' | 'side'
  const [pitchFilter, setPitchFilter] = useState('all'); // 'all' | 'first_pitch' | 'two_strikes' | 'type:...'
  const [hoveredPitchIdx, setHoveredPitchIdx] = useState(null);
  const [hoveredBattedBallIndex, setHoveredBattedBallIndex] = useState(null);
  const [selectedMultiPaIndex, setSelectedMultiPaIndex] = useState(inspectedCell?.isFullGame ? 'all' : 0);

  const inspectedCellKey = inspectedCell?.cellKey || null;
  useEffect(() => {
    setSelectedMultiPaIndex(inspectedCell?.isFullGame ? 'all' : 0);
    setHoveredBattedBallIndex(null);
    setHoveredPitchIdx(null);
    setPitchFilter('all');
    setVisualizerTab('strikezone');
    setViewPerspective('front');
  }, [inspectedCellKey, inspectedCell?.isFullGame]);

  if (!isOpen || !inspectedCell) return null;

  const isFullGameBatter = Boolean(inspectedCell?.isFullGame);
  const inspectedPlaysArray = inspectedCell?.plays?.length
    ? inspectedCell.plays
    : (Array.isArray(inspectedCell?.currentPlay)
        ? inspectedCell.currentPlay
        : (inspectedCell?.currentPlay ? [inspectedCell.currentPlay] : []));

  const isAggregatedFullGame = isFullGameBatter && (selectedMultiPaIndex === 'all' || selectedMultiPaIndex === null || selectedMultiPaIndex === undefined);
  const activeMultiIndex = (!isAggregatedFullGame && typeof selectedMultiPaIndex === 'number' && selectedMultiPaIndex < inspectedPlaysArray.length) ? selectedMultiPaIndex : 0;
  const inspectedPlay = isAggregatedFullGame ? null : (inspectedPlaysArray.length > 0 ? inspectedPlaysArray[activeMultiIndex] : null);

  const targetPitches = isAggregatedFullGame
    ? inspectedPlaysArray.flatMap((p, pIdx) => (p.pitches || []).map((pitch, idx) => ({
        ...pitch,
        playDesc: p.description || p.code,
        pitcherName: p.pitcherFullName || p.pitcherName,
        inning: p.inning,
        pitchNumber: idx + 1,
      })))
    : (inspectedPlay?.pitches || []);

  const targetHitData = inspectedPlay?.hitData || null;
  const targetBattedBalls = isAggregatedFullGame
    ? inspectedPlaysArray.flatMap(p => {
        const balls = p.battedBalls?.length ? p.battedBalls : (p.hitData ? [p.hitData] : []);
        return balls.map(b => ({
          ...b,
          pitcherName: p.pitcherFullName || p.pitcherName,
          playCode: p.code,
          playDesc: p.description || p.code,
          inning: p.inning,
        }));
      })
    : (inspectedPlay?.battedBalls?.length
        ? inspectedPlay.battedBalls
        : (targetHitData ? [targetHitData] : []));

  const totalPitchesCount = targetPitches.length;
  const totalStrikesCount = targetPitches.filter(p => p.isStrike || p.resultType === 'strike' || p.resultType === 'foul' || p.callDesc?.toLowerCase().includes('strike') || p.callDesc?.toLowerCase().includes('foul')).length;
  const totalBallsCount = targetPitches.filter(p => p.isBall || p.resultType === 'ball' || p.callDesc?.toLowerCase().includes('ball')).length;
  const totalFoulsCount = targetPitches.filter(p => p.resultType === 'foul' || p.callDesc?.toLowerCase().includes('foul')).length;

  const totalHitsCount = targetBattedBalls.filter(b => !b.isFoul && (b.isBallInPlay || b.playCode === '1B' || b.playCode === '2B' || b.playCode === '3B' || b.playCode === 'HR' || b.playCode === 'hr')).length;
  const totalFoulsHitCount = targetBattedBalls.filter(b => Boolean(b.isFoul)).length;
  const totalOutsHitCount = targetBattedBalls.filter(b => !b.isFoul && !b.isBallInPlay && b.playCode !== '1B' && b.playCode !== '2B' && b.playCode !== '3B' && b.playCode !== 'HR' && b.playCode !== 'hr').length;

  const activeHit = (hoveredBattedBallIndex !== null && targetBattedBalls[hoveredBattedBallIndex])
    || (targetBattedBalls.length > 0 ? targetBattedBalls[targetBattedBalls.length - 1] : targetHitData);

  const batterName = formatPlayerName(inspectedPlay?.batterFullName || inspectedPlay?.batterName || inspectedCell.batter?.fullName || inspectedCell.batter?.name || 'Batter');
  const displayJersey = inspectedPlay?.batterJerseyNumber || inspectedCell.batter?.jerseyNumber || '';
  const pitcherName = formatPlayerName(inspectedPlay?.pitcherFullName || inspectedPlay?.pitcherName || '');
  const batSide = inspectedPlay?.batSide || inspectedCell.batter?.batSide || 'R';
  const playDesc = isFullGameBatter && isAggregatedFullGame
    ? `${inspectedPlaysArray.length} Plate Appearances (${inspectedPlaysArray.map(p => p.code || 'PA').join(', ')})`
    : (inspectedPlay?.description || (inspectedPlay?.code ? inspectedPlay.code : (inspectedPlay ? '' : 'No plate appearance in this inning.')));

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
      WebkitBackdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.15s ease',
    }}>
      {/* Backdrop click to close */}
      <div style={{ flex: 1 }} onClick={onClose} />

      {/* Modal Bottom Sheet Card */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
        maxHeight: '85dvh',
        backgroundColor: isDark ? '#141417' : '#ffffff',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        border: `1px solid ${isDark ? '#27272a' : '#e5e7eb'}`,
        borderBottom: 'none',
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      }}>
        {/* Grab Handle */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '10px', paddingBottom: '4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: isDark ? '#3f3f46' : '#d1d5db' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px 12px 16px',
          borderBottom: `1px solid ${isDark ? '#27272a' : '#f0ede6'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: isDark ? '#1f293d' : '#eff6ff',
              color: '#3b82f6',
              fontSize: '13px',
              fontWeight: 900,
              fontFamily: "'JetBrains Mono', monospace",
              flexShrink: 0,
            }}>
              {displayJersey ? `#${displayJersey}` : 'PA'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: isDark ? '#f4f4f5' : '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {batterName}
                </span>
                <span style={{
                  fontSize: '8.5px',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  backgroundColor: batSide === 'L' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: batSide === 'L' ? '#3b82f6' : '#ef4444',
                }}>
                  {batSide === 'L' ? 'LHB' : 'RHB'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: isDark ? '#a1a1aa' : '#64748b', marginTop: '1px' }}>
                {inspectedCell.teamName || (inspectedCell.teamKey === 'home' ? 'Home' : 'Away')} · {isFullGameBatter ? 'Full Game Performance' : `Inning ${inspectedCell.inning}`} {pitcherName ? `· vs ${pitcherName}` : ''}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: `1px solid ${isDark ? '#3f3f46' : '#e2e8f0'}`,
              backgroundColor: isDark ? '#27272a' : '#f1f5f9',
              color: isDark ? '#a1a1aa' : '#64748b',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{
          padding: '12px 16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {/* Multi-PA Selector */}
          {inspectedPlaysArray.length > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              padding: '4px',
              borderRadius: '8px',
              border: `1px solid ${isDark ? '#27272a' : '#e5e7eb'}`,
              flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: '9.5px', fontWeight: 800, color: c.textMuted, paddingLeft: '4px', textTransform: 'uppercase' }}>
                {isFullGameBatter ? 'Scope:' : 'At-Bat:'}
              </span>
              {isFullGameBatter && (
                <button
                  onClick={() => {
                    setSelectedMultiPaIndex('all');
                    setHoveredBattedBallIndex(null);
                    setHoveredPitchIdx(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '5px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: `1px solid ${isAggregatedFullGame ? '#3b82f6' : 'transparent'}`,
                    backgroundColor: isAggregatedFullGame ? (isDark ? '#1e3a8a' : '#eff6ff') : 'transparent',
                    color: isAggregatedFullGame ? (isDark ? '#93c5fd' : '#1d4ed8') : c.textMuted,
                    fontWeight: isAggregatedFullGame ? 800 : 600,
                    fontSize: '11px',
                  }}
                >
                  <span>All ({inspectedPlaysArray.length} PA)</span>
                </button>
              )}
              {inspectedPlaysArray.map((p, pIdx) => {
                const isCur = !isAggregatedFullGame && pIdx === activeMultiIndex;
                const seqSymbol = pIdx === 0 ? '①' : pIdx === 1 ? '②' : pIdx === 2 ? '③' : pIdx === 3 ? '④' : '⑤';
                const playCode = p?.code || `PA ${pIdx + 1}`;
                const pitchCount = p?.pitches?.length || 0;
                const label = isFullGameBatter ? `Inn ${p.inning} · ${playCode}` : playCode;
                return (
                  <button
                    key={pIdx}
                    onClick={() => {
                      setSelectedMultiPaIndex(pIdx);
                      setHoveredBattedBallIndex(null);
                      setHoveredPitchIdx(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: `1px solid ${isCur ? '#3b82f6' : 'transparent'}`,
                      backgroundColor: isCur ? (isDark ? '#1e3a8a' : '#eff6ff') : 'transparent',
                      color: isCur ? (isDark ? '#93c5fd' : '#1d4ed8') : c.textMuted,
                      fontWeight: isCur ? 800 : 600,
                      fontSize: '11px',
                    }}
                  >
                    <span>{seqSymbol}</span>
                    <span>{label}</span>
                    <span style={{ fontSize: '9.5px', opacity: 0.75 }}>({pitchCount}P)</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Play Result & Description */}
          {playDesc && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.06)',
              border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.2)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#3b82f6' }}>
                  Play Result
                </span>
                {inspectedPlay?.code && (
                  <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: '#3b82f6' }}>
                    {inspectedPlay.code}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#f4f4f5' : '#0f172a', lineHeight: 1.4 }}>
                {playDesc}
              </div>
            </div>
          )}

          {/* Inning Fate Badge */}
          {inspectedPlay?.inningFate && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              border: `1px solid ${isDark ? '#27272a' : '#e2e8f0'}`,
              fontSize: '10px',
            }}>
              <span style={{ fontWeight: 700, color: c.textMuted }}>Inning Fate:</span>
              <span style={{
                fontWeight: 800,
                color: inspectedPlay.inningFate.type === 'scored'
                  ? '#10b981'
                  : inspectedPlay.inningFate.type === 'base_out'
                  ? '#ef4444'
                  : '#f59e0b',
              }}>
                {inspectedPlay.inningFate.badge} — {inspectedPlay.inningFate.text}
              </span>
            </div>
          )}

          {/* Switcher Tabs: Pitches vs Hit Spray */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb',
              padding: '3px',
              borderRadius: '8px',
            }}>
              <button
                onClick={() => setVisualizerTab('strikezone')}
                style={{
                  padding: '7px 10px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: visualizerTab === 'strikezone' ? (isDark ? '#27272a' : '#ffffff') : 'transparent',
                  color: visualizerTab === 'strikezone' ? (isDark ? '#f4f4f5' : '#0f172a') : c.textMuted,
                  boxShadow: visualizerTab === 'strikezone' ? '0 2px 5px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <span>Pitches</span>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>
                  {totalPitchesCount > 0 ? `(${totalPitchesCount}P · ${totalStrikesCount}S ${totalBallsCount}B)` : '(0P)'}
                </span>
              </button>
              <button
                onClick={() => setVisualizerTab('hit')}
                style={{
                  padding: '7px 10px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: visualizerTab === 'hit' ? (isDark ? '#27272a' : '#ffffff') : 'transparent',
                  color: visualizerTab === 'hit' ? (isDark ? '#f4f4f5' : '#0f172a') : c.textMuted,
                  boxShadow: visualizerTab === 'hit' ? '0 2px 5px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <span>Hit Spray</span>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>
                  {targetBattedBalls.length > 0 ? `(${targetBattedBalls.length}B · ${totalHitsCount}H ${totalFoulsHitCount}F)` : (targetHitData?.launchSpeed ? `(${targetHitData.launchSpeed} MPH)` : '')}
                </span>
              </button>
            </div>

            {/* Perspective View Selector Sub-Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 2px',
            }}>
              <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: c.textMuted }}>
                Perspective:
              </span>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                padding: '2px',
                borderRadius: '6px',
                gap: '2px',
                border: `1px solid ${isDark ? '#27272a' : '#e2e8f0'}`,
              }}>
                <button
                  onClick={() => setViewPerspective('front')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: viewPerspective === 'front' ? (isDark ? '#3f3f46' : '#ffffff') : 'transparent',
                    color: viewPerspective === 'front' ? (isDark ? '#ffffff' : '#0f172a') : c.textMuted,
                    boxShadow: viewPerspective === 'front' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none',
                  }}
                >
                  {visualizerTab === 'strikezone' ? 'Catcher Front' : 'Field Spray'}
                </button>
                <button
                  onClick={() => setViewPerspective('side')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: viewPerspective === 'side' ? (isDark ? '#3f3f46' : '#ffffff') : 'transparent',
                    color: viewPerspective === 'side' ? (isDark ? '#ffffff' : '#0f172a') : c.textMuted,
                    boxShadow: viewPerspective === 'side' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none',
                  }}
                >
                  {visualizerTab === 'strikezone' ? 'Side Flight Arc' : 'Elevation Arc'}
                </button>
              </div>
            </div>

            {/* TAB 1: Strike Zone Visualizer */}
            {visualizerTab === 'strikezone' && (
              <>
                {/* Quick Highlight Filter Pills (All, 1st Pitch, 2 Strikes, Pitch Types) */}
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

                  const availablePitchTypes = (() => {
                    const map = new Map();
                    targetPitches.forEach(p => {
                      const key = p.pitchTypeName || p.pitchType || 'Other';
                      if (!map.has(key)) {
                        map.set(key, { name: key, code: p.pitchType, color: p.color || '#3b82f6', count: 0 });
                      }
                      map.get(key).count += 1;
                    });
                    return Array.from(map.values()).sort((a, b) => b.count - a.count);
                  })();

                  const firstPitchCount = targetPitches.filter(p => p.pitchNumber === 1).length;
                  const twoStrikesCount = targetPitches.filter(p => p.strikes === 2 || p.callDesc?.toLowerCase().includes('strike 3')).length;

                  if (targetPitches.length <= 1) return null;

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
                          padding: '2px 5px', borderRadius: '4px', fontSize: '8px', fontWeight: 800,
                          backgroundColor: pitchFilter === 'all' ? (isDark ? '#3b82f6' : '#2563eb') : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                          color: pitchFilter === 'all' ? '#ffffff' : (isDark ? '#a1a1aa' : '#64748b'),
                          border: `1px solid ${pitchFilter === 'all' ? '#2563eb' : (isDark ? '#27272a' : '#e2e8f0')}`,
                          cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                        }}
                      >
                        All ({targetPitches.length})
                      </button>
                      {firstPitchCount > 1 && (
                        <button
                          onClick={() => setPitchFilter(pitchFilter === 'first_pitch' ? 'all' : 'first_pitch')}
                          style={{
                            padding: '2px 5px', borderRadius: '4px', fontSize: '8px', fontWeight: 800,
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
                            padding: '2px 5px', borderRadius: '4px', fontSize: '8px', fontWeight: 800,
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
                              padding: '2px 5px', borderRadius: '4px', fontSize: '8px', fontWeight: 800,
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

                {/* SVG Visualizer Canvas */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '230px',
                  backgroundColor: isDark ? '#09090b' : '#f8fafc',
                  borderRadius: '10px',
                  border: `1px solid ${isDark ? '#27272a' : '#e2e8f0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {viewPerspective === 'front' ? (
                    /* Front View Strike Zone */
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      {/* Left Batter Box (RHB) */}
                      <rect
                        x="7" y="14" width="15" height="58" rx="2"
                        fill={batSide === 'R' ? (isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.12)') : 'none'}
                        stroke={batSide === 'R' ? '#ef4444' : (isDark ? '#3f3f46' : '#d4d4d8')}
                        strokeWidth={batSide === 'R' ? 1.4 : 0.8}
                        strokeDasharray={batSide === 'R' ? 'none' : '2 2'}
                      />
                      <text x="14.5" y="45" textAnchor="middle" fill={batSide === 'R' ? '#ef4444' : (isDark ? '#52525b' : '#9ca3af')} fontSize="5.5" fontWeight="900">RHB</text>

                      {/* Right Batter Box (LHB) */}
                      <rect
                        x="78" y="14" width="15" height="58" rx="2"
                        fill={batSide === 'L' ? (isDark ? 'rgba(59, 130, 246, 0.18)' : 'rgba(59, 130, 246, 0.12)') : 'none'}
                        stroke={batSide === 'L' ? '#3b82f6' : (isDark ? '#3f3f46' : '#d4d4d8')}
                        strokeWidth={batSide === 'L' ? 1.4 : 0.8}
                        strokeDasharray={batSide === 'L' ? 'none' : '2 2'}
                      />
                      <text x="85.5" y="45" textAnchor="middle" fill={batSide === 'L' ? '#3b82f6' : (isDark ? '#52525b' : '#9ca3af')} fontSize="5.5" fontWeight="900">LHB</text>

                      {/* Strike Zone Box */}
                      <rect x="26" y="14" width="48" height="58" fill={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} stroke={isDark ? '#52525b' : '#94a3b8'} strokeWidth="1.5" rx="2" />
                      <line x1="42" y1="14" x2="42" y2="72" stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="0.8" strokeDasharray="1.5 2" />
                      <line x1="58" y1="14" x2="58" y2="72" stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="0.8" strokeDasharray="1.5 2" />
                      <line x1="26" y1="33.3" x2="74" y2="33.3" stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="0.8" strokeDasharray="1.5 2" />
                      <line x1="26" y1="52.6" x2="74" y2="52.6" stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="0.8" strokeDasharray="1.5 2" />

                      {/* Home Plate */}
                      <polygon points="26,82 74,82 74,87 50,96 26,87" fill={isDark ? '#27272a' : '#d1d5db'} stroke={isDark ? '#3f3f46' : '#9ca3af'} strokeWidth="0.8" />

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
                        const sortedPitches = targetPitches.map((p, idx) => ({ ...p, origIdx: idx }));
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
                          const cy = Math.min(70, Math.max(16, p.normY - 4));

                          let opacity = 1;
                          if (isHovered) {
                            opacity = 1;
                          } else if (isAnyHovered) {
                            opacity = 0.18;
                          } else if (isFilterActive) {
                            opacity = isMatching ? 1 : 0.18;
                          }

                          const isDimmed = (isAnyHovered && !isHovered) || (isFilterActive && !isMatching && !isHovered);
                          const r = isHovered ? 8 : (isFilterActive && isMatching ? 6.5 : 6);

                          return (
                            <g
                              key={p.origIdx}
                              onClick={() => setHoveredPitchIdx(isHovered ? null : p.origIdx)}
                              style={{ cursor: 'pointer' }}
                            >
                              {isHovered && (
                                <circle cx={p.normX} cy={cy} r="11.5" fill="none" stroke={p.color} strokeWidth="2" strokeDasharray="2.5 2" />
                              )}
                              <circle
                                cx={p.normX}
                                cy={cy}
                                r={r}
                                fill={isDimmed ? (isDark ? '#3f3f46' : '#94a3b8') : p.color}
                                stroke="#ffffff"
                                strokeWidth={isHovered ? 2 : (isFilterActive && isMatching ? 1.5 : 1.2)}
                                opacity={opacity}
                                style={{
                                  filter: isHovered
                                    ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))'
                                    : (isFilterActive && isMatching ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))'),
                                }}
                              />
                              <text
                                x={p.normX}
                                y={cy + (isHovered ? 3 : 2.5)}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize={isHovered ? '8' : (isFilterActive && isMatching ? '7' : '6.5')}
                                fontWeight="900"
                                fontFamily="'JetBrains Mono', monospace"
                                opacity={opacity}
                              >
                                {p.pitchNumber}
                              </text>
                            </g>
                          );
                        });
                      })()}
                    </svg>
                  ) : (
                    /* Side Angle Pitch Flight & Drop Trajectory */
                    <svg viewBox="0 0 250 130" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <line x1="10" y1="105" x2="240" y2="105" stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="1" />
                      <path d="M 12 105 Q 32 94 52 105 Z" fill={isDark ? '#27170e' : '#fed7aa'} stroke={isDark ? '#3b1c08' : '#fb923c'} strokeWidth="0.8" />
                      <rect x="29" y="93" width="6" height="2" fill="#ffffff" rx="0.5" />
                      <text x="32" y="118" textAnchor="middle" fill={c.textMuted} fontSize="6.5" fontWeight="700">Mound (54')</text>

                      <polygon points="214,105 226,105 226,108 214,108" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.5" />
                      <text x="220" y="118" textAnchor="middle" fill={c.textMuted} fontSize="6.5" fontWeight="700">Plate (0')</text>

                      <rect x="217" y="44" width="6" height="42" rx="1.5" fill={isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)'} stroke="#3b82f6" strokeWidth="1.2" />
                      <text x="220" y="39" textAnchor="middle" fill="#3b82f6" fontSize="6.5" fontWeight="800">SZ</text>

                      <line x1="20" y1="65" x2="235" y2="65" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeDasharray="2 2" strokeWidth="0.8" />
                      <line x1="20" y1="35" x2="235" y2="35" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeDasharray="2 2" strokeWidth="0.8" />
                      <text x="14" y="67" fill={c.textMuted} fontSize="5.5" fontWeight="700">3'</text>
                      <text x="14" y="37" fill={c.textMuted} fontSize="5.5" fontWeight="700">6'</text>

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
                        const sortedPitches = targetPitches.map((p, idx) => ({ ...p, origIdx: idx }));
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
                          const relX = 32;
                          const relY = Math.max(22, Math.min(50, 36 + (5.8 - (p.releaseZ || 5.8)) * 6));
                          const plateX = 220;
                          const plateY = Math.min(94, Math.max(24, 20 + (p.normY / 100) * 75));
                          const midX = 126;
                          const vertBreakEffect = p.breakVertical ? (Math.abs(p.breakVertical) * 0.18) : 5;
                          const midY = (relY + plateY) / 2 - Math.max(2, 7 - vertBreakEffect);

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
                            <g key={p.origIdx} onClick={() => setHoveredPitchIdx(isHovered ? null : p.origIdx)} style={{ cursor: 'pointer' }}>
                              <path
                                d={`M ${relX} ${relY} Q ${midX} ${midY} ${plateX} ${plateY}`}
                                fill="none"
                                stroke={isDimmed ? (isDark ? '#3f3f46' : '#94a3b8') : p.color}
                                strokeWidth={isHovered ? 3.2 : (isFilterActive && isMatching ? 2.2 : 1.5)}
                                strokeDasharray={p.resultType === 'foul' ? '3 2' : 'none'}
                                opacity={opacity}
                              />
                              <circle
                                cx={plateX}
                                cy={plateY}
                                r={isHovered ? 7 : (isFilterActive && isMatching ? 5.5 : 4.5)}
                                fill={isDimmed ? (isDark ? '#3f3f46' : '#94a3b8') : p.color}
                                stroke="#ffffff"
                                strokeWidth={isHovered ? 1.8 : 1.2}
                                opacity={opacity}
                              />
                              <text
                                x={plateX}
                                y={plateY + (isHovered ? 2.5 : 2.2)}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize={isHovered ? '7' : '5.5'}
                                fontWeight="900"
                                fontFamily="'JetBrains Mono', monospace"
                                opacity={opacity}
                              >
                                {p.pitchNumber}
                              </text>
                            </g>
                          );
                        });
                      })()}
                    </svg>
                  )}

                  {/* In-Canvas Floating Pitch Tooltip on Hover */}
                  {hoveredPitchIdx !== null && (() => {
                    const hp = targetPitches[hoveredPitchIdx];
                    if (!hp) return null;
                    return (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 7px',
                        borderRadius: '5px',
                        backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(3px)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
                        fontSize: '9.5px',
                        fontWeight: 800,
                        color: isDark ? '#f4f4f5' : '#0f172a',
                        pointerEvents: 'none',
                        zIndex: 15,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: hp.color, flexShrink: 0 }} />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: hp.color }}>#{hp.pitchNumber}</span>
                        {hp.speed && <span>{hp.speed} MPH</span>}
                        <span>{hp.pitchTypeName || hp.pitchType}</span>
                        <span style={{ color: c.textMuted }}>({hp.callDesc})</span>
                      </div>
                    );
                  })()}

                  {/* In-Canvas Floating Pitch Legend */}
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    right: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 7px',
                    borderRadius: '5px',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(2px)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    fontSize: '8.5px',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#ef4444' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                      Strike
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#10b981' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      Ball
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                      Foul
                    </span>
                  </div>
                </div>

                {/* Pitch Chips List */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingTop: '2px' }}>
                  {targetPitches.map((p, idx) => {
                    const isHovered = hoveredPitchIdx === idx;
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
                        key={idx}
                        onClick={() => setHoveredPitchIdx(isHovered ? null : idx)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 7px',
                          borderRadius: '6px',
                          backgroundColor: isHovered
                            ? (isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.15)')
                            : (isFilterActive && isMatching ? (isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0') : (isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6')),
                          border: `1px solid ${isHovered ? '#3b82f6' : (isFilterActive && isMatching ? p.color : (isDark ? '#27272a' : '#e5e7eb'))}`,
                          fontSize: '10px',
                          fontWeight: 700,
                          color: isDark ? '#f4f4f5' : '#0f172a',
                          cursor: 'pointer',
                          opacity,
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: p.color }} />
                        <span>#{p.pitchNumber}</span>
                        {p.speed && <span style={{ color: c.textMuted }}>{p.speed}</span>}
                        <span>{p.pitchTypeName || p.pitchType}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* TAB 2: Hit & Foul Spray Visualizer */}
            {visualizerTab === 'hit' && (
              <>
                {/* Field Visualizer Canvas */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '230px',
                  backgroundColor: isDark ? '#09090b' : '#f8fafc',
                  borderRadius: '10px',
                  border: `1px solid ${isDark ? '#27272a' : '#e2e8f0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {viewPerspective === 'front' ? (
                    /* Top Down Field Spray */
                    <svg viewBox="0 0 250 220" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <path d="M 125 205 L 18 98 Q 125 -5 232 98 Z" fill={isDark ? '#0c2214' : '#dcfce7'} stroke={isDark ? '#1b432a' : '#86efac'} strokeWidth="1" />
                      <path d="M 24 104 Q 125 7 226 104" fill="none" stroke={isDark ? 'rgba(217, 119, 6, 0.25)' : 'rgba(217, 119, 6, 0.3)'} strokeWidth="6" />
                      <path d="M 125 205 L 68 148 Q 125 90 182 148 Z" fill={isDark ? '#27170e' : '#fed7aa'} fillOpacity={isDark ? 0.6 : 0.7} stroke={isDark ? '#3b1c08' : '#fdba74'} strokeWidth="0.8" />
                      <polygon points="125,205 162,168 125,131 88,168" fill={isDark ? '#0c2214' : '#bbf7d0'} stroke={isDark ? '#52525b' : '#cbd5e1'} strokeWidth="0.8" />
                      <line x1="125" y1="205" x2="15" y2="95" stroke="#ef4444" strokeWidth="1.2" opacity="0.85" />
                      <line x1="125" y1="205" x2="235" y2="95" stroke="#ef4444" strokeWidth="1.2" opacity="0.85" />

                      {/* Wall Distance Markers */}
                      <text x="32" y="90" fill={c.textMuted} fontSize="6" fontWeight="700">330'</text>
                      <text x="125" y="16" textAnchor="middle" fill={c.textMuted} fontSize="6.5" fontWeight="800">400'</text>
                      <text x="218" y="90" fill={c.textMuted} fontSize="6" fontWeight="700">330'</text>

                      {/* Batted Balls Spray Sorted on Top */}
                      {(() => {
                        const rawBalls = (targetBattedBalls.length > 0 ? targetBattedBalls : (targetHitData ? [targetHitData] : []));
                        const sortedBalls = rawBalls.map((b, idx) => ({ ...b, origIdx: idx }));
                        if (hoveredBattedBallIndex !== null) {
                          sortedBalls.sort((a, b) => {
                            if (a.origIdx === hoveredBattedBallIndex) return 1;
                            if (b.origIdx === hoveredBattedBallIndex) return -1;
                            return 0;
                          });
                        }
                        return sortedBalls.map((bBall) => {
                          const isFoul = Boolean(bBall.isFoul);
                          const isHr = !isFoul && (inspectedPlay?.type === 'hr' || (bBall.totalDistance && bBall.totalDistance >= 390));
                          const isHovered = hoveredBattedBallIndex === bBall.origIdx;
                          const isAnyHovered = hoveredBattedBallIndex !== null;
                          const ballColor = isFoul ? '#f59e0b' : (isHr ? '#8b5cf6' : (bBall.isBallInPlay ? '#10b981' : '#ef4444'));
                          const opacity = isHovered ? 1 : (isAnyHovered ? 0.22 : 0.8);

                          let endX = bBall.coordX ?? (125 + (Math.random() - 0.5) * 60);
                          let endY = bBall.coordY ?? (80 + (Math.random() - 0.5) * 40);

                          return (
                            <g
                              key={bBall.origIdx}
                              onMouseEnter={() => setHoveredBattedBallIndex(bBall.origIdx)}
                              onMouseLeave={() => setHoveredBattedBallIndex(null)}
                              style={{ cursor: 'pointer' }}
                            >
                              <line
                                x1="125" y1="205" x2={endX} y2={endY}
                                stroke={isAnyHovered && !isHovered ? (isDark ? '#3f3f46' : '#94a3b8') : ballColor}
                                strokeWidth={isHovered ? 2.8 : 1.3}
                                strokeDasharray={isFoul ? '3 2' : 'none'}
                                opacity={opacity}
                              />
                              <circle
                                cx={endX}
                                cy={endY}
                                r={isHovered ? 7 : 5}
                                fill={isAnyHovered && !isHovered ? (isDark ? '#3f3f46' : '#94a3b8') : ballColor}
                                stroke="#ffffff"
                                strokeWidth={isHovered ? 1.8 : 1.3}
                                opacity={opacity}
                              />
                              <text
                                x={endX}
                                y={endY + 2.2}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize={isHovered ? '6.5' : '5.5'}
                                fontWeight="900"
                                fontFamily="'JetBrains Mono', monospace"
                                opacity={opacity}
                              >
                                {bBall.pitchNumber || bBall.origIdx + 1}
                              </text>
                            </g>
                          );
                        });
                      })()}
                    </svg>
                  ) : (
                    /* Side Elevation Profile */
                    <svg viewBox="0 0 250 140" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <line x1="10" y1="115" x2="240" y2="115" stroke={isDark ? '#3f3f46' : '#cbd5e1'} strokeWidth="1" />
                      <line x1="20" y1="75" x2="235" y2="75" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeDasharray="2 2" strokeWidth="0.8" />
                      <text x="12" y="77" fill={c.textMuted} fontSize="6" fontWeight="700">50'</text>
                      <line x1="20" y1="35" x2="235" y2="35" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeDasharray="2 2" strokeWidth="0.8" />
                      <text x="12" y="37" fill={c.textMuted} fontSize="6" fontWeight="700">100'</text>

                      {/* Outfield Fence */}
                      <rect x="200" y="85" width="4" height="30" fill={isDark ? '#52525b' : '#94a3b8'} rx="1" />
                      <text x="202" y="80" textAnchor="middle" fill={c.textMuted} fontSize="6" fontWeight="800">10' Wall</text>

                      {/* Trajectory Parabola Sorted on Top */}
                      {(() => {
                        const rawBalls = (targetBattedBalls.length > 0 ? targetBattedBalls : (targetHitData ? [targetHitData] : []));
                        const sortedBalls = rawBalls.map((b, idx) => ({ ...b, origIdx: idx }));
                        if (hoveredBattedBallIndex !== null) {
                          sortedBalls.sort((a, b) => {
                            if (a.origIdx === hoveredBattedBallIndex) return 1;
                            if (b.origIdx === hoveredBattedBallIndex) return -1;
                            return 0;
                          });
                        }
                        return sortedBalls.map((bBall) => {
                          const isFoul = Boolean(bBall.isFoul);
                          const isHr = !isFoul && (inspectedPlay?.type === 'hr' || (bBall.totalDistance && bBall.totalDistance >= 390));
                          const isHovered = hoveredBattedBallIndex === bBall.origIdx;
                          const isAnyHovered = hoveredBattedBallIndex !== null;
                          const ballColor = isFoul ? '#f59e0b' : (isHr ? '#8b5cf6' : (bBall.isBallInPlay ? '#10b981' : '#ef4444'));
                          const opacity = isHovered ? 1 : (isAnyHovered ? 0.22 : 0.85);

                          const dist = bBall.totalDistance || 220;
                          const landX = Math.min(235, Math.max(70, 30 + (dist / 420) * 175));
                          const apexH = Math.min(95, Math.max(15, (bBall.launchSpeed ? bBall.launchSpeed * 0.7 : 50)));
                          const apexX = (30 + landX) / 2;
                          const apexY = 115 - apexH;

                          return (
                            <g
                              key={bBall.origIdx}
                              onMouseEnter={() => setHoveredBattedBallIndex(bBall.origIdx)}
                              onMouseLeave={() => setHoveredBattedBallIndex(null)}
                              style={{ cursor: 'pointer' }}
                            >
                              <path
                                d={`M 30 112 Q ${apexX} ${apexY} ${landX} 115`}
                                fill="none"
                                stroke={isAnyHovered && !isHovered ? (isDark ? '#3f3f46' : '#94a3b8') : ballColor}
                                strokeWidth={isHovered ? 3.2 : 1.6}
                                strokeDasharray={isFoul ? '3 2' : 'none'}
                                opacity={opacity}
                              />
                              <circle
                                cx={landX}
                                cy={115}
                                r={isHovered ? 6.5 : 4.5}
                                fill={isAnyHovered && !isHovered ? (isDark ? '#3f3f46' : '#94a3b8') : ballColor}
                                stroke="#ffffff"
                                strokeWidth={1.2}
                                opacity={opacity}
                              />
                              <text
                                x={landX}
                                y={127}
                                textAnchor="middle"
                                fill={isAnyHovered && !isHovered ? (isDark ? '#52525b' : '#94a3b8') : c.textHead}
                                fontSize="7"
                                fontWeight="800"
                                fontFamily="'JetBrains Mono', monospace"
                                opacity={opacity}
                              >
                                {dist}'
                              </text>
                            </g>
                          );
                        });
                      })()}
                    </svg>
                  )}

                  {/* In-Canvas Floating Hit Tooltip on Hover */}
                  {hoveredBattedBallIndex !== null && activeHit && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 7px',
                      borderRadius: '5px',
                      backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(3px)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
                      fontSize: '9.5px',
                      fontWeight: 800,
                      color: isDark ? '#f4f4f5' : '#0f172a',
                      pointerEvents: 'none',
                      zIndex: 15,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: activeHit.isFoul ? '#f59e0b' : (activeHit.isBallInPlay ? '#10b981' : '#ef4444'), flexShrink: 0 }} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: activeHit.isFoul ? '#f59e0b' : (activeHit.isBallInPlay ? '#10b981' : '#ef4444') }}>#{activeHit.pitchNumber}</span>
                      {activeHit.launchSpeed && <span style={{ color: '#3b82f6' }}>{activeHit.launchSpeed} MPH</span>}
                      {activeHit.totalDistance && <span style={{ color: '#10b981' }}>({activeHit.totalDistance} FT)</span>}
                      <span style={{ color: c.textMuted }}>({activeHit.isFoul ? 'Foul' : (inspectedPlay?.code || 'In Play')})</span>
                    </div>
                  )}

                  {/* In-Canvas Floating Hit Legend */}
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    right: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 7px',
                    borderRadius: '5px',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(2px)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    fontSize: '8.5px',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#10b981' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      Hit
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                      Foul
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#ef4444' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                      Out
                    </span>
                  </div>
                </div>

                {/* Batted Ball Detail Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingTop: '2px' }}>
                  {(targetBattedBalls.length > 0 ? targetBattedBalls : (targetHitData ? [targetHitData] : [])).map((bBall, idx) => {
                    const isFoul = Boolean(bBall.isFoul);
                    const isHovered = hoveredBattedBallIndex === idx;
                    const isAnyHovered = hoveredBattedBallIndex !== null;
                    const ballColor = isFoul ? '#f59e0b' : (bBall.isBallInPlay ? '#10b981' : '#ef4444');
                    return (
                      <button
                        key={idx}
                        onMouseEnter={() => setHoveredBattedBallIndex(idx)}
                        onMouseLeave={() => setHoveredBattedBallIndex(null)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: isHovered
                            ? (isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.15)')
                            : (isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6'),
                          border: `1px solid ${isHovered ? '#3b82f6' : (isDark ? '#27272a' : '#e5e7eb')}`,
                          fontSize: '10px',
                          fontWeight: 700,
                          color: isDark ? '#f4f4f5' : '#0f172a',
                          cursor: 'pointer',
                          opacity: isAnyHovered && !isHovered ? 0.35 : 1,
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ballColor }} />
                        <span>#{bBall.pitchNumber || idx + 1}</span>
                        {bBall.launchSpeed && <span style={{ color: '#3b82f6' }}>{bBall.launchSpeed} MPH</span>}
                        {bBall.totalDistance && <span style={{ color: '#10b981' }}>{bBall.totalDistance}'</span>}
                        <span style={{ color: c.textMuted }}>{isFoul ? 'Foul' : 'Fair'}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
