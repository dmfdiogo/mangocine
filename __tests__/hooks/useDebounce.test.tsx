import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { useDebounce } from '@features/search/hooks/useDebounce';

const Probe: React.FC<{ value: string }> = ({ value }) => {
  const debounced = useDebounce(value, 300);
  return <Text>{debounced}</Text>;
};

const readText = (renderer: ReactTestRenderer.ReactTestRenderer): string => {
  const node = renderer.root.findByType(Text);
  return String(node.props.children);
};

describe('useDebounce hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<Probe value="initial" />);
    });

    expect(readText(renderer!)).toBe('initial');

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('only updates after the delay elapses', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<Probe value="a" />);
    });

    ReactTestRenderer.act(() => {
      renderer!.update(<Probe value="ab" />);
    });
    expect(readText(renderer!)).toBe('a');

    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(readText(renderer!)).toBe('ab');

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('cancels the pending update when the value changes rapidly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<Probe value="a" />);
    });

    ReactTestRenderer.act(() => {
      renderer!.update(<Probe value="ab" />);
    });

    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(150);
    });

    // Change again before the first debounce window elapses
    ReactTestRenderer.act(() => {
      renderer!.update(<Probe value="abc" />);
    });

    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(150);
    });
    // Original 300ms timer for "ab" was cancelled; still showing "a"
    expect(readText(renderer!)).toBe('a');

    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(readText(renderer!)).toBe('abc');

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });
});
