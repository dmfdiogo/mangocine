/** Frame budget at 60Hz (16.67ms). */
export const TARGET_FRAME_MS = 1000 / 60;

/** A frame slower than 1.5x the budget is considered dropped/janky. */
export const JANK_FRAME_MS = TARGET_FRAME_MS * 1.5;

export interface FrameStats {
  /** Frames rendered per second over the sampled window. */
  fps: number;
  /** Mean frame duration in ms. */
  avgFrameMs: number;
  /** Slowest single frame in the window (spikes). */
  worstFrameMs: number;
  /** Frames that blew past the jank threshold. */
  droppedFrames: number;
  /** Fraction (0..1) of janky frames. */
  jankRate: number;
  frameCount: number;
}

export const EMPTY_FRAME_STATS: FrameStats = {
  fps: 0,
  avgFrameMs: 0,
  worstFrameMs: 0,
  droppedFrames: 0,
  jankRate: 0,
  frameCount: 0,
};

/**
 * Pure aggregation of frame durations (ms) into FPS/jank metrics. Extracted from
 * the hook so it can be unit-tested without a real animation loop.
 */
export const summarizeFrames = (
  durations: number[],
  targetFrameMs: number = TARGET_FRAME_MS,
): FrameStats => {
  if (durations.length === 0) {
    return EMPTY_FRAME_STATS;
  }

  let total = 0;
  let worstFrameMs = 0;
  let droppedFrames = 0;
  const jankThreshold = targetFrameMs * 1.5;

  for (const duration of durations) {
    total += duration;
    if (duration > worstFrameMs) {
      worstFrameMs = duration;
    }
    if (duration > jankThreshold) {
      droppedFrames += 1;
    }
  }

  return {
    fps: (durations.length / total) * 1000,
    avgFrameMs: total / durations.length,
    worstFrameMs,
    droppedFrames,
    jankRate: droppedFrames / durations.length,
    frameCount: durations.length,
  };
};
