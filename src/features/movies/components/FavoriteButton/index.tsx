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
import { colors } from '@shared/theme/colors';
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
  const isFav = useAppSelector(state => selectIsFavorite(state, movie.id));

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
      accessibilityLabel={
        isFav ? t('common.removeFavorite') : t('common.addFavorite')
      }
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
    backgroundColor: colors.overlayStrong,
    borderWidth: 1,
    borderColor: colors.borderStar,
  },
  buttonMedium: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.overlayFaint,
    borderWidth: 1,
    borderColor: colors.borderFrost,
  },
  buttonMediumActive: {
    borderColor: colors.borderPrimary,
    backgroundColor: colors.primarySurface,
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
