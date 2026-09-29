import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  toggleFavorite,
  selectIsFavorite,
} from '@features/movies/store/favoritesSlice';
import { MovieDTO } from '@features/movies/api/types';
import { AppText } from '@shared/components/ui/Text';
import { useTranslation } from '@shared/i18n';
import { spacing } from '@shared/theme/spacing';
import { radius } from '@shared/theme/elevation';

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
  const { t } = useTranslation();
  const isFav = useAppSelector(selectIsFavorite(movie.id));

  const handleToggle = (event?: GestureResponderEvent) => {
    // Prevent event bubbling to the card's onPress (guarded: synthetic events
    // in some environments/tests may not implement stopPropagation).
    event?.stopPropagation?.();
    dispatch(toggleFavorite(movie));
  };

  const isSmall = size === 'small';

  return (
    <TouchableOpacity
      testID="favorite-button"
      activeOpacity={0.7}
      onPress={handleToggle}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={t('common.favorite')}
      accessibilityState={{ selected: isFav }}
      style={[
        styles.button,
        isSmall ? styles.buttonSmall : styles.buttonMedium,
        !isSmall && isFav && styles.buttonMediumActive,
        style,
      ]}
    >
      <AppText
        variant={isSmall ? 'tag' : 'body'}
        color={isFav ? 'primary' : 'text'}
        style={isSmall ? styles.heartSmall : styles.heartMedium}
      >
        {isFav ? '♥' : '♡'}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Matches the rating chip (same height, radius and colors) on cards.
  buttonSmall: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(11, 14, 20, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.45)',
  },
  buttonMedium: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(11, 14, 20, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  buttonMediumActive: {
    borderColor: 'rgba(242, 142, 54, 0.7)',
    backgroundColor: 'rgba(242, 142, 54, 0.22)',
  },
  heartSmall: {
    fontSize: 13,
    lineHeight: 14,
  },
  heartMedium: {
    fontSize: 22,
    lineHeight: 24,
  },
});
