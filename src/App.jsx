import React, { useState, useEffect, useRef } from 'react';
import {
  searchGamesByDate,
  fetchGameScorecardData,
  findMostRecentRaysGame,
} from './services/mlbApi';
import ScorecardGraphic from './components/ScorecardGraphic';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PlayEntryModal from './components/PlayEntryModal';
import RosterEditModal from './components/RosterEditModal';
import SavedGamesModal from './components/SavedGamesModal';
import PitcherEditModal from './components/PitcherEditModal';
import ScoringGuide from './components/ScoringGuide';
import AtBatInspectionModal from './components/AtBatInspectionModal';
import PitcherInspectionModal from './components/PitcherInspectionModal';
import {
  createBlankScorecardData,
  createScorecardFromMlbGame,
  recalculateScorecardStats,
} from './services/scorecardCalculations';
import {
  saveScorecardToStorage,
  autosaveLiveScorecard,
  getAutosavedLiveScorecard,
} from './services/scorecardStorage';
import {
  exportScorecardAsPng,
  exportScorecardAsPdf,
  exportRawGameJson,
} from './services/exportService';
import {
  getTodayDateString,
  getYesterdayDateString,
  getAppThemeColors,
} from './utils/constants';
import { useAppStore } from './store/useAppStore';
import {
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Download,
  FileSpreadsheet,
  FileJson,
  Check,
} from 'lucide-react';

export default function App() {
  // Global Store State & Actions
  const appTheme = useAppStore(s => s.appTheme);
  const setAppTheme = useAppStore(s => s.setAppTheme);
  const theme = useAppStore(s => s.theme);
  const setTheme = useAppStore(s => s.setTheme);
  const fontStyle = useAppStore(s => s.fontStyle);
  const setFontStyle = useAppStore(s => s.setFontStyle);
  const orientation = useAppStore(s => s.orientation);
  const setOrientation = useAppStore(s => s.setOrientation);
  const showEraserMarks = useAppStore(s => s.showEraserMarks);
  const eraserSeed = useAppStore(s => s.eraserSeed);
  const showPitchBreakdown = useAppStore(s => s.showPitchBreakdown);
  const showDecisions = useAppStore(s => s.showDecisions);
  const showEnvironmentBox = useAppStore(s => s.showEnvironmentBox);
  const showHRDistances = useAppStore(s => s.showHRDistances);
  const showEndInningBases = useAppStore(s => s.showEndInningBases);
  const blankMode = useAppStore(s => s.blankMode);
  const setBlankMode = useAppStore(s => s.setBlankMode);
  const showStatcast = useAppStore(s => s.showStatcast);
  const showMomentum = useAppStore(s => s.showMomentum);
  const showMvp = useAppStore(s => s.showMvp);
  const showExtraEvents = useAppStore(s => s.showExtraEvents);
  const showTeamWatermarks = useAppStore(s => s.showTeamWatermarks);
  const customAwayColor = useAppStore(s => s.customAwayColor);
  const setCustomAwayColor = useAppStore(s => s.setCustomAwayColor);
  const customHomeColor = useAppStore(s => s.customHomeColor);
  const setCustomHomeColor = useAppStore(s => s.setCustomHomeColor);
  const customHeadline = useAppStore(s => s.customHeadline);
  const setCustomHeadline = useAppStore(s => s.setCustomHeadline);
  const customSubtitle = useAppStore(s => s.customSubtitle);
  const setCustomSubtitle = useAppStore(s => s.setCustomSubtitle);
  const customFooter = useAppStore(s => s.customFooter);
  const setCustomFooter = useAppStore(s => s.setCustomFooter);
  const customNotes = useAppStore(s => s.customNotes);
  const setCustomNotes = useAppStore(s => s.setCustomNotes);
  const isAdvancedMode = useAppStore(s => s.isAdvancedMode);
  const resetDisplayOptions = useAppStore(s => s.resetDisplayOptions);

  const isDark = appTheme === 'dark';
  const c = getAppThemeColors(isDark);

  // Local Game & App States
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [availableGames, setAvailableGames] = useState([]);
  const [selectedGamePk, setSelectedGamePk] = useState('');
  const [scorecardData, setScorecardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [rawGameData, setRawGameData] = useState(null);
  const [lastRefreshedTime, setLastRefreshedTime] = useState(() => new Date());

  const [activeTab, setActiveTab] = useState('game');
  const [userZoomScale, setUserZoomScale] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportQuality, setExportQuality] = useState(4);
  const [gameSelectOpen, setGameSelectOpen] = useState(false);

  // Scoring Guide States
  const [guidePinned, setGuidePinned] = useState(false);

  // Live Scorebook State
  const [scoringMode, setScoringMode] = useState('mlb');
  const [playModalOpen, setPlayModalOpen] = useState(false);
  const [activeCellContext, setActiveCellContext] = useState(null);
  const [inspectedCell, setInspectedCell] = useState(null);
  const [inspectedPitcher, setInspectedPitcher] = useState(null);
  const [pitcherModalOpen, setPitcherModalOpen] = useState(false);
  const [activePitcherContext, setActivePitcherContext] = useState(null);
  const [rosterModalOpen, setRosterModalOpen] = useState(false);
  const [savedGamesModalOpen, setSavedGamesModalOpen] = useState(false);
  const [liveInning, setLiveInning] = useState(1);
  const [liveHalf, setLiveHalf] = useState('away');
  const [liveBatterIdx, setLiveBatterIdx] = useState(0);
  const [autoCalculateStats, setAutoCalculateStats] = useState(true);

  // Prefill State
  const [prefillDate, setPrefillDate] = useState(getTodayDateString());
  const [prefillGames, setPrefillGames] = useState([]);
  const [prefillSelectedGamePk, setPrefillSelectedGamePk] = useState('');
  const [prefillSelectOpen, setPrefillSelectOpen] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);

  // Responsive & Pan/Zoom State
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const [mobileView, setMobileView] = useState('preview');
  const [mobileInspectionOpen, setMobileInspectionOpen] = useState(false);
  const [mobilePitcherInspectionOpen, setMobilePitcherInspectionOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [posterHeight, setPosterHeight] = useState(0);
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

  // Sync iOS meta theme-color & body bg
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

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const preventSwipe = (e) => e.preventDefault();
    el.addEventListener('touchmove', preventSwipe, { passive: false });
    return () => el.removeEventListener('touchmove', preventSwipe);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
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
    if (!graphicRef.current) return;
    const updatePosterSize = () => {
      if (graphicRef.current) {
        setPosterHeight(graphicRef.current.offsetHeight);
      }
    };
    updatePosterSize();
    const ro = new ResizeObserver(() => updatePosterSize());
    ro.observe(graphicRef.current);
    return () => ro.disconnect();
  }, [scorecardData, orientation, theme]);

  // Initial Load: URL query params or most recent game
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gamePkParam = params.get('gamePk');
    const dateParam = params.get('date');
    const themeParam = params.get('theme');
    const fontParam = params.get('font');
    const orientParam = params.get('orientation');

    if (themeParam) setTheme(themeParam);
    if (fontParam) setFontStyle(fontParam);
    if (orientParam) setOrientation(orientParam);

    const init = async () => {
      if (gamePkParam) {
        setSelectedGamePk(gamePkParam);
        if (dateParam) setSelectedDate(dateParam);
        await loadGameData(gamePkParam);
        if (dateParam) fetchGamesForDate(dateParam);
        return;
      }

      setSearching(true);
      try {
        const fallback = await findMostRecentRaysGame();
        if (fallback) {
          setSelectedDate(fallback.date);
          setSelectedGamePk(String(fallback.gamePk));
          await loadGameData(fallback.gamePk);
          await fetchGamesForDate(fallback.date);
        } else {
          const yest = getYesterdayDateString();
          setSelectedDate(yest);
          await fetchGamesForDate(yest);
        }
      } catch (err) {
        console.error(err);
        const yest = getYesterdayDateString();
        setSelectedDate(yest);
        await fetchGamesForDate(yest);
      } finally {
        setSearching(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedDate && scoringMode === 'mlb') {
      fetchGamesForDate(selectedDate);
    }
  }, [selectedDate, scoringMode]);

  useEffect(() => {
    if (selectedGamePk && scoringMode === 'mlb') {
      loadGameData(selectedGamePk);
    }
  }, [selectedGamePk, scoringMode]);

  const handleCopyShareLink = () => {
    try {
      const url = new URL(window.location.href);
      if (selectedGamePk) url.searchParams.set('gamePk', selectedGamePk);
      if (selectedDate) url.searchParams.set('date', selectedDate);
      if (theme) url.searchParams.set('theme', theme);
      if (fontStyle) url.searchParams.set('font', fontStyle);
      if (orientation) url.searchParams.set('orientation', orientation);
      navigator.clipboard.writeText(url.toString());
      setToastMessage('Shareable link copied to clipboard!');
      setTimeout(() => setToastMessage(''), 3500);
    } catch (e) {
      console.error('Copy link failed', e);
    }
  };

  const handleGlobalReset = () => {
    resetDisplayOptions();
    setUserZoomScale(null);

    if (scoringMode === 'live') {
      const blank = createBlankScorecardData();
      setScorecardData(blank);
      setCustomHeadline(blank.gameInfo.dateDisplay);
      setCustomSubtitle([blank.gameInfo.venue, blank.gameInfo.headline].filter(Boolean).join(' · '));
      setCustomFooter([(blank.gameInfo.venue || '').toUpperCase(), blank.gameInfo.dateDisplay].filter(Boolean).join(' • '));
      setToastMessage('Reset manual scorecard to a clean blank sheet!');
    } else if (scorecardData) {
      setCustomHeadline(scorecardData.gameInfo.dateDisplay || '');
      setCustomSubtitle([scorecardData.gameInfo.venue, scorecardData.gameInfo.headline].filter(Boolean).join(' · '));
      setCustomFooter([(scorecardData.gameInfo.venue || '').toUpperCase(), scorecardData.gameInfo.dateDisplay].filter(Boolean).join(' • '));
      setToastMessage('All options reset to default game values!');
    }
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchGamesForDate = async (dateStr) => {
    setSearching(true);
    setError(null);
    try {
      const games = await searchGamesByDate(dateStr);
      setAvailableGames(games);
      if (games.length > 0) {
        const currentExists = games.find(g => String(g.gamePk) === String(selectedGamePk));
        if (!currentExists) {
          const TB_NAMES = ['Tampa Bay Rays', 'Tampa Bay', 'Rays'];
          const tbGame = games.find(g =>
            TB_NAMES.some(n => g.awayTeam.includes(n) || g.homeTeam.includes(n))
          );
          const firstCompletedOrLive = games.find(g => g.isFinal || g.isLive);
          setSelectedGamePk(String((tbGame || firstCompletedOrLive || games[0]).gamePk));
        }
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

  const loadGameData = async (gamePk, isSilentRefresh = false) => {
    if (!isSilentRefresh) setLoading(true);
    setError(null);
    try {
      const data = await fetchGameScorecardData(gamePk);
      setScorecardData(data);
      setRawGameData(data._rawData || null);
      setLastRefreshedTime(new Date());
      if (!isSilentRefresh) {
        if (!data.gameInfo.isLive && data.gameInfo.lastAtBat) {
          setInspectedCell(data.gameInfo.lastAtBat);
        } else {
          setInspectedCell(null);
        }
        setCustomHeadline(data.gameInfo.dateDisplay || '');
        setCustomSubtitle([data.gameInfo.venue, data.gameInfo.headline].filter(Boolean).join(' · '));
        setCustomFooter([(data.gameInfo.venue || '').toUpperCase(), data.gameInfo.dateDisplay].filter(Boolean).join(' • '));
      }
    } catch (err) {
      console.error(err);
      if (!isSilentRefresh) setError('Could not load MLB game data.');
    } finally {
      if (!isSilentRefresh) setLoading(false);
    }
  };

  // Auto-polling for active live MLB in-progress games (every 30 seconds)
  useEffect(() => {
    if (scoringMode !== 'mlb' || !selectedGamePk || !scorecardData?.gameInfo?.isLive) return;
    const interval = setInterval(() => {
      loadGameData(selectedGamePk, true);
    }, 30000);
    return () => clearInterval(interval);
  }, [scoringMode, selectedGamePk, scorecardData?.gameInfo?.isLive]);

  // Live Scoring Handlers
  const handleStartNewBlankGame = () => {
    const blank = createBlankScorecardData();
    setScorecardData(blank);
    setScoringMode('live');
    setBlankMode('none');
    setInspectedCell(null);
    setLiveInning(1);
    setLiveHalf('away');
    setLiveBatterIdx(0);
    setCustomHeadline(blank.gameInfo.dateDisplay);
    setCustomSubtitle([blank.gameInfo.venue, blank.gameInfo.headline].filter(Boolean).join(' · '));
    setCustomFooter([(blank.gameInfo.venue || '').toUpperCase(), blank.gameInfo.dateDisplay].filter(Boolean).join(' • '));
    setCustomNotes('');
    setToastMessage('Created new blank scorecard!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleStartLiveFromCurrentGame = async () => {
    let sourceData = scorecardData;
    if (!sourceData || sourceData.isLiveScorebook) {
      if (selectedGamePk) {
        try {
          sourceData = await fetchGameScorecardData(selectedGamePk);
        } catch (e) {
          console.warn('Could not fetch game for lineup template', e);
        }
      }
    }
    if (!sourceData) {
      handleStartNewBlankGame();
      return;
    }
    const liveClone = createScorecardFromMlbGame(sourceData);
    setScorecardData(liveClone);
    setScoringMode('live');
    setBlankMode('none');
    setInspectedCell(null);
    setLiveInning(1);
    setLiveHalf('away');
    setLiveBatterIdx(0);
    setCustomHeadline(liveClone.gameInfo.dateDisplay);
    setCustomSubtitle([liveClone.gameInfo.venue, liveClone.gameInfo.headline].filter(Boolean).join(' · '));
    setCustomFooter([(liveClone.gameInfo.venue || '').toUpperCase(), liveClone.gameInfo.dateDisplay].filter(Boolean).join(' • '));
    setCustomNotes('');
    setToastMessage('Pre-filled lineups & teams from MLB game!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchPrefillGamesForDate = async (dateStr) => {
    setPrefillLoading(true);
    try {
      const games = await searchGamesByDate(dateStr);
      setPrefillGames(games);
      if (games && games.length > 0) {
        setPrefillSelectedGamePk(String(games[0].gamePk));
      } else {
        setPrefillSelectedGamePk('');
      }
    } catch (e) {
      console.error(e);
      setPrefillGames([]);
    } finally {
      setPrefillLoading(false);
    }
  };

  useEffect(() => {
    fetchPrefillGamesForDate(prefillDate);
  }, [prefillDate]);

  const handleApplyPrefillFromGame = async (gamePk) => {
    if (!gamePk) return;
    setLoading(true);
    try {
      const fetched = await fetchGameScorecardData(gamePk);
      const liveClone = createScorecardFromMlbGame(fetched);
      setScorecardData(liveClone);
      setScoringMode('live');
      setBlankMode('none');
      setInspectedCell(null);
      setLiveInning(1);
      setLiveHalf('away');
      setLiveBatterIdx(0);
      setCustomHeadline(liveClone.gameInfo.dateDisplay);
      setCustomSubtitle([liveClone.gameInfo.venue, liveClone.gameInfo.headline].filter(Boolean).join(' · '));
      setCustomFooter([(liveClone.gameInfo.venue || '').toUpperCase(), liveClone.gameInfo.dateDisplay].filter(Boolean).join(' • '));
      setCustomNotes('');
      setToastMessage(`Loaded: ${liveClone.gameInfo.awayTeam.name} @ ${liveClone.gameInfo.homeTeam.name}!`);
      setTimeout(() => setToastMessage(''), 3500);
    } catch (e) {
      console.error(e);
      setToastMessage('Could not load matchup rosters.');
      setTimeout(() => setToastMessage(''), 3500);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (cellCtx) => {
    if (scoringMode === 'live') {
      setActiveCellContext(cellCtx);
      setPlayModalOpen(true);
    } else {
      // In MLB mode: select/toggle at-bat to inspect pitch sequence and strike zone
      setActiveTab('game');
      setInspectedPitcher(null);
      setInspectedCell(prev => (prev?.cellKey === cellCtx.cellKey ? null : cellCtx));
      if (isMobile) {
        setMobileInspectionOpen(true);
      }
    }
  };

  const handleBatterClick = () => {
    setRosterModalOpen(true);
  };

  const handlePitcherClick = (pitcherCtx) => {
    if (scoringMode === 'live') {
      setActivePitcherContext(pitcherCtx);
      setPitcherModalOpen(true);
    } else {
      // In MLB mode: select/toggle pitcher performance to inspect pitches & hits by inning!
      setActiveTab('game');
      setInspectedCell(null);
      setInspectedPitcher(prev => {
        if (prev?.pitcher?.id === pitcherCtx.pitcher?.id && prev?.inning === pitcherCtx.inning) {
          return null;
        }
        return pitcherCtx;
      });
      if (isMobile) {
        setMobilePitcherInspectionOpen(true);
      }
    }
  };

  const handleSavePitcher = ({ teamKey, pitcherIndex, updatedPitcher, isDelete }) => {
    if (!scorecardData) return;
    const nextData = JSON.parse(JSON.stringify(scorecardData));
    const targetTeam = teamKey === 'away' ? nextData.awayData : nextData.homeData;
    if (!targetTeam.pitchers) targetTeam.pitchers = [];

    if (isDelete && pitcherIndex != null && pitcherIndex >= 0) {
      targetTeam.pitchers.splice(pitcherIndex, 1);
    } else if (pitcherIndex === -1 || pitcherIndex == null || pitcherIndex >= targetTeam.pitchers.length) {
      targetTeam.pitchers.push(updatedPitcher);
    } else {
      targetTeam.pitchers[pitcherIndex] = updatedPitcher;
    }

    const calculated = autoCalculateStats ? recalculateScorecardStats(nextData) : nextData;
    setScorecardData(calculated);
    autosaveLiveScorecard(calculated);
    if (isDelete) {
      setToastMessage('Deleted relief pitcher');
    } else {
      setToastMessage(`Saved stats for #${updatedPitcher.number} ${updatedPitcher.name}`);
    }
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleSavePlay = (playObj, autoAdvance = false) => {
    if (!activeCellContext || !scorecardData) return;

    const { teamKey, batterIndex, inning } = activeCellContext;
    const nextData = JSON.parse(JSON.stringify(scorecardData));
    const targetTeam = teamKey === 'away' ? nextData.awayData : nextData.homeData;

    if (targetTeam && targetTeam.batters && targetTeam.batters[batterIndex]) {
      if (!targetTeam.batters[batterIndex].plays) {
        targetTeam.batters[batterIndex].plays = {};
      }
      targetTeam.batters[batterIndex].plays[inning] = playObj;
    }

    const calculated = autoCalculateStats ? recalculateScorecardStats(nextData) : nextData;
    setScorecardData(calculated);
    autosaveLiveScorecard(calculated);

    if (autoAdvance) {
      const nextBatterIdx = (batterIndex + 1) % 9;
      const nextInning = inning;
      const nextTeamKey = teamKey;

      const nextTeamData = nextTeamKey === 'away' ? calculated.awayData : calculated.homeData;
      const nextBatter = nextTeamData.batters[nextBatterIdx];
      const nextPlay = nextBatter?.plays?.[nextInning] || null;

      const nextCtx = {
        teamKey: nextTeamKey,
        teamName: nextTeamKey === 'away' ? calculated.gameInfo.awayTeam.name : calculated.gameInfo.homeTeam.name,
        batterIndex: nextBatterIdx,
        batter: nextBatter,
        inning: nextInning,
        currentPlay: nextPlay,
        cellKey: `${nextBatter.id}_${nextInning}`,
      };

      setActiveCellContext(nextCtx);
      setLiveBatterIdx(nextBatterIdx);
      setLiveInning(nextInning);
      setLiveHalf(nextTeamKey);
      setToastMessage(`Saved! Now scoring: #${nextBatter.jerseyNumber} ${nextBatter.name}`);
      setTimeout(() => setToastMessage(''), 2500);
    } else {
      setPlayModalOpen(false);
      setActiveCellContext(null);
      setToastMessage(`Play saved: ${playObj.code}`);
      setTimeout(() => setToastMessage(''), 2500);
    }
  };

  const handleClearPlay = () => {
    if (!activeCellContext || !scorecardData) return;
    const { teamKey, batterIndex, inning } = activeCellContext;
    const nextData = JSON.parse(JSON.stringify(scorecardData));
    const targetTeam = teamKey === 'away' ? nextData.awayData : nextData.homeData;

    if (targetTeam && targetTeam.batters && targetTeam.batters[batterIndex]?.plays) {
      delete targetTeam.batters[batterIndex].plays[inning];
    }

    const calculated = autoCalculateStats ? recalculateScorecardStats(nextData) : nextData;
    setScorecardData(calculated);
    autosaveLiveScorecard(calculated);
    setPlayModalOpen(false);
    setActiveCellContext(null);
    setToastMessage('Play cleared from scorecard');
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleSaveToLibrary = () => {
    if (!scorecardData) return;
    const ok = saveScorecardToStorage(scorecardData);
    if (ok) {
      setToastMessage('Scorecard successfully saved to your library!');
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  const handleSaveScorecardDataFromRoster = (updatedData) => {
    const calculated = autoCalculateStats ? recalculateScorecardStats(updatedData) : updatedData;
    setScorecardData(calculated);
    autosaveLiveScorecard(calculated);
    setToastMessage('Teams and rosters updated!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Export Handlers
  const handleExportPNG = async () => {
    if (!graphicRef.current) return;
    setExporting(true);
    setExportOpen(false);
    try {
      await exportScorecardAsPng({
        graphicEl: graphicRef.current,
        scorecardData,
        selectedGamePk,
        orientation,
        exportQuality,
        isMobile,
      });
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
      await exportScorecardAsPdf({
        graphicEl: graphicRef.current,
        scorecardData,
        selectedGamePk,
        orientation,
        exportQuality,
        isMobile,
      });
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
    exportRawGameJson(rawGameData, scorecardData, selectedGamePk);
  };

  const triggerCalendarPicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
    }
  };

  const tabStyle = (id) => ({
    padding: isMobile ? '10px 6px' : '8px 6px',
    fontSize: isMobile ? '11.5px' : '11px',
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: activeTab === id ? c.textHead : c.textMuted,
    borderBottom: `2px solid ${activeTab === id ? c.btnPrimary : 'transparent'}`,
    transition: 'all 0.15s ease',
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
    flex: 1,
    textAlign: 'center',
  });

  const isLandscape = orientation === 'landscape';
  const totalInningsCount = Math.max(9, scorecardData?.gameInfo?.totalInnings || 9);
  const posterBaseWidth = isLandscape
    ? Math.max(1360, 1360 + (totalInningsCount - 9) * 90) + 20
    : 940;

  // Fit scale calculation
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

  // Touch and Trackpad Wheel Controller
  useEffect(() => {
    const mainEl = mainContainerRef.current;
    if (!mainEl) return;

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
      {/* Safari Tinting Header Bar Background */}
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
      <Header
        headerRef={headerRef}
        c={c}
        isDark={isDark}
        isMobile={isMobile}
        exporting={exporting}
        loading={loading}
        exportOpen={exportOpen}
        setExportOpen={setExportOpen}
        exportQuality={exportQuality}
        setExportQuality={setExportQuality}
        rawGameData={rawGameData}
        handleExportPNG={handleExportPNG}
        handleExportPDF={handleExportPDF}
        handleExportRawData={handleExportRawData}
        handleCopyShareLink={handleCopyShareLink}
        userZoomScale={userZoomScale}
        setUserZoomScale={setUserZoomScale}
        setPanOffset={setPanOffset}
        fitScale={fitScale}
        activeScale={activeScale}
        handleGlobalReset={handleGlobalReset}
        setAppTheme={setAppTheme}
      />

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
        <Sidebar
          isMobile={isMobile}
          mobileView={mobileView}
          c={c}
          isDark={isDark}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabStyle={tabStyle}
          scoringMode={scoringMode}
          setScoringMode={setScoringMode}
          setBlankMode={setBlankMode}
          selectedGamePk={selectedGamePk}
          setSelectedGamePk={setSelectedGamePk}
          loadGameData={loadGameData}
          scorecardData={scorecardData}
          handleStartNewBlankGame={handleStartNewBlankGame}
          handleStartLiveFromCurrentGame={handleStartLiveFromCurrentGame}
          dateInputRef={dateInputRef}
          selectedDate={selectedDate}
          triggerCalendarPicker={triggerCalendarPicker}
          setSelectedDate={setSelectedDate}
          availableGames={availableGames}
          searching={searching}
          gameSelectOpen={gameSelectOpen}
          setGameSelectOpen={setGameSelectOpen}
          lastRefreshedTime={lastRefreshedTime}
          loading={loading}
          setToastMessage={setToastMessage}
          handleCopyShareLink={handleCopyShareLink}
          setRosterModalOpen={setRosterModalOpen}
          handleSaveToLibrary={handleSaveToLibrary}
          setSavedGamesModalOpen={setSavedGamesModalOpen}
          prefillLoading={prefillLoading}
          prefillGames={prefillGames}
          prefillDate={prefillDate}
          setPrefillDate={setPrefillDate}
          prefillSelectOpen={prefillSelectOpen}
          setPrefillSelectOpen={setPrefillSelectOpen}
          prefillSelectedGamePk={prefillSelectedGamePk}
          setPrefillSelectedGamePk={setPrefillSelectedGamePk}
          handleApplyPrefillFromGame={handleApplyPrefillFromGame}
          autoCalculateStats={autoCalculateStats}
          setAutoCalculateStats={setAutoCalculateStats}
          handleGlobalReset={handleGlobalReset}
          guidePinned={guidePinned}
          onTogglePinGuide={() => setGuidePinned(p => !p)}
          inspectedCell={inspectedCell}
          setInspectedCell={setInspectedCell}
          inspectedPitcher={inspectedPitcher}
          setInspectedPitcher={setInspectedPitcher}
        />

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
                    onCellClick={!exporting ? handleCellClick : null}
                    onBatterClick={!exporting && scoringMode === 'live' ? handleBatterClick : null}
                    onPitcherClick={!exporting && scoringMode === 'live' ? handlePitcherClick : null}
                    activeCellKey={!exporting ? (scoringMode === 'live' ? activeCellContext?.cellKey : inspectedCell?.cellKey) : null}
                    isInteractive={!exporting}
                    isExporting={exporting}
                    isAdvancedMode={isAdvancedMode}
                    isMobile={isMobile}
                  />
                </div>
              </div>
            )}
          </main>
        )}

        {/* Pinned Scoring Guide (Desktop) */}
        {!isMobile && guidePinned && (
          <ScoringGuide
            isPinned={true}
            onTogglePin={() => setGuidePinned(false)}
            onClose={() => setGuidePinned(false)}
            isDark={isDark}
          />
        )}

      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      <PlayEntryModal
        isOpen={playModalOpen}
        onClose={() => {
          setPlayModalOpen(false);
          setActiveCellContext(null);
        }}
        cellContext={activeCellContext}
        onSavePlay={handleSavePlay}
        onClearPlay={handleClearPlay}
        isDark={isDark}
      />

      <RosterEditModal
        isOpen={rosterModalOpen}
        onClose={() => setRosterModalOpen(false)}
        scorecardData={scorecardData}
        onSaveScorecardData={handleSaveScorecardDataFromRoster}
        isDark={isDark}
      />

      <PitcherEditModal
        isOpen={pitcherModalOpen}
        onClose={() => setPitcherModalOpen(false)}
        pitcherContext={activePitcherContext}
        onSavePitcher={handleSavePitcher}
        totalInnings={scorecardData?.gameInfo?.totalInnings || 9}
        isDark={isDark}
      />

      <SavedGamesModal
        isOpen={savedGamesModalOpen}
        onClose={() => setSavedGamesModalOpen(false)}
        onLoadGame={(loadedData) => {
          setScorecardData(loadedData);
          setScoringMode('live');
          setToastMessage('Loaded scorecard from library!');
          setTimeout(() => setToastMessage(''), 3500);
        }}
        onNewGame={handleStartNewBlankGame}
        currentScorecard={scorecardData}
        isDark={isDark}
        onToast={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(''), 3500);
        }}
      />

      {/* Mobile Full-Size At-Bat Visualizer Modal */}
      {isMobile && (
        <AtBatInspectionModal
          isOpen={mobileInspectionOpen && Boolean(inspectedCell) && scoringMode === 'mlb'}
          onClose={() => {
            setMobileInspectionOpen(false);
            setInspectedCell(null);
          }}
          inspectedCell={inspectedCell}
          scorecardData={scorecardData}
          isDark={isDark}
          c={c}
        />
      )}

      {/* Mobile Full-Size Pitcher Inspection Modal */}
      {isMobile && (
        <PitcherInspectionModal
          isOpen={mobilePitcherInspectionOpen && Boolean(inspectedPitcher) && scoringMode === 'mlb'}
          onClose={() => {
            setMobilePitcherInspectionOpen(false);
            setInspectedPitcher(null);
          }}
          inspectedPitcher={inspectedPitcher}
          scorecardData={scorecardData}
          isDark={isDark}
          c={c}
        />
      )}

      {/* TOAST NOTIFICATION */}
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

      {/* ── UNIFIED MOBILE FLOATING DOCK ─────────────────── */}
      {isMobile && (
        <>
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
