import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { Button } from '@shared/components/ui/Button';
import { FilmIcon } from '@shared/components/ui/Icon';
import { useTranslation } from '@shared/i18n';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

export interface EmptyStateViewProps {
  title?: string;
  message?: string;
  onAction?: () => void;
  actionTitle?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  title,
  message,
  onAction,
  actionTitle,
  style,
  fullScreen = true,
}) => {
  const { t } = useTranslation();

  return (
    <View
      style={[styles.container, fullScreen && styles.fullScreen, style]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.iconCircle}>
        <FilmIcon size={34} />
      </View>

      <AppText
        variant="subtitle"
        color="text"
        align="center"
        style={styles.title}
      >
        {title ?? t('feedback.emptyTitle')}
      </AppText>

      <AppText
        variant="body"
        color="textSecondary"
        align="center"
        style={styles.message}
      >
        {message ?? t('feedback.emptyMessage')}
      </AppText>

      {onAction && (
        <Button
          title={actionTitle ?? t('feedback.emptyAction')}
          variant="secondary"
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
  },
  message: {
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
  button: {
    minWidth: 200,
  },
});
