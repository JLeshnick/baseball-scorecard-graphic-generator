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
  const [hoveredPitchIdx, setHoveredPitchIdx] = useState(null);
  const [selectedBattedBallIndex, setSelectedBattedBallIndex] = useState(null);
  const [hoveredBattedBallIndex, setHoveredBattedBallIndex] = useState(null);
  const [selectedMultiPaIndex, setSelectedMultiPaIndex] = useState(0);

  const inspectedCellKey = inspectedCell?.cellKey || null;
  useEffect(() => {
    setSelectedMultiPaIndex(0);
    setSelectedBattedBallIndex(null);
    setHoveredBattedBallIndex(null);
    setHoveredPitchIdx(null);
    setVisualizerTab('strikezone');
    setViewPerspective('front');
  }, [inspectedCellKey]);

  if (!isOpen || !inspectedCell) return null;

  const inspectedPlaysArray = inspectedCell?.plays?.length
    ? inspectedCell.plays
    : (Array.isArray(inspectedCell?.currentPlay)
        ? inspectedCell.currentPlay
        : (inspectedCell?.currentPlay ? [inspectedCell.currentPlay] : []));

  const activeMultiIndex = (selectedMultiPaIndex < inspectedPlaysArray.length) ? selectedMultiPaIndex : 0;
  const inspectedPlay = inspectedPlaysArray.length > 0 ? inspectedPlaysArray[activeMultiIndex] : null;

  const targetPitches = inspectedPlay?.pitches || [];
  const targetHitData = inspectedPlay?.hitData || null;
  const targetBattedBalls = inspectedPlay?.battedBalls?.length
    ? inspectedPlay.battedBalls
    : (inspectedPlay?.hitData ? [inspectedPlay.hitData] : []);

  const activeHit = (hoveredBattedBallIndex !== null && targetBattedBalls[hoveredBattedBallIndex])
    || (selectedBattedBallIndex !== null && targetBattedBalls[selectedBattedBallIndex])
    || (targetBattedBalls.length > 0 ? targetBattedBalls[targetBattedBalls.length - 1] : targetHitData);

  const batterName = formatPlayerName(inspectedPlay?.batterFullName || inspectedPlay?.batterName || inspectedCell.batter?.fullName || inspectedCell.batter?.name || 'Batter');
  const displayJersey = inspectedPlay?.batterJerseyNumber || inspectedCell.batter?.jerseyNumber || '';
  const pitcherName = formatPlayerName(inspectedPlay?.pitcherFullName || inspectedPlay?.pitcherName || '');
  const batSide = inspectedPlay?.batSide || inspectedCell.batter?.batSide || 'R';
  const playDesc = inspectedPlay?.description || (inspectedPlay?.code ? inspectedPlay.code : (inspectedPlay ? '' : 'No plate appearance in this inning.'));

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
                {inspectedCell.teamName || (inspectedCell.teamKey === 'home' ? 'Home' : 'Away')} · Inning {inspectedCell.inning} {pitcherName ? `· vs ${pitcherName}` : ''}
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
            }}>
              <span style={{ fontSize: '9.5px', fontWeight: 800, color: c.textMuted, paddingLeft: '4px', textTransform: 'uppercase' }}>
                At-Bat:
              </span>
              {inspectedPlaysArray.map((p, pIdx) => {
                const isCur = pIdx === activeMultiIndex;
                const seqSymbol = pIdx === 0 ? '①' : pIdx === 1 ? '②' : '③';
                const playCode = p?.code || `PA ${pIdx + 1}`;
                const pitchCount = p?.pitches?.length || 0;
                return (
                  <button
                    key={pIdx}
                    onClick={() => {
                      setSelectedMultiPaIndex(pIdx);
                      setSelectedBattedBallIndex(null);
                      setHoveredBattedBallIndex(null);
                      setHoveredPitchIdx(null);
                    }}
                    style={{
                      flex: 1,
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
                    <span>{playCode}</span>
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
                <span style={{ fontSize: '10px', opacity: 0.8 }}>({targetPitches.length}P)</span>
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
                  {targetBattedBalls.length > 0 ? `(${targetBattedBalls.length}B)` : (targetHitData?.launchSpeed ? `(${targetHitData.launchSpeed} MPH)` : '')}
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
                {/* Strike Zone Visualizer Header Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '22px',
                  overflow: 'hidden',
                }}>
                  {hoveredPitchIdx !== null ? (() => {
                    const hp = targetPitches[hoveredPitchIdx];
                    if (!hp) return null;
                    return (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        color: isDark ? '#f4f4f5' : '#0f172a',
                      }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: hp.color, flexShrink: 0 }} />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: hp.color }}>#{hp.pitchNumber}</span>
                        {hp.speed && <span>{hp.speed} MPH</span>}
                        <span>{hp.pitchTypeName || hp.pitchType}</span>
                        <span style={{ color: c.textMuted }}>({hp.callDesc})</span>
                      </div>
                    );
                  })() : (
                    <>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase' }}>
                        {viewPerspective === 'front' ? 'Strike Zone' : 'Mound → Plate'} ({targetPitches.length}P)
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9.5px', fontWeight: 700 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#ef4444' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                          Strike
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#10b981' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                          Ball
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                          Foul
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* SVG Visualizer Canvas */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '175px',
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
                        const sortedPitches = targetPitches.map((p, idx) => ({ ...p, origIdx: idx }));
                        if (hoveredPitchIdx !== null) {
                          sortedPitches.sort((a, b) => {
                            if (a.origIdx === hoveredPitchIdx) return 1;
                            if (b.origIdx === hoveredPitchIdx) return -1;
                            return 0;
                          });
                        }
                        return sortedPitches.map((p) => {
                          const isHovered = hoveredPitchIdx === p.origIdx;
                          const isAnyHovered = hoveredPitchIdx !== null;
                          const cy = Math.min(70, Math.max(16, p.normY - 4));
                          const opacity = isHovered ? 1 : (isAnyHovered ? 0.22 : 1);
                          const r = isHovered ? 8 : 6;

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
                                fill={isAnyHovered && !isHovered ? (isDark ? '#3f3f46' : '#94a3b8') : p.color}
                                stroke="#ffffff"
                                strokeWidth={isHovered ? 2 : 1.2}
                                opacity={opacity}
                                style={{ filter: isHovered ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}
                              />
                              <text
                                x={p.normX}
                                y={cy + (isHovered ? 3 : 2.5)}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize={isHovered ? '8' : '6.5'}
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
                        const sortedPitches = targetPitches.map((p, idx) => ({ ...p, origIdx: idx }));
                        if (hoveredPitchIdx !== null) {
                          sortedPitches.sort((a, b) => {
                            if (a.origIdx === hoveredPitchIdx) return 1;
                            if (b.origIdx === hoveredPitchIdx) return -1;
                            return 0;
                          });
                        }
                        return sortedPitches.map((p) => {
                          const isHovered = hoveredPitchIdx === p.origIdx;
                          const isAnyHovered = hoveredPitchIdx !== null;
                          const relX = 32;
                          const relY = Math.max(22, Math.min(50, 36 + (5.8 - (p.releaseZ || 5.8)) * 6));
                          const plateX = 220;
                          const plateY = Math.min(94, Math.max(24, 20 + (p.normY / 100) * 75));
                          const midX = 126;
                          const vertBreakEffect = p.breakVertical ? (Math.abs(p.breakVertical) * 0.18) : 5;
                          const midY = (relY + plateY) / 2 - Math.max(2, 7 - vertBreakEffect);
                          const opacity = isHovered ? 1 : (isAnyHovered ? 0.15 : 0.8);

                          return (
                            <g key={p.origIdx} onClick={() => setHoveredPitchIdx(isHovered ? null : p.origIdx)} style={{ cursor: 'pointer' }}>
                              <path
                                d={`M ${relX} ${relY} Q ${midX} ${midY} ${plateX} ${plateY}`}
                                fill="none"
                                stroke={isAnyHovered && !isHovered ? (isDark ? '#3f3f46' : '#94a3b8') : p.color}
                                strokeWidth={isHovered ? 3.2 : 1.5}
                                strokeDasharray={p.resultType === 'foul' ? '3 2' : 'none'}
                                opacity={opacity}
                              />
                              <circle
                                cx={plateX}
                                cy={plateY}
                                r={isHovered ? 7 : 4.5}
                                fill={isAnyHovered && !isHovered ? (isDark ? '#3f3f46' : '#94a3b8') : p.color}
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
                </div>

                {/* Pitch Chips List */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingTop: '2px' }}>
                  {targetPitches.map((p, idx) => {
                    const isHovered = hoveredPitchIdx === idx;
                    const isAnyHovered = hoveredPitchIdx !== null;
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
                            : (isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6'),
                          border: `1px solid ${isHovered ? '#3b82f6' : (isDark ? '#27272a' : '#e5e7eb')}`,
                          fontSize: '10px',
                          fontWeight: 700,
                          color: isDark ? '#f4f4f5' : '#0f172a',
                          cursor: 'pointer',
                          opacity: isAnyHovered && !isHovered ? 0.35 : 1,
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
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '22px',
                  overflow: 'hidden',
                }}>
                  {activeHit ? (() => {
                    const isFoul = Boolean(activeHit.isFoul);
                    const isHr = !isFoul && (inspectedPlay?.type === 'hr' || (activeHit.totalDistance && activeHit.totalDistance >= 390));
                    const bColor = isFoul ? '#f59e0b' : (isHr ? '#8b5cf6' : (activeHit.isBallInPlay ? '#10b981' : '#ef4444'));
                    return (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        color: isDark ? '#f4f4f5' : '#0f172a',
                      }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: bColor, flexShrink: 0 }} />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: bColor }}>#{activeHit.pitchNumber}</span>
                        {activeHit.launchSpeed && <span style={{ color: '#3b82f6' }}>{activeHit.launchSpeed} MPH</span>}
                        {activeHit.totalDistance && <span style={{ color: '#10b981' }}>({activeHit.totalDistance} FT)</span>}
                        <span style={{ color: c.textMuted }}>({isFoul ? 'Foul' : (inspectedPlay?.code || 'In Play')})</span>
                      </div>
                    );
                  })() : (
                    <>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase' }}>
                        {viewPerspective === 'front' ? 'Field Spray Chart' : 'Elevation Profile'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9.5px', fontWeight: 700 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#10b981' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                          Hit
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                          Foul
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#ef4444' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                          Out
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Field Visualizer Canvas */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '185px',
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
                        const activeBallIdx = hoveredBattedBallIndex !== null ? hoveredBattedBallIndex : selectedBattedBallIndex;
                        if (activeBallIdx !== null) {
                          sortedBalls.sort((a, b) => {
                            if (a.origIdx === activeBallIdx) return 1;
                            if (b.origIdx === activeBallIdx) return -1;
                            return 0;
                          });
                        }
                        return sortedBalls.map((bBall) => {
                          const isFoul = Boolean(bBall.isFoul);
                          const isHr = !isFoul && (inspectedPlay?.type === 'hr' || (bBall.totalDistance && bBall.totalDistance >= 390));
                          const isSel = (hoveredBattedBallIndex === bBall.origIdx) || (selectedBattedBallIndex === bBall.origIdx);
                          const isAnyActive = activeBallIdx !== null;
                          const ballColor = isFoul ? '#f59e0b' : (isHr ? '#8b5cf6' : (bBall.isBallInPlay ? '#10b981' : '#ef4444'));
                          const opacity = isSel ? 1 : (isAnyActive ? 0.22 : 0.8);

                          let endX = bBall.coordX ?? (125 + (Math.random() - 0.5) * 60);
                          let endY = bBall.coordY ?? (80 + (Math.random() - 0.5) * 40);

                          return (
                            <g key={bBall.origIdx} onClick={() => setSelectedBattedBallIndex(isSel ? null : bBall.origIdx)} style={{ cursor: 'pointer' }}>
                              <line
                                x1="125" y1="205" x2={endX} y2={endY}
                                stroke={isAnyActive && !isSel ? (isDark ? '#3f3f46' : '#94a3b8') : ballColor}
                                strokeWidth={isSel ? 2.8 : 1.3}
                                strokeDasharray={isFoul ? '3 2' : 'none'}
                                opacity={opacity}
                              />
                              <circle
                                cx={endX}
                                cy={endY}
                                r={isSel ? 7 : 5}
                                fill={isAnyActive && !isSel ? (isDark ? '#3f3f46' : '#94a3b8') : ballColor}
                                stroke="#ffffff"
                                strokeWidth={isSel ? 1.8 : 1.3}
                                opacity={opacity}
                              />
                              <text
                                x={endX}
                                y={endY + 2.2}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize={isSel ? '6.5' : '5.5'}
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
                        const activeBallIdx = hoveredBattedBallIndex !== null ? hoveredBattedBallIndex : selectedBattedBallIndex;
                        if (activeBallIdx !== null) {
                          sortedBalls.sort((a, b) => {
                            if (a.origIdx === activeBallIdx) return 1;
                            if (b.origIdx === activeBallIdx) return -1;
                            return 0;
                          });
                        }
                        return sortedBalls.map((bBall) => {
                          const isFoul = Boolean(bBall.isFoul);
                          const isHr = !isFoul && (inspectedPlay?.type === 'hr' || (bBall.totalDistance && bBall.totalDistance >= 390));
                          const isSel = (hoveredBattedBallIndex === bBall.origIdx) || (selectedBattedBallIndex === bBall.origIdx);
                          const isAnyActive = activeBallIdx !== null;
                          const ballColor = isFoul ? '#f59e0b' : (isHr ? '#8b5cf6' : (bBall.isBallInPlay ? '#10b981' : '#ef4444'));
                          const opacity = isSel ? 1 : (isAnyActive ? 0.22 : 0.85);

                          const dist = bBall.totalDistance || 220;
                          const landX = Math.min(235, Math.max(70, 30 + (dist / 420) * 175));
                          const apexH = Math.min(95, Math.max(15, (bBall.launchSpeed ? bBall.launchSpeed * 0.7 : 50)));
                          const apexX = (30 + landX) / 2;
                          const apexY = 115 - apexH;

                          return (
                            <g key={bBall.origIdx} onClick={() => setSelectedBattedBallIndex(isSel ? null : bBall.origIdx)} style={{ cursor: 'pointer' }}>
                              <path
                                d={`M 30 112 Q ${apexX} ${apexY} ${landX} 115`}
                                fill="none"
                                stroke={isAnyActive && !isSel ? (isDark ? '#3f3f46' : '#94a3b8') : ballColor}
                                strokeWidth={isSel ? 3.2 : 1.6}
                                strokeDasharray={isFoul ? '3 2' : 'none'}
                                opacity={opacity}
                              />
                              <circle
                                cx={landX}
                                cy={115}
                                r={isSel ? 6.5 : 4.5}
                                fill={isAnyActive && !isSel ? (isDark ? '#3f3f46' : '#94a3b8') : ballColor}
                                stroke="#ffffff"
                                strokeWidth={1.2}
                                opacity={opacity}
                              />
                              <text
                                x={landX}
                                y={127}
                                textAnchor="middle"
                                fill={isAnyActive && !isSel ? (isDark ? '#52525b' : '#94a3b8') : c.textHead}
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
                </div>

                {/* Batted Ball Detail Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingTop: '2px' }}>
                  {(targetBattedBalls.length > 0 ? targetBattedBalls : (targetHitData ? [targetHitData] : [])).map((bBall, idx) => {
                    const isFoul = Boolean(bBall.isFoul);
                    const isSel = (hoveredBattedBallIndex === idx) || (selectedBattedBallIndex === idx);
                    const activeBallIdx = hoveredBattedBallIndex !== null ? hoveredBattedBallIndex : selectedBattedBallIndex;
                    const ballColor = isFoul ? '#f59e0b' : (bBall.isBallInPlay ? '#10b981' : '#ef4444');
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedBattedBallIndex(isSel ? null : idx)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: isSel
                            ? (isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.15)')
                            : (isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6'),
                          border: `1px solid ${isSel ? '#3b82f6' : (isDark ? '#27272a' : '#e5e7eb')}`,
                          fontSize: '10px',
                          fontWeight: 700,
                          color: isDark ? '#f4f4f5' : '#0f172a',
                          cursor: 'pointer',
                          opacity: activeBallIdx !== null && !isSel ? 0.35 : 1,
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
