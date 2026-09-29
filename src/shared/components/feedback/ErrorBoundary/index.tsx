import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { Button } from '@shared/components/ui/Button';
import { useTranslation } from '@shared/i18n';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { logger } from '@shared/utils/logger';

export interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Default fallback shown when a render error is caught. Kept as a function
 * component so it can use the translation hook (the boundary itself is a class,
 * which cannot).
 */
export const DefaultErrorFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  resetError,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <AppText variant="title" color="error">
          !
        </AppText>
      </View>
      <AppText variant="title" color="text" align="center" style={styles.title}>
        {t('feedback.errorTitle')}
      </AppText>
      <AppText
        variant="body"
        color="textSecondary"
        align="center"
        style={styles.message}
      >
        {t('feedback.errorMessage')}
      </AppText>
      <Button
        title={t('feedback.errorReset')}
        onPress={resetError}
        style={styles.button}
      />
    </View>
  );
};

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Custom fallback. Receives the error and a reset callback. */
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  /** Optional hook to forward errors to a crash reporter. */
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * App-level boundary that prevents a render error in any screen from tearing
 * down the whole tree. Errors are logged through the structured logger and can
 * be re-surfaced to the user with a non-destructive reset.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error(
      'Unhandled UI error',
      { componentStack: info.componentStack },
      error,
    );
    this.props.onError?.(error, info);
  }

  resetError = (): void => {
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    const { error } = this.state;
    if (error) {
      const Fallback = this.props.fallback ?? DefaultErrorFallback;
      return <Fallback error={error} resetError={this.resetError} />;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.errorBackground,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
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
