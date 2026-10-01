import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { Button } from '@shared/components/ui/Button';
import { useTranslation } from '@shared/i18n';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

export interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  title,
  message,
  onRetry,
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
        <AppText variant="title" color="error">
          !
        </AppText>
      </View>

      <AppText variant="title" color="text" align="center" style={styles.title}>
        {title ?? t('feedback.errorTitle')}
      </AppText>

      <AppText
        variant="body"
        color="textSecondary"
        align="center"
        style={styles.message}
      >
        {message ?? t('feedback.errorMessage')}
      </AppText>

      {onRetry && (
        <Button
          title={t('common.retry')}
          onPress={onRetry}
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
    backgroundColor: colors.errorBackground,
    borderWidth: 1,
    borderColor: colors.borderError,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
  },
  message: {
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  button: {
    minWidth: 200,
  },
});
