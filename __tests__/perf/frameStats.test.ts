import { EMPTY_FRAME_STATS, summarizeFrames } from '@shared/perf/frameStats';

describe('summarizeFrames', () => {
  it('returns zeros for an empty window', () => {
    expect(summarizeFrames([])).toEqual(EMPTY_FRAME_STATS);
  });

  it('computes fps and average from steady 60Hz frames', () => {
    const durations = Array.from({ length: 60 }, () => 1000 / 60);

    const stats = summarizeFrames(durations);

    expect(stats.fps).toBeCloseTo(60, 1);
    expect(stats.avgFrameMs).toBeCloseTo(16.67, 1);
    expect(stats.worstFrameMs).toBeCloseTo(16.67, 1);
    expect(stats.droppedFrames).toBe(0);
    expect(stats.jankRate).toBe(0);
    expect(stats.frameCount).toBe(60);
  });

  it('flags slow frames as dropped and tracks the worst spike', () => {
    const durations = [16, 16, 16, 60, 16];

    const stats = summarizeFrames(durations);

    expect(stats.worstFrameMs).toBe(60);
    expect(stats.droppedFrames).toBe(1);
    expect(stats.jankRate).toBeCloseTo(1 / 5, 5);
    expect(stats.fps).toBeLessThan(60);
  });
});
