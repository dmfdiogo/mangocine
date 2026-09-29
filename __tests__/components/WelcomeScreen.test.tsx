import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { WelcomeScreen } from '@features/onboarding';
import { ROUTES } from '@navigation/routes';
import { renderWithStore } from '../../test-utils';

const createNavigation = () => ({
  replace: jest.fn(),
  navigate: jest.fn(),
  goBack: jest.fn(),
});

describe('WelcomeScreen', () => {
  it('enters the catalog when the CTA is pressed', () => {
    const navigation = createNavigation();
    renderWithStore(
      <WelcomeScreen navigation={navigation as never} route={{} as never} />,
    );

    fireEvent.press(screen.getByText('Explorar catálogo'));

    expect(navigation.replace).toHaveBeenCalledWith(ROUTES.MOVIE_LIST);
  });

  it('ignores rapid double taps (re-entrance protection)', () => {
    const navigation = createNavigation();
    renderWithStore(
      <WelcomeScreen navigation={navigation as never} route={{} as never} />,
    );

    const cta = screen.getByText('Explorar catálogo');
    fireEvent.press(cta);
    fireEvent.press(cta);

    expect(navigation.replace).toHaveBeenCalledTimes(1);
  });
});
