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

- **Pitch & Hit Breakdown Summaries & In-Canvas Floating Legends (`src/components/Sidebar.jsx`, `src/components/AtBatInspectionModal.jsx`, `src/components/PitcherInspectionModal.jsx`):**
  - Integrated abbreviated **Balls & Strikes** (`{totalPitches}P · {strikes}S {balls}B`) and **Hits & Fouls** (`{battedBalls}B · {hits}H {fouls}F`) directly into:
    - Mode selector tab buttons: `Pitches (24P · 16S 8B)` and `Hit/Foul Spray (3B · 2H 1F)`.
    - Main container title headers (`[INN 1] #17 Shohei Ohtani · 18P · 12S 6B`).
  - **Embedded In-Canvas Floating Legends**:
    - Relocated the balls, strikes, fouls, and hit/out color keys into a sleek, semi-transparent floating legend directly inside the canvas itself (`● Strike`, `● Ball`, `● Foul` / `● Hit`, `● Foul`, `● Out`).
    - Removed redundant intermediate text headers (`"Strike Zone (22P · 11S 10B)"` and count keys) to maximize visual real estate and eliminate clutter.
    - Hover bars dynamically appear only when hovering over a specific pitch or batted ball.
  - **Refactored Container Header & Metadata Rows**:
    - Removed redundant `"HOME/AWAY PITCHER"` pill, `"Pitcher:"` row, and `"Scope:"` row.
    - Added dedicated rows for **Strike Rate / Command** (`67% (12 Strikes / 6 Balls)`), **Batted Balls Allowed** (`3 In Play (2H · 1F)`), and **Pitching Line** (`6.0 IP · 8 K · 1 BB · 2 ER`).

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
