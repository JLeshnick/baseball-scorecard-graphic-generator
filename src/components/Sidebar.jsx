import React from 'react';
import {
  Calendar,
  ChevronDown,
  BookOpen,
  Edit3,
  Users,
  ChevronRight,
  Save,
  Check,
  FolderOpen,
  Plus,
  RefreshCw,
  Share2,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { POSTER_THEMES } from '../utils/constants';
import { useAppStore } from '../store/useAppStore';

import ScoringGuide from './ScoringGuide';

export default function Sidebar({
  isMobile,
  mobileView,
  c,
  isDark,
  activeTab,
  setActiveTab,
  tabStyle,
  // Game tab props
  scoringMode,
  setScoringMode,
  setBlankMode,
  selectedGamePk,
  setSelectedGamePk,
  loadGameData,
  scorecardData,
  handleStartNewBlankGame,
  handleStartLiveFromCurrentGame,
  dateInputRef,
  selectedDate,
  triggerCalendarPicker,
  setSelectedDate,
  availableGames,
  searching,
  gameSelectOpen,
  setGameSelectOpen,
  lastRefreshedTime,
  loading,
  setToastMessage,
  handleCopyShareLink,
  setRosterModalOpen,
  handleSaveToLibrary,
  setSavedGamesModalOpen,
  prefillLoading,
  prefillGames,
  prefillDate,
  setPrefillDate,
  prefillSelectOpen,
  setPrefillSelectOpen,
  prefillSelectedGamePk,
  setPrefillSelectedGamePk,
  handleApplyPrefillFromGame,
  autoCalculateStats,
  setAutoCalculateStats,
  // Reset handler
  handleGlobalReset,
  guidePinned,
  onTogglePinGuide,
}) {
  // Read and write directly to Zustand store for all display & custom text options!
  const theme = useAppStore(s => s.theme);
  const setTheme = useAppStore(s => s.setTheme);
  const fontStyle = useAppStore(s => s.fontStyle);
  const setFontStyle = useAppStore(s => s.setFontStyle);
  const orientation = useAppStore(s => s.orientation);
  const setOrientation = useAppStore(s => s.setOrientation);
  const showTeamWatermarks = useAppStore(s => s.showTeamWatermarks);
  const setShowTeamWatermarks = useAppStore(s => s.setShowTeamWatermarks);
  const customAwayColor = useAppStore(s => s.customAwayColor);
  const setCustomAwayColor = useAppStore(s => s.setCustomAwayColor);
  const customHomeColor = useAppStore(s => s.customHomeColor);
  const setCustomHomeColor = useAppStore(s => s.setCustomHomeColor);

  const showStatcast = useAppStore(s => s.showStatcast);
  const setShowStatcast = useAppStore(s => s.setShowStatcast);
  const showMomentum = useAppStore(s => s.showMomentum);
  const setShowMomentum = useAppStore(s => s.setShowMomentum);
  const showMvp = useAppStore(s => s.showMvp);
  const setShowMvp = useAppStore(s => s.setShowMvp);
  const showPitchBreakdown = useAppStore(s => s.showPitchBreakdown);
  const setShowPitchBreakdown = useAppStore(s => s.setShowPitchBreakdown);

  const showExtraEvents = useAppStore(s => s.showExtraEvents);
  const setShowExtraEvents = useAppStore(s => s.setShowExtraEvents);
  const showEndInningBases = useAppStore(s => s.showEndInningBases);
  const setShowEndInningBases = useAppStore(s => s.setShowEndInningBases);
  const showEraserMarks = useAppStore(s => s.showEraserMarks);
  const setShowEraserMarks = useAppStore(s => s.setShowEraserMarks);

  const showDecisions = useAppStore(s => s.showDecisions);
  const setShowDecisions = useAppStore(s => s.setShowDecisions);
  const showEnvironmentBox = useAppStore(s => s.showEnvironmentBox);
  const setShowEnvironmentBox = useAppStore(s => s.setShowEnvironmentBox);
  const showHRDistances = useAppStore(s => s.showHRDistances);
  const setShowHRDistances = useAppStore(s => s.setShowHRDistances);
  const eraserSeed = useAppStore(s => s.eraserSeed);
  const setEraserSeed = useAppStore(s => s.setEraserSeed);

  const customHeadline = useAppStore(s => s.customHeadline);
  const setCustomHeadline = useAppStore(s => s.setCustomHeadline);
  const customSubtitle = useAppStore(s => s.customSubtitle);
  const setCustomSubtitle = useAppStore(s => s.setCustomSubtitle);
  const customNotes = useAppStore(s => s.customNotes);
  const setCustomNotes = useAppStore(s => s.setCustomNotes);
  const customFooter = useAppStore(s => s.customFooter);
  const setCustomFooter = useAppStore(s => s.setCustomFooter);

  if (isMobile && mobileView !== 'controls') return null;

  return (
    <aside style={{
      width: isMobile ? '100%' : '330px',
      minWidth: isMobile ? '100%' : '330px',
      maxWidth: isMobile ? '100%' : '330px',
      flex: isMobile ? '1 1 auto' : '0 0 330px',
      height: '100%',
      maxHeight: '100%',
      flexShrink: 0,
      backgroundColor: c.bgSidebar,
      borderRight: isMobile ? 'none' : `1px solid ${c.border}`,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      boxSizing: 'border-box',
    }}>

      {/* Tab Nav */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${c.border}`,
        padding: '0 4px',
        gap: '0',
        flexShrink: 0,
        backgroundColor: c.bgSidebar,
      }}>
        {[
          { id: 'game', label: 'Game' },
          { id: 'style', label: 'Theme' },
          { id: 'data', label: 'Data' },
          { id: 'text', label: 'Text' },
          { id: 'guide', label: 'Guide' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={tabStyle(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: isMobile ? '16px 16px 90px 16px' : '16px', flex: 1 }}>

        {/* ── GAME TAB ──────────────────────────────────────────────── */}
        {activeTab === 'game' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Top Mode Segmented Switch: Completed Scorecards vs Manual Scorecard */}
            <div>
              <label style={{
                display: 'block', marginBottom: '6px',
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: c.textMuted,
              }}>
                Mode
              </label>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                padding: '3px', borderRadius: '8px', border: `1px solid ${c.border}`,
              }}>
                <button
                  onClick={() => {
                    setScoringMode('mlb');
                    setBlankMode('none');
                    if (selectedGamePk) loadGameData(selectedGamePk);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    padding: '7px 4px', borderRadius: '6px', cursor: 'pointer',
                    border: scoringMode === 'mlb' ? `1px solid ${c.border}` : '1px solid transparent',
                    backgroundColor: scoringMode === 'mlb' ? c.bgCard : 'transparent',
                    color: scoringMode === 'mlb' ? c.textHead : c.textMuted,
                    fontWeight: scoringMode === 'mlb' ? 700 : 500,
                    fontSize: '11px',
                    boxShadow: scoringMode === 'mlb' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Calendar style={{ width: '13px', height: '13px' }} />
                  Active/Complete Scorecards
                </button>

                <button
                  onClick={() => {
                    if (!scorecardData?.isLiveScorebook) {
                      handleStartNewBlankGame();
                    } else {
                      setScoringMode('live');
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    padding: '7px 4px', borderRadius: '6px', cursor: 'pointer',
                    border: scoringMode === 'live' ? `1px solid ${c.border}` : '1px solid transparent',
                    backgroundColor: scoringMode === 'live' ? c.bgCard : 'transparent',
                    color: scoringMode === 'live' ? c.textHead : c.textMuted,
                    fontWeight: scoringMode === 'live' ? 700 : 500,
                    fontSize: '11px',
                    boxShadow: scoringMode === 'live' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <BookOpen style={{ width: '13px', height: '13px', color: '#3b82f6' }} />
                  Manual Scorecard
                </button>
              </div>
            </div>

            {/* ── MODE 1: OFFICIAL MLB GAMES (AUTO) ────────────────────── */}
            {scoringMode === 'mlb' && (
              <>
                <div>
                  <label style={{
                    display: 'block', marginBottom: '6px',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: c.textMuted,
                  }}>
                    Game Date
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      ref={dateInputRef}
                      type="date"
                      value={selectedDate}
                      onClick={triggerCalendarPicker}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{
                        width: '100%',
                        border: `1px solid ${c.border}`,
                        borderRadius: '6px',
                        padding: '8px 10px',
                        fontSize: '12px',
                        fontFamily: "'Inter', sans-serif",
                        backgroundColor: c.bgInput,
                        color: c.textMain,
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    />
                    <Calendar style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      width: '14px', height: '14px', color: c.textMuted, pointerEvents: 'none',
                    }} />
                  </div>
                </div>

                {/* Grouped MLB Game selector dropdown */}
                <div>
                  <label style={{
                    display: 'block', marginBottom: '6px',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: c.textMuted,
                  }}>
                    Select MLB Game ({availableGames.length})
                  </label>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setGameSelectOpen(o => !o)}
                      disabled={searching || availableGames.length === 0}
                      style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: `1px solid ${c.border}`,
                        backgroundColor: c.bgInput,
                        color: availableGames.length === 0 ? c.textMuted : c.textMain,
                        fontSize: '12px', fontWeight: 500,
                        cursor: availableGames.length === 0 ? 'default' : 'pointer',
                        textAlign: 'left',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: '8px' }}>
                        {searching
                          ? 'Searching games…'
                          : availableGames.length === 0
                          ? 'No games on this date'
                          : availableGames.find(g => String(g.gamePk) === String(selectedGamePk))
                            ? `${availableGames.find(g => String(g.gamePk) === String(selectedGamePk)).awayTeam} @ ${availableGames.find(g => String(g.gamePk) === String(selectedGamePk)).homeTeam}`
                            : 'Select a game'}
                      </span>
                      <ChevronDown style={{
                        width: '13px', height: '13px', color: c.textMuted, flexShrink: 0,
                        transition: 'transform 0.15s',
                        transform: gameSelectOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }} />
                    </button>

                    {gameSelectOpen && availableGames.length > 0 && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setGameSelectOpen(false)} />
                        <div style={{
                          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                          maxHeight: '280px', overflowY: 'auto',
                          backgroundColor: c.bgCard,
                          border: `1px solid ${c.border}`,
                          borderRadius: '8px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                          zIndex: 100,
                          padding: '6px 4px',
                        }}>
                          {(() => {
                            const liveGames = availableGames.filter(g => g.isLive);
                            const finalGames = availableGames.filter(g => g.isFinal);
                            const upcomingGames = availableGames.filter(g => !g.isLive && !g.isFinal);

                            const renderGameItem = (g) => {
                              const isSelected = String(g.gamePk) === String(selectedGamePk);
                              return (
                                <button
                                  key={g.gamePk}
                                  onClick={() => {
                                    setSelectedGamePk(String(g.gamePk));
                                    setGameSelectOpen(false);
                                  }}
                                  style={{
                                    display: 'block', width: '100%', padding: '7px 9px',
                                    borderRadius: '5px', border: 'none',
                                    backgroundColor: isSelected ? (isDark ? 'rgba(99,102,241,0.18)' : 'rgba(79,70,229,0.08)') : 'transparent',
                                    textAlign: 'left', cursor: 'pointer',
                                    transition: 'background 0.1s',
                                    marginBottom: '2px',
                                  }}
                                  onMouseEnter={e => {
                                    if (!isSelected) e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                                  }}
                                  onMouseLeave={e => {
                                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <div style={{
                                    fontSize: '11.5px', fontWeight: 700,
                                    color: isSelected ? c.textHead : c.textMain,
                                    lineHeight: 1.3, wordBreak: 'break-word',
                                  }}>
                                    {g.awayTeam} @ {g.homeTeam}
                                  </div>
                                  <div style={{
                                    fontSize: '10.5px', color: c.textMuted, marginTop: '2px',
                                    display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
                                  }}>
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: c.textHead }}>
                                      {g.awayScore ?? '?'} – {g.homeScore ?? '?'}
                                    </span>
                                    <span style={{
                                      fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700,
                                      color: g.isLive ? '#ef4444' : c.textMuted,
                                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    }}>
                                      {g.isLive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />}
                                      {g.isLive ? (g.inningText || 'Live') : (g.inningText || g.status || 'Final')}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '10px', color: c.textMuted, marginTop: '2px', wordBreak: 'break-word' }}>
                                    {g.venue}
                                  </div>
                                </button>
                              );
                            };

                            return (
                              <>
                                {liveGames.length > 0 && (
                                  <div style={{ marginBottom: '8px' }}>
                                    <div style={{
                                      fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                                      color: '#ef4444', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '5px',
                                    }}>
                                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                                      <span>Live & In Progress ({liveGames.length})</span>
                                    </div>
                                    {liveGames.map(renderGameItem)}
                                  </div>
                                )}

                                {finalGames.length > 0 && (
                                  <div style={{ marginBottom: '8px' }}>
                                    <div style={{
                                      fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                                      color: c.textMuted, padding: '4px 8px',
                                    }}>
                                      Completed Games ({finalGames.length})
                                    </div>
                                    {finalGames.map(renderGameItem)}
                                  </div>
                                )}

                                {upcomingGames.length > 0 && (
                                  <div>
                                    <div style={{
                                      fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                                      color: c.textMuted, padding: '4px 8px',
                                    }}>
                                      Upcoming / Scheduled ({upcomingGames.length})
                                    </div>
                                    {upcomingGames.map(renderGameItem)}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Unified Game Card: Status, Refresh, Score, Live Balls/Strikes/Outs, Bases, Matchup, Share */}
                {scorecardData && !loading && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${scorecardData.gameInfo.isLive ? (isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)') : c.border}`,
                    backgroundColor: isDark ? '#141417' : '#f9f9f8',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxSizing: 'border-box',
                  }}>
                    {/* Top Bar: Status indicator & Refresh button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {scorecardData.gameInfo.isLive ? (
                          <span style={{
                            display: 'inline-block', width: '7px', height: '7px',
                            borderRadius: '50%', backgroundColor: '#ef4444',
                            boxShadow: '0 0 6px #ef4444',
                            animation: 'liveDotPulse 1.2s ease-in-out infinite',
                          }} />
                        ) : (
                          <span style={{
                            display: 'inline-block', width: '6px', height: '6px',
                            borderRadius: '50%', backgroundColor: c.textMuted,
                          }} />
                        )}
                        <span style={{
                          fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                          color: scorecardData.gameInfo.isLive ? '#ef4444' : c.textMuted,
                        }}>
                          {scorecardData.gameInfo.liveGameState
                            ? `${scorecardData.gameInfo.liveGameState.inningHalf === 'Top' ? '▲ TOP' : '▼ BOT'} ${scorecardData.gameInfo.liveGameState.inningOrdinal}`
                            : (scorecardData.gameInfo.statusDisplay || (scorecardData.gameInfo.isFinal ? 'FINAL' : 'SCHEDULED'))}
                        </span>
                        {lastRefreshedTime && (
                          <span style={{ fontSize: '9.5px', color: c.textMuted }}>
                            · {lastRefreshedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      {selectedGamePk && (
                        <button
                          onClick={() => {
                            loadGameData(selectedGamePk);
                            setToastMessage('Refreshed latest MLB game data!');
                            setTimeout(() => setToastMessage(''), 2500);
                          }}
                          disabled={loading}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '3px 7px', borderRadius: '4px', border: `1px solid ${c.border}`,
                            backgroundColor: isDark ? '#27272a' : '#ffffff', color: c.textHead,
                            fontSize: '10.5px', fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <RefreshCw style={{ width: '10px', height: '10px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                          <span>Refresh</span>
                        </button>
                      )}
                    </div>

                    {/* Team Scores Row */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '4px 0',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: c.textHead, letterSpacing: '0.02em' }}>
                          {scorecardData.gameInfo.awayTeam.abbreviation}
                        </div>
                        <div style={{ fontSize: '9.5px', color: c.textMuted, marginTop: '1px' }}>
                          {`${scorecardData.gameInfo.awayTeam.hits ?? 0}H • ${scorecardData.gameInfo.awayTeam.errors ?? 0}E`}
                        </div>
                      </div>

                      <div style={{ textAlign: 'center', padding: '0 10px' }}>
                        <div style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '20px', fontWeight: 900,
                          color: c.textHead, letterSpacing: '-0.02em',
                          lineHeight: 1,
                        }}>
                          {`${scorecardData.gameInfo.awayTeam.score ?? 0} – ${scorecardData.gameInfo.homeTeam.score ?? 0}`}
                        </div>
                      </div>

                      <div style={{ flex: 1, textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: c.textHead, letterSpacing: '0.02em' }}>
                          {scorecardData.gameInfo.homeTeam.abbreviation}
                        </div>
                        <div style={{ fontSize: '9.5px', color: c.textMuted, marginTop: '1px' }}>
                          {`${scorecardData.gameInfo.homeTeam.hits ?? 0}H • ${scorecardData.gameInfo.homeTeam.errors ?? 0}E`}
                        </div>
                      </div>
                    </div>

                    {/* Live Count & Bases (if active/live) */}
                    {scorecardData.gameInfo.liveGameState && (
                      <div style={{
                        display: 'flex', flexDirection: 'column', gap: '8px',
                        padding: '8px', borderRadius: '6px',
                        backgroundColor: isDark ? '#09090b' : '#ffffff',
                        border: `1px solid ${isDark ? '#27272a' : '#e4e0da'}`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          {/* Count: Balls, Strikes, Outs */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Balls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '9px', fontWeight: 800, color: c.textMuted }}>B:</span>
                              <span style={{ fontSize: '12px', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: c.textHead }}>
                                {scorecardData.gameInfo.liveGameState.balls || 0}
                              </span>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {[1, 2, 3].map(dot => (
                                  <span key={dot} style={{
                                    width: '6px', height: '6px', borderRadius: '50%',
                                    backgroundColor: (scorecardData.gameInfo.liveGameState.balls || 0) >= dot ? '#10b981' : (isDark ? '#27272a' : '#e5e7eb'),
                                  }} />
                                ))}
                              </div>
                            </div>

                            {/* Strikes */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '9px', fontWeight: 800, color: c.textMuted }}>S:</span>
                              <span style={{ fontSize: '12px', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: c.textHead }}>
                                {scorecardData.gameInfo.liveGameState.strikes || 0}
                              </span>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {[1, 2].map(dot => (
                                  <span key={dot} style={{
                                    width: '6px', height: '6px', borderRadius: '50%',
                                    backgroundColor: (scorecardData.gameInfo.liveGameState.strikes || 0) >= dot ? '#ef4444' : (isDark ? '#27272a' : '#e5e7eb'),
                                  }} />
                                ))}
                              </div>
                            </div>

                            {/* Outs */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '9px', fontWeight: 800, color: c.textMuted }}>O:</span>
                              <span style={{ fontSize: '12px', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: c.textHead }}>
                                {scorecardData.gameInfo.liveGameState.outs || 0}
                              </span>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {[1, 2].map(dot => (
                                  <span key={dot} style={{
                                    width: '6px', height: '6px', borderRadius: '50%',
                                    backgroundColor: (scorecardData.gameInfo.liveGameState.outs || 0) >= dot ? '#f59e0b' : (isDark ? '#27272a' : '#e5e7eb'),
                                  }} />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Bases Diamond */}
                          <div style={{ width: '22px', height: '22px', position: 'relative', flexShrink: 0 }}>
                            {/* 2B */}
                            <div style={{
                              position: 'absolute', top: '1px', left: '7.5px', width: '7px', height: '7px',
                              transform: 'rotate(45deg)',
                              backgroundColor: scorecardData.gameInfo.liveGameState.onSecond ? '#ef4444' : (isDark ? '#3f3f46' : '#d1d5db'),
                              borderRadius: '1px',
                            }} />
                            {/* 3B */}
                            <div style={{
                              position: 'absolute', top: '7.5px', left: '1px', width: '7px', height: '7px',
                              transform: 'rotate(45deg)',
                              backgroundColor: scorecardData.gameInfo.liveGameState.onThird ? '#ef4444' : (isDark ? '#3f3f46' : '#d1d5db'),
                              borderRadius: '1px',
                            }} />
                            {/* 1B */}
                            <div style={{
                              position: 'absolute', top: '7.5px', left: '14px', width: '7px', height: '7px',
                              transform: 'rotate(45deg)',
                              backgroundColor: scorecardData.gameInfo.liveGameState.onFirst ? '#ef4444' : (isDark ? '#3f3f46' : '#d1d5db'),
                              borderRadius: '1px',
                            }} />
                          </div>
                        </div>

                        {/* Active Batter vs Pitcher Matchup */}
                        {(scorecardData.gameInfo.liveGameState.batterName || scorecardData.gameInfo.liveGameState.pitcherName) && (
                          <div style={{ fontSize: '10px', color: c.textMuted, display: 'flex', flexDirection: 'column', gap: '2px', borderTop: `1px solid ${isDark ? '#1f1f23' : '#f0ede6'}`, paddingTop: '4px' }}>
                            {scorecardData.gameInfo.liveGameState.batterName && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 700, color: c.textHead }}>At Bat:</span>
                                <span style={{ fontWeight: 600, color: c.textMain }}>{scorecardData.gameInfo.liveGameState.batterName}</span>
                              </div>
                            )}
                            {scorecardData.gameInfo.liveGameState.pitcherName && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 700, color: c.textHead }}>Pitching:</span>
                                <span style={{ fontWeight: 600, color: c.textMain }}>{scorecardData.gameInfo.liveGameState.pitcherName}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Share scorecard button */}
                    <button
                      onClick={handleCopyShareLink}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        width: '100%', padding: '6px 10px',
                        borderRadius: '6px', cursor: 'pointer',
                        border: `1px solid ${c.border}`,
                        backgroundColor: isDark ? '#1f1f23' : '#ffffff', color: c.textHead,
                        fontSize: '11px', fontWeight: 600,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Share2 style={{ width: '12px', height: '12px', color: c.accent }} />
                      Share Scorecard Link
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── MODE 2: CUSTOM / LIVE SCOREBOOK ──────────────────────── */}
            {scoringMode === 'live' && scorecardData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Interactive Tap Guide Card */}
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${c.border}`,
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.04)',
                  display: 'flex', flexDirection: 'column', gap: '6px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Edit3 style={{ width: '14px', height: '14px', color: '#3b82f6' }} />
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: c.textHead }}>
                      Direct Cell Scoring
                    </span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: c.textMuted, lineHeight: 1.4 }}>
                    Click or tap any diamond cell on the scorecard graphic to record or edit that at-bat. Click player names or pitcher rows to edit rosters.
                  </div>
                </div>

                {/* Lineup & Game Settings Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    onClick={() => setRosterModalOpen(true)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 10px', borderRadius: '6px',
                      border: `1px solid ${c.border}`, backgroundColor: c.bgCard, color: c.textHead,
                      fontSize: '11.5px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users style={{ width: '14px', height: '14px', color: c.accent }} />
                      <span>Edit Lineups, Teams & Pitchers</span>
                    </div>
                    <ChevronRight style={{ width: '12px', height: '12px', color: c.textMuted }} />
                  </button>

                  <button
                    onClick={handleSaveToLibrary}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 10px', borderRadius: '6px',
                      border: `1px solid ${c.border}`, backgroundColor: c.bgCard, color: c.textHead,
                      fontSize: '11.5px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Save style={{ width: '14px', height: '14px', color: '#10b981' }} />
                      <span>Save Game to Library</span>
                    </div>
                    <Check style={{ width: '12px', height: '12px', color: '#10b981' }} />
                  </button>

                  <button
                    onClick={() => setSavedGamesModalOpen(true)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 10px', borderRadius: '6px',
                      border: `1px solid ${c.border}`, backgroundColor: c.bgCard, color: c.textHead,
                      fontSize: '11.5px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FolderOpen style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                      <span>Saved Library & JSON Backup</span>
                    </div>
                    <ChevronRight style={{ width: '12px', height: '12px', color: c.textMuted }} />
                  </button>

                  {/* Templates row */}
                  <div style={{ marginTop: '2px' }}>
                    <button
                      onClick={handleStartNewBlankGame}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        width: '100%',
                        padding: '7px 8px', borderRadius: '6px',
                        border: `1px solid ${c.border}`, backgroundColor: c.bgInput, color: c.textMain,
                        fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <Plus style={{ width: '13px', height: '13px' }} />
                      <span>New Blank Sheet</span>
                    </button>
                  </div>

                  {/* Pre-populate from Scheduled / Future MLB Matchup */}
                  <div style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${c.border}`,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    display: 'flex', flexDirection: 'column', gap: '8px',
                    marginTop: '4px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: c.textHead }}>
                        Pre-fill from MLB Matchup
                      </span>
                      <span style={{ fontSize: '9px', color: c.textMuted }}>
                        {prefillLoading ? 'Loading…' : `${prefillGames.length} games`}
                      </span>
                    </div>

                    {/* Date Picker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <label style={{ fontSize: '10px', fontWeight: 600, color: c.textMuted }}>Date:</label>
                      <input
                        type="date"
                        value={prefillDate}
                        onChange={(e) => setPrefillDate(e.target.value)}
                        style={{
                          flex: 1, padding: '4px 6px', fontSize: '11px',
                          borderRadius: '4px', border: `1px solid ${c.border}`,
                          backgroundColor: c.bgInput, color: c.textHead,
                        }}
                      />
                    </div>

                    {/* Custom Grouped Games Dropdown */}
                    {prefillGames.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => setPrefillSelectOpen(o => !o)}
                            disabled={prefillLoading || prefillGames.length === 0}
                            style={{
                              width: '100%',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '7px 10px',
                              borderRadius: '6px',
                              border: `1px solid ${c.border}`,
                              backgroundColor: c.bgInput,
                              color: prefillGames.length === 0 ? c.textMuted : c.textMain,
                              fontSize: '11.5px', fontWeight: 500,
                              cursor: prefillGames.length === 0 ? 'default' : 'pointer',
                              textAlign: 'left',
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: '8px' }}>
                              {prefillLoading
                                ? 'Searching games…'
                                : prefillGames.length === 0
                                ? 'No games on this date'
                                : prefillGames.find(g => String(g.gamePk) === String(prefillSelectedGamePk))
                                  ? `${prefillGames.find(g => String(g.gamePk) === String(prefillSelectedGamePk)).awayTeam} @ ${prefillGames.find(g => String(g.gamePk) === String(prefillSelectedGamePk)).homeTeam}`
                                  : 'Select a matchup'}
                            </span>
                            <ChevronDown style={{
                              width: '13px', height: '13px', color: c.textMuted, flexShrink: 0,
                              transition: 'transform 0.15s',
                              transform: prefillSelectOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                            }} />
                          </button>

                          {prefillSelectOpen && prefillGames.length > 0 && (
                            <>
                              <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setPrefillSelectOpen(false)} />
                              <div style={{
                                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                                maxHeight: '260px', overflowY: 'auto',
                                backgroundColor: c.bgCard,
                                border: `1px solid ${c.border}`,
                                borderRadius: '8px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                zIndex: 100,
                                padding: '6px 4px',
                              }}>
                                {(() => {
                                  const liveG = prefillGames.filter(g => g.isLive);
                                  const finalG = prefillGames.filter(g => g.isFinal);
                                  const schedG = prefillGames.filter(g => !g.isLive && !g.isFinal);

                                  const renderPrefillItem = (g) => {
                                    const isSelected = String(g.gamePk) === String(prefillSelectedGamePk);
                                    return (
                                      <button
                                        key={g.gamePk}
                                        onClick={() => {
                                          setPrefillSelectedGamePk(String(g.gamePk));
                                          setPrefillSelectOpen(false);
                                        }}
                                        style={{
                                          display: 'block', width: '100%', padding: '7px 9px',
                                          borderRadius: '5px', border: 'none',
                                          backgroundColor: isSelected ? (isDark ? 'rgba(99,102,241,0.18)' : 'rgba(79,70,229,0.08)') : 'transparent',
                                          textAlign: 'left', cursor: 'pointer',
                                          transition: 'background 0.1s',
                                          marginBottom: '2px',
                                        }}
                                        onMouseEnter={e => {
                                          if (!isSelected) e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                                        }}
                                        onMouseLeave={e => {
                                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                      >
                                        <div style={{
                                          fontSize: '11.5px', fontWeight: 700,
                                          color: isSelected ? c.textHead : c.textMain,
                                          lineHeight: 1.3, wordBreak: 'break-word',
                                        }}>
                                          {g.awayTeam} @ {g.homeTeam}
                                        </div>
                                        <div style={{
                                          fontSize: '10.5px', color: c.textMuted, marginTop: '2px',
                                          display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
                                        }}>
                                          {g.awayScore !== undefined && (
                                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: c.textHead }}>
                                              {g.awayScore} – {g.homeScore}
                                            </span>
                                          )}
                                          <span style={{
                                            fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700,
                                            color: g.isLive ? '#ef4444' : c.textMuted,
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                          }}>
                                            {g.isLive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />}
                                            {g.isLive ? (g.inningText || 'Live') : (g.inningText || g.status || 'Scheduled')}
                                          </span>
                                        </div>
                                        <div style={{ fontSize: '10px', color: c.textMuted, marginTop: '2px', wordBreak: 'break-word' }}>
                                          {g.venue}
                                        </div>
                                      </button>
                                    );
                                  };

                                  return (
                                    <>
                                      {liveG.length > 0 && (
                                        <div style={{ marginBottom: '8px' }}>
                                          <div style={{
                                            fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                                            color: '#ef4444', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '5px',
                                          }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                                            <span>Live & In Progress ({liveG.length})</span>
                                          </div>
                                          {liveG.map(renderPrefillItem)}
                                        </div>
                                      )}

                                      {finalG.length > 0 && (
                                        <div style={{ marginBottom: '8px' }}>
                                          <div style={{
                                            fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                                            color: c.textMuted, padding: '4px 8px',
                                          }}>
                                            Completed Games ({finalG.length})
                                          </div>
                                          {finalG.map(renderPrefillItem)}
                                        </div>
                                      )}

                                      {schedG.length > 0 && (
                                        <div style={{ marginBottom: '4px' }}>
                                          <div style={{
                                            fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                                            color: c.textMuted, padding: '4px 8px',
                                          }}>
                                            Upcoming / Scheduled ({schedG.length})
                                          </div>
                                          {schedG.map(renderPrefillItem)}
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => handleApplyPrefillFromGame(prefillSelectedGamePk)}
                          disabled={!prefillSelectedGamePk || loading}
                          style={{
                            width: '100%', padding: '7px 10px',
                            borderRadius: '6px', cursor: !prefillSelectedGamePk ? 'default' : 'pointer',
                            border: 'none',
                            backgroundColor: c.accent, color: '#ffffff',
                            fontSize: '11px', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                            opacity: !prefillSelectedGamePk || loading ? 0.6 : 1,
                          }}
                        >
                          <Users style={{ width: '13px', height: '13px' }} />
                          Load Matchup Lineup into Scorecard
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '10.5px', color: c.textMuted, textAlign: 'center', padding: '6px 0' }}>
                        {prefillLoading ? 'Searching games for date…' : 'No MLB games found on this date.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Auto calculate stats toggle */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: '6px',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${c.border}`,
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: c.textHead }}>
                      Auto-Calculate Stats
                    </span>
                    <span style={{ fontSize: '9px', color: c.textMuted }}>
                      Updates line scores & pitcher IP automatically
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoCalculateStats}
                    onChange={(e) => setAutoCalculateStats(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STYLE TAB ─────────────────────────────────────────────── */}
        {activeTab === 'style' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* ORIENTATION TOGGLE */}
            <div>
              <div style={{
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: c.textMuted, marginBottom: '8px',
              }}>
                Poster Layout Orientation
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => setOrientation('portrait')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px', borderRadius: '8px', cursor: 'pointer',
                    border: `1.5px solid ${orientation === 'portrait' ? (isDark ? '#6366f1' : '#4f46e5') : c.border}`,
                    backgroundColor: orientation === 'portrait'
                      ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.06)')
                      : c.bgInput,
                    color: orientation === 'portrait' ? c.textHead : c.textMuted,
                    fontWeight: 600, fontSize: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <svg width="13" height="16" viewBox="0 0 14 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="1" width="12" height="16" rx="2" />
                    <line x1="4" y1="5" x2="10" y2="5" />
                    <line x1="4" y1="8" x2="10" y2="8" />
                    <line x1="4" y1="11" x2="10" y2="11" />
                  </svg>
                  Portrait
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px', borderRadius: '8px', cursor: 'pointer',
                    border: `1.5px solid ${orientation === 'landscape' ? (isDark ? '#6366f1' : '#4f46e5') : c.border}`,
                    backgroundColor: orientation === 'landscape'
                      ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.06)')
                      : c.bgInput,
                    color: orientation === 'landscape' ? c.textHead : c.textMuted,
                    fontWeight: 600, fontSize: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <svg width="17" height="13" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="1" width="16" height="12" rx="2" />
                    <line x1="9" y1="4" x2="9" y2="10" />
                  </svg>
                  Landscape
                </button>
              </div>
            </div>

            {/* TYPOGRAPHY FONT STYLE TOGGLE (Right under Orientation) */}
            {(() => {
              const themeFontOverride = theme === 'chalkboard'
                ? { font: 'handwritten', themeName: 'Chalkboard / Dugout Wall' }
                : theme === 'handwritten'
                ? { font: 'handwritten', themeName: 'Handwritten Ballpark' }
                : theme === 'graffiti'
                ? { font: 'graffiti', themeName: 'Graffiti / Street Art' }
                : null;

              const activeEffectiveFont = themeFontOverride ? themeFontOverride.font : fontStyle;

              return (
                <div style={{ paddingTop: '8px', borderTop: `1px solid ${c.border}` }}>
                  <div style={{
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: c.textMuted, marginBottom: '6px',
                  }}>
                    Scorecard Typography Style
                  </div>

                  {themeFontOverride && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      marginBottom: '8px', padding: '5px 8px', borderRadius: '5px',
                      backgroundColor: isDark ? 'rgba(234, 179, 8, 0.12)' : 'rgba(217, 119, 6, 0.08)',
                      border: `1px solid ${isDark ? 'rgba(234, 179, 8, 0.3)' : 'rgba(217, 119, 6, 0.25)'}`,
                      fontSize: '9.5px', fontWeight: 600, color: isDark ? '#fbbf24' : '#b45309',
                    }}>
                      <Lock style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                      <span>Driven by theme: <strong>{themeFontOverride.themeName}</strong></span>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { id: 'modern', label: 'Modern Graphic Print', desc: 'Crisp Oswald & JetBrains Mono' },
                      { id: 'handwritten', label: 'Handwritten Scorebook', desc: 'Authentic pen ink · Unique letter variations' },
                      { id: 'graffiti', label: 'Graffiti & Street Tag', desc: 'Wildstyle spray marker font' },
                    ].map(f_ => {
                      const isSelected = activeEffectiveFont === f_.id;
                      const isLockedByTheme = themeFontOverride && themeFontOverride.font === f_.id;

                      return (
                        <button
                          key={f_.id}
                          onClick={() => {
                            setFontStyle(f_.id);
                            if (themeFontOverride && themeFontOverride.font !== f_.id) {
                              setTheme('team-light');
                              setToastMessage(`Switched to Team Colors theme to apply ${f_.label}`);
                              setTimeout(() => setToastMessage(''), 3500);
                            }
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            width: '100%', padding: '8px 10px',
                            borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                            border: `1.5px solid ${isSelected ? (isDark ? '#6366f1' : '#4f46e5') : c.border}`,
                            backgroundColor: isSelected
                              ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.06)')
                              : c.bgInput,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: c.textHead }}>
                              {f_.label}
                            </div>
                            <div style={{ fontSize: '9px', color: c.textMuted, marginTop: '1px' }}>
                              {f_.desc}
                            </div>
                          </div>

                          {isLockedByTheme ? (
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              fontSize: '8.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                              padding: '2px 6px', borderRadius: '4px',
                              backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : 'rgba(217, 119, 6, 0.15)',
                              color: isDark ? '#fbbf24' : '#b45309',
                              flexShrink: 0,
                            }}>
                              <Lock style={{ width: '9px', height: '9px' }} />
                              <span>LOCKED BY THEME</span>
                            </div>
                          ) : isSelected ? (
                            <div style={{
                              width: '7px', height: '7px', borderRadius: '50%',
                              backgroundColor: isDark ? '#818cf8' : '#4f46e5',
                              flexShrink: 0,
                            }} />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Classic Themes */}
            <div style={{ paddingTop: '8px', borderTop: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: c.textMuted, marginBottom: '2px',
              }}>
                Classic Poster Themes
              </div>
              {POSTER_THEMES.filter(t => t.category === 'Classic Themes').map(t_ => (
                <button
                  key={t_.id}
                  onClick={() => setTheme(t_.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '9px 12px',
                    borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                    border: `1.5px solid ${theme === t_.id ? (isDark ? '#6366f1' : '#4f46e5') : c.border}`,
                    backgroundColor: theme === t_.id
                      ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.06)')
                      : c.bgInput,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                    {t_.swatch.map((color, i) => (
                      <div key={i} style={{
                        width: i === 0 ? '16px' : '9px',
                        height: '24px',
                        borderRadius: '3px',
                        backgroundColor: color,
                        flexShrink: 0,
                      }} />
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: c.textHead }}>
                      {t_.label}
                    </div>
                    <div style={{ fontSize: '9.5px', color: c.textMuted, marginTop: '1px' }}>
                      {t_.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Artistic & Specialty Themes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: c.textMuted, marginBottom: '2px',
              }}>
                Artistic & Specialty Themes
              </div>
              {POSTER_THEMES.filter(t => t.category === 'Artistic & Specialty').map(t_ => (
                <button
                  key={t_.id}
                  onClick={() => setTheme(t_.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '9px 12px',
                    borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                    border: `1.5px solid ${theme === t_.id ? (isDark ? '#6366f1' : '#4f46e5') : c.border}`,
                    backgroundColor: theme === t_.id
                      ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.06)')
                      : c.bgInput,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                    {t_.swatch.map((color, i) => (
                      <div key={i} style={{
                        width: i === 0 ? '16px' : '9px',
                        height: '24px',
                        borderRadius: '3px',
                        backgroundColor: color,
                        flexShrink: 0,
                      }} />
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: c.textHead }}>
                      {t_.label}
                    </div>
                    <div style={{ fontSize: '9.5px', color: c.textMuted, marginTop: '1px' }}>
                      {t_.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* BACKGROUND WATERMARKS & ARTWORK */}
            <div style={{ marginTop: '4px', paddingTop: '12px', borderTop: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: c.textMuted, marginBottom: '2px',
              }}>
                Background Watermarks & Artwork
              </div>

              <button
                onClick={() => setShowTeamWatermarks(!showTeamWatermarks)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '8px 10px',
                  borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                  border: `1.5px solid ${showTeamWatermarks ? (isDark ? '#6366f1' : '#4f46e5') : c.border}`,
                  backgroundColor: showTeamWatermarks
                    ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.06)')
                    : c.bgInput,
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: c.textHead }}>
                    Team Header Watermarks
                  </div>
                  <div style={{ fontSize: '9px', color: c.textMuted, marginTop: '1px' }}>
                    Large team abbreviation watermark behind score hero
                  </div>
                </div>
                <div style={{
                  width: '32px', height: '18px', borderRadius: '10px',
                  backgroundColor: showTeamWatermarks ? (isDark ? '#6366f1' : '#4f46e5') : (isDark ? '#3f3f46' : '#d4d4d8'),
                  position: 'relative', transition: 'all 0.15s ease', flexShrink: 0,
                }}>
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '50%',
                    backgroundColor: '#ffffff', position: 'absolute', top: '2px',
                    left: showTeamWatermarks ? '16px' : '2px',
                    transition: 'left 0.15s ease',
                  }} />
                </div>
              </button>
            </div>

            {/* CUSTOM TEAM COLOR OVERRIDES */}
            <div style={{ marginTop: '4px', paddingTop: '12px', borderTop: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: c.textMuted, marginBottom: '2px',
              }}>
                Custom Team Color Overrides
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: c.textMuted, display: 'block', marginBottom: '4px' }}>Visiting Team Hex</label>
                  <input
                    type="color"
                    value={customAwayColor || '#0e3386'}
                    onChange={(e) => setCustomAwayColor(e.target.value)}
                    style={{ width: '100%', height: '32px', border: `1px solid ${c.border}`, borderRadius: '6px', cursor: 'pointer' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: c.textMuted, display: 'block', marginBottom: '4px' }}>Home Team Hex</label>
                  <input
                    type="color"
                    value={customHomeColor || '#cc3433'}
                    onChange={(e) => setCustomHomeColor(e.target.value)}
                    style={{ width: '100%', height: '32px', border: `1px solid ${c.border}`, borderRadius: '6px', cursor: 'pointer' }}
                  />
                </div>
              </div>
              {(customAwayColor || customHomeColor) && (
                <button
                  onClick={() => { setCustomAwayColor(''); setCustomHomeColor(''); }}
                  style={{
                    fontSize: '10px', color: c.accent, border: 'none', background: 'none',
                    cursor: 'pointer', textAlign: 'left', fontWeight: 600, padding: 0,
                  }}
                >
                  Reset to Official MLB Team Colors
                </button>
              )}
            </div>

          </div>
        )}

        {/* ── DATA TAB ──────────────────────────────────────────────── */}
        {activeTab === 'data' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* ── ADVANCED STATS & STATCAST VISUALIZATIONS ────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: c.textMuted, marginBottom: '2px',
              }}>
                Advanced Stats & Statcast
              </div>

              {[
                { label: 'Statcast Home Run Metrics', desc: 'Exit velocity (MPH), launch angle, distance & pitch info', value: showStatcast, setter: setShowStatcast },
                { label: 'Game Momentum & Lead Progression', desc: 'Inning-by-inning score & lead progression chart', value: showMomentum, setter: setShowMomentum },
                { label: 'Game MVP Highlight Badge', desc: 'Top performer callout badge in game header', value: showMvp, setter: setShowMvp },
                { label: 'Per-Inning Pitch Breakdown', desc: 'Pitches, strikes & balls under each inning', value: showPitchBreakdown, setter: setShowPitchBreakdown },
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => opt.setter(!opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '8px 10px',
                    borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                    border: `1.5px solid ${opt.value ? (isDark ? '#6366f1' : '#4f46e5') : c.border}`,
                    backgroundColor: opt.value
                      ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.06)')
                      : c.bgInput,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: c.textHead }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '9px', color: c.textMuted, marginTop: '1px' }}>
                      {opt.desc}
                    </div>
                  </div>
                  <div style={{
                    width: '32px', height: '18px', borderRadius: '10px',
                    backgroundColor: opt.value ? (isDark ? '#6366f1' : '#4f46e5') : (isDark ? '#3f3f46' : '#d4d4d8'),
                    position: 'relative', transition: 'all 0.15s ease', flexShrink: 0,
                  }}>
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%',
                      backgroundColor: '#ffffff', position: 'absolute', top: '2px',
                      left: opt.value ? '16px' : '2px',
                      transition: 'left 0.15s ease',
                    }} />
                  </div>
                </button>
              ))}
            </div>

            {/* ── SCOREBOOK NOTATION & DETAILS ───────────────────────── */}
            <div style={{ paddingTop: '8px', borderTop: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: c.textMuted, marginBottom: '2px',
              }}>
                Base Path & Scorebook Details
              </div>

              {[
                { label: 'Base Path Extra Event Symbols', desc: 'Stolen bases (SB), Caught stealing (CS), Pickoffs (PO)', value: showExtraEvents, setter: setShowExtraEvents },
                { label: 'Show End-of-Inning Base Advancements', desc: 'Solid lines for bases reached on subsequent plays (off = only own at-bat bases)', value: showEndInningBases, setter: setShowEndInningBases },
                { label: 'Eraser Smudges & Pencil Scribbles', desc: 'Ghosted erased plays & rubber smudges', value: showEraserMarks, setter: setShowEraserMarks },
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => opt.setter(!opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '8px 10px',
                    borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                    border: `1.5px solid ${opt.value ? (isDark ? '#6366f1' : '#4f46e5') : c.border}`,
                    backgroundColor: opt.value
                      ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.06)')
                      : c.bgInput,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: c.textHead }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '9px', color: c.textMuted, marginTop: '1px' }}>
                      {opt.desc}
                    </div>
                  </div>
                  <div style={{
                    width: '32px', height: '18px', borderRadius: '10px',
                    backgroundColor: opt.value ? (isDark ? '#6366f1' : '#4f46e5') : (isDark ? '#3f3f46' : '#d4d4d8'),
                    position: 'relative', transition: 'all 0.15s ease', flexShrink: 0,
                  }}>
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%',
                      backgroundColor: '#ffffff', position: 'absolute', top: '2px',
                      left: opt.value ? '16px' : '2px',
                      transition: 'left 0.15s ease',
                    }} />
                  </div>
                </button>
              ))}
            </div>

            {/* ── MATCH CONTEXT ─────────────────────────────────────── */}
            <div style={{ paddingTop: '8px', borderTop: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: c.textMuted, marginBottom: '2px',
              }}>
                Match Context & Info
              </div>

              {[
                { label: 'Pitcher Decisions (W / L / SV)', desc: 'Winning, losing, and save pitcher badges', value: showDecisions, setter: setShowDecisions },
                { label: 'Weather & Game Conditions', desc: 'Temperature, wind, attendance & duration', value: showEnvironmentBox, setter: setShowEnvironmentBox },
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => opt.setter(!opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '8px 10px',
                    borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                    border: `1.5px solid ${opt.value ? (isDark ? '#6366f1' : '#4f46e5') : c.border}`,
                    backgroundColor: opt.value
                      ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.06)')
                      : c.bgInput,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: c.textHead }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '9px', color: c.textMuted, marginTop: '1px' }}>
                      {opt.desc}
                    </div>
                  </div>
                  <div style={{
                    width: '32px', height: '18px', borderRadius: '10px',
                    backgroundColor: opt.value ? (isDark ? '#6366f1' : '#4f46e5') : (isDark ? '#3f3f46' : '#d4d4d8'),
                    position: 'relative', transition: 'all 0.15s ease', flexShrink: 0,
                  }}>
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%',
                      backgroundColor: '#ffffff', position: 'absolute', top: '2px',
                      left: opt.value ? '16px' : '2px',
                      transition: 'left 0.15s ease',
                    }} />
                  </div>
                </button>
              ))}
            </div>

          </div>
        )}

        {/* ── TEXT TAB ──────────────────────────────────────────────── */}
        {activeTab === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                label: 'Headline / Date Text',
                key: 'headline',
                value: customHeadline,
                setter: setCustomHeadline,
                placeholder: scorecardData ? scorecardData.gameInfo.dateDisplay : 'Date & Headline',
                mono: true,
                rows: 2
              },
              {
                label: 'Subtitle',
                key: 'subtitle',
                value: customSubtitle,
                setter: setCustomSubtitle,
                placeholder: scorecardData ? `${scorecardData.gameInfo.venue} · ${scorecardData.gameInfo.headline}` : 'Venue & Matchup',
                rows: 3
              },
              {
                label: 'Game Notes & Highlights',
                key: 'notes',
                value: customNotes,
                setter: setCustomNotes,
                placeholder: 'Add custom game notes, key plays, weather or manager notes...',
                rows: 3
              },
              {
                label: 'Footer Print Text',
                key: 'footer',
                value: customFooter,
                setter: setCustomFooter,
                placeholder: scorecardData ? `${scorecardData.gameInfo.venue.toUpperCase()} • ${scorecardData.gameInfo.dateDisplay}` : 'Venue & Print Footer',
                rows: 3
              },
            ].map(field => (
              <div key={field.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: c.textMuted,
                  }}>
                    {field.label}
                  </label>
                </div>
                <textarea
                  rows={field.rows}
                  value={field.value}
                  placeholder={field.placeholder}
                  onChange={(e) => field.setter(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: `1px solid ${c.border}`,
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '11.5px',
                    lineHeight: 1.5,
                    fontFamily: field.mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
                    backgroundColor: c.bgInput,
                    color: c.textMain,
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: `${field.rows * 22 + 16}px`,
                  }}
                />
              </div>
            ))}

            <button
              onClick={() => {
                if (scorecardData) {
                  setCustomHeadline(scorecardData.gameInfo.dateDisplay || '');
                  setCustomSubtitle(`${scorecardData.gameInfo.venue || ''} · ${scorecardData.gameInfo.headline || ''}`);
                  setCustomFooter(`${(scorecardData.gameInfo.venue || '').toUpperCase()} • ${scorecardData.gameInfo.dateDisplay || ''}`);
                  setCustomNotes('');
                  setToastMessage('Text fields restored to game defaults!');
                  setTimeout(() => setToastMessage(''), 3500);
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                width: '100%', padding: '7px 10px',
                borderRadius: '6px', cursor: 'pointer',
                border: `1px solid ${c.border}`,
                backgroundColor: c.bgInput, color: c.textHead,
                fontSize: '11px', fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
            >
              <RotateCcw style={{ width: '12px', height: '12px', color: c.accent }} />
              Restore Default Game Text
            </button>
          </div>
        )}

        {/* ── GUIDE TAB ──────────────────────────────────────────────── */}
        {activeTab === 'guide' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <ScoringGuide
              isDark={isDark}
              isPinned={guidePinned}
              onTogglePin={!isMobile ? onTogglePinGuide : null}
            />
          </div>
        )}

        {/* ── GLOBAL RESET BUTTON (BOTTOM OF SIDEBAR) ────────────────── */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: `1px solid ${c.border}` }}>
          <button
            onClick={handleGlobalReset}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              width: '100%', padding: '8px 12px',
              borderRadius: '6px', cursor: 'pointer',
              border: `1px dashed ${c.border}`,
              backgroundColor: 'transparent',
              color: c.textMuted,
              fontSize: '11px', fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.borderColor = '#ef4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = c.textMuted;
              e.currentTarget.style.borderColor = c.border;
            }}
          >
            <RotateCcw style={{ width: '12px', height: '12px' }} />
            Reset All Options to Default
          </button>
        </div>

      </div>
    </aside>
  );
}
