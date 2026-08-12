/**
 * MLB Stats API Service & Baseball Scorecard Data Parser
 */

export const TEAM_COLORS = {
  MIL: { primary: '#0a2351', secondary: '#ffc52f', text: '#ffc52f', darkBg: '#09152a' },
  CHC: { primary: '#0e3386', secondary: '#cc3433', text: '#ffffff', darkBg: '#081a42' },
  LAD: { primary: '#005a9c', secondary: '#ef3e42', text: '#ffffff', darkBg: '#002e52' },
  NYY: { primary: '#0c2340', secondary: '#c4ced4', text: '#ffffff', darkBg: '#061120' },
  PHI: { primary: '#e31837', secondary: '#002d62', text: '#ffffff', darkBg: '#700c1b' },
  ATL: { primary: '#13274f', secondary: '#ce1141', text: '#ffffff', darkBg: '#0a1428' },
  BOS: { primary: '#bd3039', secondary: '#0c2340', text: '#ffffff', darkBg: '#5e181c' },
  HOU: { primary: '#002d62', secondary: '#eb6e1f', text: '#ffffff', darkBg: '#001631' },
  TEX: { primary: '#003278', secondary: '#c0111f', text: '#ffffff', darkBg: '#00193c' },
  ARI: { primary: '#a71930', secondary: '#e3d4ad', text: '#ffffff', darkBg: '#530c18' },
  SD:  { primary: '#2f241d', secondary: '#ffc425', text: '#ffc425', darkBg: '#17120e' },
  SF:  { primary: '#fd5a1e', secondary: '#27251f', text: '#ffffff', darkBg: '#7e2d0f' },
  NYM: { primary: '#002d72', secondary: '#ff5910', text: '#ffffff', darkBg: '#001639' },
  STL: { primary: '#c41e3a', secondary: '#0c2340', text: '#ffffff', darkBg: '#620f1d' },
  BAL: { primary: '#df4601', secondary: '#000000', text: '#ffffff', darkBg: '#6f2300' },
  CLE: { primary: '#002b5c', secondary: '#e31937', text: '#ffffff', darkBg: '#00152e' },
  DET: { primary: '#0c2340', secondary: '#fa4616', text: '#ffffff', darkBg: '#061120' },
  MIN: { primary: '#002b5c', secondary: '#d31145', text: '#ffffff', darkBg: '#00152e' },
  CWS: { primary: '#27251f', secondary: '#c4ced4', text: '#ffffff', darkBg: '#13120f' },
  KC:  { primary: '#004687', secondary: '#bd9b60', text: '#ffffff', darkBg: '#002343' },
  TOR: { primary: '#134a8e', secondary: '#1d2d5c', text: '#ffffff', darkBg: '#092547' },
  TB:  { primary: '#092c5c', secondary: '#8fbce6', text: '#ffffff', darkBg: '#04162e' },
  SEA: { primary: '#0c2340', secondary: '#005c5c', text: '#ffffff', darkBg: '#061120' },
  OAK: { primary: '#003831', secondary: '#efb21e', text: '#efb21e', darkBg: '#001c18' },
  LAA: { primary: '#ba0021', secondary: '#003263', text: '#ffffff', darkBg: '#5d0010' },
  COL: { primary: '#330066', secondary: '#c4ced4', text: '#ffffff', darkBg: '#190033' },
  MIA: { primary: '#00a3e0', secondary: '#ef3340', text: '#ffffff', darkBg: '#005170' },
  WSH: { primary: '#ab0003', secondary: '#14225a', text: '#ffffff', darkBg: '#550001' },
  CIN: { primary: '#c6011f', secondary: '#000000', text: '#ffffff', darkBg: '#63000f' },
  PIT: { primary: '#fdb827', secondary: '#000000', text: '#000000', darkBg: '#7f5c13' }
};

export async function searchGamesByDate(dateStr) {
  try {
    const response = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateStr}`);
    if (!response.ok) throw new Error('Failed to fetch schedule');
    const data = await response.json();
    
    if (!data.dates || data.dates.length === 0 || !data.dates[0].games) {
      return [];
    }
    
    return data.dates[0].games.map(g => ({
      gamePk: g.gamePk,
      date: g.officialDate || dateStr,
      awayTeam: g.teams.away.team.name,
      homeTeam: g.teams.home.team.name,
      awayScore: g.teams.away.score,
      homeScore: g.teams.home.score,
      venue: g.venue?.name || 'MLB Stadium',
      status: g.status?.detailedState || 'Final'
    }));
  } catch (err) {
    console.error('Error fetching games:', err);
    return [];
  }
}

export async function fetchGameScorecardData(gamePk) {
  try {
    const res = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return processMLBData(data, gamePk);
  } catch (error) {
    console.error('Error loading game data:', error);
    throw error;
  }
}

function parsePlayNotation(play) {
  const event = play.result?.eventType || '';
  const desc = play.result?.description || '';
  const hitDist = play.hitData?.totalDistance;

  if (event === 'home_run') {
    return { code: hitDist ? `HR ${hitDist}'` : 'HR', type: 'hr', bases: 4 };
  }
  if (event === 'single') return { code: '1B', type: 'hit', bases: 1 };
  if (event === 'double') return { code: '2B', type: 'hit', bases: 2 };
  if (event === 'triple') return { code: '3B', type: 'hit', bases: 3 };
  if (event === 'walk' || event === 'intent_walk') return { code: 'BB', type: 'walk', bases: 1 };
  if (event === 'hit_by_pitch') return { code: 'HBP', type: 'walk', bases: 1 };

  if (event === 'strikeout') {
    const isLooking = desc.toLowerCase().includes('called third strike') || desc.toLowerCase().includes('looking');
    return { code: 'K', type: 'strikeout', isLooking };
  }

  if (event === 'grounded_into_double_play' || event === 'strikeout_double_play' || event === 'double_play') {
    const d = desc.toLowerCase();
    if (d.includes('6-4-3') || (d.includes('shortstop') && d.includes('second'))) return { code: '6-4-3', type: 'out' };
    if (d.includes('4-6-3') || (d.includes('second') && d.includes('shortstop'))) return { code: '4-6-3', type: 'out' };
    if (d.includes('5-4-3') || (d.includes('third') && d.includes('second'))) return { code: '5-4-3', type: 'out' };
    return { code: 'DP', type: 'out' };
  }
  if (event === 'force_out' || event === 'fielders_choice') {
    return { code: 'FC', type: 'out' };
  }
  if (event === 'sac_fly') {
    return { code: 'SF', type: 'out' };
  }
  if (event === 'sac_bunt') {
    return { code: 'SAC', type: 'out' };
  }
  if (event === 'field_error') {
    const pos = play.matchup?.fielder?.primaryPosition?.abbreviation || '';
    return { code: pos ? `E${pos}` : 'E', type: 'error' };
  }

  // Handle standard outs
  const d = desc.toLowerCase();
  if (d.includes('grounds out to shortstop') || (d.includes('shortstop') && d.includes('first'))) return { code: '6-3', type: 'out' };
  if (d.includes('grounds out to third') || (d.includes('third baseman') && d.includes('first'))) return { code: '5-3', type: 'out' };
  if (d.includes('grounds out to second') || (d.includes('second baseman') && d.includes('first'))) return { code: '4-3', type: 'out' };
  if (d.includes('grounds out to first') || d.includes('first baseman to pitcher')) return { code: '3-1', type: 'out' };
  if (d.includes('grounds out to pitcher')) return { code: '1-3', type: 'out' };

  if (d.includes('flies out to center') || d.includes('center fielder')) return { code: 'F8', type: 'out' };
  if (d.includes('flies out to right') || d.includes('right fielder')) return { code: 'F9', type: 'out' };
  if (d.includes('flies out to left') || d.includes('left fielder')) return { code: 'F7', type: 'out' };

  if (d.includes('lines out to center')) return { code: 'L8', type: 'out' };
  if (d.includes('lines out to right')) return { code: 'L9', type: 'out' };
  if (d.includes('lines out to left')) return { code: 'L7', type: 'out' };
  if (d.includes('lines out to second')) return { code: 'L4', type: 'out' };
  if (d.includes('lines out to shortstop')) return { code: 'L6', type: 'out' };
  if (d.includes('lines out to third')) return { code: 'L5', type: 'out' };
  if (d.includes('lines out to first')) return { code: 'L3', type: 'out' };

  if (d.includes('pops out to catcher')) return { code: 'P2', type: 'out' };
  if (d.includes('pops out to second')) return { code: 'P4', type: 'out' };
  if (d.includes('pops out to shortstop')) return { code: 'P6', type: 'out' };
  if (d.includes('pops out to third')) return { code: 'P5', type: 'out' };
  if (d.includes('pops out to first')) return { code: 'P3', type: 'out' };

  return { code: 'OUT', type: 'out' };
}

function formatDateString(dateStr) {
  if (!dateStr) return 'OCTOBER 8, 2025';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
}

export function processMLBData(data, gamePkOverride) {
  const gameData = data.gameData;
  const liveData = data.liveData;
  const gamePk = gamePkOverride || data.gamePk || '813049';
  const box = liveData.boxscore;
  const plays = liveData.plays?.allPlays || [];
  const linescore = liveData.linescore;

  const officialDate = gameData.datetime?.officialDate || '';
  const dateDisplay = formatDateString(officialDate);
  const venue = `${gameData.venue?.name || 'Wrigley Field'} – ${gameData.venue?.location?.city || 'Chicago'}, ${gameData.venue?.location?.stateAbbrev || 'IL'}`;
  
  const awayAbbr = gameData.teams.away.abbreviation || 'MIL';
  const homeAbbr = gameData.teams.home.abbreviation || 'CHC';

  const awayColors = TEAM_COLORS[awayAbbr] || { primary: '#0a2351', secondary: '#ffc52f', text: '#ffc52f', darkBg: '#09152a' };
  const homeColors = TEAM_COLORS[homeAbbr] || { primary: '#0e3386', secondary: '#cc3433', text: '#ffffff', darkBg: '#081a42' };

  const awayTeam = {
    id: gameData.teams.away.id,
    name: gameData.teams.away.name,
    abbreviation: awayAbbr,
    score: linescore.teams?.away?.runs ?? 3,
    hits: linescore.teams?.away?.hits ?? 7,
    errors: linescore.teams?.away?.errors ?? 0,
    color: awayColors.primary,
    secondary: awayColors.secondary,
    textColor: awayColors.text
  };

  const homeTeam = {
    id: gameData.teams.home.id,
    name: gameData.teams.home.name,
    abbreviation: homeAbbr,
    score: linescore.teams?.home?.runs ?? 4,
    hits: linescore.teams?.home?.hits ?? 8,
    errors: linescore.teams?.home?.errors ?? 0,
    color: homeColors.primary,
    secondary: homeColors.secondary,
    textColor: homeColors.text
  };

  let headline = 'POSTSEASON GAME';
  if (gameData.game?.description) {
    headline = gameData.game.description.toUpperCase();
  } else if (gameData.seriesStatus?.description) {
    headline = gameData.seriesStatus.description.toUpperCase();
  } else {
    headline = `REGULAR SEASON GAME (${awayTeam.abbreviation} VS ${homeTeam.abbreviation})`;
  }

  const totalInnings = Math.max(9, linescore.innings?.length || 9);

  // Per-inning linescore (runs each inning for each team)
  const linescoreInnings = (linescore.innings || []).map(inn => ({
    num: inn.num,
    away: inn.away?.runs ?? '-',
    home: inn.home?.runs ?? 'x',
  }));

  function parseTeamSide(teamKey, sideHalf) {
    const teamBox = box.teams[teamKey];
    const playerMap = teamBox.players || {};
    const batterIds = teamBox.batters || [];

    const batterInningPlays = {};
    
    plays.forEach(play => {
      if (play.about?.halfInning !== sideHalf) return;
      const batterId = play.matchup?.batter?.id;
      const inning = play.about?.inning;
      if (!batterId || !inning) return;

      if (!batterInningPlays[batterId]) {
        batterInningPlays[batterId] = {};
      }
      
      const parsed = parsePlayNotation(play);
      batterInningPlays[batterId][inning] = parsed;
    });

    // Pitcher strikeout records (from plays)
    const pitcherIds = teamBox.pitchers || [];
    const pitcherStrikeoutMap = {};
    pitcherIds.forEach(id => { pitcherStrikeoutMap[id] = []; });

    plays.forEach(play => {
      if (play.about?.halfInning === sideHalf && play.result?.eventType === 'strikeout') {
        const pitcherId = play.matchup?.pitcher?.id;
        if (pitcherId) {
          if (!pitcherStrikeoutMap[pitcherId]) pitcherStrikeoutMap[pitcherId] = [];
          const desc = play.result?.description || '';
          const isLooking = desc.toLowerCase().includes('called third strike') || desc.toLowerCase().includes('looking');
          pitcherStrikeoutMap[pitcherId].push({ code: 'K', isLooking });
        }
      }
    });

    // Format innings pitched: outs / 3 → e.g. 7 outs = 2.1
    const formatIP = (outs) => {
      if (outs === undefined || outs === null) return null;
      const full = Math.floor(outs / 3);
      const rem = outs % 3;
      return rem === 0 ? `${full}.0` : `${full}.${rem}`;
    };

    const pitchersList = pitcherIds.slice(0, 7).map(id => {
      const p = playerMap[`ID${id}`] || {};
      const name = p.person?.fullName ? p.person.fullName.split(' ').pop().toUpperCase() : 'PITCHER';
      const number = p.jerseyNumber || 'P';
      const ks = pitcherStrikeoutMap[id] || [];
      // MLB Stats API: game-level pitching stats live under player.stats.pitching
      // The boxscore endpoint returns them inline on each player object
      const gp = p.stats?.pitching ?? {};
      return {
        id,
        number,
        name,
        strikeouts: ks,
        ip: formatIP(gp.outs),
        hits: gp.hits ?? null,
        runs: gp.runs ?? null,
        earnedRuns: gp.earnedRuns ?? null,
        walks: gp.baseOnBalls ?? null,
      };
    });

    const starters = [];
    const subsList = [];
    let subCharIndex = 0;
    const subLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

    batterIds.forEach(id => {
      const player = playerMap[`ID${id}`];
      if (!player) return;
      
      const pos = player.selectedPosition?.abbreviation || player.primaryPosition?.abbreviation || 'DH';
      const jerseyNumber = player.jerseyNumber || '00';
      const fullName = player.person?.fullName || '';
      const lastName = fullName.split(' ').pop().toUpperCase();

      const isStarter = player.battingOrder && (parseInt(player.battingOrder) % 100 === 0 || starters.length < 9);

      if (isStarter && starters.length < 9) {
        starters.push({
          id,
          jerseyNumber,
          position: pos,
          name: lastName,
          fullName,
          subNotes: [],
          plays: batterInningPlays[id] || {}
        });
      } else {
        const subLetter = subLetters[subCharIndex % subLetters.length];
        subCharIndex++;
        
        subsList.push({
          letter: subLetter,
          name: lastName,
          note: `PH T${subsList.length + 6}`
        });

        if (starters.length > 0) {
          const targetStarter = starters[(subsList.length - 1) % 9];
          if (targetStarter) {
            targetStarter.subNotes.push(subLetter);
            const subPlays = batterInningPlays[id] || {};
            Object.keys(subPlays).forEach(inn => {
              targetStarter.plays[inn] = subPlays[inn];
            });
          }
        }
      }
    });

    while (starters.length < 9) {
      starters.push({
        id: `empty-${starters.length}`,
        jerseyNumber: `${10 + starters.length}`,
        position: 'DH',
        name: 'PLAYER',
        subNotes: [],
        plays: {}
      });
    }

    return {
      batters: starters,
      pitchers: pitchersList,
      subsList
    };
  }

  const awayData = parseTeamSide('away', 'top');
  const homeData = parseTeamSide('home', 'bottom');

  return {
    gameInfo: {
      gamePk,
      dateDisplay,
      venue,
      headline,
      totalInnings,
      awayTeam,
      homeTeam,
      linescore: linescoreInnings,
    },
    awayData,
    homeData
  };
}
