export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getYesterdayDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const POSTER_THEMES = [
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

export const getAppThemeColors = (isDark) => ({
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
});
