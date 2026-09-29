import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { store } from '@app/store';
import { hydrateStore } from '@app/store/persistence';
import { colors } from '@shared/theme/colors';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};

export interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    hydrateStore(store).finally(() => {
      if (isMounted) {
        setHydrated(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        {hydrated ? (
          <NavigationContainer theme={navigationTheme}>
            {children}
          </NavigationContainer>
        ) : (
          <View style={styles.splash} />
        )}
      </SafeAreaProvider>
    </Provider>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
