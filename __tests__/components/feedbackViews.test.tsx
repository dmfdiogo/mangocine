import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { PressableScale } from '@shared/components/ui/PressableScale';
import { AppText } from '@shared/components/ui/Text';
import { makeTestStore } from '../../test-utils';

const withStore = (ui: React.ReactElement) =>
  render(<Provider store={makeTestStore()}>{ui}</Provider>);

describe('PressableScale', () => {
  it('fires press and press in/out callbacks', () => {
    const onPress = jest.fn();
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();

    withStore(
      <PressableScale
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
      >
        <AppText>Tap me</AppText>
      </PressableScale>,
    );

    const node = screen.getByRole('button');
    fireEvent(node, 'pressIn');
    fireEvent.press(node);
    fireEvent(node, 'pressOut');

    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });
});
