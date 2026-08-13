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
    const result = processMLBData(data, gamePk);
    result._rawData = data; // store raw feed for export
    return result;
  } catch (error) {
    console.error('Error loading game data:', error);
    throw error;
  }
}

function getErrorPosition(play) {
  const desc = (play.result?.description || '').toLowerCase();
  
  if (desc.includes('pitcher') || desc.includes('by p ') || desc.includes('by p.')) return '1';
  if (desc.includes('catcher') || desc.includes('by c ') || desc.includes('by c.')) return '2';
  if (desc.includes('first baseman') || desc.includes('by 1b')) return '3';
  if (desc.includes('second baseman') || desc.includes('by 2b')) return '4';
  if (desc.includes('third baseman') || desc.includes('by 3b')) return '5';
  if (desc.includes('shortstop') || desc.includes('by ss')) return '6';
  if (desc.includes('left fielder') || desc.includes('by lf')) return '7';
  if (desc.includes('center fielder') || desc.includes('by cf')) return '8';
  if (desc.includes('right fielder') || desc.includes('by rf')) return '9';

  if (play.playEvents) {
    for (const evt of play.playEvents) {
      if (evt.details?.isError && evt.player) {
        const code = evt.position?.code;
        if (code) return code;
      }
    }
  }

  const posCode = play.matchup?.fielder?.primaryPosition?.code;
  if (posCode) return posCode;

  const posAbbr = play.matchup?.fielder?.primaryPosition?.abbreviation;
  const ABBR_MAP = { P: '1', C: '2', '1B': '3', '2B': '4', '3B': '5', SS: '6', LF: '7', CF: '8', RF: '9' };
  if (posAbbr && ABBR_MAP[posAbbr]) return ABBR_MAP[posAbbr];

  return '';
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
    // MLB API uses "called out on strikes" for looking Ks, not "called third strike"
    const dl = desc.toLowerCase();
    const isLooking = dl.includes('called out on strikes') || dl.includes('called third strike') || dl.includes('looking');
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
  if (event === 'field_error' || event === 'error' || desc.toLowerCase().includes('error')) {
    const pos = getErrorPosition(play);
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

  let headline = '';
  if (gameData.game?.description) {
    const desc = gameData.game.description;
    if (!desc.toLowerCase().includes('regular season')) {
      headline = desc.toUpperCase();
    }
  } else if (gameData.seriesStatus?.description) {
    headline = gameData.seriesStatus.description.toUpperCase();
  }

  // Smart last name helper
  const SUFFIXES_ALL = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv', 'v']);
  const extractLastNameGlobal = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    for (let i = parts.length - 1; i >= 0; i--) {
      if (!SUFFIXES_ALL.has(parts[i].toLowerCase())) {
        return parts[i].toUpperCase();
      }
    }
    return parts[parts.length - 1].toUpperCase();
  };

  // Weather & Environment
  const temp = gameData.weather?.temp ? `${gameData.weather.temp}°F` : '';
  const condition = gameData.weather?.condition ? gameData.weather.condition.toUpperCase() : '';
  const wind = gameData.weather?.wind ? `WIND: ${gameData.weather.wind.toUpperCase()}` : '';
  const weatherStr = [temp, condition, wind].filter(Boolean).join(' ');

  // Attendance & Duration
  const attendanceVal = gameData.gameInfo?.attendance || (box?.info && box.info.find(i => i?.label === 'Att')?.value);
  const attendance = attendanceVal ? `ATT: ${typeof attendanceVal === 'number' ? attendanceVal.toLocaleString() : attendanceVal}` : '';
  
  let durationStr = '';
  if (gameData.gameInfo?.gameDurationMinutes) {
    const mins = gameData.gameInfo.gameDurationMinutes;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    durationStr = `TIME: ${h}H ${m}M`;
  } else if (box?.info) {
    const timeInfo = box.info.find(i => i?.label === 'T' || i?.label === 'Game Duration')?.value;
    if (timeInfo) durationStr = `TIME: ${timeInfo}`;
  }

  // Pitcher Decisions
  const decisions = {
    winner: liveData?.decisions?.winner?.fullName ? extractLastNameGlobal(liveData.decisions.winner.fullName) : '',
    loser: liveData?.decisions?.loser?.fullName ? extractLastNameGlobal(liveData.decisions.loser.fullName) : '',
    save: liveData?.decisions?.save?.fullName ? extractLastNameGlobal(liveData.decisions.save.fullName) : '',
  };

  // Umpires
  const umpires = (gameData.officials || []).map(o => ({
    type: o.officialType || 'Umpire',
    name: extractLastNameGlobal(o.official?.fullName || '')
  }));

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

    // Pitcher strikeout records (from plays).
    // IMPORTANT: pitchers of teamKey pitch during the OPPOSITE half-inning.
    // e.g. away team pitchers pitch during 'bottom' half, not 'top'.
    const oppositeHalf = sideHalf === 'top' ? 'bottom' : 'top';
    const pitcherIds = teamBox.pitchers || [];
    const pitcherStrikeoutMap = {};
    const pitcherPitchMap = {}; // pitcherId → { [inning]: count }
    pitcherIds.forEach(id => { pitcherStrikeoutMap[id] = []; pitcherPitchMap[id] = {}; });

    plays.forEach(play => {
      if (play.about?.halfInning !== oppositeHalf) return;
      const pitcherId = play.matchup?.pitcher?.id;
      if (!pitcherId) return;
      if (!pitcherStrikeoutMap[pitcherId]) pitcherStrikeoutMap[pitcherId] = [];
      if (!pitcherPitchMap[pitcherId]) pitcherPitchMap[pitcherId] = {};

      if (play.result?.eventType === 'strikeout') {
        const desc = play.result?.description || '';
        const dl = desc.toLowerCase();
        const isLooking = dl.includes('called out on strikes') || dl.includes('called third strike') || dl.includes('looking');
        pitcherStrikeoutMap[pitcherId].push({ code: 'K', isLooking });
      }

      // Count pitches, strikes, and balls thrown this inning
      const inning = play.about?.inning;
      if (inning) {
        if (!pitcherPitchMap[pitcherId][inning]) {
          pitcherPitchMap[pitcherId][inning] = { pitches: 0, strikes: 0, balls: 0 };
        }
        const innStat = pitcherPitchMap[pitcherId][inning];
        if (play.playEvents) {
          play.playEvents.forEach(evt => {
            if (evt.isPitch) {
              innStat.pitches++;
              const callCode = evt.details?.call?.code || '';
              const isStrike = evt.details?.isStrike || ['S', 'C', 'F', 'O', 'W', 'X'].includes(callCode);
              if (isStrike) {
                innStat.strikes++;
              } else {
                innStat.balls++;
              }
            }
          });
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

    // Smart last name: ignore common name suffixes (Jr., Sr., II, III, IV)
    const SUFFIXES = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv', 'v']);
    const extractLastName = (fullName) => {
      if (!fullName) return 'PITCHER';
      const parts = fullName.trim().split(/\s+/);
      for (let i = parts.length - 1; i >= 0; i--) {
        if (!SUFFIXES.has(parts[i].toLowerCase())) {
          return parts[i].toUpperCase();
        }
      }
      return parts[parts.length - 1].toUpperCase();
    };

    const pitchersList = pitcherIds.slice(0, 7).map(id => {
      const p = playerMap[`ID${id}`] || {};
      const name = extractLastName(p.person?.fullName);
      const number = p.jerseyNumber || 'P';
      const ks = pitcherStrikeoutMap[id] || [];
      const gp = p.stats?.pitching ?? {};
      const pitchesByInning = pitcherPitchMap[id] || {};

      let totalPitches = 0;
      let totalStrikes = 0;
      let totalBalls = 0;
      Object.values(pitchesByInning).forEach(inn => {
        totalPitches += inn.pitches || 0;
        totalStrikes += inn.strikes || 0;
        totalBalls += inn.balls || 0;
      });

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
        pitchesByInning,
        totalPitches: totalPitches || (gp.numberOfPitches ?? null),
        totalStrikes,
        totalBalls,
      };
    });

    // pitcherIds set for filtering subs — pitchers who appear in batting lineup
    // (e.g. NL games) should not show as positional subs
    const pitcherIdSet = new Set(pitcherIds);

    const starters = [];   // 9 batting order slots
    const subsList = [];   // positional subs (PH, PR, defensive)
    let subCharIndex = 0;
    const subLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

    // Smart last name: ignore common name suffixes (Jr., Sr., II, III, IV)
    const SUFFIXES_B = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv', 'v']);
    const extractBatterLastName = (fullName) => {
      if (!fullName) return '—';
      const parts = fullName.trim().split(/\s+/);
      for (let i = parts.length - 1; i >= 0; i--) {
        if (!SUFFIXES_B.has(parts[i].toLowerCase())) {
          return parts[i].toUpperCase();
        }
      }
      return parts[parts.length - 1].toUpperCase();
    };

    batterIds.forEach(id => {
      const player = playerMap[`ID${id}`];
      if (!player) return;

      // player.position is the game-specific position; primaryPosition is career default
      const pos = player.position?.abbreviation || player.primaryPosition?.abbreviation || '—';
      const jerseyNumber = player.jerseyNumber || '—';
      const fullName = player.person?.fullName || '';
      const lastName = extractBatterLastName(fullName);
      const battingOrderNum = player.battingOrder ? parseInt(player.battingOrder) : null;

      // A starter has a battingOrder ending in 00 (100, 200 … 900)
      const isStarter = battingOrderNum !== null && battingOrderNum % 100 === 0;

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
      } else if (!isStarter && battingOrderNum !== null && !pitcherIdSet.has(id)) {
        // Substitute — link to the correct batting order slot
        // battingOrder 301 → slot index 2 (3rd spot, 0-indexed)
        const slotIndex = Math.floor(battingOrderNum / 100) - 1;
        const subLetter = subLetters[subCharIndex % subLetters.length];
        subCharIndex++;

        subsList.push({ letter: subLetter, name: lastName });

        const targetStarter = starters[slotIndex];
        if (targetStarter) {
          targetStarter.subNotes.push(subLetter);
          const subPlays = batterInningPlays[id] || {};
          Object.keys(subPlays).forEach(inn => {
            targetStarter.plays[inn] = subPlays[inn];
          });
        }
      }
    });

    // Pad to 9 rows if needed (short games / data gaps)
    while (starters.length < 9) {
      starters.push({
        id: `empty-${starters.length}`,
        jerseyNumber: '—',
        position: '—',
        name: '—',
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
      weatherStr,
      attendance,
      durationStr,
      decisions,
      umpires,
    },
    awayData,
    homeData
  };
}
