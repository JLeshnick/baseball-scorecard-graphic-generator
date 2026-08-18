/**
 * Local Storage & Persistence Service for Custom Live Scorecards
 */

const STORAGE_KEY_SAVED_LIST = 'mlb_scorecard_saved_games_v1';
const STORAGE_KEY_AUTOSAVE = 'mlb_scorecard_live_autosave_v1';

export function getSavedScorecardsList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_LIST);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load saved scorecards list:', err);
    return [];
  }
}

export function saveScorecardToStorage(scorecardData, name = '') {
  if (!scorecardData || !scorecardData.gameInfo) return false;
  try {
    const id = scorecardData.gameInfo.gamePk || `game_${Date.now()}`;
    const list = getSavedScorecardsList().filter(item => item.id !== id);
    const summary = {
      id,
      name: name || `${scorecardData.gameInfo.awayTeam.abbreviation} @ ${scorecardData.gameInfo.homeTeam.abbreviation}`,
      date: scorecardData.gameInfo.dateDisplay || new Date().toLocaleDateString(),
      score: `${scorecardData.gameInfo.awayTeam.score} - ${scorecardData.gameInfo.homeTeam.score}`,
      savedAt: new Date().toISOString(),
      data: scorecardData,
    };
    list.unshift(summary);
    // Keep max 30 saved scorecards
    localStorage.setItem(STORAGE_KEY_SAVED_LIST, JSON.stringify(list.slice(0, 30)));
    return true;
  } catch (err) {
    console.error('Failed to save scorecard:', err);
    return false;
  }
}

export function deleteSavedScorecard(id) {
  try {
    const list = getSavedScorecardsList().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY_SAVED_LIST, JSON.stringify(list));
    return true;
  } catch (err) {
    console.error('Failed to delete scorecard:', err);
    return false;
  }
}

export function autosaveLiveScorecard(scorecardData) {
  if (!scorecardData) return;
  try {
    localStorage.setItem(STORAGE_KEY_AUTOSAVE, JSON.stringify({
      timestamp: Date.now(),
      data: scorecardData,
    }));
  } catch (err) {
    // Ignore quota errors silently
  }
}

export function getAutosavedLiveScorecard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTOSAVE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.data || null;
  } catch (err) {
    return null;
  }
}

export function clearAutosavedScorecard() {
  try {
    localStorage.removeItem(STORAGE_KEY_AUTOSAVE);
  } catch (err) {}
}

export function exportScorecardAsJson(scorecardData) {
  if (!scorecardData) return;
  const awayAbbr = scorecardData.gameInfo?.awayTeam?.abbreviation || 'AWAY';
  const homeAbbr = scorecardData.gameInfo?.homeTeam?.abbreviation || 'HOME';
  const dateStr = (scorecardData.gameInfo?.dateDisplay || 'custom_game').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const filename = `scorecard_${awayAbbr}_vs_${homeAbbr}_${dateStr}.json`;

  const blob = new Blob([JSON.stringify(scorecardData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importScorecardFromJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result);
        if (data && data.gameInfo && data.awayData && data.homeData) {
          resolve(data);
        } else {
          reject(new Error('Invalid scorecard JSON file structure.'));
        }
      } catch (err) {
        reject(new Error('Failed to parse scorecard JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
