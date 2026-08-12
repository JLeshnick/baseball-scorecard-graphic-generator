import React from 'react';

/**
 * ScorecardGraphic Component — Premium Graphic Art Print Edition
 * Redesigned for frameable poster aesthetics: prominent teams + score hero,
 * per-inning linescore, pitching stats table, SVG diamond base paths, and
 * a rich multi-theme system.
 */
export default function ScorecardGraphic({
  data,
  theme = 'team-light',
  customHeadline = '',
  customSubtitle = '',
  customFooter = '',
  graphicRef = null
}) {
  if (!data) return null;

  const { gameInfo, awayData, homeData } = data;
  const footerStr =
    customFooter ||
    `${gameInfo.venue.toUpperCase()} • ${gameInfo.dateDisplay}`;

  const innings = Array.from(
    { length: Math.max(9, gameInfo.totalInnings || 9) },
    (_, i) => i + 1
  );

  // ─── Theme System ────────────────────────────────────────────────────────────
  const getTheme = () => {
    const away = gameInfo.awayTeam;
    const home = gameInfo.homeTeam;

    const base = {
      paperTexture: true,
      outerFrame: '#c8bfa8',
    };

    switch (theme) {
      case 'team-dark':
        return {
          ...base,
          bg: '#111622',
          paperBg: '#131c2e',
          outerFrame: '#1e2a40',
          textPrimary: '#f1f5f9',
          textSecondary: '#94a3b8',
          textMuted: '#64748b',
          borderStrong: '#2d3f5e',
          borderLight: '#1e2d47',
          tableHeaderBg: '#0d1627',
          tableRowAlt: 'rgba(255,255,255,0.025)',
          lineScoreBg: '#0a1221',
          lineScoreAlt: 'rgba(255,255,255,0.04)',
          pitchingBg: '#0d1627',
          awayColor: away.color,
          awaySecondary: away.secondary,
          awayText: away.textColor || '#fff',
          homeColor: home.color,
          homeSecondary: home.secondary,
          homeText: home.textColor || '#fff',
          scoreTextColor: '#f1f5f9',
          vsTextColor: '#475569',
          cellDiamondStroke: '#2d4a7a',
          hitLineColor: away.secondary,
          homeHitLineColor: home.secondary,
        };

      case 'vintage':
        return {
          ...base,
          bg: '#e8dfc8',
          paperBg: '#f5eed8',
          outerFrame: '#c8b89a',
          textPrimary: '#2c1a0e',
          textSecondary: '#6b4c30',
          textMuted: '#9c7a58',
          borderStrong: '#b89a70',
          borderLight: '#d4c4a0',
          tableHeaderBg: 'rgba(180,150,100,0.15)',
          tableRowAlt: 'rgba(180,150,100,0.07)',
          lineScoreBg: 'rgba(180,150,100,0.12)',
          lineScoreAlt: 'rgba(180,150,100,0.07)',
          pitchingBg: 'rgba(180,150,100,0.1)',
          awayColor: '#3a2010',
          awaySecondary: '#c8922a',
          awayText: '#f5eed8',
          homeColor: '#7a0c1e',
          homeSecondary: '#c8922a',
          homeText: '#f5eed8',
          scoreTextColor: '#2c1a0e',
          vsTextColor: '#b89a70',
          cellDiamondStroke: '#c8b089',
          hitLineColor: '#c8922a',
          homeHitLineColor: '#7a0c1e',
          paperTexture: true,
        };

      case 'monochrome':
        return {
          ...base,
          bg: '#e8e8e8',
          paperBg: '#f9f9f7',
          outerFrame: '#c0c0c0',
          textPrimary: '#111111',
          textSecondary: '#444444',
          textMuted: '#888888',
          borderStrong: '#aaaaaa',
          borderLight: '#dddddd',
          tableHeaderBg: '#f0f0ee',
          tableRowAlt: 'rgba(0,0,0,0.025)',
          lineScoreBg: '#ececea',
          lineScoreAlt: 'rgba(0,0,0,0.03)',
          pitchingBg: '#f2f2f0',
          awayColor: '#111111',
          awaySecondary: '#555555',
          awayText: '#ffffff',
          homeColor: '#333333',
          homeSecondary: '#888888',
          homeText: '#ffffff',
          scoreTextColor: '#111111',
          vsTextColor: '#999999',
          cellDiamondStroke: '#cccccc',
          hitLineColor: '#222222',
          homeHitLineColor: '#444444',
        };

      case 'team-light':
      default:
        return {
          ...base,
          bg: '#ddd8cc',
          paperBg: '#f8f5ec',
          outerFrame: '#c8bfa8',
          textPrimary: '#1a1209',
          textSecondary: '#5a4a35',
          textMuted: '#9a8a75',
          borderStrong: '#c0b499',
          borderLight: '#e0d8c4',
          tableHeaderBg: 'rgba(0,0,0,0.04)',
          tableRowAlt: 'rgba(0,0,0,0.02)',
          lineScoreBg: 'rgba(0,0,0,0.04)',
          lineScoreAlt: 'rgba(0,0,0,0.025)',
          pitchingBg: 'rgba(0,0,0,0.03)',
          awayColor: away.color,
          awaySecondary: away.secondary,
          awayText: away.textColor || '#fff',
          homeColor: home.color,
          homeSecondary: home.secondary,
          homeText: home.textColor || '#fff',
          scoreTextColor: '#1a1209',
          vsTextColor: '#c0b499',
          cellDiamondStroke: '#c8bfa8',
          hitLineColor: away.secondary,
          homeHitLineColor: home.secondary,
        };
    }
  };

  const t = getTheme();

  // ─── Inning linescore per-inning runs ────────────────────────────────────────
  const awayInningRuns = {};
  const homeInningRuns = {};
  (gameInfo.linescore || []).forEach(inn => {
    awayInningRuns[inn.num] = inn.away ?? '-';
    homeInningRuns[inn.num] = inn.home ?? 'x';
  });

  // ─── Play Cell Renderer ───────────────────────────────────────────────────────
  const renderPlayCell = (play, isHome = false) => {
    if (!play || !play.code) {
      return (
        <svg viewBox="0 0 40 40" width="28" height="28" style={{ display: 'block', margin: 'auto', opacity: 0.25 }}>
          <polygon
            points="20,35 35,20 20,5 5,20"
            fill="none"
            stroke={t.cellDiamondStroke}
            strokeWidth="1.2"
          />
        </svg>
      );
    }

    const { code, type, bases, isLooking } = play;
    const hitColor = isHome ? t.homeHitLineColor : t.hitLineColor;
    const pillBg = isHome ? t.homeColor : t.awayColor;
    const pillText = isHome ? t.homeText : t.awayText;

    if (type === 'hit' || type === 'hr' || type === 'walk') {
      const isHR = type === 'hr';

      // Determine filled bases
      const b1 = bases >= 1 || isHR;
      const b2 = bases >= 2 || isHR;
      const b3 = bases >= 3 || isHR;
      const b4 = isHR; // home = all 4

      const strokeW = isHR ? 3.5 : 2.5;

      return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <svg viewBox="0 0 40 40" width="30" height="30" style={{ display: 'block', overflow: 'visible' }}>
            {/* Diamond outline */}
            <polygon
              points="20,37 37,20 20,3 3,20"
              fill={isHR ? hitColor : 'none'}
              fillOpacity={isHR ? 0.15 : 0}
              stroke={t.cellDiamondStroke}
              strokeWidth="1.2"
            />
            {/* Base path lines drawn clockwise: 1B=bottom-right, 2B=top-right, 3B=top-left, HP=bottom-left */}
            {b1 && <line x1="20" y1="37" x2="37" y2="20" stroke={hitColor} strokeWidth={strokeW} strokeLinecap="round" />}
            {b2 && <line x1="37" y1="20" x2="20" y2="3" stroke={hitColor} strokeWidth={strokeW} strokeLinecap="round" />}
            {b3 && <line x1="20" y1="3" x2="3" y2="20" stroke={hitColor} strokeWidth={strokeW} strokeLinecap="round" />}
            {b4 && <line x1="3" y1="20" x2="20" y2="37" stroke={hitColor} strokeWidth={strokeW} strokeLinecap="round" />}
          </svg>
          {/* Code badge */}
          <span style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            fontSize: '7px',
            fontWeight: 900,
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1,
            padding: '1px 2px',
            borderRadius: '2px',
            backgroundColor: pillBg,
            color: pillText,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}>
            {code}
          </span>
        </div>
      );
    }

    if (type === 'strikeout') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative' }}>
          <svg viewBox="0 0 40 40" width="30" height="30" style={{ position: 'absolute', display: 'block', opacity: 0.22 }}>
            <polygon points="20,37 37,20 20,3 3,20" fill="none" stroke={t.cellDiamondStroke} strokeWidth="1.2" />
          </svg>
          <span style={{
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            fontSize: '17px',
            color: t.textPrimary,
            display: 'inline-block',
            transform: isLooking ? 'scaleX(-1)' : 'none',
            letterSpacing: '-0.04em',
            position: 'relative',
            zIndex: 1,
          }}>
            K
          </span>
        </div>
      );
    }

    // Field outs
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative' }}>
        <svg viewBox="0 0 40 40" width="30" height="30" style={{ position: 'absolute', display: 'block', opacity: 0.22 }}>
          <polygon points="20,37 37,20 20,3 3,20" fill="none" stroke={t.cellDiamondStroke} strokeWidth="1.2" />
        </svg>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          fontSize: type === 'error' ? '9px' : '8.5px',
          color: t.textSecondary,
          position: 'relative',
          zIndex: 1,
          letterSpacing: '-0.03em',
          textAlign: 'center',
          lineHeight: 1.1,
        }}>
          {code}
        </span>
      </div>
    );
  };

  // ─── Pitcher row stats renderer ───────────────────────────────────────────────
  const renderPitcherRow = (p, isHome) => {
    const ks = p.strikeouts?.length || 0;
    const color = isHome ? t.homeColor : t.awayColor;
    const text = isHome ? t.homeText : t.awayText;
    return (
      <tr key={p.id} style={{ borderTop: `1px solid ${t.borderLight}` }}>
        <td style={{ padding: '4px 8px 4px 10px', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '18px', height: '18px', borderRadius: '50%',
              backgroundColor: color, color: text,
              fontSize: '7.5px', fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              flexShrink: 0,
            }}>
              {p.number}
            </span>
            <span style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 600,
              fontSize: '11px',
              letterSpacing: '0.02em',
              color: t.textPrimary,
            }}>
              {p.name}
            </span>
          </div>
        </td>
        <td style={{ padding: '4px 6px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, color: t.textSecondary }}>
          {p.ip || '—'}
        </td>
        <td style={{ padding: '4px 6px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, color: t.textSecondary }}>
          {p.hits ?? '—'}
        </td>
        <td style={{ padding: '4px 6px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, color: t.textSecondary }}>
          {p.runs ?? '—'}
        </td>
        <td style={{ padding: '4px 6px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, color: t.textSecondary }}>
          {p.earnedRuns ?? '—'}
        </td>
        <td style={{ padding: '4px 6px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, color: t.textSecondary }}>
          {p.walks ?? '—'}
        </td>
        <td style={{ padding: '4px 8px 4px 6px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 800, color: t.textPrimary }}>
          {ks}
        </td>
      </tr>
    );
  };

  // ─── Scorecard table for one team ────────────────────────────────────────────
  const renderTeamScorecard = (teamData, isHome) => {
    const teamInfo = isHome ? gameInfo.homeTeam : gameInfo.awayTeam;
    const accentColor = isHome ? t.homeColor : t.awayColor;
    const accentText = isHome ? t.homeText : t.awayText;
    const accentSecondary = isHome ? t.homeSecondary : t.awaySecondary;
    const inningRuns = isHome ? homeInningRuns : awayInningRuns;

    const PLAYER_COL_W = 148;
    const INNING_COL_W = 42;

    return (
      <div style={{ marginBottom: '12px' }}>
        {/* Team header strip */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: accentColor,
          padding: '6px 12px',
          marginBottom: '0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.08em',
              color: accentText,
              textTransform: 'uppercase',
            }}>
              {teamInfo.name}
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              color: accentText,
              opacity: 0.65,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.04em',
            }}>
              {isHome ? 'HOME' : 'VISITING'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* R H E */}
            {[
              { label: 'R', val: teamInfo.score },
              { label: 'H', val: teamInfo.hits },
              { label: 'E', val: teamInfo.errors },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center', minWidth: '26px' }}>
                <div style={{ fontSize: '7px', fontWeight: 700, color: accentText, opacity: 0.6, letterSpacing: '0.08em', fontFamily: "'Inter', sans-serif" }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: accentText, lineHeight: 1, fontFamily: "'JetBrains Mono', monospace" }}>
                  {stat.val}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scorecard grid — no overflow clipping so export captures full width */}
        <div>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            minWidth: `${PLAYER_COL_W + innings.length * INNING_COL_W}px`,
            tableLayout: 'fixed',
          }}>
            <colgroup>
              <col style={{ width: `${PLAYER_COL_W}px` }} />
              {innings.map(n => <col key={n} style={{ width: `${INNING_COL_W}px` }} />)}
            </colgroup>

            {/* Header */}
            <thead>
              <tr style={{ backgroundColor: t.tableHeaderBg }}>
                <th style={{
                  textAlign: 'left', padding: '4px 8px',
                  fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em',
                  fontFamily: "'Inter', sans-serif",
                  color: t.textMuted, textTransform: 'uppercase',
                  borderBottom: `1.5px solid ${t.borderStrong}`,
                  borderRight: `1px solid ${t.borderLight}`,
                }}>
                  BATTING ORDER
                </th>
                {innings.map(n => (
                  <th key={n} style={{
                    textAlign: 'center', padding: '4px 2px',
                    fontSize: '9px', fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: t.textMuted,
                    borderBottom: `1.5px solid ${t.borderStrong}`,
                    borderLeft: `1px solid ${t.borderLight}`,
                  }}>
                    {n}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {teamData.batters.map((b, idx) => (
                <tr key={b.id || idx} style={{
                  height: '44px',
                  backgroundColor: idx % 2 === 1 ? t.tableRowAlt : 'transparent',
                  borderBottom: `1px solid ${t.borderLight}`,
                }}>
                  {/* Player cell */}
                  <td style={{
                    padding: '3px 8px', verticalAlign: 'middle',
                    borderRight: `1px solid ${t.borderStrong}`,
                    overflow: 'hidden',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {/* Position + Number pill */}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '2px 4px', borderRadius: '3px',
                        backgroundColor: accentColor, color: accentText,
                        fontSize: '7.5px', fontWeight: 800,
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: '0.01em', whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {b.position} {b.jerseyNumber}
                      </span>
                      {/* Name */}
                      <span style={{
                        fontSize: '11px', fontWeight: 700,
                        fontFamily: "'Oswald', sans-serif",
                        letterSpacing: '0.04em',
                        color: t.textPrimary,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '82px',
                      }}>
                        {b.name}
                      </span>
                    </div>
                  </td>

                  {/* Inning cells */}
                  {innings.map(n => {
                    const play = b.plays?.[n];
                    return (
                      <td key={n} style={{
                        verticalAlign: 'middle',
                        textAlign: 'center',
                        padding: '2px',
                        borderLeft: `1px solid ${t.borderLight}`,
                        position: 'relative',
                        height: '44px',
                      }}>
                        {renderPlayCell(play, isHome)}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Inning Linescore row */}
              <tr style={{
                backgroundColor: t.lineScoreBg,
                borderTop: `2px solid ${t.borderStrong}`,
              }}>
                <td style={{
                  padding: '5px 8px',
                  fontSize: '7.5px', fontWeight: 800, letterSpacing: '0.1em',
                  color: t.textMuted, textTransform: 'uppercase',
                  fontFamily: "'Inter', sans-serif",
                  borderRight: `1px solid ${t.borderStrong}`,
                }}>
                  RUNS / INNING
                </td>
                {innings.map(n => {
                  const runs = inningRuns[n];
                  const hasRuns = runs !== undefined && runs !== '-' && runs !== 'x' && parseInt(runs) > 0;
                  return (
                    <td key={n} style={{
                      textAlign: 'center', padding: '5px 2px',
                      borderLeft: `1px solid ${t.borderLight}`,
                      backgroundColor: n % 2 === 0 ? t.lineScoreAlt : 'transparent',
                    }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: hasRuns ? 900 : 600,
                        fontSize: hasRuns ? '13px' : '10px',
                        color: hasRuns ? accentColor : t.textMuted,
                        lineHeight: 1,
                        display: 'block',
                      }}>
                        {runs !== undefined ? runs : '—'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pitching Section */}
        {teamData.pitchers && teamData.pitchers.length > 0 && (
          <div style={{
            backgroundColor: t.pitchingBg,
            borderTop: `2px solid ${t.borderStrong}`,
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.borderStrong}` }}>
                  <th style={{
                    textAlign: 'left', padding: '4px 8px 3px 10px',
                    fontSize: '7.5px', fontWeight: 800, letterSpacing: '0.1em',
                    color: t.textMuted, textTransform: 'uppercase',
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    PITCHING
                  </th>
                  {['IP', 'H', 'R', 'ER', 'BB', 'K'].map(stat => (
                    <th key={stat} style={{
                      textAlign: 'center', padding: '4px 6px 3px',
                      fontSize: '7.5px', fontWeight: 800, letterSpacing: '0.1em',
                      color: t.textMuted, textTransform: 'uppercase',
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      {stat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teamData.pitchers.map(p => renderPitcherRow(p, isHome))}
              </tbody>
            </table>
          </div>
        )}


      </div>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────────────────────
  const away = gameInfo.awayTeam;
  const home = gameInfo.homeTeam;
  const awayWon = away.score > home.score;
  const homeWon = home.score > away.score;

  return (
    <div
      ref={graphicRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '920px',
        margin: '0 auto',
        backgroundColor: t.bg,
        padding: '10px',
        boxShadow: '0 30px 60px -15px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.08)',
      }}
    >
      {/* Outer frame border */}
      <div style={{
        position: 'relative',
        backgroundColor: t.paperBg,
        border: `3px solid ${t.borderStrong}`,
        outline: `1px solid ${t.outerFrame}`,
        outlineOffset: '4px',
      }}>

        {/* Paper grain texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E")`,
          opacity: 0.6,
        }} />

        {/* HERO HEADER: Teams + Score */}
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Top accent line */}
          <div style={{ display: 'flex', height: '5px' }}>
            <div style={{ flex: 1, backgroundColor: t.awayColor }} />
            <div style={{ flex: 1, backgroundColor: t.homeColor }} />
          </div>

          {/* Teams vs Score row */}
          <div style={{
            display: 'flex', alignItems: 'stretch',
            borderBottom: `2px solid ${t.borderStrong}`,
          }}>
            {/* Away team */}
            <div style={{
              flex: 1, padding: '18px 20px 14px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              borderRight: `1px solid ${t.borderLight}`,
            }}>
              <div style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: t.awayColor,
                fontFamily: "'Inter', sans-serif",
                marginBottom: '2px',
              }}>
                VISITING TEAM
              </div>
              <div style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: '28px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: awayWon ? t.awayColor : t.textPrimary,
                lineHeight: 1,
              }}>
                {away.name}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginTop: '6px',
              }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 900,
                  fontSize: '50px',
                  color: awayWon ? t.awayColor : t.textSecondary,
                  lineHeight: 1,
                }}>
                  {away.score}
                </span>
                {awayWon && (
                  <span style={{
                    fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em',
                    color: t.awayColor, fontFamily: "'Inter', sans-serif",
                    opacity: 0.8, textTransform: 'uppercase',
                    alignSelf: 'flex-end', paddingBottom: '6px',
                  }}>
                    WIN
                  </span>
                )}
              </div>
            </div>

            {/* VS divider */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '12px 16px',
              flexDirection: 'column', gap: '4px',
            }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '36px',
                color: t.vsTextColor,
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}>
                VS
              </div>
              <div style={{
                width: '1px', height: '20px',
                backgroundColor: t.borderLight,
              }} />
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '8px', fontWeight: 700,
                color: t.textMuted,
                letterSpacing: '0.04em',
              }}>
                {gameInfo.totalInnings > 9 ? `F/${gameInfo.totalInnings}` : 'FINAL'}
              </div>
            </div>

            {/* Home team */}
            <div style={{
              flex: 1, padding: '18px 20px 14px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end',
              borderLeft: `1px solid ${t.borderLight}`,
            }}>
              <div style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: t.homeColor,
                fontFamily: "'Inter', sans-serif",
                marginBottom: '2px',
              }}>
                HOME TEAM
              </div>
              <div style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: '28px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: homeWon ? t.homeColor : t.textPrimary,
                lineHeight: 1,
                textAlign: 'right',
              }}>
                {home.name}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginTop: '6px',
                flexDirection: 'row-reverse',
              }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 900,
                  fontSize: '50px',
                  color: homeWon ? t.homeColor : t.textSecondary,
                  lineHeight: 1,
                }}>
                  {home.score}
                </span>
                {homeWon && (
                  <span style={{
                    fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em',
                    color: t.homeColor, fontFamily: "'Inter', sans-serif",
                    opacity: 0.8, textTransform: 'uppercase',
                    alignSelf: 'flex-end', paddingBottom: '6px',
                  }}>
                    WIN
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Subtitle bar */}
          <div style={{
            padding: '7px 20px',
            borderBottom: `2px solid ${t.borderStrong}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: t.tableHeaderBg,
          }}>
            <span style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 600,
              fontSize: '11px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: t.textPrimary,
            }}>
              {customHeadline || gameInfo.dateDisplay}
            </span>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '10px',
              letterSpacing: '0.04em',
              color: t.textSecondary,
              textAlign: 'right',
            }}>
              {customSubtitle || `${gameInfo.venue} · ${gameInfo.headline}`}
            </span>
          </div>

          {/* SCORECARDS */}
          <div style={{ padding: '10px 0 0', position: 'relative', zIndex: 1 }}>
            {renderTeamScorecard(awayData, false)}
            
            {/* Divider between teams */}
            <div style={{
              height: '3px',
              backgroundImage: `linear-gradient(to right, ${t.awayColor}, ${t.borderStrong}, ${t.homeColor})`,
              margin: '6px 0',
            }} />
            
            {renderTeamScorecard(homeData, true)}
          </div>

          {/* Bottom accent line */}
          <div style={{ display: 'flex', height: '5px', marginTop: '10px' }}>
            <div style={{ flex: 1, backgroundColor: t.awayColor }} />
            <div style={{ flex: 1, backgroundColor: t.homeColor }} />
          </div>

          {/* Footer */}
          <div style={{
            padding: '8px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '8.5px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: t.textMuted,
            }}>
              {footerStr}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
