# Pull Request Information

**Branch:** `fix/mobile-site-and-vite-base`  
**Target Branch:** `main`  
**PR Creation Link:** [Create Pull Request on GitHub](https://github.com/JLeshnick/baseball-scorecard-studio/pull/new/fix/mobile-site-and-vite-base)

---

## PR Title
```text
feat: add pitch highlight filters, pitcher visualizer, hover polish, and compact columns
```

---

## PR Description

```markdown
### Summary of Changes

- **Hit Visualizer Hover-Only Interaction (`src/components/Sidebar.jsx`, `src/components/AtBatInspectionModal.jsx`, `src/components/PitcherInspectionModal.jsx`):**
  - Converted hit visualizer pills and SVG trajectories to strictly hover-activated interaction (`onMouseEnter` / `onMouseLeave`), removing persistent selection lock-in.
  - Hovering any hit or foul ball highlights that specific trajectory and enunciates its Statcast metrics (Exit Velocity, Launch Angle, Distance) while dimming other hits.

- **Neutralize Batter Box Highlighting in Pitcher Visualizer (`src/components/Sidebar.jsx`, `src/components/PitcherInspectionModal.jsx`):**
  - When inspecting a pitcher's inning or full outing, RHB/LHB batter boxes now render with neutral dashed outlines without favoring one side of the plate over another (since pitchers face both left- and right-handed batters throughout an inning).
  - Single-cell at-bat inspection continues to highlight the active batter's box.

- **Full-Game Batter Performance Inspection & Lineup Click Support (`src/App.jsx`, `src/components/ScorecardGraphic.jsx`, `src/components/Sidebar.jsx`, `src/components/AtBatInspectionModal.jsx`):**
  - Clicking any batter's name in the scorecard lineup now opens their **Full-Game Performance Inspection**:
    - Aggregates all pitches and batted balls across every plate appearance in the entire game into a unified Strike Zone & Field Spray chart.
    - Added Scope buttons (`All (4 PA)`, `① Inn 1 · 1B`, `② Inn 3 · HR`, etc.) allowing seamless switching between their combined game summary and individual at-bats.
    - Shows `[FULL GAME]` header badge with full game pitch breakdown (`16P · 10S 6B`) and total batted ball counts.
    - Highlights the selected batter row in the lineup card (`activeCellKey === 'batter-{teamKey}-{id}'`) with interactive blue focus outline.

- **Expanded Visualizer Vertical Canvas Height (No Overlap with Top Tooltip)**:
  - Increased strike zone and hit visualizer canvas heights across all components:
    - **Desktop Sidebar**: Increased from 135px/145px to **175px**.
    - **Mobile At-Bat Sheet**: Increased from 175px/185px to **230px**.
    - **Mobile Pitcher Sheet**: Increased from 240px to **260px**.
  - Provides generous vertical breathing room so high pitches at the top of the strike zone never collide with the floating hover tooltip.

- **Single Pitch & Batted Ball Hover Isolation & On-Top Stacking:**
  - Dynamic SVG sorting ensures hovered items render last in SVG document order (always on top).
  - Dimming logic isolates single pitches without legacy cluster rings.

- **Pitcher Cell Inspection & Visualizer in Navigation Sidebar (`src/App.jsx`, `src/components/ScorecardGraphic.jsx`, `src/components/Sidebar.jsx`, `src/components/PitcherInspectionModal.jsx`, `src/services/mlbApi.js`):**
  - Clicking any pitcher header or per-inning breakdown cell opens the Pitcher Performance Visualizer directly in the navigation sidebar.
  - **Explicit Pitcher Scoping in Multi-Pitcher Innings**: Fixed pitch attribution logic in `getPitcherPlays` and `mlbApi.js` so when multiple pitchers appear in the same inning (e.g. pitching change mid-inning), clicking each pitcher's cell strictly and exclusively displays that pitcher's own pitches, balls, and batted balls allowed.
  - Supports both full-outing and per-inning scoping.

- **Widen Navigation Sidebar (`src/components/Sidebar.jsx`):**
  - Expanded navigation sidebar from `330px` to `380px` for comfortable readability of long pitch descriptions.

- **Lineup & Pitcher Column Width Optimizations (`src/components/ScorecardGraphic.jsx`):**
  - Slimmed down player position and name columns to maximize space across the scorecard in landscape mode.
  - Positioned total pitches pill in the top-right header row of pitcher cells.

- **Documentation & Deployment Updates (`README.md`, `vite.config.js`):**
  - Updated `README.md` with full details on pitcher inspection, pitch tendency filters, Statcast hover metrics, and lineup optimizations.
  - Configured relative base path (`'./'`) for GitHub Pages deployment.

### Verification
- `npm test`: All 6 test suites passed.
- `npm run build`: Production build verified with zero errors.
```
