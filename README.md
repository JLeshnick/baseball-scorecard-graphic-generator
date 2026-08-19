# Baseball Scorecard Studio

A comprehensive, live MLB scoring studio and print-quality baseball scorecard generator. Score games live in real-time with an interactive digital scorebook, track active MLB games with pitch-by-pitch strike zone visualizers, multi-angle trajectory arcs, and Statcast metrics, or generate retro and modern framable scorecard posters for any game in MLB history.

**Live App:** [https://jleshnick.github.io/baseball-scorecard-studio](https://jleshnick.github.io/baseball-scorecard-studio/)

---

## Key Features

### 1. Live MLB Game Day Hub & Real-Time Tracking
- **Live MLB Stats API Integration** — Pulls official play-by-play, box scores, lineups, and pitching data for active, upcoming, and completed MLB games.
- **Auto-Polling Live Tracker** — Automatically updates live in-progress games with the latest plays, counts, and pitching lines.
- **Unified Live Game Dashboard** — Real-time game state displaying active inning, score, digital and visual Ball/Strike/Out count indicators, and a dynamic base runners diamond.
- **Dual-Angle Pitch Visualizer** —
  - **Catcher Front View:** 9-zone strike zone box plotting every pitch in the at-bat with pitch numbers, velocity (MPH), concise pitch types (`4-Seam`, `2-Seam`, `Cutter`, `Sinker`, `Slider`, `Sweeper`, `Changeup`, `Curveball`, `Splitter`), and color-coded outcomes (Strikes, Balls, Fouls, In-Play).
  - **Side Flight Arc View:** 54-ft mound-to-plate flight trajectory rendering vertical release height, pitch arc, and total vertical drop break (inches).
- **Hit & Foul Spray Visualizer** —
  - **Field Spray Top View:** Multi-hit field spray capturing all fair hits and foul balls in the plate appearance with launch angle trajectory lines.
  - **Elevation Arc Side View:** Side profile stadium view plotting true parabolic apex height and projected distance against warning track and 10 FT outfield wall.
  - **Real-Time Hover Enunciation:** Hovering any flight curve, landing dot, or sequence chip instantly enunciates pitch number, exit velocity (MPH), projected distance (FT), and Statcast metrics in the top header.
- **Interactive At-Bat & Inning Fate Inspection** — Click any scorecard cell or roster name to inspect that plate appearance's pitches, hits, and final inning fate (`Scored Run`, `Left on Base`, `Out on Basepaths`).

### 2. Interactive Digital Scorebook (Manual Scorekeeping)
- **Click-to-Score Grid** — Click any batter cell in any inning to log at-bats with quick presets or custom codes.
- **Visual Diamond Progression** — Supports own at-bat reach (dashed base paths) and subsequent end-of-inning advancements (solid base paths).
- **Basepath Outs & Notation** — Full support for caught stealing (`CS`), pickoffs (`PO`), and runner outs on basepaths (`1B`, `2B`, `3B`, `Home Plate`) with diamond markers and badges.
- **Multi-PA Inning Indicators** — Visual sequence counters (`①`, `②`, `③`) and clean split sub-cells for teams that bat around in a single inning.
- **Pitching Staff Management** — Dynamically insert additional relief pitchers, assign decisions (`W`, `L`, `SV`, `HLD`), and record custom pitching lines.
- **Lineup Substitutions** — Track pinch-hitters and defensive changes with official scorebook lettering (`a.`, `b.`, `c.`).
- **Matchup Lineup Pre-filling** — 1-click import of real starting lineups and rosters from any MLB matchup directly into a blank scorebook.

### 3. Statcast Highlights & Game Analytics
- **Home Run & Top Hits Leaderboard** — Showcases launch speeds (MPH), projected hit distances (FT), launch angles (°), and pitch details.
- **Game Momentum Progression** — Inning-by-inning score progression and run differential tracking.
- **Game MVP Award** — Automated MVP and winning pitcher badges for completed games.
- **Pitch Count Breakdowns** — Pitcher total pitches, strikes, balls, and strike percentage breakdowns.

### 4. Framable Poster Themes & Customization
- **6 Poster Color Themes** — Team Colors Light, Night Game Dark, Vintage Sepia, Newspaper Print, Blueprint, and Clean Monochrome.
- **Custom Team Colors** — Full hex color pickers to customize away and home accent colors.
- **Modular Typography Styles** — Modern Graphic Print (Oswald & JetBrains Mono), Handwritten Ballpark (Caveat pen ink with contextual ligatures), and Graffiti Tag (Permanent Marker).
- **Authentic Eraser Marks & Graphite Scratch-Outs** — Realistic rubber smudges and pencil cross-outs with a 1-click re-roll seed button.
- **Customizable Headers & Notes** — Personalize headline, venue subtitle, footer, and multi-line game notes.
- **Orientation Modes** — Instant toggle between Portrait (vertical stacked) and Landscape (side-by-side) layouts.

### 5. Built-in Scorekeeping Guide & Notation Key
- **Comprehensive Reference** — Complete scoring notation key for hits, strikeouts, putouts, errors, fielder's choices, double plays, basepath outs, Statcast metrics, pitch types, and fielding position numbers.
- **Live Search & Filter** — Fast search bar to quickly look up symbols and terms.
- **Pin to Canvas (Desktop)** — Pin the scoring guide floating alongside your scorecard while scoring live.

### 6. Print & Ultra-High-Resolution Export
- **3x Ultra-HD PNG Export** — Crisp, high-DPI raster rendering perfect for digital archives and framing.
- **Vector A4 PDF Export** — Formatted for A4 printing in both Portrait and Landscape orientations.
- **Interactive UI Stripping** — Clean exports that automatically strip editing buttons, hover outlines, and interactive controls from the final graphic.

---

## Visual Themes

| Theme | Background | Description |
|-------|------------|-------------|
| **Team Colors Light** | Warm Ivory (#fbfaf7) | Classic scorecard paper with official team primary color accents |
| **Night Game Dark** | Deep Slate (#0f172a) | Modern dark mode with luminous team color highlights |
| **Vintage Sepia** | Aged Parchment (#f4eedb) | Retro ballpark aesthetic with warm sepia and amber ink tones |
| **Newspaper** | Newsprint (#ece8e1) | High-contrast editorial ink style inspired by sports page boxscores |
| **Blueprint** | Draftsman Blue (#0b2545) | Technical drafting blueprint aesthetic with crisp cyan highlights |
| **Monochrome** | Minimalist White (#ffffff) | Clean black-and-white ink layout optimized for home laser printers |

---

## Scorekeeping Notation Reference

| Code / Symbol | Meaning | Description |
|---------------|---------|-------------|
| **1B / 2B / 3B** | Single / Double / Triple | Base hit reaching first, second, or third base (dashed line) |
| **HR [Dist]** | Home Run | Home run (with full diamond highlight & optional Statcast distance in feet) |
| **K** | Strikeout Swinging | Batter swung and missed on strike three (forward K) |
| **ꓘ** | Strikeout Looking | Called third strike (backwards K) |
| **BB / IBB** | Walk / Intentional Walk | Four balls or intentional base on balls |
| **HBP** | Hit by Pitch | Batter awarded first base after being struck by pitch |
| **6-3, 4-3, 5-3** | Groundout | Ground ball fielded by shortstop/2B/3B thrown to 1B |
| **F8, F7, F9** | Flyout | Fly ball caught by center, left, or right fielder |
| **L6, L4, L5** | Lineout | Line drive caught by infielder |
| **DP / 6-4-3** | Double Play | Two outs recorded on single continuous play |
| **TP / 5-4-3** | Triple Play | Three outs recorded on single continuous play |
| **FC** | Fielder's Choice | Batter reaches base as defense attempts putout on another runner |
| **E1–E9** | Fielding Error | Batter reaches base on defensive misplay by position #1–9 |
| **X 2B / 3B / HP** | Out on Basepaths | Runner tagged or forced out advancing on bases (red X mark) |
| **CS / PO** | Caught Stealing / Pickoff | Runner put out attempting steal or picked off base |
| **SB / WP / PB** | Stolen Base / Wild Pitch / Passed Ball | Runner advancement events |
| **SCORED / LOB** | Scored Run / Left on Base | Inning fate: crossed home plate to score vs left stranded at 3rd out |
| **① / ② / ③** | Multi-PA in Inning | Numbered plate appearance indicator for batting around in order |
| **a. / b. / c.** | Lineup Substitution | Pinch hitter or defensive substitution indicator |

---

## Pitch Types & Visualizer Nomenclature

| Pitch Type | Code | Description |
|------------|------|-------------|
| **4-Seam** | FF | Four-seam riding fastball |
| **2-Seam** | FT | Two-seam fastball with arm-side tail |
| **Cutter** | FC | Cut fastball with sharp glove-side break |
| **Sinker** | SI | Heavy downward sinking fastball |
| **Slider** | SL | Sharp horizontal and downward breaking ball |
| **Sweeper** | ST | High-spin wide horizontal sweep slider |
| **Slurve** | SV | Hybrid slider-curveball break |
| **Changeup** | CH | Off-speed pitch with late tumbling drop |
| **Curveball** | CU | 12-6 or sweeping vertical loop curve |
| **Knuckle Curve** | KC | Spiked-grip downer curveball |
| **Splitter** | FS | Tumbling split-finger diving pitch |
| **Forkball** | FO | Deep-grip plunging off-speed pitch |
| **Knuckleball** | KN | Erratic zero-spin flutterball |
| **Eephus** | EP | Ultra slow high-arcing rainbow pitch |
| **Int. Ball** | IN | Intentional ball thrown outside zone |

---

## Running Locally

### Prerequisites
- Node.js 18 or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/JLeshnick/baseball-scorecard-graphic-generator.git
cd baseball-scorecard-graphic-generator

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will start at **`http://localhost:3000`** with hot module replacement. No API keys or backend servers are required — all live and historical data is retrieved directly from the public MLB Stats API.

### Production Build

```bash
npm run build
```

Build artifacts are compiled into the `dist/` directory.

---

## Tech Stack

- **Framework:** React 19 + Vite 8
- **State Management:** Zustand
- **Icons:** Lucide React
- **Data Source:** [MLB Stats API](https://statsapi.mlb.com)
- **Image & PDF Export:** html-to-image + jsPDF + DOMPurify
- **Fonts:** Oswald, JetBrains Mono, Bebas Neue, Inter, Permanent Marker, Caveat (Google Fonts)
- **Deployment:** GitHub Actions → GitHub Pages

---

## License

MIT — Created for baseball fans, scorekeepers, and designers.
