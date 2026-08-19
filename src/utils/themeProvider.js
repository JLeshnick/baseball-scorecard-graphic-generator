/**
 * Theme Provider & Styles for Scorecard Graphic Generation
 */
export function getScorecardTheme({
  theme = 'team-light',
  fontStyle = 'modern',
  gameInfo,
  customAwayColor,
  customAwaySecondary,
  customHomeColor,
  customHomeSecondary,
}) {
  const away = gameInfo?.awayTeam || {};
  const home = gameInfo?.homeTeam || {};

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
    case 'chalkboard':
      themeObj = {
        ...base,
        bg: '#1c140e',
        paperBg: '#101c18',
        outerFrame: '#2c1e15',
        textPrimary: '#f4f8f5',
        textSecondary: '#a5d6a7',
        textMuted: '#81c784',
        borderStrong: 'rgba(255, 255, 255, 0.4)',
        borderLight: 'rgba(255, 255, 255, 0.15)',
        tableHeaderBg: 'rgba(255, 255, 255, 0.07)',
        tableRowAlt: 'rgba(255, 255, 255, 0.025)',
        lineScoreBg: 'rgba(255, 255, 255, 0.06)',
        lineScoreAlt: 'rgba(255, 255, 255, 0.03)',
        pitchingBg: 'rgba(255, 255, 255, 0.05)',
        awayColor: customAwayColor || '#fff59d',
        awaySecondary: customAwaySecondary || '#80d8ff',
        awayText: '#101c18',
        homeColor: customHomeColor || '#80d8ff',
        homeSecondary: customHomeSecondary || '#fff59d',
        homeText: '#101c18',
        scoreTextColor: '#f4f8f5',
        vsTextColor: '#a5d6a7',
        cellDiamondStroke: 'rgba(255, 255, 255, 0.45)',
        hitLineColor: customAwayColor || '#fff59d',
        homeHitLineColor: customHomeColor || '#80d8ff',
        isChalkboard: true,
      };
      break;

    case 'retro70s':
      themeObj = {
        ...base,
        bg: '#e8dec8',
        paperBg: '#f6f0dd',
        outerFrame: '#3d2314',
        textPrimary: '#3d2314',
        textSecondary: '#6e4020',
        textMuted: '#9e6d42',
        borderStrong: '#d94c26',
        borderLight: '#e59b24',
        tableHeaderBg: 'rgba(217, 76, 38, 0.12)',
        tableRowAlt: 'rgba(229, 155, 36, 0.08)',
        lineScoreBg: 'rgba(217, 76, 38, 0.1)',
        lineScoreAlt: 'rgba(229, 155, 36, 0.06)',
        pitchingBg: 'rgba(217, 76, 38, 0.08)',
        awayColor: customAwayColor || '#c84b2c',
        awaySecondary: customAwaySecondary || '#d89623',
        awayText: '#ffffff',
        homeColor: customHomeColor || '#3d2314',
        homeSecondary: customHomeSecondary || '#d89623',
        homeText: '#f6f0dd',
        scoreTextColor: '#3d2314',
        vsTextColor: '#c84b2c',
        cellDiamondStroke: '#d89623',
        hitLineColor: customAwayColor || '#c84b2c',
        homeHitLineColor: customHomeColor || '#3d2314',
        isRetro70s: true,
      };
      break;

    case 'blueprint':
      themeObj = {
        ...base,
        bg: '#07162c',
        paperBg: '#081c38',
        outerFrame: '#184275',
        textPrimary: '#f0f8ff',
        textSecondary: '#90caf9',
        textMuted: '#64b5f6',
        borderStrong: '#00e5ff',
        borderLight: '#1565c0',
        tableHeaderBg: 'rgba(0, 229, 255, 0.15)',
        tableRowAlt: 'rgba(255, 255, 255, 0.03)',
        lineScoreBg: 'rgba(0, 229, 255, 0.12)',
        lineScoreAlt: 'rgba(255, 255, 255, 0.04)',
        pitchingBg: 'rgba(0, 229, 255, 0.1)',
        awayColor: customAwayColor || '#00e5ff',
        awaySecondary: customAwaySecondary || '#64ffda',
        awayText: '#04101e',
        homeColor: customHomeColor || '#ff4081',
        homeSecondary: customHomeSecondary || '#ff80ab',
        homeText: '#ffffff',
        scoreTextColor: '#f0f8ff',
        vsTextColor: '#00e5ff',
        cellDiamondStroke: '#42a5f5',
        hitLineColor: customAwayColor || '#00e5ff',
        homeHitLineColor: customHomeColor || '#ff4081',
        isBlueprint: true,
      };
      break;

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
        awayColor: customAwayColor || away.color,
        awaySecondary: customAwaySecondary || away.secondary,
        awayText: away.textColor || '#fff',
        homeColor: customHomeColor || home.color,
        homeSecondary: customHomeSecondary || home.secondary,
        homeText: home.textColor || '#fff',
        scoreTextColor: '#f1f5f9',
        vsTextColor: '#475569',
        cellDiamondStroke: '#2d4a7a',
        hitLineColor: customAwaySecondary || away.secondary,
        homeHitLineColor: customHomeSecondary || home.secondary,
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
        awayColor: customAwayColor || '#3a2010',
        awaySecondary: customAwaySecondary || '#c8922a',
        awayText: '#f5eed8',
        homeColor: customHomeColor || '#7a0c1e',
        homeSecondary: customHomeSecondary || '#c8922a',
        homeText: '#f5eed8',
        scoreTextColor: '#2c1a0e',
        vsTextColor: '#b89a70',
        cellDiamondStroke: '#c8b089',
        hitLineColor: customAwaySecondary || '#c8922a',
        homeHitLineColor: customHomeColor || '#7a0c1e',
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
        awayColor: customAwayColor || '#111111',
        awaySecondary: customAwaySecondary || '#555555',
        awayText: '#ffffff',
        homeColor: customHomeColor || '#333333',
        homeSecondary: customHomeSecondary || '#888888',
        homeText: '#ffffff',
        scoreTextColor: '#111111',
        vsTextColor: '#999999',
        cellDiamondStroke: '#cccccc',
        hitLineColor: customAwayColor || '#222222',
        homeHitLineColor: customHomeColor || '#444444',
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
        awayColor: customAwayColor || '#ff0055',
        awaySecondary: customAwaySecondary || '#00f0ff',
        awayText: '#ffffff',
        homeColor: customHomeColor || '#00f0ff',
        homeSecondary: customHomeSecondary || '#ff0055',
        homeText: '#000000',
        scoreTextColor: '#f8fafc',
        vsTextColor: '#ff0055',
        cellDiamondStroke: '#00f0ff',
        hitLineColor: customAwayColor || '#ff0055',
        homeHitLineColor: customHomeColor || '#00f0ff',
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
        awayColor: customAwayColor || '#1d4ed8',
        awaySecondary: customAwaySecondary || '#b91c1c',
        awayText: '#ffffff',
        homeColor: customHomeColor || '#b91c1c',
        homeSecondary: customHomeSecondary || '#1d4ed8',
        homeText: '#ffffff',
        scoreTextColor: '#1e293b',
        vsTextColor: '#2563eb',
        cellDiamondStroke: '#93c5fd',
        hitLineColor: customAwayColor || '#1d4ed8',
        homeHitLineColor: customHomeColor || '#b91c1c',
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
        awayColor: customAwayColor || away.color,
        awaySecondary: customAwaySecondary || away.secondary,
        awayText: away.textColor || '#fff',
        homeColor: customHomeColor || home.color,
        homeSecondary: customHomeSecondary || home.secondary,
        homeText: home.textColor || '#fff',
        scoreTextColor: '#1a1209',
        vsTextColor: '#c0b499',
        cellDiamondStroke: '#c8bfa8',
        hitLineColor: customAwayColor || away.color,
        homeHitLineColor: customHomeColor || home.color,
      };
      break;
  }

  // Font overrides for theme feel
  if (theme === 'chalkboard') {
    themeObj.fontHeader = "'Caveat', cursive";
    themeObj.fontMono = "'Caveat', cursive";
    themeObj.fontSans = "'Caveat', cursive";
    themeObj.fontDisplay = "'Caveat', cursive";
    themeObj.isHandwritten = true;
  } else if (theme === 'retro70s') {
    themeObj.fontHeader = "'Bebas Neue', sans-serif";
    themeObj.fontDisplay = "'Oswald', sans-serif";
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
}
