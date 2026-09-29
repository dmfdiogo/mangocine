import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

export interface SectionLabelProps {
  title: string;
  style?: StyleProp<ViewStyle>;
}

/** Uppercase section heading with a small primary accent bar. */
export const SectionLabel: React.FC<SectionLabelProps> = ({ title, style }) => (
  <View style={[styles.row, style]}>
    <View style={styles.bar} />
    <AppText variant="captionBold" color="textMuted" style={styles.text}>
      {title}
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bar: {
    width: 3,
    height: 12,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  text: {
    letterSpacing: 1,
  },
});
