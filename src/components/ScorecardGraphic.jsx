import React from 'react';
import { X } from 'lucide-react';
import { getScorecardTheme } from '../utils/themeProvider';

/**
 * ScorecardGraphic Component — Premium Graphic Art Print Edition
 * Redesigned for frameable poster aesthetics: prominent teams + score hero,
 * per-inning linescore, pitching stats table, SVG diamond base paths, and
 * a rich multi-theme system.
 */
const ScorecardGraphic = ({
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
  showEndInningBases = true, // default ON: solid lines for end-of-inning base advancement
  showStatcast = false, // default OFF as requested
  showMomentum = false, // default OFF as requested
  showMvp = false, // default OFF as requested
  showExtraEvents = true,
  showTeamWatermarks = true,
  isBlankScorecard = false,
  customAwayColor,
  customAwaySecondary,
  customHomeColor,
  customHomeSecondary,
  onCellClick = null,
  onBatterClick = null,
  onPitcherClick = null,
  activeCellKey = null,
  activePitcherKey = null,
  isInteractive = false,
  isExporting = false,
  isAdvancedMode = false,
  isMobile = false,
  scoringMode = 'mlb',
}) => {
  if (!data) return null;

  const { gameInfo, awayData, homeData } = data;
  const footerStr =
    customFooter ||
    `${gameInfo.venue.toUpperCase()} • ${gameInfo.dateDisplay}`;

  const innings = Array.from(
    { length: Math.max(9, gameInfo.totalInnings || 9) },
    (_, i) => i + 1
  );

  const effectiveShowPitchBreakdown = showPitchBreakdown;
  const effectiveShowStatcast = isAdvancedMode && showStatcast;
  const effectiveShowMomentum = isAdvancedMode && showMomentum;
  const effectiveShowMvp = isAdvancedMode && showMvp;
  const effectiveShowExtraEvents = isAdvancedMode && showExtraEvents;
  const effectiveShowEraserMarks = isAdvancedMode && showEraserMarks;

  // ─── Theme System ────────────────────────────────────────────────────────────
  const t = getScorecardTheme({
    theme,
    fontStyle,
    gameInfo,
    customAwayColor,
    customAwaySecondary,
    customHomeColor,
    customHomeSecondary,
  });
  const isDark = Boolean(t.isDark || (typeof theme === 'string' && theme.includes('dark')) || theme === 'chalkboard' || theme === 'midnight' || theme === 'blueprint');

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
        paddingRight: '6px',
        marginRight: '2px',
        overflow: 'visible',
        ...extraStyle
      }}>
        {text.split('').map((char, charIdx) => {
          if (char === ' ') return <span key={charIdx} style={{ width: '0.25em' }}> </span>;
          let hash = 0;
          const seed = `${seedStr}_${char}_${charIdx}`;
          for (let i = 0; i < seed.length; i++) {
            hash = (hash << 5) - hash + seed.charCodeAt(i);
          }
          const deg = (((hash % 15) - 7) * 0.08).toFixed(2); // -0.56deg to +0.56deg (subtle & clean!)
          const yShift = (((hash % 7) - 3) * 0.08).toFixed(2); // -0.24px to +0.24px

          return (
            <span
              key={charIdx}
              style={{
                display: 'inline-block',
                transform: `rotate(${deg}deg) translateY(${yShift}px)`,
                paddingRight: charIdx === text.length - 1 ? '4px' : '0px',
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
  const renderSinglePlayCell = (play, isHome = false, cellKey = '') => {
    const isMulti = cellKey.includes('_multi_');
    const diamondSize = isMulti ? '23' : '30';
    const badgeFontSize = isMulti ? '5px' : '6.5px';
    const badgePad = isMulti ? '0.5px 2px' : '1px 3px';

    if (!play || !play.code || isBlankMode) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {renderEraserOverlay(cellKey)}
          <svg viewBox="0 0 40 40" width={isMulti ? '20' : '28'} height={isMulti ? '20' : '28'} style={{ display: 'block', margin: 'auto', opacity: 0.25, position: 'relative', zIndex: 1 }}>
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

    const { code, type, bases, atBatBases, isLooking, extraEvent } = play;
    const hitColor = isHome ? t.homeHitLineColor : t.hitLineColor;
    const pillBg = isHome ? t.homeColor : t.awayColor;
    const pillText = isHome ? t.homeText : t.awayText;

    const extraEventBadge = effectiveShowExtraEvents && extraEvent ? (
      <span style={{
        position: 'absolute', top: '1px', left: isMulti ? '9px' : '2px',
        fontSize: badgeFontSize, fontWeight: 900, fontFamily: t.fontMono,
        lineHeight: 1, padding: badgePad, borderRadius: '2px',
        backgroundColor: isHome ? t.homeSecondary : t.awaySecondary,
        color: '#000000', zIndex: 3, boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }}>
        {extraEvent}
      </span>
    ) : null;

    const subLetterBadge = play.subLetter ? (
      <span style={{
        position: 'absolute', top: '1px', left: (effectiveShowExtraEvents && extraEvent) ? (isMulti ? '18px' : '20px') : (isMulti ? '9px' : '2px'),
        fontSize: badgeFontSize, fontWeight: 900, fontFamily: t.fontMono,
        lineHeight: 1,
        color: isHome ? t.homeColor : t.awayColor,
        zIndex: 3,
      }}>
        {play.subLetter}.
      </span>
    ) : null;

    const baseOutBadge = play.outAtBase ? (
      <span
        style={{
          position: 'absolute',
          top: '1px',
          right: '1.5px',
          fontSize: badgeFontSize,
          fontWeight: 900,
          fontFamily: t.fontMono,
          lineHeight: 1,
          padding: badgePad,
          borderRadius: '2px',
          backgroundColor: '#ef4444',
          color: '#ffffff',
          zIndex: 3,
          boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
        }}
      >
        {play.outAtBaseEvent === 'CS' ? 'CS' : play.outAtBaseEvent === 'PO' ? 'PO' : 'X'} {play.outAtBase === 4 ? 'HP' : `${play.outAtBase}B`}
      </span>
    ) : null;

    if (type === 'hit' || type === 'hr' || type === 'walk' || (bases && bases >= 1) || (atBatBases && atBatBases >= 1)) {
      const isHR = type === 'hr';

      // Own at-bat reach (bases reached on batter's own at-bat) -> drawn as DASHED lines
      const atBatReach = isHR
        ? 4
        : (atBatBases !== undefined ? atBatBases : ((type === 'hit' || type === 'walk') ? (bases || 1) : 0));

      // End of inning reach (total bases reached after subsequent plays) -> drawn as SOLID lines
      const endInningReach = isHR ? 4 : (bases !== undefined ? bases : atBatReach);

      // Own at-bat segments (1 to atBatReach): drawn as DASHED
      const b1Dash = !isHR && atBatReach >= 1;
      const b2Dash = !isHR && atBatReach >= 2;
      const b3Dash = !isHR && atBatReach >= 3;
      const b4Dash = !isHR && atBatReach >= 4;

      // Subsequent end-of-inning segments (atBatReach+1 to endInningReach): drawn as SOLID
      const b1Solid = isHR || (showEndInningBases && endInningReach >= 1 && 1 > atBatReach);
      const b2Solid = isHR || (showEndInningBases && endInningReach >= 2 && 2 > atBatReach);
      const b3Solid = isHR || (showEndInningBases && endInningReach >= 3 && 3 > atBatReach);
      const b4Solid = isHR || (showEndInningBases && endInningReach >= 4 && 4 > atBatReach);

      const outAtBase = play.outAtBase;

      return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          {renderEraserOverlay(cellKey)}
          {extraEventBadge}
          {subLetterBadge}
          {baseOutBadge}
          <svg viewBox="0 0 40 40" width={diamondSize} height={diamondSize} style={{ display: 'block', overflow: 'visible', position: 'relative', zIndex: 1 }}>
            <polygon
              points="20,37 37,20 20,3 3,20"
              fill={isHR ? hitColor : 'none'}
              fillOpacity={isHR ? 0.15 : 0}
              stroke={t.cellDiamondStroke}
              strokeWidth="1.0"
            />
            {b1Solid && <line x1="20" y1="37" x2="37" y2="20" stroke={hitColor} strokeWidth="2.4" strokeLinecap="round" />}
            {b1Dash && <line x1="20" y1="37" x2="37" y2="20" stroke={hitColor} strokeWidth="2.0" strokeLinecap="round" strokeDasharray="1.4 3.6" />}

            {b2Solid && <line x1="37" y1="20" x2="20" y2="3" stroke={hitColor} strokeWidth="2.4" strokeLinecap="round" />}
            {b2Dash && <line x1="37" y1="20" x2="20" y2="3" stroke={hitColor} strokeWidth="2.0" strokeLinecap="round" strokeDasharray="1.4 3.6" />}

            {b3Solid && <line x1="20" y1="3" x2="3" y2="20" stroke={hitColor} strokeWidth="2.4" strokeLinecap="round" />}
            {b3Dash && <line x1="20" y1="3" x2="3" y2="20" stroke={hitColor} strokeWidth="2.0" strokeLinecap="round" strokeDasharray="1.4 3.6" />}

            {b4Solid && <line x1="3" y1="20" x2="20" y2="37" stroke={hitColor} strokeWidth="2.4" strokeLinecap="round" />}
            {b4Dash && <line x1="3" y1="20" x2="20" y2="37" stroke={hitColor} strokeWidth="2.0" strokeLinecap="round" strokeDasharray="1.4 3.6" />}

            {/* Out on Basepaths Cross Marks */}
            {outAtBase === 1 && (
              <text x="37" y="24" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="900">X</text>
            )}
            {outAtBase === 2 && (
              <>
                <line x1="37" y1="20" x2="28.5" y2="11.5" stroke="#ef4444" strokeWidth="2.0" strokeDasharray="2 2" strokeLinecap="round" />
                <text x="28.5" y="14" textAnchor="middle" fill="#ef4444" fontSize="7.5" fontWeight="900">X</text>
              </>
            )}
            {outAtBase === 3 && (
              <>
                <line x1="20" y1="3" x2="11.5" y2="11.5" stroke="#ef4444" strokeWidth="2.0" strokeDasharray="2 2" strokeLinecap="round" />
                <text x="11.5" y="14" textAnchor="middle" fill="#ef4444" fontSize="7.5" fontWeight="900">X</text>
              </>
            )}
            {outAtBase === 4 && (
              <>
                <line x1="3" y1="20" x2="11.5" y2="28.5" stroke="#ef4444" strokeWidth="2.0" strokeDasharray="2 2" strokeLinecap="round" />
                <text x="11.5" y="31" textAnchor="middle" fill="#ef4444" fontSize="7.5" fontWeight="900">X</text>
              </>
            )}
          </svg>
          <span style={{
            position: 'absolute',
            bottom: '1.5px',
            right: '1.5px',
            fontSize: isMulti ? '6.5px' : '7.5px',
            fontWeight: 900,
            fontFamily: t.fontMono,
            lineHeight: 1,
            padding: isMulti ? '1px 2px' : '1.5px 3px',
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
          {extraEventBadge}
          {subLetterBadge}
          {baseOutBadge}
          <svg viewBox="0 0 40 40" width={diamondSize} height={diamondSize} style={{ position: 'absolute', display: 'block', opacity: 0.22, zIndex: 1 }}>
            <polygon points="20,37 37,20 20,3 3,20" fill="none" stroke={t.cellDiamondStroke} strokeWidth="1.2" />
          </svg>
          <span style={{
            fontFamily: t.fontHeader,
            fontWeight: 700,
            fontSize: isMulti ? '14px' : '17px',
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
        {extraEventBadge}
        {subLetterBadge}
        {baseOutBadge}
        <svg viewBox="0 0 40 40" width={diamondSize} height={diamondSize} style={{ position: 'absolute', display: 'block', opacity: 0.22, zIndex: 1 }}>
          <polygon points="20,37 37,20 20,3 3,20" fill="none" stroke={t.cellDiamondStroke} strokeWidth="1.2" />
        </svg>
        <span style={{
          fontFamily: t.fontMono,
          fontWeight: 700,
          fontSize: isMulti ? '7.5px' : (type === 'error' ? '9px' : '8.5px'),
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

  const renderPlayCell = (playOrArray, isHome = false, cellKey = '') => {
    if (isBlankMode) {
      return renderSinglePlayCell(null, isHome, cellKey);
    }
    if (Array.isArray(playOrArray)) {
      if (playOrArray.length === 0) return renderSinglePlayCell(null, isHome, cellKey);
      if (playOrArray.length === 1) return renderSinglePlayCell(playOrArray[0], isHome, cellKey);

      // Multiple plate appearances in the same inning (batting through the order)
      return (
        <div style={{
          display: 'flex', width: '100%', height: '100%', minHeight: '38px',
          alignItems: 'center', justifyContent: 'space-around', overflow: 'hidden',
          position: 'relative',
        }}>
          {playOrArray.map((p, idx) => (
            <div
              key={idx}
              style={{
                flex: 1, height: '100%', minWidth: 0,
                borderRight: idx < playOrArray.length - 1 ? `1px dashed ${t.borderStrong}` : 'none',
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {/* Sequence number badge */}
              <span style={{
                position: 'absolute', top: '1px', left: '1.5px',
                fontSize: '6.5px', fontWeight: 900, fontFamily: t.fontMono,
                color: isHome ? t.homeColor : t.awayColor,
                opacity: 0.9, zIndex: 4, pointerEvents: 'none',
              }}>
                {idx === 0 ? '①' : idx === 1 ? '②' : '③'}
              </span>
              {renderSinglePlayCell(p, isHome, `${cellKey}_multi_${idx}`)}
            </div>
          ))}
        </div>
      );
    }
    return renderSinglePlayCell(playOrArray, isHome, cellKey);
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

  const isBlankMode = isBlankScorecard === 'prefill' || isBlankScorecard === 'full' || isBlankScorecard === true;
  const isFullyBlank = isBlankScorecard === 'full';

  // ─── Scorecard table for one team ────────────────────────────────────────────
  const renderTeamScorecard = (teamData, isHome) => {
    const teamInfo = isHome ? gameInfo.homeTeam : gameInfo.awayTeam;
    const accentColor = isHome ? t.homeColor : t.awayColor;
    const accentText = isHome ? t.homeText : t.awayText;
    const accentSecondary = isHome ? t.homeSecondary : t.awaySecondary;
    const inningRuns = isHome ? homeInningRuns : awayInningRuns;

    const battersToRender = isFullyBlank
      ? Array.from({ length: 9 }, (_, i) => ({
          id: `blank-b-${i}`,
          jerseyNumber: ' ',
          position: ' ',
          name: ' ',
          plays: {}
        }))
      : teamData.batters;

    const pitchersToRender = isFullyBlank
      ? Array.from({ length: 4 }, (_, i) => ({
          id: `blank-p-${i}`,
          number: ' ',
          name: ' ',
          ip: ' ',
          hits: null,
          runs: null,
          earnedRuns: null,
          walks: null,
          strikeouts: [],
          totalPitches: null,
          pitchesByInning: {}
        }))
      : teamData.pitchers;

    const POS_COL_W = 18;
    const NAME_COL_W = 108;
    const PLAYER_COL_W = POS_COL_W + NAME_COL_W;
    const INNING_COL_W = 48;

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
              { label: 'R', val: isBlankMode ? '—' : teamInfo.score },
              { label: 'H', val: isBlankMode ? '—' : teamInfo.hits },
              { label: 'E', val: isBlankMode ? '—' : teamInfo.errors },
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

        {/* Scorecard grid */}
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
              {battersToRender.map((b, bIdx) => {
                const nameStr = b.name || '';
                const nameLen = nameStr.length;
                let batterFontSize = '10.5px';
                let letterSpacing = '0em';
                if (nameLen > 15) {
                  batterFontSize = '7px';
                  letterSpacing = '-0.03em';
                } else if (nameLen > 12) {
                  batterFontSize = '7.5px';
                  letterSpacing = '-0.02em';
                } else if (nameLen > 9) {
                  batterFontSize = '8.5px';
                  letterSpacing = '-0.01em';
                } else if (nameLen > 6) {
                  batterFontSize = '9.5px';
                }
                if (t.isHandwritten) {
                  batterFontSize = nameLen > 14 ? '8.5px' : nameLen > 10 ? '10px' : '11.5px';
                }

                return (
                  <tr key={b.id || bIdx} style={{
                    borderBottom: `1px solid ${t.borderLight}`,
                    backgroundColor: bIdx % 2 === 1 ? t.tableRowAlt : 'transparent',
                  }}>
                    {/* Vertical 90-degree rotated BATTING Sidebar (spans all batter rows) */}
                    {bIdx === 0 && (
                      <td rowSpan={battersToRender.length} style={{
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

                    {/* Position code */}
                    <td style={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      padding: '2px 0',
                      borderRight: `1px solid ${t.borderLight}`,
                      backgroundColor: t.tableRowAlt,
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px' }}>
                        <span style={{
                          display: 'inline-block',
                          fontFamily: t.fontMono,
                          fontWeight: 800,
                          fontSize: '8.5px',
                          color: accentColor,
                          letterSpacing: '0.02em',
                          lineHeight: 1,
                        }}>
                          {b.position}
                        </span>
                        {b.substitutes && b.substitutes.map((sub, sIdx) => (
                          <span key={sIdx} style={{
                            display: 'inline-block',
                            fontFamily: t.fontMono,
                            fontWeight: 800,
                            fontSize: '7.5px',
                            color: t.textMuted,
                            opacity: 0.9,
                          }}>
                            {sub.position || 'PH'}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Batter Name (Safely contained without spilling out into grid) */}
                    {(() => {
                      const thisBatterKey = `batter-${isHome ? 'home' : 'away'}-${b.id ?? bIdx}`;
                      const isBatterActive = activeCellKey === thisBatterKey;
                      return (
                        <td
                          onClick={!isExporting && onBatterClick ? () => onBatterClick({ teamKey: isHome ? 'home' : 'away', batterIndex: bIdx, batter: b, teamName: teamInfo.name }) : undefined}
                          className={!isExporting && onBatterClick ? 'interactive-roster-cell' : ''}
                          style={{
                            verticalAlign: 'middle',
                            padding: '3px 4px 3px 6px',
                            borderRight: `1.5px solid ${t.borderStrong}`,
                            overflow: 'visible',
                            maxWidth: `${NAME_COL_W - 22}px`,
                            cursor: !isExporting && onBatterClick ? 'pointer' : 'default',
                            backgroundColor: isBatterActive ? (isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.16)') : undefined,
                            boxShadow: isBatterActive ? 'inset 0 0 0 1.5px #3b82f6' : undefined,
                            transition: 'all 0.12s ease',
                          }}
                          title={!isExporting && onBatterClick ? `Inspect #${b.jerseyNumber} ${b.name} Full Game Visuals` : undefined}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', overflow: 'visible' }}>
                            {/* Starter */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'visible' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: '16px', height: '16px', borderRadius: '50%',
                                backgroundColor: b.jerseyNumber && b.jerseyNumber.trim() ? accentColor : 'transparent',
                                color: accentText,
                                fontSize: '7px', fontWeight: 800,
                                fontFamily: t.fontMono,
                                flexShrink: 0,
                              }}>
                                {b.jerseyNumber}
                              </span>
                              <span style={{
                                fontSize: batterFontSize, fontWeight: 700,
                                letterSpacing: letterSpacing, textTransform: 'uppercase',
                                fontFamily: t.fontHeader,
                                color: t.textPrimary,
                                whiteSpace: 'nowrap',
                                overflow: 'visible',
                                paddingRight: '6px',
                                display: 'inline-block',
                                lineHeight: 1.1,
                              }}>
                                {renderHandwrittenText(b.name, 'batter_' + b.id)}
                              </span>
                            </div>

                            {/* Substitutes in this slot */}
                            {b.substitutes && b.substitutes.map((sub, sIdx) => (
                              <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '3px', paddingLeft: '4px', opacity: 0.9 }}>
                                <span style={{
                                  fontSize: '7.5px', fontWeight: 800, fontFamily: t.fontMono,
                                  color: accentColor,
                                }}>
                                  {sub.subLetter ? `${sub.subLetter}.` : 'sub.'}
                                </span>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  width: '13px', height: '13px', borderRadius: '50%',
                                  backgroundColor: t.borderLight,
                                  color: t.textPrimary,
                                  fontSize: '6.5px', fontWeight: 800,
                                  fontFamily: t.fontMono,
                                  flexShrink: 0,
                                }}>
                                  {sub.jerseyNumber || '—'}
                                </span>
                                <span style={{
                                  fontSize: '9px', fontWeight: 700,
                                  fontFamily: t.fontHeader,
                                  color: t.textPrimary,
                                  letterSpacing: '0.01em',
                                  textTransform: 'uppercase',
                                }}>
                                  {renderHandwrittenText(sub.name, 'sub_' + sIdx + '_' + sub.name)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })()}

                    {/* Inning cells */}
                    {innings.map(n => {
                      const play = isBlankMode ? null : b.plays?.[n];
                      const currentPlayObj = Array.isArray(play) ? play[0] : play;
                      const currentPlayPitches = currentPlayObj?.pitches || [];
                      const batSide = currentPlayObj?.batSide || b.batSide || 'R';
                      const cellKey = `${b.id}_${n}`;
                      const isSelected = !isExporting && activeCellKey === cellKey;
                      const hasInteractiveClick = !isExporting && Boolean(onCellClick);
                      const isLiveActiveCell = !isExporting && Boolean(
                        gameInfo?.isLive &&
                        gameInfo?.liveActiveCell &&
                        String(gameInfo.liveActiveCell.batterId) === String(b.id) &&
                        Number(gameInfo.liveActiveCell.inning) === Number(n) &&
                        gameInfo.liveActiveCell.teamKey === (isHome ? 'home' : 'away')
                      );

                      let cellClassName = '';
                      if (!isExporting) {
                        if (isLiveActiveCell) cellClassName = 'live-active-atbat-cell';
                        else if (hasInteractiveClick) cellClassName = 'interactive-diamond-cell';
                      }

                      return (
                        <td
                          key={n}
                          onClick={hasInteractiveClick ? (e) => {
                            e.stopPropagation();
                            const playArray = Array.isArray(play) ? play : (play ? [play] : []);
                            onCellClick({
                              teamKey: isHome ? 'home' : 'away',
                              teamName: teamInfo.name,
                              batterIndex: bIdx,
                              batter: b,
                              inning: n,
                              currentPlay: currentPlayObj,
                              plays: playArray,
                              cellKey,
                            });
                          } : undefined}
                          className={cellClassName}
                          style={{
                            textAlign: 'center', verticalAlign: 'middle',
                            padding: '1px',
                            borderLeft: `1px solid ${t.borderLight}`,
                            backgroundColor: isSelected
                              ? 'rgba(59, 130, 246, 0.3)'
                              : isLiveActiveCell
                              ? 'rgba(239, 68, 68, 0.22)'
                              : (n % 2 === 0 ? t.tableInningAlt : 'transparent'),
                            position: 'relative',
                            cursor: hasInteractiveClick ? 'pointer' : 'default',
                            boxShadow: isSelected ? 'inset 0 0 0 2px #3b82f6' : (isLiveActiveCell ? 'inset 0 0 0 2px #ef4444' : 'none'),
                          }}
                        >
                          {renderPlayCell(play, isHome, cellKey)}
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
                  const runs = isBlankMode ? '—' : inningRuns[n];
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

        {/* Pitching Table */}
        {pitchersToRender && pitchersToRender.length > 0 && (
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
                {pitchersToRender.map((p, pIdx) => {
                  const ks = p.strikeouts?.length || 0;
                  const color = isHome ? t.homeColor : t.awayColor;
                  const text = isHome ? t.homeText : t.awayText;
                  return (
                    <tr
                      key={p.id || pIdx}
                      style={{
                        borderBottom: `1px solid ${t.borderLight}`,
                        backgroundColor: pIdx % 2 === 1 ? t.tableRowAlt : 'transparent',
                      }}
                    >
                      {/* Vertical 90-degree rotated PITCHING Sidebar */}
                      {pIdx === 0 && (
                        <td rowSpan={pitchersToRender.length + 1} style={{
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
                      {/* Name & Core Pitching Stats including Total Pitch Count */}
                      {(() => {
                        const thisPitcherKey = `pitcher-${isHome ? 'home' : 'away'}-${p.id ?? pIdx}`;
                        const isPitcherActive = activePitcherKey === thisPitcherKey;
                        return (
                          <td
                            onClick={!isExporting && onPitcherClick ? () => onPitcherClick({ teamKey: isHome ? 'home' : 'away', pitcher: p, pitcherIndex: pIdx, teamName: teamInfo.name }) : undefined}
                            className={!isExporting && onPitcherClick ? 'interactive-roster-cell' : ''}
                            style={{
                              padding: '3px 5px',
                              borderRight: `1.5px solid ${t.borderStrong}`,
                              verticalAlign: 'middle',
                              cursor: !isExporting && onPitcherClick ? 'pointer' : 'default',
                              backgroundColor: isPitcherActive ? (isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.16)') : undefined,
                              boxShadow: isPitcherActive ? 'inset 0 0 0 1.5px #3b82f6' : undefined,
                              transition: 'all 0.12s ease',
                            }}
                            title={!isExporting && onPitcherClick ? `Inspect ${p.fullName || p.name} Performance` : undefined}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: '15px', height: '15px', borderRadius: '50%',
                                    backgroundColor: p.number && p.number.trim() ? color : 'transparent',
                                    color: text,
                                    fontSize: '7px', fontWeight: 800,
                                    fontFamily: t.fontMono, flexShrink: 0,
                                  }}>
                                    {p.number}
                                  </span>
                                  <span style={{
                                    fontFamily: t.fontHeader, fontWeight: 700,
                                    fontSize: p.name && p.name.length > 13 ? '9px' : '10.5px', letterSpacing: '0.02em',
                                    color: t.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                  }}>
                                    {p.name}
                                  </span>
                                </div>

                                {/* Total Pitches Pill on Top-Right of cell */}
                                {!isBlankMode && p.totalPitches != null && (
                                  <span style={{
                                    fontFamily: t.fontMono, fontSize: '7.5px', fontWeight: 900,
                                    color: t.textPrimary,
                                    backgroundColor: t.borderLight, padding: '1px 4px', borderRadius: '3px',
                                    display: 'inline-flex', alignItems: 'center', gap: '1px',
                                    flexShrink: 0,
                                  }}>
                                    <span>{p.totalPitches}</span>
                                    <span style={{ opacity: 0.75 }}>P</span>
                                  </span>
                                )}
                              </div>

                              {/* Stats summary row: IP • H • R • ER • BB • K */}
                              <div style={{
                                fontFamily: t.fontMono, fontSize: '7px', fontWeight: 700,
                                color: t.textMuted, whiteSpace: 'nowrap',
                                display: 'flex', alignItems: 'center', gap: '2px', opacity: 0.95, flexWrap: 'nowrap',
                              }}>
                                <span><strong style={{ color: t.textPrimary, fontWeight: 900 }}>{isBlankMode ? '—' : (p.ip || '—')}</strong> IP</span>
                                <span style={{ opacity: 0.35 }}>•</span>
                                <span><strong style={{ color: t.textPrimary, fontWeight: 900 }}>{isBlankMode ? '—' : (p.hits ?? 0)}</strong>H</span>
                                <span style={{ opacity: 0.35 }}>•</span>
                                <span><strong style={{ color: t.textPrimary, fontWeight: 900 }}>{isBlankMode ? '—' : (p.runs ?? 0)}</strong>R</span>
                                <span style={{ opacity: 0.35 }}>•</span>
                                <span><strong style={{ color: t.textPrimary, fontWeight: 900 }}>{isBlankMode ? '—' : (p.earnedRuns ?? 0)}</strong>ER</span>
                                <span style={{ opacity: 0.35 }}>•</span>
                                <span><strong style={{ color: t.textPrimary, fontWeight: 900 }}>{isBlankMode ? '—' : (p.walks ?? 0)}</strong>BB</span>
                                <span style={{ opacity: 0.35 }}>•</span>
                                <span><strong style={{ color: t.textPrimary, fontWeight: 900 }}>{isBlankMode ? '—' : ks}</strong>K</span>
                              </div>
                            </div>
                          </td>
                        );
                      })()}

                      {/* Inning Pitch Breakdown Cells with Uppercase S / B and Clear Spacing */}
                      {innings.map(n => {
                        if (!effectiveShowPitchBreakdown) {
                          return (
                            <td key={n} style={{ borderLeft: `1px solid ${t.borderLight}` }} />
                          );
                        }
                        const innStat = p.pitchesByInning?.[n];
                        const cnt = innStat?.pitches || 0;
                        const str = innStat?.strikes || 0;
                        const bll = innStat?.balls || 0;
                        const thisInningKey = `pitcher-${isHome ? 'home' : 'away'}-${p.id ?? pIdx}-${n}`;
                        const isInningActive = activePitcherKey === thisInningKey;
                        return (
                          <td
                            key={n}
                            onClick={!isExporting && onPitcherClick ? () => onPitcherClick({ teamKey: isHome ? 'home' : 'away', pitcher: p, pitcherIndex: pIdx, inning: n, teamName: teamInfo.name }) : undefined}
                            className={!isExporting && onPitcherClick ? 'interactive-diamond-cell' : ''}
                            style={{
                              textAlign: 'center', padding: '2px 1px',
                              borderLeft: `1px solid ${t.borderLight}`,
                              verticalAlign: 'middle',
                              cursor: !isExporting && onPitcherClick ? 'pointer' : 'default',
                              backgroundColor: isInningActive ? (isDark ? 'rgba(59, 130, 246, 0.28)' : 'rgba(59, 130, 246, 0.18)') : undefined,
                              boxShadow: isInningActive ? 'inset 0 0 0 1.5px #3b82f6' : undefined,
                              transition: 'all 0.12s ease',
                            }}
                            title={!isExporting && onPitcherClick ? `Inspect ${p.fullName || p.name} Inning ${n} Performance` : undefined}
                          >
                            {cnt > 0 && !isBlankMode ? (
                              <div style={{ lineHeight: 1 }}>
                                <span style={{ fontFamily: t.fontMono, fontSize: '8.5px', fontWeight: 800, color: t.textPrimary, display: 'block' }}>
                                  {cnt}
                                </span>
                                <span style={{ fontFamily: t.fontMono, fontSize: '6.5px', fontWeight: 800, color: t.textMuted, opacity: 0.85, display: 'block', marginTop: '1.5px', letterSpacing: '0.04em' }}>
                                  <span style={{ color: t.textPrimary, fontWeight: 900 }}>{str}</span>
                                  <span style={{ color: t.textMuted, fontWeight: 800, marginLeft: '2px', marginRight: '4px' }}>S</span>
                                  <span style={{ color: t.textMuted, opacity: 0.4 }}>•</span>
                                  <span style={{ color: t.textPrimary, fontWeight: 900, marginLeft: '4px' }}>{bll}</span>
                                  <span style={{ color: t.textMuted, fontWeight: 800, marginLeft: '2px' }}>B</span>
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

                {/* Interactive Add Pitcher button in manual mode */}
                {!isExporting && isInteractive && scoringMode === 'live' && onPitcherClick && (
                  <tr className="interactive-add-pitcher-row no-export" data-interactive-only="true" style={{ backgroundColor: t.tableRowAlt, borderTop: `1px dashed ${t.borderLight}` }}>
                    <td
                      colSpan={innings.length + 1}
                      onClick={() => onPitcherClick({
                        teamKey: isHome ? 'home' : 'away',
                        pitcher: { name: 'RELIEVER', number: '99', ip: '0.0', hits: 0, runs: 0, earnedRuns: 0, walks: 0, strikeouts: [], pitchesByInning: {} },
                        pitcherIndex: -1,
                        teamName: teamInfo.name,
                        isNew: true,
                      })}
                      className="interactive-roster-cell"
                      style={{
                        padding: '3px 8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      title={`Add a new relief pitcher for ${teamInfo.name}`}
                    >
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '9px',
                        fontWeight: 800,
                        fontFamily: t.fontMono,
                        color: accentColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                        <span>+ ADD RELIEVER / PITCHER</span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Total Pitch Count Summary Row */}
                <tr style={{ backgroundColor: t.tableHeaderBg, borderTop: `1.5px solid ${t.borderStrong}` }}>
                  <td style={{
                    padding: '3px 6px', fontSize: '8px', fontWeight: 800, fontFamily: t.fontMono,
                    color: t.textMuted, textTransform: 'uppercase', whiteSpace: 'nowrap'
                  }}>
                    <span>TOTAL PITCHES: </span>
                    {isBlankMode ? (
                      '—'
                    ) : (
                      <>
                        <strong style={{ color: t.textPrimary, fontWeight: 900 }}>{teamData.teamTotalPitches || 0}</strong>
                        <span style={{ marginLeft: '6px', opacity: 0.7 }}>(</span>
                        <strong style={{ color: t.textPrimary, fontWeight: 900 }}>{teamData.teamTotalStrikes || 0}</strong>
                        <span style={{ marginLeft: '2px', marginRight: '6px', fontWeight: 800 }}>S</span>
                        <span style={{ opacity: 0.4 }}>•</span>
                        <strong style={{ color: t.textPrimary, fontWeight: 900, marginLeft: '6px' }}>{teamData.teamTotalBalls || 0}</strong>
                        <span style={{ marginLeft: '2px', fontWeight: 800 }}>B</span>
                        <span style={{ marginLeft: '1px', opacity: 0.7 }}>)</span>
                      </>
                    )}
                  </td>
                  {innings.map(n => (
                    <td key={n} style={{ borderLeft: `1px solid ${t.borderLight}` }} />
                  ))}
                </tr>
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
  const isFinal = gameInfo.isFinal !== undefined ? gameInfo.isFinal : true;
  const awayWon = isFinal && !isBlankMode && away.score > home.score;
  const homeWon = isFinal && !isBlankMode && home.score > away.score;

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
        padding: t.isChalkboard ? '14px' : '10px',
        boxShadow: '0 30px 60px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.1)',
        transition: 'max-width 0.3s ease',
      }}
    >
      {/* Outer frame border */}
      <div style={{
        position: 'relative',
        backgroundColor: t.paperBg,
        border: t.isChalkboard
          ? '12px solid #281c14'
          : `3px solid ${t.borderStrong}`,
        outline: t.isChalkboard
          ? '2px solid #140d09'
          : `1px solid ${t.outerFrame}`,
        outlineOffset: t.isChalkboard ? '-2px' : '4px',
        boxShadow: t.isChalkboard
          ? 'inset 0 0 25px rgba(0,0,0,0.85), 0 15px 35px rgba(0,0,0,0.6)'
          : undefined,
      }}>

        {/* Paper grain & chalk dust texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: t.isChalkboard
            ? `radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(255,255,255,0.07) 0%, transparent 50%), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.09'/%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E")`,
          opacity: t.isChalkboard ? 0.9 : 0.6,
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
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Away team */}
            <div style={{
              flex: 1, padding: '18px 20px 14px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              borderRight: `1px solid ${t.borderLight}`, position: 'relative', zIndex: 1,
              overflow: 'hidden',
            }}>
              {/* Team Watermark behind away header */}
              {showTeamWatermarks && (
                <div style={{
                  position: 'absolute', left: '10px', top: '-5px',
                  fontSize: '65px', fontWeight: 900, fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
                  color: t.awayColor, opacity: 0.07, pointerEvents: 'none', zIndex: 0,
                  userSelect: 'none', lineHeight: 1, whiteSpace: 'nowrap',
                  maxWidth: 'calc(100% - 20px)', overflow: 'hidden',
                }}>
                  {away.abbreviation}
                </div>
              )}
              <div style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: t.awayColor,
                fontFamily: t.fontSans,
                marginBottom: '2px', position: 'relative', zIndex: 1,
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
                lineHeight: 1, position: 'relative', zIndex: 1,
              }}>
                {away.name}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginTop: '6px', position: 'relative', zIndex: 1,
              }}>
                <span style={{
                  fontFamily: t.fontMono,
                  fontWeight: 900,
                  fontSize: '50px',
                  color: awayWon ? t.awayColor : t.textSecondary,
                  lineHeight: 1,
                }}>
                  {isBlankMode ? '—' : away.score}
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
              flexDirection: 'column', gap: '4px', position: 'relative', zIndex: 1,
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
                fontSize: '8.5px', fontWeight: 800,
                color: gameInfo.isLive ? '#ef4444' : t.textMuted,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                {isBlankMode ? 'GAME DAY' : (gameInfo.statusDisplay || (gameInfo.totalInnings > 9 ? `F/${gameInfo.totalInnings}` : 'FINAL'))}
              </div>
            </div>

            {/* Home team */}
            <div style={{
              flex: 1, padding: '18px 20px 14px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end',
              borderLeft: `1px solid ${t.borderLight}`, position: 'relative', zIndex: 1,
              overflow: 'hidden',
            }}>
              {/* Team Watermark behind home header */}
              {showTeamWatermarks && (
                <div style={{
                  position: 'absolute', right: '10px', top: '-5px',
                  fontSize: '65px', fontWeight: 900, fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
                  color: t.homeColor, opacity: 0.07, pointerEvents: 'none', zIndex: 0,
                  userSelect: 'none', lineHeight: 1, whiteSpace: 'nowrap',
                  maxWidth: 'calc(100% - 20px)', overflow: 'hidden', textAlign: 'right',
                }}>
                  {home.abbreviation}
                </div>
              )}
              <div style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: t.homeColor,
                fontFamily: t.fontSans,
                marginBottom: '2px', position: 'relative', zIndex: 1,
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
                textAlign: 'right', position: 'relative', zIndex: 1,
              }}>
                {home.name}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginTop: '6px',
                flexDirection: 'row-reverse', position: 'relative', zIndex: 1,
              }}>
                <span style={{
                  fontFamily: t.fontMono,
                  fontWeight: 900,
                  fontSize: '50px',
                  color: homeWon ? t.homeColor : t.textSecondary,
                  lineHeight: 1,
                }}>
                  {isBlankMode ? '—' : home.score}
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
              {customSubtitle !== undefined ? customSubtitle : [gameInfo.venue, gameInfo.headline].filter(Boolean).join(' · ')}
            </span>
          </div>

          {/* Combined Decisions + Environment + Game MVP Bar */}
          {((showDecisions && (gameInfo.decisions?.winner || gameInfo.decisions?.loser)) || (showEnvironmentBox && (gameInfo.weatherStr || gameInfo.attendance || gameInfo.durationStr)) || (showMvp && gameInfo.gameMvp)) && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
              backgroundColor: t.tableHeaderBg, padding: '6px 14px',
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

              {/* Game MVP Badge */}
              {showMvp && gameInfo.gameMvp && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '2px 7px', borderRadius: '4px',
                  backgroundColor: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  color: t.textPrimary, fontFamily: t.fontMono, fontSize: '8px', fontWeight: 800,
                }}>
                  <span style={{ backgroundColor: '#eab308', color: '#000', padding: '1px 3px', borderRadius: '2px', fontSize: '6.5px', fontWeight: 900 }}>
                    {gameInfo.gameMvp.badge}
                  </span>
                  <span>{gameInfo.gameMvp.name} ({gameInfo.gameMvp.team}) — {gameInfo.gameMvp.statLine}</span>
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

          {/* Statcast HR & Hit Metrics Card */}
          {effectiveShowStatcast && (
            <div style={{
              marginTop: '10px',
              padding: '10px 14px',
              backgroundColor: t.tableHeaderBg,
              borderRadius: '6px',
              border: `1px solid ${t.borderLight}`,
              position: 'relative', zIndex: 1,
            }}>
              <div style={{
                fontSize: '8.5px', fontWeight: 800, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: t.textMuted, fontFamily: t.fontSans, marginBottom: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '1px 5px', borderRadius: '2px', fontSize: '7px', fontWeight: 900 }}>
                    STATCAST
                  </span>
                  <span style={{ color: t.textPrimary, fontWeight: 700 }}>HOME RUN & HIT STATCAST METRICS</span>
                </div>
                <span style={{ fontSize: '7.5px', opacity: 0.7 }}>MLB ADVANCED TRACKING</span>
              </div>

              {gameInfo.hrHighlights && gameInfo.hrHighlights.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {gameInfo.hrHighlights.map((hr, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px',
                      padding: '5px 10px', borderRadius: '4px',
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      border: `1px solid ${t.borderLight}`,
                      fontSize: '9.5px', fontFamily: t.fontMono, color: t.textPrimary, fontWeight: 600,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          backgroundColor: hr.team === away.abbreviation ? t.awayColor : t.homeColor,
                          color: hr.team === away.abbreviation ? t.awayText : t.homeText,
                          padding: '2px 6px', borderRadius: '3px', fontWeight: 900, fontSize: '9px',
                        }}>
                          {hr.batterName} ({hr.team})
                        </span>
                        <span style={{ color: t.textMuted, fontWeight: 700 }}>{hr.inn}</span>
                        <span style={{ fontWeight: 800, color: t.textPrimary }}>{hr.rbi} RBI HR</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {hr.speed && (
                          <span style={{ color: '#10b981', fontWeight: 800 }}>Exit Velo: {hr.speed}</span>
                        )}
                        {hr.dist && (
                          <span style={{ color: t.textPrimary, fontWeight: 800 }}>Distance: {hr.dist}</span>
                        )}
                        {hr.angle && (
                          <span style={{ color: t.textSecondary }}>Launch Angle: {hr.angle}</span>
                        )}
                        {hr.pitchSpeed && (
                          <span style={{ color: t.textMuted, fontSize: '8.5px' }}>{hr.pitchSpeed} {hr.pitchType} {hr.pitcherName ? `off ${hr.pitcherName}` : ''}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : gameInfo.topHits && gameInfo.topHits.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '8px', color: t.textMuted, fontStyle: 'italic', marginBottom: '2px' }}>
                    No Home Runs in game — Showing Top Hard-Hit Statcast Exit Velocities:
                  </div>
                  {gameInfo.topHits.map((hit, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px',
                      padding: '4px 8px', borderRadius: '4px',
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      border: `1px solid ${t.borderLight}`,
                      fontSize: '9px', fontFamily: t.fontMono, color: t.textPrimary,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: hit.team === away.abbreviation ? t.awayColor : t.homeColor, fontWeight: 900 }}>
                          {hit.batterName} ({hit.team})
                        </span>
                        <span style={{ color: t.textMuted }}>{hit.inn}</span>
                        <span style={{ fontWeight: 800 }}>{hit.event}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {hit.speed && <span style={{ color: '#10b981', fontWeight: 800 }}>Exit Velo: {hit.speed}</span>}
                        {hit.dist && <span>Distance: {hit.dist}</span>}
                        {hit.angle && <span>Angle: {hit.angle}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '9px', color: t.textMuted, fontFamily: t.fontMono }}>
                  No Statcast tracking metrics recorded for this game.
                </div>
              )}
            </div>
          )}

          {/* Inning-by-Inning Score & Lead Progression Grid */}
          {effectiveShowMomentum && gameInfo.gameMomentum && gameInfo.gameMomentum.length > 0 && (
            <div style={{
              marginTop: '10px',
              padding: '10px 14px',
              backgroundColor: t.tableHeaderBg,
              borderRadius: '6px',
              border: `1px solid ${t.borderLight}`,
              position: 'relative', zIndex: 1,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: '8.5px', fontWeight: 800, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: t.textMuted, fontFamily: t.fontSans, marginBottom: '8px',
              }}>
                <span>INNING-BY-INNING SCORE & LEAD PROGRESSION</span>
                <span>{away.abbreviation} ({gameInfo.awayTeam.score}) vs {home.abbreviation} ({gameInfo.homeTeam.score})</span>
              </div>

              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {gameInfo.gameMomentum.map((m, idx) => {
                  const isAwayLead = m.diff < 0;
                  const isHomeLead = m.diff > 0;
                  const pillColor = isHomeLead ? t.homeColor : (isAwayLead ? t.awayColor : t.borderStrong);
                  const pillTextClr = isHomeLead ? t.homeText : (isAwayLead ? t.awayText : t.textPrimary);

                  return (
                    <div key={idx} style={{
                      flex: 1, minWidth: '46px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                      padding: '6px 4px', borderRadius: '5px',
                      backgroundColor: 'rgba(0,0,0,0.04)', border: `1px solid ${t.borderLight}`,
                    }}>
                      <div style={{ fontSize: '8px', fontWeight: 800, color: t.textMuted, fontFamily: t.fontMono }}>
                        INN {m.inning}
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 900, color: t.textPrimary, fontFamily: t.fontMono, lineHeight: 1 }}>
                        {m.awayCum}–{m.homeCum}
                      </div>
                      <div style={{
                        fontSize: '7.5px', fontWeight: 900, fontFamily: t.fontMono,
                        padding: '2px 4px', borderRadius: '3px',
                        backgroundColor: pillColor, color: pillTextClr,
                        whiteSpace: 'nowrap', marginTop: '2px',
                      }}>
                        {m.leader}
                      </div>
                    </div>
                  );
                })}
              </div>
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
              position: 'relative', zIndex: 1,
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

      <style>{`
        .interactive-diamond-cell {
          cursor: pointer;
          transition: background-color 0.12s ease;
        }
        .interactive-diamond-cell:hover {
          background-color: rgba(59, 130, 246, 0.18) !important;
        }
        .interactive-roster-cell {
          cursor: pointer;
          transition: background-color 0.12s ease;
        }
        .interactive-roster-cell:hover {
          background-color: rgba(59, 130, 246, 0.12) !important;
        }
        @keyframes liveAtBatPulse {
          0% {
            background-color: rgba(239, 68, 68, 0.14);
            box-shadow: inset 0 0 0 2px #ef4444, 0 0 4px rgba(239, 68, 68, 0.4);
          }
          50% {
            background-color: rgba(239, 68, 68, 0.32);
            box-shadow: inset 0 0 0 2px #ef4444, 0 0 12px rgba(239, 68, 68, 0.85);
          }
          100% {
            background-color: rgba(239, 68, 68, 0.14);
            box-shadow: inset 0 0 0 2px #ef4444, 0 0 4px rgba(239, 68, 68, 0.4);
          }
        }
        .live-active-atbat-cell {
          animation: liveAtBatPulse 2.2s ease-in-out infinite !important;
          position: relative !important;
          z-index: 2;
        }
        @keyframes liveDotPulse {
          0% { transform: scale(0.85); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(0.85); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default React.memo(ScorecardGraphic);
