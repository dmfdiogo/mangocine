import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { useTranslation } from '@shared/i18n';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

export interface LoadingViewProps {
  message?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message,
  style,
  fullScreen = true,
}) => {
  const { t } = useTranslation();
  const resolvedMessage = message ?? t('feedback.loading');

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {!!resolvedMessage && (
        <AppText variant="caption" color="textSecondary" style={styles.message}>
          {resolvedMessage}
        </AppText>
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
  message: {
    marginTop: spacing.md,
  },
});
