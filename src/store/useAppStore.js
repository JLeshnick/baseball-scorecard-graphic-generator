import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // ─── Theme & Layout ─────────────────────────────────────────────
  appTheme: 'light',
  setAppTheme: (appTheme) => set({ appTheme }),
  
  theme: 'team-light',
  setTheme: (theme) => set({ theme }),
  
  fontStyle: 'modern',
  setFontStyle: (fontStyle) => set({ fontStyle }),
  
  orientation: 'portrait',
  setOrientation: (orientation) => set({ orientation }),
  
  // ─── Visual Toggles ──────────────────────────────────────────────
  showEraserMarks: false,
  setShowEraserMarks: (showEraserMarks) => set({ showEraserMarks }),
  
  eraserSeed: 0,
  setEraserSeed: (eraserSeed) => set({ eraserSeed }),
  
  showPitchBreakdown: true,
  setShowPitchBreakdown: (showPitchBreakdown) => set({ showPitchBreakdown }),
  
  showDecisions: true,
  setShowDecisions: (showDecisions) => set({ showDecisions }),
  
  showEnvironmentBox: true,
  setShowEnvironmentBox: (showEnvironmentBox) => set({ showEnvironmentBox }),
  
  showHRDistances: true,
  setShowHRDistances: (showHRDistances) => set({ showHRDistances }),
  
  showEndInningBases: true,
  setShowEndInningBases: (showEndInningBases) => set({ showEndInningBases }),
  
  blankMode: 'none',
  setBlankMode: (blankMode) => set({ blankMode }),
  
  showStatcast: false,
  setShowStatcast: (showStatcast) => set({ showStatcast }),
  
  showMomentum: false,
  setShowMomentum: (showMomentum) => set({ showMomentum }),
  
  showMvp: false,
  setShowMvp: (showMvp) => set({ showMvp }),
  
  showExtraEvents: true,
  setShowExtraEvents: (showExtraEvents) => set({ showExtraEvents }),
  
  showTeamWatermarks: true,
  setShowTeamWatermarks: (showTeamWatermarks) => set({ showTeamWatermarks }),

  // ─── Custom Text ────────────────────────────────────────────────
  customHeadline: '',
  setCustomHeadline: (customHeadline) => set({ customHeadline }),
  
  customSubtitle: '',
  setCustomSubtitle: (customSubtitle) => set({ customSubtitle }),
  
  customFooter: '',
  setCustomFooter: (customFooter) => set({ customFooter }),
  
  customNotes: '',
  setCustomNotes: (customNotes) => set({ customNotes }),
  
  customAwayColor: '',
  setCustomAwayColor: (customAwayColor) => set({ customAwayColor }),
  
  customHomeColor: '',
  setCustomHomeColor: (customHomeColor) => set({ customHomeColor }),

  // ─── Reset Actions ──────────────────────────────────────────────
  resetDisplayOptions: () => set({
    theme: 'team-light',
    fontStyle: 'modern',
    orientation: 'portrait',
    showEraserMarks: false,
    eraserSeed: 0,
    showPitchBreakdown: true,
    showDecisions: true,
    showEnvironmentBox: true,
    showHRDistances: true,
    showEndInningBases: true,
    blankMode: 'none',
    showStatcast: false,
    showMomentum: false,
    showMvp: false,
    showExtraEvents: true,
    showTeamWatermarks: true,
    customAwayColor: '',
    customHomeColor: '',
    customNotes: '',
  }),
}));
