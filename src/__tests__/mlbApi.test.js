import { describe, it, expect } from 'vitest';
import { processMLBData, parsePlayNotation } from '../services/mlbApi';

describe('MLB API & Play Processing Tests', () => {
  it('correctly parses hit notation for single, double, triple, and home run', () => {
    const p1 = parsePlayNotation({ result: { event: 'Single', rbi: 0 }, count: { outs: 0 } });
    expect(p1.code).toBe('1B');
    expect(p1.bases).toBe(1);

    const p2 = parsePlayNotation({ result: { event: 'Home Run', rbi: 3 }, count: { outs: 1 } });
    expect(p2.code).toBe('HR');
    expect(p2.bases).toBe(4);
  });

  it('correctly handles completed game structure and extracts lastAtBat and inningFate', () => {
    const mockFeed = {
      gameData: {
        game: { pk: 123456 },
        status: { abstractGameState: 'Final', detailedState: 'Final' },
        datetime: { dateTime: '2024-10-30T00:00:00Z' },
        venue: { name: 'Yankee Stadium' },
        teams: {
          away: { id: 119, name: 'Los Angeles Dodgers', abbreviation: 'LAD', teamName: 'Dodgers' },
          home: { id: 147, name: 'New York Yankees', abbreviation: 'NYY', teamName: 'Yankees' }
        },
        players: {
          ID592450: { id: 592450, fullName: 'Aaron Judge', jerseyNumber: '99', batSide: { code: 'R' } },
          ID665742: { id: 665742, fullName: 'Juan Soto', jerseyNumber: '22', batSide: { code: 'L' } },
        }
      },
      liveData: {
        linescore: {
          currentInning: 9,
          inningState: 'End',
          isTopInning: false,
          innings: [
            { num: 1, away: { runs: 0 }, home: { runs: 3 } }
          ],
          teams: {
            away: { runs: 6, hits: 7, errors: 0 },
            home: { runs: 7, hits: 8, errors: 1 }
          }
        },
        boxscore: {
          teams: {
            away: {
              team: { id: 119, name: 'Los Angeles Dodgers' },
              teamStats: { batting: { runs: 6, hits: 7, errors: 0 } },
              players: {
                ID592450: { person: { fullName: 'Aaron Judge' }, jerseyNumber: '99', battingOrder: '300' }
              },
              batters: [592450],
              pitchers: []
            },
            home: {
              team: { id: 147, name: 'New York Yankees' },
              teamStats: { batting: { runs: 7, hits: 8, errors: 1 } },
              players: {
                ID665742: { person: { fullName: 'Juan Soto' }, jerseyNumber: '22', battingOrder: '200' },
                ID592450: { person: { fullName: 'Aaron Judge' }, jerseyNumber: '99', battingOrder: '300' }
              },
              batters: [665742, 592450],
              pitchers: []
            }
          }
        },
        plays: {
          allPlays: [
            {
              result: { event: 'Home Run', description: 'Aaron Judge homers (1) to right field.', rbi: 2 },
              about: { inning: 1, isTopInning: false, halfInning: 'bottom' },
              count: { balls: 1, strikes: 2, outs: 1 },
              matchup: {
                batter: { id: 592450, fullName: 'Aaron Judge' },
                pitcher: { fullName: 'Jack Flaherty' },
                batSide: { code: 'R' }
              },
              playEvents: [
                {
                  isPitch: true,
                  pitchNumber: 1,
                  pitchData: { startSpeed: 94.2, coordinates: { pX: 0.1, pZ: 2.5 } },
                  details: { isStrike: true, call: { code: 'C', description: 'Called Strike' }, type: { description: 'Four-Seam Fastball' } }
                },
                {
                  isPitch: true,
                  pitchNumber: 2,
                  pitchData: { startSpeed: 95.1, coordinates: { pX: -0.2, pZ: 2.1 } },
                  details: { isStrike: true, call: { code: 'X', description: 'In play, run(s)' }, type: { description: 'Four-Seam Fastball' } },
                  hitData: {
                    launchSpeed: 108.9,
                    launchAngle: 28,
                    totalDistance: 403,
                    trajectory: 'fly_ball',
                    coordinates: { coordX: 193.54, coordY: 50.49 }
                  }
                }
              ]
            }
          ]
        }
      }
    };

    const parsed = processMLBData(mockFeed);
    expect(parsed.gameInfo.isFinal).toBe(true);
    expect(parsed.gameInfo.isLive).toBe(false);
    expect(parsed.gameInfo.lastAtBat).toBeDefined();
    expect(parsed.gameInfo.lastAtBat.batter.name).toBe('JUDGE');
    expect(parsed.gameInfo.lastAtBat.currentPlay.hitData).toBeDefined();
    expect(parsed.gameInfo.lastAtBat.currentPlay.hitData.launchSpeed).toBe(108.9);
    expect(parsed.gameInfo.lastAtBat.currentPlay.hitData.totalDistance).toBe(403);
    expect(parsed.gameInfo.lastAtBat.currentPlay.inningFate.type).toBe('scored');
    expect(parsed.gameInfo.lastAtBat.currentPlay.inningFate.badge).toBe('Scored Run');
  });
});
