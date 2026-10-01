import React from 'react';
import { ErrorView } from '@shared/components/feedback/ErrorView';
import { useTranslation } from '@shared/i18n';
import { logger } from '@shared/utils/logger';

export interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Default fallback shown when a render error is caught. Kept as a function
 * component so it can use the translation hook (the boundary itself is a class,
 * which cannot) and so it can reuse the shared `ErrorView` instead of
 * duplicating its layout.
 */
export const DefaultErrorFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  resetError,
}) => {
  const { t } = useTranslation();

  return (
    <ErrorView
      title={t('feedback.errorTitle')}
      message={t('feedback.errorMessage')}
      onRetry={resetError}
    />
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
