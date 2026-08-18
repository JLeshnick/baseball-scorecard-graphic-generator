# ⚾ MLB Scorecard Graphic Art Generator

Generate **framable, print-quality scorecard posters** for any MLB game — complete with play-by-play data, base path diamonds, pitching stats, and team colors. Export as a high-resolution PNG or PDF in seconds.

🌐 **Live App:** [jleshnick.github.io/baseball-scorecard-graphic-generator](https://jleshnick.github.io/baseball-scorecard-graphic-generator/)

---

<!-- SCREENSHOT: Full app UI showing the light-mode layout with a game loaded -->
> 📸 _Screenshot placeholder — add a full-width screenshot of the app here_

---

## ✨ Features

- **Live MLB data** — pulls real play-by-play from the official MLB Stats API for any completed game
- **Interactive Live Scorebook** — score any game live in real-time or from scratch with hand scorebook notations (hits, strikeouts, groundouts, double plays, errors, walks), visual base path diamond advance tracking, RBI, pitch counts, and automatic box score & pitching calculations
- **SVG base path diamonds** — each at-bat rendered with accurate base paths (1B, 2B, 3B, HR) and correct backward-K notation for called strikeouts
- **Inning-by-inning linescore** — runs scored per inning displayed below each team's batting grid
- **Pitching stats table** — IP, H, R, ER, BB, K for every pitcher used
- **Portrait & Landscape Orientations** — switch between vertical stacked view and horizontal side-by-side view (Visiting team on the left, Home team on the right)
- **Modular Typography Styles** — pair any color theme with your choice of font style:
  - **Modern Graphic Print** (Crisp Oswald & JetBrains Mono)
  - **Handwritten Scorebook** (Authentic ballpoint pen ink with OpenType `calt` contextual letter variations)
  - **Graffiti & Street Tag** (Wildstyle spray paint marker font)
- **Ballpark Eraser Marks & Pencil Scribbles** — toggle realistic rubber eraser smudges, ghosted erased plays, and double-line graphite pencil scratch-outs with a 1-click re-roll button
- **6 Poster Color Themes** — Team Colors Light, Night Game Dark, Vintage Sepia, Monochrome, Graffiti Preset, Handwritten Preset
- **Fully customizable text & game notes** — edit the headline, subtitle, footer, and add multi-line **Game Notes & Highlights** printed directly on the poster
- **High-res export** — PNG at 3× pixel ratio, PDF formatted for A4 (portrait or landscape page format)
- **Print-ready** — browser print view hides all controls and outputs just the graphic

---

## 🖥️ How to Use the App

### Step 1 — Pick a Date and Game

Use the **Game** tab in the left sidebar to select a date and choose from all games played that day.

<!-- SCREENSHOT: Close-up of the Game tab in the sidebar showing the date picker and game dropdown with a game selected and the score summary badge visible -->
> 📸 _Screenshot placeholder — sidebar Game tab with date picker and game selector_

- Click the calendar icon or the date field to open the date picker
- The dropdown shows all games for that date with the final score
- Once a game is selected the scorecard loads automatically — no button to press

> **Tip:** The app defaults to yesterday's date so there's always a completed game ready to view.

---

### Step 2 — Choose Theme & Layout Orientation

Click the **Theme** tab to pick a visual theme and select your layout orientation:

#### Layout Orientation:
- **Portrait** — standard vertical layout with teams stacked
- **Landscape** — horizontal layout with Visiting team on the left and Home team on the right

#### Visual Themes:

| Theme Category | Theme Name | Description |
|----------------|------------|-------------|
| **Classic Themes** | **Team Colors** | Ivory paper background with team primary color accents |
| | **Night Game** | Deep navy background with glowing team color highlights |
| | **Vintage Sepia** | Aged parchment with warm brown and gold tones |
| | **Monochrome** | Clean white and ink black — great for grayscale printing |
| **Artistic & Specialty** | **Graffiti / Street Art** | Neon spray tag style, dark concrete background, wildstyle marker fonts |
| | **Handwritten Ballpark** | Classic blue ballpoint pen ink, scored by hand look with cursive pen typography |

<!-- SCREENSHOT: Side-by-side or 2x2 grid showing the same game rendered in different themes and orientations -->
> 📸 _Screenshot placeholder — theme choices and orientation toggle preview_

---

### Step 3 — Customize the Text (Optional)

Click the **Text** tab to edit what appears on the printed poster:

- **Headline / Date Text** — shown large at the top of the poster (defaults to the game date)
- **Subtitle** — venue and game context shown below the headline
- **Footer Print Text** — small text along the bottom edge of the poster

<!-- SCREENSHOT: Text tab open in the sidebar with custom text entered, and the graphic preview updating in real time -->
> 📸 _Screenshot placeholder — Text tab with custom entries and live preview_

All fields are pre-filled from the game data so you can leave them as-is or personalize them for a gift, print, or framing.

---

### Step 4 — Export Your Poster

Use the buttons in the top toolbar to save your graphic:

| Button | Output |
|--------|--------|
| **Export PNG** | High-resolution 3× PNG — best for digital sharing, framing, or custom printing |
| **PDF** | A4-formatted PDF (Portrait or Landscape based on chosen layout orientation) |
| **Print** | Opens the browser print dialog with just the scorecard — no UI chrome |

<!-- SCREENSHOT: The exported PNG graphic for a real game, full poster at final quality -->
> 📸 _Screenshot placeholder — example exported PNG poster at full quality_

> **File naming:** Exports are automatically named with the matchup and date, e.g. `MLB_Scorecard_CHC-vs-MIL_AUGUST-10-2026.png`

---

## 🎨 Reading the Scorecard

The scorecard uses standard baseball scorecard notation:

| Symbol | Meaning |
|--------|---------|
| Lines along diamond edges | Bases reached — 1 line = single, 2 = double, 3 = triple, all 4 = home run |
| Filled diamond (colored) | Home run |
| **K** | Strikeout swinging |
| **Ƙ** _(backwards K)_ | Strikeout looking (called third strike) |
| **6-3**, **F8**, **L7**, etc. | Fielding out using standard position numbers |
| **BB** | Walk (base on balls) |
| **HBP** | Hit by pitch |
| **DP** / **6-4-3** | Double play |
| **FC** | Fielder's choice |
| **SF** | Sacrifice fly |
| **SAC** | Sacrifice bunt |

<!-- SCREENSHOT: Close-up of a few scorecard cells showing a home run, a backwards K, and a fielding out with the diamond SVG clearly visible -->
> 📸 _Screenshot placeholder — close-up of scorecard cells showing different play types_

---

## 🛠️ Running Locally

### Requirements
- Node.js 18 or later
- npm

### Setup

```bash
# Clone the repo
git clone https://github.com/JLeshnick/baseball-scorecard-graphic-generator.git
cd baseball-scorecard-graphic-generator

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app opens at **http://localhost:3000** — no API keys, no `.env` file, no backend required. All data comes from the public MLB Stats API.

### Build for Production

```bash
npm run build
```

The production bundle is output to `dist/`.

---

## 🌐 GitHub Pages Deployment

The app is automatically deployed to GitHub Pages on every push to `main` via the included GitHub Actions workflow (`.github/workflows/deploy.yml`).

**To enable for your own fork:**

1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Push to `main` — the workflow builds and deploys automatically

The live URL will be:
```
https://[your-github-username].github.io/baseball-scorecard-graphic-generator/
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Styling | Inline styles (export-compatible) + Tailwind CSS utilities |
| Data | [MLB Stats API](https://statsapi.mlb.com) (public, no key required) |
| Export | [html-to-image](https://github.com/bubkoo/html-to-image) + [jsPDF](https://github.com/parallax/jsPDF) |
| Typography | Oswald · JetBrains Mono · Bebas Neue · Inter · Permanent Marker · Caveat (Google Fonts) |
| CI/CD | GitHub Actions → GitHub Pages |

---

## 📄 License

MIT — free to use, fork, and remix.
