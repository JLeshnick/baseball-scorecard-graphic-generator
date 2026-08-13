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
  fontStyle = 'modern',
  showEraserMarks = false,
  eraserSeed = 0,
  customHeadline,
  customSubtitle,
  customFooter,
  customNotes,
  graphicRef,
  orientation = 'portrait',
  showPitchBreakdown = true,
  showDecisions = true,
  showEnvironmentBox = false,
  showHRDistances = true,
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
      fontHeader: "'Oswald', sans-serif",
      fontMono: "'JetBrains Mono', monospace",
      fontSans: "'Inter', sans-serif",
      fontDisplay: "'Bebas Neue', sans-serif",
    };

    let themeObj = {};

    switch (theme) {
      case 'team-dark':
        themeObj = {
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
        break;

      case 'vintage':
        themeObj = {
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
        break;

      case 'monochrome':
        themeObj = {
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
        break;

      case 'graffiti':
        themeObj = {
          ...base,
          bg: '#0c0d12',
          paperBg: '#14151f',
          outerFrame: '#ff0055',
          textPrimary: '#f8fafc',
          textSecondary: '#cbd5e1',
          textMuted: '#94a3b8',
          borderStrong: '#ff0055',
          borderLight: '#262838',
          tableHeaderBg: 'rgba(255,0,85,0.14)',
          tableRowAlt: 'rgba(255,255,255,0.03)',
          lineScoreBg: 'rgba(0,240,255,0.12)',
          lineScoreAlt: 'rgba(255,255,255,0.03)',
          pitchingBg: 'rgba(255,0,85,0.1)',
          awayColor: '#ff0055',
          awaySecondary: '#00f0ff',
          awayText: '#ffffff',
          homeColor: '#00f0ff',
          homeSecondary: '#ff0055',
          homeText: '#000000',
          scoreTextColor: '#f8fafc',
          vsTextColor: '#ff0055',
          cellDiamondStroke: '#00f0ff',
          hitLineColor: '#ff0055',
          homeHitLineColor: '#00f0ff',
        };
        break;

      case 'handwritten':
        themeObj = {
          ...base,
          bg: '#eadecc',
          paperBg: '#f7f3e9',
          outerFrame: '#b8a88a',
          textPrimary: '#1e293b',
          textSecondary: '#475569',
          textMuted: '#64748b',
          borderStrong: '#2563eb',
          borderLight: '#cbd5e1',
          tableHeaderBg: 'rgba(37,99,235,0.06)',
          tableRowAlt: 'rgba(37,99,235,0.03)',
          lineScoreBg: 'rgba(37,99,235,0.05)',
          lineScoreAlt: 'rgba(37,99,235,0.02)',
          pitchingBg: 'rgba(37,99,235,0.04)',
          awayColor: '#1d4ed8',
          awaySecondary: '#b91c1c',
          awayText: '#ffffff',
          homeColor: '#b91c1c',
          homeSecondary: '#1d4ed8',
          homeText: '#ffffff',
          scoreTextColor: '#1e293b',
          vsTextColor: '#2563eb',
          cellDiamondStroke: '#93c5fd',
          hitLineColor: '#1d4ed8',
          homeHitLineColor: '#b91c1c',
        };
        break;

      case 'team-light':
      default:
        themeObj = {
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
        break;
    }

    // Apply modular Font Style overrides
    const effectiveFontStyle = (theme === 'graffiti' || theme === 'handwritten') ? theme : fontStyle;

    if (effectiveFontStyle === 'handwritten') {
      themeObj.fontHeader = "'Caveat', cursive";
      themeObj.fontMono = "'Caveat', cursive";
      themeObj.fontSans = "'Caveat', cursive";
      themeObj.fontDisplay = "'Caveat', cursive";
      themeObj.isHandwritten = true;
    } else if (effectiveFontStyle === 'graffiti') {
      themeObj.fontHeader = "'Permanent Marker', cursive";
      themeObj.fontMono = "'Permanent Marker', cursive";
      themeObj.fontSans = "'Permanent Marker', cursive";
      themeObj.fontDisplay = "'Permanent Marker', cursive";
      themeObj.isGraffiti = true;
    }

    return themeObj;
  };

  const t = getTheme();

  /**
   * Refined Handwritten Text Renderer:
   * Uses Caveat (with OpenType 'calt' contextual alternates enabled) as the primary font,
   * applying subtle ±0.75° character tilt and ±0.3px vertical baseline shifts per letter.
   * Guarantees that identical letters look distinct while keeping handwriting clean & legible.
   */
  const renderHandwrittenText = (str, seedStr = '', extraStyle = {}) => {
    if (str === null || str === undefined) return null;
    const text = String(str);
    if (!t.isHandwritten) return <span style={extraStyle}>{text}</span>;

    return (
      <span style={{
        display: 'inline-flex', alignItems: 'baseline',
        fontFamily: "'Caveat', cursive",
        fontFeatureSettings: '"calt" 1, "liga" 1, "clig" 1',
        ...extraStyle
      }}>
        {text.split('').map((char, charIdx) => {
          if (char === ' ') return <span key={charIdx} style={{ width: '0.25em' }}> </span>;
          let hash = 0;
          const seed = `${seedStr}_${char}_${charIdx}`;
          for (let i = 0; i < seed.length; i++) {
            hash = (hash << 5) - hash + seed.charCodeAt(i);
          }
          const deg = (((hash % 15) - 7) * 0.1).toFixed(2); // -0.7deg to +0.7deg (subtle & clean!)
          const yShift = (((hash % 7) - 3) * 0.1).toFixed(2); // -0.3px to +0.3px

          return (
            <span
              key={charIdx}
              style={{
                display: 'inline-block',
                transform: `rotate(${deg}deg) translateY(${yShift}px)`,
              }}
            >
              {char}
            </span>
          );
        })}
      </span>
    );
  };

  /**
   * Helper: Places rubber eraser smudges, ghosted erased plays, and pencil scratch-out scribbles.
   * Uses eraserSeed so toggling or clicking 'randomize' re-rolls eraser placements dynamically.
   */
  const renderEraserOverlay = (cellKey) => {
    if (!showEraserMarks || !cellKey) return null;
    let hash = 0;
    const s = `${cellKey}_seed_${eraserSeed}`;
    for (let i = 0; i < s.length; i++) hash = (hash << 5) - hash + s.charCodeAt(i);

    // ~16% of cells get eraser marks
    if (Math.abs(hash) % 6 !== 1) return null;

    const GHOST_PLAYS = ['F8', '6-3', '4-3', 'L7', 'FOUL', 'FC', 'P5', 'S2', 'B1', 'K', '1B'];
    const ghostPlay = GHOST_PLAYS[Math.abs(hash) % GHOST_PLAYS.length];
    const rotation = (hash % 21) - 10; // -10deg to +10deg
    const hasScribble = Math.abs(hash) % 2 === 0;

    return (
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 0, overflow: 'hidden',
      }}>
        {/* Rubber eraser smudge texture */}
        <div style={{
          position: 'absolute', width: '75%', height: '65%', borderRadius: '40%',
          background: 'radial-gradient(ellipse at center, rgba(235,225,200,0.65) 0%, rgba(200,190,165,0.4) 60%, transparent 100%)',
          filter: 'blur(1.5px)',
          transform: `rotate(${rotation}deg)`,
        }} />

        {/* Pencil scribble / scratch-out mark */}
        {hasScribble && (
          <svg
            viewBox="0 0 50 30"
            width="34"
            height="20"
            style={{
              position: 'absolute',
              opacity: 0.45,
              transform: `rotate(${rotation * 1.2}deg)`,
              zIndex: 1,
            }}
          >
            <path
              d="M 4,14 Q 10,6 18,20 T 30,8 T 44,18"
              fill="none"
              stroke={t.textPrimary}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 6,10 Q 16,22 26,8 T 42,20"
              fill="none"
              stroke={t.textSecondary}
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {/* Ghosted erased play with line-through stroke */}
        <span style={{
          position: 'absolute', fontSize: '7.5px', fontWeight: 700,
          fontFamily: t.isHandwritten ? "'Caveat', cursive" : "'JetBrains Mono', monospace",
          color: t.textMuted, opacity: 0.35, textDecoration: 'line-through',
          textDecorationColor: 'rgba(120,90,70,0.6)',
          transform: `rotate(${rotation * 0.7}deg)`,
          zIndex: 0,
        }}>
          {ghostPlay}
        </span>
      </div>
    );
  };

  // ─── Inning linescore per-inning runs ────────────────────────────────────────
  const awayInningRuns = {};
  const homeInningRuns = {};
  (gameInfo.linescore || []).forEach(inn => {
    awayInningRuns[inn.num] = inn.away ?? '-';
    homeInningRuns[inn.num] = inn.home ?? 'x';
  });

  // ─── Play Cell Renderer ───────────────────────────────────────────────────────
  const renderPlayCell = (play, isHome = false, cellKey = '') => {
    if (!play || !play.code) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {renderEraserOverlay(cellKey)}
          <svg viewBox="0 0 40 40" width="28" height="28" style={{ display: 'block', margin: 'auto', opacity: 0.25, position: 'relative', zIndex: 1 }}>
            <polygon
              points="20,35 35,20 20,5 5,20"
              fill="none"
              stroke={t.cellDiamondStroke}
              strokeWidth="1.2"
            />
          </svg>
        </div>
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
          {renderEraserOverlay(cellKey)}
          <svg viewBox="0 0 40 40" width="30" height="30" style={{ display: 'block', overflow: 'visible', position: 'relative', zIndex: 1 }}>
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
            fontSize: '7.5px',
            fontWeight: 900,
            fontFamily: t.fontMono,
            lineHeight: 1,
            padding: '1.5px 3px',
            borderRadius: '2px',
            backgroundColor: pillBg,
            color: pillText,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            zIndex: 2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}>
            {renderHandwrittenText(code, cellKey, { justifyContent: 'center' })}
          </span>
        </div>
      );
    }

    if (type === 'strikeout') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative' }}>
          {renderEraserOverlay(cellKey)}
          <svg viewBox="0 0 40 40" width="30" height="30" style={{ position: 'absolute', display: 'block', opacity: 0.22, zIndex: 1 }}>
            <polygon points="20,37 37,20 20,3 3,20" fill="none" stroke={t.cellDiamondStroke} strokeWidth="1.2" />
          </svg>
          <span style={{
            fontFamily: t.fontHeader,
            fontWeight: 700,
            fontSize: '17px',
            color: t.textPrimary,
            display: 'inline-block',
            transform: isLooking ? 'scaleX(-1)' : 'none',
            letterSpacing: '-0.04em',
            position: 'relative',
            zIndex: 2,
          }}>
            {renderHandwrittenText('K', cellKey + '_K')}
          </span>
        </div>
      );
    }

    // Field outs
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative' }}>
        {renderEraserOverlay(cellKey)}
        <svg viewBox="0 0 40 40" width="30" height="30" style={{ position: 'absolute', display: 'block', opacity: 0.22, zIndex: 1 }}>
          <polygon points="20,37 37,20 20,3 3,20" fill="none" stroke={t.cellDiamondStroke} strokeWidth="1.2" />
        </svg>
        <span style={{
          fontFamily: t.fontMono,
          fontWeight: 700,
          fontSize: type === 'error' ? '9px' : '8.5px',
          color: t.textSecondary,
          position: 'relative',
          zIndex: 2,
          letterSpacing: '-0.03em',
          textAlign: 'center',
          lineHeight: 1.1,
        }}>
          {renderHandwrittenText(code, cellKey)}
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
              fontFamily: t.fontMono,
              flexShrink: 0,
            }}>
              {p.number}
            </span>
            <span style={{
              fontFamily: t.fontHeader,
              fontWeight: 600,
              fontSize: '11px',
              letterSpacing: '0.02em',
              color: t.textPrimary,
            }}>
              {p.name}
            </span>
          </div>
        </td>
        <td style={{ padding: '4px 6px', textAlign: 'center', fontFamily: t.fontMono, fontSize: '10px', fontWeight: 700, color: t.textSecondary }}>
          {p.ip || '—'}
        </td>
        <td style={{ padding: '4px 6px', textAlign: 'center', fontFamily: t.fontMono, fontSize: '10px', fontWeight: 700, color: t.textSecondary }}>
          {p.hits ?? '—'}
        </td>
        <td style={{ padding: '4px 6px', textAlign: 'center', fontFamily: t.fontMono, fontSize: '10px', fontWeight: 700, color: t.textSecondary }}>
          {p.runs ?? '—'}
        </td>
        <td style={{ padding: '4px 6px', textAlign: 'center', fontFamily: t.fontMono, fontSize: '10px', fontWeight: 700, color: t.textSecondary }}>
          {p.earnedRuns ?? '—'}
        </td>
        <td style={{ padding: '4px 6px', textAlign: 'center', fontFamily: t.fontMono, fontSize: '10px', fontWeight: 700, color: t.textSecondary }}>
          {p.walks ?? '—'}
        </td>
        <td style={{ padding: '4px 8px 4px 6px', textAlign: 'center', fontFamily: t.fontMono, fontSize: '10px', fontWeight: 800, color: t.textPrimary }}>
          {ks}
        </td>
        <td style={{ padding: '4px 8px 4px 6px', textAlign: 'center', fontFamily: t.fontMono, fontSize: '10px', fontWeight: 600, color: t.textMuted, opacity: 0.75 }}>
          {p.totalPitches ?? '—'}
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

    const POS_COL_W = 32;
    const NAME_COL_W = 116;
    const PLAYER_COL_W = POS_COL_W + NAME_COL_W;
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
              fontFamily: t.fontHeader,
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
              fontFamily: t.fontMono,
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
                <div style={{ fontSize: '7px', fontWeight: 700, color: accentText, opacity: 0.6, letterSpacing: '0.08em', fontFamily: t.fontSans }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: accentText, lineHeight: 1, fontFamily: t.fontMono }}>
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
              <col style={{ width: '22px' }} />
              <col style={{ width: `${POS_COL_W}px` }} />
              <col style={{ width: `${NAME_COL_W - 22}px` }} />
              {innings.map(n => <col key={n} style={{ width: `${INNING_COL_W}px` }} />)}
            </colgroup>

            {/* Header */}
            <thead>
              <tr style={{ backgroundColor: t.tableHeaderBg }}>
                <th colSpan={3} style={{
                  borderBottom: `1.5px solid ${t.borderStrong}`,
                  borderRight: `1.5px solid ${t.borderStrong}`,
                  backgroundColor: t.tableHeaderBg,
                }} />
                {innings.map(n => (
                  <th key={n} style={{
                    textAlign: 'center', padding: '4px 2px',
                    fontSize: '9px', fontWeight: 800,
                    fontFamily: t.fontMono,
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
              {teamData.batters.map((b, bIdx) => {
                const nameLen = b.name ? b.name.length : 0;
                const batterFontSize = nameLen > 11 ? '9px' : nameLen > 8 ? '10px' : (t.isHandwritten ? '13px' : '11px');
                return (
                  <tr key={b.id || bIdx} style={{
                    borderBottom: `1px solid ${t.borderLight}`,
                    backgroundColor: bIdx % 2 === 1 ? t.tableRowAlt : 'transparent',
                  }}>
                    {/* Vertical 90-degree rotated BATTING Sidebar (spans all batter rows) */}
                    {bIdx === 0 && (
                      <td rowSpan={teamData.batters.length} style={{
                        width: '22px', backgroundColor: t.tableHeaderBg,
                        borderRight: `1.5px solid ${t.borderStrong}`,
                        textAlign: 'center', verticalAlign: 'middle',
                        padding: '4px 0',
                      }}>
                        <div style={{
                          writingMode: 'vertical-rl',
                          transform: 'rotate(180deg)',
                          fontFamily: t.fontSans,
                          fontSize: '8px', fontWeight: 900,
                          letterSpacing: '0.22em',
                          color: t.textMuted, textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                          margin: '0 auto',
                        }}>
                          BATTING
                        </div>
                      </td>
                    )}

                    {/* Position code (P, C, 1B, 2B, 3B, SS, LF, CF, RF, DH, PH, PR) */}
                    <td style={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      padding: '2px 1px',
                      borderRight: `1px solid ${t.borderLight}`,
                      backgroundColor: t.tableRowAlt,
                    }}>
                      <span style={{
                        display: 'inline-block',
                        fontFamily: t.fontMono,
                        fontWeight: 800,
                        fontSize: '9px',
                        color: accentColor,
                        letterSpacing: '0.02em',
                      }}>
                        {b.position}
                      </span>
                    </td>

                    {/* Batter Name (Never truncates with ...) */}
                    <td style={{
                      verticalAlign: 'middle',
                      padding: '4px 6px',
                      borderRight: `1.5px solid ${t.borderStrong}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '18px', height: '18px', borderRadius: '50%',
                          backgroundColor: accentColor, color: accentText,
                          fontSize: '7.5px', fontWeight: 800,
                          fontFamily: t.fontMono,
                          flexShrink: 0,
                        }}>
                          {b.jerseyNumber}
                        </span>
                        <span style={{
                          fontSize: batterFontSize, fontWeight: 700,
                          letterSpacing: '0.02em', textTransform: 'uppercase',
                          fontFamily: t.fontHeader,
                          color: t.textPrimary,
                          whiteSpace: 'nowrap',
                        }}>
                          {renderHandwrittenText(b.name, 'batter_' + b.id)}
                        </span>
                      </div>
                    </td>

                    {/* Inning cells */}
                    {innings.map(n => {
                      const play = b.plays?.[n];
                      return (
                        <td key={n} style={{
                          textAlign: 'center', verticalAlign: 'middle',
                          padding: '1px',
                          borderLeft: `1px solid ${t.borderLight}`,
                          backgroundColor: n % 2 === 0 ? t.tableInningAlt : 'transparent',
                          position: 'relative',
                        }}>
                          {renderPlayCell(play, n, b.id)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Inning Linescore row */}
              <tr style={{
                backgroundColor: t.lineScoreBg,
                borderTop: `2px solid ${t.borderStrong}`,
              }}>
                <td colSpan={3} style={{
                  padding: '5px 8px',
                  fontSize: '8.5px', fontWeight: 800, letterSpacing: '0.08em',
                  fontFamily: t.fontSans,
                  color: t.textMuted, textTransform: 'uppercase',
                  borderRight: `1.5px solid ${t.borderStrong}`,
                }}>
                  RUNS
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
                        fontFamily: t.fontMono,
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

        {/* Unified Pitching Table */}
        {teamData.pitchers && teamData.pitchers.length > 0 && (
          <div style={{
            backgroundColor: t.pitchingBg,
            borderTop: `2px solid ${t.borderStrong}`,
          }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse',
              tableLayout: 'fixed',
            }}>
              <colgroup>
                <col style={{ width: '22px' }} />
                <col style={{ width: `${POS_COL_W + NAME_COL_W - 22}px` }} />
                {innings.map(n => <col key={n} style={{ width: `${INNING_COL_W}px` }} />)}
              </colgroup>
              <tbody>
                {teamData.pitchers.map((p, pIdx) => {
                  const ks = p.strikeouts?.length || 0;
                  const color = isHome ? t.homeColor : t.awayColor;
                  const text = isHome ? t.homeText : t.awayText;
                  return (
                    <tr key={p.id} style={{
                      borderBottom: `1px solid ${t.borderLight}`,
                      backgroundColor: pIdx % 2 === 1 ? t.tableRowAlt : 'transparent',
                    }}>
                      {/* Vertical 90-degree rotated PITCHING Sidebar (spans all pitcher rows) */}
                      {pIdx === 0 && (
                        <td rowSpan={teamData.pitchers.length} style={{
                          width: '22px', backgroundColor: t.tableHeaderBg,
                          borderRight: `1.5px solid ${t.borderStrong}`,
                          textAlign: 'center', verticalAlign: 'middle',
                          padding: '4px 0',
                        }}>
                          <div style={{
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            fontFamily: t.fontSans,
                            fontSize: '8px', fontWeight: 900,
                            letterSpacing: '0.22em',
                            color: t.textMuted, textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                            margin: '0 auto',
                          }}>
                            PITCHING
                          </div>
                        </td>
                      )}
                      {/* Name & Core Pitching Stats (Stacked so names never truncate to ...) */}
                      <td style={{
                        padding: '3px 6px',
                        borderRight: `1.5px solid ${t.borderStrong}`,
                        verticalAlign: 'middle',
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '15px', height: '15px', borderRadius: '50%',
                              backgroundColor: color, color: text,
                              fontSize: '7px', fontWeight: 800,
                              fontFamily: t.fontMono, flexShrink: 0,
                            }}>
                              {p.number}
                            </span>
                            <span style={{
                              fontFamily: t.fontHeader, fontWeight: 700,
                              fontSize: p.name && p.name.length > 11 ? '9.5px' : '11px', letterSpacing: '0.02em',
                              color: t.textPrimary, whiteSpace: 'nowrap',
                            }}>
                              {p.name}
                            </span>
                          </div>
                          {/* Stats summary row: IP H R ER BB K */}
                          <div style={{
                            fontFamily: t.fontMono, fontSize: '7.5px', fontWeight: 700,
                            color: t.textMuted, whiteSpace: 'nowrap',
                            display: 'flex', gap: '4px', opacity: 0.9,
                          }}>
                            <span>{p.ip || '—'}IP</span>
                            <span>{p.hits ?? 0}H</span>
                            <span>{p.runs ?? 0}R</span>
                            <span>{p.earnedRuns ?? 0}ER</span>
                            <span>{p.walks ?? 0}BB</span>
                            <span style={{ color: t.textPrimary, fontWeight: 800 }}>{ks}K</span>
                          </div>
                        </div>
                      </td>

                      {/* Inning Pitch Breakdown Cells (or blank space if disabled) */}
                      {innings.map(n => {
                        if (!showPitchBreakdown) {
                          return (
                            <td key={n} style={{ borderLeft: `1px solid ${t.borderLight}` }} />
                          );
                        }
                        const innStat = p.pitchesByInning?.[n];
                        const cnt = innStat?.pitches || 0;
                        const str = innStat?.strikes || 0;
                        const bll = innStat?.balls || 0;
                        return (
                          <td key={n} style={{
                            textAlign: 'center', padding: '2px 1px',
                            borderLeft: `1px solid ${t.borderLight}`,
                            verticalAlign: 'middle',
                          }}>
                            {cnt > 0 ? (
                              <div style={{ lineHeight: 1 }}>
                                <span style={{ fontFamily: t.fontMono, fontSize: '8.5px', fontWeight: 800, color: t.textPrimary, display: 'block' }}>
                                  {cnt}
                                </span>
                                <span style={{ fontFamily: t.fontMono, fontSize: '6px', fontWeight: 600, color: t.textMuted, opacity: 0.8, display: 'block', marginTop: '1px' }}>
                                  {str}s/{bll}b
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontFamily: t.fontMono, fontSize: '8px', color: t.textMuted, opacity: 0.3 }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
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

  const isLandscape = orientation === 'landscape';
  const totalInningsCount = Math.max(9, gameInfo.totalInnings || 9);
  const graphicMaxWidth = isLandscape
    ? `${Math.max(1360, 1360 + (totalInningsCount - 9) * 90)}px`
    : '920px';

  return (
    <div
      ref={graphicRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: graphicMaxWidth,
        margin: '0 auto',
        backgroundColor: t.bg,
        padding: '10px',
        boxShadow: '0 30px 60px -15px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.08)',
        transition: 'max-width 0.3s ease',
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
                fontFamily: t.fontSans,
                marginBottom: '2px',
              }}>
                VISITING TEAM
              </div>
              <div style={{
                fontFamily: t.fontHeader,
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
                  fontFamily: t.fontMono,
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
                    color: t.awayColor, fontFamily: t.fontSans,
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
                fontFamily: t.fontDisplay,
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
                fontFamily: t.fontMono,
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
                fontFamily: t.fontSans,
                marginBottom: '2px',
              }}>
                HOME TEAM
              </div>
              <div style={{
                fontFamily: t.fontHeader,
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
                  fontFamily: t.fontMono,
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
                    color: t.homeColor, fontFamily: t.fontSans,
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
              fontFamily: t.fontHeader,
              fontWeight: 600,
              fontSize: '11px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: t.textPrimary,
            }}>
              {customHeadline || gameInfo.dateDisplay}
            </span>
            <span style={{
              fontFamily: t.fontSans,
              fontWeight: 500,
              fontSize: '10px',
              letterSpacing: '0.04em',
              color: t.textSecondary,
              textAlign: 'right',
            }}>
              {customSubtitle !== undefined ? customSubtitle : `${gameInfo.venue} · ${gameInfo.headline}`}
            </span>
          </div>

          {/* Combined Decisions + Environment Bar */}
          {((showDecisions && (gameInfo.decisions?.winner || gameInfo.decisions?.loser)) || (showEnvironmentBox && (gameInfo.weatherStr || gameInfo.attendance || gameInfo.durationStr))) && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
              backgroundColor: t.tableHeaderBg, padding: '4px 14px',
              borderBottom: `1px solid ${t.borderLight}`,
              fontSize: '8.5px', fontWeight: 600, fontFamily: t.fontMono, color: t.textMuted,
            }}>
              {/* Left side: Pitcher Decisions */}
              {showDecisions && (gameInfo.decisions?.winner || gameInfo.decisions?.loser) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700 }}>
                  {gameInfo.decisions.winner && (
                    <span><strong style={{ color: t.homeColor }}>WIN:</strong> {gameInfo.decisions.winner}</span>
                  )}
                  {gameInfo.decisions.loser && (
                    <span><strong style={{ color: t.awayColor }}>LOSS:</strong> {gameInfo.decisions.loser}</span>
                  )}
                  {gameInfo.decisions.save && (
                    <span><strong style={{ color: t.textPrimary }}>SAVE:</strong> {gameInfo.decisions.save}</span>
                  )}
                </div>
              )}

              {/* Right side: Weather, Attendance & Duration */}
              {showEnvironmentBox && (gameInfo.weatherStr || gameInfo.attendance || gameInfo.durationStr) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {gameInfo.weatherStr && <span>{gameInfo.weatherStr}</span>}
                  {gameInfo.attendance && <span>{gameInfo.attendance}</span>}
                  {gameInfo.durationStr && <span>{gameInfo.durationStr}</span>}
                </div>
              )}
            </div>
          )}

          {/* SCORECARDS */}
          {isLandscape ? (
            <div style={{
              display: 'flex', gap: '10px', alignItems: 'flex-start',
              padding: '10px 0 0', position: 'relative', zIndex: 1,
            }}>
              <div style={{ flex: 1, minWidth: 0, overflowX: 'auto' }}>
                {renderTeamScorecard(awayData, false)}
              </div>

              {/* Vertical divider between teams */}
              <div style={{
                width: '3px', alignSelf: 'stretch',
                backgroundImage: `linear-gradient(to bottom, ${t.awayColor}, ${t.borderStrong}, ${t.homeColor})`,
                margin: '0 1px',
                borderRadius: '2px',
              }} />

              <div style={{ flex: 1, minWidth: 0, overflowX: 'auto' }}>
                {renderTeamScorecard(homeData, true)}
              </div>
            </div>
          ) : (
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
          )}

          {/* Custom Game Notes & Highlights Block — seamless part of scorecard paper */}
          {customNotes && (
            <div style={{
              marginTop: '12px',
              padding: '6px 4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{
                fontSize: '8px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: t.textMuted,
                fontFamily: t.fontSans,
                opacity: 0.8,
              }}>
                GAME NOTES & HIGHLIGHTS
              </div>
              <div style={{
                fontSize: t.isHandwritten ? '14px' : '11px',
                fontWeight: 600,
                lineHeight: 1.4,
                color: t.textPrimary,
                fontFamily: t.fontHeader,
                whiteSpace: 'pre-wrap',
              }}>
                {renderHandwrittenText(customNotes, 'notes')}
              </div>
            </div>
          )}

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
              fontFamily: t.fontSans,
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
