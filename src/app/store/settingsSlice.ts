import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@app/store';

export type AppLanguage = 'es-PY' | 'pt-BR';

export interface SettingsState {
  language: AppLanguage;
}

const initialState: SettingsState = {
  language: 'es-PY',
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<AppLanguage>) => {
      state.language = action.payload;
    },
    toggleLanguage: (state) => {
      state.language = state.language === 'es-PY' ? 'pt-BR' : 'es-PY';
    },
    hydrateLanguage: (state, action: PayloadAction<AppLanguage>) => {
      if (action.payload === 'es-PY' || action.payload === 'pt-BR') {
        state.language = action.payload;
      }
    },
  },
});

export const { setLanguage, toggleLanguage, hydrateLanguage } =
  settingsSlice.actions;

export const selectLanguage = (state: RootState): AppLanguage =>
  state.settings.language;
