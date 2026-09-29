import React from 'react';
import { ScrollView } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { CategoryFilterTabs } from '@features/movies/components/CategoryFilterTabs';
import { makeTestStore } from '../../test-utils';

const renderTabs = (selected = 'popular' as const) => {
  const onSelectCategory = jest.fn();
  render(
    <Provider store={makeTestStore()}>
      <CategoryFilterTabs
        selectedCategory={selected}
        onSelectCategory={onSelectCategory}
      />
    </Provider>,
  );
  return { onSelectCategory };
};

describe('CategoryFilterTabs', () => {
  it('renders every category and marks the selected one', () => {
    renderTabs('popular');

    expect(screen.getByText('Populares')).toBeTruthy();
    expect(screen.getByText('Mejor Valoradas')).toBeTruthy();

    const tabs = screen.getAllByRole('button');
    const selectedTabs = tabs.filter(
      tab => tab.props.accessibilityState?.selected === true,
    );
    expect(selectedTabs).toHaveLength(1);
  });

  it('selects another category on press', () => {
    const { onSelectCategory } = renderTabs('popular');

    fireEvent.press(screen.getByText('Mejor Valoradas'));

    expect(onSelectCategory).toHaveBeenCalledWith('top_rated');
  });

  it('scrolls a chip into view once its layout is known', () => {
    const { onSelectCategory } = renderTabs('popular');

    const scrollView = screen.UNSAFE_getByType(ScrollView);
    fireEvent(scrollView, 'layout', {
      nativeEvent: { layout: { width: 300, height: 40 } },
    });
    fireEvent(scrollView, 'contentSizeChange', 500, 40);

    screen.getAllByRole('button').forEach((tab, index) => {
      fireEvent(tab, 'layout', {
        nativeEvent: { layout: { x: index * 100, width: 90, height: 32 } },
      });
    });

    fireEvent.press(screen.getByText('En Cartelera'));

    expect(onSelectCategory).toHaveBeenCalledWith('now_playing');
  });
});
