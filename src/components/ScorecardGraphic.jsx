import React from 'react';

/**
 * ScorecardGraphic Component
 * Framable graphic art representation of an MLB game scorecard.
 */
export default function ScorecardGraphic({
  data,
  theme = 'classic', // 'classic', 'team', 'vintage', 'dark', 'monochrome'
  showPhotos = false,
  customPhotos = [],
  customHeadline = '',
  customSubtitle = '',
  customFooter = '',
  onPhotoUpload = null,
  graphicRef = null
}) {
  if (!data) return null;

  const { gameInfo, awayData, homeData } = data;
  const headlineStr = customHeadline || gameInfo.dateDisplay || 'OCTOBER 8, 2025';
  const subtitleStr = customSubtitle || `${gameInfo.venue} | ${gameInfo.headline}`;
  const footerStr = customFooter || `MLB SCORECARD GRAPHIC ART PRINT • ${gameInfo.dateDisplay} • ${gameInfo.venue.toUpperCase()}`;

  // Inning headers (1 to totalInnings, minimum 9)
  const innings = Array.from({ length: Math.max(9, gameInfo.totalInnings || 9) }, (_, i) => i + 1);

  // Apply Theme Styles
  const getThemeStyles = () => {
    switch (theme) {
      case 'team':
        return {
          paperBg: 'bg-[#fafafa]',
          textColor: 'text-zinc-900',
          awayPill: 'bg-[#0a2351] text-[#ffc52f] border-[#0a2351]',
          homePill: 'bg-[#0e3386] text-white border-[#0e3386]',
          awayHitBg: 'bg-[#ffc52f] text-zinc-950 border-amber-500',
          homeHitBg: 'bg-[#cc3433] text-white border-red-700',
          accentBadge: 'bg-[#ffc52f] text-zinc-950 border-zinc-900',
          badgeText: gameInfo.awayTeam.abbreviation || 'MLB'
        };
      case 'vintage':
        return {
          paperBg: 'bg-[#f5efdf]',
          textColor: 'text-[#342419]',
          awayPill: 'bg-[#563c2c] text-[#f5efdf] border-[#342419]',
          homePill: 'bg-[#800000] text-[#f5efdf] border-[#800000]',
          awayHitBg: 'bg-[#d0b288] text-[#342419] border-[#8b4513]',
          homeHitBg: 'bg-[#800000] text-[#f5efdf] border-[#563c2c]',
          accentBadge: 'bg-[#d0b288] text-[#342419] border-[#342419]',
          badgeText: 'MLB'
        };
      case 'dark':
        return {
          paperBg: 'bg-[#12161f]',
          textColor: 'text-zinc-100',
          awayPill: 'bg-amber-400 text-zinc-950 border-amber-300 font-bold',
          homePill: 'bg-blue-600 text-white border-blue-500 font-bold',
          awayHitBg: 'bg-amber-400 text-zinc-950 border-amber-300',
          homeHitBg: 'bg-rose-600 text-white border-rose-500',
          accentBadge: 'bg-amber-400 text-zinc-950 border-white',
          badgeText: 'MLB'
        };
      case 'monochrome':
        return {
          paperBg: 'bg-white',
          textColor: 'text-zinc-900',
          awayPill: 'bg-zinc-900 text-white border-black',
          homePill: 'bg-zinc-800 text-white border-black',
          awayHitBg: 'bg-zinc-200 text-zinc-900 border-zinc-900',
          homeHitBg: 'bg-zinc-900 text-white border-black',
          accentBadge: 'bg-zinc-900 text-white border-black',
          badgeText: 'MLB'
        };
      case 'classic':
      default:
        return {
          paperBg: 'bg-[#f7f5ef]',
          textColor: 'text-[#1e293b]',
          awayPill: 'bg-[#eab308] text-[#0f172a] border-[#ca8a04]',
          homePill: 'bg-[#0e3386] text-white border-[#0a2351]',
          awayHitBg: 'bg-[#eab308] text-[#0f172a] border-[#ca8a04]',
          homeHitBg: 'bg-[#dc2626] text-white border-[#b91c1c]',
          accentBadge: 'bg-[#eab308] text-[#0f172a] border-[#0f172a]',
          badgeText: 'MLB'
        };
    }
  };

  const ts = getThemeStyles();

  // Render play cell notation
  const renderPlayCell = (play, isHome = false) => {
    if (!play || !play.code) return null;
    const { code, type } = play;

    if (type === 'hit' || type === 'hr' || type === 'walk') {
      const badgeStyle = isHome ? ts.homeHitBg : ts.awayHitBg;

      return (
        <div className="flex items-center justify-center h-full w-full">
          <div
            className={`rotate-45 w-6 h-6 flex items-center justify-center rounded-[1px] border shadow-2xs ${badgeStyle}`}
          >
            <span className="-rotate-45 text-[8px] font-black tracking-tight leading-none text-center whitespace-nowrap">
              {code}
            </span>
          </div>
        </div>
      );
    }

    if (type === 'strikeout') {
      return (
        <div className="flex items-center justify-center h-full">
          <span className={`text-xl font-black tracking-tighter ${isHome ? 'text-[#0e3386]' : 'text-[#0f172a]'}`}>
            {code}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-lg font-black tracking-tight leading-none">
          {code}
        </span>
      </div>
    );
  };

  const defaultPhotos = [
    'https://images.unsplash.com/photo-1508802913493-518290373463?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1562077772-3bd90403f7f0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516731415730-0c6417231811?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80'
  ];

  const photosToDisplay = customPhotos.length > 0 ? customPhotos : defaultPhotos;

  return (
    <div
      ref={graphicRef}
      className={`relative w-full max-w-[1020px] mx-auto p-6 md:p-8 shadow-xl rounded-[2px] transition-all ${ts.paperBg} ${ts.textColor}`}
      style={{
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 0 0 12px #e5e3da',
        aspectRatio: showPhotos ? '3/4' : '4/5'
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-scorecard-paper" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        
        {/* HEADER SECTION */}
        <div className="border-b-2 border-zinc-900 pb-3 mb-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-oswald leading-none mb-1">
                {headlineStr}
              </h1>
              <p className="text-[11px] md:text-xs font-bold tracking-widest uppercase text-zinc-600 truncate">
                {subtitleStr}
              </p>
            </div>

            {/* Geometric Diamond Emblem */}
            <div className="flex items-center gap-3 shrink-0">
              <div className={`rotate-45 w-9 h-9 flex items-center justify-center border-2 font-black shadow-2xs ${ts.accentBadge}`}>
                <span className="-rotate-45 text-[10px] text-center font-black tracking-tight leading-none">
                  {ts.badgeText}
                </span>
              </div>
            </div>

            {/* R H E Boxscore */}
            <div className="flex items-center gap-3 bg-white/90 px-3 py-2 rounded-[2px] border border-zinc-300 shadow-2xs font-mono-score shrink-0">
              <div className="text-right border-r border-zinc-300 pr-2.5 leading-tight">
                <div className="font-bold text-xs text-zinc-900">{gameInfo.awayTeam.abbreviation}</div>
                <div className="font-bold text-xs text-zinc-900">{gameInfo.homeTeam.abbreviation}</div>
              </div>
              <div className="grid grid-cols-3 gap-x-3 text-center font-black text-xs leading-tight">
                <div>
                  <div className="text-[9px] text-zinc-500 font-sans uppercase font-bold">R</div>
                  <div className="text-zinc-900">{gameInfo.awayTeam.score}</div>
                  <div className="text-zinc-900">{gameInfo.homeTeam.score}</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500 font-sans uppercase font-bold">H</div>
                  <div className="text-zinc-800">{gameInfo.awayTeam.hits}</div>
                  <div className="text-zinc-800">{gameInfo.homeTeam.hits}</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500 font-sans uppercase font-bold">E</div>
                  <div className="text-zinc-600">{gameInfo.awayTeam.errors}</div>
                  <div className="text-zinc-600">{gameInfo.homeTeam.errors}</div>
                </div>
              </div>
            </div>

          </div>
        </div>


        {/* MAIN SCORECARD SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-start">
          
          <div className={`${showPhotos ? 'lg:col-span-9' : 'lg:col-span-12'} flex flex-col gap-4`}>
            
            {/* VISITING TEAM (TOP HALF) */}
            <div className="bg-white/80 p-2.5 rounded-[2px] border border-zinc-300 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-zinc-300">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-800">
                  {gameInfo.awayTeam.name} (VISITING TEAM)
                </span>
                <span className="text-[9px] font-bold text-zinc-400 uppercase">INNINGS 1 – {innings.length}</span>
              </div>

              <div className="overflow-x-auto">
                <div className="flex gap-2">
                  
                  <table className="w-full border-collapse flex-1 min-w-[500px]">
                    <thead>
                      <tr className="border-b border-zinc-300 text-[9px] uppercase font-bold text-zinc-600">
                        <th className="text-left p-1 w-36 whitespace-nowrap">Batting Order</th>
                        {innings.map(n => (
                          <th key={n} className="text-center p-1 w-9 border-l border-zinc-200">{n}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {awayData.batters.map((b, idx) => (
                        <tr key={b.id || idx} className="h-9">
                          <td className="p-1 pr-2 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span className={`px-1 py-0.5 rounded-[2px] text-[9px] font-mono font-bold leading-none shrink-0 border ${ts.awayPill}`}>
                                {b.position} {b.jerseyNumber}
                              </span>
                              <span className="text-[11px] font-black tracking-tight text-zinc-900 truncate max-w-[105px]">
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
                              <td key={n} className="border-l border-zinc-200 align-middle text-center p-0.5 relative bg-diamond-pattern">
                                {renderPlayCell(play, false)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {awayData.subsList && awayData.subsList.length > 0 && (
                    <div className="w-24 border-l border-zinc-300 pl-2 text-[9px] font-mono text-zinc-600 flex flex-col justify-center space-y-1 shrink-0 whitespace-nowrap">
                      {awayData.subsList.map((s, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="w-3.5 h-3.5 rounded-full bg-zinc-800 text-white text-[7px] flex items-center justify-center font-bold shrink-0">
                            {s.letter}
                          </span>
                          <span className="truncate font-bold text-zinc-800">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>

              {/* Pitchers Row */}
              <div className="mt-2 pt-1.5 border-t border-zinc-300 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap whitespace-nowrap">
                  <span className="font-black text-zinc-800 text-xs">P</span>
                  {awayData.pitchers.map(p => (
                    <div key={p.id} className="flex items-center gap-1 bg-zinc-100 px-1.5 py-0.5 rounded-[2px] border border-zinc-300 shadow-2xs">
                      <span className="w-3.5 h-3.5 rounded-full bg-zinc-900 text-white text-[8px] flex items-center justify-center font-bold">
                        {p.number}
                      </span>
                      <span className="font-bold text-[10px] text-zinc-800">{p.name}</span>
                      <span className="text-[10px] font-mono text-zinc-600 font-bold tracking-tighter">({p.strikeouts})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>


            {/* HOME TEAM (BOTTOM HALF) */}
            <div className="bg-white/80 p-2.5 rounded-[2px] border border-zinc-300 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-zinc-300">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-800">
                  {gameInfo.homeTeam.name} (HOME TEAM)
                </span>
                <span className="text-[9px] font-bold text-zinc-400 uppercase">INNINGS 1 – {innings.length}</span>
              </div>

              <div className="overflow-x-auto">
                <div className="flex gap-2">
                  
                  <table className="w-full border-collapse flex-1 min-w-[500px]">
                    <thead>
                      <tr className="border-b border-zinc-300 text-[9px] uppercase font-bold text-zinc-600">
                        <th className="text-left p-1 w-36 whitespace-nowrap">Batting Order</th>
                        {innings.map(n => (
                          <th key={n} className="text-center p-1 w-9 border-l border-zinc-200">{n}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {homeData.batters.map((b, idx) => (
                        <tr key={b.id || idx} className="h-9">
                          <td className="p-1 pr-2 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span className={`px-1 py-0.5 rounded-[2px] text-[9px] font-mono font-bold leading-none shrink-0 border ${ts.homePill}`}>
                                {b.position} {b.jerseyNumber}
                              </span>
                              <span className="text-[11px] font-black tracking-tight text-zinc-900 truncate max-w-[105px]">
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
                              <td key={n} className="border-l border-zinc-200 align-middle text-center p-0.5 relative bg-diamond-pattern">
                                {renderPlayCell(play, true)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {homeData.subsList && homeData.subsList.length > 0 && (
                    <div className="w-24 border-l border-zinc-300 pl-2 text-[9px] font-mono text-zinc-600 flex flex-col justify-center space-y-1 shrink-0 whitespace-nowrap">
                      {homeData.subsList.map((s, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="w-3.5 h-3.5 rounded-full bg-zinc-800 text-white text-[7px] flex items-center justify-center font-bold shrink-0">
                            {s.letter}
                          </span>
                          <span className="truncate font-bold text-zinc-800">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>

              {/* Pitchers Row */}
              <div className="mt-2 pt-1.5 border-t border-zinc-300 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap whitespace-nowrap">
                  <span className="font-black text-zinc-800 text-xs">P</span>
                  {homeData.pitchers.map(p => (
                    <div key={p.id} className="flex items-center gap-1 bg-zinc-100 px-1.5 py-0.5 rounded-[2px] border border-zinc-300 shadow-2xs">
                      <span className="w-3.5 h-3.5 rounded-full bg-zinc-900 text-white text-[8px] flex items-center justify-center font-bold">
                        {p.number}
                      </span>
                      <span className="font-bold text-[10px] text-zinc-800">{p.name}</span>
                      <span className="text-[10px] font-mono text-zinc-600 font-bold tracking-tighter">({p.strikeouts})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>


          {showPhotos && (
            <div className="lg:col-span-3 flex flex-col gap-2 h-full justify-between shrink-0">
              {photosToDisplay.slice(0, 6).map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group overflow-hidden rounded-[2px] border border-white shadow-xs aspect-[4/3] bg-zinc-200 transition-transform hover:scale-[1.02]"
                >
                  <img
                    src={imgUrl}
                    alt={`Game Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                  {onPhotoUpload && (
                    <label className="absolute inset-0 bg-zinc-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity p-1 text-center text-[10px]">
                      <span className="font-bold">Replace #{idx + 1}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onPhotoUpload(e, idx)}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>


        {/* FOOTER BAR */}
        <div className="mt-4 pt-2.5 border-t border-zinc-400 text-center text-[9px] font-bold tracking-widest text-zinc-600 uppercase">
          {footerStr}
        </div>

      </div>
    </div>
  );
}
