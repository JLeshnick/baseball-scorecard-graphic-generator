import React, { useState, useEffect, useRef } from 'react';
import {
  searchGamesByDate,
  fetchGameScorecardData
} from './services/mlbApi';
import ScorecardGraphic from './components/ScorecardGraphic';
import {
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

const getYesterdayDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const POSTER_THEMES = [
  {
    id: 'team-light',
    label: 'Team Colors',
    desc: 'Ivory paper · Team primaries',
    swatch: ['#e8dfc8', '#0e3386', '#c41e3a'],
  },
  {
    id: 'team-dark',
    label: 'Night Game',
    desc: 'Deep navy · Vivid team accents',
    swatch: ['#111622', '#3a80cc', '#f04a5a'],
  },
  {
    id: 'vintage',
    label: 'Vintage Sepia',
    desc: 'Aged parchment · Warm tones',
    swatch: ['#f5eed8', '#3a2010', '#c8922a'],
  },
  {
    id: 'monochrome',
    label: 'Monochrome',
    desc: 'Pure white · Ink black',
    swatch: ['#f9f9f7', '#111111', '#555555'],
  },
];

export default function App() {
  const [appTheme, setAppTheme] = useState('light'); // 'dark' or 'light'
  const [selectedDate, setSelectedDate] = useState(getYesterdayDateString());
  const [availableGames, setAvailableGames] = useState([]);
  const [selectedGamePk, setSelectedGamePk] = useState('');
  const [scorecardData, setScorecardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('game'); // 'game', 'style', 'text'
  const [theme, setTheme] = useState('team-light');
  const [orientation, setOrientation] = useState('portrait'); // 'portrait' or 'landscape'
  const [customHeadline, setCustomHeadline] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [customFooter, setCustomFooter] = useState('');
  const [exporting, setExporting] = useState(false);

  const graphicRef = useRef(null);
  const dateInputRef = useRef(null);

  useEffect(() => {
    fetchGamesForDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (selectedGamePk) {
      loadGameData(selectedGamePk);
    }
  }, [selectedGamePk]);

  useEffect(() => {
    const bg = isDark ? '#09090b' : '#f0ede8';
    document.documentElement.setAttribute('data-theme', appTheme);
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, [appTheme]);

  const fetchGamesForDate = async (dateStr) => {
    setSearching(true);
    setError(null);
    try {
      const games = await searchGamesByDate(dateStr);
      setAvailableGames(games);
      if (games.length > 0) {
        setSelectedGamePk(games[0].gamePk);
      } else {
        setError(`No games found for ${dateStr}. Try another date.`);
        setSelectedGamePk('813049');
      }
    } catch (err) {
      console.error(err);
      setError('Error searching games for this date.');
      setSelectedGamePk('813049');
    } finally {
      setSearching(false);
    }
  };

  const loadGameData = async (gamePk) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGameScorecardData(gamePk);
      setScorecardData(data);
      setCustomHeadline(data.gameInfo.dateDisplay);
      setCustomSubtitle(`${data.gameInfo.venue} · ${data.gameInfo.headline}`);
      setCustomFooter(`${data.gameInfo.dateDisplay} • ${data.gameInfo.venue.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      setError('Could not load MLB game data.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Capture helper: clones the graphic into an off-screen body-level container
   * so html-to-image has no parent flex/overflow context to inherit position from.
   * This is the only reliable way to avoid the "blank left + cutoff right" artifact
   * caused by the element's document offset bleeding into the canvas origin.
   */
  const captureGraphic = async (pixelRatio) => {
    const el = graphicRef.current;
    const isLandscape = orientation === 'landscape';
    const targetWidth = isLandscape ? '1240px' : '920px';

    // Build an isolated off-screen wrapper free from any app layout context
    const wrapper = document.createElement('div');
    wrapper.style.cssText = [
      'position:fixed',
      'top:-99999px',
      'left:-99999px',
      `width:${targetWidth}`,
      'height:auto',
      'overflow:visible',
      'z-index:-1',
      'pointer-events:none',
    ].join(';');

    // Deep-clone the graphic and reset any width/margin constraints
    const clone = el.cloneNode(true);
    clone.style.width = targetWidth;
    clone.style.maxWidth = targetWidth;
    clone.style.margin = '0';

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Two rAFs so the browser fully lays out the clone at target width
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => requestAnimationFrame(r));

    const dataUrl = await toPng(clone, { quality: 0.98, pixelRatio });

    document.body.removeChild(wrapper);
    return dataUrl;
  };

  const handleExportPNG = async () => {
    if (!graphicRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await captureGraphic(3);
      const away = scorecardData?.gameInfo?.awayTeam?.abbreviation || 'AWAY';
      const home = scorecardData?.gameInfo?.homeTeam?.abbreviation || 'HOME';
      const dateSlug = scorecardData?.gameInfo?.dateDisplay?.replace(/\s+/g, '-') || selectedGamePk;
      const link = document.createElement('a');
      link.download = `MLB_Scorecard_${away}-vs-${home}_${dateSlug}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export PNG failed', err);
      alert('Error exporting PNG image.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!graphicRef.current) return;
    setExporting(true);
    try {
      const isLandscape = orientation === 'landscape';
      const dataUrl = await captureGraphic(2);
      const away = scorecardData?.gameInfo?.awayTeam?.abbreviation || 'AWAY';
      const home = scorecardData?.gameInfo?.homeTeam?.abbreviation || 'HOME';
      const dateSlug = scorecardData?.gameInfo?.dateDisplay?.replace(/\s+/g, '-') || selectedGamePk;
      const pdf = new jsPDF(isLandscape ? 'landscape' : 'portrait', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MLB_Scorecard_${away}-vs-${home}_${dateSlug}.pdf`);
    } catch (err) {
      console.error('Export PDF failed', err);
      alert('Error exporting PDF document.');
    } finally {
      setExporting(false);
    }
  };


  const handlePrint = () => window.print();

  const triggerCalendarPicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
    }
  };

  // Theme-adaptive CSS variables
  const isDark = appTheme === 'dark';
  const c = {
    bgBody:    isDark ? '#09090b' : '#f0ede8',
    bgHeader:  isDark ? '#111113' : '#ffffff',
    bgSidebar: isDark ? '#111113' : '#ffffff',
    bgCanvas:  isDark ? '#1a1a1e' : '#e8e3dc',
    bgInput:   isDark ? '#09090b' : '#f8f8f8',
    bgCard:    isDark ? '#18181c' : '#ffffff',
    border:    isDark ? '#27272a' : '#e4e0da',
    borderFocus: isDark ? '#52525b' : '#b0a898',
    textMain:  isDark ? '#e4e4e7' : '#1c1917',
    textHead:  isDark ? '#fafafa' : '#0c0a09',
    textMuted: isDark ? '#71717a' : '#78716c',
    btnPrimary:    isDark ? '#fafafa' : '#1c1917',
    btnPrimaryText: isDark ? '#09090b' : '#fafafa',
    btnSecondary:  isDark ? '#27272a' : '#e4e0da',
    btnSecondaryText: isDark ? '#e4e4e7' : '#1c1917',
  };

  const tabStyle = (id) => ({
    padding: '7px 14px',
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: activeTab === id ? c.textHead : c.textMuted,
    borderBottom: `2px solid ${activeTab === id ? c.btnPrimary : 'transparent'}`,
    transition: 'all 0.15s ease',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif",
      backgroundColor: c.bgBody,
      color: c.textMain,
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── HEADER BAR ────────────────────────────────────────────────── */}
      <header style={{
        borderBottom: `1px solid ${c.border}`,
        backgroundColor: c.bgHeader,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '54px',
        flexShrink: 0,
      }}>
        {/* Logo / Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div>
            <div style={{
              fontWeight: 800, fontSize: '14px', letterSpacing: '-0.02em',
              color: c.textHead, lineHeight: 1.1,
            }}>
              MLB Scorecard Studio
            </div>
            <div style={{ fontSize: '10px', color: c.textMuted, letterSpacing: '0.02em' }}>
              Scorecard Graphic Art Generator
            </div>
          </div>
        </div>

        {/* Action toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleExportPNG}
            disabled={exporting || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '6px', border: 'none',
              backgroundColor: c.btnPrimary, color: c.btnPrimaryText,
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              opacity: (exporting || loading) ? 0.5 : 1,
              transition: 'opacity 0.15s',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.01em',
            }}
          >
            <Download style={{ width: '13px', height: '13px' }} />
            Export PNG
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '6px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgCard, color: c.textMain,
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              opacity: (exporting || loading) ? 0.5 : 1,
              transition: 'opacity 0.15s',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.01em',
            }}
          >
            <FileSpreadsheet style={{ width: '13px', height: '13px' }} />
            PDF
          </button>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '6px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgCard, color: c.textMain,
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Printer style={{ width: '13px', height: '13px' }} />
            Print
          </button>

          <div style={{ width: '1px', height: '20px', backgroundColor: c.border, margin: '0 4px' }} />

          <button
            onClick={() => setAppTheme(isDark ? 'light' : 'dark')}
            style={{
              width: '34px', height: '34px', borderRadius: '6px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgCard, color: c.textMuted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Toggle Dark/Light Mode"
          >
            {isDark ? <Sun style={{ width: '15px', height: '15px' }} /> : <Moon style={{ width: '15px', height: '15px' }} />}
          </button>
        </div>
      </header>


      {/* ── MAIN LAYOUT ─────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
      }}>

        {/* ── SIDEBAR CONTROLS ──────────────────────────────────────────── */}
        <aside style={{
          width: '280px',
          flexShrink: 0,
          backgroundColor: c.bgSidebar,
          borderRight: `1px solid ${c.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}>

          {/* Tab Nav */}
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${c.border}`,
            padding: '0 8px',
            gap: '0',
          }}>
            {[
              { id: 'game', label: 'Game' },
              { id: 'style', label: 'Theme' },
              { id: 'text', label: 'Text' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={tabStyle(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '16px', flex: 1 }}>

            {/* ── GAME TAB ──────────────────────────────────────────────── */}
            {activeTab === 'game' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

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
                        width: '100%', boxSizing: 'border-box',
                        border: `1px solid ${c.border}`,
                        borderRadius: '6px',
                        padding: '8px 36px 8px 10px',
                        fontSize: '12px',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                        backgroundColor: c.bgInput,
                        color: c.textMain,
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={triggerCalendarPicker}
                      style={{
                        position: 'absolute', right: '10px', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none',
                        cursor: 'pointer', color: c.textMuted,
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      <Calendar style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '6px',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: c.textMuted,
                  }}>
                    <span>Select Game</span>
                    {searching && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: c.textMuted }}>
                        <RefreshCw style={{ width: '11px', height: '11px', animation: 'spin 1s linear infinite' }} />
                        Loading…
                      </span>
                    )}
                  </label>
                  <select
                    value={selectedGamePk}
                    onChange={(e) => setSelectedGamePk(e.target.value)}
                    disabled={searching || availableGames.length === 0}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      border: `1px solid ${c.border}`,
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '11.5px',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      backgroundColor: c.bgInput,
                      color: c.textMain,
                      outline: 'none',
                      cursor: 'pointer',
                      opacity: searching ? 0.6 : 1,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 10px center',
                      paddingRight: '32px',
                    }}
                  >
                    {availableGames.map(g => (
                      <option key={g.gamePk} value={g.gamePk}>
                        {g.awayTeam} @ {g.homeTeam} ({g.awayScore ?? '?'}–{g.homeScore ?? '?'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Game summary badge */}
                {scorecardData && !loading && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${c.border}`,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      gap: '8px',
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: c.textHead, letterSpacing: '0.02em' }}>
                          {scorecardData.gameInfo.awayTeam.abbreviation}
                        </div>
                        <div style={{ fontSize: '10px', color: c.textMuted, marginTop: '1px' }}>
                          {scorecardData.gameInfo.awayTeam.hits}H • {scorecardData.gameInfo.awayTeam.errors}E
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '18px', fontWeight: 900,
                          color: c.textHead, letterSpacing: '-0.02em',
                          lineHeight: 1,
                        }}>
                          {scorecardData.gameInfo.awayTeam.score}–{scorecardData.gameInfo.homeTeam.score}
                        </div>
                        <div style={{ fontSize: '9px', color: c.textMuted, marginTop: '2px', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>
                          Final
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: c.textHead, letterSpacing: '0.02em' }}>
                          {scorecardData.gameInfo.homeTeam.abbreviation}
                        </div>
                        <div style={{ fontSize: '10px', color: c.textMuted, marginTop: '1px' }}>
                          {scorecardData.gameInfo.homeTeam.hits}H • {scorecardData.gameInfo.homeTeam.errors}E
                        </div>
                      </div>
                    </div>
                    <div style={{
                      marginTop: '8px', paddingTop: '8px',
                      borderTop: `1px solid ${c.border}`,
                      fontSize: '9.5px', color: c.textMuted,
                      lineHeight: 1.4,
                    }}>
                      {scorecardData.gameInfo.venue}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STYLE TAB ─────────────────────────────────────────────── */}
            {activeTab === 'style' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  fontSize: '11px', fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: c.textMuted, marginBottom: '4px',
                }}>
                  Poster Art Theme
                </div>
                {POSTER_THEMES.map(t_ => (
                  <button
                    key={t_.id}
                    onClick={() => setTheme(t_.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      width: '100%', padding: '10px 12px',
                      borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                      border: `1.5px solid ${theme === t_.id ? (isDark ? '#6366f1' : '#4f46e5') : c.border}`,
                      backgroundColor: theme === t_.id
                        ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.06)')
                        : c.bgInput,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Swatch */}
                    <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                      {t_.swatch.map((color, i) => (
                        <div key={i} style={{
                          width: i === 0 ? '18px' : '10px',
                          height: '28px',
                          borderRadius: '3px',
                          backgroundColor: color,
                          flexShrink: 0,
                        }} />
                      ))}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px', fontWeight: 700,
                        color: c.textHead, letterSpacing: '0.01em',
                      }}>
                        {t_.label}
                      </div>
                      <div style={{ fontSize: '10px', color: c.textMuted, marginTop: '1px' }}>
                        {t_.desc}
                      </div>
                    </div>
                  </button>
                ))}

                {/* ── ORIENTATION TOGGLE ────────────────────────────────────── */}
                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: `1px solid ${c.border}` }}>
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
              </div>
            )}

            {/* ── TEXT TAB ──────────────────────────────────────────────── */}
            {activeTab === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Headline / Date Text', key: 'headline', value: customHeadline, setter: setCustomHeadline, mono: true, rows: 2 },
                  { label: 'Subtitle', key: 'subtitle', value: customSubtitle, setter: setCustomSubtitle, rows: 3 },
                  { label: 'Footer Print Text', key: 'footer', value: customFooter, setter: setCustomFooter, rows: 3 },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{
                      display: 'block', marginBottom: '6px',
                      fontSize: '11px', fontWeight: 600,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: c.textMuted,
                    }}>
                      {field.label}
                    </label>
                    <textarea
                      rows={field.rows}
                      value={field.value}
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
              </div>
            )}

          </div>
        </aside>


        {/* ── CANVAS AREA ───────────────────────────────────────────────── */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: c.bgCanvas,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '32px 24px',
        }}>
          {loading ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '12px', paddingTop: '100px',
              color: c.textMuted,
            }}>
              <RefreshCw style={{ width: '22px', height: '22px', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '12px', fontWeight: 500, margin: 0 }}>
                Fetching MLB Play-by-Play Data…
              </p>
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center', paddingTop: '100px',
              color: '#f87171', fontSize: '12px', fontWeight: 500,
              maxWidth: '320px',
            }}>
              {error}
            </div>
          ) : (
            <ScorecardGraphic
              data={scorecardData}
              theme={theme}
              customHeadline={customHeadline}
              customSubtitle={customSubtitle}
              customFooter={customFooter}
              graphicRef={graphicRef}
              orientation={orientation}
            />
          )}
        </main>

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
