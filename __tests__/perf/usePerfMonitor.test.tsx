import { renderHook, act } from '@testing-library/react-native';
import { usePerfMonitor } from '@shared/perf/usePerfMonitor';

type FrameRequestCallback = (time: number) => void;

describe('usePerfMonitor', () => {
  let frames: FrameRequestCallback[];
  let cancel: jest.Mock;

  beforeEach(() => {
    frames = [];
    cancel = jest.fn();
    jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        frames.push(cb);
        return frames.length;
      });
    jest.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(cancel);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /** Runs the queued frame callbacks with the given timestamps. */
  const drive = (times: number[]) => {
    times.forEach(time => {
      const cb = frames.shift();
      if (cb) {
        act(() => cb(time));
      }
    });
  };

  it('samples frames into an FPS snapshot per window', () => {
    const { result } = renderHook(() =>
      usePerfMonitor({ windowMs: 100, historySize: 5 }),
    );

    // 1ms start, then 7 steady ~16ms frames → crosses the 100ms window.
    drive([1, 17, 33, 49, 65, 81, 97, 113]);

    expect(result.current.stats.fps).toBeGreaterThan(55);
    expect(result.current.stats.frameCount).toBeGreaterThan(0);
    expect(result.current.stats.droppedFrames).toBe(0);
    expect(result.current.history).toHaveLength(1);
  });

  it('tracks a slow frame as dropped', () => {
    const { result } = renderHook(() => usePerfMonitor({ windowMs: 60 }));

    // One 50ms spike inside the window.
    drive([1, 17, 67, 83]);

    expect(result.current.stats.worstFrameMs).toBeGreaterThanOrEqual(50);
    expect(result.current.stats.droppedFrames).toBeGreaterThanOrEqual(1);
  });

  it('is a no-op when disabled and cancels the loop on unmount', () => {
    const { result, unmount } = renderHook(() =>
      usePerfMonitor({ enabled: false }),
    );

    expect(frames).toHaveLength(0);
    expect(result.current.stats.fps).toBe(0);

    unmount();
    expect(cancel).not.toHaveBeenCalled();
  });

  it('cancels the animation frame on unmount when enabled', () => {
    const { unmount } = renderHook(() => usePerfMonitor());
    expect(frames.length).toBeGreaterThan(0);

    unmount();
    expect(cancel).toHaveBeenCalled();
  });
});
