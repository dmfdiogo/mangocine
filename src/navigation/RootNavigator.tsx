import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routes';
import { RootStackParamList } from './types';
import { MovieListScreen } from '@features/movies/screens/MovieListScreen';
import { MovieDetailScreen } from '@features/movies/screens/MovieDetailScreen';
import { colors } from '@shared/theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.MOVIE_LIST}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name={ROUTES.MOVIE_LIST}
        component={MovieListScreen}
      />
      <Stack.Screen
        name={ROUTES.MOVIE_DETAIL}
        component={MovieDetailScreen}
      />
    </Stack.Navigator>
  );
};
