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
  SlidersHorizontal,
  Eye,
  Share2,
  Link2,
  Check,
  Lock,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
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
    id: 'blueprint',
    label: 'Blueprints & Architecture',
    desc: 'Cyan drafting blueprint · White grid lines',
    category: 'Artistic & Specialty',
    swatch: ['#0b2240', '#1976d2', '#00e5ff'],
  },
  {
    id: 'retro70s',
    label: '1970s Retro Scorebook',
    desc: 'Mustard yellow · Rust orange · Topps card retro',
    category: 'Artistic & Specialty',
    swatch: ['#f7f2e4', '#c84b2c', '#d89623'],
  },
  {
    id: 'chalkboard',
    label: 'Chalkboard / Dugout Wall',
    desc: 'Matte slate chalkboard · Off-white chalk text',
    category: 'Artistic & Specialty',
    swatch: ['#1a1e22', '#81d4fa', '#aed581'],
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

  // Theme colors (defined at top so all hooks, effects & helpers access c safely)
  const c = {
    bgBody:           isDark ? '#09090b' : '#f0ede8',
    bgHeader:         isDark ? '#111113' : '#ffffff',
    bgSidebar:        isDark ? '#111113' : '#ffffff',
    bgCanvas:         isDark ? '#1a1a1e' : '#e8e3dc',
    bgInput:          isDark ? '#09090b' : '#f8f8f8',
    bgCard:           isDark ? '#18181c' : '#ffffff',
    border:           isDark ? '#27272a' : '#e4e0da',
    borderFocus:      isDark ? '#52525b' : '#b0a898',
    textMain:         isDark ? '#e4e4e7' : '#1c1917',
    textHead:         isDark ? '#fafafa' : '#0c0a09',
    textMuted:        isDark ? '#71717a' : '#78716c',
    btnPrimary:       isDark ? '#fafafa' : '#1c1917',
    btnPrimaryText:   isDark ? '#09090b' : '#fafafa',
    btnSecondary:     isDark ? '#27272a' : '#e4e0da',
    btnSecondaryText: isDark ? '#e4e4e7' : '#1c1917',
    accent:           isDark ? '#6366f1' : '#4f46e5',
    accentBg:         isDark ? 'rgba(99,102,241,0.15)' : 'rgba(79,70,229,0.08)',
  };
  const [selectedDate, setSelectedDate] = useState(getYesterdayDateString());
  const [availableGames, setAvailableGames] = useState([]);
  const [selectedGamePk, setSelectedGamePk] = useState('');
  const [scorecardData, setScorecardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('game'); // 'game', 'style', 'data', 'text'
  const [theme, setTheme] = useState('team-light');
  const [fontStyle, setFontStyle] = useState('modern'); // 'modern', 'handwritten', 'graffiti'
  const [showEraserMarks, setShowEraserMarks] = useState(false);
  const [eraserSeed, setEraserSeed] = useState(0);
  const [orientation, setOrientation] = useState('portrait'); // 'portrait' or 'landscape'
  const [showPitchBreakdown, setShowPitchBreakdown] = useState(true);
  const [showDecisions, setShowDecisions] = useState(true);
  const [showEnvironmentBox, setShowEnvironmentBox] = useState(true);
  const [showHRDistances, setShowHRDistances] = useState(true);
  const [showEndInningBases, setShowEndInningBases] = useState(true); // default ON: solid lines for end of inning bases
  const [blankMode, setBlankMode] = useState('none'); // 'none', 'prefill' (roster pre-filled), 'full' (empty slots)
  const [userZoomScale, setUserZoomScale] = useState(null); // null = auto fit to page, number = custom scale

  // Advanced Stats & Visual Art Toggles (OFF by default as requested)
  const [showStatcast, setShowStatcast] = useState(false);
  const [showMomentum, setShowMomentum] = useState(false);
  const [showMvp, setShowMvp] = useState(false);
  const [showExtraEvents, setShowExtraEvents] = useState(true);
  const [showTeamWatermarks, setShowTeamWatermarks] = useState(true);
  const [customAwayColor, setCustomAwayColor] = useState('');
  const [customHomeColor, setCustomHomeColor] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [customHeadline, setCustomHeadline] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [customFooter, setCustomFooter] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportQuality, setExportQuality] = useState(4); // 2, 4 (Default 4K High), 6, 8 (Ultra HD 10K Master)
  const [gameSelectOpen, setGameSelectOpen] = useState(false);
  const [rawGameData, setRawGameData] = useState(null);

  // ─── Mobile State ───────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const [mobileView, setMobileView] = useState('preview'); // 'preview' or 'controls'
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [posterHeight, setPosterHeight] = useState(0);

  // ─── Pan & Drag State ───────────────────────────────────────────────────────
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const pinchStartDistRef = useRef(null);
  const pinchStartScaleRef = useRef(null);

  const graphicRef = useRef(null);
  const dateInputRef = useRef(null);
  const mainContainerRef = useRef(null);
  const graphicWrapperRef = useRef(null);
  const headerRef = useRef(null);

  // Sync iOS meta theme-color, html, and body background color with top header background color
  useEffect(() => {
    const lightMeta = document.querySelector('#theme-color-meta-light');
    if (lightMeta) lightMeta.content = c.bgHeader;
    const darkMeta = document.querySelector('#theme-color-meta-dark');
    if (darkMeta) darkMeta.content = c.bgHeader;
    if (typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = c.bgHeader;
      document.body.style.backgroundColor = c.bgHeader;
    }
  }, [c.bgHeader]);

  // Block touch swipe pull-down on top header bar to prevent iOS page rubberbanding
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const preventSwipe = (e) => {
      e.preventDefault();
    };
    el.addEventListener('touchmove', preventSwipe, { passive: false });
    return () => el.removeEventListener('touchmove', preventSwipe);
  }, []);

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
    const updateSize = () => {
      if (mainContainerRef.current) {
        setContainerWidth(mainContainerRef.current.clientWidth);
        setContainerHeight(mainContainerRef.current.clientHeight);
      }
    };
    updateSize();
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(mainContainerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!graphicWrapperRef.current) return;
    const updatePosterHeight = () => {
      const wrapper = graphicWrapperRef.current;
      if (!wrapper) return;
      const child = wrapper.firstElementChild;
      const unscaledH = child ? child.offsetHeight : wrapper.offsetHeight;
      if (unscaledH > 400) {
        setPosterHeight(unscaledH);
      }
    };
    updatePosterHeight();
    const ro = new ResizeObserver(() => updatePosterHeight());
    ro.observe(graphicWrapperRef.current);
    return () => ro.disconnect();
  }, [scorecardData, orientation, theme, fontStyle, activeTab, blankMode]);

  useEffect(() => {
    fetchGamesForDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (selectedGamePk) {
      loadGameData(selectedGamePk);
    }
  }, [selectedGamePk]);

  // ─── URL Permalinks Parsing ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const pDate = params.get('date');
    const pGame = params.get('game');
    const pTheme = params.get('theme');
    const pFont = params.get('font');
    const pOrient = params.get('orient');
    const pNotes = params.get('notes');
    const pHeadline = params.get('headline');
    const pSubtitle = params.get('subtitle');

    if (pDate) setSelectedDate(pDate);
    if (pGame) setSelectedGamePk(pGame);
    if (pTheme) setTheme(pTheme);
    if (pFont) setFontStyle(pFont);
    if (pOrient) setOrientation(pOrient);
    if (pNotes !== null) setCustomNotes(pNotes);
    if (pHeadline !== null) setCustomHeadline(pHeadline);
    if (pSubtitle !== null) setCustomSubtitle(pSubtitle);

    if (params.has('statcast')) setShowStatcast(params.get('statcast') === '1');
    if (params.has('momentum')) setShowMomentum(params.get('momentum') === '1');
    if (params.has('mvp')) setShowMvp(params.get('mvp') === '1');
    if (params.has('extra')) setShowExtraEvents(params.get('extra') === '1');
    if (params.has('endinning')) setShowEndInningBases(params.get('endinning') === '1');
    if (params.has('watermark')) setShowTeamWatermarks(params.get('watermark') === '1');
    if (params.has('blank')) {
      const bVal = params.get('blank');
      setBlankMode(bVal === 'full' ? 'full' : bVal === 'prefill' || bVal === '1' ? 'prefill' : 'none');
    }
  }, []);

  const handleCopyShareLink = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('date', selectedDate);
      if (selectedGamePk) url.searchParams.set('game', selectedGamePk);
      url.searchParams.set('theme', theme);
      url.searchParams.set('font', fontStyle);
      url.searchParams.set('orient', orientation);
      if (customNotes) url.searchParams.set('notes', customNotes);
      if (customHeadline) url.searchParams.set('headline', customHeadline);
      if (customSubtitle) url.searchParams.set('subtitle', customSubtitle);
      url.searchParams.set('statcast', showStatcast ? '1' : '0');
      url.searchParams.set('momentum', showMomentum ? '1' : '0');
      url.searchParams.set('mvp', showMvp ? '1' : '0');
      url.searchParams.set('extra', showExtraEvents ? '1' : '0');
      url.searchParams.set('endinning', showEndInningBases ? '1' : '0');
      url.searchParams.set('watermark', showTeamWatermarks ? '1' : '0');
      if (blankMode !== 'none') url.searchParams.set('blank', blankMode);

      navigator.clipboard.writeText(url.toString());
      setToastMessage('Shareable link copied to clipboard!');
      setTimeout(() => setToastMessage(''), 3500);
    } catch (e) {
      console.error('Copy link failed', e);
    }
  };

  const handleGlobalReset = () => {
    setTheme('team-light');
    setFontStyle('modern');
    setOrientation('portrait');
    setShowEraserMarks(false);
    setEraserSeed(0);
    setShowPitchBreakdown(true);
    setShowDecisions(true);
    setShowEnvironmentBox(true);
    setShowHRDistances(true);
    setShowEndInningBases(true);
    setBlankMode('none');
    setUserZoomScale(null);
    setShowStatcast(false);
    setShowMomentum(false);
    setShowMvp(false);
    setShowExtraEvents(true);
    setShowTeamWatermarks(true);
    setCustomAwayColor('');
    setCustomHomeColor('');

    // Restore textboxes to default game data values instead of leaving them wiped/blank
    if (scorecardData) {
      setCustomHeadline(scorecardData.gameInfo.dateDisplay || '');
      setCustomSubtitle(`${scorecardData.gameInfo.venue || ''} · ${scorecardData.gameInfo.headline || ''}`);
      setCustomFooter(`${(scorecardData.gameInfo.venue || '').toUpperCase()} • ${scorecardData.gameInfo.dateDisplay || ''}`);
    } else {
      setCustomHeadline('');
      setCustomSubtitle('');
      setCustomFooter('');
    }
    setCustomNotes('');

    setToastMessage('All options reset to default game values!');
    setTimeout(() => setToastMessage(''), 3500);
  };

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
      setCustomHeadline(data.gameInfo.dateDisplay || '');
      setCustomSubtitle(`${data.gameInfo.venue || ''} · ${data.gameInfo.headline || ''}`);
      setCustomFooter(`${(data.gameInfo.venue || '').toUpperCase()} • ${data.gameInfo.dateDisplay || ''}`);
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
      console.warn('Export resolution fallback to 4x', err8);
      dataUrl = await toPng(clone, { quality: 1.0, pixelRatio: 4, cacheBust: true });
    }

    document.body.removeChild(wrapper);
    return dataUrl;
  };

  const handleExportPNG = async () => {
    if (!graphicRef.current) return;
    setExporting(true);
    setExportOpen(false);
    try {
      const quality = isMobile ? Math.min(exportQuality, 4) : exportQuality;
      const dataUrl = await captureGraphic(quality);
      if (!dataUrl) return;

      const away = scorecardData?.gameInfo?.awayTeam?.abbreviation || 'AWAY';
      const home = scorecardData?.gameInfo?.homeTeam?.abbreviation || 'HOME';
      const dateSlug = scorecardData?.gameInfo?.dateDisplay?.replace(/\s+/g, '-') || selectedGamePk;
      const filename = `MLB_Scorecard_${away}-vs-${home}_${dateSlug}.png`;

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: 'image/png' });

      if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: filename,
          });
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
          return;
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') return;
        }
      }

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

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
    setExportOpen(false);
    try {
      const isLandscape = orientation === 'landscape';
      const quality = isMobile ? Math.min(exportQuality, 4) : exportQuality;
      const dataUrl = await captureGraphic(quality);
      if (!dataUrl) return;

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
    setExportOpen(false);
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

  const tabStyle = (id) => ({
    padding: isMobile ? '10px 12px' : '7px 14px',
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
    whiteSpace: 'nowrap',
    flex: isMobile ? 1 : 'none',
    textAlign: 'center',
  });

  const isLandscape = orientation === 'landscape';
  const totalInningsCount = Math.max(9, scorecardData?.gameInfo?.totalInnings || 9);
  const posterBaseWidth = isLandscape
    ? Math.max(1360, 1360 + (totalInningsCount - 9) * 90) + 20
    : 940;

  // Calculate true Fit-to-Page scale evaluating both width and height boundaries
  let fitScale = 1;
  const padW = isMobile ? 16 : 48;
  const padH = isMobile ? 16 : 48;
  const availW = containerWidth > 0 ? Math.max(200, containerWidth - padW) : posterBaseWidth;
  const availH = containerHeight > 0 ? Math.max(200, containerHeight - padH) : 800;

  const defaultPosterH = isLandscape ? 940 : 1680;
  const actualPosterHeight = posterHeight > 500 ? posterHeight : defaultPosterH;

  const scaleX = availW / posterBaseWidth;
  const scaleY = availH / actualPosterHeight;

  fitScale = Math.min(1, scaleX, scaleY);
  if (fitScale < 0.15) fitScale = 0.15;

  const activeScale = userZoomScale !== null ? userZoomScale : fitScale;

  // Native Non-Passive Touch & Wheel Controller for 60FPS Mobile Pan & Pinch Zoom
  useEffect(() => {
    const mainEl = mainContainerRef.current;
    if (!mainEl) return;

    // Trackpad Wheel Pinch Zoom (Desktop / Mac)
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomDelta = -e.deltaY * 0.005;
        setUserZoomScale(prev => {
          const base = prev !== null ? prev : fitScale;
          const next = Math.min(3.0, Math.max(0.2, base + zoomDelta));
          return Math.round(next * 100) / 100;
        });
      }
    };

    // Touch Pinch & Pan (Mobile / Tablet)
    let touchStartDist = 0;
    let touchStartScale = 1;
    let touchStartPos = { x: 0, y: 0 };
    let currentPan = { ...panOffset };
    let currentScale = activeScale;
    let isPinching = false;
    let isPanning = false;
    let rafId = null;

    const handleTouchStart = (e) => {
      if (graphicWrapperRef.current) {
        graphicWrapperRef.current.style.transition = 'none';
      }
      if (e.touches.length === 1) {
        isPanning = true;
        isPinching = false;
        touchStartPos = {
          x: e.touches[0].clientX - currentPan.x,
          y: e.touches[0].clientY - currentPan.y,
        };
      } else if (e.touches.length === 2) {
        isPanning = false;
        isPinching = true;
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchStartScale = userZoomScale !== null ? userZoomScale : fitScale;
      }
    };

    const handleTouchMove = (e) => {
      if (isPanning && e.touches.length === 1) {
        e.preventDefault();
        const nextX = e.touches[0].clientX - touchStartPos.x;
        const nextY = e.touches[0].clientY - touchStartPos.y;
        currentPan = { x: nextX, y: nextY };
        if (!rafId) {
          rafId = requestAnimationFrame(() => {
            rafId = null;
            if (graphicWrapperRef.current) {
              graphicWrapperRef.current.style.transform = `translate3d(${currentPan.x}px, ${currentPan.y}px, 0px) scale(${currentScale})`;
            }
          });
        }
      } else if (isPinching && e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (touchStartDist > 0) {
          const ratio = dist / touchStartDist;
          const nextScale = Math.min(3.0, Math.max(0.2, touchStartScale * ratio));
          currentScale = nextScale;
          if (!rafId) {
            rafId = requestAnimationFrame(() => {
              rafId = null;
              if (graphicWrapperRef.current) {
                graphicWrapperRef.current.style.transform = `translate3d(${currentPan.x}px, ${currentPan.y}px, 0px) scale(${nextScale})`;
              }
            });
          }
        }
      }
    };

    const handleTouchEnd = () => {
      if (graphicWrapperRef.current) {
        graphicWrapperRef.current.style.transition = 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)';
      }
      if (isPanning) {
        isPanning = false;
        setPanOffset(currentPan);
      }
      if (isPinching) {
        isPinching = false;
        setUserZoomScale(Math.round(currentScale * 100) / 100);
      }
    };

    mainEl.addEventListener('wheel', handleWheel, { passive: false });
    mainEl.addEventListener('touchstart', handleTouchStart, { passive: false });
    mainEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    mainEl.addEventListener('touchend', handleTouchEnd);
    mainEl.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      mainEl.removeEventListener('wheel', handleWheel);
      mainEl.removeEventListener('touchstart', handleTouchStart);
      mainEl.removeEventListener('touchmove', handleTouchMove);
      mainEl.removeEventListener('touchend', handleTouchEnd);
      mainEl.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [fitScale, activeScale, panOffset, userZoomScale]);

  return (
    <div style={{
      height: '100dvh',
      fontFamily: "'Inter', sans-serif",
      backgroundColor: c.bgHeader,
      color: c.textMain,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Safari Website Tinting Trick - Force Safari to sample the header color for the status bar */}
      <div style={{
        position: 'fixed',
        top: '-100px',
        left: 0,
        right: 0,
        height: '100px',
        backgroundColor: c.bgHeader,
        zIndex: 999,
        pointerEvents: 'none',
      }} />

      {/* ── HEADER BAR ────────────────────────────────────────────────── */}
      <header
        ref={headerRef}
        style={{
          borderBottom: `1px solid ${c.border}`,
          backgroundColor: c.bgHeader,
          paddingLeft: isMobile ? '12px' : '24px',
          paddingRight: isMobile ? '12px' : '24px',
          paddingTop: isMobile ? 'env(safe-area-inset-top, 0px)' : '0px',
          height: isMobile ? 'calc(54px + env(safe-area-inset-top, 0px))' : '54px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxSizing: 'border-box',
          width: '100%',
          position: 'relative',
          zIndex: 50,
        }}
      >
        {/* Logo / Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div>
            <div style={{
              fontWeight: 800, fontSize: isMobile ? '12.5px' : '14px', letterSpacing: '-0.02em',
              color: c.textHead, lineHeight: 1.1, whiteSpace: 'nowrap',
            }}>
              MLB Scorecard Studio
            </div>
            <div style={{ fontSize: isMobile ? '8.5px' : '10px', color: c.textMuted, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
              Scorecard Graphic Art Generator
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '5px' : '8px' }}>

          {/* Desktop-Only Export Dropdown */}
          {!isMobile && (
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
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                    onClick={() => setExportOpen(false)}
                  />
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                    zIndex: 100, minWidth: '220px',
                    backgroundColor: c.bgCard,
                    border: `1px solid ${c.border}`,
                    borderRadius: '8px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    padding: '6px',
                  }}>
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
          )}

          {/* Share Link Button */}
          <button
            onClick={handleCopyShareLink}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: isMobile ? '0' : '0 10px',
              width: isMobile ? '32px' : 'auto',
              height: isMobile ? '32px' : '34px',
              justifyContent: 'center',
              borderRadius: '6px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgCard, color: c.textMain,
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Copy Shareable URL Link"
          >
            <Share2 style={{ width: '13px', height: '13px', color: c.accent }} />
            {!isMobile && 'Share'}
          </button>

          {/* Desktop-Only Zoom & Fit Controls in Header Bar */}
          {!isMobile && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '2px',
              height: '34px',
              backgroundColor: c.bgCard,
              padding: '2px 4px', borderRadius: '6px',
              border: `1px solid ${c.border}`,
            }}>
              <button
                onClick={() => setUserZoomScale(prev => Math.max(0.2, Math.round(((prev !== null ? prev : fitScale) - 0.1) * 100) / 100))}
                title="Zoom Out (-)"
                style={{
                  width: '26px', height: '26px', border: 'none', background: 'none',
                  color: c.textHead, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '4px', opacity: 0.85,
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <ZoomOut style={{ width: '13px', height: '13px' }} />
              </button>
              <button
                onClick={() => { setUserZoomScale(null); setPanOffset({ x: 0, y: 0 }); }}
                title="Click to Reset Fit to Screen"
                style={{
                  height: '26px', padding: '0 6px', border: 'none', background: 'none',
                  color: userZoomScale === null ? c.accent : c.textHead,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                  borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Maximize2 style={{ width: '11px', height: '11px', opacity: 0.8 }} />
                <span>{Math.round(activeScale * 100)}%</span>
              </button>
              <button
                onClick={() => setUserZoomScale(prev => Math.min(3.0, Math.round(((prev !== null ? prev : fitScale) + 0.1) * 100) / 100))}
                title="Zoom In (+)"
                style={{
                  width: '26px', height: '26px', border: 'none', background: 'none',
                  color: c.textHead, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '4px', opacity: 0.85,
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <ZoomIn style={{ width: '13px', height: '13px' }} />
              </button>
            </div>
          )}

          {/* Desktop-Only Reset Defaults Button */}
          {!isMobile && (
            <button
              onClick={handleGlobalReset}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '0 10px', height: '34px', borderRadius: '6px',
                border: `1px solid ${c.border}`,
                backgroundColor: c.bgCard, color: c.textMuted,
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Reset all options to default"
              onMouseEnter={e => e.currentTarget.style.color = c.textHead}
              onMouseLeave={e => e.currentTarget.style.color = c.textMuted}
            >
              <RotateCcw style={{ width: '13px', height: '13px' }} />
              Reset
            </button>
          )}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => setAppTheme(isDark ? 'light' : 'dark')}
            style={{
              width: isMobile ? '32px' : '34px',
              height: isMobile ? '32px' : '34px',
              borderRadius: '6px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgCard, color: c.textMuted,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
            title="Toggle Dark/Light Mode"
          >
            {isDark ? <Sun style={{ width: '14px', height: '14px' }} /> : <Moon style={{ width: '14px', height: '14px' }} />}
          </button>

          {/* GitHub Link (Visible on Desktop and Mobile) */}
          <a
            href="https://github.com/JLeshnick/baseball-scorecard-graphic-generator"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (isMobile) {
                e.preventDefault();
                window.open("https://github.com/JLeshnick/baseball-scorecard-graphic-generator", "_blank");
              }
            }}
            style={{
              width: isMobile ? '32px' : '34px',
              height: isMobile ? '32px' : '34px',
              borderRadius: '6px',
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
        </div>
      </header>


      {/* ── MAIN LAYOUT ─────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        height: isMobile ? 'calc(100dvh - 54px - env(safe-area-inset-top, 0px))' : 'calc(100dvh - 54px)',
        maxHeight: isMobile ? 'calc(100dvh - 54px - env(safe-area-inset-top, 0px))' : 'calc(100dvh - 54px)',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* ── SIDEBAR CONTROLS ──────────────────────────────────────────── */}
        {(!isMobile || mobileView === 'controls') && (
          <aside style={{
            width: isMobile ? '100%' : '280px',
            height: '100%',
            maxHeight: '100%',
            flexShrink: 0,
            backgroundColor: c.bgSidebar,
            borderRight: isMobile ? 'none' : `1px solid ${c.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
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
                { id: 'data', label: 'Data' },
                { id: 'text', label: 'Text' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={tabStyle(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: isMobile ? '16px 16px 90px 16px' : '16px', flex: 1 }}>

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
                            maxHeight: '240px', overflowY: 'auto',
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

                  {/* 3-Way Segmented Control: Scorecard Data Mode */}
                  <div>
                    <label style={{
                      display: 'block', marginBottom: '6px',
                      fontSize: '11px', fontWeight: 600,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: c.textMuted,
                    }}>
                      Scorecard Mode
                    </label>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3px',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      padding: '3px', borderRadius: '8px', border: `1px solid ${c.border}`,
                    }}>
                      {[
                        { id: 'none', label: 'Live Game', sub: 'MLB Plays' },
                        { id: 'prefill', label: 'Partially Filled', sub: 'Blank Sheet' },
                        { id: 'full', label: 'Full Blank', sub: 'Empty Sheet' },
                      ].map(mode => {
                        const active = blankMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => setBlankMode(mode.id)}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                              padding: '6px 2px', borderRadius: '6px', cursor: 'pointer',
                              border: active ? `1px solid ${c.border}` : '1px solid transparent',
                              backgroundColor: active ? c.bgCard : 'transparent',
                              color: active ? c.textHead : c.textMuted,
                              fontWeight: active ? 700 : 500,
                              boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span style={{ fontSize: '10px', lineHeight: 1.2 }}>{mode.label}</span>
                            <span style={{ fontSize: '8.5px', opacity: 0.7, marginTop: '2px', fontFamily: "'Inter', sans-serif" }}>{mode.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Game summary badge */}
                  {scorecardData && !loading && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${c.border}`,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      display: 'flex', flexDirection: 'column', gap: '10px',
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
                            {blankMode !== 'none' ? '—' : `${scorecardData.gameInfo.awayTeam.hits}H • ${scorecardData.gameInfo.awayTeam.errors}E`}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '18px', fontWeight: 900,
                            color: c.textHead, letterSpacing: '-0.02em',
                            lineHeight: 1,
                          }}>
                            {blankMode !== 'none' ? '— vs —' : `${scorecardData.gameInfo.awayTeam.score}–${scorecardData.gameInfo.homeTeam.score}`}
                          </div>
                          <div style={{ fontSize: '9px', color: c.textMuted, marginTop: '2px', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>
                            {blankMode !== 'none' ? (blankMode === 'full' ? 'Full Blank Sheet' : 'Partially Filled Blank') : 'Final'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: c.textHead, letterSpacing: '0.02em' }}>
                            {scorecardData.gameInfo.homeTeam.abbreviation}
                          </div>
                          <div style={{ fontSize: '10px', color: c.textMuted, marginTop: '1px' }}>
                            {blankMode !== 'none' ? '—' : `${scorecardData.gameInfo.homeTeam.hits}H • ${scorecardData.gameInfo.homeTeam.errors}E`}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleCopyShareLink}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          width: '100%', padding: '7px 10px',
                          borderRadius: '6px', cursor: 'pointer',
                          border: `1px solid ${c.border}`,
                          backgroundColor: c.bgInput, color: c.textHead,
                          fontSize: '11.5px', fontWeight: 600,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Share2 style={{ width: '13px', height: '13px', color: c.accent }} />
                        Copy Shareable URL Link
                      </button>
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
                      onClick={() => setShowTeamWatermarks(v => !v)}
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
        )}


        {/* ── CANVAS AREA ───────────────────────────────────────────────── */}
        {(!isMobile || mobileView === 'preview') && (
          <main
            ref={mainContainerRef}
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              setIsDragging(true);
              dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
            }}
            onMouseMove={(e) => {
              if (!isDragging) return;
              setPanOffset({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                setIsDragging(true);
                dragStartRef.current = { x: e.touches[0].clientX - panOffset.x, y: e.touches[0].clientY - panOffset.y };
              } else if (e.touches.length === 2) {
                setIsDragging(false);
                const dist = Math.hypot(
                  e.touches[0].clientX - e.touches[1].clientX,
                  e.touches[0].clientY - e.touches[1].clientY
                );
                pinchStartDistRef.current = dist;
                pinchStartScaleRef.current = userZoomScale !== null ? userZoomScale : fitScale;
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 1 && isDragging) {
                setPanOffset({ x: e.touches[0].clientX - dragStartRef.current.x, y: e.touches[0].clientY - dragStartRef.current.y });
              } else if (e.touches.length === 2 && pinchStartDistRef.current) {
                const dist = Math.hypot(
                  e.touches[0].clientX - e.touches[1].clientX,
                  e.touches[0].clientY - e.touches[1].clientY
                );
                const ratio = dist / pinchStartDistRef.current;
                const nextScale = Math.min(3.0, Math.max(0.2, (pinchStartScaleRef.current || fitScale) * ratio));
                setUserZoomScale(Math.round(nextScale * 100) / 100);
              }
            }}
            onTouchEnd={() => {
              setIsDragging(false);
              pinchStartDistRef.current = null;
            }}
            style={{
              flex: 1,
              height: '100%',
              overflowY: 'auto',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              backgroundColor: c.bgCanvas,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: isMobile ? '12px 12px 100px 12px' : '24px 24px 60px 24px',
              position: 'relative',
              cursor: isDragging ? 'grabbing' : (userZoomScale !== null || activeScale !== fitScale ? 'grab' : 'default'),
              userSelect: isDragging ? 'none' : 'auto',
            }}
          >
            {loading && !scorecardData ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '12px', paddingTop: '100px',
                color: c.textMuted, width: '100%',
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
                maxWidth: '320px', margin: '0 auto',
              }}>
                {error}
              </div>
            ) : (
              <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                overflow: 'visible',
                minHeight: `${actualPosterHeight * activeScale + 40}px`,
                paddingBottom: '60px',
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
                <div
                  ref={graphicWrapperRef}
                  style={{
                    width: `${posterBaseWidth}px`,
                    height: `${actualPosterHeight}px`,
                    transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0px) scale(${activeScale})`,
                    transformOrigin: 'top center',
                    flexShrink: 0,
                    willChange: 'transform',
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
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
                    showEndInningBases={showEndInningBases}
                    showStatcast={showStatcast}
                    showMomentum={showMomentum}
                    showMvp={showMvp}
                    showExtraEvents={showExtraEvents}
                    showTeamWatermarks={showTeamWatermarks}
                    isBlankScorecard={blankMode}
                    customAwayColor={customAwayColor}
                    customHomeColor={customHomeColor}
                  />
                </div>
              </div>
            )}
          </main>
        )}

      </div>

      {/* TOAST NOTIFICATION POPUP */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '8px',
          backgroundColor: isDark ? '#27272a' : '#1c1917',
          color: '#ffffff', padding: '10px 16px', borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)', fontSize: '12px', fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          animation: 'fadeIn 0.2s ease',
        }}>
          <Check style={{ width: '15px', height: '15px', color: '#4ade80' }} />
          {toastMessage}
        </div>
      )}

      {/* ── UNIFIED MOBILE FLOATING DOCK (MOBILE ONLY) ─────────────────── */}
      {isMobile && (
        <>
          {/* Floating Mobile Zoom Pill (Preview Mode Only) */}
          {mobileView === 'preview' && (
            <div style={{
              position: 'fixed', bottom: '76px', left: 0, right: 0,
              zIndex: 45, display: 'flex', justifyContent: 'center', pointerEvents: 'none',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '4px 10px', borderRadius: '24px',
                border: `1px solid ${c.border}`,
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                pointerEvents: 'auto',
              }}>
                <button
                  onClick={() => setUserZoomScale(prev => Math.max(0.2, Math.round(((prev !== null ? prev : fitScale) - 0.1) * 100) / 100))}
                  style={{
                    width: '24px', height: '24px', borderRadius: '50%', border: `1px solid ${c.border}`,
                    backgroundColor: c.bgCard, color: c.textHead, cursor: 'pointer',
                    fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  −
                </button>
                <span style={{ fontSize: '11px', fontWeight: 700, color: c.textHead, minWidth: '40px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}>
                  {Math.round(activeScale * 100)}%
                </span>
                <button
                  onClick={() => setUserZoomScale(prev => Math.min(3.0, Math.round(((prev !== null ? prev : fitScale) + 0.1) * 100) / 100))}
                  style={{
                    width: '24px', height: '24px', borderRadius: '50%', border: `1px solid ${c.border}`,
                    backgroundColor: c.bgCard, color: c.textHead, cursor: 'pointer',
                    fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  +
                </button>
                <div style={{ width: '1px', height: '12px', backgroundColor: c.border, margin: '0 2px' }} />
                <button
                  onClick={() => { setUserZoomScale(null); setPanOffset({ x: 0, y: 0 }); }}
                  style={{
                    padding: '3px 8px', borderRadius: '12px',
                    border: `1px solid ${userZoomScale === null ? (isDark ? '#6366f1' : '#4f46e5') : c.border}`,
                    backgroundColor: userZoomScale === null ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(79,70,229,0.1)') : c.bgCard,
                    color: userZoomScale === null ? c.accent : c.textMuted,
                    cursor: 'pointer', fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase',
                  }}
                >
                  Fit
                </button>
              </div>
            </div>
          )}

          <div style={{
            position: 'fixed', bottom: '20px', left: 0, right: 0,
            zIndex: 40, display: 'flex', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            backgroundColor: isDark ? 'rgba(20,20,24,0.92)' : 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '30px',
            padding: '4px 6px',
            border: `1px solid ${c.border}`,
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            pointerEvents: 'auto',
          }}>
            <button
              onClick={() => setMobileView('preview')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '22px', border: 'none',
                backgroundColor: mobileView === 'preview' ? (isDark ? '#6366f1' : '#4f46e5') : 'transparent',
                color: mobileView === 'preview' ? '#ffffff' : c.textMuted,
                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Eye style={{ width: '14px', height: '14px' }} />
              Scorecard
            </button>
            <button
              onClick={() => setMobileView('controls')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '22px', border: 'none',
                backgroundColor: mobileView === 'controls' ? (isDark ? '#6366f1' : '#4f46e5') : 'transparent',
                color: mobileView === 'controls' ? '#ffffff' : c.textMuted,
                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <SlidersHorizontal style={{ width: '14px', height: '14px' }} />
              Controls
            </button>

            <div style={{ width: '1px', height: '18px', backgroundColor: c.border, margin: '0 2px' }} />

            <button
              onClick={() => setExportOpen(o => !o)}
              disabled={exporting || loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '22px', border: 'none',
                backgroundColor: exportOpen ? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)') : 'transparent',
                color: exportOpen ? c.textHead : c.textMain,
                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: "'Inter', sans-serif",
                opacity: (exporting || loading) ? 0.5 : 1,
              }}
            >
              <Download style={{ width: '14px', height: '14px', color: isDark ? '#818cf8' : '#4f46e5' }} />
              {exporting ? 'Exporting…' : 'Export'}
            </button>
          </div>
        </div>
        </>
      )}

      {/* Mobile Export Popup Modal */}
      {isMobile && exportOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 98, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}
            onClick={() => setExportOpen(false)}
          />
          <div style={{
            position: 'fixed',
            bottom: '76px',
            left: '16px', right: '16px',
            zIndex: 99,
            maxWidth: '360px', margin: '0 auto',
            backgroundColor: c.bgCard,
            border: `1px solid ${c.border}`,
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            padding: '12px',
          }}>
            <div style={{
              padding: '8px 10px',
              borderBottom: `1px solid ${c.border}`,
              marginBottom: '8px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              borderRadius: '8px',
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
                  height: '6px',
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
              { icon: <Download style={{ width: '14px', height: '14px' }} />, label: 'Export PNG Image', action: handleExportPNG },
              { icon: <FileSpreadsheet style={{ width: '14px', height: '14px' }} />, label: 'Export PDF Document', action: handleExportPDF },
              { icon: <FileJson style={{ width: '14px', height: '14px' }} />, label: 'Export Raw Game JSON', action: handleExportRawData, disabled: !rawGameData },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                disabled={item.disabled}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '10px 12px',
                  border: 'none', background: 'none',
                  color: item.disabled ? c.textMuted : c.textMain,
                  fontSize: '13px', fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  cursor: item.disabled ? 'default' : 'pointer',
                  borderRadius: '8px',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                  opacity: item.disabled ? 0.4 : 1,
                  marginBottom: '2px',
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
