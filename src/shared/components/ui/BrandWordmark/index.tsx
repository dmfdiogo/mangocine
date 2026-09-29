import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { useTranslation } from '@shared/i18n';
import { colors } from '@shared/theme/colors';
import { typography, TypographyType } from '@shared/theme/typography';

export interface BrandWordmarkProps {
  variant?: keyof TypographyType;
  style?: StyleProp<TextStyle>;
}

/**
 * "MangoCine" wordmark: "Mango" in the brand mango color, "Cine" in the
 * foreground text color. Typography is applied once (nested Text only colors).
 */
export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  variant = 'hero',
  style,
}) => {
  const { t } = useTranslation();
  const brand = t('app.brand'); // "MangoCine"
  const splitAt = brand.length - 4; // keep "Cine" as the suffix
  const first = brand.slice(0, splitAt);
  const rest = brand.slice(splitAt);

  return (
    <Text style={[typography[variant], styles.base, style]}>
      <Text style={styles.mango}>{first}</Text>
      {rest}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    textAlign: 'left',
  },
  mango: {
    color: colors.mango,
  },
});
