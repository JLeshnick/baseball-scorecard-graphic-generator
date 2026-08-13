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
  ZoomIn,
  ZoomOut,
  Maximize2,
  SlidersHorizontal,
  Eye,
  Settings,
  Sparkles,
  Check,
  Move,
  Layers,
  Smartphone,
  Monitor,
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
  const [showAtBatDashedLines, setShowAtBatDashedLines] = useState(true);

  const [customHeadline, setCustomHeadline] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [customFooter, setCustomFooter] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportQuality, setExportQuality] = useState(4); // 2, 4 (Default 4K High), 6, 8 (Ultra HD 10K Master)
  const [gameSelectOpen, setGameSelectOpen] = useState(false);
  const [rawGameData, setRawGameData] = useState(null);

  // ─── Mobile & Zoom Layout State ──────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const [mobileView, setMobileView] = useState('preview'); // 'preview' or 'controls'
  const [zoomMode, setZoomMode] = useState('fit'); // 'fit', 1, or custom scale number
  const [containerWidth, setContainerWidth] = useState(0);
  const [posterHeight, setPosterHeight] = useState(0);

  const graphicRef = useRef(null);
  const dateInputRef = useRef(null);
  const mainContainerRef = useRef(null);
  const graphicWrapperRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!mainContainerRef.current) return;
    const updateWidth = () => {
      if (mainContainerRef.current) {
        setContainerWidth(mainContainerRef.current.clientWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(() => updateWidth());
    ro.observe(mainContainerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!graphicWrapperRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) {
        setPosterHeight(entry.contentRect.height);
      }
    });
    ro.observe(graphicWrapperRef.current);
    return () => ro.disconnect();
  }, [scorecardData, orientation, theme, fontStyle]);

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

  const captureGraphic = async (pixelRatio = 8) => {
    const el = graphicRef.current;
    if (!el) return null;
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
    clone.style.webkitFontSmoothing = 'antialiased';
    clone.style.mozOsxFontSmoothing = 'grayscale';
    clone.style.textRendering = 'optimizeLegibility';

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => requestAnimationFrame(r));

    let dataUrl;
    try {
      dataUrl = await toPng(clone, { quality: 1.0, pixelRatio, cacheBust: true });
    } catch (err8) {
      console.warn('8x export resolution fallback to 6x', err8);
      dataUrl = await toPng(clone, { quality: 1.0, pixelRatio: 6, cacheBust: true });
    }

    document.body.removeChild(wrapper);
    return dataUrl;
  };

  const handleExportPNG = async () => {
    if (!graphicRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await captureGraphic(exportQuality);
      const away = scorecardData?.gameInfo?.awayTeam?.abbreviation || 'AWAY';
      const home = scorecardData?.gameInfo?.homeTeam?.abbreviation || 'HOME';
      const dateSlug = scorecardData?.gameInfo?.dateDisplay?.replace(/\s+/g, '-') || selectedGamePk;
      const link = document.createElement('a');
      link.download = `MLB_Scorecard_${away}-vs-${home}_${dateSlug}.png`;
      link.href = dataUrl;
      link.click();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
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
      const dataUrl = await captureGraphic(exportQuality);
      const away = scorecardData?.gameInfo?.awayTeam?.abbreviation || 'AWAY';
      const home = scorecardData?.gameInfo?.homeTeam?.abbreviation || 'HOME';
      const dateSlug = scorecardData?.gameInfo?.dateDisplay?.replace(/\s+/g, '-') || selectedGamePk;

      const imgProps = new jsPDF().getImageProperties(dataUrl);
      const imgAspect = imgProps.width / imgProps.height;

      const pdfW = isLandscape ? 297 : 210;
      const pdfH = pdfW / imgAspect;

      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfW, pdfH]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`MLB_Scorecard_${away}-vs-${home}_${dateSlug}.pdf`);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
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

  // Theme colors
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
    accent: isDark ? '#6366f1' : '#4f46e5',
    accentBg: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(79,70,229,0.08)',
  };

  const tabStyle = (id) => ({
    flex: 1,
    padding: '10px 12px',
    fontSize: isMobile ? '12px' : '11px',
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: activeTab === id ? c.textHead : c.textMuted,
    borderBottom: `2px solid ${activeTab === id ? c.btnPrimary : 'transparent'}`,
    transition: 'all 0.15s ease',
    letterSpacing: '0.02em',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  });

  // Calculate layout widths and poster scaling
  const isLandscape = orientation === 'landscape';
  const totalInningsCount = Math.max(9, scorecardData?.gameInfo?.totalInnings || 9);
  const posterBaseWidth = isLandscape
    ? Math.max(1360, 1360 + (totalInningsCount - 9) * 90) + 20
    : 940;

  let autoFitScale = 1;
  const paddingOffset = isMobile ? 24 : 48;
  if (containerWidth > 0 && containerWidth < posterBaseWidth + paddingOffset) {
    autoFitScale = Math.max(0.18, (containerWidth - paddingOffset) / posterBaseWidth);
  }

  let activeScale = autoFitScale;
  if (zoomMode === 1) {
    activeScale = 1;
  } else if (typeof zoomMode === 'number') {
    activeScale = zoomMode;
  }

  return (
    <div style={{
      minHeight: '100vh',
      height: '100vh',
      fontFamily: "'Inter', sans-serif",
      backgroundColor: c.bgBody,
      color: c.textMain,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ── HEADER BAR ────────────────────────────────────────────────── */}
      <header style={{
        borderBottom: `1px solid ${c.border}`,
        backgroundColor: c.bgHeader,
        padding: isMobile ? '0 12px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '54px',
        flexShrink: 0,
        gap: '8px',
        zIndex: 50,
      }}>
        {/* Logo / Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '6px',
            backgroundColor: isDark ? '#6366f1' : '#4f46e5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', fontWeight: 800, fontSize: '14px', flexShrink: 0,
          }}>
            ⚾
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontWeight: 800, fontSize: isMobile ? '13px' : '14px', letterSpacing: '-0.02em',
              color: c.textHead, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {isMobile ? 'MLB Studio' : 'MLB Scorecard Studio'}
            </div>
            {!isMobile && (
              <div style={{ fontSize: '10px', color: c.textMuted, letterSpacing: '0.02em' }}>
                Scorecard Graphic Art Generator
              </div>
            )}
          </div>
        </div>

        {/* Mobile View Switcher Segmented Toggle */}
        {isMobile && (
          <div style={{
            display: 'flex',
            backgroundColor: isDark ? '#1a1a1e' : '#e8e5df',
            borderRadius: '20px',
            padding: '3px',
            border: `1px solid ${c.border}`,
          }}>
            <button
              onClick={() => setMobileView('preview')}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '16px', border: 'none',
                backgroundColor: mobileView === 'preview' ? c.bgCard : 'transparent',
                color: mobileView === 'preview' ? c.textHead : c.textMuted,
                fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                boxShadow: mobileView === 'preview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Eye style={{ width: '12px', height: '12px' }} />
              Poster
            </button>
            <button
              onClick={() => setMobileView('controls')}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '16px', border: 'none',
                backgroundColor: mobileView === 'controls' ? c.bgCard : 'transparent',
                color: mobileView === 'controls' ? c.textHead : c.textMuted,
                fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                boxShadow: mobileView === 'controls' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <SlidersHorizontal style={{ width: '12px', height: '12px' }} />
              Controls
            </button>
          </div>
        )}

        {/* Action toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

          {/* EXPORT DROPDOWN */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setExportOpen(o => !o)}
              disabled={exporting || loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: isMobile ? '6px 10px' : '7px 12px', borderRadius: '6px', border: 'none',
                backgroundColor: c.btnPrimary, color: c.btnPrimaryText,
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                opacity: (exporting || loading) ? 0.5 : 1,
                transition: 'opacity 0.15s',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.01em',
              }}
            >
              <Download style={{ width: '13px', height: '13px' }} />
              <span>{exporting ? (isMobile ? 'Export…' : 'Exporting…') : 'Export'}</span>
              <ChevronDown style={{ width: '11px', height: '11px', marginLeft: '1px', transition: 'transform 0.15s', transform: exportOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {exportOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                  onClick={() => setExportOpen(false)}
                />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  zIndex: 100, width: isMobile ? '240px' : '220px',
                  backgroundColor: c.bgCard,
                  border: `1px solid ${c.border}`,
                  borderRadius: '8px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                  overflow: 'hidden',
                  padding: '6px',
                }}>
                  {/* Export Quality Box */}
                  <div style={{
                    padding: '8px 10px',
                    borderBottom: `1px solid ${c.border}`,
                    marginBottom: '4px',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderRadius: '6px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.textMuted }}>
                        Export Quality
                      </span>
                      <span style={{
                        fontSize: '9.5px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                        color: exportQuality === 8 ? (isDark ? '#818cf8' : '#4f46e5') : c.textHead,
                        backgroundColor: exportQuality === 8 ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(79,70,229,0.1)') : 'transparent',
                        padding: '1px 5px', borderRadius: '4px',
                      }}>
                        {exportQuality === 8 ? '8x Ultra HD' : exportQuality === 6 ? '6x Super' : exportQuality === 4 ? '4x High' : '2x Standard'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      step="2"
                      value={exportQuality}
                      onChange={(e) => setExportQuality(Number(e.target.value))}
                      style={{
                        width: '100%',
                        accentColor: isDark ? '#6366f1' : '#4f46e5',
                        cursor: 'pointer',
                        height: '4px',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', color: c.textMuted, marginTop: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
                      <span>2x</span>
                      <span>4x</span>
                      <span>6x</span>
                      <span style={{ fontWeight: 800 }}>8x Max</span>
                    </div>
                  </div>

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

          {!isMobile && <div style={{ width: '1px', height: '20px', backgroundColor: c.border, margin: '0 2px' }} />}

          {/* GitHub link */}
          {!isMobile && (
            <a
              href="https://github.com/JLeshnick/baseball-scorecard-graphic-generator"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '32px', height: '32px', borderRadius: '6px',
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
              <GithubIcon style={{ width: '14px', height: '14px' }} />
            </a>
          )}

          <button
            onClick={() => setAppTheme(isDark ? 'light' : 'dark')}
            style={{
              width: '32px', height: '32px', borderRadius: '6px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgCard, color: c.textMuted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Toggle Dark/Light Mode"
          >
            {isDark ? <Sun style={{ width: '14px', height: '14px' }} /> : <Moon style={{ width: '14px', height: '14px' }} />}
          </button>
        </div>
      </header>


      {/* ── MAIN LAYOUT ─────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* ── SIDEBAR CONTROLS ──────────────────────────────────────────── */}
        {(!isMobile || mobileView === 'controls') && (
          <aside style={{
            width: isMobile ? '100%' : '280px',
            flexShrink: 0,
            backgroundColor: c.bgSidebar,
            borderRight: isMobile ? 'none' : `1px solid ${c.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            height: '100%',
            position: isMobile ? 'relative' : 'static',
            zIndex: 10,
          }}>

            {/* Tab Navigation */}
            <div style={{
              display: 'flex',
              borderBottom: `1px solid ${c.border}`,
              padding: '0 4px',
              backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
              position: 'sticky', top: 0, zIndex: 5,
            }}>
              {[
                { id: 'game', label: 'Game' },
                { id: 'style', label: 'Theme' },
                { id: 'data', label: 'Data' },
                { id: 'text', label: 'Text' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={tabStyle(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: isMobile ? '16px 16px 80px 16px' : '16px', flex: 1 }}>

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
                          width: '100%',
                          border: `1px solid ${c.border}`,
                          borderRadius: '6px',
                          padding: '9px 12px',
                          paddingRight: '36px',
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

                  {/* MLB Game selector dropdown */}
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
                          padding: '9px 12px',
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
                            maxHeight: '260px', overflowY: 'auto',
                            backgroundColor: c.bgCard,
                            border: `1px solid ${c.border}`,
                            borderRadius: '8px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                            zIndex: 100,
                            padding: '4px',
                          }}>
                            {availableGames.map((g) => {
                              const isSelected = String(g.gamePk) === String(selectedGamePk);
                              return (
                                <button
                                  key={g.gamePk}
                                  onClick={() => {
                                    setSelectedGamePk(String(g.gamePk));
                                    setGameSelectOpen(false);
                                  }}
                                  style={{
                                    display: 'block', width: '100%', padding: '8px 10px',
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

                  {/* Classic Themes */}
                  <div style={{ paddingTop: '10px', borderTop: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

                  {/* TYPOGRAPHY FONT STYLE TOGGLE */}
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
                  </div>

                  {/* ERASER MARKS & DISPLAY OPTIONS */}
                  <div style={{ marginTop: '6px', paddingTop: '12px', borderTop: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{
                      fontSize: '11px', fontWeight: 600,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: c.textMuted, marginBottom: '2px',
                    }}>
                      Authentic Artifacts & Display
                    </div>

                    <button
                      onClick={() => {
                        setShowEraserMarks(v => !v);
                        if (!showEraserMarks) setEraserSeed(s => s + 1);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '8px 10px',
                        borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                        border: `1px solid ${c.border}`,
                        backgroundColor: showEraserMarks
                          ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.06)')
                          : c.bgInput,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: c.textHead }}>
                          Eraser Smudges & Scribbles
                        </div>
                        <div style={{ fontSize: '9px', color: c.textMuted, marginTop: '1px' }}>
                          Ghosted erased plays & rubber smudges
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

                    {[
                      { key: 'pitch', label: 'Pitch Breakdown Bar', desc: 'Ball / strike & pitch count breakdown', value: showPitchBreakdown, setter: setShowPitchBreakdown },
                      { key: 'decisions', label: 'Pitching Decisions Box', desc: 'Win, Loss, and Save pitchers', value: showDecisions, setter: setShowDecisions },
                      { key: 'env', label: 'Game Environment Box', desc: 'Weather, attendance, & duration', value: showEnvironmentBox, setter: setShowEnvironmentBox },
                      { key: 'hr', label: 'Home Run Distances', desc: 'Show HR distance tags in diamonds', value: showHRDistances, setter: setShowHRDistances },
                      { key: 'dashed', label: 'At-Bat Connector Lines', desc: 'Dashed pitch tracking guides', value: showAtBatDashedLines, setter: setShowAtBatDashedLines },
                    ].map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => opt.setter(v => !v)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          width: '100%', padding: '8px 10px',
                          borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                          border: `1px solid ${c.border}`,
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
                          fontSize: '12px',
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

            {/* Mobile View Toggle Sticky Footer Button */}
            {isMobile && (
              <div style={{
                position: 'fixed', bottom: '16px', left: '16px', right: '16px',
                zIndex: 30, display: 'flex', justifyContent: 'center',
              }}>
                <button
                  onClick={() => setMobileView('preview')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', borderRadius: '30px', border: 'none',
                    backgroundColor: c.accent, color: '#ffffff',
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <Eye style={{ width: '16px', height: '16px' }} />
                  View Scorecard Poster
                </button>
              </div>
            )}
          </aside>
        )}


        {/* ── CANVAS AREA ───────────────────────────────────────────────── */}
        {(!isMobile || mobileView === 'preview') && (
          <main
            ref={mainContainerRef}
            style={{
              flex: 1,
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch',
              backgroundColor: c.bgCanvas,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: isMobile ? '12px 12px 90px 12px' : '20px 24px 40px 24px',
              position: 'relative',
              height: '100%',
            }}
          >
            {/* Poster Zoom Toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: isDark ? 'rgba(17,17,19,0.85)' : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              padding: '5px 10px', borderRadius: '20px',
              border: `1px solid ${c.border}`,
              marginBottom: '14px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              zIndex: 20,
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '10.5px', fontWeight: 600, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '4px' }}>
                Zoom:
              </span>
              <button
                onClick={() => setZoomMode(s => (typeof s === 'number' ? Math.max(0.25, s - 0.15) : Math.max(0.25, autoFitScale - 0.15)))}
                style={{
                  width: '26px', height: '26px', borderRadius: '50%', border: `1px solid ${c.border}`,
                  backgroundColor: c.bgCard, color: c.textMain, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Zoom Out"
              >
                <ZoomOut style={{ width: '13px', height: '13px' }} />
              </button>

              <button
                onClick={() => setZoomMode('fit')}
                style={{
                  padding: '4px 10px', borderRadius: '12px', border: `1px solid ${zoomMode === 'fit' ? c.accent : c.border}`,
                  backgroundColor: zoomMode === 'fit' ? c.accentBg : c.bgCard,
                  color: zoomMode === 'fit' ? (isDark ? '#818cf8' : '#4f46e5') : c.textMain,
                  fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Fit ({Math.round(autoFitScale * 100)}%)
              </button>

              <button
                onClick={() => setZoomMode(1)}
                style={{
                  padding: '4px 10px', borderRadius: '12px', border: `1px solid ${zoomMode === 1 ? c.accent : c.border}`,
                  backgroundColor: zoomMode === 1 ? c.accentBg : c.bgCard,
                  color: zoomMode === 1 ? (isDark ? '#818cf8' : '#4f46e5') : c.textMain,
                  fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                100%
              </button>

              <button
                onClick={() => setZoomMode(s => (typeof s === 'number' ? Math.min(2, s + 0.15) : Math.min(2, autoFitScale + 0.15)))}
                style={{
                  width: '26px', height: '26px', borderRadius: '50%', border: `1px solid ${c.border}`,
                  backgroundColor: c.bgCard, color: c.textMain, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Zoom In"
              >
                <ZoomIn style={{ width: '13px', height: '13px' }} />
              </button>
            </div>

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
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                height: activeScale < 1 && posterHeight > 0 ? `${posterHeight * activeScale + 32}px` : 'auto',
                overflow: activeScale === 1 && posterBaseWidth > containerWidth ? 'auto' : 'visible',
                transition: 'height 0.2s ease',
              }}>
                {loading && (
                  <div style={{
                    position: 'fixed', top: '72px', right: isMobile ? '16px' : '32px', zIndex: 100,
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
                <div
                  ref={graphicWrapperRef}
                  style={{
                    width: `${posterBaseWidth}px`,
                    transform: activeScale !== 1 ? `scale(${activeScale})` : 'none',
                    transformOrigin: 'top center',
                    flexShrink: 0,
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
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
                    showAtBatDashedLines={showAtBatDashedLines}
                  />
                </div>
              </div>
            )}

            {/* Mobile View Preview Sticky Bottom Action Bar */}
            {isMobile && (
              <div style={{
                position: 'fixed', bottom: '16px', left: '16px', right: '16px',
                zIndex: 30, display: 'flex', gap: '10px', justifyContent: 'center',
              }}>
                <button
                  onClick={() => setMobileView('controls')}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '12px 16px', borderRadius: '30px', border: `1px solid ${c.border}`,
                    backgroundColor: c.bgCard, color: c.textHead,
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  }}
                >
                  <SlidersHorizontal style={{ width: '15px', height: '15px' }} />
                  Edit Controls
                </button>
                <button
                  onClick={handleExportPNG}
                  disabled={exporting || loading}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '12px 16px', borderRadius: '30px', border: 'none',
                    backgroundColor: c.btnPrimary, color: c.btnPrimaryText,
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    opacity: (exporting || loading) ? 0.6 : 1,
                  }}
                >
                  <Download style={{ width: '15px', height: '15px' }} />
                  {exporting ? 'Exporting…' : 'Export PNG'}
                </button>
              </div>
            )}
          </main>
        )}

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
