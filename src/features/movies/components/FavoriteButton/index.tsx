import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  toggleFavorite,
  selectIsFavorite,
} from '@features/movies/store/favoritesSlice';
import { MovieDTO } from '@features/movies/api/types';
import { AppText } from '@shared/components/ui/Text';
import { colors } from '@shared/theme/colors';

export interface FavoriteButtonProps {
  movie: MovieDTO;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  movie,
  size = 'small',
  style,
}) => {
  const dispatch = useAppDispatch();
  const isFav = useAppSelector(selectIsFavorite(movie.id));

  const handleToggle = (e: any) => {
    // Prevent event bubbling to card onPress
    if (e?.stopPropagation) {
      e.stopPropagation();
    }
    dispatch(toggleFavorite(movie));
  };

  const isSmall = size === 'small';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleToggle}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        styles.button,
        isSmall ? styles.buttonSmall : styles.buttonMedium,
        isFav && styles.buttonActive,
        style,
      ]}
    >
      <AppText
        variant={isSmall ? 'tag' : 'body'}
        color={isFav ? 'primary' : 'text'}
        style={styles.heartText}
      >
        {isFav ? '❤️' : '🤍'}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 14, 20, 0.8)',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  buttonSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  buttonMedium: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  buttonActive: {
    borderColor: 'rgba(229, 9, 20, 0.5)',
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
  },
  heartText: {
    fontSize: 14,
  },
});
