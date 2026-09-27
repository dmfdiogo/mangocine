import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { Button } from '@shared/components/ui/Button';
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
  title = 'Ha ocurrido un error',
  message = 'No pudimos cargar la información. Por favor, verifica tu conexión e inténtalo nuevamente.',
  onRetry,
  style,
  fullScreen = true,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <View style={styles.iconCircle}>
        <AppText variant="title" color="error">
          !
        </AppText>
      </View>

      <AppText variant="title" color="text" align="center" style={styles.title}>
        {title}
      </AppText>

      <AppText variant="body" color="textSecondary" align="center" style={styles.message}>
        {message}
      </AppText>

      {onRetry && (
        <Button
          title="Reintentar"
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.errorBackground,
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
    minWidth: 160,
  },
});
