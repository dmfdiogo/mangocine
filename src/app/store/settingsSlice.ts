import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@app/store';
import {
  AppLanguage,
  DEFAULT_APP_LANGUAGE,
  isAppLanguage,
} from '@shared/i18n/locale';

export type { AppLanguage };

export interface SettingsState {
  language: AppLanguage;
}

const initialState: SettingsState = {
  language: DEFAULT_APP_LANGUAGE,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<AppLanguage>) => {
      state.language = action.payload;
    },
    toggleLanguage: state => {
      state.language = state.language === 'es-PY' ? 'pt-BR' : 'es-PY';
    },
    hydrateLanguage: (state, action: PayloadAction<AppLanguage>) => {
      if (isAppLanguage(action.payload)) {
        state.language = action.payload;
      }
    },
  },
});

export const { setLanguage, toggleLanguage, hydrateLanguage } =
  settingsSlice.actions;

export const selectLanguage = (state: RootState): AppLanguage =>
  state.settings.language;
