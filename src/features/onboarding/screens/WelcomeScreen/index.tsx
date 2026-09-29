import React, { useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@shared/components/ui/Text';
import { MangoIcon } from '@shared/components/ui/Icon';
import { BrandWordmark } from '@shared/components/ui/BrandWordmark';
import { Button } from '@shared/components/ui/Button';
import { PressableScale } from '@shared/components/ui/PressableScale';
import { useTranslation } from '@shared/i18n';
import { WelcomeScreenProps } from '@navigation/types';
import { ROUTES } from '@navigation/routes';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { elevation, radius } from '@shared/theme/elevation';

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const lastNavigationTime = useRef(0);

  const handleEnterCatalog = useCallback(() => {
    const now = Date.now();
    if (now - lastNavigationTime.current < 600) {
      return;
    }
    lastNavigationTime.current = now;
    navigation.replace(ROUTES.MOVIE_LIST);
  }, [navigation]);

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.xl,
        },
      ]}
    >
      <View style={styles.decorTop} pointerEvents="none" />
      <View style={styles.decorBottom} pointerEvents="none" />

      <View style={styles.content}>
        {/* Poster stack with the brand on the front card */}
        <View style={styles.hero}>
          <View style={[styles.posterBack, styles.posterBackLeft]} />
          <View style={[styles.posterBack, styles.posterBackRight]} />
          <View style={styles.posterFront}>
            <MangoIcon size={64} />
          </View>
        </View>

        <BrandWordmark variant="hero" style={styles.brand} />

        <View style={styles.brandAccent} />

        <AppText
          variant="subtitle"
          color="textSecondary"
          align="center"
          style={styles.tagline}
        >
          {t('app.tagline')}
        </AppText>

        <AppText
          variant="body"
          color="textMuted"
          align="center"
          style={styles.subtitle}
        >
          {t('welcome.subtitle')}
        </AppText>
      </View>

      <View style={styles.footer}>
        <Button title={t('welcome.cta')} onPress={handleEnterCatalog} />
        <PressableScale onPress={handleEnterCatalog} accessibilityRole="button">
          <AppText
            variant="tag"
            color="textMuted"
            align="center"
            style={styles.poweredBy}
          >
            {t('welcome.footer')}
          </AppText>
        </PressableScale>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    overflow: 'hidden',
  },
  decorTop: {
    position: 'absolute',
    top: -160,
    right: -140,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(242, 142, 54, 0.16)',
  },
  decorBottom: {
    position: 'absolute',
    bottom: -180,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    width: 150,
    height: 178,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  posterBack: {
    position: 'absolute',
    width: 112,
    height: 166,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  posterBackLeft: {
    transform: [{ rotate: '-11deg' }, { translateX: -26 }],
    opacity: 0.75,
  },
  posterBackRight: {
    transform: [{ rotate: '11deg' }, { translateX: 26 }],
    opacity: 0.75,
  },
  posterFront: {
    width: 118,
    height: 174,
    borderRadius: radius.lg + 2,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.lg,
  },
  brand: {
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  brandAccent: {
    width: 56,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: spacing.md,
  },
  tagline: {
    marginTop: spacing.md,
  },
  subtitle: {
    marginTop: spacing.md,
    maxWidth: 300,
  },
  footer: {
    width: '100%',
  },
  poweredBy: {
    marginTop: spacing.lg,
  },
});
