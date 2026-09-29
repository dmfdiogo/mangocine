import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routes';
import { RootStackParamList } from './types';
import { WelcomeScreen } from '@features/onboarding';
import { MovieListScreen } from '@features/movies/screens/MovieListScreen';
import { MovieDetailScreen } from '@features/movies/screens/MovieDetailScreen';
import { FavoritesScreen } from '@features/favorites';
import { colors } from '@shared/theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.WELCOME}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        animationDuration: 250,
        gestureEnabled: true,
        freezeOnBlur: true,
      }}
    >
      <Stack.Screen
        name={ROUTES.WELCOME}
        component={WelcomeScreen}
        options={{ animation: 'fade', animationDuration: 300 }}
      />
      <Stack.Screen
        name={ROUTES.MOVIE_LIST}
        component={MovieListScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name={ROUTES.FAVORITES}
        component={FavoritesScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name={ROUTES.MOVIE_DETAIL}
        component={MovieDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};
