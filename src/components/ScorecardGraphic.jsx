import React from 'react';

/**
 * ScorecardGraphic Component
 * Official MLB Scorecard Graphic Art Print.
 * Features Team Colors (Light & Dark modes), SVG Base Paths, Backward K, and Boxscore.
 */
export default function ScorecardGraphic({
  data,
  theme = 'team-light', // 'team-light', 'team-dark', 'vintage', 'monochrome'
  customHeadline = '',
  customSubtitle = '',
  customFooter = '',
  graphicRef = null
}) {
  if (!data) return null;

  const { gameInfo, awayData, homeData } = data;
  const headlineStr = customHeadline || gameInfo.dateDisplay || 'OCTOBER 8, 2025';
  const subtitleStr = customSubtitle || `${gameInfo.venue} | ${gameInfo.headline}`;
  const footerStr = customFooter || `MLB SCORECARD GRAPHIC ART PRINT • ${gameInfo.dateDisplay} • ${gameInfo.venue.toUpperCase()}`;

  const innings = Array.from({ length: Math.max(9, gameInfo.totalInnings || 9) }, (_, i) => i + 1);

  // Apply Theme Colors
  const getThemeStyles = () => {
    switch (theme) {
      case 'team-dark':
        return {
          paperBg: 'bg-[#111622]',
          textColor: 'text-zinc-100',
          subTextColor: 'text-zinc-400',
          borderColor: 'border-zinc-800',
          tableBg: 'bg-[#182030]/90',
          boxscoreBg: 'bg-[#182030]/95',
          awayPillBg: gameInfo.awayTeam.color,
          awayPillText: gameInfo.awayTeam.textColor || '#ffffff',
          homePillBg: gameInfo.homeTeam.color,
          homePillText: gameInfo.homeTeam.textColor || '#ffffff',
          awayHitBg: gameInfo.awayTeam.secondary,
          awayHitText: '#0f172a',
          homeHitBg: gameInfo.homeTeam.secondary,
          homeHitText: '#ffffff',
          accentBadgeBg: gameInfo.awayTeam.secondary,
          accentBadgeText: '#0f172a',
          badgeText: gameInfo.awayTeam.abbreviation || 'MLB'
        };
      case 'vintage':
        return {
          paperBg: 'bg-[#f4efe0]',
          textColor: 'text-[#342419]',
          subTextColor: 'text-[#6e5847]',
          borderColor: 'border-[#d4c9b3]',
          tableBg: 'bg-white/80',
          boxscoreBg: 'bg-white/95',
          awayPillBg: '#563c2c',
          awayPillText: '#f4efe0',
          homePillBg: '#800000',
          homePillText: '#f4efe0',
          awayHitBg: '#d0b288',
          awayHitText: '#342419',
          homeHitBg: '#800000',
          homeHitText: '#f4efe0',
          accentBadgeBg: '#d0b288',
          accentBadgeText: '#342419',
          badgeText: 'MLB'
        };
      case 'monochrome':
        return {
          paperBg: 'bg-white',
          textColor: 'text-zinc-900',
          subTextColor: 'text-zinc-600',
          borderColor: 'border-zinc-300',
          tableBg: 'bg-zinc-50',
          boxscoreBg: 'bg-white',
          awayPillBg: '#18181b',
          awayPillText: '#ffffff',
          homePillBg: '#27272a',
          homePillText: '#ffffff',
          awayHitBg: '#e4e4e7',
          awayHitText: '#09090b',
          homeHitBg: '#18181b',
          homeHitText: '#ffffff',
          accentBadgeBg: '#18181b',
          accentBadgeText: '#ffffff',
          badgeText: 'MLB'
        };
      case 'team-light':
      default:
        return {
          paperBg: 'bg-[#f8f7f2]',
          textColor: 'text-zinc-900',
          subTextColor: 'text-zinc-600',
          borderColor: 'border-zinc-300',
          tableBg: 'bg-white/85',
          boxscoreBg: 'bg-white/95',
          awayPillBg: gameInfo.awayTeam.color,
          awayPillText: gameInfo.awayTeam.textColor || '#ffffff',
          homePillBg: gameInfo.homeTeam.color,
          homePillText: gameInfo.homeTeam.textColor || '#ffffff',
          awayHitBg: gameInfo.awayTeam.secondary,
          awayHitText: '#0f172a',
          homeHitBg: gameInfo.homeTeam.secondary,
          homeHitText: '#ffffff',
          accentBadgeBg: gameInfo.awayTeam.secondary,
          accentBadgeText: '#0f172a',
          badgeText: gameInfo.awayTeam.abbreviation || 'MLB'
        };
    }
  };

  const ts = getThemeStyles();

  /**
   * Render Official Inning Cell with SVG Base Paths
   */
  const renderPlayCell = (play, isHome = false) => {
    if (!play || !play.code) return null;
    const { code, type, bases, isLooking } = play;

    // BASE HITS / WALKS / HR
    if (type === 'hit' || type === 'hr' || type === 'walk') {
      const isHR = type === 'hr';
      const hitBgClass = isHome ? ts.homeHitBg : ts.awayHitBg;
      const hitTextClass = isHome ? ts.homeHitText : ts.awayHitText;

      return (
        <div className="relative w-full h-full flex items-center justify-center p-0.5">
          <svg className="w-6 h-6 overflow-visible" viewBox="0 0 32 32">
            <polygon
              points="16,28 28,16 16,4 4,16"
              fill={isHR ? hitBgClass : 'none'}
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            {(bases >= 1 || isHR) && (
              <line x1="16" y1="28" x2="28" y2="16" stroke={hitBgClass} strokeWidth="3" strokeLinecap="round" />
            )}
            {(bases >= 2 || isHR) && (
              <line x1="28" y1="16" x2="16" y2="4" stroke={hitBgClass} strokeWidth="3" strokeLinecap="round" />
            )}
            {(bases >= 3 || isHR) && (
              <line x1="16" y1="4" x2="4" y2="16" stroke={hitBgClass} strokeWidth="3" strokeLinecap="round" />
            )}
            {isHR && (
              <line x1="4" y1="16" x2="16" y2="28" stroke={hitBgClass} strokeWidth="3" strokeLinecap="round" />
            )}
          </svg>

          <div
            className="absolute px-1 py-0.2 rounded-[1px] text-[8px] font-black tracking-tight leading-none text-center shadow-2xs whitespace-nowrap"
            style={{ backgroundColor: hitBgClass, color: hitTextClass }}
          >
            {code}
          </div>
        </div>
      );
    }

    // STRIKEOUTS (Swinging 'K' vs Looking Backward 'ꓘ')
    if (type === 'strikeout') {
      return (
        <div className="flex items-center justify-center h-full">
          <span
            className={`text-xl font-black tracking-tighter ${
              isLooking ? 'inline-block transform scale-x-[-1]' : ''
            } ${isHome ? 'text-[#0e3386]' : 'text-[#0f172a]'}`}
          >
            K
          </span>
        </div>
      );
    }

    // FIELD OUTS
    return (
      <div className="flex items-center justify-center h-full">
        <span className={`text-[12px] font-black tracking-tight leading-none ${ts.textColor}`}>
          {code}
        </span>
      </div>
    );
  };

  return (
    <div
      ref={graphicRef}
      className={`relative w-full max-w-[960px] mx-auto p-6 md:p-8 shadow-xl rounded-[2px] transition-all shrink-0 ${ts.paperBg} ${ts.textColor}`}
      style={{
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 0 0 10px #e5e3da'
      }}
    >
      {/* Texture Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-scorecard-paper" />

      <div className="relative z-10 flex flex-col justify-between space-y-4">
        
        {/* HEADER SECTION */}
        <div className={`border-b-2 ${ts.borderColor} pb-3`}>
          <div className="flex items-end justify-between gap-3">
            
            <div className="flex-1 min-w-0">
              <h1 className={`text-2xl md:text-4xl font-black uppercase tracking-tight font-oswald leading-none mb-1 truncate ${ts.textColor}`}>
                {headlineStr}
              </h1>
              <p className={`text-[11px] font-bold tracking-widest uppercase truncate ${ts.subTextColor}`}>
                {subtitleStr}
              </p>
            </div>

            {/* Geometric Diamond Emblem */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                className="rotate-45 w-9 h-9 flex items-center justify-center border-2 font-black shadow-2xs border-zinc-900"
                style={{ backgroundColor: ts.accentBadgeBg, color: ts.accentBadgeText }}
              >
                <span className="-rotate-45 text-[10px] text-center font-black tracking-tight leading-none">
                  {ts.badgeText}
                </span>
              </div>
            </div>

            {/* Boxscore Summary */}
            <div className={`flex items-center gap-3 px-3 py-2 rounded-[2px] border ${ts.borderColor} ${ts.boxscoreBg} shadow-2xs font-mono-score shrink-0`}>
              <div className="text-right border-r border-zinc-300 pr-2.5 leading-tight">
                <div className="font-bold text-xs">{gameInfo.awayTeam.abbreviation}</div>
                <div className="font-bold text-xs">{gameInfo.homeTeam.abbreviation}</div>
              </div>
              <div className="grid grid-cols-3 gap-x-3 text-center font-black text-xs leading-tight">
                <div>
                  <div className="text-[9px] text-zinc-500 font-sans uppercase font-bold">R</div>
                  <div>{gameInfo.awayTeam.score}</div>
                  <div>{gameInfo.homeTeam.score}</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500 font-sans uppercase font-bold">H</div>
                  <div>{gameInfo.awayTeam.hits}</div>
                  <div>{gameInfo.homeTeam.hits}</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500 font-sans uppercase font-bold">E</div>
                  <div>{gameInfo.awayTeam.errors}</div>
                  <div>{gameInfo.homeTeam.errors}</div>
                </div>
              </div>
            </div>

          </div>
        </div>


        {/* SCORECARD TEAMS GRID */}
        <div className="space-y-4">
            
          {/* VISITING TEAM (TOP HALF) */}
          <div className={`${ts.tableBg} p-2.5 rounded-[2px] border ${ts.borderColor} shadow-2xs`}>
            <div className={`flex items-center justify-between mb-1.5 pb-1 border-b ${ts.borderColor}`}>
              <span className="text-[11px] font-black uppercase tracking-wider">
                {gameInfo.awayTeam.name} (VISITING TEAM)
              </span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase">INNINGS 1 – {innings.length}</span>
            </div>

            <div className="flex gap-2">
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr className={`border-b ${ts.borderColor} text-[9px] uppercase font-bold ${ts.subTextColor}`}>
                    <th className="text-left p-1 w-32 whitespace-nowrap">Batting Order</th>
                    {innings.map(n => (
                      <th key={n} className="text-center p-1 border-l border-zinc-200/50">{n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50">
                  {awayData.batters.map((b, idx) => (
                    <tr key={b.id || idx} className="h-9">
                      <td className="p-1 pr-1 align-middle whitespace-nowrap overflow-hidden">
                        <div className="flex items-center gap-1">
                          <span
                            className="px-1 py-0.5 rounded-[2px] text-[9px] font-mono font-bold leading-none shrink-0 border"
                            style={{ backgroundColor: ts.awayPillBg, color: ts.awayPillText, borderColor: ts.awayPillBg }}
                          >
                            {b.position} {b.jerseyNumber}
                          </span>
                          <span className="text-[11px] font-black tracking-tight truncate max-w-[95px]">
                            {b.name}
                          </span>
                          {b.subNotes?.map((sub, sIdx) => (
                            <span key={sIdx} className="w-3.5 h-3.5 rounded-full bg-zinc-800 text-white text-[7px] flex items-center justify-center font-bold shrink-0">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </td>

                      {innings.map(n => {
                        const play = b.plays?.[n];
                        return (
                          <td key={n} className="border-l border-zinc-200/50 align-middle text-center p-0 relative bg-diamond-pattern">
                            {renderPlayCell(play, false)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {awayData.subsList && awayData.subsList.length > 0 && (
                <div className={`w-20 border-l ${ts.borderColor} pl-1.5 text-[8px] font-mono flex flex-col justify-center space-y-1 shrink-0 whitespace-nowrap`}>
                  {awayData.subsList.map((s, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-zinc-800 text-white text-[7px] flex items-center justify-center font-bold shrink-0">
                        {s.letter}
                      </span>
                      <span className="truncate font-bold">{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Visitor Pitchers Row */}
            <div className={`mt-2 pt-1 border-t ${ts.borderColor} flex items-center justify-between gap-2 text-xs`}>
              <div className="flex items-center gap-1.5 flex-wrap whitespace-nowrap">
                <span className="font-black text-xs">P</span>
                {awayData.pitchers.map(p => (
                  <div key={p.id} className="flex items-center gap-1 bg-zinc-100/10 px-1.5 py-0.5 rounded-[2px] border border-zinc-300/40 shadow-2xs">
                    <span className="w-3.5 h-3.5 rounded-full bg-zinc-900 text-white text-[8px] flex items-center justify-center font-bold">
                      {p.number}
                    </span>
                    <span className="font-bold text-[10px]">{p.name}</span>
                    <div className="flex items-center text-[10px] font-mono font-black tracking-tighter opacity-80">
                      ({p.strikeouts.map((k, kIdx) => (
                        <span key={kIdx} className={k.isLooking ? 'inline-block transform scale-x-[-1]' : ''}>
                          K
                        </span>
                      ))})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>


          {/* HOME TEAM (BOTTOM HALF) */}
          <div className={`${ts.tableBg} p-2.5 rounded-[2px] border ${ts.borderColor} shadow-2xs`}>
            <div className={`flex items-center justify-between mb-1.5 pb-1 border-b ${ts.borderColor}`}>
              <span className="text-[11px] font-black uppercase tracking-wider">
                {gameInfo.homeTeam.name} (HOME TEAM)
              </span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase">INNINGS 1 – {innings.length}</span>
            </div>

            <div className="flex gap-2">
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr className={`border-b ${ts.borderColor} text-[9px] uppercase font-bold ${ts.subTextColor}`}>
                    <th className="text-left p-1 w-32 whitespace-nowrap">Batting Order</th>
                    {innings.map(n => (
                      <th key={n} className="text-center p-1 border-l border-zinc-200/50">{n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50">
                  {homeData.batters.map((b, idx) => (
                    <tr key={b.id || idx} className="h-9">
                      <td className="p-1 pr-1 align-middle whitespace-nowrap overflow-hidden">
                        <div className="flex items-center gap-1">
                          <span
                            className="px-1 py-0.5 rounded-[2px] text-[9px] font-mono font-bold leading-none shrink-0 border"
                            style={{ backgroundColor: ts.homePillBg, color: ts.homePillText, borderColor: ts.homePillBg }}
                          >
                            {b.position} {b.jerseyNumber}
                          </span>
                          <span className="text-[11px] font-black tracking-tight truncate max-w-[95px]">
                            {b.name}
                          </span>
                          {b.subNotes?.map((sub, sIdx) => (
                            <span key={sIdx} className="w-3.5 h-3.5 rounded-full bg-zinc-800 text-white text-[7px] flex items-center justify-center font-bold shrink-0">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </td>

                      {innings.map(n => {
                        const play = b.plays?.[n];
                        return (
                          <td key={n} className="border-l border-zinc-200/50 align-middle text-center p-0 relative bg-diamond-pattern">
                            {renderPlayCell(play, true)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {homeData.subsList && homeData.subsList.length > 0 && (
                <div className={`w-20 border-l ${ts.borderColor} pl-1.5 text-[8px] font-mono flex flex-col justify-center space-y-1 shrink-0 whitespace-nowrap`}>
                  {homeData.subsList.map((s, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-zinc-800 text-white text-[7px] flex items-center justify-center font-bold shrink-0">
                        {s.letter}
                      </span>
                      <span className="truncate font-bold">{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Home Pitchers Row */}
            <div className={`mt-2 pt-1 border-t ${ts.borderColor} flex items-center justify-between gap-2 text-xs`}>
              <div className="flex items-center gap-1.5 flex-wrap whitespace-nowrap">
                <span className="font-black text-xs">P</span>
                {homeData.pitchers.map(p => (
                  <div key={p.id} className="flex items-center gap-1 bg-zinc-100/10 px-1.5 py-0.5 rounded-[2px] border border-zinc-300/40 shadow-2xs">
                    <span className="w-3.5 h-3.5 rounded-full bg-zinc-900 text-white text-[8px] flex items-center justify-center font-bold">
                      {p.number}
                    </span>
                    <span className="font-bold text-[10px]">{p.name}</span>
                    <div className="flex items-center text-[10px] font-mono font-black tracking-tighter opacity-80">
                      ({p.strikeouts.map((k, kIdx) => (
                        <span key={kIdx} className={k.isLooking ? 'inline-block transform scale-x-[-1]' : ''}>
                          K
                        </span>
                      ))})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>


        {/* FOOTER BAR */}
        <div className={`mt-3 pt-2 border-t ${ts.borderColor} text-center text-[9px] font-bold tracking-widest uppercase ${ts.subTextColor}`}>
          {footerStr}
        </div>

      </div>
    </div>
  );
}
