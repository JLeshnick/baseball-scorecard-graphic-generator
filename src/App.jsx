import React, { useState, useEffect, useRef } from 'react';
import {
  searchGamesByDate,
  fetchGameScorecardData
} from './services/mlbApi';
import ScorecardGraphic from './components/ScorecardGraphic';
import {
  Calendar,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Sun,
  Moon,
  ChevronDown,
  FileJson,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

const GithubIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

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
    category: 'Classic Themes',
    swatch: ['#e8dfc8', '#0e3386', '#c41e3a'],
  },
  {
    id: 'team-dark',
    label: 'Night Game',
    desc: 'Deep navy · Vivid team accents',
    category: 'Classic Themes',
    swatch: ['#111622', '#3a80cc', '#f04a5a'],
  },
  {
    id: 'vintage',
    label: 'Vintage Sepia',
    desc: 'Aged parchment · Warm tones',
    category: 'Classic Themes',
    swatch: ['#f5eed8', '#3a2010', '#c8922a'],
  },
  {
    id: 'monochrome',
    label: 'Monochrome',
    desc: 'Pure white · Ink black',
    category: 'Classic Themes',
    swatch: ['#f9f9f7', '#111111', '#555555'],
  },
  {
    id: 'graffiti',
    label: 'Graffiti / Street Art',
    desc: 'Neon spray tag · Dark concrete · Wildstyle font',
    category: 'Artistic & Specialty',
    swatch: ['#0c0d12', '#ff0055', '#00f0ff'],
  },
  {
    id: 'handwritten',
    label: 'Handwritten Ballpark',
    desc: 'Scored by hand · Ballpoint pen ink',
    category: 'Artistic & Specialty',
    swatch: ['#f7f3e9', '#1d4ed8', '#b91c1c'],
  },
];

export default function App() {
  const [appTheme, setAppTheme] = useState('light'); // 'dark' or 'light'
  const isDark = appTheme === 'dark';
  const [selectedDate, setSelectedDate] = useState(getYesterdayDateString());
  const [availableGames, setAvailableGames] = useState([]);
  const [selectedGamePk, setSelectedGamePk] = useState('');
  const [scorecardData, setScorecardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('game'); // 'game', 'style', 'text'
  const [theme, setTheme] = useState('team-light');
  const [fontStyle, setFontStyle] = useState('modern'); // 'modern', 'handwritten', 'graffiti'
  const [showEraserMarks, setShowEraserMarks] = useState(false);
  const [eraserSeed, setEraserSeed] = useState(0);
  const [orientation, setOrientation] = useState('portrait'); // 'portrait' or 'landscape'
  const [showPitchBreakdown, setShowPitchBreakdown] = useState(true);
  const [showDecisions, setShowDecisions] = useState(true);
  const [showEnvironmentBox, setShowEnvironmentBox] = useState(true);
  const [showHRDistances, setShowHRDistances] = useState(true);

  const [customHeadline, setCustomHeadline] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [customFooter, setCustomFooter] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [gameSelectOpen, setGameSelectOpen] = useState(false);
  const [rawGameData, setRawGameData] = useState(null);

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
  }, [appTheme, isDark]);

  const fetchGamesForDate = async (dateStr) => {
    setSearching(true);
    setError(null);
    try {
      const games = await searchGamesByDate(dateStr);
      setAvailableGames(games);
      if (games.length > 0) {
        // Prefer a game with TB (Rays) if available; otherwise pick first
        const TB_NAMES = ['Tampa Bay Rays', 'Tampa Bay'];
        const tbGame = games.find(g =>
          TB_NAMES.some(n => g.awayTeam.includes(n) || g.homeTeam.includes(n))
        );
        setSelectedGamePk((tbGame || games[0]).gamePk);
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
      setRawGameData(data._rawData || null);
      setCustomHeadline(data.gameInfo.dateDisplay);
      setCustomSubtitle(data.gameInfo.venue);

      // Default footer with weather, attendance, and duration
      const footerParts = [
        data.gameInfo.dateDisplay,
        data.gameInfo.venue.toUpperCase(),
        data.gameInfo.weatherStr,
        data.gameInfo.attendance,
        data.gameInfo.durationStr,
      ].filter(Boolean);
      setCustomFooter(footerParts.join(' • '));
    } catch (err) {
      console.error(err);
      setError('Could not load MLB game data.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Capture helper: clones the graphic into an off-screen body-level container
   * at 5x super high resolution for 300+ DPI crisp printing.
   */
  const captureGraphic = async (pixelRatio = 5) => {
    const el = graphicRef.current;
    const isLandscape = orientation === 'landscape';
    const totalInningsCount = Math.max(9, scorecardData?.gameInfo?.totalInnings || 9);
    const targetWidth = isLandscape
      ? `${Math.max(1360, 1360 + (totalInningsCount - 9) * 90)}px`
      : '920px';

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

    const clone = el.cloneNode(true);
    clone.style.width = targetWidth;
    clone.style.maxWidth = targetWidth;
    clone.style.margin = '0';
    clone.style.padding = '0';
    clone.style.boxShadow = 'none';
    clone.style.backgroundColor = 'transparent';

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => requestAnimationFrame(r));

    const dataUrl = await toPng(clone, { quality: 1.0, pixelRatio });

    document.body.removeChild(wrapper);
    return dataUrl;
  };

  const handleExportPNG = async () => {
    if (!graphicRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await captureGraphic(4);
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
      const dataUrl = await captureGraphic(4);
      const away = scorecardData?.gameInfo?.awayTeam?.abbreviation || 'AWAY';
      const home = scorecardData?.gameInfo?.homeTeam?.abbreviation || 'HOME';
      const dateSlug = scorecardData?.gameInfo?.dateDisplay?.replace(/\s+/g, '-') || selectedGamePk;

      const imgProps = new jsPDF().getImageProperties(dataUrl);
      const imgAspect = imgProps.width / imgProps.height;

      // Create a borderless PDF matching the graphic's exact aspect ratio
      const pdfW = isLandscape ? 297 : 210;
      const pdfH = pdfW / imgAspect;

      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfW, pdfH]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`MLB_Scorecard_${away}-vs-${home}_${dateSlug}.pdf`);
    } catch (err) {
      console.error('Export PDF failed', err);
      alert('Error exporting PDF document.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportRawData = () => {
    if (!rawGameData) return;
    const away = scorecardData?.gameInfo?.awayTeam?.abbreviation || 'AWAY';
    const home = scorecardData?.gameInfo?.homeTeam?.abbreviation || 'HOME';
    const dateSlug = scorecardData?.gameInfo?.dateDisplay?.replace(/\s+/g, '-') || selectedGamePk;
    const blob = new Blob([JSON.stringify(rawGameData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `MLB_GameFeed_${away}-vs-${home}_${dateSlug}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const triggerCalendarPicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
    }
  };

  // Theme-adaptive CSS variables
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

          {/* ── EXPORT DROPDOWN ─────────────────────────── */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setExportOpen(o => !o)}
              disabled={exporting || loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 12px', borderRadius: '6px', border: 'none',
                backgroundColor: c.btnPrimary, color: c.btnPrimaryText,
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                opacity: (exporting || loading) ? 0.5 : 1,
                transition: 'opacity 0.15s',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.01em',
              }}
            >
              <Download style={{ width: '13px', height: '13px' }} />
              {exporting ? 'Exporting…' : 'Export'}
              <ChevronDown style={{ width: '11px', height: '11px', marginLeft: '2px', transition: 'transform 0.15s', transform: exportOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {exportOpen && (
              <>
                {/* Backdrop to close dropdown */}
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                  onClick={() => setExportOpen(false)}
                />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  zIndex: 100, minWidth: '180px',
                  backgroundColor: c.bgCard,
                  border: `1px solid ${c.border}`,
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                  padding: '4px',
                }}>
                  {[
                    { icon: <Download style={{ width: '13px', height: '13px' }} />, label: 'Export PNG Image', action: () => { setExportOpen(false); handleExportPNG(); } },
                    { icon: <FileSpreadsheet style={{ width: '13px', height: '13px' }} />, label: 'Export PDF Document', action: () => { setExportOpen(false); handleExportPDF(); } },
                    { icon: <FileJson style={{ width: '13px', height: '13px' }} />, label: 'Export Raw Game JSON', action: () => { setExportOpen(false); handleExportRawData(); }, disabled: !rawGameData },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      disabled={item.disabled}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        width: '100%', padding: '8px 10px',
                        border: 'none', background: 'none',
                        color: item.disabled ? c.textMuted : c.textMain,
                        fontSize: '12px', fontWeight: 500,
                        fontFamily: "'Inter', sans-serif",
                        cursor: item.disabled ? 'default' : 'pointer',
                        borderRadius: '5px',
                        textAlign: 'left',
                        transition: 'background 0.1s',
                        opacity: item.disabled ? 0.4 : 1,
                      }}
                      onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ width: '1px', height: '20px', backgroundColor: c.border, margin: '0 4px' }} />

          {/* GitHub link */}
          <a
            href="https://github.com/JLeshnick/baseball-scorecard-graphic-generator"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '34px', height: '34px', borderRadius: '6px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgCard, color: c.textMuted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            title="View on GitHub"
            onMouseEnter={e => e.currentTarget.style.color = c.textHead}
            onMouseLeave={e => e.currentTarget.style.color = c.textMuted}
          >
            <GithubIcon style={{ width: '15px', height: '15px' }} />
          </a>

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

                {/* ── CUSTOM GAME SELECTOR DROPDOWN ─────────────────── */}
                <div>
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '6px',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: c.textMuted,
                  }}>
                    <span>Select Game ({availableGames.length})</span>
                    {searching && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: c.textMuted }}>
                        <RefreshCw style={{ width: '11px', height: '11px', animation: 'spin 1s linear infinite' }} />
                        Loading…
                      </span>
                    )}
                  </label>

                  <div style={{ position: 'relative' }}>
                    {/* Trigger card button */}
                    <button
                      onClick={() => setGameSelectOpen(o => !o)}
                      disabled={searching || availableGames.length === 0}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        border: `1px solid ${c.border}`,
                        borderRadius: '8px',
                        padding: '10px 12px',
                        backgroundColor: c.bgInput,
                        color: c.textMain,
                        cursor: (searching || availableGames.length === 0) ? 'default' : 'pointer',
                        opacity: searching ? 0.6 : 1,
                        textAlign: 'left',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                        transition: 'border-color 0.15s, background-color 0.15s',
                      }}
                    >
                      {(() => {
                        const selectedGame = availableGames.find(g => String(g.gamePk) === String(selectedGamePk)) || availableGames[0];
                        if (!selectedGame) {
                          return <span style={{ fontSize: '12px', color: c.textMuted }}>No games available</span>;
                        }
                        return (
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '12px', fontWeight: 700, color: c.textHead,
                              lineHeight: 1.3, wordBreak: 'break-word',
                            }}>
                              {selectedGame.awayTeam} @ {selectedGame.homeTeam}
                            </div>
                            <div style={{
                              fontSize: '11px', color: c.textMuted, marginTop: '2px',
                              display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
                            }}>
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: c.textHead }}>
                                {selectedGame.awayScore ?? '?'} – {selectedGame.homeScore ?? '?'}
                              </span>
                              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                                {selectedGame.status || 'Final'}
                              </span>
                            </div>
                            <div style={{ fontSize: '10px', color: c.textMuted, marginTop: '2px', wordBreak: 'break-word' }}>
                              {selectedGame.venue}
                            </div>
                          </div>
                        );
                      })()}
                      <ChevronDown style={{
                        width: '14px', height: '14px', flexShrink: 0, color: c.textMuted,
                        transition: 'transform 0.15s',
                        transform: gameSelectOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }} />
                    </button>

                    {/* Floating Dropdown List */}
                    {gameSelectOpen && availableGames.length > 0 && (
                      <>
                        <div
                          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                          onClick={() => setGameSelectOpen(false)}
                        />
                        <div style={{
                          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                          zIndex: 100, maxHeight: '280px', overflowY: 'auto',
                          backgroundColor: c.bgCard,
                          border: `1px solid ${c.border}`,
                          borderRadius: '8px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                          padding: '4px',
                          display: 'flex', flexDirection: 'column', gap: '4px',
                        }}>
                          {availableGames.map(g => {
                            const isSelected = String(g.gamePk) === String(selectedGamePk);
                            return (
                              <button
                                key={g.gamePk}
                                onClick={() => {
                                  setSelectedGamePk(g.gamePk);
                                  setGameSelectOpen(false);
                                }}
                                style={{
                                  width: '100%', boxSizing: 'border-box',
                                  padding: '9px 10px',
                                  border: `1px solid ${isSelected ? c.btnPrimary : 'transparent'}`,
                                  borderRadius: '6px',
                                  backgroundColor: isSelected
                                    ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)')
                                    : 'transparent',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  transition: 'all 0.1s ease',
                                }}
                                onMouseEnter={e => {
                                  if (!isSelected) e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
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
                                  <span style={{ fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                                    {g.status || 'Final'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '10px', color: c.textMuted, marginTop: '2px', wordBreak: 'break-word' }}>
                                  {g.venue}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Classic Themes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

                {/* ── TYPOGRAPHY FONT STYLE TOGGLE ───────────────────────────── */}
                <div style={{ marginTop: '6px', paddingTop: '12px', borderTop: `1px solid ${c.border}` }}>
                  <div style={{
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: c.textMuted, marginBottom: '8px',
                  }}>
                    Scorecard Typography Style
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { id: 'modern', label: 'Modern Graphic Print', desc: 'Crisp Oswald & JetBrains Mono' },
                      { id: 'handwritten', label: 'Handwritten Scorebook', desc: 'Authentic pen ink · Unique letter variations' },
                      { id: 'graffiti', label: 'Graffiti & Street Tag', desc: 'Wildstyle spray marker font' },
                    ].map(f_ => (
                      <button
                        key={f_.id}
                        onClick={() => setFontStyle(f_.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          width: '100%', padding: '8px 10px',
                          borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                          border: `1.5px solid ${fontStyle === f_.id ? (isDark ? '#6366f1' : '#4f46e5') : c.border}`,
                          backgroundColor: fontStyle === f_.id
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
                        {fontStyle === f_.id && (
                          <div style={{
                            width: '7px', height: '7px', borderRadius: '50%',
                            backgroundColor: isDark ? '#818cf8' : '#4f46e5',
                            flexShrink: 0,
                          }} />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* ── ERASER MARKS TOGGLE ───────────────────────────────────── */}
                  <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button
                      onClick={() => {
                        const next = !showEraserMarks;
                        setShowEraserMarks(next);
                        if (next) setEraserSeed(prev => prev + 1);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '8px 10px',
                        borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                        border: `1.5px solid ${showEraserMarks ? (isDark ? '#6366f1' : '#4f46e5') : c.border}`,
                        backgroundColor: showEraserMarks
                          ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.06)')
                          : c.bgInput,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: c.textHead }}>
                          Eraser Marks & Pencil Scribbles
                        </div>
                        <div style={{ fontSize: '9px', color: c.textMuted, marginTop: '1px' }}>
                          Simulate erased & scratched-out plays on scorebook
                        </div>
                      </div>
                      <div style={{
                        width: '32px', height: '18px', borderRadius: '10px',
                        backgroundColor: showEraserMarks ? (isDark ? '#6366f1' : '#4f46e5') : (isDark ? '#3f3f46' : '#d4d4d8'),
                        position: 'relative', transition: 'all 0.15s ease', flexShrink: 0,
                      }}>
                        <div style={{
                          width: '14px', height: '14px', borderRadius: '50%',
                          backgroundColor: '#ffffff', position: 'absolute', top: '2px',
                          left: showEraserMarks ? '16px' : '2px',
                          transition: 'left 0.15s ease',
                        }} />
                      </div>
                    </button>

                    {showEraserMarks && (
                      <button
                        onClick={() => setEraserSeed(prev => prev + 1)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          width: '100%', padding: '6px 10px',
                          borderRadius: '6px', cursor: 'pointer',
                          border: `1px dashed ${c.border}`,
                          backgroundColor: 'transparent',
                          color: c.textHead,
                          fontSize: '10px', fontWeight: 600,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <RefreshCw style={{ width: '11px', height: '11px' }} />
                        Re-roll Random Eraser & Scribble Spots
                      </button>
                    )}
                  </div>

                  {/* ── DISPLAY OPTIONS & STAT TOGGLES ─────────────────────────── */}
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      fontSize: '11px', fontWeight: 600,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: c.textMuted, marginBottom: '2px',
                    }}>
                      Display Options & Stats
                    </div>

                    {[
                      { label: 'Per-Inning Pitch Breakdown', desc: 'Pitches, strikes & balls under each inning', value: showPitchBreakdown, setter: setShowPitchBreakdown },
                      { label: 'Pitcher Decisions (W / L / SV)', desc: 'Winning, losing, and save pitcher badges', value: showDecisions, setter: setShowDecisions },
                      { label: 'Weather & Game Conditions Box', desc: 'Temperature, wind, attendance & game duration', value: showEnvironmentBox, setter: setShowEnvironmentBox },
                      { label: 'Home Run Distances', desc: 'Distance in feet (e.g. 428\') inside HR cells', value: showHRDistances, setter: setShowHRDistances },
                    ].map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => opt.setter(v => !v)}
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

                {/* ── ORIENTATION TOGGLE ────────────────────────────────────── */}
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: `1px solid ${c.border}` }}>
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
                  { label: 'Game Notes & Highlights', key: 'notes', value: customNotes, setter: setCustomNotes, rows: 3 },
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
          {loading && !scorecardData ? (
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
          ) : error && !scorecardData ? (
            <div style={{
              textAlign: 'center', paddingTop: '100px',
              color: '#f87171', fontSize: '12px', fontWeight: 500,
              maxWidth: '320px',
            }}>
              {error}
            </div>
          ) : (
            <div style={{
              position: 'relative', width: '100%',
              display: 'flex', justifyContent: 'center',
              transition: 'opacity 0.25s ease',
              opacity: loading ? 0.65 : 1,
            }}>
              {loading && (
                <div style={{
                  position: 'fixed', top: '72px', right: '32px', zIndex: 100,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(8px)',
                  padding: '7px 14px', borderRadius: '20px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                  border: `1px solid ${c.border}`,
                  fontSize: '11.5px', fontWeight: 600, color: c.textHead,
                }}>
                  <RefreshCw style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} />
                  Updating Scorecard…
                </div>
              )}
              <ScorecardGraphic
                data={scorecardData}
                theme={theme}
                fontStyle={fontStyle}
                showEraserMarks={showEraserMarks}
                eraserSeed={eraserSeed}
                customHeadline={customHeadline}
                customSubtitle={customSubtitle}
                customFooter={customFooter}
                customNotes={customNotes}
                graphicRef={graphicRef}
                orientation={orientation}
                showPitchBreakdown={showPitchBreakdown}
                showDecisions={showDecisions}
                showEnvironmentBox={showEnvironmentBox}
                showHRDistances={showHRDistances}
              />
            </div>
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
