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
    const response = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateStr}&hydrate=linescore`);
    if (!response.ok) throw new Error('Failed to fetch schedule');
    const data = await response.json();
    
    if (!data.dates || data.dates.length === 0 || !data.dates[0].games) {
      return [];
    }
    
    return data.dates[0].games.map(g => {
      const detailedState = (g.status?.detailedState || '').trim();
      const abstractState = (g.status?.abstractGameState || '').trim();
      const codedState = (g.status?.codedGameState || '').trim();
      const statusCode = (g.status?.statusCode || '').trim();
      
      const isFinal =
        abstractState.toLowerCase() === 'final' ||
        codedState === 'F' || codedState === 'O' || statusCode === 'F' || statusCode === 'O' ||
        detailedState.toLowerCase().includes('final') ||
        detailedState.toLowerCase().includes('game over') ||
        detailedState.toLowerCase().includes('completed') ||
        (g.teams.away.score !== undefined && g.teams.home.score !== undefined && g.linescore && g.linescore.currentInning >= 9 && codedState !== 'I' && abstractState.toLowerCase() !== 'live');

      const isLive =
        !isFinal && (
          abstractState.toLowerCase() === 'live' ||
          codedState === 'I' || statusCode === 'I' ||
          detailedState.toLowerCase().includes('in progress') ||
          detailedState.toLowerCase().includes('live') ||
          detailedState.toLowerCase().includes('inning') ||
          detailedState.toLowerCase().includes('warmup') ||
          detailedState.toLowerCase().includes('delayed')
        );

      let inningText = '';
      if (isLive && g.linescore?.currentInningOrdinal) {
        inningText = `${g.linescore.inningHalf === 'Top' ? 'Top' : 'Bot'} ${g.linescore.currentInningOrdinal}`;
      } else if (isFinal && g.linescore?.innings?.length > 9) {
        inningText = `F/${g.linescore.innings.length}`;
      }

      return {
        gamePk: g.gamePk,
        date: g.officialDate || dateStr,
        awayTeam: g.teams.away.team.name,
        homeTeam: g.teams.home.team.name,
        awayScore: g.teams.away.score,
        homeScore: g.teams.home.score,
        venue: g.venue?.name || 'MLB Stadium',
        status: detailedState || (isFinal ? 'Final' : isLive ? 'Live' : 'Scheduled'),
        abstractState,
        isLive,
        isFinal,
        inningText,
      };
    });
  } catch (err) {
    console.error('Error fetching games:', err);
    return [];
  }
}

export async function findMostRecentRaysGame() {
  try {
    const today = new Date();
    const formatDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const endDateStr = formatDate(today);
    const startDate = new Date();
    startDate.setDate(today.getDate() - 14);
    const startDateStr = formatDate(startDate);

    // Fetch Rays schedule for past 14 days
    const res = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=139&startDate=${startDateStr}&endDate=${endDateStr}&hydrate=linescore`);
    if (!res.ok) throw new Error('Failed to fetch Rays schedule');
    const data = await res.json();

    const allGames = [];
    if (data.dates) {
      data.dates.forEach(d => {
        (d.games || []).forEach(g => {
          allGames.push({
            gamePk: g.gamePk,
            date: g.officialDate || d.date,
            status: g.status?.detailedState || '',
            abstractState: g.status?.abstractGameState || '',
            codedState: g.status?.codedGameState || '',
          });
        });
      });
    }

    // Sort chronologically descending by date, then gamePk
    allGames.sort((a, b) => b.date.localeCompare(a.date) || b.gamePk - a.gamePk);

    // Prefer active live / in-progress games first, then completed games
    const liveGame = allGames.find(g =>
      g.abstractState.toLowerCase() === 'live' ||
      g.codedState === 'I' ||
      g.status.toLowerCase().includes('in progress') ||
      g.status.toLowerCase().includes('live') ||
      g.status.toLowerCase().includes('warmup') ||
      g.status.toLowerCase().includes('delayed')
    );
    const completedGame = allGames.find(g =>
      g.abstractState.toLowerCase() === 'final' ||
      g.codedState === 'F' || g.codedState === 'O' ||
      g.status.toLowerCase().includes('final') ||
      g.status.toLowerCase().includes('game over') ||
      g.status.toLowerCase().includes('completed')
    );

    const chosen = liveGame || completedGame || allGames[0];
    if (chosen) {
      return {
        date: chosen.date,
        gamePk: String(chosen.gamePk),
      };
    }
  } catch (err) {
    console.warn('Could not find recent Rays game automatically:', err);
  }
  return null;
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
  const descLower = desc.toLowerCase();
  const isComplete = play.about?.isComplete ?? Boolean(event || desc);

  // If play is still in progress with no finalized event outcome, do not record a fake OUT placeholder
  if (!isComplete || (!event && !desc)) {
    return null;
  }

  const hitDist = play.hitData?.totalDistance;
  const launchSpeed = play.hitData?.launchSpeed;
  const launchAngle = play.hitData?.launchAngle;

  let extraEvent = '';
  if (descLower.includes('stole') || descLower.includes('stolen base')) extraEvent = 'SB';
  else if (descLower.includes('caught stealing')) extraEvent = 'CS';
  else if (descLower.includes('picked off')) extraEvent = 'PO';
  else if (descLower.includes('wild pitch')) extraEvent = 'WP';
  else if (descLower.includes('passed ball')) extraEvent = 'PB';

  const statcast = (launchSpeed || hitDist) ? { launchSpeed, totalDistance: hitDist, launchAngle } : null;

  if (event === 'home_run') {
    return { code: hitDist ? `HR ${Math.round(hitDist)}'` : 'HR', type: 'hr', bases: 4, extraEvent, statcast };
  }
  if (event === 'single') return { code: '1B', type: 'hit', bases: 1, extraEvent, statcast };
  if (event === 'double') return { code: '2B', type: 'hit', bases: 2, extraEvent, statcast };
  if (event === 'triple') return { code: '3B', type: 'hit', bases: 3, extraEvent, statcast };
  if (event === 'walk' || event === 'intent_walk') return { code: 'BB', type: 'walk', bases: 1, extraEvent };
  if (event === 'hit_by_pitch') return { code: 'HBP', type: 'walk', bases: 1, extraEvent };

  if (event === 'strikeout') {
    // MLB API uses "called out on strikes" for looking Ks, not "called third strike"
    const isLooking = descLower.includes('called out on strikes') || descLower.includes('called third strike') || descLower.includes('looking');
    return { code: 'K', type: 'strikeout', isLooking, extraEvent };
  }

  if (event === 'grounded_into_double_play' || event === 'strikeout_double_play' || event === 'double_play') {
    if (descLower.includes('6-4-3') || (descLower.includes('shortstop') && descLower.includes('second'))) return { code: '6-4-3', type: 'out', extraEvent };
    if (descLower.includes('4-6-3') || (descLower.includes('second') && descLower.includes('shortstop'))) return { code: '4-6-3', type: 'out', extraEvent };
    if (descLower.includes('5-4-3') || (descLower.includes('third') && descLower.includes('second'))) return { code: '5-4-3', type: 'out', extraEvent };
    return { code: 'DP', type: 'out', extraEvent };
  }
  if (event === 'force_out' || event === 'fielders_choice') {
    return { code: 'FC', type: 'out', extraEvent };
  }
  if (event === 'sac_fly') {
    return { code: 'SF', type: 'out', extraEvent };
  }
  if (event === 'sac_bunt') {
    return { code: 'SAC', type: 'out', extraEvent };
  }
  if (event === 'field_error' || event === 'error' || descLower.includes('error')) {
    const pos = getErrorPosition(play);
    return { code: pos ? `E${pos}` : 'E', type: 'error', extraEvent };
  }

  // Handle standard outs
  if (descLower.includes('grounds out to shortstop') || (descLower.includes('shortstop') && descLower.includes('first'))) return { code: '6-3', type: 'out', extraEvent };
  if (descLower.includes('grounds out to third') || (descLower.includes('third baseman') && descLower.includes('first'))) return { code: '5-3', type: 'out', extraEvent };
  if (descLower.includes('grounds out to second') || (descLower.includes('second baseman') && descLower.includes('first'))) return { code: '4-3', type: 'out', extraEvent };
  if (descLower.includes('grounds out to first') || descLower.includes('first baseman to pitcher')) return { code: '3-1', type: 'out', extraEvent };
  if (descLower.includes('grounds out to pitcher')) return { code: '1-3', type: 'out', extraEvent };

  if (descLower.includes('flies out to center') || descLower.includes('center fielder')) return { code: 'F8', type: 'out', extraEvent };
  if (descLower.includes('flies out to right') || descLower.includes('right fielder')) return { code: 'F9', type: 'out', extraEvent };
  if (descLower.includes('flies out to left') || descLower.includes('left fielder')) return { code: 'F7', type: 'out', extraEvent };

  if (descLower.includes('lines out to center')) return { code: 'L8', type: 'out', extraEvent };
  if (descLower.includes('lines out to right')) return { code: 'L9', type: 'out', extraEvent };
  if (descLower.includes('lines out to left')) return { code: 'L7', type: 'out', extraEvent };
  if (descLower.includes('lines out to second')) return { code: 'L4', type: 'out', extraEvent };
  if (descLower.includes('lines out to shortstop')) return { code: 'L6', type: 'out', extraEvent };
  if (descLower.includes('lines out to third')) return { code: 'L5', type: 'out', extraEvent };
  if (descLower.includes('lines out to first')) return { code: 'L3', type: 'out', extraEvent };

  if (descLower.includes('pops out to catcher')) return { code: 'P2', type: 'out', extraEvent };
  if (descLower.includes('pops out to second')) return { code: 'P4', type: 'out', extraEvent };
  if (descLower.includes('pops out to shortstop')) return { code: 'P6', type: 'out', extraEvent };
  if (descLower.includes('pops out to third')) return { code: 'P5', type: 'out', extraEvent };
  if (descLower.includes('pops out to first')) return { code: 'P3', type: 'out', extraEvent };

  if (descLower.includes('out') || event.includes('out')) {
    return { code: 'OUT', type: 'out', extraEvent };
  }

  return null;
}

function baseToNum(b) {
  if (!b) return 0;
  const s = String(b).toUpperCase();
  if (s === '1B' || s === '1') return 1;
  if (s === '2B' || s === '2') return 2;
  if (s === '3B' || s === '3') return 3;
  if (s === 'SCORE' || s === 'HP' || s === '4B' || s === '4') return 4;
  return 0;
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

  // Game Status
  const statusDetailed = gameData.status?.detailedState || 'Final';
  const abstractState = gameData.status?.abstractGameState || '';
  const isFinal = abstractState === 'Final' || statusDetailed === 'Final' || statusDetailed === 'Game Over' || statusDetailed === 'Completed Early';
  const isLive = abstractState === 'Live' || statusDetailed === 'In Progress' || statusDetailed.includes('Inning');

  let statusDisplay = 'FINAL';
  if (isLive) {
    const half = linescore?.inningHalf || 'Top';
    const ord = linescore?.currentInningOrdinal || (linescore?.currentInning ? `${linescore.currentInning}th` : '');
    statusDisplay = ord ? `${half.toUpperCase()} ${ord.toUpperCase()}` : 'LIVE';
  } else if (!isFinal) {
    statusDisplay = statusDetailed.toUpperCase();
  } else if (linescore?.innings?.length > 9) {
    statusDisplay = `F/${linescore.innings.length}`;
  }

  // Pitcher Decisions (only for completed games)
  const decisions = isFinal ? {
    winner: liveData?.decisions?.winner?.fullName ? extractLastNameGlobal(liveData.decisions.winner.fullName) : '',
    loser: liveData?.decisions?.loser?.fullName ? extractLastNameGlobal(liveData.decisions.loser.fullName) : '',
    save: liveData?.decisions?.save?.fullName ? extractLastNameGlobal(liveData.decisions.save.fullName) : '',
  } : { winner: '', loser: '', save: '' };

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
    
    // Group plays by inning to track runner base advancement chronologically
    const playsByInning = {};
    plays.forEach(play => {
      if (play.about?.halfInning !== sideHalf) return;
      const inn = play.about?.inning;
      if (!inn) return;
      if (!playsByInning[inn]) playsByInning[inn] = [];
      playsByInning[inn].push(play);
    });

    Object.keys(playsByInning).forEach(inn => {
      const innPlays = playsByInning[inn];
      innPlays.forEach((play, playIdx) => {
        const batterId = play.matchup?.batter?.id;
        if (!batterId) return;

        const parsed = parsePlayNotation(play);
        if (!parsed || !parsed.code) return;

        if (!batterInningPlays[batterId]) {
          batterInningPlays[batterId] = {};
        }
        if (!batterInningPlays[batterId][inn]) {
          batterInningPlays[batterId][inn] = [];
        }

        // Base reached from own at-bat
        let atBatBases = parsed.bases || 0;
        if (parsed.type === 'hr') atBatBases = 4;
        let outAtBase = null;
        let outAtBaseEvent = null;

        if (play.runners) {
          play.runners.forEach(r => {
            if (r.details?.runner?.id === batterId) {
              if (!r.movement?.isOut) {
                const reached = baseToNum(r.movement?.end);
                if (reached > atBatBases) atBatBases = reached;
              } else {
                const ob = baseToNum(r.movement?.outBase || r.movement?.end);
                // Only flag out on own at-bat if thrown out attempting 2B, 3B, or Home (e.g. stretching a hit)
                if (ob >= 2) {
                  outAtBase = ob;
                  const descLower = (play.result?.description || '').toLowerCase();
                  if (descLower.includes('caught stealing') || r.details?.event === 'Caught Stealing') outAtBaseEvent = 'CS';
                  else if (descLower.includes('picked off') || r.details?.event === 'Pickoff') outAtBaseEvent = 'PO';
                  else outAtBaseEvent = 'OUT';
                }
              }
            }
          });
        }

        // Base reached by end of inning from subsequent plays in same inning
        let endInningBases = atBatBases;
        if (atBatBases > 0) {
          for (let i = playIdx + 1; i < innPlays.length; i++) {
            const subPlay = innPlays[i];
            if (subPlay.runners) {
              subPlay.runners.forEach(r => {
                if (r.details?.runner?.id === batterId) {
                  if (!r.movement?.isOut) {
                    const reached = baseToNum(r.movement?.end);
                    if (reached > endInningBases) endInningBases = reached;
                  } else {
                    const ob = baseToNum(r.movement?.outBase || r.movement?.end || r.movement?.start) || 1;
                    if (ob > 0) {
                      outAtBase = ob;
                      const subDesc = (subPlay.result?.description || '').toLowerCase();
                      if (subDesc.includes('caught stealing') || r.details?.event === 'Caught Stealing') outAtBaseEvent = 'CS';
                      else if (subDesc.includes('picked off') || r.details?.event === 'Pickoff') outAtBaseEvent = 'PO';
                      else outAtBaseEvent = 'OUT';
                    }
                  }
                }
              });
            }
          }
        }

        parsed.atBatBases = atBatBases;
        parsed.bases = Math.max(parsed.bases || 0, endInningBases);
        if (outAtBase && (atBatBases >= 1 || outAtBase >= 2)) {
          parsed.outAtBase = outAtBase;
          parsed.outAtBaseEvent = outAtBaseEvent || 'OUT';
        }

        batterInningPlays[batterId][inn].push(parsed);
      });
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

    let teamTotalPitches = 0;
    let teamTotalStrikes = 0;
    let teamTotalBalls = 0;

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

      const calcTotalPitches = totalPitches || (gp.numberOfPitches ?? null);
      if (calcTotalPitches) teamTotalPitches += calcTotalPitches;
      teamTotalStrikes += totalStrikes;
      teamTotalBalls += totalBalls;

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
        totalPitches: calcTotalPitches,
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

      const pos = player.position?.abbreviation || player.primaryPosition?.abbreviation || '—';
      const jerseyNumber = player.jerseyNumber || '—';
      const fullName = player.person?.fullName || '';
      const lastName = extractBatterLastName(fullName);
      const battingOrderNum = player.battingOrder ? parseInt(player.battingOrder) : null;

      const isStarter = battingOrderNum !== null && battingOrderNum % 100 === 0;
      const playerPlaysMap = batterInningPlays[id] || {};

      if (isStarter && starters.length < 9) {
        starters.push({
          id,
          jerseyNumber,
          position: pos,
          name: lastName,
          fullName,
          subNotes: [],
          substitutes: [],
          plays: playerPlaysMap
        });
      } else if (!isStarter && battingOrderNum !== null && !pitcherIdSet.has(id)) {
        const slotIndex = Math.floor(battingOrderNum / 100) - 1;
        const subLetter = subLetters[subCharIndex % subLetters.length];
        subCharIndex++;

        subsList.push({ letter: subLetter, name: lastName, position: pos, jerseyNumber });

        const targetStarter = starters[slotIndex];
        if (targetStarter) {
          if (!targetStarter.subNotes) targetStarter.subNotes = [];
          if (!targetStarter.substitutes) targetStarter.substitutes = [];
          targetStarter.subNotes.push(subLetter);
          targetStarter.substitutes.push({
            id,
            jerseyNumber,
            position: pos,
            name: lastName,
            fullName,
            subLetter,
          });

          Object.keys(playerPlaysMap).forEach(inn => {
            const existing = targetStarter.plays[inn];
            const subPlayList = (playerPlaysMap[inn] || []).map(p => ({
              ...p,
              subLetter,
              batterName: lastName,
              jerseyNumber,
            }));
            if (!existing) {
              targetStarter.plays[inn] = subPlayList;
            } else {
              const existingArr = Array.isArray(existing) ? existing : [existing];
              targetStarter.plays[inn] = [...existingArr, ...subPlayList];
            }
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
      subsList,
      teamTotalPitches,
      teamTotalStrikes,
      teamTotalBalls,
    };
  }

  const awayData = parseTeamSide('away', 'top');
  const homeData = parseTeamSide('home', 'bottom');

  // Extract Statcast Home Run Highlights and Top Hits across all plays
  const hrHighlights = [];
  const topHits = [];

  plays.forEach(p => {
    const isTop = p.about?.halfInning === 'top';
    const batterName = extractLastNameGlobal(p.matchup?.batter?.fullName);
    const pitcherName = extractLastNameGlobal(p.matchup?.pitcher?.fullName);
    const inn = isTop ? `T${p.about?.inning}` : `B${p.about?.inning}`;
    const team = isTop ? awayAbbr : homeAbbr;

    const hitDist = p.hitData?.totalDistance;
    const launchSpeed = p.hitData?.launchSpeed;
    const launchAngle = p.hitData?.launchAngle;

    const pitchEvt = (p.playEvents || []).find(e => e.isPitch && e.pitchData?.startSpeed);
    const pitchSpeed = pitchEvt?.pitchData?.startSpeed ? `${pitchEvt.pitchData.startSpeed.toFixed(1)} MPH` : '';
    const pitchType = pitchEvt?.details?.type?.description || pitchEvt?.details?.type?.code || '';

    const distStr = hitDist ? `${Math.round(hitDist)} FT` : '';
    const speedStr = launchSpeed ? `${launchSpeed.toFixed(1)} MPH` : '';
    const angleStr = launchAngle ? `${Math.round(launchAngle)}°` : '';
    const rbi = p.result?.rbi || 1;

    if (p.result?.eventType === 'home_run') {
      hrHighlights.push({
        batterName,
        pitcherName,
        team,
        inn,
        dist: distStr,
        speed: speedStr,
        angle: angleStr,
        pitchSpeed,
        pitchType,
        rbi,
        desc: p.result?.description || ''
      });
    } else if (launchSpeed && launchSpeed >= 90) {
      topHits.push({
        batterName,
        pitcherName,
        team,
        inn,
        event: p.result?.eventType?.replace(/_/g, ' ')?.toUpperCase() || 'HIT',
        speed: speedStr,
        dist: distStr,
        angle: angleStr,
      });
    }
  });

  topHits.sort((a, b) => parseFloat(b.speed) - parseFloat(a.speed));

  // Calculate Inning-by-Inning Score & Momentum Progression
  let runningAway = 0;
  let runningHome = 0;
  const gameMomentum = linescoreInnings.map(inn => {
    const a = typeof inn.away === 'number' ? inn.away : 0;
    const h = typeof inn.home === 'number' ? inn.home : 0;
    runningAway += a;
    runningHome += h;
    const diff = runningHome - runningAway;
    let leader = 'TIE';
    if (diff > 0) leader = `${homeAbbr} +${diff}`;
    else if (diff < 0) leader = `${awayAbbr} +${Math.abs(diff)}`;

    return {
      inning: inn.num,
      awayCum: runningAway,
      homeCum: runningHome,
      diff,
      leader,
    };
  });

  // Determine Game MVP (only for completed games)
  let gameMvp = null;
  if (isFinal) {
    const topHr = hrHighlights[0];
    if (topHr) {
      gameMvp = {
        name: topHr.batterName,
        team: topHr.team,
        badge: 'GAME MVP',
        statLine: `${topHr.rbi} RBI HR ${topHr.dist ? `(${topHr.dist}` : ''}${topHr.speed ? `, ${topHr.speed})` : ')'}`,
      };
    } else if (decisions.winner) {
      const winningTeam = homeTeam.score > awayTeam.score ? homeAbbr : awayAbbr;
      gameMvp = {
        name: decisions.winner,
        team: winningTeam,
        badge: 'WINNING PITCHER',
        statLine: `WINNING PITCHER FOR ${winningTeam}`,
      };
    }
  }

  // Live Active At-Bat and Game Count state
  let liveActiveCell = null;
  let liveGameState = null;

  if (isLive || (linescore && (linescore.balls !== undefined || linescore.outs !== undefined))) {
    const currentPlay = liveData.plays?.currentPlay;
    const inn = currentPlay?.about?.inning || linescore?.currentInning || 1;
    const isTop = currentPlay?.about?.isTopInning ?? (linescore?.inningHalf === 'Top');
    const battingTeamKey = isTop ? 'away' : 'home';
    const activeBatters = isTop ? awayData?.batters : homeData?.batters;
    
    let batterId = currentPlay?.matchup?.batter?.id;
    if (!batterId && activeBatters && activeBatters.length > 0) {
      const playedBatter = activeBatters.find(b => b.plays && b.plays[inn]);
      batterId = playedBatter ? playedBatter.id : activeBatters[0]?.id;
    }

    if (batterId) {
      liveActiveCell = {
        cellKey: `${batterId}_${inn}`,
        batterId,
        inning: inn,
        teamKey: battingTeamKey,
      };
    }

    // Extract pitch-by-pitch data and coordinates for active at-bat
    const targetPlay = currentPlay || (plays && plays.length > 0 ? plays[plays.length - 1] : null);
    const pitches = [];

    if (targetPlay?.playEvents) {
      let pNum = 1;
      targetPlay.playEvents.forEach((evt) => {
        if (evt.isPitch) {
          const callCode = evt.details?.call?.code || '';
          const isStrike = evt.details?.isStrike || ['S', 'C', 'F', 'O', 'W', 'X', 'D'].includes(callCode);
          const isBall = evt.details?.isBall || ['B', '*B', 'I', 'P', 'V'].includes(callCode);
          const isFoul = callCode === 'F' || (evt.details?.description || '').toLowerCase().includes('foul');
          const isInPlay = callCode === 'X' || callCode === 'D' || (evt.details?.description || '').toLowerCase().includes('in play');

          const pX = evt.pitchData?.coordinates?.pX ?? null;
          const pZ = evt.pitchData?.coordinates?.pZ ?? null;
          const szTop = evt.pitchData?.strikeZoneTop ?? targetPlay?.matchup?.batter?.strikeZoneTop ?? 3.4;
          const szBot = evt.pitchData?.strikeZoneBottom ?? targetPlay?.matchup?.batter?.strikeZoneBottom ?? 1.5;
          const speed = evt.pitchData?.startSpeed ? Math.round(evt.pitchData.startSpeed * 10) / 10 : null;
          const pitchType = evt.details?.type?.code || evt.details?.type?.description || 'P';
          const callDesc = evt.details?.call?.description || evt.details?.description || (isStrike ? 'Strike' : 'Ball');

          let normX = 50;
          let normY = 50;
          let hasCoords = false;

          if (typeof pX === 'number' && typeof pZ === 'number') {
            hasCoords = true;
            normX = Math.min(92, Math.max(8, 50 + pX * 32));
            const zoneHeight = (szTop - szBot) || 1.9;
            const midZ = (szTop + szBot) / 2;
            normY = Math.min(92, Math.max(8, 50 - ((pZ - midZ) / zoneHeight) * 28));
          } else if (typeof evt.pitchData?.coordinates?.x === 'number' && typeof evt.pitchData?.coordinates?.y === 'number') {
            hasCoords = true;
            normX = Math.min(92, Math.max(8, (evt.pitchData.coordinates.x / 250) * 100));
            normY = Math.min(92, Math.max(8, (evt.pitchData.coordinates.y / 250) * 100));
          }

          let resultType = 'ball';
          let color = '#10b981'; // Green for ball
          if (isInPlay) {
            resultType = 'in_play';
            color = '#3b82f6'; // Blue for in play
          } else if (isFoul) {
            resultType = 'foul';
            color = '#f59e0b'; // Amber for foul
          } else if (isStrike) {
            resultType = 'strike';
            color = '#ef4444'; // Red for strike
          }

          pitches.push({
            pitchNumber: evt.pitchNumber || pNum++,
            speed,
            pitchType,
            callDesc,
            callCode,
            isStrike,
            isBall,
            resultType,
            color,
            hasCoords,
            normX: Math.round(normX * 10) / 10,
            normY: Math.round(normY * 10) / 10,
            pX,
            pZ,
          });
        }
      });
    }

    liveGameState = {
      balls: currentPlay?.count?.balls ?? linescore?.balls ?? 0,
      strikes: currentPlay?.count?.strikes ?? linescore?.strikes ?? 0,
      outs: currentPlay?.count?.outs ?? linescore?.outs ?? 0,
      inning: inn,
      inningHalf: isTop ? 'Top' : 'Bottom',
      inningOrdinal: linescore?.currentInningOrdinal || `${inn}${inn === 1 ? 'st' : inn === 2 ? 'nd' : inn === 3 ? 'rd' : 'th'}`,
      inningState: linescore?.inningState || (isTop ? 'Top' : 'Bottom'),
      batterName: currentPlay?.matchup?.batter?.fullName || targetPlay?.matchup?.batter?.fullName || '',
      pitcherName: currentPlay?.matchup?.pitcher?.fullName || targetPlay?.matchup?.pitcher?.fullName || '',
      onFirst: Boolean(linescore?.offense?.first || currentPlay?.matchup?.postOnFirst),
      onSecond: Boolean(linescore?.offense?.second || currentPlay?.matchup?.postOnSecond),
      onThird: Boolean(linescore?.offense?.third || currentPlay?.matchup?.postOnThird),
      pitches,
    };
  }

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
      hrHighlights,
      topHits: topHits.slice(0, 4),
      gameMomentum,
      gameMvp,
      statusDisplay,
      isFinal,
      isLive,
      statusDetailed,
      liveActiveCell,
      liveGameState,
    },
    awayData,
    homeData
  };
}
