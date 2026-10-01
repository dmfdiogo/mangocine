import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import {
  useTranslation,
  getTmdbLanguage,
  getTmdbRegion,
  LANGUAGE_OPTIONS,
} from '@shared/i18n';
import { translations, TranslationKey } from '@shared/i18n/translations';
import { rootReducer } from '@app/store/rootReducer';
import { setLanguage } from '@app/store/settingsSlice';

const createTestStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

const Probe: React.FC<{
  translationKey: TranslationKey;
  params?: Record<string, string | number>;
}> = ({ translationKey, params }) => {
  const { t } = useTranslation();
  return <Text>{t(translationKey, params)}</Text>;
};

const readText = (renderer: ReactTestRenderer.ReactTestRenderer): string =>
  String(renderer.root.findByType(Text).props.children);

describe('i18n', () => {
  it('exposes the same key set for every language', () => {
    const esKeys = Object.keys(translations['es-PY']).sort();
    const ptKeys = Object.keys(translations['pt-BR']).sort();
    expect(ptKeys).toEqual(esKeys);
  });

  it('maps app languages to TMDB content locales', () => {
    expect(getTmdbLanguage('es-PY')).toBe('es-ES');
    expect(getTmdbLanguage('pt-BR')).toBe('pt-BR');
  });

  it('maps app languages to TMDB content regions', () => {
    expect(getTmdbRegion('es-PY')).toBe('PY');
    expect(getTmdbRegion('pt-BR')).toBe('BR');
  });

  it('exposes both language options', () => {
    expect(LANGUAGE_OPTIONS.map(option => option.code)).toEqual([
      'es-PY',
      'pt-BR',
    ]);
  });

  it('translates and interpolates params', () => {
    const store = createTestStore();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <Probe translationKey="list.resultsFor" params={{ query: 'Dune' }} />
        </Provider>,
      );
    });

    expect(readText(renderer!)).toContain('Dune');

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('reacts to language changes', () => {
    const store = createTestStore();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <Probe translationKey="list.reload" />
        </Provider>,
      );
    });

    expect(readText(renderer!)).toBe('Recargar');

    ReactTestRenderer.act(() => {
      store.dispatch(setLanguage('pt-BR'));
    });

    expect(readText(renderer!)).toBe('Recarregar');

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });
});
