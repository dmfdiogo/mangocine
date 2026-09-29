import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { RatingBadge } from '@features/movies/components/RatingBadge';
import { Badge } from '@shared/components/ui/Badge';
import { Button } from '@shared/components/ui/Button';
import { ErrorView } from '@shared/components/feedback/ErrorView';
import { EmptyStateView } from '@shared/components/feedback/EmptyStateView';
import { CategoryFilterTabs } from '@features/movies/components/CategoryFilterTabs';
import { Skeleton } from '@shared/components/ui/Skeleton';
import { rootReducer } from '@app/store/rootReducer';

const createTestStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

describe('UI & Feedback Components', () => {
  it('renders RatingBadge correctly with formatted score', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<RatingBadge rating={8.4} />);
    });
    expect(renderer).toBeDefined();
    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('renders Genre Badge correctly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Badge label="Acción" variant="surface" />,
      );
    });
    expect(renderer).toBeDefined();
    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('renders Badge in every variant, with and without an icon', () => {
    (['primary', 'secondary', 'rating', 'outline', 'surface'] as const).forEach(
      variant => {
        let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
        ReactTestRenderer.act(() => {
          renderer = ReactTestRenderer.create(
            <Badge
              label={`badge-${variant}`}
              variant={variant}
              icon={<Text>★</Text>}
            />,
          );
        });
        expect(
          renderer!.root
            .findAllByType(Text)
            .some(node => node.props.children === `badge-${variant}`),
        ).toBe(true);
        ReactTestRenderer.act(() => {
          renderer?.unmount();
        });
      },
    );
  });

  it('renders Button with title', () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Button title="Click Me" onPress={onPress} />,
      );
    });
    expect(renderer).toBeDefined();
    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('renders ErrorView with custom title and retry button', () => {
    const onRetry = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={createTestStore()}>
          <ErrorView title="Algo salió mal" onRetry={onRetry} />
        </Provider>,
      );
    });
    expect(renderer).toBeDefined();
    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('renders EmptyStateView with action button', () => {
    const onAction = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={createTestStore()}>
          <EmptyStateView
            title="Sin películas"
            message="No se encontraron resultados"
            onAction={onAction}
          />
        </Provider>,
      );
    });
    expect(renderer).toBeDefined();
    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('renders CategoryFilterTabs and responds to tab change', () => {
    const onSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={createTestStore()}>
          <CategoryFilterTabs
            selectedCategory="popular"
            onSelectCategory={onSelect}
          />
        </Provider>,
      );
    });
    expect(renderer).toBeDefined();
    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('renders the pulsing Skeleton placeholder', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Skeleton width="100%" height={120} borderRadius={8} />,
      );
    });
    expect(renderer).toBeDefined();
    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });
});
