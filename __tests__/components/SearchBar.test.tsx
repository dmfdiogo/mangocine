import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { SearchBar } from '@features/search';
import { makeTestStore } from '../../test-utils';

const renderBar = (
  props: Partial<React.ComponentProps<typeof SearchBar>> = {},
) =>
  render(
    <Provider store={makeTestStore()}>
      <SearchBar value="" onChangeText={jest.fn()} {...props} />
    </Provider>,
  );

describe('SearchBar', () => {
  it('forwards typed text and uses the translated placeholder by default', () => {
    const onChangeText = jest.fn();
    renderBar({ onChangeText });

    const input = screen.getByTestId('search-input');
    expect(input.props.placeholder).toBe('Buscar películas por título...');

    fireEvent.changeText(input, 'duna');
    expect(onChangeText).toHaveBeenCalledWith('duna');
  });

  it('clears the field and notifies the caller', () => {
    const onChangeText = jest.fn();
    const onClear = jest.fn();
    renderBar({ value: 'duna', onChangeText, onClear });

    fireEvent.press(screen.getByText('✕'));

    expect(onChangeText).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalled();
  });

  it('reflects focus and shows the loading spinner', () => {
    renderBar({ value: 'duna', loading: true });

    fireEvent(screen.getByTestId('search-input'), 'focus');
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });
});
