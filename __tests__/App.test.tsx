import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

describe('App Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders without crashing after rehydrating persisted state', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
      jest.advanceTimersByTime(500);
    });

    expect(renderer).toBeDefined();

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });
});
