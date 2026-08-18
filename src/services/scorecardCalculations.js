/**
 * Scorecard Calculations and Helpers
 * Automatically tallies linescores, runs, hits, errors, and pitcher stats
 * from manual or live scorebook play entries.
 */
import { TEAM_COLORS } from './mlbApi';

const DEFAULT_AWAY_LINEUP = [
  { jerseyNumber: '1', position: 'CF', name: 'LEADOFF', fullName: 'Leadoff Hitter' },
  { jerseyNumber: '2', position: 'SS', name: 'BATTER 2', fullName: 'Second Batter' },
  { jerseyNumber: '3', position: '1B', name: 'BATTER 3', fullName: 'Third Batter' },
  { jerseyNumber: '4', position: 'DH', name: 'CLEANUP', fullName: 'Cleanup Hitter' },
  { jerseyNumber: '5', position: '3B', name: 'BATTER 5', fullName: 'Fifth Batter' },
  { jerseyNumber: '6', position: 'RF', name: 'BATTER 6', fullName: 'Sixth Batter' },
  { jerseyNumber: '7', position: 'LF', name: 'BATTER 7', fullName: 'Seventh Batter' },
  { jerseyNumber: '8', position: '2B', name: 'BATTER 8', fullName: 'Eighth Batter' },
  { jerseyNumber: '9', position: 'C',  name: 'BATTER 9', fullName: 'Ninth Batter' },
];

const DEFAULT_HOME_LINEUP = [
  { jerseyNumber: '10', position: 'CF', name: 'LEADOFF', fullName: 'Leadoff Hitter' },
  { jerseyNumber: '11', position: 'SS', name: 'BATTER 2', fullName: 'Second Batter' },
  { jerseyNumber: '12', position: '1B', name: 'BATTER 3', fullName: 'Third Batter' },
  { jerseyNumber: '13', position: 'DH', name: 'CLEANUP', fullName: 'Cleanup Hitter' },
  { jerseyNumber: '14', position: '3B', name: 'BATTER 5', fullName: 'Fifth Batter' },
  { jerseyNumber: '15', position: 'RF', name: 'BATTER 6', fullName: 'Sixth Batter' },
  { jerseyNumber: '16', position: 'LF', name: 'BATTER 7', fullName: 'Seventh Batter' },
  { jerseyNumber: '17', position: '2B', name: 'BATTER 8', fullName: 'Eighth Batter' },
  { jerseyNumber: '18', position: 'C',  name: 'BATTER 9', fullName: 'Ninth Batter' },
];

export function getTodayDateDisplay() {
  const d = new Date();
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
}

/**
 * Creates a brand new empty scorecard data structure
 */
export function createBlankScorecardData({
  awayName = 'VISITING TEAM',
  awayAbbr = 'AWAY',
  awayColor = '#0e3386',
  awaySecondary = '#cc3433',
  homeName = 'HOME TEAM',
  homeAbbr = 'HOME',
  homeColor = '#c41e3a',
  homeSecondary = '#0c2340',
  venue = 'BALLPARK',
  totalInnings = 9,
  dateDisplay = null,
  awayBatters = null,
  homeBatters = null,
  awayPitcher = '',
  homePitcher = '',
} = {}) {
  const initialLinescore = Array.from({ length: totalInnings }, (_, i) => ({
    num: i + 1,
    away: 0,
    home: 0,
  }));

  const buildBatters = (lineup, prefix) => {
    if (lineup && lineup.length > 0) {
      return lineup.map((item, idx) => ({
        id: `${prefix}_${idx + 1}`,
        jerseyNumber: item.jerseyNumber !== undefined ? String(item.jerseyNumber) : '',
        position: item.position || '',
        name: (item.name || '').toUpperCase(),
        fullName: item.fullName || item.name || '',
        subNotes: item.subNotes || [],
        plays: item.plays || {},
      }));
    }
    // Clean blank slots without placeholder text
    return Array.from({ length: 9 }, (_, idx) => ({
      id: `${prefix}_${idx + 1}`,
      jerseyNumber: '',
      position: '',
      name: '',
      fullName: '',
      subNotes: [],
      plays: {},
    }));
  };

  const awayData = {
    batters: buildBatters(awayBatters, 'away'),
    pitchers: [
      {
        id: 'away_p1',
        number: '',
        name: (awayPitcher || '').toUpperCase(),
        strikeouts: [],
        ip: '0.0',
        hits: 0,
        runs: 0,
        earnedRuns: 0,
        walks: 0,
        pitchesByInning: {},
        totalPitches: 0,
        totalStrikes: 0,
        totalBalls: 0,
      }
    ],
    subsList: [],
    teamTotalPitches: 0,
    teamTotalStrikes: 0,
    teamTotalBalls: 0,
  };

  const homeData = {
    batters: buildBatters(homeBatters, 'home'),
    pitchers: [
      {
        id: 'home_p1',
        number: '',
        name: (homePitcher || '').toUpperCase(),
        strikeouts: [],
        ip: '0.0',
        hits: 0,
        runs: 0,
        earnedRuns: 0,
        walks: 0,
        pitchesByInning: {},
        totalPitches: 0,
        totalStrikes: 0,
        totalBalls: 0,
      }
    ],
    subsList: [],
    teamTotalPitches: 0,
    teamTotalStrikes: 0,
    teamTotalBalls: 0,
  };

  return {
    isLiveScorebook: true,
    gameInfo: {
      gamePk: `live_${Date.now()}`,
      dateDisplay: dateDisplay || getTodayDateDisplay(),
      venue,
      headline: 'LIVE SCOREBOOK',
      totalInnings,
      awayTeam: {
        id: 'away_team',
        name: awayName,
        abbreviation: awayAbbr.toUpperCase(),
        score: 0,
        hits: 0,
        errors: 0,
        color: awayColor,
        secondary: awaySecondary,
        textColor: '#ffffff',
      },
      homeTeam: {
        id: 'home_team',
        name: homeName,
        abbreviation: homeAbbr.toUpperCase(),
        score: 0,
        hits: 0,
        errors: 0,
        color: homeColor,
        secondary: homeSecondary,
        textColor: '#ffffff',
      },
      linescore: initialLinescore,
      weatherStr: '72°F CLEAR WIND: 5 MPH OUT TO CF',
      attendance: 'ATT: —',
      durationStr: 'TIME: —',
      decisions: { winner: '', loser: '', save: '' },
      hrHighlights: [],
      topHits: [],
      gameMomentum: [],
      gameMvp: null,
    },
    awayData,
    homeData,
  };
}

/**
 * Creates a blank live scorebook initialized with rosters/teams from an MLB game
 */
export function createScorecardFromMlbGame(mlbData) {
  if (!mlbData) return createBlankScorecardData();

  const cloned = JSON.parse(JSON.stringify(mlbData));
  cloned.isLiveScorebook = true;

  // Clear plays from batters while preserving rosters
  if (cloned.awayData?.batters) {
    cloned.awayData.batters.forEach(b => {
      b.plays = {};
    });
  }
  if (cloned.homeData?.batters) {
    cloned.homeData.batters.forEach(b => {
      b.plays = {};
    });
  }

  // Reset pitchers
  const resetPitcher = p => ({
    ...p,
    strikeouts: [],
    ip: '0.0',
    hits: 0,
    runs: 0,
    earnedRuns: 0,
    walks: 0,
    pitchesByInning: {},
    totalPitches: 0,
    totalStrikes: 0,
    totalBalls: 0,
  });

  if (cloned.awayData?.pitchers) {
    cloned.awayData.pitchers = cloned.awayData.pitchers.map(resetPitcher);
  }
  if (cloned.homeData?.pitchers) {
    cloned.homeData.pitchers = cloned.homeData.pitchers.map(resetPitcher);
  }

  // Reset linescore and scores
  const totalInnings = Math.max(9, cloned.gameInfo?.totalInnings || 9);
  cloned.gameInfo.totalInnings = totalInnings;
  cloned.gameInfo.linescore = Array.from({ length: totalInnings }, (_, i) => ({
    num: i + 1,
    away: 0,
    home: 0,
  }));
  cloned.gameInfo.awayTeam.score = 0;
  cloned.gameInfo.awayTeam.hits = 0;
  cloned.gameInfo.awayTeam.errors = 0;
  cloned.gameInfo.homeTeam.score = 0;
  cloned.gameInfo.homeTeam.hits = 0;
  cloned.gameInfo.homeTeam.errors = 0;
  cloned.gameInfo.hrHighlights = [];
  cloned.gameInfo.topHits = [];
  cloned.gameInfo.gameMomentum = [];
  cloned.gameInfo.gameMvp = null;
  cloned.gameInfo.decisions = { winner: '', loser: '', save: '' };
  cloned.gameInfo.isFinal = false;
  cloned.gameInfo.isLive = false;
  cloned.gameInfo.statusDisplay = 'MANUAL SCOREBOOK';

  return cloned;
}

/**
 * Calculates outs from a play object
 */
export function getOutsFromPlay(play) {
  if (!play || !play.code) return 0;
  if (typeof play.outsRecorded === 'number') return play.outsRecorded;

  const code = (play.code || '').toUpperCase();
  const type = play.type || '';

  if (type === 'strikeout') return 1;
  if (code.includes('DP') || code === '6-4-3' || code === '4-6-3' || code === '5-4-3' || code === '1-6-3' || code === '3-6-3') return 2;
  if (code.includes('TP') || code.includes('TRIPLE PLAY')) return 3;
  if (type === 'out') return 1;
  if (code.startsWith('F') || code.startsWith('L') || code.startsWith('P') || /^[1-9]-[1-9]$/.test(code) || code === 'FC' || code === 'SAC' || code === 'SF') {
    return 1;
  }
  return 0;
}

/**
 * Formats outs count to IP (e.g. 7 outs -> 2.1)
 */
export function formatOutsToIP(outs) {
  if (outs === undefined || outs === null) return '0.0';
  const full = Math.floor(outs / 3);
  const rem = outs % 3;
  return `${full}.${rem}`;
}

/**
 * Automatically recalculates linescore, team totals, and pitcher stats from plays.
 */
export function recalculateScorecardStats(scorecard) {
  if (!scorecard) return scorecard;
  const next = JSON.parse(JSON.stringify(scorecard));
  const totalInnings = Math.max(9, next.gameInfo?.totalInnings || 9);

  // Recalculate Away Team (batting in top of innings, Home Pitchers pitching)
  const awayInningRuns = {};
  let awayHits = 0;
  let awayErrors = 0;
  let awayTotalRuns = 0;
  const awayHrHighlights = [];

  for (let n = 1; n <= totalInnings; n++) {
    awayInningRuns[n] = 0;
  }

  (next.awayData?.batters || []).forEach(b => {
    Object.entries(b.plays || {}).forEach(([innKey, playOrArr]) => {
      const innNum = parseInt(innKey, 10);
      if (isNaN(innNum)) return;
      const plays = Array.isArray(playOrArr) ? playOrArr : [playOrArr];

      plays.forEach(p => {
        if (!p || !p.code) return;

        // Check if run scored
        const reachedHome = p.bases === 4 || p.type === 'hr' || p.scoredRun;
        if (reachedHome) {
          awayInningRuns[innNum] = (awayInningRuns[innNum] || 0) + 1;
          awayTotalRuns++;
        }

        // Check if hit
        if (p.type === 'hit' || p.type === 'hr' || ['1B', '2B', '3B', 'HR', 'IPHR', 'GRD'].includes(p.code)) {
          awayHits++;
        }

        // Check if error
        if (p.type === 'error' || p.code.startsWith('E')) {
          // Error committed by the defending team (Home team)
          next.gameInfo.homeTeam.errors = (next.gameInfo.homeTeam.errors || 0) + 1;
        }

        if (p.type === 'hr' || p.code.startsWith('HR')) {
          awayHrHighlights.push({
            batterName: b.name,
            pitcherName: next.homeData?.pitchers?.[0]?.name || 'PITCHER',
            team: next.gameInfo.awayTeam.abbreviation,
            inn: `T${innNum}`,
            dist: p.statcast?.totalDistance ? `${Math.round(p.statcast.totalDistance)} FT` : '',
            speed: p.statcast?.launchSpeed ? `${p.statcast.launchSpeed} MPH` : '',
            angle: p.statcast?.launchAngle ? `${p.statcast.launchAngle}°` : '',
            rbi: p.rbi || 1,
            desc: `${b.name} Home Run`,
          });
        }
      });
    });
  });

  // Recalculate Home Team (batting in bottom of innings, Away Pitchers pitching)
  const homeInningRuns = {};
  let homeHits = 0;
  let homeTotalRuns = 0;
  const homeHrHighlights = [];

  for (let n = 1; n <= totalInnings; n++) {
    homeInningRuns[n] = 0;
  }

  (next.homeData?.batters || []).forEach(b => {
    Object.entries(b.plays || {}).forEach(([innKey, playOrArr]) => {
      const innNum = parseInt(innKey, 10);
      if (isNaN(innNum)) return;
      const plays = Array.isArray(playOrArr) ? playOrArr : [playOrArr];

      plays.forEach(p => {
        if (!p || !p.code) return;

        // Check if run scored
        const reachedHome = p.bases === 4 || p.type === 'hr' || p.scoredRun;
        if (reachedHome) {
          homeInningRuns[innNum] = (homeInningRuns[innNum] || 0) + 1;
          homeTotalRuns++;
        }

        // Check if hit
        if (p.type === 'hit' || p.type === 'hr' || ['1B', '2B', '3B', 'HR', 'IPHR', 'GRD'].includes(p.code)) {
          homeHits++;
        }

        // Check if error
        if (p.type === 'error' || p.code.startsWith('E')) {
          // Error committed by Away team
          awayErrors++;
        }

        if (p.type === 'hr' || p.code.startsWith('HR')) {
          homeHrHighlights.push({
            batterName: b.name,
            pitcherName: next.awayData?.pitchers?.[0]?.name || 'PITCHER',
            team: next.gameInfo.homeTeam.abbreviation,
            inn: `B${innNum}`,
            dist: p.statcast?.totalDistance ? `${Math.round(p.statcast.totalDistance)} FT` : '',
            speed: p.statcast?.launchSpeed ? `${p.statcast.launchSpeed} MPH` : '',
            angle: p.statcast?.launchAngle ? `${p.statcast.launchAngle}°` : '',
            rbi: p.rbi || 1,
            desc: `${b.name} Home Run`,
          });
        }
      });
    });
  });

  // Calculate linescore
  const newLinescore = Array.from({ length: totalInnings }, (_, i) => {
    const num = i + 1;
    return {
      num,
      away: awayInningRuns[num] ?? 0,
      home: homeInningRuns[num] ?? 0,
    };
  });

  next.gameInfo.linescore = newLinescore;
  next.gameInfo.awayTeam.score = awayTotalRuns;
  next.gameInfo.awayTeam.hits = awayHits;
  next.gameInfo.awayTeam.errors = awayErrors;
  next.gameInfo.homeTeam.score = homeTotalRuns;
  next.gameInfo.homeTeam.hits = homeHits;

  next.gameInfo.hrHighlights = [...awayHrHighlights, ...homeHrHighlights];

  // Calculate pitching stats for Home Pitcher (pitched against away batters)
  let homePitcherOuts = 0;
  let homePitcherKs = [];
  let homePitcherWalks = 0;
  let homePitcherPitches = 0;

  (next.awayData?.batters || []).forEach(b => {
    Object.values(b.plays || {}).forEach(playOrArr => {
      const plays = Array.isArray(playOrArr) ? playOrArr : [playOrArr];
      plays.forEach(p => {
        if (!p || !p.code) return;
        homePitcherOuts += getOutsFromPlay(p);
        if (p.type === 'strikeout' || p.code === 'K' || p.code === 'ꓘ') {
          homePitcherKs.push({ code: 'K', isLooking: p.isLooking || p.code === 'ꓘ' });
        }
        if (p.type === 'walk' || p.code === 'BB' || p.code === 'IBB' || p.code === 'HBP') {
          homePitcherWalks++;
        }
        if (p.pitchCount) {
          homePitcherPitches += p.pitchCount;
        }
      });
    });
  });

  if (next.homeData?.pitchers?.[0]) {
    const hp = next.homeData.pitchers[0];
    hp.ip = formatOutsToIP(homePitcherOuts);
    hp.hits = awayHits;
    hp.runs = awayTotalRuns;
    hp.earnedRuns = awayTotalRuns;
    hp.walks = homePitcherWalks;
    hp.strikeouts = homePitcherKs;
    hp.totalPitches = homePitcherPitches || Math.max(homePitcherOuts * 4, 15);
  }

  // Calculate pitching stats for Away Pitcher (pitched against home batters)
  let awayPitcherOuts = 0;
  let awayPitcherKs = [];
  let awayPitcherWalks = 0;
  let awayPitcherPitches = 0;

  (next.homeData?.batters || []).forEach(b => {
    Object.values(b.plays || {}).forEach(playOrArr => {
      const plays = Array.isArray(playOrArr) ? playOrArr : [playOrArr];
      plays.forEach(p => {
        if (!p || !p.code) return;
        awayPitcherOuts += getOutsFromPlay(p);
        if (p.type === 'strikeout' || p.code === 'K' || p.code === 'ꓘ') {
          awayPitcherKs.push({ code: 'K', isLooking: p.isLooking || p.code === 'ꓘ' });
        }
        if (p.type === 'walk' || p.code === 'BB' || p.code === 'IBB' || p.code === 'HBP') {
          awayPitcherWalks++;
        }
        if (p.pitchCount) {
          awayPitcherPitches += p.pitchCount;
        }
      });
    });
  });

  if (next.awayData?.pitchers?.[0]) {
    const ap = next.awayData.pitchers[0];
    ap.ip = formatOutsToIP(awayPitcherOuts);
    ap.hits = homeHits;
    ap.runs = homeTotalRuns;
    ap.earnedRuns = homeTotalRuns;
    ap.walks = awayPitcherWalks;
    ap.strikeouts = awayPitcherKs;
    ap.totalPitches = awayPitcherPitches || Math.max(awayPitcherOuts * 4, 15);
  }

  return next;
}
