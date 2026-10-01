import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { setLanguage, selectLanguage } from '@app/store/settingsSlice';
import { translations, TranslationKey } from './translations';
import { AppLanguage, getTmdbLanguage, getTmdbRegion } from './locale';

export type { AppLanguage, TranslationKey };
export { getTmdbLanguage, getTmdbRegion };

export interface LanguageOption {
  code: AppLanguage;
  labelKey: TranslationKey;
  shortLabel: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'es-PY', labelKey: 'language.es', shortLabel: 'ES' },
  { code: 'pt-BR', labelKey: 'language.pt', shortLabel: 'PT' },
];

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
    [language],
  );

  const changeLanguage = useCallback(
    (next: AppLanguage) => {
      dispatch(setLanguage(next));
    },
    [dispatch],
  );

  return { t, language, changeLanguage };
};
