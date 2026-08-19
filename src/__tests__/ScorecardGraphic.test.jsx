import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ScorecardGraphic from '../components/ScorecardGraphic';

describe('ScorecardGraphic Component Tests', () => {
  const mockData = {
    gameInfo: {
      dateDisplay: 'OCT 30, 2024',
      headline: 'World Series Game 5',
      venue: 'Yankee Stadium',
      totalInnings: 9,
      isFinal: true,
      isLive: false,
      awayTeam: { name: 'Los Angeles Dodgers', runs: 7, hits: 8, errors: 0 },
      homeTeam: { name: 'New York Yankees', runs: 6, hits: 7, errors: 1 },
      linescore: [
        { num: 1, away: 0, home: 3 },
        { num: 2, away: 0, home: 0 },
        { num: 3, away: 0, home: 1 },
        { num: 4, away: 0, home: 0 },
        { num: 5, away: 5, home: 0 },
        { num: 6, away: 0, home: 1 },
        { num: 7, away: 0, home: 0 },
        { num: 8, away: 2, home: 0 },
        { num: 9, away: 0, home: 0 }
      ],
      decisions: { winner: 'Treinen', loser: 'Kahnle', save: 'Buehler' },
      durationStr: '3:42',
      attendance: '49,263',
    },
    awayData: {
      team: { name: 'Los Angeles Dodgers', abbreviation: 'LAD' },
      batters: [
        { id: 1, name: 'OHTANI', jerseyNumber: '17', position: 'DH', plays: { 1: { code: 'F8', bases: 0 } } },
        { id: 2, name: 'BETTS', jerseyNumber: '50', position: 'RF', plays: { 1: { code: 'F9', bases: 0 } } },
        { id: 3, name: 'FREEMAN', jerseyNumber: '5', position: '1B', plays: { 1: { code: 'F7', bases: 0 } } }
      ],
      pitchers: [
        { name: 'FLAHERTY', ip: '1.1', h: 4, r: 4, er: 4, bb: 1, k: 1 }
      ]
    },
    homeData: {
      team: { name: 'New York Yankees', abbreviation: 'NYY' },
      batters: [
        { id: 4, name: 'TORRES', jerseyNumber: '25', position: '2B', plays: { 1: { code: 'F8', bases: 0 } } },
        { id: 5, name: 'SOTO', jerseyNumber: '22', position: 'RF', plays: { 1: { code: 'BB', bases: 1 } } },
        { id: 6, name: 'JUDGE', jerseyNumber: '99', position: 'CF', plays: { 1: { code: 'HR', bases: 4 } } }
      ],
      pitchers: [
        { name: 'COLE', ip: '6.2', h: 4, r: 5, er: 0, bb: 0, k: 6 }
      ]
    }
  };

  it('renders ScorecardGraphic across various themes without errors', () => {
    const { container: c1 } = render(<ScorecardGraphic data={mockData} theme="team-light" />);
    expect(c1.querySelector('table')).toBeDefined();

    const { container: c2 } = render(<ScorecardGraphic data={mockData} theme="chalkboard" />);
    expect(c2.querySelector('table')).toBeDefined();

    const { container: c3 } = render(<ScorecardGraphic data={mockData} theme="modern-dark" />);
    expect(c3.querySelector('table')).toBeDefined();
  });
});
