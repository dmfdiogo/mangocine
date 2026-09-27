import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { Button } from '@shared/components/ui/Button';
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
  title = 'No hay resultados',
  message = 'No encontramos películas que coincidan con tu búsqueda.',
  onAction,
  actionTitle = 'Limpiar búsqueda',
  style,
  fullScreen = true,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <View style={styles.iconCircle}>
        <AppText variant="title" color="textMuted">
          🎬
        </AppText>
      </View>

      <AppText variant="subtitle" color="text" align="center" style={styles.title}>
        {title}
      </AppText>

      <AppText variant="body" color="textSecondary" align="center" style={styles.message}>
        {message}
      </AppText>

      {onAction && (
        <Button
          title={actionTitle}
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
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surfaceElevated,
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
    minWidth: 160,
  },
});
