import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { HeaderMenuButton } from '@shared/components/ui/HeaderMenuButton';
import { rootReducer } from '@app/store/rootReducer';

const createTestStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

const pressableByTestId = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  testID: string,
) =>
  renderer.root.findAll(
    node =>
      node.props?.testID === testID &&
      typeof node.props?.onPress === 'function',
  )[0];

describe('HeaderMenuButton', () => {
  it('opens the menu and changes the language', () => {
    const store = createTestStore();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <HeaderMenuButton />
        </Provider>,
      );
    });

    expect(store.getState().settings.language).toBe('es-PY');

    ReactTestRenderer.act(() => {
      pressableByTestId(renderer!, 'header-menu-button').props.onPress();
    });

    ReactTestRenderer.act(() => {
      pressableByTestId(renderer!, 'language-option-pt-BR').props.onPress();
    });

    expect(store.getState().settings.language).toBe('pt-BR');

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('navigates to catalog and favorites from the menu rows', () => {
    const onNavigateCatalog = jest.fn();
    const onNavigateFavorites = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={createTestStore()}>
          <HeaderMenuButton
            onNavigateCatalog={onNavigateCatalog}
            onNavigateFavorites={onNavigateFavorites}
          />
        </Provider>,
      );
    });

    ReactTestRenderer.act(() => {
      pressableByTestId(renderer!, 'header-menu-button').props.onPress();
    });
    ReactTestRenderer.act(() => {
      pressableByTestId(renderer!, 'menu-catalog').props.onPress();
    });
    ReactTestRenderer.act(() => {
      pressableByTestId(renderer!, 'menu-favorites').props.onPress();
    });

    expect(onNavigateCatalog).toHaveBeenCalledTimes(1);
    expect(onNavigateFavorites).toHaveBeenCalledTimes(1);

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('renders the trigger without an open menu', () => {
    const store = createTestStore();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <HeaderMenuButton />
        </Provider>,
      );
    });

    expect(
      renderer!.root.findAll(
        node =>
          node.props?.testID === 'header-menu-button' &&
          typeof node.props?.onPress === 'function',
      ).length,
    ).toBeGreaterThan(0);

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });
});
