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
  Moon
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

export default function App() {
  const [appTheme, setAppTheme] = useState('dark'); // 'dark' or 'light'
  const [selectedDate, setSelectedDate] = useState(getYesterdayDateString());
  const [availableGames, setAvailableGames] = useState([]);
  const [selectedGamePk, setSelectedGamePk] = useState('');
  const [scorecardData, setScorecardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  // Graphic Theme Preset Options ('team-light' default!)
  const [activeTab, setActiveTab] = useState('style'); // 'style', 'text'
  const [theme, setTheme] = useState('team-light');
  const [customHeadline, setCustomHeadline] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [customFooter, setCustomFooter] = useState('');
  const [exporting, setExporting] = useState(false);

  const graphicRef = useRef(null);
  const dateInputRef = useRef(null);

  // Auto-fetch games on date change
  useEffect(() => {
    fetchGamesForDate(selectedDate);
  }, [selectedDate]);

  // Load scorecard data when selected game changes
  useEffect(() => {
    if (selectedGamePk) {
      loadGameData(selectedGamePk);
    }
  }, [selectedGamePk]);

  // Sync dark/light app theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appTheme);
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
      setCustomSubtitle(`${data.gameInfo.venue} | ${data.gameInfo.headline}`);
      setCustomFooter(`MLB SCORECARD GRAPHIC ART PRINT • ${data.gameInfo.dateDisplay} • ${data.gameInfo.venue.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      setError('Could not load MLB game data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPNG = async () => {
    if (!graphicRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(graphicRef.current, { quality: 0.95, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `MLB_Scorecard_${scorecardData?.gameInfo?.awayTeam?.abbreviation}_VS_${scorecardData?.gameInfo?.homeTeam?.abbreviation}.png`;
      link.href = dataUrl;
      link.click();
      confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } });
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
      const dataUrl = await toPng(graphicRef.current, { quality: 0.95, pixelRatio: 2 });
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MLB_Scorecard_${selectedGamePk}.pdf`);
      confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } });
    } catch (err) {
      console.error('Export PDF failed', err);
      alert('Error exporting PDF document.');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const triggerCalendarPicker = () => {
    if (dateInputRef.current && dateInputRef.current.showPicker) {
      dateInputRef.current.showPicker();
    }
  };

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col transition-colors ${
      appTheme === 'dark' ? 'bg-[#09090b] text-[#d4d4d8]' : 'bg-[#ffffff] text-[#27272a]'
    }`}>
      
      {/* HEADER BAR */}
      <header className={`border-b py-3 px-4 md:px-8 transition-colors ${
        appTheme === 'dark' ? 'border-[#27272a] bg-[#18181b]' : 'border-[#e4e4e7] bg-[#f4f4f5]'
      }`}>
        <div className="max-w-[1500px] mx-auto flex items-center justify-between">
          
          <div>
            <h1 className={`text-base font-bold tracking-tight leading-none ${
              appTheme === 'dark' ? 'text-[#fafafa]' : 'text-[#09090b]'
            }`}>
              MLB Scorecard Studio
            </h1>
            <p className={`text-[11px] mt-0.5 ${appTheme === 'dark' ? 'text-[#a1a1aa]' : 'text-[#71717a]'}`}>
              Framable graphic art generator for any MLB game
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPNG}
              disabled={exporting || loading}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1.5 shadow-2xs ${
                appTheme === 'dark'
                  ? 'bg-[#fafafa] hover:bg-[#e4e4e7] text-[#09090b]'
                  : 'bg-[#09090b] hover:bg-[#27272a] text-[#fafafa]'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Export PNG
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting || loading}
              className={`px-3 py-1.5 rounded text-xs font-semibold border transition disabled:opacity-50 flex items-center gap-1.5 ${
                appTheme === 'dark'
                  ? 'bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] border-[#3f3f46]'
                  : 'bg-[#e4e4e7] hover:bg-[#d4d4d8] text-[#09090b] border-[#d4d4d8]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export PDF
            </button>
            <button
              onClick={handlePrint}
              className={`px-3 py-1.5 rounded text-xs font-semibold border transition flex items-center gap-1.5 ${
                appTheme === 'dark'
                  ? 'bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] border-[#3f3f46]'
                  : 'bg-[#e4e4e7] hover:bg-[#d4d4d8] text-[#09090b] border-[#d4d4d8]'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>

            {/* Dark / Light App Theme Toggle */}
            <button
              onClick={() => setAppTheme(appTheme === 'dark' ? 'light' : 'dark')}
              className={`w-8 h-8 rounded border flex items-center justify-center transition ml-1 ${
                appTheme === 'dark'
                  ? 'bg-[#18181b] border-[#27272a] text-[#fafafa] hover:bg-[#27272a]'
                  : 'bg-[#f4f4f5] border-[#e4e4e7] text-[#09090b] hover:bg-[#e4e4e7]'
              }`}
              title="Toggle Dark/Light Mode"
            >
              {appTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>


      {/* MAIN CONTAINER */}
      <main className="max-w-[1500px] w-full mx-auto p-4 md:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT CONTROLS (3 COLS) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* GAME SELECTOR CARD */}
          <div className={`border rounded-lg p-4 space-y-3 transition-colors ${
            appTheme === 'dark' ? 'bg-[#18181b] border-[#27272a]' : 'bg-[#f4f4f5] border-[#e4e4e7]'
          }`}>
            <h2 className={`text-xs font-bold uppercase tracking-wider ${
              appTheme === 'dark' ? 'text-[#fafafa]' : 'text-[#09090b]'
            }`}>
              Select Date & Game
            </h2>

            <div>
              <label className={`block text-[11px] mb-1 font-medium ${
                appTheme === 'dark' ? 'text-[#a1a1aa]' : 'text-[#71717a]'
              }`}>
                Game Date:
              </label>
              
              <div className="relative flex items-center">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onClick={triggerCalendarPicker}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`w-full border rounded px-3 py-1.5 text-xs outline-none font-mono cursor-pointer transition-colors ${
                    appTheme === 'dark'
                      ? 'bg-[#09090b] border-[#27272a] focus:border-[#52525b] text-[#fafafa]'
                      : 'bg-[#ffffff] border-[#e4e4e7] focus:border-[#a1a1aa] text-[#09090b]'
                  }`}
                />
                <button
                  type="button"
                  onClick={triggerCalendarPicker}
                  className="absolute right-2.5 text-[#a1a1aa] hover:text-[#fafafa]"
                  title="Open Calendar"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-[11px] mb-1 font-medium flex items-center justify-between ${
                appTheme === 'dark' ? 'text-[#a1a1aa]' : 'text-[#71717a]'
              }`}>
                <span>Game ({availableGames.length} available):</span>
                {searching && <RefreshCw className="w-3 h-3 animate-spin" />}
              </label>
              <select
                value={selectedGamePk}
                onChange={(e) => setSelectedGamePk(e.target.value)}
                disabled={searching || availableGames.length === 0}
                className={`w-full border rounded px-2.5 py-1.5 text-xs outline-none transition-colors disabled:opacity-50 ${
                  appTheme === 'dark'
                    ? 'bg-[#09090b] border-[#27272a] focus:border-[#52525b] text-[#fafafa]'
                    : 'bg-[#ffffff] border-[#e4e4e7] focus:border-[#a1a1aa] text-[#09090b]'
                }`}
              >
                {availableGames.map(g => (
                  <option key={g.gamePk} value={g.gamePk}>
                    {g.awayTeam} @ {g.homeTeam} ({g.awayScore} - {g.homeScore})
                  </option>
                ))}
              </select>
            </div>
          </div>


          {/* CUSTOMIZER CARD */}
          <div className={`border rounded-lg p-4 space-y-4 transition-colors ${
            appTheme === 'dark' ? 'bg-[#18181b] border-[#27272a]' : 'bg-[#f4f4f5] border-[#e4e4e7]'
          }`}>
            
            {/* Segmented Tab Nav */}
            <div className={`flex border-b ${appTheme === 'dark' ? 'border-[#27272a]' : 'border-[#e4e4e7]'}`}>
              <button
                onClick={() => setActiveTab('style')}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'style'
                    ? appTheme === 'dark' ? 'border-[#fafafa] text-[#fafafa]' : 'border-[#09090b] text-[#09090b]'
                    : appTheme === 'dark' ? 'border-transparent text-[#a1a1aa]' : 'border-transparent text-[#71717a]'
                }`}
              >
                Poster Theme
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'text'
                    ? appTheme === 'dark' ? 'border-[#fafafa] text-[#fafafa]' : 'border-[#09090b] text-[#09090b]'
                    : appTheme === 'dark' ? 'border-transparent text-[#a1a1aa]' : 'border-transparent text-[#71717a]'
                }`}
              >
                Poster Text
              </button>
            </div>

            {activeTab === 'style' && (
              <div className="space-y-3">
                <label className={`block text-[11px] font-medium ${
                  appTheme === 'dark' ? 'text-[#a1a1aa]' : 'text-[#71717a]'
                }`}>
                  Poster Art Theme:
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'team-light', label: 'Team Colors (Light Poster)' },
                    { id: 'team-dark', label: 'Team Colors (Dark Poster)' },
                    { id: 'vintage', label: 'Ballpark Vintage Sepia' },
                    { id: 'monochrome', label: 'Monochrome Litho' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`w-full p-2.5 rounded border text-xs font-medium text-left transition ${
                        theme === t.id
                          ? appTheme === 'dark'
                            ? 'bg-[#27272a] border-[#52525b] text-[#fafafa]'
                            : 'bg-[#ffffff] border-[#a1a1aa] text-[#09090b] shadow-2xs font-bold'
                          : appTheme === 'dark'
                            ? 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]'
                            : 'bg-[#ffffff] border-[#e4e4e7] text-[#71717a] hover:text-[#09090b]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className={`block text-[11px] mb-1 ${
                    appTheme === 'dark' ? 'text-[#a1a1aa]' : 'text-[#71717a]'
                  }`}>
                    Headline Date Text
                  </label>
                  <input
                    type="text"
                    value={customHeadline}
                    onChange={(e) => setCustomHeadline(e.target.value)}
                    className={`w-full border rounded px-2.5 py-1.5 text-xs outline-none font-mono ${
                      appTheme === 'dark'
                        ? 'bg-[#09090b] border-[#27272a] text-[#fafafa]'
                        : 'bg-[#ffffff] border-[#e4e4e7] text-[#09090b]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] mb-1 ${
                    appTheme === 'dark' ? 'text-[#a1a1aa]' : 'text-[#71717a]'
                  }`}>
                    Stadium & Game Subtitle
                  </label>
                  <input
                    type="text"
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    className={`w-full border rounded px-2.5 py-1.5 text-xs outline-none ${
                      appTheme === 'dark'
                        ? 'bg-[#09090b] border-[#27272a] text-[#fafafa]'
                        : 'bg-[#ffffff] border-[#e4e4e7] text-[#09090b]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] mb-1 ${
                    appTheme === 'dark' ? 'text-[#a1a1aa]' : 'text-[#71717a]'
                  }`}>
                    Footer Print Text
                  </label>
                  <input
                    type="text"
                    value={customFooter}
                    onChange={(e) => setCustomFooter(e.target.value)}
                    className={`w-full border rounded px-2.5 py-1.5 text-xs outline-none ${
                      appTheme === 'dark'
                        ? 'bg-[#09090b] border-[#27272a] text-[#fafafa]'
                        : 'bg-[#ffffff] border-[#e4e4e7] text-[#09090b]'
                    }`}
                  />
                </div>
              </div>
            )}

          </div>

        </div>


        {/* RIGHT PREVIEW CANVAS CONTAINER (9 COLS - SPACIOUS) */}
        <div className={`lg:col-span-9 border rounded-lg p-4 md:p-6 w-full overflow-x-auto flex items-start justify-center min-h-[680px] transition-colors ${
          appTheme === 'dark' ? 'bg-[#18181b] border-[#27272a]' : 'bg-[#f4f4f5] border-[#e4e4e7]'
        }`}>
          {loading ? (
            <div className={`flex flex-col items-center justify-center py-24 gap-2 ${
              appTheme === 'dark' ? 'text-[#a1a1aa]' : 'text-[#71717a]'
            }`}>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <p className="text-xs font-medium">Fetching MLB Play-by-Play Data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-24 text-rose-500 text-xs font-medium max-w-sm">
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
            />
          )}
        </div>

      </main>

    </div>
  );
}
