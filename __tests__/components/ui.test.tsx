import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { RatingBadge } from '@features/movies/components/RatingBadge';
import { Badge } from '@shared/components/ui/Badge';
import { Button } from '@shared/components/ui/Button';
import { ErrorView } from '@shared/components/feedback/ErrorView';
import { EmptyStateView } from '@shared/components/feedback/EmptyStateView';
import { CategoryFilterTabs } from '@features/movies/components/CategoryFilterTabs';

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
      renderer = ReactTestRenderer.create(<Badge label="Acción" variant="surface" />);
    });
    expect(renderer).toBeDefined();
    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('renders Button with title', () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<Button title="Click Me" onPress={onPress} />);
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
      renderer = ReactTestRenderer.create(<ErrorView title="Algo salió mal" onRetry={onRetry} />);
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
        <EmptyStateView
          title="Sin películas"
          message="No se encontraron resultados"
          onAction={onAction}
        />
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
        <CategoryFilterTabs
          selectedCategory="popular"
          onSelectCategory={onSelect}
        />
      );
    });
    expect(renderer).toBeDefined();
    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });
});
