import React, { useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { MangoIcon } from '@shared/components/ui/Icon';
import { BrandWordmark } from '@shared/components/ui/BrandWordmark';
import { PressableScale } from '@shared/components/ui/PressableScale';
import { useTranslation, LANGUAGE_OPTIONS, AppLanguage } from '@shared/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { radius } from '@shared/theme/elevation';

export interface HeaderMenuButtonProps {
  onNavigateCatalog?: () => void;
  onNavigateFavorites?: () => void;
}

export const HeaderMenuButton: React.FC<HeaderMenuButtonProps> = ({
  onNavigateCatalog,
  onNavigateFavorites,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language, changeLanguage } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const panelWidth = Math.min(340, width * 0.82);
  const translateX = useRef(new Animated.Value(-panelWidth)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const open = () => {
    setIsOpen(true);
    translateX.setValue(-panelWidth);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const close = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -panelWidth,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsOpen(false);
      }
    });
  };

  const handleSelectLanguage = (code: AppLanguage) => {
    changeLanguage(code);
    close();
  };

  const handleNavigate = (action?: () => void) => {
    if (!action) return;
    action();
    close();
  };

  return (
    <>
      <PressableScale
        testID="header-menu-button"
        style={styles.trigger}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={t('menu.open')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={styles.bar} />
        <View style={[styles.bar, styles.barSpaced]} />
        <View style={[styles.bar, styles.barSpaced]} />
      </PressableScale>

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={close}
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityLabel={t('menu.close')}
          />

          <Animated.View
            style={[
              styles.panel,
              {
                width: panelWidth,
                paddingTop: insets.top + spacing.xl,
                paddingBottom: insets.bottom + spacing.lg,
                transform: [{ translateX }],
              },
            ]}
          >
            <View style={styles.panelHeader}>
              <View>
                <View style={styles.brandRow}>
                  <MangoIcon size={22} />
                  <BrandWordmark variant="title" style={styles.brandName} />
                </View>
                <AppText
                  variant="caption"
                  color="textMuted"
                  style={styles.tagline}
                >
                  {t('app.tagline')}
                </AppText>
              </View>

              <PressableScale
                onPress={close}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel={t('menu.close')}
              >
                <AppText variant="subtitle" color="textSecondary">
                  ✕
                </AppText>
              </PressableScale>
            </View>

            {onNavigateCatalog && (
              <PressableScale
                testID="menu-catalog"
                style={styles.row}
                onPress={() => handleNavigate(onNavigateCatalog)}
                accessibilityRole="button"
              >
                <AppText variant="body" color="text" style={styles.rowLabel}>
                  {t('menu.catalog')}
                </AppText>
                <AppText variant="subtitle" color="textMuted">
                  ›
                </AppText>
              </PressableScale>
            )}

            {onNavigateFavorites && (
              <PressableScale
                testID="menu-favorites"
                style={styles.row}
                onPress={() => handleNavigate(onNavigateFavorites)}
                accessibilityRole="button"
              >
                <AppText variant="body" color="text" style={styles.rowLabel}>
                  {t('menu.favorites')}
                </AppText>
                <AppText variant="subtitle" color="textMuted">
                  ›
                </AppText>
              </PressableScale>
            )}

            <View style={styles.divider} />

            <AppText
              variant="tag"
              color="textMuted"
              style={styles.sectionLabel}
            >
              {t('language.title').toUpperCase()}
            </AppText>

            {LANGUAGE_OPTIONS.map(option => {
              const isSelected = option.code === language;
              return (
                <PressableScale
                  key={option.code}
                  testID={`language-option-${option.code}`}
                  style={styles.row}
                  onPress={() => handleSelectLanguage(option.code)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <AppText
                    variant="body"
                    color={isSelected ? 'text' : 'textSecondary'}
                    style={styles.rowLabel}
                  >
                    {t(option.labelKey)}
                  </AppText>
                  <View
                    style={[styles.radio, isSelected && styles.radioSelected]}
                  >
                    {isSelected ? <View style={styles.radioDot} /> : null}
                  </View>
                </PressableScale>
              );
            })}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.text,
  },
  barSpaced: {
    marginTop: 5,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  panel: {
    height: '100%',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandName: {
    letterSpacing: -0.3,
  },
  tagline: {
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  rowLabel: {
    flex: 1,
    marginRight: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
