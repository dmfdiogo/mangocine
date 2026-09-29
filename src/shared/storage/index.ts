import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  language: '@mangocine/language',
  favorites: '@mangocine/favorites',
} as const;

/**
 * Best-effort JSON storage. Failures (unavailable storage, corrupt payload)
 * never throw — persistence is an enhancement, not a hard requirement.
 */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
};
