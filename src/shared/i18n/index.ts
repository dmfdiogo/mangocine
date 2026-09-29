import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  setLanguage,
  selectLanguage,
  AppLanguage,
} from '@app/store/settingsSlice';
import { translations, TranslationKey } from './translations';

export type { AppLanguage, TranslationKey };

export interface LanguageOption {
  code: AppLanguage;
  labelKey: TranslationKey;
  shortLabel: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'es-PY', labelKey: 'language.es', shortLabel: 'ES' },
  { code: 'pt-BR', labelKey: 'language.pt', shortLabel: 'PT' },
];

/**
 * TMDB does not expose a Paraguay-specific content locale, so Spanish content
 * is fetched from the generic `es-ES` catalog while the UI copy stays
 * Paraguayan. Portuguese maps directly to `pt-BR`.
 */
const TMDB_LOCALE_BY_LANGUAGE: Record<AppLanguage, string> = {
  'es-PY': 'es-ES',
  'pt-BR': 'pt-BR',
};

export const getTmdbLanguage = (language: AppLanguage): string =>
  TMDB_LOCALE_BY_LANGUAGE[language];

export interface UseTranslationResult {
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  language: AppLanguage;
  changeLanguage: (language: AppLanguage) => void;
}

export const useTranslation = (): UseTranslationResult => {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dictionary = translations[language] ?? translations['es-PY'];
      let template: string =
        dictionary[key] ?? translations['es-PY'][key] ?? key;

      if (params) {
        Object.entries(params).forEach(([name, value]) => {
          template = template.split(`{${name}}`).join(String(value));
        });
      }

      return template;
    },
    [language]
  );

  const changeLanguage = useCallback(
    (next: AppLanguage) => {
      dispatch(setLanguage(next));
    },
    [dispatch]
  );

  return { t, language, changeLanguage };
};
