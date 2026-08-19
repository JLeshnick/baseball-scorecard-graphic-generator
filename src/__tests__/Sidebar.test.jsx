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
});
