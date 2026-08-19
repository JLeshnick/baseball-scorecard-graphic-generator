import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../components/Sidebar';

describe('Sidebar Component & Visualizer Tests', () => {
  const mockColors = {
    bgSidebar: '#ffffff',
    border: '#e5e7eb',
    textHead: '#111827',
    textMain: '#374151',
    textMuted: '#6b7280',
  };

  const mockScorecardData = {
    gameInfo: {
      dateDisplay: 'OCT 30, 2024',
      headline: 'World Series Game 5',
      venue: 'Yankee Stadium',
      isFinal: true,
      isLive: false,
      awayTeam: { name: 'Los Angeles Dodgers', runs: 7, hits: 8, errors: 0 },
      homeTeam: { name: 'New York Yankees', runs: 6, hits: 7, errors: 1 },
      liveGameState: null,
    }
  };

  const mockInspectedCell = {
    teamKey: 'home',
    teamName: 'New York Yankees',
    inning: 1,
    batterIndex: 2,
    batter: { jerseyNumber: '99', name: 'JUDGE', fullName: 'Aaron Judge' },
    currentPlay: {
      code: 'HR',
      description: 'Aaron Judge homers (1) to right field.',
      batterName: 'JUDGE',
      batterFullName: 'Aaron Judge',
      batterJerseyNumber: '99',
      batSide: 'R',
      pitcherName: 'FLAHERTY',
      pitches: [
        { pitchNumber: 1, speed: 94.2, pitchType: 'FF', callDesc: 'Called Strike', color: '#ef4444', normX: 52, normY: 30 },
        { pitchNumber: 2, speed: 95.1, pitchType: 'FF', callDesc: 'In Play', color: '#3b82f6', normX: 50, normY: 32 }
      ],
      hitData: {
        launchSpeed: 108.9,
        launchAngle: 28,
        totalDistance: 403,
        trajectory: 'fly_ball',
        hardness: 'hard',
        coordX: 193.54,
        coordY: 50.49,
      },
      inningFate: {
        type: 'scored',
        badge: 'Scored Run',
        text: 'Scored on Home Run'
      }
    }
  };

  it('renders Sidebar with Pitches and Hit Spray tabs and switches between them without error', () => {
    render(
      <Sidebar
        isMobile={false}
        mobileView="controls"
        c={mockColors}
        isDark={false}
        activeTab="game"
        setActiveTab={vi.fn()}
        tabStyle={vi.fn()}
        scoringMode="mlb"
        setScoringMode={vi.fn()}
        scorecardData={mockScorecardData}
        setScorecardData={vi.fn()}
        inspectedCell={mockInspectedCell}
        setInspectedCell={vi.fn()}
        selectedGamePk={123456}
        setSelectedGamePk={vi.fn()}
      />
    );

    // Header and At-Bat Details
    expect(screen.getAllByText(/Aaron Judge/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Play Result/i)).toBeDefined();
    expect(screen.getByText(/Inning Fate/i)).toBeDefined();
    expect(screen.getByText(/Scored Run/i)).toBeDefined();

    // Mode Selector buttons
    const hitTabBtn = screen.getByRole('button', { name: /Hit\/Foul Spray/i });
    expect(hitTabBtn).toBeDefined();

    // Perspective Selector buttons
    const sideAngleBtn = screen.getByRole('button', { name: /Side Flight Arc/i });
    expect(sideAngleBtn).toBeDefined();
    fireEvent.click(sideAngleBtn);
    expect(screen.getByText(/Mound \(54'\)/i)).toBeDefined();

    // Switch to Hit Spray
    fireEvent.click(hitTabBtn);
    expect(screen.getByText(/Exit Velocity/i)).toBeDefined();
    expect(screen.getAllByText(/108.9 MPH/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/403.*FT/i).length).toBeGreaterThan(0);

    // Switch back to Pitches Catcher Front
    const pitchesTabBtn = screen.getByRole('button', { name: /Pitches/i });
    fireEvent.click(pitchesTabBtn);
    const frontAngleBtn = screen.getByRole('button', { name: /Catcher Front/i });
    fireEvent.click(frontAngleBtn);
    expect(screen.getByText(/Strike Zone/i)).toBeDefined();
  });

  it('renders multi-at-bat switching buttons when player batted multiple times in an inning', () => {
    const multiCell = {
      ...mockInspectedCell,
      plays: [
        {
          code: '1B',
          description: 'Single to left field',
          pitches: [
            { pitchNumber: 1, speed: 92.5, pitchType: 'FF', callDesc: 'Ball', color: '#10b981', normX: 20, normY: 20 }
          ],
          hitData: { launchSpeed: 95.0, launchAngle: 12, totalDistance: 240, trajectory: 'line_drive', coordX: 80, coordY: 100 },
        },
        {
          code: 'HR',
          description: '3-Run Home run to right center',
          pitches: [
            { pitchNumber: 1, speed: 84.1, pitchType: 'SL', callDesc: 'In Play', color: '#3b82f6', normX: 50, normY: 50 }
          ],
          hitData: { launchSpeed: 106.2, launchAngle: 30, totalDistance: 418, trajectory: 'fly_ball', coordX: 190, coordY: 45 },
        }
      ]
    };

    render(
      <Sidebar
        isMobile={false}
        mobileView="controls"
        c={mockColors}
        isDark={false}
        activeTab="game"
        setActiveTab={vi.fn()}
        tabStyle={vi.fn()}
        scoringMode="mlb"
        setScoringMode={vi.fn()}
        scorecardData={mockScorecardData}
        setScorecardData={vi.fn()}
        inspectedCell={multiCell}
        setInspectedCell={vi.fn()}
        selectedGamePk={123456}
        setSelectedGamePk={vi.fn()}
      />
    );

    // Both at-bat buttons should appear
    expect(screen.getByText(/At-Bat:/i)).toBeDefined();
    const pa1Btn = screen.getByRole('button', { name: /①.*1B/i });
    const pa2Btn = screen.getByRole('button', { name: /②.*HR/i });
    expect(pa1Btn).toBeDefined();
    expect(pa2Btn).toBeDefined();

    // Default is 1st at-bat (Single)
    expect(screen.getByText(/Single to left field/i)).toBeDefined();

    // Click 2nd at-bat
    fireEvent.click(pa2Btn);
    expect(screen.getByText(/3-Run Home run to right center/i)).toBeDefined();
  });

  it('renders Pitcher Inspection breakdown by inning with pitch count pills and visualizer tabs', () => {
    const mockScorecardWithPitcher = {
      gameInfo: {
        dateDisplay: 'OCT 30, 2024',
        awayTeam: { name: 'Los Angeles Dodgers', score: 7 },
        homeTeam: { name: 'New York Yankees', score: 6 },
        totalInnings: 9,
      },
      awayData: {
        pitchers: [
          {
            id: 663556,
            name: 'FLAHERTY',
            fullName: 'Jack Flaherty',
            number: '34',
            ip: '5.1',
            totalPitches: 86,
            pitchesByInning: {
              1: { pitches: 22, strikes: 14, balls: 8 },
              2: { pitches: 14, strikes: 10, balls: 4 },
            }
          }
        ]
      },
      homeData: {
        batters: [
          {
            name: 'JUDGE',
            fullName: 'Aaron Judge',
            jerseyNumber: '99',
            plays: {
              1: {
                pitcherId: 663556,
                pitcherName: 'FLAHERTY',
                code: 'HR',
                pitches: [
                  { pitchNumber: 1, speed: 94.2, pitchType: 'FF', callDesc: 'In Play', color: '#3b82f6', normX: 50, normY: 30 }
                ],
                hitData: { launchSpeed: 108.9, launchAngle: 28, totalDistance: 403, trajectory: 'fly_ball', coordX: 190, coordY: 50 }
              }
            }
          }
        ]
      }
    };

    const mockInspectedPitcher = {
      teamKey: 'away',
      teamName: 'Los Angeles Dodgers',
      pitcher: mockScorecardWithPitcher.awayData.pitchers[0],
      pitcherIndex: 0,
      inning: 1,
    };

    render(
      <Sidebar
        isMobile={false}
        mobileView="controls"
        c={mockColors}
        isDark={false}
        activeTab="game"
        setActiveTab={vi.fn()}
        tabStyle={vi.fn()}
        scoringMode="mlb"
        setScoringMode={vi.fn()}
        scorecardData={mockScorecardWithPitcher}
        setScorecardData={vi.fn()}
        inspectedPitcher={mockInspectedPitcher}
        setInspectedPitcher={vi.fn()}
        selectedGamePk={123456}
        setSelectedGamePk={vi.fn()}
      />
    );

    // Should display Pitcher Header with inning scope
    expect(screen.getByText(/INN 1/i)).toBeDefined();
    expect(screen.getAllByText(/Jack Flaherty/i).length).toBeGreaterThan(0);

    // Visualizer Mode Buttons
    const hitsTabBtn = screen.getByRole('button', { name: /Hit\/Foul Spray/i });
    expect(hitsTabBtn).toBeDefined();
    fireEvent.click(hitsTabBtn);

    // Batted ball details allowed by pitcher
    expect(screen.getByText(/Exit Velocity/i)).toBeDefined();
  });

  it('correctly isolates plays by pitcher when multiple pitchers pitched in the same inning', async () => {
    const { getPitcherPlays } = await import('../components/PitcherInspectionModal');

    const multiPitcherScorecard = {
      awayData: {
        pitchers: [
          { id: 101, name: 'START', fullName: 'Starter Pitcher', pitchesByInning: { 5: { pitches: 12 } } },
          { id: 102, name: 'RELIEF', fullName: 'Relief Pitcher', pitchesByInning: { 5: { pitches: 8 } } },
        ]
      },
      homeData: {
        batters: [
          {
            name: 'BATTER1',
            fullName: 'First Batter',
            plays: {
              5: {
                pitcherId: 101,
                pitcherName: 'START',
                pitcherFullName: 'Starter Pitcher',
                code: '1B',
                pitches: [{ pitchNumber: 1, speed: 95, pitchType: 'FF' }]
              }
            }
          },
          {
            name: 'BATTER2',
            fullName: 'Second Batter',
            plays: {
              5: {
                pitcherId: 102,
                pitcherName: 'RELIEF',
                pitcherFullName: 'Relief Pitcher',
                code: 'K',
                pitches: [{ pitchNumber: 1, speed: 85, pitchType: 'SL' }]
              }
            }
          }
        ]
      }
    };

    const starterCtx = { teamKey: 'away', pitcher: multiPitcherScorecard.awayData.pitchers[0], inning: 5 };
    const reliefCtx = { teamKey: 'away', pitcher: multiPitcherScorecard.awayData.pitchers[1], inning: 5 };

    const starterPlays = getPitcherPlays(starterCtx, multiPitcherScorecard, 5);
    const reliefPlays = getPitcherPlays(reliefCtx, multiPitcherScorecard, 5);

    // Starter should only receive Batter 1's play
    expect(starterPlays.length).toBe(1);
    expect(starterPlays[0].pitcherId).toBe(101);
    expect(starterPlays[0].batterName).toBe('BATTER1');

    // Reliever should only receive Batter 2's play
    expect(reliefPlays.length).toBe(1);
    expect(reliefPlays[0].pitcherId).toBe(102);
    expect(reliefPlays[0].batterName).toBe('BATTER2');
  });
});
