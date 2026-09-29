import React from 'react';
import { Pressable, Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { ErrorBoundary } from '@shared/components/feedback/ErrorBoundary';
import { logger } from '@shared/utils/logger';
import { makeTestStore } from '../../test-utils';

const Bomb: React.FC = () => {
  throw new Error('boom');
};

const renderWithBoundary = (ui: React.ReactElement) =>
  render(<Provider store={makeTestStore()}>{ui}</Provider>);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'error').mockImplementation(() => undefined);
    // React 19 logs caught errors to console.error; keep the output readable.
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the translated fallback and logs when a child throws', () => {
    renderWithBoundary(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Ha ocurrido un error')).toBeTruthy();
    expect(logger.error).toHaveBeenCalledWith(
      'Unhandled UI error',
      expect.objectContaining({ componentStack: expect.any(String) }),
      expect.any(Error),
    );
  });

  it('lets a custom fallback reset the boundary and re-render children', () => {
    let shouldThrow = true;

    const MaybeThrows: React.FC = () => {
      if (shouldThrow) {
        throw new Error('temporary');
      }
      return <Text>recovered</Text>;
    };

    renderWithBoundary(
      <ErrorBoundary
        fallback={({ resetError }) => (
          <Pressable
            onPress={() => {
              shouldThrow = false;
              resetError();
            }}
          >
            <Text>reset</Text>
          </Pressable>
        )}
      >
        <MaybeThrows />
      </ErrorBoundary>,
    );

    fireEvent.press(screen.getByText('reset'));

    expect(screen.getByText('recovered')).toBeTruthy();
  });
});
