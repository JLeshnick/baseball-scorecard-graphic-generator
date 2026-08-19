import React from 'react';
import {
  Download,
  FileSpreadsheet,
  FileJson,
  ChevronDown,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sun,
  Moon,
} from 'lucide-react';

const GithubIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Header({
  headerRef,
  c,
  isDark,
  isMobile,
  exporting,
  loading,
  exportOpen,
  setExportOpen,
  exportQuality,
  setExportQuality,
  rawGameData,
  handleExportPNG,
  handleExportPDF,
  handleExportRawData,
  handleCopyShareLink,
  userZoomScale,
  setUserZoomScale,
  setPanOffset,
  fitScale,
  activeScale,
  handleGlobalReset,
  setAppTheme,
}) {
  return (
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
  );
}
