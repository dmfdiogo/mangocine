import { useEffect, useRef, useState } from 'react';
import { EMPTY_FRAME_STATS, FrameStats, summarizeFrames } from './frameStats';

export interface UsePerfMonitorOptions {
  enabled?: boolean;
  /** Size of the aggregation window in ms (default 1s). */
  windowMs?: number;
  /** How many recent FPS samples to keep for the sparkline. */
  historySize?: number;
}

export interface PerfMonitorResult {
  stats: FrameStats;
  /** Recent FPS samples, oldest first. */
  history: number[];
}

const hasAnimationLoop = (): boolean =>
  typeof requestAnimationFrame === 'function' &&
  typeof cancelAnimationFrame === 'function';

/**
 * Samples the JS animation loop and reports FPS / jank metrics. Because it
 * rides on `requestAnimationFrame`, it measures the same frame cadence the UI
 * renders on — useful to catch regressions while scrolling long lists.
 *
 * Disabled (or on unsupported environments) it is a no-op returning zeros.
 */
export const usePerfMonitor = ({
  enabled = true,
  windowMs = 1000,
  historySize = 30,
}: UsePerfMonitorOptions = {}): PerfMonitorResult => {
  const [stats, setStats] = useState<FrameStats>(EMPTY_FRAME_STATS);
  const [history, setHistory] = useState<number[]>([]);
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    if (!enabled || !hasAnimationLoop()) {
      return undefined;
    }

    let rafId = 0;
    let lastTime = 0;
    let windowStart = 0;
    let durations: number[] = [];

    const loop = (time: number) => {
      if (lastTime !== 0) {
        durations.push(time - lastTime);
      }
      lastTime = time;

      if (windowStart === 0) {
        windowStart = time;
      }

      if (time - windowStart >= windowMs) {
        const snapshot = summarizeFrames(durations);
        setStats(snapshot);

        const nextHistory = [...historyRef.current, snapshot.fps].slice(
          -historySize,
        );
        historyRef.current = nextHistory;
        setHistory(nextHistory);

        durations = [];
        windowStart = time;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [enabled, windowMs, historySize]);

  return { stats, history };
};
