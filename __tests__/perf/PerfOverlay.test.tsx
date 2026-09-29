import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PerfOverlay } from '@shared/perf/PerfOverlay';
import { usePerfMonitor } from '@shared/perf/usePerfMonitor';

jest.mock('@shared/perf/usePerfMonitor', () => ({
  usePerfMonitor: jest.fn(),
}));

const mockedUsePerfMonitor = usePerfMonitor as unknown as jest.Mock;

const stats = (fps: number) => ({
  fps,
  avgFrameMs: 1000 / fps,
  worstFrameMs: 40,
  droppedFrames: 2,
  jankRate: 0.2,
  frameCount: 10,
});

describe('PerfOverlay', () => {
  it('shows only the color-coded FPS chip', () => {
    mockedUsePerfMonitor.mockReturnValue({
      stats: stats(30),
      history: [60, 30],
    });

    render(<PerfOverlay />);

    expect(screen.getByText('30 FPS')).toBeTruthy();
    // The detailed metrics panel was removed from the UI.
    expect(screen.queryByText('Avg')).toBeNull();
    expect(screen.queryByText('Jank')).toBeNull();
  });

  it('renders the FPS value for other frame rates', () => {
    mockedUsePerfMonitor.mockReturnValue({ stats: stats(50), history: [] });

    render(<PerfOverlay />);

    expect(screen.getByText('50 FPS')).toBeTruthy();
  });
});
